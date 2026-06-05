// AI Assistant edge function — routes prompts through Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  email:
    "You are a professional email writer. Draft clear, concise, well-structured workplace emails. Always include a subject line on the first line as 'Subject: ...' then a blank line, then the email body with greeting, body, and sign-off. Adapt tone to context (formal/friendly/assertive).",
  meeting:
    "You are an expert meeting notes summarizer. Given raw notes or a transcript, output Markdown with sections: ## Summary, ## Key Decisions, ## Action Items (with owners if mentioned), ## Open Questions. Be concise and faithful to the source.",
  planner:
    "You are an AI task planner. Given a goal, break it into a prioritized, time-estimated, step-by-step plan in Markdown. Use a table or numbered list with: Task | Priority (High/Med/Low) | Estimated time | Notes. End with a short suggested schedule.",
  research:
    "You are an AI research assistant. Provide a structured Markdown briefing: ## Overview, ## Key Points (bulleted), ## Considerations / Tradeoffs, ## Suggested Next Steps. Be balanced and acknowledge uncertainty. Do not fabricate sources.",
  chat:
    "You are a helpful, friendly workplace productivity assistant. Be concise, use Markdown formatting when useful, and ask clarifying questions only when truly needed.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode = "chat", messages = [], prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.chat;
    const finalMessages =
      messages.length > 0
        ? messages
        : [{ role: "user", content: String(prompt ?? "") }];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...finalMessages],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please retry shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const text = await resp.text();
      console.error("AI gateway error", resp.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

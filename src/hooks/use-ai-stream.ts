import { useState, useCallback, useRef } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export function useAiStream(mode: string) {
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (input: string | Msg[]) => {
      setError(null);
      setOutput("");
      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
      const body =
        typeof input === "string"
          ? { mode, prompt: input }
          : { mode, messages: input };

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) throw new Error("Rate limit reached. Please retry shortly.");
          if (resp.status === 402)
            throw new Error("AI credits exhausted. Add credits in your Lovable workspace.");
          throw new Error("Failed to reach AI assistant.");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;
        let acc = "";

        while (!done) {
          const { value, done: d } = await reader.read();
          if (d) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") { done = true; break; }
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                acc += delta;
                setOutput(acc);
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? "Something went wrong.");
      } finally {
        setIsStreaming(false);
      }
    },
    [mode],
  );

  const stop = () => abortRef.current?.abort();

  return { output, setOutput, isStreaming, error, run, stop };
}

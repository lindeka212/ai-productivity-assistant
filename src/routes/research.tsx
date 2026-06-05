import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AiTool } from "@/components/ai-tool";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Workplace AI" }] }),
  component: () => (
    <AiTool
      mode="research"
      title="AI Research Assistant"
      description="Get a structured briefing on a topic, technology, or decision."
      icon={<Search className="h-5 w-5" />}
      inputLabel="What would you like a briefing on?"
      inputPlaceholder="e.g. Pros and cons of moving from REST to GraphQL for a mid-size SaaS."
      buildPrompt={(i) => `Provide a structured research briefing on:\n\n${i}`}
      examples={[
        { label: "Compare frameworks", value: "Compare Next.js, Remix, and TanStack Start for a content-heavy marketing site." },
        { label: "Market scan", value: "Give an overview of the AI meeting assistant market: key players, differentiators, and gaps." },
      ]}
    />
  ),
});

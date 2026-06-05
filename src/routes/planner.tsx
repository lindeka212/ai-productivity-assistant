import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { AiTool } from "@/components/ai-tool";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — Workplace AI" }] }),
  component: () => (
    <AiTool
      mode="planner"
      title="AI Task Planner"
      description="Describe a goal or project. Get a prioritized, time-estimated breakdown."
      icon={<ListChecks className="h-5 w-5" />}
      inputLabel="What are you trying to accomplish?"
      inputPlaceholder="e.g. Launch a beta of our new feature to 50 customers in the next 3 weeks."
      buildPrompt={(i) => `Create a task plan for this goal:\n\n${i}`}
      examples={[
        { label: "Plan a product launch", value: "Plan a public launch for our new analytics dashboard in 4 weeks, including marketing, support readiness, and engineering polish." },
        { label: "Onboard new hire", value: "Onboard a senior engineer joining next Monday. They'll own our payments service within 60 days." },
      ]}
    />
  ),
});

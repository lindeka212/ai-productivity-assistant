import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AiTool } from "@/components/ai-tool";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — Workplace AI" }] }),
  component: () => (
    <AiTool
      mode="email"
      title="Smart Email Generator"
      description="Describe the email you need. Get a polished draft with subject line."
      icon={<Mail className="h-5 w-5" />}
      inputLabel="What do you need to write?"
      inputPlaceholder="e.g. Ask my manager for a one-week extension on the Q3 report. Friendly but professional."
      buildPrompt={(i) => `Write a workplace email for the following request. Match a professional but warm tone unless specified otherwise.\n\nRequest:\n${i}`}
      examples={[
        { label: "Follow-up after meeting", value: "Send a follow-up email to a client after today's discovery call. Recap key points and propose next steps for next week." },
        { label: "Decline a request", value: "Politely decline a vendor's proposal because the pricing exceeds our budget. Keep the door open for the future." },
        { label: "Intro to teammate", value: "Introduce our new marketing hire Priya to the engineering team. Mention her background and what she'll be working on." },
      ]}
    />
  ),
});

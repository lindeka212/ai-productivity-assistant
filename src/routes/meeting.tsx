import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AiTool } from "@/components/ai-tool";

export const Route = createFileRoute("/meeting")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Workplace AI" }] }),
  component: () => (
    <AiTool
      mode="meeting"
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript. Get a clean summary, decisions, and action items."
      icon={<FileText className="h-5 w-5" />}
      inputLabel="Paste meeting notes or transcript"
      inputPlaceholder="Paste raw notes, bullet points, or a full transcript here…"
      minRows={10}
      buildPrompt={(i) => `Summarize these meeting notes:\n\n${i}`}
      examples={[
        { label: "Standup notes", value: "Sam: shipped onboarding fix, blocked on design for invites.\nMaria: working on billing migration, ETA Friday.\nDev: PR for analytics dashboard ready for review.\nDecision: postpone mobile push to next sprint." },
      ]}
    />
  ),
});

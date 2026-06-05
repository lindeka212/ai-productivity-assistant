import { AlertTriangle } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground " +
        className
      }
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent-foreground" />
      <p>
        <strong className="font-medium text-foreground">Responsible AI:</strong> Outputs are
        AI-generated and may contain errors or bias. Always review, edit, and verify before
        sending, sharing, or acting on them. Do not paste confidential or regulated data.
      </p>
    </div>
  );
}

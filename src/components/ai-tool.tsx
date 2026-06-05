import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Markdown } from "@/components/markdown";
import { useAiStream } from "@/hooks/use-ai-stream";
import { Loader2, Send, Square, Copy, Pencil, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export interface AiToolProps {
  mode: string;
  title: string;
  description: string;
  icon: ReactNode;
  inputLabel: string;
  inputPlaceholder: string;
  minRows?: number;
  buildPrompt: (input: string) => string;
  examples?: { label: string; value: string }[];
  outputLabel?: string;
}

export function AiTool({
  mode,
  title,
  description,
  icon,
  inputLabel,
  inputPlaceholder,
  minRows = 6,
  buildPrompt,
  examples = [],
  outputLabel = "AI Output (editable)",
}: AiToolProps) {
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);
  const { output, setOutput, isStreaming, error, run, stop } = useAiStream(mode);

  const submit = () => {
    if (!input.trim() || isStreaming) return;
    setEditing(false);
    run(buildPrompt(input.trim()));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-primary-foreground shadow-[var(--shadow-soft)]">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{inputLabel}</CardTitle>
          {examples.length > 0 && (
            <CardDescription>
              <div className="mt-1 flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => setInput(ex.value)}
                    className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            rows={minRows}
            className="resize-y"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AiDisclaimer className="flex-1 min-w-[260px]" />
            <div className="flex gap-2">
              {isStreaming ? (
                <Button onClick={stop} variant="outline">
                  <Square className="h-4 w-4" /> Stop
                </Button>
              ) : (
                <Button onClick={submit} disabled={!input.trim()} className="gradient-brand text-primary-foreground">
                  <Send className="h-4 w-4" /> Generate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(output || isStreaming || error) && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="text-base">{outputLabel}</CardTitle>
              <CardDescription>Review and refine before using.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing((v) => !v)}
                disabled={!output || isStreaming}
              >
                {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                {editing ? "Done" : "Edit"}
              </Button>
              <Button size="sm" variant="outline" onClick={copy} disabled={!output}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {isStreaming && !output && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
            {output && editing ? (
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={Math.min(24, output.split("\n").length + 2)}
                className="font-mono text-sm"
              />
            ) : output ? (
              <Markdown>{output}</Markdown>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Send, Square, Loader2, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — Workplace AI" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  const send = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: "chat", messages: next }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) throw new Error("Rate limit reached. Please retry shortly.");
        if (resp.status === 402) throw new Error("AI credits exhausted. Add credits in Lovable.");
        throw new Error("Failed to reach AI assistant.");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let done = false;
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
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message ?? "Something went wrong.");
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-4xl flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-primary-foreground shadow-[var(--shadow-soft)]">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI Chatbot</h1>
            <p className="text-sm text-muted-foreground">Conversational assistant for any workplace question.</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setMessages([])} disabled={isStreaming}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        )}
      </header>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <Sparkle />
              <p className="mt-3 max-w-sm">Start a conversation. Ask for help drafting, brainstorming, debugging, or planning.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "gradient-brand text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  m.content ? <Markdown>{m.content}</Markdown>
                    : <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
        <div className="border-t border-border p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Message the assistant…  (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="resize-none"
            />
            {isStreaming ? (
              <Button onClick={() => abortRef.current?.abort()} variant="outline" size="icon">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={send} disabled={!input.trim()} size="icon" className="gradient-brand text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <AiDisclaimer />
    </div>
  );
}

function Sparkle() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-soft)]">
      <MessageSquare className="h-6 w-6" />
    </div>
  );
}

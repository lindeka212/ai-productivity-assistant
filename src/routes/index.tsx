import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workplace AI — Productivity Assistant" },
      { name: "description", content: "AI tools to draft emails, summarize meetings, plan tasks, research topics, and chat with an AI assistant." },
    ],
  }),
  component: Overview,
});

const tools = [
  { url: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft polished, on-tone emails in seconds." },
  { url: "/meeting", icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn raw notes into clean summaries and action items." },
  { url: "/planner", icon: ListChecks, title: "AI Task Planner", desc: "Break goals into prioritized, time-estimated steps." },
  { url: "/research", icon: Search, title: "AI Research Assistant", desc: "Get structured briefings on any topic." },
  { url: "/chat", icon: MessageSquare, title: "AI Chatbot", desc: "Ask anything, brainstorm, or get unstuck." },
];

function Overview() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <div className="absolute inset-0 -z-10 opacity-10 gradient-brand" />
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Lovable AI
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          Automate the <span className="text-gradient-brand">busywork</span> of your workday.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Five focused AI tools for professionals — draft, summarize, plan, research, and chat.
          Structured prompts, editable outputs, your context never leaves the workflow.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.url} to={t.url} className="group">
            <Card className="h-full transition-all hover:border-primary/40 hover:shadow-[var(--shadow-soft)]">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground group-hover:gradient-brand group-hover:text-primary-foreground transition-colors">
                  <t.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-base">{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <AiDisclaimer />
    </div>
  );
}

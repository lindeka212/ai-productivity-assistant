import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-headings:font-display prose-headings:tracking-tight",
        "prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-foreground",
        "prose-code:before:hidden prose-code:after:hidden",
        className,
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

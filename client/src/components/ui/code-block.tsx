import React from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language?: string;
  children: string;
  className?: string;
}

export function CodeBlock({ language = "bash", children, className }: CodeBlockProps) {
  return (
    <div className={cn("bg-[#1e293b] rounded-lg p-4 overflow-x-auto my-4", className)}>
      <pre className="text-[#e2e8f0] font-mono text-sm leading-6">{children}</pre>
    </div>
  );
}

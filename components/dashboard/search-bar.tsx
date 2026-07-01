"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const QUERIES = [
  "When is the science exam?",
  "Show unpaid fees",
  "Summarize this week's circular",
  "Homework due tomorrow",
];

export function SearchBar({ className }: { className?: string }) {
  const [text, setText] = useState("");
  const [queryIndex, setQueryIndex] = useState(0);

  useEffect(() => {
    let charIndex = 0;
    let deleting = false;
    const current = QUERIES[queryIndex % QUERIES.length];

    const interval = setInterval(() => {
      if (!deleting) {
        charIndex++;
        setText(current.slice(0, charIndex));
        if (charIndex === current.length) {
          deleting = true;
          clearInterval(interval);
          setTimeout(() => setQueryIndex((i) => i + 1), 1400);
        }
      }
    }, 45);

    return () => clearInterval(interval);
  }, [queryIndex]);

  return (
    <div className={cn("glass-surface flex items-center gap-3 rounded-[18px] px-5 py-4", className)}>
      <Search className="h-4.5 w-4.5 shrink-0 text-ink/40" />
      <span className="truncate text-[14.5px] text-ink/70">
        {text}
        <span className="ml-0.5 inline-block h-4 w-[1.5px] animate-pulse bg-ink/40 align-middle" />
      </span>
    </div>
  );
}

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatBubble({
  role,
  children,
  className,
}: {
  role: "user" | "ai";
  children: React.ReactNode;
  className?: string;
}) {
  if (role === "ai") {
    return (
      <div className={cn("flex items-start gap-2.5", className)}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-brand)]">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="glass-surface max-w-[85%] rounded-[16px] rounded-tl-[4px] px-4 py-3 text-[13.5px] leading-relaxed text-ink/85">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex justify-end", className)}>
      <div className="max-w-[85%] rounded-[16px] rounded-tr-[4px] bg-ink px-4 py-3 text-[13.5px] leading-relaxed text-white/90">
        {children}
      </div>
    </div>
  );
}

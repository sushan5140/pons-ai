import { cn } from "@/lib/utils";

export function MiniScreenshot({
  title,
  tag,
  className,
}: {
  title: string;
  tag?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-hairline bg-white/80",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-3 py-2">
        <span className="truncate text-[12px] font-medium text-ink/85">{title}</span>
        {tag && <span className="shrink-0 font-mono text-[10.5px] text-secondary">{tag}</span>}
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <div className="h-1.5 w-3/4 rounded-full bg-ink/10" />
        <div className="h-1.5 w-1/2 rounded-full bg-ink/8" />
      </div>
    </div>
  );
}

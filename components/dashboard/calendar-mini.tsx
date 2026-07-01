import { cn } from "@/lib/utils";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarMini({
  month = "November",
  highlighted = [4, 12, 19, 27],
  today = 12,
  className,
}: {
  month?: string;
  highlighted?: number[];
  today?: number;
  className?: string;
}) {
  const cells = Array.from({ length: 30 }, (_, i) => i + 1);
  const offset = 4;

  return (
    <div className={cn("glass-surface rounded-[22px] p-4", className)}>
      <p className="text-[13px] font-semibold text-ink">{month}</p>
      <div className="mt-3 grid grid-cols-7 gap-y-1.5 text-center">
        {DAYS.map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] font-medium text-ink/35">
            {d}
          </span>
        ))}
        {Array.from({ length: offset }).map((_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {cells.map((day) => {
          const isHighlighted = highlighted.includes(day);
          const isToday = day === today;
          return (
            <span
              key={day}
              className={cn(
                "flex h-6 w-6 items-center justify-center justify-self-center rounded-full text-[11px]",
                isToday
                  ? "bg-ink font-semibold text-white"
                  : isHighlighted
                    ? "bg-accent/40 font-medium text-secondary"
                    : "text-ink/55"
              )}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

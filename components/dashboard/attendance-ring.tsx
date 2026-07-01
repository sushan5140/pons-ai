import { cn } from "@/lib/utils";

export function AttendanceRing({
  percent,
  label = "Attendance",
  size = 96,
  className,
}: {
  percent: number;
  label?: string;
  size?: number;
  className?: string;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div className={cn("glass-surface flex items-center gap-4 rounded-[22px] p-4", className)}>
      <svg width={size} height={size} className="-rotate-90 shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30,31,38,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2B5A7D" />
            <stop offset="100%" stopColor="#A6C5DA" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="font-display text-[26px] font-bold leading-none tracking-tight text-ink">
          {percent}%
        </p>
        <p className="mt-1.5 text-[12.5px] text-ink/50">{label}</p>
      </div>
    </div>
  );
}

import { FileText, CheckCircle2, AlertCircle, Bell, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChildCard({
  name,
  grade,
  initials,
  status,
  className,
}: {
  name: string;
  grade: string;
  initials: string;
  status: string;
  className?: string;
}) {
  return (
    <div className={cn("glass-surface rounded-[22px] p-4", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[image:var(--gradient-brand)] text-[14px] font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold text-ink">{name}</p>
          <p className="truncate text-[12.5px] text-ink/50">{grade}</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
          {status}
        </span>
      </div>
    </div>
  );
}

export function HomeworkCard({
  subject,
  due,
  progress,
  className,
}: {
  subject: string;
  due: string;
  progress: number;
  className?: string;
}) {
  return (
    <div className={cn("glass-surface rounded-[22px] p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-secondary/10">
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          </div>
          <p className="text-[14px] font-semibold text-ink">{subject}</p>
        </div>
        <span className="text-[11.5px] text-ink/45">{due}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-brand)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ExamReminderCard({
  subject,
  date,
  daysLeft,
  className,
}: {
  subject: string;
  date: string;
  daysLeft: number;
  className?: string;
}) {
  return (
    <div className={cn("glass-surface rounded-[22px] p-4", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[14px] bg-ink text-white">
          <span className="text-[15px] font-bold leading-none">{daysLeft}</span>
          <span className="text-[8.5px] uppercase tracking-wide text-white/60">days</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-ink">{subject} Exam</p>
          <p className="truncate text-[12px] text-ink/50">{date}</p>
        </div>
        <AlertCircle className="h-4 w-4 shrink-0 text-accent" />
      </div>
    </div>
  );
}

export function PDFCard({
  name,
  meta,
  className,
}: {
  name: string;
  meta: string;
  className?: string;
}) {
  return (
    <div className={cn("glass-surface flex items-center gap-3 rounded-[22px] p-4", className)}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10">
        <FileText className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-semibold text-ink">{name}</p>
        <p className="flex items-center gap-1 truncate text-[11.5px] text-ink/45">
          <Sparkles className="h-3 w-3 text-accent" /> {meta}
        </p>
      </div>
    </div>
  );
}

export function FeeStatusCard({
  amount,
  status,
  due,
  className,
}: {
  amount: string;
  status: "Paid" | "Due";
  due: string;
  className?: string;
}) {
  return (
    <div className={cn("glass-surface rounded-[22px] p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-medium text-ink/50">Term Fee</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium",
            status === "Paid" ? "bg-primary/10 text-primary" : "bg-accent/25 text-secondary"
          )}
        >
          {status}
        </span>
      </div>
      <p className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-ink">
        {amount}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink/45">
        <Clock className="h-3 w-3" /> {due}
      </p>
    </div>
  );
}

export function NotificationChip({
  text,
  time,
  className,
}: {
  text: string;
  time: string;
  className?: string;
}) {
  return (
    <div className={cn("glass-surface flex items-center gap-3 rounded-[18px] px-4 py-3", className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.06]">
        <Bell className="h-3.5 w-3.5 text-ink/60" />
      </div>
      <p className="min-w-0 flex-1 truncate text-[13px] text-ink/75">{text}</p>
      <span className="shrink-0 text-[11px] text-ink/35">{time}</span>
    </div>
  );
}

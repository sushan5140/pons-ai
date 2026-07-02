"use client";

import { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { useCalendarAction } from "@/components/app/use-calendar-action";
import { cn } from "@/lib/utils";

function formatActionDate(iso: string): string {
  const hasTime = /T\d{2}:\d{2}/.test(iso);
  const [datePart, timePart] = iso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (hasTime && timePart) {
    const [hour, minute] = timePart.split(":").map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

interface CalendarActionProps {
  id: string;
  actionTitle: string;
  actionDate: string;
  confirmed: boolean;
  variant?: "full" | "compact";
}

export default function CalendarAction({
  id,
  actionTitle,
  actionDate,
  confirmed: initialConfirmed,
  variant = "full",
}: CalendarActionProps) {
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const { confirmAction, pendingId } = useCalendarAction();
  const pending = pendingId === id;

  async function handleClick() {
    const ok = await confirmAction(id, actionTitle);
    if (ok) setConfirmed(true);
  }

  if (variant === "compact") {
    return confirmed ? (
      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-secondary">
        <Check className="h-3 w-3" strokeWidth={2.5} />
        Added
      </span>
    ) : (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="mt-2 inline-flex items-center gap-1 rounded-full border border-hairline-strong bg-white/50 px-2.5 py-1 text-[11px] font-medium text-ink/75 transition-colors hover:border-accent-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Calendar className="h-3 w-3" strokeWidth={2} />
        {pending ? "Adding…" : "Calendar"}
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-[14px] border border-hairline-strong bg-accent/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent/30 text-ink">
          <Calendar className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] leading-relaxed text-ink/80">
            This looks like <span className="font-medium text-ink">{actionTitle}</span> on{" "}
            <span className="font-medium text-ink">{formatActionDate(actionDate)}</span> — add it
            to your calendar?
          </p>
          <button
            type="button"
            onClick={handleClick}
            disabled={pending || confirmed}
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-[13.5px] font-medium transition-colors",
              confirmed
                ? "bg-accent/30 text-ink"
                : "bg-ink text-white hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-70"
            )}
          >
            {confirmed ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Added
              </>
            ) : pending ? (
              "Adding…"
            ) : (
              <>
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                Add to Calendar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Usage {
  plan: "free" | "pro";
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
}

export default function UsageStatus({ refreshKey }: { refreshKey: number }) {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setUsage(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (!usage) return null;

  const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3 text-[13px] text-secondary">
        <span>
          {usage.used} of {usage.limit} uploads used this month
          {usage.plan === "pro" && (
            <span className="ml-1.5 rounded-full border border-hairline-strong bg-white/50 px-2 py-0.5 text-[11px] font-medium text-ink/70">
              Pro
            </span>
          )}
        </span>
        {usage.plan === "free" && (
          <Link
            href="/app/upgrade"
            className="shrink-0 font-medium text-ink underline underline-offset-2"
          >
            Upgrade
          </Link>
        )}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-accent-hover transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email: email || undefined }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setStatus("error");
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 pb-24 pt-28 sm:pt-32">
      <div className="glass-surface w-full max-w-md rounded-[22px] p-8">
        <Link
          href="/"
          className="text-[13px] font-medium text-secondary underline underline-offset-2 hover:text-ink"
        >
          ← Back to pons
        </Link>

        <h1 className="mt-5 text-balance font-display text-[26px] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
          Send feedback
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-secondary">
          Found a bug, or have an idea for pons? Tell us directly — a real
          person reads every message.
        </p>

        {status === "sent" ? (
          <div className="mt-7 flex items-start gap-2.5 rounded-[14px] border border-hairline-strong bg-accent/10 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" strokeWidth={1.75} />
            <div>
              <p className="text-[14px] font-medium text-ink">Thanks — got it.</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink/70">
                We read every submission. If you left an email, we may follow
                up.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="feedback-message"
                className="text-[13px] font-medium text-ink/70"
              >
                Your message
              </label>
              <textarea
                id="feedback-message"
                required
                minLength={1}
                maxLength={4000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What happened, or what would you like to see?"
                className="mt-2 w-full resize-none rounded-[12px] border border-hairline-strong bg-white/70 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink/35 focus:border-accent-hover focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="feedback-email" className="text-[13px] font-medium text-ink/70">
                Email (optional, if you&apos;d like a reply)
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-[12px] border border-hairline-strong bg-white/70 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink/35 focus:border-accent-hover focus:outline-none"
              />
            </div>

            {status === "error" && error && (
              <div role="alert" className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
                <p className="text-[13px] leading-relaxed text-ink/75">{error}</p>
              </div>
            )}

            <MagneticButton
              className="bg-ink text-white hover:bg-ink/85"
              fullWidth
            >
              {status === "sending" ? "Sending…" : "Send feedback"}
            </MagneticButton>
          </form>
        )}
      </div>
    </main>
  );
}

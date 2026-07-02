import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/supabase/auth-server";
import { checkUsageLimit, PLAN_LIMITS } from "@/lib/usage";
import UpgradeButton from "@/components/app/upgrade-button";

export const metadata: Metadata = {
  title: "pons — Upgrade to Pro",
  description: "See Free and Pro plan details for pons.",
};

const FREE_FEATURES = [
  `${PLAN_LIMITS.free} screenshot uploads / month`,
  "Semantic + entity search",
  "Entity graph",
  "Calendar actions",
];

const PRO_FEATURES = [
  `${PLAN_LIMITS.pro} screenshot uploads / month`,
  "Everything in Free",
  "More room to grow your entity graph",
];

export default async function UpgradePage() {
  const user = await getAuthenticatedUser();
  const usage = user ? await checkUsageLimit(user.id) : null;
  const plan = usage?.plan ?? "free";

  return (
    <main className="relative min-h-screen px-6 pb-24 pt-28 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-lg text-center">
          <Link
            href="/app"
            className="text-[13px] font-medium text-secondary underline underline-offset-2 hover:text-ink"
          >
            ← Back to pons
          </Link>
          <h1 className="mt-4 text-balance font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[38px]">
            Upgrade to Pro
          </h1>
          <p className="mt-3 text-balance text-[15.5px] leading-relaxed text-secondary">
            More uploads a month, same understanding of every screenshot.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Free plan */}
          <div className="glass-surface flex flex-col rounded-[22px] p-6">
            <div className="flex items-start justify-between">
              <p className="text-[13px] font-medium uppercase tracking-wide text-secondary">
                Free
              </p>
              {plan === "free" && (
                <span className="rounded-full border border-hairline-strong bg-white/50 px-2.5 py-0.5 text-[11px] font-medium text-ink/70">
                  Current plan
                </span>
              )}
            </div>
            <p className="mt-3 font-display text-[32px] font-medium text-ink">₹0</p>
            <ul className="mt-5 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[14px] text-ink/75">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/40" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className="glass-surface flex flex-col rounded-[22px] border border-accent/40 p-6 shadow-[0_24px_48px_-20px_rgba(19,33,46,0.22)]">
            <div className="flex items-start justify-between">
              <p className="text-[13px] font-medium uppercase tracking-wide text-secondary">
                Pro
              </p>
              {plan === "pro" && (
                <span className="rounded-full border border-hairline-strong bg-white/50 px-2.5 py-0.5 text-[11px] font-medium text-ink/70">
                  Current plan
                </span>
              )}
            </div>
            <p className="mt-3 font-display text-[32px] font-medium text-ink">
              ₹420<span className="text-[16px] font-normal text-secondary">/month</span>
            </p>
            <p className="text-[13px] text-secondary">~$5/month</p>
            <ul className="mt-5 space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[14px] font-medium text-ink">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-hover" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {plan === "pro" ? (
                <p className="text-center text-[13px] text-secondary">
                  You&apos;re already on Pro.
                </p>
              ) : (
                <UpgradeButton />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

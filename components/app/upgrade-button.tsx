"use client";

import { useState } from "react";
import MagneticButton from "@/components/ui/magnetic-button";

/**
 * The one function to swap out once Razorpay is ready. Everything else on
 * this page (plan cards, copy, layout) stays as-is — this is the only
 * contained change needed to wire in real checkout.
 */
async function startUpgradeCheckout(): Promise<{ ok: boolean; message: string }> {
  return {
    ok: false,
    message: "Payments are launching soon — check back shortly.",
  };
}

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    const result = await startUpgradeCheckout();
    setMessage(result.message);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <MagneticButton
        onClick={handleClick}
        className="bg-ink text-white hover:bg-ink/85"
        fullWidth
      >
        {loading ? "Loading…" : "Upgrade to Pro"}
      </MagneticButton>
      {message && (
        <p role="status" className="text-center text-[13px] text-secondary">
          {message}
        </p>
      )}
    </div>
  );
}

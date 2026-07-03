"use client";

import { useState } from "react";

const CONTACT_EMAIL = "sushan5140s@gmail.com";

export default function ContactCopyButton() {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — fall back
      // to mailto so the click still does *something* visible either way.
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-[14.5px] text-secondary transition-colors hover:text-ink"
    >
      {copied ? "Copied!" : "Contact"}
    </button>
  );
}

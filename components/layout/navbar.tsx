"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/magnetic-button";
import { useGoogleSignIn } from "@/lib/hooks/use-google-sign-in";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#demo" },
  { label: "Privacy", href: "#privacy" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { signIn, loading, error } = useGoogleSignIn();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-6 pt-5"
    >
      <div
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-[18px] px-5 py-3 transition-all duration-500",
          scrolled ? "glass-surface" : "border border-transparent"
        )}
      >
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[image:var(--gradient-brand)] shadow-[0_4px_14px_rgba(19,33,46,0.28)]">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-white/90" />
          </span>
          <span className="font-display text-[19px] font-semibold tracking-tight text-ink">
            pons
          </span>
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-[14px] font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-hover transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="relative">
          <MagneticButton
            onClick={signIn}
            className="bg-ink text-white hover:bg-ink/85"
            strength={0.25}
          >
            {loading ? "Redirecting…" : "Get Started"}
          </MagneticButton>
          {error && (
            <p
              role="alert"
              className="absolute right-0 top-full mt-2 w-56 text-right text-[12px] text-red-500"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </motion.header>
  );
}

"use client";

import { ArrowRight, Check } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";
import Reveal from "@/components/ui/reveal";
import { useGoogleSignIn } from "@/lib/hooks/use-google-sign-in";
import HeroWidgetGrid from "./hero-widget-grid";

const CHIPS = ["Natural language search", "AI reminders", "Connected memory"];

export default function Hero() {
  const { signIn, loading } = useGoogleSignIn();

  return (
    <section
      id="product"
      className="relative flex min-h-[92vh] scroll-mt-28 items-center overflow-hidden px-6 pb-16 pt-40 lg:min-h-screen lg:pt-44"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-texture opacity-40" />
        <div className="absolute right-[-10%] top-[-10%] h-[560px] w-[560px] rounded-full bg-accent/20 blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[420px] w-[420px] rounded-full bg-accent/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
        {/* left — copy */}
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-white/50 px-4 py-1.5 text-[13px] font-medium text-secondary">
              Screenshot Brain
            </span>
          </Reveal>

          <h1 className="mt-7 text-balance font-display text-[36px] font-medium leading-[1.08] tracking-[-0.01em] text-ink sm:text-[48px] lg:text-[56px]">
            <Reveal as="span" className="block overflow-hidden">
              Your screenshots stop being storage.
            </Reveal>
            <Reveal as="span" delay={0.1} className="block overflow-hidden">
              They start doing things.
            </Reveal>
          </h1>

          <Reveal delay={0.22}>
            <p className="mt-5 text-balance text-[16.5px] leading-relaxed text-secondary sm:text-[18px]">
              Search less. Remember more. Act instantly.
            </p>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <MagneticButton
                onClick={signIn}
                className="bg-ink text-white shadow-[0_16px_32px_-12px_rgba(19,33,46,0.4)] hover:bg-ink/85"
              >
                {loading ? "Redirecting…" : "Get Started"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.42}>
            <p className="mt-5 text-[13px] text-ink/45">
              Free to try — no credit card, no account required.
            </p>
          </Reveal>

          <Reveal delay={0.5}>
            <p className="mt-6 text-balance text-[15px] leading-relaxed text-ink/65 sm:text-[15.5px]">
              Instead of searching through thousands of screenshots, pons
              understands them, connects them, and takes action automatically.
            </p>
          </Reveal>

          <Reveal delay={0.6}>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="flex items-center gap-1.5 text-[13.5px] text-ink/70"
                >
                  <Check className="h-3.5 w-3.5 text-accent-hover" strokeWidth={2.5} />
                  {chip}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* right — glanceable widget dashboard */}
        <div className="relative w-full">
          <HeroWidgetGrid />
        </div>
      </div>
    </section>
  );
}

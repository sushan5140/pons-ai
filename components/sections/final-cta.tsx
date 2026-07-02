"use client";

import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import MagneticButton from "@/components/ui/magnetic-button";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32 sm:py-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[image:var(--gradient-brand)] opacity-[0.14] blur-[140px]" />
        <div className="absolute inset-0 grid-texture opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-secondary">
            pons
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-4 text-balance font-display text-[36px] font-medium leading-[1.08] tracking-[-0.01em] text-ink sm:text-[52px]">
            Your screenshots already remember everything.
            <br />
            Now they can think.
          </h2>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-10 flex justify-center">
            <MagneticButton
              href="#demo"
              className="bg-ink px-9 py-4 text-[15.5px] text-white shadow-[0_20px_40px_-12px_rgba(19,33,46,0.45)] hover:bg-ink/85"
            >
              Start Using Screenshot Brain
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

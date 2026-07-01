"use client";

import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import MagneticButton from "@/components/ui/magnetic-button";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[image:var(--gradient-brand)] opacity-[0.16] blur-[140px]" />
        <div className="absolute inset-0 grid-texture opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-primary/70">
            Start today
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-4 text-balance font-display text-[42px] font-bold leading-[1.02] tracking-tight text-ink sm:text-[64px]">
            Never miss another school update.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-md text-[18px] leading-relaxed text-ink/60">
            Join thousands of parents who&apos;ve put their child&apos;s school life on
            autopilot.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex justify-center">
            <MagneticButton className="bg-ink px-9 py-4 text-[16px] text-white shadow-[0_20px_40px_-12px_rgba(30,31,38,0.5)] hover:bg-primary">
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

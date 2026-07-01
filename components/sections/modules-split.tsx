"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, Sparkles, Search, Wallet } from "lucide-react";
import AmbientBackground from "@/components/ui/ambient-background";

gsap.registerPlugin(ScrollTrigger);

const MODULES = [
  { label: "Homework Intelligence", note: "Auto-tracked & summarized", icon: CheckCircle2, x: -320, y: -30, rotate: -7 },
  { label: "AI Assistant", note: "Ask anything, instantly", icon: Sparkles, x: -110, y: 160, rotate: -3 },
  { label: "Universal Search", note: "Every document, searchable", icon: Search, x: 110, y: 160, rotate: 3 },
  { label: "Fee Tracking", note: "Never miss a due date", icon: Wallet, x: 320, y: -30, rotate: 7 },
];

export default function ModulesSplit() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const moduleRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=180%",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(seedRef.current, { scale: 0, opacity: 0, duration: 0.4, ease: "power1.in" }, 0);

      MODULES.forEach((m, i) => {
        tl.fromTo(
          moduleRefs.current[i],
          { x: 0, y: 0, scale: 0.3, opacity: 0, rotate: (i - 1.5) * 8 },
          { x: m.x, y: m.y, scale: 1, opacity: 1, rotate: m.rotate, ease: "power2.out", duration: 1.4 },
          i * 0.22
        );
      });

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.9
      );

      tl.to({}, { duration: 0.6 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      <div ref={pinRef} className="relative flex h-screen items-center justify-center overflow-hidden">
        <AmbientBackground variant="quiet" />

        <div
          ref={headingRef}
          className="absolute top-24 z-20 text-center opacity-0"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-primary/70">
            Modular by design
          </p>
          <h2 className="mt-3 font-display text-[38px] font-bold tracking-tight text-ink sm:text-[52px]">
            Everything organized. Instantly.
          </h2>
        </div>

        <div className="relative z-10 flex h-[420px] w-full max-w-4xl items-center justify-center">
          <div
            ref={seedRef}
            className="absolute h-16 w-16 rounded-[18px] bg-[image:var(--gradient-brand)] shadow-[0_20px_50px_-12px_rgba(43,90,125,0.5)]"
          />

          {MODULES.map((m, i) => (
            <div
              key={m.label}
              ref={(el) => {
                moduleRefs.current[i] = el;
              }}
              className="glass-surface absolute flex w-[190px] flex-col gap-3 rounded-[22px] p-5 opacity-0"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[14.5px] font-semibold text-ink">{m.label}</p>
              <p className="text-[12.5px] text-ink/50">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Play } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";
import Reveal from "@/components/ui/reveal";
import { DEMO_ANSWER, DEMO_QUERY } from "@/components/three/entity-graph-data";
import type { GraphPhase } from "@/components/three/entity-graph";

const EntityGraph = dynamic(() => import("@/components/three/entity-graph"), { ssr: false });

const SEQUENCE: GraphPhase[] = ["idle", "typing", "highlight", "converge", "answer"];
const TIMINGS: Record<GraphPhase, number> = {
  idle: 2400,
  typing: 1300,
  highlight: 900,
  converge: 1300,
  answer: 3600,
};

const CHIPS = ["Natural language search", "AI reminders", "Connected memory"];

function useGraphScript(reducedMotion: boolean) {
  const [phase, setPhase] = useState<GraphPhase>(reducedMotion ? "answer" : "idle");
  const [typed, setTyped] = useState(reducedMotion ? DEMO_QUERY : "");

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let index = 0;
    let typeTimer: ReturnType<typeof setTimeout>;
    let stepTimer: ReturnType<typeof setTimeout>;

    function type() {
      let i = 0;
      setTyped("");
      const step = () => {
        if (cancelled) return;
        i += 1;
        setTyped(DEMO_QUERY.slice(0, i));
        if (i < DEMO_QUERY.length) typeTimer = setTimeout(step, 38);
      };
      step();
    }

    function run() {
      if (cancelled) return;
      const current = SEQUENCE[index];
      setPhase(current);
      if (current === "typing") type();
      if (current === "idle") setTyped("");
      stepTimer = setTimeout(() => {
        index = (index + 1) % SEQUENCE.length;
        run();
      }, TIMINGS[current]);
    }

    run();
    return () => {
      cancelled = true;
      clearTimeout(typeTimer);
      clearTimeout(stepTimer);
    };
  }, [reducedMotion]);

  return { phase, typed };
}

export default function Hero() {
  const reducedMotion = useReducedMotion() ?? false;
  const { phase, typed } = useGraphScript(reducedMotion);
  const graphWrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(graphWrapRef, { margin: "-10% 0px -10% 0px" });
  const showAnswer = phase === "answer";

  return (
    <section
      id="product"
      className="relative flex min-h-[92vh] items-center overflow-hidden px-6 pb-16 pt-36 lg:min-h-screen lg:pt-40"
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
                href="#demo"
                className="bg-ink text-white shadow-[0_16px_32px_-12px_rgba(19,33,46,0.4)] hover:bg-ink/85"
              >
                Try the Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton
                className="border border-hairline-strong bg-white/40 text-ink hover:bg-white/70"
                strength={0.25}
              >
                <Play className="h-3.5 w-3.5" />
                Watch 2-minute Demo
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

        {/* right — dominant entity graph */}
        <div
          ref={graphWrapRef}
          className="relative h-[380px] w-full sm:h-[460px] lg:h-[640px]"
          role="img"
          aria-label="An interactive graph showing screenshots connected by shared people, places, and events"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
            <div className="glass-surface flex min-w-[240px] items-center gap-2 rounded-full px-5 py-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-hover" />
              <span className="font-mono text-[12.5px] text-ink/80 sm:text-[13px]">
                {typed || " "}
                <span
                  aria-hidden
                  className="ml-0.5 inline-block h-[13px] w-[1.5px] animate-pulse bg-ink/40 align-middle"
                />
              </span>
            </div>
          </div>

          <EntityGraph phase={phase} reducedMotion={reducedMotion} active={inView} />

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-surface pointer-events-none absolute inset-x-4 bottom-2 z-20 mx-auto max-w-md rounded-[16px] px-5 py-3.5 text-center sm:bottom-6"
              >
                <p className="text-[13.5px] leading-relaxed text-ink/80 sm:text-[14px]">
                  {DEMO_ANSWER}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

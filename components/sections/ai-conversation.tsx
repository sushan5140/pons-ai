"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Sparkles, Paperclip, ArrowUp, FileText } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import AmbientBackground from "@/components/ui/ambient-background";
import { cn } from "@/lib/utils";

type Segment = { type: "text" | "chip"; value: string };

const AI_SEGMENTS: Segment[] = [
  { type: "text", value: "You have " },
  { type: "chip", value: "2 assignments" },
  { type: "text", value: " due this week — " },
  { type: "chip", value: "Science, Thursday" },
  { type: "text", value: " and " },
  { type: "chip", value: "Math, Friday" },
  { type: "text", value: ". I've also flagged the " },
  { type: "chip", value: "Term Fee, due Nov 30" },
  { type: "text", value: "." },
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink/40"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function AIConversation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [stage, setStage] = useState(0);
  const [segmentCount, setSegmentCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setStage(1), 500));
    timers.push(setTimeout(() => setStage(2), 1500));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  useEffect(() => {
    if (stage < 2) return;
    if (segmentCount >= AI_SEGMENTS.length) {
      setStage(3);
      return;
    }
    const t = setTimeout(() => setSegmentCount((c) => c + 1), 220);
    return () => clearTimeout(t);
  }, [stage, segmentCount]);

  return (
    <section id="ai" className="relative flex min-h-screen items-center px-6 py-32">
      <AmbientBackground variant="dark" className="opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-primary/70">
            Ask anything
          </p>
          <h2 className="mt-3 text-balance font-display text-[38px] font-bold tracking-tight text-ink sm:text-[52px]">
            The assistant that reads school documents so you don&apos;t have to.
          </h2>
        </Reveal>

        <div ref={ref} className="glass-surface overflow-hidden rounded-[22px]">
          <div className="flex items-center gap-2 border-b border-hairline px-5 py-4">
            <span className="h-2 w-2 rounded-full bg-ink/10" />
            <span className="h-2 w-2 rounded-full bg-ink/10" />
            <span className="h-2 w-2 rounded-full bg-ink/10" />
            <span className="ml-3 text-[12.5px] text-ink/40">Aura Assistant</span>
          </div>

          <div className="flex min-h-[280px] flex-col gap-5 p-6 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex justify-end"
            >
              <span className="max-w-[85%] rounded-[16px] rounded-tr-[4px] bg-ink px-4 py-3 text-[14px] text-white/90">
                What&apos;s due this week for Aarav?
              </span>
            </motion.div>

            <AnimatePresence>
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-brand)]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[85%] rounded-[16px] rounded-tl-[4px] bg-white/70 px-4 py-3 text-[14px] leading-relaxed text-ink/85">
                    {stage === 1 ? (
                      <TypingDots />
                    ) : (
                      <span>
                        {AI_SEGMENTS.slice(0, segmentCount).map((seg, i) =>
                          seg.type === "chip" ? (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mx-0.5 inline-block rounded-full bg-accent/40 px-2.5 py-0.5 text-[13px] font-medium text-secondary"
                            >
                              {seg.value}
                            </motion.span>
                          ) : (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {seg.value}
                            </motion.span>
                          )
                        )}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {stage >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-11 flex items-center gap-3 rounded-[16px] border border-hairline bg-white/50 px-4 py-3"
                >
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-[13px] text-ink/60">Term_Circular.pdf — cited</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 border-t border-hairline p-4">
            <Paperclip className="h-4 w-4 text-ink/35" />
            <span className="flex-1 text-[14px] text-ink/35">
              Ask about homework, exams, fees, or circulars...
            </span>
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-ink text-white transition-colors"
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

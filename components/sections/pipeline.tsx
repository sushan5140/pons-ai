"use client";

import { motion } from "framer-motion";
import { ArrowRight, Camera, Eye, Network, Tags, Zap } from "lucide-react";
import { Bell, Calendar, FolderOpen, Search } from "lucide-react";
import Reveal from "@/components/ui/reveal";

const STEPS = [
  { icon: Camera, label: "Screenshot", detail: "You capture the moment." },
  { icon: Eye, label: "AI Vision", detail: "pons reads what's on screen." },
  { icon: Tags, label: "Entity Extraction", detail: "People, places, prices, dates." },
  { icon: Network, label: "Knowledge Graph", detail: "Linked to everything related." },
  { icon: Zap, label: "AI Actions", detail: "Something useful happens." },
];

const OUTPUTS = [
  { icon: Calendar, label: "Calendar" },
  { icon: Bell, label: "Reminder" },
  { icon: Search, label: "Search" },
  { icon: FolderOpen, label: "Collections" },
];

export default function Pipeline() {
  return (
    <section className="relative border-y border-hairline px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-lg text-center">
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">
            What happens after you take a screenshot?
          </h2>
          <p className="mt-4 text-balance text-[16px] leading-relaxed text-secondary">
            Nothing you have to do. Every screenshot moves through the same
            pipeline the moment it lands.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col items-center gap-2 lg:flex-row lg:items-start lg:justify-between lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center lg:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-[150px] flex-col items-center text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-hairline-strong bg-white/70 text-ink shadow-[0_8px_20px_-10px_rgba(19,33,46,0.25)]">
                  <step.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="mt-3 text-[14px] font-medium text-ink">{step.label}</p>
                <p className="mt-1 text-[12.5px] leading-snug text-secondary">
                  {step.detail}
                </p>
              </motion.div>

              {i < STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                  transition={{ duration: 0.4, delay: i * 0.15 + 0.25 }}
                  className="my-2 text-accent-hover lg:mx-1 lg:mt-6"
                  aria-hidden
                >
                  <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -5% 0px" }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mx-auto mt-14 flex w-fit flex-col items-center"
        >
          <span className="h-8 w-px bg-hairline-strong" aria-hidden />
          <p className="mt-3 text-[12px] uppercase tracking-wide text-ink/40">
            Becomes one of
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {OUTPUTS.map((output, i) => (
              <motion.div
                key={output.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2 rounded-full border border-hairline-strong bg-white/60 px-4 py-2 text-[13px] text-ink/75"
              >
                <output.icon className="h-3.5 w-3.5 text-accent-hover" />
                {output.label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/reveal";

const FIELDS = [
  { label: "Title", value: "Adidas Ultraboost 22" },
  { label: "Category", value: "Shopping · Footwear" },
  { label: "Price", value: "$128.00" },
  { label: "Date", value: "2026-06-18" },
  { label: "Entities", value: "Adidas, Order #4471" },
  { label: "Location", value: "adidas.com" },
];

export default function MetadataExtraction() {
  return (
    <section className="relative px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="text-balance font-display text-[30px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[38px]">
            Every screenshot, understood
          </h2>
          <p className="mt-4 text-balance text-[16px] leading-relaxed text-secondary">
            pons reads what&apos;s on screen and extracts the structure hiding
            inside it.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal className="mx-auto w-full max-w-sm">
            <div className="glass-surface overflow-hidden rounded-[20px]">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <span className="text-[12.5px] font-medium text-ink/70">
                  Screenshot
                </span>
                <span className="h-2 w-2 rounded-full bg-accent-hover" />
              </div>
              <div className="aspect-[4/5] w-full bg-[linear-gradient(160deg,#DCE6EC_0%,#EEF3F6_60%,#FFFFFF_100%)] p-5">
                <div className="h-full w-full rounded-[12px] border border-hairline bg-white/60 p-4">
                  <div className="h-24 w-full rounded-[8px] bg-ink/8" />
                  <div className="mt-4 h-2.5 w-3/4 rounded-full bg-ink/12" />
                  <div className="mt-2 h-2.5 w-1/2 rounded-full bg-ink/8" />
                  <div className="mt-5 h-6 w-1/3 rounded-[6px] bg-ink/15" />
                  <div className="mt-6 space-y-2">
                    <div className="h-2 w-full rounded-full bg-ink/6" />
                    <div className="h-2 w-5/6 rounded-full bg-ink/6" />
                    <div className="h-2 w-2/3 rounded-full bg-ink/6" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto w-full max-w-sm lg:mx-0">
            <div className="glass-surface rounded-[20px] p-2">
              {FIELDS.map((field, i) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3.5 last:border-b-0"
                >
                  <span className="font-mono text-[11.5px] uppercase tracking-wide text-secondary">
                    {field.label}
                  </span>
                  <span className="truncate font-mono text-[13px] text-ink">
                    {field.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

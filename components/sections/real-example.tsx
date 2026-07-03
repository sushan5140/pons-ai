"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import { MiniScreenshot, type ScreenshotDetail, type ScreenshotKind } from "@/components/ui/mini-screenshot";

const TIMELINE: {
  day: string;
  title: string;
  tag?: string;
  kind: ScreenshotKind;
  detail: ScreenshotDetail;
}[] = [
  {
    day: "Day 1",
    title: "Flight · NRT",
    kind: "flight",
    detail: { route: "DEL → NRT", gate: "42", seat: "14A" },
  },
  {
    day: "Day 1",
    title: "Hotel · Shinjuku",
    kind: "hotel",
    detail: { room: "Deluxe Twin", dates: "Nov 14 – Nov 17" },
  },
  {
    day: "Day 2",
    title: "Train · Shinkansen",
    kind: "train",
    detail: { route: "Tokyo → Kyoto", seat: "Car 5 · Seat 12A" },
  },
  {
    day: "Day 2",
    title: "Restaurant · Ichiran",
    kind: "restaurant",
    detail: {
      items: [
        { name: "Tonkotsu Ramen", price: "¥980" },
        { name: "Gyoza", price: "¥480" },
      ],
      total: "¥1,460",
    },
  },
  {
    day: "Day 3",
    title: "Shopping · Uniqlo",
    kind: "shopping",
    detail: {
      items: [
        { name: "Oversized Tee", price: "¥2,990" },
        { name: "Fleece Jacket", price: "¥5,990" },
      ],
      total: "¥8,980",
    },
  },
  {
    day: "Day 3",
    title: "Maps · Fushimi Inari",
    kind: "maps",
    detail: { meta: "4.6 ★ · 12 min walk" },
  },
  {
    day: "Day 4",
    title: "Receipt · Dinner",
    kind: "receipt",
    detail: {
      items: [
        { name: "Wagyu Set", price: "¥4,200" },
        { name: "Sake", price: "¥1,100" },
      ],
      total: "¥5,300",
    },
  },
  { day: "Day 4", title: "Photos · Osaka", kind: "photos", detail: {} },
];

export default function RealExample() {
  return (
    <section id="demo" className="relative scroll-mt-28 px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-lg text-center">
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">
            One search, one whole trip
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-8 flex max-w-md justify-center">
            <div className="glass-surface flex items-center gap-2.5 rounded-full px-5 py-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-hover" />
              <span className="font-mono text-[13px] text-ink/80 sm:text-[13.5px]">
                Show me everything from my Japan trip.
              </span>
            </div>
          </div>
        </Reveal>

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[38px] hidden h-px bg-hairline-strong sm:block"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <span className="relative z-10 mb-3 rounded-full border border-hairline-strong bg-canvas px-2 py-0.5 font-mono text-[10.5px] text-secondary">
                  {item.day}
                </span>
                <MiniScreenshot
                  title={item.title}
                  tag={item.tag}
                  kind={item.kind}
                  detail={item.detail}
                  className="w-full"
                />
              </motion.div>
            ))}
          </div>
        </div>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-12 max-w-xl text-balance text-center text-[16px] leading-relaxed text-ink/70 sm:text-[17px]">
            Eight screenshots, taken across four days, in no particular
            order. pons combines them into a single trip the moment you
            ask.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

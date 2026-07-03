"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { MiniScreenshot } from "@/components/ui/mini-screenshot";

const NODES = [
  { id: "screenshot", x: 200, y: 150, r: 9, fill: "#13212E", label: "Screenshot" },
  { id: "person", x: 80, y: 55, r: 6, fill: "#A6C5DA", label: "Person" },
  { id: "product", x: 320, y: 55, r: 6, fill: "#A6C5DA", label: "Product" },
  { id: "flight", x: 55, y: 220, r: 6, fill: "#A6C5DA", label: "Flight" },
  { id: "receipt", x: 345, y: 220, r: 6, fill: "#A6C5DA", label: "Receipt" },
  { id: "restaurant", x: 145, y: 275, r: 6, fill: "#A6C5DA", label: "Restaurant" },
  { id: "calendar", x: 255, y: 275, r: 6, fill: "#A6C5DA", label: "Calendar Event" },
];

const CORE_EDGES: [string, string][] = [
  ["screenshot", "person"],
  ["screenshot", "product"],
  ["screenshot", "flight"],
  ["screenshot", "receipt"],
  ["screenshot", "restaurant"],
  ["screenshot", "calendar"],
];

const GROWTH_EDGES: [string, string][] = [
  ["person", "restaurant"],
  ["flight", "calendar"],
  ["product", "receipt"],
];

const byId = new Map(NODES.map((n) => [n.id, n]));

function labelOffset(node: (typeof NODES)[number]) {
  if (node.id === "screenshot") return { dx: 0, dy: -18, anchor: "middle" as const };
  const dx = node.x < 200 ? -10 : node.x > 200 ? 10 : 0;
  const anchor: "end" | "start" | "middle" = dx < 0 ? "end" : dx > 0 ? "start" : "middle";
  const dy = node.y < 150 ? -12 : 16;
  return { dx, dy, anchor };
}

export default function EntityGraphExplained() {
  return (
    <section className="relative overflow-hidden px-6 py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />

      <div className="relative mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-lg text-center">
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">
            The entity graph
          </h2>
          <p className="mt-4 text-balance text-[16px] leading-relaxed text-secondary">
            Most screenshot tools stop at one image. pons treats every
            screenshot as a piece of something larger.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-3">
            <MiniScreenshot
              title="Flight · SFO"
              kind="flight"
              detail={{ route: "DEL → SFO", gate: "27", seat: "9C" }}
              className="w-28 shrink-0"
            />
            <MiniScreenshot
              title="Dinner · Roka"
              kind="restaurant"
              detail={{
                items: [
                  { name: "Robata Set", price: "$142" },
                  { name: "Sake Pairing", price: "$44" },
                ],
                total: "$186",
              }}
              className="w-28 shrink-0"
            />
            <MiniScreenshot
              title="Hotel · SF"
              kind="hotel"
              detail={{ room: "King Room", dates: "3 nights" }}
              className="w-28 shrink-0"
            />
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mx-auto mt-4 flex justify-center text-ink/30">
            <ArrowDown className="h-5 w-5" aria-hidden />
          </div>
        </Reveal>

        <div className="mx-auto mt-4 max-w-lg">
          <svg viewBox="0 0 400 300" className="h-auto w-full" aria-hidden>
            {CORE_EDGES.map(([a, b], i) => {
              const na = byId.get(a)!;
              const nb = byId.get(b)!;
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="#A6C5DA"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.8 }}
                  viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
            {GROWTH_EDGES.map(([a, b], i) => {
              const na = byId.get(a)!;
              const nb = byId.get(b)!;
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="#8DB4CC"
                  strokeWidth={1.25}
                  strokeDasharray="3 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.55 }}
                  viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                  transition={{ duration: 0.6, delay: 0.9 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
            {NODES.map((node, i) => {
              const { dx, dy, anchor } = labelOffset(node);
              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                  transition={{ duration: 0.45, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <circle cx={node.x} cy={node.y} r={node.r} fill={node.fill} />
                  <text
                    x={node.x + dx}
                    y={node.y + dy}
                    textAnchor={anchor}
                    className="fill-current text-ink font-sans text-[11px] font-medium"
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-xl text-balance text-center text-[16px] leading-relaxed text-ink/70 sm:text-[17px]">
            Every screenshot becomes part of one connected memory. Instead of
            searching one screenshot at a time, the AI searches your entire
            life.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

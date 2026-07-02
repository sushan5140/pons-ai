"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, Plane, Search, Share2 } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { MiniScreenshot } from "@/components/ui/mini-screenshot";
import { cn } from "@/lib/utils";

function CardShell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-surface flex h-full flex-col rounded-[22px] p-6">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        <span className="font-mono text-[12px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-5 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function SearchCard() {
  return (
    <CardShell label="Natural Language Search" icon={<Search className="h-4 w-4" />}>
      <div className="rounded-[10px] border border-hairline-strong bg-white/70 px-3.5 py-2.5">
        <span className="font-mono text-[13px] text-ink/80">
          Show me Rahul&apos;s flight.
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4"
      >
        <MiniScreenshot title="Flight · DEL → SFO" tag="Nov 14" />
      </motion.div>
      <p className="mt-auto pt-6 text-[13.5px] leading-relaxed text-secondary">
        One result, instantly — no folder to dig through.
      </p>
    </CardShell>
  );
}

function ActionCard() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <CardShell label="Agent Action" icon={<Calendar className="h-4 w-4" />}>
      <div className="space-y-2">
        {["Screenshot detected", "Flight found", "Calendar event suggested"].map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 text-[13.5px] text-ink/75"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-hover" />
            {step}
          </motion.div>
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setConfirmed(true)}
          disabled={confirmed}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-medium transition-colors",
            confirmed
              ? "bg-accent/30 text-ink"
              : "bg-ink text-white hover:bg-ink/85"
          )}
        >
          {confirmed ? (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Added to calendar
            </motion.span>
          ) : (
            "Confirm"
          )}
        </button>
      </div>

      <p className="mt-auto pt-6 text-[13.5px] leading-relaxed text-secondary">
        pons acts on what it reads — no copy-pasting into another app.
      </p>
    </CardShell>
  );
}

const RELATIONSHIP_NODES = [
  { x: 30, y: 30, label: "Adidas order" },
  { x: 170, y: 24, label: "Price drop" },
  { x: 100, y: 90, label: "Warranty" },
  { x: 190, y: 100, label: "Wishlist" },
];
const RELATIONSHIP_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
];

function RelationshipCard() {
  return (
    <CardShell label="Entity Relationships" icon={<Share2 className="h-4 w-4" />}>
      <div className="rounded-[10px] border border-hairline-strong bg-white/70 px-3.5 py-2.5">
        <span className="font-mono text-[13px] text-ink/80">
          Everything related to Adidas.
        </span>
      </div>

      <svg viewBox="0 0 220 130" className="mt-4 h-[130px] w-full" aria-hidden>
        {RELATIONSHIP_EDGES.map(([a, b], i) => {
          const na = RELATIONSHIP_NODES[a];
          const nb = RELATIONSHIP_NODES[b];
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="#8DB4CC"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.8 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
        {RELATIONSHIP_NODES.map((node, i) => (
          <motion.g
            key={node.label}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={i === 0 ? 7 : 5}
              fill={i === 0 ? "#13212E" : "#A6C5DA"}
            />
          </motion.g>
        ))}
      </svg>

      <p className="mt-auto pt-4 text-[13.5px] leading-relaxed text-secondary">
        Four screenshots, one thread — the graph updates as it learns.
      </p>
    </CardShell>
  );
}

export default function ProductDemo() {
  return (
    <section id="demo" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="text-balance font-display text-[30px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[38px]">
            Three ways it thinks with you
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Reveal delay={0.05}>
            <SearchCard />
          </Reveal>
          <Reveal delay={0.15}>
            <ActionCard />
          </Reveal>
          <Reveal delay={0.25}>
            <RelationshipCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

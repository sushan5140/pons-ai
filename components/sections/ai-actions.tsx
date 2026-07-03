"use client";

import { motion } from "framer-motion";
import {
  AlarmClock,
  ArrowRight,
  BookOpen,
  Calendar,
  ChefHat,
  Compass,
  CreditCard,
  Plane,
  Receipt,
  ShieldCheck,
  Tag,
  TrendingDown,
  UtensilsCrossed,
} from "lucide-react";
import Reveal from "@/components/ui/reveal";

const PAIRS = [
  { from: "Flight detected", fromIcon: Plane, to: "Calendar suggestion", toIcon: Calendar },
  { from: "Bill detected", fromIcon: Receipt, to: "Payment reminder", toIcon: CreditCard },
  { from: "Warranty detected", fromIcon: ShieldCheck, to: "Expiry reminder", toIcon: AlarmClock },
  { from: "Product detected", fromIcon: Tag, to: "Price tracking", toIcon: TrendingDown },
  { from: "Recipe detected", fromIcon: ChefHat, to: "Recipe collection", toIcon: BookOpen },
  { from: "Restaurant detected", fromIcon: UtensilsCrossed, to: "Travel collection", toIcon: Compass },
];

export default function AIActions() {
  return (
    <section className="relative px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-lg text-center">
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">
            It doesn&apos;t just answer. It acts.
          </h2>
          <p className="mt-4 text-balance text-[16px] leading-relaxed text-secondary">
            Recognizing what a screenshot is is only the first step. pons
            follows through on it.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAIRS.map((pair, i) => (
            <motion.div
              key={pair.from}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-surface flex items-center justify-between gap-3 rounded-[16px] px-5 py-4"
            >
              <div className="flex items-center gap-2.5">
                <pair.fromIcon className="h-4 w-4 shrink-0 text-ink/50" strokeWidth={1.75} />
                <span className="text-[13.5px] text-ink/60">{pair.from}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent-hover" />
              <div className="flex items-center gap-2.5">
                <pair.toIcon className="h-4 w-4 shrink-0 text-ink" strokeWidth={1.75} />
                <span className="text-[13.5px] font-medium text-ink">{pair.to}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

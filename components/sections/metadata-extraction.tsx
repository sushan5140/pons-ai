"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const SIZES = ["7", "8", "9", "10", "11"];
const SWATCHES = ["#13212E", "#A6C5DA", "#F5F8FA"];

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
                <div className="flex h-full w-full flex-col rounded-[12px] border border-hairline bg-white/80 p-4 shadow-[0_1px_2px_rgba(19,33,46,0.04)]">
                  <div className="relative flex h-32 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[radial-gradient(120%_100%_at_30%_20%,#EEF3F6_0%,#DCE6EC_55%,#CFDEE6_100%)]">
                    <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-ink/50">
                      <Heart className="h-3 w-3" strokeWidth={2} />
                    </span>
                    <span className="absolute right-2 top-2 rounded-full bg-white/85 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-ink/60 shadow-sm">
                      Adidas
                    </span>

                    <svg viewBox="0 0 240 120" className="relative h-[68px] w-40 drop-shadow-[0_6px_6px_rgba(19,33,46,0.12)]">
                      <ellipse cx="113" cy="99" rx="88" ry="7" fill="#13212E" fillOpacity={0.1} />
                      <defs>
                        <linearGradient id="shoeBody" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#2A3D4E" />
                          <stop offset="100%" stopColor="#13212E" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M14,78
                           C12,66 18,56 30,52
                           L58,42
                           C64,40 68,36 70,30
                           C74,20 84,16 95,18
                           L100,24
                           C110,20 130,18 150,20
                           C172,22 190,30 200,42
                           C208,50 212,58 212,68
                           L212,80
                           C212,90 204,96 192,96
                           L36,96
                           C22,96 15,90 14,78 Z"
                        fill="url(#shoeBody)"
                        fillOpacity={0.92}
                      />
                      <path
                        d="M30,52 L58,42 C64,40 68,36 70,30"
                        fill="none"
                        stroke="#F5F8FA"
                        strokeOpacity={0.5}
                        strokeWidth={1.5}
                      />
                      <line x1="95" y1="30" x2="80" y2="45" stroke="#A6C5DA" strokeWidth="4.5" strokeLinecap="round" />
                      <line x1="115" y1="26" x2="100" y2="44" stroke="#A6C5DA" strokeWidth="4.5" strokeLinecap="round" />
                      <line x1="135" y1="24" x2="120" y2="44" stroke="#A6C5DA" strokeWidth="4.5" strokeLinecap="round" />
                      <path
                        d="M14,84 L212,84 L212,90 C212,94 208,96 202,96 L24,96 C18,96 14,92 14,86 Z"
                        fill="#F5F8FA"
                        fillOpacity={0.85}
                      />
                    </svg>
                  </div>

                  <div className="mt-3.5 flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-2.5 w-2.5 text-accent-hover"
                          fill="currentColor"
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-secondary">4.8 (2,340)</span>
                  </div>

                  <div className="mt-1.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold leading-tight text-ink">
                        Adidas Ultraboost 22
                      </p>
                      <p className="mt-0.5 text-[11px] text-secondary">Running · Men&apos;s</p>
                    </div>
                    <span className="shrink-0 text-[14px] font-semibold text-ink">$128.00</span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    {SWATCHES.map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4 rounded-full border border-hairline-strong ring-1 ring-white"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <span className="ml-1 text-[10px] text-secondary">3 colors</span>
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    {SIZES.map((size) => (
                      <span
                        key={size}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-[6px] border text-[10.5px] transition-colors",
                          size === "9"
                            ? "border-ink bg-ink text-white"
                            : "border-hairline-strong text-ink/60"
                        )}
                      >
                        {size}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3.5 flex items-center gap-2">
                    <div className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-ink py-2 text-center text-[11.5px] font-medium text-white shadow-[0_8px_16px_-8px_rgba(19,33,46,0.5)]">
                      <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
                      Add to Cart
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-1.5 pt-3 text-[10.5px] text-secondary">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-hover" />
                    Order #4471 confirmed · Jun 18
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

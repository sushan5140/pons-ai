"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  Calendar,
  MessageCircle,
  Plane,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  StickyNote,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HERO_WIDGETS,
  WIDGET_COLOR,
  type WidgetDetail,
  type WidgetKind,
  type WidgetNode,
} from "./hero-widget-data";

const KIND_ICON: Record<WidgetKind, LucideIcon> = {
  flight: Plane,
  receipt: Receipt,
  product: ShoppingBag,
  price: TrendingDown,
  warranty: ShieldCheck,
  calendar: Calendar,
  chat: MessageCircle,
  note: StickyNote,
};

function WidgetBody({ node }: { node: WidgetNode }) {
  const d: WidgetDetail = node.detail;
  const solid = WIDGET_COLOR[node.kind];

  if (node.kind === "flight" && d.route) {
    return (
      <div>
        <p className="font-mono text-[15px] font-semibold text-ink">{d.route}</p>
        <p className="mt-1 text-[11.5px] text-secondary">
          Gate {d.gate} · Seat {d.seat}
        </p>
        <div className="mt-2.5 flex gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="h-3 w-[2px] shrink-0 rounded-full"
              style={{
                background: i % 3 === 0 ? solid : "rgba(19,33,46,0.14)",
                opacity: i % 3 === 0 ? 0.55 : 1,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if ((node.kind === "receipt" || node.kind === "product") && d.items) {
    return (
      <div>
        <ul className="space-y-1">
          {d.items.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-2 text-[11.5px]">
              <span className="truncate text-ink/60">{item.name}</span>
              <span className="shrink-0 font-mono text-ink/70">{item.price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-1.5 flex items-center justify-between border-t border-hairline pt-1.5 text-[12.5px] font-semibold">
          <span className="text-ink/80">Total</span>
          <span className="font-mono" style={{ color: solid }}>
            {d.total}
          </span>
        </div>
      </div>
    );
  }

  if (node.kind === "product" && d.size) {
    return (
      <div>
        <p className="text-[11.5px] text-secondary">Size {d.size}</p>
        <span
          className="mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: `${solid}1F`, color: solid }}
        >
          ✓ {d.status}
        </span>
      </div>
    );
  }

  if (node.kind === "price" && d.was) {
    return (
      <div>
        <p className="text-[12px] text-ink/40 line-through">{d.was}</p>
        <p className="mt-0.5 text-[24px] font-bold leading-none text-ink">{d.now}</p>
        {node.tag && (
          <span
            className="mt-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
            style={{ background: solid }}
          >
            <ArrowDown className="h-2.5 w-2.5" strokeWidth={2.5} />
            {node.tag}
          </span>
        )}
      </div>
    );
  }

  if (node.kind === "warranty" && d.purchased) {
    return (
      <div>
        <p className="text-[11.5px] text-secondary">Purchased {d.purchased}</p>
        <p className="text-[11.5px] text-secondary">Expires {d.expiry}</p>
        <p className="mt-1.5 text-[12px] font-semibold" style={{ color: solid }}>
          {d.remaining}
        </p>
      </div>
    );
  }

  if (node.kind === "calendar" && d.when) {
    return (
      <div>
        <p className="text-[13px] font-semibold leading-snug text-ink">{d.when}</p>
        <p className="mt-1 text-[11.5px] text-secondary">{d.location}</p>
      </div>
    );
  }

  if (node.kind === "chat" && d.message) {
    return (
      <div>
        <div className="rounded-[10px] bg-ink/[0.045] px-3 py-2 text-[11.5px] leading-snug text-ink/70">
          {d.message}
        </div>
        <p className="mt-1.5 text-[11.5px] font-semibold" style={{ color: solid }}>
          {d.unread}
        </p>
      </div>
    );
  }

  if (node.kind === "note" && d.bullets) {
    return (
      <ul className="space-y-1.5">
        {d.bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-1.5 text-[11.5px] text-ink/65">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: solid }} />
            {bullet}
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

export default function HeroWidgetGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
      {HERO_WIDGETS.map((node, i) => {
        const Icon = KIND_ICON[node.kind];
        const color = WIDGET_COLOR[node.kind];
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -5% 0px" }}
            transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "glass-surface rounded-[18px] p-4 shadow-[0_1px_2px_rgba(19,33,46,0.04)]",
              node.wide && "col-span-2"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: color }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-ink">
                  {node.title}
                </p>
                {node.person && (
                  <p className="text-[10.5px] text-secondary">{node.person}</p>
                )}
              </div>
            </div>
            <div className="mt-3.5">
              <WidgetBody node={node} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

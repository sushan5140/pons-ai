"use client";

import {
  BookOpen,
  Compass,
  MessageCircle,
  Plane,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import Reveal from "@/components/ui/reveal";
import TiltCard from "@/components/ui/tilt-card";

type Card =
  | {
      kind: "flow";
      icon: typeof Plane;
      title: string;
      steps: string[];
    }
  | {
      kind: "query";
      icon: typeof Plane;
      title: string;
      body: string;
      query: string;
    }
  | {
      kind: "list";
      icon: typeof Plane;
      title: string;
      body: string;
      items: string[];
    };

const CARDS: Card[] = [
  {
    kind: "flow",
    icon: Plane,
    title: "Never lose a flight again",
    steps: ["Flight screenshot", "AI reads the departure", "Calendar event created", "Reminder one day before"],
  },
  {
    kind: "query",
    icon: ShoppingBag,
    title: "Shopping memory",
    body: "Screenshot a product today. Find it months later by asking.",
    query: "Show me the blue sneakers.",
  },
  {
    kind: "query",
    icon: MessageCircle,
    title: "Conversations",
    body: "Screenshot the chat. Search it later, in plain language.",
    query: "What did Rahul recommend?",
  },
  {
    kind: "list",
    icon: Compass,
    title: "Travel",
    body: "One vacation, one search.",
    items: ["Every hotel", "Every restaurant", "Every boarding pass", "Every receipt"],
  },
  {
    kind: "list",
    icon: Receipt,
    title: "Finance",
    body: "Screenshots quietly become records.",
    items: ["Receipts become expenses", "Invoices become searchable", "Warranty reminders appear on their own"],
  },
  {
    kind: "list",
    icon: BookOpen,
    title: "Personal memory",
    body: "Remembered without being manually saved.",
    items: ["Movies", "Books", "Recipes", "Quotes", "Ideas"],
  },
];

function CardBody({ card }: { card: Card }) {
  if (card.kind === "flow") {
    return (
      <ol className="mt-5 space-y-2.5">
        {card.steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2.5 text-[13.5px] text-ink/75">
            <span className="font-mono text-[11px] text-accent-hover">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        ))}
      </ol>
    );
  }

  if (card.kind === "query") {
    return (
      <div className="mt-5">
        <p className="text-[13.5px] leading-relaxed text-secondary">{card.body}</p>
        <div className="mt-4 rounded-[10px] border border-hairline-strong bg-white/70 px-3.5 py-2.5">
          <span className="font-mono text-[12.5px] text-ink/80">&ldquo;{card.query}&rdquo;</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <p className="text-[13.5px] leading-relaxed text-secondary">{card.body}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {card.items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-hairline bg-white/60 px-3 py-1 text-[12.5px] text-ink/70"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FeatureShowcase() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-lg text-center">
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">
            Not a feature list. Six things that actually happen.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={(i % 3) * 0.08}>
              <TiltCard className="group h-full" intensity={6}>
                <div className="glass-surface flex h-full flex-col rounded-[22px] p-6 transition-shadow duration-300 group-hover:shadow-[0_28px_56px_-20px_rgba(19,33,46,0.28)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent/25 text-ink">
                    <card.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-[16.5px] font-medium text-ink">{card.title}</h3>
                  <CardBody card={card} />
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

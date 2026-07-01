"use client";

import {
  Search,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  Wallet,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import Reveal from "@/components/ui/reveal";
import TiltCard from "@/components/ui/tilt-card";
import AmbientBackground from "@/components/ui/ambient-background";

const FEATURES = [
  {
    title: "Universal Search",
    description: "Find any circular, exam date, or homework note in one search — across every child.",
    icon: Search,
  },
  {
    title: "AI Assistant",
    description: "Ask a question in plain language and get an answer pulled from real school documents.",
    icon: Sparkles,
  },
  {
    title: "Multi-Child Dashboard",
    description: "Every child, every school, one unified view — switch between them instantly.",
    icon: Users,
  },
  {
    title: "Homework Intelligence",
    description: "Homework is extracted, tracked, and reminded automatically — no manual entry.",
    icon: CheckCircle2,
  },
  {
    title: "Document Management",
    description: "PDFs and notices are read, summarized, and made searchable the moment they arrive.",
    icon: FileText,
  },
  {
    title: "Fee Tracking",
    description: "Due dates, receipts, and payment status — always visible, never missed.",
    icon: Wallet,
  },
  {
    title: "Attendance",
    description: "Live attendance for every child, with trends that flag what needs attention.",
    icon: CalendarCheck,
  },
  {
    title: "School Communication",
    description: "Every notice from every channel, unified into one intelligent inbox.",
    icon: MessageSquare,
  },
];

export default function FeatureWindows() {
  return (
    <section id="features" className="relative px-6 py-32">
      <AmbientBackground variant="quiet" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-primary/70">
            Product surface
          </p>
          <h2 className="mt-3 text-balance font-display text-[38px] font-bold tracking-tight text-ink sm:text-[52px]">
            Not features. Floating windows into your child&apos;s school life.
          </h2>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 4) * 0.08}>
              <TiltCard intensity={6} className="group h-full">
                <div className="glass-surface flex h-full flex-col overflow-hidden rounded-[22px]">
                  <div className="flex items-center gap-1.5 border-b border-hairline px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-ink/10" />
                    <span className="h-2 w-2 rounded-full bg-ink/10" />
                    <span className="h-2 w-2 rounded-full bg-ink/10" />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[image:var(--gradient-brand)]">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-[15.5px] font-semibold tracking-tight text-ink">
                      {feature.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-ink/55">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

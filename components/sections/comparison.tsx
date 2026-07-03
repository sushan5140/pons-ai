import { Check, Minus } from "lucide-react";
import Reveal from "@/components/ui/reveal";

const TRADITIONAL = ["Store images", "OCR text", "Manual folders", "Static files"];
const PONS = [
  "Understands meaning",
  "Connects related screenshots",
  "Creates reminders",
  "Suggests actions",
  "Learns context",
  "Answers questions",
];

export default function Comparison() {
  return (
    <section className="relative px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-lg text-center">
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">
            Not another screenshot organizer
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-[22px] border border-hairline bg-white/40 p-7">
              <p className="text-[13px] font-medium uppercase tracking-wide text-ink/40">
                Traditional screenshot apps
              </p>
              <ul className="mt-5 space-y-3.5">
                {TRADITIONAL.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-ink/55">
                    <Minus className="h-3.5 w-3.5 shrink-0 text-ink/25" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="glass-surface flex h-full flex-col rounded-[22px] border border-accent/40 p-7 shadow-[0_24px_48px_-20px_rgba(19,33,46,0.22)]">
              <p className="text-[13px] font-medium uppercase tracking-wide text-ink/60">
                pons
              </p>
              <ul className="mt-5 space-y-3.5">
                {PONS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[15px] font-medium text-ink">
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent-hover" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

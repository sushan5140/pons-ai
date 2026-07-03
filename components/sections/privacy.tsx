import { Lock, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Reveal from "@/components/ui/reveal";

const POINTS = [
  {
    icon: SlidersHorizontal,
    title: "On-device processing",
    body: "Available for the moments that call for it — your screenshots don't have to leave your device.",
  },
  {
    icon: Lock,
    title: "Encrypted sync",
    body: "Everything that does sync is encrypted end to end, so it's readable by you and no one else.",
  },
  {
    icon: ShieldCheck,
    title: "You control your data",
    body: "Export it, delete it, or turn it off entirely — at any time, in one place.",
  },
];

export default function Privacy() {
  return (
    <section id="privacy" className="relative scroll-mt-28 border-y border-hairline px-6 py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-lg text-center">
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[34px]">
            Private by design
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {POINTS.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent/25 text-ink">
                  <point.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-[16px] font-medium text-ink">{point.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-secondary">
                  {point.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

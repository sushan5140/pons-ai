import Reveal from "@/components/ui/reveal";

const LOST_THINGS = [
  "A flight ticket",
  "A payment confirmation",
  "A shopping item",
  "A WhatsApp conversation",
  "A recipe",
  "A hotel",
  "A concert ticket",
  "A password",
  "A QR code",
  "A bill",
  "A warranty",
  "An apartment listing",
];

export default function Problem() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal>
          <h2 className="text-balance font-display text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">
            Everyone saves screenshots.
            <br />
            Nobody finds them later.
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 text-balance text-[16px] leading-relaxed text-secondary sm:text-[17px]">
            You save a screenshot because you don&apos;t want to lose it. You
            don&apos;t rename it. You don&apos;t move it into a folder. You just
            keep taking screenshots.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <ul className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
            {LOST_THINGS.map((thing) => (
              <li
                key={thing}
                className="rounded-full border border-hairline bg-white/50 px-3.5 py-1.5 text-[13px] text-ink/65"
              >
                {thing}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.35}>
          <p className="mt-9 text-balance text-[17px] leading-relaxed text-ink/70 sm:text-[18px]">
            Months later, the gallery becomes impossible to search. Every one
            of these becomes dead information — a picture, not a memory.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

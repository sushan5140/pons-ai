import { ArrowUpRight } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: ["Dashboard", "AI Assistant", "Document Intelligence", "Attendance"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help Center", "Guides", "Security", "Status"],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-hairline px-6 pb-10 pt-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-xs">
            <span className="font-display text-[22px] font-semibold tracking-tight text-ink">
              Aura
            </span>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
              One intelligent dashboard for every school update — built for parents who
              don&apos;t have time to miss anything.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[13px] font-medium uppercase tracking-wide text-ink/40">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="group inline-flex items-center gap-1 text-[14.5px] text-ink/70 transition-colors hover:text-ink"
                      >
                        {link}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-hairline pt-8 text-[13px] text-ink/40 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Aura Labs, Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink/70">
              Privacy
            </a>
            <a href="#" className="hover:text-ink/70">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

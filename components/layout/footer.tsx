import ContactCopyButton from "./contact-copy-button";

export default function Footer() {
  return (
    <footer className="relative border-t border-hairline px-6 pb-10 pt-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-xs">
            <span className="font-display text-[22px] font-semibold tracking-tight text-ink">
              pons
            </span>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary">
              Screenshots stop being a graveyard. pons turns them into memory
              that thinks — so nothing you save is ever lost again.
            </p>
          </div>

          <ul className="flex gap-6">
            <li>
              <a href="#" className="text-[14.5px] text-secondary transition-colors hover:text-ink">
                About
              </a>
            </li>
            <li>
              <ContactCopyButton />
            </li>
            <li>
              <a
                href="/feedback"
                className="text-[14.5px] text-secondary transition-colors hover:text-ink"
              >
                Feedback
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-hairline pt-8 text-[13px] text-ink/40 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} pons. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-ink/70">
              Privacy
            </a>
            <a href="/terms" className="hover:text-ink/70">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

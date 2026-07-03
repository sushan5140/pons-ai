import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "pons — Terms of Service",
  description: "The basics of using pons, in plain language.",
};

const CONTACT_EMAIL = "sushan5140s@gmail.com";

export default function TermsPage() {
  return (
    <main className="relative px-6 pb-24 pt-28 sm:pt-32">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-[13px] font-medium text-secondary underline underline-offset-2 hover:text-ink"
        >
          ← Back to pons
        </Link>

        <h1 className="mt-5 text-balance font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[38px]">
          Terms of Service
        </h1>
        <p className="mt-3 text-[14px] text-secondary">Last updated: July 2026</p>

        <div className="mt-8 space-y-9 text-[15px] leading-relaxed text-ink/80">
          <p>
            These terms are written in plain language because pons is an
            early-stage product, not a large company with a legal
            department. By using pons, you&apos;re agreeing to the basics
            below.
          </p>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              This is an early-stage product
            </h2>
            <p className="mt-3">
              pons is under active development. Features can change, break,
              or be removed without much notice, and you&apos;re using it at
              your own discretion. We do our best to keep things stable and
              your data intact, but we can&apos;t guarantee zero downtime or
              zero bugs at this stage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Acceptable use
            </h2>
            <p className="mt-3">Please don&apos;t use pons to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Upload illegal content, or content you don&apos;t have the right to upload.</li>
              <li>Attempt to abuse, overload, or automate requests against the app beyond normal personal use.</li>
              <li>Try to access another user&apos;s screenshots, entities, or account data.</li>
              <li>Reverse-engineer the service to circumvent usage limits or security measures.</li>
            </ul>
            <p className="mt-3">
              Accounts found doing any of the above may be suspended or
              removed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Plans and usage limits
            </h2>
            <p className="mt-3">
              pons offers a Free plan and a Pro plan, each with its own
              monthly upload limit — the current numbers are always shown on
              the{" "}
              <Link href="/app/upgrade" className="text-ink underline underline-offset-2">
                upgrade page
              </Link>{" "}
              inside the app. We may adjust plan limits or pricing as the
              product matures; if that happens in a way that affects your
              account, we&apos;ll aim to make it clear inside the app rather
              than changing things silently.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Your content
            </h2>
            <p className="mt-3">
              You own whatever you upload to pons. We don&apos;t claim any
              ownership over your screenshots or the data extracted from
              them — we just store and process it to provide the app&apos;s
              features, as described in the{" "}
              <Link href="/privacy" className="text-ink underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              No warranty, limited liability
            </h2>
            <p className="mt-3">
              pons is provided &quot;as is,&quot; without warranties of any
              kind, express or implied. To the fullest extent permitted by
              law, we aren&apos;t liable for any indirect, incidental, or
              consequential damages arising from your use of the app,
              including — but not limited to — data loss, missed reminders,
              or inaccuracies in AI-extracted information. AI analysis can be
              wrong; don&apos;t rely on it as your only record of anything
              important.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Changes to these terms
            </h2>
            <p className="mt-3">
              As with the Privacy Policy, we&apos;ll update the date at the
              top of this page if these terms change in any meaningful way.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Questions
            </h2>
            <p className="mt-3">
              Reach out any time at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "pons — Privacy Policy",
  description: "What pons collects, how it's used, and how to request deletion.",
};

const CONTACT_EMAIL = "sushan5140s@gmail.com";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-[14px] text-secondary">Last updated: July 2026</p>

        <div className="mt-8 space-y-9 text-[15px] leading-relaxed text-ink/80">
          <p>
            pons is an early-stage product built by a small team (right now,
            just one person). This policy is written in plain language on
            purpose — if anything here is unclear, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>{" "}
            and ask.
          </p>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              What we collect
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Your Google account info</strong> — when you
                sign in with Google, we receive your name, email address, and
                profile photo from Google. We use this only to identify your
                account; we don&apos;t post on your behalf or access anything
                else in your Google account.
              </li>
              <li>
                <strong className="text-ink">The screenshots you upload</strong> — the
                image files themselves, stored so the app can show them back
                to you and let you search them later.
              </li>
              <li>
                <strong className="text-ink">AI-extracted metadata</strong> — when you
                upload a screenshot, pons uses Google Gemini to read it and
                extract things like a title, category, any people/places/products
                mentioned, and — if relevant — a suggested calendar event. That
                extracted text and structure is stored alongside the image.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              How we use it
            </h2>
            <p className="mt-3">
              Everything collected is used for one purpose: making pons work for
              you. Specifically, to power search across your own screenshots,
              to link related screenshots together (the entity graph), and to
              suggest calendar events you can choose to add. We don&apos;t use
              your data for advertising, and we don&apos;t build any kind of
              cross-user profile from it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Where it&apos;s stored
            </h2>
            <p className="mt-3">
              Your screenshots are stored in a private storage bucket — not
              publicly accessible, not indexed by search engines, and not
              visible to other users. Only your signed-in account can retrieve
              your own screenshots and data; this is enforced both in the
              app&apos;s server-side code and at the database level.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Who we share it with
            </h2>
            <p className="mt-3">
              We don&apos;t sell your data, and we don&apos;t share it with
              third parties for marketing or advertising purposes. Two outside
              services process data as part of running the app itself:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Supabase</strong> — hosts our database,
                file storage, and authentication.
              </li>
              <li>
                <strong className="text-ink">Google Gemini</strong> — processes each
                screenshot image to extract its text and structure.
              </li>
            </ul>
            <p className="mt-3">
              Both are bound by their own provider-level data-handling terms;
              neither uses your data for anything beyond processing your
              request.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Deleting your data
            </h2>
            <p className="mt-3">
              We don&apos;t yet have a self-service &quot;delete my account&quot;
              button in the app — being honest about where things stand right
              now rather than promising something that isn&apos;t built. If you
              want your account and all associated screenshots/data deleted,
              email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>{" "}
              from the address associated with your account and we&apos;ll
              remove it directly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[19px] font-medium text-ink">
              Changes to this policy
            </h2>
            <p className="mt-3">
              If this policy changes in any meaningful way, we&apos;ll update
              the date at the top of this page. Given the early stage of the
              product, treat this as a living document rather than a fixed
              contract.
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

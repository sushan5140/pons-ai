import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/auth-server";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";

export const metadata: Metadata = {
  title: "pons — Sign in",
  description: "Sign in to pons to upload and search your screenshots.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(next && next.startsWith("/") ? next : "/app");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 pb-24 pt-36 sm:pt-40">
      <div className="glass-surface w-full max-w-sm rounded-[22px] p-8 text-center">
        <h1 className="text-balance font-display text-[26px] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
          Sign in to pons
        </h1>
        <p className="mt-3 text-balance text-[14.5px] leading-relaxed text-secondary">
          Your screenshots, entities, and reminders are private to your
          account.
        </p>

        <div className="mt-7">
          <GoogleSignInButton next={next && next.startsWith("/") ? next : "/app"} />
        </div>

        {error && (
          <p role="alert" className="mt-5 text-[13px] text-ink/60">
            Sign-in didn&apos;t go through. Please try again.
          </p>
        )}
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import AppWorkspace from "@/components/app/app-workspace";

export const metadata: Metadata = {
  title: "pons — Upload a screenshot",
  description: "Upload a screenshot and pons reads, understands, and remembers it.",
};

export default function AppPage() {
  return (
    <main className="relative min-h-screen px-6 pb-24 pt-36 sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-balance font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-[38px]">
            Upload a screenshot
          </h1>
          <p className="mt-3 text-balance text-[15.5px] leading-relaxed text-secondary">
            pons reads it, works out what it is, and pulls out the details
            worth remembering.
          </p>
        </div>

        <AppWorkspace />
      </div>
    </main>
  );
}

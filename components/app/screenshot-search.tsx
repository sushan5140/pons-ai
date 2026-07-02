"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ImageOff, Search } from "lucide-react";
import CalendarAction from "@/components/app/calendar-action";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  snippet: string;
  image_signed_url: string | null;
  is_actionable: boolean;
  action_date: string | null;
  action_title: string | null;
  action_confirmed: boolean;
}

type Status = "idle" | "loading" | "success" | "error";
type Mode = "semantic" | "entity";

export interface ScreenshotSearchHandle {
  search: (text: string) => void;
}

const ScreenshotSearch = forwardRef<ScreenshotSearchHandle>(function ScreenshotSearch(_props, ref) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mode, setMode] = useState<Mode>("semantic");
  const [entityName, setEntityName] = useState<string | null>(null);
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/search-screenshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        setErrorMessage(data?.error ?? "Search failed. Please try again.");
        setStatus("error");
        return;
      }

      setResults(data.results ?? []);
      setMode(data.mode === "entity" ? "entity" : "semantic");
      setEntityName(data.entityName ?? null);
      setIsDatabaseEmpty(Boolean(data.isDatabaseEmpty));
      setHasSearched(true);
      setStatus("success");
    } catch {
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  useImperativeHandle(ref, () => ({
    search: (text: string) => {
      setQuery(text);
      void runSearch(text);
    },
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    void runSearch(query);
  }

  return (
    <div>
      <p className="text-center text-[13px] font-medium uppercase tracking-wide text-ink/40 lg:text-left">
        Search
      </p>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="glass-surface flex items-center gap-2.5 rounded-full px-5 py-3">
          <button
            type="submit"
            aria-label="Search"
            disabled={status === "loading"}
            className="shrink-0 text-ink/40 transition-colors hover:text-ink disabled:cursor-not-allowed"
          >
            <Search className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={'Search your screenshots — try "flight to San Francisco" or "everything from Rahul"'}
            aria-label="Search your screenshots"
            className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink/35 focus:outline-none"
          />
        </div>
      </form>

      <div role="status" aria-live="polite" className="min-h-[1px]">
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-2 text-[13.5px] text-secondary"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-hover" />
            Searching…
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-hairline-strong bg-white/60 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
            <p className="text-[13.5px] leading-relaxed text-ink/75">{errorMessage}</p>
          </motion.div>
        )}

        {status === "success" && hasSearched && isDatabaseEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex flex-col items-center gap-2 rounded-[16px] border border-hairline px-6 py-10 text-center"
          >
            <ImageOff className="h-5 w-5 text-ink/30" strokeWidth={1.75} />
            <p className="text-[13.5px] text-ink/60">
              There&apos;s nothing to search yet.{" "}
              <a href="#upload" className="font-medium text-ink underline underline-offset-2">
                Upload a screenshot
              </a>{" "}
              first.
            </p>
          </motion.div>
        )}

        {status === "success" && hasSearched && !isDatabaseEmpty && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex flex-col items-center gap-2 rounded-[16px] border border-hairline px-6 py-10 text-center"
          >
            <p className="text-[13.5px] text-ink/60">No matching screenshots found.</p>
          </motion.div>
        )}

        {status === "success" && results.length > 0 && (
          <div className="mt-6">
            {mode === "entity" && entityName && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-3 text-[13.5px] font-medium text-ink"
              >
                {entityName} — {results.length}{" "}
                {results.length === 1 ? "screenshot" : "screenshots"}
              </motion.p>
            )}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4"
            >
              {results.map((result) => (
                <li
                  key={result.id}
                  className="glass-surface overflow-hidden rounded-[14px]"
                >
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-canvas/60">
                    {result.image_signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.image_signed_url}
                        alt={result.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-5 w-5 text-ink/20" strokeWidth={1.75} />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[12.5px] font-medium text-ink">{result.title}</p>
                    <span className="mt-1.5 inline-block rounded-full border border-hairline-strong bg-white/50 px-2 py-0.5 text-[10px] font-medium text-secondary">
                      {result.category}
                    </span>
                    {result.snippet && (
                      <p className="mt-2 line-clamp-2 font-mono text-[11px] leading-snug text-secondary">
                        {result.snippet}
                      </p>
                    )}
                    {result.is_actionable && result.action_date && result.action_title && (
                      <CalendarAction
                        id={result.id}
                        actionTitle={result.action_title}
                        actionDate={result.action_date}
                        confirmed={result.action_confirmed}
                        variant="compact"
                      />
                    )}
                  </div>
                </li>
              ))}
            </motion.ul>
          </div>
        )}
      </div>
    </div>
  );
});

export default ScreenshotSearch;

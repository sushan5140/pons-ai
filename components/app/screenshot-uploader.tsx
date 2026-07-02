"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ImageOff, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

interface AnalysisResult {
  id: string;
  title: string;
  category: string;
  extracted_text: string;
  key_details: Record<string, unknown>;
  entities: string[];
}

type Status = "idle" | "processing" | "success" | "error";

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

export default function ScreenshotUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const submit = useCallback(async (file: File) => {
    setStatus("processing");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/process-screenshot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setResult(data as AnalysisResult);
      setStatus("success");
    } catch {
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMessage("Only JPG, PNG, and WEBP images are supported.");
        setStatus("error");
        return;
      }
      if (file.size > MAX_BYTES) {
        setErrorMessage("That image is too large (max 8MB).");
        setStatus("error");
        return;
      }

      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(file);
      });
      setResult(null);
      setPendingFile(file);
      void submit(file);
    },
    [submit]
  );

  function reset() {
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setPendingFile(null);
    setResult(null);
    setErrorMessage(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
      {/* left — upload / preview */}
      <div>
        {!previewUrl ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "glass-surface flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed px-6 py-16 text-center transition-colors",
              dragActive ? "border-accent-hover bg-accent/10" : "border-hairline-strong"
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent/25 text-ink">
              <UploadCloud className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <p className="text-[15px] font-medium text-ink">
              Drag a screenshot here
            </p>
            <p className="text-[13px] text-secondary">
              or click to choose a file — JPG, PNG, or WEBP, up to 8MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              aria-label="Choose a screenshot to upload"
            />
          </div>
        ) : (
          <div className="glass-surface overflow-hidden rounded-[22px]">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="text-[12.5px] font-medium text-ink/70">Screenshot</span>
              <button
                type="button"
                onClick={reset}
                className="text-[12.5px] text-secondary transition-colors hover:text-ink"
              >
                Choose another
              </button>
            </div>
            <div className="flex max-h-[440px] w-full items-center justify-center bg-canvas/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded screenshot preview"
                className="max-h-[420px] w-auto rounded-[10px] object-contain"
              />
            </div>
          </div>
        )}

        <div role="status" aria-live="polite" className="min-h-[1px]">
          {status === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2 text-[13.5px] text-secondary"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-hover" />
              Reading your screenshot…
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
              <div>
                <p className="text-[13.5px] leading-relaxed text-ink/75">{errorMessage}</p>
                {pendingFile && (
                  <button
                    type="button"
                    onClick={() => submit(pendingFile)}
                    className="mt-2 text-[13px] font-medium text-ink underline underline-offset-2"
                  >
                    Try again
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* right — result */}
      <div>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-surface rounded-[22px] p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[18px] font-medium text-ink">{result.title}</h2>
                <span className="shrink-0 rounded-full border border-hairline-strong bg-white/50 px-3 py-1 text-[12px] font-medium text-secondary">
                  {result.category}
                </span>
              </div>

              {result.entities.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {result.entities.map((entity) => (
                    <li
                      key={entity}
                      className="rounded-full border border-hairline bg-white/50 px-3 py-1 text-[12.5px] text-ink/65"
                    >
                      {entity}
                    </li>
                  ))}
                </ul>
              )}

              {Object.keys(result.key_details).length > 0 && (
                <div className="mt-5 rounded-[14px] border border-hairline">
                  {Object.entries(result.key_details).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3 last:border-b-0"
                    >
                      <span className="font-mono text-[11.5px] uppercase tracking-wide text-secondary">
                        {formatKey(key)}
                      </span>
                      <span className="truncate font-mono text-[13px] text-ink">
                        {formatValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {result.extracted_text && (
                <div className="mt-5">
                  <p className="text-[11.5px] uppercase tracking-wide text-secondary">
                    Extracted text
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-[10px] border border-hairline bg-canvas/50 px-3.5 py-3">
                    <p className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-ink/75">
                      {result.extracted_text}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-[22px] border border-hairline px-6 py-16 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-canvas text-ink/30">
                <ImageOff className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="text-[13.5px] text-ink/45">
                Results will appear here once a screenshot is processed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

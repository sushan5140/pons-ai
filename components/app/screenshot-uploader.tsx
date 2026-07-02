"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import CalendarAction from "@/components/app/calendar-action";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_ITEMS = 3;

interface AnalysisEntity {
  name: string;
  type: string;
}

interface AnalysisResult {
  id: string;
  title: string;
  category: string;
  extracted_text: string;
  key_details: Record<string, unknown>;
  entities: AnalysisEntity[];
  is_actionable: boolean;
  action_date: string | null;
  action_title: string | null;
  action_confirmed: boolean;
}

interface UploadItem {
  clientId: string;
  file: File;
  previewUrl: string;
  status: "processing" | "success" | "error";
  errorMessage: string | null;
  result: AnalysisResult | null;
  expanded: boolean;
}

function formatKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function makeClientId(): string {
  return Math.random().toString(36).slice(2);
}

export default function ScreenshotUploader({
  onUploadComplete,
}: {
  onUploadComplete?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const updateItem = useCallback((clientId: string, patch: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.clientId === clientId ? { ...item, ...patch } : item))
    );
  }, []);

  const submit = useCallback(
    async (clientId: string, file: File) => {
      updateItem(clientId, { status: "processing", errorMessage: null });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/process-screenshot", {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data) {
          updateItem(clientId, {
            status: "error",
            errorMessage: data?.error ?? "Something went wrong. Please try again.",
          });
          return;
        }

        updateItem(clientId, { status: "success", result: data as AnalysisResult });
        onUploadComplete?.();
      } catch {
        updateItem(clientId, {
          status: "error",
          errorMessage: "Couldn't reach the server. Check your connection and try again.",
        });
      }
    },
    [onUploadComplete, updateItem]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const slotsLeft = MAX_ITEMS - items.length;
      if (slotsLeft <= 0) {
        setNotice(`You can have up to ${MAX_ITEMS} screenshots at a time — remove one to add another.`);
        return;
      }

      const valid: File[] = [];
      let skipped = 0;

      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
          skipped += 1;
          continue;
        }
        valid.push(file);
      }

      const accepted = valid.slice(0, slotsLeft);
      const overflow = valid.length - accepted.length;

      const noticeParts: string[] = [];
      if (skipped > 0) {
        noticeParts.push(
          `${skipped} file${skipped === 1 ? "" : "s"} skipped (JPG, PNG, or WEBP up to 8MB only)`
        );
      }
      if (overflow > 0) {
        noticeParts.push(`${overflow} more skipped — up to ${MAX_ITEMS} screenshots at a time`);
      }
      setNotice(noticeParts.length > 0 ? noticeParts.join("; ") : null);

      const newItems: UploadItem[] = accepted.map((file) => ({
        clientId: makeClientId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "processing",
        errorMessage: null,
        result: null,
        expanded: false,
      }));

      if (newItems.length === 0) return;

      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => void submit(item.clientId, item.file));
    },
    [items.length, submit]
  );

  function removeItem(clientId: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.clientId === clientId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.clientId !== clientId);
    });
    setNotice(null);
  }

  function toggleExpanded(clientId: string) {
    setItems((prev) =>
      prev.map((item) => (item.clientId === clientId ? { ...item, expanded: !item.expanded } : item))
    );
  }

  const atCapacity = items.length >= MAX_ITEMS;

  return (
    <div>
      {!atCapacity ? (
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
            "glass-surface flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed px-6 text-center transition-colors",
            items.length === 0 ? "min-h-[220px] py-16" : "min-h-[140px] py-8",
            dragActive ? "border-accent-hover bg-accent/10" : "border-hairline-strong"
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent/25 text-ink">
            <UploadCloud className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <p className="text-[15px] font-medium text-ink">
            {items.length === 0 ? "Drag a screenshot here" : "Add another screenshot"}
          </p>
          <p className="text-[13px] text-secondary">
            or click to choose a file — JPG, PNG, or WEBP, up to 8MB ({items.length}/{MAX_ITEMS})
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
            aria-label="Choose screenshots to upload"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-[16px] border border-hairline px-6 py-4 text-center">
          <p className="text-[13.5px] text-ink/60">
            {MAX_ITEMS} of {MAX_ITEMS} screenshots added — remove one to add a different one.
          </p>
        </div>
      )}

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-hairline-strong bg-white/60 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
          <p className="text-[13.5px] leading-relaxed text-ink/75">{notice}</p>
        </motion.div>
      )}

      {items.length > 0 && (
        <div aria-live="polite" className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.clientId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass-surface overflow-hidden rounded-[22px]"
              >
                <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                  <span className="text-[12.5px] font-medium text-ink/70">Screenshot</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.clientId)}
                    aria-label="Remove screenshot"
                    className="text-ink/40 transition-colors hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex h-40 w-full items-center justify-center bg-canvas/60 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt="Uploaded screenshot preview"
                    className="max-h-full w-auto rounded-[8px] object-contain"
                  />
                </div>

                <div className="p-4">
                  {item.status === "processing" && (
                    <div role="status" className="flex items-center gap-2 text-[13.5px] text-secondary">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-hover" />
                      Reading your screenshot…
                    </div>
                  )}

                  {item.status === "error" && (
                    <div role="alert" className="flex items-start gap-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
                      <div>
                        <p className="text-[13px] leading-relaxed text-ink/75">{item.errorMessage}</p>
                        <button
                          type="button"
                          onClick={() => submit(item.clientId, item.file)}
                          className="mt-2 text-[12.5px] font-medium text-ink underline underline-offset-2"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}

                  {item.status === "success" && item.result && (
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-medium text-ink">{item.result.title}</h3>
                        <span className="shrink-0 rounded-full border border-hairline-strong bg-white/50 px-2.5 py-0.5 text-[11px] font-medium text-secondary">
                          {item.result.category}
                        </span>
                      </div>

                      {item.result.is_actionable &&
                        item.result.action_date &&
                        item.result.action_title && (
                          <CalendarAction
                            id={item.result.id}
                            actionTitle={item.result.action_title}
                            actionDate={item.result.action_date}
                            confirmed={item.result.action_confirmed}
                            variant="compact"
                          />
                        )}

                      {item.result.entities.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {item.result.entities.map((entity) => (
                            <li
                              key={entity.name}
                              className="rounded-full border border-hairline bg-white/50 px-2.5 py-0.5 text-[11px] text-ink/65"
                            >
                              {entity.name}
                            </li>
                          ))}
                        </ul>
                      )}

                      {(Object.keys(item.result.key_details).length > 0 ||
                        item.result.extracted_text) && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.clientId)}
                          className="mt-3 flex items-center gap-1 text-[12px] font-medium text-ink/60 hover:text-ink"
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform",
                              item.expanded && "rotate-180"
                            )}
                          />
                          {item.expanded ? "Hide details" : "Show details"}
                        </button>
                      )}

                      <AnimatePresence>
                        {item.expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            {Object.keys(item.result.key_details).length > 0 && (
                              <div className="mt-3 rounded-[10px] border border-hairline">
                                {Object.entries(item.result.key_details).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between gap-3 border-b border-hairline px-3 py-2 last:border-b-0"
                                  >
                                    <span className="font-mono text-[10.5px] uppercase tracking-wide text-secondary">
                                      {formatKey(key)}
                                    </span>
                                    <span className="truncate font-mono text-[12px] text-ink">
                                      {formatValue(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.result.extracted_text && (
                              <div className="mt-3 max-h-32 overflow-y-auto rounded-[10px] border border-hairline bg-canvas/50 px-3 py-2.5">
                                <p className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-ink/75">
                                  {item.result.extracted_text}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {items.length === 0 && (
        <p className="mt-6 text-center text-[13px] text-ink/40">
          Upload up to {MAX_ITEMS} screenshots — search works best once there are a few to connect.
        </p>
      )}
    </div>
  );
}

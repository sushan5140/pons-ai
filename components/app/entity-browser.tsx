"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

interface Entity {
  id: string;
  name: string;
  type: string;
  count: number;
}

type Status = "loading" | "success" | "error";

export default function EntityBrowser({
  refreshKey,
  onSelectEntity,
}: {
  refreshKey: number;
  onSelectEntity: (name: string) => void;
}) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const response = await fetch("/api/entities");
        const data = await response.json().catch(() => null);
        if (cancelled) return;

        if (!response.ok || !data) {
          setStatus("error");
          return;
        }

        setEntities(data.entities ?? []);
        setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (status === "loading" && entities.length === 0) return null;
  if (status === "error") return null;
  if (status === "success" && entities.length === 0) return null;

  return (
    <div>
      <p className="flex items-center justify-center gap-1.5 text-center text-[13px] font-medium uppercase tracking-wide text-ink/40 lg:justify-start lg:text-left">
        <Network className="h-3.5 w-3.5" strokeWidth={2} />
        Entities
      </p>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
      >
        {entities.map((entity) => (
          <li key={entity.id}>
            <button
              type="button"
              onClick={() => onSelectEntity(entity.name)}
              className="flex items-center gap-1.5 rounded-full border border-hairline-strong bg-white/50 px-3.5 py-1.5 text-[13px] text-ink/75 transition-colors hover:border-accent-hover hover:text-ink"
            >
              {entity.name}
              <span className="rounded-full bg-canvas px-1.5 py-0.5 font-mono text-[10.5px] text-secondary">
                {entity.count}
              </span>
            </button>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

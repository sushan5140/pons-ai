"use client";

import { useCallback, useState } from "react";

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "event";
}

export function useCalendarAction() {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const confirmAction = useCallback(async (id: string, title: string): Promise<boolean> => {
    setPendingId(id);
    try {
      const response = await fetch("/api/confirm-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) return false;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(title)}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    } finally {
      setPendingId(null);
    }
  }, []);

  return { confirmAction, pendingId };
}

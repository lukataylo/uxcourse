"use client";

import { useEffect } from "react";

interface Props {
  generationId: string;
}

/**
 * Pings /api/generations/[id]/track-download on `beforeprint`. We can't modify
 * the existing print button (owned by another agent), so we hook the global
 * print event instead. `keepalive` lets the request survive the print dialog
 * stealing the page's attention.
 */
export function PrintTracker({ generationId }: Props) {
  useEffect(() => {
    const onBeforePrint = () => {
      try {
        fetch(`/api/generations/${generationId}/track-download`, {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "print" }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    };
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, [generationId]);
  return null;
}

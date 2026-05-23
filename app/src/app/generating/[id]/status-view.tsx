"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GenerationStatus } from "@/lib/types";

interface Props {
  id: string;
  initialStatus: GenerationStatus;
  initialProgress: number;
  initialMessage?: string;
}

interface StatusResponse {
  status: GenerationStatus;
  progress: number;
  statusMessage?: string;
  error?: string;
  courseId?: string;
}

export function GenerationStatusView({
  id,
  initialStatus,
  initialProgress,
  initialMessage,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<GenerationStatus>(initialStatus);
  const [progress, setProgress] = useState<number>(initialProgress);
  const [message, setMessage] = useState<string | undefined>(initialMessage);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (status === "ready" || status === "failed") return;
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(`/api/generations/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as StatusResponse;
        if (cancelled) return;
        setStatus(data.status);
        setProgress(data.progress);
        setMessage(data.statusMessage);
        setError(data.error);
        if (data.status === "ready") {
          router.push(`/course/${id}`);
        }
      } catch {
        // swallow — try again next tick
      }
    }

    const t = setInterval(tick, 1500);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [id, status, router]);

  const pct = Math.round(progress * 100);

  return (
    <div className="mt-12">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm text-muted-foreground">
        <span>{message ?? "Working…"}</span>
        <span>{pct}%</span>
      </div>

      {status === "failed" ? (
        <div className="mt-8 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <div className="font-medium text-destructive">Generation failed</div>
          <div className="mt-1 text-muted-foreground">{error ?? "Unknown error"}</div>
        </div>
      ) : null}

      {status === "ready" ? (
        <div className="mt-8 text-sm text-muted-foreground">
          Done. Taking you to your course…
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendCourseEmail } from "./email-actions";

interface Props {
  generationId: string;
  /** Display-only hint about who the email will go to. */
  emailHint?: string;
}

export function ResendEmailButton({ generationId, emailHint }: Props) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="inline-flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await resendCourseEmail(generationId);
            setMsg({ ok: res.ok, text: res.message });
          });
        }}
      >
        <Mail className="h-4 w-4" />
        {pending ? "Sending…" : "Resend email"}
      </Button>
      {msg ? (
        <span
          className={`text-xs ${msg.ok ? "text-emerald-700" : "text-red-700"}`}
          role="status"
        >
          {msg.text}
        </span>
      ) : emailHint ? (
        <span className="text-xs text-muted-foreground">
          to {emailHint}
        </span>
      ) : null}
    </div>
  );
}

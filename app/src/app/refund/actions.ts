"use server";

import { redirect } from "next/navigation";
import {
  getGeneration,
  normalizeEmail,
  updateGeneration,
} from "@/lib/storage";
import { sendRefundConfirmation } from "@/lib/email";

export async function requestRefund(formData: FormData): Promise<void> {
  const emailRaw = String(formData.get("email") ?? "").trim();
  const generationId = String(formData.get("generationId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || undefined;

  if (!emailRaw || !generationId) {
    redirect("/refund?err=missing");
  }

  const gen = await getGeneration(generationId);
  if (!gen) {
    redirect("/refund?err=not_found");
  }

  // Email must match (after normalization). Don't leak which side failed —
  // generic "not found" either way.
  const requestedEmail = normalizeEmail(emailRaw);
  const onFile = normalizeEmail(gen.email);
  if (!onFile || requestedEmail !== onFile) {
    redirect("/refund?err=not_found");
  }

  if (gen.refundStatus === "approved") {
    redirect(`/refund?err=already_refunded&gen=${generationId}`);
  }
  if (gen.refundStatus === "requested") {
    redirect(`/refund?err=already_requested&gen=${generationId}`);
  }

  const now = new Date().toISOString();
  await updateGeneration(generationId, {
    refundStatus: "requested",
    refundRequestedAt: now,
    refundReason: reason,
  });

  // Fire-and-forget — adapter is resilient; we don't block the redirect on it
  // succeeding, but we do await so any synchronous mock-log error surfaces in
  // dev. Errors are swallowed by the adapter (returns ok:false).
  try {
    await sendRefundConfirmation(onFile, generationId);
    await updateGeneration(generationId, { emailLastSentAt: now });
  } catch {
    // Adapter shouldn't throw, but belt-and-braces.
  }

  redirect(`/refund?ok=1&gen=${generationId}`);
}

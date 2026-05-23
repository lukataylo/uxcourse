"use server";

import { revalidatePath } from "next/cache";
import { getGeneration, updateGeneration } from "@/lib/storage";
import { sendRefundApproved } from "@/lib/email";

export async function approveRefund(formData: FormData): Promise<void> {
  const generationId = String(formData.get("generationId") ?? "");
  if (!generationId) return;

  const gen = await getGeneration(generationId);
  if (!gen) return;

  // TODO: when real Stripe is wired, call stripe.refunds.create({
  //   payment_intent: gen.checkoutSessionId-derived intent
  // }) here, and only mark approved on success. In MOCK mode we just flip
  // the status and trust the admin's click.

  const now = new Date().toISOString();
  await updateGeneration(generationId, {
    refundStatus: "approved",
    refundedAt: now,
  });

  if (gen.email) {
    try {
      const res = await sendRefundApproved(gen.email, generationId);
      if (res.ok) {
        await updateGeneration(generationId, { emailLastSentAt: now });
      }
    } catch {
      // Approval is final regardless of email outcome.
    }
  }

  revalidatePath("/admin");
}

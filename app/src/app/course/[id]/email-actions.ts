"use server";

import { getGeneration, updateGeneration } from "@/lib/storage";
import { sendCourseReady } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

export interface ResendResult {
  ok: boolean;
  message: string;
}

/**
 * Re-send the course-ready email for an existing generation.
 * Rate-limited to once per minute per generation (in-memory, MVP).
 */
export async function resendCourseEmail(
  generationId: string,
): Promise<ResendResult> {
  if (!generationId) {
    return { ok: false, message: "Missing generation id." };
  }

  const gen = await getGeneration(generationId);
  if (!gen) {
    return { ok: false, message: "Course not found." };
  }
  if (gen.status !== "ready" || !gen.course) {
    return { ok: false, message: "Course isn't ready yet." };
  }
  if (!gen.email) {
    return {
      ok: false,
      message: "No email on file for this course.",
    };
  }

  const rl = checkRateLimit(`resend:${generationId}`, 60_000);
  if (!rl.allowed) {
    const secs = Math.ceil(rl.retryAfterMs / 1000);
    return {
      ok: false,
      message: `Please wait ${secs}s before resending.`,
    };
  }

  const res = await sendCourseReady(gen.email, gen.course.id, gen.course.title);
  const now = new Date().toISOString();
  await updateGeneration(generationId, {
    emailLastSentAt: now,
    emailDeliveredAt: res.ok ? now : gen.emailDeliveredAt,
  });

  if (!res.ok) {
    return { ok: false, message: res.error ?? "Failed to send." };
  }
  return {
    ok: true,
    message: res.mock
      ? `Logged (mock mode). Check data/email-log.json.`
      : `Sent to ${gen.email}.`,
  };
}

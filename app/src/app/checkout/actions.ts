"use server";

import { redirect } from "next/navigation";
import { updateGeneration, getGeneration } from "@/lib/storage";
import { generateCourse } from "@/lib/courseGenerator";
import { sendCourseReady } from "@/lib/email";

/**
 * Server action that simulates a successful Stripe payment, then kicks off
 * generation in the background. When real Stripe is wired, this will be
 * triggered from the Stripe webhook (checkout.session.completed) instead of
 * a button click on /checkout.
 */
export async function completeMockPayment(formData: FormData): Promise<void> {
  const generationId = String(formData.get("generationId") ?? "");
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!generationId) redirect("/start");

  const gen = await getGeneration(generationId);
  if (!gen) redirect("/start");

  await updateGeneration(generationId, {
    status: "paid",
    progress: 0.05,
    checkoutSessionId: sessionId,
    statusMessage: "Payment received",
  });

  // Fire and forget — we don't await because in MVP mode there is no proper
  // queue. The generating page polls for status. When the pipeline is real,
  // this should enqueue a job (e.g. Inngest, Trigger.dev, or a worker).
  void runGeneration(generationId);

  redirect(`/generating/${generationId}`);
}

async function runGeneration(generationId: string): Promise<void> {
  try {
    const gen = await getGeneration(generationId);
    if (!gen) return;

    await updateGeneration(generationId, {
      status: "generating",
      progress: 0.1,
      statusMessage: "Starting course generation",
    });

    const course = await generateCourse(gen.profile, {
      onProgress: async (progress, message) => {
        await updateGeneration(generationId, {
          progress,
          statusMessage: message,
        });
      },
    });

    await updateGeneration(generationId, {
      status: "ready",
      progress: 1,
      course,
      statusMessage: "Course ready",
    });

    // Best-effort email. Generation success MUST NOT depend on this — the
    // course is ready regardless. We record emailDeliveredAt as the ISO
    // timestamp on success and explicitly null otherwise so the admin view
    // can spot delivery failures.
    if (gen.email) {
      try {
        const res = await sendCourseReady(gen.email, course.id, course.title);
        const now = new Date().toISOString();
        await updateGeneration(generationId, {
          emailDeliveredAt: res.ok ? now : null,
          emailLastSentAt: now,
        });
      } catch (mailErr) {
        // Swallow — generation stays "ready".
        // eslint-disable-next-line no-console
        console.warn("[checkout] course-ready email threw", mailErr);
        await updateGeneration(generationId, { emailDeliveredAt: null });
      }
    } else {
      await updateGeneration(generationId, { emailDeliveredAt: null });
    }
  } catch (err) {
    await updateGeneration(generationId, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
      statusMessage: "Generation failed",
    });
  }
}

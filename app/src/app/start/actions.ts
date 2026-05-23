"use server";

import { redirect } from "next/navigation";
import { saveGeneration } from "@/lib/storage";
import { createCheckoutSession } from "@/lib/stripe";
import { newId } from "@/lib/utils";
import type {
  AiUsage,
  FocusArea,
  Generation,
  LearnerProfile,
  LearningStyle,
  Seniority,
} from "@/lib/types";

function asArray(value: FormDataEntryValue | FormDataEntryValue[] | null): string[] {
  if (value === null) return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export async function submitProfile(formData: FormData): Promise<void> {
  const role = String(formData.get("role") ?? "").trim();
  const seniority = String(formData.get("seniority") ?? "mid") as Seniority;
  const learningStyle = String(formData.get("learningStyle") ?? "mixed") as LearningStyle;
  const timeBudgetHours = Number(formData.get("timeBudgetHours") ?? 4);
  const portfolioUrl = String(formData.get("portfolioUrl") ?? "").trim() || undefined;
  const goal30Days = String(formData.get("goal30Days") ?? "").trim() || undefined;
  const aiUsage = formData.getAll("aiUsage").map(String) as AiUsage[];
  const focusAreas = formData.getAll("focusAreas").map(String) as FocusArea[];

  if (!role) {
    // Server actions can't easily return field errors without extra plumbing.
    // For MVP, fall back to a sensible default rather than 400ing the user.
  }

  const profileId = newId("pf_");
  const profile: LearnerProfile = {
    id: profileId,
    role: role || "designer",
    seniority,
    aiUsage,
    focusAreas,
    timeBudgetHours: Number.isFinite(timeBudgetHours) ? timeBudgetHours : 4,
    learningStyle,
    portfolioUrl,
    goal30Days,
    createdAt: new Date().toISOString(),
  };

  const generationId = newId("gen_");
  const now = new Date().toISOString();
  const gen: Generation = {
    id: generationId,
    profile,
    status: "pending",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
  await saveGeneration(gen);

  const session = await createCheckoutSession({ generationId });
  void asArray; // retained for future multi-value parsing tweaks
  redirect(session.url);
}

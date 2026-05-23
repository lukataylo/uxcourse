/**
 * Shared types between the web app (this file) and the generation engine.
 *
 * IMPORTANT: keep this file in sync with `/home/user/uxcourse/pipeline/types.ts`.
 * The pipeline is built by a parallel agent. When that file lands, treat it as the
 * source of truth and update this file to match (or re-export from a shared package).
 */

export type Seniority = "junior" | "mid" | "senior" | "lead" | "principal";

export type LearningStyle =
  | "reading"
  | "watching"
  | "doing"
  | "discussing"
  | "mixed";

export type AiUsage =
  | "none"
  | "chatgpt-casual"
  | "copilot-daily"
  | "prompt-engineering"
  | "agents"
  | "model-fine-tuning";

/**
 * Theme taxonomy — focus areas the learner can pick from. Mirrors the
 * dataset taxonomy used by the pipeline. Extend in lockstep.
 */
export type FocusArea =
  | "ai-fundamentals-for-designers"
  | "prompting-and-instruction-design"
  | "ai-ux-patterns"
  | "evaluation-and-eval-design"
  | "agentic-interfaces"
  | "multimodal-and-voice"
  | "ethics-and-safety"
  | "research-with-ai"
  | "design-systems-and-ai"
  | "rapid-prototyping-with-ai";

export interface LearnerProfile {
  id: string;
  role: string;
  seniority: Seniority;
  aiUsage: AiUsage[];
  focusAreas: FocusArea[];
  /** weekly hours budget */
  timeBudgetHours: number;
  learningStyle: LearningStyle;
  portfolioUrl?: string;
  goal30Days?: string;
  createdAt: string;
}

export interface Citation {
  /** Stable id from the dataset (e.g. source slug + anchor). */
  id: string;
  /** Human-readable title of the source. */
  title: string;
  /** Author or org if known. */
  author?: string;
  /** Canonical public URL. */
  url: string;
  /** Where in the dataset this came from (article / podcast / talk / etc.). */
  sourceType?:
    | "article"
    | "podcast"
    | "youtube"
    | "conference"
    | "thought-leader"
    | "book"
    | "other";
  /** Optional short quote we're attributing. */
  quote?: string;
}

export interface Exercise {
  id: string;
  prompt: string;
  /** Approx minutes to complete. */
  estimatedMinutes: number;
  /** Optional rubric / what good looks like. */
  rubric?: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** One-line summary used in TOC. */
  summary: string;
  /** Markdown body. */
  body: string;
  estimatedMinutes: number;
  citations: Citation[];
  exercises: Exercise[];
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  /** Markdown intro shown above the TOC. */
  intro: string;
  modules: Module[];
  /** Total estimated time across all lessons. */
  estimatedHours: number;
  /** Profile that produced this course. */
  profileId: string;
  /** Snapshot of all sources used, deduped. */
  bibliography: Citation[];
  createdAt: string;
}

export type GenerationStatus =
  | "pending"
  | "paid"
  | "generating"
  | "ready"
  | "failed";

export interface Generation {
  id: string;
  profile: LearnerProfile;
  status: GenerationStatus;
  /** 0..1 — progress for the status screen. */
  progress: number;
  /** Set when status === "ready". */
  course?: Course;
  /** Set when status === "failed". */
  error?: string;
  /** Stripe checkout session id (real or mocked). */
  checkoutSessionId?: string;
  /** Free-text status line for the progress screen. */
  statusMessage?: string;
  createdAt: string;
  updatedAt: string;
}

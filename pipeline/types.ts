// Types for the UX × AI course generation pipeline.
// These mirror the dataset schema produced by the research agent
// (`/home/user/uxcourse/dataset/dataset.json`) and the Course object
// the web app will render after a user pays.

// ---------- Inputs ----------

export type Seniority = "junior" | "mid" | "senior" | "lead" | "principal";
export type LearningStyle = "reading" | "video" | "hands-on" | "case-study" | "mixed";
export type AIUsage = "none" | "experimenting" | "regular" | "power-user";

export interface LearnerProfile {
  /** Stable id, e.g. the paying user's account id. Used as cache scope. */
  id: string;
  role: string; // "Product Designer", "UX Researcher", "PM", etc.
  seniority: Seniority;
  currentAIUsage: AIUsage;
  /** Free-form focus areas the user wants to deepen, e.g. ["AI ethics", "research ops"]. */
  focusAreas: string[];
  /** Total time the learner is willing to spend, in hours. Drives module sizing. */
  timeBudgetHours: number;
  learningStyle: LearningStyle;
  /** Optional URLs to portfolio/resume — not fetched in v1, but recorded for future personalization. */
  resumeUrl?: string;
  portfolioUrl?: string;
  /** Free-form goal the learner stated at checkout. */
  goal?: string;
}

// ---------- Dataset (source) ----------

export type SourceType =
  | "youtube"
  | "podcast"
  | "article"
  | "conference-talk"
  | "book"
  | "paper"
  | "thought-leader-profile";

export type SourceQuality = "primary" | "secondary" | "opinion" | "marketing";

export interface SourceItem {
  id: string; // stable; used in inline citations like [#sou_123]
  type: SourceType;
  title: string;
  url: string;
  date?: string; // ISO
  authors?: string[];
  publisher?: string;
  themes: string[]; // e.g. ["ai-ethics", "research", "design-systems"]
  quotes?: string[]; // short, citable excerpts the synthesis layer may reuse verbatim
  summary?: string;
  /** Stance tags help us represent diverse viewpoints. */
  stance_tags?: string[]; // e.g. ["skeptic", "techno-optimist", "human-centered"]
  source_quality?: SourceQuality;
}

export type Dataset = SourceItem[];

// ---------- Course structure ----------

export interface Citation {
  sourceId: string; // matches SourceItem.id
  /** Optional excerpt the model leaned on. Pulled from source.quotes when available. */
  quote?: string;
  /** Why this source backs the surrounding claim. One sentence. */
  note?: string;
}

export interface ExerciseOption {
  label: string;
  isCorrect?: boolean; // only set for multiple-choice
}

export interface Exercise {
  id: string;
  type: "reflection" | "applied" | "multiple-choice" | "build";
  prompt: string;
  /** For multiple-choice exercises. */
  options?: ExerciseOption[];
  /** What the learner should produce or notice when done. */
  successCriteria: string;
  estimatedMinutes: number;
}

export interface LessonOutline {
  id: string;
  title: string;
  /** 1-2 sentence summary the outline writer produced. Used as input to the lesson writer. */
  summary: string;
  /** Source ids the retrieval step considers relevant. The lesson writer may use a subset. */
  candidateSourceIds: string[];
  estimatedMinutes: number;
  /**
   * Whether the lesson is a `framing` orientation piece (intros, recaps,
   * narrative bridges) or a `substantive` one. Drives the minimum
   * citation density check: `substantive` needs >= 2 distinct citations,
   * `framing` needs >= 1.
   */
  kind: "framing" | "substantive";
  /**
   * If true, this lesson covers a topic where the dataset is thin
   * (e.g. AI ethics, UX research). The lesson writer is instructed to
   * label it as an "active research area" and avoid invented sources.
   */
  thinCoverage?: boolean;
}

export interface ModuleOutline {
  id: string;
  title: string;
  /** Why this module exists, written for the learner. */
  rationale: string;
  lessons: LessonOutline[];
}

export interface CourseOutline {
  title: string;
  oneLiner: string;
  modules: ModuleOutline[];
  /** Topics the outline writer flagged as thinly covered by the dataset. */
  flaggedGaps: string[];
}

export type LessonQualityWarning =
  | "low_citation_density"
  | "invalid_sources_stripped"
  | "no_valid_sources";

export interface Lesson {
  id: string;
  title: string;
  /** Markdown. MUST contain inline citations like [#sou_123]. */
  body: string;
  citations: Citation[];
  exercises: Exercise[];
  estimatedMinutes: number;
  thinCoverage?: boolean;
  /**
   * Set if the lesson shipped with a citation-quality problem we
   * couldn't fix in the retry loop. The UI uses this to badge the
   * lesson for regeneration. Absent for healthy lessons.
   */
  quality_warning?: LessonQualityWarning;
}

export interface CourseQualityReport {
  lessonsWithWarnings: number;
  totalLessons: number;
  perWarningCounts: Record<LessonQualityWarning, number>;
}

export interface Module {
  id: string;
  title: string;
  rationale: string;
  lessons: Lesson[];
}

export interface Capstone {
  title: string;
  /** Markdown brief the learner can hand to themselves or a team. */
  brief: string;
  rubric: string[];
  estimatedMinutes: number;
}

export interface Course {
  /** Stable id tied to the LearnerProfile.id + generation timestamp. */
  id: string;
  generatedAt: string; // ISO
  profileId: string;
  title: string;
  oneLiner: string;
  modules: Module[];
  capstone: Capstone;
  /** Topics flagged as active research areas, surfaced to the learner. */
  activeResearchAreas: string[];
  /** Every source actually cited anywhere in the course, deduped. */
  sourcesUsed: SourceItem[];
  estimatedTotalMinutes: number;
  /**
   * Citation-quality rollup across all lessons in this course.
   * Lessons with a `quality_warning` flag count here; the UI can show
   * a "regenerate" affordance when this is non-zero.
   */
  qualityReport: CourseQualityReport;
  /** Diagnostic info — model versions, token counts, etc. */
  meta: {
    models: {
      outline: string;
      lesson: string;
      retrieval: string;
    };
    tokenUsage?: {
      input: number;
      output: number;
      cacheRead: number;
      cacheWrite: number;
    };
    mocked: boolean;
  };
}

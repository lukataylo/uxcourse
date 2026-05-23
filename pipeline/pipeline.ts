// UX × AI course generation pipeline.
//
// Top-level entry point: `generateCourse(profile, opts?) => Promise<Course>`.
//
// Composable stages:
//   - retrieveRelevantSources(profile, dataset)
//   - draftOutline(profile, sources)
//   - writeLesson(lessonOutline, sources, profile)
//   - generateExercises(lesson, profile)
//   - assembleCourse(...)
//
// Caching: the dataset payload and the static system prompts are wrapped
// in `cache_control: {type: "ephemeral"}` so repeat generations (same
// dataset, same prompts, different profile) re-use the cached prefix.
// See `shared/prompt-caching.md` — caching is a prefix match, so anything
// that varies per request lives in the user turn, after the cached blocks.

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Capstone,
  Citation,
  Course,
  CourseOutline,
  CourseQualityReport,
  Dataset,
  Exercise,
  LearnerProfile,
  Lesson,
  LessonOutline,
  LessonQualityWarning,
  Module,
  ModuleOutline,
  SourceItem,
} from "./types.js";
import { STUB_DATASET } from "./stub-dataset.js";

// ---------- Model pinning ----------

export const MODELS = {
  retrieval: "claude-haiku-4-5-20251001",
  outline: "claude-sonnet-4-6",
  lesson: "claude-opus-4-7",
  exercises: "claude-sonnet-4-6",
  capstone: "claude-opus-4-7",
} as const;

// ---------- Prompt loading ----------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.join(__dirname, "prompts");

function readPrompt(name: string): string {
  return fs.readFileSync(path.join(PROMPTS_DIR, name), "utf8");
}

const STYLE_GUIDE = readPrompt("style-guide.md");
const SYSTEM_RETRIEVE = readPrompt("system-retrieve.md");
const SYSTEM_OUTLINE = readPrompt("system-outline.md");
const SYSTEM_LESSON = readPrompt("system-lesson.md").replace(
  "{{STYLE_GUIDE}}",
  STYLE_GUIDE,
);
const SYSTEM_EXERCISES = readPrompt("system-exercises.md");
const SYSTEM_CAPSTONE = readPrompt("system-capstone.md");

// ---------- Dataset loading ----------

/**
 * Loads the curated dataset from disk if present, otherwise falls back to
 * an inline stub of representative items so the pipeline is runnable in
 * dev. The real dataset is produced by a parallel research agent and lives
 * at /home/user/uxcourse/dataset/dataset.json.
 */
export function loadDataset(datasetPath?: string): Dataset {
  const candidate =
    datasetPath ??
    path.join(__dirname, "..", "dataset", "dataset.json");
  try {
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Dataset;
    }
  } catch (err) {
    console.warn(
      `[pipeline] Failed to read dataset at ${candidate}, using stub:`,
      err,
    );
  }
  return STUB_DATASET;
}

// ---------- Client + usage tracking ----------

interface Usage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

function emptyUsage(): Usage {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

function addUsage(into: Usage, m: Anthropic.Message): void {
  into.input += m.usage.input_tokens ?? 0;
  into.output += m.usage.output_tokens ?? 0;
  into.cacheRead += m.usage.cache_read_input_tokens ?? 0;
  into.cacheWrite += m.usage.cache_creation_input_tokens ?? 0;
}

export interface GenerateOpts {
  /** Inject an SDK client (mostly for tests). Otherwise reads ANTHROPIC_API_KEY. */
  client?: Anthropic;
  /** Override the dataset, e.g. for tests or a stub. */
  dataset?: Dataset;
  /** If true, skip all API calls and return a deterministic mocked course. */
  mock?: boolean;
}

// ---------- Stage 1: retrieve ----------

interface RetrievalResult {
  ranked: { id: string; score: number; reason: string }[];
  themeDensity: Record<string, "well-covered" | "thin" | "missing">;
}

export async function retrieveRelevantSources(
  profile: LearnerProfile,
  dataset: Dataset,
  client: Anthropic,
  usage: Usage,
): Promise<{ topSources: SourceItem[]; result: RetrievalResult }> {
  // The dataset payload is the big, cacheable prefix. Pass it once as a
  // cached system block so subsequent generations (any profile) read it
  // from cache.
  const response = await client.messages.create({
    model: MODELS.retrieval,
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: SYSTEM_RETRIEVE,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: `## Dataset\n\n${JSON.stringify(dataset)}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `## Learner profile\n\n${JSON.stringify(profile, null, 2)}\n\nScore the dataset for this learner. Return JSON only.`,
      },
    ],
  });

  addUsage(usage, response);

  const result = parseJsonFromMessage<RetrievalResult>(response);
  const byId = new Map(dataset.map((s) => [s.id, s]));
  const topSources = result.ranked
    .map((r) => byId.get(r.id))
    .filter((s): s is SourceItem => Boolean(s))
    .slice(0, 60);

  return { topSources, result };
}

// ---------- Stage 2: outline ----------

export async function draftOutline(
  profile: LearnerProfile,
  topSources: SourceItem[],
  themeDensity: RetrievalResult["themeDensity"],
  client: Anthropic,
  usage: Usage,
): Promise<CourseOutline> {
  const response = await client.messages.create({
    model: MODELS.outline,
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: SYSTEM_OUTLINE,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `## Sources you may assign to lessons\n\n${JSON.stringify(topSources)}`,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text:
              `## Learner profile\n\n${JSON.stringify(profile, null, 2)}\n\n` +
              `## Theme density report\n\n${JSON.stringify(themeDensity, null, 2)}\n\n` +
              `Produce the CourseOutline JSON now.`,
          },
        ],
      },
    ],
  });

  addUsage(usage, response);
  return parseJsonFromMessage<CourseOutline>(response);
}

// ---------- Stage 3: write one lesson ----------

interface LessonResponse {
  body: string;
  citations: Citation[];
}

/** Result of validating a lesson's citations against its candidate sources. */
export interface CitationValidationResult {
  /** True iff there are no invalid ids, no orphans either way, AND density is met. */
  valid: boolean;
  /** Source ids the model used that weren't in the candidate set. */
  invalidIds: string[];
  /** Inline `[#id]` markers in the body with no matching Citation object. */
  orphanedMarkers: string[];
  /** Citation objects whose id never appears as `[#id]` in the body. */
  orphanedCitations: string[];
  /** True iff the lesson hits the minimum distinct-citation count for its kind. */
  densityOk: boolean;
}

/** Minimum distinct legal citations a lesson needs to pass validation. */
function minCitationsFor(kind: LessonOutline["kind"]): number {
  return kind === "framing" ? 1 : 2;
}

/** Extract `[#id]` markers from a body, in order, with duplicates. */
function extractMarkers(body: string): string[] {
  const out: string[] = [];
  const re = /\[#([^\]\s]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) out.push(m[1]);
  return out;
}

/**
 * Validate that a lesson's inline citations and Citation array agree
 * with each other and with the candidate source set.
 *
 * Pure function. Doesn't mutate.
 */
export function validateLessonCitations(
  lesson: Pick<Lesson, "body" | "citations"> & { kind?: LessonOutline["kind"] },
  candidateSources: SourceItem[],
  kind: LessonOutline["kind"] = lesson.kind ?? "substantive",
): CitationValidationResult {
  const allowed = new Set(candidateSources.map((s) => s.id));
  const markerIds = new Set(extractMarkers(lesson.body));
  const citationIds = new Set(lesson.citations.map((c) => c.sourceId));

  const invalidIds = new Set<string>();
  for (const id of markerIds) if (!allowed.has(id)) invalidIds.add(id);
  for (const id of citationIds) if (!allowed.has(id)) invalidIds.add(id);

  const orphanedMarkers: string[] = [];
  for (const id of markerIds) {
    if (allowed.has(id) && !citationIds.has(id)) orphanedMarkers.push(id);
  }
  const orphanedCitations: string[] = [];
  for (const id of citationIds) {
    if (allowed.has(id) && !markerIds.has(id)) orphanedCitations.push(id);
  }

  const distinctLegalCited = [...markerIds].filter(
    (id) => allowed.has(id) && citationIds.has(id),
  ).length;
  const densityOk = distinctLegalCited >= minCitationsFor(kind);

  const valid =
    invalidIds.size === 0 &&
    orphanedMarkers.length === 0 &&
    orphanedCitations.length === 0 &&
    densityOk;

  return {
    valid,
    invalidIds: [...invalidIds],
    orphanedMarkers,
    orphanedCitations,
    densityOk,
  };
}

/** Number of retries on top of the initial call. 2 retries == up to 3 attempts. */
const LESSON_MAX_RETRIES = 2;

async function callLessonModel(
  lessonOutline: LessonOutline,
  candidateSources: SourceItem[],
  profile: LearnerProfile,
  client: Anthropic,
  usage: Usage,
  stricterAddendum: string | null,
): Promise<LessonResponse> {
  // `thinking: {type: "adaptive"}` is the right shape per the current
  // Anthropic API for Opus 4.7. The SDK type defs in 0.40.x predate
  // adaptive thinking, so we cast through `any` rather than ship the
  // deprecated `{type: "enabled", budget_tokens: N}` shape (which Opus
  // 4.7 returns 400 on).
  const userTurn =
    `## Lesson outline\n\n${JSON.stringify(lessonOutline, null, 2)}\n\n` +
    `## Learner profile\n\n${JSON.stringify(profile, null, 2)}\n\n` +
    `## Sources you may cite\n\n${JSON.stringify(candidateSources)}\n\n` +
    (stricterAddendum ? stricterAddendum + "\n\n" : "") +
    `Write the lesson JSON now.`;

  const response = await client.messages.create({
    model: MODELS.lesson,
    max_tokens: 8000,
    thinking: { type: "adaptive" } as any,
    system: [
      {
        type: "text",
        text: SYSTEM_LESSON,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userTurn }],
  });

  addUsage(usage, response);
  return parseJsonFromMessage<LessonResponse>(response);
}

/**
 * Build a stricter retry prompt addendum that lists valid ids verbatim
 * and calls out what failed last time.
 */
function buildRetryAddendum(
  candidateSources: SourceItem[],
  prev: CitationValidationResult,
  kind: LessonOutline["kind"],
  attemptNum: number,
): string {
  const ids = candidateSources.map((s) => s.id);
  const idList = ids.map((id) => `- ${id}`).join("\n");
  const problems: string[] = [];
  if (prev.invalidIds.length > 0) {
    problems.push(
      `You cited source ids that are NOT in the allowed list: ${prev.invalidIds
        .map((i) => `"${i}"`)
        .join(", ")}. These do not exist. Remove them.`,
    );
  }
  if (prev.orphanedMarkers.length > 0) {
    problems.push(
      `These inline [#id] markers have no matching entry in the citations array: ${prev.orphanedMarkers
        .map((i) => `"${i}"`)
        .join(", ")}. Either remove the marker or add the Citation.`,
    );
  }
  if (prev.orphanedCitations.length > 0) {
    problems.push(
      `These Citation entries are never referenced inline in the body: ${prev.orphanedCitations
        .map((i) => `"${i}"`)
        .join(", ")}. Either reference them with [#id] or remove them.`,
    );
  }
  if (!prev.densityOk) {
    problems.push(
      `You did not meet the minimum citation density. This lesson is "${kind}", which requires at least ${minCitationsFor(
        kind,
      )} distinct valid citation(s).`,
    );
  }

  return [
    `## Retry instructions (attempt ${attemptNum + 1})`,
    ``,
    `Your previous attempt failed citation validation:`,
    ``,
    ...problems.map((p) => `- ${p}`),
    ``,
    `The ONLY legal source ids for this lesson are listed below. Any id`,
    `not in this list is invalid — do not use it under any circumstance,`,
    `even if it looks plausible:`,
    ``,
    idList,
    ``,
    `If the legal sources do not support a claim you want to make, drop`,
    `the claim. A shorter, honest lesson is better than a long one with`,
    `bad citations.`,
  ].join("\n");
}

/**
 * Strip invalid inline markers and citation objects from a lesson,
 * recording the resulting quality warning. Used only as a last resort
 * after retries are exhausted.
 */
function fallbackStripAndFlag(
  lessonOutline: LessonOutline,
  parsed: LessonResponse,
  candidateSources: SourceItem[],
  lastResult: CitationValidationResult,
): Lesson {
  const allowed = new Set(candidateSources.map((s) => s.id));

  // Drop inline markers for non-allowed ids.
  const cleanBody = parsed.body.replace(/\[#([^\]\s]+)\]/g, (full, id: string) =>
    allowed.has(id) ? full : "",
  );

  // Drop citations not in the allowed set.
  const cleanCitations = parsed.citations.filter((c) => allowed.has(c.sourceId));

  // Decide the warning. Order matters: "no valid sources" is the worst,
  // then "invalid sources stripped", then "low density".
  let quality_warning: LessonQualityWarning;
  if (cleanCitations.length === 0) {
    quality_warning = "no_valid_sources";
  } else if (lastResult.invalidIds.length > 0) {
    quality_warning = "invalid_sources_stripped";
  } else {
    quality_warning = "low_citation_density";
  }

  return {
    id: lessonOutline.id,
    title: lessonOutline.title,
    body: cleanBody,
    citations: cleanCitations,
    exercises: [],
    estimatedMinutes: lessonOutline.estimatedMinutes,
    thinCoverage: lessonOutline.thinCoverage,
    quality_warning,
  };
}

export async function writeLesson(
  lessonOutline: LessonOutline,
  candidateSources: SourceItem[],
  profile: LearnerProfile,
  client: Anthropic,
  usage: Usage,
): Promise<Lesson> {
  let lastParsed: LessonResponse | null = null;
  let lastResult: CitationValidationResult | null = null;
  let addendum: string | null = null;

  // Initial attempt + up to LESSON_MAX_RETRIES retries.
  for (let attempt = 0; attempt <= LESSON_MAX_RETRIES; attempt++) {
    const parsed = await callLessonModel(
      lessonOutline,
      candidateSources,
      profile,
      client,
      usage,
      addendum,
    );
    const result = validateLessonCitations(
      { body: parsed.body, citations: parsed.citations },
      candidateSources,
      lessonOutline.kind,
    );
    lastParsed = parsed;
    lastResult = result;

    if (result.valid) {
      return {
        id: lessonOutline.id,
        title: lessonOutline.title,
        body: parsed.body,
        citations: parsed.citations,
        exercises: [],
        estimatedMinutes: lessonOutline.estimatedMinutes,
        thinCoverage: lessonOutline.thinCoverage,
      };
    }

    if (attempt < LESSON_MAX_RETRIES) {
      addendum = buildRetryAddendum(
        candidateSources,
        result,
        lessonOutline.kind,
        attempt,
      );
    }
  }

  // Retries exhausted. Surface the failure rather than silently shipping
  // a clean-looking but invented lesson.
  return fallbackStripAndFlag(
    lessonOutline,
    lastParsed!,
    candidateSources,
    lastResult!,
  );
}

// ---------- Stage 4: exercises ----------

export async function generateExercises(
  lesson: Lesson,
  profile: LearnerProfile,
  client: Anthropic,
  usage: Usage,
): Promise<Exercise[]> {
  const response = await client.messages.create({
    model: MODELS.exercises,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: SYSTEM_EXERCISES,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `## Lesson\n\nTitle: ${lesson.title}\nEstimated minutes: ${lesson.estimatedMinutes}\n\n${lesson.body}\n\n## Learner profile\n\n${JSON.stringify(profile, null, 2)}\n\nReturn an array of Exercise objects as JSON.`,
      },
    ],
  });

  addUsage(usage, response);
  return parseJsonFromMessage<Exercise[]>(response);
}

// ---------- Stage 5: capstone ----------

export async function generateCapstone(
  outline: CourseOutline,
  profile: LearnerProfile,
  client: Anthropic,
  usage: Usage,
): Promise<Capstone> {
  const response = await client.messages.create({
    model: MODELS.capstone,
    max_tokens: 4000,
    // See lesson writer for note on the cast.
    thinking: { type: "adaptive" } as any,
    system: [
      {
        type: "text",
        text: SYSTEM_CAPSTONE,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `## Course outline\n\n${JSON.stringify(outline, null, 2)}\n\n## Learner profile\n\n${JSON.stringify(profile, null, 2)}\n\nReturn the Capstone JSON now.`,
      },
    ],
  });

  addUsage(usage, response);
  return parseJsonFromMessage<Capstone>(response);
}

// ---------- Assemble ----------

function emptyQualityReport(totalLessons: number): CourseQualityReport {
  return {
    lessonsWithWarnings: 0,
    totalLessons,
    perWarningCounts: {
      low_citation_density: 0,
      invalid_sources_stripped: 0,
      no_valid_sources: 0,
    },
  };
}

function buildQualityReport(modules: Module[]): CourseQualityReport {
  const all = modules.flatMap((m) => m.lessons);
  const report = emptyQualityReport(all.length);
  for (const lesson of all) {
    if (lesson.quality_warning) {
      report.lessonsWithWarnings += 1;
      report.perWarningCounts[lesson.quality_warning] += 1;
    }
  }
  return report;
}

export function assembleCourse(
  profile: LearnerProfile,
  outline: CourseOutline,
  modules: Module[],
  capstone: Capstone,
  dataset: Dataset,
  usage: Usage,
  mocked: boolean,
): Course {
  const citedIds = new Set<string>();
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      for (const cite of lesson.citations) citedIds.add(cite.sourceId);
    }
  }
  const byId = new Map(dataset.map((s) => [s.id, s]));
  const sourcesUsed = [...citedIds]
    .map((id) => byId.get(id))
    .filter((s): s is SourceItem => Boolean(s));

  const totalMinutes =
    modules.reduce(
      (sum, m) =>
        sum + m.lessons.reduce((s, l) => s + l.estimatedMinutes, 0),
      0,
    ) + capstone.estimatedMinutes;

  return {
    id: `course_${profile.id}_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    profileId: profile.id,
    title: outline.title,
    oneLiner: outline.oneLiner,
    modules,
    capstone,
    activeResearchAreas: outline.flaggedGaps,
    sourcesUsed,
    estimatedTotalMinutes: totalMinutes,
    qualityReport: buildQualityReport(modules),
    meta: {
      models: {
        outline: MODELS.outline,
        lesson: MODELS.lesson,
        retrieval: MODELS.retrieval,
      },
      tokenUsage: usage,
      mocked,
    },
  };
}

// ---------- Top-level orchestrator ----------

/**
 * generateCourse — the engine the web app calls after a $100 purchase.
 *
 * Type signature:
 *   (profile: LearnerProfile, opts?: GenerateOpts) => Promise<Course>
 */
export async function generateCourse(
  profile: LearnerProfile,
  opts: GenerateOpts = {},
): Promise<Course> {
  const dataset = opts.dataset ?? loadDataset();

  if (opts.mock || (!opts.client && !process.env.ANTHROPIC_API_KEY)) {
    return mockGenerateCourse(profile, dataset);
  }

  const client = opts.client ?? new Anthropic();
  const usage = emptyUsage();

  // Stage 1: retrieve.
  const { topSources, result: retrieval } = await retrieveRelevantSources(
    profile,
    dataset,
    client,
    usage,
  );

  // Stage 2: outline.
  const outline = await draftOutline(
    profile,
    topSources,
    retrieval.themeDensity,
    client,
    usage,
  );

  // Stage 3 + 4: write each lesson, then exercises (parallelize per-lesson).
  const sourceById = new Map(dataset.map((s) => [s.id, s]));
  const modules: Module[] = await Promise.all(
    outline.modules.map(async (modOutline: ModuleOutline): Promise<Module> => {
      const lessons = await Promise.all(
        modOutline.lessons.map(async (lo) => {
          const candidates = lo.candidateSourceIds
            .map((id) => sourceById.get(id))
            .filter((s): s is SourceItem => Boolean(s));
          const lesson = await writeLesson(lo, candidates, profile, client, usage);
          lesson.exercises = await generateExercises(lesson, profile, client, usage);
          return lesson;
        }),
      );
      return {
        id: modOutline.id,
        title: modOutline.title,
        rationale: modOutline.rationale,
        lessons,
      };
    }),
  );

  // Stage 5: capstone.
  const capstone = await generateCapstone(outline, profile, client, usage);

  return assembleCourse(profile, outline, modules, capstone, dataset, usage, false);
}

// ---------- JSON parsing helper ----------

function parseJsonFromMessage<T>(message: Anthropic.Message): T {
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  // Some models still wrap JSON in a fence; tolerate it.
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(stripped) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse JSON from model response. First 200 chars: ${stripped.slice(0, 200)}\nError: ${err}`,
    );
  }
}

// ---------- Mock pipeline (no API key) ----------

function mockGenerateCourse(profile: LearnerProfile, dataset: Dataset): Course {
  const src0 = dataset[0]?.id ?? "sou_001";
  const src1 = dataset[1]?.id ?? "sou_002";

  // Happy-path lesson: well-formed, valid citations.
  const happyLesson: Lesson = {
    id: "les_intro",
    title: `Where AI fits in ${profile.role} work today`,
    body:
      `## A working definition\n\n` +
      `Most teams are still figuring out where AI helps and where it gets ` +
      `in the way [#${src0}]. You'll map the parts of your week most ` +
      `exposed to AI tooling.\n\n` +
      `## What "AI in UX" actually means\n\n` +
      `It's not one thing. It's prompts in your design tool, transcripts of ` +
      `interviews, synthesis support during a research round, and the ` +
      `ethics conversation that follows any of those [#${src1}].\n`,
    citations: [
      {
        sourceId: src0,
        note: "Surveys of where AI shows up in UX practice in 2024–25.",
      },
      {
        sourceId: src1,
        note: "Frame for the four surfaces of AI in UX.",
      },
    ],
    exercises: [
      {
        id: "ex_intro_1",
        type: "reflection",
        prompt:
          "List the three parts of your job in the last week where you considered using an AI tool and didn't. Why didn't you?",
        successCriteria:
          "Three concrete examples named, with one sentence each on what stopped you.",
        estimatedMinutes: 10,
      },
    ],
    estimatedMinutes: 20,
  };

  // Warning-path lesson: a thinly-cited substantive lesson that would
  // have flunked density. We surface the warning rather than strip it
  // silently — this is what the type flow looks like in production
  // when retries are exhausted.
  const warningLesson: Lesson = {
    id: "les_ethics_thin",
    title: "AI ethics for your team (active research area)",
    body:
      `## Why this is hard\n\n` +
      `The field hasn't settled on what "responsible" looks like for AI ` +
      `in product work [#${src0}]. Treat this lesson as orientation, not ` +
      `gospel.\n\n` +
      `## A starter checklist\n\n` +
      `When you reach for an AI tool in a research or design loop, ask: ` +
      `whose data trained this, who reviews the output, and what would ` +
      `breakage look like if no one caught it?\n`,
    citations: [
      {
        sourceId: src0,
        note: "Best available framing for active-research-area treatment.",
      },
    ],
    exercises: [
      {
        id: "ex_ethics_1",
        type: "reflection",
        prompt:
          "Pick one AI tool you use weekly. Write the answers to the three checklist questions above for that tool.",
        successCriteria:
          "Three short answers, named tool, one risk you hadn't considered.",
        estimatedMinutes: 12,
      },
    ],
    estimatedMinutes: 18,
    thinCoverage: true,
    quality_warning: "low_citation_density",
  };

  const lessons: Lesson[] = [happyLesson, warningLesson];

  const modules: Module[] = [
    {
      id: "mod_1",
      title: "Foundations",
      rationale: "Get oriented before you change anything.",
      lessons,
    },
  ];

  const capstone: Capstone = {
    title: `Audit one ${profile.role} workflow for AI fit`,
    brief:
      `Pick one workflow you ran in the last month. Document where AI ` +
      `could have shortened it and where introducing AI would have ` +
      `created new risk. Share the audit with one teammate for review.`,
    rubric: [
      "Names the workflow specifically (not 'research', but 'the discovery interview synthesis I did for project X')",
      "Identifies at least two places AI would have helped",
      "Identifies at least one place AI would have introduced risk",
      "Includes one concrete action item",
    ],
    estimatedMinutes: 90,
  };

  return assembleCourse(
    profile,
    {
      title: "Your UX × AI Course (mocked)",
      oneLiner: "A small, runnable course generated without calling the API.",
      modules: [
        {
          id: "mod_1",
          title: "Foundations",
          rationale: "Get oriented before you change anything.",
          lessons: lessons.map((l) => ({
            id: l.id,
            title: l.title,
            summary: "",
            candidateSourceIds: l.citations.map((c) => c.sourceId),
            estimatedMinutes: l.estimatedMinutes,
            kind: l.id === "les_intro"
              ? ("framing" as const)
              : ("substantive" as const),
            thinCoverage: l.thinCoverage,
          })),
        },
      ],
      flaggedGaps: ["AI ethics", "research methods"],
    },
    modules,
    capstone,
    dataset,
    emptyUsage(),
    true,
  );
}

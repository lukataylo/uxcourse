import type { Course, Citation, LearnerProfile, Module } from "./types";

/**
 * Adapter to the course generation engine.
 *
 * TODO: Wire this up to the real pipeline at /home/user/uxcourse/pipeline/.
 * That package (built by a parallel agent) should export something like:
 *
 *   import { generateCourse } from "@uxcourse/pipeline";
 *   const course = await generateCourse(profile, { dataset: "default" });
 *
 * Until then, this returns a deterministic mocked Course after a short delay
 * so the rest of the UX flow (status screen, course reader, downloads) is
 * fully testable end-to-end.
 *
 * Contract: this function MUST return a fully-populated Course conforming to
 * `lib/types.ts`. Any partial / streaming output should be reported via the
 * onProgress callback so the status screen can reflect it.
 */

export interface GenerateOptions {
  onProgress?: (progress: number, message: string) => void | Promise<void>;
}

const MOCK_DELAY_MS = Number(process.env.MOCK_GENERATION_DELAY_MS ?? 6000);

const SAMPLE_CITATIONS: Citation[] = [
  {
    id: "norman-don-design-of-everyday-things",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    url: "https://www.nngroup.com/books/design-everyday-things-revised/",
    sourceType: "book",
  },
  {
    id: "karpathy-software-3",
    title: "Software 3.0",
    author: "Andrej Karpathy",
    url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ",
    sourceType: "youtube",
  },
  {
    id: "lilian-weng-agents",
    title: "LLM Powered Autonomous Agents",
    author: "Lilian Weng",
    url: "https://lilianweng.github.io/posts/2023-06-23-agent/",
    sourceType: "article",
  },
  {
    id: "anthropic-building-effective-agents",
    title: "Building effective agents",
    author: "Anthropic",
    url: "https://www.anthropic.com/research/building-effective-agents",
    sourceType: "article",
  },
];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildMockCourse(profile: LearnerProfile): Course {
  const focusTitles: Record<string, string> = {
    "ai-fundamentals-for-designers": "AI fundamentals for designers",
    "prompting-and-instruction-design": "Prompting and instruction design",
    "ai-ux-patterns": "AI UX patterns",
    "evaluation-and-eval-design": "Evaluation and eval design",
    "agentic-interfaces": "Agentic interfaces",
    "multimodal-and-voice": "Multimodal and voice",
    "ethics-and-safety": "Ethics and safety",
    "research-with-ai": "Research with AI",
    "design-systems-and-ai": "Design systems and AI",
    "rapid-prototyping-with-ai": "Rapid prototyping with AI",
  };

  const picked = profile.focusAreas.length
    ? profile.focusAreas
    : (["ai-fundamentals-for-designers", "ai-ux-patterns"] as const);

  const modules: Module[] = picked.map((area, i) => {
    const title = focusTitles[area] ?? area;
    return {
      id: `m-${i + 1}-${area}`,
      title: `${i + 1}. ${title}`,
      summary: `Core concepts and applied practice in ${title.toLowerCase()} for a ${profile.seniority} ${profile.role}.`,
      lessons: [
        {
          id: `${area}-l1`,
          title: `Foundations of ${title}`,
          summary: `What it is, why it matters, and where it shows up in real product work.`,
          body: `## Why this matters\n\nThis lesson grounds you in the core mental model behind **${title.toLowerCase()}**. We pulled the strongest framings from the dataset and condensed them into a single pass you can read in one sitting.\n\n## Key ideas\n\n- The shape of the problem space\n- Where ${title.toLowerCase()} differs from classic UX work\n- A working vocabulary you can use in critique\n\n## What to try\n\nApply the lens to a screen in your current project and write 200 words about what you'd change.`,
          estimatedMinutes: 25,
          citations: SAMPLE_CITATIONS.slice(0, 2),
          exercises: [
            {
              id: `${area}-l1-e1`,
              prompt: `Audit one flow in your current product through the lens of ${title.toLowerCase()}. List three concrete changes you'd ship this quarter.`,
              estimatedMinutes: 30,
              rubric: "Specific, defensible, sequenced by impact / effort.",
            },
          ],
        },
        {
          id: `${area}-l2`,
          title: `Applied ${title}`,
          summary: `A hands-on exercise plus the patterns that consistently work in production.`,
          body: `## Patterns that ship\n\nFrom the dataset, three patterns recur across teams shipping ${title.toLowerCase()} at scale.\n\n1. **Progressive disclosure of capability** — show the model's range only as the user asks for it.\n2. **Confidence-aware UI** — make uncertainty legible without making the product feel timid.\n3. **Recoverable defaults** — every AI action should be one click from undo.\n\n## What to try\n\nPrototype one of the three patterns in your tool of choice (Figma, v0, Cursor). Time-box to 90 minutes.`,
          estimatedMinutes: 35,
          citations: SAMPLE_CITATIONS.slice(1, 4),
          exercises: [
            {
              id: `${area}-l2-e1`,
              prompt: `Build a recoverable-default for one destructive AI action in your product. Ship it behind a flag.`,
              estimatedMinutes: 60,
            },
          ],
        },
      ],
    };
  });

  const totalMinutes = modules.flatMap((m) => m.lessons).reduce(
    (s, l) => s + l.estimatedMinutes + l.exercises.reduce((x, e) => x + e.estimatedMinutes, 0),
    0,
  );

  const bibliography = Array.from(
    new Map(modules.flatMap((m) => m.lessons).flatMap((l) => l.citations).map((c) => [c.id, c])).values(),
  );

  return {
    id: `course-${profile.id}`,
    title: `A custom UX × AI course for ${profile.role}s`,
    subtitle: `Generated from 200+ public-domain sources, weighted to your goals.`,
    intro: `This course was generated for a **${profile.seniority} ${profile.role}** with **${profile.timeBudgetHours} hours/week** to invest. ${profile.goal30Days ? `Your 30-day goal: _${profile.goal30Days}_` : ""}`,
    modules,
    estimatedHours: Math.round((totalMinutes / 60) * 10) / 10,
    profileId: profile.id,
    bibliography,
    createdAt: new Date().toISOString(),
  };
}

export async function generateCourse(
  profile: LearnerProfile,
  opts: GenerateOptions = {},
): Promise<Course> {
  const mock = (process.env.MOCK ?? "true") !== "false";
  const { onProgress } = opts;

  if (!mock) {
    // TODO: import the real pipeline from /home/user/uxcourse/pipeline/
    // const { generateCourse: realGen } = await import("@uxcourse/pipeline");
    // return realGen(profile, { dataset: "default", onProgress });
    throw new Error(
      "Real course generator not wired yet. Set MOCK=true or implement the pipeline import in lib/courseGenerator.ts.",
    );
  }

  const steps: Array<[number, string]> = [
    [0.1, "Reading your profile"],
    [0.25, "Selecting sources from the dataset"],
    [0.45, "Drafting module outline"],
    [0.65, "Writing lessons"],
    [0.85, "Generating exercises and citations"],
    [0.98, "Polishing and assembling"],
  ];

  const stepDelay = MOCK_DELAY_MS / steps.length;
  for (const [p, msg] of steps) {
    await new Promise((r) => setTimeout(r, stepDelay));
    await onProgress?.(p, msg);
  }

  void slug; // reserved for future id construction
  return buildMockCourse(profile);
}

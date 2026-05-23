# UX × AI Course Generator — Design

## Purpose

Given a paying learner's profile, produce a personalized 5–15 lesson course
on AI in UX, grounded in our curated research dataset (~200 items: YouTube
videos, podcasts, articles, talks, thought-leader stances). The engine runs
once per purchase. No streaming UI, no auth, no DB — that's the web app's
job. We hand back a typed `Course` object.

## Input

A `LearnerProfile` (see `types.ts`):
- role, seniority (junior → principal)
- current AI usage (none / experimenting / regular / power-user)
- focus areas (free-form, e.g. "AI ethics", "research ops")
- time budget in hours (drives module sizing)
- learning style (reading / video / hands-on / case-study / mixed)
- optional resume/portfolio URLs (recorded, not fetched in v1)
- optional goal string from checkout

## Pipeline

Five stages, composable as functions. Each Claude call pins a model.

1. **Retrieve relevant sources** (`claude-haiku-4-5-20251001`).
   The dataset payload is large and reused across every generation, so it
   sits inside a `cache_control` block. Haiku scores items against the
   profile's focus areas, role, and stance preferences and returns a ranked
   list of source ids plus a per-theme gap report. The whole dataset is
   passed in once; we filter in-model rather than in-code so the LLM can
   reason about stance balance and recency.

2. **Draft outline** (`claude-sonnet-4-6`).
   Sonnet receives the ranked sources (full SourceItem objects for the
   top ~60) plus the profile and produces a `CourseOutline`: modules →
   lessons, each with a candidate source list, an estimated time, and a
   `thinCoverage` flag when the dataset can't honestly support the topic.
   Outline-first lets us budget time and surface gaps before we spend
   Opus tokens on prose.

3. **Write lessons** (`claude-opus-4-7`, one call per lesson, run in
   parallel). The lesson writer receives the lesson outline, its
   candidate sources (full objects), the profile, and the system prompt
   that mandates inline `[#sou_id]` citations and forbids invented
   sources. The static system prompt + the dataset slice for the lesson
   are both cached. Opus is used here because lesson quality is the
   product.

4. **Generate exercises** (`claude-sonnet-4-6`, one call per lesson,
   batched in parallel with lesson writes when feasible). Each lesson
   gets 1–3 exercises sized to the learner's time budget and style.

5. **Assemble course**. Pure TypeScript: stitch modules, dedupe cited
   sources into `sourcesUsed`, sum estimated minutes, generate a
   capstone via one more Opus call that sees the outline + the
   profile's stated goal.

## Output

A typed `Course` with modules → lessons (markdown bodies + structured
citations + exercises), a capstone brief with rubric, the deduped list
of cited sources, total estimated minutes, and a `meta` block recording
which models were used and token totals.

## Trade-offs

**Outline-first vs lesson-first.** We went outline-first. It costs one
extra round-trip but lets us (a) show the learner a table of contents
quickly, (b) catch coverage gaps before paying Opus to write 12
lessons, and (c) parallelize lesson writes safely because each lesson
already knows its own scope. Lesson-first would be cheaper for very
short courses but loses these properties.

**Citation honesty.** The system prompt for the lesson writer is
explicit: every non-trivial claim needs an inline `[#sou_id]`, and the
model is forbidden from inventing sources. We enforce this in two
layers: the prompt itself includes the style guide; post-generation we
validate that every `[#sou_xxx]` in the body resolves to a SourceItem
id that was passed to that lesson. Citations that don't resolve are
stripped and flagged in the lesson meta (not silently kept). If a
lesson ends up with zero citations after validation, we surface it for
re-generation rather than ship it.

**Thin coverage areas.** The dataset has known gaps (AI ethics,
research methods, skeptic voices). The retrieval step reports per-theme
density; the outline writer is told to either (a) skip a topic, or (b)
mark it `thinCoverage: true` so the lesson writer frames it as an
"active research area" with a small set of pointers rather than
pretending to a synthesis we can't honestly do. These topics surface
to the learner in `course.activeResearchAreas` — a feature, not a
bug. We'd rather be honest about what's contested than fabricate
authority.

## Cost model (rough, per generation)

Assuming ~150K-token dataset, 10 lessons, 800-token lessons.

| Stage             | Model    | Input (cached / new)     | Output | Notes                              |
| ----------------- | -------- | ------------------------ | ------ | ---------------------------------- |
| Retrieve          | Haiku    | ~150K cached + 2K new    | ~3K    | Cache hit after first user         |
| Outline           | Sonnet   | ~40K cached + 3K new     | ~5K    | Top-60 sources only, cached        |
| Lessons (×10)     | Opus     | ~8K cached + 1K new each | ~1.5K  | Per-lesson source slice cached     |
| Exercises (×10)   | Sonnet   | ~1K new each             | ~0.6K  | Lesson body in-line                |
| Capstone          | Opus     | ~3K new                  | ~1K    |                                    |

Cache hits land after the **second** request, so the very first
generation pays full freight on the dataset; everyone after that hits
the 5-minute (or 1-hour, if we choose) cache on the dataset payload.
Within a single user's run, the dataset cache is reused across the
retrieve → outline → lesson stages (different models bust the cache,
but the dataset payload sent to each model is itself cached after the
first send to that model).

**Estimated cost per course:** roughly $1.50–$3 in API spend at the
quoted Opus/Sonnet/Haiku rates (well inside the $100 price). Token
totals land in `course.meta.tokenUsage` so we can true this up
empirically.

## What this is not

No DB, no queue, no retries-with-backoff beyond what the SDK gives us,
no auth, no streaming to the browser. Those belong to the web app that
calls `generateCourse(profile)`. This is the synthesis engine.

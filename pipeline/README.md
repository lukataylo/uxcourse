# UX × AI course generation pipeline

The synthesis engine the web app calls after a user pays for a personalized
UX × AI course. Given a `LearnerProfile`, it returns a typed `Course` object
(modules → lessons → exercises + capstone + cited sources).

This directory is self-contained. It does not touch the existing app at
`/home/user/uxcourse/App.tsx` or the dataset being assembled at
`/home/user/uxcourse/dataset/`.

## Files

- `DESIGN.md` — design doc (pipeline stages, trade-offs, cost model).
- `types.ts` — `LearnerProfile`, `SourceItem`, `CourseOutline`, `Lesson`,
  `Exercise`, `Course`, `Citation`.
- `pipeline.ts` — implementation. Exports `generateCourse(profile, opts?)`
  plus the per-stage functions (`retrieveRelevantSources`, `draftOutline`,
  `writeLesson`, `generateExercises`, `generateCapstone`, `assembleCourse`).
- `stub-dataset.ts` — ~10 representative items used when the real dataset
  isn't present yet.
- `prompts/` — system prompts and style guide (markdown). Tune these
  without changing code.
- `examples/` — two sample `LearnerProfile` JSON files for local testing.
- `cli.ts` — local dev CLI.

## Run it

```sh
# Install deps the pipeline needs (added to package.json without touching existing ones).
npm install

# With an API key: runs the real pipeline.
export ANTHROPIC_API_KEY=sk-ant-...
npx tsx pipeline/cli.ts --profile pipeline/examples/profile-senior-pm.json

# Without an API key: runs a deterministic mock pipeline that still
# exercises the full type flow.
unset ANTHROPIC_API_KEY
npx tsx pipeline/cli.ts --profile pipeline/examples/profile-junior-designer.json
```

The CLI prints the course as JSON to stdout (or `--out <path.json>`) and a
markdown preview to stderr.

## Env vars

| Var | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Only for real generations | If missing, the CLI runs a mock. The web app should treat a missing key as a fatal config error. |

## Connecting to the dataset

The pipeline reads `dataset/dataset.json` lazily via `loadDataset()`. If the
file is missing or empty, it falls back to `stub-dataset.ts` so things stay
runnable while the research agent is still assembling the real dataset.

To point at a different dataset (e.g. a smaller test slice):

```ts
import { generateCourse, loadDataset } from "./pipeline/pipeline.js";

const course = await generateCourse(profile, {
  dataset: loadDataset("/path/to/other/dataset.json"),
});
```

## Connecting to the web app

The web app's post-payment handler should:

1. Build a `LearnerProfile` from the checkout form.
2. `await generateCourse(profile)` (which returns a `Course`).
3. Persist the `Course` JSON for that user and render it.

`generateCourse` is the only function the web app needs from this directory.
Everything else is internal composition.

## Models used

| Stage | Model | Why |
|---|---|---|
| Retrieval | `claude-haiku-4-5-20251001` | Cheap pass over the cached dataset. |
| Outline | `claude-sonnet-4-6` | Structural reasoning over ranked sources. |
| Lesson writing | `claude-opus-4-7` | Quality matters most here. |
| Exercises | `claude-sonnet-4-6` | Structured generation, lower stakes. |
| Capstone | `claude-opus-4-7` | One per course; quality matters. |

Prompt caching wraps the dataset payload and each static system prompt so
the second-and-onward generations get the dataset prefix from cache.

## Limitations / what to harden later

- Citation enforcement is post-hoc (strip unresolved `[#id]`s; drop
  unresolved citation objects). A lesson with zero surviving citations is
  shipped today; we should add a "re-generate this lesson" retry loop.
- No real concurrency limit on `Promise.all` over lessons. For a 15-lesson
  course this is fine; for much larger courses, add a small parallelism
  cap to stay inside per-org rate limits.
- The mock pipeline only exercises one lesson + one module. It's enough
  for type-flow validation, not for UI work.

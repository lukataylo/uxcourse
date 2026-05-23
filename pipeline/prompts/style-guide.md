# Style guide for course content

## Citations (mandatory)

- Every non-trivial claim — fact, statistic, named opinion, quote — MUST
  be followed by an inline citation in the form `[#source_id]`, where
  `source_id` is the `id` field of a SourceItem you were given in this
  request. Example: `Designers report 30% time savings on early-stage
  ideation [#sou_042].`
- You MAY cite multiple sources for one claim: `[#sou_042][#sou_077]`.
- You MUST NOT invent source ids. If you don't have a source for a
  claim, either (a) rephrase the claim as your own framing without
  asserting a fact, or (b) omit the claim. Inventing a citation is a
  hard failure: the lesson will be discarded and regenerated, and if
  the failure repeats, the lesson ships to the learner with a visible
  "quality warning" badge.
- You MUST NOT cite sources you weren't given in this request. The list
  of allowed source ids is enumerated in the user message under
  `## Sources you may cite`. Treat that list as exhaustive — any id not
  in it is invalid, even if it looks like a real id.
- Citation minimums (per lesson):
  - `kind: "substantive"` → at least TWO distinct legal source ids.
  - `kind: "framing"` → at least ONE legal source id.
- Every inline `[#id]` marker must have a matching entry in the
  `citations` array, and every entry in `citations` must appear as an
  inline `[#id]` at least once in the body.
- A shorter, more honest lesson is strictly preferable to a longer one
  with weak or invented citations. If the sources only support 8
  minutes of material, write 8 minutes.
- Quotes longer than ~25 words must come verbatim from a `quotes` field
  in the source you cite. Don't paraphrase a quote and present it as
  one.

## Voice

- Write to the learner directly ("you"). Avoid throat-clearing
  ("In this lesson, we will explore...").
- Concrete examples over abstract framing. If you're talking about
  prompting, show a prompt. If you're talking about workflow change,
  show a before/after.
- Acknowledge disagreement when sources disagree. Don't flatten the
  field into a false consensus.
- One idea per paragraph. Lessons are short.

## Honesty about gaps

- If a lesson is marked `thinCoverage: true`, frame it as an active
  research area. Use phrases like "the field is still figuring out"
  or "there's no settled best practice yet". Point to the few sources
  you do have rather than pretending to a synthesis.
- It's better to say "we don't know" than to invent.

## Format

- Markdown. Use `##` for section headers inside a lesson body, never
  `#` (the lesson title is the H1 in the rendered UI).
- Code blocks for prompts, code, or example artifacts.
- Short paragraphs. No more than ~80 words per paragraph.

## What not to do

- No bullet lists where prose would do.
- No "as an AI" disclaimers.
- No "let's dive in" / "buckle up" energy.
- No emoji.
- No invented statistics. If you don't have the number, don't give one.

# UX × AI Dataset

A normalized, retrieval-friendly corpus of public material on UX and AI: YouTube talks, podcast episodes, articles, conference sessions, and thought-leader stance profiles. The downstream consumer is a Claude-API-based course generator that retrieves items by theme + stance to compose modules.

## Files

| File | Purpose |
|---|---|
| `schema.json` | JSON Schema (draft 2020-12) for a single source item. |
| `themes_taxonomy.json` | Canonical theme tags grouped into 9 buckets, with aliases used during ingest for best-effort tagging. |
| `ingest.ts` | Reads `../research/*.md`, parses each file, normalizes to the schema, deduplicates by canonical URL, assigns theme tags, and writes `dataset.json`. |
| `dataset.json` | The ingest output. Top-level object: `{ generated_at, counts, items[] }`. |

## Item shape (summary)

Every item in `items[]` has:

- `id` — stable slug, prefixed by type (`yt-`, `pod-`, `art-`, `conf-`, `tl-`).
- `type` — one of `youtube | podcast | article | conference_talk | thought_leader_stance`.
- `title`, `url`, optional `secondary_urls[]`.
- `date` + `date_precision` (`day | month | year | approximate`) — dates are normalized but may be year-only or month-only depending on the source.
- `authors[]` — `{ name, role?, org? }`. For podcasts, hosts and guests are both included with appropriate `role`.
- `publisher` — channel / podcast / publication / conference.
- `format` — free-text label (`keynote`, `interview`, `essay`, `panel`, `workshop`, `stance-profile`, etc.).
- `duration_minutes` — present for YouTube items where the source gave a runtime range (averaged).
- `themes[]` — canonical theme tag IDs from `themes_taxonomy.json`. **This is what the course generator should retrieve on.**
- `raw_themes[]` — original free-text theme strings from the source, kept for traceability.
- `quotes[]` — `{ text, attribution? }` extracted from "Notable quote" cells.
- `summary` — 1–3 sentences. For thought leaders this is the full stance paragraph.
- `stance_tags[]` — `optimist | skeptic | pragmatist | craft-first | displacement-worried | labor-advocate | ethics | infrastructure-builder | researcher-of-the-medium | educator`. Mostly populated for thought-leader items; other types start empty and can be hand-curated.
- `source_quality` — `high | medium | low`, editorial substance rating (not popularity). All current items default to `high` since the research files were already curated.
- `verified` — `false` for every item on ingest. Flip to `true` after hand-checking URL/date.
- `raw_excerpt` — the markdown row(s) the item was parsed from.
- `source_file` — which `research/*.md` the item came from.

See `schema.json` for the full draft-2020-12 definition.

## Re-running ingest

From the repo root:

```bash
npx tsx dataset/ingest.ts
```

This rewrites `dataset/dataset.json` in place. It prints a report with counts by type, theme distribution, stance distribution, dedup count, and any parse failures.

The script has no runtime dependencies beyond Node 18+ and `tsx` (fetched via `npx`).

## Adding new sources

1. **Add to an existing `research/*.md` file** if it fits one of the five types. Stick to the file's existing format — the parsers are tuned per-file:
   - `youtube.md` — section headers `### N.N Title`, bullet fields `- **Channel:**`, `- **URL:**`, `- **Upload date:**`, `- **Duration (approx):**`, `- **Themes:**`, `- **Notable quote(s):**`.
   - `podcasts.md`, `articles.md`, `conferences.md` — single markdown table per file. New rows just need to follow the existing header structure.
   - `thought-leaders.md` — `## Name` block with `**Role:**`, `**Stance:**`, `**Tag:**`, `**Sources:**` sub-fields.
2. **Re-run `npx tsx dataset/ingest.ts`** and inspect the report. The script will:
   - Try to auto-tag canonical themes from `themes_taxonomy.json` aliases — extend aliases there if a new theme word doesn't match anything.
   - Dedupe by canonical URL (after stripping fragment, lowercasing host, dropping `www.`, trimming trailing slashes).
   - Mark every new item `verified: false`.
3. **For a brand-new source type** (e.g. a book corpus, an academic-paper set): add a new `type` enum value to `schema.json`, write a new parser function in `ingest.ts`, and call it from `main()`.

## Schema decisions worth flagging

- **Dates are intentionally loose.** Many YouTube and podcast items have only "Mar 2024" or "2024" in the source. `date_precision` captures whether a date is `day | month | year | approximate`. Filtering downstream should respect precision.
- **`themes` vs. `raw_themes` is a deliberate split.** `themes` is canonical and clean (suitable for retrieval queries / filters). `raw_themes` keeps the messy original phrasing for traceability and for re-tagging if the taxonomy evolves.
- **`stance_tags` is mostly populated for `thought_leader_stance` items.** The other four types start empty; future curation passes (or an LLM-tagger) can fill them in from the `summary` and `quotes` fields. The schema's `enum` is fixed so retrieval queries are predictable.
- **`source_quality` defaults to `high`.** The research files were already curated against vendor pitches and beginner listicles; we did not invent a way to downgrade. A reviewer should manually demote items to `medium` / `low` as needed.
- **Dedup is URL-based only.** Items that appear in two files but under different URLs (e.g. a Spotify link in `podcasts.md` and a YouTube mirror in `youtube.md`) will both survive — they are genuinely different artifacts. If you need title-based dedup, add it as a post-pass.
- **Author org extraction is heuristic.** For podcasts and conferences, anything in parentheses after a name is treated as the org. This works well for `Henry Modisett (Perplexity)` but produces noise on multi-line role descriptions. Hand-curate if a downstream feature depends on `authors[].org` being clean.
- **Thought-leader `summary` is the full stance paragraph.** This is intentional — it's the most useful field for the course generator when constructing balanced module narratives.

## Current contents

As of the last ingest run:

- 199 items total
- by type: `article` 65 · `youtube` 44 · `podcast` 32 · `conference_talk` 30 · `thought_leader_stance` 28
- 11 cross-file duplicates merged
- 5 items have no canonical theme tags (general/meta posts — extend taxonomy aliases or hand-tag if needed)
- 0 parse failures

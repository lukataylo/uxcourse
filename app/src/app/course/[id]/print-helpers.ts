/**
 * Print / export helpers for the course reader.
 *
 * Citation numbering is COURSE-WIDE, not per-lesson. Rationale: a printed
 * document with one canonical numbered references section reads more like a
 * book and avoids the awkwardness of "see [3] in lesson 4" cross-references.
 * Each lesson still gets a small per-lesson reference list inline (titles
 * only) so a reader skimming a single section can see what fed it without
 * flipping to the back.
 *
 * The map is built deterministically: we walk modules → lessons → citations
 * in order, assigning numbers on first encounter. The course-level
 * `bibliography` is folded in last for anything cited only by `[#id]` markers
 * but not attached to a specific lesson (rare, but possible from the
 * pipeline).
 */

import type { Course, Citation } from "@/lib/types";

export interface NumberedCitation extends Citation {
  number: number;
}

export interface CitationMap {
  /** Source id -> assigned number (1-indexed). */
  byId: Record<string, number>;
  /** Ordered list for the references section. */
  ordered: NumberedCitation[];
}

export function buildCitationMap(course: Course): CitationMap {
  const byId: Record<string, number> = {};
  const ordered: NumberedCitation[] = [];

  const add = (c: Citation) => {
    if (byId[c.id]) return;
    const n = ordered.length + 1;
    byId[c.id] = n;
    ordered.push({ ...c, number: n });
  };

  for (const m of course.modules) {
    for (const l of m.lessons) {
      for (const c of l.citations) add(c);
    }
  }
  for (const c of course.bibliography) add(c);

  return { byId, ordered };
}

/**
 * Replace inline `[#source_id]` markers with superscript anchors that link to
 * the references section. If a marker references an id we never registered
 * (e.g. the pipeline produced a typo or dropped a source) we leave the raw
 * marker untouched so it's visible in QA rather than silently swallowed.
 *
 * IMPORTANT: this runs on already-rendered HTML, so the `[#id]` syntax must
 * survive `inline()` escaping. Square brackets and `#` are not escaped by
 * `escapeHtml`, so we're safe.
 */
export function injectCitationSuperscripts(html: string, map: CitationMap): string {
  return html.replace(/\[#([a-zA-Z0-9_\-./:]+)\]/g, (raw, id: string) => {
    const n = map.byId[id];
    if (!n) return raw;
    return `<sup class="cite-ref"><a href="#ref-${n}" class="cite-link">${n}</a></sup>`;
  });
}

/** Same substitution, but for the markdown export. Produces `[N]`. */
export function injectCitationNumbersMd(body: string, map: CitationMap): string {
  return body.replace(/\[#([a-zA-Z0-9_\-./:]+)\]/g, (raw, id: string) => {
    const n = map.byId[id];
    if (!n) return raw;
    return `[${n}]`;
  });
}

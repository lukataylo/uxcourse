/**
 * Tiny markdown renderer for the course reader. Intentionally minimal — supports
 * headings, paragraphs, bold/italic, inline code, ordered/unordered lists.
 *
 * We avoid pulling in a full markdown library to keep the bundle small and the
 * build hermetic. Swap for `react-markdown` later if needed.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const sizes = ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-base"];
      out.push(
        `<h${level} class="${sizes[level - 1]} font-semibold tracking-tight mt-8 mb-3">${inline(h[2])}</h${level}>`,
      );
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push(
        `<ul class="my-4 list-disc pl-6 space-y-1.5">${items.map((it) => `<li>${inline(it)}</li>`).join("")}</ul>`,
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      out.push(
        `<ol class="my-4 list-decimal pl-6 space-y-1.5">${items.map((it) => `<li>${inline(it)}</li>`).join("")}</ol>`,
      );
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|[-*]\s|\d+\.\s)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p class="my-4 leading-relaxed text-foreground/90">${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}

/**
 * Markdown export. Mirrors the print output's citation numbering so the
 * downloaded `.md` is self-contained: inline `[#source_id]` markers become
 * `[N]` and a numbered "References" section appears at the end.
 *
 * Numbering is course-wide (modules → lessons → bibliography fold-in), built
 * the same way as `print-helpers.ts#buildCitationMap`. We don't import that
 * module to avoid pulling React/JSX deps into the markdown path; the logic
 * is tiny and the duplication is cheap.
 */
interface MdCitation {
  id: string;
  title: string;
  author?: string;
  url: string;
  sourceType?: string;
}

interface MdLesson {
  title: string;
  summary: string;
  body: string;
  estimatedMinutes: number;
  citations: MdCitation[];
  exercises: Array<{ prompt: string; estimatedMinutes: number; rubric?: string }>;
}

interface MdModule {
  title: string;
  summary: string;
  lessons: MdLesson[];
}

interface MdCourse {
  title: string;
  subtitle: string;
  intro: string;
  modules: MdModule[];
  bibliography: MdCitation[];
}

function buildMdCitationMap(course: MdCourse): {
  byId: Record<string, number>;
  ordered: Array<MdCitation & { number: number }>;
} {
  const byId: Record<string, number> = {};
  const ordered: Array<MdCitation & { number: number }> = [];
  const add = (c: MdCitation) => {
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

function applyMdCitations(body: string, byId: Record<string, number>): string {
  return body.replace(/\[#([a-zA-Z0-9_\-./:]+)\]/g, (raw, id: string) => {
    const n = byId[id];
    return n ? `[${n}]` : raw;
  });
}

export function courseToMarkdown(course: MdCourse): string {
  const { byId, ordered } = buildMdCitationMap(course);
  const sub = (s: string) => applyMdCitations(s, byId);

  const parts: string[] = [];
  parts.push(`# ${course.title}`);
  parts.push(`*${course.subtitle}*`);
  parts.push("");
  parts.push(sub(course.intro));
  parts.push("");
  for (const m of course.modules) {
    parts.push(`## ${m.title}`);
    parts.push(m.summary);
    parts.push("");
    for (const l of m.lessons) {
      parts.push(`### ${l.title}`);
      parts.push(`_${l.summary} — ~${l.estimatedMinutes} min_`);
      parts.push("");
      parts.push(sub(l.body));
      parts.push("");
      if (l.exercises.length) {
        parts.push(`**Exercises**`);
        for (const e of l.exercises) {
          parts.push(`- ${e.prompt} _(${e.estimatedMinutes} min)_${e.rubric ? ` — _${e.rubric}_` : ""}`);
        }
        parts.push("");
      }
      if (l.citations.length) {
        parts.push(`**Sources**`);
        for (const c of l.citations) {
          const n = byId[c.id];
          const prefix = n ? `[${n}] ` : "";
          parts.push(`- ${prefix}[${c.title}${c.author ? ` — ${c.author}` : ""}](${c.url})`);
        }
        parts.push("");
      }
    }
  }

  if (ordered.length) {
    parts.push(`## References`);
    parts.push("");
    for (const c of ordered) {
      const author = c.author ? ` — ${c.author}` : "";
      const stype = c.sourceType ? ` _(${c.sourceType})_` : "";
      parts.push(`${c.number}. *${c.title}*${author}${stype}  `);
      parts.push(`   <${c.url}>`);
    }
  }

  return parts.join("\n");
}

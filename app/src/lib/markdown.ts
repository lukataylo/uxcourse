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

export function courseToMarkdown(course: {
  title: string;
  subtitle: string;
  intro: string;
  modules: Array<{
    title: string;
    summary: string;
    lessons: Array<{
      title: string;
      summary: string;
      body: string;
      estimatedMinutes: number;
      citations: Array<{ title: string; author?: string; url: string }>;
      exercises: Array<{ prompt: string; estimatedMinutes: number; rubric?: string }>;
    }>;
  }>;
  bibliography: Array<{ title: string; author?: string; url: string }>;
}): string {
  const parts: string[] = [];
  parts.push(`# ${course.title}`);
  parts.push(`*${course.subtitle}*`);
  parts.push("");
  parts.push(course.intro);
  parts.push("");
  for (const m of course.modules) {
    parts.push(`## ${m.title}`);
    parts.push(m.summary);
    parts.push("");
    for (const l of m.lessons) {
      parts.push(`### ${l.title}`);
      parts.push(`_${l.summary} — ~${l.estimatedMinutes} min_`);
      parts.push("");
      parts.push(l.body);
      parts.push("");
      if (l.exercises.length) {
        parts.push(`**Exercises**`);
        for (const e of l.exercises) {
          parts.push(`- ${e.prompt} _(${e.estimatedMinutes} min)_${e.rubric ? ` — _${e.rubric}_` : ""}`);
        }
        parts.push("");
      }
      if (l.citations.length) {
        parts.push(`**Citations**`);
        for (const c of l.citations) {
          parts.push(`- [${c.title}${c.author ? ` — ${c.author}` : ""}](${c.url})`);
        }
        parts.push("");
      }
    }
  }
  parts.push(`## Bibliography`);
  for (const c of course.bibliography) {
    parts.push(`- [${c.title}${c.author ? ` — ${c.author}` : ""}](${c.url})`);
  }
  return parts.join("\n");
}

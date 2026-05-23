#!/usr/bin/env tsx
// Local-dev CLI for the course generation pipeline.
//
// Usage:
//   npx tsx pipeline/cli.ts --profile pipeline/examples/profile-senior-pm.json
//   npx tsx pipeline/cli.ts --profile pipeline/examples/profile-junior-designer.json --out course.json
//
// Behavior:
//   - If ANTHROPIC_API_KEY is set, runs the real pipeline against the stub
//     dataset (or whatever's at dataset/dataset.json).
//   - If not set, runs the deterministic mock pipeline so you can still
//     exercise the type flow and see the assembled Course shape.

import * as fs from "node:fs";
import * as path from "node:path";
import { generateCourse } from "./pipeline.js";
import type { Course, LearnerProfile } from "./types.js";

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = "true";
      }
    }
  }
  return out;
}

function renderMarkdown(course: Course): string {
  const lines: string[] = [];
  lines.push(`# ${course.title}`);
  lines.push("");
  lines.push(`> ${course.oneLiner}`);
  lines.push("");
  lines.push(
    `Generated ${course.generatedAt} for profile \`${course.profileId}\`. ` +
      `Total estimated time: ${course.estimatedTotalMinutes} minutes. ` +
      (course.meta.mocked ? "_(mocked — no API key)_" : ""),
  );
  lines.push("");

  if (course.activeResearchAreas.length > 0) {
    lines.push("## Active research areas");
    lines.push("");
    lines.push(
      "Topics where the field has no settled best practice — we point at the work, we don't pretend there's a consensus:",
    );
    lines.push("");
    for (const a of course.activeResearchAreas) lines.push(`- ${a}`);
    lines.push("");
  }

  for (const mod of course.modules) {
    lines.push(`## ${mod.title}`);
    lines.push("");
    lines.push(`_${mod.rationale}_`);
    lines.push("");
    for (const lesson of mod.lessons) {
      lines.push(`### ${lesson.title}  _(${lesson.estimatedMinutes} min)_`);
      if (lesson.thinCoverage) {
        lines.push("");
        lines.push(
          "> **Active research area.** The dataset is thin here — treat this as orientation, not gospel.",
        );
      }
      lines.push("");
      lines.push(lesson.body);
      lines.push("");
      if (lesson.exercises.length > 0) {
        lines.push("**Exercises**");
        lines.push("");
        for (const ex of lesson.exercises) {
          lines.push(`- **${ex.type}** (${ex.estimatedMinutes} min) — ${ex.prompt}`);
          lines.push(`  _Done when:_ ${ex.successCriteria}`);
        }
        lines.push("");
      }
      if (lesson.citations.length > 0) {
        lines.push("**Cited**");
        for (const c of lesson.citations) {
          lines.push(`- \`[#${c.sourceId}]\`${c.note ? ` — ${c.note}` : ""}`);
        }
        lines.push("");
      }
    }
  }

  lines.push("## Capstone");
  lines.push("");
  lines.push(
    `### ${course.capstone.title}  _(${course.capstone.estimatedMinutes} min)_`,
  );
  lines.push("");
  lines.push(course.capstone.brief);
  lines.push("");
  lines.push("**Rubric**");
  for (const r of course.capstone.rubric) lines.push(`- ${r}`);
  lines.push("");

  if (course.sourcesUsed.length > 0) {
    lines.push("## Sources");
    for (const s of course.sourcesUsed) {
      lines.push(`- \`${s.id}\` — [${s.title}](${s.url}) (${s.type})`);
    }
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.profile) {
    console.error("Usage: tsx pipeline/cli.ts --profile <path.json> [--out <path.json>] [--mock]");
    process.exit(1);
  }

  const profilePath = path.resolve(args.profile);
  const profile: LearnerProfile = JSON.parse(fs.readFileSync(profilePath, "utf8"));

  const mocked = args.mock === "true" || !process.env.ANTHROPIC_API_KEY;
  if (mocked) {
    console.error(
      "[cli] No ANTHROPIC_API_KEY (or --mock set). Running deterministic mock pipeline.",
    );
  } else {
    console.error("[cli] ANTHROPIC_API_KEY found — running real pipeline.");
  }

  const course = await generateCourse(profile, { mock: mocked });

  // JSON to stdout (or --out file), markdown preview to stderr so the user
  // sees something even when piping JSON to a file.
  const json = JSON.stringify(course, null, 2);
  if (args.out) {
    fs.writeFileSync(path.resolve(args.out), json);
    console.error(`[cli] Wrote course JSON to ${args.out}`);
  } else {
    process.stdout.write(json + "\n");
  }

  console.error("\n--- Markdown preview ---\n");
  console.error(renderMarkdown(course));
}

main().catch((err) => {
  console.error("[cli] Generation failed:", err);
  process.exit(1);
});

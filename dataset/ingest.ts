/**
 * Ingest the five research/*.md files into a single dataset/dataset.json
 * conforming to dataset/schema.json.
 *
 * Run:  npx tsx dataset/ingest.ts
 *
 * Design notes:
 * - Each markdown file has a different shape, so we have one parser per file.
 * - We deduplicate by canonical URL.
 * - We assign canonical theme tags from themes_taxonomy.json via case-insensitive
 *   substring match on the alias list.
 * - Everything is marked verified=false at ingest time.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const RESEARCH_DIR = resolve(REPO_ROOT, "research");
const OUT_PATH = resolve(__dirname, "dataset.json");
const TAXONOMY_PATH = resolve(__dirname, "themes_taxonomy.json");

// ---------- types ----------

type ItemType =
  | "youtube"
  | "podcast"
  | "article"
  | "conference_talk"
  | "thought_leader_stance";

type StanceTag =
  | "optimist"
  | "skeptic"
  | "pragmatist"
  | "craft-first"
  | "displacement-worried"
  | "labor-advocate"
  | "ethics"
  | "infrastructure-builder"
  | "researcher-of-the-medium"
  | "educator";

interface Author {
  name: string;
  role?: string | null;
  org?: string | null;
}

interface Quote {
  text: string;
  attribution?: string | null;
}

interface Item {
  id: string;
  type: ItemType;
  title: string;
  url: string;
  secondary_urls?: string[];
  date?: string | null;
  date_precision?: "day" | "month" | "year" | "approximate" | null;
  authors?: Author[];
  publisher?: string | null;
  format?: string | null;
  duration_minutes?: number | null;
  themes: string[];
  raw_themes?: string[];
  quotes?: Quote[];
  summary?: string | null;
  stance_tags?: StanceTag[];
  source_quality: "high" | "medium" | "low";
  verified: boolean;
  raw_excerpt?: string | null;
  source_file?: string | null;
}

interface TaxonomyTag {
  id: string;
  label: string;
  aliases: string[];
}

interface Taxonomy {
  buckets: Array<{ id: string; label: string; tags: TaxonomyTag[] }>;
}

// ---------- utils ----------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function canonicalizeUrl(raw: string): string {
  if (!raw) return raw;
  let u = raw.trim();
  // Strip trailing parens artifacts and markdown remainders
  u = u.replace(/[)\].,;]+$/g, "");
  // Strip tracking-ish junk we don't care about
  try {
    const parsed = new URL(u);
    parsed.hash = "";
    // Lowercase host
    parsed.hostname = parsed.hostname.toLowerCase();
    // Drop www. for dedup purposes
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
    // Remove trailing slash on path (but keep root /)
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString();
  } catch {
    return u;
  }
}

function firstUrl(s: string): string | null {
  const m = s.match(/https?:\/\/[^\s)\]]+/);
  return m ? m[0] : null;
}

function allUrls(s: string): string[] {
  const out: string[] = [];
  const re = /https?:\/\/[^\s)\]]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    out.push(m[0].replace(/[)\].,;]+$/g, ""));
  }
  return out;
}

// Map free-text dates ("Jun 2025", "2024-08", "Apr 2025", "2023") to {date, precision}.
function parseDate(input: string | null | undefined): {
  date: string | null;
  precision: Item["date_precision"];
} {
  if (!input) return { date: null, precision: null };
  const s = input.trim();
  if (!s) return { date: null, precision: null };

  // approximate markers
  const approx = /^(~|≈|approx\.?|around)\s*/i.test(s);
  const cleaned = s.replace(/^(~|≈|approx\.?|around)\s*/i, "").trim();

  // YYYY-MM-DD
  let m = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return { date: cleaned, precision: approx ? "approximate" : "day" };

  // YYYY-MM
  m = cleaned.match(/^(\d{4})-(\d{2})$/);
  if (m) return { date: cleaned, precision: approx ? "approximate" : "month" };

  // YYYY only
  m = cleaned.match(/^(\d{4})$/);
  if (m) return { date: cleaned, precision: approx ? "approximate" : "year" };

  // "Mon YYYY" or "Month YYYY"
  const months: Record<string, string> = {
    jan: "01", january: "01",
    feb: "02", february: "02",
    mar: "03", march: "03",
    apr: "04", april: "04",
    may: "05",
    jun: "06", june: "06",
    jul: "07", july: "07",
    aug: "08", august: "08",
    sep: "09", sept: "09", september: "09",
    oct: "10", october: "10",
    nov: "11", november: "11",
    dec: "12", december: "12",
  };
  m = cleaned.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (m) {
    const mo = months[m[1].toLowerCase()];
    if (mo) return { date: `${m[2]}-${mo}`, precision: approx ? "approximate" : "month" };
  }

  // ranges like "2023-2026" or "2024-2025" — collapse to first year, approximate
  m = cleaned.match(/^(\d{4})\s*[–-]\s*(\d{4})$/);
  if (m) return { date: m[1], precision: "approximate" };

  // give up; return raw, mark approximate
  return { date: cleaned, precision: "approximate" };
}

// Strip markdown bold/italics/links to plain text for short fields
function stripMd(s: string): string {
  if (!s) return s;
  return s
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

// Extract quote(s) from a "Notable quote/claim" string. Returns array of {text, attribution}.
function extractQuotes(raw: string): Quote[] {
  if (!raw) return [];
  const text = raw.trim();
  if (!text || text === "—" || text === "-") return [];
  // Try patterns like:  "...text..." — Attribution
  const quotes: Quote[] = [];
  const quoteRe = /"([^"]+)"(?:\s*[—-]\s*([^"]+?))?(?=\s*\/|$|\s*"|\s*\()/g;
  let m: RegExpExecArray | null;
  while ((m = quoteRe.exec(text))) {
    quotes.push({
      text: m[1].trim(),
      attribution: m[2] ? m[2].trim().replace(/[\s.,;]+$/, "") : null,
    });
  }
  if (quotes.length === 0) {
    // Treat the whole line as a paraphrased claim
    quotes.push({ text: text.replace(/^["']|["']$/g, ""), attribution: null });
  }
  return quotes;
}

// ---------- taxonomy / theme tagging ----------

const taxonomy: Taxonomy = JSON.parse(readFileSync(TAXONOMY_PATH, "utf8"));
const taxonomyIndex: Array<{ id: string; needles: string[] }> = [];
for (const bucket of taxonomy.buckets) {
  for (const tag of bucket.tags) {
    const needles = [tag.label.toLowerCase(), ...tag.aliases.map((a) => a.toLowerCase())];
    taxonomyIndex.push({ id: tag.id, needles });
  }
}

function tagThemes(freeTexts: string[]): string[] {
  if (freeTexts.length === 0) return [];
  const haystack = freeTexts.join(" || ").toLowerCase();
  const matched = new Set<string>();
  for (const { id, needles } of taxonomyIndex) {
    for (const n of needles) {
      if (!n) continue;
      // Word-boundary-ish check to avoid silly substring hits.
      if (haystack.includes(n)) {
        matched.add(id);
        break;
      }
    }
  }
  return Array.from(matched);
}

// Split free-text theme blob ("foo; bar; baz / qux") into rough chunks for raw_themes.
function splitThemes(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[;|]| \/ |, (?=[a-z])/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- parsers ----------

const failures: Array<{ source: string; reason: string; excerpt: string }> = [];

function parseYouTube(md: string): Item[] {
  const items: Item[] = [];
  const lines = md.split("\n");

  // Sections start with "### N.N ".
  type Block = { header: string; bodyLines: string[] };
  const blocks: Block[] = [];
  let current: Block | null = null;
  for (const line of lines) {
    if (/^###\s+\d+(\.\d+)+\s+/.test(line)) {
      if (current) blocks.push(current);
      current = { header: line.replace(/^###\s+\d+(\.\d+)+\s+/, "").trim(), bodyLines: [] };
    } else if (current) {
      if (/^##\s+/.test(line) || /^---\s*$/.test(line)) {
        // section break
        if (current) blocks.push(current);
        current = null;
      } else {
        current.bodyLines.push(line);
      }
    }
  }
  if (current) blocks.push(current);

  for (const block of blocks) {
    const title = stripMd(block.header).replace(/\s+$/, "");
    if (!title) continue;
    const body = block.bodyLines.join("\n");

    // bullet extraction: - **Key:** value
    const getField = (key: string): string | null => {
      const re = new RegExp(`^[-*]\\s*\\*\\*${key}[^*]*\\*\\*\\s*:?\\s*(.+)$`, "im");
      const m = body.match(re);
      return m ? m[1].trim() : null;
    };

    const channel = getField("Channel");
    const urlField = getField("URL");
    const dateField = getField("Upload date") || getField("Date");
    const durationField = getField("Duration\\s*\\(approx\\)") || getField("Duration");
    const themesField = getField("Themes");
    const quoteField =
      getField("Notable quotes?") ||
      getField("Notable claim") ||
      getField("Notable quote") ||
      getField("Notable quote \\(framing\\)");

    if (!urlField) {
      failures.push({
        source: "youtube.md",
        reason: "no URL field",
        excerpt: title,
      });
      continue;
    }

    const urls = allUrls(urlField);
    if (urls.length === 0) {
      failures.push({
        source: "youtube.md",
        reason: "URL field had no http(s) link",
        excerpt: `${title} :: ${urlField}`,
      });
      continue;
    }
    const primary = canonicalizeUrl(urls[0]);
    const secondary = urls.slice(1).map(canonicalizeUrl);

    const { date, precision } = parseDate(dateField || null);

    // duration parse: "30-45 min", "~60 min", "<60 sec", "2 hr"
    let duration_minutes: number | null = null;
    if (durationField) {
      const d = durationField.toLowerCase();
      const hr = d.match(/([\d.]+)\s*hr/);
      const minRange = d.match(/([\d.]+)\s*[-–]\s*([\d.]+)\s*min/);
      const single = d.match(/([\d.]+)\s*min/);
      const sec = d.match(/([\d.]+)\s*sec/);
      if (hr) duration_minutes = Math.round(parseFloat(hr[1]) * 60);
      else if (minRange)
        duration_minutes = Math.round(
          (parseFloat(minRange[1]) + parseFloat(minRange[2])) / 2,
        );
      else if (single) duration_minutes = Math.round(parseFloat(single[1]));
      else if (sec) duration_minutes = Math.max(1, Math.round(parseFloat(sec[1]) / 60));
    }

    const rawThemes = themesField ? splitThemes(themesField) : [];
    const themes = tagThemes([title, ...(rawThemes), channel ?? ""]);
    const quotes = quoteField ? extractQuotes(quoteField) : [];

    // Try to detect format from title/header keywords
    let format: string | null = null;
    const t = title.toLowerCase();
    if (t.includes("keynote")) format = "keynote";
    else if (t.includes("panel")) format = "panel";
    else if (t.includes("workshop")) format = "workshop";
    else if (t.includes("interview")) format = "interview";
    else if (t.includes("playlist")) format = "playlist";
    else format = "talk";

    // Authors: heuristic from title after em-dash or "—"
    const authors: Author[] = [];
    const dashSplit = title.split(/\s+[—–-]\s+/);
    if (dashSplit.length >= 2) {
      const last = dashSplit[dashSplit.length - 1];
      // skip if last fragment is too long to be a name list
      if (last.length < 120 && /[A-Z]/.test(last)) {
        for (const n of last.split(/\s*(?:,|&|and|\/)\s*/i)) {
          const name = stripMd(n).replace(/\(.*?\)/g, "").trim();
          if (name && /^[A-Z]/.test(name) && name.length < 60) {
            authors.push({ name });
          }
        }
      }
    }

    const id = `yt-${slugify(title)}`;

    items.push({
      id,
      type: "youtube",
      title,
      url: primary,
      secondary_urls: secondary.length ? secondary : undefined,
      date,
      date_precision: precision,
      authors,
      publisher: channel,
      format,
      duration_minutes,
      themes,
      raw_themes: rawThemes,
      quotes,
      summary: themesField ?? null,
      stance_tags: [],
      source_quality: "high",
      verified: false,
      raw_excerpt: `### ${block.header}\n${body.trim()}`,
      source_file: "research/youtube.md",
    });
  }
  return items;
}

function parseMarkdownTable(
  md: string,
): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = [];
  const lines = md.split("\n");
  let inTable = false;
  let headers: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.startsWith("|")) {
      if (inTable && line.trim() === "") {
        inTable = false;
        headers = [];
      }
      continue;
    }
    const cells = line
      .replace(/^\|/, "")
      .replace(/\|\s*$/, "")
      .split("|")
      .map((c) => c.trim());
    if (!inTable) {
      headers = cells;
      inTable = true;
      continue;
    }
    // separator row
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    if (cells.length !== headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i];
    });
    rows.push(row);
  }
  return rows;
}

function parsePodcasts(md: string): Item[] {
  const rows = parseMarkdownTable(md);
  const items: Item[] = [];
  for (const r of rows) {
    const title = stripMd(r["Episode title"] ?? r["Title"] ?? "");
    const urlRaw = r["URL"] ?? "";
    const url = firstUrl(urlRaw);
    if (!title || !url) {
      failures.push({
        source: "podcasts.md",
        reason: "missing title or URL",
        excerpt: JSON.stringify(r).slice(0, 200),
      });
      continue;
    }
    const podcast = stripMd(r["Podcast"] ?? "");
    const hosts = stripMd(r["Host(s)"] ?? r["Host"] ?? "");
    const guests = stripMd(r["Guest(s)"] ?? r["Guests"] ?? "");
    const dateRaw = stripMd(r["Date"] ?? "");
    const themesRaw = stripMd(r["Key themes"] ?? r["Themes"] ?? "");
    const quoteRaw = stripMd(r["Notable quote / claim"] ?? r["Notable quote"] ?? "");

    const { date, precision } = parseDate(dateRaw);
    const rawThemes = splitThemes(themesRaw);
    const themes = tagThemes([title, ...rawThemes, podcast]);
    const quotes = quoteRaw ? extractQuotes(quoteRaw) : [];

    const authors: Author[] = [];
    for (const g of guests.split(/,(?![^()]*\))/)) {
      const m = g.match(/^\s*([^(]+?)(?:\s*\(([^)]+)\))?\s*$/);
      if (m && m[1].trim()) {
        authors.push({
          name: m[1].trim(),
          role: "guest",
          org: m[2] ? m[2].trim() : null,
        });
      }
    }
    if (hosts) {
      for (const h of hosts.split(/,\s*/)) {
        const name = h.trim();
        if (name) authors.push({ name, role: "host", org: null });
      }
    }

    items.push({
      id: `pod-${slugify(title)}`,
      type: "podcast",
      title,
      url: canonicalizeUrl(url),
      date,
      date_precision: precision,
      authors,
      publisher: podcast || null,
      format: "interview",
      themes,
      raw_themes: rawThemes,
      quotes,
      summary: themesRaw || null,
      stance_tags: [],
      source_quality: "high",
      verified: false,
      raw_excerpt: `| ${Object.values(r).join(" | ")} |`,
      source_file: "research/podcasts.md",
    });
  }
  return items;
}

function parseArticles(md: string): Item[] {
  const rows = parseMarkdownTable(md);
  const items: Item[] = [];
  for (const r of rows) {
    const title = stripMd(r["Title"] ?? "");
    const urlRaw = r["URL"] ?? "";
    const url = firstUrl(urlRaw);
    if (!title || !url) {
      failures.push({
        source: "articles.md",
        reason: "missing title or URL",
        excerpt: JSON.stringify(r).slice(0, 200),
      });
      continue;
    }
    const author = stripMd(r["Author"] ?? "");
    const publication = stripMd(r["Publication"] ?? "");
    const dateRaw = stripMd(r["Date"] ?? "");
    const format = stripMd(r["Format"] ?? "").toLowerCase() || null;
    const themesRaw = stripMd(r["Key themes"] ?? r["Themes"] ?? "");
    const quoteRaw = stripMd(r["Notable quote / thesis"] ?? r["Notable quote"] ?? "");

    const { date, precision } = parseDate(dateRaw);
    const rawThemes = splitThemes(themesRaw);
    const themes = tagThemes([title, ...rawThemes, publication]);
    const quotes = quoteRaw ? extractQuotes(quoteRaw) : [];

    const authors: Author[] = [];
    for (const a of author.split(/\s*(?:&|,|and)\s*/i)) {
      const name = a
        .replace(/\(.*?\)/g, "")
        .trim();
      if (name) {
        const orgMatch = author.match(new RegExp(`${name.split(" ").pop()}.*?\\(([^)]+)\\)`));
        authors.push({
          name,
          role: "author",
          org: orgMatch ? orgMatch[1] : null,
        });
      }
    }

    items.push({
      id: `art-${slugify(title)}`,
      type: "article",
      title,
      url: canonicalizeUrl(url),
      date,
      date_precision: precision,
      authors,
      publisher: publication || null,
      format,
      themes,
      raw_themes: rawThemes,
      quotes,
      summary: themesRaw || null,
      stance_tags: [],
      source_quality: "high",
      verified: false,
      raw_excerpt: `| ${Object.values(r).join(" | ")} |`,
      source_file: "research/articles.md",
    });
  }
  return items;
}

function parseConferences(md: string): Item[] {
  const rows = parseMarkdownTable(md);
  const items: Item[] = [];
  for (const r of rows) {
    const title = stripMd(r["Title"] ?? "");
    const urlRaw = r["URL"] ?? "";
    const urls = allUrls(urlRaw);
    if (!title || urls.length === 0) {
      failures.push({
        source: "conferences.md",
        reason: "missing title or URL",
        excerpt: JSON.stringify(r).slice(0, 200),
      });
      continue;
    }
    const speakers = stripMd(r["Speaker(s) & Role"] ?? r["Speaker(s)"] ?? r["Speakers"] ?? "");
    const conf = stripMd(r["Conference"] ?? "");
    const yearRaw = stripMd(r["Year"] ?? r["Date"] ?? "");
    const themesRaw = stripMd(r["Key Themes"] ?? r["Themes"] ?? "");
    const quoteRaw = stripMd(r["Notable Quote / Thesis"] ?? r["Notable quote"] ?? "");

    const { date, precision } = parseDate(yearRaw);
    const rawThemes = splitThemes(themesRaw);
    const themes = tagThemes([title, ...rawThemes, conf]);
    const quotes = quoteRaw ? extractQuotes(quoteRaw) : [];

    // Speakers: split by commas not inside parens
    const authors: Author[] = [];
    const speakerSegments = speakers.split(/,\s*(?![^()]*\))/);
    for (const seg of speakerSegments) {
      const m = seg.match(/^\s*([^(]+?)(?:\s*\(([^)]+)\))?\s*$/);
      if (m && m[1].trim()) {
        const namePart = m[1].trim();
        const orgInfo = m[2] || null;
        // Crudely split role/org if comma in parens
        let role: string | null = null;
        let org: string | null = orgInfo;
        if (orgInfo && orgInfo.includes(",")) {
          const [r1, ...rest] = orgInfo.split(",").map((s) => s.trim());
          role = r1;
          org = rest.join(", ") || null;
        }
        authors.push({ name: namePart, role, org });
      }
    }

    let format: string | null = "talk";
    const lt = title.toLowerCase();
    if (lt.includes("keynote")) format = "keynote";
    else if (lt.includes("panel")) format = "panel";
    else if (lt.includes("workshop")) format = "workshop";

    items.push({
      id: `conf-${slugify(title)}`,
      type: "conference_talk",
      title,
      url: canonicalizeUrl(urls[0]),
      secondary_urls: urls.slice(1).map(canonicalizeUrl),
      date,
      date_precision: precision,
      authors,
      publisher: conf || null,
      format,
      themes,
      raw_themes: rawThemes,
      quotes,
      summary: themesRaw || null,
      stance_tags: [],
      source_quality: "high",
      verified: false,
      raw_excerpt: `| ${Object.values(r).join(" | ")} |`,
      source_file: "research/conferences.md",
    });
  }
  return items;
}

// Thought leader file uses ## headers, then role/stance/tag/sources subsections.
function parseThoughtLeaders(md: string): Item[] {
  const items: Item[] = [];
  const lines = md.split("\n");
  type Block = { name: string; bodyLines: string[] };
  const blocks: Block[] = [];
  let current: Block | null = null;
  for (const line of lines) {
    if (/^##\s+/.test(line) && !/^##\s+(Notable position|Leaders with|Tag legend)/i.test(line)) {
      // person header
      if (current) blocks.push(current);
      const name = line.replace(/^##\s+/, "").trim();
      // Skip "Tag legend" or top-level non-person sections
      if (name && !/^Tag legend/i.test(name) && !/^Notable/i.test(name) && !/^Leaders with/i.test(name)) {
        current = { name, bodyLines: [] };
      } else {
        current = null;
      }
    } else if (/^#\s+/.test(line)) {
      // top-level heading break (e.g. "# Notable position shifts")
      if (current) blocks.push(current);
      current = null;
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) blocks.push(current);

  for (const block of blocks) {
    const name = stripMd(block.name);
    if (!name) continue;
    const body = block.bodyLines.join("\n");

    const roleMatch = body.match(/\*\*Role:\*\*\s*([^\n]+)/i);
    const stanceMatch = body.match(/\*\*Stance:\*\*\s*([\s\S]*?)(?=\n\*\*[A-Z]|\n\*\(Note|$)/);
    const tagMatch = body.match(/\*\*Tag:\*\*\s*([^\n]+)/i);
    const sourcesMatch = body.match(/\*\*Sources:\*\*([\s\S]*?)(?=\n##|\n\*\(Note|\n---|$)/);

    const role = roleMatch ? stripMd(roleMatch[1]).trim() : null;
    const stance = stanceMatch ? stripMd(stanceMatch[1]).trim() : null;
    const tagRaw = tagMatch ? tagMatch[1].toLowerCase() : "";

    // Map free-text tags to canonical stance_tags
    const stance_tags: StanceTag[] = [];
    const tagMap: Array<[RegExp, StanceTag]> = [
      [/optimist/, "optimist"],
      [/skeptic/, "skeptic"],
      [/pragmatist/, "pragmatist"],
      [/craft/, "craft-first"],
      [/displacement/, "displacement-worried"],
      [/labor[- ]advoc/, "labor-advocate"],
      [/labor/, "labor-advocate"],
      [/ethic/, "ethics"],
      [/infrastructure/, "infrastructure-builder"],
      [/researcher-of-the-medium|researcher of the medium/, "researcher-of-the-medium"],
      [/educator/, "educator"],
    ];
    for (const [re, t] of tagMap) {
      if (re.test(tagRaw) && !stance_tags.includes(t)) stance_tags.push(t);
    }

    // Sources: collect URLs and labels
    const sourceUrls: string[] = [];
    const sourceLabels: string[] = [];
    if (sourcesMatch) {
      const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(sourcesMatch[1]))) {
        sourceLabels.push(m[1]);
        sourceUrls.push(canonicalizeUrl(m[2]));
      }
    }
    const primaryUrl = sourceUrls[0] ?? null;
    const secondary = sourceUrls.slice(1);

    if (!primaryUrl) {
      failures.push({
        source: "thought-leaders.md",
        reason: "no source URLs found",
        excerpt: name,
      });
      continue;
    }

    // org extraction from role (after a comma)
    let org: string | null = null;
    if (role) {
      const orgMatch = role.match(/,\s*([A-Z][^,;.]+)/);
      if (orgMatch) org = orgMatch[1].trim();
    }

    // For thought-leader entries, raw_themes is left empty: the stance is prose,
    // not a delimited theme list. We still tag themes from the full prose.
    const rawThemes: string[] = [];
    const themes = tagThemes([name, role ?? "", stance ?? "", tagRaw, sourceLabels.join(" ")]);

    items.push({
      id: `tl-${slugify(name)}`,
      type: "thought_leader_stance",
      title: `${name} — stance on UX × AI`,
      url: primaryUrl,
      secondary_urls: secondary.length ? secondary : undefined,
      date: null,
      date_precision: null,
      authors: [
        {
          name,
          role: role ?? null,
          org,
        },
      ],
      publisher: null,
      format: "stance-profile",
      themes,
      raw_themes: rawThemes,
      quotes: [],
      summary: stance,
      stance_tags,
      source_quality: "high",
      verified: false,
      raw_excerpt: `## ${block.name}\n${body.trim()}`,
      source_file: "research/thought-leaders.md",
    });
  }
  return items;
}

// ---------- main ----------

function main() {
  const ytMd = readFileSync(resolve(RESEARCH_DIR, "youtube.md"), "utf8");
  const podMd = readFileSync(resolve(RESEARCH_DIR, "podcasts.md"), "utf8");
  const artMd = readFileSync(resolve(RESEARCH_DIR, "articles.md"), "utf8");
  const confMd = readFileSync(resolve(RESEARCH_DIR, "conferences.md"), "utf8");
  const tlMd = readFileSync(resolve(RESEARCH_DIR, "thought-leaders.md"), "utf8");

  const all: Item[] = [
    ...parseYouTube(ytMd),
    ...parsePodcasts(podMd),
    ...parseArticles(artMd),
    ...parseConferences(confMd),
    ...parseThoughtLeaders(tlMd),
  ];

  // Dedup by canonical URL
  const seen = new Map<string, Item>();
  let dupCount = 0;
  for (const it of all) {
    const key = it.url;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, it);
    } else {
      dupCount++;
      // Merge: prefer the richer one (more themes, more authors, longer summary)
      const winner = pickRicher(existing, it);
      const loser = winner === existing ? it : existing;
      mergeInto(winner, loser);
      seen.set(key, winner);
    }
  }

  // Ensure unique ids (suffix collisions)
  const idSeen = new Map<string, number>();
  for (const it of seen.values()) {
    const base = it.id;
    const n = (idSeen.get(base) ?? 0) + 1;
    idSeen.set(base, n);
    if (n > 1) it.id = `${base}-${n}`;
  }

  const items = Array.from(seen.values()).sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.id.localeCompare(b.id);
  });

  // Drop empty-array fields for cleanliness
  for (const it of items) {
    if (it.secondary_urls && it.secondary_urls.length === 0) delete it.secondary_urls;
    if (it.raw_themes && it.raw_themes.length === 0) delete it.raw_themes;
    if (it.quotes && it.quotes.length === 0) delete it.quotes;
    if (it.stance_tags && it.stance_tags.length === 0) delete it.stance_tags;
  }

  // Write dataset
  const out = {
    $schema: "./schema.json",
    generated_at: new Date().toISOString(),
    counts: {
      total: items.length,
      by_type: countBy(items, (i) => i.type),
    },
    items,
  };
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");

  // Report
  const byType = countBy(items, (i) => i.type);
  const themeCount: Record<string, number> = {};
  for (const it of items) {
    for (const t of it.themes) themeCount[t] = (themeCount[t] ?? 0) + 1;
  }
  const themeRanked = Object.entries(themeCount).sort((a, b) => b[1] - a[1]);
  const stanceCount: Record<string, number> = {};
  for (const it of items) {
    for (const s of it.stance_tags ?? []) stanceCount[s] = (stanceCount[s] ?? 0) + 1;
  }

  console.log("\n=== Ingest complete ===");
  console.log(`Wrote ${items.length} items to ${OUT_PATH}`);
  console.log(`Duplicates merged: ${dupCount}`);
  console.log("\nCounts by type:");
  for (const [t, n] of Object.entries(byType)) console.log(`  ${t.padEnd(22)} ${n}`);
  console.log("\nTheme distribution (top 30):");
  for (const [t, n] of themeRanked.slice(0, 30)) console.log(`  ${t.padEnd(28)} ${n}`);
  const untagged = items.filter((i) => i.themes.length === 0).length;
  console.log(`\nItems with no canonical theme tags: ${untagged}`);
  console.log("\nStance tag distribution:");
  for (const [s, n] of Object.entries(stanceCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(28)} ${n}`);
  }
  console.log(`\nParse failures: ${failures.length}`);
  for (const f of failures) console.log(`  [${f.source}] ${f.reason}: ${f.excerpt.slice(0, 100)}`);
  console.log("");
}

function pickRicher(a: Item, b: Item): Item {
  const score = (x: Item) =>
    (x.themes?.length ?? 0) * 3 +
    (x.authors?.length ?? 0) * 2 +
    (x.quotes?.length ?? 0) * 2 +
    (x.summary?.length ?? 0) / 100;
  return score(b) > score(a) ? b : a;
}

function mergeInto(winner: Item, loser: Item) {
  const set = new Set(winner.themes);
  for (const t of loser.themes) set.add(t);
  winner.themes = Array.from(set);

  const sec = new Set([...(winner.secondary_urls ?? []), loser.url, ...(loser.secondary_urls ?? [])]);
  sec.delete(winner.url);
  winner.secondary_urls = Array.from(sec);

  if (!winner.summary && loser.summary) winner.summary = loser.summary;
  if (!winner.date && loser.date) {
    winner.date = loser.date;
    winner.date_precision = loser.date_precision ?? null;
  }
  const stanceSet = new Set([...(winner.stance_tags ?? []), ...(loser.stance_tags ?? [])]);
  winner.stance_tags = Array.from(stanceSet) as StanceTag[];

  // Track that we merged from another source file
  if (winner.source_file !== loser.source_file) {
    winner.source_file = `${winner.source_file}; ${loser.source_file}`;
  }
}

function countBy<T>(arr: T[], fn: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of arr) {
    const k = fn(a);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

main();

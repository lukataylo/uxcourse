import { promises as fs } from "fs";
import path from "path";
import type { Generation } from "./types";

/**
 * File-based JSON store for MVP. Swap for Postgres / Supabase later by
 * implementing the same exported functions against a real DB driver.
 *
 * Layout:
 *   { "generations": Record<string, Generation> }
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "generations.json");

interface Store {
  generations: Record<string, Generation>;
}

const empty: Store = { generations: {} };

async function ensure(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
  }
}

/**
 * Normalize an email for de-duping / lookup:
 *   - trim + lowercase
 *   - for gmail.com / googlemail.com, strip dots in the local part and drop the `+tag`
 * Returns "" for empty input so callers can short-circuit cleanly.
 */
export function normalizeEmail(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return trimmed; // not a real-looking email; return as-is
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  // Drop +tag suffix everywhere (most providers ignore it)
  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
  }
  return `${local}@${domain}`;
}

/**
 * Backfill defaults onto a stored record so callers can rely on the new
 * lifecycle fields existing. We do NOT write these back to disk on read —
 * they get persisted next time the record is updated.
 */
function hydrate(g: Generation): Generation {
  return {
    ...g,
    priorRefund: g.priorRefund ?? false,
    refundStatus: g.refundStatus ?? "none",
    downloadsAt: Array.isArray(g.downloadsAt) ? g.downloadsAt : [],
    emailDeliveredAt:
      g.emailDeliveredAt === undefined ? null : g.emailDeliveredAt,
  };
}

async function readAll(): Promise<Store> {
  await ensure();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as Store;
    // Hydrate every record so consumers don't need to handle undefined.
    const hydrated: Record<string, Generation> = {};
    for (const [id, g] of Object.entries(parsed.generations ?? {})) {
      hydrated[id] = hydrate(g);
    }
    return { generations: hydrated };
  } catch {
    return { ...empty };
  }
}

async function writeAll(store: Store): Promise<void> {
  await ensure();
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function saveGeneration(g: Generation): Promise<Generation> {
  const store = await readAll();
  const hydrated = hydrate({ ...g, updatedAt: new Date().toISOString() });
  store.generations[g.id] = hydrated;
  await writeAll(store);
  return hydrated;
}

export async function getGeneration(id: string): Promise<Generation | null> {
  const store = await readAll();
  return store.generations[id] ?? null;
}

export async function updateGeneration(
  id: string,
  patch: Partial<Generation>,
): Promise<Generation | null> {
  const store = await readAll();
  const current = store.generations[id];
  if (!current) return null;
  const next: Generation = hydrate({
    ...current,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  });
  store.generations[id] = next;
  await writeAll(store);
  return next;
}

export async function listGenerations(): Promise<Generation[]> {
  const store = await readAll();
  return Object.values(store.generations).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/**
 * Lookup prior generations belonging to the same normalized email.
 * Returns most-recent first. Returns [] if email is empty.
 */
export async function findGenerationsByEmail(
  email: string,
): Promise<Generation[]> {
  const norm = normalizeEmail(email);
  if (!norm) return [];
  const all = await listGenerations();
  return all.filter((g) => normalizeEmail(g.email) === norm);
}

/**
 * Append a download timestamp to a generation. No-op if the generation
 * doesn't exist. Returns the updated record (or null).
 */
export async function recordDownload(id: string): Promise<Generation | null> {
  const current = await getGeneration(id);
  if (!current) return null;
  const downloadsAt = [...(current.downloadsAt ?? []), new Date().toISOString()];
  return updateGeneration(id, { downloadsAt });
}

// ---- generic key/value JSON file helper for sibling stores (e.g. email log)

export async function appendJsonLog<T>(
  fileName: string,
  entry: T,
): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, fileName);
  let arr: T[] = [];
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) arr = parsed as T[];
  } catch {
    // file doesn't exist or is malformed — start fresh
  }
  arr.push(entry);
  await fs.writeFile(file, JSON.stringify(arr, null, 2), "utf8");
}

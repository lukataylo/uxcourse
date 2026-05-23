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

async function readAll(): Promise<Store> {
  await ensure();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as Store;
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
  store.generations[g.id] = { ...g, updatedAt: new Date().toISOString() };
  await writeAll(store);
  return store.generations[g.id];
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
  const next: Generation = {
    ...current,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
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

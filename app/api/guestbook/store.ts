import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";

// Guestbook storage on the same Neon Postgres database as the visit counter (DATABASE_URL).
// When DATABASE_URL isn't set and we're not in production, an in-memory list is used so the
// feature can be developed and tested locally without a database.

export type GuestEntry = { id: number; name: string; message: string; created_at: string };
export type AdminEntry = GuestEntry & { approved: boolean };

export const LIMITS = { name: 40, message: 240, perHourPerVisitor: 3 };

type MemRow = AdminEntry & { ip_hash: string };
const memory: MemRow[] = [];
let memoryId = 1;
const inMemoryMode = () => !process.env.DATABASE_URL && process.env.NODE_ENV !== "production";

const db = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");
  return neon(process.env.DATABASE_URL);
};

let tableReady: Promise<void> | null = null;
async function ensureTable() {
  if (inMemoryMode()) return;
  if (!tableReady) {
    tableReady = (async () => {
      const sql = db();
      await sql`
        CREATE TABLE IF NOT EXISTS guestbook (
          id SERIAL PRIMARY KEY,
          name VARCHAR(40) NOT NULL,
          message VARCHAR(240) NOT NULL,
          approved BOOLEAN NOT NULL DEFAULT false,
          ip_hash VARCHAR(64) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })().catch((e) => {
      tableReady = null; // retry on the next request instead of caching the failure
      throw e;
    });
  }
  await tableReady;
}

/** One-way hash of the visitor's IP (salted) so we can rate-limit without storing addresses. */
export function hashIp(ip: string) {
  return createHash("sha256")
    .update(ip + (process.env.GUESTBOOK_SALT ?? "guestbook-salt"))
    .digest("hex");
}

export async function listApproved(limit = 60): Promise<GuestEntry[]> {
  await ensureTable();
  if (inMemoryMode()) {
    return memory
      .filter((r) => r.approved)
      .slice(-limit)
      .reverse()
      .map(({ id, name, message, created_at }) => ({ id, name, message, created_at }));
  }
  const rows = await db()`
    SELECT id, name, message, created_at
    FROM guestbook WHERE approved = true
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map((r) => ({ id: r.id, name: r.name, message: r.message, created_at: new Date(r.created_at).toISOString() }));
}

export async function recentCountByVisitor(ipHash: string): Promise<number> {
  await ensureTable();
  if (inMemoryMode()) {
    const since = Date.now() - 3600_000;
    return memory.filter((r) => r.ip_hash === ipHash && new Date(r.created_at).getTime() > since).length;
  }
  const rows = await db()`
    SELECT COUNT(*)::int AS n FROM guestbook
    WHERE ip_hash = ${ipHash} AND created_at > now() - interval '1 hour'
  `;
  return rows[0].n as number;
}

export async function insertEntry(name: string, message: string, ipHash: string, approved: boolean) {
  await ensureTable();
  if (inMemoryMode()) {
    memory.push({ id: memoryId++, name, message, approved, ip_hash: ipHash, created_at: new Date().toISOString() });
    return;
  }
  await db()`INSERT INTO guestbook (name, message, approved, ip_hash) VALUES (${name}, ${message}, ${approved}, ${ipHash})`;
}

export async function listPending(): Promise<AdminEntry[]> {
  await ensureTable();
  if (inMemoryMode()) {
    return memory.filter((r) => !r.approved).map(({ id, name, message, created_at, approved }) => ({ id, name, message, created_at, approved }));
  }
  const rows = await db()`
    SELECT id, name, message, approved, created_at FROM guestbook
    WHERE approved = false ORDER BY created_at ASC
  `;
  return rows.map((r) => ({ id: r.id, name: r.name, message: r.message, approved: r.approved, created_at: new Date(r.created_at).toISOString() }));
}

export async function listAll(): Promise<AdminEntry[]> {
  await ensureTable();
  if (inMemoryMode()) {
    return [...memory]
      .reverse()
      .map(({ id, name, message, created_at, approved }) => ({ id, name, message, created_at, approved }));
  }
  const rows = await db()`
    SELECT id, name, message, approved, created_at FROM guestbook
    ORDER BY created_at DESC LIMIT 500
  `;
  return rows.map((r) => ({ id: r.id, name: r.name, message: r.message, approved: r.approved, created_at: new Date(r.created_at).toISOString() }));
}

export async function setApproved(id: number, approved: boolean) {
  await ensureTable();
  if (inMemoryMode()) {
    const row = memory.find((r) => r.id === id);
    if (row) row.approved = approved;
    return;
  }
  await db()`UPDATE guestbook SET approved = ${approved} WHERE id = ${id}`;
}

export async function deleteEntry(id: number) {
  await ensureTable();
  if (inMemoryMode()) {
    const i = memory.findIndex((r) => r.id === id);
    if (i >= 0) memory.splice(i, 1);
    return;
  }
  await db()`DELETE FROM guestbook WHERE id = ${id}`;
}

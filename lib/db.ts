import Database from "better-sqlite3";
import path from "node:path";

export type Artwork = {
  id: number;
  artist: string;
  title: string;
  picture: string;
  year: string;
  type: string;
  location: string;
};

// readonly: the app can never modify the collection.
const db = new Database(
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "arts.sqlite3"),
  { readonly: true, fileMustExist: true },
);

const COLS = "id, artist, title, picture, year, type, location";
export const FILTER_FIELDS = ["artist", "title", "year", "type", "location"] as const;
const ORDER_FIELDS = new Set(["id", "artist", "title", "year", "type", "location"]);

export function getArt(id: number): Artwork | undefined {
  return db.prepare(`SELECT ${COLS} FROM art_art WHERE id = ?`).get(id) as Artwork | undefined;
}

export function randomArt(): Artwork | undefined {
  // Random id pick avoids sorting all rows; falls back if ids have gaps.
  const { max } = db.prepare("SELECT MAX(id) AS max FROM art_art").get() as { max: number };
  return (db
    .prepare(`SELECT ${COLS} FROM art_art WHERE id >= ? ORDER BY id LIMIT 1`)
    .get(1 + Math.floor(Math.random() * max)) as Artwork | undefined) ?? getArt(1);
}

// Mirrors the Django list API: <field>__contains filters, ordering, limit/offset.
export function listArts(params: URLSearchParams) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  for (const f of FILTER_FIELDS) {
    const v = params.get(`${f}__contains`);
    if (v) {
      where.push(`${f} LIKE ? ESCAPE '\\'`);
      args.push(`%${v.replace(/[\\%_]/g, (c) => "\\" + c)}%`);
    }
  }
  const ordering = params.get("ordering") ?? "";
  const key = ordering.replace(/^-/, "");
  // Seeded shuffle so "Load more" pages never repeat; the seed travels in the next URL.
  const seed = parseInt(params.get("seed") ?? "") || 1 + Math.floor(Math.random() * 999_983);
  const sorted = ORDER_FIELDS.has(key);
  const order = sorted
    ? `${key} ${ordering.startsWith("-") ? "DESC" : "ASC"}, id`
    : `(id * ${seed}) % 1000003, id`;
  const limit = Math.min(Math.max(parseInt(params.get("limit") ?? "") || 25, 1), 100);
  const offset = Math.max(parseInt(params.get("offset") ?? "") || 0, 0);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const { count } = db.prepare(`SELECT COUNT(*) AS count FROM art_art ${whereSql}`).get(...args) as { count: number };
  const results = db
    .prepare(`SELECT ${COLS} FROM art_art ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...args, limit, offset) as Artwork[];
  return { count, limit, offset, seed: sorted ? null : seed, results };
}

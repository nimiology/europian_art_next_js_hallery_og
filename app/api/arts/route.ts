import { listArts } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const url = new URL(req.url);
  const { count, limit, offset, seed, results } = listArts(url.searchParams);
  const page = (off: number) => {
    const q = new URLSearchParams(url.searchParams);
    q.set("limit", String(limit));
    q.set("offset", String(off));
    if (seed) q.set("seed", String(seed));
    return `${url.pathname}?${q}`;
  };
  return Response.json({
    count,
    next: offset + limit < count ? page(offset + limit) : null,
    previous: offset > 0 ? page(Math.max(0, offset - limit)) : null,
    results,
  });
}

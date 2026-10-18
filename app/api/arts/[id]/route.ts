import { getArt } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const art = getArt(Number((await params).id));
  return art ? Response.json(art) : Response.json({ detail: "Not found." }, { status: 404 });
}

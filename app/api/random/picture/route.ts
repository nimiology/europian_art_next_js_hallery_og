import { randomArt } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.redirect(randomArt()!.picture, 302);
}

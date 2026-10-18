import type { MetadataRoute } from "next";
import { artCount, artIdsPage } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

// Sitemaps cap at 50,000 URLs, so the collection is split into chunks: /sitemap/0.xml, /sitemap/1.xml, ...
const PER_SITEMAP = 25_000;

export async function generateSitemaps() {
  return Array.from({ length: Math.ceil(artCount() / PER_SITEMAP) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> | number }): Promise<MetadataRoute.Sitemap> {
  const n = Number(await id);
  const pages: MetadataRoute.Sitemap =
    n === 0
      ? [
          { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
          { url: `${SITE_URL}/moment`, changeFrequency: "daily", priority: 0.5 },
        ]
      : [];
  return pages.concat(
    artIdsPage(n * PER_SITEMAP, PER_SITEMAP).map((artId) => ({ url: `${SITE_URL}/art/${artId}`, changeFrequency: "yearly", priority: 0.7 })),
  );
}

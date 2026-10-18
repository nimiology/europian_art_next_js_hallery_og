import type { MetadataRoute } from "next";
import { artCount } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const chunks = Math.ceil(artCount() / 25_000);
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: Array.from({ length: chunks }, (_, i) => `${SITE_URL}/sitemap/${i}.xml`),
    host: SITE_URL,
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ArtworkDetail from "@/components/ArtworkDetail";
import { getArt } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

// Shared by generateMetadata and the page so the row is read once per request.
const load = cache(async (params: Props["params"]) => {
  const { id } = await params;
  return /^\d+$/.test(id) ? getArt(Number(id)) : undefined;
});

// "AACHEN, Hans von" → "Hans von Aachen" for prose; the raw value stays on the page.
function displayArtist(raw: string) {
  const [last, first] = raw.split(", ");
  const nice = last.toLowerCase().replace(/(^|[\s-])\p{L}/gu, (c) => c.toUpperCase());
  return first ? `${first} ${nice}` : nice;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const art = await load(params);
  if (!art) return { title: "Artwork not found", robots: { index: false } };
  const artist = displayArtist(art.artist);
  const title = `${art.title} by ${artist}`;
  const description = [`${art.title} (${art.year}) by ${artist}`, art.type, art.location].filter(Boolean).join(". ") + ".";
  const url = `/art/${art.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description, images: [{ url: art.picture, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [art.picture] },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const art = await load(params);
  if (!art) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: art.title,
    image: art.picture,
    url: `${SITE_URL}/art/${art.id}`,
    creator: { "@type": "Person", name: displayArtist(art.artist) },
    dateCreated: art.year,
    artMedium: art.type,
    contentLocation: art.location ? { "@type": "Place", name: art.location } : undefined,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so artwork text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ArtworkDetail initial={art} />
    </>
  );
}

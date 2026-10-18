"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ArtImage from "@/components/ArtImage";
import { fetchJson, useStore } from "@/components/store";
import type { Artwork } from "@/lib/db";

// `initial` comes from the server so the wall label is in the HTML for crawlers and first paint.
export default function ArtworkDetail({ initial: art }: { initial: Artwork }) {
  const router = useRouter();
  const { cache, gallery, fromGallery, openLightbox } = useStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { cache.set(art.id, art); setError(null); }, [art, cache]);

  const randomArtwork = async () => {
    try {
      const a = await fetchJson<Artwork>("/api/random");
      cache.set(a.id, a);
      fromGallery.current = false;
      router.push(`/art/${a.id}`);
    } catch (e) { setError((e as Error).message); }
  };

  const alt = `${art.title} by ${art.artist}`;
  const galleryHref = gallery.current?.key ? `/?${gallery.current.key}` : "/";

  return (
    <>
      <div className="sticky"><Header /></div>
      <main className="detail-main">
        <div className="detail-top">
          <Link
            href={galleryHref}
            onClick={(e) => { if (fromGallery.current) { e.preventDefault(); router.back(); } }}
          >← Back to gallery</Link>
          <button type="button" className="btn btn-secondary" style={{ padding: "11px 18px" }} onClick={randomArtwork}>Random artwork</button>
        </div>

        {error && <p role="alert" className="mono-note" style={{ marginTop: 12 }}>Couldn&apos;t load a random artwork · {error}</p>}

        {(
          <article className="detail">
            <div className="well">
              <button type="button" aria-label={`View ${alt} fullscreen`} onClick={(e) => openLightbox(art, e.currentTarget)}>
                <ArtImage key={art.id} src={art.picture} alt={alt} brokenStyle={{ width: "min(100%, 520px)", aspectRatio: "4 / 5" }} />
              </button>
            </div>
            <aside aria-label="Wall label" className="wall-label">
              <p className="eyebrow">Hallery No. {String(art.id).padStart(4, "0")}</p>
              <h1>{art.title}</h1>
              <button
                type="button"
                className="artist-btn"
                aria-label={`Show all works by ${art.artist}`}
                onClick={() => router.push(`/?${new URLSearchParams({ artist: art.artist })}`)}
              >{art.artist}</button>
              <p className="muted" style={{ margin: "2px 0 0" }}>{art.year}</p>
              <div className="rule" />
              <dl>
                <div><dt>Medium</dt><dd>{art.type}</dd></div>
                <div><dt>Collection</dt><dd>{art.location}</dd></div>
              </dl>
              <button type="button" className="btn-text" style={{ marginTop: 28, fontSize: 13 }} onClick={(e) => openLightbox(art, e.currentTarget)}>View fullscreen ↗</button>
            </aside>
          </article>
        )}
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ArtImage from "@/components/ArtImage";
import { fetchJson, useStore } from "@/components/store";
import type { Artwork } from "@/lib/db";

export default function DetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const { cache, gallery, fromGallery, openLightbox } = useStore();
  const [art, setArt] = useState<Artwork | null>(cache.get(id) ?? null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const cached = cache.get(id);
    if (cached) { setArt(cached); return; }
    const ctl = new AbortController();
    setArt(null); setError(null);
    fetchJson<Artwork>(`/api/arts/${id}`, ctl.signal)
      .then((a) => { cache.set(a.id, a); setArt(a); })
      .catch((e) => { if (!ctl.signal.aborted) setError((e as Error).message); });
    return () => ctl.abort();
  }, [id, cache, tick]);

  const randomArtwork = async () => {
    try {
      const a = await fetchJson<Artwork>("/api/random");
      cache.set(a.id, a);
      fromGallery.current = false;
      router.push(`/art/${a.id}`);
    } catch (e) { setError((e as Error).message); }
  };

  const alt = art ? `${art.title} by ${art.artist}` : "";
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

        {!art && !error && (
          <div aria-busy="true" className="detail pulse">
            <div className="well" style={{ minHeight: "60vh" }} />
            <div className="wall-label" style={{ display: "flex", flexDirection: "column", gap: 12, position: "static" }}>
              <div className="skel" style={{ height: 12, width: "30%" }} />
              <div className="skel" style={{ height: 36, width: "90%" }} />
              <div className="skel" style={{ height: 16, width: "55%" }} />
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="centered" style={{ marginTop: "12vh" }}>
            <p className="serif-msg">This artwork couldn&apos;t be loaded.</p>
            <p className="mono-note">{error}</p>
            <button type="button" className="btn btn-primary" onClick={() => setTick((t) => t + 1)}>Retry</button>
          </div>
        )}

        {art && (
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

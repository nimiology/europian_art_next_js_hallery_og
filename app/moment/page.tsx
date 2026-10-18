"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import ArtImage from "@/components/ArtImage";
import { fetchJson, useStore } from "@/components/store";
import type { Artwork } from "@/lib/db";

export default function MomentPage() {
  const { cache, moment, openLightbox } = useStore();
  const [art, setArt] = useState<Artwork | null>(moment.current);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      let a: Artwork, tries = 0;
      do { a = await fetchJson<Artwork>("/api/random"); tries++; }
      while (moment.current && a.id === moment.current.id && tries < 3);
      cache.set(a.id, a);
      moment.current = a;
      setArt(a);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [cache, moment]);

  useEffect(() => { if (!moment.current) load(); }, [load, moment]);

  const alt = art ? `${art.title} by ${art.artist}` : "";

  return (
    <main className="moment">
      <Header current="moment" />
      <div className="stage">
        {!art && !error && (
          <div aria-live="polite" className="stage-center pulse">
            <span className="eyebrow" style={{ fontSize: 12, letterSpacing: ".08em" }}>Finding something to look at</span>
          </div>
        )}
        {!art && error && (
          <div role="alert" className="stage-center">
            <p style={{ margin: 0, font: "400 24px var(--serif)" }}>The collection couldn&apos;t be reached.</p>
            <p className="mono-note">{error}</p>
            <button type="button" onClick={load} className="btn btn-primary">Retry</button>
          </div>
        )}
        {art && (
          <button type="button" key={art.id} className="stage-btn" aria-label={`View ${alt} fullscreen`} onClick={(e) => openLightbox(art, e.currentTarget)}>
            <ArtImage src={art.picture} alt={alt} brokenStyle={{ position: "absolute", inset: 24 }} />
          </button>
        )}
      </div>
      <section aria-label="Artwork label" className="label-row">
        <div style={{ minWidth: 0, flex: "1 1 320px", maxWidth: 720 }}>
          <p className="eyebrow">Art of the moment</p>
          <h1>{art ? art.title : error ? "Nothing on the wall" : " "}</h1>
          <p style={{ margin: "10px 0 0" }}>
            {art?.artist}
            {art && <span className="muted">, {art.year} · {art.location}</span>}
          </p>
        </div>
        <div className="actions">
          <button type="button" onClick={load} className="btn btn-primary" style={{ padding: "14px 22px" }}>Show me another</button>
          {art && <Link href={`/art/${art.id}`} className="btn btn-secondary">View details</Link>}
          <Link href="/" style={{ fontSize: 14, padding: "13px 6px" }}>Browse the collection</Link>
        </div>
      </section>
    </main>
  );
}

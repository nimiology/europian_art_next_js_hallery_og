"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import ArtImage from "@/components/ArtImage";
import { fetchJson, useStore, type GallerySnapshot } from "@/components/store";
import type { Artwork } from "@/lib/db";
import { aspectFromType } from "@/lib/ratio";

const FIELDS = ["artist", "type", "year", "location"] as const;
type Field = (typeof FIELDS)[number];
const LABELS: Record<Field, string> = { artist: "Artist", type: "Type", year: "Year", location: "Location" };
const HINTS: Record<Field, string> = { artist: "e.g. Vermeer", type: "e.g. Oil on canvas", year: "e.g. 18 or c. 1503", location: "e.g. Amsterdam" };
const KEYS = ["title", ...FIELDS, "ordering"] as const;
const PAGE_SIZE = 25;
const SKELETONS = [300, 220, 360, 260, 320, 240, 380, 280, 230, 340, 270, 310];

type ListResponse = { count: number; next: string | null; results: Artwork[] };

function Gallery() {
  const router = useRouter();
  const params = useSearchParams();
  const { cache, gallery, fromGallery } = useStore();

  // Only the keys we know about make up the gallery query.
  const query = useMemo(() => {
    const q = new URLSearchParams();
    for (const k of KEYS) { const v = params.get(k)?.trim(); if (v) q.set(k, v); }
    return q;
  }, [params]);
  const key = query.toString();
  const filters = Object.fromEntries(KEYS.map((k) => [k, query.get(k) ?? ""])) as Record<(typeof KEYS)[number], string>;
  const anyFilters = ["title", ...FIELDS].some((k) => query.get(k));

  const restored = gallery.current?.key === key ? gallery.current : null;
  const [snap, setSnap] = useState<GallerySnapshot | null>(restored);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [searchDraft, setSearchDraft] = useState(filters.title);
  const [openFilter, setOpenFilter] = useState<Field | null>(null);
  const [panelDraft, setPanelDraft] = useState("");
  const searchT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = (s: GallerySnapshot) => { gallery.current = s; setSnap(s); };
  const remember = (arts: Artwork[]) => arts.forEach((a) => cache.set(a.id, a));

  useEffect(() => {
    if (gallery.current?.key === key) { setSnap(gallery.current); return; }
    const ctl = new AbortController();
    setSnap(null); setError(null); setMoreError(false);
    const q = new URLSearchParams(query);
    for (const k of ["title", ...FIELDS]) { const v = q.get(k); if (v) { q.delete(k); q.set(`${k}__contains`, v); } }
    q.set("limit", String(PAGE_SIZE));
    q.set("offset", "0");
    fetchJson<ListResponse>(`/api/arts?${q}`, ctl.signal)
      .then((d) => { remember(d.results); save({ key, items: d.results, count: d.count, next: d.next }); })
      .catch((e) => { if (!ctl.signal.aborted) setError((e as Error).message); });
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadTick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenFilter(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setParams = (patch: Partial<Record<(typeof KEYS)[number], string>>) => {
    const q = new URLSearchParams(query);
    for (const [k, v] of Object.entries(patch)) { if (v?.trim()) q.set(k, v.trim()); else q.delete(k); }
    setOpenFilter(null);
    router.replace(q.size ? `/?${q}` : "/", { scroll: true });
  };

  const clearAll = () => {
    clearTimeout(searchT.current);
    setSearchDraft("");
    setParams({ title: "", artist: "", type: "", year: "", location: "" });
  };

  const loadMore = async () => {
    if (!snap?.next || loadingMore) return;
    setLoadingMore(true); setMoreError(false);
    try {
      const d = await fetchJson<ListResponse>(snap.next);
      remember(d.results);
      save({ ...snap, items: [...snap.items, ...d.results], next: d.next, count: d.count });
    } catch { setMoreError(true); }
    setLoadingMore(false);
  };

  const suggestions = useMemo(() => {
    if (!openFilter) return [];
    const q = panelDraft.toLowerCase();
    const values = new Set([...cache.values()].map((a) => a[openFilter]).filter(Boolean));
    return [...values].filter((v) => !q || v.toLowerCase().includes(q)).sort().slice(0, 10);
  }, [openFilter, panelDraft, cache]);

  const loading = !snap && !error;
  const items = snap?.items ?? [];
  const status = loading ? "Loading the collection…" : error ? "Unavailable"
    : !snap?.count ? "No results" : `Showing 1–${items.length} of ${snap.count.toLocaleString("en-US")}`;

  return (
    <>
      <div className="sticky">
        <Header current="gallery" />
        <div className="toolbar">
          <form role="search" className="search" onSubmit={(e) => { e.preventDefault(); clearTimeout(searchT.current); setParams({ title: searchDraft }); }}>
            <label htmlFor="hallery-q" className="sr-only">Search titles</label>
            <input
              id="hallery-q" type="search" placeholder="Search titles" autoComplete="off" value={searchDraft}
              onChange={(e) => {
                const v = e.target.value;
                setSearchDraft(v);
                clearTimeout(searchT.current);
                searchT.current = setTimeout(() => setParams({ title: v }), 350);
              }}
            />
          </form>
          <div role="group" aria-label="Filters" className="chips">
            {FIELDS.map((f) => {
              const toggle = () => { setPanelDraft(filters[f]); setOpenFilter(openFilter === f ? null : f); };
              const aria = { "aria-expanded": openFilter === f, "aria-controls": "hallery-filter-panel" };
              return filters[f] ? (
                <span key={f} className="chip-on">
                  <button type="button" onClick={toggle} {...aria}>{LABELS[f]}: {filters[f]}</button>
                  <button type="button" onClick={() => setParams({ [f]: "" })} aria-label={`Remove ${LABELS[f]} filter`}>×</button>
                </span>
              ) : (
                <button key={f} type="button" className="chip" onClick={toggle} {...aria}>{LABELS[f]}</button>
              );
            })}
          </div>
          <label className="sort">Sort
            <select value={filters.ordering} onChange={(e) => setParams({ ordering: e.target.value })}>
              <option value="">Random</option>
              <option value="title">Title A–Z</option>
              <option value="artist">Artist A–Z</option>
              <option value="-artist">Artist Z–A</option>
              <option value="year">Year</option>
              <option value="type">Medium</option>
              <option value="location">Location</option>
              <option value="id">Catalogue no.</option>
            </select>
          </label>
        </div>
        {openFilter && (
          <div id="hallery-filter-panel" role="region" aria-label={`Filter by ${LABELS[openFilter]}`} className="panel-wrap">
            <form className="panel" onSubmit={(e) => { e.preventDefault(); setParams({ [openFilter]: panelDraft }); }}>
              <label htmlFor="hallery-filter-input" className="eyebrow" style={{ letterSpacing: ".08em" }}>{LABELS[openFilter]} contains</label>
              <div className="panel-row">
                <input id="hallery-filter-input" autoFocus autoComplete="off" value={panelDraft} placeholder={HINTS[openFilter]} onChange={(e) => setPanelDraft(e.target.value)} />
                <button type="submit" className="btn btn-primary" style={{ padding: "11px 18px" }}>Apply</button>
                <button type="button" className="btn-text" style={{ padding: "11px 6px" }} onClick={() => setOpenFilter(null)}>Cancel</button>
              </div>
              {suggestions.length > 0 && (
                <div className="sugs">
                  {suggestions.map((v) => <button key={v} type="button" onClick={() => setParams({ [openFilter]: v })}>{v}</button>)}
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      <main aria-labelledby="hallery-gallery-h" className="gallery-main">
        <div className="status">
          <h2 id="hallery-gallery-h" aria-live="polite">{status}</h2>
          {anyFilters && <button type="button" className="link-btn" onClick={clearAll}>Clear all filters</button>}
        </div>

        {loading && (
          <div aria-hidden="true" className="masonry">
            {SKELETONS.map((h, i) => (
              <div key={i} className="pulse">
                <div className="skel" style={{ height: h }} />
                <div className="skel" style={{ height: 14, width: "70%", marginTop: 12 }} />
                <div className="skel" style={{ height: 11, width: "45%", marginTop: 8 }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div role="alert" className="centered">
            <p className="serif-msg">The collection couldn&apos;t be reached.</p>
            <p className="mono-note">{error}</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => setReloadTick((t) => t + 1)}>Retry</button>
          </div>
        )}

        {snap && items.length === 0 && (
          <div className="centered">
            <p className="serif-msg">No artworks match these filters</p>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              {filters.title ? `Nothing titled with “${filters.title}”. Try fewer or shorter terms.` : "Try fewer or shorter terms."}
            </p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 6 }} onClick={clearAll}>Clear filters</button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <ul className="masonry">
              {items.map((a) => (
                <li key={a.id}>
                  <Link href={`/art/${a.id}`} className="card" onClick={() => { fromGallery.current = true; }}>
                    <ArtImage
                      src={a.picture} alt={`${a.title} by ${a.artist}`} loading="lazy"
                      style={{ aspectRatio: aspectFromType(a.type, a.title), objectFit: "contain" }}
                    />
                    <span className="card-title">{a.title}</span>
                    <span className="card-meta">{a.artist}, {a.year}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="more">
              {snap?.next && (
                <button type="button" className="btn btn-outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
              {moreError && <p role="alert" className="muted" style={{ margin: 0, fontSize: 13 }}>Couldn&apos;t load more. Try again.</p>}
              {!snap?.next && items.length > PAGE_SIZE && <p className="eyebrow" style={{ letterSpacing: ".08em" }}>End of the collection</p>}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default function GalleryPage() {
  return <Suspense><Gallery /></Suspense>;
}

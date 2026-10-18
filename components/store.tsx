"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { Artwork } from "@/lib/db";
import Lightbox from "./Lightbox";

export type GallerySnapshot = { key: string; items: Artwork[]; count: number; next: string | null };

type Store = {
  cache: Map<number, Artwork>;
  gallery: { current: GallerySnapshot | null };
  moment: { current: Artwork | null };
  fromGallery: { current: boolean };
  openLightbox: (art: Artwork, trigger?: HTMLElement | null) => void;
};

const Ctx = createContext<Store | null>(null);

export function useStore() {
  return useContext(Ctx)!;
}

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const r = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!r.ok) throw new Error(`HTTP ${r.status} · ${url}`);
  return r.json();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const cache = useRef(new Map<number, Artwork>()).current;
  const gallery = useRef<GallerySnapshot | null>(null);
  const moment = useRef<Artwork | null>(null);
  const fromGallery = useRef(false);
  const [lb, setLb] = useState<{ art: Artwork; trigger?: HTMLElement | null } | null>(null);

  const store: Store = {
    cache,
    gallery,
    moment,
    fromGallery,
    openLightbox: (art, trigger) => setLb({ art, trigger }),
  };

  return (
    <Ctx.Provider value={store}>
      {children}
      {lb && (
        <Lightbox
          art={lb.art}
          onClose={() => {
            lb.trigger?.focus();
            setLb(null);
          }}
        />
      )}
    </Ctx.Provider>
  );
}

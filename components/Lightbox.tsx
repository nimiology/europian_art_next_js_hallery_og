"use client";

import { useEffect, useRef, useState } from "react";
import type { Artwork } from "@/lib/db";

export default function Lightbox({ art, onClose }: { art: Artwork; onClose: () => void }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const closeRef = useRef<HTMLButtonElement>(null);
  const alt = `${art.title} by ${art.artist}`;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Only one focusable control, so keep Tab on it.
      if (e.key === "Tab") { e.preventDefault(); closeRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pct = (v: number, max: number) => `${((v / max) * 100).toFixed(1)}%`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="lightbox"
      onMouseMove={(e) => zoom && setOrigin(`${pct(e.clientX, innerWidth)} ${pct(e.clientY, innerHeight)}`)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={art.picture}
        alt={alt}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          if (!zoom) setOrigin(`${pct(e.clientX - r.left, r.width)} ${pct(e.clientY - r.top, r.height)}`);
          setZoom(!zoom);
        }}
        style={{ cursor: zoom ? "zoom-out" : "zoom-in", transform: `scale(${zoom ? 2.4 : 1})`, transformOrigin: origin }}
      />
      <button type="button" ref={closeRef} onClick={onClose} className="lb-close">Close · Esc</button>
      <div className="lb-caption">
        <span><em>{art.title}</em> <span className="dim">· {art.artist}</span></span>
        <span className="hint">{zoom ? "Move to pan · click to zoom out" : "Click image to zoom"}</span>
      </div>
    </div>
  );
}

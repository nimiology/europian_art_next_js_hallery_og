"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setDark(t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("hallery-theme", next); } catch {}
    setDark(!dark);
  };

  const label = dark ? "Light" : "Dark";
  return (
    <button type="button" onClick={toggle} aria-label={`Switch to ${label} mode`} className="btn-text" style={{ padding: "6px 0" }}>
      {label}
    </button>
  );
}

export default function Header({ current }: { current?: "gallery" | "moment" }) {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">Hallery</Link>
      <nav aria-label="Primary" className="site-nav">
        <Link href="/" aria-current={current === "gallery" ? "page" : undefined}>Collection</Link>
        <Link href="/moment" aria-current={current === "moment" ? "page" : undefined}>Moment</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

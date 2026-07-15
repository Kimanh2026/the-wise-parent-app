"use client";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import { LIBRARY } from "@/content/library";

export default function LibraryPage() {
  const { t, lang, state } = useApp();
  return (
    <div className="fade-in">
      <h1>🌿 {t.library.title}</h1>
      <p className="muted" style={{ marginTop: 4, marginBottom: 24 }}>{t.library.subtitle}</p>
      <div className="grid2">
        {LIBRARY.map((l) => {
          const fav = (state?.favoriteLessons || []).includes(l.slug);
          return (
            <Link key={l.slug} href={`/library/${l.slug}`} className="card story-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="story-emoji">{l.emoji}</span>
                {fav && <span className="chip amber">★</span>}
              </div>
              <h3>{l[lang].title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{l[lang].subtitle}</p>
              <span className="muted small">{l.minutes} {t.library.readTime}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

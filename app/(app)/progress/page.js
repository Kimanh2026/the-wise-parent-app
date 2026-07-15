"use client";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import { getStoryById } from "@/content/stories";
import { getLibraryItem } from "@/content/library";

export default function ProgressPage() {
  const { t, lang, state } = useApp();
  if (!state) return null;
  const missionsDone = Object.keys(state.missions || {}).length;
  const saved = (state.savedStories || []).map(getStoryById).filter(Boolean);
  const favs = (state.favoriteLessons || []).map(getLibraryItem).filter(Boolean);

  return (
    <div className="fade-in">
      <h1>🌱 {t.progress.title}</h1>
      <p className="muted" style={{ marginTop: 4, marginBottom: 20 }}>{t.progress.subtitle}</p>

      <div className="grid3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card stat"><div className="num">🔥 {state.streak?.count || 0}</div><div className="lbl">{t.progress.streak}</div></div>
        <div className="card stat"><div className="num">{state.streak?.best || 0}</div><div className="lbl">{t.progress.best}</div></div>
        <div className="card stat"><div className="num">{missionsDone}</div><div className="lbl">{t.progress.missions}</div></div>
        <div className="card stat"><div className="num">{state.reset?.completedDays?.length || 0}/7</div><div className="lbl">{t.progress.resetDays}</div></div>
      </div>

      <h2 style={{ margin: "28px 0 12px" }}>♥ {t.progress.savedStories}</h2>
      {saved.length === 0 ? (
        <p className="muted">{t.progress.emptySaved}</p>
      ) : (
        <div className="grid2">
          {saved.map((s) => (
            <Link key={s.id} href={`/stories/${s.id}`} className="card story-card">
              <span className="story-emoji">{s.emoji}</span>
              <h3>{s[lang].title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{s[lang].theme}</p>
            </Link>
          ))}
        </div>
      )}

      <h2 style={{ margin: "28px 0 12px" }}>★ {t.progress.favorites}</h2>
      {favs.length === 0 ? (
        <p className="muted">{t.progress.emptyFav}</p>
      ) : (
        <div className="grid2">
          {favs.map((l) => (
            <Link key={l.slug} href={`/library/${l.slug}`} className="card story-card">
              <span className="story-emoji">{l.emoji}</span>
              <h3>{l[lang].title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{l[lang].subtitle}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

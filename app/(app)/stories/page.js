"use client";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import { STORIES, getStoryOfTheDay } from "@/content/stories";

export default function StoriesPage() {
  const { t, lang, state } = useApp();
  const today = getStoryOfTheDay();
  return (
    <div className="fade-in">
      <h1>📖 {t.stories.title}</h1>
      <p className="muted" style={{ marginTop: 4, marginBottom: 24 }}>{t.stories.subtitle}</p>
      <div className="grid2">
        {STORIES.map((s) => {
          const saved = (state?.savedStories || []).includes(s.id);
          const isToday = s.id === today.id;
          return (
            <Link key={s.id} href={`/stories/${s.id}`} className="card story-card" style={isToday ? { borderColor: "var(--lantern)" } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="story-emoji">{s.emoji}</span>
                <span style={{ display: "flex", gap: 6 }}>
                  {isToday && <span className="chip amber">{t.stories.today}</span>}
                  {saved && <span className="chip">♥</span>}
                </span>
              </div>
              <h3>{s[lang].title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{s[lang].theme} · {s.minutes} {t.stories.minutes}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

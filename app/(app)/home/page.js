"use client";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import { getStoryOfTheDay } from "@/content/stories";
import { getTipOfTheDay, getMissionOfTheDay, dateKey } from "@/content/tips";
import { LIBRARY } from "@/content/library";
import { RESET_DAYS } from "@/content/reset";

export default function HomePage() {
  const { user, state, updateState, t, lang } = useApp();

  if (!state) return null;

  const story = getStoryOfTheDay();
  const tip = getTipOfTheDay()[lang];
  const mission = getMissionOfTheDay()[lang];
  const today = dateKey();
  const missionDone = Boolean(state.missions?.[today]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.home.goodMorning : hour < 18 ? t.home.goodAfternoon : t.home.goodEvening;
  const firstName = (user.name || "").split(" ")[0];

  const resetDone = state.reset?.completedDays?.length || 0;
  const resetStarted = Boolean(state.reset?.startedAt);
  const nextResetDay = RESET_DAYS[Math.min(resetDone, 6)];

  function completeMission() {
    if (missionDone) return;
    const yesterday = dateKey(new Date(Date.now() - 86400000));
    const s = state.streak || { count: 0, lastDay: null, best: 0 };
    const count = s.lastDay === yesterday ? s.count + 1 : s.lastDay === today ? s.count : 1;
    updateState({
      missions: { ...(state.missions || {}), [today]: true },
      streak: { count, lastDay: today, best: Math.max(s.best || 0, count) },
    });
  }

  // continue learning: first 2 library items not yet favorited/read
  const learn = LIBRARY.slice(0, 8).filter((l) => !(state.favoriteLessons || []).includes(l.slug)).slice(0, 2);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <div className="kicker">{new Date().toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1>{greeting}, {firstName}.</h1>
        </div>
        {(state.streak?.count || 0) > 0 && <span className="chip amber">🔥 {state.streak.count} {t.home.streak}</span>}
      </div>

      {/* Today's story */}
      <Link href={`/stories/${story.id}`} className="card story-card" style={{ display: "block", marginBottom: 16, borderLeft: "4px solid var(--lantern)" }}>
        <span className="kicker">{t.home.todayStory}</span>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6 }}>
          <span className="story-emoji">{story.emoji}</span>
          <div>
            <h2 style={{ marginBottom: 2 }}>{story[lang].title}</h2>
            <span className="muted small">{story[lang].theme} · {story.minutes} {t.stories.minutes}</span>
          </div>
        </div>
        <span className="btn secondary sm" style={{ alignSelf: "flex-start", marginTop: 10 }}>{t.home.readStory} →</span>
      </Link>

      <div className="grid2">
        {/* Tip */}
        <div className="card">
          <span className="kicker">{t.home.todayTip}</span>
          <p style={{ margin: "10px 0 6px", fontSize: "1.02rem" }}>{tip.tip}</p>
          <span className="muted small">— {tip.source}</span>
        </div>

        {/* Mission */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <span className="kicker">{t.home.mission}</span>
          <p style={{ margin: "10px 0 14px", fontSize: "1.02rem", flex: 1 }}>{mission}</p>
          <button className={missionDone ? "btn secondary" : "btn lantern"} onClick={completeMission} disabled={missionDone}>
            {missionDone ? `✓ ${t.home.missionDone}` : t.home.markDone}
          </button>
        </div>
      </div>

      {/* Reset progress */}
      <Link href="/reset" className="card" style={{ display: "block", marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span className="kicker">🌅 {t.reset.title}</span>
            <p style={{ margin: "8px 0 0", fontWeight: 600 }}>
              {resetStarted && resetDone < 7
                ? `${t.home.day} ${resetDone + 1}: ${nextResetDay[lang].title}`
                : resetDone >= 7
                ? t.reset.finished
                : t.home.resetStart}
            </p>
          </div>
          <div style={{ minWidth: 160, flex: "0 1 220px" }}>
            <div className="bar"><i style={{ width: `${(resetDone / 7) * 100}%` }} /></div>
            <span className="small muted">{resetDone} / 7</span>
          </div>
        </div>
      </Link>

      {/* Continue learning */}
      {learn.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2>{t.home.continueLearning}</h2>
            <Link href="/library" className="small" style={{ color: "var(--pine-deep)", fontWeight: 600 }}>{t.common.viewAll} →</Link>
          </div>
          <div className="grid2" style={{ marginTop: 12 }}>
            {learn.map((l) => (
              <Link key={l.slug} href={`/library/${l.slug}`} className="card story-card">
                <span className="story-emoji">{l.emoji}</span>
                <h3>{l[lang].title}</h3>
                <p className="muted small" style={{ margin: 0 }}>{l[lang].subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

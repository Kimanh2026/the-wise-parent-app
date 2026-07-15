"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { getStoryById } from "@/content/stories";

export default function StoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang, state, updateState } = useApp();
  const story = getStoryById(id);
  const [reflection, setReflection] = useState("");
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    if (state && story) setReflection(state.storyReflections?.[story.id] || "");
  }, [state, story]);

  if (!story) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p>Story not found.</p>
        <Link className="btn secondary sm" href="/stories">{t.common.back}</Link>
      </div>
    );
  }
  const c = story[lang];
  const saved = (state?.savedStories || []).includes(story.id);

  function toggleSave() {
    const list = state.savedStories || [];
    updateState({ savedStories: saved ? list.filter((x) => x !== story.id) : [...list, story.id] });
  }
  function saveReflection() {
    updateState({ storyReflections: { ...(state.storyReflections || {}), [story.id]: reflection } });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 1800);
  }

  return (
    <article className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <button className="btn ghost sm no-print" onClick={() => router.back()}>← {t.common.back}</button>
      <header style={{ margin: "18px 0 8px" }}>
        <span className="story-emoji" style={{ fontSize: "2.4rem" }}>{story.emoji}</span>
        <h1 style={{ marginTop: 8 }}>{c.title}</h1>
        <p className="muted small" style={{ marginTop: 6 }}>
          <span className="chip">{c.theme}</span> &nbsp; {story.minutes} {t.stories.minutes}
        </p>
      </header>

      <div className="prose">
        {c.story.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="section-block wisdom">
        <span className="kicker">🏮 {t.stories.wisdom}</span>
        <p style={{ margin: 0, fontStyle: "italic" }}>{c.wisdom}</p>
      </div>
      <div className="section-block science">
        <span className="kicker">🔬 {t.stories.science}</span>
        <p style={{ margin: 0 }}>{c.science}</p>
      </div>
      <div className="card" style={{ background: "var(--pine-soft)", borderColor: "transparent" }}>
        <span className="kicker" style={{ color: "var(--pine-deep)" }}>🌱 {t.stories.action}</span>
        <p style={{ margin: "8px 0 0", fontWeight: 600 }}>{c.action}</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <span className="kicker">✍️ {t.stories.reflection}</span>
        <p style={{ margin: "8px 0 10px", fontStyle: "italic" }}>{c.reflection}</p>
        <textarea rows={3} placeholder={t.stories.reflectionPlaceholder} value={reflection} onChange={(e) => setReflection(e.target.value)} />
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn sm" onClick={saveReflection}>{savedNote ? `✓ ${t.stories.saved}` : t.stories.saveReflection}</button>
          <button className={saved ? "btn secondary sm" : "btn lantern sm"} onClick={toggleSave}>
            {saved ? t.stories.unsave : `♥ ${t.stories.save}`}
          </button>
        </div>
      </div>
    </article>
  );
}

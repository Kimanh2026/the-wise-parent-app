"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { getLibraryItem } from "@/content/library";

export default function LibraryItemPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { t, lang, state, updateState } = useApp();
  const item = getLibraryItem(slug);
  if (!item) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p>Lesson not found.</p>
        <Link className="btn secondary sm" href="/library">{t.common.back}</Link>
      </div>
    );
  }
  const c = item[lang];
  const fav = (state?.favoriteLessons || []).includes(item.slug);
  function toggleFav() {
    const list = state.favoriteLessons || [];
    updateState({ favoriteLessons: fav ? list.filter((x) => x !== item.slug) : [...list, item.slug] });
  }

  return (
    <article className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <button className="btn ghost sm no-print" onClick={() => router.back()}>← {t.common.back}</button>
      <header style={{ margin: "18px 0" }}>
        <span className="story-emoji" style={{ fontSize: "2.4rem" }}>{item.emoji}</span>
        <h1 style={{ marginTop: 8 }}>{c.title}</h1>
        <p className="muted" style={{ marginTop: 6 }}>{c.subtitle}</p>
      </header>

      <div className="card" style={{ background: "var(--lantern-soft)", borderColor: "transparent" }}>
        <span className="kicker">{t.library.lesson}</span>
        <p className="prose" style={{ margin: "8px 0 0" }}>{c.heart}</p>
      </div>

      <h2 style={{ margin: "26px 0 6px" }}>{t.library.keyIdeas}</h2>
      {c.ideas.map((idea, i) => (
        <div className="section-block" key={i} style={{ borderColor: i % 2 ? "var(--lantern)" : "var(--pine)" }}>
          <h3 style={{ marginBottom: 6 }}>{idea.h}</h3>
          <p style={{ margin: 0 }}>{idea.p}</p>
        </div>
      ))}

      <h2 style={{ margin: "26px 0 10px" }}>💬 {t.library.phrases}</h2>
      <div className="card flat">
        {c.phrases.map((p, i) => (
          <p key={i} style={{ margin: i === c.phrases.length - 1 ? 0 : "0 0 12px", fontStyle: "italic", color: "var(--pine-deep)" }}>{p}</p>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }} className="no-print">
        <button className={fav ? "btn secondary" : "btn lantern"} onClick={toggleFav}>
          {fav ? t.library.unfavorite : `★ ${t.library.favorite}`}
        </button>
      </div>
    </article>
  );
}

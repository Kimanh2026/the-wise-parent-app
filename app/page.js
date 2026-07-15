"use client";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import Enso from "@/components/Enso";

const MODULES = [
  ["🪷", { en: "AI Parenting Coach", vi: "AI Coach Nuôi Dạy Con" }, { en: "Describe any moment — get warm, practical advice grounded in wisdom and science.", vi: "Kể bất kỳ tình huống nào — nhận lời khuyên ấm áp, thực tế dựa trên trí tuệ và khoa học." }],
  ["📖", { en: "Daily Stories", vi: "Truyện Mỗi Ngày" }, { en: "A 3-minute story every day: ancient wisdom, a science insight, one action.", vi: "Mỗi ngày một truyện 3 phút: trí tuệ xưa, một hiểu biết khoa học, một hành động." }],
  ["🌿", { en: "Parenting Library", vi: "Thư Viện" }, { en: "Deep guides: screens, gaming, respect, gratitude, discipline, emotions and more.", vi: "Hướng dẫn sâu: màn hình, game, lễ phép, biết ơn, kỷ luật, cảm xúc…" }],
  ["🧰", { en: "Family Toolkit", vi: "Bộ Công Cụ Gia Đình" }, { en: "Family rules, routines, reward chart, screen tracker, emotion sheet — all printable.", vi: "Nội quy, lịch sinh hoạt, bảng thưởng, theo dõi màn hình, nhật ký cảm xúc — in được." }],
  ["🌅", { en: "7-Day Family Reset", vi: "Reset Gia Đình 7 Ngày" }, { en: "One small shift a day. A calmer home in one week.", vi: "Mỗi ngày một thay đổi nhỏ. Một tuần cho mái nhà bình yên hơn." }],
  ["🌱", { en: "Progress", vi: "Tiến Bộ" }, { en: "Streaks, missions, saved stories — small steps honestly counted.", vi: "Chuỗi ngày, nhiệm vụ, truyện đã lưu — từng bước nhỏ được ghi nhận." }],
];

export default function Landing() {
  const { user, t, lang, setLang } = useApp();

  return (
    <div>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px clamp(16px,4vw,48px)", maxWidth: 1100, margin: "0 auto" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Enso size={30} />
          <b className="display">The Wise Parent</b>
        </span>
        <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn ghost sm" onClick={() => setLang(lang === "en" ? "vi" : "en")}>
            {lang === "en" ? "Tiếng Việt" : "English"}
          </button>
          {user ? (
            <Link href="/home" className="btn sm">{t.nav.home} →</Link>
          ) : (
            <Link href="/login" className="btn ghost sm">{t.landing.login}</Link>
          )}
        </span>
      </header>

      <section className="landing-hero fade-in">
        <div className="kicker" style={{ marginBottom: 14 }}>{t.landing.heroKicker}</div>
        <h1>
          {lang === "vi" ? (
            <>Nuôi con <span className="hero-underline">tử tế</span>, bình an và lễ phép.</>
          ) : (
            <>Raise <span className="hero-underline">kind</span>, calm, respectful children.</>
          )}
        </h1>
        <p className="muted" style={{ fontSize: "1.1rem", margin: "18px auto 26px", maxWidth: 560 }}>{t.tagline}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={user ? "/home" : "/signup"} className="btn lantern">{t.landing.cta}</Link>
          <Link href="/pricing" className="btn secondary">{t.landing.cta2}</Link>
        </div>
        <p className="small muted" style={{ marginTop: 14 }}>{t.auth.trialNote}</p>
      </section>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "10px clamp(16px,4vw,48px) 30px" }}>
        <div className="grid3">
          {t.landing.pillars.map(([h, p]) => (
            <div className="card flat" key={h} style={{ background: "transparent", border: "none", textAlign: "center" }}>
              <h3 style={{ color: "var(--pine-deep)" }}>{h}</h3>
              <p className="muted small" style={{ marginTop: 6 }}>{p}</p>
            </div>
          ))}
        </div>
        <p className="display" style={{ textAlign: "center", fontSize: "1.25rem", margin: "26px auto", maxWidth: 520, fontStyle: "italic" }}>
          {t.landing.promise}
        </p>
      </section>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 clamp(16px,4vw,48px) 80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>{t.landing.modules}</h2>
        <div className="grid3">
          {MODULES.map(([ico, h, p]) => (
            <div className="card story-card" key={h.en}>
              <span className="story-emoji">{ico}</span>
              <h3>{h[lang]}</h3>
              <p className="muted small" style={{ margin: 0 }}>{p[lang]}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href={user ? "/home" : "/signup"} className="btn lantern">{t.landing.cta}</Link>
        </div>
      </section>

      <footer className="muted small" style={{ textAlign: "center", padding: "20px 16px 40px" }}>
        The Wise Parent · {t.byBrand} · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

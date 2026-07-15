"use client";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import Enso from "@/components/Enso";

// Clean, print-to-PDF friendly sheets. Use the browser's Print → Save as PDF.
export default function PrintToolPage() {
  const { tool } = useParams();
  const router = useRouter();
  const { t, lang, state, user } = useApp();
  if (!state) return null;
  const tk = state.toolkit;
  const title = t.toolkit.tabs[tool] || t.toolkit.title;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button className="btn ghost sm" onClick={() => router.back()}>← {t.common.back}</button>
        <button className="btn lantern sm" onClick={() => window.print()}>🖨 {t.toolkit.print}</button>
      </div>

      <header style={{ textAlign: "center", marginBottom: 28 }}>
        <Enso size={44} />
        <h1 style={{ marginTop: 8 }}>{title}</h1>
        <p className="muted small">{user?.name ? `${user.name} · ` : ""}The Wise Parent · {t.byBrand}</p>
      </header>

      {tool === "rules" && (
        <div className="card flat">
          {(tk.rules.length ? tk.rules : ["", "", "", "", ""]).map((r, i) => (
            <p key={i} style={{ fontSize: "1.2rem", padding: "14px 0", borderBottom: "1px dashed var(--line)", margin: 0 }}>
              <b style={{ color: "var(--lantern)", marginRight: 12 }}>{i + 1}.</b>
              {r || "\u00A0"}
            </p>
          ))}
          <p className="muted small" style={{ marginTop: 20, textAlign: "center" }}>
            {lang === "vi" ? "Cả nhà cùng ký tên: ______________________" : "Signed by the whole family: ______________________"}
          </p>
        </div>
      )}

      {tool === "routine" && (
        <table className="plain" style={{ fontSize: "1.05rem" }}>
          <thead><tr><th>{t.toolkit.routine.time}</th><th>{t.toolkit.routine.activity}</th><th>{t.toolkit.routine.who}</th><th>✓</th></tr></thead>
          <tbody>
            {(tk.routine.length ? tk.routine : Array.from({ length: 8 }).map(() => ({ time: "", activity: "", who: "" }))).map((r, i) => (
              <tr key={i} style={{ height: 44 }}><td style={{ fontWeight: 600 }}>{r.time}</td><td>{r.activity}</td><td>{r.who}</td><td style={{ width: 40 }}>☐</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {tool === "rewards" && (
        <div className="card flat" style={{ textAlign: "center" }}>
          <h2>{tk.rewards.childName || "____________"}</h2>
          <p className="muted">{t.toolkit.rewards.goal}: <b>{tk.rewards.goal || "____________"}</b></p>
          <div className="stars" style={{ justifyContent: "center" }}>
            {Array.from({ length: tk.rewards.target }).map((_, i) => (
              <span key={i} className={`star ${i < tk.rewards.stars ? "on" : ""}`} style={{ border: "1px solid var(--line)" }}>{i < tk.rewards.stars ? "⭐" : ""}</span>
            ))}
          </div>
          <p className="small muted">{tk.rewards.stars} / {tk.rewards.target} {t.toolkit.rewards.stars}</p>
        </div>
      )}

      {tool === "screen" && (
        <table className="plain" style={{ fontSize: "1.05rem" }}>
          <thead><tr><th>📅</th><th>{t.toolkit.screen.today}</th><th>{lang === "vi" ? "Ghi chú" : "Notes"}</th></tr></thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(Date.now() - (6 - i) * 86400000);
              const k = d.toISOString().slice(0, 10);
              return (
                <tr key={k} style={{ height: 44 }}>
                  <td style={{ fontWeight: 600 }}>{d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { weekday: "long" })}</td>
                  <td>{tk.screen[k] ? `${tk.screen[k]} min` : ""}</td>
                  <td></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {tool === "emotions" && (
        <table className="plain" style={{ fontSize: "1.02rem" }}>
          <thead><tr><th>📅</th><th>{t.toolkit.emotions.child}</th><th>{t.toolkit.emotions.feeling}</th><th>{t.toolkit.emotions.note}</th></tr></thead>
          <tbody>
            {(tk.emotions.length ? tk.emotions.slice(0, 12) : Array.from({ length: 10 }).map(() => ({}))).map((e, i) => (
              <tr key={i} style={{ height: 42 }}><td className="small">{e.date || ""}</td><td>{e.child || ""}</td><td>{e.feeling || ""}</td><td>{e.note || ""}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

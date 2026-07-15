"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/Providers";
import { dateKey } from "@/content/tips";

const SUGGESTED_RULES = {
  en: ["We speak kindly, even when upset", "Screens rest during meals — everyone's", "We fix what we break, together", "Everyone helps the family every day", "We say good morning and good night"],
  vi: ["Cả nhà nói lời tử tế, kể cả khi đang bực", "Giờ ăn không màn hình, với tất cả mọi người", "Làm hỏng thì cùng nhau sửa", "Mỗi ngày, mỗi người giúp nhà một việc", "Sáng chào nhau, tối chúc ngủ ngon"],
};

function ToolkitInner() {
  const { t, lang, state, updateState } = useApp();
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "rules");
  if (!state) return null;
  const tk = state.toolkit;
  const save = (patch) => updateState({ toolkit: { ...tk, ...patch } });

  const TABS = ["rules", "routine", "rewards", "screen", "emotions"];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1>🧰 {t.toolkit.title}</h1>
          <p className="muted" style={{ marginTop: 4 }}>{t.toolkit.subtitle}</p>
        </div>
        <Link href={`/toolkit/print/${tab}`} className="btn secondary sm no-print">🖨 {t.toolkit.print}</Link>
      </div>

      <div className="tabs" style={{ marginTop: 16 }}>
        {TABS.map((k) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            {t.toolkit.tabs[k]}
          </button>
        ))}
      </div>

      {tab === "rules" && <Rules t={t} lang={lang} tk={tk} save={save} />}
      {tab === "routine" && <Routine t={t} tk={tk} save={save} />}
      {tab === "rewards" && <Rewards t={t} tk={tk} save={save} />}
      {tab === "screen" && <Screen t={t} lang={lang} tk={tk} save={save} />}
      {tab === "emotions" && <Emotions t={t} tk={tk} save={save} />}
    </div>
  );
}

function Rules({ t, lang, tk, save }) {
  const [text, setText] = useState("");
  const add = (rule) => {
    const r = (rule ?? text).trim();
    if (!r) return;
    save({ rules: [...tk.rules, r] });
    setText("");
  };
  return (
    <div className="card">
      {tk.rules.length === 0 && <p className="muted">{t.toolkit.rules.empty}</p>}
      <ol style={{ paddingLeft: 22, margin: tk.rules.length ? "0 0 16px" : 0 }}>
        {tk.rules.map((r, i) => (
          <li key={i} style={{ padding: "6px 0", fontSize: "1.02rem" }}>
            {r}{" "}
            <button className="btn ghost sm no-print" style={{ padding: "2px 10px", marginLeft: 8 }}
              onClick={() => save({ rules: tk.rules.filter((_, j) => j !== i) })}>✕</button>
          </li>
        ))}
      </ol>
      <form className="no-print" onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input style={{ flex: 1, minWidth: 200 }} placeholder={t.toolkit.rules.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn sm">{t.toolkit.rules.add}</button>
      </form>
      <div className="no-print" style={{ marginTop: 16 }}>
        <span className="kicker">{t.toolkit.rules.suggested}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {SUGGESTED_RULES[lang].filter((s) => !tk.rules.includes(s)).map((s) => (
            <button key={s} className="btn ghost sm" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Routine({ t, tk, save }) {
  const [row, setRow] = useState({ time: "", activity: "", who: "" });
  const add = (e) => {
    e.preventDefault();
    if (!row.time || !row.activity) return;
    const routine = [...tk.routine, row].sort((a, b) => a.time.localeCompare(b.time));
    save({ routine });
    setRow({ time: "", activity: "", who: "" });
  };
  return (
    <div className="card">
      {tk.routine.length === 0 ? (
        <p className="muted">{t.toolkit.routine.empty}</p>
      ) : (
        <table className="plain" style={{ marginBottom: 16 }}>
          <thead><tr><th>{t.toolkit.routine.time}</th><th>{t.toolkit.routine.activity}</th><th>{t.toolkit.routine.who}</th><th className="no-print"></th></tr></thead>
          <tbody>
            {tk.routine.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.time}</td><td>{r.activity}</td><td className="muted">{r.who}</td>
                <td className="no-print"><button className="btn ghost sm" style={{ padding: "2px 10px" }} onClick={() => save({ routine: tk.routine.filter((_, j) => j !== i) })}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form className="no-print" onSubmit={add} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input type="time" style={{ width: 130 }} value={row.time} onChange={(e) => setRow({ ...row, time: e.target.value })} required />
        <input style={{ flex: 2, minWidth: 160 }} placeholder={t.toolkit.routine.activity} value={row.activity} onChange={(e) => setRow({ ...row, activity: e.target.value })} required />
        <input style={{ flex: 1, minWidth: 100 }} placeholder={t.toolkit.routine.who} value={row.who} onChange={(e) => setRow({ ...row, who: e.target.value })} />
        <button className="btn sm">{t.toolkit.routine.add}</button>
      </form>
    </div>
  );
}

function Rewards({ t, tk, save }) {
  const r = tk.rewards;
  const set = (patch) => save({ rewards: { ...r, ...patch } });
  const reached = r.stars >= r.target;
  return (
    <div className="card">
      <div className="grid3 no-print" style={{ marginBottom: 8 }}>
        <div className="field"><label>{t.toolkit.rewards.child}</label><input value={r.childName} onChange={(e) => set({ childName: e.target.value })} /></div>
        <div className="field"><label>{t.toolkit.rewards.goal}</label><input value={r.goal} onChange={(e) => set({ goal: e.target.value })} /></div>
        <div className="field"><label>{t.toolkit.rewards.target}</label><input type="number" min={5} max={60} value={r.target} onChange={(e) => set({ target: Math.max(1, Number(e.target.value) || 20) })} /></div>
      </div>
      <h3>{r.childName || "—"} · {r.goal || "…"}</h3>
      <div className="stars">
        {Array.from({ length: r.target }).map((_, i) => (
          <span key={i} className={`star ${i < r.stars ? "on" : ""}`}>{i < r.stars ? "⭐" : ""}</span>
        ))}
      </div>
      <div className="bar" style={{ marginBottom: 10 }}><i style={{ width: `${Math.min(100, (r.stars / r.target) * 100)}%` }} /></div>
      <p className="small muted">{r.stars} / {r.target} {t.toolkit.rewards.stars}</p>
      {reached && <div className="banner">🎉 {t.toolkit.rewards.reached}</div>}
      <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="btn lantern sm" onClick={() => set({ stars: Math.min(r.target, r.stars + 1), log: [...(r.log || []), Date.now()] })}>{t.toolkit.rewards.addStar}</button>
        <button className="btn ghost sm" onClick={() => set({ stars: Math.max(0, r.stars - 1) })}>{t.toolkit.rewards.removeStar}</button>
      </div>
    </div>
  );
}

function Screen({ t, lang, tk, save }) {
  const today = dateKey();
  const mins = tk.screen[today] || 0;
  const set = (v) => save({ screen: { ...tk.screen, [today]: Math.max(0, v) } });
  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const k = dateKey(d);
    return { k, label: d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { weekday: "short" }), mins: tk.screen[k] || 0 };
  });
  const max = Math.max(60, ...week.map((w) => w.mins));
  const avg = Math.round(week.reduce((a, w) => a + w.mins, 0) / 7);
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="stat" style={{ padding: 0 }}>
          <div className="num">{mins}</div>
          <div className="lbl">{t.toolkit.screen.today}</div>
        </div>
        <div className="no-print" style={{ display: "flex", gap: 8 }}>
          <button className="btn sm" onClick={() => set(mins + 15)}>{t.toolkit.screen.add15}</button>
          <button className="btn ghost sm" onClick={() => set(mins - 15)}>{t.toolkit.screen.sub15}</button>
        </div>
      </div>
      <hr className="divider" />
      <span className="kicker">{t.toolkit.screen.week} · {avg} {t.toolkit.screen.avg}</span>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 120, marginTop: 14 }}>
        {week.map((w) => (
          <div key={w.k} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "70%", maxWidth: 34, height: `${(w.mins / max) * 100}%`, minHeight: w.mins ? 4 : 0, background: w.k === today ? "var(--lantern)" : "var(--pine)", borderRadius: "6px 6px 0 0", transition: "height .3s" }} />
            </div>
            <span className="small muted">{w.label}</span>
          </div>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>💡 {t.toolkit.screen.tip}</p>
    </div>
  );
}

function Emotions({ t, tk, save }) {
  const [row, setRow] = useState({ child: "", feeling: t.toolkit.emotions.feelings[0], note: "" });
  const add = (e) => {
    e.preventDefault();
    if (!row.child.trim()) return;
    save({ emotions: [{ ...row, date: new Date().toISOString().slice(0, 10) }, ...tk.emotions].slice(0, 60) });
    setRow({ ...row, note: "" });
  };
  return (
    <div className="card">
      <form className="no-print" onSubmit={add} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input style={{ flex: 1, minWidth: 110 }} placeholder={t.toolkit.emotions.child} value={row.child} onChange={(e) => setRow({ ...row, child: e.target.value })} required />
        <select style={{ width: 150 }} value={row.feeling} onChange={(e) => setRow({ ...row, feeling: e.target.value })}>
          {t.toolkit.emotions.feelings.map((f) => <option key={f}>{f}</option>)}
        </select>
        <input style={{ flex: 2, minWidth: 180 }} placeholder={t.toolkit.emotions.note} value={row.note} onChange={(e) => setRow({ ...row, note: e.target.value })} />
        <button className="btn sm">{t.toolkit.emotions.add}</button>
      </form>
      {tk.emotions.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>{t.toolkit.emotions.empty}</p>
      ) : (
        <table className="plain">
          <thead><tr><th>📅</th><th>{t.toolkit.emotions.child}</th><th>{t.toolkit.emotions.feeling}</th><th>{t.toolkit.emotions.note}</th></tr></thead>
          <tbody>
            {tk.emotions.map((e, i) => (
              <tr key={i}><td className="muted small">{e.date}</td><td style={{ fontWeight: 600 }}>{e.child}</td><td><span className="chip">{e.feeling}</span></td><td>{e.note}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ToolkitPage() {
  return (
    <Suspense fallback={null}>
      <ToolkitInner />
    </Suspense>
  );
}

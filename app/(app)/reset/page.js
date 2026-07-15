"use client";
import { useState } from "react";
import { useApp } from "@/components/Providers";
import { RESET_DAYS } from "@/content/reset";

export default function ResetPage() {
  const { t, lang, state, updateState } = useApp();
  const [notes, setNotes] = useState({});
  if (!state) return null;
  const r = state.reset || { startedAt: null, completedDays: [], notes: {} };
  const done = r.completedDays.length;
  const started = Boolean(r.startedAt);
  const finished = done >= 7;

  function start() {
    updateState({ reset: { startedAt: Date.now(), completedDays: [], notes: {} } });
  }
  function completeDay(day) {
    if (r.completedDays.includes(day)) return;
    const note = notes[day] ?? "";
    updateState({
      reset: {
        ...r,
        completedDays: [...r.completedDays, day].sort((a, b) => a - b),
        notes: { ...r.notes, [day]: note },
      },
    });
  }

  return (
    <div className="fade-in">
      <h1>🌅 {t.reset.title}</h1>
      <p className="muted" style={{ marginTop: 4 }}>{t.reset.subtitle}</p>

      <div className="card" style={{ margin: "18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="bar"><i style={{ width: `${(done / 7) * 100}%` }} /></div>
            <span className="small muted">{done} / 7 {t.reset.progress}</span>
          </div>
          {!started && <button className="btn lantern" onClick={start}>{t.reset.start}</button>}
          {finished && <button className="btn secondary sm" onClick={start}>{t.reset.restart}</button>}
        </div>
        {finished && <div className="banner" style={{ marginTop: 14 }}>🎉 {t.reset.finished}</div>}
      </div>

      {RESET_DAYS.map((d) => {
        const c = d[lang];
        const isDone = r.completedDays.includes(d.day);
        const isCurrent = started && !isDone && d.day === done + 1;
        const isLocked = !started || (!isDone && !isCurrent);
        return (
          <div className="card" key={d.day} style={{ opacity: isLocked ? 0.55 : 1 }}>
            <div className="reset-day">
              <span className={`reset-num ${isDone ? "done" : isCurrent ? "current" : ""}`}>{isDone ? "✓" : d.day}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3>{d.emoji} {c.title}</h3>
                <p style={{ margin: "4px 0 0", fontWeight: 600, color: "var(--pine-deep)" }}>{c.focus}</p>
                {(isCurrent || isDone) && (
                  <>
                    <p className="muted" style={{ marginTop: 10 }}>{c.why}</p>
                    <ul className="checklist">
                      {c.tasks.map((task, i) => <li key={i}>{task}</li>)}
                    </ul>
                    <p className="small" style={{ fontStyle: "italic", color: "var(--lantern)" }}>{c.wisdom}</p>
                    {isCurrent && (
                      <div style={{ marginTop: 10 }}>
                        <textarea rows={2} placeholder={t.reset.notePlaceholder}
                          value={notes[d.day] ?? ""} onChange={(e) => setNotes({ ...notes, [d.day]: e.target.value })} />
                        <button className="btn lantern sm" style={{ marginTop: 10 }} onClick={() => completeDay(d.day)}>
                          {t.reset.complete}
                        </button>
                      </div>
                    )}
                    {isDone && r.notes?.[d.day] && (
                      <p className="small muted" style={{ marginTop: 8 }}>✍️ {r.notes[d.day]}</p>
                    )}
                    {isDone && <span className="chip" style={{ marginTop: 8 }}>{t.reset.completed}</span>}
                  </>
                )}
                {isLocked && started && <p className="small muted" style={{ marginTop: 8 }}>🔒 {t.reset.locked}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

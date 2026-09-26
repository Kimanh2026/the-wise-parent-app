"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import SupportLink from "@/components/SupportLink";

export default function SettingsPage() {
  const { user, t, lang, setLang, theme, setTheme, refresh } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [savedNote, setSavedNote] = useState(false);
  const [child, setChild] = useState({ name: "", age: "" });
  const [aiLive, setAiLive] = useState(null);

  useEffect(() => {
    if (user) setName(user.name || "");
  }, [user]);

  useEffect(() => {
    fetch("/api/coach").then((r) => r.json()).then((d) => setAiLive(Boolean(d.live))).catch(() => setAiLive(false));
  }, []);

  if (!user) return null;
  const children = user.children || [];

  async function patchUser(patch) {
    await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    await refresh();
  }

  async function saveName(e) {
    e.preventDefault();
    await patchUser({ name: name.trim() });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 1800);
  }

  async function addChild(e) {
    e.preventDefault();
    if (!child.name.trim() || !child.age) return;
    await patchUser({ children: [...children, { name: child.name.trim(), age: Number(child.age) }] });
    setChild({ name: "", age: "" });
  }

  async function removeChild(i) {
    await patchUser({ children: children.filter((_, j) => j !== i) });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    await refresh();
  }

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <h1>{t.settings.title}</h1>

      {/* Preferences */}
      <div className="card" style={{ marginTop: 18 }}>
        <h3>{t.settings.preferences}</h3>
        <div className="grid2" style={{ marginTop: 12 }}>
          <div className="field">
            <label>{t.settings.language}</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
          <div className="field">
            <label>{t.settings.theme}</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">{t.settings.light}</option>
              <option value="dark">{t.settings.dark}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="card">
        <h3>{t.settings.profile}</h3>
        <form onSubmit={saveName} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginTop: 12 }}>
          <div className="field" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <label>{t.auth.name}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button className="btn sm">{savedNote ? `✓ ${t.settings.savedOk}` : t.settings.save}</button>
        </form>
        <p className="small muted" style={{ marginTop: 10 }}>{user.email}</p>
      </div>

      {/* Children */}
      <div className="card">
        <h3>{t.settings.children}</h3>
        <p className="muted small" style={{ marginTop: 4 }}>{t.settings.childrenHint}</p>
        {children.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
            {children.map((c, i) => (
              <span key={i} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {c.name}, {c.age}
                <button onClick={() => removeChild(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }} aria-label={t.settings.remove}>✕</button>
              </span>
            ))}
          </div>
        )}
        <form onSubmit={addChild} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <input style={{ flex: 1, minWidth: 140 }} placeholder={t.settings.childName} value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })} required />
          <input type="number" min={1} max={18} style={{ width: 110 }} placeholder={t.settings.childAge} value={child.age} onChange={(e) => setChild({ ...child, age: e.target.value })} required />
          <button className="btn sm">{t.settings.addChild}</button>
        </form>
      </div>

      {/* Subscription */}
      <div className="card">
        <h3>{t.settings.subscription}</h3>
        <div style={{ marginTop: 12 }}>
          <span className="chip amber">{t.settings.free}</span>
          <p className="small muted" style={{ marginTop: 8 }}>{t.settings.freeBody}</p>
        </div>
      </div>

      {/* AI status */}
      <div className="card">
        <h3>{t.settings.about}</h3>
        <p className="small muted" style={{ marginTop: 6 }}>{t.settings.aiStatus}</p>
        <p style={{ marginTop: 10 }}>
          {aiLive === null ? <span className="muted small">{t.common.loading}</span>
            : aiLive ? <span className="chip amber">● {t.settings.aiLive}</span>
            : <span className="chip">○ {t.settings.aiFallback}</span>}
        </p>
        <p className="small muted" style={{ marginTop: 10 }}>The Wise Parent · {t.byBrand}</p>
      </div>

      <p style={{ textAlign: "center", marginTop: 18 }}>
        <SupportLink className="small" style={{ color: "var(--pine-deep)", fontWeight: 600, textDecoration: "underline" }} />
      </p>

      <button className="btn danger" onClick={logout} style={{ marginTop: 12 }}>{t.settings.signout}</button>
    </div>
  );
}

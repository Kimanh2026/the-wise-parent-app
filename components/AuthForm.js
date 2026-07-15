"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "./Providers";
import Enso from "./Enso";

export default function AuthForm({ mode }) {
  const { t, lang, setLang, refresh } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t.auth.errors[data.error] || t.auth.errors.invalid);
        setBusy(false);
        return;
      }
      await refresh();
      router.push("/home");
    } catch {
      setError(t.auth.errors.invalid);
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="card fade-in" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Link href="/"><Enso size={44} /></Link>
          <h2 style={{ marginTop: 10 }}>{isSignup ? t.auth.createAccount : t.auth.welcomeBack}</h2>
          {isSignup && <p className="muted small" style={{ margin: "6px 0 0" }}>{t.auth.trialNote}</p>}
        </div>
        <form onSubmit={submit}>
          {isSignup && (
            <div className="field">
              <label>{t.auth.name}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
          )}
          <div className="field">
            <label>{t.auth.email}</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus={!isSignup} />
          </div>
          <div className="field">
            <label>{t.auth.password}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          {error && <div className="banner error small" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn" style={{ width: "100%" }} disabled={busy}>
            {busy ? t.common.loading : isSignup ? t.auth.signup : t.auth.login}
          </button>
        </form>
        <hr className="divider" />
        <p className="small muted" style={{ textAlign: "center", margin: 0 }}>
          {isSignup ? t.auth.haveAccount : t.auth.noAccount}{" "}
          <Link href={isSignup ? "/login" : "/signup"} style={{ color: "var(--pine-deep)", fontWeight: 600 }}>
            {isSignup ? t.auth.login : t.auth.signup}
          </Link>
        </p>
        {!isSignup && <p className="small muted" style={{ textAlign: "center", marginTop: 10 }}>{t.auth.demoHint}</p>}
        <p className="small" style={{ textAlign: "center", marginTop: 14 }}>
          <button className="btn ghost sm" type="button" onClick={() => setLang(lang === "en" ? "vi" : "en")}>
            {lang === "en" ? "Tiếng Việt" : "English"}
          </button>
        </p>
      </div>
    </div>
  );
}

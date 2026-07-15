"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import Enso from "@/components/Enso";

export default function PricingPage() {
  const { user, t, refresh } = useApp();
  const router = useRouter();
  const [confirming, setConfirming] = useState(null); // "monthly" | "yearly" | null
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const sub = user?.subscriptionStatus;

  async function subscribe(plan) {
    setBusy(true);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setBusy(false);
    if (res.ok) {
      await refresh();
      setConfirming(null);
      setDone(true);
    }
  }

  const PLANS = [
    { id: "monthly", price: "$9.99", per: t.pricing.perMonth, popular: false },
    { id: "yearly", price: "$79.99", per: t.pricing.perYear, popular: true, note: t.pricing.yearlySave },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: "0 auto", padding: user ? 0 : "40px 20px" }}>
      {!user && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Link href="/"><Enso size={40} /></Link>
        </div>
      )}
      <header style={{ textAlign: "center", marginBottom: 28 }}>
        <h1>{t.pricing.title}</h1>
        <p className="muted" style={{ marginTop: 6 }}>{t.pricing.subtitle}</p>
        {sub?.plan === "trial" && <div className="banner small" style={{ display: "inline-block", marginTop: 14 }}>⏳ {t.pricing.trialBanner(sub.daysLeft)}</div>}
        {sub?.plan === "expired" && <div className="banner error small" style={{ display: "inline-block", marginTop: 14 }}>{t.pricing.expiredBanner}</div>}
        {done && <div className="banner small" style={{ display: "inline-block", marginTop: 14 }}>🎉 {t.pricing.success}</div>}
      </header>

      <div className="grid2">
        {PLANS.map((p) => {
          const isCurrent = sub?.plan === p.id;
          return (
            <div key={p.id} className={`card plan ${p.popular ? "popular" : ""}`}>
              {p.popular && <span className="badge-pop">{t.pricing.popular}</span>}
              <h3>{p.id === "monthly" ? t.pricing.monthly : t.pricing.yearlyName}</h3>
              <p style={{ margin: "10px 0 2px" }}>
                <span className="display" style={{ fontSize: "2.2rem", fontWeight: 700 }}>{p.price}</span>
                <span className="muted"> / {p.per}</span>
              </p>
              {p.note && <p className="small" style={{ color: "var(--lantern)", fontWeight: 600 }}>{p.note}</p>}
              <ul className="checklist" style={{ margin: "14px 0 18px" }}>
                {t.pricing.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              {user ? (
                <button
                  className={p.popular ? "btn lantern" : "btn"}
                  style={{ width: "100%" }}
                  disabled={isCurrent || busy}
                  onClick={() => setConfirming(p.id)}
                >
                  {isCurrent ? `✓ ${t.pricing.current}` : t.pricing.choose}
                </button>
              ) : (
                <Link href="/signup" className={p.popular ? "btn lantern" : "btn"} style={{ width: "100%", textAlign: "center" }}>
                  {t.landing.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="small muted" style={{ textAlign: "center", marginTop: 22 }}>{t.pricing.demoNote}</p>
      {user && (
        <p style={{ textAlign: "center", marginTop: 8 }}>
          <Link href="/home" className="small" style={{ color: "var(--pine-deep)", fontWeight: 600 }}>← {t.nav.home}</Link>
        </p>
      )}

      {confirming && (
        <div className="modal-backdrop" onClick={() => !busy && setConfirming(null)}>
          <div className="card" style={{ maxWidth: 380, width: "92%", padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h3>{t.pricing.confirmTitle}</h3>
            <p className="muted" style={{ margin: "10px 0 4px" }}>
              {confirming === "monthly" ? `${t.pricing.monthlyName} — $9.99/${t.pricing.perMonth}` : `${t.pricing.yearlyName} — $79.99/${t.pricing.perYear}`}
            </p>
            <p className="small muted">{t.pricing.demoNote}</p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn lantern" style={{ flex: 1 }} disabled={busy} onClick={() => subscribe(confirming)}>
                {busy ? t.common.loading : t.pricing.confirm}
              </button>
              <button className="btn ghost" disabled={busy} onClick={() => setConfirming(null)}>{t.pricing.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

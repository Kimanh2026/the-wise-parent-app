"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import Enso from "@/components/Enso";
import { PAYPAL_ME_LINK, ZALO_CONTACT_NAME, ZALO_QR_IMAGE, ZALO_NOTE } from "@/lib/manualPayment";

export default function PricingPage() {
  const { user, lang, t, refresh } = useApp();
  const router = useRouter();
  const [confirming, setConfirming] = useState(null); // "monthly" | "yearly" | null
  const [manualPlan, setManualPlan] = useState(null); // "monthly" | "yearly" | null — manual-payment modal
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [csrf, setCsrf] = useState("");
  const [paidSent, setPaidSent] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState(null); // "success" | "cancelled" | null

  const sub = user?.subscriptionStatus;
  const rawSub = user?.subscription;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") {
      setCheckoutMsg("success");
      refresh();
    } else if (checkout === "cancelled") {
      setCheckoutMsg("cancelled");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensureCsrf() {
    if (csrf) return csrf;
    const res = await fetch("/api/csrf");
    const data = await res.json();
    setCsrf(data.token);
    return data.token;
  }

  async function payWithCard(plan) {
    setBusy(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setBusy(false);
    if (res.ok) {
      await refresh();
      setConfirming(null);
      setDone(true);
    }
  }

  function openManual(plan) {
    setConfirming(null);
    setManualPlan(plan);
    setPaidSent(false);
    ensureCsrf();
  }

  async function submitManualPaid(method) {
    setBusy(true);
    const token = await ensureCsrf();
    const res = await fetch("/api/manual-payment/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": token },
      body: JSON.stringify({ plan: manualPlan, method }),
    });
    setBusy(false);
    if (res.ok) {
      setPaidSent(true);
      await refresh();
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
        {rawSub?.pendingRequest && <div className="banner small" style={{ display: "inline-block", marginTop: 14 }}>🕓 {t.pricing.pendingNotice}</div>}
        {rawSub?.stripeStatus === "past_due" && <div className="banner error small" style={{ display: "inline-block", marginTop: 14 }}>{t.pricing.pastDueNotice}</div>}
        {done && <div className="banner small" style={{ display: "inline-block", marginTop: 14 }}>🎉 {t.pricing.success}</div>}
        {checkoutMsg === "success" && <div className="banner small" style={{ display: "inline-block", marginTop: 14 }}>🎉 {t.pricing.checkoutSuccess}</div>}
        {checkoutMsg === "cancelled" && <div className="banner small" style={{ display: "inline-block", marginTop: 14 }}>{t.pricing.checkoutCancelled}</div>}
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

      {/* Step 1: choose how to pay */}
      {confirming && (
        <div className="modal-backdrop" onClick={() => !busy && setConfirming(null)}>
          <div className="card" style={{ maxWidth: 380, width: "92%", padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h3>{t.pricing.confirmTitle}</h3>
            <p className="muted" style={{ margin: "10px 0 4px" }}>
              {confirming === "monthly" ? `${t.pricing.monthlyName} — $9.99/${t.pricing.perMonth}` : `${t.pricing.yearlyName} — $79.99/${t.pricing.perYear}`}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn lantern" style={{ flex: 1 }} disabled={busy} onClick={() => payWithCard(confirming)}>
                {busy ? t.common.loading : t.pricing.payWithCard}
              </button>
              <button className="btn ghost" disabled={busy} onClick={() => setConfirming(null)}>{t.pricing.cancel}</button>
            </div>
            <button
              className="small"
              style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", color: "var(--pine-deep)", fontWeight: 600, textDecoration: "underline" }}
              disabled={busy}
              onClick={() => openManual(confirming)}
            >
              {t.pricing.orManual}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: PayPal / Zalo manual payment */}
      {manualPlan && (
        <div className="modal-backdrop" onClick={() => !busy && setManualPlan(null)}>
          <div className="card" style={{ maxWidth: 420, width: "92%", padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h3>{t.pricing.manualTitle}</h3>
            <p className="muted small" style={{ margin: "8px 0 16px" }}>{t.pricing.manualIntro}</p>

            {paidSent ? (
              <div className="banner small">✓ {t.pricing.iPaidSent}</div>
            ) : (
              <>
                <div style={{ paddingBottom: 16, borderBottom: "1px solid #eee" }}>
                  <a href={PAYPAL_ME_LINK} target="_blank" rel="noopener noreferrer" className="btn" style={{ width: "100%", textAlign: "center", display: "block", marginBottom: 10 }}>
                    {t.pricing.paypalBtn}
                  </a>
                  <button className="btn lantern sm" style={{ width: "100%" }} disabled={busy} onClick={() => submitManualPaid("paypal")}>
                    {t.pricing.iPaid}
                  </button>
                </div>
                <div style={{ paddingTop: 16 }}>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>{t.pricing.zaloTitle}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ZALO_QR_IMAGE} alt="Zalo QR" style={{ width: 160, height: 160, display: "block", margin: "0 auto 8px", borderRadius: 8 }} />
                  <p className="small muted" style={{ textAlign: "center" }}>{(ZALO_NOTE[lang] || ZALO_NOTE.en)} ({ZALO_CONTACT_NAME})</p>
                  <button className="btn lantern sm" style={{ width: "100%", marginTop: 10 }} disabled={busy} onClick={() => submitManualPaid("zalo")}>
                    {t.pricing.iPaid}
                  </button>
                </div>
              </>
            )}

            <button className="btn ghost sm" style={{ width: "100%", marginTop: 16 }} onClick={() => setManualPlan(null)}>{t.pricing.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

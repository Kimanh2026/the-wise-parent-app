"use client";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import Enso from "@/components/Enso";

// The Wise Parent is free for everyone — no plans, no checkout. Kept as its
// own route (rather than deleted) so the landing page's "See pricing" link
// and any old bookmarks still land somewhere sensible.
export default function PricingPage() {
  const { user, t } = useApp();

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: "0 auto", padding: user ? 0 : "40px 20px" }}>
      {!user && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Link href="/"><Enso size={40} /></Link>
        </div>
      )}
      <div className="card fade-in" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: 36 }}>
        <Enso size={54} />
        <h2 style={{ margin: "16px 0 8px" }}>{t.pricing.title}</h2>
        <p className="muted">{t.pricing.subtitle}</p>
        <Link href={user ? "/home" : "/signup"} className="btn lantern">
          {user ? t.nav.home : t.landing.cta}
        </Link>
      </div>
    </div>
  );
}

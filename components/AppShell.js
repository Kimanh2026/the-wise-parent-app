"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "./Providers";
import Enso from "./Enso";

const NAV = [
  { href: "/home", key: "home", ico: "🏮" },
  { href: "/coach", key: "coach", ico: "🪷" },
  { href: "/stories", key: "stories", ico: "📖" },
  { href: "/library", key: "library", ico: "🌿" },
  { href: "/toolkit", key: "toolkit", ico: "🧰" },
  { href: "/reset", key: "reset", ico: "🌅" },
  { href: "/progress", key: "progress", ico: "🌱" },
  { href: "/settings", key: "settings", ico: "⚙️" },
];
const MOBILE_NAV = NAV.filter((n) => ["home", "coach", "stories", "toolkit", "settings"].includes(n.key));

export default function AppShell({ children }) {
  const { user, t } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (user === undefined || user === null) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
        <div className="muted">{t.common.loading}</div>
      </div>
    );
  }

  const sub = user.subscriptionStatus;
  const showPaywall = !sub.active && pathname !== "/pricing" && pathname !== "/settings";

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/home" className="brand">
          <Enso size={36} />
          <span>
            <span className="brand-name">The Wise Parent</span>
            <br />
            <span className="brand-sub">{t.byBrand}</span>
          </span>
        </Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`navlink ${pathname.startsWith(n.href) ? "active" : ""}`}>
            <span className="ico">{n.ico}</span> {t.nav[n.key]}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        {sub.plan === "gifted" && (
          <Link href="/settings" className="banner small" style={{ display: "block" }}>
            {t.gift.sidebarBanner}
          </Link>
        )}
        {sub.plan === "trial" && (
          <Link href="/pricing" className="banner small" style={{ display: "block" }}>
            ⏳ {t.pricing.trialBanner(sub.daysLeft)}
          </Link>
        )}
      </aside>

      <main className="main">
        {showPaywall ? <Paywall t={t} /> : children}
      </main>

      <nav className="bottombar">
        {MOBILE_NAV.map((n) => (
          <Link key={n.href} href={n.href} className={pathname.startsWith(n.href) ? "active" : ""}>
            <span className="ico">{n.ico}</span>
            {t.nav[n.key]}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Paywall({ t }) {
  return (
    <div className="card fade-in" style={{ maxWidth: 480, margin: "10vh auto", textAlign: "center", padding: 36 }}>
      <Enso size={54} />
      <h2 style={{ margin: "16px 0 8px" }}>{t.paywall.title}</h2>
      <p className="muted">{t.paywall.body}</p>
      <Link href="/pricing" className="btn lantern">{t.paywall.cta}</Link>
    </div>
  );
}

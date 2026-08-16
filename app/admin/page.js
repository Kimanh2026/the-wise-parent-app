"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Enso from "@/components/Enso";

// Owner-only dashboard to confirm manual PayPal/Zalo payments. Not linked
// from the app's nav on purpose — the owner just goes to /admin directly.
export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = checking
  const [secret, setSecret] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [csrf, setCsrf] = useState("");
  const [requests, setRequests] = useState(null);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [giftReason, setGiftReason] = useState("mua Ebook Kênh Ra Tiền");

  async function getCsrf() {
    const r = await fetch("/api/csrf");
    const d = await r.json();
    setCsrf(d.token);
    return d.token;
  }

  async function loadPending() {
    const r = await fetch("/api/admin/pending");
    if (r.status === 401) {
      setAuthed(false);
      return;
    }
    const d = await r.json();
    setRequests(d.requests || []);
  }

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/pending");
      if (r.ok) {
        setAuthed(true);
        await getCsrf();
        const d = await r.json();
        setRequests(d.requests || []);
      } else {
        setAuthed(false);
      }
    })();
  }, []);

  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    setBusy(false);
    if (r.ok) {
      setAuthed(true);
      setSecret("");
      await getCsrf();
      await loadPending();
    } else if (r.status === 429) {
      setLoginError("Quá nhiều lần thử. Vui lòng đợi vài phút.");
    } else {
      setLoginError("Sai mã quản trị. Thử lại nhé.");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setRequests(null);
  }

  async function activateWithPlan(userId, plan) {
    setBusy(true);
    await fetch("/api/admin/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ userId, plan }),
    });
    setBusy(false);
    setLookupResult(null);
    setLookupEmail("");
    await loadPending();
  }

  async function giftAccess(userId, reason) {
    setBusy(true);
    await fetch("/api/admin/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ userId, plan: "gifted", giftedFrom: reason.trim() || null }),
    });
    setBusy(false);
    const r = await fetch("/api/admin/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lookupResult?.email }),
    });
    const d = await r.json();
    if (d.found) setLookupResult(d.user);
  }

  async function resetSubscription(userId, mode) {
    setBusy(true);
    await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ userId, mode }),
    });
    setBusy(false);
    // Re-lookup so the "Gói hiện tại" line reflects the reset immediately.
    const r = await fetch("/api/admin/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lookupResult?.email }),
    });
    const d = await r.json();
    if (d.found) setLookupResult(d.user);
  }

  async function dismiss(userId) {
    setBusy(true);
    await fetch("/api/admin/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ userId }),
    });
    setBusy(false);
    await loadPending();
  }

  async function lookup(e) {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);
    const r = await fetch("/api/admin/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lookupEmail.trim() }),
    });
    const d = await r.json();
    if (!d.found) {
      setLookupError("Không tìm thấy tài khoản với email này.");
      return;
    }
    setLookupResult(d.user);
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <div style={{ maxWidth: 380, margin: "80px auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Link href="/">
            <Enso size={40} />
          </Link>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <h3>Quản trị — Xác nhận thanh toán</h3>
          <form onSubmit={login} style={{ marginTop: 16 }}>
            <div className="field">
              <label>Mã quản trị</label>
              <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} autoFocus required />
            </div>
            {loginError && <p className="small" style={{ color: "#c0392b" }}>{loginError}</p>}
            <button className="btn lantern" style={{ width: "100%", marginTop: 10 }} disabled={busy}>
              {busy ? "Đang kiểm tra…" : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Xác nhận thanh toán</h1>
        <button className="btn ghost sm" onClick={logout}>Đăng xuất</button>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Yêu cầu đang chờ {requests ? `(${requests.length})` : ""}</h3>
        {requests === null && <p className="small muted" style={{ marginTop: 10 }}>Đang tải…</p>}
        {requests && requests.length === 0 && (
          <p className="small muted" style={{ marginTop: 10 }}>Không có yêu cầu nào đang chờ.</p>
        )}
        {requests && requests.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  borderTop: "1px solid #eee",
                  paddingTop: 12,
                }}
              >
                <div>
                  <strong>{r.name}</strong> <span className="small muted">({r.email})</span>
                  <p className="small muted" style={{ marginTop: 2 }}>
                    Gói {r.subscription.pendingRequest.plan === "yearly" ? "hàng năm" : "hàng tháng"} · qua{" "}
                    {r.subscription.pendingRequest.method === "paypal" ? "PayPal" : "Zalo"} ·{" "}
                    {new Date(r.subscription.pendingRequest.requestedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn sm lantern"
                    disabled={busy}
                    onClick={() => activateWithPlan(r.id, r.subscription.pendingRequest.plan)}
                  >
                    Kích hoạt
                  </button>
                  <button className="btn sm ghost" disabled={busy} onClick={() => dismiss(r.id)}>
                    Bỏ qua
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Tìm và kích hoạt theo email</h3>
        <p className="small muted" style={{ marginTop: 4 }}>
          Dùng khi khách nhắn Zalo trực tiếp mà chưa bấm "Tôi đã thanh toán" trong app.
        </p>
        <form onSubmit={lookup} style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <input
            style={{ flex: 1, minWidth: 200 }}
            type="email"
            placeholder="email@khachhang.com"
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            required
          />
          <button className="btn sm">Tìm</button>
        </form>
        {lookupError && <p className="small" style={{ color: "#c0392b", marginTop: 8 }}>{lookupError}</p>}
        {lookupResult && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <strong>{lookupResult.name}</strong> <span className="small muted">({lookupResult.email})</span>
              <p className="small muted" style={{ marginTop: 2 }}>
                Gói lưu: {lookupResult.subscription.plan} · Trạng thái thực tế:{" "}
                {lookupResult.subscriptionStatus?.active
                  ? `đang active (${lookupResult.subscriptionStatus.plan}${lookupResult.subscriptionStatus.daysLeft != null ? `, còn ${lookupResult.subscriptionStatus.daysLeft} ngày` : ""})`
                  : "đã hết hạn"}
                {lookupResult.subscription.plan === "gifted" && lookupResult.subscription.giftedFrom && (
                  <> · Lý do tặng: {lookupResult.subscription.giftedFrom}</>
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn sm lantern" disabled={busy} onClick={() => activateWithPlan(lookupResult.id, "monthly")}>
                Kích hoạt hàng tháng
              </button>
              <button className="btn sm" disabled={busy} onClick={() => activateWithPlan(lookupResult.id, "yearly")}>
                Kích hoạt hàng năm
              </button>
              <button className="btn sm ghost" disabled={busy} onClick={() => resetSubscription(lookupResult.id, "trial")}>
                Đặt lại: dùng thử 7 ngày
              </button>
              <button className="btn sm ghost" disabled={busy} onClick={() => resetSubscription(lookupResult.id, "expired")}>
                Đặt lại: hết hạn
              </button>
            </div>
            <div style={{ width: "100%", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #eee", paddingTop: 10, marginTop: 4 }}>
              <input
                style={{ flex: 1, minWidth: 220 }}
                placeholder="Lý do tặng, vd: mua Ebook Kênh Ra Tiền"
                value={giftReason}
                onChange={(e) => setGiftReason(e.target.value)}
              />
              <button className="btn sm lantern" disabled={busy} onClick={() => giftAccess(lookupResult.id, giftReason)}>
                🎁 Tặng miễn phí vĩnh viễn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

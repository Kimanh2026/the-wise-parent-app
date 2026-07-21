"use client";
import { useState } from "react";
import { useApp } from "@/components/Providers";
import { ZALO_CONTACT_NAME, ZALO_QR_IMAGE } from "@/lib/manualPayment";

// "Liên hệ / Hỗ trợ" — a text link that opens a small contact form. Never
// prints the admin's email anywhere in the markup: the message is emailed
// server-side (app/api/support) with reply_to set to the sender, so replying
// from the inbox goes straight back to them. If email isn't configured
// (RESEND_API_KEY/ADMIN_EMAIL), falls back to the same Zalo contact already
// used for manual payments, instead of pretending the message was sent.
export default function SupportLink({ label, className, style }) {
  const { user, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // null | "sent" | "unavailable" | "error"

  const t =
    lang === "vi"
      ? {
          label: label || "Liên hệ / Hỗ trợ",
          title: "Liên hệ / Hỗ trợ",
          intro: user
            ? `Chúng tôi sẽ phản hồi qua email ${user.email}.`
            : "Để lại lời nhắn, chúng tôi sẽ phản hồi qua email bạn cung cấp.",
          name: "Tên của bạn",
          email: "Email của bạn",
          message: "Bạn cần hỗ trợ gì?",
          send: "Gửi",
          sending: "Đang gửi…",
          cancel: "Đóng",
          sentOk: "✓ Đã gửi! Chúng tôi sẽ phản hồi sớm nhất có thể.",
          unavailable: "Kênh email hiện chưa khả dụng — bạn nhắn Zalo giúp mình nhé:",
          error: "Có lỗi khi gửi, thử lại giúp mình nhé.",
        }
      : {
          label: label || "Contact / Support",
          title: "Contact / Support",
          intro: user ? `We'll reply to ${user.email}.` : "Leave a message and we'll reply to the email you give us.",
          name: "Your name",
          email: "Your email",
          message: "How can we help?",
          send: "Send",
          sending: "Sending…",
          cancel: "Close",
          sentOk: "✓ Sent! We'll get back to you soon.",
          unavailable: "Email isn't available right now — please message us on Zalo:",
          error: "Something went wrong sending that — please try again.",
        };

  function close() {
    setOpen(false);
    setResult(null);
    setMessage("");
    setName("");
    setEmail("");
  }

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const csrfRes = await fetch("/api/csrf");
      const { token } = await csrfRes.json();
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify({ message, name, email }),
      });
      if (res.ok) setResult("sent");
      else {
        const data = await res.json().catch(() => ({}));
        setResult(data.error === "email_unavailable" ? "unavailable" : "error");
      }
    } catch {
      setResult("error");
    }
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", ...style }}
      >
        {t.label}
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => !busy && close()}>
          <div className="card" style={{ maxWidth: 420, width: "92%", padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h3>{t.title}</h3>

            {result === "sent" ? (
              <div className="banner small" style={{ marginTop: 12 }}>{t.sentOk}</div>
            ) : result === "unavailable" ? (
              <div style={{ marginTop: 12 }}>
                <div className="banner small">{t.unavailable}</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ZALO_QR_IMAGE} alt="Zalo QR" style={{ width: 140, height: 140, display: "block", margin: "12px auto 8px", borderRadius: 8 }} />
                <p className="small muted" style={{ textAlign: "center" }}>Zalo: {ZALO_CONTACT_NAME}</p>
              </div>
            ) : (
              <form onSubmit={send} style={{ marginTop: 10 }}>
                <p className="muted small" style={{ marginBottom: 12 }}>{t.intro}</p>
                {!user && (
                  <>
                    <div className="field">
                      <label>{t.name}</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="field">
                      <label>{t.email}</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </>
                )}
                <div className="field">
                  <label>{t.message}</label>
                  <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                {result === "error" && <p className="small" style={{ color: "#c0392b", marginBottom: 8 }}>{t.error}</p>}
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button className="btn lantern" style={{ flex: 1 }} disabled={busy}>{busy ? t.sending : t.send}</button>
                  <button type="button" className="btn ghost" disabled={busy} onClick={close}>{t.cancel}</button>
                </div>
              </form>
            )}

            {result === "sent" || result === "unavailable" ? (
              <button className="btn ghost sm" style={{ width: "100%", marginTop: 16 }} onClick={close}>{t.cancel}</button>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

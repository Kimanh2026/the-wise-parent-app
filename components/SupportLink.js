"use client";
import { useState } from "react";
import { useApp } from "@/components/Providers";
import { ZALO_CONTACT_NAME, ZALO_QR_IMAGE } from "@/lib/manualPayment";
import { SUPPORT_EMAIL } from "@/lib/contact";

// "Liên hệ / Hỗ trợ" — opens a popup with the owner's Zalo QR and email.
// No form: customers reach out directly on Zalo or by email.
export default function SupportLink({ label, className, style }) {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);

  const t =
    lang === "vi"
      ? {
          label: label || "Liên hệ / Hỗ trợ",
          title: "Liên hệ / Hỗ trợ",
          zalo: "Quét mã QR bằng Zalo để nhắn cho mình",
          or: "hoặc gửi email",
          close: "Đóng",
        }
      : {
          label: label || "Contact / Support",
          title: "Contact / Support",
          zalo: "Scan the QR code with Zalo to message us",
          or: "or send an email",
          close: "Close",
        };

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
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="card" style={{ maxWidth: 380, width: "92%", padding: 28, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h3>{t.title}</h3>
            <p className="muted small" style={{ margin: "10px 0 12px" }}>{t.zalo}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ZALO_QR_IMAGE} alt="Zalo QR" style={{ width: 180, height: 180, display: "block", margin: "0 auto 8px", borderRadius: 8 }} />
            <p style={{ fontWeight: 600 }}>Zalo: {ZALO_CONTACT_NAME}</p>
            <p className="muted small" style={{ margin: "16px 0 6px" }}>{t.or}</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "var(--pine-deep)", fontWeight: 600, textDecoration: "underline" }}>
              {SUPPORT_EMAIL}
            </a>
            <button className="btn ghost sm" style={{ width: "100%", marginTop: 20 }} onClick={() => setOpen(false)}>{t.close}</button>
          </div>
        </div>
      )}
    </>
  );
}

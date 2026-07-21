// Public support contact. Not a secret — same pattern as the Zalo/PayPal
// constants in lib/manualPayment.js. Used only as a fallback (a mailto:
// link) when the hidden in-app "Liên hệ / Hỗ trợ" relay can't send
// (RESEND_API_KEY / ADMIN_EMAIL missing or the Resend call fails) — see
// components/SupportLink.js. The normal path never prints this anywhere;
// it only shows up in a mailto href on that fallback screen.
export const SUPPORT_EMAIL = "nkimanh932@gmail.com";

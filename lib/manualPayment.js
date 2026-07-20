// PayPal / Zalo manual-payment details shown on Pricing. These are personal
// payment links, not secrets, so they live here as plain constants instead
// of env vars — this needs zero configuration to work (unlike /admin, which
// needs ADMIN_SECRET). Pulled from the same PayPal.me link and Zalo QR
// ("Kim Anh") already used on the separate Mind Peace Stories landing page.
export const PAYPAL_ME_BASE = "https://paypal.me/MindPeaceStories";
export const ZALO_CONTACT_NAME = "Kim Anh";
export const ZALO_QR_IMAGE = "/zalo-qr.png";
export const ZALO_NOTE = {
  en: 'Scan the QR code in the Zalo app, or search contact "Kim Anh" to pay by bank transfer.',
  vi: 'Quét mã QR trong ứng dụng Zalo, hoặc tìm liên hệ "Kim Anh" để chuyển khoản.',
};

const PLAN_PRICE = { monthly: "9.99", yearly: "79.99" };

// PayPal.me supports a trailing /<amount> to pre-fill the amount for the
// customer — one less thing for them to type or get wrong.
export function paypalMeLink(plan) {
  const amount = PLAN_PRICE[plan];
  return amount ? `${PAYPAL_ME_BASE}/${amount}` : PAYPAL_ME_BASE;
}

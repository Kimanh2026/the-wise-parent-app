// PayPal / Zalo manual-payment details shown on Pricing. These are personal
// payment links, not secrets, so they live here as plain constants instead
// of env vars — this needs zero configuration to work (unlike /admin, which
// needs ADMIN_SECRET). Replace the two placeholders below with the real
// PayPal.me link and Zalo QR image before this goes live.
export const PAYPAL_ME_LINK = "https://paypal.me/REPLACE_ME";
export const ZALO_CONTACT_NAME = "Kim Anh";
export const ZALO_QR_IMAGE = "/zalo-qr-placeholder.png"; // drop the real QR into /public and update this path
export const ZALO_NOTE = {
  en: 'Scan the QR code in the Zalo app, or search contact "Kim Anh" to pay by bank transfer.',
  vi: 'Quét mã QR trong ứng dụng Zalo, hoặc tìm liên hệ "Kim Anh" để chuyển khoản.',
};

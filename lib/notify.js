// Best-effort admin email notification when a customer submits a manual
// PayPal/Zalo payment request. Both env vars are optional — if either is
// missing this silently no-ops; the /admin dashboard shows the pending
// request either way, this is just a heads-up ping. Uses Resend's plain
// HTTP API (no SDK) to avoid adding another dependency for one email.
export async function notifyAdminOfPendingPayment(user, plan, method) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "The Wise Parent <onboarding@resend.dev>",
        to,
        subject: `Manual payment pending: ${user.email}`,
        text: `${user.name} (${user.email}) says they paid for the ${plan} plan via ${method}.\n\nConfirm at /admin.`,
      }),
    });
  } catch {
    // non-fatal — admin still sees it in the dashboard
  }
}

// "Liên hệ / Hỗ trợ" contact form (Settings page + public footer). Sent with
// reply_to set to the sender's own email so replying from the inbox goes
// straight back to them — no need to expose the admin's email anywhere in
// the app. Same optional Resend setup as the payment ping above; unlike that
// one, this THROWS when unconfigured or the send fails, so the API route can
// tell the caller to fall back to the Zalo contact instead of the message
// silently vanishing (there's no dashboard backstop for this one).
export async function notifyAdminOfSupportMessage({ name, email, message, fromApp }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!key || !to) throw new Error("support_email_not_configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "The Wise Parent <onboarding@resend.dev>",
      to,
      reply_to: email,
      subject: `Hỗ trợ từ ${name} (${fromApp ? "trong app" : "trang chủ"})`,
      text: `${name} <${email}> gửi:\n\n${message}`,
    }),
  });
  if (!res.ok) throw new Error("support_email_send_failed");
}

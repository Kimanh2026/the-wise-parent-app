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

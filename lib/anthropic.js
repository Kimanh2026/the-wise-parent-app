// Server-side Anthropic API access.
// The application's API key lives ONLY in the server environment (ANTHROPIC_API_KEY).
// End users never enter or see a key.
import { systemPrompt } from "./coachPrompt";

const MODEL = "claude-sonnet-5";

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function askCoach({ messages, language = "en", children = [] }) {
  const childrenSummary = children
    .filter((c) => c && c.name)
    .map((c) => `${c.name} (${c.age})`)
    .join(", ");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt(language, childrenSummary),
        messages: messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Anthropic API error:", res.status, err?.error?.message);
      return null;
    }
    const data = await res.json();
    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");
    return text ? { ok: true, source: "claude", text } : null;
  } catch (e) {
    clearTimeout(timer);
    console.error("Anthropic request failed:", e.message);
    return null;
  }
}

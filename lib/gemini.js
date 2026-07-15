// Server-side Gemini API access (free tier at aistudio.google.com).
// The application's API key lives ONLY in the server environment (GEMINI_API_KEY).
// End users never enter or see a key.
import { systemPrompt } from "./coachPrompt";

const MODEL = "gemini-2.5-flash";

export function hasApiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function askCoach({ messages, language = "en", children = [] }) {
  const childrenSummary = children
    .filter((c) => c && c.name)
    .map((c) => `${c.name} (${c.age})`)
    .join(", ");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt(language, childrenSummary) }] },
          contents: messages.slice(-12).map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Gemini API error:", res.status, err?.error?.message);
      return null;
    }
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .filter(Boolean)
      .join("\n");
    return text ? { ok: true, source: "gemini", text } : null;
  } catch (e) {
    clearTimeout(timer);
    console.error("Gemini request failed:", e.message);
    return null;
  }
}

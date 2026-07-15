// Server-side Anthropic API access.
// The application's API key lives ONLY in the server environment (ANTHROPIC_API_KEY).
// End users never enter or see a key. When the key is missing or the API errors,
// the coach falls back to the built-in Wisdom Guide so the app still helps.
import { getFallbackReply } from "./fallbackCoach";

const MODEL = "claude-sonnet-5";

function systemPrompt(language, childrenSummary) {
  const lang =
    language === "vi"
      ? "Respond in warm, natural Vietnamese (tiếng Việt), simple and easy to read."
      : "Respond in warm, simple English (about grade 6 reading level).";
  return `You are the AI Parenting Coach inside "The Wise Parent", an app by Mind Peace Stories for parents of children aged 3–15.

Your foundations: ancient wisdom (including Di Zi Gui and the teachings popularized by Venerable Master Hsuan Hua), Eastern and Western philosophy, modern psychology, behavioral science, and neuroscience. You translate them into calm, practical parenting help.

Rules you always follow:
- Be practical and specific to the parent's situation.
- Be warm and compassionate. Never shame the parent or the child.
- Be evidence-informed: mention the "why" briefly (a psychology or brain insight) in plain words.
- Where natural, connect advice to one line of ancient wisdom (e.g., a Di Zi Gui principle) — one short line, translated simply, never preachy.
- End with exactly ONE simple action the parent can do today, labeled clearly (e.g., "Tonight, try this:").
- Keep answers short: 120–220 words. Short paragraphs. No bullet-point walls.
- ${lang}
${childrenSummary ? `- The parent's children: ${childrenSummary}. Tailor ages and examples to them.` : ""}
- If the parent describes abuse, self-harm, or a child in danger, gently encourage professional/local help first.`;
}

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function askCoach({ messages, language = "en", children = [] }) {
  const childrenSummary = children
    .filter((c) => c && c.name)
    .map((c) => `${c.name} (${c.age})`)
    .join(", ");

  if (!hasApiKey()) {
    return {
      ok: true,
      source: "fallback",
      text: getFallbackReply(messages[messages.length - 1]?.content || "", language),
      notice: "no_key",
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
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
      return {
        ok: true,
        source: "fallback",
        text: getFallbackReply(messages[messages.length - 1]?.content || "", language),
        notice: "api_error",
      };
    }
    const data = await res.json();
    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");
    return { ok: true, source: "claude", text };
  } catch (e) {
    console.error("Anthropic request failed:", e.message);
    return {
      ok: true,
      source: "fallback",
      text: getFallbackReply(messages[messages.length - 1]?.content || "", language),
      notice: "api_error",
    };
  }
}

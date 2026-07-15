// Picks a live AI provider (Gemini first — free tier — then Anthropic if configured),
// falling back to the offline Wisdom Guide if none is configured or all requests fail.
import { getFallbackReply } from "./fallbackCoach";
import * as gemini from "./gemini";
import * as anthropic from "./anthropic";

const PROVIDERS = [gemini, anthropic];

export function hasApiKey() {
  return PROVIDERS.some((p) => p.hasApiKey());
}

export async function askCoach({ messages, language = "en", children = [] }) {
  for (const provider of PROVIDERS) {
    if (!provider.hasApiKey()) continue;
    const result = await provider.askCoach({ messages, language, children });
    if (result) return result;
  }
  return {
    ok: true,
    source: "fallback",
    text: getFallbackReply(messages[messages.length - 1]?.content || "", language),
    notice: hasApiKey() ? "api_error" : "no_key",
  };
}

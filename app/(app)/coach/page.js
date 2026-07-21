"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/Providers";
import CoachMessage from "@/components/CoachMessage";

function CoachInner() {
  const { state, updateState, t } = useApp();
  const params = useSearchParams();
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const endRef = useRef(null);
  const sentPrefill = useRef(false);

  // hydrate history once state is loaded
  useEffect(() => {
    if (state && messages === null) {
      setMessages(state.coachHistory || []);
    }
  }, [state, messages]);

  // prefill from Home quick-ask (?q=)
  useEffect(() => {
    const q = params.get("q");
    if (q && messages !== null && !sentPrefill.current) {
      sentPrefill.current = true;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    const next = [...(messages || []), { role: "user", content }];
    setMessages(next);
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error");
      setMessages([...next, { role: "assistant", content: data.text }]);
      if (data.source === "fallback") setNotice(t.coach.fallbackNotice);
    } catch {
      setMessages([...next, { role: "assistant", content: t.coach.fallbackNotice }]);
    }
    setBusy(false);
  }

  function clearChat() {
    setMessages([]);
    updateState({ coachHistory: [] });
    setNotice(null);
  }

  if (messages === null) return <div className="muted">{t.common.loading}</div>;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 160px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h1>🪷 {t.coach.title}</h1>
          <p className="muted" style={{ marginTop: 4 }}>{t.coach.subtitle}</p>
        </div>
        {messages.length > 0 && (
          <button className="btn ghost sm" onClick={clearChat}>{t.coach.clear}</button>
        )}
      </div>

      <div className="chat-scroll" style={{ flex: 1, padding: "16px 0" }}>
        {messages.length === 0 && (
          <div className="card flat" style={{ textAlign: "center", padding: 30 }}>
            <p className="muted" style={{ marginBottom: 16 }}>{t.home.coachPrompt}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {t.coach.starters.map((s) => (
                <button key={s} className="btn ghost sm" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === "assistant" ? <CoachMessage text={m.content} /> : m.content}
          </div>
        ))}
        {busy && <div className="msg assistant typing">{t.coach.thinking}</div>}
        {notice && <div className="banner small">💡 {notice}</div>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        style={{ display: "flex", gap: 10, position: "sticky", bottom: 90, background: "var(--bg)", paddingTop: 8 }}
        className="no-print"
      >
        <textarea
          rows={1}
          style={{ flex: 1, resize: "none", maxHeight: 140 }}
          placeholder={t.coach.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
        />
        <button className="btn" disabled={busy || !input.trim()}>{t.coach.send}</button>
      </form>
      <p className="small muted" style={{ marginTop: 8 }}>{t.coach.disclaimer}</p>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={null}>
      <CoachInner />
    </Suspense>
  );
}

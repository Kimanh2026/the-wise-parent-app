"use client";

// Tiny, dependency-free renderer for AI Coach replies. The coach is allowed
// to use **bold** for a key phrase and a numbered list for genuinely
// sequential steps (see lib/coachPrompt.js) — this turns that plain-text
// markdown into real formatting instead of showing literal ** and digits.
// Anything else is rendered as plain paragraphs, same as before.

function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== "");
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`${keyPrefix}-b${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-t${i}`}>{part}</span>;
  });
}

export default function CoachMessage({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  const blocks = [];
  let currentList = null; // { type: "ol" | "ul", items: [] }
  let currentPara = [];

  const flushPara = () => {
    if (currentPara.length) {
      blocks.push({ type: "p", text: currentPara.join("\n") });
      currentPara = [];
    }
  };
  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (const raw of lines) {
    const line = raw;
    const orderedMatch = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const bulletMatch = !orderedMatch && line.match(/^\s*[-*]\s+(.*)$/);

    if (orderedMatch) {
      flushPara();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(orderedMatch[1]);
    } else if (bulletMatch) {
      flushPara();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
    } else if (line.trim() === "") {
      flushList();
      flushPara();
    } else {
      flushList();
      currentPara.push(line);
    }
  }
  flushList();
  flushPara();

  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "ol") {
          return (
            <ol key={i} style={{ margin: "6px 0", paddingLeft: 20 }}>
              {b.items.map((item, j) => (
                <li key={j} style={{ marginBottom: 4 }}>{renderInline(item, `${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} style={{ margin: "6px 0", paddingLeft: 20 }}>
              {b.items.map((item, j) => (
                <li key={j} style={{ marginBottom: 4 }}>{renderInline(item, `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0" }}>
            {renderInline(b.text, `${i}`)}
          </p>
        );
      })}
    </>
  );
}

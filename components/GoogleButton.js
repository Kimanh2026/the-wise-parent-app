"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./Providers";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// "Continue with Google" button, rendered by Google's own Identity Services
// script so we never touch the user's Google password. The script posts a
// signed ID token to our callback, which we forward to /api/auth/google for
// server-side verification (see lib/googleAuth.js) before creating a session.
// If NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't set, this renders nothing — email/
// password sign-in keeps working either way.
export default function GoogleButton({ onError }) {
  const boxRef = useRef(null);
  const router = useRouter();
  const { lang, refresh } = useApp();

  useEffect(() => {
    if (!CLIENT_ID) return;

    async function handleCredential(response) {
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential, language: lang }),
        });
        const data = await res.json();
        if (!res.ok) {
          onError?.(data.error);
          return;
        }
        await refresh();
        router.push("/home");
      } catch {
        onError?.("invalid");
      }
    }

    function render() {
      if (!window.google?.accounts?.id || !boxRef.current) return;
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredential });
      boxRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(boxRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        locale: lang === "vi" ? "vi" : "en",
      });
    }

    if (window.google?.accounts?.id) {
      render();
      return;
    }
    const existing = document.getElementById("google-identity-script");
    if (existing) {
      existing.addEventListener("load", render, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  if (!CLIENT_ID) return null;
  return <div ref={boxRef} style={{ display: "flex", justifyContent: "center", margin: "4px 0 18px" }} />;
}

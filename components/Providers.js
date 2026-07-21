"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getDict } from "@/lib/i18n";

const AppCtx = createContext(null);
export function useApp() {
  return useContext(AppCtx);
}

export default function Providers({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [state, setState] = useState(null); // per-user app state
  const [lang, setLangRaw] = useState("en");
  const [theme, setThemeRaw] = useState("light");

  // initial theme/lang from localStorage (pre-login), then from user profile
  useEffect(() => {
    const t = localStorage.getItem("wp_theme");
    const l = localStorage.getItem("wp_lang");
    if (t) setThemeRaw(t);
    if (l) setLangRaw(l);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("wp_theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("wp_lang", lang);
  }, [lang]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUser(data.user || null);
      setState(data.state || null);
      if (data.user) {
        if (data.user.theme) setThemeRaw(data.user.theme);
        if (data.user.language) setLangRaw(data.user.language);
      }
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const setTheme = useCallback(
    (t) => {
      setThemeRaw(t);
      if (user) fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme: t }) }).catch(() => {});
    },
    [user]
  );
  const setLang = useCallback(
    (l) => {
      setLangRaw(l);
      if (user) fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: l }) }).catch(() => {});
    },
    [user]
  );

  // apply a partial update to user state, persisted server-side
  const updateState = useCallback(async (patch) => {
    setState((s) => ({ ...s, ...patch }));
    try {
      const res = await fetch("/api/state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (data.state) setState(data.state);
    } catch {}
  }, []);

  const t = getDict(lang);

  return (
    <AppCtx.Provider value={{ user, setUser, state, setState, updateState, lang, setLang, theme, setTheme, t, refresh }}>
      {children}
    </AppCtx.Provider>
  );
}

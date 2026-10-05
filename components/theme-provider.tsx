"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
const ThemeContext = createContext<{ theme: ThemePreference; setTheme: (theme: ThemePreference) => void } | null>(null);

function applyTheme(theme: ThemePreference) {
  const resolved = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme;
  document.documentElement.dataset.theme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  useEffect(() => { const stored = localStorage.getItem("calcbuddy:theme") as ThemePreference | null; const next = stored === "light" || stored === "dark" || stored === "system" ? stored : "system"; setThemeState(next); applyTheme(next); }, []);
  useEffect(() => { const listener = () => theme === "system" && applyTheme(theme); const media = window.matchMedia("(prefers-color-scheme: dark)"); media.addEventListener("change", listener); return () => media.removeEventListener("change", listener); }, [theme]);
  const setTheme = (next: ThemePreference) => { setThemeState(next); localStorage.setItem("calcbuddy:theme", next); applyTheme(next); };
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error("useTheme must be used inside ThemeProvider"); return context; }

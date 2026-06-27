"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export const FONT_OPTIONS = [
  { label: "Geist Sans", value: "var(--font-geist-sans), system-ui, sans-serif" },
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
  { label: "Inter", value: "'Inter', system-ui, sans-serif" },
  { label: "Monospace", value: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
];

const DEFAULTS = {
  primaryColor: "#d4af37",
  backgroundColor: "#0c0b0a",
  surfaceColor: "#141210",
  textColor: "#f0e6d0",
  fontFamily: FONT_OPTIONS[0].value,
};

function hexToRgb(hex: string) {
  const v = parseInt(hex.replace("#", ""), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function applyTheme(colors: typeof DEFAULTS) {
  const root = document.documentElement;
  const p = hexToRgb(colors.primaryColor);
  const b = hexToRgb(colors.backgroundColor);
  const t = hexToRgb(colors.textColor);

  root.style.setProperty("--color-primary", colors.primaryColor);
  root.style.setProperty("--color-primary-rgb", `${p.r} ${p.g} ${p.b}`);
  root.style.setProperty("--color-bg", colors.backgroundColor);
  root.style.setProperty("--color-bg-rgb", `${b.r} ${b.g} ${b.b}`);
  root.style.setProperty("--color-surface", colors.surfaceColor);
  root.style.setProperty("--color-text", colors.textColor);
  root.style.setProperty("--color-text-rgb", `${t.r} ${t.g} ${t.b}`);
  root.style.setProperty("--color-text-dim", `${colors.textColor}99`);
  root.style.setProperty("--font-family", colors.fontFamily);
}

const STORAGE_KEY = "modcraft_theme";

type ThemeContextType = {
  colors: typeof DEFAULTS;
  setPrimary: (c: string) => void;
  setBackground: (c: string) => void;
  setTextColor: (c: string) => void;
  setFontFamily: (f: string) => void;
  reset: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setColors({ ...DEFAULTS, ...parsed });
      } catch { /* ignore */ }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      applyTheme(colors);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    }
  }, [colors, ready]);

  const setPrimary = useCallback((c: string) => setColors(p => ({ ...p, primaryColor: c })), []);
  const setBackground = useCallback((c: string) => setColors(p => ({ ...p, backgroundColor: c, surfaceColor: c === "#0c0b0a" ? "#141210" : c })), []);
  const setTextColor = useCallback((c: string) => setColors(p => ({ ...p, textColor: c })), []);
  const setFontFamily = useCallback((f: string) => setColors(p => ({ ...p, fontFamily: f })), []);
  const reset = useCallback(() => setColors(DEFAULTS), []);

  return (
    <ThemeContext.Provider value={{ colors, setPrimary, setBackground, setTextColor, setFontFamily, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

"use client";

import { useCallback, useEffect, useState } from "react";

export type AccentKey = "gold" | "emerald" | "rose" | "sky" | "violet" | "obsidian";
export type GradientKey = "forge" | "matrix" | "ember" | "calm" | "carbon";
export type FontKey = "modern" | "mono" | "serif";

export interface Profile {
  accent: AccentKey;
  gradient: GradientKey;
  font: FontKey;
}

export const PROFILE_KEY = "modforge.profile";
export const DEFAULT_PROFILE: Profile = { accent: "gold", gradient: "forge", font: "modern" };

export const ACCENTS: Record<AccentKey, { gold: string; bright: string; deep: string; pale: string; hairline: string }> = {
  gold: { gold: "#c1951c", bright: "#e2b63a", deep: "#8a6d18", pale: "#f3e7c3", hairline: "#e8e0c8" },
  emerald: { gold: "#1f9d55", bright: "#34d399", deep: "#0f6b3a", pale: "#d5f0e0", hairline: "#d8e8dc" },
  rose: { gold: "#e11d48", bright: "#fb7185", deep: "#9f1239", pale: "#fbe3e9", hairline: "#f0d8de" },
  sky: { gold: "#0284c7", bright: "#38bdf8", deep: "#075985", pale: "#dbeefe", hairline: "#d6e4ee" },
  violet: { gold: "#7c3aed", bright: "#a78bfa", deep: "#5b21b6", pale: "#ece3fd", hairline: "#e0d8f0" },
  obsidian: { gold: "#c9c9c4", bright: "#ffffff", deep: "#7d7d76", pale: "#2c2c28", hairline: "#d9d9d2" },
};

export const GRADIENTS: Record<GradientKey, { a: string; b: string; c: string }> = {
  forge: { a: "rgba(193,149,28,0.12)", b: "rgba(226,182,58,0.10)", c: "rgba(138,109,24,0.06)" },
  matrix: { a: "rgba(31,157,85,0.13)", b: "rgba(52,211,153,0.10)", c: "rgba(15,107,58,0.07)" },
  ember: { a: "rgba(225,29,72,0.11)", b: "rgba(251,113,133,0.09)", c: "rgba(159,18,57,0.06)" },
  calm: { a: "rgba(2,132,199,0.11)", b: "rgba(56,189,248,0.10)", c: "rgba(7,89,133,0.06)" },
  carbon: { a: "rgba(40,40,42,0.10)", b: "rgba(90,90,95,0.09)", c: "rgba(20,20,22,0.06)" },
};

export const FONTS: Record<FontKey, { sans: string; mono: string }> = {
  modern: {
    sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, 'SF Mono', monospace",
  },
  mono: {
    sans: "var(--font-geist-mono), ui-monospace, monospace",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
  },
  serif: {
    sans: "'Georgia', 'Times New Roman', ui-serif, serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
  },
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      accent: parsed.accent && ACCENTS[parsed.accent] ? parsed.accent : DEFAULT_PROFILE.accent,
      gradient: parsed.gradient && GRADIENTS[parsed.gradient] ? parsed.gradient : DEFAULT_PROFILE.gradient,
      font: parsed.font && FONTS[parsed.font] ? parsed.font : DEFAULT_PROFILE.font,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function persistProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function applyProfile(p: Profile) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  const a = ACCENTS[p.accent];
  const g = GRADIENTS[p.gradient];
  const f = FONTS[p.font];

  el.style.setProperty("--color-gold", a.gold);
  el.style.setProperty("--color-gold-bright", a.bright);
  el.style.setProperty("--color-gold-deep", a.deep);
  el.style.setProperty("--color-gold-pale", a.pale);
  el.style.setProperty("--color-hairline", a.hairline);
  el.style.setProperty("--mf-glow-a", g.a);
  el.style.setProperty("--mf-glow-b", g.b);
  el.style.setProperty("--mf-glow-c", g.c);
  el.style.setProperty("--font-sans", f.sans);
  el.style.setProperty("--font-mono", f.mono);
}

export function useProfile(): [Profile, (p: Profile) => void] {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());

  useEffect(() => {
    applyProfile(profile);
  }, [profile]);

  const update = useCallback((next: Profile) => {
    setProfile(next);
    persistProfile(next);
  }, []);

  return [profile, update];
}
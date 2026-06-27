"use client";

import { useState } from "react";
import { useTheme, FONT_OPTIONS } from "@/lib/theme";

export default function ThemePicker() {
  const { colors, setPrimary, setBackground, setTextColor, setFontFamily, reset } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white text-[10px] font-medium transition-all"
      >
        <span
          className="inline-block w-3 h-3 rounded-full border border-white/10 shrink-0"
          style={{ backgroundColor: colors.primaryColor }}
        />
        Theme
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-xs w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-4 text-sm">Customize Theme</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.primaryColor}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-white/40">{colors.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.backgroundColor}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-white/40">{colors.backgroundColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-white/40">{colors.textColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
                  Font
                </label>
                <select
                  value={colors.fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full py-2 px-3 bg-black/30 border border-white/10 rounded-xl text-white/80 text-xs font-medium focus:outline-none focus:border-[var(--color-primary)] transition-all cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='%23ffffff40'%3E%3Cpath d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    fontFamily: colors.fontFamily,
                  }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white text-xs transition-all"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 bg-[var(--color-primary)] rounded-xl text-[var(--color-bg)] text-xs font-bold transition-all hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

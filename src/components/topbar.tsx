"use client";

import { Search, Lock, Chevron } from "@/components/icons";
import { StatusDot } from "@/components/ui";
import { Wordmark } from "@/components/brand";

export default function Topbar({ onAdmin }: { onAdmin: () => void }) {
  return (
    <header className="flex items-center gap-4 px-4 md:px-5 py-3 border-b border-hairline bg-bone/70 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Wordmark compact />
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-ink-3">
          <span className="text-gold">Workspace</span>
          <Chevron className="w-3 h-3" />
          <span className="text-ink-2">project · aether-prime</span>
        </span>
      </div>

      <div className="flex-1" />

      <label className="hidden lg:flex items-center gap-2 w-64 px-3 py-2 rounded-xl bg-paper border border-hairline focus-within:border-gold-pale focus-within:ring-2 focus-within:ring-gold-pale/60 transition-all">
        <Search className="w-4 h-4 text-ink-3" />
        <input
          className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink-3/70"
          placeholder="Search assets, scripts, generators…"
        />
        <kbd className="font-mono text-[9.5px] text-ink-3 border border-hairline rounded px-1.5 py-0.5">⌘K</kbd>
      </label>

      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gold-pale bg-gold-pale/40">
        <StatusDot />
        <span className="font-mono text-[10px] uppercase tracking-widest text-gold-deep">Live Sync</span>
      </div>

      <button
        type="button"
        onClick={onAdmin}
        title="Administrative Vault"
        className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-xl text-gold-deep bg-gradient-to-br from-[#f7ead0] to-gold-pale border border-gold-pale hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_6px_18px_-10px_rgba(193,149,28,0.8)]"
      >
        <Lock className="w-4 h-4" />
        <span className="font-mono text-[10.5px] uppercase tracking-widest hidden sm:inline">Admin</span>
      </button>

      <button
        type="button"
        title="Account"
        className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-ink to-ink-2 text-bone border border-ink font-mono text-[11px] font-semibold"
      >
        ML
      </button>
    </header>
  );
}
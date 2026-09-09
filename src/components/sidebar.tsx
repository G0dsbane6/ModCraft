"use client";

import { useState } from "react";
import { Anvil, Cube, Globe, Lock, Script, Activity } from "@/components/icons";
import { LogoMark } from "@/components/brand";

const NAV = [
  { icon: Anvil, label: "Workspace" },
  { icon: Script, label: "Scripts" },
  { icon: Cube, label: "Models" },
  { icon: Globe, label: "Marketplace" },
];

export default function Sidebar({ onVault }: { onVault: () => void }) {
  const [active, setActive] = useState(0);

  return (
    <aside className="hidden md:flex flex-col w-[76px] shrink-0 border-r border-hairline bg-bone/60 backdrop-blur-xl items-center py-4 gap-2">
      <div className="mb-2">
        <LogoMark size={44} />
      </div>

      <nav className="flex flex-col items-center gap-1.5 mt-1 flex-1">
        {NAV.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => setActive(i)}
            className={`w-11 h-11 grid place-items-center rounded-xl transition-all active:scale-95 ${
              active === i
                ? "text-gold-deep bg-gold-pale/80 border border-gold-pale shadow-[0_6px_18px_-8px_rgba(193,149,28,0.6)]"
                : "text-ink-3 hover:text-ink-2 hover:bg-paper border border-transparent"
            }`}
          >
            <Icon className="w-[19px] h-[19px]" />
          </button>
        ))}

        <div className="w-8 my-1 border-t border-hairline" />
        <button
          type="button"
          title="Network Pulse"
          className="w-11 h-11 grid place-items-center rounded-xl text-ink-3 hover:text-ink-2 hover:bg-paper border border-transparent transition-all"
        >
          <Activity className="w-[19px] h-[19px]" />
        </button>
      </nav>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          title="Master Admin Vault"
          onClick={onVault}
          className="w-11 h-11 grid place-items-center rounded-xl text-gold-deep bg-gold-pale/70 border border-gold-pale hover:bg-gold-pale animate-mf-pulse transition-transform active:scale-95"
        >
          <Lock className="w-[19px] h-[19px]" />
        </button>
        <span className="font-mono text-[8.5px] tracking-widest text-ink-3">CORE v3.1</span>
      </div>
    </aside>
  );
}
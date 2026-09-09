"use client";

import { useState } from "react";
import { Anvil, Cube, Globe, Lock, Script, Activity, LogOut } from "@/components/icons";
import { LogoMark } from "@/components/brand";
import { clearSession } from "@/lib/session";
import { useRouter } from "next/navigation";

const NAV = [
  { icon: Anvil, label: "Workspace", target: "workspace-top" },
  { icon: Script, label: "Scripts", target: "panel-scripts" },
  { icon: Cube, label: "Models", target: "panel-model-viewer" },
  { icon: Globe, label: "Marketplace", target: "panel-network" },
];

export default function Sidebar({
  onVault,
  onNavigate,
}: {
  onVault: () => void;
  onNavigate: (target: string) => void;
}) {
  const [active, setActive] = useState("workspace-top");
  const router = useRouter();

  const go = (target: string) => {
    setActive(target);
    onNavigate(target);
  };

  const signOut = () => {
    clearSession();
    router.push("/");
  };

  return (
    <aside className="hidden md:flex flex-col w-[76px] shrink-0 border-r border-hairline bg-bone/60 backdrop-blur-xl items-center py-4 gap-2">
      <div className="mb-2" onClick={() => go("workspace-top")} title="Workspace">
        <LogoMark size={44} />
      </div>

      <nav className="flex flex-col items-center gap-1.5 mt-1 flex-1">
        {NAV.map(({ icon: Icon, label, target }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => go(target)}
            className={`w-11 h-11 grid place-items-center rounded-xl transition-all active:scale-95 ${
              active === target
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
          onClick={() => go("panel-network")}
          className={`w-11 h-11 grid place-items-center rounded-xl transition-all ${
            active === "panel-network"
              ? "text-gold-deep bg-gold-pale/80 border border-gold-pale"
              : "text-ink-3 hover:text-ink-2 hover:bg-paper border border-transparent"
          }`}
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
        <button
          type="button"
          title="Sign out"
          onClick={signOut}
          className="w-11 h-11 grid place-items-center rounded-xl text-ink-3 hover:text-[#a33b2b] hover:bg-paper border border-transparent transition-all active:scale-95"
        >
          <LogOut className="w-[19px] h-[19px]" />
        </button>
        <span className="font-mono text-[8.5px] tracking-widest text-ink-3">CORE v3.1</span>
      </div>
    </aside>
  );
}
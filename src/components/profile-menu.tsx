"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ACCENTS,
  DEFAULT_PROFILE,
  FONTS,
  GRADIENTS,
  useProfile,
  type AccentKey,
  type FontKey,
  type GradientKey,
} from "@/lib/profile";
import { clearSession, type Session } from "@/lib/session";
import { Check, LogOut, RefreshCw, Shield } from "@/components/icons";
import { StatusDot } from "@/components/ui";

function AccentSwatches({ value, onPick }: { value: AccentKey; onPick: (k: AccentKey) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {(Object.keys(ACCENTS) as AccentKey[]).map((k) => {
        const a = ACCENTS[k];
        const active = value === k;
        return (
          <button
            key={k}
            type="button"
            title={k}
            onClick={() => onPick(k)}
            className={`h-9 rounded-xl border transition-all active:scale-95 ${
              active ? "border-ink/50 ring-2 ring-ink/10" : "border-hairline hover:scale-[1.04]"
            }`}
            style={{
              background: `linear-gradient(135deg, ${a.pale} 0%, ${a.gold} 58%, ${a.deep} 100%)`,
              boxShadow: active ? `0 0 0 2px ${a.pale}, 0 6px 14px -6px ${a.gold}` : undefined,
            }}
          >
            {active && (
              <span className="mx-auto w-3.5 h-3.5 block text-bone drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function GradientChips({ value, onPick }: { value: GradientKey; onPick: (k: GradientKey) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {(Object.keys(GRADIENTS) as GradientKey[]).map((k) => {
        const g = GRADIENTS[k];
        const active = value === k;
        return (
          <button
            key={k}
            type="button"
            title={k}
            onClick={() => onPick(k)}
            className={`h-9 rounded-xl border transition-all active:scale-95 ${
              active ? "border-ink/50 ring-2 ring-ink/10" : "border-hairline hover:scale-[1.04]"
            }`}
            style={{ background: `linear-gradient(140deg, ${g.a}, ${g.b} 48%, ${g.c})` }}
          >
            <span
              className={`mx-auto mt-3 w-2 h-2 rounded-full block transition-all ${
                active ? "bg-ink" : "bg-ink-3/50"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function FontPicks({ value, onPick }: { value: FontKey; onPick: (k: FontKey) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(FONTS) as FontKey[]).map((k) => {
        const active = value === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onPick(k)}
            className={`h-12 rounded-xl border transition-all active:scale-95 ${
              active
                ? "border-gold-pale bg-gold-pale/40 text-gold-deep"
                : "border-hairline bg-paper text-ink-2 hover:border-gold-pale"
            }`}
          >
            <span className="block text-[17px] leading-none" style={{ fontFamily: FONTS[k].sans }}>
              Aa
            </span>
            <span className="mt-1.5 block font-mono text-[8.5px] uppercase tracking-widest capitalize">
              {k}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileMenu({
  session,
  open,
  onClose,
}: {
  session: Session;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [profile, update] = useProfile();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => update(DEFAULT_PROFILE);
  const signOut = () => {
    clearSession();
    onClose();
    router.push("/");
  };

  const initials = (session.username || "Forger")
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      ref={ref}
      className="absolute right-4 md:right-5 top-[calc(100%+10px)] z-40 w-[300px] overflow-hidden rounded-2xl glass-card gold-ring"
    >
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline bg-paper/70">
        <span className="w-10 h-10 shrink-0 grid place-items-center rounded-xl bg-gradient-to-br from-ink to-ink-2 text-bone border border-ink font-mono text-[12px] font-semibold">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold tracking-tight text-ink">{session.username}</p>
          <p className="truncate font-mono text-[9.5px] text-ink-3 lowercase tracking-wide">{session.email}</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gold-pale bg-gold-pale/40">
          <StatusDot />
          <span className="font-mono text-[8px] uppercase tracking-widest text-gold-deep capitalize">{session.method}</span>
        </span>
      </div>

      <div className="scroll-thin max-h-[58vh] overflow-y-auto p-4 space-y-5">
        <section>
          <p className="mb-2 font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-3">Accent</p>
          <AccentSwatches value={profile.accent} onPick={(k) => update({ ...profile, accent: k })} />
        </section>

        <section>
          <p className="mb-2 font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-3">Ambient gradient</p>
          <GradientChips value={profile.gradient} onPick={(k) => update({ ...profile, gradient: k })} />
        </section>

        <section>
          <p className="mb-2 font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-3">Typeface</p>
          <FontPicks value={profile.font} onPick={(k) => update({ ...profile, font: k })} />
        </section>
      </div>

      <div className="px-3 py-3 border-t border-hairline bg-paper/60 flex items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-ink-2 border border-hairline bg-bone hover:border-gold-pale hover:text-gold-deep transition-all text-[11.5px]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset theme
        </button>
        <button
          type="button"
          onClick={signOut}
          className="h-9 px-3 ml-auto flex items-center gap-1.5 rounded-xl text-[#a33b2b] border border-[#e8cfc8] bg-[#fdf4f1] hover:bg-[#fae8e2] transition-all text-[11.5px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
        <span className="ml-1 text-gold-deep/80" title="Local session, client-side encrypted">
          <Shield className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Key, X, Shield } from "@/components/icons";
import { LogoMark } from "@/components/brand";

const PASSCODES = ["12083153", "1208315312083153"];
const MAX_LEN = 16;

export default function AdminGate({
  onUnlock,
  onClose,
}: {
  onUnlock: () => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"input" | "denied" | "granted">("input");

  const display = useMemo(() => input.slice(-8), [input]);

  const append = useCallback((d: string) => {
    setInput((v) => (v.length >= MAX_LEN ? v : v + d));
  }, []);

  const verify = useCallback(() => {
    const digits = input.replace(/\D/g, "");
    if (PASSCODES.includes(digits)) {
      setState("granted");
      setTimeout(onUnlock, 900);
    } else {
      setState("denied");
      setTimeout(() => {
        setState("input");
        setInput("");
      }, 1200);
    }
  }, [input, onUnlock]);

  const clear = useCallback(() => setInput(""), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") append(e.key);
      else if (e.key === "Backspace") setInput((v) => v.slice(0, -1));
      else if (e.key === "Enter") verify();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [append, verify]);

  const cells = Array.from({ length: 8 }, (_, i) => display[i] ?? "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{
        background:
          "radial-gradient(900px 600px at 50% 10%, rgba(193,149,28,0.18), transparent 60%), radial-gradient(700px 500px at 80% 90%, rgba(193,149,28,0.10), transparent 60%), #f3efe3",
      }}
    >
      <div className="absolute inset-0 bb-grid opacity-40" />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 grid place-items-center rounded-xl bg-bone/80 border border-hairline text-ink-3 hover:text-ink transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      <motion.div
        initial={{ y: 24, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative w-full max-w-[360px] rounded-3xl glass-card gold-ring p-7 flex flex-col items-center"
      >
        <div className="flex items-center gap-2.5 mb-5">
          <LogoMark size={36} />
          <div className="leading-none">
            <p className="font-mono font-semibold tracking-[0.18em] text-[13px] text-ink">MASTER ADMIN</p>
            <p className="font-mono text-[8.5px] tracking-[0.24em] text-gold-deep uppercase mt-1">
              Ephemeral State Key Authenticator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-pale bg-gold-pale/40">
            <Shield className="w-3.5 h-3.5 text-gold-deep" />
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-gold-deep">hardware gateway</span>
          </div>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {cells.map((c, i) => (
            <motion.span
              key={i}
              animate={{ scale: c ? 1.15 : 1 }}
              className={`w-4 h-9 rounded-md border grid place-items-center transition-colors font-mono text-[12px] ${
                c
                  ? "bg-gold text-bone border-gold shadow-[0_4px_12px_-4px_rgba(193,149,28,0.7)]"
                  : "bg-bone border-hairline"
              }`}
            >
              {c ? "•" : ""}
            </motion.span>
          ))}
        </div>

        {state === "denied" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 font-mono text-[10.5px] uppercase tracking-widest text-[#a33b2b]"
          >
            access denied · key rejected
          </motion.p>
        )}
        {state === "granted" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 font-mono text-[10.5px] uppercase tracking-widest text-gold-deep"
          >
            validating… unlocking vault
          </motion.p>
        )}

        <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "enter"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (k === "clear") clear();
                else if (k === "enter") verify();
                else append(k);
              }}
              className={`h-11 rounded-xl font-mono text-[13px] transition-all active:scale-95 ${
                k === "enter"
                  ? "col-span-1 text-bone bg-gradient-to-br from-gold-deep to-gold hover:brightness-105 border border-gold-deep"
                  : k === "clear"
                    ? "text-ink-3 bg-bone border border-hairline hover:text-ink"
                    : "text-ink-2 bg-bone border border-hairline hover:border-gold-pale hover:bg-gold-pale/30"
              }`}
            >
              {k === "clear" ? "⌫" : k === "enter" ? <Key className="w-4 h-4 mx-auto" /> : k}
            </button>
          ))}
        </div>

        <p className="mt-5 font-mono text-[8.5px] uppercase tracking-widest text-ink-3 text-center">
          cryptographic access barrier · 8/16 digit state key
        </p>
      </motion.div>

      <p className="absolute bottom-4 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-ink-3/60">
        modforge vault terminal
      </p>
    </motion.div>
  );
}
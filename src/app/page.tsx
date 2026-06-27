"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [phase, setPhase] = useState<"loading" | "login" | "entered">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setPhase("login"), 2800);
    return () => clearTimeout(timer);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setPhase("entered");
    setTimeout(() => router.push("/dashboard"), 400);
  }

  if (phase === "entered") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-[var(--color-primary)]/10 blur-lg animate-pulse" />
            <Image src="/icon.png" alt="" fill className="rounded-2xl relative z-10" priority />
          </div>
          <div className="w-10 h-10 border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-[var(--color-primary)]/40 text-xs tracking-[4px] uppercase">Entering the forge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--color-bg)] overflow-hidden selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(circle, rgba(var(--color-primary-rgb),0.04) 0%, transparent 60%)" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full top-[10%] right-[10%]"
          style={{ background: "radial-gradient(circle, rgba(var(--color-primary-rgb),0.02) 0%, transparent 60%)" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full bottom-[20%] left-[8%]"
          style={{ background: "radial-gradient(circle, rgba(var(--color-primary-rgb),0.015) 0%, transparent 60%)" }} />
      </div>

      {/* Loading */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 z-20 ${phase === "loading" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
        <div className="relative w-24 h-24 mb-8" style={{ animation: "pulse-icon 1.6s ease-in-out infinite" }}>
          <div className="absolute inset-0 rounded-2xl bg-[var(--color-primary)]/10 blur-xl" />
          <Image src="/icon.png" alt="ModCraft" fill className="rounded-2xl relative z-10" priority />
        </div>
        <h1 className="text-[28px] font-bold tracking-[3px] uppercase mb-9 bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400 bg-clip-text text-transparent">
          ModCraft
        </h1>
        <div className="w-64 h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" style={{ animation: "load 2.2s ease-in-out forwards" }} />
        </div>
        <p className="text-white/10 text-[10px] tracking-[4px] uppercase mt-5">Preparing craft...</p>

        <style>{`
          @keyframes pulse-icon { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.06);opacity:1} }
          @keyframes load { 0%{width:0%} 20%{width:22%} 50%{width:55%} 80%{width:78%} 100%{width:100%} }
        `}</style>
      </div>

      {/* Login */}
      <div className={`relative w-full max-w-[400px] px-5 transition-all duration-700 delay-200 z-10 ${phase === "login" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"}`}>
        <div className="relative rounded-2xl p-8 backdrop-blur-xl border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          style={{ background: "linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)" }}>
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-14 h-14 mb-4 group">
              <div className="absolute inset-0 rounded-xl bg-[var(--color-primary)]/10 blur-md group-hover:blur-lg transition-all duration-500" />
              <Image src="/icon.png" alt="" fill className="rounded-xl relative z-10 transition-transform duration-500 group-hover:scale-105" priority />
            </div>
            <h1 className="text-xl font-bold tracking-[2px] uppercase bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
              ModCraft
            </h1>
            <p className="text-white/15 text-xs mt-1.5 tracking-wide">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="group">
              <label className="block text-white/20 text-[10px] font-semibold uppercase tracking-[1.5px] mb-1.5 group-focus-within:text-[var(--color-primary)]/60 transition-colors">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white/80 text-sm outline-none transition-all duration-200 placeholder:text-white/10 focus:border-[var(--color-primary)]/30 focus:bg-[var(--color-primary)]/[0.02] focus:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.03)]"
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-white/20 text-[10px] font-semibold uppercase tracking-[1.5px] mb-1.5 group-focus-within:text-[var(--color-primary)]/60 transition-colors">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="+ + + + + + + +"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white/80 text-sm outline-none transition-all duration-200 placeholder:text-white/10 focus:border-[var(--color-primary)]/30 focus:bg-[var(--color-primary)]/[0.02] focus:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.03)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-white/15 text-xs cursor-pointer select-none group/check">
                <input type="checkbox" defaultChecked className="appearance-none w-3.5 h-3.5 border border-white/10 rounded bg-transparent cursor-pointer checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] relative transition-all after:absolute after:inset-0 after:m-auto after:w-[5px] after:h-[8px] after:border-solid after:border-[var(--color-bg)] after:border-0 after:border-r-[1.5px] after:border-b-[1.5px] after:rotate-45 after:opacity-0 checked:after:opacity-100" />
                <span className="group-hover/check:text-white/25 transition-colors">Remember me</span>
              </label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-white/15 hover:text-[var(--color-primary)] text-xs transition-colors">Forgot?</button>
            </div>

            <button type="submit" className="relative w-full py-3 rounded-xl text-[var(--color-bg)] text-sm font-bold tracking-wide transition-all duration-200 active:scale-[0.98] overflow-hidden group"
              style={{ background: "var(--color-primary)" }}>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <span className="relative z-10">Sign In</span>
            </button>
          </form>

          <div className="relative flex items-center gap-3 mt-7 mb-5">
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-white/[0.08] text-[10px] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>

          <button type="button" className="w-full py-2.5 border border-white/[0.06] hover:border-white/[0.12] rounded-xl text-white/30 hover:text-white/50 text-xs transition-all">
            Continue as Guest
          </button>

          <p className="text-center text-white/10 text-xs mt-6">
            No account?{" "}
            <a href="#" className="text-[var(--color-primary)]/50 hover:text-[var(--color-primary)] font-medium transition-colors">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

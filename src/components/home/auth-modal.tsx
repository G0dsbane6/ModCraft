"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { X, Key, Bolt } from "@/components/icons";
import { LogoMark } from "@/components/brand";
import { type Session } from "@/lib/session";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (resp: { credential?: string; error?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function GoogleMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function AuthModal({
  open,
  onClose,
  onAuthed,
  onGuest,
}: {
  open: boolean;
  onClose: () => void;
  onAuthed: (s: Session) => void;
  onGuest: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInEmail = useCallback(async () => {
    const u = username.trim();
    const e = email.trim().toLowerCase();
    if (!u) return setError("Enter your username.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setError(null);
    setBusy("email");
    await sleep(1100);
    onAuthed({ username: u, email: e, method: "email", at: Date.now() });
  }, [username, email, password, onAuthed]);

  const signInGoogle = useCallback(async () => {
    setError(null);
    setBusy("google");

    if (!GOOGLE_CLIENT_ID) {
      setBusy(null);
      setError("Google sign-in isn't configured on this build yet.");
      return;
    }

    try {
      await loadGsi();
      const session = await new Promise<Session>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("gsi_timeout")), 20000);
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            clearTimeout(timer);
            if (resp.error || !resp.credential) {
              reject(new Error("cancelled"));
              return;
            }
            try {
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: resp.credential }),
              });
              const data = (await res.json()) as { name?: string; email?: string; error?: string };
              if (!res.ok) {
                reject(new Error(data.error ? "verification_failed" : "verification_failed"));
                return;
              }
              resolve({
                username: data.name?.trim() || username.trim() || "Forger",
                email: (data.email ?? email.trim()).toLowerCase(),
                method: "google",
                at: Date.now(),
              });
            } catch {
              reject(new Error("network_error"));
            }
          },
        });
        window.google?.accounts.id.prompt();
      });
      onAuthed(session);
    } catch (err) {
      setBusy(null);
      const msg = err instanceof Error ? err.message : "";
      if (msg === "cancelled") setError("Google sign-in was cancelled.");
      else if (msg === "verification_failed") setError("Google couldn't verify your identity. Try again.");
      else if (msg === "network_error") setError("Couldn't reach the verification server.");
      else if (msg === "gsi_timeout")
        setError("Google didn't respond. Add this domain to the OAuth 'Authorized JavaScript origins' in Google Cloud.");
      else setError("Google is unavailable right now.");
    }
  }, [username, email, onAuthed]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4"
      style={{
        background:
          "radial-gradient(800px 500px at 30% 20%, rgba(193,149,28,0.20), transparent 55%), radial-gradient(700px 500px at 80% 90%, rgba(138,109,24,0.14), transparent 55%), rgba(30, 26, 16, 0.42)",
      }}
    >
      <motion.div
        initial={{ y: 26, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 18, scale: 0.97, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] rounded-3xl glass-card gold-ring p-7 md:p-9"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <LogoMark size={46} />
            <div>
              <h2 className="text-[19px] font-semibold tracking-tight text-ink">Sign in to ModForge</h2>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-deep mt-0.5">
                forge intelligence · workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-paper border border-hairline text-ink-3 hover:text-ink transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-1 gap-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-ink-3 mb-1.5 block">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="forge_knight"
                spellCheck={false}
                className="w-full h-11 px-3.5 rounded-xl bg-paper border border-hairline text-[13px] outline-none transition-all focus:border-gold-pale focus:ring-4 focus:ring-gold-pale/40 placeholder:text-ink-3/50"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-ink-3 mb-1.5 block">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@server.dev"
                type="email"
                spellCheck={false}
                className="w-full h-11 px-3.5 rounded-xl bg-paper border border-hairline text-[13px] outline-none transition-all focus:border-gold-pale focus:ring-4 focus:ring-gold-pale/40 placeholder:text-ink-3/50"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-ink-3 mb-1.5 block">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                className="w-full h-11 px-3.5 rounded-xl bg-paper border border-hairline text-[13px] outline-none transition-all focus:border-gold-pale focus:ring-4 focus:ring-gold-pale/40 placeholder:text-ink-3/50"
              />
            </label>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-mono text-[#a33b2b]">
              {error}
            </motion.p>
          )}

          <button
            type="button"
            onClick={signInEmail}
            disabled={busy !== null}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-bone bg-gradient-to-r from-gold-deep via-gold to-gold-bright hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition-all font-medium text-[14px] shadow-[0_14px_32px_-12px_rgba(193,149,28,0.9)]"
          >
            {busy === "email" ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-bone/40 border-t-bone animate-spin" />
                Authenticating…
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Sign in
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-hairline" />
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-ink-3">or continue with</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={signInGoogle}
            disabled={busy !== null}
            className="h-11 flex items-center justify-center gap-2 rounded-xl bg-bone border border-hairline hover:border-gold-pale hover:bg-gold-pale/20 active:scale-[0.99] disabled:opacity-60 transition-all font-medium text-[13px] text-ink-2"
          >
            {busy === "google" ? (
              <span className="w-4 h-4 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            ) : (
              <GoogleMark />
            )}
            Google
          </button>
          <button
            type="button"
            onClick={onGuest}
            disabled={busy !== null}
            className="h-11 flex items-center justify-center gap-2 rounded-xl bg-paper border border-hairline hover:border-gold-pale active:scale-[0.99] disabled:opacity-60 transition-all font-medium text-[13px] text-ink-2"
          >
            <Bolt className="w-4 h-4 text-gold-deep" />
            Explore as guest
          </button>
        </div>

        <p className="mt-5 text-center font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink-3">
          encrypted local session · no remote storage
        </p>
      </motion.div>
    </motion.div>
  );
}
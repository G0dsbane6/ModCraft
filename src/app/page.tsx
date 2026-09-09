"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { LogoMark, Wordmark } from "@/components/brand";
import AuthModal from "@/components/home/auth-modal";
import { Anvil, Bolt, Cube, Globe, Lock, Script } from "@/components/icons";
import { getSession, setSession, type Session } from "@/lib/session";

const CUBES = [
  { x: "8%", y: "18%", s: 34, tx: 40, ty: -26, d: "6.4s" },
  { x: "14%", y: "64%", s: 20, tx: -28, ty: -34, d: "5.2s" },
  { x: "22%", y: "38%", s: 26, tx: 24, ty: 40, d: "7.1s" },
  { x: "38%", y: "12%", s: 16, tx: -32, ty: 30, d: "4.8s" },
  { x: "58%", y: "72%", s: 30, tx: 44, ty: 22, d: "6.9s" },
  { x: "72%", y: "20%", s: 18, tx: -22, ty: -40, d: "5.6s" },
  { x: "80%", y: "52%", s: 40, tx: -46, ty: 30, d: "7.4s" },
  { x: "90%", y: "28%", s: 22, tx: 34, ty: -20, d: "6.1s" },
  { x: "66%", y: "84%", s: 16, tx: -20, ty: -44, d: "5.0s" },
  { x: "30%", y: "82%", s: 24, tx: 40, ty: -24, d: "6.6s" },
];

const FEATURES = [
  { icon: Script, title: "AI Scripting Terminal", body: "Natural language to production-ready JavaScript plugins for Spigot, Paper and the Bedrock Scripting API." },
  { icon: Cube, title: "Voxel Model Generator", body: "Generate instrumented .bbmodel files with perfect voxel geometry, pivots and baked pixel textures." },
  { icon: Bolt, title: "Immersive 3D Simulation", body: "Inspect animated bones in a real-time WebGL sandbox with lighting, physics and environment shaders." },
  { icon: Globe, title: "Real-Time Network", body: "Publish to the world over encrypted WebSockets. Assets stream to every node without a page reload." },
  { icon: Lock, title: "Secure Master Admin", body: "A cryptographic gateway guards the system matrix — live feed, GPU telemetry and code sandbox." },
  { icon: Anvil, title: "Browser Native IDE", body: "Syntax-highlighted editor, live linting, event-tree mapping and dependency injection — zero setup." },
];

export default function Home() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (getSession()) router.replace("/app");
  }, [router]);

  const authed = (s: Session) => {
    setSession(s);
    router.push("/app");
  };

  const guest = () =>
    authed({ username: "Guest Forger", email: "guest@modforge.dev", method: "guest", at: Date.now() });

  return (
    <div className="min-h-screen relative overflow-x-clip">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 hero-grid" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 540px at 18% -6%, rgba(193,149,28,0.16), transparent 60%), radial-gradient(900px 520px at 88% 12%, rgba(226,182,58,0.13), transparent 55%), radial-gradient(800px 520px at 50% 115%, rgba(138,109,24,0.09), transparent 60%)",
          }}
        />
        {CUBES.map((c, i) => (
          <span
            key={i}
            className="mf-cube"
            style={{
              "--x": c.x,
              "--y": c.y,
              "--s": `${c.s}px`,
              "--tx": `${c.tx}px`,
              "--ty": `${c.ty}px`,
              "--d": c.d,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <Wordmark />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-pale bg-gold-pale/40 font-mono text-[9.5px] uppercase tracking-widest text-gold-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-mf-pulse" />
            forgecore v3.1 online
          </span>
          <button
            type="button"
            onClick={() => setShow(true)}
            className="h-10 px-5 rounded-xl text-bone bg-gradient-to-r from-gold-deep via-gold to-gold-bright hover:brightness-105 active:scale-95 transition-all font-medium text-[13px] shadow-[0_12px_28px_-10px_rgba(193,149,28,0.9)]"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 md:px-10 pt-16 md:pt-28 pb-10">
        <span className="mb-6 px-4 py-1.5 rounded-full border border-gold-pale bg-bone/70 backdrop-blur font-mono text-[10px] uppercase tracking-[0.2em] text-gold-deep">
          next-generation minecraft development platform
        </span>

        <h1 className="max-w-4xl text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] text-ink">
          Forge Minecraft&rsquo;s future
          <br />
          <span className="mf-conic">in seconds.</span>
        </h1>

        <p className="max-w-xl mt-6 text-[15.5px] md:text-[17px] leading-relaxed text-ink-2">
          Describe it. Type it. Publish it. ModForge&rsquo;s custom AI engine turns plain English into
          production-ready plugins and pixel-perfect 3D models — without an IDE, a compiler, or a single
          configuration file.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-9">
          <button
            type="button"
            onClick={() => setShow(true)}
            className="h-13 px-8 h-[52px] rounded-2xl text-bone bg-gradient-to-r from-gold-deep via-gold to-gold-bright hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all font-semibold text-[15px] shadow-[0_22px_48px_-16px_rgba(193,149,28,0.95)]"
          >
            Start Forging →
          </button>
          <button
            type="button"
            onClick={guest}
            className="h-[52px] px-8 rounded-2xl bg-bone/80 border border-hairline hover:border-gold-pale text-ink-2 hover:text-ink transition-all font-medium text-[14px] backdrop-blur"
          >
            Explore demo as guest
          </button>
        </div>

        <div className="flex items-center gap-6 mt-12 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
          <span>✦ voxel math</span>
          <span>✦ webgl simulation</span>
          <span>✦ live websocket sync</span>
        </div>
      </section>

      {/* features bento */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-24 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="glass-card rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform duration-300"
            >
              <span className="w-10 h-10 grid place-items-center rounded-xl text-gold-deep bg-gold-pale/60 border border-gold-pale">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-semibold tracking-tight text-[14.5px] text-ink">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-hairline py-8 text-center font-mono text-[9.5px] uppercase tracking-[0.24em] text-ink-3">
        modforge · where virtual imagination is hammered into reality
      </footer>

      <AnimatePresence>
        {show && <AuthModal open={show} onClose={() => setShow(false)} onAuthed={authed} onGuest={guest} />}
      </AnimatePresence>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Cpu, Gauge, Play, Shield, X, Script, Box, Fence } from "@/components/icons";
import { Card, PanelHeader, Pill, Meter, StatusDot } from "@/components/ui";
import { LogoMark } from "@/components/brand";

interface FeedItem {
  id: number;
  type: "JS" | "BBMODEL" | "TEX";
  name: string;
  from: string;
  tier: "S" | "A" | "B";
  time: string;
}

const POOL: Omit<FeedItem, "id" | "time">[] = [
  { type: "JS", name: "cosmic-economy.js", from: "Aether Prime", tier: "S" },
  { type: "BBMODEL", name: "steampunk-hook.bbmodel", from: "ForgeCore forge", tier: "A" },
  { type: "JS", name: "anti-cheat-motion.js", from: "Netherwatch", tier: "S" },
  { type: "TEX", name: "ender_quartz_16.png", from: "VoxelPaint", tier: "B" },
  { type: "JS", name: "factions-warscore.js", from: "Citadel Labs", tier: "A" },
  { type: "BBMODEL", name: "dragon-scale.bbmodel", from: "Wyrmworks", tier: "S" },
  { type: "JS", name: "grappling-hook.js", from: "modforge internal", tier: "S" },
  { type: "TEX", name: "gold_reinforced.png", from: "ForgeCore forge", tier: "A" },
];

const TYPE_COLOR: Record<FeedItem["type"], string> = {
  JS: "text-gold-deep bg-gold-pale/60 border-gold-pale",
  BBMODEL: "text-[#7a5c12] bg-[#f3ecd9] border-[#e6d9ac]",
  TEX: "text-[#4a6b28] bg-[#eaf3e4] border-[#d6e6c8]",
};

const RESOURCE_ROWS = [
  { label: "GPU core temp", value: "71°C", width: 71, ok: true },
  { label: "Active VRAM", value: "38.2 GB / 48 GB", width: 80, ok: true },
  { label: "Inference queue", value: "0.4 s", width: 12, ok: true },
  { label: "Synthetic tokens / s", value: "1,284", width: 64, ok: true },
];

const MODELS = [
  { id: "bbm_0x7F3A91", name: "steampunk-hook.bbmodel", bones: 7, cubes: 16, uv: "100%", ok: true },
  { id: "bbm_0x22C0F4", name: "dragon-scale.bbmodel", bones: 11, cubes: 42, uv: "98.4%", ok: true },
  { id: "bbm_0x9E1B7D", name: "ender-keystone.bbmodel", bones: 4, cubes: 9, uv: "99.1%", ok: true },
];

export default function AdminDashboard({ open, onExit }: { open: boolean; onExit: () => void }) {
  const [feed, setFeed] = useState<FeedItem[]>(() =>
    POOL.slice(0, 5).map((p, i) => ({ ...p, id: i, time: "10:0" + (i + 1) }))
  );
  const tickRef = useRef(0);
  const [sandbox, setSandbox] = useState<"idle" | "running" | "done">("idle");
  const [sandboxLog, setSandboxLog] = useState<string[]>([]);

  useEffect(() => {
    const iv = setInterval(() => {
      tickRef.current += 1;
      const item = POOL[tickRef.current % POOL.length];
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setFeed((f) => [{ ...item, id: Date.now(), time: now }, ...f].slice(0, 8));
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  const runSandbox = useCallback(() => {
    setSandbox("running");
    setSandboxLog([]);
    const lines = [
      "> static analysis ........................ PASS",
      "> loop bounds ............................ PASS",
      "> heap allocation (48 samples) ........... PASS",
      "> timers / async leak scan ............... PASS",
    ];
    lines.forEach((l, i) => {
      setTimeout(() => setSandboxLog((v) => [...v, l]), (i + 1) * 380);
    });
    setTimeout(() => {
      setSandboxLog((v) => [...v, "> verdict: SAFE — approved for distribution"]);
      setSandbox("done");
    }, lines.length * 380 + 260);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: open ? 0.5 : 0.15 }}
      className="fixed inset-0 z-40 overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #f7f3e7 0%, #efe8d6 100%)",
        visibility: open ? "visible" : "hidden",
        pointerEvents: open ? "auto" : "none",
      }}
      aria-hidden={!open}
    >
      <div className="sticky top-0 z-30 border-b border-hairline bg-bone/80 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <div className="leading-none">
              <p className="font-mono font-semibold tracking-[0.18em] text-[13px] text-ink">MASTER ADMIN</p>
              <p className="font-mono text-[8.5px] tracking-[0.24em] text-gold-deep uppercase mt-1">
                system awareness · secure session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ms-2 hidden md:flex">
            <StatusDot />
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold-deep">signed · ecdsa-p384</span>
          </div>

          <div className="flex-1" />

          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-ink-2 bg-paper border border-hairline hover:text-ink hover:border-gold-pale active:scale-95 transition-all font-mono text-[11px] uppercase tracking-widest"
          >
            <X className="w-3.5 h-3.5" />
            Secure Exit
          </button>
        </div>
      </div>

      <div className="p-4 md:p-5 grid grid-cols-12 gap-4 max-w-[1500px] mx-auto">
        {/* Global Feed Matrix */}
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="col-span-12 lg:col-span-7"
        >
          <Card className="h-full">
            <PanelHeader
              icon={<Activity className="w-3.5 h-3.5" />}
              title="Global Feed Matrix"
              tag="live stream"
              right={
                <div className="flex items-center gap-1.5">
                  <Pill>8 in view</Pill>
                  <Pill tone="plain">auto-scroll</Pill>
                </div>
              }
            />
            <div className="scroll-thin overflow-y-auto max-h-[460px] p-4 flex flex-col gap-2">
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    i === 0 ? "border-gold-pale bg-gold-pale/30" : "border-hairline bg-bone/70"
                  }`}
                >
                  <span className={`shrink-0 px-2 py-1 rounded-md border font-mono text-[9.5px] uppercase tracking-wider ${TYPE_COLOR[item.type]}`}>
                    {item.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[12px] text-ink">{item.name}</p>
                    <p className="truncate font-mono text-[10px] text-ink-3">creator · {item.from}</p>
                  </div>
                  <span className="font-mono text-[10px] text-gold-deep border border-gold-pale bg-bone rounded px-1.5 py-0.5">
                    tier {item.tier}
                  </span>
                  <span className="shrink-0 font-mono text-[9.5px] text-ink-3">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* AI Resource Allocation */}
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="col-span-12 lg:col-span-5"
        >
          <Card className="h-full">
            <PanelHeader
              icon={<Cpu className="w-3.5 h-3.5" />}
              title="AI Resource Allocation"
              tag="gpu-cluster"
              right={<Pill tone="ok">healthy</Pill>}
            />
            <div className="flex flex-col gap-4 p-4">
              {RESOURCE_ROWS.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10.5px] uppercase tracking-widest text-ink-3">{r.label}</span>
                    <span className="font-mono text-[11.5px] text-gold-deep">{r.value}</span>
                  </div>
                  <Meter value={r.width} className="h-2" />
                </div>
              ))}

              <div className="rounded-xl border border-hairline bg-paper/70 p-3 mt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-3 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-gold-deep" /> inference throughput
                  </span>
                  <span className="font-mono text-[10px] text-gold-deep">1.28k tok/s</span>
                </div>
                <div className="flex items-end gap-1 h-10">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = 20 + ((i * 37 + (i % 5) * 12) % 60);
                    return (
                      <span
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-gold-deep/70 to-gold-bright/80"
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Code Sandbox Executive */}
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="col-span-12 lg:col-span-5"
        >
          <Card className="h-full">
            <PanelHeader
              icon={<Fence className="w-3.5 h-3.5" />}
              title="Code Sandbox Executive"
              tag="isolation"
              right={
                <Pill tone={sandbox === "done" ? "ok" : "plain"}>
                  {sandbox === "running" ? "executing" : sandbox === "done" ? "safe" : "armed"}
                </Pill>
              }
            />
            <div className="flex flex-col gap-3 p-4 flex-1">
              <div className="flex items-center justify-between rounded-xl border border-hairline bg-paper/70 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Script className="w-3.5 h-3.5 text-gold-deep" />
                  <span className="font-mono text-[11px] text-ink-2">grappling_hook.js</span>
                </div>
                <span className="font-mono text-[9.5px] text-ink-3 uppercase tracking-wider">container 0x3E</span>
              </div>

              <button
                type="button"
                onClick={runSandbox}
                disabled={sandbox === "running"}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-bone bg-gradient-to-r from-gold-deep to-gold hover:brightness-105 hover:scale-[1.01] active:scale-95 disabled:opacity-60 transition-all font-mono text-[11.5px] uppercase tracking-widest"
              >
                <Play className="w-3.5 h-3.5" />
                Run Stress Test
              </button>

              <div className="scroll-thin flex-1 min-h-[120px] rounded-xl bg-[#241b0a] border border-[#4a3a15] p-3.5 font-mono text-[10.5px] leading-[1.9]">
                {sandbox === "idle" && (
                  <p className="text-[#a8945a]">awaiting sandbox session…</p>
                )}
                {sandboxLog.map((l, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={l.includes("SAFE") ? "text-[#e2b63a]" : "text-[#d9c98d]"}
                  >
                    {l}
                  </motion.p>
                ))}
                {sandbox === "running" && <span className="text-[#e2b63a] animate-pulse">▍</span>}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Model Validation Matrix */}
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24 }}
          className="col-span-12 lg:col-span-7"
        >
          <Card className="h-full">
            <PanelHeader
              icon={<Box className="w-3.5 h-3.5" />}
              title="Model Validation Matrix"
              tag="bbmodel profiler"
              right={<Pill tone="ok">3 compliant</Pill>}
            />
            <div className="p-4 flex flex-col gap-2.5">
              {MODELS.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-bone/70 px-3.5 py-3">
                  <span className="w-9 h-9 shrink-0 grid place-items-center rounded-lg bg-gold-pale/60 text-gold-deep border border-gold-pale">
                    <Box className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[11.5px] text-ink">{m.name}</p>
                    <p className="font-mono text-[9.5px] text-ink-3">
                      {m.id} · {m.bones} bones · {m.cubes} cubes
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-2">uv</span>
                    <Meter value={m.uv === "100%" ? 100 : 98} className="w-16" />
                    <span className="font-mono text-[10px] text-gold-deep w-12">{m.uv}</span>
                  </div>
                  <Pill tone="ok">
                    <Shield className="w-3 h-3" /> safe
                  </Pill>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>
      </div>
    </motion.div>
  );
}
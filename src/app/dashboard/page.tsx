"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ModProject } from "@/lib/types";
import { LOADERS, LOADER_ICONS } from "@/lib/types";
import ThemePicker from "@/components/ThemePicker";

function LoaderIcon({ loader }: { loader: string }) {
  const svg = LOADER_ICONS[loader as keyof typeof LOADER_ICONS];
  if (!svg) return null;
  return (
    <span className="w-5 h-5 inline-block" dangerouslySetInnerHTML={{ __html: svg.replace('currentColor', getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#d4af37') }} />
  );
}

export default function Dashboard() {
  const [mods, setMods] = useState<ModProject[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("modcraft_projects");
    if (stored) {
      try { setMods(JSON.parse(stored)); } catch {}
    }
  }, []);

  function deleteMod(id: string) {
    const updated = mods.filter((m) => m.id !== id);
    setMods(updated);
    localStorage.setItem("modcraft_projects", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 transition-all duration-300 group-hover:scale-105 group-hover:brightness-110">
              <Image src="/icon.png" alt="" fill className="rounded-lg" />
            </div>
            <span className="text-lg font-bold tracking-[1px] uppercase text-white/90">
              ModCraft
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemePicker />
            <button onClick={() => router.push("/")} className="text-white/20 hover:text-white/50 transition-colors text-xs">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Mods</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/60" />
              <p className="text-white/25 text-sm">
                {mods.length} project{mods.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[var(--color-bg)] text-sm font-bold transition-all duration-200 active:scale-[0.97] hover:brightness-110"
            style={{ background: "var(--color-primary)" }}
          >
            <span className="text-lg leading-none">+</span> New Mod
          </Link>
        </div>

        {mods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/[0.04] rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-white/[0.06]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5z"/></svg>
            </div>
            <h2 className="text-xl font-semibold text-white/30 mb-1.5">No mods yet</h2>
            <p className="text-white/15 text-sm mb-8">Create your first Minecraft mod project</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[var(--color-bg)] text-sm font-bold transition-all duration-200 active:scale-[0.97] hover:brightness-110"
              style={{ background: "var(--color-primary)" }}
            >
              <span className="text-lg leading-none">+</span> Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mods.map((mod, i) => (
              <Link
                key={mod.id}
                href={`/dashboard/${mod.id}`}
                className="group block rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 border border-white/[0.04] hover:border-[var(--color-primary)]/20"
                style={{
                  background: "linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)",
                  animation: mounted ? `cardIn 0.4s ease-out ${i * 0.05}s both` : "none",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(var(--color-primary-rgb), 0.08)" }}>
                    <LoaderIcon loader={mod.loader} />
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); deleteMod(mod.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400 transition-all text-xs"
                  >
                    Delete
                  </button>
                </div>
                <h3 className="font-semibold text-white/90 mb-0.5 truncate group-hover:text-white transition-colors">{mod.name}</h3>
                <p className="text-white/20 text-xs truncate mb-4 leading-relaxed">{mod.description || "No description"}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md uppercase tracking-wider font-medium"
                    style={{ background: "rgba(var(--color-primary-rgb), 0.1)", color: "rgba(var(--color-primary-rgb), 0.6)" }}>
                    {mod.loader}
                  </span>
                  <span className="px-2 py-0.5 bg-white/[0.03] text-white/20 rounded-md">MC {mod.version}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.03]">
                  <span className="text-white/[0.08] text-[10px]">{new Date(mod.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="text-white/[0.08] text-[10px]">{mod.files.length} file{mod.files.length !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

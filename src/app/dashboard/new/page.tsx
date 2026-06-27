"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ModProject, ModLoader } from "@/lib/types";
import { MC_VERSIONS, BEDROCK_VERSIONS, LOADERS, LOADER_ICONS } from "@/lib/types";

const JAVA_LOADERS = new Set(["fabric", "forge", "neoforge", "quilt", "paper", "velocity"]);
const isJavaLoader = (l: string) => JAVA_LOADERS.has(l);

function LoaderIcon({ loader, active }: { loader: string; active?: boolean }) {
  const svg = LOADER_ICONS[loader as keyof typeof LOADER_ICONS];
  if (!svg) return null;
  const fallback = active ? '#d4af37' : '#ffffff40';
  return (
    <span className="w-6 h-6 inline-block" dangerouslySetInnerHTML={{ __html: svg.replace('currentColor', active ? (getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || fallback) : fallback) }} />
  );
}

export default function NewMod() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [loader, setLoader] = useState<ModLoader | "">("");
  const [version, setVersion] = useState("");

  function handleCreate() {
    if (!name || !description || !author || !loader || !version) return;

    const project: ModProject = {
      id: crypto.randomUUID(),
      name,
      description,
      loader: loader as ModLoader,
      version,
      author,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files: [],
      generated: false,
    };

    const stored = localStorage.getItem("modcraft_projects");
    const projects: ModProject[] = stored ? JSON.parse(stored) : [];
    projects.push(project);
    localStorage.setItem("modcraft_projects", JSON.stringify(projects));

    router.push(`/dashboard/${project.id}`);
  }

  const valid = name && description && author && loader && version;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 transition-all duration-300 group-hover:scale-105">
              <Image src="/icon.png" alt="" fill className="rounded-lg" />
            </div>
            <span className="text-lg font-bold tracking-[1px] uppercase text-white/90">ModCraft</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-white/20 hover:text-[var(--color-primary)] text-xs transition-colors mb-8 group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Create New Mod</h1>
        <p className="text-white/20 text-sm mb-10">Set up a new Minecraft modding project</p>

        <div className="space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="group">
              <label className="block text-white/20 text-[10px] font-semibold uppercase tracking-[1.5px] mb-2 group-focus-within:text-[var(--color-primary)]/60 transition-colors">Mod Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Mod"
                className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white/80 text-sm outline-none transition-all placeholder:text-white/10 focus:border-[var(--color-primary)]/30 focus:bg-[var(--color-primary)]/[0.02]"
              />
            </div>
            <div className="group">
              <label className="block text-white/20 text-[10px] font-semibold uppercase tracking-[1.5px] mb-2 group-focus-within:text-[var(--color-primary)]/60 transition-colors">Author</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white/80 text-sm outline-none transition-all placeholder:text-white/10 focus:border-[var(--color-primary)]/30 focus:bg-[var(--color-primary)]/[0.02]"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-white/20 text-[10px] font-semibold uppercase tracking-[1.5px] mb-2 group-focus-within:text-[var(--color-primary)]/60 transition-colors">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your mod..."
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white/80 text-sm outline-none transition-all placeholder:text-white/10 focus:border-[var(--color-primary)]/30 focus:bg-[var(--color-primary)]/[0.02] resize-none"
            />
          </div>

          <div>
            <label className="block text-white/20 text-[10px] font-semibold uppercase tracking-[1.5px] mb-3">Mod Loader</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LOADERS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLoader(l.id)}
                  data-active={loader === l.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border text-xs transition-all cursor-pointer"
                  style={{
                    borderColor: loader === l.id ? "rgba(var(--color-primary-rgb),0.3)" : "rgba(255,255,255,0.04)",
                    background: loader === l.id ? "rgba(var(--color-primary-rgb),0.03)" : "rgba(255,255,255,0.02)",
                    boxShadow: loader === l.id ? `0 0 20px rgba(var(--color-primary-rgb),0.04)` : "none",
                  }}
                >
                  <LoaderIcon loader={l.id} active={loader === l.id} />
                  <span style={{ color: loader === l.id ? "rgba(var(--color-primary-rgb),0.8)" : "rgba(255,255,255,0.4)" }}>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label className="block text-white/20 text-[10px] font-semibold uppercase tracking-[1.5px] mb-2 group-focus-within:text-[var(--color-primary)]/60 transition-colors">
              {loader && !isJavaLoader(loader) ? "Bedrock Version" : "Minecraft Version"}
            </label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white/80 text-sm outline-none transition-all focus:border-[var(--color-primary)]/30 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[var(--color-surface)]">
                {loader && !isJavaLoader(loader) ? "Select Bedrock version" : "Select version"}
              </option>
              {(loader && !isJavaLoader(loader) ? BEDROCK_VERSIONS : MC_VERSIONS).map((v) => (
                <option key={v} value={v} className="bg-[var(--color-surface)]">Minecraft {v}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreate}
            disabled={!valid}
            className="relative w-full py-3.5 rounded-xl text-[var(--color-bg)] text-sm font-bold tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-15 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden group"
            style={{ background: "var(--color-primary)" }}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors disabled:hidden" />
            <span className="relative z-10">Create Project</span>
          </button>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ModProject, ModFile } from "@/lib/types";
import { LOADERS, LOADER_ICONS } from "@/lib/types";
import TerminalPanel from "@/components/TerminalPanel";
import ThemePicker from "@/components/ThemePicker";

function LoaderIcon({ loader }: { loader: string }) {
  const svg = LOADER_ICONS[loader as keyof typeof LOADER_ICONS];
  if (!svg) return null;
  return <span className="w-5 h-5 inline-block" dangerouslySetInnerHTML={{ __html: svg.replace('currentColor', getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#d4af37') }} />;
}

function FileIcon({ path }: { path: string }) {
  const ext = path.split('.').pop()?.toLowerCase();
  const icon = ext === "java" ? "Jv" : ext === "json" ? "Js" : ext === "toml" || ext === "properties" ? "Cf" : ext === "gradle" || ext === "kts" ? "Gd" : ext === "yml" || ext === "yaml" ? "Fi" : ext === "md" ? "Md" : ext === "sh" || ext === "bat" ? "Sh" : "Fi";
  return <span className="text-[10px] font-mono text-white/20 w-5 text-center shrink-0">{icon}</span>;
}

export default function ModDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ModProject | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [notification, setNotification] = useState("");
  const [notifError, setNotifError] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<{ jarUrl?: string; jarName?: string; zipUrl?: string; buildError?: string; note?: string } | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem("modcraft_projects");
    if (stored) {
      const projects: ModProject[] = JSON.parse(stored);
      const p = projects.find((m) => m.id === id);
      if (p) {
        setProject(p);
        if (p.files.length > 0) { setSelectedFile(p.files[0].path); setEditorContent(p.files[0].content); }
      }
    }
  }, [id]);

  const save = useCallback((updated: ModProject) => {
    const stored = localStorage.getItem("modcraft_projects");
    const projects: ModProject[] = stored ? JSON.parse(stored) : [];
    const idx = projects.findIndex((m) => m.id === id);
    if (idx !== -1) { projects[idx] = updated; localStorage.setItem("modcraft_projects", JSON.stringify(projects)); setProject(updated); }
  }, [id]);

  function notify(msg: string, isError = false) {
    clearTimeout(notifTimer.current);
    setNotification(msg);
    setNotifError(isError);
    notifTimer.current = setTimeout(() => { setNotification(""); setNotifError(false); }, 4000);
  }

  function selectFile(path: string) {
    if (!project) return;
    const prev = project.files.find((f) => f.path === selectedFile);
    if (prev && editorContent !== prev.content) save({ ...project, files: project.files.map((f) => f.path === selectedFile ? { ...f, content: editorContent } : f), updatedAt: Date.now() });
    setSelectedFile(path);
    setEditorContent(project.files.find((f) => f.path === path)?.content || "");
  }

  function handleContentChange(content: string) {
    setEditorContent(content);
    if (!project || !selectedFile) return;
    save({ ...project, files: project.files.map((f) => f.path === selectedFile ? { ...f, content } : f), updatedAt: Date.now() });
  }

  function deleteFile(path: string) {
    if (!project) return;
    const updated = project.files.filter((f) => f.path !== path);
    save({ ...project, files: updated, updatedAt: Date.now() });
    if (selectedFile === path) { setSelectedFile(updated[0]?.path || null); setEditorContent(updated[0]?.content || ""); }
    notify("File deleted");
  }

  function addNewFile() {
    if (!project || !newFileName.trim()) return;
    const path = newFileName.trim();
    if (project.files.some((f) => f.path === path)) { notify("File already exists", true); return; }
    const ext = path.split('.').pop()?.toLowerCase();
    const content = ext === "java" ? "package com.example.mod;\n\npublic class Example {\n\n}" : ext === "json" ? "{}" : ext === "toml" || ext === "properties" ? "# config\n" : ext === "yml" || ext === "yaml" ? "# config\n" : "";
    const updated = [...project.files, { path, content }];
    save({ ...project, files: updated, updatedAt: Date.now() });
    setNewFileName(""); setShowNewFile(false); selectFile(path);
    notify("File created");
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    if (!project || !e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const path = file.webkitRelativePath || file.name;
      if (project.files.some((f) => f.path === path)) { notify("File already exists", true); return; }
      const updated = [...project.files, { path, content }];
      save({ ...project, files: updated, updatedAt: Date.now() });
      selectFile(path);
      notify(`Imported ${path}`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function importFolder() {
    if (!project) return;
    const input = document.createElement("input");
    input.type = "file"; input.webkitdirectory = true;
    input.onchange = (e) => {
      const fileList = (e.target as HTMLInputElement).files;
      if (!fileList) return;
      const arr = Array.from(fileList);
      let i = 0;
      const readNext = () => {
        if (i >= arr.length) return notify(`Imported ${arr.length} files`);
        const r = new FileReader();
        r.onload = (ev) => { const content = ev.target?.result as string; const path = arr[i].webkitRelativePath || arr[i].name; if (!project!.files.some((pf) => pf.path === path)) project!.files.push({ path, content }); i++; readNext(); };
        r.readAsText(arr[i]);
      };
      readNext();
      save({ ...project, files: [...project.files], updatedAt: Date.now() });
    };
    input.click();
  }

  async function handleAiGenerate() {
    if (!project || !aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: project.name, description: aiPrompt, loader: project.loader, version: project.version, author: project.author, customPrompt: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const newFiles: ModFile[] = data.files;
      const merged = [...project.files];
      let added = 0;
      for (const f of newFiles) { if (!merged.some((e) => e.path === f.path)) { merged.push(f); added++; } }
      save({ ...project, files: merged, updatedAt: Date.now() });
      const source = data.source === "local" ? "local engine" : "AI";
      const detail = data.features ? ` [${data.features.join(", ")}]` : "";
      notify(`${source} generated ${newFiles.length} files (${added} new)${detail}`);
      if (newFiles.length > 0 && !merged.some((f) => f.path === selectedFile)) selectFile(newFiles[0].path);
      setShowAi(false);
    } catch (err) {
      notify(err instanceof Error ? err.message : "AI generation failed", true);
    } finally { setGenerating(false); }
  }

  async function exportAll() {
    if (!project || project.files.length === 0) return;
    setBuilding(true);
    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: project.name, files: project.files }),
      });
      const data = await res.json();
      if (data.jar) {
        const byteChars = atob(data.jar);
        const bytes = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/java-archive" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = data.jarName || `${project.name}.jar`;
        a.click(); URL.revokeObjectURL(url);
        notify(`Built ${data.jarName}`);
      } else if (data.zip) {
        const byteChars = atob(data.zip);
        const bytes = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, "_")}.zip`;
        a.click(); URL.revokeObjectURL(url);
        setBuildResult({ jarUrl: url, buildError: data.buildError, note: data.buildError ? "Build failed - ZIP with source returned instead" : data.note });
      } else {
        notify(data.error || "Build failed", true);
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : "Build failed", true);
    } finally { setBuilding(false); }
  }

  function deleteProject() {
    if (!project) return;
    const stored = localStorage.getItem("modcraft_projects");
    const projects: ModProject[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem("modcraft_projects", JSON.stringify(projects.filter((m) => m.id !== id)));
    router.push("/dashboard");
  }

  const ext = selectedFile?.split('.').pop()?.toLowerCase();
  const langMap: Record<string,string> = { java:"Java", json:"JSON", toml:"TOML", gradle:"Gradle", kts:"Kotlin", properties:"Properties", yml:"YAML", yaml:"YAML", md:"Markdown", sh:"Shell", bat:"Batch", xml:"XML", css:"CSS", html:"HTML", js:"JavaScript", ts:"TypeScript", mcmeta:"MCMETA", mcfunction:"MCFunction" };
  const lineCount = editorContent.split('\n').length;

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.02] flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-white/[0.06]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p className="text-white/30 text-sm mb-1">Project not found</p>
          <Link href="/dashboard" className="text-[var(--color-primary)]/60 hover:text-[var(--color-primary)] text-xs transition-colors">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentFile = project.files.find((f) => f.path === selectedFile);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-all duration-300 group-hover:scale-105">
              <Image src="/icon.png" alt="" fill className="rounded-lg" />
            </div>
            <span className="text-base font-bold tracking-[1px] uppercase text-white/90">ModCraft</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemePicker />
            <button onClick={() => router.push("/dashboard")} className="text-white/20 hover:text-white/50 transition-colors text-xs">Dashboard</button>
            <button onClick={deleteProject} className="text-white/15 hover:text-red-400 transition-colors text-xs">Delete</button>
          </div>
        </div>
      </header>

      {/* Notification */}
      <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm shadow-2xl backdrop-blur-md transition-all duration-300 ${notification ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
        style={{
          background: notifError ? "rgba(239,68,68,0.1)" : `rgba(var(--color-primary-rgb),0.08)`,
          borderColor: notifError ? "rgba(239,68,68,0.2)" : `rgba(var(--color-primary-rgb),0.15)`,
          color: notifError ? "rgb(239,68,68)" : `rgba(var(--color-primary-rgb),0.8)`,
          borderWidth: 1,
        }}>
        {notification}
      </div>

      {/* Project header */}
      <div className="border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(var(--color-primary-rgb),0.08)" }}>
              <LoaderIcon loader={project.loader} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-white/90">{project.name}</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide font-medium" style={{ background: "rgba(var(--color-primary-rgb),0.1)", color: "rgba(var(--color-primary-rgb),0.6)" }}>{project.loader}</span>
                <span className="px-2 py-0.5 bg-white/[0.03] text-white/20 text-[10px] rounded-md">MC {project.version}</span>
              </div>
              <p className="text-white/15 text-xs mt-0.5">{project.description} &middot; by {project.author}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 flex-wrap">
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.03] text-xs font-medium transition-all">Import File</button>
          <button onClick={importFolder} className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.03] text-xs font-medium transition-all">Import Folder</button>
          <button onClick={() => setShowNewFile(!showNewFile)} className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.03] text-xs font-medium transition-all">New File</button>
          <div className="w-px h-5 bg-white/[0.04] mx-1" />
          <button onClick={() => { setShowAi(!showAi); setTimeout(() => aiInputRef.current?.focus(), 100); }} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={showAi ? { background: "rgba(var(--color-primary-rgb),0.1)", color: "rgba(var(--color-primary-rgb),0.8)" } : { color: "rgba(var(--color-primary-rgb),0.5)" }}>
            AI Generate
          </button>
          <button onClick={() => setShowTerminal(!showTerminal)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={showTerminal ? { background: "rgba(var(--color-primary-rgb),0.1)", color: "rgba(var(--color-primary-rgb),0.8)" } : { color: "text-white/40" }}>
            Terminal
          </button>
          <div className="flex-1" />
          <button onClick={exportAll} disabled={project.files.length === 0 || building} className="px-4 py-1.5 rounded-lg text-[var(--color-bg)] text-xs font-bold tracking-wide transition-all active:scale-[0.97] disabled:opacity-20 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{ background: building ? "rgba(var(--color-primary-rgb),0.5)" : "var(--color-primary)" }}>
            {building ? <span className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-[var(--color-bg)]/30 border-t-[var(--color-bg)] rounded-full animate-spin" /> Building...</span> : "Build JAR"}
          </button>
          <input ref={fileInputRef} type="file" onChange={handleImport} className="hidden" />
        </div>

        {showNewFile && (
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <div className="flex items-center gap-2">
              <input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNewFile()} placeholder="path/to/file.java" className="flex-1 max-w-xs px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-white/70 text-xs font-mono outline-none transition-all placeholder:text-white/10 focus:border-[var(--color-primary)]/30" autoFocus />
              <button onClick={addNewFile} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: "rgba(var(--color-primary-rgb),0.1)", color: "rgba(var(--color-primary-rgb),0.8)" }}>Create</button>
            </div>
          </div>
        )}

        {showAi && (
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <div className="rounded-xl p-4 border" style={{ background: "rgba(var(--color-primary-rgb),0.02)", borderColor: "rgba(var(--color-primary-rgb),0.08)" }}>
              <label className="block text-white/20 text-[10px] uppercase tracking-widest mb-2 font-semibold">Describe what to build</label>
              <textarea ref={aiInputRef} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder='e.g. "Create a Fabric mod with a custom sword that glows"' rows={3} className="w-full px-4 py-3 bg-black/40 border border-white/[0.04] rounded-xl text-white/70 text-sm outline-none transition-all placeholder:text-white/10 focus:border-[var(--color-primary)]/20 resize-none font-mono leading-relaxed" />
              <div className="flex items-center justify-between mt-3">
                <p className="text-white/10 text-[10px]">Built-in mod AI - no API key needed</p>
                <div className="flex gap-2">
                  <button onClick={() => { setShowAi(false); setAiPrompt(""); }} className="px-3 py-1.5 text-white/30 hover:text-white/50 text-xs transition-colors">Cancel</button>
                  <button onClick={handleAiGenerate} disabled={generating || !aiPrompt.trim()} className="px-4 py-1.5 rounded-lg text-[var(--color-bg)] text-xs font-bold transition-all disabled:opacity-30 flex items-center gap-1.5" style={{ background: "var(--color-primary)" }}>
                    {generating ? <><div className="w-3 h-3 border-2 border-[var(--color-bg)]/30 border-t-[var(--color-bg)] rounded-full animate-spin" /> Generating...</> : "Generate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        <div className="w-full lg:w-64 border-r border-white/[0.03] flex-shrink-0">
          <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/10 font-semibold border-b border-white/[0.03]">Files ({project.files.length})</div>
          {project.files.length === 0 ? (
            <div className="px-4 py-12 text-center text-white/10 text-xs">
              <p className="mb-1">No files yet</p>
              <p className="text-[10px] text-white/[0.06]">Import, create, or use AI</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-280px)]">
              {project.files.map((file) => (
                <div key={file.path} data-active={selectedFile === file.path}
                  className="group flex items-center gap-2.5 px-4 py-2 cursor-pointer border-l-[1.5px] transition-all"
                  style={{
                    borderColor: selectedFile === file.path ? "var(--color-primary)" : "transparent",
                    background: selectedFile === file.path ? "rgba(var(--color-primary-rgb),0.04)" : "transparent",
                  }}
                  onClick={() => selectFile(file.path)}>
                  <FileIcon path={file.path} />
                  <span className="text-xs text-white/50 truncate flex-1 font-mono">{file.path}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteFile(file.path); }} className="opacity-0 group-hover:opacity-100 text-white/10 hover:text-red-400 text-[10px] transition-all shrink-0">x</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {currentFile ? (
            <>
              <div className="flex items-center justify-between px-5 py-2 border-b border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-white/25">{currentFile.path}</span>
                  <span className="text-[10px] text-white/[0.06]">{lineCount} lines</span>
                </div>
                <span className="text-[10px] text-white/10">{langMap[ext || ""] || "Text"}</span>
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 w-full min-h-[400px] lg:min-h-[calc(100vh-380px)] p-5 text-white/70 text-sm font-mono leading-relaxed outline-none resize-none placeholder:text-white/10 border-0"
                style={{ background: "rgba(0,0,0,0.3)" }}
                placeholder="Start coding..."
                spellCheck={false}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.02] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-white/[0.06]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <p className="text-white/15 text-sm">Select a file to edit</p>
                <p className="text-white/[0.06] text-xs mt-1">or import / create / AI-generate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTerminal && <TerminalPanel />}

      {/* Build result modal */}
      {buildResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setBuildResult(null)}>
          <div className="rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-white/[0.04]" style={{ background: "var(--color-surface)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: buildResult.buildError ? "rgba(239,68,68,0.1)" : "rgba(var(--color-primary-rgb),0.1)", color: buildResult.buildError ? "rgb(239,68,68)" : "rgba(var(--color-primary-rgb),0.8)" }}>
                {buildResult.buildError ? "!" : "OK"}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{buildResult.buildError ? "Build Failed" : "Build Complete"}</h3>
                <p className="text-white/25 text-xs mt-0.5">{buildResult.buildError ? "ZIP with source was downloaded instead" : "JAR downloaded successfully"}</p>
              </div>
            </div>
            {buildResult.buildError && (
              <div className="mb-5">
                <p className="text-white/15 text-[10px] uppercase tracking-widest mb-2 font-semibold">Build Error</p>
                <pre className="text-red-400/60 text-[11px] font-mono bg-black/40 rounded-xl p-4 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap border border-white/[0.03]">{buildResult.buildError}</pre>
              </div>
            )}
            <div className="mb-5">
              <p className="text-white/15 text-[10px] uppercase tracking-widest mb-2 font-semibold">Manual Build</p>
              <div className="text-white/40 text-xs space-y-1.5 bg-black/40 rounded-xl p-4 leading-relaxed border border-white/[0.03]">
                <p>1. Extract the ZIP to a folder</p>
                <p>2. Open terminal in that folder</p>
                <p>3. Run: <code className="text-white/70 font-mono">chmod +x gradlew</code></p>
                <p>4. Run: <code className="text-white/70 font-mono">./gradlew build</code></p>
                <p>5. Find your JAR in <code className="text-white/70 font-mono">build/libs/</code></p>
                <p className="text-white/15 text-[10px] pt-2">Requires JDK 21+. Download from <a href="https://adoptium.net" className="text-[var(--color-primary)]/60 hover:text-[var(--color-primary)]" target="_blank" rel="noopener">adoptium.net</a></p>
              </div>
            </div>
            <button onClick={() => setBuildResult(null)} className="w-full py-2.5 rounded-xl text-white/30 hover:text-white/60 text-xs transition-all border border-white/[0.04] hover:bg-white/[0.02]">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import Scripting from "@/components/scripting";
import VoxelGen from "@/components/voxel-gen";
import ModelViewer from "@/components/model-viewer";
import LiveEditor from "@/components/live-editor";
import NetworkPanel from "@/components/network-panel";
import AdminGate from "@/components/admin-gate";
import AdminDashboard from "@/components/admin-dashboard";
import { getSession } from "@/lib/session";
import { LogoMark } from "@/components/brand";

function BootScreen() {
  return (
    <div className="min-h-screen grid place-items-center bg-ivory">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-mf-pulse rounded-2xl">
          <LogoMark size={56} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold-deep">forging workspace…</span>
      </div>
    </div>
  );
}

export default function AppDashboard() {
  const router = useRouter();
  const [ready] = useState(() => Boolean(getSession()));
  const [admin, setAdmin] = useState<"idle" | "gate" | "open">("idle");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!ready) router.replace("/");
  }, [ready, router]);

  const scrollToPanel = useCallback((target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePublish = useCallback(() => setPublishing(true), []);
  const handlePublishDone = useCallback(() => setPublishing(false), []);

  if (!ready) return <BootScreen />;

  return (
    <div className="flex min-h-screen">
      <Sidebar onVault={() => setAdmin("gate")} onNavigate={scrollToPanel} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onAdmin={() => setAdmin("gate")} />

        <div
          id="workspace-top"
          className="grid grid-cols-12 gap-3 p-3 lg:p-4 auto-rows-[minmax(0,auto)] scroll-mt-4"
        >
          <div id="panel-scripts" className="col-span-12 lg:col-span-8 lg:row-span-2 scroll-mt-20">
            <Scripting publishing={publishing} onPublish={handlePublish} />
          </div>
          <div id="panel-voxel" className="col-span-12 md:col-span-6 lg:col-span-4 scroll-mt-20">
            <VoxelGen />
          </div>
          <div id="panel-model-viewer" className="col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-2 scroll-mt-20">
            <ModelViewer />
          </div>
          <div id="panel-editor" className="col-span-12 lg:col-span-8 scroll-mt-20">
            <LiveEditor />
          </div>
          <div id="panel-network" className="col-span-12 md:col-span-6 lg:col-span-4 scroll-mt-20">
            <NetworkPanel publishing={publishing} onDone={handlePublishDone} />
          </div>
        </div>
      </div>

      {/* Admin vault is always present in the DOM, revealed only by the passkey */}
      <AdminDashboard open={admin === "open"} onExit={() => setAdmin("idle")} />

      <AnimatePresence>
        {admin === "gate" && (
          <AdminGate
            onClose={() => setAdmin("idle")}
            onUnlock={() => setAdmin("open")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
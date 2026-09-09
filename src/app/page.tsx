"use client";

import { useCallback, useState } from "react";
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

export default function Home() {
  const [admin, setAdmin] = useState<"idle" | "gate" | "open">("idle");
  const [publishing, setPublishing] = useState(false);

  const handlePublish = useCallback(() => setPublishing(true), []);
  const handlePublishDone = useCallback(() => setPublishing(false), []);

  return (
    <div className="flex min-h-screen">
      <Sidebar onVault={() => setAdmin("gate")} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onAdmin={() => setAdmin("gate")} />

        <div className="grid grid-cols-12 gap-3 p-3 lg:p-4 auto-rows-[minmax(0,auto)]">
          <div className="col-span-12 lg:col-span-8 lg:row-span-2">
            <Scripting publishing={publishing} onPublish={handlePublish} />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <VoxelGen />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-2">
            <ModelViewer />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <LiveEditor />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <NetworkPanel publishing={publishing} onDone={handlePublishDone} />
          </div>

          {/* mobile nav fallback */}
          <div className="col-span-12 md:hidden">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3 text-center py-2">
              modcore v3.1 · obsidian-forge build 0412
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {admin === "gate" && (
          <AdminGate
            onClose={() => setAdmin("idle")}
            onUnlock={() => {
              setAdmin("open");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {admin === "open" && <AdminDashboard onExit={() => setAdmin("idle")} />}
      </AnimatePresence>
    </div>
  );
}
"use client";

import { useRef, useState } from "react";
import { Cube, Check } from "@/components/icons";
import { Card, PanelHeader } from "@/components/ui";
import { VOXEL_PROMPT_DEFAULT } from "@/lib/plugin";
import { UPSCALED_MODEL_STATS } from "@/lib/model";

const MILESTONES = ["voxel geometry", "uv bake", "tex 16×16"];

export default function VoxelGen() {
  const [prompt, setPrompt] = useState(VOXEL_PROMPT_DEFAULT);
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [doneCount, setDoneCount] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const forge = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("working");
    setDoneCount(0);
    MILESTONES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setDoneCount(i + 1), (i + 1) * 520));
    });
    timers.current.push(setTimeout(() => setPhase("done"), MILESTONES.length * 520 + 200));
  };

  return (
    <Card className="h-full">
      <PanelHeader icon={<Cube className="w-3.5 h-3.5" />} title="Voxel Asset Generator" tag="bbmodel" />

      <div className="flex flex-col gap-3 p-4 flex-1">
        <label className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            spellCheck={false}
            className="w-full resize-none rounded-xl bg-paper border border-hairline px-4 py-3 text-[13px] leading-relaxed outline-none transition-all focus:border-gold-pale focus:ring-4 focus:ring-gold-pale/50 placeholder:text-ink-3/60"
            placeholder="Describe the physical form you want to forge…"
          />
        </label>

        <button
          type="button"
          onClick={forge}
          disabled={phase === "working"}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-gold-deep bg-bone border border-gold-pale hover:border-gold hover:bg-gold-pale/50 active:scale-95 disabled:opacity-60 transition-all font-medium text-[12.5px]"
        >
          <Cube className="w-4 h-4" />
          {phase === "working" ? "Voxelizing…" : "Forge Model"}
        </button>

        {phase !== "idle" && (
          <div className="flex flex-wrap gap-1.5">
            {MILESTONES.map((m, i) => (
              <span
                key={m}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wide border transition-all ${
                  i < doneCount
                    ? "bg-gold-pale/70 text-gold-deep border-gold-pale"
                    : i === doneCount && phase === "working"
                      ? "bg-gold-pale/40 text-ink-3 border-hairline animate-pulse"
                      : "bg-paper text-ink-3 border-hairline"
                }`}
              >
                {i < doneCount && <Check className="w-3 h-3" />}
                {m}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between px-3 py-2.5 rounded-xl bg-paper border border-hairline">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${phase === "done" ? "bg-gold animate-mf-pulse" : "bg-ink-3/40"}`} />
            <span className="truncate font-mono text-[10.5px] text-ink-2">
              index.grappling_hook.bbmodel
            </span>
          </div>
          <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-ink-3">
            {phase === "done" ? `${UPSCALED_MODEL_STATS.bones} bones · ${UPSCALED_MODEL_STATS.cubes} cubes` : "queued"}
          </span>
        </div>
      </div>
    </Card>
  );
}
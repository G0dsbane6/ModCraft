"use client";

import { useRef, useState } from "react";
import { Bolt, Globe, Shield } from "@/components/icons";
import { Card, PanelHeader, Pill } from "@/components/ui";
import { CodeBlocks } from "@/lib/highlight";
import { PLUGIN_SOURCE } from "@/lib/plugin";

const STAGES = ["parsing intent", "mapping event tree", "inlining energy store", "optimizing event loop"];

export default function Scripting({
  publishing,
  onPublish,
}: {
  publishing: boolean;
  onPublish: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "done">("idle");
  const [stageIdx, setStageIdx] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const generate = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("thinking");
    setStageIdx(0);
    STAGES.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setStageIdx(i + 1), (i + 1) * 460)
      );
    });
    timers.current.push(
      setTimeout(() => setPhase("done"), STAGES.length * 460 + 240)
    );
  };

  const deployed = publishing;

  return (
    <Card className="h-full min-h-[430px]">
      <PanelHeader
        icon={<Bolt className="w-3.5 h-3.5" />}
        title="AI Scripting Terminal"
        tag="forgecore v3.1"
        right={
          <div className="flex items-center gap-1.5">
            <Pill tone={phase === "done" && !deployed ? "ok" : "plain"}>
              {phase === "thinking" ? "synthesizing…" : phase === "done" ? "script ready" : "standby"}
            </Pill>
          </div>
        }
      />

      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        <label className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            spellCheck={false}
            className="w-full resize-none rounded-xl bg-paper border border-hairline px-4 py-3.5 text-[13px] leading-relaxed outline-none transition-all focus:border-gold-pale focus:ring-4 focus:ring-gold-pale/50 placeholder:text-ink-3/60"
            placeholder="Describe the server logic you want to forge…"
          />
          <span className="absolute -top-2 left-3 px-1.5 text-[10px] font-mono uppercase tracking-widest text-ink-3 bg-ivory">
            natural language blueprint
          </span>
        </label>

        <button
          type="button"
          onClick={generate}
          disabled={phase === "thinking"}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-bone bg-gradient-to-r from-gold-deep via-gold to-gold-bright hover:brightness-105 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:pointer-events-none transition-all font-medium text-[13px] shadow-[0_10px_26px_-10px_rgba(193,149,28,0.8)]"
        >
          <Bolt className="w-4 h-4" />
          {phase === "thinking" ? "Forging…" : "Forge Script"}
        </button>

        {phase === "thinking" && (
          <div className="flex flex-col gap-1.5 px-1">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-2 font-mono text-[11px]">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < stageIdx ? "bg-gold" : i === stageIdx ? "bg-gold-bright animate-pulse" : "bg-hairline"
                  }`}
                />
                <span className={i < stageIdx ? "text-gold-deep" : i === stageIdx ? "text-ink-2" : "text-ink-3"}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3">scripts /</span>
                <span className="font-mono text-[11px] text-gold-deep">grappling_hook.js</span>
                <Pill>16 events wired</Pill>
                <Pill tone="ok">0 leaks</Pill>
              </div>
            </div>

            <div className="flex-1 min-h-[140px] overflow-hidden rounded-xl border border-hairline bg-bone">
              <div className="scroll-thin h-full overflow-auto p-4 font-mono text-[11.5px] leading-[1.75] whitespace-pre">
                <CodeBlocks code={PLUGIN_SOURCE.split("\n").slice(0, 16).join("\n")} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-mono text-ink-3">
                <Shield className="w-3.5 h-3.5 text-gold-deep" />
                sandbox-verified · es2024 · minecraft scripting api
              </div>
              <button
                type="button"
                onClick={onPublish}
                disabled={deployed}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gold-deep bg-bone border border-gold-pale hover:border-gold hover:bg-gold-pale/50 active:scale-95 disabled:opacity-60 transition-all font-medium text-[12.5px]"
              >
                <Globe className="w-4 h-4" />
                {deployed ? "Broadcasting…" : "Publish to Network"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
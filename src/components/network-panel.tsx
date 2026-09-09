"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check, Activity } from "@/components/icons";
import { Card, PanelHeader, Pill, Meter } from "@/components/ui";

const STAGES = ["encoding payload", "compressing textures", "broadcasting to hub", "distributing to nodes"];

export default function NetworkPanel({
  publishing,
  onDone,
}: {
  publishing: boolean;
  onDone: () => void;
}) {
  const [stage, setStage] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const [lastPushed, setLastPushed] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!publishing) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    STAGES.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setStage(i);
          if (i === 0) {
            setCompleted(false);
            setLastPushed(null);
          }
        }, i * 720)
      );
      timers.current.push(setTimeout(() => setStage(-1), i * 720 + 640));
    });
    timers.current.push(
      setTimeout(() => {
        setCompleted(true);
        setLastPushed(new Date().toLocaleTimeString());
        onDone();
      }, STAGES.length * 720 + 200)
    );
  }, [publishing, onDone]);

  return (
    <Card className="h-full">
      <PanelHeader
        icon={<Globe className="w-3.5 h-3.5" />}
        title="Real-Time Network"
        tag="websocket"
        right={<Pill tone={completed ? "ok" : "plain"}>{completed ? "deployed" : "live"}</Pill>}
      />

      <div className="flex flex-col gap-4 p-4 flex-1">
        {!completed ? (
          <div className="flex flex-col gap-2.5">
            {STAGES.map((s, i) => (
              <div
                key={s}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 transition-all ${
                  stage === i
                    ? "border-gold-pale bg-gold-pale/50"
                    : "border-hairline bg-paper/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full grid place-items-center ${
                      stage === i
                        ? "bg-gold text-bone animate-pulse"
                        : i < stage
                          ? "bg-gold text-bone"
                          : "bg-hairline text-transparent"
                    }`}
                  >
                    {stage === i ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-bone" />
                    ) : i < stage ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : null}
                  </span>
                  <span className={`font-mono text-[11px] ${stage === i ? "text-ink" : i < stage ? "text-ink-2" : "text-ink-3"}`}>
                    {s}
                  </span>
                </div>
                {stage === i && <Meter value={60} className="w-20" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-11 h-11 rounded-full grid place-items-center bg-gold-pale text-gold-deep animate-mf-pulse">
              <Check className="w-5 h-5" />
            </div>
            <span className="font-mono text-[12px] text-gold-deep uppercase tracking-wider">broadcast complete</span>
            <span className="font-mono text-[10px] text-ink-3">
              {lastPushed} · 4,812 nodes synced · ack in 210ms
            </span>
          </div>
        )}

        <div className="mt-auto border-t border-hairline pt-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="eq-bar w-1 rounded-full bg-gold/70"
                style={{ height: 6 + ((i * 7) % 14), animationDelay: `${i * 0.12}s` }}
              />
            ))}
            <span className="ml-2 font-mono text-[10px] text-ink-3 uppercase tracking-wider">
              {completed ? "idle" : publishing ? "streaming" : "awaiting payload"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-paper border border-hairline p-2.5">
              <span className="block font-mono text-[8.5px] uppercase tracking-widest text-ink-3">latency</span>
              <span className="font-mono text-[13px] text-ink">2.1ms</span>
            </div>
            <div className="rounded-xl bg-paper border border-hairline p-2.5">
              <span className="block font-mono text-[8.5px] uppercase tracking-widest text-ink-3">nodes</span>
              <span className="font-mono text-[13px] text-ink">4,812</span>
            </div>
            <div className="rounded-xl bg-paper border border-hairline p-2.5">
              <span className="block font-mono text-[8.5px] uppercase tracking-widest text-ink-3">uptime</span>
              <span className="font-mono text-[13px] text-ink">99.98%</span>
            </div>
          </div>
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-ink-3">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-gold-deep" /> secure stream
            </span>
            <span>wss://hub.modforge.dev</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
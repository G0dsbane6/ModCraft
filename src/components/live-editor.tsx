"use client";

import { useMemo, useState } from "react";
import { Script, Check } from "@/components/icons";
import { Card, PanelHeader, Pill } from "@/components/ui";
import { CodeBlocks } from "@/lib/highlight";
import { PLUGIN_SOURCE } from "@/lib/plugin";

const LINES = PLUGIN_SOURCE.split("\n");

export default function LiveEditor() {
  const [activeLine, setActiveLine] = useState(23);
  const [line24, setLine24] = useState("const PULL_SPEED = 1.8;");

  const code = useMemo(() => {
    const lines = [...LINES];
    const idx = lines.findIndex((l) => l.startsWith("const PULL_SPEED"));
    if (idx >= 0) lines[idx] = line24;
    return lines.join("\n");
  }, [line24]);

  return (
    <Card className="h-full min-h-[300px]">
      <PanelHeader
        icon={<Script className="w-3.5 h-3.5" />}
        title="Live Editor"
        tag="browser ide"
        right={
          <div className="flex items-center gap-1.5">
            <Pill tone="ok">
              <Check className="w-3 h-3" /> lint 0
            </Pill>
            <Pill>es2024</Pill>
          </div>
        }
      />

      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:flex flex-col w-40 shrink-0 border-r border-hairline bg-paper/60 p-3 gap-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-3">inspector</span>
          <div className="flex flex-col gap-2 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-ink-3">events</span>
              <span className="text-gold-deep">06</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-3">teleports</span>
              <span className="text-gold-deep">01</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-3">particles</span>
              <span className="text-gold-deep">02</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-3">timers</span>
              <span className="text-gold-deep">01</span>
            </div>
          </div>

          <div className="mt-auto rounded-xl bg-gold-pale/40 border border-gold-pale p-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-gold-deep block mb-1.5">hint</span>
            <p className="text-[11px] leading-relaxed text-ink-2">
              Tune <span className="font-mono text-gold-deep">PULL_SPEED</span> on line 24 to adjust latch velocity.
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 pt-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gold/70" />
            <span className="font-mono text-[10.5px] text-gold-deep">grappling_hook.js</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">source · live</span>
          </div>

          <div className="relative mx-4 my-2 overflow-hidden rounded-xl border border-hairline bg-bone">
            <div className="scroll-thin h-[240px] overflow-auto">
              <table className="w-full border-collapse font-mono text-[11.5px] leading-[1.6]">
                <colgroup>
                  <col className="w-auto min-w-[40px]" />
                  <col />
                </colgroup>
                <tbody>
                  {code.split("\n").map((line, i) => (
                    <tr key={i} className={i === activeLine ? "bg-gold-pale/45" : undefined}>
                      <td className="select-none text-right pr-3 pl-3 text-ink-3/70 border-r border-hairline align-top">
                        {i + 1}
                      </td>
                      <td className="whitespace-pre px-3 py-0 align-top">
                        <CodeBlocks code={line} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 pb-3.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[10.5px] text-ink-3 shrink-0">Line 24:</span>
              <input
                value={line24}
                onChange={(e) => {
                  setLine24(e.target.value);
                  setActiveLine(23);
                }}
                spellCheck={false}
                className="flex-1 min-w-[120px] max-w-[360px] font-mono text-[11.5px] px-3 py-1.5 rounded-lg bg-paper border border-hairline focus:border-gold-pale focus:ring-4 focus:ring-gold-pale/40 outline-none"
              />
            </div>
            <Pill tone="ok">build ready</Pill>
          </div>
        </div>
      </div>
    </Card>
  );
}
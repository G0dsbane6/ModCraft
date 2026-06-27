"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const g = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v;

    const term = new Terminal({
      theme: {
        background: g("--color-bg"),
        foreground: g("--color-primary"),
        cursor: g("--color-primary"),
        selectionBackground: g("--color-primary"),
        black: g("--color-bg"),
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#22d3ee",
        white: g("--color-primary"),
        brightBlack: "#1c1b1a",
        brightRed: "#ef4444",
        brightGreen: "#22c55e",
        brightYellow: "#eab308",
        brightBlue: "#3b82f6",
        brightMagenta: "#a855f7",
        brightCyan: "#22d3ee",
        brightWhite: g("--color-text"),
      },
      fontSize: 13,
      fontFamily: g("--font-family") !== "--font-family" ? g("--font-family") : "'JetBrains Mono', 'Fira Code', Menlo, monospace",
      cursorBlink: true,
      cursorStyle: "bar",
      allowTransparency: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    let resizeObserver: ResizeObserver | null = null;

    if (containerRef.current) {
      term.open(containerRef.current);

      requestAnimationFrame(() => fitAddon.fit());

      resizeObserver = new ResizeObserver(() => fitAddon.fit());
      resizeObserver.observe(containerRef.current);
    }

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}`);

    let cursorPos = 0;
    const lineBuf: string[] = [];

    ws.onopen = () => {
      term.onData((data) => {
        ws.send(data);

        for (const ch of data) {
          if (ch === "\r") {
            term.write("\r\n");
            cursorPos = 0;
            lineBuf.length = 0;
          } else if (ch === "\x7f") {
            if (cursorPos > 0) {
              term.write("\b \b");
              cursorPos--;
              lineBuf.pop();
            }
          } else if (ch === "\t") {
            term.write("  ");
            cursorPos += 2;
            lineBuf.push("  ");
          } else if (ch === "\x03") {
            term.write("^C\r\n");
            cursorPos = 0;
            lineBuf.length = 0;
          } else if (ch >= " ") {
            term.write(ch);
            cursorPos++;
            lineBuf.push(ch);
          }
        }
      });
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onclose = () => {
      term.write("\r\n\x1b[31mConnection closed\x1b[0m\r\n");
    };

    ws.onerror = () => {
      term.write("\r\n\x1b[31mConnection error\x1b[0m\r\n");
    };

    terminalRef.current = term;
    wsRef.current = ws;

    return () => {
      resizeObserver?.disconnect();
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="border-t border-white/5">
      <div className="flex items-center justify-between px-5 py-2 bg-black/20">
        <span className="text-[10px] uppercase tracking-widest text-white/15 font-semibold">Terminal</span>
        <span className="text-[10px] text-white/10">zsh</span>
      </div>
      <div ref={containerRef} className="h-64 w-full" />
    </div>
  );
}

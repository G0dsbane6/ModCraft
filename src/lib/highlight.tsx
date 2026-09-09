import type { ReactNode } from "react";

export interface Tok {
  text: string;
  cls?: "cmt" | "str" | "num" | "kw" | "fn";
}

const KEYWORDS = new Set([
  "import", "from", "const", "let", "var", "function", "return", "if", "else",
  "for", "while", "do", "switch", "case", "break", "continue", "try", "catch",
  "finally", "throw", "new", "class", "extends", "super", "this", "typeof",
  "instanceof", "in", "of", "async", "await", "yield", "delete", "void", "null",
  "true", "false", "undefined", "default",
]);

const FUNCS = new Set([
  "set", "get", "push", "map", "filter", "reduce", "forEach", "add",
  "subtract", "multiply", "floor", "max", "round", "pow", "teleport",
  "playSound", "spawnParticle", "subscribe", "runInterval", "clearRun",
]);

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(\d[\d_]*(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)\b/g;

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN_RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: src.slice(last, i) });
    const [, comment, str, num, id] = m;
    if (comment) out.push({ text: comment, cls: "cmt" });
    else if (str) out.push({ text: str, cls: "str" });
    else if (num) out.push({ text: num, cls: "num" });
    else if (id) {
      if (KEYWORDS.has(id)) out.push({ text: id, cls: "kw" });
      else if (FUNCS.has(id)) out.push({ text: id, cls: "fn" });
      else out.push({ text: id });
    }
    last = i + m[0].length;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}

const CLASS_MAP: Record<NonNullable<Tok["cls"]>, string> = {
  cmt: "text-ink-3 italic",
  str: "text-[#8a6d18]",
  num: "text-[#a67d1a]",
  kw: "text-[#7a5c12] font-medium",
  fn: "text-[#c1951c]",
};

export function CodeBlocks({ code }: { code: string }) {
  const tokens = tokenize(code);
  return <>{tokens.map((t, i) => (
    <span key={i} className={t.cls ? CLASS_MAP[t.cls] : undefined}>{t.text}</span>
  ))}</>;
}

export function CodeSpan({ children }: { children?: ReactNode }) {
  return <span className="font-mono text-[0.72rem] tracking-tight">{children}</span>;
}
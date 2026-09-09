import type { ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...rest
}: {
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={`glass-card rounded-2xl overflow-hidden flex flex-col ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function PanelHeader({
  icon,
  title,
  tag,
  right,
  mono = false,
}: {
  icon?: ReactNode;
  title: string;
  tag?: string;
  right?: ReactNode;
  mono?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-hairline">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="w-6 h-6 shrink-0 grid place-items-center text-gold-deep bg-gold-pale rounded-md">
            {icon}
          </span>
        )}
        <h2 className={`font-semibold tracking-tight text-[13px] ${mono ? "font-mono uppercase tracking-[0.14em] text-[11.5px]" : ""}`}>
          {title}
        </h2>
        {tag && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-gold-pale/70 text-gold-deep text-[10px] font-mono tracking-wide uppercase">
            {tag}
          </span>
        )}
      </div>
      {right}
    </header>
  );
}

export function StatusDot({ live = true, className = "" }: { live?: boolean; className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      {live && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-50" />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${live ? "bg-gold" : "bg-ink-3"}`} />
    </span>
  );
}

export function Pill({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "plain" | "ok" }) {
  const tones: Record<typeof tone, string> = {
    gold: "bg-gold-pale/80 text-gold-deep border-gold-pale",
    plain: "bg-paper text-ink-2 border-hairline",
    ok: "bg-[#eaf3e4] text-[#4a6b28] border-[#d6e6c8]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono uppercase tracking-wide border ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Meter({
  value,
  className = "",
  barClassName = "",
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={`h-1.5 rounded-full bg-gold-pale/70 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-all duration-700 ${barClassName}`}
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </div>
  );
}

export function IconButton({
  onClick,
  children,
  title,
  tone = "plain",
}: {
  onClick?: () => void;
  children: ReactNode;
  title?: string;
  tone?: "plain" | "gold";
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={
        tone === "gold"
          ? "w-9 h-9 grid place-items-center rounded-xl text-gold-deep bg-gold-pale/60 border border-gold-pale hover:bg-gold-pale hover:scale-105 transition-all active:scale-95"
          : "w-9 h-9 grid place-items-center rounded-xl text-ink-2 hover:text-ink bg-paper border border-hairline hover:border-gold-pale transition-all active:scale-95"
      }
    >
      {children}
    </button>
  );
}
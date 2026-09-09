export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="relative inline-grid place-items-center rounded-xl bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-bone shadow-[0_8px_24px_-8px_rgba(193,149,28,0.7),inset_0_1px_0_rgba(255,255,255,0.5)]"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16M7 18l3 3h4l3-3M5 21h14M9.5 9.5l-3.5 2.7 3.5 2.8M14.5 8l3.5 3-3.5 3M16 4l2 1.6L16 7.2l-2-1.6 2-1.6Z" />
      </svg>
    </span>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span className="font-mono font-semibold tracking-[0.22em] text-[15px] text-ink">
        MODFORGE
      </span>
      {!compact && (
        <span className="font-mono text-[8.5px] tracking-[0.3em] text-gold-deep uppercase mt-1">
          Forge Intelligence
        </span>
      )}
    </span>
  );
}
interface RingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
  sub?: string;
  children?: React.ReactNode;
}

export function Ring({
  value,
  max = 100,
  size = 120,
  stroke = 10,
  color = "var(--primary)",
  track = "color-mix(in oklab, white 8%, transparent)",
  label,
  sub,
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = c * (1 - pct);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            <span className="text-xl font-semibold tracking-tight">{Math.round(pct * 100)}%</span>
            {label && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>}
            {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
          </>
        )}
      </div>
    </div>
  );
}
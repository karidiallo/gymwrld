/**
 * MuscleMap — minimal anatomical SVG showing front + back silhouette with
 * named muscle regions highlighted based on the exercise's target muscles.
 *
 * Why custom SVG: shipping a 3D anatomy library or licensed exercise GIFs
 * is too heavy for the PWA bundle. This vector approach is crisp, themable
 * with brand colors, and offline-friendly.
 */

type Props = {
  /** Polish muscle labels from EXERCISES[].muscles, e.g. ["Klatka", "Triceps"]. */
  muscles: string[];
  /** "primary" = first muscle (red/magenta), rest = secondary (orange). */
  className?: string;
};

const REGION_ALIASES: Record<string, string[]> = {
  klatka: ["klatka", "klatki"],
  barki:  ["barki", "barku", "tylne barki", "przednie barki", "boczne barki"],
  biceps: ["biceps", "bicepsa"],
  triceps:["triceps", "tricepsa"],
  brzuch: ["brzuch", "core", "abs"],
  przedramie: ["przedramię", "przedramiona"],
  quad:   ["quady", "quad", "nogi", "uda"],
  lydki:  ["łydki", "łydka"],
  poslad: ["pośladki", "pośladek"],
  plecy:  ["plecy", "górne plecy", "kapturowe"],
  bicep_uda: ["dwugłowe ud", "dwuglowe ud", "tylne uda", "hamstring"],
};

function regionsFor(label: string): string[] {
  const norm = label.toLowerCase().trim();
  const hits: string[] = [];
  for (const [region, aliases] of Object.entries(REGION_ALIASES)) {
    if (aliases.some((a) => norm.includes(a))) hits.push(region);
  }
  return hits;
}

export function MuscleMap({ muscles, className }: Props) {
  const primary = new Set<string>();
  const secondary = new Set<string>();
  muscles.forEach((m, i) => {
    const regs = regionsFor(m);
    regs.forEach((r) => (i === 0 ? primary : secondary).add(r));
  });

  const fill = (region: string): string => {
    if (primary.has(region)) return "url(#mm-primary)";
    if (secondary.has(region)) return "url(#mm-secondary)";
    return "rgba(255,255,255,0.05)";
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ""}`}>
      {/* FRONT */}
      <svg viewBox="0 0 120 240" className="h-44 w-auto" aria-label="Mięśnie pracujące — widok z przodu">
        <defs>
          <radialGradient id="mm-primary" cx="50%" cy="50%" r="55%">
            <stop offset="0%"  stopColor="#FF3B5C" stopOpacity="1" />
            <stop offset="100%" stopColor="#E5097B" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id="mm-secondary" cx="50%" cy="50%" r="55%">
            <stop offset="0%"  stopColor="#FF8C3C" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        {/* silhouette */}
        <g fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7">
          <circle cx="60" cy="20" r="13" />
          <path d="M40 40 Q60 32 80 40 L86 75 L82 110 Q60 116 38 110 L34 75 Z" />
          {/* arms */}
          <path d="M40 42 L26 76 L24 110 L32 112 L36 80 Z" />
          <path d="M80 42 L94 76 L96 110 L88 112 L84 80 Z" />
          {/* legs */}
          <path d="M44 112 L40 170 L46 220 L54 220 L56 170 Z" />
          <path d="M76 112 L80 170 L74 220 L66 220 L64 170 Z" />
        </g>
        {/* muscle regions (front) */}
        <g stroke="rgba(0,0,0,0.25)" strokeWidth="0.5">
          {/* shoulders */}
          <ellipse cx="38" cy="48" rx="9" ry="6" fill={fill("barki")} />
          <ellipse cx="82" cy="48" rx="9" ry="6" fill={fill("barki")} />
          {/* chest */}
          <path d="M44 52 Q60 50 76 52 L74 72 Q60 76 46 72 Z" fill={fill("klatka")} />
          {/* abs */}
          <rect x="54" y="76" width="12" height="30" rx="3" fill={fill("brzuch")} />
          {/* biceps */}
          <ellipse cx="32" cy="68" rx="5" ry="9" fill={fill("biceps")} />
          <ellipse cx="88" cy="68" rx="5" ry="9" fill={fill("biceps")} />
          {/* forearms */}
          <ellipse cx="27" cy="92" rx="4" ry="10" fill={fill("przedramie")} />
          <ellipse cx="93" cy="92" rx="4" ry="10" fill={fill("przedramie")} />
          {/* quads */}
          <ellipse cx="50" cy="140" rx="7" ry="22" fill={fill("quad")} />
          <ellipse cx="70" cy="140" rx="7" ry="22" fill={fill("quad")} />
          {/* calves front (shins muted) */}
          <ellipse cx="48" cy="200" rx="5" ry="14" fill={fill("lydki")} />
          <ellipse cx="72" cy="200" rx="5" ry="14" fill={fill("lydki")} />
        </g>
      </svg>
      {/* BACK */}
      <svg viewBox="0 0 120 240" className="h-44 w-auto" aria-label="Mięśnie pracujące — widok z tyłu">
        <g fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7">
          <circle cx="60" cy="20" r="13" />
          <path d="M40 40 Q60 32 80 40 L86 75 L82 110 Q60 116 38 110 L34 75 Z" />
          <path d="M40 42 L26 76 L24 110 L32 112 L36 80 Z" />
          <path d="M80 42 L94 76 L96 110 L88 112 L84 80 Z" />
          <path d="M44 112 L40 170 L46 220 L54 220 L56 170 Z" />
          <path d="M76 112 L80 170 L74 220 L66 220 L64 170 Z" />
        </g>
        <g stroke="rgba(0,0,0,0.25)" strokeWidth="0.5">
          {/* rear delts */}
          <ellipse cx="38" cy="48" rx="9" ry="6" fill={fill("barki")} />
          <ellipse cx="82" cy="48" rx="9" ry="6" fill={fill("barki")} />
          {/* upper back / lats */}
          <path d="M42 52 Q60 56 78 52 L80 88 Q60 92 40 88 Z" fill={fill("plecy")} />
          {/* lower back */}
          <rect x="50" y="90" width="20" height="18" rx="3" fill={fill("plecy")} />
          {/* triceps */}
          <ellipse cx="32" cy="68" rx="5" ry="9" fill={fill("triceps")} />
          <ellipse cx="88" cy="68" rx="5" ry="9" fill={fill("triceps")} />
          {/* glutes */}
          <ellipse cx="50" cy="118" rx="9" ry="10" fill={fill("poslad")} />
          <ellipse cx="70" cy="118" rx="9" ry="10" fill={fill("poslad")} />
          {/* hamstrings */}
          <ellipse cx="50" cy="148" rx="7" ry="18" fill={fill("bicep_uda")} />
          <ellipse cx="70" cy="148" rx="7" ry="18" fill={fill("bicep_uda")} />
          {/* calves */}
          <ellipse cx="48" cy="195" rx="5" ry="16" fill={fill("lydki")} />
          <ellipse cx="72" cy="195" rx="5" ry="16" fill={fill("lydki")} />
        </g>
      </svg>
    </div>
  );
}

/** Compact horizontal bars listing each muscle and its activation intensity. */
export function MuscleIntensityList({ muscles }: { muscles: string[] }) {
  if (!muscles.length) return null;
  return (
    <div className="mt-3 space-y-1.5">
      {muscles.map((m, i) => {
        const intensity = i === 0 ? 1 : i === 1 ? 0.65 : 0.4;
        const color = i === 0 ? "var(--magenta)" : "var(--orange)";
        return (
          <div key={m} className="flex items-center gap-2 text-[11px]">
            <span className="w-24 shrink-0 text-muted-foreground">{m}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${intensity * 100}%`, background: color }}
              />
            </div>
            <span className="w-8 text-right tabular-nums text-muted-foreground">
              {Math.round(intensity * 100)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
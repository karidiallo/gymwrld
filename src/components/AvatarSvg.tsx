import { useMemo } from "react";

export type AvatarConfig = {
  gender: "m" | "k" | "nb";
  skin: string;
  hair: string;
  hairStyle: "short" | "buzz" | "medium" | "long" | "curly" | "bun";
  body: "slim" | "athletic" | "muscular";
  outfit: "tank" | "tshirt" | "hoodie" | "crop";
  outfitColor: string;
  age: "young" | "adult" | "mature";
};

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: "m",
  skin: "#e6b58a",
  hair: "#2a1b14",
  hairStyle: "short",
  body: "athletic",
  outfit: "tank",
  outfitColor: "#1f1f23",
  age: "adult",
};

export const SKIN_TONES = ["#f4d3b3", "#e6b58a", "#c98e63", "#9a6a44", "#5e3a22"];
export const HAIR_COLORS = ["#1a120c", "#3a2418", "#7a4a2a", "#c8923a", "#e6c98a", "#b8b8b8"];
export const OUTFIT_COLORS = ["#1f1f23", "#ffffff", "#e94e63", "#3a8dff", "#a8e635", "#f59e0b"];

const HAIR_STYLES_M = ["short", "buzz", "medium", "curly"] as const;
const HAIR_STYLES_K = ["medium", "long", "bun", "curly", "short"] as const;
const HAIR_STYLES_NB = ["short", "medium", "long", "bun", "curly", "buzz"] as const;

export function hairOptionsFor(gender: AvatarConfig["gender"]): readonly AvatarConfig["hairStyle"][] {
  if (gender === "m") return HAIR_STYLES_M;
  if (gender === "k") return HAIR_STYLES_K;
  return HAIR_STYLES_NB;
}

export function AvatarSvg({ cfg, size = 240, rotation = 0 }: { cfg: AvatarConfig; size?: number; rotation?: number }) {
  // simple 3/4 stylized character. rotation flips/shifts to fake 360.
  const flip = rotation > 90 && rotation < 270;
  const sideShift = Math.sin((rotation * Math.PI) / 180) * 6;
  const back = rotation > 135 && rotation < 225;

  const bodyWidth = cfg.body === "slim" ? 56 : cfg.body === "athletic" ? 68 : 82;
  const armWidth = cfg.body === "slim" ? 9 : cfg.body === "athletic" ? 12 : 16;
  const ageStubble = cfg.age === "mature" ? "#3a3a3a" : "transparent";

  const outfit = cfg.outfit;
  const hair = cfg.hairStyle;
  const skin = cfg.skin;
  const hairColor = cfg.hair;
  const outfitColor = cfg.outfitColor;

  return (
    <svg
      viewBox="0 0 200 360"
      width={size}
      height={(size * 360) / 200}
      style={{ transform: `scaleX(${flip ? -1 : 1}) translateX(${sideShift}px)`, transition: "transform 60ms linear" }}
      aria-label="Avatar"
    >
      <defs>
        <radialGradient id="floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0" x2="1">
          <stop offset="0" stopColor={skin} />
          <stop offset="1" stopColor={skin} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* floor shadow */}
      <ellipse cx="100" cy="345" rx={bodyWidth * 0.9} ry="6" fill="url(#floor)" />

      {/* legs */}
      <rect x={100 - bodyWidth / 4 - 6} y="220" width="14" height="115" rx="6" fill={skin} />
      <rect x={100 + bodyWidth / 4 - 8} y="220" width="14" height="115" rx="6" fill={skin} />
      {/* shorts */}
      <rect x={100 - bodyWidth / 2} y="215" width={bodyWidth} height="40" rx="8" fill="#0f0f12" />

      {/* torso / outfit */}
      {outfit === "tank" && (
        <path d={`M ${100 - bodyWidth/2} 140 Q 100 130 ${100 + bodyWidth/2} 140 L ${100 + bodyWidth/2 - 4} 225 L ${100 - bodyWidth/2 + 4} 225 Z`} fill={outfitColor} />
      )}
      {outfit === "tshirt" && (
        <path d={`M ${100 - bodyWidth/2 - 10} 140 Q 100 125 ${100 + bodyWidth/2 + 10} 140 L ${100 + bodyWidth/2 + 4} 175 L ${100 + bodyWidth/2 - 2} 225 L ${100 - bodyWidth/2 + 2} 225 L ${100 - bodyWidth/2 - 4} 175 Z`} fill={outfitColor} />
      )}
      {outfit === "hoodie" && (
        <>
          <path d={`M ${100 - bodyWidth/2 - 14} 135 Q 100 120 ${100 + bodyWidth/2 + 14} 135 L ${100 + bodyWidth/2 + 8} 180 L ${100 + bodyWidth/2} 225 L ${100 - bodyWidth/2} 225 L ${100 - bodyWidth/2 - 8} 180 Z`} fill={outfitColor} />
          <path d={`M ${100 - 22} 130 Q 100 110 ${100 + 22} 130 L ${100 + 18} 150 L ${100 - 18} 150 Z`} fill={outfitColor} opacity="0.85" />
        </>
      )}
      {outfit === "crop" && (
        <path d={`M ${100 - bodyWidth/2 - 2} 140 Q 100 130 ${100 + bodyWidth/2 + 2} 140 L ${100 + bodyWidth/2 - 2} 185 L ${100 - bodyWidth/2 + 2} 185 Z`} fill={outfitColor} />
      )}

      {/* exposed midriff/skin for tank/crop */}
      {(outfit === "tank" || outfit === "crop") && (
        <rect x={100 - bodyWidth / 2 + 8} y={outfit === "crop" ? 180 : 200} width={bodyWidth - 16} height={outfit === "crop" ? 30 : 16} fill={skin} opacity={outfit === "crop" ? 1 : 0.0} />
      )}

      {/* arms */}
      <rect x={100 - bodyWidth / 2 - armWidth + 2} y="145" width={armWidth} height="80" rx={armWidth / 2} fill="url(#bodyGrad)" />
      <rect x={100 + bodyWidth / 2 - 2} y="145" width={armWidth} height="80" rx={armWidth / 2} fill="url(#bodyGrad)" />

      {/* neck */}
      <rect x={92} y={115} width={16} height={22} rx={4} fill={skin} />

      {/* head */}
      <ellipse cx="100" cy="92" rx="32" ry="38" fill={skin} />

      {/* face (hidden when back) */}
      {!back && (
        <>
          <ellipse cx="88" cy="92" rx="2.5" ry="3.5" fill="#1a1a1a" />
          <ellipse cx="112" cy="92" rx="2.5" ry="3.5" fill="#1a1a1a" />
          <path d={`M 92 110 Q 100 ${cfg.age === "young" ? 116 : 114} 108 110`} stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d={`M 80 ${cfg.age === "mature" ? 118 : 122} L 120 ${cfg.age === "mature" ? 118 : 122}`} stroke={ageStubble} strokeWidth="5" strokeDasharray="1 2" opacity="0.5" />
        </>
      )}
      {back && (
        <ellipse cx="100" cy="92" rx="32" ry="38" fill={skin} />
      )}

      {/* hair */}
      {hair === "buzz" && <path d="M 68 78 Q 100 50 132 78 L 132 82 Q 100 60 68 82 Z" fill={hairColor} />}
      {hair === "short" && <path d="M 66 82 Q 100 38 134 82 L 134 92 Q 124 70 100 65 Q 76 70 66 92 Z" fill={hairColor} />}
      {hair === "medium" && <path d="M 62 95 Q 64 42 100 38 Q 136 42 138 95 L 132 88 Q 122 60 100 58 Q 78 60 68 88 Z" fill={hairColor} />}
      {hair === "long" && (
        <>
          <path d="M 60 130 Q 56 50 100 38 Q 144 50 140 130 L 132 100 Q 122 60 100 58 Q 78 60 68 100 Z" fill={hairColor} />
          {back && <rect x="62" y="80" width="76" height="120" rx="38" fill={hairColor} />}
        </>
      )}
      {hair === "curly" && (
        <g fill={hairColor}>
          <circle cx="74" cy="68" r="12" />
          <circle cx="92" cy="58" r="14" />
          <circle cx="110" cy="58" r="14" />
          <circle cx="128" cy="68" r="12" />
          <circle cx="82" cy="82" r="11" />
          <circle cx="120" cy="82" r="11" />
        </g>
      )}
      {hair === "bun" && (
        <>
          <circle cx="100" cy="48" r="14" fill={hairColor} />
          <path d="M 68 82 Q 100 60 132 82 L 130 90 Q 100 76 70 90 Z" fill={hairColor} />
        </>
      )}
    </svg>
  );
}

export function useStoredAvatar(): AvatarConfig {
  return useMemo(() => {
    if (typeof window === "undefined") return DEFAULT_AVATAR;
    try {
      const raw = localStorage.getItem("gw_avatar");
      if (!raw) return DEFAULT_AVATAR;
      return { ...DEFAULT_AVATAR, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AVATAR;
    }
  }, []);
}
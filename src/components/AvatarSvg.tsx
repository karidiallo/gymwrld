import { useMemo } from "react";
import maleAthletic from "@/assets/avatar.png";
import maleSlim from "@/assets/avatar-male-slim.png";
import maleMuscular from "@/assets/avatar-male-muscular.png";
import maleCurvy from "@/assets/avatar-male-curvy.png";
import femaleAthletic from "@/assets/avatar-female-athletic.png";
import femaleCurvy from "@/assets/avatar-female-curvy.png";
import nbAthletic from "@/assets/avatar-nb-athletic.png";

export type Gender = "m" | "k" | "nb";
export type BodyType = "slim" | "athletic" | "medium" | "muscular" | "curvy";
export type HairStyle = "short" | "buzz" | "fade" | "long" | "ponytail" | "bun" | "curly" | "bald";
export type FacialHair = "none" | "stubble" | "beard" | "moustache";
export type EyeShape = "round" | "almond" | "narrow";

export const SKIN_TONES = [
  { id: "porcelain", label: "Porcelana", hex: "#f3d6c2" },
  { id: "light", label: "Jasna", hex: "#e8b89a" },
  { id: "tan", label: "Opalona", hex: "#c98e6b" },
  { id: "olive", label: "Oliwkowa", hex: "#a87155" },
  { id: "brown", label: "Brązowa", hex: "#7a4a32" },
  { id: "deep", label: "Ciemna", hex: "#4a2c1c" },
] as const;

export const HAIR_COLORS = ["#1a1310","#3a2418","#6b3d20","#b07a3d","#d9b27a","#e8c587","#c43b3b","#7a4cc0","#3a82e3","#2a2a30"] as const;
export const EYE_COLORS = ["#3a2614","#5a3b1a","#2f5a3a","#2a6fb0","#5a5a6a","#7a4caf"] as const;

export type AvatarConfig = {
  gender: Gender;
  nbBase?: "m" | "k"; // for NB, choose visual base
  body: BodyType;
  outfitTint: string; // for glow accent
  skinTone: typeof SKIN_TONES[number]["id"];
  hairStyle: HairStyle;
  hairColor: string;
  eyeColor: string;
  eyeShape: EyeShape;
  facialHair: FacialHair;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: "m",
  nbBase: "m",
  body: "athletic",
  outfitTint: "#4f8cff",
  skinTone: "light",
  hairStyle: "short",
  hairColor: "#3a2418",
  eyeColor: "#3a2614",
  eyeShape: "almond",
  facialHair: "stubble",
};

export const OUTFIT_TINTS = ["#4f8cff", "#a78bfa", "#22d3ee", "#f97316", "#a8e635", "#ef4444"];

export const BODY_LABELS: Record<BodyType, string> = {
  slim: "Szczupła",
  athletic: "Atletyczna",
  medium: "Średnia",
  muscular: "Umięśniona",
  curvy: "Krągła",
};

export const GENDER_LABELS: Record<Gender, string> = {
  m: "Mężczyzna",
  k: "Kobieta",
  nb: "Both / NB",
};

export function getAvatarImage(gender: Gender, body: BodyType): string {
  return getAvatarImageFor(gender, body, "m");
}

export function getAvatarImageFor(gender: Gender, body: BodyType, nbBase: "m" | "k" = "m"): string {
  const g = gender === "nb" ? nbBase : gender;
  if (g === "k") {
    if (body === "curvy") return femaleCurvy;
    return femaleAthletic;
  }
  // m
  switch (body) {
    case "slim": return maleSlim;
    case "muscular": return maleMuscular;
    case "curvy": return maleCurvy;
    case "medium": return maleCurvy; // softer build
    default: return maleAthletic;
  }
}

/** Skin tone → CSS filter overlay applied to PNG body. */
export function skinFilter(skin: AvatarConfig["skinTone"]): string {
  switch (skin) {
    case "porcelain": return "saturate(0.85) brightness(1.08) contrast(0.96)";
    case "light": return "saturate(1) brightness(1)";
    case "tan": return "saturate(1.15) brightness(0.92) sepia(0.18)";
    case "olive": return "saturate(1.1) brightness(0.82) sepia(0.32) hue-rotate(-10deg)";
    case "brown": return "saturate(1.05) brightness(0.7) sepia(0.45) hue-rotate(-12deg)";
    case "deep": return "saturate(1) brightness(0.55) sepia(0.55) hue-rotate(-12deg)";
    default: return "";
  }
}

export const ALL_PRESETS: { gender: Gender; body: BodyType; label: string }[] = [
  { gender: "m", body: "slim", label: "♂ Szczupły" },
  { gender: "m", body: "athletic", label: "♂ Atletyczny" },
  { gender: "m", body: "muscular", label: "♂ Umięśniony" },
  { gender: "m", body: "curvy", label: "♂ Krągły" },
  { gender: "k", body: "athletic", label: "♀ Atletyczna" },
  { gender: "k", body: "curvy", label: "♀ Krągła" },
  { gender: "nb", body: "athletic", label: "⚧ Both" },
];

/**
 * Render avatar as a realistic PNG portrait. Rotation slightly mirrors and shifts to
 * simulate light 360° turn (good enough preview).
 */
export function AvatarSvg({ cfg, size = 240, rotation = 0 }: { cfg: AvatarConfig; size?: number; rotation?: number }) {
  const src = getAvatarImageFor(cfg.gender, cfg.body, cfg.nbBase ?? "m");
  const flip = rotation > 90 && rotation < 270;
  const sideShift = Math.sin((rotation * Math.PI) / 180) * 14;
  return (
    <div
      style={{
        width: size,
        height: (size * 1280) / 768,
        position: "relative",
        transition: "transform 80ms linear",
        transform: `scaleX(${flip ? -1 : 1}) translateX(${sideShift}px)`,
        filter: `drop-shadow(0 24px 32px ${cfg.outfitTint}55)`,
      }}
      aria-label="Avatar"
    >
      <img src={src} alt="Avatar" className="h-full w-full object-contain" loading="lazy" style={{ filter: skinFilter(cfg.skinTone) }} />
    </div>
  );
}

export function useStoredAvatar(): AvatarConfig {
  return useMemo(() => {
    if (typeof window === "undefined") return DEFAULT_AVATAR;
    try {
      const raw = localStorage.getItem("gw_avatar");
      if (!raw) return DEFAULT_AVATAR;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_AVATAR, ...parsed };
    } catch {
      return DEFAULT_AVATAR;
    }
  }, []);
}

/* ============================
 * Head portrait — SVG render with skin/hair/eyes/facial hair
 * Shown in customizer for facial preview.
 * ============================ */
export function HeadPortrait({ cfg, size = 180 }: { cfg: AvatarConfig; size?: number }) {
  const skin = SKIN_TONES.find((s) => s.id === cfg.skinTone)?.hex ?? "#e8b89a";
  const skinShadow = shade(skin, -18);
  const skinHi = shade(skin, 12);
  const lipColor = shade(skin, -28);
  const isFem = cfg.gender === "k" || (cfg.gender === "nb" && cfg.nbBase === "k");

  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 220 / 200} aria-label="Podgląd głowy">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={cfg.outfitTint} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="skinG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skinHi} />
          <stop offset="60%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShadow} />
        </linearGradient>
      </defs>
      <rect width="200" height="220" fill="url(#bg)" rx="20" />
      {/* neck */}
      <path d={`M85 168 L85 192 Q100 200 115 192 L115 168 Z`} fill={skinShadow} />
      {/* shoulders hint */}
      <path d="M40 220 Q100 180 160 220 Z" fill={cfg.outfitTint} opacity="0.75" />
      <path d="M40 220 Q100 188 160 220 Z" fill="#000" opacity="0.25" />
      {/* head */}
      <ellipse cx="100" cy="110" rx="42" ry="52" fill="url(#skinG)" />
      {/* jawline shadow for males */}
      {!isFem && <path d="M62 132 Q100 168 138 132 Q138 152 100 162 Q62 152 62 132 Z" fill={skinShadow} opacity="0.35" />}
      {/* ears */}
      <ellipse cx="58" cy="118" rx="6" ry="9" fill={skinShadow} />
      <ellipse cx="142" cy="118" rx="6" ry="9" fill={skinShadow} />
      {/* Eyes */}
      <Eye cx={84} cy={108} color={cfg.eyeColor} shape={cfg.eyeShape} />
      <Eye cx={116} cy={108} color={cfg.eyeColor} shape={cfg.eyeShape} />
      {/* Brows */}
      <path d={isFem ? "M74 97 Q84 92 94 97" : "M73 95 Q84 90 95 96"} stroke={cfg.hairColor} strokeWidth={isFem ? 2.4 : 3.2} fill="none" strokeLinecap="round" />
      <path d={isFem ? "M106 97 Q116 92 126 97" : "M105 96 Q116 90 127 95"} stroke={cfg.hairColor} strokeWidth={isFem ? 2.4 : 3.2} fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M98 118 Q96 132 100 138 Q104 132 102 118" stroke={skinShadow} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* Lips */}
      {isFem ? (
        <path d="M88 148 Q100 156 112 148 Q100 152 88 148 Z" fill={lipColor} />
      ) : (
        <path d="M88 148 Q100 152 112 148" stroke={lipColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {/* Facial hair (males / nb-m) */}
      {!isFem && cfg.facialHair !== "none" && (
        <FacialHairShape kind={cfg.facialHair} color={cfg.hairColor} />
      )}
      {/* Hair */}
      <HairShape style={cfg.hairStyle} color={cfg.hairColor} fem={isFem} />
    </svg>
  );
}

function Eye({ cx, cy, color, shape }: { cx: number; cy: number; color: string; shape: EyeShape }) {
  const rx = shape === "narrow" ? 5 : shape === "round" ? 5.5 : 5.5;
  const ry = shape === "narrow" ? 2.2 : shape === "round" ? 4.5 : 3.2;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
      <circle cx={cx} cy={cy} r={Math.min(rx, ry) - 0.4} fill={color} />
      <circle cx={cx} cy={cy} r={1} fill="#000" />
      <circle cx={cx - 0.8} cy={cy - 0.8} r={0.6} fill="#fff" />
    </g>
  );
}

function HairShape({ style, color, fem }: { style: HairStyle; color: string; fem: boolean }) {
  const hi = shade(color, 14);
  switch (style) {
    case "bald":
      return null;
    case "buzz":
      return <path d="M60 92 Q100 56 140 92 Q140 76 100 64 Q60 76 60 92 Z" fill={color} opacity="0.85" />;
    case "fade":
      return (
        <g>
          <path d="M58 96 Q100 50 142 96 Q142 70 100 60 Q58 70 58 96 Z" fill={color} />
          <path d="M64 96 Q100 86 136 96 Q136 92 100 88 Q64 92 64 96 Z" fill="#000" opacity="0.2" />
        </g>
      );
    case "short":
      return (
        <g>
          <path d="M56 100 Q100 46 144 100 Q146 76 100 58 Q54 76 56 100 Z" fill={color} />
          <path d="M70 80 Q100 64 130 80" stroke={hi} strokeWidth="2" fill="none" opacity="0.6" />
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          <circle cx="70" cy="80" r="14" />
          <circle cx="92" cy="64" r="16" />
          <circle cx="118" cy="66" r="16" />
          <circle cx="138" cy="84" r="13" />
          <circle cx="60" cy="98" r="10" />
          <circle cx="146" cy="100" r="10" />
        </g>
      );
    case "long":
      return (
        <g fill={color}>
          <path d="M52 100 Q100 44 148 100 L156 200 Q130 188 100 188 Q70 188 44 200 Z" />
          <path d="M70 80 Q100 60 130 80" stroke={hi} strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      );
    case "ponytail":
      return (
        <g fill={color}>
          <path d="M56 100 Q100 50 144 100 Q146 78 100 60 Q54 78 56 100 Z" />
          <path d="M138 100 Q170 140 158 180 Q150 160 144 130 Z" />
        </g>
      );
    case "bun":
      return (
        <g fill={color}>
          <path d="M58 100 Q100 52 142 100 Q144 78 100 62 Q56 78 58 100 Z" />
          <circle cx="100" cy="50" r="16" />
          <circle cx="100" cy="50" r="16" fill={hi} opacity="0.3" />
        </g>
      );
    default:
      return null;
  }
}

function FacialHairShape({ kind, color }: { kind: FacialHair; color: string }) {
  switch (kind) {
    case "stubble":
      return <path d="M70 138 Q100 168 130 138 Q130 156 100 162 Q70 156 70 138 Z" fill={color} opacity="0.25" />;
    case "moustache":
      return <path d="M86 144 Q100 150 114 144 Q108 148 100 148 Q92 148 86 144 Z" fill={color} />;
    case "beard":
      return (
        <g fill={color}>
          <path d="M64 132 Q100 178 136 132 Q136 158 100 168 Q64 158 64 132 Z" />
          <path d="M86 144 Q100 150 114 144 Q108 148 100 148 Q92 148 86 144 Z" />
        </g>
      );
    default:
      return null;
  }
}

function shade(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const f = percent / 100;
  r = Math.max(0, Math.min(255, Math.round(r + (f >= 0 ? (255 - r) : r) * f)));
  g = Math.max(0, Math.min(255, Math.round(g + (f >= 0 ? (255 - g) : g) * f)));
  b = Math.max(0, Math.min(255, Math.round(b + (f >= 0 ? (255 - b) : b) * f)));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
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
export type AvatarConfig = {
  gender: Gender;
  body: BodyType;
  outfitTint: string; // for glow accent
};

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: "m",
  body: "athletic",
  outfitTint: "#4f8cff",
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
  if (gender === "k") {
    if (body === "curvy") return femaleCurvy;
    return femaleAthletic;
  }
  if (gender === "nb") return nbAthletic;
  // m
  switch (body) {
    case "slim": return maleSlim;
    case "muscular": return maleMuscular;
    case "curvy": return maleCurvy;
    case "medium": return maleCurvy; // softer build
    default: return maleAthletic;
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
  const src = getAvatarImage(cfg.gender, cfg.body);
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
      <img src={src} alt="Avatar" className="h-full w-full object-contain" loading="lazy" />
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
      return {
        gender: parsed.gender ?? DEFAULT_AVATAR.gender,
        body: parsed.body ?? DEFAULT_AVATAR.body,
        outfitTint: parsed.outfitTint ?? parsed.outfitColor ?? DEFAULT_AVATAR.outfitTint,
      };
    } catch {
      return DEFAULT_AVATAR;
    }
  }, []);
}
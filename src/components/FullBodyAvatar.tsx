import { SKIN_TONES, type AvatarConfig, type BodyType } from "./AvatarSvg";

/**
 * Stylized full-body SVG avatar. ALL parameters (skin, body, hair, eyes,
 * facial hair, outfit tint, gender, nbBase) actually update visually here.
 * Use this in the customizer and the 360° viewer. The polished PNG render
 * stays on the homepage hero only.
 */

type Dims = { sh: number; wa: number; hi: number; arm: number; thigh: number; chest: number; bust: number };

const BASE_DIMS: Record<BodyType, Dims> = {
  slim:     { sh: 52, wa: 36, hi: 44, arm: 10, thigh: 18, chest: 14, bust: 0 },
  athletic: { sh: 70, wa: 44, hi: 52, arm: 16, thigh: 24, chest: 28, bust: 0 },
  medium:   { sh: 62, wa: 56, hi: 62, arm: 18, thigh: 28, chest: 24, bust: 0 },
  muscular: { sh: 84, wa: 50, hi: 60, arm: 26, thigh: 32, chest: 38, bust: 0 },
  curvy:    { sh: 60, wa: 56, hi: 86, arm: 20, thigh: 36, chest: 28, bust: 0 },
};

function shade(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const f = percent / 100;
  r = Math.max(0, Math.min(255, Math.round(r + (f >= 0 ? (255 - r) : r) * f)));
  g = Math.max(0, Math.min(255, Math.round(g + (f >= 0 ? (255 - g) : g) * f)));
  b = Math.max(0, Math.min(255, Math.round(b + (f >= 0 ? (255 - b) : b) * f)));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function FullBodyAvatar({ cfg, height = 480 }: { cfg: AvatarConfig; height?: number }) {
  const isFem = cfg.gender === "k" || (cfg.gender === "nb" && cfg.nbBase === "k");
  const skin = SKIN_TONES.find((s) => s.id === cfg.skinTone)?.hex ?? "#e8b89a";
  const skinD = shade(skin, -16);
  const skinL = shade(skin, 10);
  const tint = cfg.outfitTint;
  const tintD = shade(tint, -22);
  const hair = cfg.hairColor;
  const hairHi = shade(hair, 18);

  const d = { ...BASE_DIMS[cfg.body] };
  if (isFem) {
    d.sh = Math.max(48, d.sh - 8);
    d.hi = d.hi + 6;
    d.bust = d.body === "slim" ? 6 : d.body === "curvy" ? 14 : 10;
    d.chest = Math.max(d.chest - 8, 10);
    d.arm = Math.max(8, d.arm - 4);
  }

  const cx = 100;
  // Vertical anchors
  const headTop = 18, headCy = 50, headRx = 24, headRy = 28;
  const neckTop = headCy + headRy - 4; // 74
  const torsoTop = neckTop + 6;        // 80
  const waistY = 150;
  const hipY = 178;
  const kneeY = 260;
  const footY = 340;

  // Torso outline (shoulder -> waist -> hip)
  const torso = `
    M ${cx - d.sh / 2} ${torsoTop}
    Q ${cx - d.sh / 2 - 4} ${torsoTop + 18} ${cx - d.wa / 2} ${waistY}
    Q ${cx - d.hi / 2 - 4} ${(waistY + hipY) / 2} ${cx - d.hi / 2} ${hipY}
    L ${cx + d.hi / 2} ${hipY}
    Q ${cx + d.hi / 2 + 4} ${(waistY + hipY) / 2} ${cx + d.wa / 2} ${waistY}
    Q ${cx + d.sh / 2 + 4} ${torsoTop + 18} ${cx + d.sh / 2} ${torsoTop}
    Q ${cx} ${torsoTop - 6} ${cx - d.sh / 2} ${torsoTop}
    Z`;

  // Shirt
  const shirtBottom = waistY + 6;
  const shirt = `
    M ${cx - d.sh / 2 - 2} ${torsoTop + 2}
    L ${cx - d.wa / 2 - 4} ${shirtBottom}
    L ${cx + d.wa / 2 + 4} ${shirtBottom}
    L ${cx + d.sh / 2 + 2} ${torsoTop + 2}
    Q ${cx + 14} ${torsoTop + 8} ${cx + 4} ${torsoTop + 4}
    Q ${cx} ${torsoTop + 2} ${cx - 4} ${torsoTop + 4}
    Q ${cx - 14} ${torsoTop + 8} ${cx - d.sh / 2 - 2} ${torsoTop + 2} Z`;

  // Shorts/pants
  const pants = `
    M ${cx - d.hi / 2 - 2} ${hipY - 2}
    L ${cx - d.hi / 2 + 4} ${hipY + 46}
    L ${cx - 4} ${hipY + 48}
    L ${cx} ${hipY + 4}
    L ${cx + 4} ${hipY + 48}
    L ${cx + d.hi / 2 - 4} ${hipY + 46}
    L ${cx + d.hi / 2 + 2} ${hipY - 2} Z`;

  // Arms (simple rounded paths)
  const armL = `M ${cx - d.sh / 2 + 2} ${torsoTop + 4} q -${d.arm + 6} 30 -${d.arm + 2} 80 q 2 16 ${d.arm - 2} 18 q ${d.arm - 4} -4 ${d.arm} -22 q -2 -38 -${d.arm - 6} -78 z`;
  const armR = `M ${cx + d.sh / 2 - 2} ${torsoTop + 4} q ${d.arm + 6} 30 ${d.arm + 2} 80 q -2 16 -${d.arm - 2} 18 q -${d.arm - 4} -4 -${d.arm} -22 q 2 -38 ${d.arm - 6} -78 z`;

  // Legs
  const legL = `M ${cx - d.hi / 2 + 4} ${hipY + 44} L ${cx - 8} ${hipY + 48} L ${cx - 10} ${footY} L ${cx - 18 - d.thigh / 4} ${footY} L ${cx - d.thigh - 6} ${kneeY} L ${cx - d.hi / 2 - 4} ${hipY + 50} Z`;
  const legR = `M ${cx + d.hi / 2 - 4} ${hipY + 44} L ${cx + 8} ${hipY + 48} L ${cx + 10} ${footY} L ${cx + 18 + d.thigh / 4} ${footY} L ${cx + d.thigh + 6} ${kneeY} L ${cx + d.hi / 2 + 4} ${hipY + 50} Z`;

  // Eyes
  const eyeRy = cfg.eyeShape === "narrow" ? 1.4 : cfg.eyeShape === "round" ? 2.6 : 2.0;
  const eyeRx = cfg.eyeShape === "round" ? 2.6 : 3.0;

  return (
    <svg viewBox="0 0 200 360" width="auto" height={height} aria-label="Twoja postać" style={{ display: "block" }}>
      <defs>
        <radialGradient id="fbBg" cx="50%" cy="35%" r="80%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fbSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skinL} />
          <stop offset="50%" stopColor={skin} />
          <stop offset="100%" stopColor={skinD} />
        </linearGradient>
        <linearGradient id="fbShirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(tint, 12)} />
          <stop offset="100%" stopColor={tintD} />
        </linearGradient>
        <linearGradient id="fbPants" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#222831" />
          <stop offset="100%" stopColor="#0a0d12" />
        </linearGradient>
      </defs>

      {/* glow */}
      <rect width="200" height="360" fill="url(#fbBg)" />

      {/* Legs */}
      <path d={legL} fill="url(#fbPants)" />
      <path d={legR} fill="url(#fbPants)" />
      {/* Shoes */}
      <rect x={cx - 22 - d.thigh / 4} y={footY - 4} width={18 + d.thigh / 4} height={8} rx={3} fill="#111" />
      <rect x={cx + 4} y={footY - 4} width={18 + d.thigh / 4} height={8} rx={3} fill="#111" />

      {/* Arms (behind torso) */}
      <path d={armL} fill="url(#fbSkin)" />
      <path d={armR} fill="url(#fbSkin)" />

      {/* Torso skin (visible at neck/waist gaps) */}
      <path d={torso} fill="url(#fbSkin)" />

      {/* Shirt */}
      <path d={shirt} fill="url(#fbShirt)" />
      {/* Chest definition for masc / bust for fem */}
      {!isFem && d.chest > 18 && (
        <path d={`M ${cx - d.chest / 2} ${torsoTop + 24} Q ${cx} ${torsoTop + 36} ${cx + d.chest / 2} ${torsoTop + 24}`} stroke={tintD} strokeOpacity="0.6" strokeWidth="1.5" fill="none" />
      )}
      {isFem && d.bust > 0 && (
        <g>
          <ellipse cx={cx - 10} cy={torsoTop + 28} rx={d.bust} ry={d.bust * 0.85} fill={shade(tint, 6)} opacity="0.95" />
          <ellipse cx={cx + 10} cy={torsoTop + 28} rx={d.bust} ry={d.bust * 0.85} fill={shade(tint, 6)} opacity="0.95" />
        </g>
      )}
      {/* Abs hint for muscular */}
      {!isFem && cfg.body === "muscular" && (
        <g stroke={tintD} strokeOpacity="0.5" strokeWidth="1" fill="none">
          <path d={`M ${cx} ${torsoTop + 44} L ${cx} ${waistY - 8}`} />
          <path d={`M ${cx - 10} ${torsoTop + 56} L ${cx + 10} ${torsoTop + 56}`} />
          <path d={`M ${cx - 10} ${torsoTop + 70} L ${cx + 10} ${torsoTop + 70}`} />
        </g>
      )}

      {/* Neck */}
      <rect x={cx - 9} y={neckTop} width="18" height="10" fill={skinD} />

      {/* Head */}
      <ellipse cx={cx} cy={headCy} rx={headRx} ry={headRy} fill="url(#fbSkin)" />
      {/* ears */}
      <ellipse cx={cx - headRx + 1} cy={headCy + 4} rx={3} ry={5} fill={skinD} />
      <ellipse cx={cx + headRx - 1} cy={headCy + 4} rx={3} ry={5} fill={skinD} />

      {/* Brows */}
      <path d={`M ${cx - 12} ${headCy - 6} Q ${cx - 7} ${headCy - 9} ${cx - 2} ${headCy - 6}`} stroke={hair} strokeWidth={isFem ? 1.6 : 2.2} fill="none" strokeLinecap="round" />
      <path d={`M ${cx + 2} ${headCy - 6} Q ${cx + 7} ${headCy - 9} ${cx + 12} ${headCy - 6}`} stroke={hair} strokeWidth={isFem ? 1.6 : 2.2} fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <g>
        <ellipse cx={cx - 7} cy={headCy - 1} rx={eyeRx} ry={eyeRy} fill="#fff" />
        <ellipse cx={cx + 7} cy={headCy - 1} rx={eyeRx} ry={eyeRy} fill="#fff" />
        <circle cx={cx - 7} cy={headCy - 1} r={Math.min(eyeRx, eyeRy) - 0.2} fill={cfg.eyeColor} />
        <circle cx={cx + 7} cy={headCy - 1} r={Math.min(eyeRx, eyeRy) - 0.2} fill={cfg.eyeColor} />
        <circle cx={cx - 7} cy={headCy - 1} r={0.7} fill="#000" />
        <circle cx={cx + 7} cy={headCy - 1} r={0.7} fill="#000" />
      </g>

      {/* Nose */}
      <path d={`M ${cx - 1.5} ${headCy + 4} Q ${cx - 2} ${headCy + 10} ${cx} ${headCy + 12} Q ${cx + 2} ${headCy + 10} ${cx + 1.5} ${headCy + 4}`} stroke={skinD} strokeWidth="1" fill="none" />

      {/* Lips */}
      {isFem ? (
        <path d={`M ${cx - 6} ${headCy + 18} Q ${cx} ${headCy + 22} ${cx + 6} ${headCy + 18} Q ${cx} ${headCy + 20} ${cx - 6} ${headCy + 18} Z`} fill={shade(skin, -36)} />
      ) : (
        <path d={`M ${cx - 6} ${headCy + 18} Q ${cx} ${headCy + 21} ${cx + 6} ${headCy + 18}`} stroke={shade(skin, -36)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}

      {/* Facial hair (masc) */}
      {!isFem && cfg.facialHair !== "none" && (
        <FacialHair kind={cfg.facialHair} color={hair} cx={cx} cy={headCy} />
      )}

      {/* Hair */}
      <Hair style={cfg.hairStyle} color={hair} hi={hairHi} fem={isFem} cx={cx} cy={headCy} rx={headRx} ry={headRy} />

      {/* Floor shadow */}
      <ellipse cx={cx} cy={footY + 6} rx={38} ry={4} fill="#000" opacity="0.45" />
    </svg>
  );
}

function Hair({ style, color, hi, fem, cx, cy, rx, ry }: { style: AvatarConfig["hairStyle"]; color: string; hi: string; fem: boolean; cx: number; cy: number; rx: number; ry: number }) {
  const top = cy - ry - 2;
  switch (style) {
    case "bald": return null;
    case "buzz":
      return <path d={`M ${cx - rx} ${cy - 4} Q ${cx} ${top + 4} ${cx + rx} ${cy - 4} Q ${cx} ${top - 2} ${cx - rx} ${cy - 4} Z`} fill={color} opacity="0.85" />;
    case "fade":
      return (
        <g>
          <path d={`M ${cx - rx - 1} ${cy - 2} Q ${cx} ${top - 6} ${cx + rx + 1} ${cy - 2} Q ${cx} ${top + 4} ${cx - rx - 1} ${cy - 2} Z`} fill={color} />
          <path d={`M ${cx - rx + 4} ${cy - 4} Q ${cx} ${top + 6} ${cx + rx - 4} ${cy - 4}`} stroke="#000" strokeOpacity="0.3" strokeWidth="2" fill="none" />
        </g>
      );
    case "short":
      return (
        <g>
          <path d={`M ${cx - rx - 2} ${cy + 2} Q ${cx} ${top - 10} ${cx + rx + 2} ${cy + 2} Q ${cx + rx + 2} ${top + 4} ${cx} ${top - 2} Q ${cx - rx - 2} ${top + 4} ${cx - rx - 2} ${cy + 2} Z`} fill={color} />
          <path d={`M ${cx - 12} ${top + 4} Q ${cx} ${top - 6} ${cx + 12} ${top + 4}`} stroke={hi} strokeOpacity="0.6" strokeWidth="1.4" fill="none" />
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          <circle cx={cx - rx + 4} cy={top + 8} r="8" />
          <circle cx={cx - 8} cy={top - 2} r="9" />
          <circle cx={cx + 8} cy={top - 2} r="9" />
          <circle cx={cx + rx - 4} cy={top + 8} r="8" />
          <circle cx={cx - rx - 2} cy={cy - 2} r="6" />
          <circle cx={cx + rx + 2} cy={cy - 2} r="6" />
        </g>
      );
    case "long":
      return (
        <g fill={color}>
          <path d={`M ${cx - rx - 4} ${cy - 2} Q ${cx} ${top - 10} ${cx + rx + 4} ${cy - 2} L ${cx + rx + 8} ${cy + ry + 30} Q ${cx} ${cy + ry + 20} ${cx - rx - 8} ${cy + ry + 30} Z`} />
          <path d={`M ${cx - 14} ${top + 6} Q ${cx} ${top - 4} ${cx + 14} ${top + 6}`} stroke={hi} strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
        </g>
      );
    case "ponytail":
      return (
        <g fill={color}>
          <path d={`M ${cx - rx - 1} ${cy} Q ${cx} ${top - 8} ${cx + rx + 1} ${cy} Q ${cx} ${top + 4} ${cx - rx - 1} ${cy} Z`} />
          <path d={`M ${cx + rx - 2} ${cy} Q ${cx + rx + 14} ${cy + 18} ${cx + rx + 10} ${cy + ry + 14} Q ${cx + rx + 4} ${cy + ry} ${cx + rx - 4} ${cy + 4} Z`} />
        </g>
      );
    case "bun":
      return (
        <g fill={color}>
          <path d={`M ${cx - rx - 1} ${cy} Q ${cx} ${top - 4} ${cx + rx + 1} ${cy} Q ${cx} ${top + 6} ${cx - rx - 1} ${cy} Z`} />
          <circle cx={cx} cy={top - 10} r="9" />
          <circle cx={cx} cy={top - 10} r="9" fill={hi} opacity="0.3" />
        </g>
      );
    default: return null;
  }
}

function FacialHair({ kind, color, cx, cy }: { kind: AvatarConfig["facialHair"]; color: string; cx: number; cy: number }) {
  switch (kind) {
    case "stubble":
      return <path d={`M ${cx - 16} ${cy + 14} Q ${cx} ${cy + 30} ${cx + 16} ${cy + 14} Q ${cx} ${cy + 24} ${cx - 16} ${cy + 14} Z`} fill={color} opacity="0.25" />;
    case "moustache":
      return <path d={`M ${cx - 8} ${cy + 16} Q ${cx} ${cy + 19} ${cx + 8} ${cy + 16} Q ${cx + 4} ${cy + 19} ${cx} ${cy + 19} Q ${cx - 4} ${cy + 19} ${cx - 8} ${cy + 16} Z`} fill={color} />;
    case "beard":
      return (
        <g fill={color}>
          <path d={`M ${cx - 18} ${cy + 10} Q ${cx} ${cy + 36} ${cx + 18} ${cy + 10} Q ${cx} ${cy + 30} ${cx - 18} ${cy + 10} Z`} />
          <path d={`M ${cx - 8} ${cy + 16} Q ${cx} ${cy + 19} ${cx + 8} ${cy + 16}`} stroke="#000" strokeOpacity="0.2" />
        </g>
      );
    default: return null;
  }
}

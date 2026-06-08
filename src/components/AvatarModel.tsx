import { getAvatarImageFor, skinFilter, type AvatarConfig } from "./AvatarSvg";

const ASPECT: Record<string, number> = {
  "m-slim": 479 / 1244,
  "m-athletic": 358 / 1002,
  "m-medium": 559 / 1196,
  "m-muscular": 768 / 1249,
  "m-curvy": 559 / 1196,
  "k-slim": 350 / 1016,
  "k-athletic": 697 / 1264,
  "k-medium": 431 / 1262,
  "k-muscular": 697 / 1264,
  "k-curvy": 431 / 1262,
};

export function AvatarModel({
  cfg,
  height,
  rotation = 0,
  className = "",
  showCustomDetails = true,
}: {
  cfg: AvatarConfig;
  height: number | string;
  rotation?: number;
  className?: string;
  showCustomDetails?: boolean;
}) {
  const base = cfg.gender === "nb" ? (cfg.nbBase ?? "m") : cfg.gender;
  const key = `${base}-${cfg.body}`;
  const flip = rotation > 90 && rotation < 270;
  const sideShift = Math.sin((rotation * Math.PI) / 180) * 16;
  const aspect = ASPECT[key] ?? ASPECT[`${base}-athletic`] ?? ASPECT["m-athletic"];
  const isFem = base === "k";

  return (
    <div
      className={`relative ${className}`}
      style={{
        height,
        aspectRatio: String(aspect),
        transform: `scaleX(${flip ? -1 : 1}) translateX(${sideShift}px)`,
        transition: "transform 80ms linear",
        filter: `drop-shadow(0 28px 42px rgba(0,0,0,0.6)) drop-shadow(0 0 28px ${cfg.outfitTint}44)`,
      }}
      aria-label="Twoja postać"
    >
      <img
        src={getAvatarImageFor(cfg.gender, cfg.body, cfg.nbBase ?? "m")}
        alt="Twój avatar"
        className="h-full w-full object-contain"
        style={{ filter: skinFilter(cfg.skinTone) }}
        loading="lazy"
      />
      {showCustomDetails && (
        <>
          <HairOverlay cfg={cfg} isFem={isFem} />
          {!isFem && cfg.facialHair !== "none" && <FacialHairOverlay cfg={cfg} />}
          <EyeOverlay cfg={cfg} />
          <OutfitAccent cfg={cfg} isFem={isFem} />
        </>
      )}
    </div>
  );
}

function HairOverlay({ cfg, isFem }: { cfg: AvatarConfig; isFem: boolean }) {
  if (cfg.hairStyle === "bald") return null;
  const common = "absolute left-1/2 -translate-x-1/2 pointer-events-none mix-blend-normal";
  const style = { background: cfg.hairColor, boxShadow: `0 2px 10px ${cfg.hairColor}88` };
  if (cfg.hairStyle === "bun") {
    return <div className={`${common} top-[1.5%] h-[6%] w-[16%] rounded-full`} style={style} />;
  }
  if (cfg.hairStyle === "ponytail") {
    return <div className={`${common} top-[4%] h-[18%] w-[18%] rounded-b-full rounded-t-[60%]`} style={style} />;
  }
  if (cfg.hairStyle === "long") {
    return <div className={`${common} top-[4%] h-[18%] w-[24%] rounded-t-full rounded-b-[35%] opacity-90`} style={style} />;
  }
  if (cfg.hairStyle === "curly") {
    return <div className={`${common} top-[3.5%] h-[10%] w-[26%] rounded-full opacity-95`} style={style} />;
  }
  return <div className={`${common} ${isFem ? "top-[4.2%] h-[7%] w-[21%]" : "top-[4.6%] h-[6%] w-[23%]"} rounded-t-full opacity-95`} style={style} />;
}

function EyeOverlay({ cfg }: { cfg: AvatarConfig }) {
  const narrow = cfg.eyeShape === "narrow";
  return (
    <div className="pointer-events-none absolute left-1/2 top-[10.4%] flex -translate-x-1/2 gap-[0.55em] text-[7px] opacity-90" style={{ color: cfg.eyeColor }}>
      <span className={narrow ? "h-[0.28em] w-[0.8em] rounded-full bg-current" : "h-[0.62em] w-[0.62em] rounded-full bg-current"} />
      <span className={narrow ? "h-[0.28em] w-[0.8em] rounded-full bg-current" : "h-[0.62em] w-[0.62em] rounded-full bg-current"} />
    </div>
  );
}

function FacialHairOverlay({ cfg }: { cfg: AvatarConfig }) {
  const style = { background: cfg.hairColor };
  if (cfg.facialHair === "moustache") {
    return <div className="pointer-events-none absolute left-1/2 top-[12.8%] h-[1.1%] w-[12%] -translate-x-1/2 rounded-full opacity-90" style={style} />;
  }
  return <div className="pointer-events-none absolute left-1/2 top-[12.5%] h-[4.2%] w-[15%] -translate-x-1/2 rounded-b-full opacity-70" style={style} />;
}

function OutfitAccent({ cfg, isFem }: { cfg: AvatarConfig; isFem: boolean }) {
  return (
    <>
      <span className="pointer-events-none absolute left-[37%] top-[23%] h-[1.2%] w-[10%] rotate-[-18deg] rounded-full opacity-80" style={{ background: cfg.outfitTint }} />
      <span className="pointer-events-none absolute right-[37%] top-[23%] h-[1.2%] w-[10%] rotate-[18deg] rounded-full opacity-80" style={{ background: cfg.outfitTint }} />
      {!isFem && <span className="pointer-events-none absolute left-1/2 top-[31%] h-[1%] w-[18%] -translate-x-1/2 rounded-full opacity-60" style={{ background: cfg.outfitTint }} />}
    </>
  );
}
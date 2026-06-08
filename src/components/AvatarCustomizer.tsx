import { useState } from "react";
import { X, Check, ChevronRight } from "lucide-react";
import {
  AvatarSvg,
  DEFAULT_AVATAR,
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  hairOptionsFor,
  type AvatarConfig,
} from "./AvatarSvg";

const HAIR_LABEL: Record<AvatarConfig["hairStyle"], string> = {
  short: "Krótkie", buzz: "Na jeżyka", medium: "Średnie", long: "Długie", curly: "Kręcone", bun: "Kok",
};
const BODY_LABEL: Record<AvatarConfig["body"], string> = { slim: "Smukła", athletic: "Atletyczna", muscular: "Umięśniona" };
const OUTFIT_LABEL: Record<AvatarConfig["outfit"], string> = { tank: "Tank top", tshirt: "T-shirt", hoodie: "Bluza", crop: "Crop top" };
const AGE_LABEL: Record<AvatarConfig["age"], string> = { young: "Młody", adult: "Dorosły", mature: "Dojrzały" };

export function AvatarCustomizer({
  initial, onClose, onSave, embedded = false,
}: {
  initial?: Partial<AvatarConfig>;
  onClose?: () => void;
  onSave: (cfg: AvatarConfig) => void;
  embedded?: boolean;
}) {
  const [cfg, setCfg] = useState<AvatarConfig>({ ...DEFAULT_AVATAR, ...(initial ?? {}) });
  const set = <K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  const content = (
    <>
      {!embedded && (
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Dostosuj postać</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="mt-3 grid place-items-center rounded-3xl bg-gradient-to-b from-[var(--magenta)]/15 via-transparent to-[var(--lime)]/10 py-4">
        <AvatarSvg cfg={cfg} size={180} />
      </div>

      <div className="mt-4 space-y-4">
        <Row label="Płeć">
          {(["m","k","nb"] as const).map((g) => (
            <Chip key={g} active={cfg.gender === g} onClick={() => set("gender", g)}>
              {g === "m" ? "♂ Mężczyzna" : g === "k" ? "♀ Kobieta" : "⚧ Both"}
            </Chip>
          ))}
        </Row>

        <Row label="Wiek">
          {(["young","adult","mature"] as const).map((a) => (
            <Chip key={a} active={cfg.age === a} onClick={() => set("age", a)}>{AGE_LABEL[a]}</Chip>
          ))}
        </Row>

        <Row label="Skóra">
          {SKIN_TONES.map((s) => (
            <Swatch key={s} color={s} active={cfg.skin === s} onClick={() => set("skin", s)} />
          ))}
        </Row>

        <Row label="Fryzura">
          {hairOptionsFor(cfg.gender).map((h) => (
            <Chip key={h} active={cfg.hairStyle === h} onClick={() => set("hairStyle", h)}>{HAIR_LABEL[h]}</Chip>
          ))}
        </Row>

        <Row label="Kolor włosów">
          {HAIR_COLORS.map((c) => (
            <Swatch key={c} color={c} active={cfg.hair === c} onClick={() => set("hair", c)} />
          ))}
        </Row>

        <Row label="Sylwetka">
          {(["slim","athletic","muscular"] as const).map((b) => (
            <Chip key={b} active={cfg.body === b} onClick={() => set("body", b)}>{BODY_LABEL[b]}</Chip>
          ))}
        </Row>

        <Row label="Ubiór">
          {(["tank","tshirt","hoodie","crop"] as const).map((o) => (
            <Chip key={o} active={cfg.outfit === o} onClick={() => set("outfit", o)}>{OUTFIT_LABEL[o]}</Chip>
          ))}
        </Row>

        <Row label="Kolor stroju">
          {OUTFIT_COLORS.map((c) => (
            <Swatch key={c} color={c} active={cfg.outfitColor === c} onClick={() => set("outfitColor", c)} />
          ))}
        </Row>
      </div>

      <button
        onClick={() => onSave(cfg)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary"
      >
        {embedded ? (<>Dalej <ChevronRight className="h-4 w-4" /></>) : (<><Check className="h-4 w-4" /> Zapisz wygląd</>)}
      </button>
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4">{content}</div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
function Swatch({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: color }}
      className={`h-8 w-8 rounded-full ring-2 transition ${active ? "ring-[var(--lime)] scale-110" : "ring-white/10"}`}
    />
  );
}
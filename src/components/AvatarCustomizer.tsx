import { useState } from "react";
import { X, Check, ChevronRight, Sparkles, Lock } from "lucide-react";
import {
  DEFAULT_AVATAR,
  BODY_LABELS,
  GENDER_LABELS,
  OUTFIT_TINTS,
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  type AvatarConfig,
  type BodyType,
  type Gender,
  type HairStyle,
  type FacialHair,
  type EyeShape,
} from "./AvatarSvg";
import { AvatarModel } from "./AvatarModel";

const BODY_BY_GENDER: Record<Gender, BodyType[]> = {
  m: ["slim", "athletic", "medium", "muscular", "curvy"],
  k: ["slim", "athletic", "medium", "muscular", "curvy"],
  nb: ["slim", "athletic", "medium", "muscular", "curvy"],
};

const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "short", label: "Krótkie" },
  { id: "buzz", label: "Na jeża" },
  { id: "fade", label: "Fade" },
  { id: "long", label: "Długie" },
  { id: "ponytail", label: "Kucyk" },
  { id: "bun", label: "Kok" },
  { id: "curly", label: "Kręcone" },
  { id: "bald", label: "Łysina" },
];

const FACIAL_HAIR: { id: FacialHair; label: string }[] = [
  { id: "none", label: "Bez" },
  { id: "stubble", label: "Zarost" },
  { id: "moustache", label: "Wąsy" },
  { id: "beard", label: "Broda" },
];

const EYE_SHAPES: { id: EyeShape; label: string }[] = [
  { id: "almond", label: "Migdał" },
  { id: "round", label: "Okrągłe" },
  { id: "narrow", label: "Wąskie" },
];

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
  const isFem = cfg.gender === "k" || (cfg.gender === "nb" && cfg.nbBase === "k");
  const hairBadge = HAIR_STYLES.find((h) => h.id === cfg.hairStyle)?.label ?? "";

  const content = (
    <>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Studio postaci</p>
            <h3 className="font-display text-2xl">Dostosuj postać</h3>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Preview — uses the same realistic avatar base as the homepage */}
      <div
        className="relative mt-4 overflow-hidden rounded-3xl border border-white/10"
        style={{
          background: `radial-gradient(90% 55% at 50% 28%, ${cfg.outfitTint}35 0%, transparent 58%), linear-gradient(180deg,#18131f 0%,#09070e 68%,#020203 100%)`,
        }}
      >
        <div className="absolute left-8 top-8 h-28 w-20 rounded-2xl border border-white/10 bg-white/[0.05]" />
        <div className="absolute right-8 top-12 h-20 w-16 rounded-xl border border-white/10 bg-white/[0.04]" />
        <div className="absolute inset-x-0 bottom-16 h-px bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative grid h-[470px] place-items-end overflow-hidden pt-4">
          <AvatarModel cfg={cfg} height="108%" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-3">
            <Pill>{GENDER_LABELS[cfg.gender]}{cfg.gender === "nb" ? ` · ${cfg.nbBase === "k" ? "♀" : "♂"}` : ""}</Pill>
            <Pill>{BODY_LABELS[cfg.body]}</Pill>
            {hairBadge && <Pill>{hairBadge}</Pill>}
            <span className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: cfg.hairColor }} title="Włosy" />
            <span className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: cfg.eyeColor }} title="Oczy" />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <Section title="Płeć">
          <div className="grid grid-cols-3 gap-2">
            {(["m","k","nb"] as const).map((g) => (
              <BigChip key={g} active={cfg.gender === g} onClick={() => set("gender", g)}>
                <span className="text-base">{g === "m" ? "♂" : g === "k" ? "♀" : "⚧"}</span>
                <span>{g === "m" ? "Mężczyzna" : g === "k" ? "Kobieta" : "Both / NB"}</span>
              </BigChip>
            ))}
          </div>
          {cfg.gender === "nb" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <BigChip active={cfg.nbBase === "m"} onClick={() => set("nbBase", "m")}><span>Baza ♂</span></BigChip>
              <BigChip active={cfg.nbBase === "k"} onClick={() => set("nbBase", "k")}><span>Baza ♀</span></BigChip>
            </div>
          )}
        </Section>

        <Section title="Typ sylwetki">
          <div className="grid grid-cols-5 gap-1.5">
            {BODY_BY_GENDER[cfg.gender].map((b) => (
              <BodyTile key={b} cfg={{ ...cfg, body: b }} active={cfg.body === b} onClick={() => set("body", b)} label={BODY_LABELS[b]} />
            ))}
          </div>
        </Section>

        <Section title="Kolor skóry">
          <div className="flex flex-wrap gap-2">
            {SKIN_TONES.map((s) => (
              <button
                key={s.id}
                onClick={() => set("skinTone", s.id)}
                title={s.label}
                aria-label={s.label}
                style={{ background: s.hex, boxShadow: cfg.skinTone === s.id ? `0 0 0 2px #fff` : undefined }}
                className={`h-10 w-10 rounded-full ring-1 ring-white/10 transition ${cfg.skinTone === s.id ? "scale-110" : ""}`}
              />
            ))}
          </div>
        </Section>

        <Section title="Fryzura">
          <div className="grid grid-cols-4 gap-2">
            {HAIR_STYLES.map((h) => (
              <BigChip key={h.id} active={cfg.hairStyle === h.id} onClick={() => set("hairStyle", h.id)}>
                <span>{h.label}</span>
              </BigChip>
            ))}
          </div>
        </Section>

        <Section title="Kolor włosów">
          <div className="flex flex-wrap gap-2">
            {HAIR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set("hairColor", c)}
                aria-label={c}
                style={{ background: c, boxShadow: cfg.hairColor === c ? `0 0 0 2px #fff` : undefined }}
                className={`h-8 w-8 rounded-full ring-1 ring-white/10 ${cfg.hairColor === c ? "scale-110" : ""}`}
              />
            ))}
          </div>
        </Section>

        <Section title="Kształt oczu">
          <div className="grid grid-cols-3 gap-2">
            {EYE_SHAPES.map((e) => (
              <BigChip key={e.id} active={cfg.eyeShape === e.id} onClick={() => set("eyeShape", e.id)}>
                <span>{e.label}</span>
              </BigChip>
            ))}
          </div>
        </Section>

        <Section title="Kolor oczu">
          <div className="flex flex-wrap gap-2">
            {EYE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set("eyeColor", c)}
                aria-label={c}
                style={{ background: c, boxShadow: cfg.eyeColor === c ? `0 0 0 2px #fff` : undefined }}
                className={`h-8 w-8 rounded-full ring-1 ring-white/10 ${cfg.eyeColor === c ? "scale-110" : ""}`}
              />
            ))}
          </div>
        </Section>

        {!isFem && (
          <Section title="Zarost">
            <div className="grid grid-cols-4 gap-2">
              {FACIAL_HAIR.map((f) => (
                <BigChip key={f.id} active={cfg.facialHair === f.id} onClick={() => set("facialHair", f.id)}>
                  <span>{f.label}</span>
                </BigChip>
              ))}
            </div>
          </Section>
        )}

        <Section title="Akcent stroju">
          <div className="flex flex-wrap gap-2">
            {OUTFIT_TINTS.map((c) => (
              <button
                key={c}
                onClick={() => set("outfitTint", c)}
                aria-label={c}
                style={{ background: c, boxShadow: cfg.outfitTint === c ? `0 0 0 2px #fff, 0 0 16px ${c}` : undefined }}
                className={`h-9 w-9 rounded-full transition ${cfg.outfitTint === c ? "scale-110" : "ring-1 ring-white/10"}`}
              />
            ))}
          </div>
        </Section>

        <Section title="Skiny premium" right={<span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><Lock className="h-3 w-3"/> Wymaga Premium</span>}>
          <div className="grid grid-cols-3 gap-2">
            {["Cyber Suit","Neon Hoodie","Champion Gold"].map((s) => (
              <div key={s} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 opacity-70">
                <div className="grid h-16 place-items-center rounded-xl bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--lime)]/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-2 text-[11px] font-medium">{s}</p>
                <Lock className="absolute right-2 top-2 h-3 w-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Section>
      </div>

      <button
        onClick={() => onSave(cfg)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-secondary to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary"
      >
        {embedded ? (<>Dalej <ChevronRight className="h-4 w-4" /></>) : (<><Check className="h-4 w-4" /> Zapisz wygląd</>)}
      </button>
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[94vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4">{content}</div>
      </div>
    </div>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
        {right}
      </div>
      {children}
    </div>
  );
}

function BigChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-3 text-xs font-medium transition ${
        active
          ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground glow-primary"
          : "bg-white/5 text-muted-foreground hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-wider backdrop-blur">{children}</span>;
}

function BodyTile({ cfg, active, onClick, label }: { cfg: AvatarConfig; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border transition ${
        active ? "border-primary bg-primary/10 glow-primary" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="grid h-20 place-items-end overflow-hidden bg-gradient-to-b from-transparent to-black/40">
        <AvatarModel cfg={cfg} height={94} />
      </div>
      <p className="px-1 py-1 text-center text-[9px] font-medium leading-tight">{label}</p>
    </button>
  );
}
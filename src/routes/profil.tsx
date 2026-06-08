import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings, Shirt, Sofa, Trophy, BadgeCheck, Sparkles, Scale, Ruler, Pencil, TrendingDown, X, Plus, Bell, Lock } from "lucide-react";
import { AvatarCustomizer } from "@/components/AvatarCustomizer";
import { DEFAULT_AVATAR, getAvatarImage, type AvatarConfig } from "@/components/AvatarSvg";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Profil — GymWrld" }] }),
  component: Profil,
});

function Profil() {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [avatarCfg, setAvatarCfg] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [identity, setIdentity] = useState<{ name?: string; nickname?: string }>({});
  const [body, setBody] = useState({
    weight: 0, height: 0, chest: 0, waist: 0, hips: 0, biceps: 0, thigh: 0,
  });
  const [weightLog, setWeightLog] = useState<{ ts: number; weight: number }[]>([]);
  const [weightOpen, setWeightOpen] = useState(false);
  const [stats, setStats] = useState<{ sila: number; kondycja: number; dieta: number; sen: number; rozwoj: number; streak: number }>({
    sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0, streak: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("gw_body");
    if (raw) try { setBody({ ...body, ...JSON.parse(raw) }); } catch {}
    try {
      const ra = localStorage.getItem("gw_avatar");
      if (ra) setAvatarCfg({ ...DEFAULT_AVATAR, ...JSON.parse(ra) });
    } catch {}
    try {
      const rp = localStorage.getItem("gw_profile");
      if (rp) {
        const p = JSON.parse(rp);
        setIdentity({ name: p.name, nickname: p.nickname });
        if (p.stats) setStats((s) => ({ ...s, ...p.stats }));
        if (typeof p.streak === "number") setStats((s) => ({ ...s, streak: p.streak }));
      }
    } catch {}
    try {
      const rw = localStorage.getItem("gw_weight_log");
      if (rw) setWeightLog(JSON.parse(rw));
    } catch {}
    const onUpd = () => {
      try {
        const rp = localStorage.getItem("gw_profile");
        if (rp) {
          const p = JSON.parse(rp);
          if (p.stats) setStats((s) => ({ ...s, ...p.stats }));
        }
      } catch {}
    };
    window.addEventListener("gw_profile_update", onUpd);
    return () => window.removeEventListener("gw_profile_update", onUpd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addWeight = (w: number) => {
    const next = [{ ts: Date.now(), weight: w }, ...weightLog].slice(0, 50);
    setWeightLog(next);
    setBody({ ...body, weight: w });
    if (typeof window !== "undefined") {
      localStorage.setItem("gw_weight_log", JSON.stringify(next));
      localStorage.setItem("gw_body", JSON.stringify({ ...body, weight: w }));
    }
    toast.success(`Waga zapisana · ${w} kg`);
    setWeightOpen(false);
  };

  const lastWeightTs = weightLog[0]?.ts ?? 0;
  const daysSinceWeight = lastWeightTs ? Math.floor((Date.now() - lastWeightTs) / (1000 * 60 * 60 * 24)) : null;
  const reminderActive = daysSinceWeight === null || daysSinceWeight >= 7;

  const saveBody = (next: typeof body) => {
    setBody(next);
    if (typeof window !== "undefined") localStorage.setItem("gw_body", JSON.stringify(next));
    toast.success("Zaktualizowano pomiary");
    setOpen(false);
  };

  return (
    <main className="px-5 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <Link to="/ustawienia" className="grid h-9 w-9 place-items-center rounded-full glass">
          <Settings className="h-4 w-4" />
        </Link>
      </header>

      {/* Avatar card */}
      <section className="relative mt-5 overflow-hidden rounded-3xl glass p-5">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
            <img src={getAvatarImage(avatarCfg.gender, avatarCfg.body)} alt="Avatar" className="h-full w-full object-contain" loading="lazy" style={{ filter: `drop-shadow(0 8px 16px ${avatarCfg.outfitTint}66)` }} />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {identity.name || "Bez imienia"}{identity.nickname ? ` · @${identity.nickname}` : ""}
            </p>
            <h2 className="mt-1 text-xl font-semibold">Poziom 1 — Początkujący</h2>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[0%] rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">0 / 2 000 XP do Lvl 2</p>
          </div>
        </div>
      </section>

      {/* Premium banner */}
      <Link to="/premium" className="mt-4 block overflow-hidden rounded-3xl bg-gradient-to-br from-primary/25 via-secondary/15 to-transparent p-[1px]">
        <div className="rounded-3xl bg-card/60 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">GymWrld Premium</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Stwórz swoją cyfrową wersję siebie. AI Coach, ekskluzywne skiny, Premium Deals.</p>
          <div className="mt-3 w-full rounded-full bg-gradient-to-r from-primary to-secondary py-2.5 text-center text-sm font-medium text-primary-foreground glow-primary">
            Odblokuj Premium
          </div>
        </div>
      </Link>

      {/* Body measurements */}
      <div className="mb-3 mt-7 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Wymiary</h3>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1 text-[11px]">
          <Pencil className="h-3 w-3" /> Edytuj
        </button>
      </div>
      <section className="rounded-3xl glass p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--magenta)]/15 text-[var(--magenta)]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-3xl leading-none">{body.weight ? body.weight.toFixed(1) : "—"} <span className="text-sm text-muted-foreground">kg</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {daysSinceWeight === null ? "Waga · brak wpisów" : daysSinceWeight === 0 ? "Waga · dziś" : `Waga · ${daysSinceWeight} dni temu`}
              </p>
            </div>
          </div>
          <button onClick={() => setWeightOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-3 py-1.5 text-[11px] font-semibold text-white">
            <Plus className="h-3 w-3" /> Zaloguj wagę
          </button>
        </div>
        {reminderActive && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[var(--orange)]/10 px-3 py-2 text-[11px] text-[var(--orange)]">
            <Bell className="h-3.5 w-3.5" /> Czas zalogować nową wagę {daysSinceWeight !== null ? `(${daysSinceWeight} dni temu)` : "— zacznij dziś"}
          </div>
        )}
        {weightLog.length > 1 && (
          <div className="mt-3 flex items-end gap-1 border-t border-white/5 pt-3">
            {weightLog.slice(0, 10).reverse().map((w, i) => {
              const max = Math.max(...weightLog.map((x) => x.weight));
              const min = Math.min(...weightLog.map((x) => x.weight));
              const range = Math.max(1, max - min);
              return (
                <div key={i} className="flex-1">
                  <div className="rounded-full bg-gradient-to-t from-[var(--magenta)] to-[var(--orange)]" style={{ height: `${((w.weight - min) / range) * 30 + 4}px` }} />
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <BodyStat label="Wzrost" value={body.height ? `${body.height} cm` : "—"} />
          <BodyStat label="Klatka" value={body.chest ? `${body.chest} cm` : "—"} />
          <BodyStat label="Talia" value={body.waist ? `${body.waist} cm` : "—"} />
          <BodyStat label="Biodra" value={body.hips ? `${body.hips} cm` : "—"} />
          <BodyStat label="Biceps" value={body.biceps ? `${body.biceps} cm` : "—"} />
          <BodyStat label="Udo" value={body.thigh ? `${body.thigh} cm` : "—"} />
        </div>
      </section>

      {/* Stats */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Statystyki</h3>
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Siła" value={String(stats.sila)} />
        <StatBox label="Kondycja" value={String(stats.kondycja)} />
        <StatBox label="Dieta" value={String(stats.dieta)} />
        <StatBox label="Sen" value={String(stats.sen)} />
        <StatBox label="Rozwój" value={String(stats.rozwoj)} />
        <StatBox label="Streak" value={`${stats.streak} dni`} />
      </div>

      {/* Collection */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Kolekcja</h3>
      <div className="grid grid-cols-4 gap-3">
        <Collect icon={<Shirt className="h-5 w-5" />} label="Ubrania" count={0} />
        <Collect icon={<Sofa className="h-5 w-5" />} label="Dekoracje" count={0} />
        <Collect icon={<Trophy className="h-5 w-5" />} label="Trofea" count={0} />
        <Collect icon={<BadgeCheck className="h-5 w-5" />} label="Odznaki" count={0} />
      </div>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Osiągnięcia</h3>
      <div className="grid grid-cols-3 gap-3">
        {["Pierwszy trening","7 dni streak","Lvl 10","100 km","2 L wody × 30","Push 80 kg"].map((a, i) => (
          <div key={a} className="rounded-2xl glass p-3 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/5 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <p className="mt-2 text-[11px] leading-tight text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>

      {open && <BodySheet body={body} onSave={saveBody} onClose={() => setOpen(false)} />}
      {weightOpen && <WeightSheet current={body.weight} onClose={() => setWeightOpen(false)} onSave={addWeight} />}
      {customOpen && (
        <AvatarCustomizer
          initial={avatarCfg}
          onClose={() => setCustomOpen(false)}
          onSave={(cfg) => {
            setAvatarCfg(cfg);
            if (typeof window !== "undefined") localStorage.setItem("gw_avatar", JSON.stringify(cfg));
            toast.success("Wygląd zaktualizowany ✨");
            setCustomOpen(false);
          }}
        />
      )}
    </main>
  );
}

function QuestRow({ icon, title, reward, pct }: { icon: React.ReactNode; title: string; reward: string; pct: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          <span className="text-[11px] text-primary">{reward}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-3.5 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Collect({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <button className="rounded-2xl glass p-3 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">{icon}</div>
      <p className="mt-2 text-[11px] font-medium">{label}</p>
      <p className="text-[10px] text-muted-foreground">{count} szt.</p>
    </button>
  );
}

function BodyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-2.5">
      <p className="font-display text-base leading-none">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function BodySheet({ body, onSave, onClose }: { body: any; onSave: (b: any) => void; onClose: () => void }) {
  const [s, setS] = useState(body);
  const fields: { key: keyof typeof body; label: string; unit: string; icon: React.ReactNode }[] = [
    { key: "weight", label: "Waga", unit: "kg", icon: <Scale className="h-4 w-4" /> },
    { key: "height", label: "Wzrost", unit: "cm", icon: <Ruler className="h-4 w-4" /> },
    { key: "chest", label: "Klatka", unit: "cm", icon: <Ruler className="h-4 w-4" /> },
    { key: "waist", label: "Talia", unit: "cm", icon: <Ruler className="h-4 w-4" /> },
    { key: "hips", label: "Biodra", unit: "cm", icon: <Ruler className="h-4 w-4" /> },
    { key: "biceps", label: "Biceps", unit: "cm", icon: <Ruler className="h-4 w-4" /> },
    { key: "thigh", label: "Udo", unit: "cm", icon: <Ruler className="h-4 w-4" /> },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Pomiary ciała</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {fields.map((f) => (
            <label key={String(f.key)} className="rounded-2xl bg-white/5 p-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                {f.icon}{f.label} ({f.unit})
              </span>
              <input
                type="number"
                step={f.key === "weight" ? "0.1" : "1"}
                value={s[f.key]}
                onChange={(e) => setS({ ...s, [f.key]: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full bg-transparent font-display text-2xl outline-none"
              />
            </label>
          ))}
        </div>
        <button
          onClick={() => onSave(s)}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary"
        >
          Zapisz pomiary
        </button>
      </div>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings, Shirt, Sofa, Trophy, BadgeCheck, Sparkles, Scale, Ruler, Pencil, TrendingDown, X, Plus, Bell, Lock, Heart, Droplet } from "lucide-react";
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
  const [gender, setGender] = useState<string | null>(null);
  const [floLinked, setFloLinked] = useState(false);
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
        setGender(p.gender ?? null);
        setFloLinked(!!p.floLinked);
        // Sync avatar gender with profile gender if mismatched (fix non-binary/female default)
        if (p.gender && typeof window !== "undefined") {
          try {
            const ra = localStorage.getItem("gw_avatar");
            const cur = ra ? JSON.parse(ra) : DEFAULT_AVATAR;
            if (cur.gender !== p.gender) {
              const next = { ...DEFAULT_AVATAR, ...cur, gender: p.gender };
              localStorage.setItem("gw_avatar", JSON.stringify(next));
              setAvatarCfg(next);
            }
          } catch {}
        }
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
          <Link to="/statystyki" className="flex-1 block rounded-2xl -m-2 p-2 transition active:scale-[0.99] hover:bg-white/[0.03]">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {identity.name || "Bez imienia"}{identity.nickname ? ` · @${identity.nickname}` : ""}
            </p>
            <h2 className="mt-1 text-xl font-semibold">Poziom 1 — Początkujący →</h2>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[0%] rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Zobacz Twój Progres · statystyki</p>
          </Link>
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

      {gender === "k" && <CycleSection floLinked={floLinked} onFloLink={() => {
        try {
          const rp = localStorage.getItem("gw_profile");
          const p = rp ? JSON.parse(rp) : {};
          localStorage.setItem("gw_profile", JSON.stringify({ ...p, floLinked: true }));
          setFloLinked(true);
          toast.success("Połączono z FLO 🌸");
        } catch {}
      }} />}

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

function CycleSection({ floLinked, onFloLink }: { floLinked: boolean; onFloLink: () => void }) {
  const [start, setStart] = useState<string>("");
  const [length, setLength] = useState<number>(28);
  const [period, setPeriod] = useState<number>(5);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_cycle");
      if (raw) {
        const c = JSON.parse(raw);
        setStart(c.start ?? "");
        setLength(c.length ?? 28);
        setPeriod(c.period ?? 5);
      }
    } catch {}
  }, []);
  const save = (s: string, l: number, p: number) => {
    setStart(s); setLength(l); setPeriod(p);
    if (typeof window !== "undefined") localStorage.setItem("gw_cycle", JSON.stringify({ start: s, length: l, period: p }));
    toast.success("Cykl zapisany");
    setOpen(false);
  };

  // compute day & phase
  const today = new Date(); today.setHours(0,0,0,0);
  const startDate = start ? new Date(start) : null;
  let day = 0;
  let phase = "—";
  let nextPeriodIn: number | null = null;
  if (startDate) {
    const diff = Math.floor((today.getTime() - startDate.getTime()) / 86400000);
    day = ((diff % length) + length) % length + 1;
    if (day <= period) phase = "Miesiączka";
    else if (day <= length / 2 - 2) phase = "Folikularna";
    else if (day <= length / 2 + 2) phase = "Owulacja";
    else phase = "Lutealna";
    nextPeriodIn = length - day + 1;
  }

  const PHASES: Record<string, { color: string; energy: string; training: string; tip: string; emoji: string }> = {
    "Miesiączka":  { color: "#e94560", energy: "Niska", training: "Joga, spacer, mobilizacja, lekkie cardio", tip: "Słuchaj ciała — odpuść PR-y, postaw na regenerację i nawodnienie.", emoji: "🩸" },
    "Folikularna": { color: "#bef264", energy: "Wysoka",  training: "Siłowy progres, hipertrofia, HIIT — to Twój peak", tip: "Najlepszy czas na bicie rekordów i intensywne sesje.", emoji: "⚡" },
    "Owulacja":    { color: "#ffd166", energy: "Szczyt",  training: "Maksymalna siła, sprinty, rywalizacja",        tip: "Energia i koordynacja na maksa — wykorzystaj okno mocy.", emoji: "🔥" },
    "Lutealna":    { color: "#a78bfa", energy: "Spadająca", training: "Umiarkowane cardio, technika, stretching",     tip: "Tempo spada — postaw na objętość zamiast intensywności, więcej snu.", emoji: "🌙" },
  };
  const ph = PHASES[phase] ?? PHASES["Folikularna"];

  return (
    <>
      <div className="mb-3 mt-7 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cykl menstruacyjny</h3>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1 text-[11px]">
          <Pencil className="h-3 w-3" /> {start ? "Edytuj" : "Ustaw"}
        </button>
      </div>
      <section className="rounded-3xl glass p-5">
        {!start ? (
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-2xl">🌸</div>
            <p className="mt-3 text-sm font-medium">Trackuj swój cykl</p>
            <p className="mt-1 text-xs text-muted-foreground">Dodaj datę ostatniej miesiączki, by GymWrld dopasował trening do Twojej fazy.</p>
            <button onClick={() => setOpen(true)} className="mt-4 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-4 py-2 text-xs font-semibold text-white glow-primary">
              Ustaw cykl
            </button>
            {!floLinked && (
              <button onClick={onFloLink} className="mt-2 block w-full rounded-full bg-white/5 px-4 py-2 text-xs text-muted-foreground">
                lub połącz z aplikacją FLO
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="relative grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(${ph.color} ${(day/length)*360}deg, rgba(255,255,255,0.06) 0)` }}>
                <div className="absolute inset-1.5 rounded-full bg-[var(--surface)] grid place-items-center">
                  <p className="text-xl leading-none">{ph.emoji}</p>
                  <p className="font-display text-2xl leading-none mt-0.5">{day}</p>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">dzień</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: `${ph.color}22`, color: ph.color }}>
                  <Heart className="h-3 w-3" /> {phase}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Energia: <span className="text-foreground font-medium">{ph.energy}</span></p>
                <p className="mt-1 text-xs text-muted-foreground">Następna miesiączka za <span className="text-foreground font-medium">{nextPeriodIn} dni</span></p>
                {floLinked && <p className="mt-1 text-[10px] text-[var(--lime)]">✓ Połączono z FLO</p>}
              </div>
            </div>

            {/* Phase ribbon */}
            <div className="mt-4">
              <div className="relative h-3 w-full overflow-hidden rounded-full">
                <div className="absolute inset-0 flex">
                  <div style={{ flex: period, background: PHASES["Miesiączka"].color }} />
                  <div style={{ flex: Math.max(1, length / 2 - 2 - period), background: PHASES["Folikularna"].color }} />
                  <div style={{ flex: 4, background: PHASES["Owulacja"].color }} />
                  <div style={{ flex: Math.max(1, length - (length / 2 + 2)), background: PHASES["Lutealna"].color }} />
                </div>
                <div className="absolute top-0 h-3 w-0.5 bg-white" style={{ left: `${((day - 1) / length) * 100}%` }} />
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1 text-[9px] text-muted-foreground">
                <span>🩸 Miesiączka</span>
                <span>⚡ Folikularna</span>
                <span>🔥 Owulacja</span>
                <span>🌙 Lutealna</span>
              </div>
            </div>

            {/* Training guidance */}
            <div className="mt-4 space-y-2">
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Trening na dziś</p>
                <p className="mt-1 text-sm font-medium">{ph.training}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[var(--magenta)]/10 to-[var(--lime)]/5 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Wskazówka</p>
                <p className="mt-1 text-xs">{ph.tip}</p>
              </div>
            </div>
          </>
        )}
      </section>
      {open && (
        <CycleSheet start={start} length={length} period={period} onClose={() => setOpen(false)} onSave={save} />
      )}
    </>
  );
}

function CycleSheet({ start, length, period, onClose, onSave }: { start: string; length: number; period: number; onClose: () => void; onSave: (s: string, l: number, p: number) => void }) {
  const [s, setS] = useState(start || new Date().toISOString().slice(0, 10));
  const [l, setL] = useState(length);
  const [p, setP] = useState(period);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Twój cykl</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <label className="mt-4 block rounded-2xl bg-white/5 p-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Data ostatniej miesiączki</span>
          <input type="date" value={s} onChange={(e) => setS(e.target.value)} className="mt-1 w-full bg-transparent font-display text-xl outline-none" />
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="rounded-2xl bg-white/5 p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Długość cyklu (dni)</span>
            <input type="number" min={20} max={45} value={l} onChange={(e) => setL(parseInt(e.target.value) || 28)} className="mt-1 w-full bg-transparent font-display text-2xl outline-none" />
          </label>
          <label className="rounded-2xl bg-white/5 p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Krwawienie (dni)</span>
            <input type="number" min={2} max={10} value={p} onChange={(e) => setP(parseInt(e.target.value) || 5)} className="mt-1 w-full bg-transparent font-display text-2xl outline-none" />
          </label>
        </div>
        <button onClick={() => onSave(s, l, p)} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary">
          Zapisz cykl
        </button>
      </div>
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
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
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

function WeightSheet({ current, onClose, onSave }: { current: number; onClose: () => void; onSave: (w: number) => void }) {
  const [w, setW] = useState<number | "">(current || "");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Zaloguj wagę</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <label className="mt-4 block rounded-2xl bg-white/5 p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Waga (kg)</span>
          <input
            type="number"
            step="0.1"
            value={w}
            onChange={(e) => setW(e.target.value ? parseFloat(e.target.value) : "")}
            placeholder="np. 78.4"
            className="mt-1 w-full bg-transparent font-display text-4xl outline-none"
          />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">Przypomnimy Ci co tydzień, żeby śledzić trend.</p>
        <button
          onClick={() => w && onSave(Number(w))}
          disabled={!w}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary disabled:opacity-40"
        >
          Zapisz wagę
        </button>
      </div>
    </div>
  );
}
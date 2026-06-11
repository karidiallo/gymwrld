import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import gymHero from "@/assets/gym-hero.jpg";
import homeHero from "@/assets/home-hero.jpg";
import outdoorHero from "@/assets/outdoor-hero.jpg";
import calisthenicsHero from "@/assets/calisthenics-hero.jpg";
import womenHero from "@/assets/women-hero.jpg";
import cutHero from "@/assets/cut-hero.jpg";
import { Dumbbell, Home, Mountain, Trophy, Calendar, ChevronRight, Flame, Clock, Heart, Activity, Plus, X, Play, Pause, Check, Trash2, Sparkles, Minus, Library, Layers, ArrowDown, Search, Timer, Pencil, RotateCcw, Gift, Crown } from "lucide-react";
import { EXERCISES, EQUIP_LABEL, recommendRest, type ExerciseInfo, type EquipCat } from "@/lib/exercises-data";
import { addLog, removeLog, updateLog, readLogs, KIND_COLOR, KIND_LABEL, type TrainingLog } from "@/lib/training-log";
import { LogDetail } from "@/components/LogDetail";
import { EntryActions } from "@/components/EntryActions";

export const Route = createFileRoute("/trening")({
  head: () => ({ meta: [{ title: "Trening — GymWrld" }] }),
  component: Trening,
});

type Cat = "silownia" | "kobiety" | "redukcja" | "dom" | "kalistenika" | "outdoor";

type SetKind = "normal" | "superset" | "dropset";
type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  done?: boolean;
  kind?: SetKind;
  /** Library id for emoji & rest hint. */
  libId?: string;
  restSec?: number;
};

type Profile = { gender?: "m" | "k" | "nb"; weight?: number; level?: "poczatkujacy" | "sredni" | "zaawansowany" };

/**
 * AI-style heuristic: scale recommended weight by user gender, bodyweight and level.
 * Returns sets, reps and weight tailored to a "base" exercise weight for an athletic 75kg adult man.
 */
function recommendForUser(baseWeight: number, baseSets: number, baseReps: number, profile: Profile): { sets: number; reps: number; weight: number } {
  const bw = profile.weight ?? 75;
  const genderFactor = profile.gender === "k" ? 0.55 : profile.gender === "nb" ? 0.78 : 1.0;
  const levelFactor = profile.level === "poczatkujacy" ? 0.7 : profile.level === "zaawansowany" ? 1.15 : 0.9;
  const bwFactor = Math.max(0.6, Math.min(1.3, bw / 75));
  const recWeight = Math.round((baseWeight * genderFactor * levelFactor * bwFactor) / 2.5) * 2.5;
  const reps = profile.level === "poczatkujacy" ? baseReps + 2 : profile.level === "zaawansowany" ? Math.max(5, baseReps - 1) : baseReps;
  const sets = baseSets;
  return { sets, reps, weight: Math.max(2.5, recWeight) };
}

function Trening() {
  const [profile, setProfile] = useState<Profile>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_profile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  const [cat, setCat] = useState<Cat>("silownia");
  const [view, setView] = useState<"dzien" | "tydzien" | "miesiac">("tydzien");
  const [session, setSession] = useState<{ title: string; exercises: Exercise[] } | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [customPlans, setCustomPlans] = useState<{ title: string; exercises: Exercise[] }[]>([]);

  const plans: Record<Cat, { title: string; meta: string }[]> = {
    silownia: [
      { title: "Push Day · Klatka, barki", meta: "5 ćwiczeń · 55 min" },
      { title: "Pull Day · Plecy, biceps", meta: "6 ćwiczeń · 60 min" },
      { title: "Leg Day · Hipertrofia", meta: "5 ćwiczeń · 70 min" },
      { title: "Full Body siła", meta: "7 ćwiczeń · 65 min" },
      { title: "Upper / Lower · Split A", meta: "6 ćwiczeń · 60 min" },
    ],
    kobiety: [
      { title: "Glute Builder · Pośladki & nogi", meta: "6 ćwiczeń · 45 min" },
      { title: "Hourglass · Talia & brzuch", meta: "8 ćwiczeń · 35 min" },
      { title: "Total Tone · Spalanie & ujędrnianie", meta: "10 ćwiczeń · 40 min" },
    ],
    redukcja: [
      { title: "HIIT Burn · Intensywne spalanie", meta: "12 rund · 25 min · ~380 kcal" },
      { title: "Cardio Strength Mix", meta: "9 ćwiczeń · 45 min · ~520 kcal" },
      { title: "Fat Loss Circuit", meta: "8 stacji · 35 min · ~450 kcal" },
    ],
    dom: [
      { title: "Kalistenika full body", meta: "8 ćwiczeń · 35 min" },
      { title: "Mobility & rozciąganie", meta: "10 sekwencji · 25 min" },
      { title: "Trening funkcjonalny", meta: "6 ćwiczeń · 40 min" },
    ],
    kalistenika: [
      { title: "Push-Pull · Drążek i poręcze", meta: "7 ćwiczeń · 50 min" },
      { title: "Skill Work · Muscle-up, planche", meta: "6 progresji · 60 min" },
      { title: "Core & Lever · Front lever", meta: "8 ćwiczeń · 40 min" },
    ],
    outdoor: [
      { title: "Bieganie · Interwały 5×3 min", meta: "35 min · ~420 kcal" },
      { title: "Rower · Endurance", meta: "60 min · ~600 kcal" },
      { title: "Trekking · Park leśny", meta: "90 min · ~520 kcal" },
    ],
  };

  const heroes: Record<Cat, string> = {
    silownia: gymHero,
    kobiety: womenHero,
    redukcja: cutHero,
    dom: homeHero,
    kalistenika: calisthenicsHero,
    outdoor: outdoorHero,
  };
  const heroTitles: Record<Cat, { eyebrow: string; main: string; sub: string }> = {
    silownia: { eyebrow: "Polecany trening", main: "Push Day", sub: "Klatka i barki" },
    kobiety: { eyebrow: "Polecane dla Ciebie", main: "Glute Builder", sub: "Pośladki & nogi" },
    redukcja: { eyebrow: "Polecany trening", main: "HIIT Burn", sub: "25 min · max efekt" },
    dom: { eyebrow: "Polecany trening", main: "Full Body", sub: "Bez sprzętu" },
    kalistenika: { eyebrow: "Polecany trening", main: "Push-Pull", sub: "Drążek i poręcze" },
    outdoor: { eyebrow: "Polecany trening", main: "Interwały", sub: "Bieganie 5×3 min" },
  };
  const hero = heroTitles[cat];

  const basePushDay = [
    { libId: "bp", name: "Wyciskanie sztangi leżąc", sets: 4, reps: 8, weight: 70, restSec: 150 },
    { libId: "ohp", name: "Wyciskanie żołnierskie", sets: 4, reps: 8, weight: 40, restSec: 120 },
    { libId: "dbp", name: "Wyciskanie hantli", sets: 3, reps: 12, weight: 24, restSec: 90 },
    { libId: "lat", name: "Wznosy bokiem", sets: 3, reps: 15, weight: 10, restSec: 60 },
    { libId: "bic", name: "Uginanie hantli (biceps)", sets: 3, reps: 12, weight: 14, restSec: 60 },
  ];
  const defaultPushDay: Exercise[] = basePushDay.map((b, i) => {
    const r = recommendForUser(b.weight, b.sets, b.reps, profile);
    return {
      id: `e${i + 1}`,
      libId: b.libId,
      name: b.name,
      sets: r.sets,
      reps: r.reps,
      weight: r.weight,
      kind: "normal",
      restSec: recommendRest(b.restSec, profile.level),
    };
  });

  const startMain = () => {
    setSession({ title: hero.main, exercises: defaultPushDay.map((e) => ({ ...e })) });
  };

  return (
    <main className="px-5 pt-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Twój plan</p>
          <h1 className="mt-1 font-display text-3xl">Trening</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Zresetować widok i aktywną sesję?")) {
                setSession(null); setBuilderOpen(false); setCat("silownia"); setView("tydzien");
                toast.success("Widok zresetowany");
              }
            }}
            title="Reset"
            className="grid h-9 w-9 place-items-center rounded-full glass text-muted-foreground hover:text-foreground"
          ><RotateCcw className="h-4 w-4" /></button>
          <Link
            to="/promo"
            title="Promocje"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-background"
          ><Gift className="h-4 w-4" /></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl">
        <img src={heroes[cat]} alt="Trening" className="h-56 w-full object-cover" width={1280} height={896} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        <div className="absolute inset-x-5 bottom-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{hero.eyebrow}</p>
          <h2 className="mt-1 font-display text-3xl leading-none text-white">{hero.main}<br/><span className="text-gradient">{hero.sub}</span></h2>
          <div className="mt-3 flex gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur"><Clock className="h-3 w-3" /> 55 min</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur"><Flame className="h-3 w-3" /> 412 kcal</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur"><Dumbbell className="h-3 w-3" /> 5</span>
          </div>
          <button onClick={startMain} className="mt-4 rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-2.5 text-sm font-semibold text-background glow-primary">
            Rozpocznij trening
          </button>
        </div>
      </section>

      {/* Categories */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <CatBtn active={cat === "silownia"} onClick={() => setCat("silownia")} icon={<Dumbbell className="h-4 w-4" />} label="Siłownia" />
        <CatBtn active={cat === "kobiety"} onClick={() => setCat("kobiety")} icon={<Heart className="h-4 w-4" />} label="Dla kobiet" />
        <CatBtn active={cat === "redukcja"} onClick={() => setCat("redukcja")} icon={<Flame className="h-4 w-4" />} label="Redukcja" />
        <CatBtn active={cat === "dom"} onClick={() => setCat("dom")} icon={<Home className="h-4 w-4" />} label="Dom" />
        <CatBtn active={cat === "kalistenika"} onClick={() => setCat("kalistenika")} icon={<Activity className="h-4 w-4" />} label="Kalistenika" />
        <CatBtn active={cat === "outdoor"} onClick={() => setCat("outdoor")} icon={<Mountain className="h-4 w-4" />} label="Outdoor" />
      </div>

      {/* Exercise library banner */}
      <Link
        to="/cwiczenia"
        className="mt-5 flex items-center gap-3 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[var(--magenta)]/20 via-[var(--orange)]/15 to-[var(--lime)]/20 p-4 transition-transform active:scale-[0.99]"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-background/40">
          <Library className="h-6 w-6 text-[var(--lime)]" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Biblioteka</p>
          <p className="font-display text-lg leading-tight">Baza ćwiczeń</p>
          <p className="text-[11px] text-muted-foreground">Maszyny · Hantle · Kettle · Sztanga · Technika i typowe błędy</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>

      {/* Treadmill / Bieżnia quick log — directly under Library */}
      <TreadmillLog />

      {/* Body-part banners */}
      {cat === "silownia" && (
        <>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">Trenuj po partii ciała</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Klatka","Plecy","Nogi","Ramiona","Biceps","Triceps","Brzuch","Full Body",
            ].map((label) => (
              <Link
                key={label}
                to="/cwiczenia"
                className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent px-4 py-3 transition active:scale-[0.98] hover:border-white/15"
              >
                <span className="font-display text-sm tracking-tight text-foreground/90">{label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
          <Link to="/workouts" className="mt-2.5 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/15 p-3 text-xs text-muted-foreground hover:bg-white/[0.03]">
            Więcej zestawów ćwiczeń <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </>
      )}

      <div className="mt-4 space-y-2.5">
        {plans[cat].map((p, i) => (
          <button
            key={p.title}
            onClick={() => setSession({ title: p.title, exercises: defaultPushDay.map((e) => ({ ...e })) })}
            className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left hover:bg-white/[0.04]"
          >
            <div className={`grid h-11 w-11 place-items-center rounded-xl text-background ${["bg-[var(--magenta)]","bg-[var(--orange)]","bg-[var(--lime)]"][i % 3]}`}>
              <Dumbbell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.meta}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        {/* Custom plans */}
        {customPlans.map((cp) => (
          <button
            key={cp.title}
            onClick={() => setSession({ title: cp.title, exercises: cp.exercises.map((e) => ({ ...e })) })}
            className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left ring-1 ring-[var(--lime)]/30 hover:bg-white/[0.04]"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--magenta)] to-[var(--lime)] text-background">
              <Sparkle />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{cp.title}</p>
              <p className="text-xs text-muted-foreground">Własny · {cp.exercises.length} ćwiczeń</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={() => setBuilderOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 p-3.5 text-left transition hover:border-[var(--lime)]/40 hover:bg-white/[0.03]"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-[var(--lime)]">
            <Plus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Stwórz własny trening</p>
            <p className="text-xs text-muted-foreground">Dodaj ćwiczenia, serie i powtórzenia</p>
          </div>
        </button>
      </div>

      {/* Guru autorskie treningi banner */}
      <Link
        to="/guru"
        className="mt-4 flex items-center gap-3 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#3a1a5a] via-[#5a2a8a] to-[#1a0a3b] p-4 transition-transform active:scale-[0.99]"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black/40 text-[var(--lime)]">
          <Crown className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Autorskie · Guru</p>
          <p className="font-display text-lg leading-tight text-white">Treningi od Coachów</p>
          <p className="text-[11px] text-white/70">Coach Nova · Coach Hawk · Coach Lex — gotowe split-y i progresje</p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/70" />
      </Link>

      {/* Marathon / runners banner */}
      <Link
        to="/biegi"
        className="mt-4 flex items-center gap-3 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#3b0a0a] via-[#5a0f0f] to-[#7a1a1a] p-4 transition-transform active:scale-[0.99]"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black/40 text-[var(--orange)]">
          <Mountain className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Dla biegaczy</p>
          <p className="font-display text-lg leading-tight text-white">Maraton</p>
          <p className="text-[11px] text-white/70">Trasy na mapie · dystans · pace · nadchodzące zawody</p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/70" />
      </Link>

      {/* Street Workout banner */}
      <Link
        to="/street"
        className="mt-3 flex items-center gap-3 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a3b1a] via-[#0f5a2a] to-[#1a7a3a] p-4 transition-transform active:scale-[0.99]"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black/40 text-[var(--lime)]">
          <Activity className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Outdoor & kalistenika</p>
          <p className="font-display text-lg leading-tight text-white">Street Workout</p>
          <p className="text-[11px] text-white/70">Mapa lokalnych siłek · baza ćwiczeń · technika</p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/70" />
      </Link>

      {/* Calendar */}
      <div className="mb-3 mt-7 flex items-end justify-between">
        <h3 className="text-lg font-semibold">Kalendarz</h3>
        <div className="flex rounded-full bg-white/5 p-0.5 text-xs">
          {(["dzien","tydzien","miesiac"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 capitalize ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {v === "dzien" ? "Dzień" : v === "tydzien" ? "Tydzień" : "Miesiąc"}
            </button>
          ))}
        </div>
      </div>

      {view === "tydzien" && <WeekView />}
      {view === "miesiac" && <MonthView />}
      {view === "dzien" && <DayView />}

      {/* Records */}
      <PRSection />

      {session && (
        <WorkoutSession
          title={session.title}
          exercises={session.exercises}
          profile={profile}
          onClose={() => setSession(null)}
          onFinish={() => {
            addLog({ kind: "silownia", title: session.title, kcal: 412, minutes: 55 });
            toast.success("Trening zapisany · statystyki i XP zaktualizowane");
            setSession(null);
          }}
        />
      )}

      {builderOpen && (
        <WorkoutBuilder
          onClose={() => setBuilderOpen(false)}
          onSave={(plan) => {
            setCustomPlans((prev) => [...prev, plan]);
            toast.success(`Plan "${plan.title}" zapisany`);
            setBuilderOpen(false);
          }}
        />
      )}
    </main>
  );
}

function Sparkle() {
  return <Dumbbell className="h-4 w-4" />;
}

function TreadmillLog() {
  const [open, setOpen] = useState(false);
  const [km, setKm] = useState<number | "">("");
  const [kcal, setKcal] = useState<number | "">("");
  const [incline, setIncline] = useState<number | "">("");
  const [time, setTime] = useState<number | "">("");
  const [entries, setEntries] = useState<{ id: string; km: number; kcal: number; incline: number; time: number; ts: number }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_treadmill");
      if (raw) {
        const parsed = JSON.parse(raw);
        setEntries(parsed.map((e: any) => ({ id: e.id ?? String(e.ts), ...e })));
      }
    } catch {}
  }, []);

  const persist = (next: typeof entries) => {
    setEntries(next);
    if (typeof window !== "undefined") localStorage.setItem("gw_treadmill", JSON.stringify(next));
  };

  const save = () => {
    if (!km || !time) {
      toast.error("Podaj dystans i czas");
      return;
    }
    const kmN = Number(km), timeN = Number(time), kcalN = Number(kcal) || Math.round(Number(km) * 60);
    if (editingId) {
      const next = entries.map((e) =>
        e.id === editingId ? { ...e, km: kmN, kcal: kcalN, incline: Number(incline) || 0, time: timeN } : e
      );
      persist(next);
      updateLog(editingId, { kcal: kcalN, minutes: timeN, title: `Bieżnia ${kmN} km`, meta: { km: kmN, incline: Number(incline) || 0 } });
      toast.success("Wpis zaktualizowany");
    } else {
      const log = addLog({ kind: "biezia", title: `Bieżnia ${kmN} km`, kcal: kcalN, minutes: timeN, meta: { km: kmN, incline: Number(incline) || 0 } });
      const entry = { id: log.id, km: kmN, kcal: kcalN, incline: Number(incline) || 0, time: timeN, ts: log.ts };
      persist([entry, ...entries]);
      toast.success(`Bieżnia · ${kmN} km zapisane`);
    }
    setKm(""); setKcal(""); setIncline(""); setTime("");
    setEditingId(null);
    setOpen(false);
  };

  const startEdit = (e: typeof entries[number]) => {
    setKm(e.km); setKcal(e.kcal); setIncline(e.incline); setTime(e.time);
    setEditingId(e.id);
    setOpen(true);
  };
  const remove = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
    removeLog(id);
    toast.success("Wpis usunięty");
  };

  return (
    <div className="mt-7">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-lg font-semibold">Bieżnia</h3>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1 text-[11px]">
          <Plus className="h-3 w-3" /> Dodaj wpis
        </button>
      </div>
      <div className="rounded-3xl glass p-4">
        {entries.length === 0 ? (
          <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 text-left">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[var(--lime)]/25 to-[var(--orange)]/15 text-[var(--lime)]">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Zaloguj sesję na bieżni</p>
              <p className="text-[11px] text-muted-foreground">Dystans · czas · nachylenie · kalorie</p>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : (
          <div className="space-y-2.5">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--lime)]/15 text-[var(--lime)]">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{e.km} km · {e.time} min</p>
                  <p className="text-[11px] text-muted-foreground">Nachylenie {e.incline}% · {e.kcal} kcal</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{new Date(e.ts).toLocaleDateString("pl")}</p>
                <EntryActions onEdit={() => startEdit(e)} onDelete={() => remove(e.id)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cardio</p>
                <h3 className="font-display text-2xl">{editingId ? "Edytuj bieżnię" : "Bieżnia"}</h3>
              </div>
              <button onClick={() => { setOpen(false); setEditingId(null); }} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TextNumField label="Dystans (km)" value={km} onChange={setKm} placeholder="5.0" step="0.1" />
              <TextNumField label="Czas (min)" value={time} onChange={setTime} placeholder="30" />
              <TextNumField label="Nachylenie (%)" value={incline} onChange={setIncline} placeholder="2" />
              <TextNumField label="Kalorie (kcal)" value={kcal} onChange={setKcal} placeholder="320" />
            </div>
            <button onClick={save} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--lime)] via-[var(--orange)] to-[var(--magenta)] py-3.5 text-sm font-semibold text-background glow-primary">
              {editingId ? "Zapisz zmiany" : "Zapisz bieżnię"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TextNumField({ label, value, onChange, placeholder, step }: { label: string; value: number | ""; onChange: (v: number | "") => void; placeholder?: string; step?: string }) {
  return (
    <label className="block rounded-2xl bg-white/[0.04] p-3">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
        className="mt-1 w-full bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground/40"
      />
    </label>
  );
}

function CatBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-xs font-medium transition ${active ? "bg-primary text-primary-foreground glow-primary" : "glass text-muted-foreground"}`}>
      {icon}
      {label}
    </button>
  );
}

function WeekView() {
  const days = ["Pn","Wt","Śr","Cz","Pt","Sb","Nd"];
  const today = new Date();
  today.setHours(0,0,0,0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);
  useEffect(() => {
    const refresh = () => setLogs(readLogs());
    refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("gw_training_log_update", refresh);
      return () => window.removeEventListener("gw_training_log_update", refresh);
    }
  }, []);
  const dowToday = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - dowToday + weekOffset * 7);
  start.setHours(0,0,0,0);
  const byDay = new Map<number, TrainingLog[]>();
  logs.forEach((l) => {
    const t = new Date(l.ts);
    const diff = Math.floor((t.getTime() - start.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      const arr = byDay.get(diff) ?? [];
      arr.push(l);
      byDay.set(diff, arr);
    }
  });
  const rangeLabel = `${start.toLocaleDateString("pl-PL", { day: "2-digit", month: "short" })} – ${new Date(start.getTime() + 6 * 86400000).toLocaleDateString("pl-PL", { day: "2-digit", month: "short" })}`;
  const selectedDayLogs = selected ? logs.filter((l) => {
    const d = new Date(l.ts);
    return d.getFullYear() === selected.getFullYear() && d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate();
  }) : [];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => setWeekOffset((o) => o - 1)} className="rounded-full glass px-3 py-1 text-[11px]">‹ Poprzedni</button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{weekOffset === 0 ? "Bieżący tydzień" : weekOffset < 0 ? `${-weekOffset} tyg. temu` : `Za ${weekOffset} tyg.`}</p>
          <p className="text-[11px] font-medium">{rangeLabel}</p>
        </div>
        <button onClick={() => setWeekOffset((o) => o + 1)} className="rounded-full glass px-3 py-1 text-[11px]">Następny ›</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const date = new Date(start); date.setDate(start.getDate() + i);
          const items = byDay.get(i);
          const isToday = date.getTime() === today.getTime();
          const isSel = selected && date.getTime() === selected.getTime();
          const kinds = items ? Array.from(new Set(items.map((l) => l.kind))) : [];
          return (
            <button
              key={d}
              onClick={() => setSelected(isSel ? null : date)}
              className={`rounded-2xl p-2 text-center transition ${isSel ? "ring-2 ring-[var(--lime)] bg-[var(--lime)]/10" : isToday ? "ring-1 ring-[var(--magenta)] bg-[var(--magenta)]/10" : "glass hover:bg-white/[0.04]"}`}
            >
              <p className="text-[10px] text-muted-foreground">{d}</p>
              <p className="mt-0.5 text-sm font-semibold">{date.getDate()}</p>
              <div className="mx-auto mt-2 flex h-7 items-center justify-center gap-0.5">
                {kinds.length ? kinds.slice(0, 3).map((k) => (
                  <span key={k} className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[k as keyof typeof KIND_COLOR] }} />
                )) : <span className="h-1 w-1 rounded-full bg-white/10" />}
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-3 rounded-2xl glass p-3">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            {selected.toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
          {selectedDayLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Brak treningów tego dnia.</p>
          ) : (
            <ul className="space-y-1.5">
              {selectedDayLogs.map((l) => (
                <LogRow key={l.id} log={l} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function LogRow({ log }: { log: TrainingLog }) {
  const [editing, setEditing] = useState(false);
  const [detail, setDetail] = useState(false);
  const [minutes, setMinutes] = useState(log.minutes);
  const [kcal, setKcal] = useState(log.kcal);
  const [title, setTitle] = useState(log.title);
  if (editing) {
    return (
      <li className="rounded-xl bg-white/[0.04] p-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded bg-white/5 px-2 py-1 text-xs outline-none" />
        <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[11px]">
          <label className="flex items-center gap-1 rounded bg-white/5 px-2 py-1"><span className="text-muted-foreground">min</span>
            <input type="number" value={minutes} onChange={(e) => setMinutes(parseInt(e.target.value) || 0)} className="flex-1 w-12 bg-transparent text-right outline-none" />
          </label>
          <label className="flex items-center gap-1 rounded bg-white/5 px-2 py-1"><span className="text-muted-foreground">kcal</span>
            <input type="number" value={kcal} onChange={(e) => setKcal(parseInt(e.target.value) || 0)} className="flex-1 w-12 bg-transparent text-right outline-none" />
          </label>
        </div>
        <div className="mt-1.5 flex gap-1.5">
          <button onClick={() => { updateLog(log.id, { minutes, kcal, title }); setEditing(false); toast.success("Zaktualizowano"); }} className="flex-1 rounded bg-[var(--lime)] px-2 py-1 text-[11px] font-semibold text-background">Zapisz</button>
          <button onClick={() => setEditing(false)} className="rounded bg-white/5 px-2 py-1 text-[11px]">Anuluj</button>
        </div>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-2 text-xs">
      <span className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[log.kind] }} />
      <button onClick={() => setDetail(true)} className="flex-1 truncate text-left hover:underline">
        {log.title}{log.rating ? <span className="ml-1 text-[var(--orange)]">{"★".repeat(log.rating)}</span> : null}
      </button>
      <span className="text-muted-foreground">{log.minutes} min · {log.kcal} kcal</span>
      <button onClick={() => setEditing(true)} title="Edytuj" className="grid h-6 w-6 place-items-center rounded-full bg-white/5 hover:bg-white/10">
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={() => {
          if (!confirm(`Usunąć "${log.title}"?`)) return;
          removeLog(log.id);
          toast.success("Wpis usunięty");
        }}
        title="Usuń"
        className="grid h-6 w-6 place-items-center rounded-full bg-red-500/10 text-red-300 hover:bg-red-500/20"
      >
        <Trash2 className="h-3 w-3" />
      </button>
      {detail && <LogDetail log={log} onClose={() => setDetail(false)} />}
    </li>
  );
}

function MonthView() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [offset, setOffset] = useState(0);
  const cursor = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const monthName = cursor.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  useEffect(() => {
    const refresh = () => setLogs(readLogs());
    refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("gw_training_log_update", refresh);
      return () => window.removeEventListener("gw_training_log_update", refresh);
    }
  }, []);
  const byDay = new Map<number, Set<string>>();
  logs.forEach((l) => {
    const d = new Date(l.ts);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const set = byDay.get(d.getDate()) ?? new Set();
      set.add(l.kind);
      byDay.set(d.getDate(), set);
    }
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dayLogs = selectedDay
    ? logs.filter((l) => {
        const d = new Date(l.ts);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
      })
    : [];

  return (
    <div className="rounded-2xl glass p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setOffset((o) => o - 1)} className="rounded-full glass px-3 py-1 text-[11px]">‹</button>
        <p className="font-display text-sm capitalize">{monthName}</p>
        <button onClick={() => setOffset((o) => o + 1)} className="rounded-full glass px-3 py-1 text-[11px]">›</button>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {["Pn","Wt","Śr","Cz","Pt","Sb","Nd"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const kinds = byDay.get(d);
          const isToday = offset === 0 && d === today.getDate();
          const isSel = d === selectedDay;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(isSel ? null : d)}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition active:scale-[0.95] ${
                isSel
                  ? "ring-2 ring-[var(--lime)] bg-[var(--lime)]/15"
                  : isToday
                  ? "ring-1 ring-[var(--magenta)] bg-[var(--magenta)]/10"
                  : "bg-white/[0.03] hover:bg-white/[0.07]"
              }`}
            >
              <span className={isToday ? "font-semibold" : "text-foreground/80"}>{d}</span>
              {kinds && (
                <div className="mt-0.5 flex gap-0.5">
                  {[...kinds].slice(0, 4).map((k) => (
                    <span key={k} className="h-1 w-1 rounded-full" style={{ background: KIND_COLOR[k as keyof typeof KIND_COLOR] }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selectedDay && (
        <div className="mt-3 rounded-xl bg-white/[0.03] p-3">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            {new Date(year, month, selectedDay).toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
          {dayLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Brak treningów tego dnia.</p>
          ) : (
            <ul className="space-y-1.5">
              {dayLogs.map((l) => <LogRow key={l.id} log={l} />)}
            </ul>
          )}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {(["silownia","biezia","bieg","street","mind","sen"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {k === "silownia" ? "Siłownia" : k === "biezia" ? "Bieżnia" : k === "bieg" ? "Bieg" : k === "street" ? "Street" : k === "mind" ? "Mind" : "Sen"}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{logs.length} sesji w bazie</p>
    </div>
  );
}

function DayView() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  useEffect(() => {
    const refresh = () => setLogs(readLogs());
    refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("gw_training_log_update", refresh);
      return () => window.removeEventListener("gw_training_log_update", refresh);
    }
  }, []);
  const today = new Date();
  const todays = logs.filter((l) => {
    const d = new Date(l.ts);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  });
  const totalMin = todays.reduce((s, l) => s + l.minutes, 0);
  const totalKcal = todays.reduce((s, l) => s + l.kcal, 0);
  return (
    <div className="space-y-2.5">
      {/* Recommended for today — distinct accent, no extra flag */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--lime)]/30 bg-gradient-to-br from-[var(--lime)]/15 via-[var(--orange)]/10 to-transparent p-3.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--lime)]">Polecany trening</p>
        <p className="mt-1 font-display text-base leading-tight">Push Day · Klatka i barki</p>
        <p className="text-[11px] text-muted-foreground">Siłownia · ~55 min · ~412 kcal</p>
      </div>

      {/* Today's summary */}
      <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
        <Calendar className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {today.toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
          <p className="text-xs text-muted-foreground">
            {todays.length === 0 ? "Brak zalogowanych sesji" : `${todays.length} sesji · ${totalMin} min · ${totalKcal} kcal`}
          </p>
        </div>
      </div>

      {/* Today's logs (treningi, bieżnia, biegi, street, mind, sen) */}
      {todays.length > 0 ? (
        <div className="rounded-2xl glass p-3">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Dzisiaj</p>
          <ul className="space-y-1.5">
            {todays.map((l) => <LogRow key={l.id} log={l} />)}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
          Zaloguj bieżnię, bieg lub trening — pojawi się tutaj automatycznie
        </div>
      )}
    </div>
  );
}

/* ============ PR Section (user-pickable & editable) ============ */
type PRRecord = { id: string; name: string; value: string; emoji?: string };
const DEFAULT_PRS: PRRecord[] = [
  { id: "bp", name: "Wyciskanie sztangi", value: "80 kg × 6", emoji: "🏋️" },
  { id: "dl", name: "Martwy ciąg", value: "140 kg × 3", emoji: "💪" },
  { id: "sq", name: "Przysiad", value: "120 kg × 5", emoji: "🦵" },
  { id: "run5", name: "5 km bieg", value: "22:18", emoji: "🏃" },
];

function PRSection() {
  const [prs, setPRs] = useState<PRRecord[]>(DEFAULT_PRS);
  const [editing, setEditing] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_prs");
      if (raw) setPRs(JSON.parse(raw));
    } catch {}
  }, []);
  const save = (next: PRRecord[]) => {
    setPRs(next);
    if (typeof window !== "undefined") localStorage.setItem("gw_prs", JSON.stringify(next));
  };
  return (
    <>
      <div className="mb-3 mt-7 flex items-end justify-between">
        <h3 className="text-lg font-semibold">Rekordy & PR-y</h3>
        <span className="text-[10px] text-muted-foreground">Kliknij, by edytować</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {prs.map((pr, i) => (
          <button
            key={i}
            onClick={() => setEditing(i)}
            className="rounded-2xl glass p-4 text-left transition active:scale-[0.98] hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-base">{pr.emoji ?? "🏆"}</span>
              <span className="line-clamp-1 text-xs">{pr.name}</span>
              <Pencil className="ml-auto h-3 w-3 opacity-60" />
            </div>
            <p className="mt-2 text-lg font-semibold">{pr.value || "—"}</p>
          </button>
        ))}
      </div>
      {editing !== null && (
        <PREditor
          pr={prs[editing]}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            const copy = [...prs];
            copy[editing] = next;
            save(copy);
            setEditing(null);
            toast.success("PR zaktualizowany 🏆");
          }}
        />
      )}
    </>
  );
}

function PREditor({ pr, onClose, onSave }: { pr: PRRecord; onClose: () => void; onSave: (pr: PRRecord) => void }) {
  const [name, setName] = useState(pr.name);
  const [value, setValue] = useState(pr.value);
  const [emoji, setEmoji] = useState(pr.emoji ?? "🏆");
  const [q, setQ] = useState("");
  const list = EXERCISES.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  const OTHER = [
    { name: "5 km bieg", emoji: "🏃" }, { name: "10 km bieg", emoji: "🏃" },
    { name: "Plank", emoji: "🧘" }, { name: "Wytrzymałość", emoji: "⏱️" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Edytuj rekord</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Nazwa rekordu</p>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Wartość (np. 100 kg × 5, 22:18)</p>
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="120 kg × 3" className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Wybierz z biblioteki</p>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj ćwiczenia..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {list.map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setName(e.name); setEmoji(e.emoji); }}
                  className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2 text-left hover:bg-white/[0.08]"
                >
                  <span className="text-lg">{e.emoji}</span>
                  <span className="line-clamp-1 text-[11px]">{e.name}</span>
                </button>
              ))}
              {OTHER.map((o) => (
                <button key={o.name} onClick={() => { setName(o.name); setEmoji(o.emoji); }} className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2 text-left hover:bg-white/[0.08]">
                  <span className="text-lg">{o.emoji}</span>
                  <span className="text-[11px]">{o.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => onSave({ id: pr.id, name, value, emoji })}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary"
        >
          Zapisz rekord
        </button>
      </div>
    </div>
  );
}

/* ============ Workout Session (live screen) ============ */
function WorkoutSession({
  title, exercises, profile, onClose, onFinish,
}: {
  title: string; exercises: Exercise[];
  profile: Profile;
  onClose: () => void; onFinish: () => void;
}) {
  const [items, setItems] = useState(exercises);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState<{ exId: string; remaining: number } | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!restTimer) return;
    if (restTimer.remaining <= 0) {
      toast.success("Koniec przerwy 💥 Następna seria!");
      setRestTimer(null);
      return;
    }
    const id = setTimeout(() => setRestTimer((r) => (r ? { ...r, remaining: r.remaining - 1 } : r)), 1000);
    return () => clearTimeout(id);
  }, [restTimer]);

  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const cycleKind = (id: string) => setItems((arr) => arr.map((e) => {
    if (e.id !== id) return e;
    const next: SetKind = e.kind === "normal" || !e.kind ? "superset" : e.kind === "superset" ? "dropset" : "normal";
    return { ...e, kind: next };
  }));

  const startRest = (ex: Exercise) => {
    const sec = ex.restSec ?? 90;
    setRestTimer({ exId: ex.id, remaining: sec });
    toast(`Przerwa ${sec}s · AI sugeruje dla ${ex.name}`, { icon: "⏱️" });
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/5 bg-background/80 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full glass">
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">W trakcie</p>
            <p className="font-display text-base leading-none">{title}</p>
          </div>
          <button
            onClick={() => setRunning((r) => !r)}
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-background"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-display text-2xl tabular-nums">{mm}:{ss}</span>
          <span className="text-muted-foreground">{doneCount}/{items.length} ćwiczeń</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3 px-5 py-5">
        {items.map((ex, idx) => (
          <div key={ex.id} className={`rounded-3xl glass p-4 ${ex.done ? "opacity-60" : ""} ${ex.kind === "superset" ? "ring-1 ring-[var(--magenta)]/50" : ex.kind === "dropset" ? "ring-1 ring-[var(--orange)]/50" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 text-3xl animate-pulse-glow">
                  {EXERCISES.find((e) => e.id === ex.libId)?.emoji ?? "💪"}
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ćwiczenie {idx + 1}</p>
                  <p className="mt-0.5 font-display text-lg leading-tight">{ex.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--lime)]/15 px-2 py-0.5 text-[10px] text-[var(--lime)]">
                      <Sparkles className="h-3 w-3" /> AI dla Ciebie
                    </span>
                    {ex.kind === "superset" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--magenta)]/20 px-2 py-0.5 text-[10px] text-[var(--magenta)]">
                        <Layers className="h-3 w-3" /> Superseria
                      </span>
                    )}
                    {ex.kind === "dropset" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--orange)]/20 px-2 py-0.5 text-[10px] text-[var(--orange)]">
                        <ArrowDown className="h-3 w-3" /> Dropset
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setItems((arr) => arr.map((e, i) => i === idx ? { ...e, done: !e.done } : e))}
                className={`grid h-9 w-9 place-items-center rounded-full transition ${
                  ex.done ? "bg-[var(--lime)] text-background" : "glass"
                }`}
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
            {editingId === ex.id ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <NumField label="Serie" value={ex.sets} onChange={(v) => setItems((arr) => arr.map((e) => e.id === ex.id ? { ...e, sets: v } : e))} step={1} min={1} />
                <NumField label="Powt." value={ex.reps} onChange={(v) => setItems((arr) => arr.map((e) => e.id === ex.id ? { ...e, reps: v } : e))} step={1} min={1} />
                <NumField label="Ciężar (kg)" value={ex.weight ?? 0} onChange={(v) => setItems((arr) => arr.map((e) => e.id === ex.id ? { ...e, weight: v } : e))} step={2.5} min={0} />
              </div>
            ) : (
              <button
                onClick={() => setEditingId(ex.id)}
                className="mt-3 grid w-full grid-cols-3 gap-2 text-center"
              >
                <SetStat label="Serie" value={ex.sets} />
                <SetStat label="Powt." value={ex.reps} />
                <SetStat label="Ciężar" value={ex.weight ? `${ex.weight} kg` : "—"} />
              </button>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
              {editingId === ex.id ? (
                <button onClick={() => setEditingId(null)} className="rounded-full bg-[var(--lime)]/20 px-3 py-1 font-medium text-[var(--lime)]">Gotowe</button>
              ) : (
                <button onClick={() => setEditingId(ex.id)} className="rounded-full bg-white/5 px-3 py-1 text-muted-foreground hover:bg-white/10">
                  <Pencil className="mr-1 inline h-2.5 w-2.5" /> Edytuj
                </button>
              )}
              <button onClick={() => cycleKind(ex.id)} className="rounded-full bg-white/5 px-3 py-1 text-muted-foreground hover:bg-white/10">
                <Layers className="mr-1 inline h-2.5 w-2.5" /> {ex.kind === "superset" ? "Superseria" : ex.kind === "dropset" ? "Dropset" : "Zwykła"}
              </button>
              <button onClick={() => startRest(ex)} className="rounded-full bg-[var(--orange)]/15 px-3 py-1 font-medium text-[var(--orange)] hover:bg-[var(--orange)]/25">
                <Timer className="mr-1 inline h-2.5 w-2.5" /> Przerwa {ex.restSec ?? 90}s
              </button>
            </div>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: ex.sets }).map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--lime)] opacity-50" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating AI rest timer */}
      {restTimer && (
        <div className="fixed inset-x-0 bottom-24 z-20 flex justify-center px-4">
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-[var(--orange)]/40 bg-background/95 p-3 backdrop-blur-xl glow-primary">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--orange)]/15 text-[var(--orange)]">
              <Timer className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Rest Timer</p>
              <p className="font-display text-2xl tabular-nums">
                {String(Math.floor(restTimer.remaining / 60)).padStart(2, "0")}:
                {String(restTimer.remaining % 60).padStart(2, "0")}
              </p>
            </div>
            <button onClick={() => setRestTimer(null)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs">Pomiń</button>
          </div>
        </div>
      )}

      {/* Footer — above BottomNav */}
      <div className="sticky bottom-0 z-[81] border-t border-white/5 bg-background/95 px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-xl">
        <button
          onClick={onFinish}
          className="w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary"
        >
          Zakończ trening
        </button>
      </div>
    </div>
  );
}

function SetStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-2">
      <p className="font-display text-base leading-none">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function NumField({ label, value, onChange, step, min }: { label: string; value: number; onChange: (v: number) => void; step: number; min: number }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-2">
      <div className="flex items-center justify-between gap-1">
        <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent text-center font-display text-base outline-none"
        />
        <button onClick={() => onChange(+(value + step).toFixed(2))} className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ============ Workout Builder ============ */
function WorkoutBuilder({ onClose, onSave }: { onClose: () => void; onSave: (p: { title: string; exercises: Exercise[] }) => void }) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<EquipCat | "all">("all");

  const list = EXERCISES.filter((e) => {
    if (cat !== "all" && e.cat !== cat) return false;
    if (q && !(e.name.toLowerCase().includes(q.toLowerCase()) || e.muscles.join(" ").toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const addFromLib = (lib: ExerciseInfo) => {
    const b = lib.base ?? { sets: 3, reps: 10, weight: 0 };
    setExercises((prev) => [
      ...prev,
      {
        id: `e${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        libId: lib.id,
        name: lib.name,
        sets: b.sets,
        reps: b.reps,
        weight: b.weight || undefined,
        restSec: lib.rest,
        kind: "normal",
      },
    ]);
    toast.success(`${lib.name} dodane`);
  };

  const CATS: { id: EquipCat | "all"; label: string }[] = [
    { id: "all", label: "Wszystkie" },
    { id: "sztanga", label: "Sztanga" },
    { id: "hantle", label: "Hantle" },
    { id: "maszyny", label: "Maszyny" },
    { id: "kettle", label: "Kettle" },
    { id: "bodyweight", label: "Masa ciała" },
    { id: "guma", label: "Gumy" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Nowy trening</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nazwa planu, np. Mój Push Day"
          className="mt-4 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />

        {/* Selected list */}
        <div className="mt-4 space-y-2">
          {exercises.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-xl">
                {EXERCISES.find((e) => e.id === ex.libId)?.emoji ?? "💪"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{ex.name}</p>
                <p className="text-[11px] text-muted-foreground">{ex.sets} × {ex.reps}{ex.weight ? ` · ${ex.weight}kg` : ""} · ⏱️ {ex.restSec}s</p>
              </div>
              <button
                onClick={() => setExercises((prev) => prev.filter((_, idx) => idx !== i))}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-muted-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="rounded-2xl bg-white/[0.02] p-4 text-center text-xs text-muted-foreground">Wybierz ćwiczenia z biblioteki poniżej</p>
          )}
        </div>

        {/* Library picker */}
        <div className="mt-5 rounded-2xl bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground"><Library className="mr-1 inline h-3 w-3" /> Biblioteka ćwiczeń</p>
            <span className="text-[10px] text-muted-foreground">{list.length} pozycji</span>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj ćwiczenia lub mięśnia..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="mt-2 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-medium transition ${
                  cat === c.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="mt-2 max-h-[260px] space-y-1.5 overflow-y-auto pr-1">
            {list.map((e) => (
              <button
                key={e.id}
                onClick={() => addFromLib(e)}
                className="flex w-full items-center gap-2 rounded-xl bg-white/[0.04] p-2 text-left transition hover:bg-white/[0.08]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-lg">{e.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.muscles.join(" · ")} · {EQUIP_LABEL[e.cat]}</p>
                </div>
                <Plus className="h-4 w-4 text-[var(--lime)]" />
              </button>
            ))}
            {list.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">Brak wyników.</p>}
          </div>
        </div>

        <button
          onClick={() => onSave({ title: title || "Mój trening", exercises })}
          disabled={exercises.length === 0}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary disabled:opacity-40"
        >
          Zapisz plan ({exercises.length})
        </button>
      </div>
    </div>
  );
}
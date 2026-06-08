import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import gymHero from "@/assets/gym-hero.jpg";
import homeHero from "@/assets/home-hero.jpg";
import outdoorHero from "@/assets/outdoor-hero.jpg";
import calisthenicsHero from "@/assets/calisthenics-hero.jpg";
import womenHero from "@/assets/women-hero.jpg";
import cutHero from "@/assets/cut-hero.jpg";
import { Dumbbell, Home, Mountain, Trophy, Calendar, ChevronRight, Flame, Clock, Heart, Activity, Plus, X, Play, Pause, Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/trening")({
  head: () => ({ meta: [{ title: "Trening — GymWrld" }] }),
  component: Trening,
});

type Cat = "silownia" | "kobiety" | "redukcja" | "dom" | "kalistenika" | "outdoor";

type Exercise = { id: string; name: string; sets: number; reps: number; weight?: number; done?: boolean };

function Trening() {
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
    silownia: { eyebrow: "Następny trening", main: "Push Day", sub: "Klatka i barki" },
    kobiety: { eyebrow: "Polecane dla Ciebie", main: "Glute Builder", sub: "Pośladki & nogi" },
    redukcja: { eyebrow: "Spalanie tłuszczu", main: "HIIT Burn", sub: "25 min · max efekt" },
    dom: { eyebrow: "Trening w domu", main: "Full Body", sub: "Bez sprzętu" },
    kalistenika: { eyebrow: "Mistrzostwo ciała", main: "Push-Pull", sub: "Drążek i poręcze" },
    outdoor: { eyebrow: "Na świeżym powietrzu", main: "Interwały", sub: "Bieganie 5×3 min" },
  };
  const hero = heroTitles[cat];

  const defaultPushDay: Exercise[] = [
    { id: "e1", name: "Wyciskanie sztangi (klatka)", sets: 4, reps: 8, weight: 70 },
    { id: "e2", name: "Wyciskanie żołnierskie", sets: 4, reps: 8, weight: 40 },
    { id: "e3", name: "Rozpiętki hantle", sets: 3, reps: 12, weight: 14 },
    { id: "e4", name: "Wznosy bokiem", sets: 3, reps: 15, weight: 10 },
    { id: "e5", name: "Triceps wyciąg", sets: 3, reps: 12, weight: 30 },
  ];

  const startMain = () => {
    setSession({ title: hero.main, exercises: defaultPushDay.map((e) => ({ ...e })) });
  };

  return (
    <main className="px-5 pt-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Twój plan</p>
        <h1 className="mt-1 font-display text-3xl">Trening</h1>
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
      <h3 className="mb-3 mt-7 text-lg font-semibold">Rekordy & PR-y</h3>
      <div className="grid grid-cols-2 gap-3">
        <PR title="Wyciskanie sztangi" value="80 kg × 6" />
        <PR title="Martwy ciąg" value="140 kg × 3" />
        <PR title="Przysiad" value="120 kg × 5" />
        <PR title="5 km bieg" value="22:18" />
      </div>

      {session && (
        <WorkoutSession
          title={session.title}
          exercises={session.exercises}
          onClose={() => setSession(null)}
          onFinish={() => {
            toast.success("Trening zapisany · +120 XP");
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

function CatBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-xs font-medium transition ${active ? "bg-primary text-primary-foreground glow-primary" : "glass text-muted-foreground"}`}>
      {icon}
      {label}
    </button>
  );
}

function WeekView() {
  const days = ["Pon","Wt","Śr","Czw","Pt","Sb","Nd"];
  const states = ["done","done","rest","done","planned","planned","rest"];
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => {
        const s = states[i];
        return (
          <div key={d} className="rounded-2xl glass p-2 text-center">
            <p className="text-[10px] text-muted-foreground">{d}</p>
            <p className="mt-0.5 text-sm font-semibold">{i + 8}</p>
            <span
              className={`mx-auto mt-2 block h-7 w-7 rounded-full ${
                s === "done" ? "bg-gradient-to-br from-primary to-secondary" :
                s === "planned" ? "border-2 border-dashed border-primary/50" :
                "bg-white/5"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function MonthView() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const logged = new Set([2, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27]);
  const monthName = today.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-2xl glass p-4">
      <p className="mb-3 text-center font-display text-sm capitalize">{monthName}</p>
      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {["Pn","Wt","Śr","Cz","Pt","Sb","Nd"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const isLogged = logged.has(d);
          const isToday = d === today.getDate();
          return (
            <div
              key={d}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                isToday ? "ring-1 ring-[var(--magenta)] bg-[var(--magenta)]/10" : "bg-white/[0.03]"
              }`}
            >
              <span className={isToday ? "font-semibold" : "text-foreground/80"}>{d}</span>
              {isLogged && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--lime)]" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--lime)]" />
          Trening zalogowany
        </span>
        <span>Streak: 12 dni · {logged.size} sesji</span>
      </div>
    </div>
  );
}

function DayView() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
        <Calendar className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Push Day · 18:30</p>
          <p className="text-xs text-muted-foreground">Siłownia · 55 min</p>
        </div>
      </div>
    </div>
  );
}

function PR({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Trophy className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs">{title}</span>
      </div>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

/* ============ Workout Session (live screen) ============ */
function WorkoutSession({
  title, exercises, onClose, onFinish,
}: {
  title: string; exercises: Exercise[];
  onClose: () => void; onFinish: () => void;
}) {
  const [items, setItems] = useState(exercises);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
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
          <div key={ex.id} className={`rounded-3xl glass p-4 ${ex.done ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ćwiczenie {idx + 1}</p>
                <p className="mt-1 font-display text-lg leading-tight">{ex.name}</p>
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
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <SetStat label="Serie" value={ex.sets} />
              <SetStat label="Powt." value={ex.reps} />
              <SetStat label="Ciężar" value={ex.weight ? `${ex.weight} kg` : "—"} />
            </div>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: ex.sets }).map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--lime)] opacity-50" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-white/5 bg-background/90 px-5 py-4 backdrop-blur-xl">
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

/* ============ Workout Builder ============ */
function WorkoutBuilder({ onClose, onSave }: { onClose: () => void; onSave: (p: { title: string; exercises: Exercise[] }) => void }) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [sets, setSets] = useState<number | "">(4);
  const [reps, setReps] = useState<number | "">(8);
  const [weight, setWeight] = useState<number | "">("");

  const add = () => {
    if (!name) return;
    setExercises((prev) => [
      ...prev,
      { id: `e${Date.now()}`, name, sets: Number(sets) || 3, reps: Number(reps) || 10, weight: weight ? Number(weight) : undefined },
    ]);
    setName(""); setWeight("");
  };

  const SUGGEST = ["Wyciskanie sztangi","Przysiad","Martwy ciąg","Wiosłowanie","Podciąganie","Pompki","Wykroki","Plank","Pajacyki","Hip thrust"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8">
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

        {/* Exercise list */}
        <div className="mt-4 space-y-2">
          {exercises.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--magenta)]/15 text-[var(--magenta)] text-xs font-semibold">{i + 1}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{ex.name}</p>
                <p className="text-[11px] text-muted-foreground">{ex.sets} × {ex.reps}{ex.weight ? ` · ${ex.weight}kg` : ""}</p>
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
            <p className="rounded-2xl bg-white/[0.02] p-4 text-center text-xs text-muted-foreground">Dodaj pierwsze ćwiczenie poniżej</p>
          )}
        </div>

        {/* Add form */}
        <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dodaj ćwiczenie</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa ćwiczenia"
            className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGEST.map((s) => (
              <button key={s} onClick={() => setName(s)} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-white/10">
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={sets} onChange={(e) => setSets(e.target.value ? parseInt(e.target.value) : "")} placeholder="Serie" className="rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
            <input type="number" value={reps} onChange={(e) => setReps(e.target.value ? parseInt(e.target.value) : "")} placeholder="Powt." className="rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : "")} placeholder="kg" className="rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <button onClick={add} disabled={!name} className="w-full rounded-xl bg-white/10 py-2 text-xs font-medium disabled:opacity-40">
            <Plus className="inline h-3.5 w-3.5" /> Dodaj
          </button>
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
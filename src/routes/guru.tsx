import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Crown, Flame, Clock, Dumbbell, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { addLog } from "@/lib/training-log";

export const Route = createFileRoute("/guru")({
  head: () => ({ meta: [{ title: "Treningi od Coachów — GymWrld" }] }),
  component: Guru,
});

type Plan = {
  id: string; coach: string; title: string; tagline: string; days: number;
  level: "Początkujący" | "Średni" | "Zaawansowany"; kcal: number; minutes: number;
  tier: "free" | "pro" | "premium"; color: string;
  workouts: { day: string; name: string; focus: string }[];
};

// Plany ułożone przez zespół specjalistów GymWRLD — bez personalnych marek.

const PLANS: Plan[] = [
  {
    id: "nova-pp", coach: "nova", title: "Push / Pull / Legs", tagline: "Klasyczny 6-dniowy split na masę",
    days: 6, level: "Średni", kcal: 480, minutes: 60, tier: "free", color: "from-[#1a3b2a] to-[#0a1a14]",
    workouts: [
      { day: "Pon", name: "Push A", focus: "Klatka + barki + triceps" },
      { day: "Wt",  name: "Pull A", focus: "Plecy + biceps + tylne barki" },
      { day: "Śr",  name: "Legs A", focus: "Quady + pośladki + łydki" },
      { day: "Czw", name: "Push B", focus: "Górne klatki + bark + triceps" },
      { day: "Pt",  name: "Pull B", focus: "Szerokość pleców + biceps" },
      { day: "Sob", name: "Legs B", focus: "Dwugłowe + glute focus" },
    ],
  },
  {
    id: "hawk-531", coach: "hawk", title: "Cykl 5/3/1 — siła", tagline: "Cykl siłowy na bazie Wendlera",
    days: 4, level: "Zaawansowany", kcal: 520, minutes: 75, tier: "pro", color: "from-[#5a0f0f] to-[#1a0202]",
    workouts: [
      { day: "Pon", name: "Bench Day", focus: "Wyciskanie 5/3/1 + akcesoria klatka" },
      { day: "Wt",  name: "Squat Day", focus: "Przysiad 5/3/1 + akcesoria nogi" },
      { day: "Czw", name: "OHP Day",   focus: "Wyciskanie żołnierskie + barki" },
      { day: "Pt",  name: "Dead Day",  focus: "Martwy ciąg 5/3/1 + plecy" },
    ],
  },
  {
    id: "hawk-cut", coach: "hawk", title: "Cut Protocol 8 tyg", tagline: "Redukcja z zachowaniem siły",
    days: 5, level: "Zaawansowany", kcal: 420, minutes: 55, tier: "premium", color: "from-[#3b0a0a] to-[#0c0202]",
    workouts: [
      { day: "Pon", name: "Upper Strength", focus: "Wyciskanie + wiosło ciężkie" },
      { day: "Wt",  name: "HIIT 25",         focus: "Interwały + finisher" },
      { day: "Śr",  name: "Lower Strength",  focus: "Przysiad + RDL" },
      { day: "Pt",  name: "Hypertrophy Up",  focus: "Pump set 12-15" },
      { day: "Sob", name: "Conditioning",    focus: "LISS 45 min" },
    ],
  },
  {
    id: "lex-skill", coach: "lex", title: "Calisthenics — Skill Work", tagline: "Muscle-up, planche, front lever",
    days: 4, level: "Średni", kcal: 380, minutes: 50, tier: "pro", color: "from-[#0a3b1a] to-[#0a1a14]",
    workouts: [
      { day: "Pon", name: "Pull Skill",  focus: "Muscle-up progresje" },
      { day: "Śr",  name: "Push Skill",  focus: "Planche lean + handstand" },
      { day: "Pt",  name: "Core Lever",  focus: "Front lever + L-sit" },
      { day: "Sob", name: "Flow",        focus: "Free flow & combos" },
    ],
  },
  {
    id: "nova-begin", coach: "nova", title: "Start: Pierwszy miesiąc", tagline: "Dla początkujących — fundament",
    days: 3, level: "Początkujący", kcal: 320, minutes: 45, tier: "free", color: "from-[#0a1a3b] to-[#020210]",
    workouts: [
      { day: "Pon", name: "Full Body A", focus: "Przysiad, wyciskanie, wiosło" },
      { day: "Śr",  name: "Full Body B", focus: "Martwy, OHP, podciąganie" },
      { day: "Pt",  name: "Full Body C", focus: "Wykroki, dipy, plank" },
    ],
  },
  {
    id: "lex-mobility", coach: "lex", title: "Mobility & Flow", tagline: "Codzienna mobilność i elastyczność",
    days: 7, level: "Początkujący", kcal: 180, minutes: 25, tier: "free", color: "from-[#2a1a5a] to-[#0a0a1a]",
    workouts: [
      { day: "Codziennie", name: "Mobility flow", focus: "Biodra, kręgosłup, barki" },
    ],
  },
];

function Guru() {
  const [open, setOpen] = useState<Plan | null>(null);
  const [sub, setSub] = useState<string>(() => {
    if (typeof window === "undefined") return "free";
    try { return JSON.parse(localStorage.getItem("gw_profile") || "{}").subscription || "free"; } catch { return "free"; }
  });

  const canAccess = (tier: Plan["tier"]) => tier === "free" || (tier === "pro" && (sub === "pro" || sub === "premium")) || (tier === "premium" && sub === "premium");

  return (
    <main className="px-5 pt-6 pb-12">
      <header className="flex items-center gap-3">
        <Link to="/trening" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Autorskie</p>
          <h1 className="mt-1 font-display text-3xl">Treningi <span className="text-gradient">od Coachów</span></h1>
        </div>
      </header>

      <section className="mt-5 rounded-2xl glass p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">O sekcji</p>
        <p className="mt-1 text-sm">Dedykowane plany od zespołu specjalistów — gotowe splity, cykle siłowe, redukcja i mobility. Skopiuj plan w jeden klik i zacznij dziś.</p>
      </section>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Gotowe plany</h3>
      <div className="space-y-3">
        {PLANS.map((p) => {
          const locked = !canAccess(p.tier);
          return (
            <button
              key={p.id}
              onClick={() => locked ? toast(`${p.tier === "premium" ? "Premium" : "Pro"} — przejdź na wyższy plan`) : setOpen(p)}
              className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${p.color} p-5 text-left transition active:scale-[0.99]`}
            >
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
                <span>{p.level}</span>
                {p.tier === "pro" && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--lime)]/20 px-2 py-0.5 text-[var(--lime)]"><Sparkles className="h-3 w-3" /> Pro</span>}
                {p.tier === "premium" && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--magenta)]/20 px-2 py-0.5 text-[var(--magenta)]"><Crown className="h-3 w-3" /> Premium</span>}
              </div>
              <p className="mt-1 font-display text-2xl text-white">{p.title}</p>
              <p className="text-[11px] text-white/70">{p.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><Dumbbell className="h-3 w-3" /> {p.days} dni/tydz</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><Clock className="h-3 w-3" /> {p.minutes} min</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><Flame className="h-3 w-3" /> {p.kcal} kcal</span>
              </div>
              {locked && (
                <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-[3px]">
                  <Link to="/premium" className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-black">
                    Odblokuj {p.tier === "premium" ? "Premium" : "Pro"}
                  </Link>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plan</p>
            <h3 className="font-display text-2xl">{open.title}</h3>
            <p className="text-xs text-muted-foreground">{open.tagline}</p>
            <div className="mt-4 space-y-2">
              {open.workouts.map((w) => (
                <div key={w.day + w.name} className="flex items-center gap-3 rounded-2xl glass p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-[10px] font-semibold uppercase">{w.day}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{w.name}</p>
                    <p className="text-[11px] text-muted-foreground">{w.focus}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                addLog({ kind: "silownia", title: `${open.title} · ${open.workouts[0].name}`, kcal: open.kcal, minutes: open.minutes });
                toast.success("Sesja zalogowana — wpadła do kalendarza");
                setOpen(null);
              }}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] py-3.5 text-sm font-semibold text-background glow-primary"
            >
              Rozpocznij dziś
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
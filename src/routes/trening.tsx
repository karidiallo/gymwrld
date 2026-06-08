import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import gymHero from "@/assets/gym-hero.jpg";
import homeHero from "@/assets/home-hero.jpg";
import outdoorHero from "@/assets/outdoor-hero.jpg";
import { Dumbbell, Home, Mountain, Trophy, Calendar, ChevronRight, Flame, Clock } from "lucide-react";

export const Route = createFileRoute("/trening")({
  head: () => ({ meta: [{ title: "Trening — GymWrld" }] }),
  component: Trening,
});

type Cat = "silownia" | "dom" | "outdoor";

function Trening() {
  const [cat, setCat] = useState<Cat>("silownia");
  const [view, setView] = useState<"dzien" | "tydzien" | "miesiac">("tydzien");

  const plans: Record<Cat, { title: string; meta: string }[]> = {
    silownia: [
      { title: "Push Day · Klatka, barki", meta: "5 ćwiczeń · 55 min" },
      { title: "Pull Day · Plecy, biceps", meta: "6 ćwiczeń · 60 min" },
      { title: "Leg Day · Hipertrofia", meta: "5 ćwiczeń · 70 min" },
    ],
    dom: [
      { title: "Kalistenika full body", meta: "8 ćwiczeń · 35 min" },
      { title: "Mobility & rozciąganie", meta: "10 sekwencji · 25 min" },
      { title: "Trening funkcjonalny", meta: "6 ćwiczeń · 40 min" },
    ],
    outdoor: [
      { title: "Bieganie · Interwały 5×3 min", meta: "35 min · ~420 kcal" },
      { title: "Rower · Endurance", meta: "60 min · ~600 kcal" },
      { title: "Trekking · Park leśny", meta: "90 min · ~520 kcal" },
    ],
  };

  const heroes: Record<Cat, string> = { silownia: gymHero, dom: homeHero, outdoor: outdoorHero };
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Następny trening</p>
          <h2 className="mt-1 font-display text-3xl leading-none text-white">Push Day<br/><span className="text-gradient">Klatka i barki</span></h2>
          <div className="mt-3 flex gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur"><Clock className="h-3 w-3" /> 55 min</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur"><Flame className="h-3 w-3" /> 412 kcal</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur"><Dumbbell className="h-3 w-3" /> 5</span>
          </div>
          <button className="mt-4 rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-2.5 text-sm font-semibold text-background glow-primary">
            Rozpocznij trening
          </button>
        </div>
      </section>

      {/* Categories */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <CatBtn active={cat === "silownia"} onClick={() => setCat("silownia")} icon={<Dumbbell className="h-4 w-4" />} label="Siłownia" />
        <CatBtn active={cat === "dom"} onClick={() => setCat("dom")} icon={<Home className="h-4 w-4" />} label="Dom" />
        <CatBtn active={cat === "outdoor"} onClick={() => setCat("outdoor")} icon={<Mountain className="h-4 w-4" />} label="Outdoor" />
      </div>

      <div className="mt-4 space-y-2.5">
        {plans[cat].map((p, i) => (
          <button key={p.title} className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left hover:bg-white/[0.04]">
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
    </main>
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
  return (
    <div className="rounded-2xl glass p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 30 }).map((_, i) => {
          const intensity = [0, 0.2, 0.5, 0.8, 1][Math.floor(Math.random() * 5)];
          return (
            <span
              key={i}
              className="aspect-square rounded-md"
              style={{
                background: intensity === 0 ? "rgba(255,255,255,0.05)" : `color-mix(in oklab, var(--primary) ${intensity * 100}%, transparent)`,
              }}
            />
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Streak: 12 dni · Sesje w tym miesiącu: 18</p>
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
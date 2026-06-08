import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Dumbbell, Clock, Flame, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/workouts")({
  head: () => ({ meta: [{ title: "Gotowe treningi — GymWrld" }] }),
  component: Workouts,
});

type Diff = "latwy" | "sredni" | "trudny" | "expert";

const DIFFS: { id: Diff; label: string; color: string }[] = [
  { id: "latwy", label: "Łatwy", color: "var(--lime)" },
  { id: "sredni", label: "Średniozaawansowany", color: "var(--orange)" },
  { id: "trudny", label: "Trudny", color: "var(--magenta)" },
  { id: "expert", label: "Expert", color: "var(--violet)" },
];

const WORKOUTS: Record<Diff, { title: string; meta: string; exercises: string[] }[]> = {
  latwy: [
    { title: "Pierwszy krok · Full Body", meta: "5 ćwiczeń · 30 min · ~180 kcal", exercises: ["Przysiad bez obciążenia", "Wiosłowanie na maszynie", "Wyciskanie hantli siedząc", "Plank 30s", "Wykroki"] },
    { title: "Mobility & rozgrzewka", meta: "8 sekwencji · 20 min", exercises: ["Cat-cow", "Krążenia barków", "Hip openers", "Mobility T-spine", "Pies z głową w dół", "World's greatest stretch", "Ankle CARs", "Box breathing"] },
    { title: "Cardio spacer + core", meta: "25 min · ~150 kcal", exercises: ["Spacer 15 min", "Plank 3×30s", "Russian twist 3×20", "Mountain climbers 3×30s"] },
  ],
  sredni: [
    { title: "Push Day · Klatka i barki", meta: "5 ćwiczeń · 55 min · ~420 kcal", exercises: ["Wyciskanie sztangi leżąc", "Wyciskanie żołnierskie", "Wyciskanie hantli skos", "Wznosy bokiem", "Triceps na wyciągu"] },
    { title: "Pull Day · Plecy i biceps", meta: "6 ćwiczeń · 60 min · ~460 kcal", exercises: ["Martwy ciąg", "Podciąganie", "Wiosłowanie sztangą", "Face pull", "Uginanie hantli", "Hammer curls"] },
    { title: "Leg Day · Hipertrofia", meta: "5 ćwiczeń · 70 min · ~520 kcal", exercises: ["Przysiad ze sztangą", "Hip thrust", "RDL", "Wyciskanie nogami", "Łydki stojąc"] },
    { title: "HIIT Burn", meta: "12 rund · 25 min · ~380 kcal", exercises: ["Burpees", "Kettlebell swing", "Wioślarz 250m", "Box jumps", "Push-ups"] },
  ],
  trudny: [
    { title: "Upper / Lower · Split A", meta: "8 ćwiczeń · 75 min · ~580 kcal", exercises: ["Wyciskanie sztangi", "Podciąganie obciążone", "OHP", "Wiosłowanie T-bar", "Przysiad przedni", "RDL", "Wyciskanie hantli", "Plank obciążony"] },
    { title: "Full Body siła", meta: "7 ćwiczeń · 80 min · ~620 kcal", exercises: ["Martwy ciąg 5×3", "Przysiad 5×5", "Wyciskanie 5×5", "Podciąganie 4×8", "OHP 4×6", "Wiosłowanie 4×8", "Farmer carry 3×40m"] },
    { title: "Glute Builder Pro", meta: "8 ćwiczeń · 65 min · ~480 kcal", exercises: ["Hip thrust ciężki", "Bułgarskie 4×10", "RDL 5×8", "Cable kickback", "Goblet squat", "Glute bridge band", "Step-ups", "Plank"] },
  ],
  expert: [
    { title: "Powerlifting · Heavy Day", meta: "5 ćwiczeń · 90 min · ~700 kcal", exercises: ["Przysiad 5×3 @85%", "Wyciskanie 5×3 @85%", "Martwy ciąg 3×3 @90%", "Accessory tricep", "Accessory plecy"] },
    { title: "Calisthenics skill", meta: "60 min · planche, lever", exercises: ["Tuck planche 5×15s", "Front lever progression", "Handstand push-up", "Muscle-up 5×3", "L-sit hold"] },
    { title: "CrossFit WOD · Hero", meta: "AMRAP 40 min · ~850 kcal", exercises: ["Run 800m", "Pull-ups 20", "Push-ups 30", "Squats 40", "Burpees 10"] },
  ],
};

function Workouts() {
  const [diff, setDiff] = useState<Diff>("sredni");
  return (
    <main className="px-5 pt-6">
      <header className="flex items-center gap-3">
        <Link to="/trening" className="grid h-9 w-9 place-items-center rounded-full glass">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Biblioteka</p>
          <h1 className="font-display text-3xl">Gotowe treningi</h1>
        </div>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {DIFFS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDiff(d.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${diff === d.id ? "bg-white/10 ring-1 ring-white/20" : "bg-white/[0.03] text-muted-foreground"}`}
            style={diff === d.id ? { color: d.color } : {}}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {WORKOUTS[diff].map((w) => (
          <Link
            key={w.title}
            to="/trening"
            className="block rounded-2xl glass p-4 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-background">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-display text-base leading-tight">{w.title}</p>
                <p className="text-[11px] text-muted-foreground">{w.meta}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {w.exercises.map((e) => (
                <span key={e} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-muted-foreground">{e}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
      <div className="h-24" />
    </main>
  );
}
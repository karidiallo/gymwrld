import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Check, Sparkles, RefreshCw } from "lucide-react";
import { awardXp } from "@/lib/training-log";

export const Route = createFileRoute("/zadania")({
  head: () => ({ meta: [{ title: "Zadania — GymWrld" }] }),
  component: Quests,
});

const POOL = [
  { id: "p1", title: "Zrealizuj trening siłowy", xp: 120 },
  { id: "p2", title: "Wypij 2.5 L wody", xp: 60 },
  { id: "p3", title: "Osiągnij 10 000 kroków", xp: 80 },
  { id: "p4", title: "Zaloguj 8h snu", xp: 70 },
  { id: "p5", title: "10 min medytacji", xp: 50 },
  { id: "p6", title: "Spacer 30 min", xp: 60 },
  { id: "p7", title: "5 min stretchingu", xp: 40 },
  { id: "p8", title: "Zjedz 3 posiłki bogate w białko", xp: 80 },
  { id: "p9", title: "Bieżnia / cardio 20 min", xp: 90 },
  { id: "p10", title: "Zapisz wpis w dzienniku", xp: 40 },
  { id: "p11", title: "Street workout sesja", xp: 100 },
  { id: "p12", title: "Bez słodyczy cały dzień", xp: 80 },
  { id: "p13", title: "Zimny prysznic", xp: 60 },
  { id: "p14", title: "Czytaj 20 min", xp: 50 },
  { id: "p15", title: "Połóż się spać przed 23:00", xp: 70 },
];

function dayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Quests() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [count, setCount] = useState(6);
  const [key, setKey] = useState(dayKey());
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_quests");
      if (raw) {
        const x = JSON.parse(raw);
        if (x.key === dayKey()) { setDone(x.done ?? {}); setCount(x.count ?? 6); }
      }
    } catch {}
  }, []);
  const persist = (next: Record<string, boolean>, c = count) => {
    setDone(next);
    localStorage.setItem("gw_quests", JSON.stringify({ key, done: next, count: c }));
  };
  const seed = key.split("-").reduce((s, x) => s + Number(x), 0);
  const todayQuests = shuffle(POOL, seed).slice(0, count);

  const toggle = (id: string, xp: number, title: string) => {
    const wasDone = !!done[id];
    const next = { ...done, [id]: !wasDone };
    persist(next);
    if (!wasDone) { awardXp(xp, title); toast.success(`+${xp} XP`); }
    else { awardXp(-xp, `cofnij: ${title}`); toast(`-${xp} XP`); }
  };

  const completed = todayQuests.filter((q) => done[q.id]).length;

  return (
    <main className="px-5 pt-6 pb-12">
      <header className="flex items-center gap-3">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Daily</p>
          <h1 className="mt-1 font-display text-3xl">Zadania dnia</h1>
        </div>
      </header>

      <section className="mt-5 rounded-3xl glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Postęp</p>
            <p className="font-display text-3xl">{completed} / {todayQuests.length}</p>
          </div>
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" style={{ width: `${(completed / todayQuests.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Zadania odświeżają się codziennie o 00:00</p>
      </section>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Twoje zadania</h3>
      <div className="space-y-2.5">
        {todayQuests.map((q) => {
          const isDone = !!done[q.id];
          return (
            <button key={q.id} onClick={() => toggle(q.id, q.xp, q.title)} className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${isDone ? "bg-[var(--lime)] text-background" : "bg-primary/10 text-primary"}`}>
                {isDone ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDone ? "line-through opacity-60" : ""}`}>{q.title}</p>
                <p className="text-[11px] text-primary">+{q.xp} XP</p>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
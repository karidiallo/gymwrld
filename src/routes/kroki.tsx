import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Footprints, Activity, Trophy, MapPin, Smartphone, Zap, Gift } from "lucide-react";
import { Ring } from "@/components/Ring";

export const Route = createFileRoute("/kroki")({
  head: () => ({ meta: [{ title: "Kroki — GymWrld" }] }),
  component: Steps,
});

type Day = { d: string; steps: number };

const REWARDS = [
  { steps: 5000, xp: 50, icon: "🚶", title: "Rozruch" },
  { steps: 10000, xp: 120, icon: "🏃", title: "Cel dzienny" },
  { steps: 15000, xp: 200, icon: "🔥", title: "Przekroczone +50%" },
  { steps: 20000, xp: 350, icon: "⚡", title: "Wojownik" },
  { steps: 30000, xp: 600, icon: "🏆", title: "Maraton dnia" },
];

function Steps() {
  const [connected, setConnected] = useState(false);
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState<Day[]>([]);
  const [claimed, setClaimed] = useState<Record<number, boolean>>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_steps");
      if (raw) { const x = JSON.parse(raw); setConnected(!!x.connected); setToday(x.today ?? 0); setWeek(x.week ?? []); setClaimed(x.claimed ?? {}); }
    } catch {}
  }, []);
  const persist = (next: any) => { localStorage.setItem("gw_steps", JSON.stringify(next)); };
  const connect = () => {
    if (!navigator.geolocation) {
      toast.error("To urządzenie nie wspiera udostępniania położenia");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setConnected(true);
        const w = ["P","W","Ś","C","P","S","N"].map((d) => ({ d, steps: 0 }));
        setWeek(w);
        persist({ connected: true, source: "gps", today: 0, week: w, claimed });
        toast.success("Lokalizacja włączona", { description: "GPS gotowy do zapisu spacerów i tras." });
      },
      () => toast.error("Nie udzielono dostępu do lokalizacji"),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const goal = 10000;
  const total = week.reduce((s, d) => s + d.steps, 0);

  return (
    <main className="px-5 pt-6 pb-12">
      <header className="flex items-center gap-3">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Twój ruch</p>
          <h1 className="mt-1 font-display text-3xl">Kroki</h1>
        </div>
      </header>

      {!connected && (
        <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--lime)]/20 to-[var(--violet)]/20 p-5 ring-1 ring-white/10">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Smartphone className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="font-semibold">Włącz zapis ruchu GPS</p>
              <p className="text-[11px] text-muted-foreground">Aplikacja poprosi system o udostępnienie położenia i będzie mogła zapisywać trasy.</p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={connect} className="w-full rounded-2xl bg-gradient-to-r from-[var(--lime)] to-[var(--violet)] px-3 py-3 text-xs font-semibold text-background"><MapPin className="mr-1 inline h-3 w-3" /> Udostępnij położenie</button>
          </div>
        </section>
      )}

      <section className="mt-5 rounded-3xl glass p-5">
        <div className="flex items-center gap-4">
          <Ring value={today} max={goal} size={120} stroke={12} color="var(--lime)">
            <span className="text-xl font-semibold">{today}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">kroków</span>
          </Ring>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dziś · cel {goal}</p>
            <p className="font-display text-3xl">{Math.round((today / goal) * 100)}%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Tydzień: {total} kroków</p>
          </div>
        </div>
      </section>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Tydzień</h3>
      <div className="rounded-2xl glass p-4">
        <div className="flex items-end gap-1.5">
          {(week.length ? week : ["P","W","Ś","C","P","S","N"].map((d) => ({ d, steps: 0 }))).map((day, i) => {
            const pct = Math.min(100, (day.steps / goal) * 100);
            return (
              <div key={i} className="flex-1">
                <div className="rounded-full bg-gradient-to-t from-[var(--lime)] to-[var(--violet)]" style={{ height: `${Math.max(4, pct * 0.7)}px` }} />
                <p className="mt-1 text-center text-[10px] text-muted-foreground">{day.d}</p>
              </div>
            );
          })}
        </div>
      </div>

      <h3 className="mb-3 mt-7 text-lg font-semibold flex items-center gap-2"><Gift className="h-4 w-4 text-[var(--lime)]" /> Nagrody</h3>
      <div className="space-y-2.5">
        {REWARDS.map((r) => {
          const reached = today >= r.steps;
          const done = !!claimed[r.steps];
          return (
            <div key={r.steps} className={`flex items-center gap-3 rounded-2xl glass p-3.5 ${done ? "opacity-60" : ""}`}>
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-[11px] text-muted-foreground">{r.steps.toLocaleString()} kroków · +{r.xp} XP</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" style={{ width: `${Math.min(100, (today / r.steps) * 100)}%` }} />
                </div>
              </div>
              <button
                disabled={!reached || done}
                onClick={() => {
                  const next = { ...claimed, [r.steps]: true };
                  setClaimed(next);
                  persist({ connected, today, week, claimed: next });
                  toast.success(`+${r.xp} XP · ${r.title}`);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${reached && !done ? "bg-gradient-to-r from-[var(--lime)] to-[var(--violet)] text-background" : "bg-white/5 text-muted-foreground"}`}
              >
                {done ? "Odebrane" : reached ? "Odbierz" : "Zablokowane"}
              </button>
            </div>
          );
        })}
      </div>

      <h3 className="mb-3 mt-7 text-lg font-semibold flex items-center gap-2"><Trophy className="h-4 w-4 text-[var(--orange)]" /> Wyzwania</h3>
      <div className="grid grid-cols-2 gap-3">
        <Challenge icon="🔥" title="7-dniowy streak" desc="10k kroków przez 7 dni" />
        <Challenge icon="⚡" title="100k tydzień" desc="Suma 100 000 w tygodniu" />
        <Challenge icon="🌍" title="Dookoła miasta" desc="42 km dziennie" />
        <Challenge icon="🥇" title="Milion kroków" desc="Łącznie 1 000 000" />
      </div>
    </main>
  );
}

function Challenge({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl glass p-4">
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Trophy, Flame, Dumbbell, Apple, Moon, Footprints, Sparkles, Lock } from "lucide-react";
import { readLogs } from "@/lib/training-log";

export const Route = createFileRoute("/statystyki")({
  head: () => ({ meta: [{ title: "Statystyki — GymWrld" }] }),
  component: Stats,
});

const MEDALS = [
  { id: "first", icon: "🥉", title: "Pierwszy krok", desc: "Zaloguj pierwszy trening", check: (logs: any[]) => logs.length >= 1 },
  { id: "week", icon: "🔥", title: "7 dni z rzędu", desc: "Trenuj tydzień non-stop", check: (_: any, streak: number) => streak >= 7 },
  { id: "lvl5", icon: "⭐", title: "Lvl 5", desc: "Osiągnij poziom 5", check: (_: any, __: number, lvl: number) => lvl >= 5 },
  { id: "lvl10", icon: "🌟", title: "Lvl 10", desc: "Osiągnij poziom 10", check: (_: any, __: number, lvl: number) => lvl >= 10 },
  { id: "ten", icon: "💪", title: "10 treningów", desc: "Zaloguj 10 sesji", check: (logs: any[]) => logs.length >= 10 },
  { id: "fifty", icon: "🏆", title: "50 treningów", desc: "Zaloguj 50 sesji", check: (logs: any[]) => logs.length >= 50 },
  { id: "marathon", icon: "🥇", title: "Maratończyk", desc: "100 km łącznie", check: () => false },
  { id: "zen", icon: "🧘", title: "Zen master", desc: "30 sesji mind", check: (logs: any[]) => logs.filter((l) => l.kind === "mind").length >= 30 },
];

function Stats() {
  const [profile, setProfile] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { const raw = localStorage.getItem("gw_profile"); if (raw) setProfile(JSON.parse(raw)); } catch {}
    setLogs(readLogs());
    const onUp = () => { try { const raw = localStorage.getItem("gw_profile"); if (raw) setProfile(JSON.parse(raw)); } catch {} setLogs(readLogs()); };
    window.addEventListener("gw_profile_update", onUp);
    window.addEventListener("gw_training_log_update", onUp);
    return () => { window.removeEventListener("gw_profile_update", onUp); window.removeEventListener("gw_training_log_update", onUp); };
  }, []);
  const lvl = Number(profile.lvl ?? 1);
  const streak = Number(profile.streak ?? 0);
  const totalMin = logs.reduce((s, l) => s + (l.minutes || 0), 0);
  const totalKcal = logs.reduce((s, l) => s + (l.kcal || 0), 0);
  const counts = logs.reduce((acc: any, l) => { acc[l.kind] = (acc[l.kind] ?? 0) + 1; return acc; }, {});
  const s = profile.stats ?? { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 };

  return (
    <main className="px-5 pt-6 pb-12">
      <header className="flex items-center gap-3">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Twój progres</p>
          <h1 className="mt-1 font-display text-3xl">Statystyki</h1>
        </div>
      </header>

      <section className="mt-5 rounded-3xl glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Poziom</p>
            <p className="font-display text-4xl">Lvl {lvl}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Streak</p>
            <p className="font-display text-2xl text-[var(--orange)]"><Flame className="inline h-5 w-5" /> {streak} dni</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" style={{ width: `${Math.min(100, ((profile.xp ?? 0) / 2000) * 100)}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{profile.xp ?? 0} / 2000 XP</p>
      </section>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Atrybuty</h3>
      <div className="grid grid-cols-2 gap-3">
        <StatBar icon={<Dumbbell className="h-4 w-4" />} label="Siła" value={s.sila} />
        <StatBar icon={<Footprints className="h-4 w-4" />} label="Kondycja" value={s.kondycja} />
        <StatBar icon={<Apple className="h-4 w-4" />} label="Dieta" value={s.dieta} />
        <StatBar icon={<Moon className="h-4 w-4" />} label="Sen" value={s.sen} />
        <StatBar icon={<Sparkles className="h-4 w-4" />} label="Rozwój" value={s.rozwoj} />
      </div>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Łącznie</h3>
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Sesje" value={String(logs.length)} />
        <KPI label="Minuty" value={String(totalMin)} />
        <KPI label="Kcal" value={String(totalKcal)} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <KPI label="Siłownia" value={String(counts.silownia ?? 0)} />
        <KPI label="Biegi" value={String((counts.bieg ?? 0) + (counts.biezia ?? 0))} />
        <KPI label="Mind" value={String(counts.mind ?? 0)} />
      </div>

      <RatingsSection logs={logs} />

      <h3 className="mb-3 mt-7 text-lg font-semibold">Medale & osiągnięcia</h3>
      <div className="grid grid-cols-2 gap-3">
        {MEDALS.map((m) => {
          const unlocked = m.check(logs, streak, lvl);
          return (
            <div key={m.id} className={`rounded-2xl glass p-4 ${unlocked ? "ring-1 ring-[var(--lime)]" : "opacity-60"}`}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{unlocked ? m.icon : "🔒"}</span>
                {unlocked ? <Trophy className="h-4 w-4 text-[var(--lime)]" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="mt-2 text-sm font-semibold">{m.title}</p>
              <p className="text-[11px] text-muted-foreground">{m.desc}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function StatBar({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl glass p-3.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="rounded-lg bg-primary/10 p-1.5 text-primary">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-3.5 text-center">
      <p className="font-display text-2xl">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function RatingsSection({ logs }: { logs: any[] }) {
  const now = Date.now();
  const rated = logs.filter((l) => typeof l.rating === "number" && l.rating > 0);
  const last7 = rated.filter((l) => now - l.ts < 7 * 86400_000);
  const last30 = rated.filter((l) => now - l.ts < 30 * 86400_000);
  const prev7 = rated.filter((l) => { const d = now - l.ts; return d >= 7 * 86400_000 && d < 14 * 86400_000; });
  const prev30 = rated.filter((l) => { const d = now - l.ts; return d >= 30 * 86400_000 && d < 60 * 86400_000; });
  const avg = (xs: any[]) => xs.length ? (xs.reduce((s, l) => s + l.rating, 0) / xs.length) : 0;
  const dist = [1, 2, 3, 4, 5].map((star) => rated.filter((l) => l.rating === star).length);
  const max = Math.max(1, ...dist);
  const delta7 = avg(last7) - avg(prev7);
  const delta30 = avg(last30) - avg(prev30);
  const fmtDelta = (d: number, prevCount: number) => {
    if (prevCount === 0) return { txt: "—", cls: "text-muted-foreground" };
    const arrow = d > 0.05 ? "↑" : d < -0.05 ? "↓" : "→";
    const cls = d > 0.05 ? "text-[var(--lime)]" : d < -0.05 ? "text-[var(--magenta)]" : "text-muted-foreground";
    return { txt: `${arrow} ${Math.abs(d).toFixed(1)}`, cls };
  };
  const d7 = fmtDelta(delta7, prev7.length);
  const d30 = fmtDelta(delta30, prev30.length);
  if (rated.length === 0) return (
    <>
      <h3 className="mb-3 mt-7 text-lg font-semibold">Twoje zadowolenie</h3>
      <div className="rounded-2xl glass p-5 text-center text-xs text-muted-foreground">
        Brak ocen — oceniaj treningi w historii ★
      </div>
    </>
  );
  return (
    <>
      <h3 className="mb-3 mt-7 text-lg font-semibold">Twoje zadowolenie</h3>
      <div className="rounded-2xl glass p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl glass p-3.5 text-center">
            <p className="font-display text-2xl">{avg(last7).toFixed(1)}★</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Średnia 7 dni</p>
            <p className={`mt-1 text-[10px] font-semibold ${d7.cls}`}>vs poprz. {d7.txt}</p>
          </div>
          <div className="rounded-2xl glass p-3.5 text-center">
            <p className="font-display text-2xl">{avg(last30).toFixed(1)}★</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Średnia 30 dni</p>
            <p className={`mt-1 text-[10px] font-semibold ${d30.cls}`}>vs poprz. {d30.txt}</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          {dist.map((count, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-white/5">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] transition-all"
                  style={{ height: `${(count / max) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{i + 1}★</p>
              <p className="text-[10px] font-semibold tabular-nums">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
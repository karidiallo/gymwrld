import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Trophy, Smartphone, Gift, Play, Square, Info } from "lucide-react";
import { Ring } from "@/components/Ring";
import {
  readSteps, writeSteps, requestMotionPermission,
  ensureGlobalTracking, stopGlobalTracking, isGlobalTracking, getGlobalTrackerStatus,
  type StepsState,
} from "@/lib/steps";

export const Route = createFileRoute("/kroki")({
  head: () => ({ meta: [{ title: "Kroki — GymWrld" }] }),
  component: Steps,
});

const REWARDS = [
  { steps: 5000, xp: 50, icon: "🚶", title: "Rozruch" },
  { steps: 10000, xp: 120, icon: "🏃", title: "Cel dzienny" },
  { steps: 15000, xp: 200, icon: "🔥", title: "Przekroczone +50%" },
  { steps: 20000, xp: 350, icon: "⚡", title: "Wojownik" },
  { steps: 30000, xp: 600, icon: "🏆", title: "Maraton dnia" },
];

function Steps() {
  const [state, setState] = useState<StepsState>(() => readSteps());
  const [tracking, setTracking] = useState<boolean>(() => isGlobalTracking());
  const [accelOn, setAccelOn] = useState(false);
  const [gpsOn, setGpsOn] = useState(false);

  useEffect(() => {
    const onUp = () => setState(readSteps());
    window.addEventListener("gw_steps_update", onUp);
    return () => window.removeEventListener("gw_steps_update", onUp);
  }, []);

  // Auto-start on mount if the user previously enabled autostart and the
  // browser already granted motion permission (Android / desktop). On iOS the
  // first start still needs a tap (Apple requires a user gesture).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isGlobalTracking()) { setTracking(true); return; }
    if (localStorage.getItem("gw_steps_autostart") !== "1") return;
    try {
      // @ts-expect-error iOS-only API
      const needsAsk = typeof window.DeviceMotionEvent?.requestPermission === "function";
      if (needsAsk) return; // iOS requires a tap — don't auto-prompt
    } catch {}
    ensureGlobalTracking();
    setTracking(true);
  }, []);

  useEffect(() => {
    if (!tracking) return;
    const id = setInterval(() => {
      const s = getGlobalTrackerStatus();
      setAccelOn(s.accel); setGpsOn(s.gps);
      setState(readSteps());
    }, 1500);
    return () => clearInterval(id);
  }, [tracking]);

  const start = async () => {
    const perm = await requestMotionPermission();
    if (perm === "denied") {
      toast.error("Brak zgody na czujnik ruchu — liczę tylko po GPS.");
    } else if (perm === "unsupported") {
      toast("Brak czujnika ruchu — liczę tylko po GPS.");
    }
    ensureGlobalTracking();
    setTracking(true);
    toast.success("Krokomierz włączony", { description: "Chodzi w tle — działa też po przejściu do innych zakładek aplikacji." });
  };

  const stop = () => {
    stopGlobalTracking();
    setTracking(false);
    setAccelOn(false); setGpsOn(false);
    toast("Krokomierz zatrzymany");
  };

  const { today, week, distanceM, goal, claimed } = state;
  const total = week.reduce((s, d) => s + d.steps, 0);
  const distanceKm = (distanceM / 1000).toFixed(2);

  return (
    <main className="px-5 pt-6 pb-12">
      <header className="flex items-center gap-3">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Twój ruch</p>
          <h1 className="mt-1 font-display text-3xl">Kroki</h1>
        </div>
      </header>

      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--lime)]/20 to-[var(--violet)]/20 p-5 ring-1 ring-white/10">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Smartphone className="h-5 w-5" /></div>
          <div className="flex-1">
            <p className="font-semibold">{tracking ? "Krokomierz aktywny" : "Włącz krokomierz"}</p>
            <p className="text-[11px] text-muted-foreground">
              {tracking
                ? `Akcelerometr: ${accelOn ? "✓" : "—"} · GPS: ${gpsOn ? "✓" : "—"} · ${distanceKm} km`
                : "Łączę dane z czujnika ruchu telefonu z GPS — nie da się oszukać tupiąc w miejscu."}
            </p>
          </div>
        </div>
        <div className="mt-4">
          {tracking ? (
            <button onClick={stop} className="w-full rounded-2xl bg-white/15 px-3 py-3 text-xs font-semibold">
              <Square className="mr-1 inline h-3 w-3" /> Zatrzymaj krokomierz
            </button>
          ) : (
            <button onClick={start} className="w-full rounded-2xl bg-gradient-to-r from-[var(--lime)] to-[var(--violet)] px-3 py-3 text-xs font-semibold text-background">
              <Play className="mr-1 inline h-3 w-3" /> Włącz krokomierz
            </button>
          )}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[10px] text-muted-foreground/80">
          <Info className="h-3 w-3 shrink-0 translate-y-0.5" />
          PWA nie ma dostępu do natywnego krokomierza systemu — używam czujnika ruchu (akcelerometr) + GPS. Trzymaj telefon przy sobie.
        </p>
      </section>

      <section className="mt-5 rounded-3xl glass p-5">
        <div className="flex items-center gap-4">
          <Ring value={today} max={goal} size={120} stroke={12} color="var(--lime)">
            <span className="text-xl font-semibold">{today}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">kroków</span>
          </Ring>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dziś · cel {goal}</p>
            <p className="font-display text-3xl">{Math.round((today / goal) * 100)}%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Tydzień: {total} kroków · {distanceKm} km</p>
          </div>
        </div>
      </section>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Tydzień</h3>
      <div className="rounded-2xl glass p-4">
        <div className="flex items-end gap-1.5">
          {week.map((day, i) => {
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
                  const s = { ...state, claimed: next };
                  writeSteps(s);
                  setState(s);
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
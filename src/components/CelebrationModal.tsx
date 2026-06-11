import { useEffect, useState } from "react";
import { Trophy, Sparkles, X } from "lucide-react";

type Celebration = { title: string; xp: number; emoji?: string };

/**
 * Big centered medal celebration. Listens to window `gw_achievement` events
 * and shows a full-screen modal that the user must dismiss. Sits above
 * Sonner toasts so it never gets covered.
 */
export function CelebrationModal() {
  const [c, setC] = useState<Celebration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onAchv = (e: any) => {
      const d = e.detail ?? {};
      setC({ title: d.title ?? "Osiągnięcie", xp: Number(d.xp ?? 0), emoji: d.emoji });
      try { navigator.vibrate?.([60, 40, 80]); } catch {}
    };
    window.addEventListener("gw_achievement", onAchv as any);
    return () => window.removeEventListener("gw_achievement", onAchv as any);
  }, []);

  if (!c) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] grid place-items-center bg-black/80 px-6 backdrop-blur-md"
      onClick={() => setC(null)}
    >
      {/* confetti dots */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `-${(i * 13) % 40}px`,
              background: ["var(--magenta)", "var(--orange)", "var(--lime)", "var(--violet)"][i % 4],
              animation: `fall ${2.4 + (i % 5) * 0.3}s ${i * 0.05}s ease-in forwards`,
              opacity: 0.9,
            }}
          />
        ))}
        <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(540deg); opacity:0 } }`}</style>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--lime)]/20 p-8 text-center shadow-2xl backdrop-blur-xl"
      >
        <button
          onClick={() => setC(null)}
          aria-label="Zamknij"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Nowe osiągnięcie</p>
        <div className="relative mx-auto mt-5 grid h-32 w-32 place-items-center">
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[var(--lime)]/30" />
          <span aria-hidden className="absolute inset-2 rounded-full bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] blur-md opacity-70" />
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] text-background shadow-[0_20px_50px_-10px_rgba(233,69,96,0.7)]">
            {c.emoji ? <span className="text-5xl">{c.emoji}</span> : <Trophy className="h-12 w-12" />}
          </div>
        </div>
        <h2 className="mt-6 font-display text-3xl leading-tight">Gratulacje!</h2>
        <p className="mt-2 text-base font-semibold text-foreground">{c.title}</p>
        {c.xp > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--lime)]/15 px-4 py-1.5 text-sm font-semibold text-[var(--lime)]">
            <Sparkles className="h-4 w-4" /> +{c.xp} XP
          </div>
        )}
        <button
          onClick={() => setC(null)}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary"
        >
          Lecimy dalej 🔥
        </button>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, Trophy, Droplet, Dumbbell, Footprints } from "lucide-react";
import { readLogs } from "@/lib/training-log";

type Card = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
  to: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function computeStreak(): number {
  try {
    const logs = readLogs();
    if (!logs.length) return 0;
    const days = new Set(logs.map((l) => new Date(l.ts).toISOString().slice(0, 10)));
    let streak = 0;
    const d = new Date();
    for (;;) {
      const k = d.toISOString().slice(0, 10);
      if (days.has(k)) { streak += 1; d.setDate(d.getDate() - 1); }
      else if (streak === 0) { d.setDate(d.getDate() - 1); if (streak === 0 && d.getDate() < new Date().getDate() - 1) break; if (streak === 0) break; }
      else break;
    }
    return streak;
  } catch { return 0; }
}

export function StreakCarousel() {
  const [idx, setIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [steps, setSteps] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStreak(computeStreak());
    try { setSteps(JSON.parse(localStorage.getItem("gw_steps_v2") || "{}").today || 0); } catch {}
    const onSteps = () => {
      try { setSteps(JSON.parse(localStorage.getItem("gw_steps_v2") || "{}").today || 0); } catch {}
    };
    const onLog = () => setStreak(computeStreak());
    window.addEventListener("gw_steps_update", onSteps);
    window.addEventListener("gw_training_log_update", onLog);
    return () => {
      window.removeEventListener("gw_steps_update", onSteps);
      window.removeEventListener("gw_training_log_update", onLog);
    };
  }, []);

  const cards: Card[] = [
    {
      id: "streak",
      emoji: "🔥",
      title: streak > 0 ? `${streak}-dniowy streak` : "Zacznij swój streak",
      subtitle: streak > 0 ? "Nie przerywaj passy — trenuj dziś" : "Pierwszy trening = pierwszy dzień",
      bg: "from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]",
      to: "/trening",
      Icon: Flame,
    },
    {
      id: "motivation",
      emoji: "⚡",
      title: "20 minut. Tyle wystarczy.",
      subtitle: "Krótka sesja > brak sesji. Lecisz?",
      bg: "from-[var(--violet)] via-[var(--magenta)] to-[var(--orange)]",
      to: "/trening",
      Icon: Dumbbell,
    },
    {
      id: "steps",
      emoji: "👟",
      title: `${steps.toLocaleString("pl-PL")} / 10 000`,
      subtitle: "Kroki dziś — sprawdź progres",
      bg: "from-[var(--lime)] via-[var(--violet)] to-[var(--magenta)]",
      to: "/kroki",
      Icon: Footprints,
    },
    {
      id: "water",
      emoji: "💧",
      title: "Pamiętaj o wodzie",
      subtitle: "3 przypomnienia dziennie — zaakceptuj nawyk",
      bg: "from-[var(--violet)] via-[var(--lime)] to-[var(--orange)]",
      to: "/dieta",
      Icon: Droplet,
    },
    {
      id: "achv",
      emoji: "🏆",
      title: "Odblokuj medale",
      subtitle: "Pierwszy trening = +150 XP",
      bg: "from-[var(--orange)] via-[var(--magenta)] to-[var(--violet)]",
      to: "/statystyki",
      Icon: Trophy,
    },
  ];

  // auto-advance every 5s
  useEffect(() => {
    const id = window.setInterval(() => setIdx((i) => (i + 1) % cards.length), 5000);
    return () => window.clearInterval(id);
  }, [cards.length]);

  // swipe handling
  const startX = useRef<number | null>(null);
  const onStart = (x: number) => { startX.current = x; };
  const onEnd = (x: number) => {
    if (startX.current == null) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 40) {
      setIdx((i) => (dx < 0 ? (i + 1) % cards.length : (i - 1 + cards.length) % cards.length));
    }
    startX.current = null;
  };

  return (
    <div className="relative -mx-1 mt-4">
      <div
        ref={trackRef}
        className="overflow-hidden rounded-3xl"
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onEnd(e.changedTouches[0].clientX)}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseUp={(e) => onEnd(e.clientX)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {cards.map((c) => (
            <Link
              key={c.id}
              to={c.to}
              className={`relative min-w-full bg-gradient-to-br ${c.bg} p-5 ring-1 ring-white/10`}
            >
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />
              <div className="relative flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-black/30 backdrop-blur text-3xl animate-pulse">
                  {c.emoji}
                </div>
                <div className="flex-1 text-background">
                  <p className="font-display text-lg leading-tight drop-shadow">{c.title}</p>
                  <p className="text-[11px] opacity-90">{c.subtitle}</p>
                </div>
                <c.Icon className="h-5 w-5 text-background/80" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <button
            key={i}
            aria-label={`Karta ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
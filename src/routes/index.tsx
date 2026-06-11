import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ring } from "@/components/Ring";
import sanctuary from "@/assets/sanctuary.webp";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";
import { Flame, Footprints, Sparkles, ChevronRight, Moon, Dumbbell, Apple, Check } from "lucide-react";
import { AvatarViewer } from "@/components/AvatarViewer";
import { DEFAULT_AVATAR, getAvatarImageFor, skinFilter, type AvatarConfig } from "@/components/AvatarSvg";
import { awardXp, readLogs, KIND_LABEL, KIND_COLOR, type TrainingLog } from "@/lib/training-log";
import { LogDetail } from "@/components/LogDetail";
import { BrandFooter } from "@/components/BrandLoader";
import { ensureCloudProfile, isProfileComplete } from "@/lib/auth-flow";
import { syncLocalState } from "@/lib/cloud-state";
import { StreakCarousel } from "@/components/StreakCarousel";
import { NotificationBell } from "@/components/NotificationBell";
import { getCurrentUserOrClear } from "@/lib/auth-session";

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GymWrld — Twoje Sanktuarium" },
      { name: "description", content: "Twoja cyfrowa wersja siebie. Trenuj, jedz świadomie, rozwijaj postać." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [avatarCfg, setAvatarCfg] = useState<AvatarConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_AVATAR;
    try {
      const raw = localStorage.getItem("gw_avatar");
      const rp = localStorage.getItem("gw_profile");
      const cur = raw ? JSON.parse(raw) : DEFAULT_AVATAR;
      const prof = rp ? JSON.parse(rp) : {};
      return { ...DEFAULT_AVATAR, ...cur, gender: prof.gender ?? cur.gender ?? "m" };
    } catch {
      return DEFAULT_AVATAR;
    }
  });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<{ name?: string; lvl?: number; xp?: number; streak?: number; stats?: { sila: number; kondycja: number; dieta: number; sen: number; rozwoj: number } }>({});
  const [body, setBody] = useState<{ weight: number; height: number }>({ weight: 0, height: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    getCurrentUserOrClear().then(async (user) => {
      if (cancelled) return;
      if (!user) {
        // Landing page only shown in normal browser; in installed PWA go straight to auth
        const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (navigator as any).standalone === true;
        navigate({ to: standalone ? "/auth" : "/welcome", replace: true });
      } else {
        const cloudProfile = await withTimeout(ensureCloudProfile(user).catch(() => null));
        syncLocalState().catch(() => undefined);
        if (cancelled) return;
        if (cloudProfile && !isProfileComplete(cloudProfile)) {
          navigate({ to: "/onboarding", replace: true });
        } else {
          setAuthChecked(true);
        }
      }
    }).catch(() => {
      if (!cancelled) navigate({ to: "/auth", replace: true });
    });
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadProfile = () => {
      try {
        const raw = localStorage.getItem("gw_profile");
        if (raw) {
          const p = JSON.parse(raw);
          setProfile({ name: p.name, lvl: p.lvl, xp: p.xp, streak: p.streak, stats: p.stats });
        }
      } catch {}
      try {
        const rb = localStorage.getItem("gw_body");
        if (rb) {
          const b = JSON.parse(rb);
          setBody({ weight: Number(b.weight) || 0, height: Number(b.height) || 0 });
        }
      } catch {}
    };
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gw_avatar");
        const rp = localStorage.getItem("gw_profile");
        const cur = raw ? JSON.parse(raw) : DEFAULT_AVATAR;
        const prof = rp ? JSON.parse(rp) : {};
        // Force avatar gender to match profile gender (fix stale male default)
        const merged = { ...DEFAULT_AVATAR, ...cur, gender: prof.gender ?? cur.gender ?? "m" };
        if (merged.gender !== cur.gender) localStorage.setItem("gw_avatar", JSON.stringify(merged));
        setAvatarCfg(merged);
      } catch {}
      loadProfile();
      window.addEventListener("gw_profile_update", loadProfile);
      return () => window.removeEventListener("gw_profile_update", loadProfile);
    }
  }, [navigate]);
  const [quests, setQuests] = useState([
    { id: "q1", title: "Zrealizuj trening siłowy", reward: "+120 XP", progress: 0.5, done: false },
    { id: "q2", title: "Wypij 2.5 L wody", reward: "+60 XP", progress: 0.7, done: false },
    { id: "q3", title: "Osiągnij 10 000 kroków", reward: "+80 XP", progress: 0.78, done: false },
  ]);
  const [recentLogs, setRecentLogs] = useState<TrainingLog[]>([]);
  const [openLog, setOpenLog] = useState<TrainingLog | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => setRecentLogs(readLogs().slice(0, 3));
    load();
    window.addEventListener("gw_training_log_update", load);
    return () => window.removeEventListener("gw_training_log_update", load);
  }, []);
  const toggleQuest = (id: string) => {
    setQuests((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        const done = !q.done;
        const xp = parseInt(q.reward.replace(/[^\d]/g, "")) || 60;
        if (done) {
          awardXp(xp, q.title);
          toast.success(`Zadanie ukończone · ${q.reward}`);
        } else {
          awardXp(-xp, `cofnij: ${q.title}`);
          toast(`Zadanie cofnięte · -${xp} XP`);
        }
        return { ...q, done, progress: done ? 1 : q.progress };
      }),
    );
  };

  if (!authChecked) {
    return <main className="min-h-screen" aria-hidden />;
  }


  return (
    <main className="px-5 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Link to="/profil" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="GymWRLD" className="h-12 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <Chip icon={<Sparkles className="h-3.5 w-3.5 text-[var(--lime)]" />} label={`Lvl ${profile.lvl ?? 1}`} />
          <Chip icon={<Flame className="h-3.5 w-3.5 text-[var(--orange)]" />} label={`${profile.streak ?? 0} dni`} />
          <NotificationBell />
        </div>
      </header>

      {/* Streak / motivator swipe widget */}
      <StreakCarousel />

      {/* Sanctuary Hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl">
        <div className="relative aspect-[4/5] w-full">
          <img
            src={sanctuary}
            alt="Twoje Sanktuarium"
            className="absolute inset-0 h-full w-full object-cover"
            width={1024}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-background" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10" />

          <button
            onClick={() => setViewerOpen(true)}
            aria-label="Otwórz widok 360°"
            className="absolute bottom-2 left-1/2 h-[92%] -translate-x-1/2 cursor-pointer select-none transition-transform active:scale-[0.98]"
          >
            <img
              src={getAvatarImageFor(avatarCfg.gender, avatarCfg.body, avatarCfg.nbBase ?? "m")}
              alt="Twój avatar"
              className="pointer-events-none h-full object-contain"
              style={{ filter: `${skinFilter(avatarCfg.skinTone)} drop-shadow(0 20px 40px ${avatarCfg.outfitTint}55)` }}
              width={768}
              height={1280}
            />
          </button>

          {/* Top tag */}
          <div className="pointer-events-none absolute inset-x-5 top-4 z-10">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">
              Witaj{profile.name ? ` ponownie, ${profile.name}` : ""}
            </p>
          </div>

          {/* Headline above level box */}
          <div className="pointer-events-none absolute inset-x-5 top-[42%] z-10">
            <h2 className="font-display text-[34px] leading-[1.02] drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
              Buduj <span className="text-gradient">swoją</span><br/>najlepszą wersję
            </h2>
          </div>

          {/* Bottom overlay: level badge */}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div className="rounded-2xl glass px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Początkujący · Lvl {profile.lvl ?? 1}</p>
              <p className="text-xs font-medium">{profile.xp ?? 0} / 2000 XP</p>
              <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" style={{ width: `${Math.min(100, ((profile.xp ?? 0) / 2000) * 100)}%` }} />
              </div>
              <BMIBar weight={body.weight} height={body.height} />
            </div>
            <button
              onClick={() => setViewerOpen(true)}
              className="glass shrink-0 rounded-full px-4 py-2.5 text-xs font-medium glow-primary"
            >
              Sanktuarium
            </button>
          </div>
        </div>
      </section>

      {/* Today's progress */}
      <SectionTitle title="Dzisiejszy progres" actionTo="/statystyki" action="Zobacz szczegóły" />
      <div className="grid grid-cols-3 gap-3">
        <StatCard to="/trening" icon={<Dumbbell className="h-4 w-4" />} title="Siła" value={profile.stats?.sila ?? 0} />
        <StatCard to="/dieta" icon={<Apple className="h-4 w-4" />} title="Dieta" value={profile.stats?.dieta ?? 0} />
        <StatCard to="/regeneracja" icon={<Moon className="h-4 w-4" />} title="Sen" value={profile.stats?.sen ?? 0} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <StatCard to="/trening" icon={<Footprints className="h-4 w-4" />} title="Kondycja" value={profile.stats?.kondycja ?? 0} />
        <StatCard to="/profil" icon={<Sparkles className="h-4 w-4" />} title="Rozwój" value={profile.stats?.rozwoj ?? 0} />
      </div>

      {/* Steps card */}
      <SectionTitle title="Dzisiejsze kroki" actionTo="/kroki" action="Historia" />
      <Link to="/kroki" className="group block w-full overflow-hidden rounded-3xl glass p-5 text-left transition-transform active:scale-[0.99]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Cel 10 000</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">0</p>
            <p className="mt-1 text-xs text-muted-foreground">0% celu · zacznij dziś</p>
          </div>
          <Ring value={0} size={92} stroke={8}>
            <Footprints className="h-5 w-5 text-primary" />
            <span className="mt-1 text-xs font-medium">0%</span>
          </Ring>
        </div>
        <div className="mt-4 flex items-end gap-1.5">
          {[0, 0, 0, 0, 0, 0, 0].map((v, i) => (
            <div key={i} className="flex-1">
              <div className="rounded-full bg-white/5" style={{ height: `4px` }} />
              <p className="mt-1 text-center text-[10px] text-muted-foreground">{["P","W","Ś","C","P","S","N"][i]}</p>
            </div>
          ))}
        </div>
      </Link>

      {/* Quests */}
      <SectionTitle title="Dzisiejsze zadania" actionTo="/zadania" action="Wszystkie" />
      <div className="space-y-2.5">
        {quests.map((q) => (
          <Quest key={q.id} {...q} onToggle={() => toggleQuest(q.id)} />
        ))}
      </div>

      {/* Last activity */}
      <SectionTitle title="Ostatnia aktywność" action="Historia" actionTo="/historia" />
      {recentLogs.length === 0 ? (
        <div className="rounded-2xl glass p-5 text-center text-xs text-muted-foreground">
          Brak aktywności · zaloguj pierwszy trening
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentLogs.map((l) => (
            <button
              key={l.id}
              onClick={() => setOpenLog(l)}
              className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left transition active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${KIND_COLOR[l.kind]}20`, color: KIND_COLOR[l.kind] }}>●</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{l.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {KIND_LABEL[l.kind]} · {l.minutes} min · {l.kcal} kcal
                  {l.rating ? ` · ${"★".repeat(l.rating)}` : ""}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(l.ts).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {viewerOpen && <AvatarViewer cfg={avatarCfg} onClose={() => setViewerOpen(false)} />}
      {openLog && <LogDetail log={openLog} onClose={() => setOpenLog(null)} />}
      <BrandFooter />
    </main>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}

function BMIBar({ weight, height }: { weight: number; height: number }) {
  if (!weight || !height) return null;
  const h = height / 100;
  const bmi = weight / (h * h);
  // Map BMI 15–35 to 0–100% on the bar
  const pct = Math.max(0, Math.min(100, ((bmi - 15) / 20) * 100));
  const cat =
    bmi < 18.5 ? { label: "Niedowaga", color: "text-[var(--cyan,#60a5fa)]" } :
    bmi < 25   ? { label: "Norma",     color: "text-[var(--lime)]" } :
    bmi < 30   ? { label: "Nadwaga",   color: "text-[var(--orange)]" } :
                 { label: "Otyłość",   color: "text-[var(--magenta)]" };
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px]">
        <span className="uppercase tracking-wider text-muted-foreground">BMI</span>
        <span className="font-medium tabular-nums">
          {bmi.toFixed(1)} <span className={`${cat.color}`}>· {cat.label}</span>
        </span>
      </div>
      <div className="relative mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-70"
          style={{
            background:
              "linear-gradient(to right, #60a5fa 0%, #60a5fa 17.5%, #bef264 17.5%, #bef264 50%, #ff8c3c 50%, #ff8c3c 75%, #e94560 75%, #e94560 100%)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>
    </div>
  );
}



function SectionTitle({ title, action, actionTo }: { title: string; action?: string; actionTo?: string }) {
  return (
    <div className="mb-3 mt-7 flex items-end justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {action && actionTo && (
        <Link to={actionTo} className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground">
          {action} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, to }: { icon: React.ReactNode; title: string; value: number; to: string }) {
  return (
    <Link to={to} className="block rounded-2xl glass p-3.5 transition-transform active:scale-[0.98]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="rounded-lg bg-primary/10 p-1.5 text-primary">{icon}</span>
        <span className="text-xs">{title}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${value}%` }} />
      </div>
    </Link>
  );
}

function Quest({ title, reward, progress, done, onToggle }: { title: string; reward: string; progress: number; done: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left transition-transform active:scale-[0.99]">
      <div className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${done ? "bg-[var(--lime)] text-background" : "bg-primary/10 text-primary"}`}>
        {done ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${done ? "line-through opacity-60" : ""}`}>{title}</p>
          <span className="text-[11px] font-medium text-primary">{reward}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </button>
  );
}


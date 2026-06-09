import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ring } from "@/components/Ring";
import sanctuary from "@/assets/sanctuary.jpg";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";
import { Flame, Footprints, Sparkles, ChevronRight, Moon, Dumbbell, Apple, Check } from "lucide-react";
import { AvatarViewer } from "@/components/AvatarViewer";
import { DEFAULT_AVATAR, getAvatarImageFor, skinFilter, type AvatarConfig } from "@/components/AvatarSvg";
import { awardXp } from "@/lib/training-log";
import { supabase } from "@/integrations/supabase/client";

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
  const [avatarCfg, setAvatarCfg] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [profile, setProfile] = useState<{ name?: string; lvl?: number; xp?: number; streak?: number; stats?: { sila: number; kondycja: number; dieta: number; sen: number; rozwoj: number } }>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (!data.session) {
        const onboarded = localStorage.getItem("gw_onboarded") === "1";
        navigate({ to: onboarded ? "/auth" : "/onboarding" });
      }
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
    };
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gw_avatar");
        if (raw) setAvatarCfg({ ...DEFAULT_AVATAR, ...JSON.parse(raw) });
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

  return (
    <main className="px-5 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Link to="/profil" className="flex items-center gap-2">
          <img
            src={logoAsset.url}
            alt="GymWrld"
            className="h-8 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </Link>
        <div className="flex items-center gap-2">
          <Chip icon={<Sparkles className="h-3.5 w-3.5 text-[var(--lime)]" />} label={`Lvl ${profile.lvl ?? 1}`} />
          <Chip icon={<Flame className="h-3.5 w-3.5 text-[var(--orange)]" />} label={`${profile.streak ?? 0} dni`} />
        </div>
      </header>

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
      <SectionTitle title="Ostatnia aktywność" />
      <div className="rounded-2xl glass p-5 text-center text-xs text-muted-foreground">
        Brak aktywności · zaloguj pierwszy trening
      </div>

      {viewerOpen && <AvatarViewer cfg={avatarCfg} onClose={() => setViewerOpen(false)} />}
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


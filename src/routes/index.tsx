import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ring } from "@/components/Ring";
import sanctuary from "@/assets/sanctuary.jpg";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";
import { Flame, Footprints, Sparkles, ChevronRight, Trophy, Moon, Dumbbell, Apple, Check } from "lucide-react";
import { AvatarCustomizer } from "@/components/AvatarCustomizer";
import { AvatarViewer } from "@/components/AvatarViewer";
import { DEFAULT_AVATAR, getAvatarImageFor, skinFilter, type AvatarConfig } from "@/components/AvatarSvg";

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
  const [customOpen, setCustomOpen] = useState(false);
  const [profile, setProfile] = useState<{ name?: string; level?: number; xp?: number; streak?: number }>({});
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("gw_onboarded") !== "1") {
      navigate({ to: "/onboarding" });
      return;
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gw_avatar");
        if (raw) setAvatarCfg({ ...DEFAULT_AVATAR, ...JSON.parse(raw) });
      } catch {}
      try {
        const raw = localStorage.getItem("gw_profile");
        if (raw) {
          const p = JSON.parse(raw);
          setProfile({ name: p.name, level: p.level, xp: p.xp, streak: p.streak });
        }
      } catch {}
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
        if (done) toast.success(`Zadanie ukończone · ${q.reward}`);
        return { ...q, done, progress: done ? 1 : q.progress };
      }),
    );
  };

  return (
    <main className="px-5 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Link to="/profil" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] font-display text-background">
            {(profile.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Witaj{profile.name ? " ponownie" : ""}</p>
            <h1 className="text-xl font-display">{profile.name || "Nowa postać"}</h1>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Chip icon={<Sparkles className="h-3.5 w-3.5 text-[var(--lime)]" />} label={`Lvl ${profile.level ?? 1}`} />
          <Chip icon={<Flame className="h-3.5 w-3.5 text-[var(--orange)]" />} label={`${profile.streak ?? 0} dni`} />
        </div>
      </header>

      {/* Sanctuary Hero — clean stage so avatar feet anchor cleanly to the floor */}
      <section className="relative mt-5 overflow-hidden rounded-3xl">
        <div
          className="relative aspect-[4/5] w-full"
          style={{
            background:
              "radial-gradient(110% 70% at 50% 20%, rgba(167,139,250,0.20) 0%, transparent 60%), radial-gradient(120% 70% at 50% 100%, rgba(34,211,238,0.18) 0%, transparent 60%), linear-gradient(180deg,#0d0f1a 0%, #060810 75%, #000 100%)",
          }}
        >
          {/* room ambience */}
          <div aria-hidden className="absolute inset-x-6 top-6 h-40 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
          <div aria-hidden className="absolute inset-x-10 bottom-2 h-px bg-white/15" />

          {/* GIANT logo — above level badge */}
          <div className="pointer-events-none absolute inset-x-0 top-6 grid place-items-center">
            <img
              src={logoAsset.url}
              alt="GymWrld"
              className="h-24 w-auto"
              style={{ filter: "brightness(0) invert(1) drop-shadow(0 6px 24px rgba(255,255,255,0.18))" }}
            />
          </div>

          {/* Avatar — full-body SVG, feet anchored to floor line */}
          <button
            onClick={() => setViewerOpen(true)}
            aria-label="Otwórz widok 360°"
            className="absolute inset-x-0 bottom-0 mx-auto grid place-items-end cursor-pointer select-none transition-transform active:scale-[0.98]"
            style={{ height: "82%" }}
          >
            <div
              className="pointer-events-none"
              style={{ filter: `drop-shadow(0 20px 40px ${avatarCfg.outfitTint}55)` }}
            >
              <AvatarSvg cfg={avatarCfg} />
            </div>
          </button>

          {/* Bottom overlay: level + CTA */}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div className="rounded-2xl glass px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Poziom {profile.level ?? 1}</p>
              <p className="text-xs font-medium">{profile.xp ?? 0} / {2000} XP</p>
              <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" style={{ width: `${Math.min(100, ((profile.xp ?? 0) / 2000) * 100)}%` }} />
              </div>
            </div>
            <button
              onClick={() => setCustomOpen(true)}
              className="glass shrink-0 rounded-full px-4 py-2.5 text-xs font-medium glow-primary"
            >
              Dostosuj postać
            </button>
          </div>
        </div>
      </section>

      {/* Today's progress */}
      <SectionTitle title="Dzisiejszy progres" action="Zobacz szczegóły" />
      <div className="grid grid-cols-3 gap-3">
        <StatCard to="/trening" icon={<Dumbbell className="h-4 w-4" />} title="Siła" value={68} />
        <StatCard to="/dieta" icon={<Apple className="h-4 w-4" />} title="Dieta" value={82} />
        <StatCard to="/regeneracja" icon={<Moon className="h-4 w-4" />} title="Sen" value={74} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <StatCard to="/trening" icon={<Footprints className="h-4 w-4" />} title="Kondycja" value={55} />
        <StatCard to="/profil" icon={<Sparkles className="h-4 w-4" />} title="Rozwój" value={40} />
      </div>

      {/* Steps card */}
      <SectionTitle title="Dzisiejsze kroki" action="Historia" />
      <Link to="/trening" className="group block w-full overflow-hidden rounded-3xl glass p-5 text-left transition-transform active:scale-[0.99]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Cel 10 000</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">7 842</p>
            <p className="mt-1 text-xs text-muted-foreground">78% celu · +12% vs wczoraj</p>
          </div>
          <Ring value={78} size={92} stroke={8}>
            <Footprints className="h-5 w-5 text-primary" />
            <span className="mt-1 text-xs font-medium">78%</span>
          </Ring>
        </div>
        <div className="mt-4 flex items-end gap-1.5">
          {[40, 60, 45, 80, 55, 70, 78].map((v, i) => (
            <div key={i} className="flex-1">
              <div className="rounded-full bg-gradient-to-t from-primary/40 to-secondary" style={{ height: `${v / 2}px` }} />
              <p className="mt-1 text-center text-[10px] text-muted-foreground">{["P","W","Ś","C","P","S","N"][i]}</p>
            </div>
          ))}
        </div>
      </Link>

      {/* Quests */}
      <SectionTitle title="Dzisiejsze zadania" action="Wszystkie" />
      <div className="space-y-2.5">
        {quests.map((q) => (
          <Quest key={q.id} {...q} onToggle={() => toggleQuest(q.id)} />
        ))}
      </div>

      {/* Last activity */}
      <SectionTitle title="Ostatnia aktywność" />
      <div className="space-y-2.5">
        <Activity to="/trening" icon={<Dumbbell className="h-4 w-4" />} title="Push Day · Klatka, barki" meta="Wczoraj · 58 min · 412 kcal" />
        <Activity to="/trening" icon={<Footprints className="h-4 w-4" />} title="Spacer poranny" meta="Wczoraj · 32 min · 2 410 kroków" />
        <Activity to="/profil" icon={<Trophy className="h-4 w-4" />} title="Nowy rekord: Wyciskanie 80 kg × 6" meta="2 dni temu" />
      </div>

      {viewerOpen && <AvatarViewer cfg={avatarCfg} onClose={() => setViewerOpen(false)} />}
      {customOpen && (
        <AvatarCustomizer
          initial={avatarCfg}
          onClose={() => setCustomOpen(false)}
          onSave={(cfg) => {
            setAvatarCfg(cfg);
            if (typeof window !== "undefined") localStorage.setItem("gw_avatar", JSON.stringify(cfg));
            toast.success("Wygląd zaktualizowany ✨");
            setCustomOpen(false);
          }}
        />
      )}
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

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 mt-7 flex items-end justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {action && (
        <button className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground">
          {action} <ChevronRight className="h-3.5 w-3.5" />
        </button>
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

function Activity({ icon, title, meta, to }: { icon: React.ReactNode; title: string; meta: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl glass p-3.5 transition-transform active:scale-[0.99]">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

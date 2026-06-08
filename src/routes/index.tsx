import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ring } from "@/components/Ring";
import sanctuary from "@/assets/sanctuary.jpg";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";
import { Flame, Footprints, Sparkles, ChevronRight, Trophy, Moon, Dumbbell, Apple, Check } from "lucide-react";
import { AvatarCustomizer } from "@/components/AvatarCustomizer";
import { AvatarViewer } from "@/components/AvatarViewer";
import { DEFAULT_AVATAR, getAvatarImage, type AvatarConfig } from "@/components/AvatarSvg";

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
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] font-display text-background">A</div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Witaj ponownie</p>
            <h1 className="text-xl font-display">Aleks</h1>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Chip icon={<Sparkles className="h-3.5 w-3.5 text-[var(--lime)]" />} label="Lvl 14" />
          <Chip icon={<Flame className="h-3.5 w-3.5 text-[var(--orange)]" />} label="12 dni" />
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
            className="animate-float absolute -bottom-2 left-1/2 h-[92%] -translate-x-1/2 cursor-pointer select-none transition-transform active:scale-[0.98]"
          >
            <img
              src={getAvatarImage(avatarCfg.gender, avatarCfg.body)}
              alt="Twój avatar"
              className="pointer-events-none h-full object-contain"
              style={{ filter: `drop-shadow(0 20px 40px ${avatarCfg.outfitTint}55)` }}
              width={768}
              height={1280}
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full glass px-2 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
              Dotknij · 360°
            </span>
          </button>

          {/* Top overlay: branding + tagline */}
          <div className="absolute inset-x-4 top-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <img src={logoAsset.url} alt="GymWrld" className="h-8 w-auto invert drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]" />
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] animate-pulse-glow" />
                Sanktuarium
              </span>
            </div>
            <h2 className="font-display text-[28px] leading-[1.05]">
              Buduj <span className="text-gradient">swoją</span><br />najlepszą wersję.
            </h2>
          </div>

          {/* Bottom overlay: level + CTA */}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div className="rounded-2xl glass px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Poziom 14</p>
              <p className="text-xs font-medium">1 240 / 2 000 XP</p>
              <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" />
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

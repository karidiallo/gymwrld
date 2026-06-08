import { createFileRoute } from "@tanstack/react-router";
import { Ring } from "@/components/Ring";
import sanctuary from "@/assets/sanctuary.jpg";
import avatar from "@/assets/avatar.png";
import { Flame, Footprints, Sparkles, ChevronRight, Trophy, Moon, Dumbbell, Apple } from "lucide-react";

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
  return (
    <main className="px-5 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Witaj ponownie</p>
          <h1 className="mt-1 text-2xl font-semibold">Aleks</h1>
        </div>
        <div className="flex items-center gap-2">
          <Chip icon={<Sparkles className="h-3.5 w-3.5" />} label="Lvl 14" />
          <Chip icon={<Flame className="h-3.5 w-3.5 text-orange-300" />} label="12 dni" />
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10" />

          <img
            src={avatar}
            alt="Twój avatar"
            className="animate-float pointer-events-none absolute bottom-0 left-1/2 h-[78%] -translate-x-1/2 select-none object-contain drop-shadow-[0_20px_40px_rgba(79,140,255,0.35)]"
            width={768}
            height={1280}
          />

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            Twoje Sanktuarium · Apartament
          </div>

          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold leading-tight">
                Twoja cyfrowa<br/>wersja <span className="text-gradient">siebie</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Poziom 14 · 1 240 / 2 000 XP</p>
              <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-primary to-secondary" />
              </div>
            </div>
            <button className="glass shrink-0 rounded-full px-4 py-2.5 text-xs font-medium glow-primary">
              Dostosuj postać
            </button>
          </div>
        </div>
      </section>

      {/* Today's progress */}
      <SectionTitle title="Dzisiejszy progres" action="Zobacz szczegóły" />
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Dumbbell className="h-4 w-4" />} title="Siła" value={68} />
        <StatCard icon={<Apple className="h-4 w-4" />} title="Dieta" value={82} />
        <StatCard icon={<Moon className="h-4 w-4" />} title="Sen" value={74} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <StatCard icon={<Footprints className="h-4 w-4" />} title="Kondycja" value={55} />
        <StatCard icon={<Sparkles className="h-4 w-4" />} title="Rozwój" value={40} />
      </div>

      {/* Steps card */}
      <SectionTitle title="Dzisiejsze kroki" action="Historia" />
      <button className="group block w-full overflow-hidden rounded-3xl glass p-5 text-left transition-transform active:scale-[0.99]">
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
      </button>

      {/* Quests */}
      <SectionTitle title="Dzisiejsze zadania" action="Wszystkie" />
      <div className="space-y-2.5">
        <Quest title="Zrealizuj trening siłowy" reward="+120 XP" progress={0.5} />
        <Quest title="Wypij 2.5 L wody" reward="+60 XP" progress={0.7} />
        <Quest title="Osiągnij 10 000 kroków" reward="+80 XP" progress={0.78} />
      </div>

      {/* Last activity */}
      <SectionTitle title="Ostatnia aktywność" />
      <div className="space-y-2.5">
        <Activity icon={<Dumbbell className="h-4 w-4" />} title="Push Day · Klatka, barki" meta="Wczoraj · 58 min · 412 kcal" />
        <Activity icon={<Footprints className="h-4 w-4" />} title="Spacer poranny" meta="Wczoraj · 32 min · 2 410 kroków" />
        <Activity icon={<Trophy className="h-4 w-4" />} title="Nowy rekord: Wyciskanie 80 kg × 6" meta="2 dni temu" />
      </div>
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

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="rounded-2xl glass p-3.5">
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
    </div>
  );
}

function Quest({ title, reward, progress }: { title: string; reward: string; progress: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          <span className="text-[11px] font-medium text-primary">{reward}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function Activity({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

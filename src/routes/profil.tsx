import { createFileRoute } from "@tanstack/react-router";
import avatar from "@/assets/avatar.png";
import { Settings, Shirt, Sofa, Trophy, BadgeCheck, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Profil — GymWrld" }] }),
  component: Profil,
});

function Profil() {
  return (
    <main className="px-5 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <button className="grid h-9 w-9 place-items-center rounded-full glass">
          <Settings className="h-4 w-4" />
        </button>
      </header>

      {/* Avatar card */}
      <section className="relative mt-5 overflow-hidden rounded-3xl glass p-5">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
            <img src={avatar} alt="Avatar" className="h-full w-full object-contain" loading="lazy" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Aleks · @aleks</p>
            <h2 className="mt-1 text-xl font-semibold">Poziom 14 — Eksplorator</h2>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">1 240 / 2 000 XP do Lvl 15</p>
            <button className="mt-3 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground glow-primary">
              Dostosuj postać
            </button>
          </div>
        </div>
      </section>

      {/* Premium banner */}
      <section className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/25 via-secondary/15 to-transparent p-[1px]">
        <div className="rounded-3xl bg-card/60 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">GymWrld Premium</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Stwórz swoją cyfrową wersję siebie. AI Coach, ekskluzywne skiny, Premium Deals.</p>
          <button className="mt-3 w-full rounded-full bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-medium text-primary-foreground glow-primary">
            Odblokuj Premium
          </button>
        </div>
      </section>

      {/* Quests */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Dzienne questy</h3>
      <div className="space-y-2.5">
        <QuestRow icon={<Target className="h-4 w-4" />} title="10 000 kroków" reward="+80 XP" pct={78} />
        <QuestRow icon={<Sparkles className="h-4 w-4" />} title="Zrealizuj makro białka" reward="+60 XP" pct={70} />
        <QuestRow icon={<Target className="h-4 w-4" />} title="Wykonaj trening" reward="+120 XP" pct={50} />
      </div>

      {/* Stats */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Statystyki</h3>
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Siła" value="68" />
        <StatBox label="Kondycja" value="55" />
        <StatBox label="Dieta" value="82" />
        <StatBox label="Sen" value="74" />
        <StatBox label="Rozwój" value="40" />
        <StatBox label="Streak" value="12 dni" />
      </div>

      {/* Collection */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Kolekcja</h3>
      <div className="grid grid-cols-4 gap-3">
        <Collect icon={<Shirt className="h-5 w-5" />} label="Ubrania" count={12} />
        <Collect icon={<Sofa className="h-5 w-5" />} label="Dekoracje" count={7} />
        <Collect icon={<Trophy className="h-5 w-5" />} label="Trofea" count={4} />
        <Collect icon={<BadgeCheck className="h-5 w-5" />} label="Odznaki" count={9} />
      </div>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Osiągnięcia</h3>
      <div className="grid grid-cols-3 gap-3">
        {["Pierwszy trening","7 dni streak","Lvl 10","100 km","2 L wody × 30","Push 80 kg"].map((a, i) => (
          <div key={a} className="rounded-2xl glass p-3 text-center">
            <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${i < 4 ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground" : "bg-white/5 text-muted-foreground"}`}>
              <Trophy className="h-5 w-5" />
            </div>
            <p className="mt-2 text-[11px] leading-tight">{a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

function QuestRow({ icon, title, reward, pct }: { icon: React.ReactNode; title: string; reward: string; pct: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          <span className="text-[11px] text-primary">{reward}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-3.5 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Collect({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <button className="rounded-2xl glass p-3 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">{icon}</div>
      <p className="mt-2 text-[11px] font-medium">{label}</p>
      <p className="text-[10px] text-muted-foreground">{count} szt.</p>
    </button>
  );
}
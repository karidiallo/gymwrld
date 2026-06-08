import { createFileRoute } from "@tanstack/react-router";
import { Ring } from "@/components/Ring";
import foodHero from "@/assets/food-hero.jpg";
import { Plus, Coffee, UtensilsCrossed, Soup, Cookie, Droplet } from "lucide-react";

export const Route = createFileRoute("/dieta")({
  head: () => ({ meta: [{ title: "Dieta — GymWrld" }, { name: "description", content: "Twój dzienny plan żywieniowy." }] }),
  component: Dieta,
});

function Dieta() {
  const eaten = 1620;
  const goal = 2400;
  const remaining = goal - eaten;
  return (
    <main className="px-5 pt-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dzisiaj</p>
          <h1 className="mt-1 font-display text-3xl">Dieta</h1>
        </div>
        <button className="rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-4 py-2 text-xs font-medium text-white glow-primary">
          <Plus className="inline h-3.5 w-3.5" /> Dodaj posiłek
        </button>
      </header>

      {/* Food hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl">
        <img src={foodHero} alt="Zdrowy posiłek" className="h-44 w-full object-cover" width={1280} height={896} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Polecane dziś</p>
            <p className="font-display text-lg text-white">Power Bowl · 540 kcal</p>
          </div>
          <span className="rounded-full bg-[var(--lime)]/90 px-3 py-1 text-[10px] font-semibold text-background">+45g białka</span>
        </div>
      </section>

      {/* Summary */}
      <section className="mt-5 rounded-3xl glass p-5">
        <div className="flex items-center gap-5">
          <Ring value={eaten} max={goal} size={132} stroke={12} color="var(--magenta)">
            <span className="text-2xl font-semibold">{remaining}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">kcal pozostało</span>
          </Ring>
          <div className="flex-1 space-y-2 text-sm">
            <Row label="Zjedzone" value={`${eaten} kcal`} />
            <Row label="Cel" value={`${goal} kcal`} />
            <Row label="Spalone" value="412 kcal" muted />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3 text-center">
          <Macro label="Białko" value={112} goal={160} color="var(--magenta)" unit="g" />
          <Macro label="Węgle" value={184} goal={280} color="var(--orange)" unit="g" />
          <Macro label="Tłuszcze" value={48} goal={75} color="var(--lime)" unit="g" />
          <Macro label="Woda" value={1.8} goal={2.5} color="var(--violet)" unit="L" />
        </div>
      </section>

      {/* Meals */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Posiłki</h3>
      <div className="space-y-2.5">
        <Meal icon={<Coffee className="h-4 w-4" />} name="Śniadanie" items="Owsianka, jagody, masło orzechowe" kcal={520} />
        <Meal icon={<UtensilsCrossed className="h-4 w-4" />} name="Obiad" items="Kurczak, ryż basmati, brokuły" kcal={680} />
        <Meal icon={<Soup className="h-4 w-4" />} name="Kolacja" items="—" kcal={0} empty />
        <Meal icon={<Cookie className="h-4 w-4" />} name="Przekąski" items="Jogurt grecki, banan" kcal={420} />
      </div>

      {/* Water */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Nawodnienie</h3>
      <div className="flex items-center justify-between rounded-2xl glass p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/15 text-secondary">
            <Droplet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">1.8 L / 2.5 L</p>
            <p className="text-xs text-muted-foreground">Jeszcze 3 szklanki</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={`h-7 w-2 rounded-full ${i < 6 ? "bg-gradient-to-t from-primary to-secondary" : "bg-white/8"}`} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-medium"}>{value}</span>
    </div>
  );
}

function Macro({ label, value, goal, color, unit }: { label: string; value: number; goal: number; color: string; unit: string }) {
  return (
    <div>
      <Ring value={value} max={goal} size={68} stroke={6} color={color}>
        <span className="text-xs font-semibold">{value}{unit === "L" ? "" : ""}</span>
        <span className="text-[9px] text-muted-foreground">/ {goal}{unit}</span>
      </Ring>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Meal({ icon, name, items, kcal, empty }: { icon: React.ReactNode; name: string; items: string; kcal: number; empty?: boolean }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left transition-colors hover:bg-white/[0.04]">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{name}</p>
        <p className={`text-xs ${empty ? "text-muted-foreground/70" : "text-muted-foreground"}`}>{empty ? "Dodaj posiłek" : items}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{empty ? "+" : `${kcal}`}</p>
        {!empty && <p className="text-[10px] text-muted-foreground">kcal</p>}
      </div>
    </button>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Ring } from "@/components/Ring";
import foodHero from "@/assets/food-hero.jpg";
import { Plus, Coffee, UtensilsCrossed, Soup, Cookie, Droplet, X, Search, Trash2, Pencil, Minus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dieta")({
  head: () => ({ meta: [{ title: "Dieta — GymWrld" }, { name: "description", content: "Twój dzienny plan żywieniowy." }] }),
  component: Dieta,
});

type Meal = { id: string; icon: string; name: string; items: string; kcal: number; p?: number; c?: number; f?: number };

function Dieta() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [water, setWater] = useState(6); // glasses out of 10 (250ml each => 2.5L cel)
  const [toilet, setToilet] = useState({ pee: 4, poop: 1 });
  const [meals, setMeals] = useState<Meal[]>([
    { id: "m1", icon: "coffee", name: "Śniadanie", items: "Owsianka, jagody, masło orzechowe", kcal: 520, p: 22, c: 68, f: 18 },
    { id: "m2", icon: "lunch", name: "Obiad", items: "Kurczak, ryż basmati, brokuły", kcal: 680, p: 52, c: 78, f: 14 },
    { id: "m3", icon: "soup", name: "Kolacja", items: "", kcal: 0 },
    { id: "m4", icon: "snack", name: "Przekąski", items: "Jogurt grecki, banan", kcal: 420, p: 28, c: 48, f: 10 },
  ]);
  const eaten = meals.reduce((s, m) => s + m.kcal, 0);
  const goal = 2400;
  const remaining = goal - eaten;
  const waterMaxGlasses = 10;
  const waterLiters = (water * 0.25).toFixed(1);
  const waterGoal = 2.5;

  const addMeal = (data: { name: string; items: string; kcal: number; slot: string; p?: number; c?: number; f?: number }) => {
    setMeals((prev) => {
      // try to fill an empty matching slot
      const idx = prev.findIndex((m) => m.name.toLowerCase() === data.slot.toLowerCase() && m.kcal === 0);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], items: data.items || data.name, kcal: data.kcal, p: data.p, c: data.c, f: data.f };
        return next;
      }
      return [
        ...prev,
        { id: `m${Date.now()}`, icon: "snack", name: data.name || data.slot, items: data.items, kcal: data.kcal, p: data.p, c: data.c, f: data.f },
      ];
    });
    toast.success(`Dodano posiłek · +${data.kcal} kcal`);
    setOpen(false);
  };

  const updateMeal = (id: string, data: { items: string; kcal: number; p?: number; c?: number; f?: number }) => {
    setMeals((prev) => prev.map((m) => m.id === id ? { ...m, items: data.items, kcal: data.kcal, p: data.p, c: data.c, f: data.f } : m));
    toast.success("Posiłek zaktualizowany");
    setEditing(null);
  };

  const deleteMeal = (id: string) => {
    setMeals((prev) => {
      const m = prev.find((x) => x.id === id);
      if (!m) return prev;
      // if it's a default slot (Śniadanie/Obiad/Kolacja/Przekąski) just empty it
      if (["Śniadanie","Obiad","Kolacja","Przekąski"].includes(m.name)) {
        return prev.map((x) => x.id === id ? { ...x, items: "", kcal: 0, p: undefined, c: undefined, f: undefined } : x);
      }
      return prev.filter((x) => x.id !== id);
    });
    toast("Posiłek usunięty");
  };

  return (
    <main className="px-5 pt-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dzisiaj</p>
          <h1 className="mt-1 font-display text-3xl">Dieta</h1>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-4 py-2 text-xs font-medium text-white glow-primary">
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
        {meals.map((m) => {
          const icon =
            m.icon === "coffee" ? <Coffee className="h-4 w-4" /> :
            m.icon === "lunch" ? <UtensilsCrossed className="h-4 w-4" /> :
            m.icon === "soup" ? <Soup className="h-4 w-4" /> :
            <Cookie className="h-4 w-4" />;
          return (
            <MealRow
              key={m.id}
              icon={icon}
              meal={m}
              empty={m.kcal === 0}
              onAdd={() => setOpen(true)}
              onEdit={() => setEditing(m)}
              onDelete={() => deleteMeal(m.id)}
            />
          );
        })}
      </div>

      {/* Water */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Nawodnienie</h3>
      <div className="rounded-2xl glass p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/15 text-secondary">
              <Droplet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{waterLiters} L / {waterGoal} L</p>
              <p className="text-xs text-muted-foreground">
                {water >= waterMaxGlasses ? "Cel osiągnięty 💧" : `Jeszcze ${waterMaxGlasses - water} szklanek`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWater((w) => Math.max(0, w - 1))}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/5"
              aria-label="Odejmij szklankę"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { setWater((w) => Math.min(waterMaxGlasses, w + 1)); toast.success("+250ml wody"); }}
              className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[var(--violet)] to-[var(--magenta)] text-background"
              aria-label="Dodaj szklankę"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-1.5">
          {Array.from({ length: waterMaxGlasses }).map((_, i) => {
            const filled = i < water;
            return (
              <button
                key={i}
                onClick={() => setWater(i + 1 === water ? i : i + 1)}
                aria-label={`Szklanka ${i + 1}`}
                className={`h-10 rounded-lg transition ${
                  filled
                    ? "bg-gradient-to-t from-[var(--violet)] to-[var(--magenta)] shadow-[0_0_10px_rgba(120,80,255,0.4)]"
                    : "bg-white/[0.06] hover:bg-white/10"
                }`}
              >
                <Droplet className={`mx-auto h-3.5 w-3.5 ${filled ? "text-background" : "text-muted-foreground"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Toilet log */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Dziennik łazienki</h3>
      <div className="grid grid-cols-2 gap-3">
        <ToiletCard label="Siku" emoji="💧" value={toilet.pee} onAdd={() => setToilet((t) => ({ ...t, pee: t.pee + 1 }))} onSub={() => setToilet((t) => ({ ...t, pee: Math.max(0, t.pee - 1) }))} hint="Norma 4-7/dzień" />
        <ToiletCard label="Kupa" emoji="💩" value={toilet.poop} onAdd={() => setToilet((t) => ({ ...t, poop: t.poop + 1 }))} onSub={() => setToilet((t) => ({ ...t, poop: Math.max(0, t.poop - 1) }))} hint="Norma 1-2/dzień" />
      </div>
      <div className="h-24" />

      {open && <AddMealSheet onClose={() => setOpen(false)} onAdd={addMeal} />}
      {editing && (
        <EditMealSheet
          meal={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => updateMeal(editing.id, data)}
          onDelete={() => { deleteMeal(editing.id); setEditing(null); }}
        />
      )}
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

function ToiletCard({ label, emoji, value, onAdd, onSub, hint }: { label: string; emoji: string; value: number; onAdd: () => void; onSub: () => void; hint: string }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-[10px] text-muted-foreground">{hint}</p>
          </div>
        </div>
        <p className="font-display text-2xl">{value}</p>
      </div>
      <div className="mt-3 flex gap-1.5">
        <button onClick={onSub} className="grid h-8 flex-1 place-items-center rounded-lg bg-white/5"><Minus className="h-3.5 w-3.5" /></button>
        <button onClick={onAdd} className="grid h-8 flex-1 place-items-center rounded-lg bg-gradient-to-br from-[var(--violet)] to-[var(--magenta)] text-background"><Plus className="h-3.5 w-3.5" /></button>
      </div>
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

function MealRow({
  icon, meal, empty, onAdd, onEdit, onDelete,
}: {
  icon: React.ReactNode;
  meal: Meal;
  empty?: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { name, items, kcal, p, c, f } = meal;
  if (empty) {
    return (
      <button onClick={onAdd} className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left transition-colors hover:bg-white/[0.04]">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground/70">Dodaj posiłek</p>
        </div>
        <Plus className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-3.5">
      <button onClick={onEdit} className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </button>
      <button onClick={onEdit} className="flex-1 text-left">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{items}</p>
        {(p || c || f) && (
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/80">
            <span className="text-[var(--magenta)]">B:</span> {p ?? 0}g · <span className="text-[var(--orange)]">W:</span> {c ?? 0}g · <span className="text-[var(--lime)]">T:</span> {f ?? 0}g
          </p>
        )}
      </button>
      <button onClick={onEdit} className="text-right">
        <p className="text-sm font-semibold">{kcal}</p>
        <p className="text-[10px] text-muted-foreground">kcal</p>
      </button>
      <div className="ml-1 flex flex-col gap-1">
        <button onClick={onEdit} className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10" aria-label="Edytuj">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-muted-foreground hover:bg-[var(--magenta)]/20 hover:text-[var(--magenta)]" aria-label="Usuń">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function EditMealSheet({
  meal, onClose, onSave, onDelete,
}: {
  meal: Meal;
  onClose: () => void;
  onSave: (d: { items: string; kcal: number; p?: number; c?: number; f?: number }) => void;
  onDelete: () => void;
}) {
  const [items, setItems] = useState(meal.items);
  const [kcal, setKcal] = useState<number | "">(meal.kcal);
  const [p, setP] = useState<number | "">(meal.p ?? "");
  const [c, setC] = useState<number | "">(meal.c ?? "");
  const [f, setF] = useState<number | "">(meal.f ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Edytuj · {meal.name}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 space-y-2">
          <input value={items} onChange={(e) => setItems(e.target.value)} placeholder="Opis posiłku" className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground" />
          <input type="number" value={kcal} onChange={(e) => setKcal(e.target.value ? parseInt(e.target.value) : "")} placeholder="kcal" className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground" />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={p} onChange={(e) => setP(e.target.value ? parseInt(e.target.value) : "")} placeholder="B (g)" className="rounded-2xl bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground" />
            <input type="number" value={c} onChange={(e) => setC(e.target.value ? parseInt(e.target.value) : "")} placeholder="W (g)" className="rounded-2xl bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground" />
            <input type="number" value={f} onChange={(e) => setF(e.target.value ? parseInt(e.target.value) : "")} placeholder="T (g)" className="rounded-2xl bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onDelete} className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/5 px-4 py-3 text-sm text-[var(--magenta)] hover:bg-[var(--magenta)]/15">
            <Trash2 className="h-4 w-4" /> Usuń
          </button>
          <button
            onClick={() => kcal && onSave({ items, kcal: Number(kcal), p: p ? Number(p) : undefined, c: c ? Number(c) : undefined, f: f ? Number(f) : undefined })}
            disabled={!kcal}
            className="flex-1 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3 text-sm font-semibold text-background glow-primary disabled:opacity-40"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { name: "Owsianka z owocami", kcal: 380, tag: "Śniadanie", p: 14, c: 58, f: 9 },
  { name: "Omlet z warzywami", kcal: 420, tag: "Śniadanie", p: 28, c: 12, f: 28 },
  { name: "Kurczak z ryżem", kcal: 620, tag: "Obiad", p: 52, c: 72, f: 12 },
  { name: "Łosoś z batatem", kcal: 580, tag: "Obiad", p: 42, c: 56, f: 18 },
  { name: "Sałatka z tuńczykiem", kcal: 340, tag: "Kolacja", p: 32, c: 18, f: 16 },
  { name: "Twaróg z miodem", kcal: 280, tag: "Kolacja", p: 28, c: 24, f: 6 },
  { name: "Shake białkowy", kcal: 220, tag: "Przekąska", p: 30, c: 12, f: 4 },
  { name: "Jogurt grecki + orzechy", kcal: 260, tag: "Przekąska", p: 18, c: 14, f: 14 },
  { name: "Banan + masło orzechowe", kcal: 240, tag: "Przekąska", p: 6, c: 32, f: 10 },
  { name: "Power Bowl", kcal: 540, tag: "Obiad", p: 38, c: 58, f: 16 },
];

function AddMealSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (d: { name: string; items: string; kcal: number; slot: string; p?: number; c?: number; f?: number }) => void }) {
  const [slot, setSlot] = useState("Śniadanie");
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState<number | "">("");
  const [p, setP] = useState<number | "">("");
  const [c, setC] = useState<number | "">("");
  const [f, setF] = useState<number | "">("");
  const [query, setQuery] = useState("");
  const filtered = SUGGESTIONS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8 animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Dodaj posiłek</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>

        {/* Slot */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {["Śniadanie","Obiad","Kolacja","Przekąska"].map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={`rounded-full px-2 py-2 text-[11px] font-medium transition ${
                slot === s ? "bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] text-white" : "bg-white/5 text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj posiłku..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Suggestions */}
        <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
          {filtered.map((s) => (
            <button
              key={s.name}
              onClick={() => onAdd({ name: s.tag, items: s.name, kcal: s.kcal, slot, p: s.p, c: s.c, f: s.f })}
              className="flex w-full items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.tag} · B:{s.p}g · W:{s.c}g · T:{s.f}g</p>
              </div>
              <span className="text-xs font-semibold text-[var(--orange)]">+{s.kcal} kcal</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">Brak wyników — dodaj własny poniżej</p>
          )}
        </div>

        {/* Custom */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lub dodaj własny</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa posiłku"
            className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            type="number"
            value={kcal}
            onChange={(e) => setKcal(e.target.value ? parseInt(e.target.value) : "")}
            placeholder="Kalorie (kcal)"
            className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={p}
              onChange={(e) => setP(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="B (g)"
              className="rounded-2xl bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              type="number"
              value={c}
              onChange={(e) => setC(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="W (g)"
              className="rounded-2xl bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              type="number"
              value={f}
              onChange={(e) => setF(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="T (g)"
              className="rounded-2xl bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => {
              if (!name || !kcal) return;
              onAdd({
                name: slot, items: name, kcal: Number(kcal), slot,
                p: p ? Number(p) : undefined,
                c: c ? Number(c) : undefined,
                f: f ? Number(f) : undefined,
              });
            }}
            disabled={!name || !kcal}
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3 text-sm font-semibold text-background glow-primary transition disabled:opacity-40"
          >
            Dodaj do dziennika
          </button>
        </div>
      </div>
    </div>
  );
}
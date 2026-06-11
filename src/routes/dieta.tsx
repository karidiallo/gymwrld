import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ring } from "@/components/Ring";
import foodHero from "@/assets/food-hero.webp";
import { Plus, Coffee, UtensilsCrossed, Soup, Cookie, Droplet, X, Search, Trash2, Pencil, Minus, BookOpen, ChevronRight, Sparkles, Settings2 } from "lucide-react";
import { readLogs } from "@/lib/training-log";
import { readNutrition, writeNutrition, computeNutrition, type NutritionTarget } from "@/lib/nutrition";
import { BrandFooter } from "@/components/BrandLoader";

export const Route = createFileRoute("/dieta")({
  head: () => ({ meta: [{ title: "Dieta — GymWrld" }, { name: "description", content: "Twój dzienny plan żywieniowy." }] }),
  component: Dieta,
});

type Meal = { id: string; icon: string; name: string; items: string; kcal: number; p?: number; c?: number; f?: number };

function Dieta() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [nutriOpen, setNutriOpen] = useState(false);
  const [nutri, setNutri] = useState<NutritionTarget>({ kcal: 2400, p: 160, c: 280, f: 75 });
  const [water, setWater] = useState(0); // glasses out of 10 (250ml each => 2.5L cel)
  const [toilet, setToilet] = useState({ pee: 0, poop: 0 });
  const [meals, setMeals] = useState<Meal[]>([
    { id: "m1", icon: "coffee", name: "Śniadanie", items: "", kcal: 0 },
    { id: "m2", icon: "lunch", name: "Obiad", items: "", kcal: 0 },
    { id: "m3", icon: "soup", name: "Kolacja", items: "", kcal: 0 },
    { id: "m4", icon: "snack", name: "Przekąski", items: "", kcal: 0 },
  ]);
  const [burned, setBurned] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const n = readNutrition();
    if (n) setNutri(n);
    try {
      const raw = localStorage.getItem("gw_diet");
      if (raw) {
        const d = JSON.parse(raw);
        const today = new Date().toDateString();
        if (d.date === today) {
          if (typeof d.water === "number") setWater(d.water);
          if (d.toilet) setToilet(d.toilet);
        }
      }
    } catch {}
    const calc = () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const sum = readLogs().filter((l) => l.ts >= start.getTime()).reduce((s, l) => s + (l.kcal || 0), 0);
      setBurned(sum);
    };
    calc();
    window.addEventListener("gw_training_log_update", calc);
    const onNutri = () => { const n2 = readNutrition(); if (n2) setNutri(n2); };
    window.addEventListener("gw_nutrition_update", onNutri);
    return () => {
      window.removeEventListener("gw_training_log_update", calc);
      window.removeEventListener("gw_nutrition_update", onNutri);
    };
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("gw_diet", JSON.stringify({ date: new Date().toDateString(), water, toilet }));
  }, [water, toilet]);
  const eaten = meals.reduce((s, m) => s + m.kcal, 0);
  const goal = nutri.kcal;
  const remaining = goal - eaten;
  const waterMaxGlasses = 10;
  const waterLiters = (water * 0.25).toFixed(1);
  const waterGoal = 2.5;

  const macroEaten = meals.reduce((acc, m) => ({
    p: acc.p + (m.p ?? 0),
    c: acc.c + (m.c ?? 0),
    f: acc.f + (m.f ?? 0),
  }), { p: 0, c: 0, f: 0 });

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
        <div className="flex items-center gap-2">
          <Link to="/przepisy" className="rounded-full bg-white/5 px-3 py-2 text-xs font-medium ring-1 ring-white/10 hover:bg-white/10">
            <BookOpen className="inline h-3.5 w-3.5" /> Przepisy
          </Link>
          <button onClick={() => setOpen(true)} className="rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-3 py-2 text-xs font-medium text-white glow-primary">
            <Plus className="inline h-3.5 w-3.5" /> Posiłek
          </button>
        </div>
      </header>

      {/* Personalized target banner */}
      <button onClick={() => setNutriOpen(true)} className="mt-4 flex w-full items-center justify-between rounded-2xl glass p-3.5 text-left">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Twój cel · {goal} kcal / dzień</p>
            <p className="text-[11px] text-muted-foreground">B {nutri.p}g · W {nutri.c}g · T {nutri.f}g — kliknij, by dostosować</p>
          </div>
        </div>
        <Settings2 className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Food hero — links to recipe detail */}
      <Link to="/przepisy" search={{ id: "power-bowl" }} className="relative mt-5 block overflow-hidden rounded-3xl transition-transform active:scale-[0.99]">
        <img src={foodHero} alt="Power Bowl — przepis dnia" className="h-44 w-full object-cover" width={1280} height={896} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Polecane dziś · Przepis</p>
            <p className="font-display text-lg text-white">Power Bowl · 540 kcal</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--lime)]/90 px-3 py-1 text-[10px] font-semibold text-background">
            +45g białka <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </Link>

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
            <Row label="Spalone" value={`${burned} kcal`} muted />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3 text-center">
          <Macro label="Białko" value={macroEaten.p} goal={nutri.p} color="var(--magenta)" unit="g" />
          <Macro label="Węgle" value={macroEaten.c} goal={nutri.c} color="var(--orange)" unit="g" />
          <Macro label="Tłuszcze" value={macroEaten.f} goal={nutri.f} color="var(--lime)" unit="g" />
          <Macro label="Woda" value={Number(waterLiters)} goal={waterGoal} color="var(--violet)" unit="L" />
        </div>
      </section>

      {/* Meals */}
      <div className="mb-3 mt-7 flex items-end justify-between">
        <h3 className="text-lg font-semibold">Posiłki</h3>
        <Link to="/przepisy" className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--lime)]/20 to-[var(--orange)]/20 px-3 py-1.5 text-[11px] font-medium ring-1 ring-[var(--lime)]/30">
          <BookOpen className="h-3.5 w-3.5" /> Przepisy <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
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
      <PartnerAdSlot />
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
      {nutriOpen && (
        <NutritionSheet
          current={nutri}
          onClose={() => setNutriOpen(false)}
          onSave={(n) => { setNutri(n); writeNutrition(n); toast.success("Cel kalorii zaktualizowany"); setNutriOpen(false); }}
          onRecalc={() => {
            try {
              const p = JSON.parse(localStorage.getItem("gw_profile") || "{}");
              const b = JSON.parse(localStorage.getItem("gw_body") || "{}");
              const n = computeNutrition({ gender: p.gender, age: p.age, weight: b.weight, height: b.height, freq: p.freq, goals: p.goals });
              setNutri(n); writeNutrition(n);
              toast.success(`Przeliczono · ${n.kcal} kcal`);
            } catch { toast.error("Brakuje danych — uzupełnij wzrost/wagę w profilu"); }
          }}
        />
      )}
      <BrandFooter />
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

function PartnerAdSlot() {
  return (
    <div className="mt-4 overflow-hidden rounded-3xl ring-1 ring-[var(--lime)]/30 bg-gradient-to-br from-[var(--lime)]/15 via-[var(--orange)]/10 to-[var(--magenta)]/10 p-[1px]">
      <div className="flex items-center gap-3 rounded-[calc(1.5rem-1px)] bg-black/55 p-4 backdrop-blur-xl">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--lime)]/40 to-[var(--orange)]/40 text-2xl">
          🍫
        </div>
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--lime)]">Partner GymWRLD</p>
          <p className="mt-0.5 text-sm font-semibold leading-tight">
            -15% na batony proteinowe <span className="text-[var(--lime)]">BrandX</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Kod: <span className="font-mono text-foreground">GYMWRLD15</span> · ważne 7 dni</p>
        </div>
        <button className="rounded-full bg-white text-black px-3 py-1.5 text-[11px] font-semibold">Skorzystaj</button>
      </div>
      <p className="px-3 pb-2 pt-1 text-[9px] uppercase tracking-widest text-muted-foreground/60">Twoja reklama tutaj · partnerships@gymwrld.com</p>
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
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
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
        className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28 animate-in slide-in-from-bottom duration-300"
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
          <div className="h-24" />
        </div>
      </div>
    </div>
  );
}

function NutritionSheet({ current, onClose, onSave, onRecalc }: { current: NutritionTarget; onClose: () => void; onSave: (n: NutritionTarget) => void; onRecalc: () => void }) {
  const [kcal, setKcal] = useState<number | "">(current.kcal);
  const [p, setP] = useState<number | "">(current.p);
  const [c, setC] = useState<number | "">(current.c);
  const [f, setF] = useState<number | "">(current.f);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Twoje zapotrzebowanie</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Edytuj ręcznie lub przelicz AI na podstawie Twoich danych z profilu.</p>
        <button onClick={onRecalc} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--magenta)]/30 to-[var(--orange)]/30 px-3 py-1.5 text-[11px] font-medium ring-1 ring-[var(--orange)]/40">
          <Sparkles className="h-3 w-3" /> Przelicz AI z wagi/wzrostu
        </button>
        <div className="mt-4 space-y-2">
          <label className="block rounded-2xl bg-white/5 p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Kalorie / dzień (kcal)</span>
            <input type="number" value={kcal} onChange={(e) => setKcal(e.target.value ? parseInt(e.target.value) : "")} className="mt-1 w-full bg-transparent font-display text-3xl outline-none" />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="rounded-2xl bg-white/5 p-3">
              <span className="text-[10px] uppercase tracking-widest text-[var(--magenta)]">Białko (g)</span>
              <input type="number" value={p} onChange={(e) => setP(e.target.value ? parseInt(e.target.value) : "")} className="mt-1 w-full bg-transparent font-display text-2xl outline-none" />
            </label>
            <label className="rounded-2xl bg-white/5 p-3">
              <span className="text-[10px] uppercase tracking-widest text-[var(--orange)]">Węgle (g)</span>
              <input type="number" value={c} onChange={(e) => setC(e.target.value ? parseInt(e.target.value) : "")} className="mt-1 w-full bg-transparent font-display text-2xl outline-none" />
            </label>
            <label className="rounded-2xl bg-white/5 p-3">
              <span className="text-[10px] uppercase tracking-widest text-[var(--lime)]">Tłuszcz (g)</span>
              <input type="number" value={f} onChange={(e) => setF(e.target.value ? parseInt(e.target.value) : "")} className="mt-1 w-full bg-transparent font-display text-2xl outline-none" />
            </label>
          </div>
        </div>
        <button
          onClick={() => kcal && onSave({ kcal: Number(kcal), p: Number(p) || 0, c: Number(c) || 0, f: Number(f) || 0 })}
          disabled={!kcal}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary disabled:opacity-40"
        >
          Zapisz cele
        </button>
      </div>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import foodHero from "@/assets/food-hero.jpg";
import { ArrowLeft, Clock, Flame, Search, ChevronRight, Heart, Leaf, Beef, Sandwich, Soup, Cookie, Sparkles } from "lucide-react";

type RecipeCat = "all" | "sniadania" | "obiady" | "kolacje" | "przekaski" | "wege" | "bialkowe";

type Recipe = {
  id: string;
  title: string;
  kcal: number;
  time: number; // min
  cat: Exclude<RecipeCat, "all">;
  tags: string[];
  macro: { p: number; c: number; f: number };
  ingredients: string[];
  steps: string[];
  emoji: string;
};

const RECIPES: Recipe[] = [
  {
    id: "power-bowl", title: "Power Bowl", kcal: 540, time: 20, cat: "obiady",
    tags: ["high-protein", "bowl"], macro: { p: 45, c: 58, f: 14 }, emoji: "🥗",
    ingredients: ["150g piersi z kurczaka", "100g ryżu basmati (suchy)", "1/2 awokado", "100g brokuł", "1 łyżka oliwy", "Sezam, sól, pieprz"],
    steps: ["Ugotuj ryż al dente.", "Pierś przypraw, smaż 4 min z każdej strony.", "Brokuł na parze 5 min.", "Skomponuj miskę: ryż, kurczak, brokuł, awokado.", "Polej oliwą, posyp sezamem."],
  },
  { id: "owsianka-jagody", title: "Owsianka z jagodami", kcal: 380, time: 10, cat: "sniadania", tags: ["wege", "szybkie"], macro: { p: 14, c: 58, f: 9 }, emoji: "🥣",
    ingredients: ["60g płatków owsianych", "250ml mleka", "100g jagód", "1 łyżka masła orzechowego", "Miód, cynamon"],
    steps: ["Zagotuj mleko z owsianką, gotuj 5 min.", "Przełóż do miski.", "Dodaj jagody i masło orzechowe.", "Posyp cynamonem, polej miodem."] },
  { id: "omlet-warzywa", title: "Omlet z warzywami", kcal: 420, time: 12, cat: "sniadania", tags: ["bialkowe", "keto"], macro: { p: 28, c: 12, f: 28 }, emoji: "🍳",
    ingredients: ["3 jajka", "Pomidor", "Papryka", "Szczypiorek", "Oliwa", "Sól, pieprz"],
    steps: ["Roztrzep jajka.", "Podsmaż warzywa.", "Dodaj jajka, smaż 4 min.", "Podaj posypane szczypiorkiem."] },
  { id: "kurczak-ryz", title: "Kurczak z ryżem & brokułami", kcal: 620, time: 25, cat: "obiady", tags: ["bialkowe", "klasyk"], macro: { p: 52, c: 72, f: 12 }, emoji: "🍚",
    ingredients: ["200g kurczaka", "100g ryżu", "150g brokułów", "Sojowa, czosnek, imbir"],
    steps: ["Marynuj kurczaka w sojowej z czosnkiem.", "Smaż na patelni 8 min.", "Ryż ugotuj.", "Brokuły na parze.", "Złóż danie."] },
  { id: "losos-batat", title: "Łosoś z batatem", kcal: 580, time: 30, cat: "obiady", tags: ["omega-3"], macro: { p: 42, c: 56, f: 18 }, emoji: "🐟",
    ingredients: ["180g łososia", "1 batat", "Szpinak", "Cytryna, koper"],
    steps: ["Batat piecz 25 min w 200°C.", "Łosoś smaż 4 min z każdej strony.", "Szpinak podduś.", "Podaj z cytryną."] },
  { id: "sałatka-tunczyk", title: "Sałatka z tuńczykiem", kcal: 340, time: 8, cat: "kolacje", tags: ["light", "szybkie"], macro: { p: 32, c: 18, f: 16 }, emoji: "🥗",
    ingredients: ["Puszka tuńczyka", "Mix sałat", "Ogórek, pomidor", "Oliwki", "Oliwa, cytryna"],
    steps: ["Wymieszaj wszystkie składniki.", "Skrop oliwą i cytryną.", "Dopraw."] },
  { id: "twarog-miod", title: "Twaróg z miodem", kcal: 280, time: 3, cat: "kolacje", tags: ["bialkowe", "szybkie"], macro: { p: 28, c: 24, f: 6 }, emoji: "🧀",
    ingredients: ["200g chudego twarogu", "1 łyżka miodu", "Orzechy włoskie"],
    steps: ["Rozgnieć twaróg.", "Dodaj miód i orzechy."] },
  { id: "shake-bialko", title: "Shake białkowy", kcal: 220, time: 2, cat: "przekaski", tags: ["bialkowe", "post-workout"], macro: { p: 30, c: 12, f: 4 }, emoji: "🥤",
    ingredients: ["30g WPC", "250ml mleka", "Banan", "Lód"],
    steps: ["Wrzuć wszystko do shakera lub blendera.", "Wstrząśnij/zblenduj 30s."] },
  { id: "jogurt-orzechy", title: "Jogurt grecki + orzechy", kcal: 260, time: 2, cat: "przekaski", tags: ["bialkowe"], macro: { p: 18, c: 14, f: 14 }, emoji: "🥣",
    ingredients: ["150g jogurtu greckiego", "20g mieszanki orzechów", "Miód"],
    steps: ["Wymieszaj jogurt z orzechami i miodem."] },
  { id: "banan-orzechowe", title: "Banan + masło orzechowe", kcal: 240, time: 1, cat: "przekaski", tags: ["szybkie"], macro: { p: 6, c: 32, f: 10 }, emoji: "🍌",
    ingredients: ["1 banan", "1 łyżka masła orzechowego"],
    steps: ["Pokrój banana, posmaruj masłem."] },
  { id: "tofu-curry", title: "Tofu curry z kaszą", kcal: 510, time: 25, cat: "wege", tags: ["wege", "curry"], macro: { p: 28, c: 60, f: 16 }, emoji: "🍛",
    ingredients: ["200g tofu", "100g kaszy jaglanej", "Mleczko kokosowe", "Pasta curry", "Warzywa"],
    steps: ["Podsmaż tofu w paście curry.", "Dodaj warzywa i mleczko.", "Duś 10 min.", "Podaj z kaszą."] },
  { id: "wege-burger", title: "Wege burger z ciecierzycą", kcal: 460, time: 30, cat: "wege", tags: ["wege"], macro: { p: 22, c: 54, f: 14 }, emoji: "🍔",
    ingredients: ["Puszka ciecierzycy", "Cebula, czosnek", "Bułka pełnoziarnista", "Sałata, pomidor"],
    steps: ["Zmiksuj ciecierzycę z cebulą.", "Uformuj kotlety.", "Smaż po 4 min z każdej strony.", "Złóż burgera."] },
];

const CATS: { id: RecipeCat; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "Wszystkie", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "sniadania", label: "Śniadania", icon: <Soup className="h-3.5 w-3.5" /> },
  { id: "obiady", label: "Obiady", icon: <Beef className="h-3.5 w-3.5" /> },
  { id: "kolacje", label: "Kolacje", icon: <Sandwich className="h-3.5 w-3.5" /> },
  { id: "przekaski", label: "Przekąski", icon: <Cookie className="h-3.5 w-3.5" /> },
  { id: "wege", label: "Wege", icon: <Leaf className="h-3.5 w-3.5" /> },
  { id: "bialkowe", label: "Białkowe", icon: <Heart className="h-3.5 w-3.5" /> },
];

export const Route = createFileRoute("/przepisy")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({ meta: [{ title: "Przepisy — GymWrld" }, { name: "description", content: "Baza zdrowych przepisów z makro." }] }),
  component: Przepisy,
});

function Przepisy() {
  const { id } = Route.useSearch();
  const [cat, setCat] = useState<RecipeCat>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | undefined>(id);

  const list = useMemo(() => {
    return RECIPES.filter((r) => {
      if (cat === "bialkowe") return r.tags.includes("bialkowe");
      if (cat !== "all" && r.cat !== cat) return false;
      if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cat, q]);

  const open = RECIPES.find((r) => r.id === openId);

  return (
    <main className="px-5 pt-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl">
        <img src={foodHero} alt="Przepisy" className="h-44 w-full object-cover" width={1280} height={896} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
        <Link to="/dieta" className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full glass">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="absolute inset-x-5 bottom-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Baza · {RECIPES.length} przepisów</p>
          <h1 className="mt-1 font-display text-3xl text-white">Przepisy</h1>
          <p className="text-xs text-white/70">Zdrowe, szybkie, z makro</p>
        </div>
      </section>

      {/* Search */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj przepisu..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>

      {/* Category menu */}
      <div className="mt-4 -mx-5 overflow-x-auto px-5">
        <div className="flex gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
                cat === c.id ? "bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] text-white glow-primary" : "bg-white/5 text-muted-foreground"
              }`}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {list.map((r) => (
          <button
            key={r.id}
            onClick={() => setOpenId(r.id)}
            className="group overflow-hidden rounded-2xl glass text-left transition-transform active:scale-[0.98]"
          >
            <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-[var(--magenta)]/20 via-[var(--orange)]/15 to-[var(--lime)]/20 text-5xl">
              {r.emoji}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-medium">{r.title}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Flame className="h-3 w-3 text-[var(--orange)]" /> {r.kcal}</span>
                <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" /> {r.time} min</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground/80">
                <span className="text-[var(--magenta)]">B</span> {r.macro.p}g · <span className="text-[var(--orange)]">W</span> {r.macro.c}g · <span className="text-[var(--lime)]">T</span> {r.macro.f}g
              </p>
            </div>
          </button>
        ))}
        {list.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">Brak wyników.</p>}
      </div>
      <div className="h-24" />

      {open && <RecipeSheet recipe={open} onClose={() => setOpenId(undefined)} />}
    </main>
  );
}

function RecipeSheet({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] pb-10">
        <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--lime)]/30 text-7xl">
          {recipe.emoji}
        </div>
        <div className="px-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Przepis</p>
              <h2 className="font-display text-2xl">{recipe.title}</h2>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/5"><ChevronRight className="h-4 w-4 rotate-90" /></button>
          </div>
          <div className="mt-3 flex gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1"><Flame className="h-3 w-3 text-[var(--orange)]" /> {recipe.kcal} kcal</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1"><Clock className="h-3 w-3" /> {recipe.time} min</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Macro label="Białko" value={recipe.macro.p} color="var(--magenta)" />
            <Macro label="Węgle" value={recipe.macro.c} color="var(--orange)" />
            <Macro label="Tłuszcze" value={recipe.macro.f} color="var(--lime)" />
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Składniki</p>
            <ul className="mt-2 space-y-1.5">
              {recipe.ingredients.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--lime)]" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Przygotowanie</p>
            <ol className="mt-2 space-y-2">
              {recipe.steps.map((s, idx) => (
                <li key={idx} className="flex gap-3 rounded-xl bg-white/[0.03] p-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-[11px] font-semibold text-background">{idx + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-2">
      <p className="font-display text-lg" style={{ color }}>{value}g</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
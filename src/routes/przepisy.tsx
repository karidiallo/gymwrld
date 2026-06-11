import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import foodHero from "@/assets/food-hero.jpg";
import recipePowerBowl from "@/assets/recipe-power-bowl.jpg";
import recipeOwsianka from "@/assets/recipe-owsianka.jpg";
import recipeLosos from "@/assets/recipe-losos.jpg";
import recipeOmlet from "@/assets/recipe-omlet.jpg";
import { ArrowLeft, Clock, Flame, Search, ChevronRight, Heart, Leaf, Beef, Sandwich, Soup, Cookie, Sparkles, Globe2, ImageIcon, Camera, Star, Crown, Lock } from "lucide-react";

type RecipeCat = "all" | "sniadania" | "obiady" | "kolacje" | "przekaski" | "wege" | "bialkowe" | "wloska" | "azjatycka" | "meksykanska" | "srodziemnomorska" | "polska" | "keto" | "lowcarb" | "paleo" | "wegan" | "glutenfree" | "if";

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
  tier?: "pro" | "premium";
};

// Tylko zweryfikowane, ręcznie dopasowane zdjęcia. Reszta przepisów ma placeholder
// i CTA „prześlij swoje zdjęcie" do moderacji.
const RECIPE_IMAGES: Record<string, string> = {
  "power-bowl": recipePowerBowl,
  "owsianka-jagody": recipeOwsianka,
  "losos-batat": recipeLosos,
  "omlet-warzywa": recipeOmlet,
};

function recipeImage(recipe: Pick<Recipe, "id">): string | undefined {
  return RECIPE_IMAGES[recipe.id];
}

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
    tier: "pro",
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
    tier: "pro",
    ingredients: ["200g tofu", "100g kaszy jaglanej", "Mleczko kokosowe", "Pasta curry", "Warzywa"],
    steps: ["Podsmaż tofu w paście curry.", "Dodaj warzywa i mleczko.", "Duś 10 min.", "Podaj z kaszą."] },
  { id: "wege-burger", title: "Wege burger z ciecierzycą", kcal: 460, time: 30, cat: "wege", tags: ["wege"], macro: { p: 22, c: 54, f: 14 }, emoji: "🍔",
    ingredients: ["Puszka ciecierzycy", "Cebula, czosnek", "Bułka pełnoziarnista", "Sałata, pomidor"],
    steps: ["Zmiksuj ciecierzycę z cebulą.", "Uformuj kotlety.", "Smaż po 4 min z każdej strony.", "Złóż burgera."] },
  // —— więcej przekąsek
  { id: "edamame", title: "Edamame z solą morską", kcal: 180, time: 6, cat: "przekaski", tags: ["wege", "bialkowe"], macro: { p: 18, c: 14, f: 8 }, emoji: "🫛",
    ingredients: ["200g edamame", "Sól morska", "Sok z limonki"],
    steps: ["Zagotuj edamame 5 min.", "Posyp solą i skrop limonką."] },
  { id: "skyr-mango", title: "Skyr z mango", kcal: 230, time: 3, cat: "przekaski", tags: ["bialkowe"], macro: { p: 22, c: 28, f: 2 }, emoji: "🥭",
    ingredients: ["200g skyru", "1/2 mango", "Wiórki kokosowe"],
    steps: ["Wymieszaj skyr z mango.", "Posyp wiórkami."] },
  { id: "ryzowe-wafle", title: "Wafle ryżowe z twarożkiem", kcal: 210, time: 4, cat: "przekaski", tags: ["szybkie"], macro: { p: 18, c: 26, f: 4 }, emoji: "🍘",
    ingredients: ["2 wafle ryżowe", "100g twarożku", "Rzodkiewka, szczypiorek"],
    steps: ["Posmaruj wafle twarożkiem.", "Udekoruj rzodkiewką."] },
  // —— więcej wege
  { id: "buddha-bowl", title: "Buddha bowl", kcal: 520, time: 25, cat: "wege", tags: ["wege", "bowl"], macro: { p: 22, c: 68, f: 14 }, emoji: "🥙",
    ingredients: ["Komosa ryżowa", "Ciecierzyca", "Awokado", "Pieczone warzywa", "Tahini"],
    steps: ["Ugotuj komosę.", "Upiecz warzywa 20 min.", "Złóż bowl, polej tahini."] },
  { id: "soczewicowa", title: "Zupa z czerwonej soczewicy", kcal: 360, time: 25, cat: "wege", tags: ["wege"], macro: { p: 20, c: 48, f: 8 }, emoji: "🍲",
    ingredients: ["150g czerwonej soczewicy", "Marchew, cebula, czosnek", "Mleczko kokosowe", "Curry"],
    steps: ["Podsmaż warzywa.", "Dodaj soczewicę i bulion.", "Gotuj 20 min.", "Dolej mleczko, dopraw."] },
  // —— więcej białkowych
  { id: "wolowina-ryz", title: "Wołowina po orientalsku z ryżem", kcal: 580, time: 25, cat: "bialkowe", tags: ["bialkowe", "azjatycka"], macro: { p: 48, c: 60, f: 14 }, emoji: "🥩",
    tier: "premium",
    ingredients: ["200g wołowiny", "100g ryżu", "Brokuł", "Sos sojowy, czosnek, imbir"],
    steps: ["Marynuj wołowinę 10 min.", "Smaż 5 min na woku.", "Dodaj warzywa.", "Podaj z ryżem."] },
  { id: "indyk-quinoa", title: "Indyk z quinoa i szpinakiem", kcal: 520, time: 22, cat: "bialkowe", tags: ["bialkowe"], macro: { p: 50, c: 50, f: 10 }, emoji: "🦃",
    ingredients: ["200g indyka", "80g quinoa", "Szpinak, czosnek"],
    steps: ["Smaż indyka 6 min.", "Quinoa ugotuj.", "Szpinak podduś z czosnkiem."] },
  // —— Włoska
  { id: "pasta-pesto", title: "Makaron z pesto i kurczakiem", kcal: 620, time: 18, cat: "obiady", tags: ["wloska"], macro: { p: 42, c: 68, f: 18 }, emoji: "🍝",
    ingredients: ["100g makaronu pełnoziarnistego", "150g kurczaka", "2 łyżki pesto", "Pomidorki koktajlowe", "Parmezan"],
    steps: ["Ugotuj makaron al dente.", "Smaż kurczaka 6 min.", "Wymieszaj z pesto i pomidorkami."] },
  { id: "caprese", title: "Caprese z mozzarellą", kcal: 380, time: 5, cat: "kolacje", tags: ["wloska", "wege"], macro: { p: 22, c: 12, f: 28 }, emoji: "🍅",
    ingredients: ["Mozzarella di Bufala", "Pomidory", "Bazylia", "Oliwa extra vergine"],
    steps: ["Pokrój pomidory i mozzarellę.", "Ułóż naprzemiennie.", "Skrop oliwą, posyp bazylią."] },
  // —— Azjatycka
  { id: "ramen-light", title: "Ramen z kurczakiem", kcal: 540, time: 25, cat: "obiady", tags: ["azjatycka"], macro: { p: 38, c: 62, f: 14 }, emoji: "🍜",
    tier: "pro",
    ingredients: ["Makaron ramen", "150g kurczaka", "Bulion miso", "Jajko, szczypiorek, nori"],
    steps: ["Zagotuj bulion.", "Dodaj makaron.", "Włóż kurczaka i jajko.", "Posyp nori i szczypiorkiem."] },
  { id: "sushi-bowl", title: "Sushi bowl z łososiem", kcal: 580, time: 20, cat: "obiady", tags: ["azjatycka"], macro: { p: 38, c: 64, f: 18 }, emoji: "🍣",
    tier: "premium",
    ingredients: ["150g surowego łososia", "100g ryżu sushi", "Awokado, ogórek, edamame", "Sojowa, sezam"],
    steps: ["Ugotuj ryż.", "Pokrój łososia.", "Złóż bowl z warzywami i sosem."] },
  // —— Meksykańska
  { id: "burrito-bowl", title: "Burrito bowl", kcal: 640, time: 20, cat: "obiady", tags: ["meksykanska"], macro: { p: 42, c: 72, f: 18 }, emoji: "🌯",
    tier: "pro",
    ingredients: ["150g kurczaka", "Czarna fasola", "Ryż, kukurydza, salsa, guacamole"],
    steps: ["Smaż kurczaka z przyprawami Tex-Mex.", "Złóż bowl.", "Polej salsą i guacamole."] },
  { id: "tacos-fish", title: "Tacos z rybą", kcal: 480, time: 18, cat: "kolacje", tags: ["meksykanska"], macro: { p: 32, c: 48, f: 16 }, emoji: "🌮",
    ingredients: ["3 tortille kukurydziane", "180g białej ryby", "Kapusta pekińska, limonka, salsa"],
    steps: ["Smaż rybę 5 min.", "Złóż tacos: ryba, kapusta, salsa.", "Skrop limonką."] },
  // —— Śródziemnomorska
  { id: "grek-salad", title: "Sałatka grecka XL", kcal: 420, time: 8, cat: "kolacje", tags: ["srodziemnomorska", "wege"], macro: { p: 16, c: 24, f: 28 }, emoji: "🥗",
    ingredients: ["Pomidor, ogórek, papryka, oliwki", "Feta", "Cebula czerwona, oregano", "Oliwa"],
    steps: ["Pokrój warzywa.", "Dodaj fetę i oliwki.", "Polej oliwą, posyp oregano."] },
  { id: "hummus-pita", title: "Hummus z pitą i warzywami", kcal: 460, time: 10, cat: "obiady", tags: ["srodziemnomorska", "wege"], macro: { p: 18, c: 60, f: 16 }, emoji: "🫓",
    ingredients: ["150g hummusu", "2 pity pełnoziarniste", "Marchew, ogórek, papryka"],
    steps: ["Podgrzej pity.", "Pokrój warzywa.", "Podaj z hummusem."] },
  // —— Polska
  { id: "schab-kasza", title: "Schab pieczony z kaszą", kcal: 620, time: 40, cat: "obiady", tags: ["polska"], macro: { p: 48, c: 56, f: 18 }, emoji: "🍖",
    ingredients: ["200g schabu", "80g kaszy gryczanej", "Surówka z kapusty"],
    steps: ["Schab przypraw i piecz 30 min w 180°C.", "Ugotuj kaszę.", "Podaj z surówką."] },
  { id: "rosolek", title: "Rosół z makaronem", kcal: 340, time: 60, cat: "obiady", tags: ["polska"], macro: { p: 26, c: 38, f: 8 }, emoji: "🍜",
    ingredients: ["Mięso na rosół", "Włoszczyzna", "Makaron, natka pietruszki"],
    steps: ["Gotuj wywar 50 min.", "Dodaj makaron.", "Podaj z natką."] },
  // —— Keto / low-carb
  { id: "keto-stek", title: "Stek z masłem ziołowym & szpinakiem", kcal: 620, time: 18, cat: "obiady", tags: ["keto", "lowcarb", "bialkowe", "glutenfree"], macro: { p: 48, c: 4, f: 46 }, emoji: "🥩",
    ingredients: ["200g antrykotu", "Masło ziołowe", "Szpinak baby", "Czosnek, masło ghee"],
    steps: ["Stek na rozgrzanej patelni 2 min/strona.", "Odstaw 5 min.", "Szpinak podduś z czosnkiem.", "Podaj z masłem ziołowym."] },
  { id: "keto-jajka-awokado", title: "Jajka sadzone z awokado", kcal: 460, time: 8, cat: "sniadania", tags: ["keto", "lowcarb", "wege", "glutenfree"], macro: { p: 22, c: 8, f: 36 }, emoji: "🥑",
    ingredients: ["3 jajka", "1 awokado", "Pomidorki", "Masło ghee, sól, pieprz"],
    steps: ["Smaż jajka na ghee.", "Pokrój awokado.", "Złóż talerz."] },
  // —— Paleo
  { id: "paleo-kurczak", title: "Kurczak z warzywami z pieca", kcal: 520, time: 35, cat: "obiady", tags: ["paleo", "bialkowe", "glutenfree"], macro: { p: 46, c: 38, f: 18 }, emoji: "🍗",
    ingredients: ["200g kurczaka", "Batat, cukinia, papryka", "Oliwa, zioła prowansalskie"],
    steps: ["Warzywa pokrój, polej oliwą.", "Piecz 25 min w 200°C.", "Dodaj kurczaka na ostatnie 15 min."] },
  // —— Wegan
  { id: "wegan-tempeh", title: "Tempeh stir-fry z brokułami", kcal: 480, time: 18, cat: "wege", tags: ["wegan", "wege", "azjatycka", "bialkowe"], macro: { p: 30, c: 40, f: 18 }, emoji: "🥦",
    ingredients: ["180g tempehu", "Brokuł, papryka", "Sojowa, imbir, sezam", "Brązowy ryż 80g"],
    steps: ["Tempeh podsmaż na woku.", "Dodaj warzywa.", "Sos sojowy + imbir.", "Podaj z ryżem."] },
  { id: "wegan-soczewica-curry", title: "Curry z soczewicy", kcal: 480, time: 25, cat: "wege", tags: ["wegan", "wege", "glutenfree"], macro: { p: 22, c: 60, f: 14 }, emoji: "🍛",
    ingredients: ["150g czerwonej soczewicy", "Mleczko kokosowe", "Pomidor, cebula", "Pasta curry"],
    steps: ["Podsmaż cebulę z pastą.", "Dodaj soczewicę i mleczko.", "Gotuj 20 min."] },
  // —— Intermittent Fasting / break-fast
  { id: "if-break", title: "IF Break-fast bowl", kcal: 720, time: 15, cat: "obiady", tags: ["if", "bialkowe"], macro: { p: 52, c: 64, f: 24 }, emoji: "🥗",
    ingredients: ["200g kurczaka lub tofu", "100g ryżu", "Awokado", "Jajko, ogórek, edamame"],
    steps: ["Pierwszy posiłek po poście — duża porcja białka i tłuszczy.", "Złóż bowl z wszystkich składników."] },
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

const DIETS: { id: Extract<RecipeCat, "keto" | "lowcarb" | "paleo" | "wegan" | "glutenfree" | "if">; label: string; emoji: string; gradient: string }[] = [
  { id: "keto",       label: "Keto",          emoji: "🥑", gradient: "from-[#0a3b1a]/40 via-[var(--lime)]/20 to-[#1a3b2a]/40" },
  { id: "lowcarb",    label: "Low-carb",      emoji: "🥩", gradient: "from-[#3b0a0a]/40 via-[var(--orange)]/20 to-[#1a0a0a]/40" },
  { id: "paleo",      label: "Paleo",         emoji: "🍖", gradient: "from-[#2a1a05]/40 via-[var(--orange)]/15 to-[#3b1a0a]/40" },
  { id: "wegan",      label: "Wegańska",      emoji: "🌱", gradient: "from-[#0a3b1a]/40 via-[var(--lime)]/30 to-[#1a3b14]/40" },
  { id: "glutenfree", label: "Bezglutenowa",  emoji: "🌾", gradient: "from-[#1a1a05]/40 via-white/10 to-[#2a2010]/40" },
  { id: "if",         label: "IF / Post",     emoji: "⏱️", gradient: "from-[#1a0a3b]/40 via-[var(--magenta)]/20 to-[#0a0a2a]/40" },
];

const CUISINES: { id: Exclude<RecipeCat, "all" | "sniadania" | "obiady" | "kolacje" | "przekaski" | "wege" | "bialkowe">; label: string; emoji: string; gradient: string }[] = [
  { id: "wloska", label: "Włoska", emoji: "🇮🇹", gradient: "from-[#0c8e3a]/40 via-white/10 to-[#cd2026]/40" },
  { id: "azjatycka", label: "Azjatycka", emoji: "🥢", gradient: "from-[#cd2026]/40 via-[var(--orange)]/30 to-[#1a1a1a]/40" },
  { id: "meksykanska", label: "Meksykańska", emoji: "🌶️", gradient: "from-[#006847]/40 via-[var(--lime)]/30 to-[#ce1126]/40" },
  { id: "srodziemnomorska", label: "Śródziemnomorska", emoji: "🫒", gradient: "from-[#0072c6]/40 via-[var(--lime)]/20 to-[#ffd200]/40" },
  { id: "polska", label: "Polska", emoji: "🇵🇱", gradient: "from-white/20 via-white/5 to-[#dc143c]/40" },
];

export const Route = createFileRoute("/przepisy")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({ meta: [{ title: "Przepisy — GymWrld" }, { name: "description", content: "Baza zdrowych przepisów z makro." }] }),
  component: Przepisy,
});

function Przepisy() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [subscription] = useState<string>(() => {
    if (typeof window === "undefined") return "free";
    try {
      const raw = localStorage.getItem("gw_profile");
      return raw ? (JSON.parse(raw).subscription ?? "free") : "free";
    } catch { return "free"; }
  });
  const tierAllowed = (t?: "pro" | "premium") => {
    if (!t) return true;
    if (subscription === "premium") return true;
    if (subscription === "pro" && t === "pro") return true;
    return false;
  };
  const [cat, setCat] = useState<RecipeCat>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | undefined>(id);

  const list = useMemo(() => {
    return RECIPES.filter((r) => {
      if (cat === "bialkowe") return r.tags.includes("bialkowe");
      if (cat === "wloska" || cat === "azjatycka" || cat === "meksykanska" || cat === "srodziemnomorska" || cat === "polska") {
        return r.tags.includes(cat);
      }
      if (cat === "keto" || cat === "lowcarb" || cat === "paleo" || cat === "wegan" || cat === "glutenfree" || cat === "if") {
        return r.tags.includes(cat);
      }
      if (cat !== "all" && r.cat !== cat) return false;
      if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cat, q]);

  const open = RECIPES.find((r) => r.id === openId);
  const tryOpen = (r: Recipe) => {
    if (!tierAllowed(r.tier)) {
      toast(`Ten przepis wymaga ${r.tier === "premium" ? "Premium 👑" : "Pro ⭐"}`);
      navigate({ to: "/premium" });
      return;
    }
    setOpenId(r.id);
  };

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

      {/* Cuisines banners */}
      <div className="mt-5">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <Globe2 className="h-3 w-3" /> Kuchnie świata
        </p>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {CUISINES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`relative h-24 w-44 shrink-0 overflow-hidden rounded-2xl border text-left transition ${
                cat === c.id ? "border-[var(--lime)] ring-1 ring-[var(--lime)] glow-primary" : "border-white/10"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative flex h-full flex-col justify-between p-3">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/70">Kuchnia</p>
                  <p className="font-display text-base leading-tight text-white">{c.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Diets */}
      <div className="mt-5">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <Leaf className="h-3 w-3" /> Diety i style odżywiania
        </p>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {DIETS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`relative h-24 w-40 shrink-0 overflow-hidden rounded-2xl border text-left transition ${
                cat === c.id ? "border-[var(--lime)] ring-1 ring-[var(--lime)] glow-primary" : "border-white/10"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative flex h-full flex-col justify-between p-3">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/70">Dieta</p>
                  <p className="font-display text-base leading-tight text-white">{c.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {list.map((r) => (
          <button
            key={r.id}
            onClick={() => tryOpen(r)}
            className="group overflow-hidden rounded-2xl glass text-left transition-transform active:scale-[0.98]"
          >
            <div className="relative">
            {recipeImage(r) ? (
              <img src={recipeImage(r)} alt={r.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            ) : (
              <div className="grid aspect-[4/3] w-full place-items-center bg-gradient-to-br from-white/[0.04] to-white/[0.02] text-muted-foreground/60">
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[9px] uppercase tracking-widest">Brak zdjęcia</span>
                </div>
              </div>
            )}
            {r.tier && (
              <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                r.tier === "premium"
                  ? "bg-gradient-to-r from-[#facc15] to-[var(--orange)] text-background"
                  : "bg-white/90 text-background"
              }`}>
                {r.tier === "premium" ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                {r.tier === "premium" ? "Premium" : "Pro"}
              </span>
            )}
            {!tierAllowed(r.tier) && (
              <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
                <Lock className="h-6 w-6 text-white/90" />
              </div>
            )}
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
  const img = recipeImage(recipe);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] pb-10">
        {img ? (
          <img src={img} alt={recipe.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
        ) : (
          <div className="relative grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-[var(--magenta)]/15 via-[var(--orange)]/10 to-transparent">
            <div className="flex flex-col items-center gap-2 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Brak zdjęcia</p>
              <button
                onClick={(e) => { e.stopPropagation(); toast.success("Dzięki! Twoje zdjęcie trafi do moderacji ✨"); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium"
              >
                <Camera className="h-3 w-3" /> Prześlij swoje zdjęcie
              </button>
            </div>
          </div>
        )}
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
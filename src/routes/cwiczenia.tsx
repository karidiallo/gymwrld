import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import gymHero from "@/assets/gym-hero.jpg";
import { ArrowLeft, Search, Dumbbell, Target, AlertCircle, ChevronRight, Activity } from "lucide-react";

type EquipCat = "all" | "maszyny" | "hantle" | "kettle" | "sztanga" | "bodyweight" | "guma";

type Exercise = {
  id: string;
  name: string;
  cat: Exclude<EquipCat, "all">;
  muscles: string[];
  difficulty: "Łatwe" | "Średnie" | "Trudne";
  steps: string[];
  tips: string[];
  watch: string[]; // common mistakes
  emoji: string;
};

const EX: Exercise[] = [
  { id: "bp", name: "Wyciskanie sztangi leżąc", cat: "sztanga", muscles: ["Klatka", "Triceps", "Barki"], difficulty: "Średnie", emoji: "🏋️",
    steps: ["Połóż się na ławce, łopatki ściągnięte.", "Chwyt nieco szerszy od barków.", "Opuść sztangę kontrolnie do klatki.", "Wypchnij dynamicznie w górę bez blokowania łokci."],
    tips: ["Wdech podczas opuszczania, wydech przy wypchnięciu.", "Stopy mocno na podłodze.", "Asekuracja przy ciężkich seriach."],
    watch: ["Odbijanie sztangi od klatki.", "Łokcie zbyt szeroko (90°).", "Łukowate plecy w sposób niekontrolowany."] },
  { id: "sq", name: "Przysiad ze sztangą", cat: "sztanga", muscles: ["Nogi", "Pośladki", "Core"], difficulty: "Trudne", emoji: "🦵",
    steps: ["Sztanga na trapezach (back squat).", "Stopy na szerokość barków.", "Schodź w dół trzymając plecy proste.", "Biodra schodzą poniżej kolan.", "Wstań napierając piętami."],
    tips: ["Kolana w linii ze stopami.", "Klata wysoko, wzrok przed siebie.", "Oddech: wdech przed schodzeniem, wydech na wyjściu."],
    watch: ["Kolana do środka (valgus).", "Zaokrąglanie pleców na dole.", "Pięty odrywane od podłogi."] },
  { id: "dl", name: "Martwy ciąg", cat: "sztanga", muscles: ["Plecy", "Pośladki", "Nogi"], difficulty: "Trudne", emoji: "💪",
    steps: ["Sztanga przy goleniach, stopy na szerokość bioder.", "Chwyt na zewnątrz nóg.", "Biodra niżej niż barki, plecy proste.", "Wstań napierając podłogę nogami.", "W górnej fazie ściągnij łopatki."],
    tips: ["Sztanga blisko ciała przez cały ruch.", "Napięcie core.", "Buty płaskie."],
    watch: ["Zaokrąglone plecy.", "Sztanga oddala się od ciała.", "Hiperextenzja na górze."] },
  { id: "dbp", name: "Wyciskanie hantli na ławce", cat: "hantle", muscles: ["Klatka", "Triceps"], difficulty: "Średnie", emoji: "🏋️",
    steps: ["Hantle nad klatką, dłonie skierowane do przodu.", "Opuść kontrolnie do boków klatki.", "Wypchnij w górę, hantle stykają się lekko nad klatką."],
    tips: ["Większy zakres ruchu niż przy sztandze.", "Praca jednostronna stabilizatorów."],
    watch: ["Zbyt głębokie opuszczanie ze sztywnymi barkami."] },
  { id: "row", name: "Wiosłowanie hantlem", cat: "hantle", muscles: ["Plecy", "Biceps"], difficulty: "Łatwe", emoji: "🚣",
    steps: ["Jedno kolano na ławce.", "Hantel zwisa, plecy równolegle do podłogi.", "Pociągnij hantel do biodra ściągając łopatkę.", "Opuść kontrolnie."],
    tips: ["Łokieć blisko ciała.", "Skup się na pracy pleców, nie bicepsa."],
    watch: ["Rotacja tułowia.", "Pociąganie hantla siłą bicepsa."] },
  { id: "kbs", name: "Swing z kettlebellem", cat: "kettle", muscles: ["Tylny łańcuch", "Pośladki", "Core"], difficulty: "Średnie", emoji: "⚡",
    steps: ["Kettle przed sobą, stopy szerzej niż barki.", "Hip hinge — biodra do tyłu, kettle między nogami.", "Eksplozywnie wyprostuj biodra, kettle leci do wysokości oczu.", "Pozwól mu opaść z grawitacją."],
    tips: ["To nie przysiad — to hip hinge!", "Pośladki napięte na górze."],
    watch: ["Unoszenie kettla ramionami.", "Przysiadanie zamiast hip hinge.", "Hiperextenzja kręgosłupa."] },
  { id: "kbgs", name: "Goblet squat (kettle)", cat: "kettle", muscles: ["Nogi", "Pośladki"], difficulty: "Łatwe", emoji: "🦵",
    steps: ["Trzymaj kettle przed klatką.", "Klasyczny przysiad, łokcie między kolanami w dole."],
    tips: ["Świetny do nauki techniki przysiadu."],
    watch: ["Zaokrąglanie pleców."] },
  { id: "lp", name: "Wyciskanie nogami (suwnica)", cat: "maszyny", muscles: ["Nogi", "Pośladki"], difficulty: "Łatwe", emoji: "🦵",
    steps: ["Plecy mocno do oparcia.", "Stopy na platformie, na szerokość bioder.", "Opuść kontrolnie do 90° w kolanach.", "Wypchnij napierając piętami."],
    tips: ["Nie blokuj kolan w górze.", "Pełen zakres bezpieczny dla kolan."],
    watch: ["Odrywanie pośladków od siedziska.", "Stopy zbyt nisko na platformie."] },
  { id: "ld", name: "Ściąganie wyciągu górnego", cat: "maszyny", muscles: ["Plecy", "Biceps"], difficulty: "Łatwe", emoji: "🪢",
    steps: ["Chwyt nieco szerszy od barków.", "Pochyl tułów lekko do tyłu.", "Pociągnij drążek do górnej klatki.", "Kontrolnie wróć."],
    tips: ["Inicjuj ruch łopatkami.", "Łokcie ciągną w dół, nie ręce."],
    watch: ["Wymachiwanie tułowiem.", "Drążek za szyję (ryzyko barku)."] },
  { id: "pu", name: "Pompki", cat: "bodyweight", muscles: ["Klatka", "Triceps", "Core"], difficulty: "Łatwe", emoji: "🤸",
    steps: ["Pozycja deski, ręce pod barkami.", "Opuść klatkę kontrolnie do podłogi.", "Wypchnij do pozycji wyjściowej."],
    tips: ["Łokcie ~45° do tułowia.", "Ciało w linii prostej."],
    watch: ["Opadające biodra.", "Łokcie szeroko (90°)."] },
  { id: "pull", name: "Podciąganie na drążku", cat: "bodyweight", muscles: ["Plecy", "Biceps"], difficulty: "Trudne", emoji: "🪜",
    steps: ["Chwyt nachwytem, szerszy od barków.", "Zaciśnij łopatki, podciągnij brodę nad drążek.", "Opuść kontrolnie do pełnego wyprostu."],
    tips: ["Jak nie dajesz pełnego — użyj gumy oporowej."],
    watch: ["Bujanie ciała.", "Nieaktywne łopatki."] },
  { id: "plk", name: "Plank (deska)", cat: "bodyweight", muscles: ["Core"], difficulty: "Łatwe", emoji: "🧘",
    steps: ["Łokcie pod barkami.", "Ciało w linii prostej od głowy do pięt.", "Trzymaj 30-60s."],
    tips: ["Pośladki napięte.", "Oddychaj swobodnie."],
    watch: ["Opadające biodra lub uniesione."] },
  { id: "bx", name: "Band pull-apart (guma)", cat: "guma", muscles: ["Tylne barki", "Plecy"], difficulty: "Łatwe", emoji: "🎯",
    steps: ["Trzymaj gumę przed sobą, ramiona wyprostowane.", "Rozciągnij gumę aż dotknie klatki.", "Powrót kontrolnie."],
    tips: ["Świetne na rozgrzewkę barków."],
    watch: ["Wzruszanie barków."] },
];

const CATS: { id: EquipCat; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "Wszystkie", icon: <Activity className="h-3.5 w-3.5" /> },
  { id: "maszyny", label: "Maszyny", icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { id: "hantle", label: "Hantle", icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { id: "kettle", label: "Kettle", icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { id: "sztanga", label: "Sztanga", icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { id: "bodyweight", label: "Bodyweight", icon: <Activity className="h-3.5 w-3.5" /> },
  { id: "guma", label: "Gumy", icon: <Activity className="h-3.5 w-3.5" /> },
];

export const Route = createFileRoute("/cwiczenia")({
  head: () => ({ meta: [{ title: "Ćwiczenia — GymWrld" }, { name: "description", content: "Baza ćwiczeń z opisem techniki i typowymi błędami." }] }),
  component: Cwiczenia,
});

function Cwiczenia() {
  const [cat, setCat] = useState<EquipCat>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => EX.filter((e) => {
    if (cat !== "all" && e.cat !== cat) return false;
    if (q && !(e.name.toLowerCase().includes(q.toLowerCase()) || e.muscles.join(" ").toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [cat, q]);

  const open = EX.find((e) => e.id === openId);

  return (
    <main className="px-5 pt-6">
      <section className="relative overflow-hidden rounded-3xl">
        <img src={gymHero} alt="Ćwiczenia" className="h-44 w-full object-cover" width={1280} height={896} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
        <Link to="/trening" className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full glass">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="absolute inset-x-5 bottom-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Baza · {EX.length} ćwiczeń</p>
          <h1 className="mt-1 font-display text-3xl text-white">Ćwiczenia</h1>
          <p className="text-xs text-white/70">Technika · błędy · cele</p>
        </div>
      </section>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj ćwiczenia lub mięśnia..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>

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

      <div className="mt-5 space-y-2.5">
        {list.map((e) => (
          <button key={e.id} onClick={() => setOpenId(e.id)} className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left transition hover:bg-white/[0.04]">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--magenta)]/25 via-[var(--orange)]/15 to-[var(--lime)]/25 text-2xl">
              {e.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{e.name}</p>
              <p className="text-[11px] text-muted-foreground">{e.muscles.join(" · ")}</p>
              <div className="mt-1 flex gap-1.5">
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider">{e.difficulty}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider">{e.cat}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <div className="h-24" />

      {open && <ExerciseSheet ex={open} onClose={() => setOpenId(null)} />}
    </main>
  );
}

function ExerciseSheet({ ex, onClose }: { ex: Exercise; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--surface)] pb-10">
        <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--lime)]/30">
          <span className="text-7xl animate-bounce" style={{ animationDuration: "1.6s" }}>{ex.emoji}</span>
        </div>
        <div className="px-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Technika</p>
              <h2 className="font-display text-2xl">{ex.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{ex.muscles.join(" · ")} · {ex.difficulty}</p>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/5"><ChevronRight className="h-4 w-4 rotate-90" /></button>
          </div>

          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Jak wykonać</p>
            <ol className="mt-2 space-y-2">
              {ex.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-white/[0.03] p-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-[11px] font-semibold text-background">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--lime)]"><Target className="h-3 w-3" /> Wskazówki</p>
            <ul className="mt-2 space-y-1.5">
              {ex.tips.map((t, i) => <li key={i} className="rounded-xl bg-[var(--lime)]/10 px-3 py-2 text-sm">{t}</li>)}
            </ul>
          </div>

          <div className="mt-5">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--magenta)]"><AlertCircle className="h-3 w-3" /> Uważaj na</p>
            <ul className="mt-2 space-y-1.5">
              {ex.watch.map((t, i) => <li key={i} className="rounded-xl bg-[var(--magenta)]/10 px-3 py-2 text-sm">{t}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
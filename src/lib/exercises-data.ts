export type EquipCat = "maszyny" | "hantle" | "kettle" | "sztanga" | "bodyweight" | "guma";

export type ExerciseInfo = {
  id: string;
  name: string;
  cat: EquipCat;
  muscles: string[];
  difficulty: "Łatwe" | "Średnie" | "Trudne";
  steps: string[];
  tips: string[];
  watch: string[];
  emoji: string;
  /** Suggested rest in seconds based on intensity. */
  rest: number;
  /** Base recommended weight for a 75kg athletic adult man. */
  base?: { sets: number; reps: number; weight: number };
};

export const EXERCISES: ExerciseInfo[] = [
  { id: "bp", name: "Wyciskanie sztangi leżąc", cat: "sztanga", muscles: ["Klatka", "Triceps", "Barki"], difficulty: "Średnie", emoji: "🏋️", rest: 150, base: { sets: 4, reps: 8, weight: 70 },
    steps: ["Połóż się na ławce, łopatki ściągnięte.", "Chwyt nieco szerszy od barków.", "Opuść sztangę kontrolnie do klatki.", "Wypchnij dynamicznie w górę bez blokowania łokci."],
    tips: ["Wdech przy opuszczaniu, wydech przy wypchnięciu.", "Stopy mocno na podłodze.", "Asekuracja przy ciężkich seriach."],
    watch: ["Odbijanie sztangi od klatki.", "Łokcie zbyt szeroko (90°).", "Łukowate plecy w sposób niekontrolowany."] },
  { id: "sq", name: "Przysiad ze sztangą", cat: "sztanga", muscles: ["Nogi", "Pośladki", "Core"], difficulty: "Trudne", emoji: "🦵", rest: 180, base: { sets: 5, reps: 5, weight: 100 },
    steps: ["Sztanga na trapezach.", "Stopy na szerokość barków.", "Schodź trzymając plecy proste.", "Biodra niżej kolan.", "Wstań napierając piętami."],
    tips: ["Kolana w linii ze stopami.", "Klata wysoko.", "Wdech przed schodzeniem, wydech na wyjściu."],
    watch: ["Kolana do środka (valgus).", "Zaokrąglone plecy na dole.", "Pięty odrywane od podłogi."] },
  { id: "dl", name: "Martwy ciąg", cat: "sztanga", muscles: ["Plecy", "Pośladki", "Nogi"], difficulty: "Trudne", emoji: "💪", rest: 180, base: { sets: 4, reps: 5, weight: 120 },
    steps: ["Sztanga przy goleniach.", "Chwyt na zewnątrz nóg.", "Biodra niżej barków.", "Wstań napierając podłogę nogami.", "Ściągnij łopatki na górze."],
    tips: ["Sztanga blisko ciała.", "Napięcie core.", "Buty płaskie."],
    watch: ["Zaokrąglone plecy.", "Sztanga ucieka.", "Hiperextenzja na górze."] },
  { id: "ohp", name: "Wyciskanie żołnierskie", cat: "sztanga", muscles: ["Barki", "Triceps"], difficulty: "Średnie", emoji: "🏋️‍♂️", rest: 120, base: { sets: 4, reps: 8, weight: 40 },
    steps: ["Sztanga na klatce, chwyt szerokość barków.", "Wypchnij pionowo nad głowę.", "Opuść kontrolnie do klatki."],
    tips: ["Napięte pośladki i core.", "Głowa lekko z drogi sztangi."],
    watch: ["Wyginanie pleców.", "Łokcie zbyt z przodu."] },
  { id: "row", name: "Wiosłowanie sztangą", cat: "sztanga", muscles: ["Plecy", "Biceps"], difficulty: "Średnie", emoji: "🚣", rest: 120, base: { sets: 4, reps: 10, weight: 60 },
    steps: ["Pochyl tułów do 45°.", "Pociągnij sztangę do brzucha.", "Ściągnij łopatki.", "Opuść kontrolnie."],
    tips: ["Plecy proste przez cały ruch."],
    watch: ["Bujanie tułowiem.", "Pociąganie ramionami."] },
  { id: "dbp", name: "Wyciskanie hantli na ławce", cat: "hantle", muscles: ["Klatka", "Triceps"], difficulty: "Średnie", emoji: "🏋️", rest: 120, base: { sets: 4, reps: 10, weight: 24 },
    steps: ["Hantle nad klatką.", "Opuść kontrolnie.", "Wypchnij i ścisnij górę."],
    tips: ["Większy zakres niż sztanga."],
    watch: ["Zbyt głębokie opuszczanie."] },
  { id: "dbrow", name: "Wiosłowanie hantlem", cat: "hantle", muscles: ["Plecy", "Biceps"], difficulty: "Łatwe", emoji: "🚣", rest: 90, base: { sets: 3, reps: 12, weight: 20 },
    steps: ["Jedno kolano na ławce.", "Pociągnij hantel do biodra.", "Opuść kontrolnie."],
    tips: ["Łokieć blisko ciała."],
    watch: ["Rotacja tułowia."] },
  { id: "lat", name: "Wznosy bokiem", cat: "hantle", muscles: ["Barki"], difficulty: "Łatwe", emoji: "💪", rest: 60, base: { sets: 4, reps: 15, weight: 8 },
    steps: ["Hantle przy biodrach.", "Unieś bokiem do linii barków.", "Opuść kontrolnie."],
    tips: ["Lekkie ugięcie łokci."],
    watch: ["Wyrzucanie momentem."] },
  { id: "bic", name: "Uginanie hantli (biceps)", cat: "hantle", muscles: ["Biceps"], difficulty: "Łatwe", emoji: "💪", rest: 60, base: { sets: 3, reps: 12, weight: 14 },
    steps: ["Hantle wzdłuż ciała.", "Ugnij ramię, ścisnij biceps.", "Opuść kontrolnie."],
    tips: ["Łokcie przyklejone do tułowia."],
    watch: ["Bujanie."] },
  { id: "kbs", name: "Swing z kettlebellem", cat: "kettle", muscles: ["Pośladki", "Core"], difficulty: "Średnie", emoji: "⚡", rest: 75, base: { sets: 4, reps: 15, weight: 16 },
    steps: ["Hip hinge — biodra do tyłu.", "Eksplozywny wyprost bioder.", "Kontroluj powrót."],
    tips: ["To hip hinge, nie przysiad."],
    watch: ["Unoszenie ramionami."] },
  { id: "kbgs", name: "Goblet squat (kettle)", cat: "kettle", muscles: ["Nogi", "Pośladki"], difficulty: "Łatwe", emoji: "🦵", rest: 90, base: { sets: 3, reps: 12, weight: 20 },
    steps: ["Kettle przed klatką.", "Przysiad z łokciami między kolanami."],
    tips: ["Świetny do nauki techniki."],
    watch: ["Zaokrąglanie pleców."] },
  { id: "lp", name: "Wyciskanie nogami (suwnica)", cat: "maszyny", muscles: ["Nogi", "Pośladki"], difficulty: "Łatwe", emoji: "🦵", rest: 120, base: { sets: 4, reps: 12, weight: 120 },
    steps: ["Plecy do oparcia.", "Opuść do 90° w kolanach.", "Wypchnij piętami."],
    tips: ["Nie blokuj kolan."],
    watch: ["Pośladki uciekają."] },
  { id: "ld", name: "Ściąganie wyciągu górnego", cat: "maszyny", muscles: ["Plecy"], difficulty: "Łatwe", emoji: "🪢", rest: 90, base: { sets: 4, reps: 10, weight: 55 },
    steps: ["Chwyt szerszy niż barki.", "Pociągnij drążek do górnej klatki."],
    tips: ["Inicjuj łopatkami."],
    watch: ["Wymachiwanie tułowiem."] },
  { id: "leg-curl", name: "Uginanie nóg leżąc", cat: "maszyny", muscles: ["Dwugłowe ud"], difficulty: "Łatwe", emoji: "🦵", rest: 75, base: { sets: 3, reps: 12, weight: 35 },
    steps: ["Połóż się, kostki pod wałkiem.", "Ugnij kolana ciągnąc piętami."],
    tips: ["Kontroluj fazę ekscentryczną."],
    watch: ["Odrywanie bioder."] },
  { id: "cab-fly", name: "Krzyżowanie wyciągów", cat: "maszyny", muscles: ["Klatka"], difficulty: "Średnie", emoji: "🪢", rest: 75, base: { sets: 3, reps: 12, weight: 15 },
    steps: ["Stań pomiędzy wyciągami.", "Sprowadź ramiona przed sobą.", "Ścisnij klatkę."],
    tips: ["Lekko ugięte łokcie stałe."],
    watch: ["Praca ramionami zamiast klatką."] },
  { id: "pu", name: "Pompki", cat: "bodyweight", muscles: ["Klatka", "Triceps", "Core"], difficulty: "Łatwe", emoji: "🤸", rest: 60, base: { sets: 4, reps: 15, weight: 0 },
    steps: ["Pozycja deski, ręce pod barkami.", "Opuść klatkę.", "Wypchnij."],
    tips: ["Łokcie ~45°."],
    watch: ["Opadające biodra."] },
  { id: "pull", name: "Podciąganie na drążku", cat: "bodyweight", muscles: ["Plecy", "Biceps"], difficulty: "Trudne", emoji: "🪜", rest: 120, base: { sets: 4, reps: 8, weight: 0 },
    steps: ["Chwyt nachwytem.", "Podciągnij brodę nad drążek.", "Opuść kontrolnie."],
    tips: ["Aktywne łopatki."],
    watch: ["Bujanie ciała."] },
  { id: "dips", name: "Dipy na poręczach", cat: "bodyweight", muscles: ["Klatka", "Triceps"], difficulty: "Średnie", emoji: "🤸", rest: 90, base: { sets: 3, reps: 10, weight: 0 },
    steps: ["Wesprzyj się na poręczach.", "Opuść aż barki ~90°.", "Wypchnij w górę."],
    tips: ["Lekkie pochylenie = więcej klatki."],
    watch: ["Zbyt głębokie zejście."] },
  { id: "plk", name: "Plank (deska)", cat: "bodyweight", muscles: ["Core"], difficulty: "Łatwe", emoji: "🧘", rest: 45, base: { sets: 3, reps: 45, weight: 0 },
    steps: ["Łokcie pod barkami.", "Ciało w linii.", "Trzymaj 30–60s."],
    tips: ["Pośladki napięte."],
    watch: ["Opadające biodra."] },
  { id: "lng", name: "Wykroki", cat: "bodyweight", muscles: ["Nogi", "Pośladki"], difficulty: "Łatwe", emoji: "🚶", rest: 60, base: { sets: 3, reps: 12, weight: 0 },
    steps: ["Krok w przód, ugnij oba kolana.", "Wstań napierając piętą."],
    tips: ["Tułów wyprostowany."],
    watch: ["Kolano przed palcami."] },
  { id: "ht", name: "Hip thrust", cat: "sztanga", muscles: ["Pośladki"], difficulty: "Średnie", emoji: "🍑", rest: 120, base: { sets: 4, reps: 10, weight: 60 },
    steps: ["Łopatki na ławce, sztanga na biodrach.", "Wypchnij biodra w górę.", "Ścisnij pośladki."],
    tips: ["Broda przy klatce."],
    watch: ["Hiperextenzja lędźwi."] },
  { id: "bx", name: "Band pull-apart (guma)", cat: "guma", muscles: ["Tylne barki"], difficulty: "Łatwe", emoji: "🎯", rest: 45, base: { sets: 3, reps: 15, weight: 0 },
    steps: ["Guma przed sobą.", "Rozciągnij do klatki."],
    tips: ["Dobre na rozgrzewkę."],
    watch: ["Wzruszanie barków."] },
  { id: "rdl", name: "Rumuński martwy ciąg (RDL)", cat: "sztanga", muscles: ["Dwugłowe ud", "Pośladki"], difficulty: "Średnie", emoji: "🦵", rest: 120, base: { sets: 4, reps: 8, weight: 80 },
    steps: ["Sztanga w rękach, biodra do tyłu (hip hinge).", "Opuszczaj sztangę wzdłuż nóg do połowy goleni.", "Wróć napinając pośladki."],
    tips: ["Lekko ugięte kolana — nie przysiad.", "Plecy proste i napięte.", "Hantle to alternatywa dla RDL."],
    watch: ["Zaokrąglone plecy.", "Pełne ugięcie kolan.", "Sztanga ucieka od ciała."] },
  { id: "bss", name: "Bulgarian Split Squat", cat: "hantle", muscles: ["Quady", "Pośladki"], difficulty: "Średnie", emoji: "🦵", rest: 90, base: { sets: 3, reps: 10, weight: 16 },
    steps: ["Tylna noga na ławce za sobą.", "Przysiad na przedniej nodze do 90°.", "Wstań napierając piętą."],
    tips: ["Jednostronny — wyrównuje dysproporcje.", "Tułów lekko pochylony."],
    watch: ["Kolano przed palcami stopy.", "Pięta odrywana od podłogi."] },
  { id: "fp", name: "Face pull (wyciąg)", cat: "maszyny", muscles: ["Tylne barki", "Górne plecy"], difficulty: "Łatwe", emoji: "🪢", rest: 60, base: { sets: 3, reps: 15, weight: 20 },
    steps: ["Lina wyciągu na wysokości twarzy.", "Pociągnij ku skroniom z rotacją zewnętrzną.", "Ścisnij łopatki."],
    tips: ["Złoty standard dla zdrowych barków."],
    watch: ["Zbyt duży ciężar = brak rotacji."] },
  { id: "trip", name: "Wyciskanie linki (triceps)", cat: "maszyny", muscles: ["Triceps"], difficulty: "Łatwe", emoji: "💪", rest: 60, base: { sets: 3, reps: 12, weight: 20 },
    steps: ["Lina/sztangielka u góry wyciągu.", "Łokcie przy tułowiu.", "Wyprostuj ramiona w dół."],
    tips: ["Łokcie nieruchome — pracuje tylko przedramię."],
    watch: ["Bujanie tułowiem."] },
  { id: "calf", name: "Wspięcia na palce", cat: "maszyny", muscles: ["Łydki"], difficulty: "Łatwe", emoji: "🦶", rest: 60, base: { sets: 4, reps: 15, weight: 40 },
    steps: ["Stopy na podeście, pięty w dół.", "Unieś się maksymalnie na palcach.", "Opuść kontrolnie pod parter."],
    tips: ["Pełen zakres ruchu = wzrost."],
    watch: ["Bujanie kolanami."] },
  { id: "row-cab", name: "Wiosłowanie wyciągiem siedząc", cat: "maszyny", muscles: ["Plecy", "Biceps"], difficulty: "Łatwe", emoji: "🪢", rest: 90, base: { sets: 4, reps: 10, weight: 50 },
    steps: ["Uchwyt wąski.", "Pociągnij do pępka.", "Ścisnij łopatki."],
    tips: ["Tułów stabilny, pracują plecy."],
    watch: ["Wychylanie tułowia."] },
  { id: "hang", name: "Wisy / scapular pulls", cat: "bodyweight", muscles: ["Plecy", "Chwyt"], difficulty: "Łatwe", emoji: "🪢", rest: 60, base: { sets: 3, reps: 30, weight: 0 },
    steps: ["Zwisnij na drążku.", "Aktywuj łopatki bez zginania łokci."],
    tips: ["Świetne na barki i chwyt — baza pod podciągnięcia."],
    watch: ["Bujanie."] },
];

export const EQUIP_LABEL: Record<EquipCat, string> = {
  maszyny: "Maszyny", hantle: "Hantle", kettle: "Kettle", sztanga: "Sztanga", bodyweight: "Masa ciała", guma: "Gumy",
};

/** AI-style heuristic: scale base for user. */
export function recommendForUser(
  base: { sets: number; reps: number; weight: number },
  profile: { gender?: "m" | "k" | "nb"; weight?: number; level?: "poczatkujacy" | "sredni" | "zaawansowany" },
): { sets: number; reps: number; weight: number } {
  const bw = profile.weight ?? 75;
  const gF = profile.gender === "k" ? 0.55 : profile.gender === "nb" ? 0.78 : 1;
  const lF = profile.level === "poczatkujacy" ? 0.7 : profile.level === "zaawansowany" ? 1.15 : 0.9;
  const bF = Math.max(0.6, Math.min(1.3, bw / 75));
  const w = base.weight === 0 ? 0 : Math.max(2.5, Math.round((base.weight * gF * lF * bF) / 2.5) * 2.5);
  const reps = profile.level === "poczatkujacy" ? base.reps + 2 : profile.level === "zaawansowany" ? Math.max(4, base.reps - 1) : base.reps;
  return { sets: base.sets, reps, weight: w };
}

/** AI rest timer: scales suggested rest with user level. */
export function recommendRest(baseRest: number, level?: "poczatkujacy" | "sredni" | "zaawansowany"): number {
  if (level === "poczatkujacy") return Math.round(baseRest * 1.15);
  if (level === "zaawansowany") return Math.round(baseRest * 0.9);
  return baseRest;
}
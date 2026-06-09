export type NutritionTarget = { kcal: number; p: number; c: number; f: number };

const KEY = "gw_nutrition";

/** Mifflin–St Jeor BMR × activity × goal adjustment. */
export function computeNutrition(opts: {
  gender?: "m" | "k" | "nb" | null;
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  freq?: number; // sessions / week
  goals?: string[];
}): NutritionTarget {
  const w = Number(opts.weight) || 70;
  const h = Number(opts.height) || 175;
  const a = Number(opts.age) || 25;
  const base = 10 * w + 6.25 * h - 5 * a;
  const bmr = opts.gender === "k" ? base - 161 : base + 5;
  const freq = Number(opts.freq) || 3;
  const activity = freq <= 2 ? 1.375 : freq <= 4 ? 1.55 : freq <= 6 ? 1.725 : 1.9;
  let tdee = bmr * activity;
  const goals = opts.goals ?? [];
  let adj = 0;
  if (goals.includes("masa")) adj += 350;
  if (goals.includes("redukcja")) adj -= 450;
  // kondycja / zdrowie: no adjustment
  tdee += adj;
  const kcal = Math.max(1200, Math.round(tdee / 10) * 10);
  const protein = Math.round(w * (goals.includes("masa") ? 2.2 : 2));
  const fat = Math.round(w * 0.9);
  const carbs = Math.max(80, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, p: protein, c: carbs, f: fat };
}

export function readNutrition(): NutritionTarget | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function writeNutrition(n: NutritionTarget) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(n));
  window.dispatchEvent(new Event("gw_nutrition_update"));
}
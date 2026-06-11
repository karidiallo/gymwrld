/**
 * Routines library — per-plan exercise programming.
 *
 * Keyed by plan title (matches the title in trening.tsx plans dict).
 * Each routine references libId from EXERCISES so we get emojis, rest hints
 * and rep recommendations scaled by user profile via recommendForUser().
 */

export type RoutineExercise = {
  libId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restSec: number;
};

export const ROUTINES: Record<string, RoutineExercise[]> = {
  // SIŁOWNIA — klasyczne splity
  "Push Day · Klatka, barki": [
    { libId: "bp",  name: "Wyciskanie sztangi leżąc",  sets: 4, reps: 8,  weight: 70, restSec: 150 },
    { libId: "ohp", name: "Wyciskanie żołnierskie",    sets: 4, reps: 8,  weight: 40, restSec: 120 },
    { libId: "dbp", name: "Wyciskanie hantli",         sets: 3, reps: 12, weight: 24, restSec: 90 },
    { libId: "lat", name: "Wznosy bokiem",             sets: 4, reps: 15, weight: 10, restSec: 60 },
    { libId: "trip", name: "Wyciskanie linki (triceps)", sets: 3, reps: 12, weight: 25, restSec: 60 },
  ],
  "Pull Day · Plecy, biceps": [
    { libId: "pull", name: "Podciąganie na drążku",    sets: 4, reps: 8,  weight: 0,  restSec: 120 },
    { libId: "row",  name: "Wiosłowanie sztangą",      sets: 4, reps: 10, weight: 60, restSec: 120 },
    { libId: "ld",   name: "Ściąganie wyciągu górnego", sets: 3, reps: 10, weight: 55, restSec: 90 },
    { libId: "row-cab", name: "Wiosłowanie wyciągiem siedząc", sets: 3, reps: 10, weight: 50, restSec: 90 },
    { libId: "fp",   name: "Face pull (wyciąg)",       sets: 3, reps: 15, weight: 20, restSec: 60 },
    { libId: "bic",  name: "Uginanie hantli (biceps)", sets: 3, reps: 12, weight: 14, restSec: 60 },
  ],
  "Leg Day · Hipertrofia": [
    { libId: "sq",   name: "Przysiad ze sztangą",      sets: 5, reps: 6,  weight: 100, restSec: 180 },
    { libId: "rdl",  name: "Rumuński martwy ciąg",     sets: 4, reps: 8,  weight: 80,  restSec: 150 },
    { libId: "lp",   name: "Wyciskanie nogami",        sets: 4, reps: 12, weight: 120, restSec: 120 },
    { libId: "bss",  name: "Bulgarian Split Squat",    sets: 3, reps: 10, weight: 16,  restSec: 90 },
    { libId: "leg-curl", name: "Uginanie nóg leżąc",   sets: 3, reps: 12, weight: 35,  restSec: 75 },
    { libId: "calf", name: "Wspięcia na palce",        sets: 4, reps: 15, weight: 40,  restSec: 60 },
  ],
  "Full Body siła": [
    { libId: "sq",  name: "Przysiad ze sztangą",     sets: 4, reps: 6, weight: 100, restSec: 180 },
    { libId: "bp",  name: "Wyciskanie sztangi leżąc", sets: 4, reps: 6, weight: 70,  restSec: 150 },
    { libId: "dl",  name: "Martwy ciąg",             sets: 3, reps: 5, weight: 120, restSec: 180 },
    { libId: "ohp", name: "Wyciskanie żołnierskie",  sets: 3, reps: 8, weight: 40,  restSec: 120 },
    { libId: "pull", name: "Podciąganie na drążku",  sets: 3, reps: 8, weight: 0,   restSec: 120 },
    { libId: "plk", name: "Plank (deska)",           sets: 3, reps: 45, weight: 0,  restSec: 45 },
  ],
  "Upper / Lower · Split A": [
    { libId: "bp",  name: "Wyciskanie sztangi leżąc", sets: 4, reps: 8, weight: 70, restSec: 150 },
    { libId: "row", name: "Wiosłowanie sztangą",      sets: 4, reps: 10, weight: 60, restSec: 120 },
    { libId: "ohp", name: "Wyciskanie żołnierskie",   sets: 3, reps: 8, weight: 40, restSec: 120 },
    { libId: "ld",  name: "Ściąganie wyciągu górnego", sets: 3, reps: 10, weight: 55, restSec: 90 },
    { libId: "bic", name: "Uginanie hantli (biceps)", sets: 3, reps: 12, weight: 14, restSec: 60 },
    { libId: "trip", name: "Wyciskanie linki (triceps)", sets: 3, reps: 12, weight: 25, restSec: 60 },
  ],

  // KOBIETY — focus pośladki, talia, ogólna tonacja
  "Glute Builder · Pośladki & nogi": [
    { libId: "ht",  name: "Hip thrust",               sets: 4, reps: 10, weight: 60, restSec: 120 },
    { libId: "rdl", name: "Rumuński martwy ciąg",     sets: 4, reps: 10, weight: 50, restSec: 120 },
    { libId: "bss", name: "Bulgarian Split Squat",    sets: 3, reps: 12, weight: 12, restSec: 90 },
    { libId: "kbgs", name: "Goblet squat",            sets: 3, reps: 12, weight: 16, restSec: 90 },
    { libId: "kbs", name: "Swing z kettlebellem",     sets: 4, reps: 15, weight: 12, restSec: 75 },
    { libId: "lng", name: "Wykroki",                  sets: 3, reps: 12, weight: 0,  restSec: 60 },
  ],
  "Hourglass · Talia & brzuch": [
    { libId: "plk", name: "Plank (deska)",            sets: 4, reps: 45, weight: 0, restSec: 45 },
    { libId: "ht",  name: "Hip thrust",               sets: 3, reps: 12, weight: 40, restSec: 90 },
    { libId: "kbs", name: "Swing z kettlebellem",     sets: 3, reps: 20, weight: 10, restSec: 60 },
    { libId: "lat", name: "Wznosy bokiem",            sets: 3, reps: 15, weight: 6,  restSec: 45 },
    { libId: "ld",  name: "Ściąganie wyciągu górnego", sets: 3, reps: 12, weight: 30, restSec: 75 },
    { libId: "lng", name: "Wykroki",                  sets: 3, reps: 12, weight: 0,  restSec: 60 },
  ],
  "Total Tone · Spalanie & ujędrnianie": [
    { libId: "kbgs", name: "Goblet squat",            sets: 4, reps: 15, weight: 14, restSec: 60 },
    { libId: "ht",  name: "Hip thrust",               sets: 4, reps: 12, weight: 40, restSec: 75 },
    { libId: "lng", name: "Wykroki",                  sets: 3, reps: 12, weight: 0,  restSec: 45 },
    { libId: "pu",  name: "Pompki",                   sets: 3, reps: 10, weight: 0,  restSec: 45 },
    { libId: "dbrow", name: "Wiosłowanie hantlem",    sets: 3, reps: 12, weight: 12, restSec: 60 },
    { libId: "plk", name: "Plank (deska)",            sets: 3, reps: 40, weight: 0,  restSec: 45 },
  ],

  // REDUKCJA — circuits, HIIT, krótki rest
  "HIIT Burn · Intensywne spalanie": [
    { libId: "kbs",  name: "Swing z kettlebellem",    sets: 5, reps: 20, weight: 16, restSec: 30 },
    { libId: "kbgs", name: "Goblet squat",            sets: 5, reps: 15, weight: 16, restSec: 30 },
    { libId: "pu",   name: "Pompki",                  sets: 5, reps: 15, weight: 0,  restSec: 30 },
    { libId: "lng",  name: "Wykroki",                 sets: 5, reps: 12, weight: 0,  restSec: 30 },
    { libId: "plk",  name: "Plank (deska)",           sets: 5, reps: 30, weight: 0,  restSec: 30 },
  ],
  "Cardio Strength Mix": [
    { libId: "sq",   name: "Przysiad ze sztangą",     sets: 4, reps: 12, weight: 60, restSec: 60 },
    { libId: "bp",   name: "Wyciskanie sztangi leżąc", sets: 4, reps: 12, weight: 50, restSec: 60 },
    { libId: "row",  name: "Wiosłowanie sztangą",     sets: 3, reps: 12, weight: 50, restSec: 60 },
    { libId: "kbs",  name: "Swing z kettlebellem",    sets: 4, reps: 20, weight: 12, restSec: 45 },
    { libId: "plk",  name: "Plank (deska)",           sets: 3, reps: 45, weight: 0,  restSec: 30 },
  ],
  "Fat Loss Circuit": [
    { libId: "kbgs", name: "Goblet squat",            sets: 4, reps: 15, weight: 14, restSec: 30 },
    { libId: "pu",   name: "Pompki",                  sets: 4, reps: 12, weight: 0,  restSec: 30 },
    { libId: "dbrow", name: "Wiosłowanie hantlem",    sets: 4, reps: 12, weight: 14, restSec: 30 },
    { libId: "lng",  name: "Wykroki",                 sets: 4, reps: 12, weight: 0,  restSec: 30 },
    { libId: "plk",  name: "Plank (deska)",           sets: 4, reps: 40, weight: 0,  restSec: 30 },
  ],

  // DOM — bodyweight + minimal sprzęt
  "Kalistenika full body": [
    { libId: "pu",   name: "Pompki",                  sets: 4, reps: 15, weight: 0, restSec: 60 },
    { libId: "pull", name: "Podciąganie na drążku",   sets: 4, reps: 8,  weight: 0, restSec: 120 },
    { libId: "dips", name: "Dipy na poręczach",       sets: 3, reps: 10, weight: 0, restSec: 90 },
    { libId: "lng",  name: "Wykroki",                 sets: 3, reps: 12, weight: 0, restSec: 60 },
    { libId: "plk",  name: "Plank (deska)",           sets: 3, reps: 60, weight: 0, restSec: 45 },
  ],
  "Mobility & rozciąganie": [
    { libId: "bx",   name: "Band pull-apart (guma)",  sets: 3, reps: 15, weight: 0, restSec: 30 },
    { libId: "hang", name: "Wisy / scapular pulls",   sets: 3, reps: 30, weight: 0, restSec: 60 },
    { libId: "plk",  name: "Plank (deska)",           sets: 3, reps: 45, weight: 0, restSec: 30 },
    { libId: "lng",  name: "Wykroki",                 sets: 3, reps: 10, weight: 0, restSec: 30 },
  ],
  "Trening funkcjonalny": [
    { libId: "kbs",  name: "Swing z kettlebellem",    sets: 4, reps: 20, weight: 16, restSec: 60 },
    { libId: "kbgs", name: "Goblet squat",            sets: 4, reps: 15, weight: 16, restSec: 60 },
    { libId: "pu",   name: "Pompki",                  sets: 4, reps: 15, weight: 0,  restSec: 45 },
    { libId: "dbrow", name: "Wiosłowanie hantlem",    sets: 4, reps: 12, weight: 16, restSec: 60 },
    { libId: "plk",  name: "Plank (deska)",           sets: 3, reps: 60, weight: 0,  restSec: 45 },
  ],

  // KALISTENIKA — drążek, poręcze, skill
  "Push-Pull · Drążek i poręcze": [
    { libId: "pull", name: "Podciąganie na drążku",   sets: 5, reps: 8,  weight: 0, restSec: 120 },
    { libId: "dips", name: "Dipy na poręczach",       sets: 5, reps: 10, weight: 0, restSec: 120 },
    { libId: "pu",   name: "Pompki",                  sets: 4, reps: 15, weight: 0, restSec: 60 },
    { libId: "hang", name: "Wisy / scapular pulls",   sets: 3, reps: 30, weight: 0, restSec: 60 },
    { libId: "plk",  name: "Plank (deska)",           sets: 3, reps: 60, weight: 0, restSec: 45 },
  ],
  "Skill Work · Muscle-up, planche": [
    { libId: "pull", name: "Podciąganie eksplozywne",  sets: 6, reps: 5, weight: 0, restSec: 180 },
    { libId: "dips", name: "Dipy głębokie",            sets: 5, reps: 8, weight: 0, restSec: 150 },
    { libId: "pu",   name: "Pseudo-planche pompki",    sets: 4, reps: 8, weight: 0, restSec: 120 },
    { libId: "plk",  name: "Hollow body hold",         sets: 4, reps: 30, weight: 0, restSec: 60 },
  ],
  "Core & Lever · Front lever": [
    { libId: "hang", name: "Tuck front lever holds",   sets: 5, reps: 10, weight: 0, restSec: 90 },
    { libId: "pull", name: "Podciąganie z aktywną łopatką", sets: 4, reps: 6, weight: 0, restSec: 120 },
    { libId: "plk",  name: "L-sit hold",               sets: 4, reps: 20, weight: 0, restSec: 90 },
    { libId: "plk",  name: "Plank (deska)",            sets: 3, reps: 60, weight: 0, restSec: 45 },
  ],

  // OUTDOOR — cardio focus; te plany użytkownik startuje z /biegi
  "Bieganie · Interwały 5×3 min": [],
  "Rower · Endurance": [],
  "Trekking · Park leśny": [],
};

export const FALLBACK_ROUTINE_KEY = "Push Day · Klatka, barki";
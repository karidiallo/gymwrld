export type TrainingKind = "silownia" | "biezia" | "bieg" | "street" | "mind" | "sen";
export type TrainingLog = {
  id: string;
  kind: TrainingKind;
  title: string;
  kcal: number;
  minutes: number;
  ts: number;
  rating?: number;
  notes?: string;
  meta?: Record<string, string | number>;
};

const KEY = "gw_training_log";
const PROFILE_KEY = "gw_profile";
const ACHV_KEY = "gw_achievements";

/** Achievement definitions — must mirror /statystyki MEDALS list */
const ACHIEVEMENTS: { id: string; title: string; xp: number; check: (logs: TrainingLog[], lvl: number) => boolean }[] = [
  { id: "first",    title: "Pierwszy krok",     xp: 150, check: (l)    => l.length >= 1 },
  { id: "ten",      title: "10 treningów",      xp: 300, check: (l)    => l.length >= 10 },
  { id: "fifty",    title: "50 treningów",      xp: 800, check: (l)    => l.length >= 50 },
  { id: "lvl5",     title: "Lvl 5",             xp: 250, check: (_, v) => v >= 5 },
  { id: "lvl10",    title: "Lvl 10",            xp: 500, check: (_, v) => v >= 10 },
  { id: "zen",      title: "Zen master",        xp: 400, check: (l)    => l.filter((x) => x.kind === "mind").length >= 30 },
];

function readUnlocked(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ACHV_KEY) ?? "[]"); } catch { return []; }
}

function checkAchievements() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const p = raw ? JSON.parse(raw) : {};
    const lvl = Number(p.lvl ?? 1);
    const logs = readLogs();
    const unlocked = new Set(readUnlocked());
    for (const a of ACHIEVEMENTS) {
      if (!unlocked.has(a.id) && a.check(logs, lvl)) {
        unlocked.add(a.id);
        awardXp(a.xp, `Osiągnięcie: ${a.title}`);
        window.dispatchEvent(new CustomEvent("gw_achievement", { detail: { id: a.id, title: a.title, xp: a.xp } }));
      }
    }
    localStorage.setItem(ACHV_KEY, JSON.stringify([...unlocked]));
  } catch {}
}

/** Award XP to user profile, handle level up. Triggered by any training log. */
export function awardXp(amount: number, reason?: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const p = raw ? JSON.parse(raw) : {};
    const prevXp = Number(p.xp ?? 0);
    const prevLvl = Number(p.lvl ?? 1);
    let xp = prevXp + amount;
    let lvl = prevLvl;
    while (xp >= 2000) { xp -= 2000; lvl += 1; }
    while (xp < 0 && lvl > 1) { xp += 2000; lvl -= 1; }
    if (xp < 0) xp = 0;
    const stats = p.stats ?? { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 };
    const next = { ...p, xp, lvl, stats };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("gw_profile_update"));
    if (lvl > prevLvl) window.dispatchEvent(new CustomEvent("gw_levelup", { detail: { lvl } }));
  } catch {}
}

const XP_PER_KIND: Record<TrainingKind, number> = {
  silownia: 120, biezia: 80, bieg: 100, street: 90, mind: 30, sen: 40,
};
/** Base bumps per training (applied at minimum) */
const STAT_BUMP: Record<TrainingKind, Partial<Record<"sila"|"kondycja"|"dieta"|"sen"|"rozwoj", number>>> = {
  silownia: { sila: 5, rozwoj: 1 },
  biezia: { kondycja: 5 },
  bieg: { kondycja: 6 },
  street: { sila: 3, kondycja: 3 },
  mind: { rozwoj: 3 },
  sen: { sen: 6 },
};

/** Adaptive scaling: more kcal/minutes → more stat gain. */
function scaledBump(kind: TrainingKind, kcal: number, minutes: number) {
  const base = { ...STAT_BUMP[kind] } as Record<string, number>;
  // intensity factor: ~1.0 at 100 kcal / 20 min, scales up to ~2.5
  const intensity = Math.min(2.5, Math.max(0.6, (kcal / 100) * 0.5 + (minutes / 20) * 0.5));
  for (const k of Object.keys(base)) base[k] = Math.round(base[k] * intensity);
  // cardio specifics: bieżnia/bieg → kondycja gets +1 per 50 kcal beyond 100
  if (kind === "biezia" || kind === "bieg") {
    const extra = Math.max(0, Math.floor((kcal - 100) / 50));
    base.kondycja = (base.kondycja ?? 0) + extra;
  }
  return base;
}

function bumpStats(kind: TrainingKind, kcal = 0, minutes = 0) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const p = raw ? JSON.parse(raw) : {};
    const s = p.stats ?? { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 };
    const bump = scaledBump(kind, kcal, minutes);
    for (const [k, v] of Object.entries(bump)) s[k] = Math.min(100, (s[k] ?? 0) + (v as number));
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...p, stats: s }));
    window.dispatchEvent(new Event("gw_profile_update"));
  } catch {}
}

function unbumpStats(kind: TrainingKind, kcal = 0, minutes = 0) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const p = raw ? JSON.parse(raw) : {};
    const s = p.stats ?? { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 };
    const bump = scaledBump(kind, kcal, minutes);
    for (const [k, v] of Object.entries(bump)) s[k] = Math.max(0, (s[k] ?? 0) - (v as number));
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...p, stats: s }));
    window.dispatchEvent(new Event("gw_profile_update"));
  } catch {}
}

export function readLogs(): TrainingLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function writeLogs(logs: TrainingLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(logs));
  window.dispatchEvent(new Event("gw_training_log_update"));
}

export function addLog(log: Omit<TrainingLog, "id" | "ts"> & { ts?: number; id?: string }) {
  const next: TrainingLog = {
    id: log.id ?? String(Date.now()) + Math.random().toString(36).slice(2, 6),
    ts: log.ts ?? Date.now(),
    kind: log.kind,
    title: log.title,
    kcal: log.kcal,
    minutes: log.minutes,
    meta: log.meta,
  };
  writeLogs([next, ...readLogs()]);
  // XP also scales with kcal/minutes
  const xpScale = Math.min(2.5, Math.max(0.6, (next.kcal / 100) * 0.5 + (next.minutes / 20) * 0.5));
  awardXp(Math.round((XP_PER_KIND[next.kind] ?? 30) * xpScale));
  bumpStats(next.kind, next.kcal, next.minutes);
  checkAchievements();
  return next;
}

export function updateLog(id: string, patch: Partial<TrainingLog>) {
  writeLogs(readLogs().map((l) => (l.id === id ? { ...l, ...patch } : l)));
}

export function removeLog(id: string) {
  const logs = readLogs();
  const target = logs.find((l) => l.id === id);
  writeLogs(logs.filter((l) => l.id !== id));
  if (target) {
    const xpScale = Math.min(2.5, Math.max(0.6, (target.kcal / 100) * 0.5 + (target.minutes / 20) * 0.5));
    awardXp(-Math.round((XP_PER_KIND[target.kind] ?? 30) * xpScale), `cofnij: ${target.title}`);
    unbumpStats(target.kind, target.kcal, target.minutes);
  }
}

export const KIND_COLOR: Record<TrainingKind, string> = {
  silownia: "#e94560",
  biezia: "#ff8c3c",
  bieg: "#ff6a3d",
  street: "#bef264",
  mind: "#a78bfa",
  sen: "#60a5fa",
};

export const KIND_LABEL: Record<TrainingKind, string> = {
  silownia: "Siłownia",
  biezia: "Bieżnia",
  bieg: "Bieg",
  street: "Street",
  mind: "Mind",
  sen: "Sen",
};
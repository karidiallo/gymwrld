export type TrainingKind = "silownia" | "biezia" | "bieg" | "street" | "mind" | "sen";
export type TrainingLog = {
  id: string;
  kind: TrainingKind;
  title: string;
  kcal: number;
  minutes: number;
  ts: number;
  meta?: Record<string, string | number>;
};

const KEY = "gw_training_log";
const PROFILE_KEY = "gw_profile";

/** Award XP to user profile, handle level up. Triggered by any training log. */
export function awardXp(amount: number, reason?: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const p = raw ? JSON.parse(raw) : {};
    const prevXp = Number(p.xp ?? 0);
    const prevLvl = Number(p.level ?? 1);
    let xp = prevXp + amount;
    let lvl = prevLvl;
    while (xp >= 2000) { xp -= 2000; lvl += 1; }
    const stats = p.stats ?? { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 };
    const next = { ...p, xp, level: lvl, stats };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("gw_profile_update"));
    if (lvl > prevLvl) window.dispatchEvent(new CustomEvent("gw_levelup", { detail: { lvl } }));
  } catch {}
}

const XP_PER_KIND: Record<TrainingKind, number> = {
  silownia: 120, biezia: 80, bieg: 100, street: 90, mind: 30, sen: 40,
};
const STAT_BUMP: Record<TrainingKind, Partial<Record<"sila"|"kondycja"|"dieta"|"sen"|"rozwoj", number>>> = {
  silownia: { sila: 4, rozwoj: 1 },
  biezia: { kondycja: 3 },
  bieg: { kondycja: 4 },
  street: { sila: 2, kondycja: 2 },
  mind: { rozwoj: 2 },
  sen: { sen: 5 },
};
function bumpStats(kind: TrainingKind) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const p = raw ? JSON.parse(raw) : {};
    const s = p.stats ?? { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 };
    for (const [k, v] of Object.entries(STAT_BUMP[kind])) s[k] = Math.min(100, (s[k] ?? 0) + (v as number));
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
  awardXp(XP_PER_KIND[next.kind] ?? 30);
  bumpStats(next.kind);
  return next;
}

export function updateLog(id: string, patch: Partial<TrainingLog>) {
  writeLogs(readLogs().map((l) => (l.id === id ? { ...l, ...patch } : l)));
}

export function removeLog(id: string) {
  writeLogs(readLogs().filter((l) => l.id !== id));
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
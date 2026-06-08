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
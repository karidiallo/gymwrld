/**
 * In-app notification center + local reminders (water 3x/day, achievement,
 * step-streak motivator). Persisted to localStorage; displays as toasts and
 * in /notifications feed. Push (FCM) notifications are layered on top via push.ts.
 */
import { toast } from "sonner";

export type NotifKind = "water" | "achievement" | "motivation" | "workout" | "system";

export type Notif = {
  id: string;
  kind: NotifKind;
  title: string;
  body?: string;
  ts: number;
  read?: boolean;
  emoji?: string;
};

const KEY = "gw_notifs";
const WATER_KEY = "gw_water_reminders_v1";
const MAX = 80;

export function readNotifs(): Notif[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeNotifs(list: Notif[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event("gw_notifs_update"));
}
export function unreadCount(): number {
  return readNotifs().filter((n) => !n.read).length;
}
export function markAllRead() {
  writeNotifs(readNotifs().map((n) => ({ ...n, read: true })));
}
export function clearNotifs() { writeNotifs([]); }

export function pushNotif(n: Omit<Notif, "id" | "ts" | "read"> & { ts?: number }) {
  const item: Notif = {
    id: crypto.randomUUID?.() ?? String(Math.random()).slice(2),
    ts: n.ts ?? Date.now(),
    read: false,
    ...n,
  };
  const list = [item, ...readNotifs()];
  writeNotifs(list);
  // Surface as toast immediately
  const tt = `${item.emoji ? item.emoji + " " : ""}${item.title}`;
  if (item.kind === "achievement") toast.success(tt, { description: item.body });
  else if (item.kind === "water") toast(tt, { description: item.body });
  else toast(tt, { description: item.body });
  // Try OS-level notification if granted (works even when tab is in background on desktop)
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(item.title, { body: item.body ?? "", icon: "/icon-192.png" });
    }
  } catch {}
  return item;
}

/* ---------- Water reminders (3x/day local) ---------- */

const WATER_SLOTS = [10, 14, 18]; // hours
const WATER_COPY = [
  { title: "Czas na wodę 💧", body: "Szklanka teraz = lepsza koncentracja za godzinę." },
  { title: "Hydratacja break 💧", body: "Wypij 250 ml. Twoje mięśnie Ci podziękują." },
  { title: "Woda > kawa ☕→💧", body: "Mała przerwa na szklankę wody. Trzymaj rytm." },
];

type WaterState = { day: string; fired: number[] };
function readWater(): WaterState {
  try {
    const raw = localStorage.getItem(WATER_KEY);
    if (!raw) return { day: today(), fired: [] };
    const s = JSON.parse(raw) as WaterState;
    if (s.day !== today()) {
      // New day: mark all *past* slots as already-fired so we never replay them on first login of the day.
      const h = new Date().getHours();
      const pastSlots = WATER_SLOTS.filter((slot) => h > slot);
      return { day: today(), fired: pastSlots };
    }
    return s;
  } catch { return { day: today(), fired: [] }; }
}
function writeWater(s: WaterState) { localStorage.setItem(WATER_KEY, JSON.stringify(s)); }
function today() { return new Date().toISOString().slice(0, 10); }

/**
 * Call once on app boot. Fires water reminders at 10/14/18 — only for the
 * *current* slot window (never replays missed slots from earlier in the day),
 * and only if the user has explicitly opted in via `gw_reminders_water === "1"`.
 */
export function startWaterReminders() {
  if (typeof window === "undefined") return () => {};
  // Hard gate: require explicit user consent. Default OFF.
  if (localStorage.getItem("gw_reminders_water") !== "1") return () => {};
  // Seed fired-slots for any slots already in the past, so first tick of the
  // day doesn't dump 1-3 notifications at once when the user logs in late.
  const initial = readWater();
  const nowH = new Date().getHours();
  const seedFired = Array.from(new Set([
    ...initial.fired,
    ...WATER_SLOTS.filter((slot) => nowH > slot),
  ]));
  if (seedFired.length !== initial.fired.length) writeWater({ day: today(), fired: seedFired });

  const tick = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = readWater();
    for (let i = 0; i < WATER_SLOTS.length; i++) {
      const slot = WATER_SLOTS[i];
      // Fire only inside the current slot hour and only within the first 10
      // minutes — never replay slots that have already passed.
      if (h === slot && m < 10 && !s.fired.includes(slot)) {
        const copy = WATER_COPY[i % WATER_COPY.length];
        pushNotif({ kind: "water", title: copy.title, body: copy.body, emoji: "💧" });
        s.fired.push(slot);
        writeWater(s);
      }
    }
  };
  tick();
  const id = window.setInterval(tick, 60_000);
  return () => window.clearInterval(id);
}

/* ---------- Motivation (random punchy line) ---------- */

const MOTIVATION = [
  { emoji: "🔥", title: "Dzisiaj > wczoraj", body: "Jedna seria zmienia cały tydzień. Wchodzisz?" },
  { emoji: "⚡", title: "20 minut. Tyle wystarczy.", body: "Krótka sesja > brak sesji. Zacznij i zobacz." },
  { emoji: "💪", title: "Twój awatar czeka", body: "Każdy trening = realny progres statystyk. Lecimy." },
  { emoji: "🚀", title: "Streak nie sam się utrzyma", body: "Nie przerywaj passy — najmocniejszy jesteś teraz." },
  { emoji: "🌅", title: "Dzień dobry, mistrzu", body: "Trening rano = energia na cały dzień. Sprawdź plan." },
];
export function randomMotivation() {
  return MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
}

/* ---------- Achievement bridge ---------- */

/** Wire to window 'gw_achievement' once at app boot. */
export function installAchievementBridge() {
  if (typeof window === "undefined") return () => {};
  const handler = (e: any) => {
    const d = e.detail ?? {};
    // Add to feed silently (no toast) — CelebrationModal renders the big medal popup.
    const item: Notif = {
      id: crypto.randomUUID?.() ?? String(Math.random()).slice(2),
      ts: Date.now(),
      read: false,
      kind: "achievement",
      title: `Osiągnięcie: ${d.title}`,
      body: `+${d.xp} XP odblokowane`,
      emoji: "🏆",
    };
    writeNotifs([item, ...readNotifs()]);
  };
  window.addEventListener("gw_achievement", handler as any);
  return () => window.removeEventListener("gw_achievement", handler as any);
}
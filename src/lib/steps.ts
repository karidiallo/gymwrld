/**
 * Step counter — hybrid accelerometer + GPS distance fallback.
 *
 * Why: Web/PWA has no native pedometer like iOS HealthKit / Android Health Connect.
 * Two reliable signals exist in the browser:
 *   1) DeviceMotion accelerometer → real step detection via peak counting (needs phone with you).
 *   2) Geolocation distance → estimated steps via user stride length (good outdoors, anti-cheat:
 *      the user must actually move, can't shake the phone in place to fake it).
 *
 * We use accelerometer as primary (works indoors, treadmill, etc.) and GPS as auto-fallback
 * when accelerometer is unavailable or denied. Both can run together — we take the max
 * because GPS underestimates (it ignores in-place steps), accelerometer overestimates
 * (vibrations) — taking max gives a realistic blend with low false positives.
 */

const STORAGE_KEY = "gw_steps_v2";
const ACTIVITY_KEY = "gw_last_activity";
const IDLE_MS = 24 * 60 * 60 * 1000;

/** Mark that the user opened the app — extends the 24h auto-stop window. */
export function pingActivity() {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
}

/** Has the user been away longer than 24h since last activity? */
export function isIdleStale(): boolean {
  if (typeof window === "undefined") return false;
  const v = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
  if (!v) return false;
  return Date.now() - v > IDLE_MS;
}

export type StepsState = {
  today: number;        // total steps today (max of accel + gps)
  todayAccel: number;
  todayGps: number;
  distanceM: number;    // total tracked distance in metres
  date: string;         // ISO yyyy-mm-dd for "today" rollover
  week: { d: string; steps: number }[];
  goal: number;
  claimed: Record<number, boolean>;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

export function readSteps(): StepsState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw) as StepsState;
    // Roll over at midnight
    if (s.date !== todayKey()) {
      const idx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      const w = [...(s.week || defaultWeek())];
      w[idx] = { d: w[idx]?.d ?? labels()[idx], steps: 0 };
      // shift yesterday's total into yesterday's slot
      const y = idx === 0 ? 6 : idx - 1;
      if (w[y]) w[y].steps = Math.max(w[y].steps, s.today);
      const next: StepsState = {
        ...s, week: w, today: 0, todayAccel: 0, todayGps: 0,
        distanceM: 0, date: todayKey(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }
    return { ...defaultState(), ...s };
  } catch {
    return defaultState();
  }
}

export function writeSteps(s: StepsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("gw_steps_update"));
}

const labels = () => ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const defaultWeek = () => labels().map((d) => ({ d, steps: 0 }));
function defaultState(): StepsState {
  return {
    today: 0, todayAccel: 0, todayGps: 0, distanceM: 0,
    date: todayKey(), week: defaultWeek(), goal: 10000, claimed: {},
  };
}

/** Stride length in metres from height (cm). Falls back to 0.75 m. */
export function strideMetres(heightCm?: number, gender?: "m" | "k" | "nb"): number {
  if (!heightCm || heightCm < 100) return 0.75;
  // Empirical: men ~0.415 * h, women ~0.413 * h, applied to cm gives metres.
  const factor = gender === "k" ? 0.413 : 0.415;
  return (heightCm * factor) / 100;
}

/** iOS 13+ requires explicit user gesture permission for DeviceMotion. */
export async function requestMotionPermission(): Promise<"granted" | "denied" | "unsupported"> {
  if (typeof window === "undefined") return "unsupported";
  // @ts-expect-error - iOS-only API
  const req = window.DeviceMotionEvent?.requestPermission;
  if (typeof req !== "function") {
    // Android & desktop don't require explicit request — just check if event fires.
    return "DeviceMotionEvent" in window ? "granted" : "unsupported";
  }
  try {
    const r = await req.call(window.DeviceMotionEvent);
    return r === "granted" ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

export type StepTracker = {
  stop: () => void;
  isAccel: () => boolean;
  isGps: () => boolean;
};

/**
 * Start tracking. Calls onStep(stepDelta, source) whenever new steps are detected.
 * Persists to localStorage automatically.
 */
export function startTracking(opts: {
  strideM: number;
  onUpdate?: (s: StepsState) => void;
}): StepTracker {
  let accelOk = false;
  let gpsOk = false;
  let lastPeakTs = 0;
  let lastValleyMag = 1;
  let above = false;
  let prev: { lat: number; lon: number; ts: number } | null = null;

  const persistDelta = () => {
    const s = readSteps();
    // today = max(accel, gps) anti-double-count
    s.today = Math.max(s.todayAccel, s.todayGps);
    const idx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    if (!s.week[idx]) s.week = defaultWeek();
    s.week[idx].steps = Math.max(s.week[idx].steps, s.today);
    writeSteps(s);
    opts.onUpdate?.(s);
  };

  const onMotion = (e: DeviceMotionEvent) => {
    accelOk = true;
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
    // Normalise: gravity ~9.8 → resting magnitude ~1g. Detect peak transitions across ~12.
    const now = Date.now();
    const TH_HIGH = 12.5;
    const TH_LOW = 9.5;
    const MIN_INTERVAL = 280; // ms — max ~3.5 steps/sec
    if (!above && mag > TH_HIGH && now - lastPeakTs > MIN_INTERVAL) {
      above = true;
      lastPeakTs = now;
      const s = readSteps();
      s.todayAccel += 1;
      // Distance estimate from accelerometer steps (used for kcal etc.)
      s.distanceM = Math.max(s.distanceM, s.todayAccel * opts.strideM);
      writeSteps(s);
      persistDelta();
    } else if (above && mag < TH_LOW) {
      above = false;
      lastValleyMag = mag;
    }
  };

  let watchId: number | null = null;
  const startGps = () => {
    if (!navigator.geolocation) return;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        gpsOk = true;
        const p = { lat: pos.coords.latitude, lon: pos.coords.longitude, ts: Date.now() };
        if (prev && pos.coords.accuracy < 30) {
          const d = haversineM(prev, p);
          // ignore micro-jitter (<2 m) and physically impossible jumps (>50 m in <2 s)
          const dt = (p.ts - prev.ts) / 1000;
          if (d >= 2 && d / Math.max(dt, 1) < 8) {
            const s = readSteps();
            s.distanceM += d;
            s.todayGps = Math.floor(s.distanceM / opts.strideM);
            writeSteps(s);
            persistDelta();
          }
        }
        prev = p;
      },
      () => { /* permission denied / unavailable — accelerometer can still work */ },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  };

  if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
    window.addEventListener("devicemotion", onMotion);
  }
  startGps();

  return {
    stop: () => {
      if (typeof window !== "undefined") window.removeEventListener("devicemotion", onMotion);
      if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    },
    isAccel: () => accelOk,
    isGps: () => gpsOk,
  };
}

function haversineM(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
import { supabase } from "@/integrations/supabase/client";

const MODULE_KEYS = [
  ["training", "gw_training_log"],
  ["achievements", "gw_achievements"],
  ["treadmill", "gw_treadmill"],
  ["diet", "gw_diet"],
  ["steps", "gw_steps_v2"],
  ["mind", "gw_mind"],
  ["journal", "gw_journal"],
  ["tasks", "gw_tasks"],
  ["profile", "gw_profile"],
  ["cycle", "gw_cycle"],
  ["measurements", "gw_body"],
  ["recovery", "gw_recovery"],
  ["runs", "gw_runs"],
  ["street", "gw_street"],
  ["avatar", "gw_avatar"],
  ["nutrition", "gw_nutrition"],
  ["cycle_enabled", "gw_cycle_enabled"],
] as const;

const USER_TAG_KEY = "gw_last_user_id";
const PRESERVE_KEYS = new Set(["gw_last_user_id", "gw_session_persist"]);

/** Wipe all module localStorage keys (used on signout or on user-id mismatch). */
export function clearLocalAppState() {
  if (typeof window === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("gw_") && !PRESERVE_KEYS.has(k)) toRemove.push(k);
  }
  for (const k of toRemove) localStorage.removeItem(k);
  window.dispatchEvent(new Event("gw_profile_update"));
  window.dispatchEvent(new Event("gw_training_log_update"));
}

export async function migrateLocalStateToCloud() {
  if (typeof window === "undefined") return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const rows = MODULE_KEYS.flatMap(([module, key]) => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
      return [{ user_id: user.id, module, payload: JSON.parse(raw) }];
    } catch {
      return [{ user_id: user.id, module, payload: { value: raw } }];
    }
  });
  if (!rows.length) return;
  await supabase.from("user_app_state").upsert(rows, { onConflict: "user_id,module" });
}

export async function restoreCloudStateToLocal() {
  if (typeof window === "undefined") return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;
  // If signed-in user changed since last session, wipe stale local state
  // BEFORE restoring cloud data — prevents data leak between accounts.
  const lastUser = localStorage.getItem(USER_TAG_KEY);
  if (lastUser !== user.id) {
    clearLocalAppState();
    localStorage.setItem(USER_TAG_KEY, user.id);
  }
  const { data } = await supabase.from("user_app_state").select("module,payload");
  if (!data) return;
  for (const [module, key] of MODULE_KEYS) {
    const row = data.find((item) => item.module === module);
    if (row?.payload != null) {
      localStorage.setItem(key, JSON.stringify(row.payload));
    }
  }
  window.dispatchEvent(new Event("gw_profile_update"));
  window.dispatchEvent(new Event("gw_training_log_update"));
}

export async function syncLocalState() {
  await restoreCloudStateToLocal();
  await migrateLocalStateToCloud();
}

let installed = false;
let timer: ReturnType<typeof setTimeout> | undefined;

export function installLocalStateCloudSync() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.localStorage.setItem.bind(window.localStorage);
  window.localStorage.setItem = (key: string, value: string) => {
    original(key, value);
    if (!key.startsWith("gw_")) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      migrateLocalStateToCloud().catch(() => undefined);
    }, 500);
  };

  // Auto cloud-sync every 60s while tab is visible + on visibilitychange (going
  // background flushes, foregrounding pulls latest cloud state).
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const startInterval = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        migrateLocalStateToCloud().catch(() => undefined);
      }
    }, 60_000);
  };
  const stopInterval = () => {
    if (intervalId) { clearInterval(intervalId); intervalId = undefined; }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      restoreCloudStateToLocal().catch(() => undefined);
      startInterval();
    } else {
      migrateLocalStateToCloud().catch(() => undefined);
      stopInterval();
    }
  });
  window.addEventListener("beforeunload", () => {
    migrateLocalStateToCloud().catch(() => undefined);
  });
  startInterval();
}
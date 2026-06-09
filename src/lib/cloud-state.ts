import { supabase } from "@/integrations/supabase/client";

const MODULE_KEYS = [
  ["training", "gw_training_log"],
  ["diet", "gw_diet"],
  ["steps", "gw_steps"],
  ["tasks", "gw_tasks"],
  ["profile", "gw_profile"],
  ["cycle", "gw_cycle"],
  ["measurements", "gw_body"],
  ["recovery", "gw_recovery"],
  ["runs", "gw_runs"],
  ["street", "gw_street"],
  ["avatar", "gw_avatar"],
  ["nutrition", "gw_nutrition"],
] as const;

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
  const { data } = await supabase.from("user_app_state").select("module,payload");
  if (!data) return;
  for (const [module, key] of MODULE_KEYS) {
    const row = data.find((item) => item.module === module);
    if (row?.payload != null && !localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(row.payload));
    }
  }
}

export async function syncLocalState() {
  await restoreCloudStateToLocal();
  await migrateLocalStateToCloud();
}
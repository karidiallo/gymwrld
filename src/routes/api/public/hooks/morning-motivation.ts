import { createFileRoute } from "@tanstack/react-router";

/**
 * Sends a single motivational push notification to every stored FCM token.
 * Called by pg_cron daily at 10:00 Europe/Warsaw.
 *
 * Auth: this lives under /api/public so Lovable doesn't gate it, but we still
 * require the project's anon `apikey` header (matching the cron job header)
 * to deter random callers.
 */

const MESSAGES = [
  { title: "Dzień dobry, mistrzu 🌅", body: "20 minut treningu = energia na cały dzień. Wchodzisz?" },
  { title: "Twoja najlepsza wersja czeka 💪", body: "Jedna seria zmienia tydzień. Lecimy?" },
  { title: "Streak czeka 🔥", body: "Nie przerywaj passy — dziś znowu się rozpędź." },
  { title: "Avatar = Ty 🧬", body: "Każdy trening to realny progres statystyk. Zobacz." },
  { title: "Krótko i mocno ⚡", body: "Nie masz godziny? Wystarczy 15 minut. Zaczynamy?" },
  { title: "Małe kroki, duża zmiana 👟", body: "Spacer, rozciąganie, woda. Zacznij od jednego." },
  { title: "Czas na ruch 🚀", body: "Otwórz plan dnia i wybierz coś dla siebie." },
];

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") bytes = new TextEncoder().encode(input);
  else if (input instanceof Uint8Array) bytes = input;
  else bytes = new Uint8Array(input);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key.replace(/\\n/g, "\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${await res.text()}`);
  const j = (await res.json()) as { access_token: string };
  return j.access_token;
}

export const Route = createFileRoute("/api/public/hooks/morning-motivation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        const got = request.headers.get("apikey");
        if (expected && got !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!saRaw) {
          return new Response("FIREBASE_SERVICE_ACCOUNT missing", { status: 500 });
        }
        let sa: ServiceAccount;
        try { sa = JSON.parse(saRaw); }
        catch { return new Response("Invalid service account JSON", { status: 500 }); }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: tokens, error } = await supabaseAdmin
          .from("push_tokens")
          .select("token");
        if (error) return new Response(error.message, { status: 500 });
        if (!tokens?.length) return Response.json({ ok: true, sent: 0 });

        const accessToken = await getAccessToken(sa);
        const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

        let sent = 0;
        let failed = 0;
        const dead: string[] = [];
        await Promise.all(
          tokens.map(async (row: { token: string }) => {
            const res = await fetch(
              `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  message: {
                    token: row.token,
                    notification: { title: msg.title, body: msg.body },
                    webpush: {
                      fcm_options: { link: "https://app.gymwrld.com/" },
                      notification: { icon: "/icon-192.png", badge: "/icon-192.png" },
                    },
                  },
                }),
              },
            );
            if (res.ok) { sent++; return; }
            failed++;
            const text = await res.text();
            // Clean up dead tokens (UNREGISTERED / INVALID_ARGUMENT)
            if (res.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/i.test(text)) {
              dead.push(row.token);
            }
          }),
        );
        if (dead.length) {
          await supabaseAdmin.from("push_tokens").delete().in("token", dead);
        }
        return Response.json({ ok: true, sent, failed, removed: dead.length });
      },
    },
  },
});
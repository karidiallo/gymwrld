import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BottomNav } from "../components/BottomNav";
import { Toaster } from "../components/ui/sonner";
import { CelebrationModal } from "../components/CelebrationModal";
import { supabase } from "../integrations/supabase/client";
import { installLocalStateCloudSync, syncLocalState, clearLocalAppState } from "../lib/cloud-state";
import { startWaterReminders, installAchievementBridge, pushNotif } from "../lib/notifications";
import { pingActivity, isIdleStale, ensureGlobalTracking, stopGlobalTracking, requestMotionPermission } from "../lib/steps";
import { toast } from "sonner";
import { hasLiveAuthSession } from "../lib/auth-session";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GymWrld — Twoja cyfrowa wersja siebie" },
      { name: "description", content: "Premium aplikacja lifestyle. Trenuj, jedz świadomie, rozwijaj swoją cyfrową postać." },
      { name: "author", content: "GymWrld" },
      { property: "og:title", content: "GymWrld — Twoja cyfrowa wersja siebie" },
      { property: "og:description", content: "Premium aplikacja lifestyle. Trenuj, jedz świadomie, rozwijaj swoją cyfrową postać." },
      { property: "og:type", content: "website" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "GymWRLD" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "theme-color", content: "#0F1115" },
      { name: "format-detection", content: "telephone=no" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "GymWrld — Twoja cyfrowa wersja siebie" },
      { name: "twitter:description", content: "Premium aplikacja lifestyle. Trenuj, jedz świadomie, rozwijaj swoją cyfrową postać." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7694c393-0f3c-4d84-945b-3002d28039a1/id-preview-eb01f286--cd18d754-d457-4a4f-9ceb-37ed08ebe404.lovable.app-1781139578906.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7694c393-0f3c-4d84-945b-3002d28039a1/id-preview-eb01f286--cd18d754-d457-4a4f-9ceb-37ed08ebe404.lovable.app-1781139578906.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", href: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isStandalone =
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding");

  // Public, pre-auth routes — NEVER run reminders / step tracking / activity here.
  const isPublicRoute =
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations?.()
        .then((regs) => regs.filter((reg) => reg.active?.scriptURL.includes("/sw.js")).forEach((reg) => reg.unregister()))
        .catch(() => undefined);
    }

    // Capture ?ref=XXXX from landing URL — used at first profile creation.
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^[A-Z0-9]{4,12}$/i.test(ref)) {
        localStorage.setItem("gw_ref", ref.toUpperCase());
      }
    } catch {}

    // App-host effects: only start water/achievement/steps once we have an authenticated user
    // AND we're not on a public/auth route (no notifications during signup/login).
    let offAchv: (() => void) | undefined;
    let offWater: (() => void) | undefined;
    let idleId: number | undefined;
    let onVis: (() => void) | undefined;
    let started = false;

    const startAppEffects = () => {
      if (started || isPublicRoute) return;
      started = true;
      installLocalStateCloudSync();
      offAchv = installAchievementBridge();
      offWater = startWaterReminders();
      pingActivity();
      onVis = () => { if (document.visibilityState === "visible") pingActivity(); };
      document.addEventListener("visibilitychange", onVis);

      // Auto-step tracker (24h idle window). Global singleton — survives route
      // changes, so switching tabs inside the app keeps counting. On iOS, the
      // first run still needs a tap (permission must come from user gesture);
      // the /kroki screen shows a prompt on first visit, after that we
      // auto-start on every login.
      (async () => {
        if (typeof window === "undefined") return;
        if (isIdleStale()) { localStorage.removeItem("gw_steps_autostart"); return; }
        const autostart = localStorage.getItem("gw_steps_autostart") === "1";
        // Android / desktop: no permission gesture needed — start silently.
        let needsGesture = false;
        try {
          // @ts-expect-error iOS-only
          needsGesture = typeof window.DeviceMotionEvent?.requestPermission === "function";
        } catch {}
        if (autostart && !needsGesture) {
          ensureGlobalTracking();
          return;
        }
        if (autostart && needsGesture) {
          // iOS: previously enabled. Re-prompt once per session because Apple
          // requires a user gesture to access DeviceMotion even after consent.
          if (sessionStorage.getItem("gw_steps_prompted") === "1") return;
          sessionStorage.setItem("gw_steps_prompted", "1");
          toast("Włączyć krokomierz?", {
            description: "Liczy kroki w tle, dopóki używasz aplikacji.",
            duration: 12000,
            action: {
              label: "Włącz",
              onClick: async () => {
                const perm = await requestMotionPermission();
                if (perm === "denied") {
                  toast.error("Brak zgody — liczymy tylko po GPS.");
                }
                ensureGlobalTracking();
              },
            },
          });
          return;
        }
        // First-ever visit (no autostart pref). Ask once.
        if (sessionStorage.getItem("gw_steps_prompted") === "1") return;
        if (localStorage.getItem("gw_steps_optout") === "1") return;
        sessionStorage.setItem("gw_steps_prompted", "1");
        toast("Włącz krokomierz", {
          description: "Automatycznie zlicza kroki, gdy używasz GymWrld.",
          duration: 15000,
          action: {
            label: "Włącz",
            onClick: async () => {
              const perm = await requestMotionPermission();
              if (perm === "denied") {
                toast.error("Brak zgody — liczymy tylko po GPS.");
              }
              ensureGlobalTracking();
            },
          },
          cancel: {
            label: "Nie teraz",
            onClick: () => { localStorage.setItem("gw_steps_optout", "1"); },
          },
        });
      })();

      idleId = window.setInterval(() => {
        if (isIdleStale()) {
          stopGlobalTracking();
          localStorage.removeItem("gw_steps_autostart");
          pushNotif({ kind: "system", title: "Krokomierz uśpiony", body: "Nie logowałaś się 24h — wróć aby wznowić.", emoji: "😴" });
        }
      }, 5 * 60_000);
    };

    // If a session already exists at mount, start app-only effects without blocking route rendering.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user && hasLiveAuthSession()) startAppEffects();
    }).catch(() => undefined);

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event === "SIGNED_OUT") {
        stopGlobalTracking();
        clearLocalAppState();
        if (typeof window !== "undefined") localStorage.removeItem("gw_last_user_id");
        queryClient.clear();
        return;
      }
      if (!session?.user) return;
      syncLocalState().catch(() => undefined);
      // On login: start app effects (water reminders, step tracker), mark activity.
      startAppEffects();
      pingActivity();
      if (typeof window !== "undefined" && localStorage.getItem("gw_steps_autostart") !== "1") {
        // We don't request permission here — that happens on first manual tap in /kroki
        // But if permission already exists on Android/desktop, flip on autostart.
        if ("DeviceMotionEvent" in window) {
          // @ts-expect-error iOS-only
          if (typeof window.DeviceMotionEvent?.requestPermission !== "function") {
            localStorage.setItem("gw_steps_autostart", "1");
          }
        }
      }
    });
    return () => {
      sub.subscription.unsubscribe();
      offAchv?.();
      offWater?.();
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      if (idleId !== undefined) window.clearInterval(idleId);
      // Intentionally NOT stopping the global tracker here — it must outlive
      // route changes. It's torn down only on sign-out / idle.
    };
  }, [queryClient, pathname, isPublicRoute]);

  return (
    <QueryClientProvider client={queryClient}>
      {isStandalone ? (
        <Outlet />
      ) : (
        <div className="mx-auto min-h-screen w-full max-w-[480px] pb-28">
          <Outlet />
        </div>
      )}
      <BottomNav />
      <Toaster position="top-center" theme="dark" />
      <CelebrationModal />
    </QueryClientProvider>
  );
}

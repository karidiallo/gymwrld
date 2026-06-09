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
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { ensureCloudProfile } from "../lib/auth-flow";
import { installLocalStateCloudSync, syncLocalState } from "../lib/cloud-state";

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
      { property: "og:title", content: "GymWrld" },
      { property: "og:description", content: "Premium aplikacja lifestyle łącząca fitness, dietę i rozwój." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__l5e/assets-v1/9e97d7e7-db69-48ed-85ad-3a6a94a9e3cf/gymwrld-logo.png" },
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
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isStandalone =
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    installLocalStateCloudSync();
    const onAchv = (e: any) => {
      const d = e.detail ?? {};
      toast.success(`🏆 ${d.title}`, { description: `Osiągnięcie odblokowane · +${d.xp} XP` });
    };
    window.addEventListener("gw_achievement", onAchv as any);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event === "SIGNED_OUT") {
        queryClient.clear();
        router.invalidate();
        return;
      }
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) ensureCloudProfile(data.user).then(() => syncLocalState());
      });
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("gw_achievement", onAchv as any);
    };
  }, [router, queryClient]);

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
    </QueryClientProvider>
  );
}

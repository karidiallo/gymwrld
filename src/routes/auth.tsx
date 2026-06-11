import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ensureCloudProfile } from "@/lib/auth-flow";
import {
  clearAuthIntent,
  clearAuthSession,
  getCurrentUserOrClear,
  markLiveAuthSession,
  readAuthIntent,
  rememberAuthIntent,
  type AuthIntent,
} from "@/lib/auth-session";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";

async function routeAfterAuth(user: NonNullable<Awaited<ReturnType<typeof getCurrentUserOrClear>>>, intent: AuthIntent) {
  await ensureCloudProfile(user).catch(() => null);
  clearAuthIntent();
  return intent === "signup" ? "/onboarding" : "/";
}

async function consumeAuthHashSession() {
  if (typeof window === "undefined" || window.location.hash.length <= 1) return null;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const error = hash.get("error_description") || hash.get("error");
  if (error) throw new Error(error);
  const access_token = hash.get("access_token");
  const refresh_token = hash.get("refresh_token");
  if (!access_token || !refresh_token) return null;
  const { data, error: setSessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (setSessionError) throw setSessionError;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  return data.session?.user ?? null;
}

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Zaloguj się — GymWrld" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signup" ? "signup" : undefined,
    recovery: search.recovery === "1" ? "1" : undefined,
    oauth: search.oauth === "1" ? "1" : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const initialMode = search.recovery === "1" ? "reset" : search.mode === "signup" ? "signup" : "signin";
  const oauthReturn = search.oauth === "1";
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signupPendingEmail, setSignupPendingEmail] = useState<string | null>(null);
  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const hasOAuthHash = typeof window !== "undefined" && window.location.hash.length > 1;
    const hasConsumedOAuthHash = typeof window !== "undefined" && window.location.href.endsWith("#");
    if (!oauthReturn && !hasOAuthHash && !hasConsumedOAuthHash) return;
    let cancelled = false;
    setBusy(true);

    const finishOAuthLogin = async () => {
      const intent = readAuthIntent(mode === "signup" ? "signup" : "signin");
      try {
        const hashUser = await consumeAuthHashSession();
        if (hashUser) {
          markLiveAuthSession();
          const destination = await routeAfterAuth(hashUser, intent);
          if (!cancelled) navigate({ to: destination, replace: true });
          return;
        }
      } catch (error: any) {
        if (!cancelled) {
          setBusy(false);
          toast.error(error?.message ? `Google: ${error.message}` : "Nie udało się dokończyć logowania Google.");
          navigate({ to: "/auth", replace: true });
        }
        return;
      }
      for (let attempt = 0; attempt < 20 && !cancelled; attempt += 1) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          markLiveAuthSession();
          const destination = await routeAfterAuth(sessionData.session.user, intent);
          if (!cancelled) navigate({ to: destination, replace: true });
          return;
        }
        const user = await getCurrentUserOrClear();
        if (user) {
          markLiveAuthSession();
          const destination = await routeAfterAuth(user, intent);
          if (!cancelled) navigate({ to: destination, replace: true });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (!cancelled) {
        setBusy(false);
        toast.error("Nie udało się dokończyć logowania Google. Spróbuj ponownie.");
        navigate({ to: "/auth", replace: true });
      }
    };

    finishOAuthLogin();
    return () => { cancelled = true; };
  }, [oauthReturn, navigate, mode]);

  const switchMode = (next: "signin" | "signup" | "reset") => {
    setMode(next);
    setSignupPendingEmail(null);
  };

  const signInGoogle = async () => {
    setBusy(true);
    try {
      const intent = mode === "signup" ? "signup" : "signin";
      rememberAuthIntent(intent);
      const r = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth?oauth=1`,
        extraParams: { prompt: "select_account" },
      });
      if (r.error) {
        toast.error("Google: " + r.error.message);
        return;
      }
      if (r.redirected) return;
      const user = await getCurrentUserOrClear();
      if (user) {
        markLiveAuthSession();
        navigate({ to: await routeAfterAuth(user, intent), replace: true });
      }
    } finally { setBusy(false); }
  };

  const submit = async () => {
    if (!cleanEmail.includes("@")) return toast.error("Podaj poprawny e-mail");
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth?recovery=1`,
        });
        if (error) throw error;
        toast.success(`Link do resetu wysłany na ${cleanEmail}`);
        switchMode("signin");
        return;
      }
      if (password.length < 8) return toast.error("Hasło musi mieć min. 8 znaków");
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        toast.success("Zalogowano");
        if (data.user) {
          markLiveAuthSession();
          await ensureCloudProfile(data.user).catch(() => null);
          navigate({ to: "/", replace: true });
        }
      } else {
        await clearAuthSession();
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth?oauth=1` },
        });
        if (error) throw error;
        if (data.session?.user) {
          markLiveAuthSession();
          await ensureCloudProfile(data.session.user).catch(() => null);
          toast.success("Konto utworzone");
          navigate({ to: "/onboarding", replace: true });
        } else {
          setSignupPendingEmail(cleanEmail);
          toast.success("Konto utworzone — sprawdź e-mail aktywacyjny");
        }
      }
    } catch (e: any) {
      const msg = String(e?.message ?? "Coś poszło nie tak");
      const friendly = msg.includes("Email not confirmed")
        ? "Najpierw potwierdź e-mail z wiadomości aktywacyjnej."
        : msg.includes("weak") || msg.includes("pwned")
          ? "To hasło jest zbyt słabe lub znane z wycieków — wybierz mocniejsze, unikalne hasło."
          : msg.includes("Invalid login credentials")
            ? "Nieprawidłowy e-mail lub hasło."
            : msg;
      toast.error(friendly);
    } finally { setBusy(false); }
  };

  return (
    <main className="relative min-h-screen bg-black px-5 pt-10 pb-12 text-white">
      <Link to="/welcome" className="absolute left-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/10">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      {busy && (
        <div className="fixed inset-x-0 top-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-[420px] items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl" role="status" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" />
          {mode === "signup" ? "Tworzę konto…" : mode === "reset" ? "Wysyłam link…" : "Loguję…"}
        </div>
      )}
      <div className="mx-auto flex max-w-[420px] flex-col items-center pt-6">
        <img src={logoAsset.url} alt="GymWrld" className="w-[40%] max-w-[180px]" />
        {mode !== "reset" && (
          <div className="mt-8 grid w-full grid-cols-2 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
            <button
              onClick={() => switchMode("signin")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${mode === "signin" ? "bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] text-background" : "text-muted-foreground"}`}
            >Zaloguj</button>
            <button
              onClick={() => switchMode("signup")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${mode === "signup" ? "bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] text-background" : "text-muted-foreground"}`}
            >Utwórz konto</button>
          </div>
        )}
        <h1 className="mt-6 font-display text-2xl">
          {mode === "signin" ? "Witaj z powrotem" : mode === "signup" ? "Utwórz konto" : "Reset hasła"}
        </h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {mode === "reset" ? "Wyślemy link na Twój e-mail." : mode === "signup" ? "Zarejestruj się i zacznij budować swoją cyfrową wersję." : "Zaloguj się, aby kontynuować rozwój."}
        </p>

        <div className="mt-6 w-full space-y-3">
          {mode !== "reset" && (
            <button onClick={signInGoogle} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black disabled:opacity-60">
              <GoogleIcon /> Kontynuuj z Google
            </button>
          )}
          {mode !== "reset" && (
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-white/10" /> lub e-mail <span className="h-px flex-1 bg-white/10" />
            </div>
          )}
          {signupPendingEmail && mode === "signup" && (
            <div className="rounded-2xl border border-[var(--lime)]/30 bg-[var(--lime)]/10 p-4 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--lime)]" />
                <div>
                  <p className="text-sm font-semibold text-white">Konto utworzone</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Sprawdź skrzynkę {signupPendingEmail}, potwierdź e-mail i wróć tutaj do logowania.
                  </p>
                  <button type="button" onClick={() => switchMode("signin")} className="mt-3 text-xs font-semibold text-[var(--lime)]">
                    Przejdź do logowania
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="twoj@email.pl" className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          {mode !== "reset" && (
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="hasło (min. 8)" className="flex-1 bg-transparent text-sm outline-none" />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
          <button onClick={submit} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background disabled:opacity-50">
            {mode === "signin" ? "Zaloguj" : mode === "signup" ? "Utwórz konto" : "Wyślij link"} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-xs">
          {mode === "signin" && (
            <>
              <button onClick={() => switchMode("reset")} className="text-muted-foreground hover:text-white">Zapomniałem hasła</button>
              <p className="text-muted-foreground">Nie masz konta? <button onClick={() => switchMode("signup")} className="text-[var(--lime)]">Zarejestruj się</button></p>
            </>
          )}
          {mode === "signup" && (
            <p className="text-muted-foreground">Masz już konto? <button onClick={() => switchMode("signin")} className="text-[var(--lime)]">Zaloguj się</button></p>
          )}
          {mode === "reset" && (
            <button onClick={() => switchMode("signin")} className="text-[var(--lime)]">Wróć do logowania</button>
          )}
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
  );
}
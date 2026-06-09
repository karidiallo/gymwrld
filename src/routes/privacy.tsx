import { createFileRoute, Link } from "@tanstack/react-router";
import logoAsset from "@/assets/gymwrld-wordmark.png.asset.json";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Polityka prywatności — GymWrld" },
      { name: "description", content: "Polityka prywatności GymWrld — jak przechowujemy i chronimy Twoje dane treningowe, dietetyczne i osobowe." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link to="/welcome" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="GymWrld" className="h-6" />
          </Link>
          <Link to="/welcome" className="text-xs text-white/60 hover:text-white">← Powrót</Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 prose-invert">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Dokument prawny</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">Polityka prywatności</h1>
        <p className="mt-3 text-sm text-white/50">Ostatnia aktualizacja: 9 czerwca 2026</p>

        <div className="mt-12 space-y-8 text-[15px] leading-relaxed text-white/75">
          <section>
            <h2 className="font-display text-xl text-white">1. Kim jesteśmy</h2>
            <p className="mt-2">GymWrld („my”, „nas”) to aplikacja do śledzenia treningu, diety, biegów, cyklu menstruacyjnego i regeneracji. Niniejszy dokument opisuje, jakie dane zbieramy, w jakim celu i jak je chronimy.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white">2. Jakie dane zbieramy</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Dane konta: e-mail, nick, hasło w postaci zaszyfrowanego hash'a.</li>
              <li>Dane profilowe: wiek, płeć, wzrost, waga, cele treningowe.</li>
              <li>Dane aktywności: treningi, biegi, kroki, posiłki, makra, wymiary ciała.</li>
              <li>Dane zdrowotne wrażliwe (opcjonalnie): cykl menstruacyjny, sen, regeneracja.</li>
              <li>Dane techniczne: typ urządzenia, język, anonimowe metryki użycia.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-white">3. Jak wykorzystujemy Twoje dane</h2>
            <p className="mt-2">Dane służą wyłącznie do działania aplikacji: dopasowania planów treningowych i dietetycznych, synchronizacji między urządzeniami oraz wyświetlania Twoich statystyk. Nie sprzedajemy danych osobowych stronom trzecim.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white">4. Bezpieczeństwo</h2>
            <p className="mt-2">Dane przechowujemy w zaszyfrowanej bazie z polityką dostępu opartą o Twoje konto (Row Level Security). Hasła są hashowane. Połączenia odbywają się przez HTTPS/TLS.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white">5. Twoje prawa (RODO)</h2>
            <p className="mt-2">Masz prawo do wglądu, sprostowania, usunięcia i przenoszenia swoich danych. W każdej chwili możesz usunąć konto z poziomu Ustawień — dane zostają trwale skasowane w ciągu 30 dni.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white">6. Pliki cookie i analityka</h2>
            <p className="mt-2">Używamy wyłącznie technicznych ciasteczek niezbędnych do utrzymania sesji. Nie stosujemy reklamowych skryptów śledzących.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white">7. Kontakt</h2>
            <p className="mt-2">Pytania dotyczące prywatności kieruj na <a className="text-white underline-offset-4 hover:underline" href="mailto:privacy@gymwrld.com">privacy@gymwrld.com</a>.</p>
          </section>
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 text-xs text-white/40">
          © {new Date().getFullYear()} GymWrld. Wszelkie prawa zastrzeżone.
        </div>
      </article>
    </main>
  );
}
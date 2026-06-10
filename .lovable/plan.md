Duży zakres pracy — podzielę na bloki, żebyś widziała co dokładnie zrobię i co wymaga od Ciebie decyzji zanim ruszę. Po Twoim "lecimy" wykonam wszystko w kolejności poniżej.

## 1. Edycja / usuwanie treningów w kalendarzu miesięcznym (`/trening`)
- W widoku miesiąca po kliknięciu w dzień otworzy się lista treningów z tego dnia (już teraz pokazuję, ale tylko read-only).
- Dodam przy każdym wpisie ikony: **edytuj** (zmień typ / czas trwania / kalorie / notatkę) i **usuń** (z potwierdzeniem).
- Zmiany lecą do `gw_workouts` w localStorage i do chmury przez `cloud-state.ts` (już mirroring działa).

## 2. Autorskie treningi "od guru"
- Dodam sekcję "Treningi sygnowane" na `/trening` z listą ~10–15 znanych trenerów/postaci (research, np. Arnold blueprint, Pamela Reif full body, Cbum push, Sylwia Szostak HIIT, Ross Edgley endurance itp.).
- Każdy trening = nazwa, autor, czas, poziom, ćwiczenia, zdjęcie/avatar autora. Klik → szczegóły → "rozpocznij" zapisuje w historii i wbija XP/osiągnięcie.
- **Pytanie do Ciebie:** czy używamy prawdziwych nazwisk (research po publicznych materiałach + atrybucja "inspirowane") czy wymyślamy postacie "trenerów" pod marką GymWrld? Pierwsze opcja niesie ryzyko prawne (wizerunek). Jeśli nie odpowiesz, zrobię opcję 2 (fikcyjni "Coach Nova", "Coach Hawk" itd. z neutralnymi avatarami) — bezpieczniejsze prawnie.

## 3. Tier-locking przepisów (Free / Pro ⭐ / Premium 👑)
- Każdy przepis w `/dieta` dostanie pole `tier: 'free' | 'pro' | 'premium'`.
- Pro = ikona gwiazdki, Premium = korona w rogu kafelka.
- Free user klikający Pro/Premium → modal z porównaniem planów i CTA "Odblokuj" → `/premium`.
- Aktualnie ~30% przepisów Free, 50% Pro, 20% Premium (rozłożę po kategoriach żeby Free user miał co jeść).

## 4. Więcej akcentów logo w aplikacji
- Header dashboardu: małe logo GW po lewej (subtelnie, nie krzykliwie).
- Loadery / spinnery: animowane logo zamiast generycznego spinnera.
- Splash w PWA (już jest) + ekran "Zaraz wracam" przy ładowaniu danych.
- Stopka w "Więcej" z logo + wersją.

## 5. Domena, push, GPS (najważniejsze techniczne)
- Domeny `gymwrld.com`, `www.gymwrld.com`, `app.gymwrld.com` są już aktywne w projekcie ✅ (sprawdziłem URLs).
- **Push notifications** — natywne webpush na iOS Safari wymaga PWA zainstalowanej przez "Dodaj do ekranu głównego" i iOS 16.4+. Na Androidzie działa od razu. Wdrożę:
  - Service worker `firebase-messaging-sw.js` + integracja FCM.
  - Modal "Włącz powiadomienia" po pierwszym logowaniu.
  - Powiadomienia: osiągnięcia, przypomnienia o treningu, woda, cykl.
  - **Wymagam od Ciebie:** klucz VAPID + Firebase project (mogę założyć Ci konto Firebase za darmo, ale potrzebuję byś założyła projekt na firebase.google.com i wkleiła config — instrukcja krok po kroku po Twojej zgodzie). Alternatywnie OneSignal (prościej, mniej setupu).
  - **Pytanie:** Firebase Cloud Messaging czy OneSignal?
- **GPS / geolokalizacja** — przepiszę `/biegi` żeby przy starcie biegu prosił o `navigator.geolocation` (przeglądarka pokaże natywny modal "udostępnij położenie"). Live tracking trasy, dystans z Haversine, pace na żywo. Działa od razu na HTTPS (czyli każda Twoja domena).

## 6. Privacy Policy + zgoda RODO (CRITICAL przed App Store / Play)
- Wstawię krok w onboardingu **zaraz po imię/nick**: ekran z checkboxami:
  - ☐ Akceptuję [Politykę prywatności] (link otwiera modal z pełną treścią)
  - ☐ Akceptuję [Regulamin]
  - ☐ (opcjonalnie) Chcę otrzymywać marketing
- Bez zaznaczenia obu pierwszych → "Dalej" jest disabled.
- Zapisuję `gw_consent` z timestamp + wersją polityki (RODO art. 7 — wykazanie zgody).
- **Treść Privacy Policy / Regulaminu** wygeneruję na podstawie standardu RODO + Apple/Google guidelines: jakie dane zbieramy (email, imię, wiek, waga, wzrost, cele, historia treningów, lokalizacja, zdrowie), w jakim celu, podstawa prawna, retencja, prawa użytkownika (dostęp/usunięcie/eksport), kontakt do administratora, Paddle jako processor płatności, Supabase jako processor danych.
- **Potrzebuję od Ciebie:**
  1. Pełna nazwa firmy / dane administratora (jeśli JDG: imię, nazwisko, NIP, adres; jeśli sp. z o.o.: nazwa, KRS, adres).
  2. Email kontaktowy do RODO (np. privacy@gymwrld.com lub kontakt@).
  3. Czy macie już DPO (Inspektor Ochrony Danych)? Jeśli nie, mogę pominąć tę sekcję.
- Bez tych danych użyję placeholderów `[UZUPEŁNIJ]` żebyś mogła wstawić później, ale przed publikacją MUSI być uzupełnione.

## 7. Non-binary + tracker miesiączki bug
- Bug: wybrałaś NB → avatar męski → zgoda na tracker → nie pojawia się sekcja cyklu na profilu. Powód: warunek widoczności trackera sprawdza `gender === 'k' || gender === 'nb'` ale prawdopodobnie zapisałem `gender: 'm'` (bo wybrałaś męski avatar). Naprawię tak, że tracker pokazuje się gdy `gw_cycle_enabled === true` **niezależnie od gender**.
- Dodam w `/profil` sekcję "Ustawienia":
  - Toggle "Tracker cyklu menstruacyjnego" (włącz/wyłącz w każdej chwili).
  - Przycisk "Zmień avatar" → wraca do edytora avatara z zachowaniem reszty danych.
  - Toggle "Powiadomienia push" (po wdrożeniu pkt 5).

## 8. "Stay logged in" / wybór konta przy logowaniu
- Aktualnie Supabase trzyma sesję w localStorage → po zamknięciu karty user automatycznie zalogowany. Zmienię flow:
  - Na ekranie `/auth` jeśli istnieje aktywna sesja → pokażę kartę "Witaj, [imię] 👋" z avatarem (jak FB) + przyciski **"Kontynuuj jako [imię]"** i **"Zaloguj na inne konto"** (= signOut + reset).
  - Przy logowaniu checkbox **☐ Zapamiętaj mnie** (domyślnie zaznaczony). Jeśli odznaczony → po zamknięciu karty sesja kasowana (`sessionStorage` zamiast `localStorage`, custom storage adapter dla supabase client).
- Plus: button "Wyloguj się" w `/profil` (sprawdzę czy działa i czyści cache).

## 9. Co jeszcze będzie potrzebne do wypchnięcia natywnie (do App Store / Play Store) — checklist
- ✅ Privacy Policy + Terms (pkt 6).
- ⏳ **Capacitor wrapping** — opakowanie PWA w natywną apkę. Wymaga Mac (dla iOS build) lub usługi typu Codemagic / Ionic Appflow.
- ⏳ **Apple Developer Account** ($99/rok) + **Google Play Console** ($25 jednorazowo).
- ⏳ Ikony natywne (1024×1024) + screenshoty (różne rozmiary dla App Store).
- ⏳ Opisy w 2 językach (PL/EN) + słowa kluczowe ASO.
- ⏳ Wiek docelowy + rating (PEGI / ESRB) — pewnie 12+ ze względu na tracker zdrowia.
- ⏳ Apple wymaga **Sign in with Apple** jeśli macie inne OAuth (Google) — dodam przed publikacją.
- ⏳ HealthKit (iOS) / Health Connect (Android) integracja zamiast obecnego demo — wymaga natywnego buildu.
- ⏳ Subscription via Apple/Google IAP (nie Paddle!) dla in-app — Apple/Google biorą 15-30%. Paddle zostaje dla webu.
- ⏳ Dodatkowo: cookie consent banner na landing (`gymwrld.com`).

---

## Co teraz potrzebuję od Ciebie żeby ruszyć
1. **Guru opcja:** prawdziwe nazwiska (ryzyko) czy fikcyjni trenerzy GW?
2. **Push:** Firebase czy OneSignal?
3. **Privacy Policy:** dane administratora (firma/JDG, NIP, adres, email kontaktowy)?

Jak dasz odpowiedzi (albo "wybierz bezpieczniej za mnie") — zaczynam kodować wszystko od razu, blok po bloku.
<!--
Sync Impact Report
- Version change: brak wcześniejszej wersji -> 1.0.0
- Zmodyfikowane zasady: brak; ustanowiono pięć zasad projektu
- Dodane sekcje: Ograniczenia techniczne; Proces wytwarzania
- Usunięte sekcje: brak
- TODO: ustalić pierwotną datę ratyfikacji
-->

# Konstytucja projektu Harmonogram POLSTR

## Zasady podstawowe

### I. Czysta domena i rozdzielenie odpowiedzialności
Logika obliczeń harmonogramu MUSI znajdować się w czystych funkcjach w `src/domena/`;
nie może zależeć od React, wejścia-wyjścia ani czasu systemowego. Route handler MUSI
wyłącznie parsować parametry, wywoływać domenę i zwracać odpowiedź JSON, a interfejs
MUSI pobierać dane przez API. Rationale: rozdzielenie domeny od frameworka umożliwia
niezależne testowanie obliczeń i ogranicza ryzyko rozbieżności między ekranem a API.

### II. Jednoznaczne dane finansowe
Kwoty MUSZĄ być przechowywane jako całkowite liczby groszy albo według jednej jawnie
udokumentowanej konwencji. Zaokrąglanie MUSI odbywać się w jednym określonym miejscu,
a suma części kapitałowych MUSI kończyć się dokładnie kwotą kredytu. Serie wskaźników
MUSZĄ być ładowane z plików JSON przez moduł `src/dane/`; pliki w `dane/` nie mogą
być zmieniane bez wyraźnego polecenia. Rationale: obliczenia finansowe wymagają
powtarzalności, kontroli błędów groszowych i śladu pochodzenia danych.

### III. Test przed implementacją
Każda zmiana logiki domenowej MUSI najpierw otrzymać test w `tests/`, obejmujący
liczbę kontrolną albo jednoznaczny przypadek brzegowy. Minimalny zakres obejmuje raty
równe i malejące, zmianę wskaźnika, oba tryby nadpłaty oraz zgodność sumy kapitału
po zaokrągleniach. Testy MUSZĄ być uruchamiane przed zakończeniem fazy. Rationale:
testy chronią kontrakt obliczeń i pozwalają bezpiecznie rozwijać model finansowy.

### IV. Jawny kontrakt API i interfejsu
`GET /api/harmonogram` MUSI zwracać stabilny JSON zawierający tabelę rat oraz sumę
odsetek, a błędne parametry MUSZĄ skutkować rozpoznawalnym błędem zamiast cichych
wartości domyślnych. Ekran MUSI obsługiwać pełny zakres MVP: formularz, obliczenie,
podsumowanie, tabelę rat i eksport CSV po stronie przeglądarki. Rationale: jawny
kontrakt umożliwia niezależną weryfikację API i przewidywalne użycie przez człowieka.

### V. Prostota i ograniczony zakres MVP
Implementacja MUSI pozostać w zakresie określonym w `BRIEF.md`; nowe zależności,
abstrakcje i rozszerzenia MUSZĄ mieć uzasadnienie w wymaganiu lub usunięciu realnej
złożoności. Świadome uproszczenia MVP, w szczególności użycie wartości wskaźnika
wprost z danych zamiast składania stawek dziennych, MUSZĄ być zachowane i opisane
przy zmianie zakresu. Rationale: mały, sprawdzalny zakres jest warunkiem ukończenia
projektu i ogranicza ryzyko pozornej precyzji finansowej.

## Ograniczenia techniczne

Projekt MUSI używać Next.js App Router, TypeScript w trybie strict, React i Tailwind
zgodnie z istniejącą konfiguracją. Kod TypeScript MUSI unikać `any` i `@ts-ignore`.
Nazwy domenowe, dokumentacja, komentarze oraz komunikaty commitów MUSZĄ być po polsku.
Dane wskaźników MUSZĄ być importowane z `dane/*.json`, bez ręcznego kopiowania serii
do kodu. Produkcja MUSI budować się przez `next build` na Vercel.

## Proces wytwarzania

Praca MUSI przebiegać przez artefakty spec-kit: specyfikację, plan i zadania;
implementacja MUSI realizować zadania w kolejności faz. Każda faza MUSI kończyć się
sprawdzeniem diffu i zatrzymaniem przed rozpoczęciem kolejnej bez polecenia. Przed
zgłoszeniem gotowości MUSZĄ przejść `npm test`, `npm run typecheck` i `npm run build`.
Zmiany MUSZĄ być małe i skupione na wymaganiu; istniejących zmian użytkownika nie wolno
cofać.

## Governance

Ta konstytucja jest nadrzędna wobec lokalnych praktyk, gdy te są z nią sprzeczne.
Zmiana konstytucji MUSI opisać wpływ w raporcie synchronizacji, zwiększyć wersję zgodnie
z regułami poniżej i zachować daty w formacie ISO 8601. Zmiany zasad wymagają przeglądu
przez właściciela projektu przed połączeniem.

Wersja używa semantycznego formatu MAJOR.MINOR.PATCH: MAJOR oznacza usunięcie lub
niekompatybilną zmianę zasady, MINOR dodanie zasady albo istotne rozszerzenie wymagań,
a PATCH oznacza doprecyzowanie bez zmiany obowiązku. Przegląd zgodności MUSI obejmować
zasady tej konstytucji, dokumenty spec-kit, testy oraz bramki jakości. Niezgodność MUSI
być naprawiona albo jawnie zaakceptowana przed wydaniem.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23

# Plan implementacji: Kalkulator harmonogramu POLSTR

**Gałąź**: `001-harmonogram-polstr` | **Data**: 2026-09-23 | **Specyfikacja**: [spec.md](spec.md)

**Wejście**: specyfikacja funkcji z `specs/001-harmonogram-polstr/spec.md` oraz założenia techniczne przekazane do `/speckit-plan`.

**Uwaga**: plan kończy się na projekcie i kontraktach fazy 1; zadania implementacyjne powstaną osobno przez `/speckit-tasks`.

## Podsumowanie

Aplikacja oblicza harmonogram kredytu dla rat równych lub malejących, serii POLSTR 1M albo WIBOR 3M oraz nadpłat obniżających ratę lub skracających okres. Czysta domena TypeScript operuje na kwotach w całkowitych groszach i jawnie przekazanej serii wskaźnika; moduł danych importuje serie JSON, cienki route handler mapuje query string na typy domenowe i zwraca JSON, a dostarczony komponent kliencki pobiera wynik i eksportuje widoczną tabelę do CSV.

## Kontekst techniczny

**Język/wersja**: TypeScript 5.9 w trybie strict, Node.js 22 lub nowszy

**Główne zależności**: Next.js 16.3 App Router, React 19.2, Tailwind CSS 4; bez nowych zależności

**Przechowywanie**: statyczne pliki JSON w `dane/`; bez bazy danych i trwałego zapisu kalkulacji

**Testowanie**: Vitest 4.1; testy wyłącznie modułów domeny i danych w `tests/`

**Platforma docelowa**: Vercel/Node.js dla API oraz współczesne przeglądarki dla ekranu klienckiego

**Typ projektu**: pojedyncza aplikacja internetowa Next.js z route handlerem API

**Cele wydajnościowe**: pełny wynik dla 300 rat w czasie do 2 sekund na typowym komputerze biurowym

**Ograniczenia**: deterministyczna domena bez I/O i bieżącego czasu; kwoty w całkowitych groszach; jedno jawne zaokrąglenie każdej kwoty; route handler bez obliczeń finansowych; ekran bez testów jednostkowych i bibliotek UI

**Skala/zakres**: jeden ekran, jeden endpoint GET, dwie serie wskaźników, dwa typy rat i dwa tryby nadpłaty; do kilkuset pozycji harmonogramu na żądanie

## Kontrola konstytucji

*Bramka: musi przejść przed badaniem fazy 0. Sprawdzić ponownie po projekcie fazy 1.*

- **I. Czysta domena obliczeń — spełniona**: algorytm, walidacja reguł finansowych, daty rat i zaokrąglenia pozostają w `src/domena/`; seria i parametry są przekazywane jawnie.
- **II. Ścisłe typy TypeScript — spełniona**: wejście, wynik, seria, nadpłata i błędy mają jawne typy; plan nie przewiduje `any` ani `@ts-ignore`.
- **III. Testy najpierw — spełniona**: każda faza domeny lub danych zaczyna się czerwonym testem Vitest z liczbą kontrolną; ekran i route handler nie otrzymują testów jednostkowych zgodnie z ograniczeniem projektu.
- **IV. Jednoznaczne kwoty — spełniona**: domena przechowuje wszystkie kwoty w całkowitych groszach, a API konwertuje wejście ze złotych dokładnie raz.
- **V. Polski język projektu — spełniona**: dokumentacja, komunikaty błędów i nazwy domenowe są po polsku.
- **Ograniczenia techniczne — spełnione**: App Router, import JSON w `src/dane/`, cienki route handler i komponent kliencki Tailwind; bez nowych zależności i bez zmian w `dane/`.
- **Przepływ jakości — spełniony projektowo**: implementacja będzie dzielona na fazy z obowiązkowym `npm test`, `npm run typecheck` i `npm run build` po każdej fazie.

**Wynik bramki przed fazą 0**: PASS. Brak odstępstw wymagających uzasadnienia.

## Struktura projektu

### Dokumentacja funkcji

```text
specs/001-harmonogram-polstr/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── harmonogram-api.md
└── tasks.md             # dopiero wynik /speckit-tasks
```

### Kod źródłowy

```text
app/
├── api/harmonogram/route.ts  # parsowanie query string i odpowiedź JSON
└── page.tsx                  # dostarczony ekran kliencki i eksport CSV

src/
├── dane/
│   └── wskazniki.ts          # import i udostępnienie serii JSON
└── domena/
    └── harmonogram.ts        # typy, walidacja i czyste obliczenia

tests/
├── dane.test.ts              # poprawność i wybór serii
└── harmonogram.test.ts       # scenariusze domenowe i liczby kontrolne

dane/
├── polstr-1m.json
└── wibor-3m.json
```

**Decyzja strukturalna**: pozostaje pojedyncza aplikacja Next.js. Granica zależności biegnie od `app/` przez `src/dane/` do czystego `src/domena/`; domena nie importuje warstw zewnętrznych. Dostarczony eksport z Claude Design zastąpi `app/page.tsx` dopiero w ostatniej historii użytkownika.

## Śledzenie złożoności

Brak naruszeń konstytucji wymagających uzasadnienia.

## Ponowna ocena po fazie 1

- Kontrakt API zachowuje przeliczenia jednostek i formatów w route handlerze, a reguły finansowe w domenie.
- Model danych utrzymuje kwoty wyłącznie w groszach i nie wprowadza niejawnych źródeł czasu ani I/O.
- Quickstart ogranicza testy Vitest do domeny i danych oraz obejmuje wszystkie trzy obowiązkowe polecenia jakości.
- Projekt nie dodaje zależności ani zmian w plikach `dane/*.json`.

**Wynik bramki po fazie 1**: PASS. Brak odstępstw.

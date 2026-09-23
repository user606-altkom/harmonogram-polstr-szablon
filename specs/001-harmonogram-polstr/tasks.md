---

description: "Lista zadań implementacyjnych kalkulatora harmonogramu POLSTR"
---

# Zadania: Kalkulator harmonogramu POLSTR

**Wejście**: Artefakty projektowe z `specs/001-harmonogram-polstr/`

**Wymagania wstępne**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/harmonogram-api.md](contracts/harmonogram-api.md), [quickstart.md](quickstart.md)

**Testy**: Testy Vitest dotyczą wyłącznie domeny i danych. Każdą zmianę obliczeń poprzedza test z oczekiwanym wynikiem.

**Organizacja**: Zadania pogrupowano według historii użytkownika, aby każdy przyrost można było niezależnie sprawdzić.

## Format: `[ID] [P?] [Historia] Opis`

- **[P]**: zadanie można wykonać równolegle, ponieważ dotyczy innego pliku i nie zależy od niedokończonych zadań
- **[Historia]**: historia użytkownika, której dotyczy zadanie
- Każdy opis podaje dokładną ścieżkę pliku

## Faza 1: Setup (istniejący szkielet)

**Cel**: Brak zadań. Szkielet Next.js, TypeScript, Tailwind i Vitest już istnieje.

## Faza 2: Fundamenty

**Cel**: Brak zadań blokujących. Typy oraz funkcje domenowe powstają wraz z pierwszą historią, aby zachować testy najpierw.

## Faza 3: Historia użytkownika 1 - Raty równe przy stałej stopie (Priorytet: P1)

**Cel historii**: Użytkownik otrzymuje harmonogram rat równych dla stałej stopy rocznej, z ostatnią ratą wyrównującą saldo.

**Niezależne kryterium testowe**: Dla 40 000 000 gr, 300 rat, serii stałej `0.0355` przekazanej wprost i marży `0.0211`, pierwsza rata wynosi 249 472 gr +/- 5 gr, ostatnia 249 253 gr +/- 5 gr, suma kapitału wynosi 40 000 000 gr, a saldo końcowe 0 gr.

- [ ] T001 [US1] Dodać w `tests/harmonogram.test.ts` czerwony test liczby kontrolnej z `BRIEF.md` dla rat równych przy stałej stopie, przekazując serię `0.0355` wprost, oraz usunąć z `tests/smoke.test.ts` przestarzałą asercję wyjątku `nie zaimplementowano` albo zastąpić ją asercją aktualnego harmonogramu
- [ ] T002 [US1] Zdefiniować w `src/domena/harmonogram.ts` jawne typy parametrów, wpisu serii, raty i harmonogramu z kwotami jako całkowite liczby groszy
- [ ] T002A [US1] Dodać w `tests/harmonogram.test.ts` czerwone przypadki walidacji dla nie dodatniej kwoty lub liczby rat, nieistniejącej daty `YYYY-MM-DD`, ujemnej lub nieskończonej marży oraz pustej lub niepoprawnej serii wskaźnika
- [ ] T003 [US1] Zaimplementować w `src/domena/harmonogram.ts` walidację dodatniej kwoty i liczby rat, istniejącej daty `YYYY-MM-DD`, nieujemnej skończonej marży oraz niepustej poprawnej serii
- [ ] T004 [US1] Zaimplementować w `src/domena/harmonogram.ts` czystą funkcję obliczającą raty równe według stopy `(wskaznik + marza) / 12`, z `Math.round` do grosza i wyrównaniem ostatniej raty do salda
- [ ] T005 [US1] Uruchomić test kontrolny w `tests/harmonogram.test.ts` i doprowadzić go do wyniku zgodnego z tolerancją z `BRIEF.md`

## Faza 4: Rozszerzenie historii użytkownika 1 - Zmienne stopy i raty malejące

**Cel historii**: Użytkownik może wybrać POLSTR 1M albo WIBOR 3M oraz raty malejące, a harmonogram stosuje właściwą wartość stopy dla daty raty.

**Niezależne kryterium testowe**: Testy potwierdzają równy podział kapitału w ratach malejących, użycie zmienionej stopy od właściwej daty oraz użycie ostatniej wartości serii po jej zakończeniu.

- [ ] T006 [P] [US1] Dodać w `tests/dane.test.ts` testy importu serii POLSTR 1M i WIBOR 3M oraz wyboru właściwej serii przez jej identyfikator
- [ ] T007 [P] [US1] Dodać w `tests/harmonogram.test.ts` czerwone testy rat malejących, zmiany stopy od daty wpisu, użycia ostatniej znanej wartości serii oraz generowania dat w UTC z przejściem z `2026-01-31` na ostatni dzień lutego `2026-02-28`
- [ ] T008 [US1] Zaimplementować w `src/dane/wskazniki.ts` import JSON z `dane/polstr-1m.json` i `dane/wibor-3m.json` oraz typowany wybór serii bez modyfikowania plików `dane/`
- [ ] T009 [US1] Rozszerzyć w `src/domena/harmonogram.ts` wybór stopy o najpóźniejszy wpis z `od <= dataRaty`, błąd dla raty sprzed pierwszego wpisu i utrzymanie ostatniej wartości po końcu serii
- [ ] T010 [US1] Rozszerzyć w `src/domena/harmonogram.ts` generowanie dat miesięcznych w UTC, używając ostatniego dnia miesiąca, gdy docelowy dzień nie istnieje
- [ ] T011 [US1] Rozszerzyć w `src/domena/harmonogram.ts` obliczenia o typ `malejace`, w którym kapitał jest dzielony równo na pozostałe planowane raty, a saldo nie może spaść poniżej zera
- [ ] T012 [US1] Uruchomić testy domeny i danych w `tests/harmonogram.test.ts` oraz `tests/dane.test.ts` dla zmiennych stóp i rat malejących

## Faza 5: Historia użytkownika 2 - Nadpłaty (Priorytet: P2)

**Cel historii**: Użytkownik może dodać nadpłaty obniżające kolejne raty albo skracające okres kredytu.

**Niezależne kryterium testowe**: Dwa harmonogramy z identyczną nadpłatą wykazują odpowiednio zachowanie daty końcowej z niższą kolejną ratą albo krótszą liczbę rat; żaden nie ma ujemnego salda.

- [ ] T013 [US2] Dodać w `tests/harmonogram.test.ts` czerwone testy nadpłat `obniz_rate` i `skroc_okres`, sumowania zgodnych nadpłat, ograniczenia nadpłaty do pozostałego salda oraz zakończenia obu trybów w miesiącu całkowitej spłaty
- [ ] T014 [US2] Rozszerzyć w `src/domena/harmonogram.ts` o walidację nadpłaty: „liczba całkowita od 1 do planowanej liczby rat”, „dodatnia liczba całkowita w groszach” oraz odrzucenie sprzecznych trybów w tym samym miesiącu
- [ ] T015 [US2] Zaimplementować w `src/domena/harmonogram.ts` sumowanie nadpłat tego samego miesiąca i trybu oraz kolejność: odsetki od salda początkowego, planowany kapitał, ograniczona nadpłata
- [ ] T016 [US2] Zaimplementować w `src/domena/harmonogram.ts` tryb `obniz_rate`, zachowujący pierwotną liczbę rat i przeliczający kolejne raty dla nowego salda, z wyjątkiem zakończenia harmonogramu w miesiącu, w którym planowana spłata lub nadpłata wyzeruje saldo
- [ ] T017 [US2] Zaimplementować w `src/domena/harmonogram.ts` tryb `skroc_okres`, kończący harmonogram bez dalszych rat bezpośrednio po spłacie całego salda
- [ ] T018 [US2] Uruchomić testy nadpłat i niezmienników w `tests/harmonogram.test.ts`, potwierdzając sumę kapitału równą kwocie kredytu i saldo końcowe 0 gr

## Faza 6: Warstwa techniczna - Publiczne API harmonogramu

**Cel**: Klient HTTP otrzymuje harmonogram w groszach przez kontraktowy endpoint GET oraz zrozumiałe błędy walidacji.

**Niezależne kryterium testowe**: Ręczne wywołanie kontraktowego adresu zwraca status 200, kompletne raty w groszach i saldo końcowe 0 gr; brak wymaganej wartości zwraca 400 i wyłącznie pole `blad`.

- [ ] T018A Dodać czerwone testy kontraktu API dla odrzucenia `kwota` oraz kwoty `nadplata` z więcej niż dwoma miejscami po przecinku, oczekując statusu 400 i odpowiedzi zawierającej wyłącznie pole `blad`
- [ ] T019 Zaimplementować w `app/api/harmonogram/route.ts` parsowanie parametrów kontraktu `kwota`, `liczbaRat`, `pierwszaRata`, `marza`, `typRat`, `wskaznik` i powtarzalnego `nadplata`
- [ ] T020 Zaimplementować w `app/api/harmonogram/route.ts` jawne odrzucenie kwot `kwota` i `nadplata` z więcej niż dwoma miejscami po przecinku przed konwersją ze złotych do groszy oraz pojedynczą konwersję zaakceptowanych kwot i punktów procentowych marży do ułamka
- [ ] T021 Podłączyć w `app/api/harmonogram/route.ts` wybór serii z `src/dane/wskazniki.ts` i funkcję z `src/domena/harmonogram.ts`, pozostawiając obliczenia wyłącznie w domenie
- [ ] T022 Zaimplementować w `app/api/harmonogram/route.ts` odpowiedzi 200 z kontraktowym JSON, 400 z `{ "blad": string }` dla błędów wejścia i 500 bez szczegółów stosu dla błędów nieoczekiwanych
- [ ] T023 Ręcznie zweryfikować w `specs/001-harmonogram-polstr/quickstart.md` opisane wywołania endpointu oraz odpowiedzi 200 i 400

## Faza 7: Historia użytkownika 3 - Ekran kalkulatora (Priorytet: P3)

**Cel historii**: Użytkownik uruchamia obliczenia z formularza, widzi kluczowe wyniki i tabelę rat oraz pobiera zgodny CSV.

**Niezależne kryterium testowe**: W przeglądarce użytkownik wprowadza poprawne dane, widzi pierwszą i ostatnią ratę, sumę odsetek i tabelę, a wyeksportowany CSV odpowiada tabeli; błędne dane nie pozostawiają starego wyniku.

- [ ] T024 [US3] Zastąpić w `app/page.tsx` dostarczonym komponentem React z dyrektywą `'use client'` w pierwszej linii, zachowując Tailwind i bez bibliotek UI
- [ ] T025 [US3] Podłączyć w `app/page.tsx` formularz parametrów do `fetch('/api/harmonogram?...')`, serializując wszystkie pola oraz powtarzalne nadpłaty zgodnie z `contracts/harmonogram-api.md`
- [ ] T026 [US3] Zaimplementować w `app/page.tsx` stan ładowania, komunikat pola `blad`, czyszczenie poprzedniego wyniku po błędzie oraz prezentację pierwszej raty, ostatniej raty, sumy odsetek i tabeli rat
- [ ] T027 [US3] Zaimplementować w `app/page.tsx` eksport CSV po stronie przeglądarki z kolumnami widocznej tabeli i wartościami po zaokrągleniu
- [ ] T028 [US3] Ręcznie zweryfikować w `app/page.tsx` pełny przepływ formularza, tabeli, błędu i pobrania CSV opisany w `specs/001-harmonogram-polstr/quickstart.md`

## Faza 8: Dopracowanie i zagadnienia przekrojowe

**Cel**: Potwierdzić zgodność jakościową kompletnego przyrostu bez rozszerzania zakresu.

- [ ] T029 Przejrzeć `src/domena/harmonogram.ts`, `src/dane/wskazniki.ts`, `app/api/harmonogram/route.ts` i `app/page.tsx` pod kątem strict TypeScript, braku `any`, polskich komunikatów oraz granicy czystej domeny
- [ ] T029A Dodać w `tests/wydajnosc.test.ts` jawny pomiar czasu obliczenia kompletnego przypadku kontrolnego z 300 ratami i asercję wyniku poniżej 2 sekund, zgodnie z SC-003
- [ ] T030 Uruchomić `npm test`, `npm run typecheck` i `npm run build` z katalogu głównego repozytorium, uwzględniając pomiar wydajności z T029A

## Zależności i kolejność realizacji

- Fazy 1 i 2 są celowo puste, ponieważ szkielet projektu już istnieje i nie ma wspólnego blokeru poza zadaniami historii.
- US1 jest MVP i obejmuje obliczenia podstawowe, zmienne stopy oraz raty malejące.
- US2 zależy od gotowych obliczeń i typów US1.
- Warstwa API zależy od gotowej domeny, danych i typów US1-US2.
- US3 jest ostatnia i zależy od kontraktu endpointu oraz funkcji US1-US2.
- Dopracowanie następuje po wszystkich historiach.

```text
US1 -> US2 -> API -> US3 -> Dopracowanie
```

## Przykłady pracy równoległej

- Po gotowym T001, T002 i T003 zadania T006 oraz T007 mogą powstawać równolegle w oddzielnych plikach testowych.
- Po zatwierdzeniu interfejsu domeny z US2 zadania T019 i przygotowanie dostarczonego komponentu dla T024 mogą toczyć się równolegle, ale T024-T028 są wykonywane dopiero po ukończeniu kontraktu API.
- W każdej historii zadanie testowe poprzedza implementację tej samej funkcji; równoległość nie omija zasady testów najpierw.

## Strategia wdrożenia

1. Dostarczyć MVP z US1: czysty harmonogram rat równych przy stałej stopie i kontrolną liczbą z `BRIEF.md`.
2. Rozszerzyć US1 o serie i raty malejące, a następnie dodać US2 z nadpłatami.
3. Udostępnić gotową domenę przez warstwę API, a następnie podłączyć ekran US3.
4. Po każdej fazie wykonać właściwe testy, pokazać diff i nie zaczynać kolejnej fazy bez polecenia.
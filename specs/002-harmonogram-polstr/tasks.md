# Zadania: Harmonogram POLSTR

**Input**: Dokumenty projektowe z `/specs/002-harmonogram-polstr/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/harmonogram-api.md, research.md, quickstart.md

**Tests**: Zgodnie z wymaganiami spec.md, testy domeny i danych są obowiązkowe dla każdej fazy user story. Testy są pisane przed implementacją, a liczby kontrolne są weryfikowane w scenariuszach US1 i US2.

**Organization**: Zadania są pogrupowane według user story, aby każda historia mogła być rozwijana i testowana niezależnie.

## Format: `[ID] [P?] [Story] Opis`

- **[P]**: zadanie równoległe (inny plik / brak zależności)
- **[Story]**: etykieta US1, US2, US3
- ścieżki plików są dokładne i odwołują się do repozytorium

---

## Faza 1: Setup (wspólna infrastruktura)

**Cel**: Inicjalizacja i potwierdzenie podstawowego modelu projektu.

- [ ] T001 Ustal linię bazową zadań i potwierdź przebieg implementacji kalkulatora POLSTR w istniejącej aplikacji Next.js
- [ ] T002 [P] Przejrzyj i zablokuj wspólny kontrakt danych dla `src/dane/wskazniki.ts` i `dane/*.json` przed dodaniem logiki domenowej
- [ ] T003 [P] Ustaw podstawowy zestaw testów w `tests/smoke.test.ts` do weryfikacji kolejności danych i założeń środowiska

**Checkpoint**: Setup gotowy — można rozpocząć fundament.

---

## Faza 2: Foundational (blokujące wymagania wstępne)

**Cel**: Czyste typy domenowe, walidacja wejścia i cienki endpoint API muszą być gotowe zanim rozpocznie się praca nad user story.

- [ ] T004 Zdefiniuj wspólne kontrakty domenowe w `src/domena/harmonogram.ts` dla `ParametryKredytu`, `Nadplata`, `RataHarmonogramu` i `Harmonogram`
- [ ] T005 [P] Zaimplementuj wspólne helpery wartości dla konwersji oprocentowania miesięcznego, zaokrąglania do grosza i walidacji bezpiecznej dla zera w `src/domena/harmonogram.ts`
- [ ] T006 [P] Zaimplementuj walidację wejścia dla kwoty kredytu, liczby rat, daty pierwszej raty, marży i trybu płatności w `src/domena/harmonogram.ts`
- [ ] T007 Zaimplementuj cienki parser żądań API i kontrakt odpowiedzi błędu w `app/api/harmonogram/route.ts`, aby parametry query były walidowane bez liczenia logiki biznesowej

**Checkpoint**: Warstwa fundamentów gotowa — user stories mogą ruszyć równolegle.

---

## Faza 3: User Story 1 - Obliczenie podstawowego harmonogramu (Priority: P1) 🎯 MVP

**Cel**: Obliczyć pełny harmonogram dla rat równych i malejących przy stałym oprocentowaniu.

**Independent Test**: Wprowadzić kredyt 400 000 zł, 300 rat, marżę 2,11 pp i stałą serię POLSTR 3,55%, a następnie zweryfikować pierwszą i ostatnią ratę, saldo i sumę odsetek.

### Testy dla User Story 1

- [ ] T008 [P] [US1] Dodaj test domenowy z oczekiwanym wynikiem dla przypadku rat równych w `tests/harmonogram-us1.test.ts`
- [ ] T009 [P] [US1] Dodaj test domenowy z oczekiwanym wynikiem dla przypadku rat malejących w `tests/harmonogram-us1.test.ts`

### Implementacja dla User Story 1

- [ ] T010 [US1] Zaimplementuj obliczanie harmonogramu dla rat równych w `src/domena/harmonogram.ts` z ustabilizowanym oprocentowaniem miesięcznym i finalnym dopasowaniem
- [ ] T011 [US1] Zaimplementuj obliczanie harmonogramu dla rat malejących w `src/domena/harmonogram.ts` z proporcjonalnym przydziałem kapitału i końcową ratą wyrównującą
- [ ] T012 [US1] Wymuś logikę okresu oprocentowania i upewnij się, że ostatnia rata rozlicza pozostały kapitał bez ujemnego salda w `src/domena/harmonogram.ts`
- [ ] T013 [P] [US1] Udostępnij pierwszą ratę, ostatnią ratę, łączne odsetki i pełną tabelę w typie zwrotnym domeny w `src/domena/harmonogram.ts`
- [ ] T014 [US1] Podłącz zwalidowany kształt żądania i odpowiedzi w `app/api/harmonogram/route.ts` i zwracaj spójny payload JSON dla podstawowego harmonogramu
- [ ] T015 [P] [US1] Zaktualizuj ekran demo w `app/page.tsx`, aby wyświetlał podsumowanie, tabelę i przykładowy stan zapytania dla działającego harmonogramu bazowego

**Checkpoint**: User Story 1 jest niezależnie funkcjonalna i testowalna.

---

## Faza 4: User Story 2 - Uwzględnienie zmian wskaźnika i nadpłat (Priority: P1)

**Cel**: Dodać wskaźniki POLSTR 1M i WIBOR 3M oraz obsługę nadpłat w trybie obniż raty i skróć okres.

**Independent Test**: Przetestować serię z kolejnymi zmianami stopy, zastosować dwie nadpłaty w różnych trybach i sprawdzić, czy saldo końcowe wynosi zero oraz że okres lub rata zmieniają się poprawnie.

### Testy dla User Story 2

- [ ] T016 [P] [US2] Dodaj test z walidacją zmian stóp i fallbacku do ostatniej znanej wartości w `tests/harmonogram-us2.test.ts`
- [ ] T017 [P] [US2] Dodaj test dla trybów nadpłaty "obnizRate" i "skrocOkres" w `tests/harmonogram-us2.test.ts`

### Implementacja dla User Story 2

- [ ] T018 [US2] Zaimplementuj dobór serii i reguły fallbacku dla `POLSTR_1M` i `WIBOR_3M` w `src/dane/wskazniki.ts` i `src/domena/harmonogram.ts`
- [ ] T019 [US2] Zaimplementuj stosowanie stopy miesięcznej i kwartalnej zgodnie z odpowiednią serią i datą płatności w `src/domena/harmonogram.ts`
- [ ] T020 [US2] Zaimplementuj strategię nadpłaty "obnizRate", która zachowuje datę końca harmonogramu i przelicza kolejne raty w `src/domena/harmonogram.ts`
- [ ] T021 [US2] Zaimplementuj strategię nadpłaty "skrocOkres", która skraca pozostały harmonogram i zatrzymuje się przy saldzie zero w `src/domena/harmonogram.ts`
- [ ] T022 [US2] Wymuś reguły walidacji dla kwoty nadpłaty, przypisania miesiąca i płatności po zakończeniu w `src/domena/harmonogram.ts`
- [ ] T023 [P] [US2] Parsuj i waliduj zakodowane w URL dane JSON `nadplaty` w `app/api/harmonogram/route.ts` i przekaż znormalizowaną listę do obliczenia w domenie
- [ ] T024 [US2] Uruchom niezależne testy regresyjne US2 i potwierdź, że harmonogram pozostaje spójny po każdym scenariuszu trybu płatności

**Checkpoint**: User Stories 1 i 2 działają niezależnie i mogą być porównywane obok siebie.

---

## Faza 5: User Story 3 - Odczyt i eksport wyników (Priority: P2)

**Cel**: Zaprezentować podsumowanie i umożliwić eksport tabeli wyników do CSV bez utraty danych.

**Independent Test**: Po wygenerowaniu poprawnego harmonogramu sprawdzić pierwszą i ostatnią ratę, sumę odsetek oraz pobrać CSV zawierający te same rekordy co tabela na ekranie.

### Testy dla User Story 3

- [ ] T025 [P] [US3] Dodaj test do walidacji podsumowania i eksportu w `tests/harmonogram-us3.test.ts`
- [ ] T026 [P] [US3] Dodaj test do walidacji niepoprawnych parametrów wejściowych w `tests/harmonogram-us3.test.ts`

### Implementacja dla User Story 3

- [ ] T027 [US3] Dodaj pola podsumowania końcowego do wyniku domenowego w `src/domena/harmonogram.ts` bez zmiany struktury surowej tabeli rat
- [ ] T028 [US3] Zaimplementuj helper eksportu CSV po stronie klienta i akcję pobierania w `app/page.tsx`
- [ ] T029 [US3] Wyświetl karty podsumowania, tabelę i stany pusty/błąd w `app/page.tsx` przy użyciu tych samych wartości zwracanych przez API
- [ ] T030 [US3] Dodaj przyjazne komunikaty błędów walidacji i przykłady w `app/api/harmonogram/route.ts`, aby niepoprawne dane zwracały czytelny błąd `400 Bad Request`
- [ ] T031 [P] [US3] Sprawdź, czy wiersze CSV odpowiadają wartościom w tabeli renderowanej oraz że dokumenty w `specs/002-harmonogram-polstr/` są zgodne z finalnym zachowaniem

**Checkpoint**: Wszystkie user stories są niezależnie funkcjonalne i funkcja jest gotowa do dopracowania.

---

## Faza 6: Polish & Cross-Cutting Concerns

**Cel**: Dopracowanie jakości, spójności i końcowa walidacja całego zakresu.

- [ ] T032 [P] Przejrzyj i dopracuj strategię zaokrąglania w `src/domena/harmonogram.ts`, aby suma części kapitałowych dokładnie odpowiadała kwocie kredytu z dokładnością do jednego grosza
- [ ] T033 [P] Uporządkuj wspólne nazewnictwo w UI i API, komunikaty walidacji oraz obsługę przypadków brzegowych w `app/page.tsx` i `app/api/harmonogram/route.ts`
- [ ] T034 Uruchom scenariusze z `specs/002-harmonogram-polstr/quickstart.md` i zweryfikuj zgodność przykładów z zaimplementowanym zachowaniem
- [ ] T035 Uruchom pełną walidację z `npm test`, `npm run typecheck` i `npm run build` oraz napraw wszelkie pozostałe regresje

---

## Zależności i kolejność wykonania

### Zależności faz

- **Setup (Faza 1)**: brak zależności
- **Foundational (Faza 2)**: musi zostać zakończony przed rozpoczęciem pracy nad jakimkolwiek user story
- **User Story 1 (Faza 3)**: niezależne od US2/US3, priorytet P1
- **User Story 2 (Faza 4)**: niezależne od US1/US3, ale może wykorzystywać wspólną logikę domenową
- **User Story 3 (Faza 5)**: zależy od stabilnego kształtu API domeny z US1/US2
- **Polish (Faza 6)**: zależy od ukończenia wszystkich wymaganych user stories

### Zależności user stories

- **US1**: brak zależności od innych story; jest bazą MVP
- **US2**: zależy od modelu domeny i kontraktu API ustalonego w Faza 2; może działać równolegle z US1, jeśli domena jest wspólna
- **US3**: zależy od gotowego, stabilnego wyniku harmonogramu z US1 i US2

### Możliwości równoległości

- Zadania T002 i T003 można uruchomić równolegle w fazie 1.
- Zadania T005 i T006 można uruchomić równolegle w fazie foundational.
- Testy dla US1 i US2 można tworzyć równolegle po zdefiniowaniu kontraktu domeny.
- Zadania renderowania UI i walidacji API dla US3 mogą przebiegać równolegle po ustabilizowaniu wyniku harmonogramu.
- Zadania polish T032 i T033 mogą być wykonywane równolegle przed końcową walidacją.

---

## Strategia wdrożenia

### MVP First (tylko User Story 1)

1. Ukończ Faza 1 i Faza 2.
2. Zakończ User Story 1 i zweryfikuj liczby kontrolne.
3. Zatrzymaj się i potwierdź poprawność harmonogramu przed rozszerzeniem do US2 lub US3.

### Dostarczanie incremental

1. Setup + Foundational → kształt domeny i kontrakt API są stabilne.
2. User Story 1 → działające obliczenie i podsumowanie.
3. User Story 2 → logika zmiennej stopy i nadpłat.
4. User Story 3 → renderowanie, eksport i UX walidacji.
5. Polish → finalna jakość i weryfikacja gotowości produkcyjnej.

---

## Uwagi

- Wszystkie zadania muszą korzystać z formatu checklist: `- [ ] T### ...` z identyfikatorem, etykietą [P] i [USx] tam, gdzie to wymagane.
- Zadania w fazach user story są uporządkowane tak, aby każda historia była weryfikowalna niezależnie.
- Każda zmiana logiki obliczeń wymaga testu kontrolnego z liczbą referencyjną.
- Nie dodajemy nowych zależności bez uzasadnienia i akceptacji w pracach projektu.

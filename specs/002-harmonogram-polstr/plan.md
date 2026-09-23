# Implementation Plan: Kalkulator harmonogramu POLSTR

**Branch**: `002-harmonogram-polstr` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-harmonogram-polstr/spec.md`

## Summary

Kalkulator wylicza miesięczny harmonogram kredytu hipotecznego dla POLSTR 1M i WIBOR 3M,
rat równych i malejących oraz nadpłat. Obliczenia pozostają w czystej domenie, która
otrzymuje serię wskaźnika z modułu danych; route handler parsuje query string, a ekran
klienta pobiera JSON i eksportuje tabelę do CSV.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js >=22, tryb strict

**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest 4

**Storage**: Pliki JSON w `dane/`, importowane przez `src/dane/wskazniki.ts`; brak bazy danych

**Testing**: Vitest dla domeny i danych; `npm run typecheck`; `npm run build`

**Target Platform**: Przeglądarka oraz środowisko Vercel/Node.js dla route handlera

**Project Type**: Aplikacja webowa Next.js z endpointem JSON

**Performance Goals**: Harmonogram do 360 rat w czasie poniżej 10 sekund; obliczenia liniowe względem liczby rat

**Constraints**: Kwoty w groszach, zaokrąglanie do grosza w jednym miejscu, brak `any` i `@ts-ignore`, brak nowych zależności

**Scale/Scope**: MVP: jeden ekran, dwa wskaźniki, dwa typy rat, lista nadpłat, eksport CSV; bez historii i logowania

## Constitution Check

*GATE: PASS*

- I. Czysta domena: logika pozostaje w `src/domena/`, API tylko parsuje i deleguje.
- II. Jednoznaczne dane finansowe: kwoty są całkowitymi groszami, a serie pochodzą z JSON.
- III. Test przed implementacją: plan wymaga testów kontrolnych dla rat, zmian stóp, nadpłat i sumy kapitału.
- IV. Jawny kontrakt: plan obejmuje stabilny JSON, błędy walidacji, formularz, tabelę i CSV.
- V. Prostota MVP: wykorzystane zostaną istniejące zależności i moduły, bez zmiany danych wskaźników.

## Project Structure

### Documentation

```text
specs/002-harmonogram-polstr/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/harmonogram-api.md
```

### Source Code

```text
app/
├── page.tsx                    # formularz, wynik, tabela i eksport CSV
└── api/harmonogram/route.ts    # walidacja query string i delegowanie do domeny
src/
├── dane/wskazniki.ts           # import serii z dane/*.json
└── domena/harmonogram.ts       # czyste typy, walidacja i obliczenia
tests/
└── smoke.test.ts               # testy danych i domeny
```

**Structure Decision**: Istniejąca aplikacja Next.js pozostaje jedynym projektem.
Warstwa domenowa nie importuje frameworka ani I/O; moduł danych jest jedynym miejscem
łączenia typów domenowych z plikami JSON. Kontrakt publiczny jest opisany osobno w
`contracts/harmonogram-api.md`, a testy domeny pozostają w `tests/`.

## Complexity Tracking

Brak naruszeń konstytucji wymagających dodatkowej złożoności.

## Phase 0: Research Summary

Decyzje i uzasadnienia zapisano w [research.md](research.md). Najważniejsze: oprocentowanie
okresu to wskaźnik plus marża, odsetki są proste i miesięczne, a nadpłata jest stosowana
po racie w wybranym miesiącu. Wartości sprzed pierwszego wpisu używają pierwszej dostępnej
stawki, a po ostatnim wpisie ostatniej znanej stawki.

## Phase 1: Design Summary

Model danych znajduje się w [data-model.md](data-model.md), kontrakt endpointu w
[contracts/harmonogram-api.md](contracts/harmonogram-api.md), a scenariusze walidacyjne
w [quickstart.md](quickstart.md).

## Constitution Check (Post-Design)

*GATE: PASS* — projekt zachowuje czystą domenę, całkowite grosze, testy z liczbami
kontrolnymi, jawny kontrakt API oraz zakres MVP bez nowych zależności.

<!--
Sync Impact Report
Version change: brak formalnej wersji -> 1.0.0
Modified principles: brak -> pięć zasad podstawowych
Added sections: Ograniczenia techniczne; Przepływ pracy i jakość
Removed sections: opis szablonu projektu
Follow-up TODOs: brak.
-->

# Harmonogram na POLSTR Constitution

## Core Principles

### I. Czysta domena obliczeń

Cała logika harmonogramu MUSI znajdować się w `src/domena/` jako czyste funkcje TypeScript.
Kod domeny NIE MOŻE importować Reacta, wykonywać I/O ani odczytywać bieżącego czasu. Dzięki temu
obliczenia pozostają deterministyczne, niezależne od interfejsu i łatwe do weryfikacji.

### II. Ścisłe typy TypeScript

Projekt MUSI działać z włączonym trybem strict TypeScript. Kod NIE MOŻE używać `any` ani
`@ts-ignore`; każdy kontrakt wejścia, wyjścia i danych domenowych MUSI mieć jawny typ.
Zapobiega to niejednoznacznym wynikom obliczeń finansowych.

### III. Testy najpierw

Zmianę logiki domenowej lub danych MUSI poprzedzać test Vitest w `tests/`, który opisuje oczekiwany
wynik i najpierw kończy się niepowodzeniem. Testy obejmują wyłącznie domenę i dane, a każda zmiana
obliczeń MUSI zawierać liczbę kontrolną. TDD chroni reguły kredytowe przed regresją.

### IV. Jednoznaczne kwoty

Kwoty MUSZĄ być przechowywane jako całkowite liczby groszy albo projekt MUSI wskazać jedno miejsce
zaokrąglania. Implementacja NIE MOŻE zaokrąglać pośrednio w różnych warstwach. Ta zasada zapewnia
powtarzalność sum rat i eliminuje rozbieżności wynikające z arytmetyki zmiennoprzecinkowej.

### V. Polski język projektu

Dokumentacja, komentarze w kodzie i komunikaty commitów MUSZĄ być po polsku. Nazwy domenowe MUSZĄ
być polskimi pełnymi wyrażeniami, bez niejednoznacznych skrótów. Wspólny język upraszcza kontrolę
merytoryczną przez zespół i odbiorców projektu.

## Ograniczenia techniczne

Aplikacja MUSI używać Next.js App Router. Ekran główny jest komponentem klienckim i korzysta z
Tailwind do stylów. Route handler API wyłącznie parsuje parametry, wywołuje domenę i zwraca JSON;
nie zawiera obliczeń. Dane wskaźników są importowane z plików JSON przez moduły w `src/dane/`.

Nowe zależności wymagają uzasadnienia w opisie PR przed ich dodaniem. Zmiany danych w `dane/`
wymagają wyraźnego polecenia, ponieważ testy je wczytują.

## Przepływ pracy i jakość

Praca MUSI przebiegać w małych fazach i commitach zgodnych z `tasks.md`. Po zakończeniu fazy autor
MUSI przedstawić diff i NIE MOŻE rozpocząć kolejnej fazy bez polecenia. Przed zgłoszeniem gotowości
każda zmiana MUSI przejść `npm test`, `npm run typecheck` oraz `npm run build`.

## Governance

Ta konstytucja ma pierwszeństwo przed pozostałymi praktykami projektu. Zmiana zasad wymaga
udokumentowanej aktualizacji tego pliku, oceny wpływu na istniejące artefakty i przeglądu zgodności
w PR. Wersjonowanie stosuje semver: MAJOR dla niezgodnego przedefiniowania lub usunięcia zasad,
MINOR dla nowej zasady lub istotnego rozszerzenia, PATCH dla doprecyzowań bez zmiany znaczenia.

Przegląd kodu MUSI weryfikować zgodność z konstytucją oraz z `AGENTS.md`; odstępstwo wymaga
udokumentowanego uzasadnienia i akceptacji w PR.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23

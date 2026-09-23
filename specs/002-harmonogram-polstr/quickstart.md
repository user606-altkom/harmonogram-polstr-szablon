# Quickstart walidacji

## Wymagania

Node.js >=22 i zależności zainstalowane przez `npm install`.

## Walidacja automatyczna

```powershell
npm test
npm run typecheck
npm run build
```

Oczekiwany wynik: testy domeny i danych przechodzą, TypeScript nie zgłasza błędów, a `next build` kończy się sukcesem.

## Uruchomienie endpointu

```powershell
npm run dev
```

Następnie otwórz:

```text
http://localhost:3000/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01
```

Odpowiedź 200 musi zawierać pełną tablicę `raty`, sumę odsetek oraz pola opisane w [kontrakcie API](contracts/harmonogram-api.md). Dla stałej serii testowej 3,55% plus marża 2,11% pierwsza rata wynosi około 249472 grosze.

## Scenariusze ręczne

1. Zmień `wskaznik` na `WIBOR_3M` i sprawdź, że wpis kwartalny obowiązuje przez kolejne miesiące.
2. Dodaj URL-enkodowany parametr `nadplaty` z trybem `obnizRate` i sprawdź niższe kolejne raty przy tym samym terminie.
3. Użyj trybu `skrocOkres` i sprawdź wcześniejsze saldo zerowe oraz brak dalszych rekordów.
4. Usuń `liczbaRat` albo ustaw `marza=-1`; oczekiwany jest status 400 z komunikatem wskazującym parametr.
5. W ekranie kalkulatora uruchom obliczenie i eksport CSV; liczba wierszy oraz wartości muszą odpowiadać tabeli.

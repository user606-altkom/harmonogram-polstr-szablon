# Szybka walidacja: Kalkulator harmonogramu POLSTR

## Wymagania

- Node.js 22 lub nowszy.
- Zainstalowane zależności z istniejącego `package-lock.json` przez `npm ci`.
- Brak zmian w `dane/polstr-1m.json` i `dane/wibor-3m.json`.

Model wejścia i niezmienniki opisuje [data-model.md](data-model.md), a format endpointu [contracts/harmonogram-api.md](contracts/harmonogram-api.md).

## Automatyczna kontrola

Uruchom kolejno:

```powershell
npm test
npm run typecheck
npm run build
```

Oczekiwany wynik: wszystkie testy przechodzą, TypeScript nie zgłasza błędów, a produkcyjny build Next.js kończy się powodzeniem.

Testy domenowe muszą potwierdzić co najmniej:

1. Dla 40 000 000 gr, 300 rat równych, stałego wskaźnika `0.0355` i marży `0.0211` pierwsza rata wynosi 249 472 gr z tolerancją 5 gr, a ostatnia 249 253 gr z tolerancją 5 gr.
2. Dla rat malejących planowana część kapitałowa rozdziela kredyt na pozostałe miesiące, a saldo kończy się na 0 gr.
3. Zmiana wartości serii wpływa od właściwej daty raty, a po końcu serii działa ostatnia wartość.
4. Nadpłata `obniz_rate` zmniejsza późniejsze raty przy zachowaniu planowanej daty końcowej.
5. Nadpłata `skroc_okres` zmniejsza liczbę rat i nie powoduje ujemnego salda.
6. Suma planowanego kapitału i nadpłat jest dokładnie równa kwocie kredytu.

## Ręczna kontrola API

Uruchom aplikację:

```powershell
npm run dev
```

Wywołaj w przeglądarce albo kliencie HTTP:

```text
http://localhost:3000/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01
```

Oczekiwany wynik: status 200, niepusta tablica `raty`, wszystkie kwoty jako całkowite grosze, `sumaKapitaluGr` równe `40000000` oraz saldo ostatniej raty równe `0`.

Następnie usuń wymagany parametr, na przykład `liczbaRat`. Oczekiwany wynik: status 400, obiekt z polem `blad` i brak pola `raty`.

## Ręczna kontrola ekranu

Po podłączeniu dostarczonego komponentu otwórz `http://localhost:3000` i wykonaj poprawne obliczenie. Ekran ma pokazać pierwszą i ostatnią ratę, sumę odsetek oraz tabelę zgodną z odpowiedzią API. Wyeksportowany CSV ma zawierać te same raty i wartości po zaokrągleniu. Niepoprawne dane mają pokazać komunikat błędu bez starego lub częściowego wyniku.
# Kontrakt `GET /api/harmonogram`

## Parametry query

Wymagane są `kwota` (zł), `liczbaRat`, `marza` (punkty procentowe), `wskaznik`, `typRat` oraz `pierwszaRata`. Opcjonalny parametr `nadplaty` jest URL-enkodowanym JSON-em tablicy obiektów `{ "miesiac": "YYYY-MM", "kwota": 10000, "tryb": "obnizRate" }`. Kwoty wejściowe nadpłat są podawane w złotych, a domena otrzymuje grosze.

Przykład:

```text
/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01
```

## Odpowiedź 200

```json
{
  "raty": [{
    "numer": 1,
    "data": "2026-10-01",
    "czescKapitalowaGr": 60649,
    "czescOdsetkowaGr": 188823,
    "rataGr": 249472,
    "saldoGr": 3939351
  }],
  "sumaOdsetekGr": 0
}
```

Rzeczywista tablica zawiera wszystkie okresy. Pola monetarne są całkowitymi liczbami groszy; suma części kapitałowych równa się kwocie kredytu.

## Odpowiedzi błędów

- `400 Bad Request`: `{ "blad": "...", "przyklad": "..." }` dla brakujących lub niepoprawnych parametrów albo błędu domeny.
- Błąd nie może zastępować danych domyślnych ani zwracać pozornego harmonogramu.

## Semantyka

Oprocentowanie okresu to wartość wskaźnika plus marża. Odsetki są proste i liczone miesięcznie. Nadpłata jest stosowana po racie danego miesiąca; `obnizRate` zachowuje termin, a `skrocOkres` skraca harmonogram. Po ostatnim wpisie serii obowiązuje ostatnia znana wartość. CSV w UI używa tych samych rekordów i wartości.

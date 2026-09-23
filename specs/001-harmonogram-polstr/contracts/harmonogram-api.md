# Kontrakt `GET /api/harmonogram`

## Parametry query string

| Parametr | Wymagany | Format | Przykład |
|---|---|---|---|
| `kwota` | tak | dodatnia kwota w złotych, maksymalnie 2 miejsca po przecinku | `400000` |
| `liczbaRat` | tak | dodatnia liczba całkowita | `300` |
| `pierwszaRata` | tak | istniejąca data `YYYY-MM-DD` | `2026-10-01` |
| `marza` | tak | nieujemna liczba punktów procentowych | `2.11` |
| `typRat` | tak | `rowne` albo `malejace` | `rowne` |
| `wskaznik` | tak | `POLSTR_1M` albo `WIBOR_3M` | `POLSTR_1M` |
| `nadplata` | nie | powtarzalne `miesiac:kwota:tryb`, kwota maksymalnie 2 miejsca po przecinku | `12:10000:obniz_rate` |

Kwota nadpłaty jest podawana w złotych z maksymalnie 2 miejscami po przecinku. Obsługiwane tryby to `obniz_rate` oraz `skroc_okres`.

Przykład z dwiema nadpłatami:

```text
/api/harmonogram?kwota=400000&liczbaRat=300&pierwszaRata=2026-10-01&marza=2.11&typRat=rowne&wskaznik=POLSTR_1M&nadplata=12:10000:obniz_rate&nadplata=24:5000:obniz_rate
```

## Odpowiedź 200

Wszystkie kwoty odpowiedzi są całkowitymi liczbami groszy.

```json
{
  "raty": [
    {
      "numer": 1,
      "data": "2026-10-01",
      "kapitalGr": 60805,
      "odsetkiGr": 188667,
      "nadplataGr": 0,
      "rataGr": 249472,
      "saldoPoSplacieGr": 39939195,
      "stopaRoczna": 0.0566
    }
  ],
  "sumaOdsetekGr": 34841347,
  "sumaKapitaluGr": 40000000
}
```

Powyższy fragment ilustruje kształt danych. Kryteria kwotowe całego przypadku kontrolnego są opisane w `../quickstart.md`.

## Odpowiedź 400

Niepoprawny parametr, niespójne nadpłaty lub brak wartości wskaźnika dla daty zwraca:

```json
{
  "blad": "pierwszaRata: wymagana istniejąca data YYYY-MM-DD"
}
```

Komunikat wskazuje pole i oczekiwany format. Odpowiedź błędu nie zawiera częściowego harmonogramu.

## Odpowiedź 500

Nieoczekiwany błąd serwera zwraca ogólny komunikat bez szczegółów stosu. Błędy walidacji domenowej nie są mapowane na status 500.
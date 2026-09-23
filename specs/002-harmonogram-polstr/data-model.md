# Model danych

## Parametry kredytu

| Pole | Typ | Reguła |
|---|---|---|
| `kwotaGr` | `number` | Całkowita liczba groszy, większa od zera. |
| `liczbaRat` | `number` | Dodatnia liczba całkowita. |
| `pierwszaRata` | `string` | Prawidłowa data `YYYY-MM-DD`. |
| `marza` | `number` | Nieujemny ułamek, np. `0.0211`. |
| `typRat` | `'rowne' \| 'malejace'` | Sposób wyznaczania kapitału/rata. |
| `wskaznik` | `'POLSTR_1M' \| 'WIBOR_3M'` | Seria z `src/dane/wskazniki.ts`. |
| `nadplaty` | `Nadplata[]` | Opcjonalna lista uporządkowana przed obliczeniem. |

## Nadpłata

| Pole | Typ | Reguła |
|---|---|---|
| `miesiac` | `string` | Miesiąc `YYYY-MM`, przypisany do daty raty. |
| `kwotaGr` | `number` | Całkowita liczba groszy, większa od zera. |
| `tryb` | `'obnizRate' \| 'skrocOkres'` | Zachowanie po zastosowaniu nadpłaty. |

Nadpłata jest wykonywana po racie w danym miesiącu. Kwota większa od salda jest przycinana do salda. Nadpłata po zakończeniu harmonogramu jest błędem walidacji.

## Wpis serii

`WpisSerii` ma `od: string` w formacie `YYYY-MM-DD` oraz `stopa: number` jako nieujemny ułamek roczny. Wpisy są posortowane rosnąco. POLSTR wybiera zmianę miesięczną, WIBOR kwartalną zgodnie z datami wpisów.

## Rata harmonogramu

Każda rata zawiera `numer`, `data`, `czescKapitalowaGr`, `czescOdsetkowaGr`, `rataGr` oraz `saldoGr`. Wszystkie pola pieniężne są całkowitymi groszami, a `rataGr` jest sumą części kapitałowej i odsetkowej. `saldoGr` nigdy nie jest ujemne.

## Harmonogram

Harmonogram zawiera uporządkowaną tablicę rat, `sumaOdsetekGr` oraz dostęp do pierwszej i ostatniej raty. Nie zawiera rekordów po spłacie salda. Suma wszystkich `czescKapitalowaGr` jest równa początkowemu `kwotaGr`.

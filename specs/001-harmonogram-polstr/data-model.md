# Model danych: Kalkulator harmonogramu POLSTR

## Parametry kredytu

| Pole | Typ domenowy | Reguły |
|---|---|---|
| `kwotaGr` | `number` | dodatnia liczba całkowita w groszach |
| `liczbaRat` | `number` | dodatnia liczba całkowita |
| `pierwszaRata` | `string` | istniejąca data kalendarzowa `YYYY-MM-DD` |
| `marza` | `number` | skończona liczba nieujemna jako ułamek, np. `0.0211` |
| `typRat` | `'rowne' \| 'malejace'` | jedna z obsługiwanych wartości |
| `nadplaty` | `Nadplata[]` | opcjonalnie pusta lista |

Parametry kredytu mają relację jeden-do-wielu z nadpłatami. Nie zawierają identyfikatora serii wskaźnika.

## Kontrakt wejścia domeny

Domena przyjmuje jawny zestaw wejściowy:

```ts
type ParametryKredytu = {
  kwotaGr: number;
  liczbaRat: number;
  pierwszaRata: string;
  marza: number;
  typRat: 'rowne' | 'malejace';
  nadplaty: Nadplata[];
};

type WpisSeriiWskaznika = {
  od: string;
  stopa: number;
};

type WejscieHarmonogramu = {
  parametry: ParametryKredytu;
  seriaWskaznika: WpisSeriiWskaznika[];
};
```

`seriaWskaznika` jest osobnym argumentem wejściowym domeny. To nie jest pole `ParametryKredytu`, lecz oddzielny kontrakt danych dla stopy aktualnej. Wybór między `POLSTR_1M` a `WIBOR_3M` odbywa się poza domeną (np. w warstwie danych/API), a sama domena otrzymuje już konkretną serię wartości, np. stały ciąg `[{ od: '2026-10-01', stopa: 0.0355 }]` dla testu T001. W praktyce wpisywanie identyfikatora `wskaznik` do domeny jest błędem modelu, bo domena liczy tylko z gotowej serii wejściowej.

## Wpis serii wskaźnika

| Pole | Typ domenowy | Reguły |
|---|---|---|
| `od` | `string` | istniejąca data `YYYY-MM-DD`; wpisy rosnąco i bez duplikatów |
| `stopa` | `number` | skończony, nieujemny ułamek stopy rocznej |

Seria musi zawierać co najmniej jeden wpis. Dla daty raty obowiązuje najpóźniejszy wpis z `od <= dataRaty`. Brak takiego wpisu jest błędem.

## Nadpłata

| Pole | Typ domenowy | Reguły |
|---|---|---|
| `miesiac` | `number` | liczba całkowita od 1 do planowanej liczby rat |
| `kwotaGr` | `number` | dodatnia liczba całkowita w groszach |
| `tryb` | `'obniz_rate' \| 'skroc_okres'` | sposób wpływu na kolejne raty |

Nadpłaty w tym samym miesiącu i trybie są sumowane. Nadpłata nie może obniżyć salda poniżej zera. Sprzeczne tryby w jednym miesiącu są błędem wejścia.

## Rata

| Pole | Typ domenowy | Reguły |
|---|---|---|
| `numer` | `number` | kolejny numer od 1 bez luk |
| `data` | `string` | data miesięczna `YYYY-MM-DD` |
| `kapitalGr` | `number` | nieujemna liczba całkowita; planowany kapitał bez nadpłaty |
| `odsetkiGr` | `number` | nieujemna liczba całkowita |
| `nadplataGr` | `number` | nieujemna liczba całkowita |
| `rataGr` | `number` | `kapitalGr + odsetkiGr + nadplataGr` |
| `saldoPoSplacieGr` | `number` | nieujemna liczba całkowita |
| `stopaRoczna` | `number` | suma wskaźnika i marży użyta dla raty |

Rata należy do jednego harmonogramu. Kwota nadpłaty jest pokazana osobno, aby tabela i CSV nie ukrywały jej wpływu.

## Harmonogram

| Pole | Typ domenowy | Reguły |
|---|---|---|
| `raty` | `Rata[]` | co najmniej jedna rata dla poprawnego wejścia |
| `sumaOdsetekGr` | `number` | suma `odsetkiGr` wszystkich rat |
| `sumaKapitaluGr` | `number` | suma `kapitalGr + nadplataGr`; równa `kwotaGr` |

## Niezmienniki i przejścia

1. Stan początkowy ma saldo równe `kwotaGr`.
2. Dla każdej raty naliczane są odsetki od salda początkowego miesiąca.
3. Saldo zmniejsza się o planowany kapitał, a potem o ograniczoną nadpłatę.
4. W trybie `obniz_rate` pozostaje pierwotna liczba miesięcy; kolejna rata jest liczona dla nowego salda.
5. W trybie `skroc_okres` harmonogram kończy się natychmiast po osiągnięciu salda zero.
6. Ostatnia część kapitałowa jest ograniczona do salda, dzięki czemu saldo nie jest ujemne.
7. Stan końcowy ma saldo zero, a suma spłaconego kapitału jest równa kwocie kredytu.
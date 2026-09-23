# Research: Kalkulator harmonogramu POLSTR

## Formuły i zaokrąglenia

- **Decyzja:** Kwoty są przechowywane jako całkowite grosze. Odsetki za okres to zaokrąglone do grosza `saldo początkowe * (wskaźnik + marża) / 12`. Dla rat równych miesięczna rata wynika ze wzoru annuitetowego, a dla malejących kapitał jest równym podziałem pozostałego kapitału. Ostatnia rata otrzymuje pozostałe saldo kapitału.
- **Rationale:** Jest to zgodne z BRIEF.md, zapewnia brak ujemnego salda i dokładną sumę części kapitałowych. Zaokrąglenie monetarne odbywa się w jednym helperze domenowym.
- **Alternatives considered:** Zaokrąglanie wyłącznie końcowej sumy odrzucono, bo tabela musi zawierać kwoty groszowe dla każdego okresu. Biblioteka dziesiętna odrzucona, ponieważ istniejące środowisko nie wymaga nowej zależności, a operacje są kontrolowane przez grosze i jawne zaokrąglenie.

## Daty i serie wskaźników

- **Decyzja:** Raty są generowane co miesiąc od daty pierwszej raty. Zachowany jest dzień miesiąca, a dla nieistniejącego dnia używany jest ostatni dzień miesiąca. Dla daty raty wybierany jest ostatni wpis `od` nie późniejszy niż rata; przed pierwszym wpisem używany jest pierwszy wpis, po ostatnim ostatni wpis.
- **Rationale:** Reguła działa dla lutego i miesięcy różnej długości oraz odpowiada opisowi serii JSON. POLSTR 1M zmienia się przez miesięczne wpisy, WIBOR 3M przez wpisy na początku kwartału, bez osobnej logiki kalendarzowej.
- **Alternatives considered:** Odrzucenie kredytu rozpoczynającego się przed serią odrzucono, bo specyfikacja nie wymaga takiego błędu; użycie pierwszej stawki jest przewidywalne.

## Nadpłaty

- **Decyzja:** Nadpłata jest stosowana po standardowej racie w miesiącu `YYYY-MM`. Nadpłata jest przycinana do bieżącego salda. Tryb `obnizRate` zachowuje planowany termin końcowy i przelicza kolejne raty; tryb `skrocOkres` utrzymuje ratę bazową i kończy harmonogram po spłacie.
- **Rationale:** Kolejność jest jednoznaczna dla wielu nadpłat i pozwala porównywać warianty. Nie powstaje ujemne saldo ani rata po całkowitej spłacie.
- **Alternatives considered:** Stosowanie nadpłaty przed ratą odrzucono jako mniej intuicyjne dla tabeli rat. Ciche ignorowanie nadpłaty po harmonogramie odrzucono na rzecz błędu walidacji.

## API i UI

- **Decyzja:** Nadpłaty są przekazywane jako URL-enkodowany JSON w parametrze `nadplaty`. Endpoint zwraca rekordy w groszach, a ekran pobiera JSON przez `fetch` i generuje CSV po stronie przeglądarki.
- **Rationale:** JSON pozwala przekazać listę struktur bez własnej składni i nie wymaga nowych zależności.
- **Alternatives considered:** Powtarzane parametry tekstowe byłyby krótsze, ale trudniej je walidować i rozszerzać o tryb nadpłaty.

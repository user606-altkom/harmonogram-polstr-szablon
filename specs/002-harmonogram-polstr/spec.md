# Feature Specification: Kalkulator harmonogramu POLSTR

**Feature Branch**: `002-harmonogram-polstr`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: Kalkulator harmonogramu spłat kredytu hipotecznego obsługujący POLSTR 1M i WIBOR 3M, raty równe i malejące oraz nadpłaty.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Obliczenie podstawowego harmonogramu (Priority: P1)

Jako osoba analizująca kredyt chcę podać kwotę, liczbę rat, datę pierwszej raty, marżę, typ raty i wskaźnik, aby otrzymać kompletny harmonogram spłat z podziałem każdej raty na kapitał i odsetki.

**Why this priority**: Bez poprawnego harmonogramu dla podstawowych parametrów pozostałe możliwości kalkulatora nie dostarczają wartości.

**Independent Test**: Można podać kredyt 400 000 zł, 300 rat równych, datę pierwszej raty, marżę 2,11 pp i stałą serię POLSTR 3,55%, a następnie zweryfikować ratę pierwszą, ratę końcową, saldo i sumę odsetek.

**Acceptance Scenarios**:

1. **Given** poprawne parametry kredytu i seria wskaźnika, **When** użytkownik uruchamia obliczenie, **Then** otrzymuje daty i wartości wszystkich rat: numer, część kapitałową, część odsetkową, ratę oraz saldo po spłacie.
2. **Given** stała stopa roczna 5,66% i kwota 400 000 zł rozłożona na 300 rat równych, **When** użytkownik oblicza harmonogram, **Then** pierwsza rata wynosi 2 494,72 zł z tolerancją 0,05 zł, a ostatnia rata wyrównująca wynosi 2 492,53 zł z tolerancją 0,05 zł.
3. **Given** poprawne parametry i raty malejące, **When** użytkownik uruchamia obliczenie, **Then** część kapitałowa rat jest zgodna z równym podziałem pozostałego kapitału, a rata całkowita nie rośnie przy niezmiennym oprocentowaniu.

---

### User Story 2 - Uwzględnienie zmian wskaźnika i nadpłat (Priority: P1)

Jako osoba porównująca warianty finansowania chcę wybrać POLSTR 1M albo WIBOR 3M oraz dodać nadpłaty, aby zobaczyć wpływ zmiennego oprocentowania i wcześniejszych spłat na raty, okres oraz koszt odsetek.

**Why this priority**: Obsługa dwóch wskaźników i nadpłat jest główną potrzebą biznesową odróżniającą kalkulator od prostego kalkulatora rat.

**Independent Test**: Można przygotować serię z różnymi wartościami w kolejnych okresach oraz dwie identyczne nadpłaty, każdą w innym trybie, i porównać wynik z harmonogramem bez nadpłaty.

**Acceptance Scenarios**:

1. **Given** seria POLSTR 1M z nową wartością w kolejnym miesiącu, **When** obliczenie przechodzi przez dzień raty, **Then** oprocentowanie kolejnego okresu używa nowej wartości.
2. **Given** seria WIBOR 3M, **When** obliczenie przechodzi do kolejnego kwartału, **Then** nowa wartość wpływa na oprocentowanie od właściwego okresu, a w pozostałych miesiącach kwartału obowiązuje poprzednia wartość.
3. **Given** nadpłata z trybem „obniż ratę”, **When** nadpłata zostaje zastosowana, **Then** saldo maleje, a kolejne raty są przeliczone przy zachowaniu zaplanowanego końca okresu.
4. **Given** nadpłata z trybem „skróć okres”, **When** nadpłata zostaje zastosowana, **Then** saldo maleje, a harmonogram kończy się wcześniej, gdy pozostały kapitał zostanie spłacony.
5. **Given** seria wskaźnika kończąca się przed końcem kredytu, **When** obliczenie korzysta z okresu po ostatnim wpisie, **Then** używana jest ostatnia znana wartość.

---

### User Story 3 - Odczyt i eksport wyników (Priority: P2)

Jako osoba podejmująca decyzję finansową chcę szybko odczytać najważniejsze podsumowanie i pobrać tabelę, aby porównać warianty lub zachować wynik do dalszej analizy.

**Why this priority**: Czytelne przedstawienie wyniku i możliwość jego dalszego użycia są potrzebne do praktycznego wykorzystania obliczeń.

**Independent Test**: Po wykonaniu poprawnego obliczenia można sprawdzić podsumowanie pierwszej i ostatniej raty oraz sumy odsetek, a następnie pobrać plik CSV i otworzyć go w arkuszu kalkulacyjnym.

**Acceptance Scenarios**:

1. **Given** poprawnie obliczony harmonogram, **When** użytkownik ogląda wynik, **Then** widzi pierwszą ratę, ostatnią ratę, sumę odsetek i tabelę wszystkich rat.
2. **Given** widoczna tabela rat, **When** użytkownik wybiera eksport, **Then** otrzymuje plik CSV zawierający te same rekordy i wartości co tabela.
3. **Given** brakujący albo niepoprawny parametr wejściowy, **When** użytkownik uruchamia obliczenie, **Then** otrzymuje zrozumiały komunikat błędu wskazujący parametr wymagający poprawy i nie otrzymuje pozornego harmonogramu.

---

### Edge Cases

- Kwota kredytu, liczba rat lub kwota nadpłaty równa zero albo ujemna jest odrzucana.
- Data pierwszej raty musi mieć format YYYY-MM-DD i być prawidłową datą kalendarzową.
- Marża może wynosić zero, ale nie może być ujemna.
- Nadpłata większa od bieżącego salda nie może wygenerować ujemnego salda; harmonogram kończy się na całkowitej spłacie.
- Nadpłata przypadająca po zakończeniu harmonogramu jest odrzucana albo pomijana z jednoznacznym komunikatem, bez zmiany wcześniejszych rat.
- Wartości wskaźnika muszą być nieujemnymi wartościami procentowymi; brak serii wybranego wskaźnika uniemożliwia obliczenie.
- Kwoty po zaokrągleniu do grosza nie mogą powodować różnicy między sumą części kapitałowych a kwotą kredytu; ostatnia rata wyrównuje tę różnicę.
- Harmonogram nie pokazuje rat po całkowitej spłacie kredytu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST pozwalać użytkownikowi podać kwotę kredytu, liczbę rat, datę pierwszej raty, marżę w punktach procentowych, typ rat oraz wybrany wskaźnik.
- **FR-002**: System MUST obsługiwać wskaźnik POLSTR 1M i wskaźnik WIBOR 3M oraz ich serie wartości przypisane do okresów.
- **FR-003**: System MUST obsługiwać raty równe i raty malejące.
- **FR-004**: System MUST pozwalać użytkownikowi wprowadzić listę nadpłat zawierającą miesiąc, kwotę i tryb „obniż ratę” albo „skróć okres”.
- **FR-005**: System MUST wyliczać oprocentowanie okresu jako sumę wartości wskaźnika i marży.
- **FR-006**: System MUST stosować zmianę POLSTR 1M co miesiąc w dniu raty oraz zmianę WIBOR 3M co kwartał.
- **FR-007**: System MUST stosować ostatnią znaną wartość wskaźnika po ostatnim wpisie dostępnej serii.
- **FR-008**: System MUST obliczać odsetki proste za okres od aktualnego salda i oprocentowania okresu, bez kapitalizacji w ramach miesiąca.
- **FR-009**: System MUST zaokrąglać wartości pieniężne do grosza oraz zapewniać, że suma części kapitałowych dokładnie odpowiada kwocie kredytu.
- **FR-010**: System MUST zwracać dla każdego okresu numer raty, datę, część kapitałową, część odsetkową, ratę całkowitą i saldo po spłacie.
- **FR-011**: System MUST zwracać sumę odsetek za cały okres oraz umożliwiać odczyt pierwszej i ostatniej raty.
- **FR-012**: System MUST przeliczać pozostały harmonogram po nadpłacie zgodnie z wybranym trybem i nie pozwalać na ujemne saldo.
- **FR-013**: System MUST odrzucać niepoprawne lub niepełne parametry zamiast przyjmować ciche wartości domyślne.
- **FR-014**: System MUST prezentować formularz parametrów, wynik obliczenia, podsumowanie i pełną tabelę rat w jednym ekranie kalkulatora.
- **FR-015**: System MUST umożliwiać eksport pełnej tabeli wyników do pliku CSV po stronie użytkownika.
- **FR-016**: System MUST stosować wartości wskaźników wprost z danych okresowych; składanie dziennych stawek POLSTR za okres odsetkowy pozostaje poza zakresem MVP.

### Key Entities *(include if feature involves data)*

- **Parametry kredytu**: Kwota, liczba rat, data pierwszej raty, marża, typ rat i wybrany wskaźnik.
- **Seria wskaźnika**: Wartości POLSTR 1M albo WIBOR 3M przypisane do kolejnych okresów obowiązywania.
- **Nadpłata**: Kwota i miesiąc zastosowania wraz z decyzją, czy zmniejszyć kolejne raty, czy skrócić okres.
- **Rata harmonogramu**: Numer, data, część kapitałowa, część odsetkowa, rata całkowita i saldo po spłacie.
- **Harmonogram**: Uporządkowany zbiór rat wraz z sumą odsetek i podsumowaniem pierwszej oraz ostatniej raty.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Użytkownik może wprowadzić poprawne parametry i uzyskać kompletny harmonogram w czasie nie dłuższym niż 10 sekund dla kredytu obejmującego 360 rat.
- **SC-002**: Dla zestawu kontrolnego 400 000 zł, 300 rat, 5,66% rocznie kalkulator podaje pierwszą ratę 2 494,72 zł i ostatnią ratę 2 492,53 zł, każdą z tolerancją 0,05 zł.
- **SC-003**: W 100% sprawdzonych poprawnych harmonogramów suma części kapitałowych jest równa kwocie kredytu co do grosza, a saldo końcowe wynosi zero.
- **SC-004**: Użytkownik może porównać wariant POLSTR 1M, WIBOR 3M, rat równych, rat malejących oraz obu trybów nadpłaty bez ręcznego przeliczania danych poza kalkulatorem.
- **SC-005**: Eksport CSV zawiera 100% wierszy i pól widocznych w tabeli wyników oraz zachowuje wartości z dokładnością do grosza.
- **SC-006**: Użytkownik otrzymuje zrozumiałą informację o każdym błędnym parametrze i nie może pomylić odrzuconego obliczenia z poprawnym wynikiem.

## Assumptions

- Użytkownikiem jest osoba analizująca koszt kredytu; kalkulator nie udziela porady finansowej ani nie składa oferty kredytowej.
- Dane przykładowe wskaźników dostarczone w projekcie są jedynym źródłem wartości w zakresie MVP i są dostępne dla obu obsługiwanych wskaźników.
- Rata przypada co miesiąc od daty pierwszej raty, a zmiany miesiąca i kwartału są rozpoznawane na podstawie kolejnych dat rat.
- Wartości pieniężne są prezentowane w złotych i groszach, a marża i wartości wskaźników są podawane jako punkty procentowe lub procenty zgodnie z opisem pola.
- Walidacja wejścia i komunikaty błędów są częścią kalkulatora, ale uwierzytelnianie, zapis historii obliczeń i obsługa wielu użytkowników są poza zakresem MVP.
- Wdrożenie produkcyjne i podglądy zmian są zależne od konfiguracji repozytorium oraz środowiska wydawniczego opisanego w dokumentacji projektu.

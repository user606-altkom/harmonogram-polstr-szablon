# Specyfikacja funkcji: Kalkulator harmonogramu POLSTR

**Gałąź funkcji**: `001-harmonogram-polstr`

**Utworzono**: 2026-09-23

**Status**: Wersja robocza

**Wejście**: Opis użytkownika: "Liczba kontrolna z BRIEF.md jest kryterium akceptacji; ekran www to osobna, ostatnia historia użytkownika, jego wygląd dostarczę jako gotowy komponent React."

## Scenariusze użytkownika i testowanie *(wymagane)*

### Historia użytkownika 1 - Obliczenie harmonogramu kredytu (Priorytet: P1)

Użytkownik podaje kwotę kredytu, liczbę rat, datę pierwszej raty, marżę, typ rat oraz wskaźnik referencyjny, aby otrzymać kompletny harmonogram spłat i sumę odsetek.

**Dlaczego ten priorytet**: To podstawowa wartość biznesowa kalkulatora i niezależny rezultat, na którym opierają się wszystkie pozostałe historie.

**Test niezależny**: Można podać kompletny zestaw parametrów oraz serię wartości wskaźnika i sprawdzić każdą ratę, saldo po spłacie oraz sumę odsetek bez korzystania z ekranu WWW.

**Scenariusze akceptacyjne**:

1. **Jeżeli** kredyt 400 000 zł, 300 rat równych, pierwsza rata w podanej prawidłowej dacie, marża 2,11 punktu procentowego oraz stała wartość POLSTR 1M 3,55%, **to** użytkownik oblicza harmonogram, **wtedy** pierwsza rata wynosi 2 494,72 zł z tolerancją 0,05 zł, a ostatnia rata wyrównująca wynosi 2 492,53 zł z tolerancją 0,05 zł.
2. **Jeżeli** prawidłowe parametry kredytu i seria WIBOR 3M, **to** użytkownik wybiera raty malejące, **wtedy** część kapitałowa rat jest zgodna z równym podziałem kapitału, a część odsetkowa każdej raty jest obliczana według stopy właściwej dla daty tej raty.
3. **Jeżeli** prawidłowe parametry i seria wskaźnika krótsza niż okres kredytu, **to** użytkownik oblicza harmonogram, **wtedy** po ostatniej wartości serii używana jest ostatnia znana wartość.
4. **Jeżeli** harmonogram z zaokrągleniami do grosza, **to** użytkownik oblicza cały okres, **wtedy** suma części kapitałowych jest równa kwocie kredytu, a saldo po ostatniej spłacie wynosi 0,00 zł.

---

### Historia użytkownika 2 - Uwzględnienie nadpłat (Priorytet: P2)

Użytkownik dodaje jedną lub wiele nadpłat, wskazuje miesiąc każdej nadpłaty oraz wybiera, czy nadpłata ma obniżyć kolejne raty, czy skrócić okres kredytu.

**Dlaczego ten priorytet**: Nadpłaty są kluczowym scenariuszem planowania kosztu kredytu, ale wymagają już działającego podstawowego harmonogramu.

**Test niezależny**: Dla tego samego kredytu można policzyć dwa harmonogramy z identyczną nadpłatą, osobno w trybie obniżenia raty i skrócenia okresu, a następnie porównać saldo, liczbę rat i sumę odsetek.

**Scenariusze akceptacyjne**:

1. **Jeżeli** harmonogram z nadpłatą w określonym miesiącu w trybie „obniż ratę”, **to** użytkownik oblicza kolejne raty, **wtedy** saldo zmniejsza się o kwotę nadpłaty, a kolejne raty są przeliczone dla pozostałego okresu.
2. **Jeżeli** harmonogram z nadpłatą w określonym miesiącu w trybie „skróć okres”, **to** użytkownik oblicza kolejne raty, **wtedy** kredyt kończy się wcześniej niż bez nadpłaty, przy zachowaniu pełnej spłaty kapitału.
3. **Jeżeli** nadpłata większa niż pozostałe saldo, **to** użytkownik oblicza harmonogram, **wtedy** saldo nie spada poniżej zera, a harmonogram kończy się w miesiącu całkowitej spłaty.

---

### Historia użytkownika 3 - Praca z ekranem kalkulatora (Priorytet: P3)

Użytkownik korzysta z dostarczonego komponentu ekranu, wprowadza parametry kalkulacji, uruchamia obliczenie, przegląda najważniejsze wyniki i tabelę rat oraz pobiera tabelę w formacie CSV.

**Dlaczego ten priorytet**: Ekran jest końcową warstwą doświadczenia użytkownika i zostanie dostarczony jako gotowy komponent po przygotowaniu obliczeń.

**Test niezależny**: Po podłączeniu gotowego komponentu użytkownik może przejść cały przepływ od formularza do pobrania CSV, bez ręcznego przygotowywania żądania.

**Scenariusze akceptacyjne**:

1. **Jeżeli** użytkownik otworzył ekran kalkulatora, **to** wprowadza komplet parametrów i wybiera „Policz”, **wtedy** widzi pierwszą i ostatnią ratę, sumę odsetek oraz tabelę zawierającą numer, datę, kapitał, odsetki, ratę i saldo po spłacie.
2. **Jeżeli** wyświetlony poprawny harmonogram, **to** użytkownik wybiera eksport CSV, **wtedy** otrzymuje plik zawierający dane tabeli rat.
3. **Jeżeli** niepoprawne lub niepełne dane wejściowe, **to** użytkownik próbuje obliczyć harmonogram, **wtedy** otrzymuje zrozumiałą informację o błędzie i nie jest prezentowany pozornie poprawny wynik.

### Przypadki brzegowe

- Kwota kredytu, liczba rat, marża lub kwota nadpłaty mniejsza od zera albo równa zero, gdy dana wartość jest wymagana dodatnia.
- Data pierwszej raty w nieprawidłowym formacie lub nieistniejąca data kalendarzowa.
- Wskaźnik bez serii wartości albo seria zawierająca nieprawidłowe wartości.
- Nadpłata w miesiącu poza okresem kredytu, nadpłaty nakładające się w tym samym miesiącu oraz nadpłata równa pozostałemu saldu.
- Zmiana wskaźnika POLSTR 1M co miesiąc i WIBOR 3M co kwartał, zgodnie z dostępną serią.
- Ostatnia rata po zaokrągleniu wymaga wyrównania, aby nie pozostało saldo ani niedopłata kapitału.
- Kredyt spłacony przez nadpłatę przed planowanym końcem nie generuje dalszych rat.

## Wymagania *(wymagane)*

### Wymagania funkcjonalne

- **FR-001**: System MUST przyjąć kwotę kredytu, liczbę rat, datę pierwszej raty, marżę w punktach procentowych, typ rat, wskaźnik referencyjny oraz listę nadpłat.
- **FR-002**: System MUST obsługiwać raty równe oraz raty malejące.
- **FR-003**: System MUST obsługiwać POLSTR 1M i WIBOR 3M oraz przypisywać wartość wskaźnika do właściwego okresu zgodnie z częstotliwością zmian.
- **FR-004**: System MUST obliczać oprocentowanie okresu jako sumę wartości wskaźnika i marży.
- **FR-005**: System MUST stosować ostatnią znaną wartość wskaźnika po zakończeniu dostarczonej serii.
- **FR-006**: System MUST obliczać odsetki proste za okres bez kapitalizacji w ramach miesiąca.
- **FR-007**: System MUST zaokrąglać kwoty do grosza w sposób zapewniający powtarzalność wyników oraz skorygować ostatnią ratę tak, aby suma części kapitałowych była równa kwocie kredytu.
- **FR-008**: System MUST uwzględniać nadpłaty w miesiącu i trybie wskazanym przez użytkownika: obniżenie raty albo skrócenie okresu.
- **FR-009**: System MUST zwrócić dla każdej raty numer, datę, część kapitałową, część odsetkową, ratę oraz saldo po spłacie, a także sumę odsetek za cały okres.
- **FR-010**: System MUST odrzucić niepoprawne dane wejściowe z komunikatem umożliwiającym użytkownikowi poprawę danych.
- **FR-011**: System MUST umożliwić ekranowi kalkulatora pokazanie pierwszej raty, ostatniej raty, sumy odsetek i tabeli rat oraz eksport tabeli do CSV.
- **FR-012**: System MUST umożliwić podłączenie dostarczonego komponentu ekranu jako ostatniej historii użytkownika bez zmiany reguł obliczeń.

### Główne encje *(jeśli funkcja obejmuje dane)*

- **Parametry kredytu**: Kwota, liczba rat, data pierwszej raty, marża, typ rat i wybrany wskaźnik.
- **Seria wskaźnika**: Uporządkowane wartości POLSTR 1M albo WIBOR 3M przypisane do kolejnych okresów.
- **Nadpłata**: Kwota, miesiąc zastosowania i tryb wpływu na harmonogram.
- **Rata**: Numer, data, część kapitałowa, część odsetkowa, łączna kwota raty i saldo po spłacie.
- **Harmonogram**: Uporządkowany zestaw rat oraz suma odsetek dla danych parametrów.

## Kryteria sukcesu *(wymagane)*

### Wyniki mierzalne

- **SC-001**: Dla przypadku kontrolnego 400 000 zł, 300 rat równych, POLSTR 1M 3,55% i marży 2,11 punktu procentowego pierwsza rata mieści się w przedziale 2 494,67-2 494,77 zł, a ostatnia rata wyrównująca w przedziale 2 492,48-2 492,58 zł.
- **SC-002**: Dla każdego poprawnego harmonogramu suma części kapitałowych jest równa kwocie kredytu co do grosza, a saldo końcowe wynosi 0,00 zł.
- **SC-003**: Użytkownik otrzymuje kompletny wynik dla 300-ratowego przypadku kontrolnego w czasie nie dłuższym niż 2 sekundy od uruchomienia obliczenia na typowym komputerze biurowym.
- **SC-004**: Każdy z pięciu minimalnych scenariuszy domenowych: rata równa, rata malejąca, zmiana wskaźnika, oba tryby nadpłaty i suma kapitału po zaokrągleniach, kończy się wynikiem zgodnym z oczekiwaniem biznesowym.
- **SC-005**: Użytkownik może przejść od wprowadzenia poprawnych danych do pobrania CSV bez ręcznego przepisywania wyniku, a dane w CSV odpowiadają widocznej tabeli.
- **SC-006**: Niepoprawne dane są odrzucane w 100% sprawdzonych przypadków testowych i nie powodują prezentacji niepełnego harmonogramu jako poprawnego.

## Założenia

- Użytkownikiem jest osoba planująca lub analizująca spłatę kredytu hipotecznego; uwierzytelnianie i zapisywanie historii kalkulacji są poza zakresem MVP.
- Kwoty są prezentowane w złotych i groszach, a daty rat wynikają z daty pierwszej raty oraz kolejnych okresów miesięcznych.
- Wartość wskaźnika jest pobierana wprost z dostarczonej serii dla okresu; dzienne składanie stawek POLSTR wstecz nie jest częścią MVP.
- Seria wskaźnika zawiera co najmniej jedną prawidłową wartość, a po jej końcu obowiązuje ostatnia znana wartość.
- Eksport CSV obejmuje kolumny widoczne w tabeli rat oraz zachowuje wartości po zaokrągleniu.
- Wygląd ekranu i jego komponent wizualny zostaną dostarczone osobno; ta specyfikacja określa jego wymagany przepływ i dane, nie projekt graficzny.
- Publikacja produkcyjna i adresy środowisk wdrożeniowych są zależnością wydania, a nie częścią obliczeń domenowych.

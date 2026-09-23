# Badania i decyzje: Kalkulator harmonogramu POLSTR

## Granice modułów

**Decyzja**: `src/domena/` przyjmuje komplet parametrów, serię wskaźnika i nadpłaty jako jawne argumenty. `src/dane/` importuje JSON i wybiera serię. Route handler odpowiada wyłącznie za parsowanie oraz konwersję jednostek, a ekran za prezentację i CSV.

**Uzasadnienie**: domena pozostaje deterministyczna, niezależna od Next.js i możliwa do testowania bez I/O. Układ odpowiada konstytucji i istniejącemu szkieletowi.

**Rozważone alternatywy**: import JSON bezpośrednio w domenie odrzucono jako ukryte I/O; obliczenia w route handlerze odrzucono jako naruszenie granicy warstw.

## Reprezentacja kwot i zaokrąglanie

**Decyzja**: wszystkie kwoty domenowe są całkowitymi liczbami groszy. Wynik pojedynczego obliczenia pieniężnego jest zaokrąglany przez `Math.round` do najbliższego grosza. Ostatnia planowana albo wcześniejsza kończąca rata pobiera cały pozostały kapitał.

**Uzasadnienie**: jedna reprezentacja eliminuje kumulację błędów kwotowych i zapewnia saldo końcowe zero. Jest zgodna z liczbą kontrolną z `BRIEF.md`.

**Rozważone alternatywy**: kwoty w złotych jako `number` odrzucono z powodu błędów binarnych; biblioteka dziesiętna wymagałaby nowej zależności.

## Stopa i rata okresowa

**Decyzja**: miesięczna stopa wynosi `(wskaznik + marza) / 12`. Odsetki to saldo przed spłatą razy stopa miesięczna. Dla rat równych kwota jest obliczana wzorem annuitetowym dla bieżącego salda, bieżącej stopy i pozostałej planowanej liczby rat; przy zmianie stopy lub nadpłacie w trybie obniżenia raty jest przeliczana. Dla rat malejących planowany kapitał to pozostałe saldo podzielone przez pozostałą planowaną liczbę rat.

**Uzasadnienie**: odtwarza konwencję liczby kontrolnej i pozwala uwzględnić zmienny wskaźnik bez kapitalizacji dziennej.

**Rozważone alternatywy**: stała rata przez cały okres mimo zmian stopy odrzucona, ponieważ nie odzwierciedla zmiennego oprocentowania; dzienne naliczanie odsetek jest poza MVP.

## Wybór wartości wskaźnika

**Decyzja**: dla daty raty wybierany jest ostatni wpis, którego `od` nie jest późniejsze od tej daty. Wpisy POLSTR mogą zmieniać wartość co miesiąc, a wpisy WIBOR co kwartał. Po końcu serii obowiązuje ostatni wpis; data raty wcześniejsza od pierwszego wpisu powoduje błąd walidacji.

**Uzasadnienie**: jedna reguła obsługuje obie częstotliwości i odpowiada semantyce plików JSON. Odrzucenie daty bez wcześniejszej wartości zapobiega zgadywaniu stopy.

**Rozważone alternatywy**: wybór wpisu według indeksu raty odrzucono, bo nie uwzględnia rzeczywistych dat; użycie pierwszego wpisu wstecz odrzucono jako nieudokumentowane uzupełnianie historii.

## Daty kolejnych rat

**Decyzja**: raty przypadają co miesiąc w dniu wynikającym z daty pierwszej raty. Jeżeli miesiąc nie ma takiego dnia, używany jest jego ostatni dzień. Obliczenia korzystają z jawnej arytmetyki dat UTC i nie odczytują czasu systemowego.

**Uzasadnienie**: reguła jest deterministyczna dla dat takich jak 31 stycznia i nie zależy od strefy procesu.

**Rozważone alternatywy**: automatyczne przepełnienie konstruktora `Date` odrzucono, bo może przeskoczyć do kolejnego miesiąca; biblioteka dat wymagałaby nowej zależności.

## Nadpłaty

**Decyzja**: w danym miesiącu najpierw naliczane są odsetki od salda początkowego i pobierana planowana część kapitałowa, następnie suma nadpłat tego miesiąca zmniejsza saldo. Nadpłata jest ograniczana do pozostałego salda. Tryb `obniz_rate` zachowuje datę końcową i przelicza kolejne raty, a `skroc_okres` zachowuje sposób wyznaczania planowanej raty bez wydłużania okresu i kończy harmonogram po spłacie. Wiele nadpłat tego samego miesiąca jest sumowanych; sprzeczne tryby w jednym miesiącu są odrzucane.

**Uzasadnienie**: kolejność daje jednoznaczne odsetki za miesiąc, zapobiega ujemnemu saldu i obsługuje przypadki brzegowe ze specyfikacji.

**Rozważone alternatywy**: naliczanie odsetek po nadpłacie odrzucono, bo wymagałoby daty nadpłaty wewnątrz okresu; ciche rozstrzyganie sprzecznych trybów odrzucono jako nieprzewidywalne.

## Kontrakt HTTP i błędy

**Decyzja**: endpoint pozostaje `GET /api/harmonogram`. Proste pola są osobnymi parametrami, a każda nadpłata osobnym parametrem `nadplata` w formacie `miesiac:kwota:tryb`. Sukces zwraca kwoty w groszach; błąd klienta zwraca status 400 oraz `{ "blad": string }`.

**Uzasadnienie**: format jest czytelny dla `URLSearchParams`, obsługuje wiele wartości bez ręcznego JSON w URL i zachowuje liczby całkowite w odpowiedzi.

**Rozważone alternatywy**: JSON zakodowany w jednym parametrze odrzucono jako trudniejszy do ręcznej diagnostyki; POST odrzucono, bo brief wymaga GET.

## Strategia testów

**Decyzja**: testy Vitest obejmują wyłącznie publiczne funkcje domeny i danych. Każda zmiana obliczeń zaczyna się testem z oczekiwanymi kwotami, w tym przypadkiem 400 000 zł oraz niezmiennikami sumy kapitału i salda.

**Uzasadnienie**: spełnia konstytucję i testuje zachowanie zamiast szczegółów implementacji.

**Rozważone alternatywy**: testy komponentu i route handlera odrzucono zgodnie z zakresem projektu; migawki całych harmonogramów odrzucono jako mało diagnostyczne.

Wszystkie kwestie techniczne są rozstrzygnięte.
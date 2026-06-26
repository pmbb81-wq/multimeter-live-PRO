New version! One exe file! One click! Working on all Windows.

-Working with Zoyi 703s (BT AND UART)

-Working with Zoyi 706s (BT ONLY)

-PORT COM SELECT

-BROWSER SELECT

-Protocol Select (Standard and extended)

-AC & DC switch plus Hertz label in AC.

Tested on Zoyi 703s and Zoyi 706s.

<img width="1913" height="941" alt="image" src="https://github.com/user-attachments/assets/bc22ec24-068d-4e04-8313-f03c98febc80" />

Add bluetooth device:

<img width="1437" height="839" alt="image" src="https://github.com/user-attachments/assets/c879d9c2-6788-4ef7-a9b7-68765140eacb" />

<img width="1027" height="427" alt="image" src="https://github.com/user-attachments/assets/b7b0da32-b669-459d-8d02-cbc2f781ca8a" />

Zoyi ZT-706S CONNECTED

<img width="1916" height="929" alt="image" src="https://github.com/user-attachments/assets/7655a7aa-04c0-4e8b-b244-a3aa4b8f308e" />

<img width="1916" height="923" alt="image" src="https://github.com/user-attachments/assets/270e88c1-ee4a-4847-b134-694b3e4284c6" />

AC VOLTAGE:

<img width="1902" height="925" alt="image" src="https://github.com/user-attachments/assets/5bafee3b-d9a7-4d83-898e-1445075ae510" />

Port Select
<img width="584" height="279" alt="image" src="https://github.com/user-attachments/assets/976bd048-2ce7-446c-b3c5-be9de17dfa6c" />












Multimeter·Live

Panel roboczy (dashboard) w czasie rzeczywistym dla multimetru ZOYI ZT703s, działający w całości w przeglądarce. Podłącz miernik za pomocą Web Serial API, obserwuj odczyty na żywo na dużym wyświetlaczu cyfrowym oraz na płynnym wykresie trendów, rejestruj sesje pomiarowe z bieżącymi statystykami i eksportuj wyniki do pliku CSV — bez backendu, bez instalacji.
Demo na żywo

https://fyfar.github.io/multimeter-live/

Otwórz link w przeglądarce opartej na Chromium, podłącz miernik i kliknij Connect (Połącz). Wszystko działa lokalnie w Twojej przeglądarce — żadne dane nie opuszczają Twojego komputera.
Instalacja i działanie offline

Multimeter·Live to Progresywna Aplikacja Internetowa (PWA): w obsługiwanej przeglądarce możesz ją zainstalować (ikona instalacji na pasku adresu), aby uruchamiać ją w osobnym oknie, tak jak natywną aplikację. Po pierwszej wizycie aplikacja działa również całkowicie offline — co jest niezwykle wygodne przy stole warsztatowym lub w terenie bez dostępu do Wi-Fi, ponieważ miernik łączy się przez USB, a aplikacja nie potrzebuje sieci do działania.

Gdy publikowana jest nowa wersja, aplikacja nie przeładowuje się automatycznie (mogłoby to przerwać rejestrację danych). Zamiast tego wyświetla mały komunikat „A new version is available — Reload / Later” (Dostępna jest nowa wersja — Przeładuj / Później), dzięki czemu aktualizujesz ją na własnych warunkach. Nigdy nie musisz instalować jej ponownie, aby dokonać aktualizacji.

    To nie jest oficjalny produkt ZOYI / ZOTEK. Multimeter·Live to niezależny projekt społecznościowy i nie jest powiązany, wspierany ani autoryzowany przez firmy ZOYI lub ZOTEK. Nazwy „ZOYI”, „ZOTEK” oraz „ZT703s” zostały użyte wyłącznie w celu opisania sprzętu, z którym współpracuje to narzędzie.

    Obsługiwane urządzenia: Narzędzie stworzone specyficznie dla ZOYI ZT703s i jego formatu pakietów szeregowych. Modele ZT703s+ oraz ZT706 prawdopodobnie korzystają z tego samego protokołu i mogą działać, ale nie zostały przetestowane. Inne multimetry nie są obsługiwane.

Funkcje

    Cyfrowy odczyt na żywo aktualnego pomiaru, trybu, jednostki i rozdzielczości.

    Płynny wykres trendów z możliwością wyboru okna czasowego — 10 s, 1 m, 10 m, 1 h lub wszystkie (rysuje całą sesję).

    Logowanie sesji z bieżącymi statystykami: średnia, minimum, maksimum, międzyszczytowa (peak-to-peak), liczba próbek oraz odchylenie standardowe.

    Automatyczne logowanie wyzwalane progiem (Trigger) — ustaw próg, a rejestracja rozpocznie się automatycznie, gdy mierzona wartość go przekroczy, i zatrzyma się, gdy spadnie poniżej (zastosowano histerezę, dzięki czemu sygnał oscylujący na granicy progu nie powoduje ciągłego włączania i wyłączania zapisu).

    Automatyczne lub ręczne skalowanie osi Y, z oznaczaniem na wykresie próbek spoza zakresu.

    Eksport do CSV zarejestrowanej sesji (znacznik czasu, tryb, wartość, jednostka).

    Konfigurowalna prędkość transmisji (9600–115200 bodów).

    Obsługiwane tryby: napięcie, prąd, rezystancja, ciągłość obwodu, dioda, pojemność. Wartości są normalizowane do podstawowych jednostek układu SI (np. mV → V), dzięki czemu zmiana jednostki w trakcie pomiaru nie powoduje „skoków” na wykresie.

Wymagania

    Multimetr ZOYI ZT703s podłączony przez port szeregowy USB (patrz uwaga o urządzeniach powyżej).

    Przeglądarka oparta na Chromium (Chrome, Edge, Opera). Interfejs Web Serial API nie jest dostępny w przeglądarkach Firefox ani Safari.

    Serwowanie strony z poziomu https:// lub localhost — Web Serial wymaga bezpiecznego kontekstu. Demo na żywo jest serwowane przez HTTPS, więc działa od razu.

Uruchomienie lokalne
Bash

npm install
npm run dev

Otwórz adres http://localhost:3000, kliknij Connect i wybierz swój port szeregowy z monitu przeglądarki.
Współpraca (Contributing)

Zgłoszenia problemów (Issues) oraz Pull Requesty są mile widziane! Jeśli posiadasz model ZT703s+ lub ZT706 i możesz potwierdzić, czy działa, albo chcesz dodać nową funkcję lub naprawić błąd, otwórz zgłoszenie (issue) lub wyślij PR.
## License

[MIT](./LICENSE)

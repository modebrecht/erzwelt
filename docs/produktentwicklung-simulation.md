# Produktentwicklung – Simulation

Erzeugt mit `node tests/sim/produktentwicklung.mjs --md docs/produktentwicklung-simulation.md` (echte Spiel-Logik, fester Zufall).
Netto = Gewinn mit Forschung − Gewinn ohne Forschung am Etappenende (Tag 720), nach allen Kosten. «Wieder vorn» = erster Tag, an dem der Lauf mit Forschung den Lauf ohne eingeholt hat.
Szenario: eine voll besetzte Fabrik (China), Rohstoffe mit 25 % Reserve, Verkaufsteam reicht (wo nicht anders angegeben), Ruf 70, keine Ereignisse. Rohstoffe 50 % = halbe Fabrikleistung; Verkaufsteam 40 % = Team schafft 40 % der Produktion.

## 1. Stufe 2 je Produkt, Schwierigkeit, Startzeitpunkt und Forscher

| Produkt | Stufe | Start | Absatz/Tag | Junior netto | Spezialist netto | Experte netto | wieder vorn (J/S/E) |
|---|---|---:|---:|---:|---:|---:|---|
| Ladekabel | mittel | 60 | 37.9 | CHF 140'566 | CHF 141'050 | CHF 141'851 | 212 / 210 / 207 |
| Ladekabel | mittel | 300 | 37.9 | CHF 74'122 | CHF 74'606 | CHF 75'407 | 452 / 450 / 447 |
| Ladekabel | mittel | 600 | 37.9 | −CHF 8'933 | −CHF 8'449 | −CHF 7'648 | – / – / – |
| Ladekabel | schwer | 60 | 37.9 | CHF 88'241 | CHF 88'310 | CHF 88'696 | 264 / 264 / 262 |
| Ladekabel | schwer | 300 | 37.9 | CHF 41'730 | CHF 41'799 | CHF 42'185 | 504 / 504 / 502 |
| Ladekabel | schwer | 600 | 37.9 | −CHF 16'408 | −CHF 16'339 | −CHF 15'954 | – / – / – |
| E-Bike-Motor | mittel | 60 | 24 | CHF 305'212 | CHF 307'352 | CHF 309'809 | 218 / 214 / 210 |
| E-Bike-Motor | mittel | 300 | 24 | CHF 159'284 | CHF 161'424 | CHF 163'881 | 458 / 454 / 450 |
| E-Bike-Motor | mittel | 600 | 24 | −CHF 23'127 | −CHF 20'987 | −CHF 18'530 | – / – / – |
| E-Bike-Motor | schwer | 60 | 24 | CHF 190'293 | CHF 191'522 | CHF 193'066 | 272 / 270 / 266 |
| E-Bike-Motor | schwer | 300 | 24 | CHF 88'144 | CHF 89'372 | CHF 90'916 | 512 / 510 / 506 |
| E-Bike-Motor | schwer | 600 | 24 | −CHF 39'544 | −CHF 38'316 | −CHF 36'771 | – / – / – |
| Smartphone | mittel | 60 | 15 | CHF 628'470 | CHF 633'814 | CHF 639'475 | 217 / 212 / 208 |
| Smartphone | mittel | 300 | 15 | CHF 328'470 | CHF 333'814 | CHF 339'474 | 457 / 452 / 448 |
| Smartphone | mittel | 600 | 15 | −CHF 46'313 | −CHF 40'945 | −CHF 35'260 | – / – / – |
| Smartphone | schwer | 60 | 15 | CHF 392'274 | CHF 395'745 | CHF 399'533 | 271 / 267 / 263 |
| Smartphone | schwer | 300 | 15 | CHF 182'274 | CHF 185'744 | CHF 189'532 | 511 / 507 / 503 |
| Smartphone | schwer | 600 | 15 | −CHF 80'074 | −CHF 76'587 | −CHF 72'782 | – / – / – |
| Mainboard | mittel | 60 | 16 | CHF 438'875 | CHF 442'322 | CHF 446'086 | 215 / 211 / 206 |
| Mainboard | mittel | 300 | 16 | CHF 230'218 | CHF 233'665 | CHF 237'429 | 455 / 451 / 446 |
| Mainboard | mittel | 600 | 16 | −CHF 30'604 | −CHF 27'157 | −CHF 23'393 | – / – / – |
| Mainboard | schwer | 60 | 16 | CHF 274'558 | CHF 276'700 | CHF 279'160 | 268 / 265 / 261 |
| Mainboard | schwer | 300 | 16 | CHF 128'498 | CHF 130'640 | CHF 133'100 | 508 / 505 / 501 |
| Mainboard | schwer | 600 | 16 | −CHF 54'077 | −CHF 51'935 | −CHF 49'475 | – / – / – |
| Konsole | mittel | 60 | 14 | CHF 540'471 | CHF 544'957 | CHF 549'759 | 218 / 214 / 210 |
| Konsole | mittel | 300 | 14 | CHF 281'668 | CHF 286'203 | CHF 291'054 | 459 / 454 / 450 |
| Konsole | mittel | 600 | 14 | −CHF 41'325 | −CHF 36'839 | −CHF 32'037 | – / – / – |
| Konsole | schwer | 60 | 14 | CHF 336'675 | CHF 339'545 | CHF 342'731 | 274 / 270 / 266 |
| Konsole | schwer | 300 | 14 | CHF 155'513 | CHF 158'417 | CHF 161'637 | 514 / 510 / 506 |
| Konsole | schwer | 600 | 14 | −CHF 70'583 | −CHF 67'713 | −CHF 64'526 | – / – / – |
| Smart-TV | mittel | 60 | 12 | CHF 507'105 | CHF 511'223 | CHF 515'657 | 215 / 211 / 206 |
| Smart-TV | mittel | 300 | 12 | CHF 265'965 | CHF 270'133 | CHF 274'617 | 455 / 451 / 446 |
| Smart-TV | mittel | 600 | 12 | −CHF 34'935 | −CHF 30'817 | −CHF 26'383 | – / – / – |
| Smart-TV | schwer | 60 | 12 | CHF 317'218 | CHF 319'831 | CHF 322'760 | 269 / 265 / 261 |
| Smart-TV | schwer | 300 | 12 | CHF 148'420 | CHF 151'068 | CHF 154'032 | 509 / 505 / 501 |
| Smart-TV | schwer | 600 | 12 | −CHF 62'210 | −CHF 59'597 | −CHF 56'668 | – / – / – |
| E-Bike-Akku | mittel | 60 | 10 | CHF 302'630 | CHF 304'828 | CHF 307'342 | 227 / 223 / 219 |
| E-Bike-Akku | mittel | 300 | 10 | CHF 154'884 | CHF 157'043 | CHF 159'518 | 468 / 464 / 460 |
| E-Bike-Akku | mittel | 600 | 10 | −CHF 29'798 | −CHF 27'640 | −CHF 25'165 | – / – / – |
| E-Bike-Akku | schwer | 60 | 10 | CHF 186'386 | CHF 187'654 | CHF 189'240 | 286 / 283 / 279 |
| E-Bike-Akku | schwer | 300 | 10 | CHF 82'964 | CHF 84'205 | CHF 85'762 | 526 / 523 / 520 |
| E-Bike-Akku | schwer | 600 | 10 | −CHF 46'314 | −CHF 45'073 | −CHF 43'515 | – / – / – |

## 2. Stufe 2 und 3 nacheinander (Start Tag 60)

| Produkt | Stufe | Forscher | Kosten | fertig an Tag | netto |
|---|---|---|---:|---|---:|
| Ladekabel | mittel | junior | CHF 97'700 | 90, 120 | CHF 242'826 |
| Ladekabel | mittel | experte | CHF 100'667 | 80, 100 | CHF 248'165 |
| Ladekabel | schwer | junior | CHF 97'700 | 90, 120 | CHF 140'668 |
| Ladekabel | schwer | experte | CHF 100'667 | 80, 100 | CHF 143'515 |
| E-Bike-Motor | mittel | junior | CHF 230'700 | 90, 120 | CHF 517'183 |
| E-Bike-Motor | mittel | experte | CHF 233'667 | 80, 100 | CHF 532'458 |
| E-Bike-Motor | schwer | junior | CHF 230'700 | 90, 120 | CHF 292'818 |
| E-Bike-Motor | schwer | experte | CHF 233'667 | 80, 100 | CHF 302'620 |
| Smartphone | mittel | junior | CHF 473'700 | 90, 120 | CHF 1'063'477 |
| Smartphone | mittel | experte | CHF 476'667 | 80, 100 | CHF 1'097'974 |
| Smartphone | schwer | junior | CHF 473'700 | 90, 120 | CHF 602'324 |
| Smartphone | schwer | experte | CHF 476'667 | 80, 100 | CHF 625'582 |
| Mainboard | mittel | junior | CHF 322'700 | 90, 120 | CHF 746'668 |
| Mainboard | mittel | experte | CHF 325'667 | 80, 100 | CHF 769'783 |
| Mainboard | schwer | junior | CHF 322'700 | 90, 120 | CHF 425'858 |
| Mainboard | schwer | experte | CHF 325'667 | 80, 100 | CHF 441'148 |
| Konsole | mittel | junior | CHF 412'700 | 90, 120 | CHF 913'629 |
| Konsole | mittel | experte | CHF 415'667 | 80, 100 | CHF 942'976 |
| Konsole | schwer | junior | CHF 412'700 | 90, 120 | CHF 515'730 |
| Konsole | schwer | experte | CHF 415'667 | 80, 100 | CHF 535'383 |
| Smart-TV | mittel | junior | CHF 374'700 | 90, 120 | CHF 861'105 |
| Smart-TV | mittel | experte | CHF 377'667 | 80, 100 | CHF 888'243 |
| Smart-TV | schwer | junior | CHF 374'700 | 90, 120 | CHF 490'364 |
| Smart-TV | schwer | experte | CHF 377'667 | 80, 100 | CHF 508'470 |
| E-Bike-Akku | mittel | junior | CHF 250'700 | 90, 120 | CHF 505'674 |
| E-Bike-Akku | mittel | experte | CHF 253'667 | 80, 100 | CHF 521'294 |
| E-Bike-Akku | schwer | junior | CHF 250'700 | 90, 120 | CHF 278'762 |
| E-Bike-Akku | schwer | experte | CHF 253'667 | 80, 100 | CHF 288'806 |

## 3. Engpässe (Mittel, Start Tag 60, Stufe 2)

| Produkt | Variante | Absatz/Tag | Junior netto | Experte netto |
|---|---|---:|---:|---:|
| Ladekabel | Rohstoffe 50 % | 19 | CHF 54'641 | CHF 54'563 |
| Ladekabel | Verkaufsteam 40 % | 20 | CHF 27'575 | CHF 27'067 |
| Ladekabel | Lager voll (20 Tage Nachfrage) | 38.9 | CHF 109'341 | CHF 109'759 |
| Ladekabel | Ruf 30 | 29 | CHF 55'216 | CHF 55'147 |
| Ladekabel | Ruf 85 | 37.9 | CHF 140'999 | CHF 142'291 |
| Mainboard | Rohstoffe 50 % | 8 | CHF 166'681 | CHF 169'571 |
| Mainboard | Verkaufsteam 40 % | 10 | CHF 116'375 | CHF 118'467 |
| Mainboard | Lager voll (20 Tage Nachfrage) | 16.9 | CHF 438'875 | CHF 446'086 |
| Mainboard | Ruf 30 | 16 | CHF 436'702 | CHF 443'878 |
| Mainboard | Ruf 85 | 16 | CHF 439'438 | CHF 446'658 |
| Konsole | Rohstoffe 50 % | 7 | CHF 204'073 | CHF 208'030 |
| Konsole | Verkaufsteam 40 % | 10 | CHF 182'608 | CHF 186'227 |
| Konsole | Lager voll (20 Tage Nachfrage) | 14.5 | CHF 545'980 | CHF 557'619 |
| Konsole | Ruf 30 | 14 | CHF 509'859 | CHF 517'766 |
| Konsole | Ruf 85 | 14 | CHF 541'572 | CHF 550'878 |

## 4. Vergleich mit bestehenden Verbesserungen (Mittel, ab Tag 1, eine Fabrik)

| Produkt | Verbesserung | Preis | netto bis Tag 720 |
|---|---|---:|---:|
| Ladekabel | markt2 | CHF 260'000 | CHF 58'489 |
| Ladekabel | fab1 | CHF 100'000 | −CHF 1'248'133 |
| Ladekabel | Forschung Stufe 2 (Junior) zusätzlich zu markt2 | CHF 33'850 | CHF 154'519 |
| Mainboard | markt2 | CHF 260'000 | CHF 740'163 |
| Mainboard | fab1 | CHF 100'000 | CHF 671'260 |
| Mainboard | Forschung Stufe 2 (Junior) zusätzlich zu markt2 | CHF 108'850 | CHF 482'693 |
| Konsole | markt2 | CHF 260'000 | CHF 979'609 |
| Konsole | fab1 | CHF 100'000 | CHF 1'873'293 |
| Konsole | Forschung Stufe 2 (Junior) zusätzlich zu markt2 | CHF 138'850 | CHF 594'817 |

## 5. Stapeln mit anderen Preisfaktoren

Mainboard: Grundpreis 1100.00, mit markt2 1188.00, mit markt2 und Stufe 3 1306.80 (erwartet 1306.80 = Grundpreis × 1.08 × 1.10).


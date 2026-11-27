# Produktentwicklung – Simulation

Erzeugt mit `node tests/sim/produktentwicklung.mjs --md docs/produktentwicklung-simulation.md` (echte Spiel-Logik, fester Zufall).
Netto = Gewinn mit Forschung − Gewinn ohne Forschung am Etappenende (Tag 720), nach allen Kosten. «Wieder vorn» = erster Tag, an dem der Lauf mit Forschung den Lauf ohne eingeholt hat.
Szenario: eine voll besetzte Fabrik (China), Rohstoffe mit 25 % Reserve, Verkaufsteam reicht (wo nicht anders angegeben), Ruf 70, keine Ereignisse. Rohstoffe 50 % = halbe Fabrikleistung; Verkaufsteam 40 % = Team schafft 40 % der Produktion.

## 1. Stufe 2 je Produkt, Schwierigkeit, Startzeitpunkt und Forscher

| Produkt | Stufe | Start | Absatz/Tag | Junior netto | Spezialist netto | Experte netto | wieder vorn (J/S/E) |
|---|---|---:|---:|---:|---:|---:|---|
| Ladekabel | mittel | 60 | 37.9 | CHF 162'566 | CHF 163'050 | CHF 163'851 | 132 / 131 / 128 |
| Ladekabel | mittel | 300 | 37.9 | CHF 96'122 | CHF 96'606 | CHF 97'407 | 372 / 371 / 368 |
| Ladekabel | mittel | 600 | 37.9 | CHF 13'067 | CHF 13'551 | CHF 14'352 | 672 / 671 / 668 |
| Ladekabel | schwer | 60 | 37.9 | CHF 110'241 | CHF 110'310 | CHF 110'696 | 151 / 150 / 148 |
| Ladekabel | schwer | 300 | 37.9 | CHF 63'730 | CHF 63'799 | CHF 64'185 | 391 / 390 / 388 |
| Ladekabel | schwer | 600 | 37.9 | CHF 5'592 | CHF 5'661 | CHF 6'046 | 691 / 690 / 688 |
| E-Bike-Motor | mittel | 60 | 24 | CHF 366'712 | CHF 368'852 | CHF 371'309 | 116 / 113 / 109 |
| E-Bike-Motor | mittel | 300 | 24 | CHF 220'784 | CHF 222'924 | CHF 225'381 | 356 / 353 / 349 |
| E-Bike-Motor | mittel | 600 | 24 | CHF 38'373 | CHF 40'513 | CHF 42'970 | 656 / 653 / 649 |
| E-Bike-Motor | schwer | 60 | 24 | CHF 251'793 | CHF 253'022 | CHF 254'566 | 128 / 125 / 121 |
| E-Bike-Motor | schwer | 300 | 24 | CHF 149'644 | CHF 150'872 | CHF 152'416 | 368 / 365 / 361 |
| E-Bike-Motor | schwer | 600 | 24 | CHF 21'956 | CHF 23'184 | CHF 24'729 | 668 / 665 / 661 |
| Smartphone | mittel | 60 | 15 | CHF 766'470 | CHF 771'814 | CHF 777'475 | 106 / 102 / 97 |
| Smartphone | mittel | 300 | 15 | CHF 466'470 | CHF 471'814 | CHF 477'474 | 346 / 342 / 337 |
| Smartphone | mittel | 600 | 15 | CHF 91'687 | CHF 97'055 | CHF 102'740 | 646 / 642 / 637 |
| Smartphone | schwer | 60 | 15 | CHF 530'274 | CHF 533'745 | CHF 537'533 | 113 / 109 / 105 |
| Smartphone | schwer | 300 | 15 | CHF 320'274 | CHF 323'744 | CHF 327'532 | 353 / 349 / 345 |
| Smartphone | schwer | 600 | 15 | CHF 57'926 | CHF 61'413 | CHF 65'218 | 653 / 649 / 645 |
| Mainboard | mittel | 60 | 16 | CHF 532'075 | CHF 535'522 | CHF 539'286 | 108 / 104 / 99 |
| Mainboard | mittel | 300 | 16 | CHF 323'418 | CHF 326'865 | CHF 330'629 | 348 / 344 / 339 |
| Mainboard | mittel | 600 | 16 | CHF 62'596 | CHF 66'043 | CHF 69'807 | 648 / 644 / 639 |
| Mainboard | schwer | 60 | 16 | CHF 367'758 | CHF 369'900 | CHF 372'360 | 115 / 112 / 108 |
| Mainboard | schwer | 300 | 16 | CHF 221'698 | CHF 223'840 | CHF 226'300 | 355 / 352 / 348 |
| Mainboard | schwer | 600 | 16 | CHF 39'123 | CHF 41'265 | CHF 43'725 | 655 / 652 / 648 |
| Konsole | mittel | 60 | 14 | CHF 652'471 | CHF 656'957 | CHF 661'759 | 114 / 110 / 106 |
| Konsole | mittel | 300 | 14 | CHF 393'668 | CHF 398'203 | CHF 403'054 | 354 / 350 / 346 |
| Konsole | mittel | 600 | 14 | CHF 70'675 | CHF 75'161 | CHF 79'963 | 654 / 650 / 646 |
| Konsole | schwer | 60 | 14 | CHF 448'675 | CHF 451'545 | CHF 454'731 | 125 / 121 / 117 |
| Konsole | schwer | 300 | 14 | CHF 267'513 | CHF 270'417 | CHF 273'637 | 365 / 361 / 357 |
| Konsole | schwer | 600 | 14 | CHF 41'417 | CHF 44'287 | CHF 47'474 | 665 / 661 / 657 |
| Smart-TV | mittel | 60 | 12 | CHF 607'605 | CHF 611'723 | CHF 616'157 | 115 / 111 / 106 |
| Smart-TV | mittel | 300 | 12 | CHF 366'465 | CHF 370'633 | CHF 375'117 | 355 / 350 / 346 |
| Smart-TV | mittel | 600 | 12 | CHF 65'565 | CHF 69'683 | CHF 74'117 | 655 / 651 / 646 |
| Smart-TV | schwer | 60 | 12 | CHF 417'718 | CHF 420'331 | CHF 423'260 | 126 / 122 / 118 |
| Smart-TV | schwer | 300 | 12 | CHF 248'920 | CHF 251'568 | CHF 254'532 | 365 / 362 / 357 |
| Smart-TV | schwer | 600 | 12 | CHF 38'290 | CHF 40'903 | CHF 43'832 | 666 / 662 / 658 |
| E-Bike-Akku | mittel | 60 | 10 | CHF 365'130 | CHF 367'328 | CHF 369'842 | 126 / 122 / 118 |
| E-Bike-Akku | mittel | 300 | 10 | CHF 217'384 | CHF 219'543 | CHF 222'018 | 366 / 363 / 358 |
| E-Bike-Akku | mittel | 600 | 10 | CHF 32'702 | CHF 34'860 | CHF 37'335 | 666 / 663 / 658 |
| E-Bike-Akku | schwer | 60 | 10 | CHF 248'886 | CHF 250'154 | CHF 251'740 | 141 / 138 / 134 |
| E-Bike-Akku | schwer | 300 | 10 | CHF 145'464 | CHF 146'705 | CHF 148'262 | 382 / 379 / 375 |
| E-Bike-Akku | schwer | 600 | 10 | CHF 16'186 | CHF 17'427 | CHF 18'985 | 682 / 679 / 675 |

## 2. Stufe 2 und 3 nacheinander (Start Tag 60)

| Produkt | Stufe | Forscher | Kosten | fertig an Tag | netto |
|---|---|---|---:|---|---:|
| Ladekabel | mittel | junior | CHF 29'700 | 90, 120 | CHF 310'826 |
| Ladekabel | mittel | experte | CHF 32'667 | 80, 100 | CHF 316'165 |
| Ladekabel | schwer | junior | CHF 29'700 | 90, 120 | CHF 208'668 |
| Ladekabel | schwer | experte | CHF 32'667 | 80, 100 | CHF 211'515 |
| E-Bike-Motor | mittel | junior | CHF 41'700 | 90, 120 | CHF 706'183 |
| E-Bike-Motor | mittel | experte | CHF 44'667 | 80, 100 | CHF 721'458 |
| E-Bike-Motor | schwer | junior | CHF 41'700 | 90, 120 | CHF 481'818 |
| E-Bike-Motor | schwer | experte | CHF 44'667 | 80, 100 | CHF 491'620 |
| Smartphone | mittel | junior | CHF 53'700 | 90, 120 | CHF 1'483'477 |
| Smartphone | mittel | experte | CHF 56'667 | 80, 100 | CHF 1'517'974 |
| Smartphone | schwer | junior | CHF 53'700 | 90, 120 | CHF 1'022'324 |
| Smartphone | schwer | experte | CHF 56'667 | 80, 100 | CHF 1'045'582 |
| Mainboard | mittel | junior | CHF 39'800 | 90, 120 | CHF 1'029'568 |
| Mainboard | mittel | experte | CHF 42'767 | 80, 100 | CHF 1'052'683 |
| Mainboard | schwer | junior | CHF 39'800 | 90, 120 | CHF 708'758 |
| Mainboard | schwer | experte | CHF 42'767 | 80, 100 | CHF 724'048 |
| Konsole | mittel | junior | CHF 69'700 | 90, 120 | CHF 1'256'629 |
| Konsole | mittel | experte | CHF 72'667 | 80, 100 | CHF 1'285'976 |
| Konsole | schwer | junior | CHF 69'700 | 90, 120 | CHF 858'730 |
| Konsole | schwer | experte | CHF 72'667 | 80, 100 | CHF 878'383 |
| Smart-TV | mittel | junior | CHF 65'700 | 90, 120 | CHF 1'170'105 |
| Smart-TV | mittel | experte | CHF 68'667 | 80, 100 | CHF 1'197'243 |
| Smart-TV | schwer | junior | CHF 65'700 | 90, 120 | CHF 799'364 |
| Smart-TV | schwer | experte | CHF 68'667 | 80, 100 | CHF 817'470 |
| E-Bike-Akku | mittel | junior | CHF 57'700 | 90, 120 | CHF 698'674 |
| E-Bike-Akku | mittel | experte | CHF 60'667 | 80, 100 | CHF 714'294 |
| E-Bike-Akku | schwer | junior | CHF 57'700 | 90, 120 | CHF 471'762 |
| E-Bike-Akku | schwer | experte | CHF 60'667 | 80, 100 | CHF 481'806 |

## 3. Engpässe (Mittel, Start Tag 60, Stufe 2)

| Produkt | Variante | Absatz/Tag | Junior netto | Experte netto |
|---|---|---:|---:|---:|
| Ladekabel | Rohstoffe 50 % | 19 | CHF 76'641 | CHF 76'563 |
| Ladekabel | Verkaufsteam 40 % | 20 | CHF 49'575 | CHF 49'067 |
| Ladekabel | Lager voll (20 Tage Nachfrage) | 38.9 | CHF 131'341 | CHF 131'759 |
| Ladekabel | Ruf 30 | 29 | CHF 77'216 | CHF 77'147 |
| Ladekabel | Ruf 85 | 37.9 | CHF 162'999 | CHF 164'291 |
| Mainboard | Rohstoffe 50 % | 8 | CHF 259'881 | CHF 262'771 |
| Mainboard | Verkaufsteam 40 % | 10 | CHF 209'575 | CHF 211'667 |
| Mainboard | Lager voll (20 Tage Nachfrage) | 16.9 | CHF 532'075 | CHF 539'286 |
| Mainboard | Ruf 30 | 16 | CHF 529'902 | CHF 537'078 |
| Mainboard | Ruf 85 | 16 | CHF 532'638 | CHF 539'858 |
| Konsole | Rohstoffe 50 % | 7 | CHF 316'073 | CHF 320'030 |
| Konsole | Verkaufsteam 40 % | 10 | CHF 294'608 | CHF 298'227 |
| Konsole | Lager voll (20 Tage Nachfrage) | 14.5 | CHF 657'980 | CHF 669'619 |
| Konsole | Ruf 30 | 14 | CHF 621'859 | CHF 629'766 |
| Konsole | Ruf 85 | 14 | CHF 653'572 | CHF 662'878 |

## 4. Vergleich mit bestehenden Verbesserungen (Mittel, ab Tag 1, eine Fabrik)

| Produkt | Verbesserung | Preis | netto bis Tag 720 |
|---|---|---:|---:|
| Ladekabel | markt2 | CHF 260'000 | CHF 58'489 |
| Ladekabel | fab1 | CHF 100'000 | −CHF 1'248'133 |
| Ladekabel | Forschung Stufe 2 (Junior) zusätzlich zu markt2 | CHF 11'850 | CHF 176'519 |
| Mainboard | markt2 | CHF 260'000 | CHF 740'163 |
| Mainboard | fab1 | CHF 100'000 | CHF 671'260 |
| Mainboard | Forschung Stufe 2 (Junior) zusätzlich zu markt2 | CHF 15'650 | CHF 575'893 |
| Konsole | markt2 | CHF 260'000 | CHF 979'609 |
| Konsole | fab1 | CHF 100'000 | CHF 1'873'293 |
| Konsole | Forschung Stufe 2 (Junior) zusätzlich zu markt2 | CHF 26'850 | CHF 706'817 |

## 5. Stapeln mit anderen Preisfaktoren

Mainboard: Grundpreis 1100.00, mit markt2 1188.00, mit markt2 und Stufe 3 1306.80 (erwartet 1306.80 = Grundpreis × 1.08 × 1.10).


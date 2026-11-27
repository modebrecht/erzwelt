# Produktentwicklung – Simulation

Erzeugt mit `node tests/sim/produktentwicklung.mjs --md docs/produktentwicklung-simulation.md` (echte Spiel-Logik, fester Zufall).
Forschung: ab Starttag eine Person angestellt, Ziel = das Produkt der Fabrik, automatisch bis Tier 3, danach gekündigt (wo nicht anders angegeben). Kosten = bezahlter Lohn. Netto = Gewinn mit Forschung − Gewinn ohne Forschung am Etappenende (Tag 720). «Wieder vorn» = erster Tag, an dem der Lauf mit Forschung den Lauf ohne eingeholt hat.
Szenario: eine voll besetzte Fabrik (China), Rohstoffe mit 25 % Reserve, Verkaufsteam reicht (wo nicht anders angegeben), Ruf 70, keine Ereignisse. Rohstoffe 50 % = halbe Fabrikleistung; Verkaufsteam 40 % = Team schafft 40 % der Produktion.

## 1. Bis Tier 3 je Produkt, Schwierigkeit, Startzeitpunkt und Person

| Produkt | Stufe | Start | Absatz/Tag | Junior netto | Spezialist netto | Experte netto | wieder vorn (J/S/E) |
|---|---|---:|---:|---:|---:|---:|---|
| Ladekabel | mittel | 60 | 37.9 | CHF 334'826 | CHF 337'179 | CHF 340'165 | 105 / 111 / 105 |
| Ladekabel | mittel | 300 | 37.9 | CHF 201'938 | CHF 204'291 | CHF 207'277 | 345 / 351 / 345 |
| Ladekabel | mittel | 600 | 37.9 | CHF 35'828 | CHF 38'180 | CHF 41'166 | 645 / 651 / 645 |
| Ladekabel | schwer | 60 | 37.9 | CHF 232'668 | CHF 233'775 | CHF 235'515 | 118 / 116 / 112 |
| Ladekabel | schwer | 300 | 37.9 | CHF 139'647 | CHF 140'753 | CHF 142'494 | 358 / 356 / 352 |
| Ladekabel | schwer | 600 | 37.9 | CHF 23'369 | CHF 24'476 | CHF 26'216 | 658 / 656 / 652 |
| E-Bike-Motor | mittel | 60 | 24 | CHF 742'183 | CHF 749'504 | CHF 757'458 | 95 / 93 / 91 |
| E-Bike-Motor | mittel | 300 | 24 | CHF 450'326 | CHF 457'647 | CHF 465'601 | 335 / 333 / 331 |
| E-Bike-Motor | mittel | 600 | 24 | CHF 85'505 | CHF 92'826 | CHF 100'780 | 635 / 633 / 631 |
| E-Bike-Motor | schwer | 60 | 24 | CHF 517'818 | CHF 522'403 | CHF 527'620 | 98 / 98 / 100 |
| E-Bike-Motor | schwer | 300 | 24 | CHF 313'518 | CHF 318'103 | CHF 323'320 | 338 / 338 / 340 |
| E-Bike-Motor | schwer | 600 | 24 | CHF 58'144 | CHF 62'728 | CHF 67'946 | 638 / 638 / 640 |
| Smartphone | mittel | 60 | 15 | CHF 1'531'477 | CHF 1'548'409 | CHF 1'565'974 | 92 / 88 / 84 |
| Smartphone | mittel | 300 | 15 | CHF 931'475 | CHF 948'407 | CHF 965'972 | 332 / 328 / 324 |
| Smartphone | mittel | 600 | 15 | CHF 181'764 | CHF 198'769 | CHF 216'407 | 632 / 628 / 624 |
| Smartphone | schwer | 60 | 15 | CHF 1'070'324 | CHF 1'081'636 | CHF 1'093'582 | 93 / 90 / 86 |
| Smartphone | schwer | 300 | 15 | CHF 650'323 | CHF 661'635 | CHF 673'581 | 333 / 330 / 326 |
| Smartphone | schwer | 600 | 15 | CHF 125'525 | CHF 136'888 | CHF 148'885 | 633 / 630 / 626 |
| Mainboard | mittel | 60 | 16 | CHF 1'063'668 | CHF 1'074'909 | CHF 1'086'783 | 93 / 90 / 86 |
| Mainboard | mittel | 300 | 16 | CHF 646'354 | CHF 657'595 | CHF 669'469 | 333 / 330 / 326 |
| Mainboard | mittel | 600 | 16 | CHF 124'711 | CHF 135'952 | CHF 147'826 | 633 / 630 / 626 |
| Mainboard | schwer | 60 | 16 | CHF 742'858 | CHF 750'186 | CHF 758'148 | 95 / 93 / 91 |
| Mainboard | schwer | 300 | 16 | CHF 450'738 | CHF 458'066 | CHF 466'028 | 335 / 333 / 331 |
| Mainboard | schwer | 600 | 16 | CHF 85'588 | CHF 92'916 | CHF 100'878 | 635 / 633 / 631 |
| Konsole | mittel | 60 | 14 | CHF 1'320'629 | CHF 1'334'986 | CHF 1'349'976 | 92 / 89 / 85 |
| Konsole | mittel | 300 | 14 | CHF 802'731 | CHF 817'234 | CHF 832'370 | 332 / 329 / 324 |
| Konsole | mittel | 600 | 14 | CHF 157'036 | CHF 171'393 | CHF 186'383 | 632 / 629 / 625 |
| Konsole | schwer | 60 | 14 | CHF 922'730 | CHF 932'240 | CHF 942'383 | 94 / 91 / 88 |
| Konsole | schwer | 300 | 14 | CHF 560'202 | CHF 569'814 | CHF 580'059 | 334 / 331 / 327 |
| Konsole | schwer | 600 | 14 | CHF 108'215 | CHF 117'725 | CHF 127'868 | 634 / 631 / 628 |
| Smart-TV | mittel | 60 | 12 | CHF 1'230'105 | CHF 1'243'358 | CHF 1'257'243 | 93 / 89 / 85 |
| Smart-TV | mittel | 300 | 12 | CHF 747'525 | CHF 760'928 | CHF 774'963 | 333 / 329 / 325 |
| Smart-TV | mittel | 600 | 12 | CHF 146'025 | CHF 159'278 | CHF 173'163 | 633 / 629 / 625 |
| Smart-TV | schwer | 60 | 12 | CHF 859'364 | CHF 868'100 | CHF 877'470 | 94 / 91 / 88 |
| Smart-TV | schwer | 300 | 12 | CHF 521'558 | CHF 530'399 | CHF 539'874 | 334 / 331 / 328 |
| Smart-TV | schwer | 600 | 12 | CHF 100'508 | CHF 109'244 | CHF 118'614 | 634 / 631 / 628 |
| E-Bike-Akku | mittel | 60 | 10 | CHF 750'674 | CHF 758'167 | CHF 766'294 | 95 / 92 / 90 |
| E-Bike-Akku | mittel | 300 | 10 | CHF 455'418 | CHF 462'793 | CHF 470'802 | 335 / 333 / 330 |
| E-Bike-Akku | mittel | 600 | 10 | CHF 86'053 | CHF 93'428 | CHF 101'436 | 635 / 633 / 630 |
| E-Bike-Akku | schwer | 60 | 10 | CHF 523'762 | CHF 528'467 | CHF 533'806 | 98 / 98 / 99 |
| E-Bike-Akku | schwer | 300 | 10 | CHF 317'082 | CHF 321'705 | CHF 326'961 | 338 / 338 / 340 |
| E-Bike-Akku | schwer | 600 | 10 | CHF 58'527 | CHF 63'149 | CHF 68'405 | 638 / 638 / 640 |

## 2. Nach Tier 3 nicht gekündigt (Start Tag 60, Lohn bis Tag 720)

| Produkt | Stufe | Person | Lohn | Tier 2 / Tier 3 an Tag | netto |
|---|---|---|---:|---|---:|
| Ladekabel | mittel | junior | CHF 62'700 | 90, 120 | CHF 277'826 |
| Ladekabel | mittel | experte | CHF 143'000 | 80, 100 | CHF 205'832 |
| Ladekabel | schwer | junior | CHF 62'700 | 90, 120 | CHF 175'668 |
| Ladekabel | schwer | experte | CHF 143'000 | 80, 100 | CHF 101'182 |
| E-Bike-Motor | mittel | junior | CHF 62'700 | 90, 120 | CHF 685'183 |
| E-Bike-Motor | mittel | experte | CHF 143'000 | 80, 100 | CHF 623'124 |
| E-Bike-Motor | schwer | junior | CHF 62'700 | 90, 120 | CHF 460'818 |
| E-Bike-Motor | schwer | experte | CHF 143'000 | 80, 100 | CHF 393'287 |
| Smartphone | mittel | junior | CHF 62'700 | 90, 120 | CHF 1'474'477 |
| Smartphone | mittel | experte | CHF 143'000 | 80, 100 | CHF 1'431'641 |
| Smartphone | schwer | junior | CHF 62'700 | 90, 120 | CHF 1'013'324 |
| Smartphone | schwer | experte | CHF 143'000 | 80, 100 | CHF 959'249 |
| Mainboard | mittel | junior | CHF 62'700 | 90, 120 | CHF 1'006'668 |
| Mainboard | mittel | experte | CHF 143'000 | 80, 100 | CHF 952'450 |
| Mainboard | schwer | junior | CHF 62'700 | 90, 120 | CHF 685'858 |
| Mainboard | schwer | experte | CHF 143'000 | 80, 100 | CHF 623'815 |
| Konsole | mittel | junior | CHF 62'700 | 90, 120 | CHF 1'263'629 |
| Konsole | mittel | experte | CHF 143'000 | 80, 100 | CHF 1'215'643 |
| Konsole | schwer | junior | CHF 62'700 | 90, 120 | CHF 865'730 |
| Konsole | schwer | experte | CHF 143'000 | 80, 100 | CHF 808'050 |
| Smart-TV | mittel | junior | CHF 62'700 | 90, 120 | CHF 1'173'105 |
| Smart-TV | mittel | experte | CHF 143'000 | 80, 100 | CHF 1'122'910 |
| Smart-TV | schwer | junior | CHF 62'700 | 90, 120 | CHF 802'364 |
| Smart-TV | schwer | experte | CHF 143'000 | 80, 100 | CHF 743'137 |
| E-Bike-Akku | mittel | junior | CHF 62'700 | 90, 120 | CHF 693'674 |
| E-Bike-Akku | mittel | experte | CHF 143'000 | 80, 100 | CHF 631'960 |
| E-Bike-Akku | schwer | junior | CHF 62'700 | 90, 120 | CHF 466'762 |
| E-Bike-Akku | schwer | experte | CHF 143'000 | 80, 100 | CHF 399'472 |

## 3. Engpässe (Mittel, Start Tag 60, bis Tier 3)

| Produkt | Variante | Absatz/Tag | Junior netto | Experte netto |
|---|---|---:|---:|---:|
| Ladekabel | Rohstoffe 50 % | 19 | CHF 167'069 | CHF 168'316 |
| Ladekabel | Verkaufsteam 40 % | 20 | CHF 114'225 | CHF 114'183 |
| Ladekabel | Lager voll (20 Tage Nachfrage) | 38.9 | CHF 274'978 | CHF 277'715 |
| Ladekabel | Ruf 30 | 29 | CHF 168'191 | CHF 169'466 |
| Ladekabel | Ruf 85 | 37.9 | CHF 335'671 | CHF 341'031 |
| Mainboard | Rohstoffe 50 % | 8 | CHF 532'242 | CHF 542'396 |
| Mainboard | Verkaufsteam 40 % | 10 | CHF 434'025 | CHF 441'783 |
| Mainboard | Lager voll (20 Tage Nachfrage) | 16.9 | CHF 1'063'668 | CHF 1'086'783 |
| Mainboard | Ruf 30 | 16 | CHF 1'059'425 | CHF 1'082'437 |
| Mainboard | Ruf 85 | 16 | CHF 1'064'767 | CHF 1'087'909 |
| Konsole | Rohstoffe 50 % | 7 | CHF 663'825 | CHF 677'179 |
| Konsole | Verkaufsteam 40 % | 10 | CHF 621'908 | CHF 634'248 |
| Konsole | Lager voll (20 Tage Nachfrage) | 14.5 | CHF 1'326'137 | CHF 1'359'353 |
| Konsole | Ruf 30 | 14 | CHF 1'262'217 | CHF 1'288'530 |
| Konsole | Ruf 85 | 14 | CHF 1'322'774 | CHF 1'352'177 |

## 4. Vergleich mit bestehenden Verbesserungen (Mittel, ab Tag 1, eine Fabrik)

| Produkt | Verbesserung | Preis | netto bis Tag 720 |
|---|---|---:|---:|
| Ladekabel | markt2 | CHF 260'000 | CHF 58'489 |
| Ladekabel | fab1 | CHF 100'000 | −CHF 1'248'133 |
| Ladekabel | Forschung bis Tier 3 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 5'700 | CHF 362'068 |
| Mainboard | markt2 | CHF 260'000 | CHF 740'163 |
| Mainboard | fab1 | CHF 100'000 | CHF 671'260 |
| Mainboard | Forschung bis Tier 3 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 5'700 | CHF 1'149'217 |
| Konsole | markt2 | CHF 260'000 | CHF 979'609 |
| Konsole | fab1 | CHF 100'000 | CHF 1'873'293 |
| Konsole | Forschung bis Tier 3 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 5'700 | CHF 1'426'735 |

## 5. Stapeln mit anderen Preisfaktoren

Mainboard: Grundpreis 1100.00, mit markt2 1188.00, mit markt2 und Tier 3 1306.80 (erwartet 1306.80 = Grundpreis × 1.08 × 1.10).


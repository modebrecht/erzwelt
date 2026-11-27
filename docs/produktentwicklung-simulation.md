# Produktentwicklung – Simulation

Erzeugt mit `node tests/sim/produktentwicklung.mjs --md docs/produktentwicklung-simulation.md` (echte Spiel-Logik, fester Zufall).
Forschung: ab Starttag eine Person angestellt, Ziel = das Produkt der Fabrik, automatisch bis Tier 3, danach gekündigt (wo nicht anders angegeben). Kosten = bezahlter Lohn. Netto = Gewinn mit Forschung − Gewinn ohne Forschung am Etappenende (Tag 720). «Wieder vorn» = erster Tag, an dem der Lauf mit Forschung den Lauf ohne eingeholt hat.
Szenario: eine voll besetzte Fabrik (China), Rohstoffe mit 25 % Reserve, Verkaufsteam reicht (wo nicht anders angegeben), Ruf 70, keine Ereignisse. Rohstoffe 50 % = halbe Fabrikleistung; Verkaufsteam 40 % = Team schafft 40 % der Produktion.

## 1. Bis Tier 3 je Produkt, Schwierigkeit, Startzeitpunkt und Person

| Produkt | Stufe | Start | Absatz/Tag | Junior netto | Spezialist netto | Experte netto | wieder vorn (J/S/E) |
|---|---|---:|---:|---:|---:|---:|---|
| Ladekabel | mittel | 60 | 37.9 | CHF 242'693 | CHF 243'151 | CHF 243'610 | 281 / 280 / 280 |
| Ladekabel | mittel | 300 | 37.9 | CHF 109'805 | CHF 110'263 | CHF 110'721 | 521 / 520 / 520 |
| Ladekabel | mittel | 600 | 37.9 | −CHF 23'694 | −CHF 35'542 | −CHF 55'389 | – / – / – |
| Ladekabel | schwer | 60 | 37.9 | CHF 155'485 | CHF 152'206 | CHF 148'927 | 318 / 327 / 335 |
| Ladekabel | schwer | 300 | 37.9 | CHF 62'463 | CHF 59'184 | CHF 55'905 | 558 / 567 / 575 |
| Ladekabel | schwer | 600 | 37.9 | −CHF 26'186 | −CHF 39'279 | −CHF 60'372 | – / – / – |
| E-Bike-Motor | mittel | 60 | 24 | CHF 590'437 | CHF 605'798 | CHF 621'160 | 220 / 221 / 209 |
| E-Bike-Motor | mittel | 300 | 24 | CHF 298'580 | CHF 313'942 | CHF 329'303 | 460 / 461 / 449 |
| E-Bike-Motor | mittel | 600 | 24 | −CHF 13'759 | −CHF 20'638 | −CHF 35'518 | – / – / – |
| E-Bike-Motor | schwer | 60 | 24 | CHF 398'906 | CHF 406'059 | CHF 413'212 | 251 / 242 / 234 |
| E-Bike-Motor | schwer | 300 | 24 | CHF 194'606 | CHF 201'759 | CHF 208'912 | 491 / 482 / 474 |
| E-Bike-Motor | schwer | 600 | 24 | −CHF 19'231 | −CHF 28'847 | −CHF 46'463 | – / – / – |
| Smartphone | mittel | 60 | 15 | CHF 1'264'395 | CHF 1'308'590 | CHF 1'352'786 | 174 / 170 / 175 |
| Smartphone | mittel | 300 | 15 | CHF 664'393 | CHF 708'589 | CHF 752'784 | 414 / 410 / 415 |
| Smartphone | mittel | 600 | 15 | CHF 5'464 | CHF 8'196 | CHF 2'927 | 714 / 710 / 715 |
| Smartphone | schwer | 60 | 15 | CHF 870'676 | CHF 898'013 | CHF 925'350 | 189 / 198 / 191 |
| Smartphone | schwer | 300 | 15 | CHF 450'675 | CHF 478'012 | CHF 505'349 | 429 / 438 / 431 |
| Smartphone | schwer | 600 | 15 | −CHF 5'775 | −CHF 8'663 | −CHF 19'551 | – / – / – |
| Mainboard | mittel | 60 | 16 | CHF 864'875 | CHF 891'998 | CHF 919'122 | 189 / 198 / 191 |
| Mainboard | mittel | 300 | 16 | CHF 447'561 | CHF 474'684 | CHF 501'807 | 429 / 438 / 431 |
| Mainboard | mittel | 600 | 16 | −CHF 5'918 | −CHF 8'877 | −CHF 19'836 | – / – / – |
| Mainboard | schwer | 60 | 16 | CHF 591'013 | CHF 606'399 | CHF 621'785 | 220 / 221 / 209 |
| Mainboard | schwer | 300 | 16 | CHF 298'893 | CHF 314'279 | CHF 329'665 | 460 / 461 / 449 |
| Mainboard | schwer | 600 | 16 | −CHF 13'742 | −CHF 20'614 | −CHF 35'485 | – / – / – |
| Konsole | mittel | 60 | 14 | CHF 1'084'445 | CHF 1'120'916 | CHF 1'157'387 | 179 / 179 / 183 |
| Konsole | mittel | 300 | 14 | CHF 566'912 | CHF 603'274 | CHF 639'635 | 419 / 419 / 423 |
| Konsole | mittel | 600 | 14 | CHF 606 | CHF 908 | −CHF 6'789 | 719 / 718 / – |
| Konsole | schwer | 60 | 14 | CHF 744'712 | CHF 766'641 | CHF 788'571 | 199 / 212 / 197 |
| Konsole | schwer | 300 | 14 | CHF 382'439 | CHF 404'292 | CHF 426'145 | 439 / 452 / 437 |
| Konsole | schwer | 600 | 14 | −CHF 9'176 | −CHF 13'764 | −CHF 26'352 | – / – / – |
| Smart-TV | mittel | 60 | 12 | CHF 1'007'175 | CHF 1'040'333 | CHF 1'073'490 | 182 / 184 / 185 |
| Smart-TV | mittel | 300 | 12 | CHF 524'970 | CHF 558'015 | CHF 591'060 | 422 / 425 / 426 |
| Smart-TV | mittel | 600 | 12 | −CHF 1'595 | −CHF 2'392 | −CHF 11'190 | – / – / – |
| Smart-TV | schwer | 60 | 12 | CHF 690'623 | CHF 710'233 | CHF 729'843 | 205 / 215 / 201 |
| Smart-TV | schwer | 300 | 12 | CHF 353'079 | CHF 372'611 | CHF 392'142 | 445 / 455 / 441 |
| Smart-TV | schwer | 600 | 12 | −CHF 10'717 | −CHF 16'075 | −CHF 29'433 | – / – / – |
| E-Bike-Akku | mittel | 60 | 10 | CHF 597'094 | CHF 612'737 | CHF 628'616 | 218 / 221 / 208 |
| E-Bike-Akku | mittel | 300 | 10 | CHF 302'544 | CHF 318'305 | CHF 334'066 | 458 / 461 / 448 |
| E-Bike-Akku | mittel | 600 | 10 | −CHF 13'649 | −CHF 20'474 | −CHF 35'299 | – / – / – |
| E-Bike-Akku | schwer | 60 | 10 | CHF 403'566 | CHF 410'916 | CHF 418'431 | 250 / 242 / 233 |
| E-Bike-Akku | schwer | 300 | 10 | CHF 197'381 | CHF 204'813 | CHF 212'246 | 490 / 481 / 473 |
| E-Bike-Akku | schwer | 600 | 10 | −CHF 19'155 | −CHF 28'732 | −CHF 46'309 | – / – / – |

## 2. Nach Tier 3 nicht gekündigt (Start Tag 60, Lohn bis Tag 720)

| Produkt | Stufe | Person | Lohn | Tier 2 / Tier 3 an Tag | netto |
|---|---|---|---:|---|---:|
| Ladekabel | mittel | junior | CHF 176'000 | 150, 240 | CHF 114'693 |
| Ladekabel | mittel | experte | CHF 396'000 | 120, 180 | −CHF 80'390 |
| Ladekabel | schwer | junior | CHF 176'000 | 150, 240 | CHF 27'485 |
| Ladekabel | schwer | experte | CHF 396'000 | 120, 180 | −CHF 175'073 |
| E-Bike-Motor | mittel | junior | CHF 176'000 | 150, 240 | CHF 462'437 |
| E-Bike-Motor | mittel | experte | CHF 396'000 | 120, 180 | CHF 297'160 |
| E-Bike-Motor | schwer | junior | CHF 176'000 | 150, 240 | CHF 270'906 |
| E-Bike-Motor | schwer | experte | CHF 396'000 | 120, 180 | CHF 89'212 |
| Smartphone | mittel | junior | CHF 176'000 | 150, 240 | CHF 1'136'395 |
| Smartphone | mittel | experte | CHF 396'000 | 120, 180 | CHF 1'028'786 |
| Smartphone | schwer | junior | CHF 176'000 | 150, 240 | CHF 742'676 |
| Smartphone | schwer | experte | CHF 396'000 | 120, 180 | CHF 601'350 |
| Mainboard | mittel | junior | CHF 176'000 | 150, 240 | CHF 736'875 |
| Mainboard | mittel | experte | CHF 396'000 | 120, 180 | CHF 595'122 |
| Mainboard | schwer | junior | CHF 176'000 | 150, 240 | CHF 463'013 |
| Mainboard | schwer | experte | CHF 396'000 | 120, 180 | CHF 297'785 |
| Konsole | mittel | junior | CHF 176'000 | 150, 240 | CHF 956'445 |
| Konsole | mittel | experte | CHF 396'000 | 120, 180 | CHF 833'387 |
| Konsole | schwer | junior | CHF 176'000 | 150, 240 | CHF 616'712 |
| Konsole | schwer | experte | CHF 396'000 | 120, 180 | CHF 464'571 |
| Smart-TV | mittel | junior | CHF 176'000 | 150, 240 | CHF 879'175 |
| Smart-TV | mittel | experte | CHF 396'000 | 120, 180 | CHF 749'490 |
| Smart-TV | schwer | junior | CHF 176'000 | 150, 240 | CHF 562'623 |
| Smart-TV | schwer | experte | CHF 396'000 | 120, 180 | CHF 405'843 |
| E-Bike-Akku | mittel | junior | CHF 176'000 | 150, 240 | CHF 469'094 |
| E-Bike-Akku | mittel | experte | CHF 396'000 | 120, 180 | CHF 304'616 |
| E-Bike-Akku | schwer | junior | CHF 176'000 | 150, 240 | CHF 275'566 |
| E-Bike-Akku | schwer | experte | CHF 396'000 | 120, 180 | CHF 94'431 |

## 3. Engpässe (Mittel, Start Tag 60, bis Tier 3)

| Produkt | Variante | Absatz/Tag | Junior netto | Experte netto |
|---|---|---:|---:|---:|
| Ladekabel | Rohstoffe 50 % | 19 | CHF 99'486 | CHF 88'127 |
| Ladekabel | Verkaufsteam 40 % | 20 | CHF 54'375 | CHF 39'150 |
| Ladekabel | Lager voll (20 Tage Nachfrage) | 38.9 | CHF 198'456 | CHF 191'567 |
| Ladekabel | Ruf 30 | 29 | CHF 100'444 | CHF 89'168 |
| Ladekabel | Ruf 85 | 37.9 | CHF 243'415 | CHF 244'393 |
| Mainboard | Rohstoffe 50 % | 8 | CHF 411'219 | CHF 426'580 |
| Mainboard | Verkaufsteam 40 % | 10 | CHF 327'375 | CHF 335'550 |
| Mainboard | Lager voll (20 Tage Nachfrage) | 16.9 | CHF 864'875 | CHF 919'122 |
| Mainboard | Ruf 30 | 16 | CHF 861'253 | CHF 915'189 |
| Mainboard | Ruf 85 | 16 | CHF 865'813 | CHF 920'140 |
| Konsole | Rohstoffe 50 % | 7 | CHF 523'599 | CHF 548'562 |
| Konsole | Verkaufsteam 40 % | 10 | CHF 487'763 | CHF 509'685 |
| Konsole | Lager voll (20 Tage Nachfrage) | 14.5 | CHF 1'084'445 | CHF 1'157'387 |
| Konsole | Ruf 30 | 14 | CHF 1'029'880 | CHF 1'101'578 |
| Konsole | Ruf 85 | 14 | CHF 1'086'259 | CHF 1'159'367 |

## 4. Vergleich mit bestehenden Verbesserungen (Mittel, ab Tag 1, eine Fabrik)

| Produkt | Verbesserung | Preis | netto bis Tag 720 |
|---|---|---:|---:|
| Ladekabel | markt2 | CHF 260'000 | CHF 58'489 |
| Ladekabel | fab1 | CHF 100'000 | −CHF 1'248'133 |
| Ladekabel | Forschung bis Tier 3 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 48'000 | CHF 265'948 |
| Mainboard | markt2 | CHF 260'000 | CHF 740'163 |
| Mainboard | fab1 | CHF 100'000 | CHF 671'260 |
| Mainboard | Forschung bis Tier 3 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 48'000 | CHF 937'905 |
| Konsole | markt2 | CHF 260'000 | CHF 979'609 |
| Konsole | fab1 | CHF 100'000 | CHF 1'873'293 |
| Konsole | Forschung bis Tier 3 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 48'000 | CHF 1'175'041 |

## 5. Stapeln mit anderen Preisfaktoren

Mainboard: Grundpreis 1100.00, mit markt2 1188.00, mit markt2 und Tier 3 1306.80 (erwartet 1306.80 = Grundpreis × 1.08 × 1.10).


# Produktentwicklung – Simulation

Erzeugt mit `node tests/sim/produktentwicklung.mjs --md docs/produktentwicklung-simulation.md` (echte Spiel-Logik, fester Zufall).
Forschung: ab Starttag eine Person angestellt, Ziel = das Produkt der Fabrik, automatisch bis Tier 5 (oder Etappenende), danach gekündigt (wo nicht anders angegeben). Kosten = bezahlter Lohn. Netto = Gewinn mit Forschung − Gewinn ohne Forschung am Etappenende (Tag 720). «Wieder vorn» = erster Tag, an dem der Lauf mit Forschung den Lauf ohne eingeholt hat.
Szenario: eine voll besetzte Fabrik (China), Rohstoffe mit 25 % Reserve, Verkaufsteam reicht (wo nicht anders angegeben), Ruf 70, keine Ereignisse. Rohstoffe 50 % = halbe Fabrikleistung; Verkaufsteam 40 % = Team schafft 40 % der Produktion.

## 1. Forschung bis Tier 5 je Produkt, Schwierigkeit, Startzeitpunkt und Person

| Produkt | Stufe | Start | Absatz/Tag | Junior netto | Spezialist netto | Experte netto | wieder vorn (J/S/E) |
|---|---|---:|---:|---:|---:|---:|---|
| Ladekabel | mittel | 60 | 37.9 | CHF 385'720 | CHF 403'247 | CHF 420'775 | 320 / 349 / 340 |
| Ladekabel | mittel | 300 | 37.9 | CHF 119'943 | CHF 137'471 | CHF 154'999 | 560 / 589 / 580 |
| Ladekabel | mittel | 600 | 37.9 | −CHF 23'694 | −CHF 35'542 | −CHF 55'389 | – / – / – |
| Ladekabel | schwer | 60 | 37.9 | CHF 241'204 | CHF 246'273 | CHF 251'343 | 392 / 402 / 395 |
| Ladekabel | schwer | 300 | 37.9 | CHF 55'160 | CHF 60'230 | CHF 65'299 | 632 / 642 / 635 |
| Ladekabel | schwer | 600 | 37.9 | −CHF 26'186 | −CHF 39'279 | −CHF 60'372 | – / – / – |
| E-Bike-Motor | mittel | 60 | 24 | CHF 961'981 | CHF 1'029'186 | CHF 1'096'392 | 220 / 227 / 237 |
| E-Bike-Motor | mittel | 300 | 24 | CHF 378'267 | CHF 445'473 | CHF 512'678 | 460 / 467 / 477 |
| E-Bike-Motor | mittel | 600 | 24 | −CHF 13'759 | −CHF 20'638 | −CHF 35'518 | – / – / – |
| E-Bike-Motor | schwer | 60 | 24 | CHF 644'587 | CHF 684'430 | CHF 724'274 | 256 / 272 / 286 |
| E-Bike-Motor | schwer | 300 | 24 | CHF 235'987 | CHF 275'831 | CHF 315'675 | 496 / 512 / 526 |
| E-Bike-Motor | schwer | 600 | 24 | −CHF 19'231 | −CHF 28'847 | −CHF 46'463 | – / – / – |
| Smartphone | mittel | 60 | 15 | CHF 2'078'643 | CHF 2'242'034 | CHF 2'405'571 | 174 / 170 / 175 |
| Smartphone | mittel | 300 | 15 | CHF 878'930 | CHF 1'042'540 | CHF 1'205'859 | 414 / 410 / 415 |
| Smartphone | mittel | 600 | 15 | CHF 5'464 | CHF 8'196 | CHF 2'927 | 714 / 710 / 715 |
| Smartphone | schwer | 60 | 15 | CHF 1'426'250 | CHF 1'533'424 | CHF 1'640'700 | 189 / 198 / 197 |
| Smartphone | schwer | 300 | 15 | CHF 586'451 | CHF 693'778 | CHF 800'901 | 429 / 438 / 437 |
| Smartphone | schwer | 600 | 15 | −CHF 5'775 | −CHF 8'663 | −CHF 19'551 | – / – / – |
| Mainboard | mittel | 60 | 16 | CHF 1'416'764 | CHF 1'523'175 | CHF 1'629'586 | 189 / 198 / 197 |
| Mainboard | mittel | 300 | 16 | CHF 582'136 | CHF 688'547 | CHF 794'957 | 429 / 438 / 437 |
| Mainboard | mittel | 600 | 16 | −CHF 5'918 | −CHF 8'877 | −CHF 19'836 | – / – / – |
| Mainboard | schwer | 60 | 16 | CHF 962'935 | CHF 1'030'223 | CHF 1'097'510 | 220 / 227 / 237 |
| Mainboard | schwer | 300 | 16 | CHF 378'695 | CHF 445'983 | CHF 513'270 | 460 / 467 / 477 |
| Mainboard | schwer | 600 | 16 | −CHF 13'742 | −CHF 20'614 | −CHF 35'485 | – / – / – |
| Konsole | mittel | 60 | 14 | CHF 1'780'686 | CHF 1'918'110 | CHF 2'056'263 | 179 / 179 / 184 |
| Konsole | mittel | 300 | 14 | CHF 746'276 | CHF 883'736 | CHF 1'021'196 | 419 / 419 / 425 |
| Konsole | mittel | 600 | 14 | CHF 606 | CHF 908 | −CHF 6'789 | 719 / 718 / – |
| Konsole | schwer | 60 | 14 | CHF 1'217'680 | CHF 1'306'677 | CHF 1'396'184 | 199 / 213 / 209 |
| Konsole | schwer | 300 | 14 | CHF 493'593 | CHF 582'615 | CHF 671'638 | 439 / 453 / 449 |
| Konsole | schwer | 600 | 14 | −CHF 9'176 | −CHF 13'764 | −CHF 26'352 | – / – / – |
| Smart-TV | mittel | 60 | 12 | CHF 1'652'640 | CHF 1'779'015 | CHF 1'906'140 | 182 / 184 / 188 |
| Smart-TV | mittel | 300 | 12 | CHF 688'905 | CHF 815'318 | CHF 941'730 | 422 / 425 / 428 |
| Smart-TV | mittel | 600 | 12 | −CHF 1'595 | −CHF 2'392 | −CHF 11'190 | – / – / – |
| Smart-TV | schwer | 60 | 12 | CHF 1'128'048 | CHF 1'209'311 | CHF 1'291'098 | 205 / 217 / 217 |
| Smart-TV | schwer | 300 | 12 | CHF 453'434 | CHF 534'722 | CHF 616'011 | 445 / 457 / 457 |
| Smart-TV | schwer | 600 | 12 | −CHF 10'717 | −CHF 16'075 | −CHF 29'433 | – / – / – |
| E-Bike-Akku | mittel | 60 | 10 | CHF 973'510 | CHF 1'041'381 | CHF 1'109'486 | 218 / 226 / 235 |
| E-Bike-Akku | mittel | 300 | 10 | CHF 382'997 | CHF 451'338 | CHF 519'915 | 458 / 466 / 475 |
| E-Bike-Akku | mittel | 600 | 10 | −CHF 13'649 | −CHF 20'474 | −CHF 35'299 | – / – / – |
| E-Bike-Akku | schwer | 60 | 10 | CHF 652'657 | CHF 692'966 | CHF 733'441 | 255 / 270 / 284 |
| E-Bike-Akku | schwer | 300 | 10 | CHF 239'298 | CHF 279'937 | CHF 320'741 | 495 / 509 / 523 |
| E-Bike-Akku | schwer | 600 | 10 | −CHF 19'155 | −CHF 28'732 | −CHF 46'309 | – / – / – |

## 2. Nach Tier 5 nicht gekündigt (Start Tag 60, Lohn bis Tag 720)

| Produkt | Stufe | Person | Lohn | Tier 2–5 an Tag | netto |
|---|---|---|---:|---|---:|
| Ladekabel | mittel | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 305'720 |
| Ladekabel | mittel | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 168'775 |
| Ladekabel | schwer | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 161'204 |
| Ladekabel | schwer | experte | CHF 396'000 | 120, 180, 240, 300 | −CHF 657 |
| E-Bike-Motor | mittel | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 881'981 |
| E-Bike-Motor | mittel | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 844'392 |
| E-Bike-Motor | schwer | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 564'587 |
| E-Bike-Motor | schwer | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 472'274 |
| Smartphone | mittel | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 1'998'643 |
| Smartphone | mittel | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 2'153'571 |
| Smartphone | schwer | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 1'346'250 |
| Smartphone | schwer | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 1'388'700 |
| Mainboard | mittel | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 1'336'764 |
| Mainboard | mittel | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 1'377'586 |
| Mainboard | schwer | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 882'935 |
| Mainboard | schwer | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 845'510 |
| Konsole | mittel | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 1'700'686 |
| Konsole | mittel | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 1'804'263 |
| Konsole | schwer | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 1'137'680 |
| Konsole | schwer | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 1'144'184 |
| Smart-TV | mittel | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 1'572'640 |
| Smart-TV | mittel | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 1'654'140 |
| Smart-TV | schwer | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 1'048'048 |
| Smart-TV | schwer | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 1'039'098 |
| E-Bike-Akku | mittel | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 893'510 |
| E-Bike-Akku | mittel | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 857'486 |
| E-Bike-Akku | schwer | junior | CHF 176'000 | 150, 240, 330, 420 | CHF 572'657 |
| E-Bike-Akku | schwer | experte | CHF 396'000 | 120, 180, 240, 300 | CHF 481'441 |

## 3. Engpässe (Mittel, Start Tag 60, bis Tier 5)

| Produkt | Variante | Absatz/Tag | Junior netto | Experte netto |
|---|---|---:|---:|---:|
| Ladekabel | Rohstoffe 50 % | 19 | CHF 148'405 | CHF 142'544 |
| Ladekabel | Verkaufsteam 40 % | 20 | CHF 73'650 | CHF 54'900 |
| Ladekabel | Lager voll (20 Tage Nachfrage) | 38.9 | CHF 324'819 | CHF 337'275 |
| Ladekabel | Ruf 30 | 29 | CHF 149'992 | CHF 144'405 |
| Ladekabel | Ruf 85 | 37.9 | CHF 386'916 | CHF 422'177 |
| Mainboard | Rohstoffe 50 % | 8 | CHF 664'991 | CHF 748'196 |
| Mainboard | Verkaufsteam 40 % | 10 | CHF 526'050 | CHF 585'300 |
| Mainboard | Lager voll (20 Tage Nachfrage) | 16.9 | CHF 1'416'764 | CHF 1'629'586 |
| Mainboard | Ruf 30 | 16 | CHF 1'410'762 | CHF 1'622'549 |
| Mainboard | Ruf 85 | 16 | CHF 1'418'319 | CHF 1'631'409 |
| Konsole | Rohstoffe 50 % | 7 | CHF 851'236 | CHF 966'556 |
| Konsole | Verkaufsteam 40 % | 10 | CHF 791'835 | CHF 896'910 |
| Konsole | Lager voll (20 Tage Nachfrage) | 14.5 | CHF 1'780'686 | CHF 2'056'263 |
| Konsole | Ruf 30 | 14 | CHF 1'690'203 | CHF 1'945'717 |
| Konsole | Ruf 85 | 14 | CHF 1'783'686 | CHF 2'059'779 |

## 4. Vergleich mit bestehenden Verbesserungen (Mittel, ab Tag 1, eine Fabrik)

| Produkt | Verbesserung | Preis | netto bis Tag 720 |
|---|---|---:|---:|
| Ladekabel | markt2 | CHF 260'000 | CHF 58'489 |
| Ladekabel | fab1 | CHF 100'000 | −CHF 1'248'133 |
| Ladekabel | Forschung bis Tier 5 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 96'000 | CHF 424'257 |
| Mainboard | markt2 | CHF 260'000 | CHF 740'163 |
| Mainboard | fab1 | CHF 100'000 | CHF 671'260 |
| Mainboard | Forschung bis Tier 5 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 96'000 | CHF 1'537'786 |
| Konsole | markt2 | CHF 260'000 | CHF 979'609 |
| Konsole | fab1 | CHF 100'000 | CHF 1'873'293 |
| Konsole | Forschung bis Tier 5 (Junior, ab Tag 60) zusätzlich zu markt2 | CHF 96'000 | CHF 1'930'821 |

## 5. Stapeln mit anderen Preisfaktoren

Mainboard: Grundpreis 1100.00, mit markt2 1188.00, mit markt2 und Tier 3 1306.80 (erwartet 1306.80 = Grundpreis × 1.08 × 1.10).


# AP1 Produktentwicklung – Umsetzungsbericht

Stand: 27.11.2026, Branch `produktentwicklung`. Grundlage: `AP01_Forschung_WissenHub/IMPLEMENTATION_EN.md`.

## Umgesetzt

- **Ort:** Reiter «Wissen & Verbesserungen» | «Produktentwicklung» im bestehenden Wissen-Reiter.
  Kein Gebäude, kein Kartensymbol, keine neue Pflichtaufgabe. Wissen, Quests und alle 16
  Verbesserungen bleiben unverändert.
- **Freischaltung:** nur Mittel und Schwer, erst nach der Einführung. Auf Einfach steht nur
  «Produktentwicklung gibt es auf Mittel und Schwer.»
- **Forscher (genau einer pro Projekt):** Junior CHF 2'850/Monat, 30 Tage · Spezialistin
  CHF 4'500, 25 Tage · Experte CHF 6'500, 20 Tage.
- **Stufen:** Preisfaktor 1.00 / 1.05 / 1.10 gegenüber dem Original (nicht zusammengesetzt), nur
  auf den Verkaufspreis des gewählten Produkts. Stapelt mit Lager, Dollar, Verbesserungen und
  Schwierigkeit (gemessen: Mainboard × markt2 × Stufe 3 = Grundpreis × 1.08 × 1.10).
- **Projektgebühr:** einmal beim Start, gemessen am Tagesumsatz einer vollen Fabrik des Produkts
  (Preis × Stück pro Tag, höchstens die Grundnachfrage): Stufe 2 = 6 Tagesumsätze, Stufe 3 = 12,
  auf CHF 1'000 gerundet (Entscheid vom 27.11.2026, siehe unten; der Auftrag sah 15 % / 25 % der
  Fabrik-Baukosten vor). Ein Projekt zugleich, Stufe 3 erst nach Stufe 2, kein Abbruch.
- **Forscherwahl mit Silhouetten** (eigene Zeichnungen, Kopf, Hals, Schultern): Junior im
  Kapuzenpulli, Spezialistin mit Bob und Blazer, Experte mit Laborkittel, grauem Bart und Brille.
- **Lohn:** Monatslohn / 30 pro Forschungstag direkt aus Kasse und Ausgaben; endet am letzten
  Forschungstag. Nicht in der monatlichen Lohnsumme, nicht in der Einführungs-Personalgrenze.
- **Tagesablauf** (`didactic-should.js`, `tagVor`): … Verkauf → Monatsende → **Forschungstag** →
  Markt → Ereignisse → Etappenende → Speichern. Die neue Stufe gilt ab dem Verkauf des nächsten
  Tages. Pause, Menü und Wissen-Reiter (pausiert das Spiel) zählen nicht.
- **Starten nur mit genug Geld** für Gebühr und den ganzen Projektlohn; Doppelklick startet kein
  zweites Projekt.
- **Ansicht:** Produktliste mit Stufe, Stückpreis heute → danach, Forscherwahl, Gebühr, Lohn,
  Gesamtkosten, Fortschritt «14 / 25 Tage», «fertig an Tag …», bisher bezahlt; Schätzung
  «Möglicher Mehrerlös bei aktuellem Absatz» (aus den Verkäufen der letzten 30 Tage) mit Hinweis,
  dass das kein sicherer Gewinn ist. Meldungen «Forschung gestartet» und «Produkt verbessert!».
- **Spielstände (AP3):** `S.produktForschung` pro Speicherplatz und im JSON-Export. Beim Laden und
  Import streng geprüft (Stufe 1–3, bekannte Produkte und Forscher, Dauer und Lohn passend zum
  Forscher, Tage = heute − Start, Gebühr und bezahlter Lohn nachgerechnet). Alte Spielstände ohne
  Feld: alle Produkte Stufe 1.
- **AP2:** Forschungsabschluss ist kein Entdeckungsereignis; die Entdeckungskarten bleiben unberührt.

Dateien: `produktentwicklung.js` (neu), `didactic-should.js` (Haken im Tagesablauf),
`module/seiten.js` (Reiter), `spielstaende-daten.js` (Prüfung), `texte.de.js`, `patches.json`,
Tests `tests/e2e/produktentwicklung.mjs`, Simulation `tests/sim/produktentwicklung.mjs`.

## Gemessen (Simulation mit der echten Spiel-Logik)

Volle Tabellen: [`produktentwicklung-simulation.md`](produktentwicklung-simulation.md)
(`node tests/sim/produktentwicklung.mjs --md docs/produktentwicklung-simulation.md`).
Ein Betrieb mit einer voll besetzten Fabrik, Etappe bis Tag 720, Läufe mit und ohne Forschung
bei gleichem Zufall.

### Erste Messung mit den Werten aus dem Auftrag (15 % / 25 % der Baukosten)

- Forschung lohnte sich fast immer und deutlich: Stufe 2 ab Tag 60 brachte netto CHF 160'000
  (Ladekabel) bis CHF 780'000 (Smartphone), die Kosten waren nach 37–91 Tagen wieder drin.
  Selbst ein Start an Tag 600 blieb auf Schwer im Plus.
- Pro Franken weit stärker als jede bestehende Verbesserung (Gebühren CHF 9'000–24'000 gegenüber
  z. B. markt2 für CHF 260'000).
- Grund: Die Gebühr hing an den Fabrik-Baukosten, der Mehrerlös am Umsatz. Eine volle
  Smartphone-Fabrik setzt rund CHF 26'000 pro Tag um; +5 % sind CHF 1'300 pro Tag gegenüber
  einer Gebühr von CHF 18'000.

### Entscheid: Gebühr am Umsatz (umgesetzt)

| Produkt | Auftrag Stufe 2 / 3 | jetzt Stufe 2 / 3 |
|---|---:|---:|
| Ladekabel | 9'000 / 15'000 | 31'000 / 61'000 |
| E-Bike-Motor | 13'500 / 22'500 | 75'000 / 150'000 |
| Smartphone | 18'000 / 30'000 | 156'000 / 312'000 |
| Mainboard | 12'800 / 21'300 | 106'000 / 211'000 |
| Konsole | 24'000 / 40'000 | 136'000 / 271'000 |
| Smart-TV | 22'500 / 37'500 | 123'000 / 246'000 |
| E-Bike-Akku | 19'500 / 32'500 | 82'000 / 163'000 |

Messung mit diesen Gebühren:

1. **Früh lohnt es sich, spät nicht mehr.** Stufe 2 ab Tag 60: netto CHF 141'000 (Ladekabel,
   Mittel) bis CHF 639'000 (Smartphone, Mittel); auf Schwer CHF 88'000–400'000. Die Kosten sind
   nach 150–170 Tagen (Mittel) bzw. 200–225 Tagen (Schwer) wieder drin. Start an Tag 300: weiterhin
   im Plus. Start an Tag 600: **bei allen Produkten im Minus** (−CHF 8'000 bis −CHF 80'000).
2. **Stufe 2 und 3 nacheinander** ab Tag 60 bleiben lohnend (z. B. Smartphone Mittel
   CHF 1,06–1,10 Mio. netto bei Kosten von CHF 474'000–477'000), brauchen aber viel Kapital.
3. **Engpässe** (halbe Rohstoffe, Verkaufsteam 40 %) senken den Nutzen auf etwa 20–40 %;
   Ladekabel mit schwachem Verkaufsteam bringt nur noch CHF 27'000. Ein tiefer Ruf (30) wirkt
   nur dort, wo die Nachfrage der Engpass ist (Ladekabel: −60 %).
4. **Gegenüber den Verbesserungen** ist Forschung jetzt in derselben Grössenordnung: markt2
   (CHF 260'000) bringt im selben Betrieb CHF 58'000–980'000 netto, Stufe 2 zusätzlich
   (CHF 34'000–139'000) CHF 155'000–595'000.
5. **Der Experte ist meist knapp vorn** (zehn Tage früher fertig, CHF 1'500 mehr Lohn); bei
   Ladekabel mit Engpässen ist der Junior knapp vorn. Der Unterschied ist klein gegenüber der
   Frage, *wann* und *für welches Produkt* man forscht.
6. **Ohne Forschung ändert sich nichts:** Ohne Projekt bleibt jeder Preis und jede Ausgabe gleich
   (Faktor 1.00, kein Lohn). Ziele, Schwierigkeit und bisherige Strategien sind unberührt.
7. **Stapeln:** Mainboard × markt2 × Stufe 3 = Grundpreis × 1.08 × 1.10 (gemessen 1306.80).

Die Werte stehen an einer Stelle (`GEBUEHR_TAGE`, `FORSCHER`, `PREISFAKTOR` in
`produktentwicklung.js`); die Simulation lässt sich nach einer Änderung neu laufen lassen.

## Offen

- Stufe wird in der Produktliste der Produktentwicklung angezeigt, nicht zusätzlich im Markt-Reiter.
- Echte Geräte (iPad, Handy) noch nicht geprüft; geprüft mit Chromium bei 360 × 800.

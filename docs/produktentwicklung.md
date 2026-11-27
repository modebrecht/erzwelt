# AP1 Produktentwicklung – Umsetzungsbericht

Stand: 27.11.2026, Branch `produktentwicklung`. Grundlage: `AP01_Forschung_WissenHub/IMPLEMENTATION_EN.md`.

## Umgesetzt

- **Ort:** Reiter «Wissen & Verbesserungen» | «Produktentwicklung» im bestehenden Wissen-Reiter.
  Kein Gebäude, kein Kartensymbol, keine neue Pflichtaufgabe. Wissen, Quests und alle 16
  Verbesserungen bleiben unverändert.
- **Freischaltung:** nur Mittel und Schwer, erst nach der Einführung. Auf Einfach steht nur
  «Produktentwicklung gibt es auf Mittel und Schwer.»
- **Forscher (genau einer pro Projekt):** Junior CHF 2'850/Monat, 30 Tage · Spezialist
  CHF 4'500, 25 Tage · Experte CHF 6'500, 20 Tage.
- **Stufen:** Preisfaktor 1.00 / 1.05 / 1.10 gegenüber dem Original (nicht zusammengesetzt), nur
  auf den Verkaufspreis des gewählten Produkts. Stapelt mit Lager, Dollar, Verbesserungen und
  Schwierigkeit (gemessen: Mainboard × markt2 × Stufe 3 = Grundpreis × 1.08 × 1.10).
- **Projektgebühr:** einmal beim Start, 15 % (Stufe 2) bzw. 25 % (Stufe 3) der Fabrik-Baukosten,
  auf CHF 100 gerundet. Ein Projekt zugleich, Stufe 3 erst nach Stufe 2, kein Abbruch.
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

Volle Tabellen: [`produktentwicklung-simulation.md`](produktentwicklung-simulation.md).
Ein Betrieb mit einer voll besetzten Fabrik, Etappe bis Tag 720, Läufe mit und ohne Forschung
bei gleichem Zufall.

1. **Forschung lohnt sich mit den vereinbarten Werten fast immer und deutlich.** Stufe 2 ab Tag 60
   bringt netto CHF 160'000 (Ladekabel) bis CHF 780'000 (Smartphone) bis Tag 720; die Kosten sind
   nach 37–91 Tagen wieder eingespielt. Selbst ein Start an Tag 600 bleibt auf Schwer im Plus
   (CHF 5'600–65'000). Stufe 2 + 3 bringen bis CHF 1,5 Mio. (Smartphone, Mittel).
2. **Grund:** Die Gebühr hängt an den Fabrik-Baukosten (CHF 60'000–160'000), der Mehrerlös aber am
   Umsatz. Eine volle Smartphone-Fabrik setzt rund CHF 26'000 pro Tag um; +5 % sind CHF 1'300 pro
   Tag gegenüber einer Gebühr von CHF 18'000.
3. **Der Experte ist fast immer am besten.** Zehn Tage früher fertig bringen mehr als die
   CHF 1'500 Mehrlohn. Nur bei Ladekabel mit Engpässen (Rohstoffe 50 %, Verkaufsteam 40 %,
   Ruf 30) ist der Junior knapp vorn.
4. **Engpässe senken den Nutzen wie erwartet:** halbe Rohstoffe oder 40 % Verkaufsteam senken
   ihn auf etwa ein Drittel bis die Hälfte; ein voller Lager senkt ihn wenig.
5. **Verglichen mit den Verbesserungen:** markt2 (CHF 260'000) bringt im selben Betrieb
   CHF 58'000–980'000 netto; Stufe 2 zusätzlich zu markt2 bringt nochmals CHF 177'000–707'000
   für CHF 12'000–27'000. Pro investiertem Franken ist Forschung damit weit stärker als jede
   Verbesserung. fab1 schadet in der Simulation beim Ladekabel (mehr Ausstoss als Nachfrage →
   volles Lager → tieferer Preis), weil die Simulation die Belegschaft nicht anpasst.
6. **Ohne Forschung ändert sich nichts:** Ohne Projekt bleibt jeder Preis und jede Ausgabe gleich
   (Faktor 1.00, kein Lohn). Ziele, Schwierigkeit und bisherige Strategien sind unberührt.

## Vorschlag (braucht deine Freigabe, noch nicht umgesetzt)

Der Auftrag verlangt, die Werte nicht ohne Zustimmung zu ändern. Damit Forschung eine echte
Abwägung wird (früh lohnend, spät eher nicht; nicht stärker als die Verbesserungen):

- **Gebühr am Umsatz statt an den Baukosten:** Stufe 2 = 6 Tagesumsätze einer vollen Fabrik
  (≈ 4 Monate Mehrerlös bei vollem Absatz), Stufe 3 = 12 Tagesumsätze, auf CHF 1'000 gerundet.

  | Produkt | heute Stufe 2 / 3 | Vorschlag Stufe 2 / 3 |
  |---|---:|---:|
  | Ladekabel | 9'000 / 15'000 | 31'000 / 61'000 |
  | E-Bike-Motor | 13'500 / 22'500 | 75'000 / 150'000 |
  | Smartphone | 18'000 / 30'000 | 156'000 / 312'000 |
  | Mainboard | 12'800 / 21'300 | 106'000 / 211'000 |
  | Konsole | 24'000 / 40'000 | 136'000 / 271'000 |
  | Smart-TV | 22'500 / 37'500 | 123'000 / 246'000 |
  | E-Bike-Akku | 19'500 / 32'500 | 82'000 / 163'000 |

- **Forscher:** so lassen. Dass der Experte meist gewinnt, ist bei diesen Löhnen gegenüber den
  Umsätzen fast unvermeidlich; mit höheren Gebühren wird die Wahl aber wieder wichtiger, weil
  ein später Start sich dann nicht mehr lohnt.

Die Werte stehen an einer Stelle (`GEBUEHR_ANTEIL`, `FORSCHER`, `PREISFAKTOR` in
`produktentwicklung.js`); die Simulation lässt sich nach einer Änderung neu laufen lassen.

## Offen

- Stufe wird in der Produktliste der Produktentwicklung angezeigt, nicht zusätzlich im Markt-Reiter.
- Echte Geräte (iPad, Handy) noch nicht geprüft; geprüft mit Chromium bei 360 × 800.

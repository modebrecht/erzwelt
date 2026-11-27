# AP1 Produktentwicklung – Umsetzungsbericht

Stand: 27.11.2026, Branch `produktentwicklung`. Grundlage: `AP01_Forschung_WissenHub/IMPLEMENTATION_EN.md`.

## Umgesetzt (Stand nach Rückmeldung vom 27.11.2026)

- **Ort:** Reiter «Wissen & Verbesserungen» | «Produktentwicklung» im Wissen-Reiter. Kein Gebäude,
  kein Kartensymbol, keine Pflichtaufgabe. Wissen, Quests und alle Verbesserungen unverändert.
- **Freischaltung:** nur Mittel und Schwer, nach der Einführung. Auf Einfach nur ein Hinweis.
- **Eine Forschungsstelle** (Wunsch des Auftraggebers, abweichend vom Auftrag «Lohn nur während
  eines Projekts»): anstellen, kündigen, jemand anderen anstellen oder die Stelle offen lassen.
  Lohn = Monatslohn / 30 pro Spieltag, solange jemand angestellt ist, auch ohne Forschungsziel.
  Junior CHF 8'000/Monat, 90 Tage pro Tier · Spezialistin CHF 12'000, 75 Tage · Experte CHF 18'000,
  60 Tage (angepasst nach der ersten Messung, siehe unten). Personenbilder: Avataaars (Pablo Stanley), erzeugt mit DiceBear.
- **Forschungsziel:** ein Produkt mit Fabrik. Ist ein Tier fertig, kommt die Meldung «Forschung
  abgeschlossen!», und es geht automatisch mit dem nächsten Tier weiter. Bei Tier 5 meldet das Spiel,
  dass ein neues Ziel nötig ist (sonst Lohn ohne Forschung). Fortschritt pro Produkt bleibt beim
  Zielwechsel und beim Personenwechsel erhalten (als Anteil).
- **Keine Startgebühr** (Wunsch des Auftraggebers): Kosten sind nur der Lohn.
- **Tier 1–5** (englisch «Tier»): Verkaufspreis ×1.00 / 1.05 / 1.10 / 1.15 / 1.20 (je Tier
  +5 Prozentpunkte, nicht zusammengesetzt), nur für dieses Produkt; stapelt mit Lager, Dollar,
  Verbesserungen und Schwierigkeit.
- **Tagesablauf** (`didactic-should.js`, `tagVor`): … Verkauf → Monatsende → Forschungstag → Markt →
  Ereignisse → Etappenende → Speichern. Ein fertiges Tier gilt ab dem Verkauf des nächsten Tages.
  Pause, Menü und Wissen-Reiter zählen nicht.
- **Spielstände:** `S.produktForschung` (stufen, forscher, ziel, fortschritt, lohnBezahlt) pro
  Speicherplatz und im JSON; beim Laden/Import geprüft (Tier 1–3, bekannte Produkte und Personen,
  Fortschritt 0–1, keine fremden Felder).

Dateien: `produktentwicklung.js`, `didactic-should.js` (Haken im Tagesablauf), `module/seiten.js`
(Reiter), `spielstaende-daten.js` (Prüfung), `texte.de.js`, `patches.json`, Tests
`tests/e2e/produktentwicklung.mjs`, Simulation `tests/sim/produktentwicklung.mjs`,
`scripts/forscher-bilder.mjs`.

## Gemessen (Simulation mit der echten Spiel-Logik)

Volle Tabellen: [`produktentwicklung-simulation.md`](produktentwicklung-simulation.md). Eine voll
besetzte Fabrik, Etappe bis Tag 720, Läufe mit und ohne Forschung bei gleichem Zufall; Forschung bis
Tier 3, danach gekündigt (wo nicht anders angegeben).

### Erste Messung (CHF 2'850 / 4'500 / 6'500, 30 / 25 / 20 Tage, nur Lohn)

Viel zu stark: ab Tag 60 netto CHF 335'000 bis 1,57 Mio. bei Lohnkosten von CHF 4'300–5'700;
selbst ab Tag 600 überall im Plus. Forschung wäre ein Muss gewesen.

### Zweite Messung (CHF 8'000 / 12'000 / 18'000, 90 / 75 / 60 Tage, bis Tier 3)

Früh lohnend (CHF 149'000 bis 1,35 Mio.), Start an Tag 600 fast überall im Minus; die Wahl der Person
und rechtzeitiges Kündigen zählen.

### Jetzt (gleiche Löhne und Dauer, bis Tier 5)

1. **Früh lohnt es sich stark, spät nicht.** Start Tag 60: netto CHF 241'000 (Ladekabel, Schwer) bis
   CHF 2,4 Mio. (Smartphone, Mittel); Tier 5 erreicht der Junior nach 360 Tagen, der Experte nach
   240. Start Tag 300: weiterhin im Plus. Start Tag 600: fast überall im Minus (bis −CHF 60'000).
2. **Die Wahl der Person zählt:** Der Experte ist meist vorn, weil mehr Tiers mehr Zeit brauchen;
   beim Ladekabel mit Engpässen ist der Junior besser.
3. **Vergessen zu kündigen** nach Tier 5 kostet bis Tag 720 noch bis CHF 396'000 Lohn; Ladekabel
   mit Experte auf Schwer endet dann bei −CHF 700.
4. **Gegenüber den Verbesserungen:** Forschung bis Tier 5 (Junior, CHF 96'000 Lohn) bringt
   zusätzlich zu markt2 CHF 424'000–1,93 Mio. Mit fünf Tiers ist Forschung für Firmen mit teuren
   Produkten der stärkste Hebel im Spiel. Wer das zu stark findet: kleinere Schritte pro Tier
   (z. B. +3 %) oder längere Dauer für Tier 4 und 5.
5. **Ohne Forschung ändert sich nichts** (Faktor 1.00, kein Lohn).
6. **Stapeln:** Mainboard × markt2 × Tier 3 = Grundpreis × 1.08 × 1.10 (gemessen 1306.80).

Die Werte stehen in `FORSCHER` und `PREISFAKTOR` in `produktentwicklung.js`; die Simulation lässt
sich nach einer Änderung neu laufen lassen.

## Offen

- Stufe wird in der Produktliste der Produktentwicklung angezeigt, nicht zusätzlich im Markt-Reiter.
- Echte Geräte (iPad, Handy) noch nicht geprüft; geprüft mit Chromium bei 360 × 800.

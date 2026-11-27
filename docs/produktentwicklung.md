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
  abgeschlossen!», und es geht automatisch mit dem nächsten Tier weiter. Bei Tier 3 meldet das Spiel,
  dass ein neues Ziel nötig ist (sonst Lohn ohne Forschung). Fortschritt pro Produkt bleibt beim
  Zielwechsel und beim Personenwechsel erhalten (als Anteil).
- **Keine Startgebühr** (Wunsch des Auftraggebers): Kosten sind nur der Lohn.
- **Tier 1 / 2 / 3** (englisch «Tier»): Verkaufspreis ×1.00 / ×1.05 / ×1.10, nur für dieses Produkt,
  stapelt mit Lager, Dollar, Verbesserungen und Schwierigkeit.
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

### Jetzt (CHF 8'000 / 12'000 / 18'000, 90 / 75 / 60 Tage)

1. **Früh lohnt es sich, spät nicht.** Start Tag 60: netto CHF 149'000 (Ladekabel, Schwer) bis
   CHF 1,35 Mio. (Smartphone, Mittel); Kosten bis Tier 3 CHF 48'000 (Junior, 6 Monate) bis
   CHF 72'000 (Experte, 4 Monate). Start Tag 300: weiterhin im Plus. Start Tag 600: fast überall
   im Minus (bis −CHF 60'000), nur Smartphone und Konsole auf Mittel knapp darüber.
2. **Die Wahl der Person zählt:** Beim günstigen Ladekabel ist der Junior besser (auf Schwer
   CHF 155'000 gegenüber CHF 149'000 beim Experten); bei teuren Produkten der Experte.
3. **Vergessen zu kündigen kostet richtig:** Bleibt die Person nach Tier 3 bis Tag 720, zahlt man
   CHF 176'000 (Junior) bzw. CHF 396'000 (Experte) Lohn; beim Ladekabel mit Experte ist das
   Ergebnis dann −CHF 80'000 (Mittel) bzw. −CHF 175'000 (Schwer).
4. **Engpässe** (halbe Rohstoffe, Verkaufsteam 40 %) senken den Nutzen auf etwa 20–50 %.
5. **Gegenüber den Verbesserungen:** Forschung bis Tier 3 (CHF 48'000 Lohn) bringt zusätzlich zu
   markt2 CHF 266'000–1,18 Mio. Sie bleibt für Betriebe mit teuren Produkten sehr stark, ist aber
   nicht mehr gratis und verlangt Planung (früh starten, rechtzeitig kündigen).
6. **Ohne Forschung ändert sich nichts** (Faktor 1.00, kein Lohn).
7. **Stapeln:** Mainboard × markt2 × Tier 3 = Grundpreis × 1.08 × 1.10 (gemessen 1306.80).

Die Werte stehen in `FORSCHER` und `PREISFAKTOR` in `produktentwicklung.js`; die Simulation lässt
sich nach einer Änderung neu laufen lassen.

## Offen

- Stufe wird in der Produktliste der Produktentwicklung angezeigt, nicht zusätzlich im Markt-Reiter.
- Echte Geräte (iPad, Handy) noch nicht geprüft; geprüft mit Chromium bei 360 × 800.

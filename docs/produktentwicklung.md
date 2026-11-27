# AP1 Produktentwicklung – Umsetzungsbericht

Stand: 27.11.2026, Branch `produktentwicklung`. Grundlage: `AP01_Forschung_WissenHub/IMPLEMENTATION_EN.md`.

## Umgesetzt (Stand nach Rückmeldung vom 27.11.2026)

- **Ort:** Reiter «Wissen & Verbesserungen» | «Produktentwicklung» im Wissen-Reiter. Kein Gebäude,
  kein Kartensymbol, keine Pflichtaufgabe. Wissen, Quests und alle Verbesserungen unverändert.
- **Freischaltung:** nur Mittel und Schwer, nach der Einführung. Auf Einfach nur ein Hinweis.
- **Eine Forschungsstelle** (Wunsch des Auftraggebers, abweichend vom Auftrag «Lohn nur während
  eines Projekts»): anstellen, kündigen, jemand anderen anstellen oder die Stelle offen lassen.
  Lohn = Monatslohn / 30 pro Spieltag, solange jemand angestellt ist, auch ohne Forschungsziel.
  Junior CHF 2'850/Monat, 30 Tage pro Tier · Spezialistin CHF 4'500, 25 Tage · Experte CHF 6'500,
  20 Tage. Personenbilder: Avataaars (Pablo Stanley), erzeugt mit DiceBear.
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
besetzte Fabrik, Etappe bis Tag 720, Läufe mit und ohne Forschung bei gleichem Zufall.

- **Forschung ist mit Lohn allein extrem lohnend.** Ab Tag 60 bis Tier 3: netto
  CHF 335'000 (Ladekabel, Mittel) bis CHF 1,57 Mio. (Smartphone, Mittel), bei Lohnkosten von
  CHF 4'300–5'700. Selbst ab Tag 600 noch CHF 23'000–216'000 im Plus. Die Kosten sind nach
  wenigen Wochen wieder drin.
- **Vergessen zu kündigen** kostet bis Tag 720 CHF 63'000 (Junior) bzw. CHF 143'000 (Experte) Lohn;
  das senkt den Gewinn spürbar, bleibt aber klar im Plus.
- **Gegenüber den Verbesserungen** ist Forschung pro Franken um ein Vielfaches stärker
  (z. B. Konsole: CHF 5'700 Lohn → +CHF 1,43 Mio. zusätzlich zu markt2 für CHF 260'000).
- **Ohne Forschung ändert sich nichts** (Faktor 1.00, kein Lohn).

**Offen zur Entscheidung:** So ist Forschung für alle, die sie kennen, ein Muss. Mögliche Hebel:
höhere Löhne (realistische Forschungslöhne liegen eher bei CHF 8'000–15'000 pro Monat, für ein
Team mehr), längere Dauer pro Tier (z. B. 90 / 75 / 60 Tage) oder kleinere Preisstufen.
Die Werte stehen in `FORSCHER` und `PREISFAKTOR` in `produktentwicklung.js`.

## Offen

- Stufe wird in der Produktliste der Produktentwicklung angezeigt, nicht zusätzlich im Markt-Reiter.
- Echte Geräte (iPad, Handy) noch nicht geprüft; geprüft mit Chromium bei 360 × 800.

# Texte: noch nicht in `texte.de.js`

Ziel (Auftrag Schritt 6): alle sichtbaren Texte als Schlüssel → Text in `texte.de.js`,
abgerufen mit `textVon(schluessel, werte)`. Erledigt sind Hauptmenü, Spielstände und
Bilder-Intro (`spielstaende.js`, `spielstaende-daten.js`, `bilder-intro.js`, rund 75 Texte;
Feldnamen in Fehlermeldungen wie «(Name)» stehen noch im Code). Der Prüfstand zeigt
dafür 0 Unterschiede.

Grobe Zählung der übrigen Textstellen (Zeichenketten mit mindestens zwei Wörtern, ohne
Klassen- und Stilangaben): **rund 1166**, davon:

| Textstellen | Datei |
|---:|---|
| 379 | `erzwelt-core.html` |
| 183 | `karteninfo-daten.js` |
| 95 | `didactic-complexity.js` |
| 62 | `didactic-should.js` |
| 50 | `sek-b-klarheit.js` |
| 37 | `logik-fixes.js` |
| 36 | `einfuehrung.js` |
| 35 | `abschluss-zertifikat.js` |
| 33 | `didactic-model.js` |
| 31 | `didactic-events.js` |
| 30 | `knowledge-quest-flow.js` |
| 25 | `kurztexte.js` |
| 18 | `belegschaft-regler.js` |
| 15 | `spielstaende-daten.js` |
| 13 | `map-focus-navigation.js` |
| 12 | `produktentdeckungen.js` |
| 10 | `stop-safety-visual.js` |
| 10 | `didactic-ui.js` |
| 9 | `tutorial-enhance.js` |
| 9 | `construction-visibility.js` |
| 7 | `transformation-enhance.js` |
| 7 | `transformation-animations.js` |
| 6 | `ziel-positiv.js` |
| 6 | `bilder-intro.js` |
| 5 | `spielstaende.js` |
| 5 | `notification-history.js` |
| 5 | `handy-layout.js` |
| 5 | `erfolg-feier.js` |
| 4 | `stil.js` |
| 4 | `premium-spielgefuehl.js` |
| 4 | `objective-guide.js` |
| 3 | `karteninfo.js` |
| 3 | `karte-mitte.js` |
| 3 | `blatt-ordnung.js` |
| 2 | `premium-animation-treatment-v2.js` |
| 2 | `kabel-querschnitt.js` |
| 1 | `performance-pass.js` |
| 1 | `interaction-focus-final-fix.js` |
| 1 | `didactic-transport.js` |

## Worauf es beim Weitermachen ankommt

- **Kern zuerst ermöglichen.** `texte.de.js` lädt heute als erster Patch, also *nach*
  dem Spielkern. Für die rund 380 Texte in `erzwelt-core.html` muss
  `scripts/build-standalone.mjs` die Datei vor dem Kern-Skript einbetten.
- **Ersetzungsketten beachten.** Mehrere Patches suchen Kerntexte wörtlich und ersetzen
  sie (z. B. `ersetze(html, alt, neu)` in `sek-b-klarheit.js`, `kurztexte.js`). Wird nur
  eine Seite einer solchen Kette umgestellt, greift die Ersetzung nicht mehr. Besser: den
  Endtext direkt als Schlüssel ablegen und die Ersetzung entfernen – das ist aber schon
  ein Umbau der Texte, nicht nur ein Verschieben, und braucht den Prüfstand pro Datei.
- **Daten mit Text** (`karteninfo-daten.js`, Ereignisse, Wissen) sind Inhalt, nicht
  Oberfläche. Sinnvoll als eigene Datei je Sprache (z. B. `karteninfo.de.js`) statt
  einzeln in `texte.de.js`.
- Pro Datei: umstellen, bauen, Prüfstand = 0 Unterschiede, dann Commit.

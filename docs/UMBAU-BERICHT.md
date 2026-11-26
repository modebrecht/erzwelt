# Umbau Patch-Schichten → Module: Bericht

Branch `umbau`, Auftrag in `docs/UMBAU-AUFTRAG.md`. Stand vor dem Umbau: Branch
`vor-umbau` (der Tag `vor-umbau` liess sich aus der Arbeitsumgebung nicht pushen).

## Was sich geändert hat

Verhalten, Texte und Aussehen sind gleich geblieben. Geändert hat sich, wo die
Abläufe festgelegt sind: Statt dass bis zu fünfzehn Dateien dieselbe globale
Funktion nacheinander umhüllen, gibt es pro Bereich ein Modul in `module/`, das die
Funktion einmal festlegt und die früheren Schritte in derselben Reihenfolge aufruft.

| Modul | Funktionen | früher Schichten |
|---|---|---:|
| `module/karte.js` | `zeichnen`, `pinsZeichnen`, `dockZeichnen`, `ansichtAnwenden`, `hinweiseSetzen`, `pinFeiern` | bis 15 |
| `module/quest.js` | `questZeichnen` | 12 |
| `module/blatt.js` | `blattMine`, `blattRaff`, `blattFab`, `blattFuellen`, `blattZu`, `szeneRaff` | bis 7 |
| `module/seiten.js` | `seiteMarkt`, `seiteTeam`, `seiteZiel`, `seiteWissen`, `seiteFuellen` | bis 5 |
| `module/einfuehrung.js` | `schwierigkeitZeigen`, `tutorialPruefen` | 4 |
| `module/wissen.js` | `lupeFuellen`, `naechsterSchritt` | 4 |
| `module/meldungen.js` | `notiz`, `toastsErneuern`, `dialogZeigen`, `tempoSetzen`, `einstFuellen` | 3–4 |

Die einzelnen Schritte (Hilfsfunktionen, Stile) bleiben in ihren Dateien und melden
sich in `window.__erzwelt…Teile` an; der Kopf jedes Moduls sagt, was woher kommt.
`docs/neuzuweisungen.md` (aus `scripts/neuzuweisungen.mjs`) zeigt die verbliebenen
Neuzuweisungen.

`module/karte.js` lädt als erstes nach dem Kern: Beim Laden wird schon gezeichnet,
und nur so laufen dabei genau die Schritte, die vorher als Hüllen schon da waren.
Mit dem Modul am Ende fehlten vor dem Spielstart Rohstoff-Marken an den Pins.

## Prüfung

- `tests/vergleich/`: Prüfstand mit rund 490 Zuständen (Hauptmenü, Intro,
  Einführung, alle Blätter und Reiter, Wissen, Karte, Neuladen, 360/390/820/1280 px).
  Jeder Modul-Commit: **0 Unterschiede** zur Aufnahme von `vor-umbau`
  (Text, Spielstand, Markup, Screenshot). Was schon zwischen zwei Aufnahmen desselben
  Stands schwankt (kurze Effekte), zählt nicht.
- `tests/unit/certificate.mjs` grün. Die Formular-Sperre wird jetzt über
  `__erzweltSeitenTeile.formularOffen` geprüft.
- E2E lokal mit den echten Schriften (Baloo 2, Nunito über `@fontsource`): alle Tests
  der Pipeline grün. `gameplay` schlug vorher auf main wie im Umbau fehl, weil der Titel
  der ersten Aufgabe bei 320 px umbrach; behoben mit dem kürzeren Titel
  «Kupfer abbauen» (einzige sichtbare Änderung, eigener Commit).

## Offen

- **Texte (Schritt 6):** `texte.de.js` mit `textVon()` steht; umgestellt sind Hauptmenü,
  Spielstände und Bilder-Intro. Rund 1100 Textstellen fehlen noch, siehe `docs/texte-offen.md`.
- **Stile** stehen weiter als eigene `<style>`-Blöcke in den Dateien. Zusammenlegen
  ändert die Reihenfolge der Regeln und braucht einen eigenen Schritt.
- **Zwischenspeicher in `performance-pass.js`** (`beispielKette`, `lieferwegZeichnen`,
  `didaktikMigration`, `shouldMigration`, `speichern`) sind weiter je eine Hülle.
- **Toter Code:** `wissenPraxis` in `didactic-should.js` wird von
  `knowledge-quest-flow.js` ersetzt; ebenso die Kern-Fassungen von `seiteMarkt` und
  `dockZeichnen`. Entfernen wäre ein eigener kleiner Schritt.
- **Verdacht «Tutorial abgeschlossen» doppelt** (nur festgehalten, nicht behoben): Die
  Lernrückmeldung wird beim letzten Schritt **einmal** in die Warteschlange gelegt.
  Gleichzeitig erscheint die Meldung «Tutorial abgeschlossen – du hast die Lieferkette
  einmal vollständig aufgebaut …» (aus `notiz`, Text von `tutorial-enhance.js`). Wer
  spielt, liest «Tutorial abgeschlossen» also zweimal: als grüne Rückmeldung und als
  Meldung.
- Draft-PR und Merge auf main: nicht gemacht (kein GitHub-Login in der
  Arbeitsumgebung; Merge auf Wunsch des Auftraggebers nicht automatisch, weil main
  direkt auf Vercel geht).

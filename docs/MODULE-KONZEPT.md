# Konzept: Patches zu Modulen zusammenführen

Stand 23.11.2026 · Branch `claude/module-umbau` (abgezweigt von `claude/fixes-2311-2026`)

## Ziel

Das Spiel sieht danach **genau gleich aus und verhält sich genau gleich**. Es ändert
sich nur, wie der Code aufgebaut ist:

- Statt 38 Patch-Dateien, die sich gegenseitig überschreiben, gibt es rund
  **12 Module**. Jedes ist für einen Bereich zuständig.
- **Jede Funktion hat genau einen Besitzer.** Wer das Minen-Blatt zeichnet,
  schreibt das endgültige HTML direkt. Kein anderes Modul flickt es danach per
  Textersetzung.
- **Ein Stylesheet** mit Abschnitten pro Bereich statt 28 Stilblöcken, die sich mit
  174 `!important` überstimmen.
- Toter Code (z. B. Tutorial-Texte in vier Dateien, die seit `einfuehrung.js` nicht
  mehr gelten) verschwindet.

Nicht Ziel: neue Funktionen, andere Zahlen, anderes Aussehen, Umbau der Simulation
im Kern, ein Build-System mit Bundler. `scripts/build-standalone.mjs` und
`patches.json` bleiben; `patches.json` listet am Ende die Module statt der Patches.

## Ausgangslage (gemessen)

| | heute |
|---|---|
| Patch-Dateien | 38 (dazu `vendor/pdf-lib`) |
| `zeichnen` überschrieben | 13× |
| Aufgabenkarte (`questZeichnen`) überschrieben | 11× |
| Minen-Blatt (`blattMine`) überschrieben | 5× |
| Stilblöcke / `!important` | 28 / 174 |
| `tagVor` | Kern-Version ist tot (in `didactic-should.js` vollständig ersetzt) |

## Zielbild

```
erzwelt-core.html   Kern: Daten, Grund-Simulation, Grund-Darstellung (bleibt)
module/
  basis.js          Hook-Punkte (nach zeichnen, nach Tag, nach Kauf …), gemeinsame Helfer
  simulation.js     Tageslauf, Markt, Ruf, Ereignisse, Etappenziele, Nachweise
                    (didactic-model, didactic-events, didactic-should, logik-fixes)
  einfuehrung.js    Startbild, Einführung, Phasen, Rückmeldung, Erfolg
                    (einstieg, einfuehrung, tutorial-enhance, erfolg-feier)
  wissen.js         Wissens-Quests, Lerntexte, Lupe, Verbesserungen
                    (knowledge-quest-flow, didactic-complexity)
  aufgabe.js        Aufgabenkarte: Tutorial, Wissen, Hinweis, Engpass, «Ziel zeigen»,
                    kompakte Zeile (objective-guide, aufgabe-kompakt, Teile aus
                    sek-b-klarheit, map-focus-navigation, handy-layout)
  blaetter.js       Rohstoffquelle, Raffinerie, Fabrik: endgültiges HTML, Regler,
                    Kaufsperre (belegschaft-regler, Teile aus sek-b-klarheit,
                    logik-fixes, einfuehrung, stil)
  seiten.js         Markt, Team, Ziel, Wissen-Übersicht (ziel-positiv, kurztexte,
                    didactic-ui, Teile aus sek-b-klarheit, stil)
  karte.js          Pins, Ebenen-Filter, Kamera/Fokus, Bau- und Stillstandsanzeige,
                    Lieferweg (construction-visibility, stop-safety-visual,
                    didactic-transport, map-focus-navigation, Teile aus
                    premium-spielgefuehl, handy-layout)
  animation.js      Prozess-Szenen, Bau-Animationen, Münzen, Funken, reduzierte
                    Bewegung (transformation-*, construction-animation-enhance,
                    premium-animation-*, reduced-motion-final)
  meldungen.js      Meldungen, Verlauf, Reload-Gate, Monatsbilanz
                    (notification-history, notification-reload-fix, Teile aus
                    premium-spielgefuehl)
  zertifikat.js     PDF-Leistungsnachweis (abschluss-zertifikat; vendor/pdf-lib bleibt)
  leistung.js       Rechen- und Zeichen-Bremsen (performance-pass) – zuletzt, wenn
                    klar ist, welche Caches nach dem Umbau noch nötig sind
  stil.js           ein Stylesheet: Farbrollen, Knöpfe, Bausteine, dann Abschnitte
                    pro Modul
```

## Regeln für jedes Modul

1. **Ein Besitzer pro Funktion.** Ein Modul, das einen Bildschirm zeichnet, definiert
   die Funktion einmal mit dem endgültigen Ergebnis. Keine Regex-Ersetzung auf HTML,
   das ein anderes Modul erzeugt.
2. **Erweitern über Hooks, nicht über Umhüllen.** Wer «nach jedem Zeichnen» etwas tun
   muss, meldet sich in `basis.js` an, statt `zeichnen` zu umhüllen. Reihenfolge der
   Hooks ist festgelegt und dokumentiert.
3. **Stil gehört in `stil.js`.** Module erzeugen keine eigenen `<style>`-Blöcke mehr.
   `!important` nur, wo ein Inline-Stil des Kerns übertroffen werden muss.
4. **Spielstand bleibt kompatibel.** Kein Feld in `S` wird umbenannt oder entfernt;
   alte Spielstände laden wie heute.
5. **Öffentliche Marker bleiben** (`window.__erzweltEinfuehrung`, `__erzweltObjectiveGuide`,
   `__erzweltKnowledgeQuestFlow`, `__erzweltDidacticComplexity` …), solange Tests sie
   brauchen, oder die Tests werden im selben Schritt angepasst.
6. **Kern nur minimal ändern**: höchstens tote Teile entfernen, wenn ein Modul sie
   nachweislich ganz ersetzt, und Hook-Punkte. Keine Umstellung der Simulation.
7. **README** beschreibt am Ende pro Modul, was es tut; die bisherigen Abschnitte
   pro Patch werden zusammengefasst.

## Prüfstand: «gleich» messbar machen

Vor dem ersten Umbau entsteht `tests/vergleich/` (Schritt 0):

- **`aufnahme.cjs`** spielt das gebaute `index.html` im Browser in festen Szenarien
  durch, mit festem Zufall (Math.random mit Startwert) und ohne Animationen:
  Startbild, Schwierigkeit, alle 12 Einführungsschritte, alle Blätter (kaufen und
  besitzen), Markt, Team, Ziel, Wissen, Lupe, 60 Spieltage danach, alter Spielstand.
  Pro Zustand speichert es den sichtbaren Text, die Klassen von Aufgabe, Pins und
  Knöpfen, den Spielstand `S` und einen Screenshot (390 × 844).
- **`vergleich.py`** vergleicht zwei Aufnahmen: Text, Klassen und Spielstand müssen
  gleich sein; Screenshots dürfen höchstens minimal abweichen (Kantenglättung).
- Die Aufnahme des heutigen Stands ist die **Referenz**. Jeder Schritt muss sie
  treffen, sonst ist er nicht fertig.

Zusätzlich nach jedem Schritt: Build, `tests/unit/certificate.mjs`, die bestehenden
Prüfskripte (Einführung durchspielen, alte Spielstände). Der E2E-Test läuft auf
GitHub im Pull Request.

## Schritte

Jeder Schritt ist ein eigener Commit auf `claude/module-umbau` und für sich
lauffähig. Reihenfolge so, dass zuerst das Riskante abgesichert und das Einfache
erledigt wird.

| # | Schritt | Inhalt | Risiko |
|---|---|---|---|
| 0 | Prüfstand | `tests/vergleich/` bauen, Referenz aufnehmen | keins |
| 1 | Totes entfernen | Tutorial-Texte und -Overrides, die `einfuehrung.js` ersetzt; nie erreichte Zweige; doppelte Definitionen | klein |
| 2 | `basis.js` + Hooks | Hook-Punkte schaffen; die 13 `zeichnen`-Hüllen auf Hooks umstellen, ohne Inhalt zu ändern | mittel |
| 3 | `stil.js` | alle Stilblöcke in ein Stylesheet, Abschnitte pro Bereich, `!important` abbauen | mittel (Aussehen) |
| 4 | `blaetter.js` | Minen-, Raffinerie-, Fabrik-Blatt endgültig schreiben | mittel |
| 5 | `seiten.js` | Markt, Team, Ziel, Wissen-Übersicht endgültig schreiben | mittel |
| 6 | `aufgabe.js` | Aufgabenkarte aus 11 Schichten in eine | hoch |
| 7 | `einfuehrung.js`, `wissen.js` | Einführung und Wissens-Quests bündeln | mittel |
| 8 | `karte.js`, `animation.js`, `meldungen.js` | Darstellung der Welt bündeln | mittel |
| 9 | `simulation.js` | Tageslauf und Logik-Fixes bündeln; tote Kern-Teile markieren | hoch (Zahlen) |
| 10 | `leistung.js`, README, Aufräumen | Caches prüfen, alte Dateien löschen, README pro Modul | klein |

## Ablauf und Kontrolle

- **Konzept und Prüfstand** (Schritt 0) macht die Hauptsitzung.
- **Jeder Umbauschritt** (1–10) wird von einem eigenen Agenten mit mittlerem Aufwand
  ausgeführt, einer nach dem anderen (nicht parallel, weil alle dieselben Dateien
  berühren). Der Agent bekommt dieses Konzept, den Schritt und die Prüfbefehle und
  committet erst, wenn alle Prüfungen grün sind.
- **Nach jedem Schritt** prüft die Hauptsitzung Diff und Prüfstand, bevor der nächste
  beginnt.
- **Am Ende** kontrolliert ein unabhängiger Agent, der den Umbau nicht gemacht hat,
  den ganzen Diff gegen `claude/fixes-2311-2026`: Verhalten gleich? Etwas verloren?
  Neue Fehler? Danach Pull Request mit E2E-Test.
- **Abbruchregel:** Trifft ein Schritt die Referenz nicht und lässt sich das nicht
  klar begründen (z. B. bewusst entfernter toter Text), wird er zurückgesetzt statt
  geflickt.

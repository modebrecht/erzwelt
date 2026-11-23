# Erzwelt

**Erzwelt — Rohstoffe & Lieferketten** ist eine mobile Lernsimulation zu Rohstoffen, Verarbeitung, Produktion, Verkauf und Lieferkettenentscheidungen.

## Aufbau

Die Entwicklungsquellen bleiben bewusst getrennt:

- `erzwelt-core.html` — ursprünglicher Spielkern. Nicht durch generierte Dateien ersetzen.
- `patches.json` — einzige verbindliche Reihenfolge aller Patch-Dateien.
- `*.js` im Repo — Didaktik-, UI-, Performance- und Präsentations-Patches.
- `scripts/build-standalone.mjs` — erzeugt die eigenständige Enddatei.
- `index.html` — generierte Standalone- und Einstiegdatei nach dem Build. Nicht von Hand bearbeiten.
- `IDEA.md` — Ideensammlung; Einträge dort gelten nicht automatisch als implementiert.

## Standalone bauen

### Windows

`build-standalone.bat` doppelklicken.

### Plattformunabhängig

```bash
node scripts/build-standalone.mjs
```

Der Build erzeugt `index.html` aus `erzwelt-core.html` und allen Einträgen aus `patches.json`.

Der Builder prüft dabei automatisch:

- Core- und Patch-JavaScript auf Syntaxfehler;
- jede Patch-Datei genau einmal;
- exakt die Reihenfolge aus `patches.json`;
- sichere Einbettung von `</script>`;
- keine Abhängigkeit vom alten Runtime-Loader;
- keine lokalen externen JavaScript-Dateien in der Standalone-Ausgabe;
- dass die geschriebene Datei dem erzeugten Inhalt entspricht.

> Änderungen immer in den Quelldateien vornehmen und danach neu bauen. `index.html` nicht direkt pflegen.

## Etappenziel und Nachweise (`logik-fixes.js`)

- **Etappenziel nach Schwierigkeit:** Einfach CHF 500'000, Mittel und Schwer
  CHF 3'000'000 (Ruf jeweils mindestens 60). Durchgerechnet mit dem Spielcode
  (zufällige Ereignisse, mehrere Durchläufe): Einfach schafft, wer die
  Ladekabel-Kette ausbaut. Mit Ladekabeln allein sind höchstens rund 1.6 Mio
  (Etappe 1) bzw. 2.5 Mio (Etappe 2) möglich – Mittel und Schwer verlangen
  also ein zweites Produkt (z. B. Mainboard), aber kein perfektes Timing.
- **Investitionen getrennt ausgewiesen:** Der Reiter **Ziel** zeigt unter dem
  Etappengewinn, wie viel davon Investitionen sind (Standorte, Ausbau,
  Einstellungen, Verbesserungen) und wie das laufende Geschäft dasteht.
- **Herkunftsnachweise:** Jede Rohstoffquelle hat nach dem Tutorial die Karte
  «Herkunftsnachweis» (Prüfung CHF 30'000). Das Lieferkettengesetz verlangt
  Nachweise für alle Quellen; der Transparenzbericht deckt alle Quellen ab und
  sagt das jetzt auch.
- **Ereignisse:** Das Taiwan-Ereignis verändert nur die Nachfrage (Rohstoffpreise
  werden nicht simuliert). Die Recherche wirkt über den Ruf statt über die
  Smartphone-Nachfrage.

## Verständlichkeit für Sek B (`sek-b-klarheit.js`)

- Schwierigkeitsdialog ohne Fachjargon; **Einfach** ist vorausgewählt und als
  «Empfohlen» markiert, jede Stufe nennt ihr Ziel.
- Tutorial-Karte ohne doppelte Punkte-Leiste; «Schritt abgeschlossen» liegt bei
  offenem Blatt über der Kopfzeile statt über dem Blatt.
- «Ziel zeigen» setzt den Ziel-Pin mittig unter die Aufgabenkarte und blendet
  Meldungen kurz ab.
- Einheiten in Blättern: pro Person, pro Tag, pro Monat, pro Stück; HUD «Team frei».
- Tutorial-Raffinerie zeigt Kupfer statt Seltener Erden, ohne Spezialisierungskarte.
- Konkrete Engpass-Hinweise nach dem Tutorial, z. B. «Zinn fehlt für Ladekabel –
  setze in San Rafael mehr Personal ein (jetzt 5 von 45)». Während einer
  Wissens-Quest erscheint der Engpass als Kasten in der Aufgabenkarte.
- «Spielmodell»-Vorbehalte nur noch im Reiter Wissen, nicht mehr in jedem Blatt.
- Kauf-Entscheide in Ruhe: Solange das Blatt eines noch nicht gekauften
  Standorts offen ist, steht die Zeit; nach Kauf oder Schliessen läuft sie weiter.
  Im Kaufblatt klebt der Kaufknopf unten und ist ohne Scrollen sichtbar; das
  Bild ist flacher. Auf dem Handy reicht jedes Blatt über die Leiste unten bis
  an den Rand; oben bleiben Kasse, Team und Tag sichtbar.
- Aufgabe/Hinweis auf Markt, Team, Ziel und Wissen nur als schmale Zeile
  (Antippen führt zum Ziel). Ganz sichtbar bleibt sie auf der Karte und auf
  der Seite, auf der die Aufgabe erledigt wird (Tutorial: Team, Markt;
  Wissensauftrag: Wissen), und wenn ein Wissen zum Ansehen bereit ist.
- «Das Spielmodell» (vorher «Das Modell im Code») erklärt die Zusammenhänge in
  Worten statt mit Formeln. Tutorial-Schritt 2 prüft wie im Text 10 Personen.

## Handy-Layout (`handy-layout.js`)

Oben zwei Reihen Bedienung, darunter das Spiel:

- «Verlauf» sitzt in der oberen Leiste (2. Reihe links, neben Tempo und
  Einstellungen).
- Meldungen docken links unten über der Leiste an.
- Die Kartenebenen (Rohstoffquellen, Werke, Fabriken) stecken im Filter-Knopf
  über + und −. Ein Punkt am Knopf zeigt, wenn nicht alle Orte sichtbar sind.
- Aufgabenkasten kürzer: Phase als schmale Leiste mit «Phase 1/4 · …» in einer
  Zeile, Zusammenhang ohne Kasten, nur «Ziel zeigen» als Weg zum Ziel.

Nur Darstellung, keine Änderung an Spielstand oder Wirtschaft.

## PDF-Leistungsnachweis

Im Reiter **Ziel** können Lernende ihren Vornamen eintragen und einen
PDF-Zwischenstand herunterladen. Nach Etappenende oder Insolvenz führt
**PDF-Abschluss erstellen** direkt zum Abschlusszertifikat.

Das PDF enthält pro Produkt hergestellte und verkaufte Stück, den aktuellen
Lagerbestand und den tatsächlich erzielten Gesamterlös. Hinzu kommen Einnahmen,
Ausgaben, Gewinn/Verlust, Schlusskasse inklusive Startkapital, Schwierigkeit,
Hilfsbonus, Ruf, Betriebe, Team und Wissensfortschritt. Alle Geldwerte sind CHF
mit zwei Nachkommastellen. Die Finanzbilanz umfasst den gesamten Spielverlauf;
ab der zweiten Etappe wird auch der aktuelle Etappengewinn ausgewiesen.

Produktbuchungen werden im Spielstand gespeichert und über Etappen hinweg
fortgeführt. Bei älteren Spielständen beginnt die Erfassung am Tag des ersten
Ladens mit dieser Version. Fehlende historische Produktzahlen werden im PDF
gekennzeichnet; sie werden nicht aus Lagerbestand oder heutigen Preisen geschätzt.

Der Export funktioniert ohne Netzwerk mit der eingebetteten MIT-Bibliothek
`vendor/pdf-lib-1.17.1.min.js` (Lizenz daneben).

```bash
node tests/unit/certificate.mjs
```

Prüft echte Tagesschritte, manuelle und automatische Verkäufe, Erlöse,
Save/Reload, Etappenwechsel, Neustart, Altdatenmigration sowie die PDF-Erzeugung.
Test-PDFs entstehen unter `artifacts/certificate/`.

## Release-Gates

Vor einer finalen Freigabe:

- [ ] Standalone-Build erfolgreich ausführen.
- [ ] Generierte `index.html` direkt öffnen.
- [ ] Mobile Zielgrösse 360×800 prüfen.
- [ ] Tutorial Schritte 1–11 vollständig durchspielen.
- [ ] Rohstoffquelle → Raffinerie → Fabrik → Verkauf prüfen.
- [ ] Fabrikbau, Fortschrittsring und Abschlusszustand prüfen.
- [ ] Streik, Stillstand und Sicherheitsstopp prüfen.
- [ ] Notifications, Meldungsverlauf und Kartenfokus prüfen.
- [ ] Tutorial/Quest-Kartenfokus prüfen.
- [ ] Ereignisdialog prüfen, während der Meldungsverlauf geöffnet ist.
- [ ] 1× und 4× Geschwindigkeit prüfen.
- [ ] Save/Reload während Tutorial prüfen.
- [ ] Save/Reload während Fabrikbau prüfen.
- [ ] Reduced Motion prüfen.
- [ ] Browser-Konsole auf Fehler prüfen.
- [ ] Längere Session auf sichtbare Performance- oder DOM-Probleme prüfen.

## Aktueller Hinweis

Für die Freigabe zählt immer ein frisch erzeugter und geprüfter `index.html`-Standalone-Build. Die Entwicklungsquelle bleibt `erzwelt-core.html` zusammen mit der in `patches.json` definierten Patch-Reihenfolge.

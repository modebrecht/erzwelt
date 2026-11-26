# Erzwelt

**Erzwelt — Rohstoffe & Lieferketten** ist eine mobile Lernsimulation zu Rohstoffen, Verarbeitung, Produktion, Verkauf und Lieferkettenentscheidungen.

## Aufbau

Die Entwicklungsquellen bleiben bewusst getrennt:

- `erzwelt-core.html` — ursprünglicher Spielkern. Nicht durch generierte Dateien ersetzen.
- `patches.json` — einzige verbindliche Reihenfolge aller Patch-Dateien.
- `*.js` im Repo — Didaktik-, UI-, Performance- und Präsentations-Patches.
- `module/` — zusammengeführte Bereiche: Hier wird eine Funktion genau einmal
  festgelegt statt in vielen Hüllen übereinander (siehe «Module» unten).
- `scripts/build-standalone.mjs` — erzeugt die eigenständige Enddatei.
- `index.html` — generierter Einstieg mit eingebettetem Spielcode. Nicht von Hand bearbeiten.
- `IDEA.md` — Ideensammlung; Einträge dort gelten nicht automatisch als implementiert.

## Standalone bauen

### Windows

`build-standalone.bat` doppelklicken.

### Plattformunabhängig

```bash
node scripts/build-standalone.mjs
```

Der Build erzeugt `index.html` aus `erzwelt-core.html` und allen Einträgen aus `patches.json`.
Zum Spielen `index.html` öffnen. Online lädt Erzwelt die vier WebP-Intro-Bilder als
ein Bündel, sobald «Neues Spiel» gewählt wird. Nach Änderungen an den Originalbildern
das Bündel mit `python3 scripts/build-intro-bundle.py` (Pillow) neu erstellen.
Ein direkter Aufruf von `erzwelt-core.html` leitet zu `index.html` weiter.
Für eine einzelne Offline-Datei inklusive aller Originalbilder
`node scripts/build-standalone.mjs --offline` ausführen. Die Ausgabe liegt in
`artifacts/erzwelt-offline.html`.

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
- Konkrete Engpass-Hinweise nach dem Tutorial (nur wenn ein Material die Produktion
  wirklich gebremst hat, nicht schon bei knappem Lager), z. B. «Zinn fehlt für Ladekabel –
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

Oben eine kompakte Bedienleiste über der Karte:

- Kasse, Tag, Verlauf, Tempo und Einstellungen stehen nebeneinander. Auf
  schmalen Displays zeigt der Verlauf ein Uhrsymbol mit Meldungszähler.
- Meldungen docken links unten am Bildschirmrand über der Leiste an.
- Die Kartenebenen (Rohstoffquellen, Werke, Fabriken) stecken im Filter-Knopf
  über + und − (gleiche Abstände). Ein Punkt am Knopf zeigt, wenn nicht alle Orte sichtbar sind.
- Die Aufgabe steht auf allen Seiten rechts oben. Auf der Karte sitzt sie
  direkt unter der Bedienleiste.
- Aufgabenkasten kürzer: Phase als schmale Leiste mit «Phase 1/4 · …» in einer
  Zeile, Zusammenhang ohne Kasten, nur «Ziel zeigen» als Weg zum Ziel.

Nur Darstellung, keine Änderung an Spielstand oder Wirtschaft.

## Erfolg feiern (`erfolg-feier.js`)

Ist ein Tutorial-Schritt oder eine Wissens-Quest erledigt, gibt es einen kurzen,
leisen Erfolgston (Web Audio, keine Datei) und Funken; beim Abschluss des
Tutorials etwas grösser. Kaufen und selbst verkaufen haben je einen eigenen
kurzen Ton (der tägliche Verkauf durch das Team bleibt still). Auf Android
vibriert das Handy kurz bei Kauf, eigenem Verkauf und Erfolg. In den
Einstellungen: «Töne» und «Vibration» abschaltbar, Funken über
«Animationen: aus».

## Premium-Spielgefühl (`premium-spielgefuehl.js`)

- Rohstoff auf einen Blick: Auch nicht eröffnete Rohstoffquellen zeigen
  Kürzel und Farbe (Cu, Al, Sn …); im Aufgabentext steht «Kupfer (Cu)».
- Lieferwege zeigen jeweils ein Symbol von der Quelle zur Raffinerie und
  weiter zur Fabrik. Unter **Einstellungen → Liefersymbole** lassen sich Punkte,
  Schiffe oder Flugzeuge wählen. Bei Pause steht das Symbol still.
  «Animationen: aus» zeigt die Wege statisch.
- Beim Verkauf erscheint der Erlös grün im Kassen-Feld.
- Monatsabschluss als kleine Bilanz: laufendes Geschäft (Einnahmen minus
  Löhne und Betrieb) mit Trendpfeil, dazu was investiert wurde.
- Beispiel-Lieferweg als kleiner Knopf unter «Verlauf» statt Textkasten.

## Kurztexte (`kurztexte.js`)

Lange Erklärsätze auf Markt, Team, Ziel, Wissen und in den Blättern kürzer;
Rohstoffe ohne Quelle im Markt in einer Zeile; keine doppelte Meldungsliste
im Ziel (dafür gibt es «Verlauf»). Lerninhalte in der Wissens-Lupe bleiben.

## Einführung Schritt für Schritt (`einfuehrung.js`)

Die Einführung nimmt an der Hand: **eine Aufgabe = eine Handlung an einem Ort**.
Nur dieser Ort leuchtet auf der Karte, «Ziel zeigen» führt genau dorthin.

1./2. Kupfer-Quelle (Katanga) eröffnen und mit 15 Personen besetzen ·
3./4. Aluminium (Boké) eröffnen und mit 5 besetzen · 5./6. Zinn (Bangka) eröffnen
und mit 10 besetzen · 7./8. Raffinerie (Guangdong) bauen und mit 5 besetzen ·
9./10. Kabelfabrik (China) bauen und nach dem Bau mit 5 besetzen ·
11. einmal selbst verkaufen · 12. Verkaufsteam mit 4 Personen.

- **Neue Runde mit 0 Personen.** Eingestellt wird direkt an der Station mit dem
  Regler (siehe unten). Schon die erste Aufgabe zeigt: Personal kostet einmalig
  beim Einstellen und danach jeden Monat Lohn. Im Team-Reiter wird während der
  Einführung nicht eingestellt; er zeigt den Stand pro Station.
- **Nur so viel Personal wie nötig:** Jede Station lässt sich nur bis zum Bedarf
  besetzen (Kupfer 15, Aluminium 5, Zinn 10, Raffinerie 5, Fabrik 5, Verkauf 4 –
  zusammen 44, Lohn rund CHF 21'000 pro Monat). Am Ende sitzt niemand untätig.
- **Die Kette läuft danach von selbst.** Die Zahlen sind durchgerechnet (Simulation
  ohne Ereignisse, 120 Tage): Die Fabrik macht 16 Ladekabel pro Tag, Kupfer,
  Aluminium und Zinn reichen dafür, das Verkaufsteam schafft 20 pro Tag. Kein
  Engpass, das Lager bleibt leer, rund CHF 41'000 laufender Gewinn pro Monat
  (Einfach). Vorher (10/5/5, Verkauf 2) fehlten sofort Zinn und Verkäufer.
- Vorgeschlagen werden die günstigsten Orte. Hat ein Spielstand schon eine
  passende Quelle oder Raffinerie, arbeitet die Einführung mit dieser weiter.
- Kaufen geht nur am Zielort des aktuellen Schritts; andere Orte zeigen
  «Noch nicht dran» und einen Knopf zum richtigen Ort. Verbesserungen im Wissen
  gibt es erst nach der Einführung. So kann niemand alles Geld ausgeben und
  dann feststecken (am Ende der Einführung bleiben rund CHF 0.67 Mio).
- Sitzen anderswo zu viele Leute (alter Spielstand), schickt die Aufgabe zuerst
  dorthin zum Umverteilen, statt neu einstellen zu lassen.
- Ältere Spielstände werden übernommen (Marke `S.einfuehrung`): Fertige bleiben
  fertig, laufende springen zum ersten offenen Schritt. Sie behalten ihre
  10 Startleute (`S.startTeam`, zählt nicht als Investition).

## Belegschaft per Regler (`belegschaft-regler.js`)

Rohstoffquelle, Raffinerie, Fabrik und Verkaufsteam: statt −10/−/+/+10 eine Zeile
**− · Zahl · +** für einzelne Personen und darunter ein Regler 0 … Plätze.

- Blau: arbeitet hier. Hell: kommt aus dem freien Team. Gelb: wird beim Loslassen
  **neu eingestellt**, soweit das Geld reicht. Schraffiert: geht nicht.
- Zwei Kacheln zeigen live beim Ziehen, was das kostet: **Einmalig** (CHF 1'800
  pro neue Person) und **Jeden Monat** (Lohn am Standort, je nach Land und Lohnstufe).
- In der Einführung zeigt eine Marke («Ziel 10») die verlangte Zahl.
- Im Team-Reiter heisst der Knopf «Stelle … Personen ein · CHF … einmalig»;
  darunter steht der monatliche Lohn (je nach Land, Verkauf, ohne Aufgabe).

## Aufgabe kompakt (`aufgabe-kompakt.js`)

Auf dem Handy mehr Platz für die Karte (nur Darstellung):

- Tutorial-Aufgabe ohne «Zusammenhang» (kommt als Rückmeldung nach dem Schritt),
  Phase nur als Balken, «Ziel zeigen» niedriger – rund 30 % kleiner.
- «Neues Wissen» (vorher «Wissen freigeschaltet») mit höchstens zwei Zeilen Text;
  ein Engpass erscheint als einzeiliger Hinweis, Antippen führt hin.
- Auf Markt, Team und Ziel ist «Neues Wissen» eine schmale Zeile mit «Ansehen».
- Meldungen erscheinen einzeln, damit jede lesbar bleibt. Kurze Meldungen
  stehen standardmässig 6,7 Sekunden, lange 10,7 Sekunden. Unter
  **Einstellungen → Meldungsdauer** lässt sich die Lesezeit anpassen.
- Bei 1× und 100 % dauert ein Tag 3 Sekunden, bei 4× 0,75 Sekunden.
  **Tempo bei Meldungen** verdoppelt standardmässig die Dauer ab dem
  zweiten Meldungstag in Folge. Alternativ lassen sich alle Meldungstage
  bremsen oder das Spieltempo gleich lassen.

## Ziel positiv (`ziel-positiv.js`)

Der Ziel-Reiter beginnt mit dem **laufenden Geschäft pro Monat** (Einnahmen minus
Löhne und Betrieb) als grosser Zahl, mit Trend und Balken der letzten Monate
(`S.monatsVerlauf`). Darunter eine Prognose: «Bei diesem Tempo erreichst du das
Ziel in etwa 17 Monaten – du hast noch 20» oder was noch fehlt und was hilft.
Investitionen sind als Aufbau erklärt, nicht als Verlust.

## Feinschliff (`feinschliff.js`)

- Verkaufsbetrag ersetzt kurz das Wort «Kasse» («+2'845») statt darüberzuliegen.
- «Schritt abgeschlossen» erscheint auf der Karte unten über der Leiste statt über
  Kopfzeile und Aufgabe.
- Fabrik-Szene: ganzer Produktname im Karton, Materialnamen nicht abgeschnitten.
- Fehlendes Material im Rezept rot mit «· fehlt» statt grau durchgestrichen.

## Ein Stil (`stil.js`)

Erzwelt behält seine Identität (Tiefsee-Karte, Papier-Blätter, Baloo 2 und Nunito),
aber jede Farbe hat eine feste Rolle:

- **Gold** = tun: kaufen, bauen, einstellen, verkaufen, ausbauen (vorher teils grün).
- **Weiss mit Rand** = zweitrangig: Ziel zeigen, Zum Team, − / +, Neue Runde, Entlassen.
- **Grün** = Wissen und Erfolg (Ansehen, Gewinn), nie für Käufe.
- **Rot** = Schliessen und Warnungen.

Knöpfe mit drei Radien (12 / 14 / 18) und gleicher Kante. Keine gesperrten
Grossbuchstaben mehr (vorher 34 Stellen); Knopftexte als Verb
(«22 Personen einstellen», «Selbst verkaufen»). Keine Emojis mehr: Schwierigkeit als
1–3 Erzbrocken, Warnung, Pause, Schloss und Lieferweg als Linien-Symbole.

**«Al» statt «AI»:** In Baloo 2 sehen grosses I und kleines l gleich aus. Das l in
«Al» wird darum als eigenes Zeichen gezeichnet: senkrecht nach unten, unten ein
runder Bogen nach rechts oben wie in der Schulschrift. Es steht auf der Grundlinie,
unabhängig von der Schrift. Das Symbol bleibt chemisch korrekt «Al»; Screenreader
lesen weiterhin «Al».

## Bilder-Intro und Produktentdeckungen

Beim ersten neuen Spiel zeigt Erzwelt vier Originalbilder vor der
Schwierigkeitswahl. Die Bilder sind auch mit Pfeiltasten und horizontalen
Wischgesten bedienbar. **Intro erneut ansehen** in den Einstellungen pausiert
das Spiel für die Dauer der Wiederholung.

Beim ersten tatsächlich hergestellten Stück erscheint eine Entdeckungskarte.
Das Ladekabel zeigt Claudes Querschnitt mit Kupfer, Aluminium und Zinn. Die
anderen Karten lesen ihre Materialien aus dem Produktkatalog. Entdeckungen
warten auf das Ende des Spieltags und auf Entscheidungen, die gerade offen sind.
Offene und bereits gesehene Karten werden pro Speicherplatz und im JSON-Export
gesichert. Ältere Spielstände übernehmen bekannte Produkte aus Buchungen und
Lagerbeständen, bei lückenhaften Buchungen auch aus bestehenden besetzten Fabriken.
Nach einer Karte läuft das bisherige Tempo weiter. Beim Laden eines Spielstands
gilt die Fortsetzungsregel mit 1×.

## Karte in der Mitte (`karte-mitte.js`)

Der grosse runde Knopf unten führt zur Weltkarte; Team ist ein normaler Reiter
mit einer kleinen Zahl für Leute ohne Aufgabe.
An fördernden Rohstoffquellen arbeiten 1–3 kleine Figuren mit Spitzhacke
(ab 10 bzw. 30 Personen mehr Figuren); bei Streik oder Stillstand stehen sie
still. «Animationen: aus» stoppt sie.

## Animationen immer an (`bewegung-immer.js`)

Viele Schulgeräte melden «Bewegung reduzieren» (Windows-Einstellung,
Remote-Desktop). Früher stand dann im Spiel alles still. Jetzt entscheidet nur
die Einstellung «Animationen» im Spiel: Die Browser-Abfrage
`prefers-reduced-motion` meldet immer «nein», und CSS-Regeln nur für
«Bewegung reduzieren» werden entfernt. Lädt als erster Patch.

## Blatt-Ordnung (`blatt-ordnung.js`)

Im Blatt einer eigenen Rohstoffquelle steht die Lohnstufe direkt unter der
Belegschaft, danach die Zufriedenheit. Jede Lohnstufe zeigt Lohnkosten pro
Monat für die aktuelle Belegschaft und die Förderung pro Tag, sobald sich die
Zufriedenheit eingependelt hat. Bei jeder Änderung von Lohn, Belegschaft oder
Ausbau steigen kurz rote/grüne Prozent-Zeichen auf (6 s).

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

## Hauptmenü und Spielstände

Erzwelt startet im Hauptmenü. Unter **Spielstände** lassen sich drei Firmen
unabhängig voneinander fortsetzen, umbenennen, exportieren oder löschen.
**Speichern & zum Hauptmenü** sichert den Fortschritt und stoppt die Uhr.
Laufende Spielstände werden bei 1× fortgesetzt. Offene Entscheidungen und
Etappenabschlüsse werden beim Laden erneut angezeigt. Im Hauptmenü und bei
ausgeblendetem Browser-Tab vergeht kein Spieltag.

Die JSON-Datei enthält den Spielstand mitsamt Wissensfortschritt und
Produktbuchungen. Auf einem anderen Gerät zuerst **JSON importieren** wählen,
die Vorschau prüfen und dann den Speicherplatz wählen. Ein importierter
Schwer-Spielstand lässt sich direkt fortsetzen. Neue Schwer-Runden werden
weiterhin über eine erfolgreich abgeschlossene Mittel-Etappe freigeschaltet.
Frühere Browser-Spielstände werden einmalig übernommen und als Sicherung
behalten. Bei blockiertem Browserspeicher bleiben Spielstände in der laufenden
Sitzung verfügbar. Für die nächste Sitzung die JSON-Datei exportieren.

## Module

Die Patches werden Schritt für Schritt zu Modulen zusammengeführt, ohne Verhalten,
Text oder Aussehen zu ändern. `docs/neuzuweisungen.md` (erzeugt mit
`node scripts/neuzuweisungen.mjs`) zeigt, welche globalen Funktionen noch von
mehreren Dateien überschrieben werden.

Jedes Modul legt seine Funktionen genau einmal fest und ruft die Schritte der
früheren Hüllen in derselben Reihenfolge auf. Die Teile bleiben mit ihren Stilen in
ihren Dateien und melden sich in `window.__erzwelt…Teile` an; der Kopf jedes Moduls
listet, welcher Teil woher kommt.

- `module/karte.js` — **Karte und Pins**: `zeichnen`, `pinsZeichnen`, `dockZeichnen`,
  `ansichtAnwenden`, `hinweiseSetzen`, `pinFeiern` (früher bis zu 15 Hüllen). Lädt als
  erstes nach dem Kern; ein Schritt läuft, sobald seine Datei ihn angemeldet hat. So
  verhält sich auch das Zeichnen während des Ladens wie vorher.
- `module/quest.js` — **Aufgabenkarte**: `questZeichnen` (früher 11 Hüllen).
- `module/seiten.js` — **Reiter** Markt, Team, Ziel, Wissen: `seiteMarkt`, `seiteTeam`,
  `seiteZiel`, `seiteWissen`, `seiteFuellen`.
- `module/blatt.js` — **Blätter** Rohstoffquelle, Raffinerie, Fabrik: `blattMine`,
  `blattRaff`, `blattFab`, `blattFuellen`, `blattZu`, `szeneRaff`.
- `module/einfuehrung.js` — **Einführung**: `schwierigkeitZeigen`, `tutorialPruefen`.
  Schritte, Sperren und Zielort bleiben in `einfuehrung.js`.

Prüfung bei jedem Schritt: `tests/vergleich/` nimmt rund 490 Zustände auf (Text,
Spielstand, Screenshot) und vergleicht sie mit Aufnahmen des Stands vor dem Umbau
(Branch `vor-umbau`). Die Referenz zweimal aufnehmen: Was schon zwischen den beiden
schwankt (Zeitabläufe), zählt nicht als Unterschied. Das Skript startet einen eigenen
kleinen Webserver; Playwright muss per `NODE_PATH` auffindbar sein.

```bash
git worktree add /tmp/vorher vor-umbau
cp -r tests/vergleich /tmp/vorher/tests/
(cd /tmp/vorher && node scripts/build-standalone.mjs && \
  node tests/vergleich/aufnahme.cjs /tmp/ref1 && node tests/vergleich/aufnahme.cjs /tmp/ref2)
node scripts/build-standalone.mjs && node tests/vergleich/aufnahme.cjs /tmp/neu
python3 tests/vergleich/vergleich.py /tmp/ref1 /tmp/neu --zweite-referenz /tmp/ref2
```

## Release-Gates

Vor einer finalen Freigabe:

- [ ] Standalone-Build erfolgreich ausführen.
- [ ] Generierte `index.html` direkt öffnen.
- [ ] Mobile Zielgrösse 360×800 prüfen.
- [ ] Einführung Schritte 1–12 vollständig durchspielen.
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

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

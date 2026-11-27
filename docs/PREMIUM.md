# Premium pass – quality backlog
Goal: lift the weakest content, performance, graphic readability and language coverage, one ~1 h pass at a time.
Für Erzwelt zusätzlich als eigener Track: **Didaktik** – stimmt, was das Spiel erklärt, mit dem überein, was es rechnet?

## Project facts (read by the continue-premium skill)
- Repo / local path: `modebrecht/erzwelt` (GitHub), lokal `/home/claude/erzwelt`
- Stack: ein HTML-Kern (`erzwelt-core.html`) + Patch-Dateien (`*.js`, `module/*.js`) in der Reihenfolge von `patches.json`; `scripts/build-standalone.mjs` packt alles gzip-komprimiert in `index.html`. Kein Framework, kein Bundler.
- Where assets live: `assets/` (Intro-Bilder, WebP-Bündel), `audio/` (Musik OGG/MP3 mit Prüfwert im Namen), Soundeffekte per Web Audio in `erfolg-feier.js`, Karte/Landschaft als SVG im Code.
- Where texts live: `texte.de.js` (Schlüssel → Text, `textVon`), Ortsinfos in `karteninfo-daten.js`; offene Punkte in `docs/texte-offen.md`. Zielgruppe: Sek B, 8./9. Klasse, Schweiz. Sprache vorerst nur Deutsch (Schweizer Schreibweise, kein ß). Weitere Sprachen nur auf Wunsch.
- Build: `node scripts/build-standalone.mjs` (nach jeder Änderung an Kern, Patches oder Texten; `index.html` wird mitcommittet)
- Tests: `python3 -m http.server 4173 --bind 127.0.0.1` im Repo, dann `node tests/e2e/<name>.mjs` (gameplay, audio, spielstaende, transport-spieltempo, wissen-team, lernfeedback, geldhelfer, produktentwicklung, probe) und `node tests/unit/certificate.mjs`. Playwright aus `~/.npm-global/lib/node_modules` (Symlink `node_modules`, danach wieder löschen). In der Cloud-Sitzung scheitert `gameplay.mjs` nur an gesperrten Google Fonts (Konsolenfehler) – sonst grün. Debug: globale Funktionen (`tagVor`, `zeichnen`, `blattFuellen`, `seiteWechseln`, `S`) per `page.evaluate`.
- Ship: direkt auf `main`, keine Feature-Branches (Matty will keinen Branch-Wildwuchs). Vercel deployt nur `main` → erzwelt.vercel.app. Push nur mit Mattys Okay.
- Publish: erzwelt.vercel.app
- Never: keine Store-Builds; keine Änderung an Spielständen, die alte Saves bricht (neue Felder in `spielstaende-daten.js` validieren); keine bezahlten oder urheberrechtlich geschützten Assets.
- Report language / style: Deutsch (Schweiz), kurz, direkt, fürs Handy.

## Current rating (1–10)
| Area | Rating | Notes |
|---|---|---|
| Didaktik (Erklärung = Rechnung) | 7 | Pass 1: Raffinerie-Engpass jetzt echt; Formeln vollständig. Offen: Produktpreise teils unrealistisch |
| UI | 7 | Zeit steht bei offenen Fenstern; Kopfleiste einzeilig bei Platz; Aufgabe minimiert |
| Texte (DE) | 7 | Durchgang 27.11.: KI-Floskeln, Jargon, «Tier» → «Stufe». Ortsinfos noch nicht geprüft |
| Balance Einfach | 6 | Ziel = laufendes Geschäft; evtl. zu leicht (500k in ~10 Monaten ohne Ausbau) |
| GFX readability | 7 | nicht systematisch geprüft |
| Performance | ? | noch nicht gemessen |
| Sound / Musik | 6 | 3 Titel, SFX; Musik startet erst nach Wahl |
| Language | 3 | nur Deutsch (bewusst) |

## Asset ratings (worst first – a pass replaces from the top)
| Asset | Kind | Rating | Why |
|---|---|---|---|
| (noch nicht erhoben) | | | |

## Backlog (highest impact per hour first)
- [ ] Didaktik: Produktpreise prüfen (Konsole CHF 1'570, E-Bike-Akku CHF 1'260, Mainboard CHF 1'100 wirken hoch) – nur mit Mattys Okay, beeinflusst Balance
- [ ] Didaktik: `marktBewegen()` verändert Rohstoffpreise, die nirgends wirken (kein Rohstoffmarkt) – entfernen oder sichtbar machen
- [ ] Balance Einfach: Ziel auf ~CHF 1 Mio laufendes Geschäft? (Entscheid Matty)
- [ ] Texte: Ortsinfos in `karteninfo-daten.js` auf Fakten und Verständlichkeit prüfen
- [ ] Didaktik: Wissen «Die Lieferkette» – Beispielweg km vs. «Transportkosten nicht berechnet» klarer
- [ ] GFX: Handy-Screenshots der vollsten Momente (Etappenabschluss, viele Meldungen)
- [ ] Performance: Messung Karte mit allen Pins, Landschaft «voll»

## Done
- Pass 1 (27.11.2026, Didaktik): Raffinerie-Kapazität halbiert, damit «Nicht der Abbau ist der Engpass, sondern die Raffination» im Spiel stimmt (Containerstau, Raffinerie-Ausbau und Ladungsplanung wirken jetzt); Formeln in Wissen um Ausbau und Schwierigkeit ergänzt; Containerstau-Text erklärt die Ursache. Vorher am selben Tag: Ziel Einfach = laufendes Geschäft, Ladekabel 10er-Pack, Anstellen ohne Einmalkosten, Zeit steht bei offenen Fenstern, Texte ohne KI-Floskeln, Monatsübersicht.

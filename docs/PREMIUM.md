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
| Didaktik (Erklärung = Rechnung) | 8 | Raffinerie-Engpass echt; Formeln vollständig; Preise pro Gerät realistisch (Packs) |
| UI | 7 | Zeit steht bei offenen Fenstern; Kopfleiste einzeilig bei Platz; Aufgabe minimiert |
| Texte (DE) | 7 | Durchgang 27.11.: KI-Floskeln, Jargon, «Tier» → «Stufe». Ortsinfos noch nicht geprüft |
| Balance Einfach | 7 | Ziel CHF 1 Mio laufendes Geschäft: Tutorial-Kette allein ≈ 16 von 24 Monaten |
| GFX readability | 7 | nicht systematisch geprüft |
| Performance | ? | noch nicht gemessen |
| Sound / Musik | 6 | 3 Titel, SFX; Musik startet erst nach Wahl |
| Language | 3 | nur Deutsch (bewusst) |

## Asset ratings (worst first – a pass replaces from the top)
| Asset | Kind | Rating | Why |
|---|---|---|---|
| (noch nicht erhoben) | | | |

## Backlog (highest impact per hour first)
- [x] Didaktik: Produktpreise – als Packs verkauft (Mainboard 5er, Konsole 3er, TV/Akku 2er), Preis pro Gerät realistisch, Balance gleich
- [ ] Didaktik: `marktBewegen()` verändert Rohstoffpreise, die nirgends wirken (kein Rohstoffmarkt) – entfernen oder sichtbar machen
- [x] Balance Einfach: Ziel CHF 1 Mio laufendes Geschäft
- [ ] Texte: Ortsinfos in `karteninfo-daten.js` auf Fakten und Verständlichkeit prüfen
- [ ] Geschichte: weitere Kapitel (z. B. Gold an der Goldküste/Ghana, Lithium-Dreieck, Kupfer in Chile 1971)
- [ ] Didaktik: Wissen «Die Lieferkette» – Beispielweg km vs. «Transportkosten nicht berechnet» klarer
- [ ] GFX: Handy-Screenshots der vollsten Momente (Etappenabschluss, viele Meldungen)
- [ ] Performance: Messung Karte mit allen Pins, Landschaft «voll»

## Done
- Pass 1 (27.11.2026, Didaktik): Raffinerie-Kapazität halbiert, damit «Nicht der Abbau ist der Engpass, sondern die Raffination» im Spiel stimmt (Containerstau, Raffinerie-Ausbau und Ladungsplanung wirken jetzt); Formeln in Wissen um Ausbau und Schwierigkeit ergänzt; Containerstau-Text erklärt die Ursache. Vorher am selben Tag: Ziel Einfach = laufendes Geschäft, Ladekabel 10er-Pack, Anstellen ohne Einmalkosten, Zeit steht bei offenen Fenstern, Texte ohne KI-Floskeln, Monatsübersicht.
- Pass 1b (27.11.2026): Packs statt Fantasiepreise (Mainboard 5er, Konsole 3er, Smart-TV/E-Bike-Akku 2er); Ziel Einfach CHF 1 Mio laufendes Geschäft.
- Wissens-Quiz (27.11.2026): pro Wissensfeld eine Frage mit 4 Antworten; Verbesserungen erst nach richtiger Antwort, 20 % Rabatt bei richtig im ersten Versuch; falsch = alle vier wackeln rot.
- Geschichte (27.11.2026): 5 Kapitel im Reiter Wissen (Potosí, Kongo, Seltene Erden, Konfliktmineralien, Konzernverantwortung CH) mit Frage; richtig im 1. Versuch CHF 15'000. Fakten per Websuche geprüft.

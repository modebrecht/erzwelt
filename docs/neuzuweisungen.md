# Neuzuweisungen globaler Funktionen

Erzeugt mit `node scripts/neuzuweisungen.mjs` (Ladereihenfolge aus `patches.json`).
Textbasiert: «Hülle» = der Patch merkt sich den Vorgänger und ruft ihn auf,
«Ersetzung» = neue Fassung ohne Vorgänger, «Modul» = die eine Fassung in `module/`.
Nur Funktionen mit mindestens einer Neuzuweisung.

49 Funktionen werden nach ihrer Definition neu zugewiesen, davon 27 nur noch durch ein Modul.

| Funktion | Schichten | Reihenfolge |
|---|---:|---|
| `ansichtAnwenden` | 2 | erzwelt-core.html:2934 (Definition) → module/karte.js:100 (Modul) |
| `anstellbar` | 2 | erzwelt-core.html:932 (Definition) → einfuehrung.js:305 (Hülle) |
| `beispielKette` | 2 | didactic-should.js:195 (Definition) → performance-pass.js:89 (Hülle) |
| `blattFab` | 2 | erzwelt-core.html:3638 (Definition) → module/blatt.js:43 (Modul) |
| `blattFuellen` | 2 | erzwelt-core.html:3696 (Definition) → module/blatt.js:59 (Modul) |
| `blattMine` | 2 | erzwelt-core.html:3498 (Definition) → module/blatt.js:28 (Modul) |
| `blattRaff` | 2 | erzwelt-core.html:3591 (Definition) → module/blatt.js:36 (Modul) |
| `blattZu` | 2 | erzwelt-core.html:3716 (Definition) → module/blatt.js:72 (Modul) |
| `dialogZeigen` | 2 | erzwelt-core.html:4078 (Definition) → module/meldungen.js:45 (Modul) |
| `didaktikMigration` | 2 | didactic-model.js:163 (Definition) → performance-pass.js:27 (Hülle) |
| `dockZeichnen` | 2 | erzwelt-core.html:3225 (Definition) → module/karte.js:89 (Modul) |
| `einstFuellen` | 2 | erzwelt-core.html:4011 (Definition) → module/meldungen.js:62 (Modul) |
| `etappeWeiter` | 2 | erzwelt-core.html:1116 (Definition) → logik-fixes.js:59 (Hülle) |
| `gesperrt` | 2 | erzwelt-core.html:3173 (Definition) → einfuehrung.js:233 (Hülle) |
| `hinweiseSetzen` | 2 | erzwelt-core.html:3420 (Definition) → module/karte.js:79 (Modul) |
| `ikonLohn` | 2 | erzwelt-core.html:412 (Definition) → didactic-model.js:67 (Ersetzung) |
| `lieferwegZeichnen` | 2 | didactic-should.js:208 (Definition) → performance-pass.js:100 (Hülle) |
| `lupeFuellen` | 2 | erzwelt-core.html:3931 (Definition) → module/wissen.js:19 (Modul) |
| `marktBewegen` | 2 | erzwelt-core.html:1109 (Definition) → didactic-model.js:184 (Ersetzung) |
| `matPreis` | 2 | erzwelt-core.html:966 (Definition) → didactic-model.js:185 (Ersetzung) |
| `mineErlaubt` | 2 | erzwelt-core.html:3166 (Definition) → einfuehrung.js:228 (Hülle) |
| `naechsterSchritt` | 2 | erzwelt-core.html:3338 (Definition) → module/wissen.js:28 (Modul) |
| `neuerZustand` | 2 | erzwelt-core.html:823 (Definition) → einfuehrung.js:200 (Hülle) |
| `notiz` | 2 | erzwelt-core.html:869 (Definition) → module/meldungen.js:30 (Modul) |
| `pinFeiern` | 2 | erzwelt-core.html:2996 (Definition) → module/karte.js:71 (Modul) |
| `pinsZeichnen` | 2 | erzwelt-core.html:3033 (Definition) → module/karte.js:61 (Modul) |
| `produktBuchen` | 2 | erzwelt-core.html:861 (Definition) → produktentdeckungen.js:17 (Hülle) |
| `questZeichnen` | 2 | erzwelt-core.html:3389 (Definition) → module/quest.js:129 (Modul) |
| `rufAnpassen` | 2 | erzwelt-core.html:1100 (Definition) → didactic-model.js:188 (Ersetzung) |
| `rundeBeenden` | 2 | erzwelt-core.html:1129 (Definition) → logik-fixes.js:64 (Ersetzung) |
| `schwierigkeitZeigen` | 2 | erzwelt-core.html:4050 (Definition) → module/einfuehrung.js:23 (Modul) |
| `seiteFuellen` | 2 | erzwelt-core.html:3724 (Definition) → module/seiten.js:51 (Modul) |
| `seiteMarkt` | 2 | erzwelt-core.html:3743 (Definition) → module/seiten.js:26 (Modul) |
| `seiteTeam` | 2 | erzwelt-core.html:3813 (Definition) → module/seiten.js:32 (Modul) |
| `seiteWissen` | 2 | erzwelt-core.html:3904 (Definition) → module/seiten.js:46 (Modul) |
| `seiteZiel` | 2 | erzwelt-core.html:3867 (Definition) → module/seiten.js:40 (Modul) |
| `shouldMigration` | 2 | didactic-should.js:34 (Definition) → performance-pass.js:38 (Hülle) |
| `slotSpeichern` | 2 | erzwelt-core.html:4367 (Definition) → spielstaende.js:116 (Ersetzung) |
| `speichern` | 2 | erzwelt-core.html:4368 (Definition) → performance-pass.js:61 (Hülle) |
| `szeneFabrik` | 2 | erzwelt-core.html:562 (Definition) → transformation-animations.js:119 (Ersetzung) |
| `szeneRaff` | 2 | erzwelt-core.html:533 (Definition) → module/blatt.js:52 (Modul) |
| `tagVor` | 2 | erzwelt-core.html:1010 (Definition) → didactic-should.js:147 (Ersetzung) |
| `tempoSetzen` | 2 | erzwelt-core.html:4358 (Definition) → module/meldungen.js:54 (Modul) |
| `toastsErneuern` | 2 | erzwelt-core.html:3266 (Definition) → module/meldungen.js:36 (Modul) |
| `tutorialPruefen` | 2 | erzwelt-core.html:3182 (Definition) → module/einfuehrung.js:29 (Modul) |
| `wareVerkaufen` | 2 | erzwelt-core.html:948 (Definition) → premium-spielgefuehl.js:215 (Hülle) |
| `wissenPraxis` | 2 | didactic-should.js:39 (Definition) → knowledge-quest-flow.js:133 (Ersetzung) |
| `zeichnen` | 2 | erzwelt-core.html:3432 (Definition) → module/karte.js:38 (Modul) |
| `zuruecksetzen` | 2 | erzwelt-core.html:4394 (Definition) → spielstaende.js:408 (Ersetzung) |

## Pro Datei

| Datei | neu zugewiesene Funktionen |
|---|---|
| module/karte.js | `ansichtAnwenden`, `dockZeichnen`, `hinweiseSetzen`, `pinFeiern`, `pinsZeichnen`, `zeichnen` |
| didactic-model.js | `ikonLohn`, `marktBewegen`, `matPreis`, `rufAnpassen` |
| didactic-should.js | `tagVor` |
| performance-pass.js | `beispielKette`, `didaktikMigration`, `lieferwegZeichnen`, `shouldMigration`, `speichern` |
| transformation-animations.js | `szeneFabrik` |
| knowledge-quest-flow.js | `wissenPraxis` |
| logik-fixes.js | `etappeWeiter`, `rundeBeenden` |
| premium-spielgefuehl.js | `wareVerkaufen` |
| einfuehrung.js | `anstellbar`, `gesperrt`, `mineErlaubt`, `neuerZustand` |
| module/quest.js | `questZeichnen` |
| module/seiten.js | `seiteFuellen`, `seiteMarkt`, `seiteTeam`, `seiteWissen`, `seiteZiel` |
| produktentdeckungen.js | `produktBuchen` |
| spielstaende.js | `slotSpeichern`, `zuruecksetzen` |
| module/blatt.js | `blattFab`, `blattFuellen`, `blattMine`, `blattRaff`, `blattZu`, `szeneRaff` |
| module/einfuehrung.js | `schwierigkeitZeigen`, `tutorialPruefen` |
| module/wissen.js | `lupeFuellen`, `naechsterSchritt` |
| module/meldungen.js | `dialogZeigen`, `einstFuellen`, `notiz`, `tempoSetzen`, `toastsErneuern` |

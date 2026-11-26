# Neuzuweisungen globaler Funktionen

Erzeugt mit `node scripts/neuzuweisungen.mjs` (Ladereihenfolge aus `patches.json`).
Textbasiert: «Hülle» = der Patch merkt sich den Vorgänger und ruft ihn auf,
«Ersetzung» = neue Fassung ohne Vorgänger. Nur Funktionen mit mindestens einer Neuzuweisung.

49 Funktionen werden nach ihrer Definition neu zugewiesen.

| Funktion | Schichten | Reihenfolge |
|---|---:|---|
| `zeichnen` | 15 | erzwelt-core.html:3432 (Definition) → didactic-ui.js:38 (Hülle) → didactic-should.js:225 (Hülle) → didactic-transport.js:105 (Hülle) → transformation-animations.js:178 (Hülle) → transformation-enhance.js:202 (Hülle) → construction-visibility.js:186 (Hülle) → premium-animation-treatment.js:230 (Hülle) → premium-animation-treatment-v2.js:67 (Hülle) → stop-safety-visual.js:227 (Hülle) → sek-b-klarheit.js:275 (Hülle) → premium-spielgefuehl.js:172 (Hülle) → premium-spielgefuehl.js:267 (Hülle) → einfuehrung.js:220 (Hülle) → karte-mitte.js:85 (Hülle) |
| `questZeichnen` | 12 | erzwelt-core.html:3389 (Definition) → didactic-should.js:144 (Hülle) → performance-pass.js:155 (Hülle) → tutorial-enhance.js:97 (Hülle) → map-focus-navigation.js:252 (Hülle) → knowledge-quest-flow.js:190 (Hülle) → objective-guide.js:68 (Hülle) → sek-b-klarheit.js:236 (Hülle) → handy-layout.js:223 (Hülle) → erfolg-feier.js:128 (Hülle) → premium-spielgefuehl.js:103 (Hülle) → aufgabe-kompakt.js:57 (Hülle) |
| `blattFuellen` | 7 | erzwelt-core.html:3696 (Definition) → performance-pass.js:199 (Hülle) → stop-safety-visual.js:218 (Hülle) → sek-b-klarheit.js:412 (Hülle) → kurztexte.js:83 (Hülle) → belegschaft-regler.js:224 (Hülle) → blatt-ordnung.js:111 (Hülle) |
| `blattMine` | 6 | erzwelt-core.html:3498 (Definition) → logik-fixes.js:151 (Hülle) → sek-b-klarheit.js:62 (Hülle) → belegschaft-regler.js:108 (Hülle) → einfuehrung.js:269 (Hülle) → stil.js:85 (Hülle) |
| `pinsZeichnen` | 6 | erzwelt-core.html:3033 (Definition) → performance-pass.js:130 (Hülle) → handy-layout.js:200 (Hülle) → premium-spielgefuehl.js:86 (Hülle) → einfuehrung.js:350 (Hülle) → karte-mitte.js:81 (Hülle) |
| `blattRaff` | 5 | erzwelt-core.html:3591 (Definition) → sek-b-klarheit.js:79 (Hülle) → belegschaft-regler.js:109 (Hülle) → einfuehrung.js:271 (Hülle) → stil.js:86 (Hülle) |
| `seiteMarkt` | 5 | erzwelt-core.html:3743 (Definition) → didactic-ui.js:3 (Ersetzung) → sek-b-klarheit.js:128 (Hülle) → belegschaft-regler.js:111 (Hülle) → stil.js:84 (Hülle) |
| `seiteTeam` | 5 | erzwelt-core.html:3813 (Definition) → sek-b-klarheit.js:120 (Hülle) → belegschaft-regler.js:120 (Hülle) → einfuehrung.js:313 (Hülle) → stil.js:83 (Hülle) |
| `blattFab` | 4 | erzwelt-core.html:3638 (Definition) → sek-b-klarheit.js:109 (Hülle) → belegschaft-regler.js:110 (Hülle) → einfuehrung.js:273 (Hülle) |
| `dialogZeigen` | 4 | erzwelt-core.html:4078 (Definition) → notification-history.js:193 (Hülle) → abschluss-zertifikat.js:194 (Hülle) → spielstaende.js:421 (Hülle) |
| `lupeFuellen` | 4 | erzwelt-core.html:3931 (Definition) → didactic-should.js:87 (Hülle) → sek-b-klarheit.js:342 (Hülle) → einfuehrung.js:329 (Hülle) |
| `naechsterSchritt` | 4 | erzwelt-core.html:3338 (Definition) → didactic-should.js:113 (Ersetzung) → knowledge-quest-flow.js:149 (Hülle) → sek-b-klarheit.js:206 (Hülle) |
| `notiz` | 4 | erzwelt-core.html:869 (Definition) → tutorial-enhance.js:223 (Hülle) → premium-spielgefuehl.js:206 (Hülle) → stil.js:55 (Hülle) |
| `schwierigkeitZeigen` | 4 | erzwelt-core.html:4050 (Definition) → sek-b-klarheit.js:29 (Ersetzung) → stil.js:61 (Hülle) → spielstaende.js:439 (Hülle) |
| `seiteFuellen` | 4 | erzwelt-core.html:3724 (Definition) → performance-pass.js:203 (Hülle) → abschluss-zertifikat.js:188 (Hülle) → kurztexte.js:74 (Hülle) |
| `seiteZiel` | 4 | erzwelt-core.html:3867 (Definition) → abschluss-zertifikat.js:183 (Hülle) → logik-fixes.js:173 (Hülle) → ziel-positiv.js:64 (Hülle) |
| `tutorialPruefen` | 4 | erzwelt-core.html:3182 (Definition) → tutorial-enhance.js:208 (Hülle) → erfolg-feier.js:102 (Hülle) → einfuehrung.js:218 (Hülle) |
| `ansichtAnwenden` | 3 | erzwelt-core.html:2934 (Definition) → performance-pass.js:113 (Ersetzung) → sek-b-klarheit.js:284 (Hülle) |
| `dockZeichnen` | 3 | erzwelt-core.html:3225 (Definition) → performance-pass.js:144 (Hülle) → karte-mitte.js:46 (Ersetzung) |
| `einstFuellen` | 3 | erzwelt-core.html:4011 (Definition) → erfolg-feier.js:140 (Hülle) → spielstaende.js:445 (Hülle) |
| `hinweiseSetzen` | 3 | erzwelt-core.html:3420 (Definition) → performance-pass.js:171 (Hülle) → map-focus-navigation.js:256 (Hülle) |
| `szeneRaff` | 3 | erzwelt-core.html:533 (Definition) → transformation-animations.js:103 (Ersetzung) → sek-b-klarheit.js:102 (Hülle) |
| `tempoSetzen` | 3 | erzwelt-core.html:4358 (Definition) → sek-b-klarheit.js:365 (Hülle) → premium-spielgefuehl.js:176 (Hülle) |
| `toastsErneuern` | 3 | erzwelt-core.html:3266 (Definition) → notification-history.js:202 (Hülle) → map-focus-navigation.js:248 (Hülle) |
| `anstellbar` | 2 | erzwelt-core.html:932 (Definition) → einfuehrung.js:309 (Hülle) |
| `beispielKette` | 2 | didactic-should.js:199 (Definition) → performance-pass.js:89 (Hülle) |
| `blattZu` | 2 | erzwelt-core.html:3716 (Definition) → sek-b-klarheit.js:421 (Hülle) |
| `didaktikMigration` | 2 | didactic-model.js:163 (Definition) → performance-pass.js:27 (Hülle) |
| `etappeWeiter` | 2 | erzwelt-core.html:1116 (Definition) → logik-fixes.js:59 (Hülle) |
| `gesperrt` | 2 | erzwelt-core.html:3173 (Definition) → einfuehrung.js:233 (Hülle) |
| `ikonLohn` | 2 | erzwelt-core.html:412 (Definition) → didactic-model.js:67 (Ersetzung) |
| `lieferwegZeichnen` | 2 | didactic-should.js:212 (Definition) → performance-pass.js:100 (Hülle) |
| `marktBewegen` | 2 | erzwelt-core.html:1109 (Definition) → didactic-model.js:184 (Ersetzung) |
| `matPreis` | 2 | erzwelt-core.html:966 (Definition) → didactic-model.js:185 (Ersetzung) |
| `mineErlaubt` | 2 | erzwelt-core.html:3166 (Definition) → einfuehrung.js:228 (Hülle) |
| `neuerZustand` | 2 | erzwelt-core.html:823 (Definition) → einfuehrung.js:200 (Hülle) |
| `pinFeiern` | 2 | erzwelt-core.html:2996 (Definition) → construction-visibility.js:172 (Hülle) |
| `produktBuchen` | 2 | erzwelt-core.html:861 (Definition) → produktentdeckungen.js:17 (Hülle) |
| `rufAnpassen` | 2 | erzwelt-core.html:1100 (Definition) → didactic-model.js:188 (Ersetzung) |
| `rundeBeenden` | 2 | erzwelt-core.html:1129 (Definition) → logik-fixes.js:64 (Ersetzung) |
| `seiteWissen` | 2 | erzwelt-core.html:3904 (Definition) → stil.js:75 (Hülle) |
| `shouldMigration` | 2 | didactic-should.js:34 (Definition) → performance-pass.js:38 (Hülle) |
| `slotSpeichern` | 2 | erzwelt-core.html:4367 (Definition) → spielstaende.js:116 (Ersetzung) |
| `speichern` | 2 | erzwelt-core.html:4368 (Definition) → performance-pass.js:61 (Hülle) |
| `szeneFabrik` | 2 | erzwelt-core.html:562 (Definition) → transformation-animations.js:118 (Ersetzung) |
| `tagVor` | 2 | erzwelt-core.html:1010 (Definition) → didactic-should.js:151 (Ersetzung) |
| `wareVerkaufen` | 2 | erzwelt-core.html:948 (Definition) → premium-spielgefuehl.js:228 (Hülle) |
| `wissenPraxis` | 2 | didactic-should.js:39 (Definition) → knowledge-quest-flow.js:133 (Ersetzung) |
| `zuruecksetzen` | 2 | erzwelt-core.html:4394 (Definition) → spielstaende.js:408 (Ersetzung) |

## Pro Datei

| Datei | neu zugewiesene Funktionen |
|---|---|
| didactic-model.js | `ikonLohn`, `marktBewegen`, `matPreis`, `rufAnpassen` |
| didactic-ui.js | `zeichnen`, `seiteMarkt` |
| didactic-should.js | `zeichnen`, `questZeichnen`, `lupeFuellen`, `naechsterSchritt`, `tagVor` |
| didactic-transport.js | `zeichnen` |
| performance-pass.js | `questZeichnen`, `blattFuellen`, `pinsZeichnen`, `seiteFuellen`, `ansichtAnwenden`, `dockZeichnen`, `hinweiseSetzen`, `beispielKette`, `didaktikMigration`, `lieferwegZeichnen`, `shouldMigration`, `speichern` |
| transformation-animations.js | `zeichnen`, `szeneRaff`, `szeneFabrik` |
| transformation-enhance.js | `zeichnen` |
| tutorial-enhance.js | `questZeichnen`, `notiz`, `tutorialPruefen` |
| construction-visibility.js | `zeichnen`, `pinFeiern` |
| premium-animation-treatment.js | `zeichnen` |
| premium-animation-treatment-v2.js | `zeichnen` |
| notification-history.js | `dialogZeigen`, `toastsErneuern` |
| stop-safety-visual.js | `zeichnen`, `blattFuellen` |
| map-focus-navigation.js | `questZeichnen`, `hinweiseSetzen`, `toastsErneuern` |
| knowledge-quest-flow.js | `questZeichnen`, `naechsterSchritt`, `wissenPraxis` |
| objective-guide.js | `questZeichnen` |
| abschluss-zertifikat.js | `dialogZeigen`, `seiteFuellen`, `seiteZiel` |
| logik-fixes.js | `blattMine`, `seiteZiel`, `etappeWeiter`, `rundeBeenden` |
| sek-b-klarheit.js | `zeichnen`, `questZeichnen`, `blattFuellen`, `blattMine`, `blattRaff`, `seiteMarkt`, `seiteTeam`, `blattFab`, `lupeFuellen`, `naechsterSchritt`, `schwierigkeitZeigen`, `ansichtAnwenden`, `szeneRaff`, `tempoSetzen`, `blattZu` |
| handy-layout.js | `questZeichnen`, `pinsZeichnen` |
| erfolg-feier.js | `questZeichnen`, `tutorialPruefen`, `einstFuellen` |
| premium-spielgefuehl.js | `zeichnen`, `questZeichnen`, `pinsZeichnen`, `notiz`, `tempoSetzen`, `wareVerkaufen` |
| kurztexte.js | `blattFuellen`, `seiteFuellen` |
| belegschaft-regler.js | `blattFuellen`, `blattMine`, `blattRaff`, `seiteMarkt`, `seiteTeam`, `blattFab` |
| einfuehrung.js | `zeichnen`, `blattMine`, `pinsZeichnen`, `blattRaff`, `seiteTeam`, `blattFab`, `lupeFuellen`, `tutorialPruefen`, `anstellbar`, `gesperrt`, `mineErlaubt`, `neuerZustand` |
| aufgabe-kompakt.js | `questZeichnen` |
| ziel-positiv.js | `seiteZiel` |
| stil.js | `blattMine`, `blattRaff`, `seiteMarkt`, `seiteTeam`, `notiz`, `schwierigkeitZeigen`, `seiteWissen` |
| produktentdeckungen.js | `produktBuchen` |
| spielstaende.js | `dialogZeigen`, `schwierigkeitZeigen`, `einstFuellen`, `slotSpeichern`, `zuruecksetzen` |
| karte-mitte.js | `zeichnen`, `pinsZeichnen`, `dockZeichnen` |
| blatt-ordnung.js | `blattFuellen` |

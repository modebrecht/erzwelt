# Texte in `texte.de.js`

Sichtbare Texte stehen als Schlüssel → Text in `texte.de.js` (990 Einträge) und werden
mit `textVon(schluessel, werte)` geholt. Platzhalter heissen `{name}` bzw. bei
umgestellten Template-Texten `{p1}`, `{p2}` … in der Reihenfolge im Code.

`texte.de.js` wird beim Bauen vor dem Spielskript eingebettet (nicht mehr als Patch),
damit auch `erzwelt-core.html` seine Texte daraus holt.

## Wie umgestellt wurde

Hauptmenü, Spielstände, Intro, Bonus, Landschaft und Tiere sind von Hand benannt
(`menue.…`, `slot.…`, `bonus.…`). Den Rest hat `scripts/texte_migration.py`
umgestellt: Jede Zeichenkette mit sichtbarem deutschem Text wird zu
`textVon("datei.erste-woerter")`; der Text wird **roh** übernommen, damit `textVon`
zeichengenau dasselbe liefert. Nicht umgestellt werden Vergleiche
(`=== "…"`, `startsWith("…")`), Selektoren, Objektschlüssel, `case`-Marken,
CSS, Klassen- und Schrittnamen, Gebietsschemas (`"de-CH"`).
`scripts/texte_zurueck.py <schluessel>` macht einen Eintrag rückgängig.

Geprüft mit dem Prüfstand: 490 Zustände ohne Unterschied (ausser dem bewusst
geänderten Text am Ende der Einführung), E2E-Tests grün.

## Was noch nicht in `texte.de.js` steht

- **Feste HTML-Texte im Kern** (rund 20): Kopfleiste «Kasse», «Tag», Knopf-Beschriftungen
  wie «Pause», «Einstellungen», «Näher», «Weiter weg», der Seitentitel. Sie stehen im
  HTML vor dem Skript; für eine zweite Sprache bräuchten sie ein `data-text`-Attribut,
  das beim Start ersetzt wird.
- **Inhaltsdateien:** `karteninfo-daten.js` (Ortsinfos) und die Tiernamen in
  `karten-tiere.js` sind schon eigene Datenblöcke. Für eine zweite Sprache am besten
  als eigene Datei je Sprache (z. B. `karteninfo.fr.js`).
- **Vergleichstexte:** Stellen, an denen Code einen Text vergleicht (z. B.
  `art.textContent === "Wissen freigeschaltet"`), sind bewusst Literale geblieben.
  Bei einer Übersetzung müssen sie mitgezogen werden – besser wäre dann ein
  Vergleich über den Schlüssel.
- **Schlüsselnamen** der automatisch umgestellten Texte sind aus den ersten Wörtern
  gebildet (`sekbklarheit.lohnkosten-im-spielmodell`). Sie sind eindeutig, aber nicht
  schön; Umbenennen geht jederzeit, wenn Code und `texte.de.js` gleich geändert werden.

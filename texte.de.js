"use strict";
/* ============================================================
   TEXTE (Deutsch)

   Sichtbare Texte als Schlüssel → Text. Platzhalter in geschweiften Klammern
   ({name}) ersetzt textVon(schluessel, {name: …}). Fehlt ein Schlüssel,
   bricht textVon mit einem Fehler ab, damit kein leerer Text erscheint.

   Stand: Hauptmenü, Spielstände und Bilder-Intro (spielstaende.js,
   spielstaende-daten.js, bilder-intro.js). Die übrigen Texte
   stehen noch in erzwelt-core.html und den Patch-Dateien
   (siehe docs/texte-offen.md).
   ============================================================ */
const TEXTE_DE = Object.freeze({
  /* ---------- Hauptmenü ---------- */
  "menue.titel": "Erzwelt",
  "menue.fortsetzen": "Spiel fortsetzen",
  "menue.neu": "Neues Spiel",
  "menue.spielstaende": "Spielstände",
  "menue.import": "JSON importieren",
  "menue.zurueck": "Zum Hauptmenü",
  "menue.titelNeu": "Speicherplatz wählen",
  "menue.titelVerwalten": "Spielstände",
  "menue.titelImport": "Spielstand importieren",
  "menue.empfohlen": "Empfohlen · freier Speicherplatz {id}",
  "menue.hierImportieren": "Hier importieren",
  "menue.importUeberschreiben": "Mit Import überschreiben",
  "menue.hierStarten": "Hier starten",
  "menue.neuUeberschreiben": "Mit neuem Spiel überschreiben",
  "menue.nurSitzung": "Nur für diese Sitzung gespeichert. Sichere deine Spielstände als JSON-Datei.",
  "menue.zuletzt": "{name} · {schwierigkeit} · Tag {tag}",

  /* ---------- Speicherplätze ---------- */
  "slot.schwierigkeitOffen": "Schwierigkeit offen",
  "slot.insolvent": "Insolvent",
  "slot.zielErreicht": "Etappenziel erreicht",
  "slot.etappeBeendet": "Etappe beendet",
  "slot.laeuft": "Läuft",
  "slot.spielstart": "Spielstart",
  "slot.beschreibung": "{schwierigkeit} · Tag {tag} · Etappe {etappe} · {kasse} · {status}",
  "slot.kopf": "{id} · {name}",
  "slot.frei": "Freier Speicherplatz",
  "slot.beschaedigt": "Beschädigter Spielstand",
  "slot.leer": "Leer",
  "slot.zuletztGespeichert": "Zuletzt gespeichert {zeit} (Ortszeit)",
  "slot.fortsetzen": "Fortsetzen",
  "slot.umbenennen": "Umbenennen",
  "slot.exportieren": "Exportieren",
  "slot.neu": "Neues Spiel",
  "slot.loeschen": "Löschen",
  "slot.nichtMehrVerfuegbar": "Der Spielstand ist inzwischen nicht mehr verfügbar.",
  "slot.nichtVerfuegbar": "Der Spielstand ist nicht verfügbar.",
  "slot.nichtGeladen": "Der Spielstand konnte nicht geladen werden.",
  "slot.ueberschreibenFrage": "«{name}» auf Speicherplatz {id} überschreiben?",
  "slot.loeschenFrage": "«{name}» auf Speicherplatz {id} unwiderruflich löschen?",
  "slot.neuerName": "Neuer Name für «{name}»",
  "slot.umbenannt": "Spielstand umbenannt.",
  "slot.geaendert": "Der Speicherplatz wurde inzwischen geändert.",
  "slot.geloescht": "Spielstand gelöscht.",
  "slot.nichtGeloescht": "Der Spielstand konnte nicht gelöscht werden.",
  "slot.importiert": "Spielstand importiert.",
  "slot.jetztFortsetzen": "Jetzt fortsetzen",
  "slot.aktiv": "{name} · Tag {tag}",

  /* ---------- Import, Speichern ---------- */
  "datei.zuGross": "Die Datei ist grösser als 1 MB.",
  "datei.keinUtf8": "Die Datei muss als UTF-8-JSON gespeichert sein.",
  "speichern.autosaveFehler": "Autosave fehlgeschlagen. Exportiere den Spielstand in den Einstellungen.",
  "speichern.nurSitzung": "Nur für diese Sitzung gespeichert.",
  "speichern.nurSitzungExport": "Nur für diese Sitzung gespeichert. Exportiere eine JSON-Sicherung für später.",
  "speichern.nichtGesichert": "Der aktuelle Fortschritt konnte nicht im Browser gespeichert werden. Exportiere ihn vor dem Verlassen. ",
  "speichern.menue": "Speichern & zum Hauptmenü",
  "speichern.export": "Spielstand exportieren",
  "speichern.zuGross": "Der Spielstand ist zu gross für den Speicherplatz.",
  "speichern.nichtGeprueft": "Die Speicherung konnte nicht überprüft werden.",
  "speichern.nichtGesichertPlatz": "Speicherplatz konnte nicht gesichert werden. ",
  "slot.standardname": "Spielstand {id}",
  "daten.ungueltig": "Ungültige Spielstanddaten ({feld}).",
  "datei.keinJson": "Die Datei enthält kein gültiges JSON.",
  "datei.version": "Diese Version der Spielstanddatei wird nicht unterstützt.",

  /* ---------- Übernahme alter Spielstände ---------- */
  "alt.beschaedigt": "Ein alter Spielstand ist beschädigt. Das Original wurde behalten.",
  "alt.keinPlatz": "Ein alter Spielstand ist noch vorhanden. Für die Übernahme braucht es einen freien Speicherplatz.",
  "alt.teilweise": "Der lesbare alte Spielstand wurde übernommen. Die alten Daten wurden behalten.",
  "alt.uebernommen": "Dein bisheriger Spielstand wurde übernommen. Das Original bleibt als Sicherung im Browser.",
  "alt.fehler": "Der alte Spielstand konnte nicht übernommen werden. Die bisherigen Daten wurden behalten.",

  /* ---------- Bilder-Intro ---------- */
  "intro.titel": "Erzwelt · Intro",
  "intro.laedt": "Intro wird geladen …",
  "intro.navigation": "Einführung",
  "intro.zurueck": "Zurück",
  "intro.ueberspringen": "Überspringen",
  "intro.weiter": "Weiter",
  "intro.gruenden": "Firma gründen",
  "intro.schliessen": "Schliessen",

  /* ---------- Landschaft auf der Karte ---------- */
  "landschaft.titel": "Landschaft auf der Karte",
  "landschaft.hilfe": "Wälder, Schnee, Wüsten, Dschungel und Gebirge. Aus = schlichte Karte.",
  "landschaft.aus": "aus",
  "landschaft.leicht": "leicht",
  "landschaft.voll": "voll",
  "wellen.titel": "Meereswellen",
  "wellen.hilfe": "Leichte Wellen auf dem Ozean. Mit Animationen «Aus» stehen sie still.",
  "wellen.an": "an",
  "wellen.aus": "aus",

  /* ---------- Tiere auf der Karte ---------- */
  "tiere.antippen": "{tier} ({ort}) antippen: Bonus",
  "tiere.gefunden": "{zeichen} <b>{tier}</b> entdeckt ({ort}) · Bonus +{betrag}."
});

function textVon(schluessel, werte){
  const text = TEXTE_DE[schluessel];
  if (text === undefined) throw new Error("Text fehlt: " + schluessel);
  return werte ? text.replace(/\{(\w+)\}/g, (_, k) => String(werte[k])) : text;
}

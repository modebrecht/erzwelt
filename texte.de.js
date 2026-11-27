"use strict";
/* ============================================================
   TEXTE (Deutsch)

   Sichtbare Texte als Schlüssel → Text. Platzhalter in geschweiften Klammern
   ({name}) ersetzt textVon(schluessel, {name: …}). Fehlt ein Schlüssel,
   bricht textVon mit einem Fehler ab, damit kein leerer Text erscheint.

   Beim Bauen vor dem Spielskript eingebettet (scripts/build-standalone.mjs).
   Oben von Hand benannte Bereiche, danach je Datei die mit
   scripts/texte_migration.py umgestellten Texte (roh übernommen).
   Was noch fehlt: docs/texte-offen.md.
   ============================================================ */
const TEXTE_DE = Object.freeze({
  /* ---------- Hauptmenü ---------- */
  "menue.titel": "Erzwelt",
  "menue.fortsetzen": "Spiel fortsetzen",
  "menue.neu": "Neues Spiel",
  "menue.spielstaende": "Spielstände",
  "menue.import": "Spielstand-Datei laden",
  "menue.audio": "Audio",
  "menue.zurueck": "Zum Hauptmenü",
  "menue.titelNeu": "Speicherplatz wählen",
  "menue.titelVerwalten": "Spielstände",
  "menue.titelImport": "Spielstand importieren",
  "menue.empfohlen": "Empfohlen · freier Speicherplatz {id}",
  "menue.hierImportieren": "Hier importieren",
  "menue.importUeberschreiben": "Mit Import überschreiben",
  "menue.hierStarten": "Hier starten",
  "menue.neuUeberschreiben": "Mit neuem Spiel überschreiben",
  "menue.nurSitzung": "Nur für diese Sitzung gespeichert. Exportiere deine Spielstände als Datei.",
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
  "speichern.autosaveFehler": "Automatisches Speichern hat nicht geklappt. Exportiere den Spielstand in den Einstellungen.",
  "speichern.nurSitzung": "Nur für diese Sitzung gespeichert.",
  "speichern.nurSitzungExport": "Nur für diese Sitzung gespeichert. Exportiere eine Sicherungsdatei für später.",
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

  /* ---------- Hilfe nach verfehltem Ziel auf Einfach ---------- */
  "bonus.frage": "Möchtest du neu starten? Du kannst mehr Verkaufserlös wählen.",
  "bonus.frageEtappe": "Oder starte neu – auf Wunsch mit mehr Verkaufserlös.",
  "bonus.rundeOhne": "Neue Runde · Verkauf +20 %",
  "bonus.rundeOhneKlein": "Von vorn auf Einfach, wie bisher",
  "bonus.rundeMit": "Neue Runde · Verkauf +{prozent} %",
  "bonus.rundeMitKlein": "Von vorn auf Einfach, mit Bonus (steht im Zertifikat)",
  "bonus.gestartetOhne": "Neue Runde auf <b>Einfach</b> · Verkaufserlöse +20 %.",
  "bonus.gestartetMit": "✨ Neue Runde auf <b>Einfach</b> mit Bonus · Verkaufserlöse +{prozent} %.",

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

  /* ---------- Einführung ---------- */
  "tutorial.freigeschaltet": "Jetzt frei: alle Standorte, alle Produkte und der Ausbau von Rohstoffquellen und Raffinerien.",

  /* ---------- Tiere auf der Karte ---------- */
  "tiere.antippen": "{tier} ({ort}) antippen: Bonus",
  "tiere.gefunden": "{zeichen} <b>{tier}</b> entdeckt ({ort}) · Bonus +{betrag}.",
  "tiere.neuImAlbum": "Neu im Tieralbum ({anzahl}/{gesamt}).",
  "tiere.albumTitel": "Tieralbum",
  "tiere.albumStand": "{anzahl} von {gesamt} Tieren entdeckt. Tiere tauchen etwa alle drei Minuten auf der Karte auf.",
  "tiere.albumOffen": "noch nicht entdeckt",
  "monatsuebersicht.titel": "Monatsübersicht",
  "monatsuebersicht.oeffnen": "Monatsübersicht: Einnahmen und Ausgaben pro Monat",
  "monatsuebersicht.stand": "Tag {tag} · Monat {monat}, Tag {imMonat} von 30",
  "monatsuebersicht.spMonat": "Monat",
  "monatsuebersicht.spEin": "Einnahmen",
  "monatsuebersicht.spBetrieb": "Löhne + Betrieb",
  "monatsuebersicht.spInvest": "Investiert",
  "monatsuebersicht.spErgebnis": "Ergebnis",
  "monatsuebersicht.laufend": "{monat} (bisher)",
  "monatsuebersicht.monat": "{monat}",
  "monatsuebersicht.hinweisAb": "Die Tabelle wird seit Monat {monat} geführt. Frühere Monate sind nicht aufgezeichnet.",
  "monatsuebersicht.erklaerung": "Ergebnis = Einnahmen − Löhne und Betrieb − Investiert. Löhne und Betrieb bezahlst du am Monatsende. Investiert: Bauen, Ausbauen, Anstellen, Wissen, Forschung und Entscheide.",
  "monatsuebersicht.gesamtTitel": "Seit Spielstart",
  "monatsuebersicht.gesamt": "Einnahmen {ein} · Ausgaben {aus} · Gewinn {gewinn}",
  /* ---------- Wissens-Quiz (wissen-quiz.js) ---------- */
  "quiz.titel": "Kurze Frage",
  "quiz.einleitung": "Beantworte die Frage richtig, dann kannst du die Verbesserungen in diesem Feld finanzieren. Richtig beim ersten Versuch: 20 % Rabatt.",
  "quiz.falsch": "Leider falsch. Lies den Text oben nochmals und versuch es erneut – den Rabatt gibt es jetzt nicht mehr.",
  "quiz.sofort": "Richtig beim ersten Versuch! Die Verbesserungen in diesem Feld kosten 20 % weniger.",
  "quiz.spaeter": "Richtig! Die Verbesserungen in diesem Feld sind jetzt freigeschaltet.",
  "quiz.zuerst": "Zuerst die Frage oben beantworten",
  "quiz.rabatt": "−20 %",
  "quiz.kette.frage": "Was passiert, wenn in der Lieferkette eine Station fehlt?",
  "quiz.kette.a1": "Die Fabrik kauft das fehlende Material einfach zu.",
  "quiz.kette.a2": "Die nächste Station kann nicht weiterarbeiten.",
  "quiz.kette.a3": "Die Kette läuft gleich weiter, nur etwas langsamer.",
  "quiz.kette.a4": "Der Markt liefert den Rohstoff nach.",
  "quiz.geologie.frage": "Warum liegen Rohstoffquellen in verschiedenen Ländern?",
  "quiz.geologie.a1": "Weil Rohstoffe überall gleich verteilt sind.",
  "quiz.geologie.a2": "Weil dort die Raffinerien stehen.",
  "quiz.geologie.a3": "Weil nicht jeder Rohstoff überall vorkommt.",
  "quiz.geologie.a4": "Weil Firmen dort günstiger bauen dürfen.",
  "quiz.leute.frage": "Was senkt im Spiel das Unfallrisiko in einer Rohstoffquelle?",
  "quiz.leute.a1": "Sicherheitsmassnahmen",
  "quiz.leute.a2": "Ein höherer Lohn",
  "quiz.leute.a3": "Mehr Personal",
  "quiz.leute.a4": "Ein guter Ruf",
  "quiz.chemie.frage": "Was macht eine Raffinerie?",
  "quiz.chemie.a1": "Sie baut aus Material ein fertiges Produkt.",
  "quiz.chemie.a2": "Sie fördert Erz aus dem Boden.",
  "quiz.chemie.a3": "Sie verkauft Material an andere Firmen.",
  "quiz.chemie.a4": "Sie verarbeitet Rohstoff zu nutzbarem Material.",
  "quiz.fabrik.frage": "Was passiert, wenn einer Fabrik ein Material fehlt?",
  "quiz.fabrik.a1": "Sie baut das Produkt ohne dieses Material.",
  "quiz.fabrik.a2": "Die Produktion stoppt.",
  "quiz.fabrik.a3": "Das Material wird automatisch gekauft.",
  "quiz.fabrik.a4": "Sie produziert dafür doppelt so schnell.",
  "quiz.markt.frage": "Was kann passieren, wenn dein Lager sehr gross wird?",
  "quiz.markt.a1": "Der Verkaufspreis steigt.",
  "quiz.markt.a2": "Die Nachfrage verdoppelt sich.",
  "quiz.markt.a3": "Der Verkaufspreis sinkt.",
  "quiz.markt.a4": "Die Ware wird automatisch verschenkt.",
  "quiz.ruf.frage": "Was zeigt ein Herkunftsnachweis?",
  "quiz.ruf.a1": "Ob die Herkunft der Rohstoffe dokumentiert ist.",
  "quiz.ruf.a2": "Wie beliebt deine Firma ist.",
  "quiz.ruf.a3": "Wie viel deine Leute verdienen.",
  "quiz.ruf.a4": "Wie viel du schon verkauft hast.",
  "quiz.modell.frage": "Was stimmt für die Zahlen in Erzwelt?",
  "quiz.modell.a1": "Es sind genaue Zahlen von echten Firmen.",
  "quiz.modell.a2": "Sie gelten für jedes Land gleich.",
  "quiz.modell.a3": "Sie stammen aus der Zeitung von heute.",
  "quiz.modell.a4": "Es sind vereinfachte Spielwerte, keine aktuellen Statistiken.",
  /* ---------- Geschichte (geschichte.js) ---------- */
  "geschichte.titel": "Geschichte der Rohstoffe",
  "geschichte.unter": "Neun Kapitel, von Ötzi bis heute. Lies und beantworte die Frage: Richtig beim ersten Versuch gibt {betrag} für deine Firma.",
  "geschichte.stand": "{n} von {gesamt} Kapiteln gelesen",
  "geschichte.offen": "Belohnung {betrag}",
  "geschichte.gelesen": "Gelesen",
  "geschichte.frageTitel": "Frage zum Kapitel",
  "geschichte.einleitung": "Richtig beim ersten Versuch: {betrag} für deine Firma.",
  "geschichte.falsch": "Leider falsch. Lies den Text nochmals – die Belohnung gibt es jetzt nicht mehr.",
  "geschichte.sofort": "Richtig beim ersten Versuch! {betrag} gehen an deine Firma.",
  "geschichte.spaeter": "Richtig! Kapitel gelesen.",
  "geschichte.belohnung": "Geschichte «{kapitel}» richtig beantwortet · Belohnung <b>+{betrag}</b>.",
  "geschichte.kapitelNr": "Kapitel {nr}",
  "geschichte.bild.oetzi": "Kupferbeil · Alpen",
  "geschichte.bild.bronzeWeg": "Hunderte Kilometer Handelsweg",
  "geschichte.bild.bronzeKupfer": "Kupfer",
  "geschichte.bild.bronzeZinn": "Zinn",
  "geschichte.bild.bronze": "Kupfer + Zinn = Bronzebeil",
  "geschichte.bild.eisen": "Schmieden: Eisen wird hart und zäh",
  "geschichte.bild.gold": "Gold und Silber werden zu Münzen",
  "geschichte.bild.potosi": "Cerro Rico: Silber, Stollen, Zwangsarbeit",
  "geschichte.bild.kongo": "Kautschuk → Kupfer → Kobalt für Akkus",
  "geschichte.bild.seltenUsa": "USA",
  "geschichte.bild.seltenChina": "China",
  "geschichte.bild.selten": "Magnete aus Seltenen Erden",
  "geschichte.bild.schweiz": "Abstimmung 2020: Volk Ja, Kantone Nein",
  "geschichte.oetzi.titel": "Ötzi und das erste Kupfer",
  "geschichte.oetzi.zeit": "um 3300 v. Chr.",
  "geschichte.oetzi.t1": "1991 wurde in den Ötztaler Alpen eine Gletschermumie gefunden: Ötzi. Er lebte vor über 5000 Jahren und trug ein Beil mit einer Klinge aus Kupfer.",
  "geschichte.oetzi.t2": "Kupfer war damals ein neuer Werkstoff: Man konnte es schmelzen und in Formen giessen. Das Kupfer von Ötzis Beil stammt aus der Toskana in Italien – Hunderte Kilometer entfernt.",
  "geschichte.oetzi.t3": "Schon damals wurden Rohstoffe über weite Strecken und über die Alpen gehandelt. Das ist ein frühes Beispiel für eine Lieferkette.",
  "geschichte.oetzi.frage": "Woher stammte das Kupfer von Ötzis Beil?",
  "geschichte.oetzi.a1": "Aus dem Gletscher, in dem man ihn fand",
  "geschichte.oetzi.a2": "Aus der Toskana in Italien",
  "geschichte.oetzi.a3": "Aus China",
  "geschichte.oetzi.a4": "Aus dem Kongo",
  "geschichte.bronze.titel": "Bronze: die erste lange Lieferkette",
  "geschichte.bronze.zeit": "2200 bis 800 v. Chr.",
  "geschichte.bronze.t1": "Mischt man Kupfer mit etwas Zinn, entsteht Bronze. Sie ist härter als reines Kupfer. Darum heisst die Zeit von etwa 2200 bis 800 v. Chr. bei uns Bronzezeit.",
  "geschichte.bronze.t2": "Kupfer gab es in den Alpen, Zinn aber kaum. Es kam meist von weit her: aus der Bretagne, aus Cornwall in England oder aus Spanien.",
  "geschichte.bronze.t3": "Auch die Pfahlbauer an den Schweizer Seen machten aus Bronze Werkzeuge, Waffen und Schmuck. Im Spiel stecken dieselben zwei Metalle im Ladekabel: Kupfer und Zinn.",
  "geschichte.bronze.frage": "Welche zwei Metalle ergeben zusammen Bronze?",
  "geschichte.bronze.a1": "Eisen und Gold",
  "geschichte.bronze.a2": "Silber und Aluminium",
  "geschichte.bronze.a3": "Kupfer und Zinn",
  "geschichte.bronze.a4": "Gold und Silber",
  "geschichte.eisen.titel": "Eisen: das Metall für den Alltag",
  "geschichte.eisen.zeit": "ab 800 v. Chr.",
  "geschichte.eisen.t1": "Ab etwa 800 v. Chr. setzte sich bei uns das Eisen durch – die Eisenzeit beginnt. Eine berühmte Fundstelle der Kelten ist La Tène am Neuenburgersee.",
  "geschichte.eisen.t2": "Eisenerz gibt es an viel mehr Orten als Zinn. Man brauchte also kein Zinn mehr von weit her, und der alte Fernhandel mit Kupfer und Zinn verlor an Bedeutung.",
  "geschichte.eisen.t3": "Geschmiedetes Eisen ist härter und zäher als Bronze. Daraus entstanden Beile, Sägen, Messer und Geräte für die Landwirtschaft.",
  "geschichte.eisen.frage": "Warum war Eisen ein Vorteil gegenüber Bronze?",
  "geschichte.eisen.a1": "Eisenerz gibt es an vielen Orten – man brauchte kein Zinn von weit her.",
  "geschichte.eisen.a2": "Eisen glänzt schöner als Gold.",
  "geschichte.eisen.a3": "Eisen ist leichter als Holz.",
  "geschichte.eisen.a4": "Eisen muss man nicht aus Erz gewinnen.",
  "geschichte.gold.titel": "Gold und Silber: Geld und Macht",
  "geschichte.gold.zeit": "ab 600 v. Chr.",
  "geschichte.gold.t1": "Gold und Silber glänzen und rosten nicht. Schon im alten Ägypten waren sie Zeichen von Macht und Reichtum.",
  "geschichte.gold.t2": "Im Königreich Lydien (heute Türkei) entstanden im 7. Jahrhundert v. Chr. die ersten Münzen. Sie waren aus Elektron, einer Mischung aus Gold und Silber.",
  "geschichte.gold.t3": "Wer Silberminen hatte, konnte Münzen prägen und Heere bezahlen. Die Römer liessen in Spanien rund 40'000 Sklaven in Silberminen arbeiten – ein Muster, das du später in Potosí wiederfindest.",
  "geschichte.gold.frage": "Woraus bestanden die ersten Münzen in Lydien?",
  "geschichte.gold.a1": "Aus Eisen",
  "geschichte.gold.a2": "Aus Papier",
  "geschichte.gold.a3": "Aus Kupfer und Zinn",
  "geschichte.gold.a4": "Aus Elektron, einer Mischung aus Gold und Silber",
  "geschichte.potosi.titel": "Potosí: Silber für Spanien",
  "geschichte.potosi.zeit": "ab 1545",
  "geschichte.potosi.t1": "1545 fanden die Spanier im Berg Cerro Rico bei Potosí (heute Bolivien) riesige Silbervorkommen. Es war die reichste Silbermine der Geschichte.",
  "geschichte.potosi.t2": "Ab den 1570er-Jahren mussten Männer aus den Dörfern in den Anden dort im Zwangsdienst arbeiten. Dieser Dienst hiess «Mita». Viele wurden krank oder starben, durch Unfälle und durch giftiges Quecksilber.",
  "geschichte.potosi.t3": "Das Silber ging nach Spanien und bezahlte unter anderem Kriege in Europa. Im Spiel kannst du in Potosí noch heute Silber abbauen.",
  "geschichte.potosi.frage": "Wer musste in Potosí im Zwangsdienst «Mita» arbeiten?",
  "geschichte.potosi.a1": "Spanische Soldaten",
  "geschichte.potosi.a2": "Männer aus den Dörfern in den Anden",
  "geschichte.potosi.a3": "Bezahlte Arbeiter aus Europa",
  "geschichte.potosi.a4": "Niemand, die Arbeit machten Maschinen",
  "geschichte.kongo.titel": "Kongo: vom Kautschuk zum Kobalt",
  "geschichte.kongo.zeit": "1885 bis heute",
  "geschichte.kongo.t1": "Von 1885 bis 1908 gehörte der Kongo König Leopold II. von Belgien – als sein Privatbesitz. Die Menschen wurden mit Gewalt gezwungen, Kautschuk für Reifen zu sammeln. Sehr viele starben.",
  "geschichte.kongo.t2": "Danach war der Kongo eine belgische Kolonie. Im Süden, in Katanga, baute eine belgische Firma ab 1906 Kupfer ab. 1960 wurde das Land unabhängig.",
  "geschichte.kongo.t3": "Heute kommt rund 70 % des Kobalts für Akkus aus dem Kongo, ein Teil davon aus Kleinstminen, in denen von Hand gegraben wird.",
  "geschichte.kongo.frage": "Wem gehörte der Kongo von 1885 bis 1908?",
  "geschichte.kongo.a1": "Der Bevölkerung des Kongo",
  "geschichte.kongo.a2": "Grossbritannien",
  "geschichte.kongo.a3": "König Leopold II. von Belgien, als Privatbesitz",
  "geschichte.kongo.a4": "Einer Firma aus den USA",
  "geschichte.selten.titel": "Seltene Erden: von den USA nach China",
  "geschichte.selten.zeit": "1960 bis heute",
  "geschichte.selten.t1": "Von den 1960er- bis in die 1980er-Jahre kamen die meisten Seltenen Erden aus einer einzigen Mine: Mountain Pass in Kalifornien.",
  "geschichte.selten.t2": "Dann förderte China immer mehr und billiger. Mountain Pass musste 2002 schliessen, und China wurde fast der einzige Lieferant.",
  "geschichte.selten.t3": "2010 kürzte China die Ausfuhr stark. Die Preise stiegen, und viele Länder merkten, wie abhängig sie sind. Seither werden auch anderswo wieder Minen und Raffinerien gebaut.",
  "geschichte.selten.frage": "Was geschah 2010, als China die Ausfuhr Seltener Erden stark kürzte?",
  "geschichte.selten.a1": "Die Preise stiegen stark.",
  "geschichte.selten.a2": "Die Preise fielen.",
  "geschichte.selten.a3": "Mountain Pass wurde geschlossen.",
  "geschichte.selten.a4": "Seltene Erden wurden nicht mehr gebraucht.",
  "geschichte.konflikt.titel": "Konfliktmineralien",
  "geschichte.konflikt.zeit": "seit 2010",
  "geschichte.konflikt.t1": "In Kriegsgebieten, zum Beispiel im Osten des Kongo, verdienen bewaffnete Gruppen am Abbau von Zinn, Tantal, Wolfram und Gold mit. Mit dem Geld kaufen sie Waffen.",
  "geschichte.konflikt.t2": "Darum heissen diese vier Rohstoffe «Konfliktmineralien». Sie stecken in fast jedem Handy: Zinn im Lot, Tantal in Kondensatoren, Gold in Kontakten.",
  "geschichte.konflikt.t3": "Seit 2010 in den USA und seit 2021 in der EU müssen bestimmte Firmen prüfen, woher diese Rohstoffe kommen. Im Spiel heisst das: Herkunftsnachweise.",
  "geschichte.konflikt.frage": "Warum heissen Zinn, Tantal, Wolfram und Gold «Konfliktmineralien»?",
  "geschichte.konflikt.a1": "Weil es Streit um ihren Preis gibt.",
  "geschichte.konflikt.a2": "Weil sie besonders selten sind.",
  "geschichte.konflikt.a3": "Weil sie giftig sind.",
  "geschichte.konflikt.a4": "Weil bewaffnete Gruppen an ihrem Abbau mitverdienen.",
  "geschichte.schweiz.titel": "Die Schweiz und die Konzernverantwortung",
  "geschichte.schweiz.zeit": "2020 bis heute",
  "geschichte.schweiz.t1": "Viele grosse Rohstofffirmen haben ihren Sitz in der Schweiz. 2020 stimmte die Schweiz über die Konzernverantwortungsinitiative ab: Firmen sollten haften, wenn sie im Ausland Menschen oder der Umwelt schaden.",
  "geschichte.schweiz.t2": "50,7 % der Stimmenden sagten Ja. Die Mehrheit der Kantone sagte aber Nein – und eine Initiative braucht beides. Darum scheiterte sie.",
  "geschichte.schweiz.t3": "Seit 2022 gilt dafür ein Gegenvorschlag: Grosse Firmen müssen bei Konfliktmineralien und Kinderarbeit genauer hinschauen und darüber berichten.",
  "geschichte.schweiz.frage": "Warum scheiterte die Konzernverantwortungsinitiative 2020?",
  "geschichte.schweiz.a1": "Die Mehrheit der Kantone sagte Nein.",
  "geschichte.schweiz.a2": "Die Mehrheit der Stimmenden sagte Nein.",
  "geschichte.schweiz.a3": "Der Bundesrat hat sie verboten.",
  "geschichte.schweiz.a4": "Es haben zu wenige Leute abgestimmt.",
  "geldhelfer.titel": "Kasse wird knapp",
  "geldhelfer.titelMinus": "Kasse im Minus",
  "geldhelfer.kostenMonat": "Kosten {betrag}/Monat",
  "geldhelfer.einnahmenMonat": "Einnahmen {betrag}/Monat",
  "geldhelfer.reichtNoch": "Reicht noch etwa {monate} Monate.",
  "geldhelfer.mehr": "Mehr dazu",
  "geldhelfer.weniger": "Weniger",
  "geldhelfer.frei": "{n} Personen ohne Aufgabe kosten {kosten}/Monat.",
  "geldhelfer.keineVerkaeufer": "{n} Stück im Lager, aber niemand verkauft sie.",
  "geldhelfer.lagerVoll": "{n} Stück im Lager, dein Team verkauft nur {kraft} pro Tag.",
  "geldhelfer.keineFabrik": "Noch keine Fabrik, also keine Einnahmen.",
  "geldhelfer.fabrikImBau": "Die Fabrik ist noch {tage} Tage im Bau. Bis dahin kommt kein Geld herein.",
  "geldhelfer.fabrikLeer": "Die Fabrik für <b>{name}</b> hat kein Personal.",
  "geldhelfer.fabrikWartet": "Die Fabrik für <b>{name}</b> wartet auf {fehlt}.",
  "geldhelfer.zuVieleKosten": "Deine Kosten sind höher als deine Einnahmen.",
  "geldhelfer.zu.team": "Zum Team",
  "geldhelfer.zu.markt": "Zum Markt",
  "geldhelfer.verstanden": "Verstanden",
  "forschung.bereiche": "Bereiche im Wissen",
  "forschung.reiterWissen": "Wissen & Verbesserungen",
  "forschung.reiterForschung": "Produktentwicklung",
  "forschung.titel": "Produktentwicklung",
  "forschung.einleitung": "Freiwillig. Stell eine Person für die Forschung an und wähle ein Produkt. Sie verbessert es Stufe um Stufe, und mit jeder Stufe verkaufst du es teurer. Du bezahlst ihren Lohn, solange sie angestellt ist.",
  "forschung.nurMittelSchwer": "Produktentwicklung gibt es auf Mittel und Schwer.",
  "forschung.nachEinfuehrung": "Produktentwicklung öffnet sich nach der Einführung.",
  "forschung.stelleTitel": "Forschungsstelle",
  "forschung.stelleOffen": "Die Stelle ist offen. Wen stellst du an?",
  "forschung.forscher.junior": "Junior",
  "forschung.forscher.spezialist": "Spezialistin",
  "forschung.forscher.experte": "Experte",
  "forschung.schafftTier": "Schafft eine Stufe in {tage} Tagen",
  "forschung.lohnMonat": "Lohn: {lohn} pro Monat",
  "forschung.einstellen": "Anstellen",
  "forschung.kuendigen": "Kündigen",
  "forschung.lohnBisher": "Bisher bezahlter Lohn",
  "forschung.lohnHilfe": "Der Lohn läuft jeden Tag, solange die Person angestellt ist, auch wenn es nichts mehr zu erforschen gibt.",
  "forschung.zielUeberschrift": "Forschungsziel",
  "forschung.zielErklaerung": "Woran soll geforscht werden? Ist eine Stufe fertig, geht es automatisch mit der nächsten weiter.",
  "forschung.zielWaehlen": "Forschungsziel wählen",
  "forschung.tier": "Stufe {tier}",
  "forschung.naechstes": "Nächste: Stufe {tier}, +{prozent} % Verkaufspreis",
  "forschung.wirdErforscht": "Wird erforscht: Stufe {tier}",
  "forschung.hoechstesTier": "Höchste Stufe erreicht",
  "forschung.zuerstFabrik": "Zuerst eine Fabrik für dieses Produkt bauen",
  "forschung.zielTitel": "{produkt}: {von} → {nach}",
  "forschung.wirkung": "Danach verkaufst du dieses Produkt {prozent} % teurer als das Original. Die anderen Produkte bleiben gleich.",
  "forschung.stueckpreis": "Preis pro Stück: jetzt → danach",
  "forschung.fortschritt": "Fortschritt der Forschung",
  "forschung.tage": "{tage} / {dauer} Tage",
  "forschung.nochTage": "noch {tage} Tage",
  "forschung.ohneForscher": "Die Stelle ist offen. Ohne Person wird nicht geforscht.",
  "forschung.mehrerloes": "Du verkaufst zurzeit etwa {stueck} Stück pro Tag. Bleibt das so, nimmst du danach etwa {betrag} mehr ein, pro Monat.",
  "forschung.keinAbsatz": "Von diesem Produkt hast du in letzter Zeit nichts verkauft. Ohne Verkauf bringt die Forschung nichts.",
  "forschung.keinGewinn": "Das ist nur eine Schätzung: Verkaufst du weniger, bringt es auch weniger.",
  "forschung.automatischWeiter": "Danach geht es automatisch mit Stufe {tier} weiter.",
  "forschung.keinZiel": "Wähle ein Produkt, für das du schon eine Fabrik hast.",
  "forschung.zielFertig": "Dieses Produkt hat die höchste Stufe. Wähle ein neues Ziel, sonst bezahlst du Lohn ohne Forschung.",
  "forschung.meldungEingestellt": "Forschung: <b>{name}</b> angestellt ({lohn} pro Monat).",
  "forschung.meldungWechsel": "Forschung: <b>{name}</b> übernimmt die Stelle ({lohn} pro Monat).",
  "forschung.meldungGekuendigt": "Forschung: {name} gekündigt. Die Stelle ist offen.",
  "forschung.meldungFertigWeiter": "Forschung abgeschlossen! <b>{produkt}</b> ist jetzt auf Stufe {tier}: +{prozent} % Verkaufspreis. Es geht weiter mit Stufe {naechstes}.",
  "forschung.meldungFertigMax": "Forschung abgeschlossen! <b>{produkt}</b> ist jetzt auf Stufe {tier}: +{prozent} % Verkaufspreis. Das ist die höchste Stufe – wähle ein neues Forschungsziel.",

  /* ---------- didactic-model.js ---------- */
  "didacticmodel.kupfererz": "Kupfererz",
  "didacticmodel.bauxit": "Bauxit",
  "didacticmodel.quarz-rohsilizium": "Quarz / Rohsilizium",
  "didacticmodel.zinnerz-kassiterit": "Zinnerz (Kassiterit)",
  "didacticmodel.nickelerz": "Nickelerz",
  "didacticmodel.lithiumerz-sole": "Lithiumerz / Sole",
  "didacticmodel.kupfer-kobalterz": "Kupfer-/Kobalterz",
  "didacticmodel.silbererz": "Silbererz",
  "didacticmodel.erz-mit-seltenen-erden": "Erz mit Seltenen Erden",
  "didacticmodel.coltan": "Coltan",
  "didacticmodel.zinkerz-indium-als-nebenprodukt": "Zinkerz (Indium als Nebenprodukt)",
  "didacticmodel.golderz": "Golderz",
  "didacticmodel.quarz-rohsilizium-2": "Quarz → Rohsilizium",
  "didacticmodel.quarz-spielmodell": "Quarz (Spielmodell)",
  "didacticmodel.lithiumerz-spodumen": "Lithiumerz (Spodumen)",
  "didacticmodel.lithium-sole": "Lithium-Sole",
  "didacticmodel.rohstoff": "Rohstoff",
  "didacticmodel.deutlich-ueber-ueblichem-lohn": "deutlich über üblichem Lohn",
  "didacticmodel.menschen-loehne-sicherheit": "Menschen, Löhne & Sicherheit",
  "didacticmodel.sicherheit-ist-separat-schutz": "<b>Sicherheit ist separat:</b> Schutz, Ausrüstung und Schulung senken das Unfallrisiko. Ein hoher Lohn ersetzt keine Sicherheitsmassnahmen – und gute Sicherheit ersetzt keinen fairen Lohn.",
  "didacticmodel.sicherheitsmassnahmen-wie-geeignete-ausruestung": "Sicherheitsmassnahmen wie geeignete Ausrüstung, Schulung und klare Arbeitsabläufe können Unfallrisiken senken.",
  "didacticmodel.im-spiel-beeinflusst-die": "Im Spiel beeinflusst die Zufriedenheit die Förderleistung. Die Stärke dieses Effekts ist eine vereinfachte Spielregel.",
  "didacticmodel.sicherheitsprogramm": "Sicherheitsprogramm",
  "didacticmodel.ein-gemeinsamer-standard-macht": "Ein gemeinsamer Standard macht Sicherheitsausbauten in deinen Rohstoffquellen einfacher und günstiger.",
  "didacticmodel.sicherheitsausbau-kosten": "Sicherheitsausbau −50 % Kosten",
  "didacticmodel.fertige-produkte-muessen-verkauft": "Fertige Produkte müssen verkauft werden. Entweder du verkaufst selber, oder dein Verkaufsteam erledigt das jeden Tag.",
  "didacticmodel.das-spiel-simuliert-preis": "Das Spiel simuliert Preis und Nachfrage deiner <b>Fertigwaren</b>. Weltmarktpreise der Rohstoffe sind Hintergrundwissen – du kaufst und verkaufst im Spiel keine Rohstoffe am Markt.",
  "didacticmodel.ruf-nachweise": "Ruf & Nachweise",
  "didacticmodel.nachweise-sind-etwas-anderes": "<b>Nachweise</b> sind etwas anderes: Sie zeigen, ob du die Herkunft deiner Rohstoffe dokumentieren kannst. Ein Lieferkettengesetz prüft diese Nachweise – nicht deinen Ruf.",
  "didacticmodel.erzwelt-ist-ein-spielmodell": "Erzwelt ist ein <b>Spielmodell</b>. Mengen, Kosten, Löhne und Rezepte sind bewusst vereinfacht und dienen dem Spiel – sie sind keine aktuellen Statistiken.",
  "didacticmodel.das-modell-zeigt-nur": "Das Modell zeigt nur ausgewählte Zusammenhänge. Vergleiche beim Spielen: Welche Faktoren sind sichtbar dargestellt, und welche zusätzlichen Einflüsse gäbe es in einer realen Lieferkette?",
  "didacticmodel.ein-spieltag-folgt-der": "Ein Spieltag folgt der Reihenfolge: fördern, raffinieren, produzieren, verkaufen.",
  "didacticmodel.foerderung-tag": "Förderung / Tag",
  "didacticmodel.arbeiter-ergiebigkeit-zufriedenheit": "Arbeiter × Ergiebigkeit × (0.55 + Zufriedenheit/100 × 0.6) × Ausbau",
  "didacticmodel.material-aus-rohstoff": "Material aus Rohstoff",
  "didacticmodel.rohstoff-ausbeute": "Rohstoff × Ausbeute",
  "didacticmodel.fabrik-ausstoss": "Fabrik-Ausstoss",
  "didacticmodel.arbeiter-ausstoss-begrenzt-vom": "Arbeiter × Ausstoss, begrenzt vom knappsten Material",
  "didacticmodel.nachfrage": "Nachfrage",
  "didacticmodel.grundwert-saison-ereignis-ruf": "Grundwert × Saison × Ereignis × (0.65 + Ruf/100 × 0.7)",
  "didacticmodel.verkaufspreis": "Verkaufspreis",
  "didacticmodel.grundpreis-ueberangebot-dollarkurs": "Grundpreis × (1 − 0.35 × Überangebot) × Dollarkurs × Schwierigkeit",
  "didacticmodel.rohstoff-raffinerie-material-fabrik": "Rohstoff → Raffinerie → Material → Fabrik → Markt.",
  "didacticmodel.aus-einer-rohstoffquelle-kommt": "Aus einer Rohstoffquelle kommt zunächst <b>Rohstoff</b>: zum Beispiel Bauxit, Coltan oder Kupfererz. Die <b>Raffinerie</b> macht daraus nutzbares Material wie Aluminium, Tantal oder Kupfer. Erst die <b>Fabrik</b> baut daraus ein Produkt.",
  "didacticmodel.reisst-ein-glied-steht": "Reisst ein Glied, steht die Kette. Eine Rohstoffquelle ohne Raffinerie liefert noch kein Material für die Fabrik.",
  "didacticmodel.die-ausbeute-ist-im": "Die <b>Ausbeute</b> ist im Spiel ein vereinfachter Wert: Sie bestimmt, wie viel nutzbares Material aus einer Einheit Rohstoff entsteht. Der Rest steht für Abraum und Verluste der Verarbeitung.",

  /* ---------- didactic-events.js ---------- */
  "didacticevents.us-dollar-die-verkaufspreise": `<b>US-Dollar {p1}</b> – die Verkaufspreise deiner Fertigwaren {p2} 50 Tage lang um {p3} %.`,
  "didacticevents.erdbeben-bei-taiwan-elektroniklieferungen": "<b>Erdbeben bei Taiwan</b> – Elektroniklieferungen stocken. Die Nachfrage nach Smartphones und Konsolen steigt 70 Tage lang um 50 %.",
  "didacticevents.protest": "Protest",
  "didacticevents.streik-in": `Streik in {p1}`,
  "didacticevents.die-belegschaft-streikt-die": "Die Belegschaft streikt. Die Zufriedenheit ist wegen des gewählten Lohns sehr niedrig. Die Förderung steht still.",
  "didacticevents.lohn-erhoehen": "Lohn erhöhen",
  "didacticevents.dauerhaft-hoehere-kosten-zufriedenheit": "Dauerhaft höhere Kosten · Zufriedenheit steigt · 2 Tage Stillstand",
  "didacticevents.lohn-in-erhoeht": `Lohn in {p1} erhöht.`,
  "didacticevents.verhandeln-und-praemie-zahlen": "Verhandeln und Prämie zahlen",
  "didacticevents.chf-zufriedenheit-steigt-tage": "CHF 60'000 · Zufriedenheit steigt · 5 Tage Stillstand",
  "didacticevents.einigung-in-praemie-bezahlt": `Einigung in {p1}: Prämie bezahlt.`,
  "didacticevents.keine-einigung-suchen": "Keine Einigung suchen",
  "didacticevents.tage-stillstand-zufriedenheit-bleibt": "20 Tage Stillstand · Zufriedenheit bleibt sehr niedrig · Ruf sinkt",
  "didacticevents.unfall": "Unfall",
  "didacticevents.unfall-in": `Unfall in {p1}`,
  "didacticevents.in-der-rohstoffquelle-gab": "In der Rohstoffquelle gab es einen schweren Unfall. Sie bleibt geschlossen, bis du über die Sicherheitsmassnahmen entscheidest.",
  "didacticevents.sicherheitsmassnahmen-verbessern-und-betroffene": "Sicherheitsmassnahmen verbessern und Betroffene entschädigen",
  "didacticevents.chf-sicherheit-verbessert-tage": "CHF 140'000 · Sicherheit verbessert · 10 Tage Stillstand",
  "didacticevents.sicherheitsmassnahmen-verbessert-und-entschaedigung": `{p1}: Sicherheitsmassnahmen verbessert und Entschädigung bezahlt.`,
  "didacticevents.nur-reparieren": "Nur reparieren",
  "didacticevents.chf-tage-stillstand-sicherheit": "CHF 30'000 · 25 Tage Stillstand · Sicherheit bleibt unverändert",
  "didacticevents.recherche": "Recherche",
  "didacticevents.fragen-zu-deiner-lieferkette": "Fragen zu deiner Lieferkette",
  "didacticevents.eine-recherche-stellt-fragen": `Eine Recherche stellt Fragen zu den Arbeitsbedingungen in {p1}. Deine Firma kann für diese Rohstoffquelle noch keine unabhängige Prüfung vorlegen.`,
  "didacticevents.unabhaengige-pruefung-beauftragen": "Unabhängige Prüfung beauftragen",
  "didacticevents.chf-nachweis-vorhanden": "CHF 90'000 · Nachweis vorhanden",
  "didacticevents.unabhaengige-pruefung-abgeschlossen": `{p1}: unabhängige Prüfung abgeschlossen.`,
  "didacticevents.keine-pruefung-vorlegen": "Keine Prüfung vorlegen",
  "didacticevents.kostet-nichts-ruf-sinkt": "Kostet nichts · Ruf sinkt · Smartphone-Nachfrage 60 Tage −20 %",
  "didacticevents.keine-unabhaengigen-nachweise-vorgelegt": "Keine unabhängigen Nachweise vorgelegt. Ruf und Smartphone-Nachfrage sinken.",
  "didacticevents.lieferkettengesetz-die-geforderten-herkunftsnachweise": "<b>Lieferkettengesetz</b> – die geforderten Herkunftsnachweise fehlen. Busse: CHF 180'000.",
  "didacticevents.lieferkettengesetz-deine-nachweise-sind": `<b>Lieferkettengesetz</b> – deine Nachweise sind {p1}. Grosskunden bestellen 90 Tage lang mehr Mainboards.`,

  /* ---------- didactic-ui.js ---------- */
  "didacticui.markt-verkauf-fertige-produkte": `<h1>Markt &amp; Verkauf</h1><div class="unter">Fertige Produkte müssen verkauft werden</div>
    <div class="verkauf-kette-mini"><span>Produkt</span><b>→</b><span>Verkauf</span><b>→</b><span>Geld</span></div>
    <div class="karte" style="background:linear-gradient(#fffdf6,#fdf3dd)">
      <h3>Verkauf</h3><div class="ort">Im Lager liegen <b>{p1}</b> Stück</div>
      <button class="cta riesig {p2}" data-tun="handverkauf" {p3}>{p4}{p5}</button>
      <div class="notiz">Einmal pro Tag kannst du selbst verkaufen. Für den täglichen Verkauf setzt du Leute im Verkaufsteam ein.</div>
      <h3 style="margin-top:14px">Dein Verkaufsteam</h3><div class="ort">{p6} Personen frei · Lohn {p7} pro Person und Monat</div>
      <div class="crewzeile"><button data-tun="vcrew" data-n="-5" {p8}>−5</button><button data-tun="vcrew" data-n="-1" {p9}>−</button><div class="zahl"><b>{p10}</b><small>Verkauf</small></div><button data-tun="vcrew" data-n="1" {p11}>+</button><button data-tun="vcrew" data-n="5" {p12}>+5</button></div>
      <div class="zeile"><span>Verkaufskapazität</span><b>{p13} Stück/Tag</b></div><div class="zeile"><span>Lohnkosten</span><b>{p14}/Mt.</b></div>
      {p15}
    </div>
    <div class="karte"><h3>Deine Produkte</h3><table><tr><th>Produkt</th><th class="n">Lager</th><th class="n">Nachfr.</th><th class="n">CHF</th></tr>{p16}</table><div class="notiz">Produzierst du deutlich mehr als nachgefragt wird, füllt sich das Lager und der Verkaufspreis sinkt.</div></div>
    <div class="karte"><h3>Deine Rohstoffquellen</h3><table><tr><th>Material</th><th>Quelle</th><th class="n">Bereit</th><th class="n">Rohstoff</th></tr>{p17}</table><div class="notiz">Rohstoffpreise am Weltmarkt werden nicht berechnet. Die Rohstoffe stammen im Spiel aus eigenen Quellen und werden anschliessend raffiniert.</div></div>
    {p18}`,

  /* ---------- didactic-should.js ---------- */
  "didacticshould.rohstoff-raffinerie-fabrik-markt": "Rohstoff → Raffinerie → Fabrik → Markt – und wo diese Orte liegen.",
  "didacticshould.die-ausbeute-ist-ein": "Die <b>Ausbeute</b> ist ein vereinfachter Spielwert dafür, wie viel nutzbares Material aus einer Einheit Rohstoff entsteht.",
  "didacticshould.jede-raffinerie-kann-im": "Jede Raffinerie kann alle Rohstoffe verarbeiten. Die Rohstoffe ihrer <b>Spezialisierung</b> verarbeitet sie 25 % schneller.",
  "didacticshould.der-kern-des-modells": "Die Grundregeln stehen in <code>erzwelt-core.html</code>, Ergänzungen in eigenen Dateien wie <code>didactic-model.js</code>. Schau nach: Welche Regeln sind vereinfacht, damit Ursache und Wirkung klar bleiben?",
  "didacticshould.voraussetzung": `<b>Voraussetzung:</b> {p1}<br>{p2}`,
  "didacticshould.vorherige-verbesserung-fehlt": "Vorherige Verbesserung fehlt",
  "didacticshould.voraussetzung-noch-nicht-erfuellt": "Voraussetzung noch nicht erfüllt",
  "didacticshould.zu-wenig-geld": "Zu wenig Geld · ",
  "didacticshould.verbesserung-finanzieren": "Verbesserung finanzieren · ",
  "didacticshould.noch-keine-rohstoffquelle": "Noch keine Rohstoffquelle",
  "didacticshould.welches-material-brauchst-du": "Eröffne auf der Karte eine Rohstoffquelle für das Material, das du brauchst.",
  "didacticshould.eine-rohstoffquelle-steht-still": "Eine Rohstoffquelle steht still",
  "didacticshould.hat-kein-personal-pruefe": `{p1} hat kein Personal. Öffne die Rohstoffquelle und setze Leute ein.`,
  "didacticshould.niedrige-zufriedenheit-in": "Niedrige Zufriedenheit in ",
  "didacticshould.die-zufriedenheit-ist-niedrig": "Die Zufriedenheit ist niedrig, es droht ein Streik. Erhöhe dort die Lohnstufe.",
  "didacticshould.noch-keine-raffinerie-vorhanden": "Noch keine Raffinerie vorhanden",
  "didacticshould.die-verarbeitung-steht-still": "Die Verarbeitung steht still",
  "didacticshould.du-hast-eine-raffinerie": "Deine Raffinerie verarbeitet gerade nichts. Es fehlt Personal oder Rohstoff.",
  "didacticshould.rohstoffbestand-ist-hoch": "Rohstoffbestand ist hoch",
  "didacticshould.vergleiche-foerderung-und-raffineriedurchsatz": "Deine Rohstoffquellen fördern mehr, als die Raffinerien verarbeiten. Setze dort mehr Leute ein oder baue eine Raffinerie aus.",
  "didacticshould.noch-keine-fabrik-vorhanden": "Noch keine Fabrik vorhanden",
  "didacticshould.welche-produkte-passen-zu": "Baue eine Fabrik für ein Produkt, dessen Materialien du schon hast.",
  "didacticshould.eine-fabrik-steht-still": "Eine Fabrik steht still",
  "didacticshould.die-anlage-ist-fertig": "Die Fabrik ist fertig, aber niemand arbeitet dort. Öffne sie und setze Leute ein.",
  "didacticshould.produktion-stockt": "Produktion stockt: ",
  "didacticshould.kette-rueckwaerts": "Fehlt Rohstoff, Personal in der Raffinerie oder eine Quelle? Folge der Kette rückwärts bis zur Rohstoffquelle.",
  "didacticshould.mehr-verkauf": "Du stellst mehr her, als du verkaufst. Setze mehr Leute in den Verkauf, sonst sinkt der Preis.",
  "didacticshould.fertige-ware-liegt-im": "Fertige Ware liegt im Lager",
  "didacticshould.vergleiche-lager-nachfrage-und": "Niemand verkauft. Setze im Markt Leute ins Verkaufsteam oder verkaufe selbst.",
  "didacticshould.warenbestand-ist-hoch": "Warenbestand ist hoch",
  "didacticshould.personen-ohne-aufgabe": " Personen ohne Aufgabe",
  "didacticshould.pruefe-ob-du-dieses": "Setze sie an einer Station ein oder entlasse sie im Team. Ohne Aufgabe kosten sie trotzdem Lohn.",
  "didacticshould.ein-niedriger-ruf-senkt": "Ein niedriger Ruf senkt die Nachfrage",
  "didacticshould.pruefe-meldungen-und-fruehere": "Den Ruf verbesserst du mit fairen Entscheiden bei Ereignissen, mit Herkunftsprüfungen und mit Verbesserungen wie dem Transparenzbericht.",
  "didacticshould.voraussetzung-fuer-eine-verbesserung": "Verbesserung möglich",
  "didacticshould.im-reiter-wissen-findest": "Im Reiter Wissen kannst du eine Verbesserung kaufen.",
  "didacticshould.naechste-ausbaustufe-mit-groesserer": "Ausbau lohnt sich bald",
  "didacticshould.vergleiche-kosten-und-wirkung": "Bei einer Rohstoffquelle verdoppelt die nächste Ausbaustufe die Förderung.",
  "didacticshould.monatsabschluss-loehne-betrieb": `Monatsabschluss: Löhne {p1}, Betrieb {p2}.`,
  "didacticshould.die-kasse-ist-im": "Die Kasse ist im Minus. Senke die Kosten oder verkaufe mehr, sonst ist die Firma bald zahlungsunfähig.",
  "didacticshould.beispielweg-auf-der-karte": `<b>Beispielweg auf der Karte</b><br>{p1} → {p2} → {p3} · ca. {p4} km<br><span style="font-weight:600;color:#6b5f50">Die Entfernung dient der geografischen Orientierung. Transportkosten und Lieferzeiten werden nicht berechnet.</span>`,

  /* ---------- didactic-transport.js ---------- */
  "didactictransp.beispiel-lieferweg-rohstoffquelle-raffinerie": "<b>Beispiel-Lieferweg</b><br>Rohstoffquelle → Raffinerie → Fabrik",

  /* ---------- performance-pass.js ---------- */
  "performancepas.memoized-map-ui-migrations": "Memoized map UI/migrations; rAF-batched pan/zoom; synchronous saves coalesced; fast-tick panels capped near 2 Hz; quiet-mode continuous effects reduced.",

  /* ---------- transformation-animations.js ---------- */
  "transformation.rohstoff-raffination-material-rohstoff": `<div class="szene prozessszene raff-prozess" data-szene="prozess-raff-{p1}" data-prozess="raff" data-id="{p2}">
      <div class="prozess-kopf"><span>Rohstoff</span><b>Raffination</b><span>Material</span></div>
      <div class="prozessbahn"><div class="prozesslinie"></div>
        <div class="prozess-roh"><span class="rohbrocken"></span><span class="rohbrocken"></span><span class="rohbrocken"></span></div>
        <div class="prozess-reaktor">{p3}</div>
        <div class="prozess-ausgang"><div class="materialblock"><span class="prozess-mat-sym">{p4}</span></div></div>
      </div>
      <div class="prozess-status"><i></i><span class="prozess-status-text">Rohstoff → Material</span></div>
      <div class="schweber"></div>
    </div>`,
  "transformation.materialien-fertigung-produkt-materialien": `<div class="szene prozessszene fabrik-prozess {p1}" data-szene="prozess-fab-{p2}" data-prozess="fab" data-index="{p3}" data-product="{p4}">
      <div class="prozess-kopf"><span>Materialien</span><b>Fertigung</b><span>Produkt</span></div>
      <div class="prozessbahn"><div class="prozesslinie"></div>
        <div class="rezeptchips">{p5}</div>
        <div class="fabrikmaschine">{p6}</div>
        <div class="prozess-ausgang"><div class="produktkarton">{p7}</div></div>
      </div>
      <div class="prozess-status"><i></i><span class="prozess-status-text">Materialien → {p8}</span></div>
      <div class="schweber"></div>
    </div>`,
  "transformation.vorschau-rohstoff-material": "Vorschau: Rohstoff → Material",
  "transformation.kein-personal-zugewiesen": "Kein Personal zugewiesen",
  "transformation.kein-rohstoff-im-lager": "Kein Rohstoff im Lager",
  "transformation.im-bau-noch-tage": `Im Bau · noch {p1} Tage`,
  "transformation.materialien": `Materialien → {p1}`,
  "transformation.mindestens-ein-material-fehlt": "Mindestens ein Material fehlt",

  /* ---------- transformation-enhance.js ---------- */
  "transformation.im-rohstofflager": `<b>{p1}</b><small>{p2} im Rohstofflager</small>`,
  "transformation.im-materiallager": `<b>{p1}</b><small>{p2} im Materiallager</small>`,
  "transformation.wird-zu-raffiniert": `{p1} wird zu {p2} raffiniert`,
  "transformation.raffination-pausiert-zu": `Raffination pausiert: {p1} zu {p2}`,
  "transformation.material": `<b>{p1}</b><small>{p2} Material{p3}</small>`,
  "transformation.stueck-im-lager": `<b>{p1}</b><small>{p2} Stück im Lager</small>`,
  "transformation.fehlt": "Fehlt: ",
  "transformation.produktion-laeuft": `Produktion läuft · {p1}`,
  "transformation.werden-zu-verarbeitet": `{p1} werden zu {p2} verarbeitet`,
  "transformation.fertigung-pausiert": `Fertigung pausiert: {p1}`,

  /* ---------- tutorial-enhance.js ---------- */
  "tutorialenhanc.rohstoffe": "Rohstoffe",
  "tutorialenhanc.raffination": "Raffination",
  "tutorialenhanc.fertigung": "Fertigung",
  "tutorialenhanc.verkauf": "Verkauf",
  "tutorialenhanc.noch-entstehen-keine-ladekabel": `Noch entstehen keine Ladekabel. Es fehlt {p1}. Prüfe Rohstoffquellen und Raffinerie.`,
  "tutorialenhanc.die-fabrik-kann-produzieren": "Die Fabrik kann produzieren. Schliesse das Fenster und lass die Zeit laufen, bis Ware im Lager liegt. Verkaufe sie danach im Markt.",
  "tutorialenhanc.tutorial-abgeschlossen": "Tutorial abgeschlossen",
  "tutorialenhanc.schritt-abgeschlossen": "Schritt abgeschlossen",
  "tutorialenhanc.rohstoffquelle-raffinerie-fabrik-verkauf": "Rohstoffquelle → Raffinerie → Fabrik → Verkauf → Geld",

  /* ---------- construction-visibility.js ---------- */
  "constructionvi.standort": "Standort",
  "constructionvi.im-bau": `<span class="pin-status-hint">Im Bau</span>`,
  "constructionvi.neu": `<span class="pin-state-badge">Neu</span><span class="pin-build-tool">{p1}</span>`,
  "constructionvi.neu-eroeffnet": `<span class="pin-status-hint">Neu eröffnet</span>`,
  "constructionvi.foerderung-gestoppt": "Förderung gestoppt",
  "constructionvi.kein-personal": "Kein Personal",
  "constructionvi.kein-rohstoff": "Kein Rohstoff",
  "constructionvi.material-fehlt": "Material fehlt",

  /* ---------- notification-history.js ---------- */
  "notificationhi.verlauf": `{p1}<span class="toast-history-label">Verlauf</span><span class="toast-history-count">0</span>`,
  "notificationhi.meldungsverlauf-vergangene-meldungen": `<div class="toast-history-head"><span class="hist-icon">{p1}</span><div><h2 id="toast-history-title">Meldungsverlauf</h2><small id="toast-history-subtitle">Vergangene Meldungen</small></div><button id="toast-history-close" type="button" aria-label="Verlauf schliessen">×</button></div><div id="toast-history-list"></div>`,
  "notificationhi.meldungsverlauf-oeffnen-meldungen": `Meldungsverlauf öffnen, {p1} Meldungen`,
  "notificationhi.meldungsverlauf-noch-keine-meldungen": "Meldungsverlauf, noch keine Meldungen",
  "notificationhi.vergangene-meldung": "1 vergangene Meldung",
  "notificationhi.vergangene-meldungen": `{p1} vergangene Meldungen`,
  "notificationhi.tag": `Tag {p1}`,
  "notificationhi.warnung": "Warnung",
  "notificationhi.hinweis": "Hinweis",
  "notificationhi.erfolg": "Erfolg",
  "notificationhi.meldung": "Meldung",

  /* ---------- stop-safety-visual.js ---------- */
  "stopsafetyvisu.entscheidung-offen": "Entscheidung offen",
  "stopsafetyvisu.streik": `Streik{p1}`,
  "stopsafetyvisu.sicherheitsstopp": `Sicherheitsstopp{p1}`,
  "stopsafetyvisu.stillstand": `Stillstand{p1}`,
  "stopsafetyvisu.rohstoffquelle": "Rohstoffquelle",
  "stopsafetyvisu.streik-stillstand": "Streik / Stillstand",
  "stopsafetyvisu.sicherheitsstopp-2": "Sicherheitsstopp",
  "stopsafetyvisu.stillstand-2": "Stillstand",
  "stopsafetyvisu.die-foerderung-steht-wegen": "Die Leute streiken, weil sie mit dem Lohn unzufrieden sind.",
  "stopsafetyvisu.die-foerderung-steht-wegen-2": "Nach einem Unfall ist die Rohstoffquelle geschlossen. Entscheide über die Sicherheit.",
  "stopsafetyvisu.die-foerderung-steht-voruebergehend": "Die Förderung steht vorübergehend still.",
  "stopsafetyvisu.foerderung-gestoppt": `<div class="karte mine-stillstand-card {p1}"><div class="mine-stillstand-head"><span class="mine-stillstand-icon">{p2}</span><div><h3>{p3}</h3><small>Förderung gestoppt{p4}</small></div></div><div class="ort">{p5}</div></div>`,
  "stopsafetyvisu.sicherheit": `<span class="sicherheits-symbol">{p1}</span><div><h3>Sicherheit</h3><small>{p2}</small></div>`,
  "stopsafetyvisu.getrennte-zusammenhaenge": "Was hängt womit zusammen?",
  "stopsafetyvisu.lohn-zufriedenheit-streik-lohn": "<div class=\"mine-ursache lohn\"><b>Lohn → Zufriedenheit → Streik</b><span>Lohn beeinflusst die Zufriedenheit.</span></div><div class=\"mine-ursache sicherheit\"><b>Sicherheit → Unfallrisiko</b><span>Sicherheitsmassnahmen beeinflussen das Unfallrisiko.</span></div>",

  /* ---------- map-focus-navigation.js ---------- */
  "mapfocusnaviga.vorschlag": "Vorschlag",
  "mapfocusnaviga.ziel-anzeigen": `{p1} · Ziel anzeigen`,

  /* ---------- didactic-complexity.js ---------- */
  "didacticcomple.im-kupferguertel-der-dr": "Im Kupfergürtel der DR Kongo werden Kupfer und oft auch Kobalt gewonnen.",
  "didacticcomple.ruanda-foerdert-und-exportiert": "Ruanda fördert und exportiert Tantal. Lieferketten in der Region sind nicht immer leicht zu prüfen.",
  "didacticcomple.bayan-obo-ist-eine": "Bayan Obo ist eine grosse Lagerstätte für Seltene Erden in China.",
  "didacticcomple.indium-entsteht-meist-als": "Indium entsteht meist als Nebenprodukt der Zinkgewinnung. Es wird unter anderem für Displays genutzt.",
  "didacticcomple.der-standort-steht-im": "Der Standort steht im Spiel für besonders reinen Quarz als Ausgangsstoff für Silizium.",
  "didacticcomple.mountain-pass-ist-eine": "Mountain Pass ist eine grosse Lagerstätte für Seltene Erden in den USA.",
  "didacticcomple.mexiko-ist-ein-wichtiger": "Mexiko ist ein wichtiger Standort für Silberabbau.",
  "didacticcomple.zinn-wird-fuer-loetverbindungen": "Zinn wird für Lötverbindungen in Elektronik gebraucht.",
  "didacticcomple.auf-bangka-wird-zinn": "Auf Bangka wird Zinn auch im Meer gewonnen. Die Arbeit kann gefährlich sein und die Umwelt belasten.",
  "didacticcomple.auf-sulawesi-wird-viel": "Auf Sulawesi wird viel Nickel gewonnen. Der Abbau kann grosse Flächen beanspruchen.",
  "didacticcomple.in-der-region-gibt": "In der Region gibt es grosse und kleine Goldminen. Kleine Minen können schwer zu kontrollieren sein.",
  "didacticcomple.bauxit-ist-der-wichtigste": "Bauxit ist der wichtigste Rohstoff für Aluminium. Guinea besitzt grosse Bauxitvorkommen.",
  "didacticcomple.china-ist-ein-wichtiger": "China ist ein wichtiger Standort für die Verarbeitung vieler Rohstoffe.",
  "didacticcomple.dieser-standort-zeigt-im": "Dieser Standort zeigt im Spiel eine europäische Raffinerie mit hohen Kosten.",
  "didacticcomple.ein-smartphone-braucht-viele": "Ein Smartphone braucht viele verschiedene Materialien aus mehreren Ländern.",
  "didacticcomple.eine-leiterplatte-verbindet-elektronische": "Eine Leiterplatte verbindet elektronische Bauteile. Kupfer und Lötmetalle sind dabei wichtig.",
  "didacticcomple.displays-brauchen-verschiedene-materialien": "Displays brauchen verschiedene Materialien. Indium kann in leitfähigen Schichten eingesetzt werden.",
  "didacticcomple.loetverbindungen-auf-leiterplatten": "Lötverbindungen auf Leiterplatten",
  "didacticcomple.lithium-ionen-akkus": "Lithium-Ionen-Akkus",
  "didacticcomple.kathodenmaterial-in-akkus": "Kathodenmaterial in Akkus",
  "didacticcomple.elektrische-kontakte-und-loetpasten": "Elektrische Kontakte und Lötpasten",
  "didacticcomple.permanentmagnete-in-lautsprechern-und": "Permanentmagnete in Lautsprechern und Motoren",
  "didacticcomple.kondensatoren-in-elektronischen-geraeten": "Kondensatoren in elektronischen Geräten",
  "didacticcomple.transparente-leitfaehige-schichten-in": "Transparente leitfähige Schichten in Displays (ITO)",
  "didacticcomple.korrosionsbestaendige-elektrische-kontakte": "Korrosionsbeständige elektrische Kontakte",
  "didacticcomple.rohstoffquelle-raffinerie-fabrik-markt": "Rohstoffquelle → Raffinerie → Fabrik → Markt.",
  "didacticcomple.fehlt-eine-station-kann": "Fehlt eine Station, kann die nächste Station nicht weiterarbeiten.",
  "didacticcomple.nicht-jeder-rohstoff-kommt": "Nicht jeder Rohstoff kommt überall vor.",
  "didacticcomple.darum-liegen-rohstoffquellen-in": "Darum liegen Rohstoffquellen in verschiedenen Ländern und Regionen.",
  "didacticcomple.lagerstaetten-entstehen-durch-geologische": "Lagerstätten entstehen durch geologische Prozesse.",
  "didacticcomple.der-lohn-beeinflusst-im": "Der Lohn beeinflusst im Spiel die Zufriedenheit. Sehr niedrige Zufriedenheit kann zu einem Streik führen.",
  "didacticcomple.lohn-zufriedenheit-streik": "Lohn → Zufriedenheit → Streik",
  "didacticcomple.sicherheit-unfallrisiko": "Sicherheit → Unfallrisiko",
  "didacticcomple.produkte-brauchen-kaeuferinnen-und": "Produkte brauchen Käuferinnen und Käufer.",
  "didacticcomple.nachfrage-kann-sich-durch": "Nachfrage kann sich durch Ereignisse ändern.",
  "didacticcomple.der-us-dollar-kann": "Der US-Dollar kann Fertigwarenpreise verändern.",
  "didacticcomple.ruf-nachfrage": "Ruf → Nachfrage",
  "didacticcomple.nachweise-lieferkettenpruefung": "Nachweise → Lieferkettenprüfung",
  "didacticcomple.kosten-loehne-mengen-und": "Kosten, Löhne, Mengen und Rezepte sind Spielwerte. Sie sind keine aktuellen Statistiken.",
  "didacticcomple.das-spiel-zeigt-nur": "Das Spiel zeigt nur einige Zusammenhänge einer echten Lieferkette.",
  "didacticcomple.ortsinfos-sind-fuer-den": "Ortsinfos sind für den Unterricht gekürzt und vereinfacht.",
  "didacticcomple.bessere-planung-erhoeht-den": "Bessere Planung erhöht den Raffineriedurchsatz.",
  "didacticcomple.die-verbesserung-erhoeht-den": "Die Verbesserung erhöht den Durchsatz und senkt die Betriebskosten.",
  "didacticcomple.bessere-kartierung-erhoeht-die": "Bessere Kartierung erhöht die Förderung.",
  "didacticcomple.tiefenbohrungen-erhoehen-die-foerderung": "Tiefenbohrungen erhöhen die Förderung.",
  "didacticcomple.ein-gemeinsamer-standard-senkt": "Ein gemeinsamer Standard senkt die Kosten für Sicherheitsausbauten.",
  "didacticcomple.mitbestimmung-erhoeht-zufriedenheit-und": "Mitbestimmung erhöht Zufriedenheit und Ruf.",
  "didacticcomple.bessere-prozesse-erhoehen-die": "Bessere Prozesse erhöhen die Ausbeute.",
  "didacticcomple.rueckgewinnung-erhoeht-die-ausbeute": "Rückgewinnung erhöht die Ausbeute.",
  "didacticcomple.bessere-ablaeufe-erhoehen-den": "Bessere Abläufe erhöhen den Fabrikausstoss.",
  "didacticcomple.vorfertigung-erhoeht-den-ausstoss": "Vorfertigung erhöht den Ausstoss und verkürzt die Bauzeit.",
  "didacticcomple.schulung-erhoeht-die-verkaufskapazitaet": "Schulung erhöht die Verkaufskapazität.",
  "didacticcomple.direktvertrieb-erhoeht-preis-und": "Direktvertrieb erhöht Preis und Verkaufskapazität.",
  "didacticcomple.ein-transparenzbericht-staerkt-im": "Ein Transparenzbericht stärkt im Spiel Ruf und Nachfrage.",
  "didacticcomple.pruefungen-staerken-die-nachfrage": "Prüfungen stärken die Nachfrage und dämpfen Rufverluste.",
  "didacticcomple.standard": "Standard",
  "didacticcomple.erdbeben-bei-taiwan-andere": "<b>Erdbeben bei Taiwan</b> – andere Firmen können weniger Elektronik liefern. Silizium wird 70 Tage deutlich teurer; die Nachfrage nach Smartphones und Konsolen steigt um 50 %.",
  "didacticcomple.lieferkettengesetz-herkunftsnachweise-fehlen-im": "<b>Lieferkettengesetz</b> – Herkunftsnachweise fehlen. Im Spiel fällt eine Busse von CHF 180'000 an.",
  "didacticcomple.lieferkettengesetz-deine-nachweise-sind": `<b>Lieferkettengesetz</b> – deine Nachweise sind {p1}. Grosskunden können bestellen; die Mainboard-Nachfrage steigt 90 Tage lang.`,
  "didacticcomple.die-zufriedenheit-ist-wegen": "Die Zufriedenheit ist wegen des Lohns sehr niedrig. Deshalb streikt die Belegschaft und die Förderung steht still.",
  "didacticcomple.es-gab-einen-schweren": "Es gab einen schweren Unfall. Die Rohstoffquelle bleibt geschlossen, bis du über die Sicherheit entscheidest.",

  /* ---------- knowledge-quest-flow.js ---------- */
  "knowledgequest.deine-lieferkette-steht": "Deine Lieferkette steht",
  "knowledgequest.du-hast-rohstoffquelle-raffinerie": "Du hast Rohstoffquelle → Raffinerie → Fabrik → Verkauf einmal vollständig erlebt.",
  "knowledgequest.lohn-zufriedenheit-beobachten": "Lohn & Zufriedenheit beobachten",
  "knowledgequest.aendere-die-lohnstufe-in": "Ändere die Lohnstufe in einer deiner Rohstoffquellen. Beobachte danach den Zielwert der Zufriedenheit.",
  "knowledgequest.eroeffne-eine-eigene-rohstoffquelle": "Eröffne eine eigene Rohstoffquelle, damit du dort die Lohnstufe ändern kannst.",
  "knowledgequest.du-hast-die-lohnstufe": "Du hast die Lohnstufe verändert. Im Spiel wirkt der Lohn auf die Zufriedenheit.",
  "knowledgequest.markt-selbst-ausprobieren": "Markt selbst ausprobieren",
  "knowledgequest.du-hast-selbst-verkauft": "Du hast selbst verkauft. So wird aus Ware Geld.",
  "knowledgequest.rohstoffstandorte-vergleichen": "Rohstoffstandorte vergleichen",
  "knowledgequest.oeffne-zwei-verschiedene-rohstoffstandorte": `Öffne zwei verschiedene Rohstoffstandorte auf der Karte. {p1}/2 angesehen.`,
  "knowledgequest.du-hast-zwei-rohstoffstandorte": "Du hast zwei Rohstoffstandorte angesehen. Rohstoffe liegen nicht überall am selben Ort.",
  "knowledgequest.ruf-und-nachweise-unterscheiden": "Ruf und Nachweise unterscheiden",
  "knowledgequest.oeffne-ziel-vergleiche-dort": "Öffne «Ziel». Vergleiche dort Ruf und Lieferkettennachweise.",
  "knowledgequest.das-spielmodell-einordnen": "Das Spielmodell einordnen",
  "knowledgequest.du-hast-die-wichtigsten": "Du hast die wichtigsten Zusammenhänge ausprobiert. Lies jetzt, was im Spiel vereinfacht ist und was in Wirklichkeit noch dazukommt.",
  "knowledgequest.aendere-nach-dem-tutorial": "Ändere nach dem Tutorial einmal die Lohnstufe einer Rohstoffquelle.",
  "knowledgequest.oeffne-zwei-verschiedene-rohstoffstandorte-2": "Öffne zwei verschiedene Rohstoffstandorte auf der Karte.",
  "knowledgequest.oeffne-ziel-und-vergleiche": "Öffne «Ziel» und vergleiche Ruf mit Lieferkettennachweisen.",
  "knowledgequest.wissen-freigeschaltet": "Wissen freigeschaltet",
  "knowledgequest.wissens-quest": `Wissens-Quest {p1}/{p2}`,
  "knowledgequest.ansehen": "Wissen ansehen",
  "knowledgequest.erledigt-weiter": "Erledigt! Tippe «Wissen ansehen» und hol dir {betrag}.",
  "knowledgequest.belohnung": "Belohnung: {betrag}.",
  "knowledgequest.belohnung-erhalten": "Wissens-Quest {nr}/{von} geschafft · Belohnung <b>+{betrag}</b>.",

  /* ---------- objective-guide.js ---------- */
  "objectiveguide.ziel-zeigen": `{p1}<span>Ziel zeigen</span>`,
  "objectiveguide.aktuelles-ziel-anzeigen": "Aktuelles Ziel anzeigen",
  "objectiveguide.ziel-zeigen-2": "Ziel zeigen",

  /* ---------- abschluss-zertifikat.js ---------- */
  "abschlusszerti.chf": "CHF ",
  "abschlusszerti.insolvenz": "Insolvenz",
  "abschlusszerti.etappenziel-verfehlt": "Etappenziel verfehlt",
  "abschlusszerti.zwischenstand": "Zwischenstand",
  "abschlusszerti.produktzahlen-seit-spielstart": "Produktzahlen seit Spielstart",
  "abschlusszerti.produktzahlen-ab-tag-aelterer": `Produktzahlen ab Tag {p1} (älterer Spielstand)`,
  "abschlusszerti.erzwelt-leistungsnachweis": `Erzwelt - Leistungsnachweis - {p1}`,
  "abschlusszerti.erzwelt-informatische-bildung": "Erzwelt · Informatische Bildung",
  "abschlusszerti.erzwelt-leistungsnachweis-fortsetzung": "ERZWELT · Leistungsnachweis · Fortsetzung",
  "abschlusszerti.erzwelt": "ERZWELT",
  "abschlusszerti.abschlusszertifikat": "Abschlusszertifikat",
  "abschlusszerti.leistungsnachweis-zwischenstand": "Leistungsnachweis · Zwischenstand",
  "abschlusszerti.datum-spieltag": `Datum: {p1}   ·   Spieltag {p2}`,
  "abschlusszerti.etappe": `{p1}{p2}   ·   Etappe {p3}   ·   {p4}`,
  "abschlusszerti.hergestellt": "HERGESTELLT",
  "abschlusszerti.stueck": " Stück",
  "abschlusszerti.verkauft": "VERKAUFT",
  "abschlusszerti.verkaufserloes": "VERKAUFSERLÖS",
  "abschlusszerti.produktion-verkauf": "Produktion & Verkauf",
  "abschlusszerti.fruehere-mengen-und-produkterloese": "Frühere Mengen und Produkterlöse wurden nicht gespeichert. Lager und Finanzbilanz zeigen den gesamten aktuellen Spielstand.",
  "abschlusszerti.produkt": "Produkt",
  "abschlusszerti.hergestellt-2": "Hergestellt",
  "abschlusszerti.verkauft-2": "Verkauft",
  "abschlusszerti.lager": "Lager",
  "abschlusszerti.erloes-gesamt": "Erlös gesamt",
  "abschlusszerti.finanzbilanz-seit-spielstart": "Finanzbilanz seit Spielstart",
  "abschlusszerti.startkapital": "Startkapital",
  "abschlusszerti.einnahmen-gesamt": "Einnahmen gesamt",
  "abschlusszerti.ausgaben-gesamt": "Ausgaben gesamt",
  "abschlusszerti.gewinn-verlust-einnahmen-minus": "Gewinn / Verlust (Einnahmen minus Ausgaben)",
  "abschlusszerti.weitere-kassenbewegungen": "Weitere Kassenbewegungen",
  "abschlusszerti.schlusskasse-inklusive-startkapital": "Schlusskasse (inklusive Startkapital)",
  "abschlusszerti.gewinn-verlust-nur-etappe": `Gewinn / Verlust nur Etappe {p1}`,
  "abschlusszerti.verkaufserloese-sind-einnahmen-vor": "Verkaufserlöse sind Einnahmen vor Kosten. Unverkaufte Ware ist nicht als Einnahme verbucht.",
  "abschlusszerti.deine-lieferkette-entscheidungen": "Deine Lieferkette & Entscheidungen",
  "abschlusszerti.rohstoffquellen-rohstoffarten-raffinerien-fertige": `{p1} Rohstoffquellen · {p2} Rohstoffarten · {p3} Raffinerien · {p4} fertige Fabriken{p5}`,
  "abschlusszerti.team-personen-davon-im": `Team: {p1} Personen, davon {p2} im Verkauf · Ruf: {p3}/100`,
  "abschlusszerti.lieferkettennachweise-sicherheit-verbessert-quellen": `Lieferkettennachweise: {p1} · Sicherheit verbessert: {p2}/{p3} Quellen`,
  "abschlusszerti.wissen-angesehen-bereiche-verbesserungen": `Wissen angesehen: {p1}/{p2} Bereiche · {p3} Verbesserungen finanziert`,
  "abschlusszerti.hoechster-produkterloes-mit-verkauften": `Höchster Produkterlös: {p1} mit {p2} verkauften Stück für insgesamt {p3}.`,
  "abschlusszerti.erzwelt-rohstoffe-lieferketten-lernsimulation": "Erzwelt · Rohstoffe & Lieferketten · Lernsimulation",
  "abschlusszerti.produkte-verkaeufe-und-deine": `<section class="karte zertifikat-karte" aria-labelledby="zertifikat-titel">
      <h2 id="zertifikat-titel">{p1}</h2>
      <p>Produkte, Verkäufe und deine Finanzbilanz als PDF für die Abgabe.</p>
      <div class="zertifikat-summe"><b>{p2}</b><span>Gewinn / Verlust seit Spielstart</span></div>
      <p class="ort">{p3} hergestellt · {p4} verkauft · {p5} im Lager</p>
      <p class="ort">{p6}{p7}</p>
      <form id="erzwelt-zertifikat-form">
        <label for="zertifikat-name">Vorname</label>
        <input id="zertifikat-name" name="vorname" autocomplete="given-name" maxlength="120" required value="{p8}" placeholder="Dein Vorname">
        <button type="submit" class="cta gruen">{p9}</button>
        <p id="zertifikat-status" role="status" aria-live="polite"></p>
      </form>
      {p10}
    </section>`,
  "abschlusszerti.pdf-abschluss-erstellen-produkte": "<b>PDF-Abschluss erstellen</b><small>Produkte, Verkäufe und Schlussbilanz für die Abgabe</small>",
  "abschlusszerti.pdf-wird-erstellt": "PDF wird erstellt …",
  "abschlusszerti.erzwelt-pdf": "Erzwelt PDF:",

  /* ---------- logik-fixes.js ---------- */
  "logikfixes.die-firma-ist-zahlungsunfaehig": "Die Firma ist zahlungsunfähig",
  "logikfixes.deine-kasse-ist-unter": `Deine Kasse ist unter −CHF 800’000 gefallen. Das Spiel endet an Tag {p1}.`,
  "logikfixes.neue-runde-starten": "Neue Runde starten",
  "logikfixes.schwierigkeit-neu-waehlen": "Schwierigkeit neu wählen",
  "logikfixes.schwer-freigeschaltet-du-kannst": `<br><br><b>Schwer freigeschaltet!</b> Du kannst Schwer ab der nächsten neuen Runde wählen.`,
  "logikfixes.weiter-etappe": `Weiter · Etappe {p1}`,
  "logikfixes.nochmals-tage-mit-derselben": `Nochmals {p1} Tage mit derselben Firma`,
  "logikfixes.speicherplatz-und-schwierigkeit-waehlen": "Speicherplatz und Schwierigkeit wählen",
  "logikfixes.etappe-tage": `Etappe {p1} · {p2} Tage`,
  "logikfixes.laufend-ziel-ruf-ziel": `Laufendes Geschäft dieser Etappe: {p1} (Ziel {p2}) · Ruf: {p3} (Ziel {p4}).<br>`,
  "logikfixes.laufend-etappe": "Laufendes Geschäft (zählt fürs Ziel)",
  "logikfixes.etappengewinn-ziel-ruf-ziel": `Etappengewinn: {p1} (Ziel {p2}) · Ruf: {p3} (Ziel {p4}).<br>`,
  "logikfixes.schwierigkeit": `Schwierigkeit: {p1} <b>{p2}</b> · {p3}.<br><br>`,
  "logikfixes.du-hast-geld-verdient": "Du hast Geld verdient <b>und</b> den Ruf gehalten. Weiter geht es mit der nächsten Etappe, gleich lang wie diese.",
  "logikfixes.der-gewinn-stimmt-aber": "Der Gewinn stimmt, aber der Ruf nicht. Du darfst trotzdem weiterspielen und es in der nächsten Etappe erneut versuchen.",
  "logikfixes.der-gewinn-reicht-noch": "Der Gewinn reicht noch nicht. Du darfst trotzdem weiterspielen und deine Lieferkette in der nächsten Etappe verbessern.",
  "logikfixes.ein-transparenzbericht-dokumentiert-die": "Ein Transparenzbericht dokumentiert die Herkunft aller deiner Rohstoffquellen. Er stärkt auch Ruf und Nachfrage.",
  "logikfixes.herkunftsnachweise-fuer-alle-quellen": "Herkunftsnachweise für alle Quellen",
  "logikfixes.ruf-sofort": "Ruf sofort +8",
  "logikfixes.nachfrage": "Nachfrage +5 %",
  "logikfixes.unabhaengige-stellen-pruefen-alle": "Unabhängige Stellen prüfen alle Rohstoffquellen. Das stärkt die Nachfrage und dämpft Rufverluste.",
  "logikfixes.herkunftsnachweise-zertifiziert": "Herkunftsnachweise zertifiziert",
  "logikfixes.nachfrage-2": "Nachfrage +10 %",
  "logikfixes.rufverluste": "Rufverluste −40 %",
  "logikfixes.geprueft": "geprüft",
  "logikfixes.herkunftsnachweis-eine-pruefung-zeigt": `<div class="karte nachweiskarte {p1}">
      <h3>Herkunftsnachweis</h3>
      <div class="ort">Eine Prüfung zeigt, woher dein Rohstoff kommt. Das Lieferkettengesetz verlangt das für <b>jede</b> Quelle.</div>
      <div class="zeile"><span>Status</span><b style="color:{p2}">{p3}</b></div>
      {p4}
    </div>`,
  "logikfixes.herkunft-geprueft-von-rohstoffquellen": `<b>{p1}</b>: Herkunft geprüft · {p2} von {p3} Rohstoffquellen haben einen Nachweis.`,
  "logikfixes.ziel-gesamtgewinn": `Ziel {p1} · Gesamtgewinn`,
  "logikfixes.davon-investitionen-laufendes-geschaeft": `$1
      <div class="zeile" style="margin-top:8px"><span>Davon Investitionen</span><b>{p1}</b></div>
      <div class="zeile"><span>Laufendes Geschäft</span><b style="color:{p2}">{p3}</b></div>
      <div class="ort">Investitionen: Standorte, Ausbau, Leute, Verbesserungen. Sie lohnen sich erst über Verkäufe.</div>`,
  "logikfixes.investiert-zaehlt-nicht": `nur laufendes Geschäft</div>
      <div class="zeile" style="margin-top:8px"><span>Investiert (zählt nicht fürs Ziel)</span><b>{p2}</b></div>
      <div class="zeile"><span>Gesamt mit Investitionen</span><b>{p3}</b></div>
      <div class="ort">Auf «Einfach» zählt nur, was dein Geschäft jeden Monat einbringt. Bauen und Ausbauen bremsen dich beim Ziel nicht.</div>`,
  "logikfixes.der-transparenzbericht-gilt-fuer": `Der Transparenzbericht gilt für alle deine Rohstoffquellen.`,
  "logikfixes.nachweis-holen-quelle-oeffnen": `Nachweis holen: Quelle öffnen → <b>«Herkunft prüfen lassen»</b> ({p1}). Oder im Reiter Wissen den <b>Transparenzbericht</b> finanzieren: gilt für alle.`,
  "logikfixes.das-lieferkettengesetz-verlangt-fuer": `{p1}
      <div class="notiz">Das Lieferkettengesetz verlangt für jede Quelle einen Nachweis. {p2}</div>`,
  "logikfixes.lieferkettengesetz-fuer-von-rohstoffquellen": `<b>Lieferkettengesetz</b> – für {p1} von {p2} Rohstoffquellen fehlen Herkunftsnachweise. Busse: CHF 180'000.`,
  "logikfixes.lieferkettengesetz-deine-nachweise-sind": `<b>Lieferkettengesetz</b> – deine Nachweise sind {p1}. Grosskunden bestellen 90 Tage lang 30 % mehr von deinen Produkten.`,
  "logikfixes.erdbeben-bei-taiwan-andere": "<b>Erdbeben bei Taiwan</b> – andere Firmen können weniger Elektronik liefern. Die Nachfrage nach Smartphones und Konsolen steigt 70 Tage lang um 50 %.",
  "logikfixes.chf-unter-zeitdruck-teurer": "CHF 90'000 · unter Zeitdruck teurer · Nachweis für diese Quelle",
  "logikfixes.kostet-nichts-ruf-sinkt": "Kostet nichts · Ruf sinkt deutlich · ein tiefer Ruf senkt die Nachfrage nach allen Produkten",
  "logikfixes.keine-unabhaengigen-nachweise-vorgelegt": "Keine unabhängigen Nachweise vorgelegt. Dein Ruf sinkt.",

  /* ---------- sek-b-klarheit.js ---------- */
  "sekbklarheit.chf-mio": `CHF {p1} Mio`,
  "sekbklarheit.verkauf-bringt-mehr": "Verkauf bringt 20 % mehr, Betriebskosten halb so hoch",
  "sekbklarheit.normale-verkaufspreise": "normale Verkaufspreise",
  "sekbklarheit.verkauf-bringt-weniger": "Verkauf bringt 30 % weniger",
  "sekbklarheit.neue-runde": "Neue Runde",
  "sekbklarheit.waehle-die-schwierigkeit": "Wähle die Schwierigkeit",
  "sekbklarheit.die-schwierigkeit-bestimmt-wie": `Die Schwierigkeit bestimmt, wie viel dir ein Verkauf einbringt, wie hoch deine Kosten sind und wie hoch dein Ziel ist. Für den Start empfehlen wir <b>Einfach</b>.`,
  "sekbklarheit.einfach": "Einfach",
  "sekbklarheit.verkauf-bringt-mehr-ziel": `Verkauf bringt 20&nbsp;% mehr<br>Betriebskosten halb so hoch<br>Ziel: {p1}`,
  "sekbklarheit.empfohlen": "Empfohlen",
  "sekbklarheit.mittel": "Mittel",
  "sekbklarheit.normale-verkaufspreise-ziel": `Normale Verkaufspreise<br>Ziel: {p1}`,
  "sekbklarheit.schwer": "Schwer",
  "sekbklarheit.verkauf-bringt-weniger-ziel": `Verkauf bringt 30&nbsp;% weniger<br>Ziel: {p1}`,
  "sekbklarheit.erst-mittel-schaffen": "🔒 Erst Mittel schaffen",
  "sekbklarheit.schwierigkeit-gewaehlt": `{p1} Schwierigkeit <b>{p2}</b> gewählt · {p3}.`,
  "sekbklarheit.ergiebigkeit-rohstoff": `<small>Ergiebigkeit</small><b>{p1} Rohstoff</b>`,
  "sekbklarheit.foerderung-pro-person-pro": `<small>Förderung pro Person</small><b>≈ {p1} pro Tag</b>`,
  "sekbklarheit.plaetze": `<small>Plätze</small><b>{p1}</b>`,
  "sekbklarheit.arbeitsplaetze": `<small>Arbeitsplätze</small><b>{p1}</b>`,
  "sekbklarheit.ueblicher-lohn": `<small>Üblicher Lohn</small><b>{p1}</b>`,
  "sekbklarheit.ueblicher-lohn-pro-person": `<small>Üblicher Lohn</small><b>{p1}</b><small class="einheit">pro Person und Monat</small>`,
  "sekbklarheit.pro-tag": "$1 pro Tag</b>",
  "sekbklarheit.pro-monat": `$1</b><small class="einheit">pro Monat</small>`,
  "sekbklarheit.spielmodell-mengen-und-loehne": `<div class="notiz blau"><b>Spielmodell:</b> Mengen und Löhne sind vereinfachte Spielwerte.</div>`,
  "sekbklarheit.spezialisierung-im-spiel-durchsatz": `<div class="karte"><h3>Spezialisierung im Spiel</h3><div class="ort">{p1}</div><div class="notiz"><b>+25 % Durchsatz</b> für diese Rohstoffe. Alle anderen Rohstoffe können hier weiterhin normal verarbeitet werden. Die Spezialisierung ist eine Spielregel.</div></div>`,
  "sekbklarheit.spezialisierung-diese-rohstoffe-verarbeitet": `<div class="karte"><h3>Spezialisierung</h3><div class="ort">{p1}</div><div class="notiz">Diese Rohstoffe verarbeitet die Raffinerie <b>25 % schneller</b>. Alle anderen Rohstoffe verarbeitet sie normal.</div></div>`,
  "sekbklarheit.kapazitaet-tag": `<small>Kapazität</small><b>{p1}/Tag</b>`,
  "sekbklarheit.verarbeitet-bis-zu-rohstoff": `<small>Verarbeitet bis zu</small><b>{p1}</b><small class="einheit">Rohstoff pro Tag, voll besetzt</small>`,
  "sekbklarheit.lohn": `<small>Lohn</small><b>{p1}</b>`,
  "sekbklarheit.lohn-pro-person-und": `<small>Lohn</small><b>{p1}</b><small class="einheit">pro Person und Monat</small>`,
  "sekbklarheit.betrieb-mt": `<small>Betrieb</small><b>{p1}/Mt.</b>`,
  "sekbklarheit.betriebskosten-pro-monat": `<small>Betriebskosten</small><b>{p1}</b><small class="einheit">pro Monat</small>`,
  "sekbklarheit.verarbeitet-rohstoff-pro-tag": `<small>Verarbeitet</small><b>$1</b><small class="einheit">Rohstoff pro Tag</small>`,
  "sekbklarheit.der-rest-steht-im": "Der Rest steht im Spielmodell für Abraum und Verluste.",
  "sekbklarheit.fabrikstandort-lohn-monat": `Fabrikstandort · Lohn {p1}/Monat`,
  "sekbklarheit.fabrikstandort-lohn-pro-person": `Fabrikstandort · Lohn {p1} pro Person und Monat`,
  "sekbklarheit.vereinfachtes-rezept-spielmodell": "Vereinfachtes Rezept · Spielmodell",
  "sekbklarheit.rezept-material-pro-stueck": "Rezept: Material pro Stück",
  "sekbklarheit.sichere-dafuer-eine-eigene": "Sichere dafür eine eigene Rohstoffquelle oder setze dort mehr Personal ein.",
  "sekbklarheit.zukaufen-geht-nicht-sichere": "Zukaufen geht nicht – sichere dafür eine eigene Rohstoffquelle.",
  "sekbklarheit.lohnkosten-im-spielmodell": `<div class="unter">Lohnkosten im Spielmodell</div>`,
  "sekbklarheit.personal-einstellen-und-auf": `<div class="unter">Personal einstellen und auf die Stationen verteilen</div>`,
  "sekbklarheit.da-pro-stueck": `{p1}: <b>{p2}</b> da · {p3} pro Stück`,
  "sekbklarheit.fehlt-fuer": `{p1} fehlt für {p2}`,
  "sekbklarheit.du-hast-noch-keine": `Du hast noch keine Quelle für {p1}. Eröffne zum Beispiel {p2}.`,
  "sekbklarheit.du-hast-noch-keine-2": `Du hast noch keine Quelle für {p1}.`,
  "sekbklarheit.steht-gerade-still-oeffne": `{p1} steht gerade still. Öffne die Rohstoffquelle und schau nach dem Grund.`,
  "sekbklarheit.ist-voll-besetzt-baue": `{p1} ist voll besetzt. Baue die Rohstoffquelle aus oder eröffne eine zweite Quelle für {p2}.`,
  "sekbklarheit.dein-lager-wird-voll": "Dein Lager wird voll",
  "sekbklarheit.deine-fabriken-schaffen-etwa": `Deine Fabriken schaffen etwa {p1} Stück pro Tag, dein Verkaufsteam verkauft {p2}. Setze im Markt mehr Leute in den Verkauf.`,
  "sekbklarheit.das-spielmodell": "Das Spielmodell",
  "sekbklarheit.die-hintergrundinfos-wurden-geprueft": "Die Hintergrundinfos wurden 2026 geprüft.",
  "sekbklarheit.foerderung": "Förderung",
  "sekbklarheit.aus-rohstoff-wird-material": "Aus Rohstoff wird Material. Ein Teil bleibt als Abraum zurück.",
  "sekbklarheit.fabrik": "Fabrik",
  "sekbklarheit.saison-ereignisse-und-dein": "Saison, Ereignisse und dein Ruf verändern, wie viel gekauft wird.",
  "sekbklarheit.preis": "Preis",
  "sekbklarheit.so-haengt-es-zusammen": `<h3>So hängt es zusammen</h3><table>{p1}</table>`,
  "sekbklarheit.die-zeit-steht-solange": "❚❚ Die Zeit steht, solange du dich entscheidest.",
  "sekbklarheit.xmidymax-slice": "xMidYMax slice",

  /* ---------- handy-layout.js ---------- */
  "handylayout.karte-filtern-nicht-alle": "Karte filtern (nicht alle Orte sichtbar)",
  "handylayout.karte-filtern": "Karte filtern",
  "handylayout.auf-der-karte-zeigen": "Auf der Karte zeigen",

  /* ---------- erfolg-feier.js ---------- */
  "audio.titel": "Audio",
  "audio.an": "an",
  "audio.aus": "aus",
  "audio.musikTitel": "Hintergrundmusik",
  "audio.musik": "Musik",
  "audio.musikHilfe": "Startet, sobald du sie einschaltest oder auf einen Knopf tippst. Wird erst dann geladen.",
  "audio.musikLaut": "Lautstärke Musik",
  "audio.musikLautHilfe": "Wirkt sofort, die Musik läuft weiter.",
  "audio.wahl": "Auswahl",
  "audio.musikName": "Musik {nr}",
  "audio.status.aus": "Musik ist aus. Gewählt: Musik {nr}.",
  "audio.status.laedt": "Musik {nr} wird geladen …",
  "audio.status.spielt": "Musik {nr} läuft und beginnt am Ende von vorne.",
  "audio.status.bereit": "Musik {nr} startet beim nächsten Tippen auf einen Knopf.",
  "audio.status.fehler": "Musik {nr} konnte nicht geladen werden. Sie braucht eine Internetverbindung.",
  "audio.sfxTitel": "Soundeffekte (SFX)",
  "audio.sfx": "Soundeffekte",
  "audio.sfxHilfe": "Kurze Töne bei Kauf, eigenem Verkauf und erledigter Aufgabe. Im Schulzimmer: Kopfhörer oder aus.",
  "audio.sfxLaut": "Lautstärke Soundeffekte",
  "audio.sfxLautHilfe": "Beim Loslassen hörst du einen Probeton.",
  "audio.vibHilfe": "Kurzes Vibrieren bei Kauf, eigenem Verkauf und erledigter Aufgabe.",
  "erfolgfeier.vibration": "Vibration",
  "erfolgfeier.kein-ton-bisher": "kein Ton bisher",

  /* ---------- premium-spielgefuehl.js ---------- */
  "premiumspielge.besser-als-im-vormonat": "besser als im Vormonat",
  "premiumspielge.schlechter-als-im-vormonat": "schlechter als im Vormonat",
  "premiumspielge.gleich-wie-im-vormonat": "gleich wie im Vormonat",
  "premiumspielge.monat-laufendes-geschaeft": `<span class="mb-kopf"><b>Monat {p1} · Laufendes Geschäft <span class="{p2}">{p3}</span></b>`,
  "premiumspielge.einnahmen-loehne-und-betrieb": ` <span class="mb-zeile">Einnahmen <span class="mb-plus">{p1}</span> · Löhne und Betrieb <span class="mb-minus">{p2}</span></span>`,
  "premiumspielge.dazu-investiert": ` <span class="mb-klein">Dazu investiert: <span class="mb-zahl">{p1}</span></span>`,
  "premiumspielge.lieferweg-km": `<span class="lw-ikon" aria-hidden="true">{p1}</span><span>Lieferweg<small>≈ {p2} km</small>`,

  /* ---------- kurztexte.js ---------- */
  "kurztexte.das-spiel-pausiert-hier": "Das Spiel pausiert hier automatisch. Beim Verlassen läuft es im vorherigen Tempo weiter.",
  "kurztexte.wissen-ist-frei-zugaenglich": "Lesen ist gratis. Geld kosten nur Verbesserungen – und die erst, wenn du die Voraussetzung im Spiel erfüllt hast.",
  "kurztexte.einmal-pro-tag-kannst": "Einmal pro Tag kannst du selbst verkaufen. Für den täglichen Verkauf setzt du Leute im Verkaufsteam ein.",
  "kurztexte.einmal-pro-tag-kannst-2": "Einmal pro Tag kannst du selbst verkaufen. Wer das nicht jeden Tag machen will, stellt Verkäuferinnen an.",
  "kurztexte.produzierst-du-deutlich-mehr": "Produzierst du deutlich mehr als nachgefragt wird, füllt sich das Lager und der Verkaufspreis sinkt.",
  "kurztexte.mehr-produziert-als-gekauft": "Mehr produziert als gekauft wird? Dann füllt sich das Lager und der Preis sinkt.",
  "kurztexte.nicht-eingeteilte-leute-kosten": "Nicht eingeteilte Leute kosten CHF 200 pro Monat. Stell nur so viele an, wie du beschäftigen kannst.",
  "kurztexte.tage-kommt-eine-abrechnung": "Tage kommt eine Abrechnung – danach kannst du weiterspielen",
  "kurztexte.tage-abrechnung-danach-geht": "Tage Abrechnung, danach geht es weiter",
  "kurztexte.ein-niedriger-ruf-senkt": "Ein niedriger Ruf senkt die Nachfrage nach allen deinen Produkten",
  "kurztexte.tiefer-ruf-weniger-nachfrage": "Tiefer Ruf = weniger Nachfrage",
  "kurztexte.noch-keine-im-reiter": "Noch keine. Im Reiter Wissen siehst du, was dafür fehlt.",
  "kurztexte.jede-stufe-bringt-und": "Jede Stufe bringt +5 % und kostet mehr als die vorherige. Jede zehnte Stufe verdoppelt die Leistung.",
  "kurztexte.jede-stufe-jede-stufe": "Jede Stufe +5 %, jede 10. Stufe verdoppelt.",
  "kurztexte.sicherheitsmassnahmen-senken-das-unfallrisiko": "Sicherheitsmassnahmen senken das Unfallrisiko – unabhängig vom Lohn.",
  "kurztexte.senkt-das-unfallrisiko-der": "Senkt das Unfallrisiko. Der Lohn ändert daran nichts.",
  "kurztexte.weitere-rohstoffe-noch-keine": `<td colspan="4" style="color:var(--grau);font-weight:700">+ {p1} weitere Rohstoffe: noch keine Quelle</td>`,

  /* ---------- belegschaft-regler.js ---------- */
  "belegschaftreg.aus-dem-team": `{p1} aus dem Team`,
  "belegschaftreg.einmalig-jeden-monat-lohn": `<div class="kachel monatlich"><small>Jeden Monat</small><b>+ {p1}</b><span>Lohn · {p2}</span></div>`,
  "belegschaftreg.einmalig-chf-zurueck-ins": `<div class="kachel monatlich"><small>Jeden Monat</small><b>− {p2}</b><span>Lohn · {p1} zurück ins Team, dort ohne Aufgabe je {p3}</span></div>`,
  "belegschaftreg.einmalig-pro-neue-person": `<div class="kachel monatlich"><small>Jeden Monat</small><b>{p1}</b><span>Lohn hier · {p2} pro Person</span></div>`,
  "belegschaftreg.ziel": `<span class="besetzung-ziel {p1}" style="--z:{p2}"><i></i><b>{p3}Ziel {p4}</b></span>`,
  "belegschaftreg.im-verkauf": "im Verkauf",
  "belegschaftreg.frei-im-team": `{p1} frei im Team`,
  "belegschaftreg.mehr-neu-einstellen": "Mehr = neu einstellen",
  "belegschaftreg.zu-wenig-geld-zum": "Kasse im Minus: niemand neu",
  "belegschaftreg.danach-jeden-monat-lohn": `<div class="notiz monatskosten"><b>Danach jeden Monat Lohn:</b> je nach Land {p1} pro Person,
      im Verkauf {p2}. Wer keine Aufgabe hat, kostet {p3}.</div>`,
  "belegschaftreg.von-personen": `{p1} von {p2} Personen`,
  "belegschaftreg.ziel-2": "Ziel ",
  "belegschaftreg.eingestellt-einmalig-danach-lohn": `<b>{p1} {p2}</b> eingestellt · ab jetzt Lohn jeden Monat.`,

  /* ---------- einfuehrung.js ---------- */
  "einfuehrung.raffinerie": "Raffinerie",
  "einfuehrung.in-arbeiten-noetig-sind": `In {p1} arbeiten {p2}, nötig sind {p3}. Öffne zuerst {p4} und schieb den Regler auf {p5} – so musst du niemanden neu einstellen.`,
  "einfuehrung.tippe-auf-der-karte": `Tippe auf der Karte auf {p1} und eröffne die Rohstoffquelle.`,
  "einfuehrung.personal-nach": `Personal nach {p1}`,
  "einfuehrung.oeffne-und-schieb-den": `Öffne {p1} und schieb den Regler auf {p2}. Die Leute werden dabei eingestellt.`,
  "einfuehrung.oeffne-und-schieb-den-2": `Öffne {p1} und schieb den Regler auf {p2} Personen.{p3}`,
  "einfuehrung.ohne-personal-wird-kein": `Ohne Personal wird kein {p1} gefördert.`,
  "einfuehrung.bauxit-wird-spaeter-zu": "Bauxit wird später zu Aluminium.",
  "einfuehrung.zinnerz-wird-spaeter-zu": "Zinnerz wird später zu Zinn. Jetzt hast du alle drei Rohstoffe.",
  "einfuehrung.zinnerz-enthaelt-wenig-zinn": "Zinnerz enthält wenig Zinn – darum braucht es hier mehr Leute als in Boké.",
  "einfuehrung.raffinerie-bauen": "Raffinerie bauen",
  "einfuehrung.rohstoff-laesst-sich-nicht": `Rohstoff lässt sich nicht direkt verbauen. Tippe auf {p1} und baue die Raffinerie.`,
  "einfuehrung.rohstoff-raffinerie-material": "Rohstoff → Raffinerie → Material",
  "einfuehrung.oeffne-und-schieb-den-3": `Öffne {p1} und schieb den Regler auf 5 Personen.`,
  "einfuehrung.kabelfabrik-bauen": "Kabelfabrik bauen",
  "einfuehrung.tippe-auf-den-fabrikstandort": `Tippe auf den Fabrikstandort {p1} und baue die Fabrik für Ladekabel.`,
  "einfuehrung.material-fabrik-produkt": "Material → Fabrik → Produkt",
  "einfuehrung.personal-in-die-fabrik": "Personal in die Fabrik",
  "einfuehrung.die-fabrik-wird-gebaut": `Die Fabrik wird gebaut. Noch {p1} {p2}. Schliesse das Fenster, dann läuft die Zeit.`,
  "einfuehrung.die-fabrik-ist-fertig": `Die Fabrik ist fertig. Öffne {p1} und schieb den Regler auf 5 Personen.`,
  "einfuehrung.personal-material-ladekabel": "Personal + Material → Ladekabel",
  "einfuehrung.ladekabel-selbst-verkaufen": "Ladekabel selbst verkaufen",
  "einfuehrung.tippe-unten-auf-markt": "Tippe unten auf «Markt» und dann auf «Selbst verkaufen».",
  "einfuehrung.produkt-verkauf-geld": "Produkt → Verkauf → Geld",
  "einfuehrung.verkaufsteam-einsetzen": "Verkaufsteam einsetzen",
  "einfuehrung.im-markt-beim-verkaufsteam": `Im Markt beim Verkaufsteam: Schieb den Regler auf {p1} Personen. Jede verkauft {p2} Packs pro Tag – zusammen mehr, als die Fabrik herstellt.`,
  "einfuehrung.das-verkaufsteam-verkauft-jeden": "Das Verkaufsteam verkauft jeden Tag – du musst nicht mehr selbst.",
  "einfuehrung.hier-noch-nicht-in": `Hier noch nicht. In der Einführung ist jetzt <b>{p1}</b> dran.`,
  "einfuehrung.hier-noch-nicht-folge": "Hier noch nicht. Folge Schritt für Schritt der Aufgabe – danach sind alle Orte offen.",
  "einfuehrung.noch-nicht-dran": `<button class="cta" data-tun="{p1}"{p2} disabled>Noch nicht dran</button>`,
  "einfuehrung.stelle-mehr-personen-ein": ">Stelle mehr Personen ein</h3>",
  "einfuehrung.dein-personal-in-der": ">Dein Personal in der Einführung</h3>",
  "einfuehrung.eingestellt-wird-an-der": `<div class="einfuehrung-bedarf">
        <b>Eingestellt wird an der Station</b>
        <small>Öffne eine Rohstoffquelle, Raffinerie oder Fabrik und schieb dort den Regler. Fehlende Leute werden dabei eingestellt – du siehst, was das jeden Monat an Lohn kostet.</small>
        <div class="bedarf-liste">{p1}</div>
      </div>`,
  "einfuehrung.erst-nach-der-einfuehrung": "Erst nach der Einführung",

  /* ---------- quest.js ---------- */
  "quest.fortschritt-in-der-lieferkette": "Fortschritt in der Lieferkette",
  "quest.phase": `Phase {p1}/4 · {p2}`,
  "quest.zusammenhang": `<b>Zusammenhang:</b> {p1}`,
  "quest.neues-wissen": "Neues Wissen",

  /* ---------- ziel-positiv.js ---------- */
  "zielpositiv.chf": "CHF ",
  "zielpositiv.gewinnziel-erreicht-fuer-die": `<div class="ziel-prognose gut"><b>Gewinnziel erreicht.</b> Für die Etappe brauchst du ausserdem einen Ruf von mindestens {p1}.</div>`,
  "zielpositiv.bis-zum-ziel-fehlen": `<div class="ziel-prognose warn">Bis zum Ziel fehlen noch <b>{p1}</b>. Im Moment kostet der Betrieb mehr, als er bringt – prüfe Engpässe und den Verkauf.</div>`,
  "zielpositiv.bei-diesem-tempo-erreichst": `<div class="ziel-prognose gut">Bei diesem Tempo erreichst du das Ziel in etwa <b>{p1} {p2}</b> – du hast noch {p3}.</div>`,
  "zielpositiv.noch-offen-erste-monatsabrechnung": `<b class="ziel-held-zahl leer">Noch offen</b><span>Erste Monatsabrechnung an Tag {p1}</span>`,
  "zielpositiv.einnahmen-minus-loehne-und": `<b class="ziel-held-zahl {p1}">{p2}{p3}</b><span>Einnahmen minus Löhne und Betrieb</span>`,
  "zielpositiv.laufendes-geschaeft-pro-monat": `<div class="karte ziel-held">
      <small>Laufendes Geschäft · pro Monat</small>
      {p1}
      {p2}
      {p3}
    </div>`,
  "zielpositiv.etappengewinn-mit-investitionen": "<span>Etappengewinn <small class=\"ziel-klein\">mit Investitionen</small></span>",
  "zielpositiv.investitionen-standorte-ausbau-leute": "Investitionen: Standorte, Ausbau, Leute, Verbesserungen. Sie lohnen sich erst über Verkäufe.",
  "zielpositiv.investitionen-sind-dein-aufbau": "Investitionen sind dein Aufbau: Standorte, Ausbau, Leute, Verbesserungen. Sie zahlen sich über das laufende Geschäft zurück.",

  /* ---------- stil.js ---------- */
  "stil.personen-einstellen": "$1 Personen einstellen",
  "stil.selbst-verkaufen": "Selbst verkaufen",
  "stil.verdoppeln": "Verdoppeln · ",

  /* ---------- karteninfo.js ---------- */
  "karteninfo.kartennamen-strg-halten-oder": "Kartennamen (Strg halten oder einschalten)",
  "karteninfo.kartennamen": "Kartennamen",

  /* ---------- bilder-intro.js ---------- */
  "bilderintro.intro-bilder-nicht-verfuegbar": "Intro-Bilder nicht verfügbar",

  /* ---------- produktentdeckungen.js ---------- */
  "produktentdeck.chips-berechnen-das-spielbild": "Chips berechnen das Spielbild. Ein Lüfter führt die Wärme ab.",
  "produktentdeck.der-bildschirm-nutzt-sehr": "Der Bildschirm nutzt sehr dünne, durchsichtige Schichten, die Strom leiten.",
  "produktentdeck.alle-materialien-anzeigen": `<details><summary>Alle Materialien anzeigen</summary>{p1}</details>`,
  "produktentdeck.dein-erstes": `Dein erstes {p1}!`,
  "produktentdeck.aus-drei-materialien-hast": "Aus drei Materialien hast du dein erstes Produkt hergestellt. Deine Lieferkette ist bereit für den Verkauf.",
  "produktentdeck.deine-fabrik-hat-das": "Deine Fabrik hat das erste Stück hergestellt.",
  "produktentdeck.produkt-entdeckt": "Produkt entdeckt",

  /* ---------- karte-mitte.js ---------- */
  "kartemitte.markt": "Markt",
  "kartemitte.team": "Team",
  "kartemitte.karte": "Karte",
  "kartemitte.ziel": "Ziel",
  "kartemitte.wissen": "Wissen",
  "kartemitte.karte-2": `<button class="orb" role="tab" data-seite="karte" aria-selected="{p1}" aria-label="Weltkarte"><span class="orbring globus">{p2}</span>Karte</button>`,

  /* ---------- blatt-ordnung.js ---------- */
  "blattordnung.belegschaft": "Belegschaft",
  "blattordnung.lohnstufe": "Lohnstufe",
  "blattordnung.zufriedenheit": "Zufriedenheit",
  "blattordnung.kosten-fuer-deine-belegschaft": "Kosten für deine Belegschaft · Förderung, sobald sich die Zufriedenheit eingependelt hat.",
  "blattordnung.ausbau": "Ausbau",
  "blattordnung.foerderung": `Förderung {p1}`,
  "blattordnung.lohnkosten": `Lohnkosten {p1}`,

  /* ---------- erzwelt-core.html ---------- */
  "kern.kupfer": "Kupfer",
  "kern.leiterbahnen-kabel-spulen": "Leiterbahnen, Kabel, Spulen",
  "kern.aluminium": "Aluminium",
  "kern.gehaeuse-kuehlkoerper": "Gehäuse, Kühlkörper",
  "kern.silizium": "Silizium",
  "kern.chips-prozessoren-speicher": "Chips, Prozessoren, Speicher",
  "kern.zinn": "Zinn",
  "kern.loetzinn-haelt-jede-platine": "Lötzinn – hält jede Platine zusammen",
  "kern.nickel": "Nickel",
  "kern.akku-kathode-kontakte": "Akku-Kathode, Kontakte",
  "kern.lithium": "Lithium",
  "kern.akku-speichert-die-ladung": "Akku – speichert die Ladung",
  "kern.kobalt": "Kobalt",
  "kern.akku-kathode-macht-sie": "Akku-Kathode, macht sie stabil",
  "kern.silber": "Silber",
  "kern.bester-leiter-kontakte-loetpaste": "Bester Leiter: Kontakte, Lötpaste",
  "kern.seltene-erden": "Seltene Erden",
  "kern.magnete-lautsprecher-vibration-motoren": "Magnete: Lautsprecher, Vibration, Motoren",
  "kern.tantal": "Tantal",
  "kern.kondensatoren-winzig-aber-unersetzlich": "Kondensatoren – winzig, aber unersetzlich",
  "kern.indium": "Indium",
  "kern.touchscreen-display-ito-schicht": "Touchscreen & Display (ITO-Schicht)",
  "kern.gold": "Gold",
  "kern.kontakte-die-nicht-rosten": "Kontakte, die nicht rosten dürfen",
  "kern.dr-kongo": "DR Kongo",
  "kern.ruanda": "Ruanda",
  "kern.guinea": "Guinea",
  "kern.ghana": "Ghana",
  "kern.indonesien": "Indonesien",
  "kern.peru": "Peru",
  "kern.mexiko": "Mexiko",
  "kern.bolivien": "Bolivien",
  "kern.china": "China",
  "kern.chile": "Chile",
  "kern.vietnam": "Vietnam",
  "kern.malaysia": "Malaysia",
  "kern.usa": "USA",
  "kern.kanada": "Kanada",
  "kern.australien": "Australien",
  "kern.deutschland": "Deutschland",
  "kern.griechenland": "Griechenland",
  "kern.finnland": "Finnland",
  "kern.russland": "Russland",
  "kern.kasachstan": "Kasachstan",
  "kern.usbekistan": "Usbekistan",
  "kern.portugal": "Portugal",
  "kern.braga": "Braga",
  "kern.in-braga-werden-elektronik": "In Braga werden Elektronik und Sensoren für Fahrzeuge gefertigt. Im Spiel kannst du am Standort verschiedene Produkte herstellen.",
  "kern.kolwezi": "Kolwezi",
  "kern.rund-des-weltweiten-kobalts": "Rund 70 % des weltweiten Kobalts kommt aus der DR Kongo. Ein Teil davon stammt aus Kleinstminen, in denen von Hand gegraben wird.",
  "kern.katanga": "Katanga",
  "kern.der-kongolesische-kupferguertel-gehoert": "Der kongolesische Kupfergürtel gehört zu den reichsten der Welt – Kobalt fällt oft als Nebenprodukt an.",
  "kern.rubaya": "Rubaya",
  "kern.coltan-erz-liefert-tantal": "Coltan-Erz liefert Tantal. Es zählt zu den vier «Konfliktmineralien», weil bewaffnete Gruppen am Abbau mitverdienen.",
  "kern.gatumba": "Gatumba",
  "kern.ruanda-exportiert-viel-tantal": "Ruanda exportiert viel Tantal – ein Teil stammt nachweislich aus dem Nachbarland Kongo.",
  "kern.bayan-obo": "Bayan Obo",
  "kern.die-groesste-lagerstaette-seltener": "Die grösste Lagerstätte Seltener Erden der Welt liegt in der Inneren Mongolei. China fördert rund 60 % – und verarbeitet fast 90 %.",
  "kern.jiangxi": "Jiangxi",
  "kern.china-stellt-etwa-des": "China stellt etwa 70 % des Rohsiliziums her. Der Prozess braucht viel elektrische Energie.",
  "kern.liuzhou": "Liuzhou",
  "kern.indium-wird-fast-nur": "Indium wird fast nur als Nebenprodukt der Zinkgewinnung gewonnen. Indium wird unter anderem für transparente leitfähige Schichten in Displays verwendet.",
  "kern.spruce-pine": "Spruce Pine",
  "kern.hochreiner-quarz-fuer-chip": "Hochreiner Quarz für Chip-Schmelztiegel kommt fast ausschliesslich aus diesem einen Tal in North Carolina.",
  "kern.mountain-pass": "Mountain Pass",
  "kern.mountain-pass-ist-die": "Mountain Pass ist die einzige grosse Mine für Seltene Erden in den USA. Ihr Erz wurde jahrelang zur Verarbeitung nach China verschifft.",
  "kern.greenbushes": "Greenbushes",
  "kern.australien-foerdert-etwa-die": "Australien fördert etwa die Hälfte des weltweit gewonnenen Lithiums – aus hartem Gestein, nicht aus Salzseen.",
  "kern.kalgoorlie": "Kalgoorlie",
  "kern.fuer-gramm-gold-werden": "Für 1 Gramm Gold werden oft über 1 Tonne Gestein bewegt. Im Spiel ist die Ausbeute deshalb niedrig angesetzt.",
  "kern.salar-de-atacama": "Salar de Atacama",
  "kern.im-lithiumdreieck-wird-salzlake": "Im «Lithiumdreieck» wird Salzlake verdunstet. Die Gewinnung benötigt viel Wasser in einer der trockensten Wüsten der Erde.",
  "kern.escondida": "Escondida",
  "kern.escondida-ist-die-groesste": "Escondida ist die grösste Kupfermine der Welt. Chile liefert rund ein Viertel des Weltkupfers.",
  "kern.fresnillo": "Fresnillo",
  "kern.mexiko-ist-seit-jahrhunderten": "Mexiko ist seit Jahrhunderten grösster Silberproduzent der Welt.",
  "kern.san-rafael": "San Rafael",
  "kern.zinn-wirkt-unspektakulaer-aber": "Zinn wirkt unspektakulär – aber ohne Lötzinn hält keine einzige Platine zusammen.",
  "kern.bangka": "Bangka",
  "kern.auf-bangka-wird-zinn": "Auf Bangka wird Zinn teils von Tauchern aus dem Meeresboden gesaugt – gefährlich und ökologisch heikel.",
  "kern.sulawesi": "Sulawesi",
  "kern.indonesien-ist-mit-abstand": "Indonesien ist mit Abstand grösster Nickelproduzent – dafür wird Regenwald gerodet.",
  "kern.obuasi": "Obuasi",
  "kern.neben-der-grossmine-gibt": "Neben der Grossmine gibt es viele illegale Kleinminen («Galamsey»), oft mit Quecksilber und Kinderarbeit.",
  "kern.guinea-hat-die-groessten": "Guinea hat die grössten Bauxitvorkommen der Welt. Aus Bauxit wird Aluminium.",
  "kern.distomo": "Distomo",
  "kern.in-der-gegend-um": "In der Gegend um Distomo wird Bauxit unter Tage gewonnen. Bauxit ist der Ausgangsstoff für Aluminium.",
  "kern.talnach": "Talnach",
  "kern.bei-talnach-in-der": "Bei Talnach in der Nähe von Norilsk wird unter Tage Erz gewonnen, das Nickel und Kupfer enthält.",
  "kern.aqtoghai": "Aqtoghai",
  "kern.muruntau": "Muruntau",
  "kern.muruntau-ist-ein-grosser": "Muruntau ist ein grosser Goldtagebau in der usbekischen Wüste Kysylkum.",
  "kern.guangdong": "Guangdong",
  "kern.china-verarbeitet-fast-der": "China verarbeitet fast 90 % der Seltenen Erden. Nicht der Abbau ist der Engpass, sondern die Raffination.",
  "kern.kuantan": "Kuantan",
  "kern.malaysia-ist-zweitgroesster-standort": "Malaysia ist zweitgrösster Standort für Seltene-Erden-Raffination – mit Streit um radioaktive Rückstände.",
  "kern.antofagasta": "Antofagasta",
  "kern.freiberg": "Freiberg",
  "kern.europa-baut-raffinerien-auf": "Europa baut Raffinerien auf, um weniger abhängig zu sein. Teuer, aber politisch gewollt.",
  "kern.texas": "Texas",
  "kern.die-usa-foerdern-eigene": "Die USA fördern eigene Raffinerien mit Subventionen – Stichwort Rohstoffsicherheit.",
  "kern.pori": "Pori",
  "kern.in-pori-wird-kupfer": "In Pori wird Kupfer mit elektrischem Strom gereinigt. Das hochreine Kupfer eignet sich zum Beispiel für Kabel.",
  "kern.pawlodar": "Pawlodar",
  "kern.ladekabel": "Ladekabel 10er-Pack",
  "kern.ein-ladekabel-ist-fast": "Verkauft wird im Pack zu 10 Stück. Ein Ladekabel ist fast nur Kupfer – dazu Aluminium für den Stecker und Zinn zum Löten. Das einfachste Gerät in deinem Katalog.",
  "kern.der-motor-treibt-das": "Der Motor treibt das E-Bike an. In diesem Motortyp steckt Kupfer in den Spulen, Aluminium im Gehäuse und Neodym aus der Gruppe der Seltenen Erden in den Permanentmagneten.",
  "kern.velocity-smartphone": "Velocity Smartphone",
  "kern.in-einem-smartphone-stecken": "In einem Smartphone stecken über 60 verschiedene Elemente. Fast keines davon wird recycelt.",
  "kern.eine-platine-ist-im": "Eine Platine ist im Grunde Kupfer auf Glasfaser – zusammengehalten von Zinn, kontaktiert mit Gold.",
  "kern.konsole-vortex": "Konsole Vortex 3er-Pack",
  "kern.der-lueftermotor-braucht-magnete": "Der Lüftermotor braucht Magnete aus Seltenen Erden – dieselben Elemente wie im Kopfhörer.",
  "kern.smart-tv": "Smart-TV 55\" 2er-Pack",
  "kern.jeder-touchscreen-und-jedes": "Jeder Touchscreen und jedes LCD hat eine hauchdünne, durchsichtige Indium-Zinn-Oxid-Schicht.",
  "kern.ein-bike-akku-enthaelt": "Ein E-Bike-Akku enthält ungefähr so viel Kobalt wie 30 Smartphones.",
  "kern.unter-ueblichem-lohn": "unter üblichem Lohn",
  "kern.ueblich": "üblich",
  "kern.landesueblicher-lohn": "landesüblicher Lohn",
  "kern.deutlich-ueber-ueblich-mit": "deutlich über üblich, mit Schutzausrüstung",
  "kern.die-lieferkette": "Die Lieferkette",
  "kern.mine-raffinerie-fabrik-markt": "Mine → Raffinerie → Fabrik → Markt: warum jedes Glied zählt.",
  "kern.nichts-in-deiner-firma": "Nichts in deiner Firma entsteht an einem Ort. Aus der Mine kommt <b>Roherz</b> – ein Gemisch aus Gestein und dem, was du eigentlich willst. Erst die <b>Raffinerie</b> trennt beides. Erst die <b>Fabrik</b> baut daraus ein Gerät. Und erst der <b>Markt</b> macht daraus Geld.",
  "kern.ein-smartphone-legt-vor": "Ein Smartphone legt vor dem Verkauf oft mehr als 100'000 Kilometer zurück.",
  "kern.rund-des-welthandels-laufen": "Rund 90 % des Welthandels laufen über Schiffe. Ein einziger Containerstau verschiebt Lieferungen um Monate.",
  "kern.die-teuerste-stelle-der": "Die teuerste Stelle der Kette ist selten die Mine – meistens ist es die Verarbeitung.",
  "kern.ladungsplanung": "Ladungsplanung",
  "kern.raffinerien-durchsatz": "Raffinerien +10 % Durchsatz",
  "kern.eigene-reederei": "Eigene Reederei",
  "kern.raffinerien-durchsatz-2": "Raffinerien +15 % Durchsatz",
  "kern.betriebskosten": "Betriebskosten −10 %",
  "kern.geologie-lagerstaetten": "Geologie & Lagerstätten",
  "kern.wo-erz-liegt-entscheidet": "Wo Erz liegt, entscheidet die Erdgeschichte – nicht die Politik.",
  "kern.rohstoffe-liegen-dort-wo": "Rohstoffe liegen dort, wo vor Millionen Jahren Vulkane, Meere oder Verwitterung sie angereichert haben. Deshalb sind die Karten so ungleich verteilt: Kobalt im kongolesischen Kupfergürtel, Lithium im Dreieck Chile–Bolivien–Argentinien, Bauxit in Guinea.",
  "kern.mit-dem-ausbau-einer": "Mit dem <b>Ausbau</b> einer Mine kaufst du genau das: Bagger, Förderbänder, Brecher. Jede Stufe bringt etwas mehr, jede zehnte Stufe verdoppelt die Förderung – und jede Stufe kostet mehr als die vorherige.",
  "kern.fuer-gramm-gold-wird": "Für 1 Gramm Gold wird oft über 1 Tonne Gestein bewegt.",
  "kern.der-cerro-rico-in": "Der Cerro Rico in Potosí wird seit 1545 abgebaut – seit fast 500 Jahren.",
  "kern.hochreiner-quarz-fuer-chip-2": "Hochreiner Quarz für Chip-Schmelztiegel kommt fast nur aus einem einzigen Tal in North Carolina.",
  "kern.erzader-kartierung": "Erzader-Kartierung",
  "kern.geologinnen-vermessen-die-adern": "Geologinnen vermessen die Adern, bevor gegraben wird. Weniger Fehlschläge, mehr Erz pro Schicht.",
  "kern.alle-minen-foerderung": "Alle Minen +10 % Förderung",
  "kern.tiefenbohrung": "Tiefenbohrung",
  "kern.alle-minen-foerderung-2": "Alle Minen +15 % Förderung",
  "kern.menschen-loehne": "Menschen & Löhne",
  "kern.der-lohn-entscheidet-ueber": "Der Lohn entscheidet über Zufriedenheit, Streik und deinen Ruf.",
  "kern.die-laender-mit-den": "Die Länder mit den tiefsten Löhnen sind oft genau jene mit den Rohstoffen, die wir für Smartphones brauchen. Das hat auch mit ihrer Geschichte zu tun, zum Beispiel mit der Kolonialzeit.",
  "kern.im-spiel-gilt-tiefe": "Im Spiel gilt: Tiefe Löhne senken deine Kosten <b>sofort</b>. Sie senken auch die Zufriedenheit. Unter 32 % wird gestreikt, und ein Streik stoppt die Förderung ganz. Sitzt du ihn aus, fällt dein Ruf – und ein schlechter Ruf senkt die Nachfrage nach allem, was du verkaufst.",
  "kern.in-kleinstminen-artisanal-mining": "In Kleinstminen («artisanal mining») arbeiten weltweit geschätzt über 40 Millionen Menschen.",
  "kern.schutzausruestung-kostet-einen-bruchteil": "Schutzausrüstung kostet einen Bruchteil eines Monatslohns und kann viele schwere Unfälle verhindern.",
  "kern.zufriedene-belegschaften-foerdern-im": "Zufriedene Belegschaften fördern im Spiel bis zu 60 % mehr als unzufriedene.",
  "kern.sicherheitsschulung": "Sicherheitsschulung",
  "kern.helm-gurt-beleuchtung-und": "Helm, Gurt, Beleuchtung und eine Stunde Schulung pro Woche. Weniger Unfälle, zufriedenere Leute.",
  "kern.zufriedenheit-in-allen-minen": "Zufriedenheit +5 in allen Minen",
  "kern.betriebliche-mitbestimmung": "Betriebliche Mitbestimmung",
  "kern.die-belegschaft-waehlt-eine": "Die Belegschaft wählt eine Vertretung, die mitredet. Konflikte kommen früher auf den Tisch.",
  "kern.zufriedenheit": "Zufriedenheit +8",
  "kern.ruf-sofort": "Ruf sofort +5",
  "kern.chemie-raffination": "Chemie & Raffination",
  "kern.aus-erz-wird-material": "Aus Erz wird Material – und der grösste Teil ist Abraum.",
  "kern.die-ausbeute-sagt-wie": "Die <b>Ausbeute</b> sagt, wie viel Material aus einer Einheit Roherz entsteht. Bei Silizium sind es 70 %, bei Gold nur 8 %. Der Rest ist Abraum: Gestein, Schlamm, Chemie.",
  "kern.nicht-der-abbau-ist": "Nicht der Abbau ist der weltweite Engpass, sondern die Raffination. China fördert rund 60 % der Seltenen Erden, verarbeitet aber fast 90 %.",
  "kern.aluminium-wird-aus-bauxit": "Aluminium wird aus Bauxit gewonnen und braucht dafür enorme Mengen Strom.",
  "kern.indium-faellt-fast-nur": "Indium fällt fast nur als Nebenprodukt der Zinkgewinnung an.",
  "kern.raffinerien-in-malaysia-stehen": "Raffinerien in Malaysia stehen wegen radioaktiver Rückstände seit Jahren in der Kritik.",
  "kern.prozesschemie": "Prozesschemie",
  "kern.bessere-loesungsmittel-und-temperaturfuehrung": "Bessere Lösungsmittel und Temperaturführung holen mehr aus demselben Erz.",
  "kern.ausbeute": "Ausbeute +10 %",
  "kern.rueckgewinnung-aus-abraum": "Rückgewinnung aus Abraum",
  "kern.was-frueher-auf-die": "Was früher auf die Halde ging, wird ein zweites Mal ausgewaschen.",
  "kern.ausbeute-2": "Ausbeute +15 %",
  "kern.fabrik-fertigung": "Fabrik & Fertigung",
  "kern.was-in-einem-geraet": "Was in einem Gerät steckt – und warum ein fehlendes Teil alles stoppt.",
  "kern.eine-fabrik-produziert-nur": "Eine Fabrik produziert nur so viel, wie das <b>knappste</b> Material zulässt. Fehlt Indium, hilft dir ein Berg Kupfer nichts. Genau das macht Lieferketten so verletzlich.",
  "kern.in-einem-smartphone-stecken-2": "In einem Smartphone stecken über 60 verschiedene Elemente. Fast keines davon wird heute vollständig zurückgewonnen.",
  "kern.lueftermotoren-und-lautsprecher-brauchen": "Lüftermotoren und Lautsprecher brauchen dieselben Magnete aus Seltenen Erden.",
  "kern.fliessband-feintuning": "Fliessband-Feintuning",
  "kern.kuerzere-wege-weniger-umbauzeit": "Kürzere Wege, weniger Umbauzeit, klarere Taktung an jeder Station.",
  "kern.fabriken-ausstoss": "Fabriken +12 % Ausstoss",
  "kern.vorfertigung-in-modulen": "Vorfertigung in Modulen",
  "kern.bauzeit": "Bauzeit −30 %",
  "kern.markt-preise": "Markt & Preise",
  "kern.nachfrage-lager-und-dollarkurs": "Nachfrage, Lager und Dollarkurs – und warum Verkaufen Arbeit ist.",
  "kern.fertige-produkte-muessen-verkauft": "Fertige Produkte müssen verkauft werden. Entweder du verkaufst selber, oder du stellst Verkäuferinnen an, die es jeden Tag für dich erledigen. Jede von ihnen setzt rund ",
  "kern.stueck-pro-tag-ab": " Stück pro Tag ab – und kostet Lohn.",
  "kern.der-markt-nimmt-pro": "Der Markt nimmt pro Tag nur eine bestimmte Menge auf. Produzierst du mehr, füllt sich das Lager und der Preis fällt um bis zu 35 %. Rohstoffe und Waren werden zudem weltweit in Dollar gehandelt: Ein starker Dollar verändert alle Preise.",
  "kern.der-lithiumpreis-fiel-zwischen": "Der Lithiumpreis fiel zwischen 2022 und 2024 um über 80 % – neue Minen lieferten zu viel.",
  "kern.exportbeschraenkungen-fuer-seltene-erden": "Exportbeschränkungen für Seltene Erden können den Preis binnen Wochen verdreifachen.",
  "kern.saison-zaehlt-konsolen-und": "Saison zählt: Konsolen und Fernseher verkaufen sich im November und Dezember fast doppelt so gut.",
  "kern.verkaufsschulung": "Verkaufsschulung",
  "kern.deine-verkaeuferinnen-lernen-wie": "Deine Verkäuferinnen lernen, wie man Grosskunden gewinnt statt Einzelstücke anzubieten.",
  "kern.verkaeufer-setzen-mehr-ab": "Verkäufer setzen 30 % mehr ab",
  "kern.direktvertrieb": "Direktvertrieb",
  "kern.du-lieferst-direkt-an": "Du lieferst direkt an Grosskunden statt über Zwischenhändler.",
  "kern.produktpreise": "Produktpreise +8 %",
  "kern.verkaeufer-setzen-mehr-ab-2": "Verkäufer setzen 20 % mehr ab",
  "kern.ruf-verantwortung": "Ruf & Verantwortung",
  "kern.recherchen-gesetze-und-kundinnen": "Recherchen, Gesetze und Kundinnen schauen genauer hin als früher. Ein Lieferkettengesetz verlangt Nachweise – wer sie nicht hat, zahlt Bussen. Wer sie hat, gewinnt Grosskunden.",
  "kern.vier-rohstoffe-gelten-offiziell": "Vier Rohstoffe gelten offiziell als «Konfliktmineralien»: Zinn, Tantal, Wolfram und Gold.",
  "kern.die-eu-und-die": "Die EU und die Schweiz verlangen von grossen Firmen Sorgfaltsprüfungen in der Lieferkette.",
  "kern.ein-einziger-medienbericht-kann": "Ein einziger Medienbericht kann die Nachfrage nach einem Produkt monatelang drücken.",
  "kern.transparenzbericht": "Transparenzbericht",
  "kern.du-legst-offen-woher": "Du legst offen, woher jedes Material kommt – nachprüfbar, mit Zahlen.",
  "kern.zertifizierte-lieferkette": "Zertifizierte Lieferkette",
  "kern.unabhaengige-stellen-pruefen-jede": "Unabhängige Stellen prüfen jede Mine. Skandale treffen dich weniger hart.",
  "kern.das-modell-im-code": "Das Modell im Code",
  "kern.ein-spiel-ist-immer": "Ein Spiel ist immer ein <b>Modell</b> – eine Vereinfachung. Wenn du die Formeln kennst, kannst du das Spiel schlagen und gleichzeitig sehen, wo es die Wirklichkeit verkürzt.",
  "kern.such-im-quelltext-die": "Such im Quelltext die Funktion <code>tagVor()</code>. Sie ist der Herzschlag des Spiels. In welcher Reihenfolge passiert was – und warum ist die Reihenfolge wichtig?",
  "kern.alle-zahlen-sind-gerundet": "Alle Zahlen sind gerundet und vereinfacht – echte Minen rechnen mit Dutzenden Faktoren.",
  "kern.ein-spieltag-folgt-dieser": "Ein Spieltag folgt dieser Reihenfolge: fördern, raffinieren, produzieren, verkaufen.",
  "kern.controlling": "Controlling",
  "kern.betriebskosten-2": "Betriebskosten −15 %",
  "kern.personalplanung": "Personalplanung",
  "kern.lohnsumme": "Lohnsumme −6 %",
  "kern.verkaufserloese": "Verkaufserlöse +20 %, Betriebskosten −50 %",
  "kern.standard-balancing": "normale Verkaufspreise",
  "kern.verkaufserloese-2": "Verkaufserlöse −30 %",
  "kern.punkte": "Punkte",
  "kern.schiffe": "Schiffe",
  "kern.flugzeuge": "Flugzeuge",
  "kern.mio": " Mio",
  "kern.bonus-aktiv-verkaufserloese": `✨ Bonus aktiv · Verkaufserlöse +{p1} %`,
  "kern.etappe-gestartet-naechste-abrechnung": `<b>Etappe {p1}</b> gestartet – nächste Abrechnung nach weiteren {p2} Tagen.`,
  "kern.streik-in": `Streik in {p1}, {p2}`,
  "kern.die-arbeiterinnen-und-arbeiter": `Die Arbeiterinnen und Arbeiter deiner {p1}-Mine legen die Arbeit nieder. Sie sagen: die Löhne reichen nicht zum Leben, und die Ausrüstung ist zu gefährlich. Die Förderung steht still. <b>Du musst entscheiden.</b>`,
  "kern.loehne-um-erhoehen": "Löhne um 20 % erhöhen",
  "kern.kostet-dauerhaft-mehr-zufriedenheit": "Kostet dauerhaft mehr, Zufriedenheit steigt sofort",
  "kern.loehne-in-erhoeht-die": `Löhne in {p1} erhöht. Die Arbeit läuft wieder.`,
  "kern.verhandeln-und-sicherheitsausruestung-stellen": "Verhandeln und Sicherheitsausrüstung stellen",
  "kern.einmalig-chf-ruf-steigt": "Einmalig CHF 60'000, Ruf steigt",
  "kern.verhandlung-in-ausruestung-bezahlt": `Verhandlung in {p1}: Ausrüstung bezahlt, Streik nach 5 Tagen beendet.`,
  "kern.aussitzen-und-streikende-ersetzen": "Aussitzen und Streikende ersetzen",
  "kern.kostet-nichts-mine-steht": "Kostet nichts, Mine steht 20 Tage, Ruf fällt stark",
  "kern.reportage-ueber-deine-lieferkette": "Reportage über deine Lieferkette",
  "kern.ein-recherche-team-veroeffentlicht": `Ein Recherche-Team veröffentlicht Bilder aus {p1}: Jugendliche schleppen Säcke, ohne Helm, ohne Vertrag. Dein Name steht im Artikel. Kunden fragen nach.`,
  "kern.unabhaengiges-audit-bezahlen-und": "Unabhängiges Audit bezahlen und Löhne anheben",
  "kern.chf-ruf-steigt-deutlich": "CHF 90'000, Ruf steigt deutlich",
  "kern.audit-beauftragt-loehne-angehoben": "Audit beauftragt, Löhne angehoben.",
  "kern.erklaeren-das-sei-ein": "Erklären, das sei ein Zulieferer gewesen",
  "kern.kostet-nichts-ruf-faellt": "Kostet nichts, Ruf fällt, Nachfrage sinkt 60 Tage",
  "kern.dementi-veroeffentlicht-die-nachfrage": "Dementi veröffentlicht. Die Nachfrage nach dem Smartphone bricht ein.",
  "kern.stolleneinsturz-in": `Stolleneinsturz in {p1}`,
  "kern.in-der-nacht-ist": `In der Nacht ist ein Stollen eingestürzt. Es gibt Verletzte. Die Behörden sperren die Mine, bis geklärt ist, wie es weitergeht.`,
  "kern.entschaedigung-zahlen-und-stollen": "Entschädigung zahlen und Stollen sichern",
  "kern.chf-mine-laeuft-in": "CHF 140'000, Mine läuft in 10 Tagen wieder",
  "kern.gesichert-entschaedigung-bezahlt": `{p1} gesichert, Entschädigung bezahlt.`,
  "kern.nur-das-noetigste-reparieren": "Nur das Nötigste reparieren",
  "kern.chf-mine-laeuft-in-2": "CHF 30'000, Mine läuft in 25 Tagen, Ruf fällt",
  "kern.notreparatur-in-die-belegschaft": `Notreparatur in {p1}. Die Belegschaft ist wütend.`,
  "kern.us-dollar-rohstoffe-und": `<b>US-Dollar {p1}</b> – Rohstoffe und Waren werden in Dollar gehandelt. Alle Preise {p2} 50 Tage lang um {p3} %.`,
  "kern.buschfeuer-in-australien-zufahrtsstrassen": "<b>Buschfeuer in Australien</b> – Zufahrtsstrassen gesperrt. Deine australischen Minen stehen 18 Tage still.",
  "kern.regenzeit-im-kongo-pisten": "<b>Regenzeit im Kongo</b> – Pisten sind unpassierbar. Förderung dort 30 Tage lang nur bei 55 %.",
  "kern.china-beschraenkt-den-export": "<b>China beschränkt den Export Seltener Erden</b> – der Preis verdreifacht sich für 80 Tage. Wer eigene Minen und Raffinerien hat, verdient jetzt.",
  "kern.erdbeben-bei-taiwan-chipfabriken": "<b>Erdbeben bei Taiwan</b> – Chipfabriken stehen still. Silizium wird teuer, fertige Geräte sind gefragt wie nie.",
  "kern.containerstau-in-shanghai-deine": "<b>Containerstau in Shanghai</b> – Rohstoffe kommen verspätet an. Deine Raffinerien verarbeiten 28 Tage lang nur 65 % ihrer Menge.",
  "kern.konkurrenz-zeigt-neues-modell": "<b>Konkurrenz zeigt neues Modell</b> – die Nachfrage nach deinem Velocity Smartphone fällt 45 Tage lang um 40 %.",
  "kern.lithium-preis-bricht-ein": "<b>Lithium-Preis bricht ein</b> – neue Minen weltweit liefern zu viel. Gut für Akku-Produzenten, schlecht für Lithium-Minen.",
  "kern.neues-lieferkettengesetz-deine-firma": "<b>Neues Lieferkettengesetz</b> – deine Firma kann die Herkunft nicht belegen. Busse: CHF 180'000.",
  "kern.neues-lieferkettengesetz-deine-nachweise": "<b>Neues Lieferkettengesetz</b> – deine Nachweise sind sauber. Grosskunden bestellen mehr Mainboards.",
  "kern.gewerkschaft-gegruendet-in-allen": "<b>Gewerkschaft gegründet</b> – in allen deinen Minen gilt neu mindestens der landesübliche Lohn.",
  "kern.altgeraete-ruecknahme-aus-alten": "<b>Altgeräte-Rücknahme</b> – aus alten Geräten gewinnst du Kupfer, Gold, Silber und Aluminium zurück, ganz ohne Mine.",
  "kern.eroeffne-deine-erste-mine": "Eröffne deine erste Mine",
  "kern.dein-erstes-produkt-ist": "Dein erstes Produkt ist ein Ladekabel. Dafür brauchst du Kupfer, Aluminium und Zinn – alles aus eigenen Minen. Tippe einen leuchtenden Pin an.",
  "kern.schick-deine-leute-in": "Schick deine Leute in die Mine",
  "kern.ohne-arbeiter-wird-nichts": "Ohne Arbeiter wird nichts gefördert. Tippe die Mine an und drück auf +10.",
  "kern.stelle-mehr-personen-ein": "Stelle mehr Personen ein",
  "kern.fuer-die-weiteren-minen": "Für die weiteren Minen brauchst du mehr Personal. Tippe unten auf den grossen goldenen Knopf und stell auf mindestens 40 Leute auf.",
  "kern.eroeffne-alle-drei-minen": "Eröffne alle drei Minen",
  "kern.kupfer-aluminium-und-zinn": "Kupfer, Aluminium und Zinn. Rohstoffe lassen sich nicht zukaufen – jedes Material kommt aus deiner eigenen Mine.",
  "kern.besetze-alle-drei-minen": "Besetze alle drei Minen",
  "kern.jede-mine-braucht-leute": "Jede Mine braucht Leute, sonst fördert sie nichts. Mindestens 5 pro Mine.",
  "kern.bau-eine-raffinerie": "Bau eine Raffinerie",
  "kern.roherz-laesst-sich-nicht": "Roherz lässt sich nicht verbauen. Erst die Raffinerie macht Material daraus.",
  "kern.besetze-die-raffinerie": "Besetze die Raffinerie",
  "kern.bau-die-kabelfabrik": "Bau die Kabelfabrik",
  "kern.besetze-die-fabrik": "Besetze die Fabrik",
  "kern.verkauf-deine-kabel-selber": "Verkauf deine Kabel selber",
  "kern.fertige-produkte-muessen-verkauft-2": "Fertige Produkte müssen verkauft werden. Geh in den Markt und drück auf «Selbst verkaufen».",
  "kern.stell-verkaeufer-an": "Stell Verkäufer an",
  "kern.jeden-tag-selbst-verkaufen": "Jeden Tag selbst verkaufen ist mühsam. Verkäuferinnen erledigen das für dich – gegen Lohn. Schick mindestens 2 Leute in den Verkauf. Ist niemand frei, stell zuerst im Team neue an.",
  "kern.im-tutorial-gesperrt": "Im Tutorial gesperrt",
  "kern.erledigt": "Erledigt: ",
  "kern.tutorial-geschafft-alle-standorte": "Tutorial geschafft – alle Standorte, alle Produkte und der Ausbau von Minen und Raffinerien sind jetzt offen.",
  "kern.team": `<button class="orb" role="tab" data-seite="team" aria-selected="{p1}" aria-label="Team – Personal einstellen">
         <span class="orbring">{p2}
           <span class="orbzahl {p3}">{p4}</span></span>Team</button>`,
  "kern.tippe-auf-einen-hellen": "Tippe auf einen hellen Pin. Günstig sind Boké, Katanga und Kolwezi.",
  "kern.schick-leute-in-die": "Schick Leute in die Mine",
  "kern.ohne-arbeiter-wird-nichts-2": "Ohne Arbeiter wird nichts gefördert.",
  "kern.streikgefahr-in": "Streikgefahr in ",
  "kern.zufriedenheit-unter-erhoeh-dort": "Zufriedenheit unter 35 %. Erhöh dort den Lohn.",
  "kern.roherz-allein-nuetzt-nichts": "Roherz allein nützt nichts. Erst die Raffinerie macht Material daraus.",
  "kern.die-raffinerie-steht-still": "Die Raffinerie steht still",
  "kern.deine-raffinerie-kommt-nicht": "Deine Raffinerie kommt nicht nach",
  "kern.mehr-arbeiter-dort-oder": "Mehr Arbeiter dort – oder eine zweite bauen.",
  "kern.bau-deine-erste-fabrik": "Bau deine erste Fabrik",
  "kern.deine-fabrik-hat-keine": "Deine Fabrik hat keine Leute",
  "kern.es-fehlt": "Es fehlt ",
  "kern.rohstoffe-kannst-du-nicht": "Rohstoffe kannst du nicht zukaufen. Eröffne dafür eine eigene Mine.",
  "kern.deine-ware-bleibt-liegen": "Deine Ware bleibt liegen",
  "kern.stell-im-markt-verkaeufer": "Stell im Markt Verkäufer an – oder verkauf einmal selber.",
  "kern.das-lager-fuellt-sich": "Das Lager füllt sich schneller als du verkaufst",
  "kern.mehr-verkaeufer-anstellen-sonst": "Mehr Verkäufer anstellen, sonst fällt der Preis.",
  "kern.dein-ruf-ist-tief": "Dein Ruf ist tief",
  "kern.das-senkt-die-nachfrage": "Das senkt die Nachfrage nach allen Produkten. Prüf die Löhne.",
  "kern.neues-wissen-ist-bezahlbar": "Neues Wissen ist bezahlbar",
  "kern.im-reiter-wissen-im": `Im Reiter Wissen: «{p1}» im Feld {p2}.`,
  "kern.verdopplung-in": "Verdopplung in ",
  "kern.moeglich": " möglich",
  "kern.die-naechste-ausbaustufe-verdoppelt": "Die nächste Ausbaustufe verdoppelt dort die Förderung.",
  "kern.du-hast-geld-auf": "Du hast Geld auf der Seite",
  "kern.bau-eine-mine-oder": "Bau eine Mine oder Raffinerie aus – jede zehnte Stufe verdoppelt.",
  "kern.aufgabe": `Aufgabe {p1}/{p2}`,
  "kern.etappenabschluss": "Etappenabschluss",
  "kern.rohstoff": " Rohstoff",
  "kern.ausbau-stufe-reihe-jede": `<div class="karte">
    <div class="ausbaukopf"><h3>Ausbau</h3>
      {p1}</div>
    <div class="ort">Stufe {p2} · Reihe {p3} · {p4} ×{p5}</div>
    <div class="ausbaureihe">{p6}</div>
    <div class="zeile"><span>{p7}</span>
      <b>{p8}</b></div>
    {p9}
    <div class="notiz">Jede Stufe bringt +5 % und kostet mehr als die vorherige. Jede zehnte Stufe verdoppelt die Leistung.</div>
  </div>`,
  "kern.rohstoffquelle": `<div class="titelzeile">{p1}
    <div><h2>{p2}</h2><div class="ort">{p3} · Rohstoffquelle</div></div></div>`,
  "kern.ergiebigkeit-rohstoff-plaetze-ueblicher": `<div class="werte">
        <div class="wert"><span class="wi">{p1}</span><span class="wt"><small>Ergiebigkeit</small><b>{p2} Rohstoff</b></span></div>
        <div class="wert"><span class="wi">{p3}</span><span class="wt"><small>Plätze</small><b>{p4}</b></span></div>
        <div class="wert"><span class="wi">{p5}</span><span class="wt"><small>Üblicher Lohn</small><b>{p6}</b></span></div>
        <div class="wert"><span class="wi">{p7}</span><span class="wt"><small>Wofür</small><b style="font-size:var(--f0)">{p8}</b></span></div>
      </div>
      <div class="notiz">{p9}</div>
      <button class="cta {p10}" data-tun="mine-auf" data-id="{p11}" {p12}>
        {p13}{p14}</button>`,
  "kern.sicherheit-sicherheitsmassnahmen-senken-das": `<div class="karte sicherheitskarte {p1}">
      <h3>Sicherheit</h3>
      <div class="ort">Sicherheitsmassnahmen senken das Unfallrisiko – unabhängig vom Lohn.</div>
      <div class="zeile"><span>Status</span><b style="color:{p2}">{p3}</b></div>
      {p4}
    </div>`,
  "kern.foerderung-tag-lohnkosten-belegschaft": `<div class="werte">
      <div class="wert"><span class="wi">{p1}</span><span class="wt"><small>Förderung</small><b>{p2}/Tag</b></span></div>
      <div class="wert"><span class="wi">{p3}</span><span class="wt"><small>Lohnkosten</small><b>{p4}</b></span></div>
    </div>

    <div class="karte">
      <h3>Belegschaft</h3>
      <div class="ort">{p5} von {p6} Plätzen · {p7} Personen frei im Team</div>
      <div style="display:flex;justify-content:center">{p8}</div>
      <div class="crewzeile">
        <button data-tun="crew" data-id="{p9}" data-n="-10" {p10}>−10</button>
        <button data-tun="crew" data-id="{p11}" data-n="-1" {p12}>−</button>
        <div class="zahl"><b>{p13}</b><small>von {p14}</small></div>
        <button data-tun="crew" data-id="{p15}" data-n="1" {p16}>+</button>
        <button data-tun="crew" data-id="{p17}" data-n="10" {p18}>+10</button>
      </div>
      <div class="leiste"><i style="width:{p19}%;background:#6fb8e0"></i></div>
    </div>

    {p20}

    <div class="karte">
      <h3>Lohnstufe</h3>
      <div class="ort">Der Lohn beeinflusst die Zufriedenheit</div>
      <div class="segment">{p21}</div>
      <div class="zeile"><span>{p22}</span><b>{p23} pro Person und Monat</b></div>
      <div class="zeile"><span>Zielwert Zufriedenheit</span><b>{p24} %</b></div>
    </div>

    {p25}

    <div class="karte zufriedenheitskarte">
      <h3>Zufriedenheit</h3>
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:64px;flex:none">{p26}</div>
        <div style="flex:1;min-width:0">
          <div class="leiste"><i style="width:{p27}%;background:{p28}"></i></div>
          <div class="zeile" style="padding-top:4px"><span>{p29}</span><b>{p30} %</b></div>
        </div>
      </div>
    </div>

    <div class="notiz">{p31}</div>
    {p32}`,
  "kern.raffinerie": `<div class="titelzeile">{p1}
    <div><h2>{p2}</h2><div class="ort">{p3} · Raffinerie</div></div></div>`,
  "kern.kapazitaet-tag-plaetze-lohn": `<div class="werte">
        <div class="wert"><span class="wi">{p1}</span><span class="wt"><small>Kapazität</small><b>{p2}/Tag</b></span></div>
        <div class="wert"><span class="wi">{p3}</span><span class="wt"><small>Plätze</small><b>{p4}</b></span></div>
        <div class="wert"><span class="wi">{p5}</span><span class="wt"><small>Lohn</small><b>{p6}</b></span></div>
        <div class="wert"><span class="wi">{p7}</span><span class="wt"><small>Betrieb</small><b>{p8}/Mt.</b></span></div>
      </div>
      {p9}
      <div class="notiz">{p10}</div>
      <button class="cta {p11}" data-tun="raff-bau" data-id="{p12}" {p13}>
        {p14}{p15}</button>`,
  "kern.durchsatz-tag-rohstoff-im": `
    <div class="werte">
      <div class="wert"><span class="wi">{p1}</span><span class="wt"><small>Durchsatz</small><b>{p2}/Tag</b></span></div>
      <div class="wert"><span class="wi">{p3}</span><span class="wt"><small>Rohstoff im Lager</small><b>{p4}</b></span></div>
    </div>
    {p5}
    <div class="karte">
      <h3>Belegschaft</h3>
      <div class="ort">{p6} Personen frei im Team</div>
      <div class="crewzeile">
        <button data-tun="rcrew" data-id="{p7}" data-n="-5" {p8}>−5</button>
        <button data-tun="rcrew" data-id="{p9}" data-n="-1" {p10}>−</button>
        <div class="zahl"><b>{p11}</b><small>von {p12}</small></div>
        <button data-tun="rcrew" data-id="{p13}" data-n="1" {p14}>+</button>
        <button data-tun="rcrew" data-id="{p15}" data-n="5" {p16}>+5</button>
      </div>
      <div class="leiste"><i style="width:{p17}%;background:#5b8f7a"></i></div>
    </div>
    {p18}
    <div class="notiz">Aus 1 Einheit Rohstoff wird je nach Material unterschiedlich viel nutzbares Material. Der Rest steht im Spielmodell für Abraum und Verluste.</div>
    <div class="notiz blau">{p19}</div>`,
  "kern.fabrikstandort-lohn-monat": `<div class="titelzeile">{p1}
    <div><h2>{p2}</h2><div class="ort">{p3}Fabrikstandort · Lohn {p4}/Monat</div></div></div>
    {p5}`,
  "kern.im-bau-noch-tage": `<div class="karte"><h3>{p1}</h3>
      <div class="ort">Im Bau – noch {p2} Tage</div>
      {p3}
      <div class="leiste"><i style="width:{p4}%;background:var(--gold)"></i></div></div>`,
  "kern.verkauf-nachfrage-tag-vereinfachtes": `<div class="karte"><h3>{p1}</h3>
      <div class="ort">Verkauf {p2} · Nachfrage {p3}/Tag</div>
      {p4}
      <div class="ort" style="margin-top:7px">Vereinfachtes Rezept · Spielmodell</div>
      <div class="stueck">{p5}</div>
      <div class="crewzeile">
        <button data-tun="fcrew" data-i="{p6}" data-n="-5" {p7}>−5</button>
        <button data-tun="fcrew" data-i="{p8}" data-n="-1" {p9}>−</button>
        <div class="zahl"><b>{p10}</b><small>von {p11}</small></div>
        <button data-tun="fcrew" data-i="{p12}" data-n="1" {p13}>+</button>
        <button data-tun="fcrew" data-i="{p14}" data-n="5" {p15}>+5</button>
      </div>
      <div class="zeile"><span>Produktion heute</span><b>{p16} Stück</b></div>
      <div class="zeile"><span>Lager</span><b>{p17} Stück</b></div>
      {p18}</div>`,
  "kern.verkaufspreis-bauzeit-tage-plaetze": `<div class="karte"><h3>{p1}</h3>
      <div class="ort">Verkaufspreis {p2} · Bauzeit {p3} Tage · {p4} Plätze</div>
      <div class="ort" style="margin-top:7px">Vereinfachtes Rezept · Spielmodell</div>
      <div class="stueck">{p5}</div>
      <div class="notiz">{p6}</div>
      <button class="cta gruen" data-tun="fab-bau" data-p="{p7}" data-l="{p8}" {p9}>
        {p10}{p11}</button></div>`,
  "kern.rohstoffquelle-2": "Rohstoffquelle ",
  "kern.raffinerie-2": "Raffinerie ",
  "kern.fabrik": "Fabrik ",
  "kern.ohne-einsatz": "Ohne Einsatz",
  "kern.dein-team-lohnkosten-im": `<h1>Dein Team</h1><div class="unter">Lohnkosten im Spielmodell</div>

    <div class="karte" style="text-align:center;background:linear-gradient(#fffdf6,#fdf3dd)">
      <div style="display:flex;justify-content:center"><div style="width:min(300px,80%)">{p1}</div></div>
      <h3 style="font-size:var(--f4);margin-top:6px">Stelle mehr Personen ein</h3>
      <div class="ort">Ohne Personal fördert keine Rohstoffquelle und läuft keine Fabrik</div>
      {p2}
      <button class="cta riesig {p3}" data-tun="anstellen" {p4}>
        {p5}{p6}</button>
      <button class="cta still" data-tun="entlassen" {p7}>−5 entlassen · nur freie Leute</button>
    </div>

    <div class="karte">
      <div class="werte">
        <div class="wert"><span class="wi">{p8}</span><span class="wt"><small>Angestellt</small><b>{p9}</b></span></div>
        <div class="wert"><span class="wi">{p10}</span><span class="wt"><small>Ohne Aufgabe</small><b style="color:{p11}">{p12}</b></span></div>
        <div class="wert"><span class="wi">{p13}</span><span class="wt"><small>Löhne pro Monat</small><b>{p14}</b></span></div>
        <div class="wert"><span class="wi">{p15}</span><span class="wt"><small>Ø je Spieltag</small><b>{p16}</b></span></div>
      </div>
      <div class="notiz">Nicht eingeteilte Leute kosten {p17} pro Person und Monat. Stell nur so viele an, wie du beschäftigen kannst.</div>
    </div>

    <div class="karte" id="team-einsaetze"><h3>Wer arbeitet wo?</h3>
      {p18}
      <div class="zeile"><span>Personalkosten pro Monat</span><b id="team-personalkosten">{p19}</b></div>
      <div class="zeile"><span>Betriebskosten pro Monat</span><b id="team-betriebskosten">{p20}</b></div>
      <div class="notiz">Laufende Kosten werden alle 30 Spieltage abgerechnet.</div>
      <div class="zeile team-ausgaben-summe"><strong>Gesamtausgaben pro Monat</strong><b id="team-gesamtausgaben">{p21}</b></div>
    </div>
    {p22}`,
  "kern.ziel-etappe-alle-tage": `<h1>Ziel · Etappe {p1}</h1><div class="unter">Alle {p2} Tage kommt eine Abrechnung – danach kannst du weiterspielen</div>
    <div class="karte" style="background:linear-gradient(#fffdf6,#fdf3dd)">
      <div class="zeile"><span>Schwierigkeit</span><b>{p3} {p4}</b></div>
      <div class="ort">{p5}{p6}</div>
      <div class="zeile" style="margin-top:10px"><span>Nächste Abrechnung</span><b>Tag {p7}</b></div>
      <div class="zeile"><span>Verbleibende Tage</span><b>{p8}</b></div>
    </div>
    <div class="karte">
      <div class="zeile"><span>Etappengewinn</span><b>{p9}</b></div>
      <div class="leiste"><i style="width:{p10}%;background:var(--gold)"></i></div>
      <div class="ort">Ziel {p11} · Gesamtgewinn seit Start {p12}</div>
      <div class="zeile" style="margin-top:12px"><span>Ruf</span><b style="color:{p13}">{p14}</b></div>
      <div class="leiste"><i style="width:{p15}%;background:var(--gruen)"></i></div>
      <div class="ort">Ziel {p16} · Ein niedriger Ruf senkt die Nachfrage nach allen deinen Produkten</div>
    </div>
    <div class="karte"><h3>Lager</h3>
      {p17}</div>
    <div class="karte"><h3>Finanzierte Verbesserungen</h3>
      {p18}</div>
    <div class="karte"><h3>Lieferkettennachweise</h3>
      <div class="zeile"><span>Status</span><b style="color:{p19}">{p20}</b></div>
      <div class="notiz">Nachweise entscheiden bei Lieferkettengesetzen. Dein Ruf ist davon getrennt und beeinflusst die Nachfrage.</div></div>
    <div class="karte"><h3>Meldungen</h3>
      {p21}</div>
    <button class="cta still" data-tun="reset">Neue Runde starten</button>`,
  "kern.wissen-das-spiel-pausiert": `<h1>Wissen</h1><div class="unter">⏸ Das Spiel pausiert hier automatisch. Beim Verlassen läuft es im vorherigen Tempo weiter.</div>
    <div class="karte" style="display:flex;align-items:center;gap:14px">
      <div style="width:52px;flex:none;color:var(--gold)">{p1}</div>
      <div style="flex:1;min-width:0">
        <b style="font-family:'Baloo 2',sans-serif;font-size:var(--f3)">{p2} von {p3} Verbesserungen finanziert</b>
        <div class="leiste"><i style="width:{p4}%;background:var(--gold)"></i></div>
        <small style="color:var(--grau);font-size:var(--f0)">Lesen ist gratis. Geld kosten nur Verbesserungen – und die erst, wenn du die Voraussetzung im Spiel erfüllt hast.</small>
      </div>
    </div>
    {p5}`,
  "kern.finanziert": `<div class="perkkarte fertig"><span class="marke">Finanziert</span>
      <h3>{p1}</h3><p>{p2}</p>
      <div class="wirkung">{p3}</div></div>`,
  "kern.anwendung": `<div class="perkkarte">
      <span class="marke">Anwendung</span>
      <h3>{p1}</h3><p>{p2}</p>
      <div class="wirkung">{p3}</div>
      {p4}
      <button class="cta {p5}" data-tun="perk" data-p="{p6}" {p7}>
        {p8}{p9}</button>
    </div>`,
  "kern.vollstaendig-alle-verbesserungen-finanziert": `<div class="perkkarte fertig"><span class="marke">Vollständig</span>
        <h3>Alle Verbesserungen finanziert</h3><p>Du hast alle Verbesserungen aus «{p1}» finanziert.</p></div>`,
  "kern.formeln": `<div class="karte"><h3>Formeln</h3><table>{p1}</table></div>`,
  "kern.ausbeute-zeile": "Ausbeute {p1} %",
  "kern.woher-die-rohstoffe-kommen": `<div class="karte"><h3>Woher die Rohstoffe kommen</h3>
    <table><tr><th>Rohstoff → Material</th><th>Wichtige Förderländer</th></tr>
    {p1}</table>
    <div class="notiz blau"><b>Spielmodell:</b> Ergiebigkeit und Mengen sind vereinfachte Werte.</div></div>`,
  "kern.was-in-einem-geraet-2": `<div class="karte"><h3>Was in einem Gerät steckt</h3>
    <div class="notiz blau"><b>Vereinfachte Rezepte:</b> stark vereinfachte Materialanteile, keine Stücklisten realer Geräte.</div>{p1}</div>`,
  "kern.monatsloehne-im-vergleich-spielmodell": `<div class="karte"><h3>Monatslöhne im Vergleich</h3>
    <table><tr><th>Land</th><th class="n">Üblicher Lohn pro Person und Monat</th></tr>{p1}</table>
    <div class="notiz"><b>Spielmodell:</b> Diese Lohnwerte sind vereinfachte Spielwerte und keine aktuelle Statistik.</div></div>`,
  "kern.zum-merken": `
    <div class="titelzeile" style="padding-right:52px">
      <span class="sicon" style="background:{p1}22;color:{p2};width:48px;height:48px;border-radius:14px;display:grid;place-items:center;flex:none">{p3}</span>
      <div><h2>{p4}</h2><div class="ort">{p5}</div></div></div>
    {p6}
    {p7}{p8}{p9}{p10}
    <div class="karte"><h3>Zum Merken</h3>
      {p11}</div>
    {p12}{p13}`,
  "kern.meldungstakt-hilfe": "Bei Meldungen läuft die Zeit halb so schnell, damit du sie lesen kannst. «Bei vielen Meldungen»: erst ab dem zweiten Tag mit Meldung in Folge.",
  "kern.gleich-lassen": "Normal",
  "kern.bei-folgen": "Bei vielen Meldungen",
  "kern.jeder-meldungstag": "Bei jeder Meldung",
  "kern.einstellungen-alles-wird-sofort": `
    <h2>Einstellungen</h2>
    <div class="unter">Alles wird sofort übernommen und gespeichert.</div>
    {p1}
    {p2}
    {p3}
    <div class="reglerzeile">
      <div class="kopf lieferanzeige-auswahl">
        <label for="lieferanzeige"><b>Liefersymbole</b></label>
        <select id="lieferanzeige">{p4}</select>
      </div>
    </div>
    {p5}
    {p6}
    {p7}
    <button type="button" class="cta still" data-tun="intro-wiederholung">Intro erneut ansehen</button>
    <div class="karte" style="margin-top:18px">
      <h3>Fortschritt</h3>
      <div class="zeile"><span>Spielstand</span><b id="aktiver-spielstand"></b></div>
      <div class="notiz">{p8}</div>
      <p id="spielstand-fehler" class="notiz" role="alert" hidden></p>
      <button class="cta" data-spielstand="menue">Speichern &amp; zum Hauptmenü</button>
      <button class="cta still" data-spielstand="export">Spielstand exportieren</button>
    </div>`,
  "kern.die-schwierigkeit-veraendert-nur": `Einfach: Verkauf bringt 20 % mehr und die Betriebskosten sind halb so hoch. <b>Mittel</b>: normale Preise und Kosten. Schwer wird frei, sobald du eine Etappe auf Mittel geschafft hast.`,
  "kern.ereignis": "Ereignis",
  "kern.rohstoffquelle-eroeffnet-jetzt-personal": `Rohstoffquelle <b>{p1}</b> eröffnet. Jetzt Personal zuweisen.`,
  "kern.lohnstufe-in-auf-erhoeht": `Lohnstufe in <b>{p1}</b> auf «{p2}» erhöht.`,
  "kern.fabrik-fuer-in-fertig": `Fabrik für <b>{p1}</b> in {p2} – fertig in {p3} Tagen.`,
  "kern.leute-angestellt-fuer": `<b>{p1} Leute</b> angestellt. Sie kosten ab jetzt Lohn jeden Monat.`,
  "kern.anstellen-kostet-nur-lohn": "Anstellen kostet nichts extra – nur den Lohn jeden Monat.",
  "kern.zu-wenig-geld-anstellen": "Kasse im Minus – zuerst Geld verdienen",
  "kern.selber-verkauft-stueck-fuer": `Selber verkauft: <b>{p1} Stück</b> für {p2}.`,
  "kern.auf-stufe-ausgebaut-die": `<b>{p1}</b> auf Stufe {p2} ausgebaut – die Leistung ist jetzt <b>doppelt</b> so hoch.`,
  "kern.verbesserung-finanziert": `Verbesserung finanziert: <b>{p1}</b> · {p2}`,
  "kern.leute": " Leute",
  "kern.im-tutorial-genuegen": "Im Tutorial genügen ",
  "kern.stelle": "STELLE ",
  "kern.personen-ein": " PERSONEN EIN",
  "kern.neu-ware-verkauft-sich": "Neu: Ware verkauft sich nicht mehr von allein. Du hast ein kleines Verkaufsteam bekommen – im Markt kannst du es vergrössern."
});

function textVon(schluessel, werte){
  const text = TEXTE_DE[schluessel];
  if (text === undefined) throw new Error("Text fehlt: " + schluessel);
  return werte ? text.replace(/\{(\w+)\}/g, (_, k) => String(werte[k])) : text;
}

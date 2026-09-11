"use strict";
/* ============================================================
   GLOBALER SEK-B TEXT-AUDIT

   Letzter Copy-Layer nach didactic-complexity.js.
   Ziel:
   - kurze sichtbare Texte;
   - pro Satz möglichst nur ein Gedanke;
   - Mechanik, Zahlen und Fachbegriffe bleiben erhalten;
   - Tabellen und kompakte Kennzahlen werden nicht künstlich vereinfacht.
   ============================================================ */

(function(){
  /* ---------- Wissen: Anwendungstexte auf Wirkung konzentrieren ---------- */
  const perkTexte={
    kette1:"Bessere Planung erhöht den Raffineriedurchsatz.",
    kette2:"Die Verbesserung erhöht den Durchsatz und senkt die Betriebskosten.",
    geo1:"Bessere Kartierung erhöht die Förderung.",
    geo2:"Tiefenbohrungen erhöhen die Förderung.",
    leute1:"Ein gemeinsamer Standard senkt die Kosten für Sicherheitsausbauten.",
    leute2:"Mitbestimmung erhöht Zufriedenheit und Ruf.",
    chem1:"Bessere Prozesse erhöhen die Ausbeute.",
    chem2:"Rückgewinnung erhöht die Ausbeute.",
    fab1:"Bessere Abläufe erhöhen den Fabrikausstoss.",
    fab2:"Vorfertigung erhöht den Ausstoss und verkürzt die Bauzeit.",
    markt1:"Schulung erhöht die Verkaufskapazität.",
    markt2:"Direktvertrieb erhöht Preis und Verkaufskapazität.",
    ruf1:"Ein Transparenzbericht stärkt im Spiel Ruf und Nachfrage.",
    ruf2:"Prüfungen stärken die Nachfrage und dämpfen Rufverluste.",
    mod1:"Controlling senkt die Betriebskosten.",
    mod2:"Personalplanung senkt die Lohnsumme."
  };
  for(const seg of WISSEN){
    for(const p of seg.perks||[]) if(perkTexte[p.id]) p.text=perkTexte[p.id];
  }

  /* Lange Trivia-Blöcke werden durch kurze, für das Spiel relevante Merksätze ersetzt. */
  const geologie=WISSEN.find(s=>s.id==="geologie");
  if(geologie) geologie.fakten=[
    "Lagerstätten entstehen durch geologische Prozesse.",
    "Rohstoffe sind weltweit ungleich verteilt."
  ];
  const fabrik=WISSEN.find(s=>s.id==="fabrik");
  if(fabrik) fabrik.fakten=[
    "Leiterplatten brauchen unter anderem Kupfer und Zinn.",
    "Akkus brauchen mehrere Metalle, zum Beispiel Lithium, Nickel und Kobalt."
  ];
  const markt=WISSEN.find(s=>s.id==="markt");
  if(markt) markt.fakten=[
    "Nachfrage kann sich durch Ereignisse ändern.",
    "Ein grosses Lager kann den Verkaufspreis senken.",
    "Der US-Dollar kann Fertigwarenpreise verändern."
  ];

  if(SCHWIERIGKEIT?.mittel) SCHWIERIGKEIT.mittel.effekt="Standard";

  function kurz(text){
    if(typeof text!=="string") return text;
    return text
      /* Markt */
      .replaceAll("Fertige Fertige Produkte müssen verkauft werden","Fertige Produkte müssen verkauft werden")
      .replaceAll("Einmal pro Tag kannst du selbst verkaufen. Für den täglichen Verkauf setzt du Leute im Verkaufsteam ein.","Selbst verkaufen: einmal pro Tag. Das Verkaufsteam verkauft automatisch.")
      .replaceAll("Rohstoffpreise am Weltmarkt werden nicht berechnet. Die Rohstoffe stammen im Spiel aus eigenen Quellen und werden anschliessend raffiniert.","Rohstoffe kommen aus eigenen Quellen. Weltmarktpreise für Rohstoffe werden nicht berechnet.")
      /* Team */
      .replaceAll("Stell mehr Leute an","Mehr Personal einstellen")
      .replaceAll("Stelle mehr Leute an","Mehr Personal einstellen")
      .replaceAll("Ohne Leute fördert keine Mine und läuft keine Fabrik","Ohne Personal stehen Rohstoffquellen und Fabriken still.")
      .replaceAll("Nicht eingeteilte Leute kosten CHF 200 pro Monat. Stell nur so viele an, wie du beschäftigen kannst.","Freies Personal kostet CHF 200 pro Monat. Stelle nur so viele Personen ein, wie du brauchst.")
      .replaceAll("Nicht eingeteilte Leute kosten CHF 200 pro Monat. Stelle nur so viele an, wie du beschäftigen kannst.","Freies Personal kostet CHF 200 pro Monat. Stelle nur so viele Personen ein, wie du brauchst.")
      .replaceAll("Spielmodell: Die Lohnwerte sind vereinfacht und keine aktuelle Lohnstatistik.","Spielmodell: Löhne sind vereinfachte Spielwerte.")
      /* Ziel / Etappe */
      .replace(/Alle (\d+) Tage kommt eine Abrechnung – danach kannst du weiterspielen/g,"Nach $1 Tagen wird abgerechnet. Danach kannst du weiterspielen.")
      .replace(/Ziel (\d+) · Ein niedriger Ruf senkt die Nachfrage nach allen deinen Produkten/g,"Ziel $1 · Niedriger Ruf senkt die Nachfrage.")
      .replaceAll("Noch keine Verbesserung umgesetzt. Im Reiter Wissen siehst du, welche Voraussetzungen noch fehlen.","Noch keine Verbesserung finanziert. Im Reiter Wissen siehst du die Voraussetzungen.")
      .replaceAll("Noch keine Wissens-Verbesserung umgesetzt. Im Reiter Wissen siehst du, welche Praxisbezüge noch fehlen.","Noch keine Verbesserung finanziert. Im Reiter Wissen siehst du die Voraussetzungen.")
      .replaceAll("Nachweise entscheiden bei Lieferkettengesetzen. Dein Ruf ist davon getrennt und beeinflusst die Nachfrage.","Nachweise werden bei Lieferkettengesetzen geprüft. Ruf beeinflusst die Nachfrage.")
      .replaceAll("Du hast Geld verdient <b>und</b> den Ruf gehalten. Du kannst jetzt weiterbauen und dich der nächsten gleich langen Etappe stellen.","Ziel erreicht. Du kannst mit derselben Firma weiterspielen.")
      .replaceAll("Der Gewinn stimmt, aber der Ruf nicht. Du darfst trotzdem weiterspielen und es in der nächsten Etappe erneut versuchen.","Gewinnziel erreicht, Rufziel verfehlt. Du kannst trotzdem weiterspielen.")
      .replaceAll("Der Gewinn reicht noch nicht. Du darfst trotzdem weiterspielen und deine Lieferkette in der nächsten Etappe verbessern.","Gewinnziel verfehlt. Du kannst trotzdem weiterspielen.")
      .replaceAll("<b>🔥 Schwer freigeschaltet!</b> Du kannst Schwer ab der nächsten neuen Runde wählen.","<b>🔥 Schwer freigeschaltet.</b> Ab der nächsten Runde verfügbar.")
      .replace(/Nochmals (\d+) Tage mit derselben Firma/g,"Gleiche Firma · weitere $1 Tage")
      .replaceAll("Schwierigkeit neu wählen · alles auf Anfang","Neue Schwierigkeit · Neustart")
      .replaceAll("Gleicher Run · Verkaufserlöse ab jetzt +50 %","Gleiche Firma · Verkaufserlöse +50 %")
      .replace(/Deine Kasse ist unter −CHF 800[’']000 gefallen\. Die laufende Reise endet an Tag (\d+)\./g,"Kasse unter −CHF 800'000. Die Runde endet an Tag $1.")
      /* Wissen */
      .replaceAll("⏸ Das Spiel pausiert hier automatisch. Beim Verlassen läuft es im vorherigen Tempo weiter.","⏸ Das Spiel pausiert hier. Beim Verlassen läuft es weiter.")
      .replaceAll("Wissen ist frei zugänglich. Geld wird nur für Verbesserungen verwendet, deren Voraussetzung im Spiel bereits erfüllt ist.","Wissen kostet nichts. Geld brauchst du nur für Verbesserungen.")
      .replaceAll("✓ Voraussetzung erfüllt. Die Verbesserung kann jetzt finanziert werden.","✓ Voraussetzung erfüllt.")
      .replaceAll("Vereinfachte Rezepte: stark vereinfachte Materialanteile, keine Stücklisten realer Geräte.","Vereinfachte Rezepte: keine echten Stücklisten.")
      /* Ausbau / Raffinerie */
      .replaceAll("Jede Stufe bringt +5 % und kostet mehr als die vorherige. Jede zehnte Stufe verdoppelt die Ausbringung.","Jede Stufe bringt +5 %. Jede zehnte Stufe verdoppelt die Leistung.")
      .replaceAll("Aus 1 Einheit Rohstoff wird je nach Material unterschiedlich viel nutzbares Material. Der Rest steht im Spielmodell für Abraum und Verluste.","Aus Rohstoff entsteht unterschiedlich viel Material. Der Rest steht im Spiel für Abraum und Verluste.")
      .replaceAll("+25 % Durchsatz für diese Rohstoffe. Alle anderen Rohstoffe können hier weiterhin normal verarbeitet werden. Die Spezialisierung ist eine Spielregel.","+25 % Durchsatz für diese Rohstoffe. Andere Rohstoffe werden normal verarbeitet.")
      /* Einstellungen */
      .replaceAll("Verschiebt die Grösse aller Texte. Die kleinste Schrift im Spiel wächst mit.","Ändert die Grösse aller Texte.")
      .replaceAll("Wie schnell ein Spieltag vergeht. Die Knöpfe 1× und 4× oben rechnen darauf auf.","Ändert die Dauer eines Spieltags.")
      /* Ereignisse / Meldungen */
      .replaceAll("Die Belegschaft streikt. Die Zufriedenheit ist wegen des Lohns sehr niedrig. Die Förderung steht still.","Die Zufriedenheit ist wegen des Lohns sehr niedrig. Deshalb streikt die Belegschaft und die Förderung steht still.")
      .replaceAll("<b>Erdbeben bei Taiwan</b> – andere Elektronikfirmen können weniger liefern. Einige Kunden wechseln zu deiner Firma. Die Nachfrage nach Smartphones und Konsolen steigt 70 Tage lang um 50 %.","<b>Erdbeben bei Taiwan</b> – andere Firmen können weniger Elektronik liefern. Einige Kunden wechseln zu dir; die Nachfrage steigt 70 Tage lang um 50 %.")
      .replace(/<b>Lieferkettengesetz<\/b> – deine Nachweise sind ([^.]+)\. Grosskunden mit Nachweispflicht können bei dir bestellen\. Die Mainboard-Nachfrage steigt 90 Tage lang\./g,"<b>Lieferkettengesetz</b> – deine Nachweise sind $1. Grosskunden können bestellen; die Mainboard-Nachfrage steigt 90 Tage lang.")
      .replaceAll("<b>Altgeräte-Rücknahme</b> – aus alten Geräten gewinnst du Kupfer, Gold, Silber und Aluminium zurück, ganz ohne Mine.","<b>Altgeräte-Rücknahme</b> – du gewinnst Kupfer, Gold, Silber und Aluminium zurück.")
      .replaceAll("Velocity Phone","Velocity Smartphone")
      .replaceAll("Sicherheitsmassnahmen verbessern und Betroffene entschädigen","Sicherheit verbessern")
      .replaceAll("CHF 140'000 · Sicherheit verbessert · 10 Tage Stillstand","CHF 140'000 · Entschädigung · 10 Tage Stillstand")
      .replaceAll("Neu: Ware verkauft sich nicht mehr von allein. Du hast ein kleines Verkaufsteam bekommen – im Markt kannst du es vergrössern.","Neu: Fertige Produkte müssen verkauft werden. Du hast ein kleines Verkaufsteam erhalten.")
      .replaceAll("Die Kasse ist im Minus. Ohne Gegensteuer ist die Firma bald zahlungsunfähig.","Die Kasse ist im Minus. Bei −CHF 800'000 endet die Runde.");
  }

  /* ---------- Häufige HTML-Flächen ---------- */
  for(const name of ["blattMine","blattRaff","blattFab","seiteMarkt","seiteTeam","seiteZiel","seiteWissen"]){
    const original=globalThis[name];
    if(typeof original!=="function") continue;
    globalThis[name]=function(...args){ return kurz(original.apply(this,args)); };
  }

  /* ---------- Wissensdetail ---------- */
  if(typeof lupeFuellen==="function"){
    const original=lupeFuellen;
    lupeFuellen=function(...args){
      const out=original.apply(this,args);
      const root=document.getElementById("lupeinhalt");
      if(root) root.innerHTML=kurz(root.innerHTML);
      return out;
    };
  }

  /* ---------- Wegweiser / Tutorial ---------- */
  if(typeof questZeichnen==="function"){
    const original=questZeichnen;
    questZeichnen=function(...args){
      const out=original.apply(this,args);
      const titel=document.getElementById("q-titel"),text=document.getElementById("q-text");
      if(titel) titel.textContent=kurz(titel.textContent);
      if(text) text.textContent=kurz(text.textContent);
      return out;
    };
  }

  /* ---------- Einstellungen ---------- */
  if(typeof einstFuellen==="function"){
    const original=einstFuellen;
    einstFuellen=function(...args){
      const out=original.apply(this,args);
      const root=document.getElementById("einstinhalt");
      if(root) root.innerHTML=kurz(root.innerHTML);
      return out;
    };
  }

  /* ---------- Schwierigkeit ---------- */
  if(typeof schwierigkeitZeigen==="function"){
    const original=schwierigkeitZeigen;
    schwierigkeitZeigen=function(...args){
      const out=original.apply(this,args);
      const text=document.getElementById("d-text");
      if(text) text.innerHTML="Die Schwierigkeit verändert nur den Verkaufserlös. Schwer wird nach einer erfolgreichen Mittel-Etappe frei.";
      document.querySelectorAll("#d-wahlen .wahl small").forEach(el=>{ el.textContent=kurz(el.textContent).replace("Standard-Balancing","Standard"); });
      return out;
    };
  }

  /* ---------- Ereignisdialoge und Meldungen ---------- */
  if(typeof dialogZeigen==="function"){
    const original=dialogZeigen;
    dialogZeigen=function(d){
      if(!d||typeof d!=="object") return original(d);
      const x={...d};
      x.art=kurz(x.art); x.titel=kurz(x.titel); x.text=kurz(x.text);
      if(Array.isArray(x.wahlen)) x.wahlen=x.wahlen.map(w=>({...w,text:kurz(w.text),klein:kurz(w.klein)}));
      return original(x);
    };
  }
  if(typeof notiz==="function"){
    const original=notiz;
    notiz=function(text,art){ return original(kurz(text),art); };
  }

  if(typeof naechsterSchritt==="function"){
    const original=naechsterSchritt;
    naechsterSchritt=function(){
      const w=original();
      return w?[kurz(w[0]),kurz(w[1])]:w;
    };
  }

  window.__erzweltGlobalTextAudit={version:1,target:"Sek B",rule:"1-2 short sentences"};
})();

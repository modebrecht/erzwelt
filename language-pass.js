"use strict";
/* Sprachlicher Korrekturpass für sichtbare Texte.
   Ziel: sachliches Schweizer Hochdeutsch, kurze didaktische Aussagen,
   keine Änderungen an Spielregeln oder Berechnungen. */

(function(){
  const ersetzen = [
    ["Spiel-Schwerpunkt", "Raffinerie-Spezialisierung"],
    ["kein Schwerpunkt", "keine Spezialisierung"],
    ["Praxisbezug:", "Voraussetzung:"],
    ["Praxisbezug erfüllt.", "Voraussetzung erfüllt."],
    ["Erlebt – du kannst die Verbesserung jetzt finanzieren.", "Voraussetzung erfüllt. Die Verbesserung kann jetzt finanziert werden."],
    ["Noch nicht erfüllt.", "Voraussetzung noch nicht erfüllt."],
    ["Erst im Spiel beobachten", "Voraussetzung noch nicht erfüllt"],
    ["Wissens-Verbesserung", "Verbesserung"],
    ["Verbesserung umgesetzt:", "Verbesserung finanziert:"],
    ["Verbesserungen umgesetzt", "Verbesserungen finanziert"],
    ["Verbesserung umsetzen", "Verbesserung finanzieren"],
    ["Alle Verbesserungen umgesetzt", "Alle Verbesserungen finanziert"],
    ["Umgesetzte Verbesserungen", "Finanzierte Verbesserungen"],
    ["Umgesetzt", "Finanziert"],
    ["Ein Wissensfeld passt zu deiner Erfahrung", "Voraussetzung für eine Verbesserung erfüllt"],
    ["Ein Ausbau steht vor einem Sprung", "Nächste Ausbaustufe mit grösserer Wirkung"],
    ["Material hat noch kein Ziel", "Noch keine Fabrik vorhanden"],
    ["Rohstoff wird noch nicht zu Material", "Noch keine Raffinerie vorhanden"],
    ["Rohstofflager wächst", "Rohstoffbestand ist hoch"],
    ["Das Warenlager wächst", "Warenbestand ist hoch"],
    ["Unruhe in ", "Tiefe Zufriedenheit in "],
    ["Die Nachfrage leidet unter deinem Ruf", "Ein tiefer Ruf senkt die Nachfrage"],
    ["Ruf und Nachfrage leiden", "Ruf sinkt · Nachfrage sinkt"],
    ["Die Nachfrage leidet.", "Die Nachfrage sinkt."],
    ["Ware verkauft sich nicht von allein", "Fertige Produkte müssen verkauft werden"],
    ["Fertige Ware verkauft sich nicht von allein", "Fertige Produkte müssen verkauft werden"],
    ["SELBER VERKAUFEN", "SELBST VERKAUFEN"],
    ["Selber verkaufen", "Selbst verkaufen"],
    ["selber verkaufen", "selbst verkaufen"],
    ["Stell im Team neue Leute an.", "Stelle im Team weitere Personen ein."],
    ["Stell zuerst im Team neue Leute an", "Stelle zuerst im Team weitere Personen ein"],
    [" Leute frei", " Personen frei"],
    [" Leute ohne Aufgabe", " Personen ohne Aufgabe"],
    ["Kein Weltpreis-Spielsystem: Primärrohstoffe kommen aus deinen eigenen Quellen und werden raffiniert. Recycling kann später einen Teil ersetzen.", "Rohstoffpreise am Weltmarkt werden nicht berechnet. Die Rohstoffe stammen im Spiel aus eigenen Quellen und werden anschliessend raffiniert."],
    ["Aktuelle Sondereffekte", "Aktuelle Einflüsse"],
    ["Hafen-Durchsatz", "Durchsatz im Hafen"],
    ["Dollar / Fertigwaren", "US-Dollar / Fertigwaren"],
    ["Spielrezept · stark vereinfacht", "Vereinfachtes Rezept · Spielmodell"],
    ["Spielrezepte:", "Vereinfachte Rezepte:"],
    ["Setzen ab", "Verkaufskapazität"],
    ["Spielwerte sind gerundet und vereinfacht; reale Lieferketten haben deutlich mehr Faktoren.", "Die Werte sind gerundet und vereinfacht. Reale Lieferketten umfassen weitere Einflussfaktoren."],
    ["Die Reihenfolge im Tagesschritt ist Absicht:", "Ein Spieltag folgt dieser Reihenfolge:"],
    ["Rohstoff-Weltmarktpreise werden im Spiel bewusst nicht simuliert.", "Rohstoffpreise am Weltmarkt werden im Spiel nicht berechnet."],
    ["Transportkosten und Lieferzeiten werden in Erzwelt bewusst nicht berechnet.", "Transportkosten und Lieferzeiten werden in Erzwelt nicht berechnet."],
    ["Das ist eine Spielregel, keine Behauptung über die reale Anlage.", "Diese Spezialisierung ist eine Spielregel und beschreibt keine reale Anlage."],
    ["Der Schwerpunkt ist eine Spielregel.", "Die Spezialisierung ist eine Spielregel."],
    ["Orientierung: Transportkosten und Lieferzeiten werden nicht berechnet.", "Die Entfernung dient der geografischen Orientierung. Transportkosten und Lieferzeiten werden nicht berechnet."],
    ["rein visuell · keine Transportkosten oder Lieferzeiten", "Darstellung ohne Transportkosten und Lieferzeiten"],
    ["Sichtbare Lieferkette", "Beispiel einer Lieferkette"],
    ["Transportfluss", "Transportweg"],
    ["Wegweiser", "Hinweis"],
    ["Nächster Schritt", "Hinweis"],
    ["Die Belegschaft legt die Arbeit wegen der Lohnsituation nieder.", "Die Belegschaft streikt. Die Zufriedenheit ist wegen des gewählten Lohns sehr tief."],
    ["Streik aussitzen", "Keine Einigung suchen"],
    [" ausgesessen.", " ohne Einigung fortgesetzt."],
    ["Sichern und entschädigen", "Sicherheitsmassnahmen verbessern und entschädigen"],
    ["Sicherheit bleibt offen", "Sicherheitsmassnahmen bleiben unverändert"],
    ["Geld kauft nicht das Wissen. Es finanziert die konkrete Verbesserung, nachdem du den Zusammenhang im Spiel erlebt hast.", "Wissen ist frei zugänglich. Geld wird nur für Verbesserungen verwendet, deren Voraussetzung im Spiel bereits erfüllt ist."],
    ["Acht Felder. Wissen kostet nichts: Lies nach, beobachte das Prinzip im Spiel und finanziere danach eine passende Verbesserung.", "Die acht Wissensbereiche können jederzeit gelesen werden. Eine Verbesserung kann finanziert werden, sobald ihre Voraussetzung im Spiel erfüllt ist."],
    ["Phones", "Smartphones"],
    ["Phone", "Smartphone"]
  ];

  function textKorrigieren(text){
    if(typeof text!=="string") return text;
    let out=text;
    for(const [von,nach] of ersetzen) out=out.split(von).join(nach);
    return out;
  }

  function dialogKorrigieren(d){
    if(!d||typeof d!=="object") return d;
    const kopie={...d};
    if(typeof kopie.art==="string") kopie.art=textKorrigieren(kopie.art);
    if(typeof kopie.titel==="string") kopie.titel=textKorrigieren(kopie.titel);
    if(typeof kopie.text==="string") kopie.text=textKorrigieren(kopie.text);
    if(Array.isArray(kopie.wahlen)) kopie.wahlen=kopie.wahlen.map(w=>({
      ...w,
      text:textKorrigieren(w.text),
      klein:textKorrigieren(w.klein)
    }));
    return kopie;
  }

  const tutorialTexte={
    mine1:["Eröffne eine Rohstoffquelle", "Für das Ladekabel brauchst du Kupfer, Aluminium und Zinn. Eröffne zuerst eine passende Rohstoffquelle."],
    minecrew:["Personal zuweisen", "Eine Rohstoffquelle fördert nur mit Personal. Weise der geöffneten Quelle mindestens 10 Personen zu."],
    team:["Personal einstellen", "Für weitere Standorte brauchst du zusätzliches Personal. Erhöhe den Personalbestand auf mindestens 40 Personen."],
    minen3:["Drei Rohstoffquellen eröffnen", "Eröffne je eine Quelle für Kupfererz, Bauxit und Zinnerz. Daraus entstehen Kupfer, Aluminium und Zinn."],
    crew3:["Rohstoffquellen besetzen", "Weise jeder der drei Rohstoffquellen mindestens 5 Personen zu."],
    raff:["Raffinerie bauen", "Rohstoffe können nicht direkt in der Fabrik verwendet werden. Baue eine Raffinerie, die daraus nutzbares Material herstellt."],
    raffcrew:["Raffinerie besetzen", "Weise der Raffinerie mindestens 5 Personen zu. Ohne Personal findet keine Verarbeitung statt."],
    fab:["Kabelfabrik bauen", "Baue eine Fabrik für Ladekabel. Im Tutorial ist zunächst nur dieses Produkt verfügbar."],
    fabcrew:["Fabrik besetzen", "Sobald die Fabrik fertig gebaut ist, weise ihr Personal zu. Danach kann sie Ladekabel herstellen."],
    verkauf:["Ladekabel verkaufen", "Öffne den Markt und verkaufe die hergestellten Ladekabel einmal selbst."],
    verkaeufer:["Verkaufsteam einsetzen", "Weise mindestens 2 Personen dem Verkauf zu. Falls kein Personal frei ist, stelle zuerst weitere Personen ein."]
  };
  for(const t of TUTORIAL){
    const neu=tutorialTexte[t.id];
    if(neu){t.titel=neu[0];t.text=neu[1];}
  }

  const kette=WISSEN.find(s=>s.id==="kette");
  if(kette){
    kette.kurz="Rohstoffquelle → Raffinerie → Fabrik → Markt.";
    kette.text=[
      "Eine Lieferkette verbindet mehrere Standorte. Nach dem Tutorial zeigt die Karte einen Beispielweg von einer Rohstoffquelle über eine Raffinerie zu einer Fabrik.",
      "Die angezeigte Entfernung dient der geografischen Orientierung. Transportkosten und Lieferzeiten werden im Spiel nicht berechnet."
    ];
  }
  const chemie=WISSEN.find(s=>s.id==="chemie");
  if(chemie){
    chemie.text=[
      "Die <b>Ausbeute</b> ist ein vereinfachter Wert. Sie gibt an, wie viel nutzbares Material im Spiel aus einer Einheit Rohstoff entsteht.",
      "Jede Raffinerie kann alle Rohstoffe verarbeiten. Für bestimmte Rohstoffe besitzt sie eine Spezialisierung mit 25 % höherem Durchsatz. Diese Spezialisierung ist eine Spielregel und beschreibt keine reale Anlage."
    ];
  }
  const markt=WISSEN.find(s=>s.id==="markt");
  if(markt){
    markt.kurz="Nachfrage, Lagerbestand und US-Dollar-Kurs bei Fertigwaren.";
    markt.text=[
      "Fertige Produkte werden selbst oder durch das Verkaufsteam verkauft.",
      "Das Spiel berechnet Preis und Nachfrage der Fertigwaren. Rohstoffpreise am Weltmarkt werden nicht berechnet."
    ];
  }
  const ruf=WISSEN.find(s=>s.id==="ruf");
  if(ruf){
    ruf.kurz="Ruf beeinflusst die Nachfrage. Nachweise dokumentieren die Herkunft der Rohstoffe.";
    ruf.text=[
      "Der <b>Ruf</b> beschreibt die Wahrnehmung des Unternehmens durch die Kundschaft. Ein tiefer Ruf senkt die Nachfrage.",
      "<b>Nachweise</b> dokumentieren die Herkunft der Rohstoffe. Das Lieferkettengesetz prüft diese Nachweise unabhängig vom Ruf."
    ];
  }
  const leute=WISSEN.find(s=>s.id==="leute");
  if(leute){
    leute.kurz="Lohn beeinflusst die Zufriedenheit; Sicherheitsmassnahmen beeinflussen das Unfallrisiko.";
    leute.text=[
      "Der <b>Lohn</b> beeinflusst im Spiel die Zufriedenheit. Bei sehr tiefer Zufriedenheit kann es zu einem Streik kommen.",
      "<b>Sicherheitsmassnahmen</b> senken das Unfallrisiko. Lohn und Sicherheit werden als getrennte Entscheidungen behandelt."
    ];
  }
  const modell=WISSEN.find(s=>s.id==="modell");
  if(modell){
    modell.text=[
      "Erzwelt ist ein <b>vereinfachtes Modell</b>. Mengen, Kosten, Löhne und Rezepte sind Spielwerte und keine aktuellen Statistiken.",
      "Das Modell zeigt ausgewählte Zusammenhänge einer Lieferkette. Vergleiche, welche Faktoren dargestellt werden und welche in der Realität zusätzlich eine Rolle spielen."
    ];
    modell.fakten=(modell.fakten||[]).map(textKorrigieren);
  }

  for(const seg of WISSEN){
    seg.titel=textKorrigieren(seg.titel);
    seg.kurz=textKorrigieren(seg.kurz);
    if(Array.isArray(seg.text)) seg.text=seg.text.map(textKorrigieren);
    if(Array.isArray(seg.fakten)) seg.fakten=seg.fakten.map(textKorrigieren);
    for(const p of seg.perks||[]){
      p.titel=textKorrigieren(p.titel);
      p.text=textKorrigieren(p.text);
      if(Array.isArray(p.wirkung)) p.wirkung=p.wirkung.map(textKorrigieren);
    }
  }

  if(typeof notiz==="function"){
    const original=notiz;
    notiz=function(text,art){ return original(textKorrigieren(text),art); };
  }
  if(typeof dialogZeigen==="function"){
    const original=dialogZeigen;
    dialogZeigen=function(d){ return original(dialogKorrigieren(d)); };
  }
  if(typeof flieger==="function"){
    const original=flieger;
    flieger=function(text,...rest){ return original(textKorrigieren(text),...rest); };
  }

  const wrapHtml=name=>{
    const original=globalThis[name];
    if(typeof original!=="function") return;
    globalThis[name]=function(...args){ return textKorrigieren(original.apply(this,args)); };
  };
  ["blattMine","blattRaff","blattFab","seiteMarkt","seiteTeam","seiteZiel","seiteWissen"].forEach(wrapHtml);

  if(typeof lupeFuellen==="function"){
    const original=lupeFuellen;
    lupeFuellen=function(...args){
      const r=original.apply(this,args);
      const root=document.getElementById("lupeinhalt");
      if(root) root.innerHTML=textKorrigieren(root.innerHTML);
      return r;
    };
  }

  if(typeof naechsterSchritt==="function"){
    const original=naechsterSchritt;
    naechsterSchritt=function(){
      const w=original();
      if(!w) return w;
      return [textKorrigieren(w[0]),textKorrigieren(w[1])];
    };
  }
  if(typeof questZeichnen==="function"){
    const original=questZeichnen;
    questZeichnen=function(){
      const r=original();
      if(!tutorialLaeuft()){
        const art=document.getElementById("q-art");
        if(art&&art.textContent==="Wegweiser") art.textContent="Hinweis";
      }
      return r;
    };
  }

  if(typeof ensureTransportLegend==="function"){
    const original=ensureTransportLegend;
    ensureTransportLegend=function(sichtbar){
      const legend=original(sichtbar);
      if(legend&&sichtbar) legend.innerHTML="<b>Transportweg</b><br><span style='font-weight:700'>LKW → Schiff → LKW</span><br><span style='font-weight:600;opacity:.78'>Darstellung ohne Transportkosten und Lieferzeiten</span>";
      return legend;
    };
  }
  if(typeof updateRouteNote==="function"){
    const original=updateRouteNote;
    updateRouteNote=function(r){
      original(r);
      const note=document.getElementById("didaktik-route-note");
      if(note) note.innerHTML=textKorrigieren(note.innerHTML);
    };
  }

  window.__erzweltLanguagePass={version:2,locale:"de-CH"};
})();

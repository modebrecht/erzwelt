"use strict";
/* ============================================================
   SEK-B DIDACTIC DATA

   Direct, declarative teaching copy and event semantics.
   No string-search replacements and no HTML renderer wrapping.
   ============================================================ */

(function(){
  const mineInfo={
    kolwezi:"In der DR Kongo wird viel Kobalt gewonnen. Ein Teil stammt aus kleinen Minen mit Handarbeit.",
    katanga:"Im Kupfergürtel der DR Kongo werden Kupfer und oft auch Kobalt gewonnen.",
    rubaya:"Coltan liefert Tantal. Der Abbau kann mit Konflikten und illegalem Handel verbunden sein.",
    kigali:"Ruanda fördert und exportiert Tantal. Lieferketten in der Region sind nicht immer leicht zu prüfen.",
    bayanobo:"Bayan Obo ist eine grosse Lagerstätte für Seltene Erden in China.",
    jiangxi:"In China wird viel Rohsilizium hergestellt. Die Verarbeitung braucht viel elektrische Energie.",
    liuzhou:"Indium entsteht meist als Nebenprodukt der Zinkgewinnung. Es wird unter anderem für Displays genutzt.",
    sprucepine:"Der Standort steht im Spiel für besonders reinen Quarz als Ausgangsstoff für Silizium.",
    mountainpass:"Mountain Pass ist eine grosse Lagerstätte für Seltene Erden in den USA.",
    greenbushes:"Greenbushes ist eine grosse Lithium-Mine in Australien. Das Lithium stammt aus Hartgestein.",
    kalgoorlie:"Gold kommt oft nur in kleinen Mengen im Gestein vor. Deshalb muss viel Material bewegt werden.",
    atacama:"Im Salar de Atacama wird Lithium aus Salzlake gewonnen. Wasser ist in der trockenen Region ein wichtiges Thema.",
    escondida:"Escondida in Chile ist eine sehr grosse Kupfermine.",
    fresnillo:"Mexiko ist ein wichtiger Standort für Silberabbau.",
    sanrafael:"Zinn wird für Lötverbindungen in Elektronik gebraucht.",
    bangka:"Auf Bangka wird Zinn auch im Meer gewonnen. Die Arbeit kann gefährlich sein und die Umwelt belasten.",
    sulawesi:"Auf Sulawesi wird viel Nickel gewonnen. Der Abbau kann grosse Flächen beanspruchen.",
    obuasi:"In der Region gibt es grosse und kleine Goldminen. Kleine Minen können schwer zu kontrollieren sein.",
    boke:"Bauxit ist der wichtigste Rohstoff für Aluminium. Guinea besitzt grosse Bauxitvorkommen.",
    potosi:"Am Cerro Rico bei Potosí wird seit Jahrhunderten Silber abgebaut."
  };
  for(const m of MINEN){ if(mineInfo[m.id]) m.info=mineInfo[m.id]; }

  const raffInfo={
    r_china:"China ist ein wichtiger Standort für die Verarbeitung vieler Rohstoffe.",
    r_malay:"In Malaysia werden unter anderem Seltene Erden verarbeitet.",
    r_chile:"Dieser Standort liegt nahe an wichtigen Rohstoffgebieten in Chile.",
    r_de:"Dieser Standort zeigt im Spiel eine europäische Raffinerie mit hohen Kosten.",
    r_usa:"Dieser Standort zeigt im Spiel eine US-Raffinerie mit hohen Kosten."
  };
  for(const r of RAFF_ORTE){ if(raffInfo[r.id]) r.info=raffInfo[r.id]; }

  const produktInfo={
    kabel:"Ein Ladekabel braucht mehrere Materialien. Kupfer leitet den Strom.",
    phone:"Ein Smartphone braucht viele verschiedene Materialien aus mehreren Ländern.",
    board:"Eine Leiterplatte verbindet elektronische Bauteile. Kupfer und Lötmetalle sind dabei wichtig.",
    konsole:"Eine Spielkonsole braucht unter anderem Kupfer, Silizium und Magnete.",
    tv:"Displays brauchen verschiedene Materialien. Indium kann in leitfähigen Schichten eingesetzt werden.",
    akku:"Ein E-Bike-Akku braucht unter anderem Lithium, Nickel, Kobalt, Kupfer und Aluminium."
  };
  for(const [id,text] of Object.entries(produktInfo)){ if(PRODUKT[id]) PRODUKT[id].info=text; }

  const materialVerwendung={
    zinn:"Lötverbindungen auf Leiterplatten",
    lithium:"Lithium-Ionen-Akkus",
    kobalt:"Kathodenmaterial in Akkus",
    silber:"Elektrische Kontakte und Lötpasten",
    seltene:"Permanentmagnete in Lautsprechern und Motoren",
    tantal:"Kondensatoren in elektronischen Geräten",
    indium:"Transparente leitfähige Schichten in Displays (ITO)",
    gold:"Korrosionsbeständige elektrische Kontakte"
  };
  for(const [id,text] of Object.entries(materialVerwendung)){ if(MATERIAL[id]) MATERIAL[id].wofuer=text; }

  const wissen={
    kette:{
      kurz:"Rohstoffquelle → Raffinerie → Fabrik → Markt.",
      text:["Eine Lieferkette verbindet mehrere Orte.","Im Spiel siehst du einen Beispielweg. Transportkosten und Lieferzeiten werden nicht berechnet."],
      fakten:["Rohstoffe werden zuerst gewonnen und danach verarbeitet.","Fehlt eine Station, kann die nächste Station nicht weiterarbeiten."]
    },
    geologie:{
      kurz:"Rohstoffe kommen aus verschiedenen Regionen der Welt.",
      text:["Nicht jeder Rohstoff kommt überall vor.","Darum liegen Rohstoffquellen in verschiedenen Ländern und Regionen."],
      fakten:["Lagerstätten entstehen durch geologische Prozesse.","Rohstoffe sind weltweit ungleich verteilt."]
    },
    leute:{
      kurz:"Lohn und Sicherheit wirken auf verschiedene Dinge.",
      text:["Der Lohn beeinflusst im Spiel die Zufriedenheit. Sehr niedrige Zufriedenheit kann zu einem Streik führen.","Sicherheitsmassnahmen senken das Unfallrisiko. Ein hoher Lohn ersetzt keine Sicherheit."],
      fakten:["Lohn → Zufriedenheit → Streik","Sicherheit → Unfallrisiko"]
    },
    chemie:{
      kurz:"Rohstoff wird zu nutzbarem Material.",
      text:["Die Raffinerie verarbeitet Rohstoffe zu Materialien.","Die Ausbeute ist ein vereinfachter Spielwert. Sie zeigt, wie viel Material aus Rohstoff entsteht."],
      fakten:["Rohstoff und Material sind nicht dasselbe.","Im Spiel kann jede Raffinerie alle Rohstoffe verarbeiten."]
    },
    fabrik:{
      kurz:"Aus Materialien werden Produkte.",
      text:["Eine Fabrik braucht Personal und die passenden Materialien.","Fehlt ein Material, stoppt die Produktion."],
      fakten:["Leiterplatten brauchen unter anderem Kupfer und Zinn.","Akkus brauchen mehrere Metalle, zum Beispiel Lithium, Nickel und Kobalt."]
    },
    markt:{
      kurz:"Produkte brauchen Käuferinnen und Käufer.",
      text:["Fertige Produkte liegen zuerst im Lager.","Du verkaufst sie selbst oder mit einem Verkaufsteam. Die Nachfrage begrenzt den Verkauf."],
      fakten:["Nachfrage kann sich durch Ereignisse ändern.","Ein grosses Lager kann den Verkaufspreis senken.","Der US-Dollar kann Fertigwarenpreise verändern."]
    },
    ruf:{
      kurz:"Ruf und Nachweise sind zwei verschiedene Dinge.",
      text:["Der Ruf beeinflusst im Spiel die Nachfrage.","Nachweise zeigen, ob die Herkunft von Rohstoffen dokumentiert ist. Ein guter Ruf ersetzt keine Nachweise."],
      fakten:["Ruf → Nachfrage","Nachweise → Lieferkettenprüfung"]
    },
    modell:{
      kurz:"Erzwelt ist ein vereinfachtes Modell.",
      text:["Kosten, Löhne, Mengen und Rezepte sind Spielwerte. Sie sind keine aktuellen Statistiken.","Das Spiel zeigt nur einige Zusammenhänge einer echten Lieferkette."],
      fakten:["Ortsinfos sind für den Unterricht gekürzt und vereinfacht.","Quellenstand der Hintergrundinfos: 2026. Details stehen in SOURCES.md."]
    }
  };
  for(const [id,copy] of Object.entries(wissen)){
    const s=WISSEN.find(x=>x.id===id);
    if(!s) continue;
    Object.assign(s,copy);
  }

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
    for(const p of seg.perks||[]){ if(perkTexte[p.id]) p.text=perkTexte[p.id]; }
  }

  const tutorial={
    mine1:{titel:"Rohstoffquelle eröffnen",text:"Für das Ladekabel brauchst du Kupfer, Aluminium und Zinn. Eröffne zuerst eine passende Rohstoffquelle.",zusammenhang:"Rohstoffquelle → Rohstoff"},
    minecrew:{titel:"Personal zuweisen",text:"Ohne Personal wird nichts gefördert. Weise mindestens 10 Personen zu.",zusammenhang:"Personal → Förderung"},
    team:{titel:"Mehr Personal einstellen",text:"Du brauchst Personal für mehrere Stationen. Erhöhe den Bestand auf mindestens 40 Personen.",zusammenhang:"Personal muss auf mehrere Stationen verteilt werden."},
    minen3:{titel:"Drei Rohstoffe sichern",text:"Eröffne Quellen für Kupfererz, Bauxit und Zinnerz.",zusammenhang:"Kupfererz → Kupfer · Bauxit → Aluminium · Zinnerz → Zinn"},
    crew3:{titel:"Quellen aktivieren",text:"Weise jeder der drei Rohstoffquellen mindestens 5 Personen zu.",zusammenhang:"Ohne Personal kein Rohstoff."},
    raff:{titel:"Raffinerie bauen",text:"Rohstoffe können nicht direkt in die Fabrik. Baue eine Raffinerie.",zusammenhang:"Rohstoff → Raffinerie → Material"},
    raffcrew:{titel:"Raffinerie besetzen",text:"Weise der Raffinerie mindestens 5 Personen zu.",zusammenhang:"Ohne Personal keine Verarbeitung."},
    fab:{titel:"Kabelfabrik bauen",text:"Baue eine Fabrik für Ladekabel.",zusammenhang:"Material → Fabrik → Produkt"},
    fabcrew:{titel:"Fabrik besetzen",text:"Wenn die Fabrik fertig ist, weise ihr Personal zu.",zusammenhang:"Personal + Material → Produkt"},
    verkauf:{titel:"Ladekabel verkaufen",text:"Öffne den Markt und verkaufe Ladekabel einmal selbst.",zusammenhang:"Produkt → Verkauf → Geld"},
    verkaeufer:{titel:"Verkaufsteam einsetzen",text:"Weise mindestens 2 Personen dem Verkauf zu.",zusammenhang:"Verkaufsteam → Verkauf pro Tag"}
  };
  for(const t of TUTORIAL){
    const c=tutorial[t.id];
    if(c) Object.assign(t,c);
  }

  if(SCHWIERIGKEIT?.mittel) SCHWIERIGKEIT.mittel.effekt="Standard";

  /* Event semantics are explicit here rather than hidden in copy replacements. */
  const taiwan=EREIGNISSE.find(e=>e.id==="taiwan");
  if(taiwan){
    taiwan.bau=function(){
      S.preisMod.silizium={faktor:2.4,bis:S.tag+70};
      S.nachfrageMod.phone={faktor:1.5,bis:S.tag+70};
      S.nachfrageMod.konsole={faktor:1.5,bis:S.tag+70};
      return {passiv:true,text:"<b>Erdbeben bei Taiwan</b> – andere Firmen können weniger Elektronik liefern. Silizium wird 70 Tage deutlich teurer; die Nachfrage nach Smartphones und Konsolen steigt um 50 %.",art:"warn"};
    };
  }

  const gesetz=EREIGNISSE.find(e=>e.id==="lieferkettengesetz");
  if(gesetz){
    gesetz.bau=function(){
      const status=nachweisStatus();
      if(status.stufe===0){
        S.kasse-=180000;
        S.ausgegeben+=180000;
        return {passiv:true,text:"<b>Lieferkettengesetz</b> – Herkunftsnachweise fehlen. Im Spiel fällt eine Busse von CHF 180'000 an.",art:"alarm"};
      }
      S.nachfrageMod.board={faktor:1.3,bis:S.tag+90};
      return {passiv:true,text:`<b>Lieferkettengesetz</b> – deine Nachweise sind ${status.text}. Grosskunden können bestellen; die Mainboard-Nachfrage steigt 90 Tage lang.`,art:"gut"};
    };
  }

  const protest=EREIGNISSE.find(e=>e.id==="protest");
  if(protest&&typeof protest.bau==="function"){
    const original=protest.bau;
    protest.bau=function(...args){
      const d=original.apply(this,args);
      if(d) d.text="Die Zufriedenheit ist wegen des Lohns sehr niedrig. Deshalb streikt die Belegschaft und die Förderung steht still.";
      return d;
    };
  }

  const unfall=EREIGNISSE.find(e=>e.id==="unglueck");
  if(unfall&&typeof unfall.bau==="function"){
    const original=unfall.bau;
    unfall.bau=function(...args){
      const d=original.apply(this,args);
      if(d) d.text="Es gab einen schweren Unfall. Die Rohstoffquelle bleibt geschlossen, bis du über die Sicherheit entscheidest.";
      return d;
    };
  }

  window.__erzweltDidacticComplexity={
    version:2,
    target:"Sek B",
    sourceYear:2026,
    declarativeCopy:true,
    stringReplacementLayer:false
  };
})();

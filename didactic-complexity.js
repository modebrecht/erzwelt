"use strict";
/* ============================================================
   SEK-B DIDACTIC COMPLEXITY PASS

   Zielgruppe: eher schwache Sek-B-Klasse.
   Leitlinien:
   - ein Gedanke pro Satz;
   - Fachbegriffe bleiben, aber der Satz drumherum wird einfacher;
   - Ursache -> Wirkung bleibt sichtbar;
   - keine unnötigen Prozent-/Weltmarkt-Zahlen in Schülertexten;
   - Spielmodell klar von Realwelt trennen;
   - keine neue Mechanik, kein neues Lernziel.
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

  const wissen={
    kette:{
      kurz:"Rohstoffquelle -> Raffinerie -> Fabrik -> Markt.",
      text:[
        "Eine Lieferkette verbindet mehrere Orte.",
        "Im Spiel siehst du einen Beispielweg. Transportkosten und Lieferzeiten werden nicht berechnet."
      ],
      fakten:[
        "Rohstoffe werden zuerst gewonnen und danach verarbeitet.",
        "Fehlt eine Station, kann die nächste Station nicht weiterarbeiten."
      ]
    },
    geologie:{
      kurz:"Rohstoffe kommen aus verschiedenen Regionen der Welt.",
      text:[
        "Nicht jeder Rohstoff kommt überall vor.",
        "Darum liegen Rohstoffquellen in verschiedenen Ländern und Regionen."
      ]
    },
    leute:{
      kurz:"Lohn und Sicherheit wirken auf verschiedene Dinge.",
      text:[
        "Der Lohn beeinflusst im Spiel die Zufriedenheit. Sehr niedrige Zufriedenheit kann zu einem Streik führen.",
        "Sicherheitsmassnahmen senken das Unfallrisiko. Ein hoher Lohn ersetzt keine Sicherheit."
      ],
      fakten:[
        "Lohn -> Zufriedenheit -> Streik",
        "Sicherheit -> Unfallrisiko"
      ]
    },
    chemie:{
      kurz:"Rohstoff wird zu nutzbarem Material.",
      text:[
        "Die Raffinerie verarbeitet Rohstoffe zu Materialien.",
        "Die Ausbeute ist ein vereinfachter Spielwert. Sie zeigt, wie viel Material aus Rohstoff entsteht."
      ],
      fakten:[
        "Rohstoff und Material sind nicht dasselbe.",
        "Im Spiel kann jede Raffinerie alle Rohstoffe verarbeiten."
      ]
    },
    fabrik:{
      kurz:"Aus Materialien werden Produkte.",
      text:[
        "Eine Fabrik braucht Personal und die passenden Materialien.",
        "Fehlt ein Material, stoppt die Produktion."
      ]
    },
    markt:{
      kurz:"Produkte brauchen Käuferinnen und Käufer.",
      text:[
        "Fertige Produkte liegen zuerst im Lager.",
        "Du verkaufst sie selbst oder mit einem Verkaufsteam. Die Nachfrage begrenzt den Verkauf."
      ]
    },
    ruf:{
      kurz:"Ruf und Nachweise sind zwei verschiedene Dinge.",
      text:[
        "Der Ruf beeinflusst im Spiel die Nachfrage.",
        "Nachweise zeigen, ob die Herkunft von Rohstoffen dokumentiert ist. Ein guter Ruf ersetzt keine Nachweise."
      ],
      fakten:[
        "Ruf -> Nachfrage",
        "Nachweise -> Lieferkettenprüfung"
      ]
    },
    modell:{
      kurz:"Erzwelt ist ein vereinfachtes Modell.",
      text:[
        "Kosten, Löhne, Mengen und Rezepte sind Spielwerte. Sie sind keine aktuellen Statistiken.",
        "Das Spiel zeigt nur einige Zusammenhänge einer echten Lieferkette."
      ],
      fakten:[
        "Ortsinfos sind für den Unterricht gekürzt und vereinfacht.",
        "Quellenstand der Hintergrundinfos: 2026. Details stehen in SOURCES.md."
      ]
    }
  };
  for(const [id,copy] of Object.entries(wissen)){
    const s=WISSEN.find(x=>x.id===id);
    if(!s) continue;
    if(copy.kurz) s.kurz=copy.kurz;
    if(copy.text) s.text=copy.text;
    if(copy.fakten) s.fakten=copy.fakten;
  }

  const tutorial={
    mine1:{titel:"Rohstoffquelle eröffnen",text:"Für das Ladekabel brauchst du Kupfer, Aluminium und Zinn. Eröffne zuerst eine passende Rohstoffquelle.",zusammenhang:"Rohstoffquelle -> Rohstoff"},
    minecrew:{titel:"Personal zuweisen",text:"Ohne Personal wird nichts gefördert. Weise mindestens 10 Personen zu.",zusammenhang:"Personal -> Förderung"},
    team:{titel:"Mehr Personal einstellen",text:"Du brauchst Personal für mehrere Stationen. Erhöhe den Bestand auf mindestens 40 Personen.",zusammenhang:"Personal muss auf mehrere Stationen verteilt werden."},
    minen3:{titel:"Drei Rohstoffe sichern",text:"Eröffne Quellen für Kupfererz, Bauxit und Zinnerz.",zusammenhang:"Kupfererz -> Kupfer · Bauxit -> Aluminium · Zinnerz -> Zinn"},
    crew3:{titel:"Quellen aktivieren",text:"Weise jeder der drei Rohstoffquellen mindestens 5 Personen zu.",zusammenhang:"Ohne Personal kein Rohstoff."},
    raff:{titel:"Raffinerie bauen",text:"Rohstoffe können nicht direkt in die Fabrik. Baue eine Raffinerie.",zusammenhang:"Rohstoff -> Raffinerie -> Material"},
    raffcrew:{titel:"Raffinerie besetzen",text:"Weise der Raffinerie mindestens 5 Personen zu.",zusammenhang:"Ohne Personal keine Verarbeitung."},
    fab:{titel:"Kabelfabrik bauen",text:"Baue eine Fabrik für Ladekabel.",zusammenhang:"Material -> Fabrik -> Produkt"},
    fabcrew:{titel:"Fabrik besetzen",text:"Wenn die Fabrik fertig ist, weise ihr Personal zu.",zusammenhang:"Personal + Material -> Produkt"},
    verkauf:{titel:"Ladekabel verkaufen",text:"Öffne den Markt und verkaufe Ladekabel einmal selbst.",zusammenhang:"Produkt -> Verkauf -> Geld"},
    verkaeufer:{titel:"Verkaufsteam einsetzen",text:"Weise mindestens 2 Personen dem Verkauf zu.",zusammenhang:"Verkaufsteam -> Verkauf pro Tag"}
  };
  for(const t of TUTORIAL){
    const c=tutorial[t.id];
    if(!c) continue;
    t.titel=c.titel; t.text=c.text; t.zusammenhang=c.zusammenhang;
  }

  /* MUST-FIX: Lieferengpass nicht als direkte Nachfragesteigerung erzählen.
     Das Spielmodell erklärt jetzt den Wechsel von Kunden zu unserer Firma. */
  const taiwan=EREIGNISSE.find(e=>e.id==="taiwan");
  if(taiwan){
    taiwan.bau=function(){
      S.nachfrageMod.phone={faktor:1.5,bis:S.tag+70};
      S.nachfrageMod.konsole={faktor:1.5,bis:S.tag+70};
      return {passiv:true,text:"<b>Erdbeben bei Taiwan</b> – andere Elektronikfirmen können weniger liefern. Einige Kunden wechseln zu deiner Firma. Die Nachfrage nach Smartphones und Konsolen steigt 70 Tage lang um 50 %.",art:"warn"};
    };
  }

  /* MUST-FIX: Bonus beim Lieferkettengesetz bekommt eine sichtbare Ursache. */
  const gesetz=EREIGNISSE.find(e=>e.id==="lieferkettengesetz");
  if(gesetz){
    gesetz.bau=function(){
      const status=nachweisStatus();
      if(status.stufe===0){
        S.kasse-=180000; S.ausgegeben+=180000;
        return {passiv:true,text:"<b>Lieferkettengesetz</b> – Herkunftsnachweise fehlen. Im Spiel fällt eine Busse von CHF 180'000 an.",art:"alarm"};
      }
      S.nachfrageMod.board={faktor:1.3,bis:S.tag+90};
      return {passiv:true,text:`<b>Lieferkettengesetz</b> – deine Nachweise sind ${status.text}. Grosskunden mit Nachweispflicht können bei dir bestellen. Die Mainboard-Nachfrage steigt 90 Tage lang.`,art:"gut"};
    };
  }

  /* Kürzere Texte in häufigen Ereignissen. Mechanik bleibt unverändert. */
  const protest=EREIGNISSE.find(e=>e.id==="protest");
  if(protest){
    const alt=protest.bau;
    protest.bau=function(){
      const d=alt();
      if(d) d.text="Die Belegschaft streikt. Die Zufriedenheit ist wegen des Lohns sehr niedrig. Die Förderung steht still.";
      return d;
    };
  }
  const unfall=EREIGNISSE.find(e=>e.id==="unglueck");
  if(unfall){
    const alt=unfall.bau;
    unfall.bau=function(){
      const d=alt();
      if(d) d.text="Es gab einen schweren Unfall. Die Rohstoffquelle bleibt geschlossen, bis du über die Sicherheit entscheidest.";
      return d;
    };
  }
  const recherche=EREIGNISSE.find(e=>e.id==="kinderarbeit");
  if(recherche){
    const alt=recherche.bau;
    recherche.bau=function(){
      const d=alt();
      if(d) d.text=d.text.replace("Eine Recherche stellt Fragen zu den Arbeitsbedingungen in ","Eine Recherche prüft die Arbeitsbedingungen in ").replace("Deine Firma kann für diese Rohstoffquelle noch keine unabhängige Prüfung vorlegen.","Für diese Rohstoffquelle fehlt noch eine unabhängige Prüfung.");
      return d;
    };
  }

  const einfacherText=text=>{
    if(typeof text!=="string") return text;
    return text
      .replace("Produzierst du deutlich mehr als nachgefragt wird, füllt sich das Lager und der Verkaufspreis sinkt.","Produzierst du zu viel, wächst das Lager. Dann sinkt der Verkaufspreis.")
      .replace("Eine eröffnete Rohstoffquelle produziert erst mit Personal.","Eine Rohstoffquelle arbeitet nur mit Personal.")
      .replace("Mehrere Stationen brauchen gleichzeitig Personal.","Mehrere Stationen brauchen Personal.")
      .replace("Die geförderten Rohstoffe können nicht direkt in der Fabrik verwendet werden.","Rohstoffe können nicht direkt in die Fabrik.")
      .replace("Auch die Raffinerie arbeitet nur mit Personal.","Auch die Raffinerie braucht Personal.")
      .replace("Eine fertige Fabrik braucht Personal und die Materialien ihres Rezepts.","Eine fertige Fabrik braucht Personal und die passenden Materialien.")
      .replace("Der manuelle Verkauf gilt nur für einen Spieltag.","Selbst verkaufen geht einmal pro Spieltag.")
      .replace("Verkaufskapazität bestimmt, wie viele fertige Produkte pro Tag verkauft werden können.","Die Verkaufskapazität zeigt, wie viele Produkte pro Tag verkauft werden können.")
      .replace("Die angezeigte Entfernung dient der geografischen Orientierung.","Die Entfernung dient nur zur Orientierung.");
  };

  /* tutorial-enhance.js erzeugt einige dynamische Texte. Nach dessen Ausgabe
     kürzen wir nur bekannte Formulierungen, ohne Logik anzufassen. */
  if(typeof questZeichnen==="function"){
    const original=questZeichnen;
    questZeichnen=function(){
      const out=original.apply(this,arguments);
      const titel=document.getElementById("q-titel"),text=document.getElementById("q-text"),rel=document.querySelector("#quest .tutorial-zusammenhang");
      const t=typeof tutorialSchritt==="function"?tutorialSchritt():null;
      if(t&&tutorial[t.id]){
        if(titel) titel.textContent=tutorial[t.id].titel;
        if(text) text.textContent=einfacherText(text.textContent||tutorial[t.id].text);
        if(rel) rel.innerHTML=`<b>Zusammenhang:</b> ${tutorial[t.id].zusammenhang}`;
      }else if(text){ text.textContent=einfacherText(text.textContent); }
      return out;
    };
  }

  const htmlWrapper=name=>{
    const original=globalThis[name];
    if(typeof original!=="function") return;
    globalThis[name]=function(...args){ return einfacherText(original.apply(this,args)); };
  };
  ["blattMine","blattRaff","blattFab","seiteMarkt","seiteTeam","seiteZiel","seiteWissen"].forEach(htmlWrapper);

  if(typeof naechsterSchritt==="function"){
    const original=naechsterSchritt;
    naechsterSchritt=function(){
      const w=original();
      return w?[einfacherText(w[0]),einfacherText(w[1])]:w;
    };
  }

  window.__erzweltDidacticComplexity={version:1,target:"Sek B",sourceYear:2026};
})();

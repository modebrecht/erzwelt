"use strict";
/* ============================================================
   SEK-B DIDACTIC DATA

   Direct, declarative teaching copy and event semantics.
   No string-search replacements and no HTML renderer wrapping.
   ============================================================ */

(function(){
  const mineInfo={
    kolwezi:"In der DR Kongo wird viel Kobalt gewonnen. Ein Teil stammt aus kleinen Minen mit Handarbeit.",
    katanga:textVon("didacticcomple.im-kupferguertel-der-dr"),
    rubaya:"Coltan liefert Tantal. Der Abbau kann mit Konflikten und illegalem Handel verbunden sein.",
    kigali:textVon("didacticcomple.ruanda-foerdert-und-exportiert"),
    bayanobo:textVon("didacticcomple.bayan-obo-ist-eine"),
    jiangxi:"In China wird viel Rohsilizium hergestellt. Die Verarbeitung braucht viel elektrische Energie.",
    liuzhou:textVon("didacticcomple.indium-entsteht-meist-als"),
    sprucepine:textVon("didacticcomple.der-standort-steht-im"),
    mountainpass:textVon("didacticcomple.mountain-pass-ist-eine"),
    greenbushes:"Greenbushes ist eine grosse Lithium-Mine in Australien. Das Lithium stammt aus Hartgestein.",
    kalgoorlie:"Gold kommt oft nur in kleinen Mengen im Gestein vor. Deshalb muss viel Material bewegt werden.",
    atacama:"Im Salar de Atacama wird Lithium aus Salzlake gewonnen. Wasser ist in der trockenen Region ein wichtiges Thema.",
    escondida:"Escondida in Chile ist eine sehr grosse Kupfermine.",
    fresnillo:textVon("didacticcomple.mexiko-ist-ein-wichtiger"),
    sanrafael:textVon("didacticcomple.zinn-wird-fuer-loetverbindungen"),
    bangka:textVon("didacticcomple.auf-bangka-wird-zinn"),
    sulawesi:textVon("didacticcomple.auf-sulawesi-wird-viel"),
    obuasi:textVon("didacticcomple.in-der-region-gibt"),
    boke:textVon("didacticcomple.bauxit-ist-der-wichtigste"),
    potosi:"Am Cerro Rico bei Potosí wird seit Jahrhunderten Silber abgebaut."
  };
  for(const m of MINEN){ if(mineInfo[m.id]) m.info=mineInfo[m.id]; }

  const raffInfo={
    r_china:textVon("didacticcomple.china-ist-ein-wichtiger"),
    r_malay:"In Malaysia werden unter anderem Seltene Erden verarbeitet.",
    r_chile:"Dieser Standort liegt nahe an wichtigen Rohstoffgebieten in Chile.",
    r_de:textVon("didacticcomple.dieser-standort-zeigt-im"),
    r_usa:"Dieser Standort zeigt im Spiel eine US-Raffinerie mit hohen Kosten."
  };
  for(const r of RAFF_ORTE){ if(raffInfo[r.id]) r.info=raffInfo[r.id]; }

  const produktInfo={
    kabel:"Ein Ladekabel braucht mehrere Materialien. Kupfer leitet den Strom.",
    phone:textVon("didacticcomple.ein-smartphone-braucht-viele"),
    board:textVon("didacticcomple.eine-leiterplatte-verbindet-elektronische"),
    konsole:"Eine Spielkonsole braucht unter anderem Kupfer, Silizium und Magnete.",
    tv:textVon("didacticcomple.displays-brauchen-verschiedene-materialien"),
    akku:"Ein E-Bike-Akku braucht unter anderem Lithium, Nickel, Kobalt, Kupfer und Aluminium."
  };
  for(const [id,text] of Object.entries(produktInfo)){ if(PRODUKT[id]) PRODUKT[id].info=text; }

  const materialVerwendung={
    zinn:textVon("didacticcomple.loetverbindungen-auf-leiterplatten"),
    lithium:textVon("didacticcomple.lithium-ionen-akkus"),
    kobalt:textVon("didacticcomple.kathodenmaterial-in-akkus"),
    silber:textVon("didacticcomple.elektrische-kontakte-und-loetpasten"),
    seltene:textVon("didacticcomple.permanentmagnete-in-lautsprechern-und"),
    tantal:textVon("didacticcomple.kondensatoren-in-elektronischen-geraeten"),
    indium:textVon("didacticcomple.transparente-leitfaehige-schichten-in"),
    gold:textVon("didacticcomple.korrosionsbestaendige-elektrische-kontakte")
  };
  for(const [id,text] of Object.entries(materialVerwendung)){ if(MATERIAL[id]) MATERIAL[id].wofuer=text; }

  const wissen={
    kette:{
      kurz:textVon("didacticcomple.rohstoffquelle-raffinerie-fabrik-markt"),
      text:["Eine Lieferkette verbindet mehrere Orte.","Im Spiel siehst du einen Beispielweg. Transportkosten und Lieferzeiten werden nicht berechnet."],
      fakten:["Rohstoffe werden zuerst gewonnen und danach verarbeitet.",textVon("didacticcomple.fehlt-eine-station-kann")]
    },
    geologie:{
      kurz:"Rohstoffe kommen aus verschiedenen Regionen der Welt.",
      text:[textVon("didacticcomple.nicht-jeder-rohstoff-kommt"),textVon("didacticcomple.darum-liegen-rohstoffquellen-in")],
      fakten:[textVon("didacticcomple.lagerstaetten-entstehen-durch-geologische"),"Rohstoffe sind weltweit ungleich verteilt."]
    },
    leute:{
      kurz:"Lohn und Sicherheit wirken auf verschiedene Dinge.",
      text:[textVon("didacticcomple.der-lohn-beeinflusst-im"),"Sicherheitsmassnahmen senken das Unfallrisiko. Ein hoher Lohn ersetzt keine Sicherheit."],
      fakten:[textVon("didacticcomple.lohn-zufriedenheit-streik"),textVon("didacticcomple.sicherheit-unfallrisiko")]
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
      kurz:textVon("didacticcomple.produkte-brauchen-kaeuferinnen-und"),
      text:["Fertige Produkte liegen zuerst im Lager.","Du verkaufst sie selbst oder mit einem Verkaufsteam. Die Nachfrage begrenzt den Verkauf."],
      fakten:[textVon("didacticcomple.nachfrage-kann-sich-durch"),"Ein grosses Lager kann den Verkaufspreis senken.",textVon("didacticcomple.der-us-dollar-kann")]
    },
    ruf:{
      kurz:"Ruf und Nachweise sind zwei verschiedene Dinge.",
      text:["Der Ruf beeinflusst im Spiel die Nachfrage.","Nachweise zeigen, ob die Herkunft von Rohstoffen dokumentiert ist. Ein guter Ruf ersetzt keine Nachweise."],
      fakten:[textVon("didacticcomple.ruf-nachfrage"),textVon("didacticcomple.nachweise-lieferkettenpruefung")]
    },
    modell:{
      kurz:"Erzwelt ist ein vereinfachtes Modell.",
      text:[textVon("didacticcomple.kosten-loehne-mengen-und"),textVon("didacticcomple.das-spiel-zeigt-nur")],
      fakten:[textVon("didacticcomple.ortsinfos-sind-fuer-den"),"Quellenstand der Hintergrundinfos: 2026. Details stehen in SOURCES.md."]
    }
  };
  for(const [id,copy] of Object.entries(wissen)){
    const s=WISSEN.find(x=>x.id===id);
    if(!s) continue;
    Object.assign(s,copy);
  }

  const perkTexte={
    kette1:textVon("didacticcomple.bessere-planung-erhoeht-den"),
    kette2:textVon("didacticcomple.die-verbesserung-erhoeht-den"),
    geo1:textVon("didacticcomple.bessere-kartierung-erhoeht-die"),
    geo2:textVon("didacticcomple.tiefenbohrungen-erhoehen-die-foerderung"),
    leute1:textVon("didacticcomple.ein-gemeinsamer-standard-senkt"),
    leute2:textVon("didacticcomple.mitbestimmung-erhoeht-zufriedenheit-und"),
    chem1:textVon("didacticcomple.bessere-prozesse-erhoehen-die"),
    chem2:textVon("didacticcomple.rueckgewinnung-erhoeht-die-ausbeute"),
    fab1:textVon("didacticcomple.bessere-ablaeufe-erhoehen-den"),
    fab2:textVon("didacticcomple.vorfertigung-erhoeht-den-ausstoss"),
    markt1:textVon("didacticcomple.schulung-erhoeht-die-verkaufskapazitaet"),
    markt2:textVon("didacticcomple.direktvertrieb-erhoeht-preis-und"),
    ruf1:textVon("didacticcomple.ein-transparenzbericht-staerkt-im"),
    ruf2:textVon("didacticcomple.pruefungen-staerken-die-nachfrage"),
    mod1:"Controlling senkt die Betriebskosten.",
    mod2:"Personalplanung senkt die Lohnsumme."
  };
  for(const seg of WISSEN){
    for(const p of seg.perks||[]){ if(perkTexte[p.id]) p.text=perkTexte[p.id]; }
  }

  if(SCHWIERIGKEIT?.mittel) SCHWIERIGKEIT.mittel.effekt=textVon("didacticcomple.standard");

  /* Event semantics are explicit here rather than hidden in copy replacements. */
  const taiwan=EREIGNISSE.find(e=>e.id==="taiwan");
  if(taiwan){
    taiwan.bau=function(){
      S.preisMod.silizium={faktor:2.4,bis:S.tag+70};
      S.nachfrageMod.phone={faktor:1.5,bis:S.tag+70};
      S.nachfrageMod.konsole={faktor:1.5,bis:S.tag+70};
      return {passiv:true,text:textVon("didacticcomple.erdbeben-bei-taiwan-andere"),art:"warn"};
    };
  }

  const gesetz=EREIGNISSE.find(e=>e.id==="lieferkettengesetz");
  if(gesetz){
    gesetz.bau=function(){
      const status=nachweisStatus();
      if(status.stufe===0){
        S.kasse-=180000;
        S.ausgegeben+=180000;
        return {passiv:true,text:textVon("didacticcomple.lieferkettengesetz-herkunftsnachweise-fehlen-im"),art:"alarm"};
      }
      S.nachfrageMod.board={faktor:1.3,bis:S.tag+90};
      return {passiv:true,text:textVon("didacticcomple.lieferkettengesetz-deine-nachweise-sind", {p1:(status.text)}),art:"gut"};
    };
  }

  const protest=EREIGNISSE.find(e=>e.id==="protest");
  if(protest&&typeof protest.bau==="function"){
    const original=protest.bau;
    protest.bau=function(...args){
      const d=original.apply(this,args);
      if(d) d.text=textVon("didacticcomple.die-zufriedenheit-ist-wegen");
      return d;
    };
  }

  const unfall=EREIGNISSE.find(e=>e.id==="unglueck");
  if(unfall&&typeof unfall.bau==="function"){
    const original=unfall.bau;
    unfall.bau=function(...args){
      const d=original.apply(this,args);
      if(d) d.text=textVon("didacticcomple.es-gab-einen-schweren");
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

/* Erzwelt · module/wissen.js – Wissen: Lerntexte, Wissens-Quests, Lupe
   ---------------------------------------------------------------
   Besitzer von allem, was Wissen zeigt oder freischaltet:
     1. Lerntexte: Ortsinfos (Rohstoffquellen, Raffinerien), Produkt- und
        Materialtexte, Wissens-Bereiche (Titel, Kurztext, Text, Fakten,
        Formeln), Texte der Verbesserungen. Endgültig, einmal gesetzt.
     2. Wissens-Quests nach der Einführung: genau ein nächster Schritt, kein
        Grind; ein erfüllter Schritt bleibt sichtbar, bis er mit «Ansehen»
        abgeholt wird. Mitgezählt wird über einen Klick-Listener auf document:
        Lohnstufe ändern, selbst verkaufen, «Ziel» öffnen, Rohstoffstandorte
        antippen. Spielstand: S.wissenQuestFlow (Fassung 4).
     3. Voraussetzung einer Verbesserung (wissenPraxis): Das Wissensfeld muss
        abgeholt sein, höhere Stufen brauchen die vorherige Verbesserung.
     4. Lupe (lupeFuellen): ein Wissens-Bereich mit Text, Tabellen, «So hängt
        es zusammen» (Spielmodell), Voraussetzung und Knopf «Verbesserung
        finanzieren». In der Einführung ist der Knopf gesperrt («Erst nach der
        Einführung»); der Kauf selbst wird in module/einfuehrung.js abgefangen.
   Früher verteilt auf knowledge-quest-flow.js, didactic-complexity.js (Texte),
   didactic-model.js und didactic-should.js (überschriebene Texte, Lupen-Hülle),
   sek-b-klarheit.js (Spielmodell) und einfuehrung.js (Sperre in der Lupe).

   Bleibt woanders: naechsterSchritt-Grundfassung und die alte wissenPraxis
   (didactic-should.js, Schritt 9), Text und Wirkung von Transparenzbericht und
   Zertifizierung (logik-fixes.js), Sicherheitsprogramm-Wirkung
   (didactic-model.js), Feier beim Abholen (erfolg-feier.js, Hook nachAufgabe),
   Kopf und «Ansehen» der Aufgabenkarte (module/aufgabe.js).

   Markierungen: window.__erzweltKnowledgeQuestFlow (Bausteine für
   module/aufgabe.js und sek-b-klarheit.js, Tests), __erzweltDidacticComplexity
   (Tests). */
"use strict";
(function(){
  /* ---------- 1. Lerntexte ---------- */
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
      titel:"Menschen, Löhne & Sicherheit",
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
      titel:"Ruf & Nachweise",
      kurz:"Ruf und Nachweise sind zwei verschiedene Dinge.",
      text:["Der Ruf beeinflusst im Spiel die Nachfrage.","Nachweise zeigen, ob die Herkunft von Rohstoffen dokumentiert ist. Ein guter Ruf ersetzt keine Nachweise."],
      fakten:["Ruf → Nachfrage","Nachweise → Lieferkettenprüfung"]
    },
    modell:{
      titel:"Das Spielmodell",
      kurz:"Erzwelt ist ein vereinfachtes Modell.",
      text:["Kosten, Löhne, Mengen und Rezepte sind Spielwerte. Sie sind keine aktuellen Statistiken.","Das Spiel zeigt nur einige Zusammenhänge einer echten Lieferkette."],
      fakten:["Ortsinfos sind für den Unterricht gekürzt und vereinfacht.","Die Hintergrundinfos wurden 2026 geprüft."],
      formeln:null    // statt Formeln: «So hängt es zusammen» in der Lupe (REGELN)
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
    mod1:"Controlling senkt die Betriebskosten.",
    mod2:"Personalplanung senkt die Lohnsumme."
  };
  for(const seg of WISSEN){
    for(const p of seg.perks||[]){ if(perkTexte[p.id]) p.text=perkTexte[p.id]; }
  }


  /* ---------- 2. Wissens-Quests ---------- */
  const FLOW_VERSION=4;

  function flowState(){
    if(!S.wissenQuestFlow||typeof S.wissenQuestFlow!=="object") S.wissenQuestFlow={};
    const q=S.wissenQuestFlow;
    if(!q.flags||typeof q.flags!=="object") q.flags={};
    if(!q.collected||typeof q.collected!=="object") q.collected={};
    if(!q.fields||typeof q.fields!=="object") q.fields={};
    if(!Array.isArray(q.geologieBesucht)) q.geologieBesucht=[];
    q.version=FLOW_VERSION;
    return q;
  }

  const QUESTS=[
    {
      id:"basis", seg:"kette", fields:["kette","chemie","fabrik"],
      titel:"Deine Lieferkette steht",
      aufgabe:"Schliesse zuerst das Tutorial ab.",
      fertig:()=>!tutorialLaeuft(),
      erfolg:"Du hast Rohstoffquelle → Raffinerie → Fabrik → Verkauf einmal vollständig erlebt."
    },
    {
      id:"lohn", seg:"leute", fields:["leute"],
      titel:"Lohn & Zufriedenheit beobachten",
      aufgabe:"Ändere die Lohnstufe einer Rohstoffquelle. Beobachte danach den Zielwert der Zufriedenheit.",
      fertig:q=>!!q.flags.lohn,
      erfolg:"Du hast die Lohnstufe verändert. Im Spiel wirkt der Lohn auf die Zufriedenheit."
    },
    {
      id:"markt", seg:"markt", fields:["markt"],
      titel:"Markt selbst ausprobieren",
      aufgabe:"Verkaufe nach dem Tutorial einmal selbst ein Produkt im Markt.",
      fertig:q=>!!q.flags.markt,
      erfolg:"Du hast selbst verkauft. Produkt → Verkauf → Geld ist jetzt sichtbar."
    },
    {
      id:"geologie", seg:"geologie", fields:["geologie"],
      titel:"Rohstoffstandorte vergleichen",
      aufgabe:q=>`Öffne zwei verschiedene Rohstoffstandorte auf der Karte. ${Math.min(2,q.geologieBesucht.length)}/2 angesehen.`,
      fertig:q=>q.geologieBesucht.length>=2,
      erfolg:"Du hast zwei Rohstoffstandorte angesehen. Rohstoffe liegen nicht überall am selben Ort."
    },
    {
      id:"ruf", seg:"ruf", fields:["ruf"],
      titel:"Ruf und Nachweise unterscheiden",
      aufgabe:"Öffne «Ziel». Vergleiche dort Ruf und Lieferkettennachweise.",
      fertig:q=>!!q.flags.ruf,
      erfolg:"Du hast Ruf und Nachweise verglichen. Sie haben im Spiel unterschiedliche Aufgaben."
    },
    {
      id:"modell", seg:"modell", fields:["modell"],
      titel:"Das Spielmodell einordnen",
      aufgabe:"Schliesse zuerst die vorherigen Wissens-Quests ab.",
      fertig:q=>QUESTS.slice(0,-1).every(x=>q.collected[x.id]),
      erfolg:"Du hast die wichtigsten Spielzusammenhänge ausprobiert. Jetzt kannst du das vereinfachte Modell nochmals einordnen."
    }
  ];

  function aktiveQuest(){
    if(tutorialLaeuft()) return null;
    const q=flowState();
    return QUESTS.find(x=>!q.collected[x.id])||null;
  }
  function questFertig(def){ return !!(def&&def.fertig(flowState())); }
  function feldFrei(segId){ return !!flowState().fields[segId]; }
  function aufgabeText(def){
    const q=flowState();
    return typeof def?.aufgabe==="function"?def.aufgabe(q):(def?.aufgabe||"");
  }

  function praxisText(segId){
    const map={
      kette:"Schliesse das Tutorial ab und erlebe die ganze Lieferkette.",
      chemie:"Schliesse das Tutorial ab und erlebe die Raffination.",
      fabrik:"Schliesse das Tutorial ab und produziere das erste Produkt.",
      leute:"Ändere nach dem Tutorial einmal die Lohnstufe einer Rohstoffquelle.",
      markt:"Verkaufe nach dem Tutorial einmal selbst ein Produkt.",
      geologie:"Öffne zwei verschiedene Rohstoffstandorte auf der Karte.",
      ruf:"Öffne «Ziel» und vergleiche Ruf mit Lieferkettennachweisen.",
      modell:"Schliesse die vorherigen Wissens-Quests ab."
    };
    return map[segId]||"Erlebe diesen Zusammenhang einmal im Spiel.";
  }

  /* ---------- 3. Voraussetzung einer Verbesserung ----------
     Erlebnis statt Grind. Ein Feld muss aber ausdrücklich über «Ansehen»
     abgeholt worden sein; höhere Stufen verlangen die vorherige Verbesserung. */
  wissenPraxis=function(segId,stufe){
    flowState();
    if(!feldFrei(segId)) return {ok:false,text:praxisText(segId)};

    const level=Number.isInteger(stufe)?stufe:Number(stufe)||0;
    if(level>0){
      const seg=WISSEN.find(s=>s.id===segId);
      const previous=seg?.perks?.[level-1];
      if(previous&&!S?.perks?.[previous.id]){
        return {ok:false,text:"Setze zuerst die vorherige Verbesserung in diesem Wissensfeld um."};
      }
    }
    return {ok:true,text:praxisText(segId)};
  };

  const originalNaechsterSchritt=naechsterSchritt;
  naechsterSchritt=function(){
    const def=aktiveQuest();
    if(def){
      if(questFertig(def)) return [def.titel,def.erfolg];
      return [def.titel,aufgabeText(def)];
    }
    return originalNaechsterSchritt();
  };

  function markieren(flag){
    if(tutorialLaeuft()) return;
    const q=flowState();
    if(q.flags[flag]) return;
    q.flags[flag]=true;
    if(typeof speichern==="function") speichern();
    if(typeof questZeichnen==="function") questZeichnen();
  }

  function geologieBesuch(id){
    if(aktiveQuest()?.id!=="geologie"||!id) return;
    const q=flowState();
    if(q.geologieBesucht.includes(id)) return;
    q.geologieBesucht.push(id);
    if(typeof speichern==="function") speichern();
    if(typeof questZeichnen==="function") questZeichnen();
  }

  function naechsterGeologieStandort(){
    const seen=flowState().geologieBesucht;
    const preferred=["kolwezi","greenbushes","atacama","bangka","boke","mountainpass"];
    const ids=[...preferred,...MINEN.map(m=>m.id)].filter((id,i,a)=>a.indexOf(id)===i);
    return ids.find(id=>!seen.includes(id))||null;
  }

  document.addEventListener("click",e=>{
    const collect=e.target.closest("[data-wissen-quest]");
    if(collect){
      e.preventDefault();e.stopPropagation();
      const def=QUESTS.find(x=>x.id===collect.dataset.wissenQuest);
      if(!def||!questFertig(def)) return;
      const q=flowState();
      q.collected[def.id]=true;
      for(const field of def.fields) q.fields[field]=true;
      if(typeof speichern==="function") speichern();
      seiteWechseln("wissen");
      setTimeout(()=>{ if(typeof lupeFuellen==="function") lupeFuellen(def.seg); },0);
      return;
    }

    if(tutorialLaeuft()) return;

    /* Der gesamte Minen-Pin ist ein Button. Ein Besuch muss unabhängig davon
       zählen, ob die Person Symbol, Label oder den Button-Rand antippt. */
    const minePin=e.target.closest('#welt .pin[data-pin="mine"]');
    if(minePin?.dataset.id) geologieBesuch(minePin.dataset.id);

    const t=e.target.closest("[data-tun]");
    if(t?.dataset.tun==="lohn"&&t.getAttribute("aria-pressed")!=="true") markieren("lohn");
    if(t?.dataset.tun==="handverkauf") markieren("markt");
    const s=e.target.closest("[data-seite]");
    if(s?.dataset.seite==="ziel") markieren("ruf");
  });

  flowState();


  /* ---------- 4. Lupe ---------- */
  /* «Das Spielmodell»: Zusammenhänge in Worten statt Formeln */
  const REGELN = [
    ["Förderung", "Mehr Personal und zufriedenere Leute holen mehr Rohstoff aus der Quelle."],
    ["Raffination", "Aus Rohstoff wird Material. Ein Teil bleibt als Abraum zurück."],
    ["Fabrik", "Das knappste Material bestimmt, wie viele Produkte entstehen."],
    ["Nachfrage", "Saison, Ereignisse und dein Ruf verändern, wie viel gekauft wird."],
    ["Preis", "Ein volles Lager senkt den Preis. Der Dollarkurs kann ihn heben oder senken."]
  ];

  /* In der Einführung: Knopf gesperrt, ohne Symbol. Gilt für jeden Verbesserungs-
     Knopf in der Lupe, auch wenn ein unbekannter Bereich nichts neu zeichnet. */
  function einfuehrungSperre(){
    if (!tutorialLaeuft()) return;
    document.querySelectorAll('#lupe [data-tun="perk"]').forEach(b => {
      b.disabled = true; b.classList.remove("puls");
      b.textContent = "Erst nach der Einführung";
    });
  }

  lupeFuellen = function(segId){
    shouldMigration();
    S.wissenGesehen[segId] = true;
    const seg = WISSEN.find(s => s.id === segId);
    if (!seg){ speichern(); einfuehrungSperre(); return; }
    offeneLupe = segId;
    const naechst = naechsterPerk(seg);
    const idx = naechst ? seg.perks.indexOf(naechst) : -1;
    const gesperrtDurch = idx > 0 && !S.perks[seg.perks[idx-1].id] ? seg.perks[idx-1] : null;

    const erforscht = seg.perks.filter(p => S.perks[p.id]).map(p =>
      `<div class="perkkarte fertig"><span class="marke">Finanziert</span>
      <h3>${p.titel}</h3><p>${p.text}</p>
      <div class="wirkung">${p.wirkung.map(w=>`<span>${w}</span>`).join("")}</div></div>`).join("");

    let angebot;
    if (naechst){
      const praxis = wissenPraxis(segId, idx);
      const genug = S.kasse >= naechst.kosten;
      const einfuehrung = tutorialLaeuft();
      const geht = praxis.ok && !gesperrtDurch && genug && !einfuehrung;
      const knopf = einfuehrung ? "Erst nach der Einführung"
        : gesperrtDurch ? "Vorherige Verbesserung fehlt"
        : !praxis.ok ? "Voraussetzung noch nicht erfüllt"
        : !genug ? "Zu wenig Geld · " + chf(naechst.kosten)
        : IK.gluehbirne + "Verbesserung finanzieren · " + chf(naechst.kosten);
      angebot = `<div class="perkkarte">
      <span class="marke">Anwendung</span>
      <h3>${naechst.titel}</h3><p>${naechst.text}</p>
      <div class="wirkung">${naechst.wirkung.map(w=>`<span>${w}</span>`).join("")}</div>
      ${gesperrtDurch ? `<div class="notiz">Zuerst «${gesperrtDurch.titel}» finanzieren.</div>` : ""}
      <div class="notiz didaktik-praxis"><b>Voraussetzung:</b> ${praxis.text}<br>${praxis.ok?"✓ Voraussetzung erfüllt. Die Verbesserung kann jetzt finanziert werden.":"Voraussetzung noch nicht erfüllt."}</div><button class="cta${geht ? " puls" : ""}" data-tun="perk" data-p="${naechst.id}"${geht ? "" : " disabled"}>${knopf}</button>
    </div>`;
    } else angebot = `<div class="perkkarte fertig"><span class="marke">Vollständig</span>
        <h3>Alle Verbesserungen finanziert</h3><p>Du hast alle Verbesserungen aus «${seg.titel}» finanziert.</p></div>`;

    const formeln = seg.formeln ? `<div class="karte"><h3>Formeln</h3><table>${
      seg.formeln.map(f=>`<tr><td>${f[0]}</td><td><code>${f[1]}</code></td></tr>`).join("")}</table></div>` : "";

    const materialTabelle = seg.id === "geologie" ? `<div class="karte"><h3>Woher die Rohstoffe kommen</h3>
    <table><tr><th>Rohstoff → Material</th><th>Wichtige Förderländer</th><th class="n">Ausbeute</th></tr>
    ${Object.keys(MATERIAL).map(k => {
      const laender = [...new Set(MINEN.filter(m=>m.mat===k).map(m=>m.land))];
      const quellen = [...new Set(MINEN.filter(m=>m.mat===k).map(m=>rohstoffDerMine(m)))];
      return `<tr><td><i class="punkt" style="background:${MATERIAL[k].farbe}"></i> <b>${quellen.join(" / ")} → ${MATERIAL[k].name}</b><br>
        <small style="color:var(--grau);font-weight:600">${MATERIAL[k].wofuer}</small></td>
        <td>${laender.map(l=>`<span class="flz" style="margin-right:6px">${flagge(l,"mini")}<span style="font-size:var(--f0)">${LAND[l].name}</span></span>`).join("")}</td>
        <td class="n">${(MATERIAL[k].ausbeute*100).toFixed(0)} %</td></tr>`;
    }).join("")}</table>
    <div class="notiz blau"><b>Spielmodell:</b> Ergiebigkeit und Mengen sind vereinfachte Werte.</div></div>` : "";

    const rezepte = seg.id === "fabrik" ? `<div class="karte"><h3>Was in einem Gerät steckt</h3>
    <div class="notiz blau"><b>Vereinfachte Rezepte:</b> stark vereinfachte Materialanteile, keine Stücklisten realer Geräte.</div>${Object.keys(PRODUKT).map(p=>`<div style="margin-bottom:10px"><b>${PRODUKT[p].name}</b>
      <div class="stueck">${Object.keys(PRODUKT[p].rezept).map(k=>
        `<span style="background:${MATERIAL[k].farbe}">${MATERIAL[k].sym} ${PRODUKT[p].rezept[k]}</span>`).join("")}</div></div>`).join("")}</div>` : "";

    const loehne = seg.id === "leute" ? `<div class="karte"><h3>Monatslöhne im Vergleich</h3>
    <table>${Object.keys(LAND).sort((a,b)=>LAND[a].lohn-LAND[b].lohn).map(l =>
      `<tr><td><span class="flz">${flagge(l)}<span>${LAND[l].name}</span></span></td>
        <td class="n">${LAND[l].lohn.toLocaleString("de-CH")}</td></tr>`).join("")}</table>
    <div class="notiz"><b>Spielmodell:</b> Diese Lohnwerte sind vereinfachte Spielwerte und keine aktuelle Statistik.</div></div>` : "";

    const regeln = seg.id === "modell"
      ? `<div class="karte modell-regeln"><h3>So hängt es zusammen</h3><table>${REGELN.map(([a, t]) => `<tr><td><b>${a}</b></td><td>${t}</td></tr>`).join("")}</table></div>` : "";

    $("#lupeinhalt").innerHTML = `
    <div class="titelzeile" style="padding-right:52px">
      <span class="sicon" style="background:${seg.farbe}22;color:${seg.farbe};width:48px;height:48px;border-radius:14px;display:grid;place-items:center;flex:none">${IK[seg.ikon]||IK.wissen}</span>
      <div><h2>${seg.titel}</h2><div class="ort">${seg.kurz}</div></div></div>
    ${seg.text.map(t=>`<p>${t}</p>`).join("")}
    ${materialTabelle}${loehne}${rezepte}${formeln}
    ${regeln}<div class="karte"><h3>Zum Merken</h3>
      ${seg.fakten.map((f,i)=>`<div class="fakt"><span class="nr">${i+1}</span><span>${f}</span></div>`).join("")}</div>
    ${erforscht}${angebot}`;
    einzug($("#lupeinhalt"));
    $("#lupe").hidden = false;
    fensterKlasse();
    speichern();
  };

  window.__erzweltKnowledgeQuestFlow={
    version:FLOW_VERSION,
    quests:QUESTS.map(q=>q.id),
    active:()=>aktiveQuest()?.id||null,
    nextGeologyTarget:naechsterGeologieStandort,
    zustand:flowState,
    quest:aktiveQuest,
    fertig:questFertig,
    liste:QUESTS
  };
  window.__erzweltDidacticComplexity={
    version:2,
    target:"Sek B",
    sourceYear:2026,
    declarativeCopy:true,
    stringReplacementLayer:false
  };
})();

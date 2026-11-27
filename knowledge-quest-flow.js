"use strict";
/* ============================================================
   POST-TUTORIAL KNOWLEDGE QUEST FLOW

   Sek-B-Ziel:
   - während des Tutorials keine zweite Aufgabenlogik;
   - danach immer genau ein nächster Wissens-Schritt;
   - keine Grind-Gates wie Umsatz, Monate oder Ausbau-Stufen;
   - ein erfüllter Unlock bleibt sichtbar, bis er mit «Ansehen» abgeholt wird;
   - der Wissen-Tab bleibt Archiv/Nachschlagewerk.
   ============================================================ */

(function(){
  const FLOW_VERSION=4;

  const style=document.createElement("style");
  style.id="erzwelt-knowledge-quest-style";
  style.textContent=`
    #quest.wissen-quest{border-top-color:#4aa978}
    #quest.wissen-quest #q-punkte{margin-top:7px}
    #quest.wissen-bereit{border-top-color:var(--gruen)}
    #quest.wissen-bereit:not(.breit){animation:wissenQuestPulse .8s ease 3}
    #quest .wissen-quest-action{width:100%;margin-top:8px;padding:8px 10px;border-radius:10px;
      background:var(--gruen);color:#fff;font-family:"Baloo 2",sans-serif;font-weight:800;
      box-shadow:0 3px 0 #18734a;font-size:var(--f1)}
    #quest .wissen-quest-action:active{transform:translateY(2px);box-shadow:0 1px 0 #18734a}
    @keyframes wissenQuestPulse{0%,100%{box-shadow:var(--sh)}50%{box-shadow:0 0 0 5px #2fbe7e45,var(--sh)}}
    @media(prefers-reduced-motion:reduce){#quest.wissen-bereit:not(.breit){animation:none}}
  `;
  document.head.appendChild(style);

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
      titel:textVon("knowledgequest.deine-lieferkette-steht"),
      aufgabe:"Schliesse zuerst das Tutorial ab.",
      fertig:()=>!tutorialLaeuft(),
      erfolg:textVon("knowledgequest.du-hast-rohstoffquelle-raffinerie")
    },
    {
      id:"lohn", seg:"leute", fields:["leute"],
      titel:textVon("knowledgequest.lohn-zufriedenheit-beobachten"),
      aufgabe:() => eigeneLohnquelle()
        ? textVon("knowledgequest.aendere-die-lohnstufe-in")
        : textVon("knowledgequest.eroeffne-eine-eigene-rohstoffquelle"),
      ziel:() => minenZiel(eigeneLohnquelle(), "lohn"),
      fertig:q=>!!q.flags.lohn,
      erfolg:textVon("knowledgequest.du-hast-die-lohnstufe")
    },
    {
      id:"markt", seg:"markt", fields:["markt"],
      titel:textVon("knowledgequest.markt-selbst-ausprobieren"),
      aufgabe:"Verkaufe nach dem Tutorial einmal selbst ein Produkt im Markt.",
      ziel:() => ({type:"dock", seite:"markt"}),
      fertig:q=>!!q.flags.markt,
      erfolg:textVon("knowledgequest.du-hast-selbst-verkauft")
    },
    {
      id:"geologie", seg:"geologie", fields:["geologie"],
      titel:textVon("knowledgequest.rohstoffstandorte-vergleichen"),
      aufgabe:q=>textVon("knowledgequest.oeffne-zwei-verschiedene-rohstoffstandorte", {p1:(Math.min(2,q.geologieBesucht.length))}),
      ziel:() => minenZiel(naechsterGeologieStandort()),
      fertig:q=>q.geologieBesucht.length>=2,
      erfolg:textVon("knowledgequest.du-hast-zwei-rohstoffstandorte")
    },
    {
      id:"ruf", seg:"ruf", fields:["ruf"],
      titel:textVon("knowledgequest.ruf-und-nachweise-unterscheiden"),
      aufgabe:textVon("knowledgequest.oeffne-ziel-vergleiche-dort"),
      ziel:() => ({type:"dock", seite:"ziel"}),
      fertig:q=>!!q.flags.ruf,
      erfolg:"Du hast Ruf und Nachweise verglichen. Sie haben im Spiel unterschiedliche Aufgaben."
    },
    {
      id:"modell", seg:"modell", fields:["modell"],
      titel:textVon("knowledgequest.das-spielmodell-einordnen"),
      aufgabe:"Schliesse zuerst die vorherigen Wissens-Quests ab.",
      fertig:q=>QUESTS.slice(0,-1).every(x=>q.collected[x.id]),
      erfolg:textVon("knowledgequest.du-hast-die-wichtigsten")
    }
  ];

  /* Nach dem Tutorial erst frei spielen (PAUSE Spieltage ≈ 2 Minuten bei 1×),
     dann kommen die Wissens-Quests – minimiert, mit Belohnung (BELOHNUNG). */
  const PAUSE=40, BELOHNUNG=20000;
  function aktiveQuest(){
    if(tutorialLaeuft()) return null;
    const q=flowState();
    if(typeof q.startTag!=="number") q.startTag=S.tag;
    // Pause nur vor der ersten Quest (ältere Spielstände mit abgeholten Quests: ohne Pause)
    if(!Object.keys(q.collected).length&&!q.flags.pauseVorbei&&S.tag<q.startTag+PAUSE) return null;
    return QUESTS.find(x=>!q.collected[x.id])||null;
  }
  function questFertig(def){ return !!(def&&def.fertig(flowState())); }
  function questZiel(){
    const def = aktiveQuest();
    return def?.ziel && !questFertig(def) ? def.ziel() : null;
  }
  function eigeneLohnquelle(){
    const quellen = Object.keys(S.minen);
    return quellen.find(id => S.minen[id].arbeiter > 0 && S.minen[id].stillBis <= S.tag) || quellen[0];
  }
  function minenZiel(id, steuerung){
    return id ? {type:"map", target:{kind:"mine", id}, oeffnen:true, steuerung} : null;
  }
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
      leute:textVon("knowledgequest.aendere-nach-dem-tutorial"),
      markt:"Verkaufe nach dem Tutorial einmal selbst ein Produkt.",
      geologie:textVon("knowledgequest.oeffne-zwei-verschiedene-rohstoffstandorte-2"),
      ruf:textVon("knowledgequest.oeffne-ziel-und-vergleiche"),
      modell:"Schliesse die vorherigen Wissens-Quests ab."
    };
    return map[segId]||"Erlebe diesen Zusammenhang einmal im Spiel.";
  }

  /* Erlebnis statt Grind. Ein Feld muss aber ausdrücklich über «Ansehen»
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

  /* Aufgabe der laufenden Wissens-Quest, sonst null (module/wissen.js) */
  (window.__erzweltWissenTeile ||= {}).questSchritt=function(){
    const def=aktiveQuest();
    if(!def) return null;
    const belohnung=chf(BELOHNUNG);
    if(questFertig(def)) return [def.titel,textVon("knowledgequest.erledigt-weiter",{betrag:belohnung})+" "+def.erfolg];
    return [def.titel,aufgabeText(def)+" "+textVon("knowledgequest.belohnung",{betrag:belohnung})];
  };

  function syncWissenHinweis(){
    const def=aktiveQuest();
    const q=document.getElementById("quest");
    if(!q) return;
    q.querySelector(".wissen-quest-action")?.remove();
    q.classList.remove("wissen-quest","wissen-bereit");
    document.querySelectorAll('[data-seite="wissen"]').forEach(b=>b.classList.remove("wink"));
    if(!def||tutorialLaeuft()||offenesBlatt||q.hidden) return;

    const state=flowState(),ready=questFertig(def),index=QUESTS.indexOf(def);
    q.classList.add("wissen-quest");
    q.classList.toggle("wissen-bereit",ready);
    const art=document.getElementById("q-art");
    if(art) art.textContent=ready?textVon("knowledgequest.wissen-freigeschaltet"):textVon("knowledgequest.wissens-quest", {p1:(index+1), p2:(QUESTS.length)});
    const emoji=document.getElementById("q-emoji");
    if(emoji) emoji.innerHTML=ready?(IK.gluehbirne||IK.wissen||IK.ziel):(IK.wissen||IK.ziel);
    const points=document.getElementById("q-punkte");
    if(points) points.innerHTML=QUESTS.map((x,i)=>`<i class="${state.collected[x.id]?"ok":i===index?"jetzt":""}"></i>`).join("");

    if(ready){
      const button=document.createElement("button");
      button.type="button";
      button.className="wissen-quest-action";
      button.dataset.wissenQuest=def.id;
      button.textContent=textVon("knowledgequest.ansehen");
      points?.insertAdjacentElement("beforebegin",button);
      document.querySelectorAll('[data-seite="wissen"]').forEach(b=>b.classList.add("wink"));
    }
    if(typeof questHoeheMessen==="function") questHoeheMessen();
  }

  /* Aufgabenkarte: Zustand vor, Wissens-Quest nach dem Zeichnen (module/quest.js) */
  Object.assign((window.__erzweltQuestTeile ||= {}), {wissenZustand:flowState, wissenHinweis:syncWissenHinweis});

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
    const ids=new Set(MINEN.map(m=>m.id));
    return [...preferred,...ids].find(id=>ids.has(id)&&!seen.includes(id))||null;
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
      S.kasse+=BELOHNUNG;
      notiz(textVon("knowledgequest.belohnung-erhalten",{betrag:chf(BELOHNUNG),nr:QUESTS.indexOf(def)+1,von:QUESTS.length}),"gut");
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

  window.__erzweltKnowledgeQuestFlow={
    version:FLOW_VERSION,
    quests:QUESTS.map(q=>q.id),
    active:()=>aktiveQuest()?.id||null,
    ziel:questZiel
  };
  flowState();
  if(typeof questZeichnen==="function") questZeichnen();
})();

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
  const FLOW_VERSION=1;

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
    if(q.startMinen===undefined) q.startMinen=null;
    q.version=FLOW_VERSION;
    if(!tutorialLaeuft()&&q.startMinen===null) q.startMinen=offeneMinen().length;
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
      titel:"Einen neuen Rohstoffstandort vergleichen",
      aufgabe:"Eröffne nach dem Tutorial eine weitere Rohstoffquelle. Vergleiche ihren Standort mit deinen bisherigen Quellen.",
      fertig:q=>offeneMinen().length>(q.startMinen??offeneMinen().length)||offeneMinen().length>=MINEN.length,
      erfolg:"Du hast einen weiteren Rohstoffstandort erschlossen. Rohstoffe liegen nicht überall am selben Ort."
    },
    {
      id:"ruf", seg:"ruf", fields:["ruf"],
      titel:"Ruf und Nachweise unterscheiden",
      aufgabe:"Öffne «Ziel». Vergleiche dort Ruf und Lieferketten-Nachweise.",
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

  function praxisText(segId){
    const map={
      kette:"Schliesse das Tutorial ab und erlebe die ganze Lieferkette.",
      chemie:"Schliesse das Tutorial ab und erlebe die Raffination.",
      fabrik:"Schliesse das Tutorial ab und produziere das erste Produkt.",
      leute:"Ändere nach dem Tutorial einmal die Lohnstufe einer Rohstoffquelle.",
      markt:"Verkaufe nach dem Tutorial einmal selbst ein Produkt.",
      geologie:"Eröffne nach dem Tutorial eine weitere Rohstoffquelle.",
      ruf:"Öffne «Ziel» und vergleiche Ruf mit Lieferketten-Nachweisen.",
      modell:"Schliesse die vorherigen Wissens-Quests ab."
    };
    return map[segId]||"Erlebe diesen Zusammenhang einmal im Spiel.";
  }

  /* Eine konkrete Erfahrung pro Wissensfeld. Die zweite Verbesserung braucht
     nur noch die erste Verbesserung desselben Feldes; das prüft die bestehende UI. */
  wissenPraxis=function(segId,stufe){
    flowState();
    return {ok:feldFrei(segId),text:praxisText(segId)};
  };

  const originalNaechsterSchritt=naechsterSchritt;
  naechsterSchritt=function(){
    const def=aktiveQuest();
    if(def){
      if(questFertig(def)) return [def.titel,def.erfolg];
      return [def.titel,def.aufgabe];
    }
    return originalNaechsterSchritt();
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
    if(art) art.textContent=ready?"Wissen freigeschaltet":`Wissens-Quest ${index+1}/${QUESTS.length}`;
    const emoji=document.getElementById("q-emoji");
    if(emoji) emoji.innerHTML=ready?(IK.gluehbirne||IK.wissen||IK.ziel):(IK.wissen||IK.ziel);
    const points=document.getElementById("q-punkte");
    if(points) points.innerHTML=QUESTS.map((x,i)=>`<i class="${state.collected[x.id]?"ok":i===index?"jetzt":""}"></i>`).join("");

    if(ready){
      const button=document.createElement("button");
      button.type="button";
      button.className="wissen-quest-action";
      button.dataset.wissenQuest=def.id;
      button.textContent="Ansehen";
      points?.insertAdjacentElement("beforebegin",button);
      document.querySelectorAll('[data-seite="wissen"]').forEach(b=>b.classList.add("wink"));
    }
    if(typeof questHoeheMessen==="function") questHoeheMessen();
  }

  const originalQuestZeichnen=questZeichnen;
  questZeichnen=function(){
    flowState();
    const out=originalQuestZeichnen();
    syncWissenHinweis();
    return out;
  };

  function markieren(flag){
    if(tutorialLaeuft()) return;
    const q=flowState();
    if(q.flags[flag]) return;
    q.flags[flag]=true;
    if(typeof speichern==="function") speichern();
    if(typeof questZeichnen==="function") questZeichnen();
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
    const t=e.target.closest("[data-tun]");
    if(t?.dataset.tun==="lohn") markieren("lohn");
    if(t?.dataset.tun==="handverkauf") markieren("markt");
    const s=e.target.closest("[data-seite]");
    if(s?.dataset.seite==="ziel") markieren("ruf");

    if(t?.dataset.tun==="mine-auf"){
      const q=flowState();
      if(offeneMinen().length>(q.startMinen??offeneMinen().length)){
        if(typeof speichern==="function") speichern();
        if(typeof questZeichnen==="function") questZeichnen();
      }
    }
  });

  /* Bestehende Post-Tutorial-Spielstände starten ab ihrem aktuellen Stand.
     Es wird nichts rückwirkend als erledigt erfunden; nur das Tutorial selbst
     schaltet die drei dort direkt erlebten Grundlagen frei, sobald es abgeholt wird. */
  flowState();
  if(typeof questZeichnen==="function") questZeichnen();
  window.__erzweltKnowledgeQuestFlow={version:FLOW_VERSION,quests:QUESTS.map(q=>q.id)};
})();

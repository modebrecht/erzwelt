"use strict";
/* ============================================================
   AUFGABENKARTE (#quest)

   Einziger Ort, an dem questZeichnen festgelegt wird. Früher lagen elf
   Hüllen aus elf Dateien übereinander; hier stehen ihre Schritte in derselben
   Reihenfolge hintereinander. Teile, die auch anderswo gebraucht werden, bleiben
   in ihrer Datei und melden sich in window.__erzweltQuestTeile an:

     wissenZustand, wissenHinweis   knowledge-quest-flow.js
     phasen, phaseFor, dynamischerText   tutorial-enhance.js
     ortZiel                        map-focus-navigation.js
     zielZeigen                     objective-guide.js  («Ziel zeigen»)
     engpassKasten, questKompakt    sek-b-klarheit.js
     phaseZeile                     handy-layout.js
     wissenFeiern                   erfolg-feier.js
     kuerzel                        premium-spielgefuehl.js

   Ablauf von questZeichnen:
     1. Wissens-Quest-Zustand anlegen
     2. Kern (erzwelt-core.html) nur, wenn sich Inhalt, Reiter oder Blatt
        geändert haben (früher performance-pass.js); danach ausserhalb des
        Tutorials Kopf «Hinweis» (didactic-should.js)
     3. Tutorial: Phasenkette, Zusammenhang, Meldungen darunter (tutorial-enhance.js)
     4. Ort-Ziel antippbar (map-focus-navigation.js)
     5. Wissens-Quest: Kopf, Punkte, «Ansehen» (knowledge-quest-flow.js)
     6. «Ziel zeigen» (objective-guide.js)
     7. Engpass-Kasten, schmale Zeile auf anderen Reitern (sek-b-klarheit.js)
     8. Phase in einer Zeile, Höhe messen (handy-layout.js)
     9. Neues Wissen feiern (erfolg-feier.js)
    10. Rohstoff-Kürzel im Text (premium-spielgefuehl.js)
    11. «Neues Wissen» statt «Wissen freigeschaltet» (aufgabe-kompakt.js)
   ============================================================ */
(function(){
  const T = window.__erzweltQuestTeile;
  const kernQuest = questZeichnen;

  /* ---------- 2. Kern nur bei geändertem Inhalt ---------- */
  let kernStand = "";
  function kernZeichnen(){
    const t = tutorialSchritt();
    const w = t ? null : naechsterSchritt();
    const stand = JSON.stringify([
      aktiveSeite, !!offenesBlatt,
      t ? [S.tutorial, t.id, t.titel, t.text] : w
    ]);
    if (stand === kernStand) return;
    kernStand = stand;
    const out = kernQuest();
    if (!tutorialLaeuft()){
      const q = document.getElementById("quest");
      if (q && !q.hidden){ const art = document.getElementById("q-art"); if (art) art.textContent = textVon("notificationhi.hinweis"); }
    }
    return out;
  }

  /* ---------- 3. Tutorial in der Karte ---------- */
  const {phasen:PHASEN, phaseFor, dynamischerText} = T;
  function ensureExtras(q){
    let chain=q.querySelector(".tutorial-kette");
    if(!chain){
      chain=document.createElement("div");chain.className="tutorial-kette";chain.setAttribute("aria-label",textVon("quest.fortschritt-in-der-lieferkette"));
      chain.innerHTML=PHASEN.map(p=>`<div class="tutorial-phase" data-phase="${p.id}"><b>${p.nr}</b><span>${p.label}</span></div>`).join("");
      const progress=q.querySelector(".fortschritt");if(progress)progress.insertAdjacentElement("beforebegin",chain);else q.appendChild(chain);
    }
    let phaseName=q.querySelector(".tutorial-phase-name");
    if(!phaseName){phaseName=document.createElement("div");phaseName.className="tutorial-phase-name";chain.insertAdjacentElement("afterend",phaseName);}
    let relation=q.querySelector(".tutorial-zusammenhang");
    if(!relation){relation=document.createElement("div");relation.className="tutorial-zusammenhang";const text=q.querySelector("#q-text");if(text)text.insertAdjacentElement("afterend",relation);else q.appendChild(relation);}
    return {chain,phaseName,relation};
  }

  function syncTutorialToastLayout(q,t){
    const root=document.getElementById("toasts");
    if(!root)return;
    const small=window.matchMedia?.("(max-width:560px)").matches;
    const stacked=!!t&&!!q&&!q.hidden&&q.classList.contains("tutorial-aktiv")&&!q.classList.contains("breit")&&small&&aktiveSeite==="karte"&&!offenesBlatt;
    if(!stacked){
      root.style.removeProperty("top");
      root.style.removeProperty("width");
      return;
    }
    const bottom=Math.ceil(q.getBoundingClientRect().bottom+8);
    root.style.setProperty("top",bottom+"px","important");
    root.style.setProperty("width","min(72%,310px)","important");
  }

  let lastQuestKey="";
  function tutorialZeichnen(){
    const q=document.getElementById("quest"),t=tutorialSchritt();
    if(!q)return;
    if(!t||q.hidden){
      q.classList.remove("tutorial-aktiv");
      q.querySelectorAll(".tutorial-kette,.tutorial-phase-name,.tutorial-zusammenhang").forEach(el=>el.hidden=true);
      lastQuestKey="";
      syncTutorialToastLayout(q,null);
      return;
    }
    q.classList.add("tutorial-aktiv");
    const text=dynamischerText(t);
    const key=[S.tutorial,t.id,text,t.zusammenhang,aktiveSeite,!!offenesBlatt].join("|");
    if(key===lastQuestKey)return;
    lastQuestKey=key;
    const qText=document.getElementById("q-text");if(qText&&qText.textContent!==text)qText.textContent=text;
    const {chain,phaseName,relation}=ensureExtras(q);chain.hidden=phaseName.hidden=relation.hidden=false;
    const current=phaseFor(t.id);
    chain.querySelectorAll(".tutorial-phase").forEach((el,i)=>{el.classList.toggle("erledigt",i<current);el.classList.toggle("aktiv",i===current);});
    phaseName.textContent=textVon("quest.phase", {p1:(current+1), p2:(PHASEN[current]?.label||"Lieferkette")});
    relation.innerHTML=textVon("quest.zusammenhang", {p1:(t.zusammenhang||"")});
    if(typeof questHoeheMessen==="function")questHoeheMessen();
    requestAnimationFrame(()=>syncTutorialToastLayout(q,t));
  }

  function scheduleToastLayout(){
    const q=document.getElementById("quest"),t=typeof tutorialSchritt==="function"?tutorialSchritt():null;
    requestAnimationFrame(()=>syncTutorialToastLayout(q,t));
  }
  window.addEventListener("resize",scheduleToastLayout);
  const tutorialQuest=document.getElementById("quest");
  if(tutorialQuest&&typeof ResizeObserver==="function"){
    const observer=new ResizeObserver(scheduleToastLayout);
    observer.observe(tutorialQuest);
  }

  /* ---------- 9. Neues Wissen feiern ---------- */
  const anzahlWissen = () => Object.keys(S?.wissenQuestFlow?.collected || {}).length;
  let wissenBisher = anzahlWissen();

  questZeichnen = function(){
    T.wissenZustand();
    const out = kernZeichnen();
    tutorialZeichnen();
    T.ortZiel();
    T.wissenHinweis();
    T.zielZeigen();
    T.engpassKasten();
    T.questKompakt();
    T.phaseZeile();
    if (typeof questHoeheMessen === "function") questHoeheMessen();
    const jetzt = anzahlWissen();
    if (jetzt > wissenBisher) T.wissenFeiern();
    wissenBisher = jetzt;
    T.kuerzel(document.getElementById("q-text"));
    const art = document.getElementById("q-art");
    if (art && art.textContent === "Wissen freigeschaltet") art.textContent = textVon("quest.neues-wissen");
    return out;
  };

  questZeichnen();
  /* Nach einem Tutorialschritt Phasenkette und Zusammenhang sicher neu schreiben */
  window.__erzweltQuest = {version:1, tutorialNeu(){ lastQuestKey = ""; }};
})();

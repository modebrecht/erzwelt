"use strict";
/* ============================================================
   OBJECTIVE GUIDE

   Sichtbarer Hilfeweg fuer Lernende, die nicht wissen, wo sie als
   Naechstes klicken sollen. Der bestehende Hinweis bleibt als Ganzes
   anklickbar; zusaetzlich zeigt ein eindeutiger Button das aktuelle Ziel.

   Keine Progression und keine Wirtschaft werden veraendert.
   ============================================================ */
(function(){
  const VERSION=3;

  const arrowSvg=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function activeKnowledgeId(){
    if(typeof tutorialLaeuft==="function"&&tutorialLaeuft()) return null;
    const api=window.__erzweltKnowledgeQuestFlow;
    if(typeof api?.active==="function") return api.active();
    const flow=S?.wissenQuestFlow;
    const ids=api?.quests||[];
    if(!flow||!ids.length) return null;
    return ids.find(id=>!flow.collected?.[id])||null;
  }

  function guideAvailable(q){
    if(!q||q.hidden||offenesBlatt) return false;
    if(q.querySelector(".wissen-quest-action")||q.classList.contains("wissen-bereit")) return false;
    if(q.dataset.contextAction==="1") return true;
    return q.classList.contains("wissen-quest")&&["geologie","ruf"].includes(activeKnowledgeId());
  }

  function openGeologyTarget(){
    const id=window.__erzweltKnowledgeQuestFlow?.nextGeologyTarget?.();
    if(!id) return false;
    if(typeof seiteWechseln==="function"&&aktiveSeite!=="karte") seiteWechseln("karte");
    if(typeof blattZu==="function"&&offenesBlatt) blattZu();
    const open=()=>{
      const pin=document.querySelector(`#welt .pin[data-pin="mine"][data-id="${CSS.escape(String(id))}"]`);
      const button=pin?.querySelector(".knopf");
      if(!button) return false;
      button.click();
      return true;
    };
    requestAnimationFrame(()=>requestAnimationFrame(open));
    return true;
  }

  function goToObjective(q){
    const knowledgeId=activeKnowledgeId();
    if(q.classList.contains("wissen-quest")&&knowledgeId==="geologie"){
      if(openGeologyTarget()) return;
    }
    if(q.classList.contains("wissen-quest")&&knowledgeId==="ruf"){
      if(typeof seiteWechseln==="function") seiteWechseln("ziel");
      else document.querySelector('#dock button[data-seite="ziel"]')?.click();
      return;
    }

    /* map-focus-navigation hat den eigentlichen Kontext bereits ermittelt.
       Ein programmatischer Klick auf die Karte selbst nutzt genau denselben
       Weg wie ein Klick der lernenden Person auf den Hinweis. */
    q.click();
  }

  function syncGuide(){
    const q=document.getElementById("quest");
    if(!q) return;
    q.querySelector(".objective-guide-action")?.remove();
    if(!guideAvailable(q)) return;

    const button=document.createElement("button");
    button.type="button";
    button.className="objective-guide-action";
    button.dataset.objectiveGuide="1";
    button.innerHTML=`${arrowSvg}<span>Ziel zeigen</span>`;
    button.setAttribute("aria-label","Aktuelles Ziel anzeigen");
    button.addEventListener("click",e=>{
      e.preventDefault();
      e.stopPropagation();
      goToObjective(q);
    });

    const progress=document.getElementById("q-punkte");
    if(progress) progress.insertAdjacentElement("beforebegin",button);
    else q.appendChild(button);
    if(typeof questHoeheMessen==="function") questHoeheMessen();
  }

  if(typeof questZeichnen==="function"){
    const priorQuestZeichnen=questZeichnen;
    questZeichnen=function(){
      const out=priorQuestZeichnen();
      syncGuide();
      return out;
    };
  }

  /* Falls ein Klick ausserhalb des Hinweiss den Kontext aendert, ist der
     Button nach dem naechsten Render ebenfalls korrekt. */
  document.addEventListener("click",e=>{
    if(e.target.closest("#quest")) return;
    requestAnimationFrame(syncGuide);
  });

  syncGuide();
  window.__erzweltObjectiveGuide={version:VERSION,label:"Ziel zeigen"};
})();

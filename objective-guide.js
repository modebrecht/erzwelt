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

  const style=document.createElement("style");
  style.id="erzwelt-objective-guide-style";
  style.textContent=`
    #quest .objective-guide-action{
      width:100%;min-height:42px;margin-top:8px;padding:8px 12px;border-radius:10px;
      display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;
      background:#fff7df;color:#704d0b;border:1.5px solid #e5ba55;
      font-family:"Baloo 2",sans-serif;font-weight:800;font-size:var(--f1);
      box-shadow:0 2px 0 #d6a438;
    }
    #quest .objective-guide-action:active{transform:translateY(1px);box-shadow:0 1px 0 #d6a438}
    #quest .objective-guide-action svg{width:15px;height:15px;flex:none}
    #quest.wissen-quest .objective-guide-action{background:#edf8f1;color:#276548;border-color:#83c69f;box-shadow:0 2px 0 #5aa77d}
    #quest.wissen-quest .objective-guide-action:active{box-shadow:0 1px 0 #5aa77d}
    @media(max-width:560px){
      #quest.wissen-quest:not(.breit){width:min(64%,300px)}
    }
  `;
  document.head.appendChild(style);

  const arrowSvg=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function guideAvailable(q){
    if(!q||q.hidden||offenesBlatt) return false;
    if(q.querySelector(".wissen-quest-action")||q.classList.contains("wissen-bereit")) return false;
    return q.dataset.contextAction==="1";
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
      q.click();
    });

    const progress=document.getElementById("q-punkte");
    if(progress) progress.insertAdjacentElement("beforebegin",button);
    else q.appendChild(button);
    if(typeof questHoeheMessen==="function") questHoeheMessen();
  }

  /* Nach jedem Zeichnen der Aufgabenkarte (module/quest.js) */
  (window.__erzweltQuestTeile ||= {}).zielZeigen=syncGuide;

  /* Falls ein Klick ausserhalb des Hinweiss den Kontext aendert, ist der
     Button nach dem naechsten Render ebenfalls korrekt. */
  document.addEventListener("click",e=>{
    if(e.target.closest("#quest")) return;
    requestAnimationFrame(syncGuide);
  });

  syncGuide();
  window.__erzweltObjectiveGuide={version:VERSION,label:"Ziel zeigen"};
})();

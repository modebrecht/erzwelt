"use strict";
/* Didaktischer Qualitäts-Pass für das Tutorial (Schritte: einfuehrung.js).
   Keine neuen Lernziele: Aufgabe + Begründung + sichtbarer Platz in der Lieferkette. */

(function(){
  const PHASEN=[
    // Schritt-IDs aus einfuehrung.js.
    {id:"rohstoff",nr:1,label:"Rohstoffe",steps:["kupfer-auf","kupfer-crew","alu-auf","alu-crew","zinn-auf","zinn-crew"]},
    {id:"raff",nr:2,label:"Raffination",steps:["raff","raffcrew"]},
    {id:"fab",nr:3,label:"Fertigung",steps:["fab","fab-crew"]},
    {id:"verkauf",nr:4,label:"Verkauf",steps:["verkauf","verkaeufer"]}
  ];

  function phaseFor(id){return PHASEN.findIndex(p=>p.steps.includes(id));}

  function dynamischerText(t){
    if(!t)return "";
    if(t.id==="verkauf"){
      const lager=S.ware?.[START_PRODUKT]||0;
      if(lager<=0){
        const fab=S.fabriken.find(f=>f.produkt===START_PRODUKT&&f.restbau<=0);
        if(!fab)return "Noch ist keine fertige Kabelfabrik vorhanden. Lass den Bau zuerst abschliessen.";
        if(fab.arbeiter<=0)return "Noch entstehen keine Ladekabel. Der Fabrik ist noch kein Personal zugewiesen.";
        const def=PRODUKT[START_PRODUKT];
        const fehlt=Object.keys(def.rezept||{}).filter(k=>(S.mat[k]||0)<def.rezept[k]);
        if(fehlt.length)return `Noch entstehen keine Ladekabel. Es fehlt ${fehlt.map(k=>MATERIAL[k].name).join(", ")}. Prüfe Rohstoffquellen und Raffinerie.`;
        return "Die Fabrik kann produzieren. Lass die Zeit laufen, bis mindestens ein Ladekabel im Lager liegt; verkaufe es danach im Markt.";
      }
      return `Im Lager liegen ${Math.round(lager)} Ladekabel. Verkaufe einmal selbst im Markt und beobachte, wie aus Ware Geld wird.`;
    }
    return t.text;
  }

  function ensureExtras(q){
    let chain=q.querySelector(".tutorial-kette");
    if(!chain){
      chain=document.createElement("div");chain.className="tutorial-kette";chain.setAttribute("aria-label","Fortschritt in der Lieferkette");
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
  if(typeof questZeichnen==="function"){
    const originalQuest=questZeichnen;
    questZeichnen=function(){
      const out=originalQuest();
      const q=document.getElementById("quest"),t=tutorialSchritt();
      if(!q)return out;
      if(!t||q.hidden){
        q.classList.remove("tutorial-aktiv");
        q.querySelectorAll(".tutorial-kette,.tutorial-phase-name,.tutorial-zusammenhang").forEach(el=>el.hidden=true);
        lastQuestKey="";
        syncTutorialToastLayout(q,null);
        return out;
      }
      q.classList.add("tutorial-aktiv");
      const text=dynamischerText(t);
      const key=[S.tutorial,t.id,text,t.zusammenhang,aktiveSeite,!!offenesBlatt].join("|");
      if(key===lastQuestKey)return out;
      lastQuestKey=key;
      const qText=document.getElementById("q-text");if(qText&&qText.textContent!==text)qText.textContent=text;
      const {chain,phaseName,relation}=ensureExtras(q);chain.hidden=phaseName.hidden=relation.hidden=false;
      const current=phaseFor(t.id);
      chain.querySelectorAll(".tutorial-phase").forEach((el,i)=>{el.classList.toggle("erledigt",i<current);el.classList.toggle("aktiv",i===current);});
      phaseName.textContent=`Phase ${current+1}/4 · ${PHASEN[current]?.label||"Lieferkette"}`;
      relation.innerHTML=`<b>Zusammenhang:</b> ${t.zusammenhang||""}`;
      if(typeof questHoeheMessen==="function")questHoeheMessen();
      requestAnimationFrame(()=>syncTutorialToastLayout(q,t));
      return out;
    };
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

  let feedbackTimer=0;
  function feedback(html,finale){
    let el=document.getElementById("tutorial-lernfeedback");
    if(!el){el=document.createElement("div");el.id="tutorial-lernfeedback";document.body.appendChild(el);}
    clearTimeout(feedbackTimer);el.classList.remove("rein");
    el.innerHTML=finale?`<b>Tutorial abgeschlossen</b><br>${html}`:`<b>Schritt abgeschlossen</b><br>${html}`;
    if(OPT.anim!==0&&!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches){requestAnimationFrame(()=>el.classList.add("rein"));feedbackTimer=setTimeout(()=>el.remove(),3000);}
    else{el.style.opacity="1";feedbackTimer=setTimeout(()=>el.remove(),2200);}
  }

  if(typeof tutorialPruefen==="function"){
    const originalTutorialPruefen=tutorialPruefen;
    tutorialPruefen=function(){
      const before=S.tutorial,step=TUTORIAL[before];
      const out=originalTutorialPruefen();
      const after=S.tutorial;
      if(after>before){
        if(after>=TUTORIAL.length)feedback("Rohstoffquelle → Raffinerie → Fabrik → Verkauf → Geld",true);
        else if(step?.zusammenhang)feedback(step.zusammenhang,false);
        lastQuestKey="";if(typeof questZeichnen==="function")questZeichnen();
      }
      return out;
    };
  }

  if(typeof notiz==="function"){
    const originalNotiz=notiz;
    notiz=function(text,art){
      if(typeof text==="string"&&text.startsWith("Tutorial geschafft –"))text="Tutorial abgeschlossen – du hast die Lieferkette einmal vollständig aufgebaut. Weitere Standorte, Produkte und Ausbauten sind jetzt verfügbar.";
      return originalNotiz(text,art);
    };
  }

  if(typeof questZeichnen==="function")questZeichnen();
  window.__erzweltTutorialEnhance={version:3,steps:TUTORIAL.length,phases:PHASEN.map(p=>p.id),mobileToastStack:true,eventDrivenToastLayout:true};
})();

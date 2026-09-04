"use strict";
/* Didaktischer Qualitäts-Pass für das bestehende 11-Schritt-Tutorial.
   Keine neuen Lernziele: Aufgabe + Begründung + sichtbarer Platz in der Lieferkette. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-tutorial-enhance-style";
  style.textContent=`
    #quest .tutorial-kette{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:8px 0 6px}
    #quest .tutorial-phase{min-width:0;padding:4px 3px;border-radius:8px;background:#e8deca;color:#78684e;
      text-align:center;font-size:9px;font-weight:800;line-height:1.1;border:1px solid transparent}
    #quest .tutorial-phase b{display:block;font-family:"Baloo 2",sans-serif;font-size:11px;line-height:1}
    #quest .tutorial-phase.erledigt{background:#e0f2e8;color:#276b4d}
    #quest .tutorial-phase.aktiv{background:#fff0c9;color:#71500e;border-color:#edc766;box-shadow:0 0 0 2px #f5b73d20}
    #quest .tutorial-phase-name{font-size:10px;color:var(--grau);font-weight:800;text-align:center;margin:-1px 0 5px}
    #quest .tutorial-zusammenhang{margin-top:6px;padding:6px 8px;border-radius:9px;background:#eef6f3;color:#31594a;
      font-size:10.5px;line-height:1.25;font-weight:700}
    #quest .tutorial-zusammenhang b{display:inline;font-family:inherit;font-size:inherit;color:#1f6b4e;margin:0}
    #quest:not(.breit) .tutorial-phase span{display:none}
    #quest:not(.breit) .tutorial-phase{padding:4px 2px}

    #tutorial-lernfeedback{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 68px);z-index:90;
      width:min(92vw,480px);transform:translateX(-50%);pointer-events:none;padding:10px 13px;border-radius:14px;
      background:#f5fff9;color:#214f3c;border:2px solid #69bf91;box-shadow:0 7px 22px #0003;
      font-size:var(--f1);font-weight:700;text-align:center}
    #tutorial-lernfeedback b{font-family:"Baloo 2",sans-serif;color:#17613f}
    #tutorial-lernfeedback.rein{animation:tutorialFeedback 2.8s ease both}
    @keyframes tutorialFeedback{0%{opacity:0;transform:translate(-50%,-12px) scale(.96)}10%,78%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-7px) scale(.98)}}
    @media(prefers-reduced-motion:reduce){#tutorial-lernfeedback.rein{animation:none}}
  `;
  document.head.appendChild(style);

  const PHASEN=[
    {id:"rohstoff",nr:1,label:"Rohstoffe",steps:["mine1","minecrew","team","minen3","crew3"]},
    {id:"raff",nr:2,label:"Raffination",steps:["raff","raffcrew"]},
    {id:"fab",nr:3,label:"Fertigung",steps:["fab","fabcrew"]},
    {id:"verkauf",nr:4,label:"Verkauf",steps:["verkauf","verkaeufer"]}
  ];

  const COPY={
    mine1:{titel:"Erste Rohstoffquelle eröffnen",text:"Das Ladekabel braucht Kupfer, Aluminium und Zinn. Beginne mit einer Quelle für einen dieser Rohstoffe.",zusammenhang:"Rohstoffquellen liefern die Ausgangsstoffe der Lieferkette."},
    minecrew:{titel:"Förderung starten",text:"Eine eröffnete Rohstoffquelle produziert erst mit Personal. Weise mindestens 10 Personen zu.",zusammenhang:"Rohstoffquelle + Personal → Rohstoff"},
    team:{titel:"Personal für die Kette bereitstellen",text:"Mehrere Stationen brauchen gleichzeitig Personal. Erhöhe den Personalbestand auf mindestens 40 Personen.",zusammenhang:"Personal ist begrenzt und muss auf die Stationen der Lieferkette verteilt werden."},
    minen3:{titel:"Drei Rohstoffe sichern",text:"Eröffne je eine Quelle für Kupfererz, Bauxit und Zinnerz. Daraus entstehen später Kupfer, Aluminium und Zinn.",zusammenhang:"Kupfererz → Kupfer · Bauxit → Aluminium · Zinnerz → Zinn"},
    crew3:{titel:"Alle Rohstoffquellen aktivieren",text:"Eine eröffnete Quelle ohne Personal fördert nichts. Weise jeder der drei Quellen mindestens 5 Personen zu.",zusammenhang:"Erst aktive Rohstoffquellen versorgen die nächste Station."},
    raff:{titel:"Rohstoffe verarbeiten",text:"Die geförderten Rohstoffe können nicht direkt in der Fabrik verwendet werden. Baue eine Raffinerie.",zusammenhang:"Rohstoff → Raffinerie → nutzbares Material"},
    raffcrew:{titel:"Raffination starten",text:"Auch die Raffinerie arbeitet nur mit Personal. Weise ihr mindestens 5 Personen zu.",zusammenhang:"Die Raffinerie wandelt Rohstoffe in Materialien für die Fertigung um."},
    fab:{titel:"Kabelfabrik bauen",text:"Jetzt kann aus den Materialien ein Produkt entstehen. Baue die Fabrik für Ladekabel.",zusammenhang:"Materialien → Fabrik → Produkt"},
    fabcrew:{titel:"Produktion starten",text:"Eine fertige Fabrik braucht Personal und die Materialien ihres Rezepts. Weise ihr Personal zu.",zusammenhang:"Nur wenn Personal und alle benötigten Materialien vorhanden sind, entsteht ein Produkt."},
    verkauf:{titel:"Erstes Produkt verkaufen",text:"Produktion erzeugt Warenbestand, aber noch kein Geld. Verkaufe Ladekabel einmal selbst im Markt.",zusammenhang:"Produkt → Verkauf → Geld"},
    verkaeufer:{titel:"Verkaufsteam einsetzen",text:"Der manuelle Verkauf gilt nur für einen Spieltag. Weise mindestens 2 Personen dem Verkauf zu.",zusammenhang:"Verkaufskapazität bestimmt, wie viele fertige Produkte pro Tag verkauft werden können."}
  };

  const tut=Object.fromEntries(TUTORIAL.map(t=>[t.id,t]));
  for(const [id,c] of Object.entries(COPY)){
    if(!tut[id])continue;
    tut[id].titel=c.titel;
    tut[id].text=c.text;
    tut[id].zusammenhang=c.zusammenhang;
  }

  if(tut.minecrew)tut.minecrew.fertig=()=>Object.values(S.minen).some(m=>m.arbeiter>=10);

  function phaseFor(id){return PHASEN.findIndex(p=>p.steps.includes(id));}

  function dynamischerText(t){
    if(!t)return "";
    if(t.id==="fabcrew"){
      const baut=S.fabriken.filter(f=>f.restbau>0);
      if(baut.length){const rest=Math.min(...baut.map(f=>f.restbau));return `Die Kabelfabrik wird gebaut. Noch ${rest} ${rest===1?"Tag":"Tage"}. Danach kannst du Personal zuweisen.`;}
      const fertig=S.fabriken.find(f=>f.restbau<=0);
      if(fertig&&fertig.arbeiter<=0)return "Die Kabelfabrik ist fertig. Weise ihr jetzt Personal zu, damit die Produktion starten kann.";
    }
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

  let lastQuestKey="";
  if(typeof questZeichnen==="function"){
    const originalQuest=questZeichnen;
    questZeichnen=function(){
      const out=originalQuest();
      const q=document.getElementById("quest"),t=tutorialSchritt();
      if(!q)return out;
      if(!t||q.hidden){q.querySelectorAll(".tutorial-kette,.tutorial-phase-name,.tutorial-zusammenhang").forEach(el=>el.hidden=true);lastQuestKey="";return out;}
      const text=dynamischerText(t);
      const key=[S.tutorial,S.tag,t.id,text,t.zusammenhang,aktiveSeite,!!offenesBlatt].join("|");
      if(key===lastQuestKey)return out;
      lastQuestKey=key;
      const qText=document.getElementById("q-text");if(qText&&qText.textContent!==text)qText.textContent=text;
      const {chain,phaseName,relation}=ensureExtras(q);chain.hidden=phaseName.hidden=relation.hidden=false;
      const current=phaseFor(t.id);
      chain.querySelectorAll(".tutorial-phase").forEach((el,i)=>{el.classList.toggle("erledigt",i<current);el.classList.toggle("aktiv",i===current);});
      phaseName.textContent=`Phase ${current+1}/4 · ${PHASEN[current]?.label||"Lieferkette"}`;
      relation.innerHTML=`<b>Zusammenhang:</b> ${t.zusammenhang||""}`;
      if(typeof questHoeheMessen==="function")questHoeheMessen();
      return out;
    };
  }

  let feedbackTimer=0;
  function feedback(html,finale){
    let el=document.getElementById("tutorial-lernfeedback");
    if(!el){el=document.createElement("div");el.id="tutorial-lernfeedback";document.body.appendChild(el);}
    clearTimeout(feedbackTimer);el.classList.remove("rein");
    el.innerHTML=finale?`<b>Tutorial abgeschlossen</b><br>${html}`:`<b>Schritt verstanden</b><br>${html}`;
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
  window.__erzweltTutorialEnhance={version:1,steps:TUTORIAL.length,phases:PHASEN.map(p=>p.id)};
})();

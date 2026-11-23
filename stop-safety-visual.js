"use strict";
/* Visual separation of strike/standstill vs safety/accident in the mine sheet.
   Presentation only. Ursache und Dauer des Stillstands sowie die Anzeige an den
   Pins kommen aus module/karte.js (__erzweltKarte.stillstand). */
(function(){
  const still = () => window.__erzweltKarte.stillstand;
  const safeShieldSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6z" fill="currentColor" opacity=".14"/><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m8.5 12 2.2 2.2 4.8-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function stopCard(def,m){
    if(!m||m.stillBis<=S.tag)return "";
    const cause=still().ursache(def,m),rest=still().rest(m),ikon=still().ikon;
    const title=cause==="streik"?"Streik / Stillstand":cause==="sicherheit"?"Sicherheitsstopp":"Stillstand";
    const body=cause==="streik"
      ?"Die Förderung steht wegen der Lohn- und Zufriedenheitssituation still. Sicherheitsmassnahmen sind davon getrennt."
      :cause==="sicherheit"
        ?"Die Förderung steht wegen eines Sicherheitsereignisses still. Der Lohn ist nicht die Ursache des Unfallrisikos."
        :"Die Förderung steht vorübergehend still.";
    const icon=cause==="sicherheit"?ikon.schild():cause==="streik"?ikon.pause():ikon.stopp();
    return `<div class="karte mine-stillstand-card ${cause}"><div class="mine-stillstand-head"><span class="mine-stillstand-icon">${icon}</span><div><h3>${title}</h3><small>Förderung gestoppt${rest?" · "+rest:""}</small></div></div><div class="ort">${body}</div></div>`;
  }

  function decorateMineDetail(){
    const root=document.getElementById("blattinhalt");
    if(!root||typeof offenesBlatt==="undefined"||offenesBlatt?.art!=="mine")return;
    if(typeof tutorialLaeuft==="function"&&tutorialLaeuft())return;
    const def=MINEN.find(x=>x.id===offenesBlatt.id),m=S.minen?.[offenesBlatt.id];
    if(!def||!m)return;

    const safety=root.querySelector(".sicherheitskarte");
    if(safety){
      const sicher=!!m.sicherheit;
      safety.classList.toggle("sicher",sicher);
      safety.classList.toggle("offen",!sicher);
      if(!safety.querySelector(".sicherheitskopf")){
        const h3=safety.querySelector("h3");
        const head=document.createElement("div");
        head.className="sicherheitskopf";
        head.innerHTML=`<span class="sicherheits-symbol">${sicher?safeShieldSvg():still().ikon.schild()}</span><div><h3>Sicherheit</h3><small>${sicher?"Sicherheitsmassnahmen verbessert":"Sicherheitsmassnahmen nicht verbessert"}</small></div>`;
        if(h3)h3.replaceWith(head);else safety.prepend(head);
      }
    }

    let relations=root.querySelector(".mine-ursachen");
    if(!relations){
      const satisfaction=root.querySelector(".zufriedenheitskarte");
      relations=document.createElement("div");
      relations.className="mine-ursachen";
      relations.setAttribute("aria-label","Getrennte Zusammenhänge");
      relations.innerHTML='<div class="mine-ursache lohn"><b>Lohn → Zufriedenheit → Streik</b><span>Lohn beeinflusst die Zufriedenheit.</span></div><div class="mine-ursache sicherheit"><b>Sicherheit → Unfallrisiko</b><span>Sicherheitsmassnahmen beeinflussen das Unfallrisiko.</span></div>';
      if(satisfaction)satisfaction.before(relations);else root.appendChild(relations);
    }

    root.querySelector(".mine-stillstand-card")?.remove();
    const stop=stopCard(def,m);
    if(stop){
      const holder=document.createElement("div");
      holder.innerHTML=stop;
      if(holder.firstElementChild)root.prepend(holder.firstElementChild);
    }
  }

  if(typeof blattFuellen==="function"){
    const originalBlattFuellen=blattFuellen;
    blattFuellen=function(...args){
      const out=originalBlattFuellen.apply(this,args);
      decorateMineDetail();
      return out;
    };
  }

  Erzwelt.nachZeichnen(()=>decorateMineDetail());

  window.__erzweltStopSafetyVisual={version:1,features:["strike-vs-safety","real-stop-visual","mine-detail-causal-separation","resume-feedback"]};
})();

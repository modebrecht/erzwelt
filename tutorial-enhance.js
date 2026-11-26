"use strict";
/* Didaktischer Qualitäts-Pass für das Tutorial (Schritte: einfuehrung.js).
   Keine neuen Lernziele: Aufgabe + Begründung + sichtbarer Platz in der Lieferkette. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-tutorial-enhance-style";
  style.textContent=`
    #quest.tutorial-aktiv:not(.breit){width:min(64%,300px)}
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
      font-size:var(--f1);font-weight:700;text-align:center;overflow:hidden;
      animation:tutorialFeedbackEin .22s ease-out both}
    #tutorial-lernfeedback b{font-family:"Baloo 2",sans-serif;color:#17613f}
    #tutorial-lernfeedback.feedback-aus{animation:tutorialFeedbackAus 240ms ease-in both}
    .lernfeedback-zeit{position:absolute;left:0;right:0;bottom:0;height:3px;
      transform-origin:left;background:linear-gradient(90deg,#2fbe7e,#8ce6b5,#f5b73d)}
    @keyframes tutorialFeedbackEin{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translateX(-50%)}}
    @keyframes tutorialFeedbackAus{from{opacity:1}to{opacity:0}}
  `;
  document.head.appendChild(style);

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

  /* Tutorial in der Aufgabenkarte (Phasenkette, Zusammenhang, Meldungen darunter):
     module/quest.js. Hier bleiben Phasen und Aufgabentext. */
  Object.assign((window.__erzweltQuestTeile ||= {}), {phasen:PHASEN, phaseFor, dynamischerText});

  const reduzierteBewegung = matchMedia("(prefers-reduced-motion: reduce)");
  const bewegt = () => OPT.anim !== 0 && !reduzierteBewegung.matches;
  const AUSBLENDEN_MS = 240;
  const feedbackWarteschlange = [];
  let feedbackAktuell = null, feedbackTimer = null;

  function feedbackBeenden(){
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
    if (!feedbackAktuell) return;
    feedbackAktuell.animation?.cancel();
    feedbackAktuell.element.remove();
    feedbackAktuell = null;
  }

  function feedbackZuruecksetzen(){
    feedbackWarteschlange.length = 0;
    feedbackBeenden();
  }

  function dauerAnwenden(){
    const aktuell = feedbackAktuell;
    if (!aktuell) return;
    if (aktuell.spiel !== S){ feedbackZuruecksetzen(); return; }
    if (aktuell.element.classList.contains("feedback-aus")) return;
    const dauer = aktuell.basis * OPT.lernfeedbackdauer / 100;
    const rest = Math.max(0, dauer - (performance.now() - aktuell.seit));
    aktuell.animation?.cancel();
    const animiert = bewegt();
    aktuell.zeit.hidden = !animiert;
    if (animiert){
      aktuell.animation = aktuell.zeit.animate(
        [{transform:`scaleX(${rest/dauer})`}, {transform:"scaleX(0)"}],
        {duration:rest, fill:"forwards"}
      );
    }
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      const weiter = () => { feedbackBeenden(); feedbackZeigen(); };
      if (!bewegt()){ weiter(); return; }
      aktuell.element.classList.add("feedback-aus");
      feedbackTimer = setTimeout(weiter, AUSBLENDEN_MS);
    }, rest);
  }

  function feedbackZeigen(){
    if (feedbackAktuell) return;
    const eintrag = feedbackWarteschlange.shift();
    if (!eintrag || eintrag.spiel !== S) return;
    const element = document.createElement("div");
    element.id = "tutorial-lernfeedback";
    element.setAttribute("role", "status");
    const titel = document.createElement("b");
    titel.textContent = eintrag.finale ? "Tutorial abgeschlossen" : "Schritt abgeschlossen";
    const zeit = document.createElement("span");
    zeit.className = "lernfeedback-zeit";
    zeit.setAttribute("aria-hidden", "true");
    element.append(titel, document.createElement("br"), eintrag.text, zeit);
    document.body.append(element);
    const basis = eintrag.finale || eintrag.text.length > 105 ? MELDUNG_LANG_MS : MELDUNG_KURZ_MS;
    feedbackAktuell = {element, zeit, basis, seit:performance.now(), spiel:eintrag.spiel};
    dauerAnwenden();
  }

  function feedback(text, finale){
    feedbackWarteschlange.push({text, finale, spiel:S});
    feedbackZeigen();
  }
  reduzierteBewegung.addEventListener("change", dauerAnwenden);

  if(typeof tutorialPruefen==="function"){
    const originalTutorialPruefen=tutorialPruefen;
    tutorialPruefen=function(){
      const before=S.tutorial,step=TUTORIAL[before];
      const out=originalTutorialPruefen();
      const after=S.tutorial;
      if(after>before){
        if(after>=TUTORIAL.length)feedback("Rohstoffquelle → Raffinerie → Fabrik → Verkauf → Geld",true);
        else if(step?.zusammenhang)feedback(step.zusammenhang,false);
        window.__erzweltQuest?.tutorialNeu();if(typeof questZeichnen==="function")questZeichnen();
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

  window.__erzweltTutorialEnhance={version:4,steps:TUTORIAL.length,phases:PHASEN.map(p=>p.id),
    mobileToastStack:true,eventDrivenToastLayout:true, dauerAnwenden, feedbackZuruecksetzen};
})();

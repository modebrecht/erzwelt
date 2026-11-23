"use strict";
/* ============================================================
   SEK-B DIDACTIC DATA

   Event semantics (declarative, no string-search replacements).
   Teaching copy moved to module/wissen.js.
   ============================================================ */

(function(){
  /* Lerntexte (Orte, Produkte, Materialien, Wissens-Bereiche, Verbesserungen)
     und die Markierung __erzweltDidacticComplexity: module/wissen.js. */

  if(SCHWIERIGKEIT?.mittel) SCHWIERIGKEIT.mittel.effekt="Standard";

  /* Event semantics are explicit here rather than hidden in copy replacements. */
  const taiwan=EREIGNISSE.find(e=>e.id==="taiwan");
  if(taiwan){
    taiwan.bau=function(){
      S.preisMod.silizium={faktor:2.4,bis:S.tag+70};
      S.nachfrageMod.phone={faktor:1.5,bis:S.tag+70};
      S.nachfrageMod.konsole={faktor:1.5,bis:S.tag+70};
      return {passiv:true,text:"<b>Erdbeben bei Taiwan</b> – andere Firmen können weniger Elektronik liefern. Silizium wird 70 Tage deutlich teurer; die Nachfrage nach Smartphones und Konsolen steigt um 50 %.",art:"warn"};
    };
  }

  const gesetz=EREIGNISSE.find(e=>e.id==="lieferkettengesetz");
  if(gesetz){
    gesetz.bau=function(){
      const status=nachweisStatus();
      if(status.stufe===0){
        S.kasse-=180000;
        S.ausgegeben+=180000;
        return {passiv:true,text:"<b>Lieferkettengesetz</b> – Herkunftsnachweise fehlen. Im Spiel fällt eine Busse von CHF 180'000 an.",art:"alarm"};
      }
      S.nachfrageMod.board={faktor:1.3,bis:S.tag+90};
      return {passiv:true,text:`<b>Lieferkettengesetz</b> – deine Nachweise sind ${status.text}. Grosskunden können bestellen; die Mainboard-Nachfrage steigt 90 Tage lang.`,art:"gut"};
    };
  }

  const protest=EREIGNISSE.find(e=>e.id==="protest");
  if(protest&&typeof protest.bau==="function"){
    const original=protest.bau;
    protest.bau=function(...args){
      const d=original.apply(this,args);
      if(d) d.text="Die Zufriedenheit ist wegen des Lohns sehr niedrig. Deshalb streikt die Belegschaft und die Förderung steht still.";
      return d;
    };
  }

  const unfall=EREIGNISSE.find(e=>e.id==="unglueck");
  if(unfall&&typeof unfall.bau==="function"){
    const original=unfall.bau;
    unfall.bau=function(...args){
      const d=original.apply(this,args);
      if(d) d.text="Es gab einen schweren Unfall. Die Rohstoffquelle bleibt geschlossen, bis du über die Sicherheit entscheidest.";
      return d;
    };
  }

})();

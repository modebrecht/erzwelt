"use strict";
/* ============================================================
   DIDACTIC INTEGRATION HARDENING

   Senior-dev follow-up after the Sek-B didactic complexity pass.
   Goals:
   - keep the original Taiwan silicon-price shock while retaining the
     clearer Sek-B event copy;
   - keep experience-based knowledge unlocks, but make perk access
     explicitly depend on a collected field and prior-tier completion.
   ============================================================ */

(function(){
  /* Keep the original market consequence of the Taiwan event. */
  const taiwan=EREIGNISSE.find(e=>e.id==="taiwan");
  if(taiwan&&typeof taiwan.bau==="function"){
    const current=taiwan.bau;
    taiwan.bau=function(...args){
      const d=current.apply(this,args);
      S.preisMod.silizium={faktor:2.4,bis:S.tag+70};
      if(d&&typeof d==="object"){
        d.text="<b>Erdbeben bei Taiwan</b> – andere Firmen können weniger Elektronik liefern. Silizium wird 70 Tage deutlich teurer; die Nachfrage nach Smartphones und Konsolen steigt um 50 %.";
      }
      return d;
    };
  }

  /* Harden the experience-based knowledge gate without reintroducing grind. */
  const currentWissenPraxis=globalThis.wissenPraxis;
  if(typeof currentWissenPraxis==="function"){
    globalThis.wissenPraxis=function(segId,stufe){
      const result=currentWissenPraxis(segId,stufe);
      const fields=S?.wissenQuestFlow?.fields;
      if(!fields?.[segId]){
        return {ok:false,text:result?.text||"Erlebe diesen Zusammenhang zuerst im Spiel."};
      }

      const level=Number.isInteger(stufe)?stufe:Number(stufe)||0;
      if(level>0){
        const seg=WISSEN.find(s=>s.id===segId);
        const previous=seg?.perks?.[level-1];
        if(previous&&!S?.perks?.[previous.id]){
          return {ok:false,text:"Setze zuerst die vorherige Verbesserung in diesem Wissensfeld um."};
        }
      }
      return result;
    };
  }

  window.__erzweltDidacticIntegrationFixes={
    version:1,
    taiwanSiliconShock:true,
    explicitKnowledgeFieldGate:true,
    sequentialPerkGate:true
  };
})();

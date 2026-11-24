"use strict";
/* Save/reload notification gate.
   Persisted messages stay in S.log/history, but are not replayed as fresh live toasts. */
(function(){
  if(typeof S==="undefined"||typeof gezeigt==="undefined")return;

  let raw=null;
  try{
    if(typeof SPEICHER!=="undefined"&&typeof SCHLUESSEL!=="undefined"){
      raw=SPEICHER.lies(SCHLUESSEL)||SPEICHER.lies("erzwelt_v1");
    }
  }catch(e){}
  if(!raw)return; // Fresh game: keep the normal welcome toast.

  let persisted=null;
  try{persisted=JSON.parse(raw);}catch(e){return;}
  if(!persisted||!Array.isArray(persisted.log))return;

  // Bereits gespeicherte Einträge gehören zum Verlauf. Neue Meldungen aus
  // der Migration dürfen beim Laden weiterhin erscheinen.
  toastsZuruecksetzen();
  for(const entry of persisted.log){
    if(!entry)continue;
    gezeigt.add(meldungsschluessel(entry));
  }

  if(typeof toastsErneuern==="function")toastsErneuern();

  window.__erzweltNotificationReloadFix={version:1,source:"persisted S.log"};
})();

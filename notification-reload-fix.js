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

  // The core has already drawn once before patch scripts execute, so its in-memory
  // 'gezeigt' set contains the two replayed startup toasts. Rebuild it from the
  // actually persisted log instead. Messages added by migrations during this load
  // remain unseen and can still appear normally.
  gezeigt.clear();
  for(const entry of persisted.log){
    if(!entry)continue;
    gezeigt.add(String(entry.tag??"")+String(entry.text??""));
  }

  document.getElementById("toasts")?.replaceChildren();
  if(typeof toastsErneuern==="function")toastsErneuern();

  window.__erzweltNotificationReloadFix={version:1,source:"persisted S.log"};
})();

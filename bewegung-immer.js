"use strict";
/* Animationen standardmässig an – unabhängig vom Browser.
   Viele Schulgeräte melden «Bewegung reduzieren» (Windows: «Animationen
   anzeigen» aus, Remote-Desktop, Energiesparprofile). Dann stand im Spiel
   alles still: Arbeiter, Rauch, Lieferwege, Werks-Grafiken.
   Ab jetzt entscheidet nur die Einstellung «Animationen» im Spiel:
   - Die Abfrage (prefers-reduced-motion: reduce) meldet immer «nein».
   - CSS-Regeln, die nur für «Bewegung reduzieren» gelten, werden entfernt.
   «Animationen: aus» in den Einstellungen stoppt weiterhin alles.
   Lädt als erster Patch, damit alle anderen die neue Abfrage sehen. */
(function(){
  const VERSION = 1;
  const RM = /prefers-reduced-motion/i;
  const echt = window.matchMedia ? window.matchMedia.bind(window) : null;
  if (echt){
    window.matchMedia = function(q){
      if (!RM.test(String(q))) return echt(q);
      return {matches:false, media:String(q), onchange:null,
        addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}, dispatchEvent(){ return false; }};
    };
  }
  function ausmisten(regeln, besitzer){
    for (let i = regeln.length - 1; i >= 0; i--){
      const r = regeln[i];
      if (r.media && RM.test(r.media.mediaText)){ try { besitzer.deleteRule(i); } catch (e){} }
      else if (r.cssRules && r.cssRules.length) ausmisten(r.cssRules, r);
    }
  }
  function alleBlaetter(){
    for (const blatt of document.styleSheets){
      let regeln;
      try { regeln = blatt.cssRules; } catch (e){ continue; }   // fremde Schriften-CSS
      if (regeln) ausmisten(regeln, blatt);
    }
  }
  alleBlaetter();
  // Patches fügen ihre <style>-Blöcke später ein: jedes neue Stylesheet ebenso bereinigen
  new MutationObserver(liste => {
    if (liste.some(m => [...m.addedNodes].some(n => n.nodeName === "STYLE" || n.nodeName === "LINK"))) alleBlaetter();
  }).observe(document.head, {childList:true});
  addEventListener("load", alleBlaetter);
  window.__erzweltBewegungImmer = {version:VERSION};
})();

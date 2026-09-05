"use strict";
/* Final interaction sync for map-focus navigation.
   Keeps layer chips truthful when focus code re-enables a layer and makes the
   clickable quest card keyboard-operable. Presentation/accessibility only. */
(function(){
  const quest=document.getElementById("quest");

  function syncLayerChips(){
    if(typeof ebenen==="undefined"||!ebenen)return;
    for(const button of document.querySelectorAll("[data-ebene]")){
      const key=button.dataset.ebene;
      if(!(key in ebenen))continue;
      button.setAttribute("aria-pressed",String(!!ebenen[key]));
    }
  }

  function syncQuestAccess(){
    if(!quest)return;
    const linked=!quest.hidden&&quest.classList.contains("map-link");
    if(linked){
      quest.setAttribute("role","button");
      quest.tabIndex=0;
    }else{
      quest.removeAttribute("role");
      quest.removeAttribute("tabindex");
      const label=quest.getAttribute("aria-label")||"";
      if(label.endsWith("· Ziel anzeigen"))quest.removeAttribute("aria-label");
    }
  }

  let raf=0;
  function scheduleSync(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;syncLayerChips();syncQuestAccess();});
  }

  document.addEventListener("click",event=>{
    if(event.target.closest("#toasts .toast.map-link,#quest.map-link"))scheduleSync();
  });

  document.addEventListener("keydown",event=>{
    if(quest&&event.target===quest&&quest.classList.contains("map-link")&&(event.key==="Enter"||event.key===" ")){
      event.preventDefault();
      quest.click();
      return;
    }
    if(event.target.closest?.("#toasts .toast.map-link")&&(event.key==="Enter"||event.key===" "))scheduleSync();
  });

  if(quest&&typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(scheduleSync);
    observer.observe(quest,{attributes:true,attributeFilter:["class","hidden"]});
  }

  scheduleSync();
  window.__erzweltInteractionFocusFinalFix={version:1,features:["layer-chip-sync","keyboard-quest-focus"]};
})();

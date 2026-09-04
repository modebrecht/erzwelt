"use strict";
/* Zweiter Rechtschreib- und Grammatikpass.
   Nur sichtbare Texte; keine Änderungen an Spielregeln oder Berechnungen. */

(function(){
  const korrekturen = [
    ["Ein Teil davon aus Kleinstminen", "Ein Teil davon stammt aus Kleinstminen"],
    ["Die grösste Lagerstätte Seltener Erden der Welt, in der Inneren Mongolei.", "Die grösste Lagerstätte Seltener Erden der Welt liegt in der Inneren Mongolei."],
    ["Australien fördert etwa die Hälfte des Weltlithiums", "Australien fördert etwa die Hälfte des weltweit gewonnenen Lithiums"],
    ["Chile liefert rund einen Viertel", "Chile liefert rund ein Viertel"],
    ["Sicherheitsmassnahmen verbessern und entschädigen", "Sicherheitsmassnahmen verbessern und Betroffene entschädigen"],
    ["Sicherheit verbessert und Entschädigung bezahlt.", "Sicherheitsmassnahmen verbessert und Entschädigung bezahlt."],
    ["Raffinerie-Durchsatz", "Raffineriedurchsatz"],
    ["Lieferketten-Nachweise", "Lieferkettennachweise"],
    ["US-Dollar schwach", "Schwacher US-Dollar"],
    ["US-Dollar stark", "Starker US-Dollar"],
    ["Lohn üblich", "Üblicher Lohn"],
    ["von 40 Personen", "von 40 Personen"],
    ["pro Person und Monat", "pro Person und Monat"],
    ["keine aktuelle Lohnstatistik", "keine aktuelle Lohnstatistik"],
    ["Wichtige Förderländer", "Wichtige Förderländer"],
    ["Rohstoff im Lager", "Rohstoff im Lager"],
    ["Fertige Produkte müssen verkauft werden", "Fertige Produkte müssen verkauft werden"],
    ["Spezialisierung im Spiel", "Spezialisierung im Spiel"]
  ];

  function korrigiere(text){
    if(typeof text!=="string") return text;
    let out=text;
    for(const [von,nach] of korrekturen) out=out.split(von).join(nach);
    return out;
  }

  for(const m of MINEN) if(typeof m.info==="string") m.info=korrigiere(m.info);
  for(const r of RAFF_ORTE) if(typeof r.info==="string") r.info=korrigiere(r.info);
  for(const p of Object.values(PRODUKT)) if(typeof p.info==="string") p.info=korrigiere(p.info);
  for(const s of WISSEN){
    s.titel=korrigiere(s.titel);
    s.kurz=korrigiere(s.kurz);
    if(Array.isArray(s.text)) s.text=s.text.map(korrigiere);
    if(Array.isArray(s.fakten)) s.fakten=s.fakten.map(korrigiere);
    for(const p of s.perks||[]){
      p.titel=korrigiere(p.titel);
      p.text=korrigiere(p.text);
      if(Array.isArray(p.wirkung)) p.wirkung=p.wirkung.map(korrigiere);
    }
  }
  for(const t of TUTORIAL){
    t.titel=korrigiere(t.titel);
    t.text=korrigiere(t.text);
  }

  if(typeof notiz==="function"){
    const original=notiz;
    notiz=function(text,art){return original(korrigiere(text),art);};
  }
  if(typeof dialogZeigen==="function"){
    const original=dialogZeigen;
    dialogZeigen=function(d){
      if(!d||typeof d!=="object") return original(d);
      const x={...d};
      x.art=korrigiere(x.art); x.titel=korrigiere(x.titel); x.text=korrigiere(x.text);
      if(Array.isArray(x.wahlen)) x.wahlen=x.wahlen.map(w=>({...w,text:korrigiere(w.text),klein:korrigiere(w.klein)}));
      return original(x);
    };
  }

  const wrapHtml=name=>{
    const original=globalThis[name];
    if(typeof original!=="function") return;
    globalThis[name]=function(...args){return korrigiere(original.apply(this,args));};
  };
  ["blattMine","blattRaff","blattFab","seiteMarkt","seiteTeam","seiteZiel","seiteWissen"].forEach(wrapHtml);

  if(typeof lupeFuellen==="function"){
    const original=lupeFuellen;
    lupeFuellen=function(...args){
      const r=original.apply(this,args);
      const root=document.getElementById("lupeinhalt");
      if(root) root.innerHTML=korrigiere(root.innerHTML);
      return r;
    };
  }
  if(typeof naechsterSchritt==="function"){
    const original=naechsterSchritt;
    naechsterSchritt=function(){
      const w=original();
      return w?[korrigiere(w[0]),korrigiere(w[1])]:w;
    };
  }

  window.__erzweltLanguagePass2={version:1,locale:"de-CH"};
})();

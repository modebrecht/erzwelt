"use strict";
const SHOULD_DIDAKTIK_VERSION = 1;
const RAFF_SPEZIAL = {
  r_china:["seltene","silizium","indium","tantal"],
  r_malay:["seltene","zinn","tantal"],
  r_chile:["kupfer","lithium","silber"],
  r_de:["kupfer","zinn","silber","indium","gold"],
  r_usa:["lithium","nickel","kobalt","seltene"],
  r_pori:["kupfer"],
  r_pawlodar:["alu"]
};
RAFF_ORTE.forEach(r=>{r.spezial=RAFF_SPEZIAL[r.id]||[];});

const ketteShould=WISSEN.find(s=>s.id==="kette");
if(ketteShould){
  ketteShould.kurz=textVon("didacticshould.rohstoff-raffinerie-fabrik-markt");
  ketteShould.text=[
    "Eine Lieferkette verbindet mehrere Orte. Auf der Karte siehst du nach dem Tutorial einen <b>Beispielweg</b> zwischen einer eigenen Rohstoffquelle, einer Raffinerie und einer Fabrik.",
    "Die Entfernung ist geografische Orientierung. <b>Transportkosten und Lieferzeiten werden in Erzwelt nicht berechnet.</b> So bleibt klar, was das Spiel wirklich simuliert."
  ];
}
const chemShould=WISSEN.find(s=>s.id==="chemie");
if(chemShould){
  chemShould.text=[
    textVon("didacticshould.die-ausbeute-ist-ein"),
    textVon("didacticshould.jede-raffinerie-kann-im")
  ];
}

const modellShould=WISSEN.find(s=>s.id==="modell");
if(modellShould&&modellShould.text){
  modellShould.text[1]=textVon("didacticshould.der-kern-des-modells");
}
function shouldMigration(){
  if(!S||typeof S!=="object")return;
  if(!S.wissenGesehen||typeof S.wissenGesehen!=="object")S.wissenGesehen={};
  S.shouldDidaktikVersion=SHOULD_DIDAKTIK_VERSION;
}
/* Praxisaufgabe einer Wissensstufe: Fassung in knowledge-quest-flow.js.
   Hier nur deklariert, damit knowledge-quest-flow.js sie ersetzen kann. */
function wissenPraxis(segId,stufe){}
/* Lupe: vor und nach dem Füllen (Reihenfolge: module/wissen.js) */
(window.__erzweltWissenTeile ||= {}).lupeVor=function(segId){
  shouldMigration();
  S.wissenGesehen[segId]=true;
};
(window.__erzweltWissenTeile ||= {}).lupeVoraussetzung=function(segId){
  const seg=WISSEN.find(s=>s.id===segId),next=seg&&naechsterPerk(seg);
  if(!seg||!next){speichern();return;}
  const idx=seg.perks.indexOf(next),praxis=wissenPraxis(segId,idx);
  const button=document.querySelector("#lupeinhalt [data-tun='perk']");
  const card=button?.closest(".perkkarte");
  if(card){
    card.querySelector(".didaktik-praxis")?.remove();
    const note=document.createElement("div");
    note.className="notiz didaktik-praxis";
    note.innerHTML=textVon("didacticshould.voraussetzung", {p1:(praxis.text), p2:(praxis.ok?"✓ Voraussetzung erfüllt. Die Verbesserung kann jetzt finanziert werden.":"Voraussetzung noch nicht erfüllt.")});
    button?.before(note);
  }
  if(button){
    const vorherGesperrt=idx>0&&!S.perks[seg.perks[idx-1].id];
    const preis=perkKosten(next),genug=S.kasse>=preis,quizOk=perkFrei(segId);
    const geht=praxis.ok&&!vorherGesperrt&&genug&&quizOk;
    button.disabled=!geht;
    button.classList.toggle("puls",geht);
    button.innerHTML=vorherGesperrt?textVon("didacticshould.vorherige-verbesserung-fehlt"):!praxis.ok?textVon("didacticshould.voraussetzung-noch-nicht-erfuellt"):!quizOk?textVon("quiz.zuerst"):!genug?textVon("didacticshould.zu-wenig-geld")+chf(preis):IK.gluehbirne+textVon("didacticshould.verbesserung-finanzieren")+chf(preis);
  }
  speichern();
};
/* Hinweis für die Aufgabenkarte ausserhalb von Tutorial und Wissens-Quest:
   ersetzt die Fassung des Kerns (Reihenfolge: module/wissen.js) */
(window.__erzweltWissenTeile ||= {}).hinweis=function(){
  const minen=offeneMinen();
  if(!minen.length)return[textVon("didacticshould.noch-keine-rohstoffquelle"),textVon("didacticshould.welches-material-brauchst-du")];
  const ohne=minen.find(id=>S.minen[id].arbeiter===0);
  if(ohne)return[textVon("didacticshould.eine-rohstoffquelle-steht-still"),textVon("didacticshould.hat-kein-personal-pruefe", {p1:(MINEN.find(x=>x.id===ohne).ort)})];
  const gefahr=minen.find(id=>S.minen[id].zufriedenheit<35&&S.minen[id].arbeiter>0);
  if(gefahr)return[textVon("didacticshould.niedrige-zufriedenheit-in")+MINEN.find(x=>x.id===gefahr).ort,textVon("didacticshould.die-zufriedenheit-ist-niedrig")];
  if(!Object.keys(S.raff).length)return[textVon("didacticshould.noch-keine-raffinerie-vorhanden"),"In deiner Lieferkette fehlt die Verarbeitung zwischen Rohstoffquelle und Fabrik."];
  const aktiveRaff=Object.keys(S.raff).filter(id=>S.raff[id].arbeiter>0);
  if(!aktiveRaff.length)return[textVon("didacticshould.die-verarbeitung-steht-still"),textVon("didacticshould.du-hast-eine-raffinerie")];
  const kapa=aktiveRaff.reduce((a,id)=>{const d=RAFF_ORTE.find(x=>x.id===id);return a+d.kapazitaet*ausbauFaktor(S.raff[id].ausbau)*(S.raff[id].arbeiter/d.plaetze);},0);
  if(Object.values(S.erz).reduce((a,b)=>a+(+b||0),0)>kapa*5)return[textVon("didacticshould.rohstoffbestand-ist-hoch"),textVon("didacticshould.vergleiche-foerderung-und-raffineriedurchsatz")];
  if(!S.fabriken.length)return[textVon("didacticshould.noch-keine-fabrik-vorhanden"),textVon("didacticshould.welche-produkte-passen-zu")];
  const leer=S.fabriken.find(f=>f.restbau===0&&f.arbeiter===0);
  if(leer)return[textVon("didacticshould.eine-fabrik-steht-still"),textVon("didacticshould.die-anlage-ist-fertig")];
  for(const f of S.fabriken){
    if(f.restbau>0)continue;
    const fehlt=Object.keys(PRODUKT[f.produkt].rezept).filter(k=>(S.mat[k]||0)<PRODUKT[f.produkt].rezept[k]*3);
    if(fehlt.length)return[textVon("didacticshould.produktion-stockt")+fehlt.map(k=>MATERIAL[k].name).join(", "),"Fehlt Rohstoff, Personal in der Raffinerie oder eine Quelle? Folge der Kette rückwärts bis zur Rohstoffquelle."];
  }
  if(warenLager()>0&&verkaufsKraft()===0)return[textVon("didacticshould.fertige-ware-liegt-im"),textVon("didacticshould.vergleiche-lager-nachfrage-und")];
  if(warenLager()>verkaufsKraft()*12&&verkaufsKraft()>0)return[textVon("didacticshould.warenbestand-ist-hoch"),"Du stellst mehr her, als du verkaufst. Setze mehr Leute in den Verkauf, sonst sinkt der Preis."];
  if(freieArbeiter()>15)return[freieArbeiter()+textVon("didacticshould.personen-ohne-aufgabe"),textVon("didacticshould.pruefe-ob-du-dieses")];
  if(S.ruf<55)return[textVon("didacticshould.ein-niedriger-ruf-senkt"),textVon("didacticshould.pruefe-meldungen-und-fruehere")];
  const praxisOffen=WISSEN.filter(seg=>{const p=naechsterPerk(seg);return p&&wissenPraxis(seg.id,seg.perks.indexOf(p)).ok;});
  if(praxisOffen.length)return[textVon("didacticshould.voraussetzung-fuer-eine-verbesserung"),textVon("didacticshould.im-reiter-wissen-findest")];
  const nahe=minen.find(id=>ausbauVerdoppelt(S.minen[id].ausbau||0));
  if(nahe)return[textVon("didacticshould.naechste-ausbaustufe-mit-groesserer"),textVon("didacticshould.vergleiche-kosten-und-wirkung")];
  return null;
};
/* Aufgabenkarte: Kopf «Hinweis» ausserhalb des Tutorials setzt module/quest.js. */
tagVor=function(){
  if(S.ende||modalOffen)return;
  S.tag++;letzteFoerderung={};
  const zufBonus=perkPlus("zufrieden");
  for(const id in S.minen){
    const m=S.minen[id],def=MINEN.find(x=>x.id===id);
    const ziel=LOHNSTUFE[m.stufe].ziel-(LAND[def.land].risiko-1)*8+zufBonus;
    m.zufriedenheit+=(ziel-m.zufriedenheit)*0.04;m.zufriedenheit=klemm(m.zufriedenheit,0,100);
  }
  const foerderBonus=perkMult("foerderung");
  for(const id in S.minen){
    const m=S.minen[id],def=MINEN.find(x=>x.id===id);if(m.stillBis>S.tag)continue;
    let f=foerderBonus*ausbauFaktor(m.ausbau);if(m.malusBis>S.tag)f*=m.malus;f*=0.55+(m.zufriedenheit/100)*0.6;
    const menge=m.arbeiter*def.ergiebigkeit*f;
    if(menge>0){S.erz[def.mat]=(S.erz[def.mat]||0)+menge;letzteFoerderung[id]=menge;}
  }
  const hafen=globalWert("hafen")*perkMult("durchsatz"),ausbeuteBonus=perkMult("ausbeute");
  for(const id in S.raff){
    const r=S.raff[id],def=RAFF_ORTE.find(x=>x.id===id);if(r.arbeiter===0)continue;
    const kap=def.kapazitaet*ausbauFaktor(r.ausbau)*(r.arbeiter/def.plaetze)*hafen;
    const vorrat=Object.keys(MATERIAL).filter(k=>(S.erz[k]||0)>0.5),total=vorrat.reduce((a,k)=>a+S.erz[k],0);if(total<=0)continue;
    for(const k of vorrat){
      const anteil=S.erz[k]/total,tempo=(def.spezial||[]).includes(k)?1.25:1,nimm=Math.min(S.erz[k],kap*anteil*tempo);
      S.erz[k]-=nimm;S.mat[k]=(S.mat[k]||0)+nimm*MATERIAL[k].ausbeute*ausbeuteBonus;
    }
  }
  const fabrikBonus=perkMult("fabrik");
  for(const f of S.fabriken){
    if(f.restbau>0){f.restbau--;if(f.restbau===0)notiz(`Fabrik <b>${PRODUKT[f.produkt].name}</b> in ${LAND[f.land].name} nimmt die Produktion auf.`,"gut");continue;}
    if(f.arbeiter===0)continue;
    const def=PRODUKT[f.produkt];let stueck=Math.floor(f.arbeiter*def.proArbeiter*fabrikBonus);
    for(const k in def.rezept)stueck=Math.min(stueck,Math.floor((S.mat[k]||0)/def.rezept[k]));
    if(stueck<=0)continue;for(const k in def.rezept)S.mat[k]-=stueck*def.rezept[k];S.ware[f.produkt]=(S.ware[f.produkt]||0)+stueck;
    produktBuchen(f.produkt,stueck);
  }
  const kraft=verkaufsKraft();if(kraft>0)wareVerkaufen(kraft);
  if((S.tag-1)%30===0){
    const lohn=lohnsumme(),betrieb=betriebskostenMonat();
    S.kasse-=lohn+betrieb;S.ausgegeben+=lohn+betrieb;notiz(textVon("didacticshould.monatsabschluss-loehne-betrieb", {p1:(chf(lohn)), p2:(chf(betrieb))}),"geld");rufAnpassen();
    if(S.kasse<0)notiz(textVon("didacticshould.die-kasse-ist-im"),"alarm");
  }
  /* Nach Verkauf und Monatsende, vor Markt, Ereignissen und Etappenende:
     forschung  produktentwicklung.js  Forschungslohn des Tages, Projekt fertig? */
  for(const teil of Object.values(window.__erzweltTagTeile||{}))teil();
  if(S.tag%5===0)marktBewegen();ereignisPruefen();if(S.kasse<-800000)rundeBeenden("insolvenz");else if(S.tag>etappenEnde())rundeBeenden("etappe");speichern();
};
function kmDistanz(idA,idB){
  const a=ORT[idA],b=ORT[idB];if(!a||!b)return 0;const rad=x=>x*Math.PI/180,dLat=rad(b[1]-a[1]),dLon=rad(b[0]-a[0]);
  const q=Math.sin(dLat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
function beispielKette(){
  if(tutorialLaeuft())return null;
  const fabrik=S.fabriken.find(f=>f.restbau===0);if(!fabrik)return null;
  const fabId="f_"+fabrik.land;if(!ORT[fabId])return null;
  const rezept=Object.keys(PRODUKT[fabrik.produkt].rezept);
  const mineIds=offeneMinen().filter(id=>rezept.includes(MINEN.find(x=>x.id===id)?.mat)),raffIds=Object.keys(S.raff);
  if(!mineIds.length||!raffIds.length)return null;
  let best=null;
  for(const mineId of mineIds){const mat=MINEN.find(x=>x.id===mineId).mat;
    for(const raffId of raffIds){const bonus=(RAFF_SPEZIAL[raffId]||[]).includes(mat)?0.85:1,d1=kmDistanz(mineId,raffId),d2=kmDistanz(raffId,fabId),score=(d1+d2)*bonus;
      if(!best||score<best.score)best={mineId,raffId,fabId,mat,d1,d2,score,fabrik};}}
  return best;
}
function lieferwegZeichnen(){
  if(!document.querySelector("svg.weltkarte"))return;
  let note=document.getElementById("didaktik-route-note");
  if(!note){
    note=document.createElement("div");note.id="didaktik-route-note";
    note.style.cssText="position:absolute;left:10px;bottom:calc(var(--dockh) + 10px);z-index:12;max-width:min(310px,calc(100vw - 82px));background:#fffaf0ee;color:#241c14;border:1px solid #d9c9aa;border-radius:14px;padding:8px 10px;box-shadow:0 3px 12px #0002;font-size:var(--f0);font-weight:700;line-height:1.3;pointer-events:none";
    document.getElementById("sicht")?.appendChild(note);
  }
  const r=beispielKette(),sichtbar=!!r&&aktiveSeite==="karte"&&!offenesBlatt;note.hidden=!sichtbar;if(!sichtbar)return;
  const mine=MINEN.find(x=>x.id===r.mineId),raff=RAFF_ORTE.find(x=>x.id===r.raffId),km=(Math.round((r.d1+r.d2)/100)*100).toLocaleString("de-CH");
  note.innerHTML=textVon("didacticshould.beispielweg-auf-der-karte", {p1:(mine.ort), p2:(raff.ort), p3:(LAND[r.fabrik.land].name), p4:(km)});
}
/* Vor jedem Zeichnen shouldMigration, danach Lieferweg (Reihenfolge: module/karte.js) */
Object.assign((window.__erzweltKarteTeile ||= {}), {shouldVor:() => shouldMigration(), lieferweg:() => lieferwegZeichnen()});
shouldMigration();seitenStand="";blattStand="";zeichnen();

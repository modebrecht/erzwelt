"use strict";
const SHOULD_DIDAKTIK_VERSION = 1;
const RAFF_SPEZIAL = {
  r_china:["seltene","silizium","indium","tantal"],
  r_malay:["seltene","zinn","tantal"],
  r_chile:["kupfer","lithium","silber"],
  r_de:["kupfer","zinn","silber","indium","gold"],
  r_usa:["lithium","nickel","kobalt","seltene"]
};
RAFF_ORTE.forEach(r=>{r.spezial=RAFF_SPEZIAL[r.id]||[];});

const ketteShould=WISSEN.find(s=>s.id==="kette");
if(ketteShould){
  ketteShould.kurz="Rohstoff → Raffinerie → Fabrik → Markt – und wo diese Orte liegen.";
  ketteShould.text=[
    "Eine Lieferkette verbindet mehrere Orte. Auf der Karte siehst du nach dem Tutorial einen <b>Beispielweg</b> zwischen einer eigenen Rohstoffquelle, einer Raffinerie und einer Fabrik.",
    "Die Entfernung ist geografische Orientierung. <b>Transportkosten und Lieferzeiten werden in Erzwelt bewusst nicht berechnet.</b> So bleibt klar, was das Spiel wirklich simuliert."
  ];
}
const chemShould=WISSEN.find(s=>s.id==="chemie");
if(chemShould){
  chemShould.text=[
    "Die <b>Ausbeute</b> ist ein vereinfachter Spielwert dafür, wie viel nutzbares Material aus einer Einheit Rohstoff entsteht.",
    "Jede Raffinerie kann im Spiel alle Rohstoffe verarbeiten. Sie hat zusätzlich einen sichtbaren <b>Spiel-Schwerpunkt</b>: passende Rohstoffe werden dort 25 % schneller verarbeitet. Das ist eine Spielregel, keine Behauptung über die reale Anlage."
  ];
}

const modellShould=WISSEN.find(s=>s.id==="modell");
if(modellShould&&modellShould.text){
  modellShould.text[1]="Der Kern des Modells steht in <code>erzwelt-core.html</code>. Die didaktischen Korrekturen sind bewusst in <code>didactic-model.js</code>, <code>didactic-events.js</code>, <code>didactic-ui.js</code> und <code>didactic-should.js</code> getrennt. Vergleiche: Welche Regeln wurden vereinfacht, damit Ursache und Wirkung klar bleiben?";
}
const originalNotizShould=notiz;
notiz=function(text,art){
  if(typeof text==="string") text=text.replace(/^Neues Wissen:/,"Verbesserung umgesetzt:");
  return originalNotizShould(text,art);
};

function shouldMigration(){
  if(!S||typeof S!=="object")return;
  if(!S.wissenGesehen||typeof S.wissenGesehen!=="object")S.wissenGesehen={};
  S.shouldDidaktikVersion=SHOULD_DIDAKTIK_VERSION;
}
function wissenPraxis(segId,stufe){
  const minen=offeneMinen();
  const aktiveMinen=minen.filter(id=>S.minen[id]&&S.minen[id].arbeiter>0);
  const materialien=new Set(minen.map(id=>MINEN.find(x=>x.id===id)?.mat).filter(Boolean));
  const aktiveRaff=Object.keys(S.raff).filter(id=>S.raff[id]&&S.raff[id].arbeiter>0);
  const fertigeFab=S.fabriken.filter(f=>f.restbau===0);
  const produktArten=new Set(S.fabriken.map(f=>f.produkt));
  const matGesamt=Object.values(S.mat).reduce((a,b)=>a+(+b||0),0);
  const ausbauRaff=Object.values(S.raff).some(r=>(r.ausbau||0)>=5);
  const ausbauIrgendwo=Object.values(S.minen).some(m=>(m.ausbau||0)>0)||Object.values(S.raff).some(r=>(r.ausbau||0)>0);
  const regeln={
    kette:[
      [!tutorialLaeuft()&&S.eingenommen>0,"Schliesse die erste Lieferkette bis zu einem Verkauf ab."],
      [minen.length>=4&&aktiveRaff.length>=1&&fertigeFab.length>=1,"Betreibe mindestens vier Rohstoffquellen zusammen mit Raffinerie und Fabrik."]
    ],
    geologie:[
      [materialien.size>=2,"Erschliesse zwei verschiedene Rohstoffe und vergleiche ihre Standorte."],
      [materialien.size>=5,"Erschliesse fünf verschiedene Rohstoffe auf der Weltkarte."]
    ],
    leute:[
      [aktiveMinen.some(id=>S.minen[id].arbeiter>=10),"Betreibe eine Mine mit mindestens 10 Personen."],
      [aktiveMinen.length>=2&&S.tag>=60,"Beobachte mindestens zwei besetzte Minen über zwei Spielmonate."]
    ],
    chemie:[
      [aktiveRaff.length>=1&&matGesamt>0,"Raffiniere erstmals Rohstoff zu nutzbarem Material."],
      [aktiveRaff.length>=2||ausbauRaff,"Betreibe zwei Raffinerien oder baue eine Raffinerie auf Stufe 5 aus."]
    ],
    fabrik:[
      [fertigeFab.length>=1&&(warenLager()>0||S.eingenommen>0),"Produziere dein erstes fertiges Produkt."],
      [produktArten.size>=2,"Baue zwei verschiedene Produkte und vergleiche ihre Materialengpässe."]
    ],
    markt:[
      [!!S.verkauftSelber||(S.verkaeufer||0)>0,"Verkaufe selbst oder setze erstmals ein Verkaufsteam ein."],
      [S.eingenommen>=250000&&(S.verkaeufer||0)>=2,"Erziele mindestens CHF 250'000 Umsatz mit einem Verkaufsteam."]
    ],
    ruf:[
      [!tutorialLaeuft()&&S.tag>=60,"Spiele nach dem Tutorial mindestens zwei Monate und beobachte Ruf und Nachfrage."],
      [S.tag>=120&&minen.length>=2,"Führe eine Lieferkette mit mindestens zwei Rohstoffquellen über vier Monate."]
    ],
    modell:[
      [!tutorialLaeuft(),"Schliesse das geführte Tutorial ab und beobachte die ganze Kette einmal."],
      [ausbauIrgendwo&&Object.keys(S.perks).length>=2,"Nutze mindestens einen Ausbau und zwei bereits umgesetzte Verbesserungen."]
    ]
  };
  const r=regeln[segId]?.[stufe]||[true,"Praxisbezug erfüllt."];
  return {ok:!!r[0],text:r[1]};
}
const originalSeiteWissenShould=seiteWissen;
seiteWissen=function(){
  shouldMigration();
  return originalSeiteWissenShould()
    .replace("Acht Felder. Öffne eins, lies nach – und erwirb daraus einen dauerhaften Vorteil.","Acht Felder. Wissen kostet nichts: Lies nach, beobachte das Prinzip im Spiel und finanziere danach eine passende Verbesserung.")
    .replace(/(\d+) von (\d+) erforscht/g,"$1 von $2 Verbesserungen umgesetzt")
    .replace("Jeder Perk kostet Geld und wirkt sofort im ganzen Spiel.","Geld kauft nicht das Wissen. Es finanziert die konkrete Verbesserung, nachdem du den Zusammenhang im Spiel erlebt hast.")
    .replace(/Nächstes Wissen:/g,"Nächste Verbesserung:")
    .replace(/Alles erforscht/g,"Alle Verbesserungen umgesetzt");
};
const originalLupeFuellenShould=lupeFuellen;
lupeFuellen=function(segId){
  shouldMigration();
  S.wissenGesehen[segId]=true;
  originalLupeFuellenShould(segId);
  const seg=WISSEN.find(s=>s.id===segId),next=seg&&naechsterPerk(seg);
  if(!seg||!next){speichern();return;}
  const idx=seg.perks.indexOf(next),praxis=wissenPraxis(segId,idx);
  const button=document.querySelector("#lupeinhalt [data-tun='perk']");
  const card=button?.closest(".perkkarte");
  if(card){
    card.querySelector(".didaktik-praxis")?.remove();
    const note=document.createElement("div");
    note.className="notiz didaktik-praxis";
    note.innerHTML=`<b>Praxisbezug:</b> ${praxis.text}<br>${praxis.ok?"✓ Erlebt – du kannst die Verbesserung jetzt finanzieren.":"Noch nicht erfüllt."}`;
    button?.before(note);
  }
  if(button){
    const vorherGesperrt=idx>0&&!S.perks[seg.perks[idx-1].id];
    const genug=S.kasse>=next.kosten;
    const geht=praxis.ok&&!vorherGesperrt&&genug;
    button.disabled=!geht;
    button.classList.toggle("puls",geht);
    button.innerHTML=vorherGesperrt?"Vorherige Verbesserung fehlt":!praxis.ok?"Erst im Spiel beobachten":!genug?"Zu wenig Geld · "+chf(next.kosten):IK.gluehbirne+"Verbesserung umsetzen · "+chf(next.kosten);
  }
  const root=document.getElementById("lupeinhalt");
  if(root){
    root.innerHTML=root.innerHTML.replace("Dieses Feld ist ausgeforscht","Alle Verbesserungen umgesetzt").replace(/Du hast alles Wissen aus/g,"Du hast alle Verbesserungen aus");
  }
  document.querySelectorAll("#lupeinhalt .marke").forEach(m=>{
    if(m.textContent==="Neues Wissen")m.textContent="Anwendung";
    if(m.textContent==="Erforscht")m.textContent="Umgesetzt";
  });
  speichern();
};
const originalSeiteZielShould=seiteZiel;
seiteZiel=function(){
  return originalSeiteZielShould().replace("Erforschtes Wissen","Umgesetzte Verbesserungen").replace("Noch kein Wissen erworben. Schau im Reiter Wissen vorbei.","Noch keine Wissens-Verbesserung umgesetzt. Im Reiter Wissen siehst du, welche Praxisbezüge noch fehlen.");
};
naechsterSchritt=function(){
  const minen=offeneMinen();
  if(!minen.length)return["Noch keine Rohstoffquelle","Welches Material brauchst du für dein nächstes Produkt? Suche dafür eine passende Quelle auf der Karte."];
  const ohne=minen.find(id=>S.minen[id].arbeiter===0);
  if(ohne)return["Eine Rohstoffquelle steht still",`${MINEN.find(x=>x.id===ohne).ort} hat kein Personal. Prüfe deine Personalverteilung.`];
  const gefahr=minen.find(id=>S.minen[id].zufriedenheit<35&&S.minen[id].arbeiter>0);
  if(gefahr)return["Unruhe in "+MINEN.find(x=>x.id===gefahr).ort,"Die Zufriedenheit ist tief. Prüfe dort die Lohnentscheidung."];
  if(!Object.keys(S.raff).length)return["Rohstoff wird noch nicht zu Material","In deiner Lieferkette fehlt die Verarbeitung zwischen Rohstoffquelle und Fabrik."];
  const aktiveRaff=Object.keys(S.raff).filter(id=>S.raff[id].arbeiter>0);
  if(!aktiveRaff.length)return["Die Verarbeitung steht still","Du hast eine Raffinerie, aber aktuell keinen aktiven Durchsatz. Prüfe Personal und Rohstofflager."];
  const kapa=aktiveRaff.reduce((a,id)=>{const d=RAFF_ORTE.find(x=>x.id===id);return a+d.kapazitaet*ausbauFaktor(S.raff[id].ausbau)*(S.raff[id].arbeiter/d.plaetze);},0);
  if(Object.values(S.erz).reduce((a,b)=>a+(+b||0),0)>kapa*5)return["Rohstofflager wächst","Vergleiche Förderung und Raffinerie-Durchsatz. Wo liegt der Engpass?"];
  if(!S.fabriken.length)return["Material hat noch kein Ziel","Welche Produkte passen zu den Materialien, die deine Lieferkette bereits bereitstellt?"];
  const leer=S.fabriken.find(f=>f.restbau===0&&f.arbeiter===0);
  if(leer)return["Eine Fabrik steht still","Die Anlage ist fertig. Prüfe, ob Personal oder Material fehlt."];
  for(const f of S.fabriken){
    if(f.restbau>0)continue;
    const fehlt=Object.keys(PRODUKT[f.produkt].rezept).filter(k=>(S.mat[k]||0)<PRODUKT[f.produkt].rezept[k]*3);
    if(fehlt.length)return["Produktion stockt: "+fehlt.map(k=>MATERIAL[k].name).join(", "),"Finde heraus, ob Rohstoffquelle, Raffination oder Lagerbestand den Engpass verursacht."];
  }
  if(warenLager()>0&&verkaufsKraft()===0)return["Fertige Ware liegt im Lager","Vergleiche Lager, Nachfrage und deine Verkaufskapazität."];
  if(warenLager()>verkaufsKraft()*12&&verkaufsKraft()>0)return["Das Warenlager wächst","Produktion und Verkauf sind nicht im Gleichgewicht. Entscheide, welche Seite du anpassen willst."];
  if(freieArbeiter()>15)return[freieArbeiter()+" Leute ohne Aufgabe","Prüfe, ob du dieses Personal noch brauchst oder an einem Engpass einsetzen kannst."];
  if(S.ruf<55)return["Die Nachfrage leidet unter deinem Ruf","Prüfe Meldungen und frühere Entscheidungen. Ruf und Lieferketten-Nachweise sind dabei zwei verschiedene Dinge."];
  const praxisOffen=WISSEN.filter(seg=>{const p=naechsterPerk(seg);return p&&wissenPraxis(seg.id,seg.perks.indexOf(p)).ok;});
  if(praxisOffen.length)return["Ein Wissensfeld passt zu deiner Erfahrung","Im Reiter Wissen findest du Verbesserungen, deren Praxisbezug du bereits erfüllt hast."];
  const nahe=minen.find(id=>ausbauVerdoppelt(S.minen[id].ausbau||0));
  if(nahe)return["Ein Ausbau steht vor einem Sprung","Vergleiche Kosten und Wirkung deiner Ausbauten. Nicht jeder Engpass braucht dieselbe Lösung."];
  return null;
};
const originalQuestZeichnenShould=questZeichnen;
questZeichnen=function(){
  originalQuestZeichnenShould();
  if(!tutorialLaeuft()){
    const q=document.getElementById("quest");
    if(q&&!q.hidden){const art=document.getElementById("q-art");if(art)art.textContent="Wegweiser";}
  }
};
function spezialNamen(def){return(def.spezial||[]).map(k=>MATERIAL[k]?.name).filter(Boolean);}
const originalBlattRaffShould=blattRaff;
blattRaff=function(id){
  let html=originalBlattRaffShould(id);
  const def=RAFF_ORTE.find(x=>x.id===id);
  if(!def)return html;
  const card=`<div class="karte"><h3>Spiel-Schwerpunkt</h3><div class="ort">${spezialNamen(def).join(" · ")||"kein Schwerpunkt"}</div><div class="notiz"><b>+25 % Durchsatz</b> für diese Rohstoffe. Alle anderen Rohstoffe können hier weiterhin normal verarbeitet werden. Der Schwerpunkt ist eine Spielregel.</div></div>`;
  const marker=`<div class="karte">\n      <h3>Personal</h3>`;
  return html.includes(marker)?html.replace(marker,card+"\n\n    "+marker):html+card;
};
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
  }
  const kraft=verkaufsKraft();if(kraft>0)wareVerkaufen(kraft);
  if((S.tag-1)%30===0){
    const lohn=lohnsumme(),betrieb=(Object.keys(S.raff).length*9000+S.fabriken.length*14000)*perkMult("betrieb");
    S.kasse-=lohn+betrieb;S.ausgegeben+=lohn+betrieb;notiz(`Monatsabschluss: Löhne ${chf(lohn)}, Betrieb ${chf(betrieb)}.`,"geld");rufAnpassen();
    if(S.kasse<0)notiz("Die Kasse ist im Minus. Ohne Gegensteuer ist die Firma bald zahlungsunfähig.","alarm");
  }
  if(S.tag%5===0)marktBewegen();ereignisPruefen();if(S.tag>ZIEL_TAGE||S.kasse<-800000)rundeBeenden();speichern();
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
  const svg=document.querySelector("svg.weltkarte");if(!svg)return;svg.querySelector("#didaktik-lieferweg")?.remove();
  let note=document.getElementById("didaktik-route-note");
  if(!note){
    note=document.createElement("div");note.id="didaktik-route-note";
    note.style.cssText="position:absolute;left:10px;bottom:calc(var(--dockh) + 10px);z-index:12;max-width:min(310px,calc(100vw - 82px));background:#fffaf0ee;color:#241c14;border:1px solid #d9c9aa;border-radius:14px;padding:8px 10px;box-shadow:0 3px 12px #0002;font-size:var(--f0);font-weight:700;line-height:1.3;pointer-events:none";
    document.getElementById("sicht")?.appendChild(note);
  }
  const r=beispielKette(),sichtbar=!!r&&aktiveSeite==="karte"&&!offenesBlatt;note.hidden=!sichtbar;if(!sichtbar)return;
  const [x1,y1]=px(r.mineId),[x2,y2]=px(r.raffId),[x3,y3]=px(r.fabId),ns="http://www.w3.org/2000/svg",g=document.createElementNS(ns,"g");
  g.id="didaktik-lieferweg";g.setAttribute("pointer-events","none");
  const line=(a,b,c,d)=>{const l=document.createElementNS(ns,"line");l.setAttribute("x1",a);l.setAttribute("y1",b);l.setAttribute("x2",c);l.setAttribute("y2",d);l.setAttribute("stroke","#f08c2e");l.setAttribute("stroke-width","4");l.setAttribute("stroke-dasharray","9 7");l.setAttribute("opacity",".72");return l;};
  g.appendChild(line(x1,y1,x2,y2));g.appendChild(line(x2,y2,x3,y3));svg.appendChild(g);
  const mine=MINEN.find(x=>x.id===r.mineId),raff=RAFF_ORTE.find(x=>x.id===r.raffId),km=(Math.round((r.d1+r.d2)/100)*100).toLocaleString("de-CH");
  note.innerHTML=`<b>Beispielweg auf der Karte</b><br>${mine.ort} → ${raff.ort} → ${LAND[r.fabrik.land].name} · ca. ${km} km<br><span style="font-weight:600;color:#6b5f50">Orientierung: Transportkosten und Lieferzeiten werden nicht berechnet.</span>`;
}
const originalZeichnenShould=zeichnen;
zeichnen=function(){shouldMigration();originalZeichnenShould();lieferwegZeichnen();};
shouldMigration();seitenStand="";blattStand="";zeichnen();

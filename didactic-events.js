"use strict";
/* Ereignisse: nur sichtbare Mechaniken beschreiben. */
function ereignis(id){ return EREIGNISSE.find(e => e.id === id); }

for (const id of ["exportstopp", "lithiumcrash"]){
  const e = ereignis(id);
  if (e) e.gewicht = -1;
}

const dollarEv = ereignis("dollar");
if (dollarEv){
  dollarEv.bau = function(){
    const schwach = Math.random() < .5, w = schwach ? .82 : 1.18;
    S.globalMod.push({art:"dollar", wert:w, bis:S.tag+50});
    return {passiv:true, text:textVon("didacticevents.us-dollar-die-verkaufspreise", {p1:(schwach?"schwach":"stark"), p2:(schwach?"sinken":"steigen"), p3:(Math.round(Math.abs(1-w)*100))}), art:"warn"};
  };
}

const taiwanEv = ereignis("taiwan");
if (taiwanEv){
  taiwanEv.bau = function(){
    S.nachfrageMod.phone = {faktor:1.5, bis:S.tag+70};
    S.nachfrageMod.konsole = {faktor:1.5, bis:S.tag+70};
    return {passiv:true, text:textVon("didacticevents.erdbeben-bei-taiwan-elektroniklieferungen"), art:"warn"};
  };
}

const protestEv = ereignis("protest");
if (protestEv){
  protestEv.passt = function(){ return offeneMinen().some(id => S.minen[id].zufriedenheit < 32 && S.minen[id].stillBis <= S.tag); };
  protestEv.bau = function(id = offeneMinen().find(i => S.minen[i].zufriedenheit < 32 && S.minen[i].stillBis <= S.tag)){
    const def = MINEN.find(x=>x.id===id);
    S.minen[id].stillBis = S.tag + 999;
    return {
      offenesEreignis:{id:protestEv.id, mine:id},
      art:textVon("didacticevents.protest"), titel:textVon("didacticevents.streik-in", {p1:(def.ort)}), land:def.land,
      text:textVon("didacticevents.die-belegschaft-streikt-die"),
      wahlen:[
        {text:textVon("didacticevents.lohn-erhoehen"), klein:textVon("didacticevents.dauerhaft-hoehere-kosten-zufriedenheit"),
         tun(){ S.minen[id].stufe=Math.min(2,S.minen[id].stufe+1); S.minen[id].zufriedenheit=62; S.minen[id].stillBis=S.tag+2; notiz(textVon("didacticevents.lohn-in-erhoeht", {p1:(def.ort)}),"gut"); }},
        {text:textVon("didacticevents.verhandeln-und-praemie-zahlen"), klein:textVon("didacticevents.chf-zufriedenheit-steigt-tage"),
         tun(){ S.kasse-=60000; S.ausgegeben+=60000; S.minen[id].zufriedenheit=52; S.minen[id].stillBis=S.tag+5; notiz(textVon("didacticevents.einigung-in-praemie-bezahlt", {p1:(def.ort)}),"gut"); }},
        {text:textVon("didacticevents.keine-einigung-suchen"), klein:textVon("didacticevents.tage-stillstand-zufriedenheit-bleibt"),
         tun(){ S.minen[id].stillBis=S.tag+20; S.minen[id].zufriedenheit=12; rufAendern(-15); notiz(`Streik in ${def.ort} ohne Einigung fortgesetzt.`,"alarm"); }}
      ]
    };
  };
}

const unfallEv = ereignis("unglueck");
if (unfallEv){
  unfallEv.passt = function(){
    if (tutorialLaeuft()) return false;
    return offeneMinen().some(id => !S.minen[id].sicherheit && S.minen[id].arbeiter > 20) && Math.random() < .18;
  };
  unfallEv.bau = function(id = offeneMinen().find(i => !S.minen[i].sicherheit && S.minen[i].arbeiter > 20)){
    const def = MINEN.find(x=>x.id===id);
    S.minen[id].stillBis = S.tag + 999;
    return {
      offenesEreignis:{id:unfallEv.id, mine:id},
      art:textVon("didacticevents.unfall"), titel:textVon("didacticevents.unfall-in", {p1:(def.ort)}), land:def.land,
      text:textVon("didacticevents.in-der-rohstoffquelle-gab"),
      wahlen:[
        {text:textVon("didacticevents.sicherheitsmassnahmen-verbessern-und-betroffene"), klein:textVon("didacticevents.chf-sicherheit-verbessert-tage"),
         tun(){ S.kasse-=140000; S.ausgegeben+=140000; S.minen[id].sicherheit=true; S.minen[id].stillBis=S.tag+10; notiz(textVon("didacticevents.sicherheitsmassnahmen-verbessert-und-entschaedigung", {p1:(def.ort)}),"warn"); }},
        {text:textVon("didacticevents.nur-reparieren"), klein:textVon("didacticevents.chf-tage-stillstand-sicherheit"),
         tun(){ S.kasse-=30000; S.ausgegeben+=30000; S.minen[id].stillBis=S.tag+25; notiz(`Notreparatur in ${def.ort}. Sicherheitsproblem bleibt offen.`,"alarm"); }}
      ]
    };
  };
}

const rechercheEv = ereignis("kinderarbeit");
if (rechercheEv){
  rechercheEv.passt = function(){
    if (tutorialLaeuft() || S.tag <= 90 || perkHat("ruf1") || perkHat("ruf2")) return false;
    return offeneMinen().some(id => !S.minen[id].nachweis);
  };
  rechercheEv.bau = function(id = offeneMinen().find(i => !S.minen[i].nachweis)){
    const def = MINEN.find(x=>x.id===id);
    return {
      offenesEreignis:{id:rechercheEv.id, mine:id},
      art:textVon("didacticevents.recherche"), titel:textVon("didacticevents.fragen-zu-deiner-lieferkette"), land:def.land,
      text:textVon("didacticevents.eine-recherche-stellt-fragen", {p1:(def.ort)}),
      wahlen:[
        {text:textVon("didacticevents.unabhaengige-pruefung-beauftragen"), klein:textVon("didacticevents.chf-nachweis-vorhanden"),
         tun(){ S.kasse-=90000; S.ausgegeben+=90000; S.minen[id].nachweis=true; notiz(textVon("didacticevents.unabhaengige-pruefung-abgeschlossen", {p1:(def.ort)}),"gut"); }},
        {text:textVon("didacticevents.keine-pruefung-vorlegen"), klein:textVon("didacticevents.kostet-nichts-ruf-sinkt"),
         tun(){ rufAendern(-18); S.nachfrageMod.phone={faktor:.8,bis:S.tag+60}; notiz(textVon("didacticevents.keine-unabhaengigen-nachweise-vorgelegt"),"alarm"); }}
      ]
    };
  };
}

const gesetzEv = ereignis("lieferkettengesetz");
if (gesetzEv){
  gesetzEv.bau = function(){
    const status = nachweisStatus();
    if (status.stufe === 0){
      S.kasse -= 180000; S.ausgegeben += 180000;
      return {passiv:true, text:textVon("didacticevents.lieferkettengesetz-die-geforderten-herkunftsnachweise"), art:"alarm"};
    }
    S.nachfrageMod.board = {faktor:1.3, bis:S.tag+90};
    return {passiv:true, text:textVon("didacticevents.lieferkettengesetz-deine-nachweise-sind", {p1:(status.text)}), art:"gut"};
  };
}

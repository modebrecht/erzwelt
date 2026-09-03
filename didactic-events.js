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
    return {passiv:true, text:`<b>US-Dollar ${schwach?"schwach":"stark"}</b> – die Verkaufspreise deiner Fertigwaren ${schwach?"sinken":"steigen"} 50 Tage lang um ${Math.round(Math.abs(1-w)*100)} %.`, art:"warn"};
  };
}

const taiwanEv = ereignis("taiwan");
if (taiwanEv){
  taiwanEv.bau = function(){
    S.nachfrageMod.phone = {faktor:1.5, bis:S.tag+70};
    S.nachfrageMod.konsole = {faktor:1.5, bis:S.tag+70};
    return {passiv:true, text:"<b>Erdbeben bei Taiwan</b> – Elektroniklieferungen stocken. Die Nachfrage nach Phones und Konsolen steigt 70 Tage lang um 50 %.", art:"warn"};
  };
}

const protestEv = ereignis("protest");
if (protestEv){
  protestEv.passt = function(){ return offeneMinen().some(id => S.minen[id].zufriedenheit < 32 && S.minen[id].stillBis <= S.tag); };
  protestEv.bau = function(){
    const id = offeneMinen().find(i => S.minen[i].zufriedenheit < 32 && S.minen[i].stillBis <= S.tag);
    const def = MINEN.find(x=>x.id===id);
    S.minen[id].stillBis = S.tag + 999;
    return {
      art:"Protest", titel:`Streik in ${def.ort}`, land:def.land,
      text:"Die Belegschaft legt die Arbeit wegen der Lohnsituation nieder. Die Förderung steht still.",
      wahlen:[
        {text:"Lohn erhöhen", klein:"Dauerhaft höhere Kosten · Zufriedenheit steigt",
         tun(){ S.minen[id].stufe=Math.min(2,S.minen[id].stufe+1); S.minen[id].zufriedenheit=62; S.minen[id].stillBis=S.tag+2; rufAendern(4); notiz(`Lohn in ${def.ort} erhöht.`,"gut"); }},
        {text:"Verhandeln und Prämie zahlen", klein:"CHF 60'000 · Arbeit läuft in 5 Tagen wieder",
         tun(){ S.kasse-=60000; S.ausgegeben+=60000; S.minen[id].zufriedenheit=52; S.minen[id].stillBis=S.tag+5; rufAendern(3); notiz(`Einigung in ${def.ort}: Prämie bezahlt.`,"gut"); }},
        {text:"Streik aussitzen", klein:"20 Tage Stillstand · Ruf fällt",
         tun(){ S.minen[id].stillBis=S.tag+20; S.minen[id].zufriedenheit=12; rufAendern(-15); notiz(`Streik in ${def.ort} ausgesessen.`,"alarm"); }}
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
  unfallEv.bau = function(){
    const id = offeneMinen().find(i => !S.minen[i].sicherheit && S.minen[i].arbeiter > 20);
    const def = MINEN.find(x=>x.id===id);
    S.minen[id].stillBis = S.tag + 999;
    return {
      art:"Unfall", titel:`Unfall in ${def.ort}`, land:def.land,
      text:"In der Mine gab es einen schweren Unfall. Die Mine bleibt geschlossen, bis du über die Sicherheitsmassnahmen entscheidest.",
      wahlen:[
        {text:"Sichern und entschädigen", klein:"CHF 140'000 · Sicherheit verbessert · 10 Tage Stillstand",
         tun(){ S.kasse-=140000; S.ausgegeben+=140000; S.minen[id].sicherheit=true; S.minen[id].stillBis=S.tag+10; rufAendern(4); notiz(`${def.ort}: Sicherheit verbessert und Entschädigung bezahlt.`,"warn"); }},
        {text:"Nur reparieren", klein:"CHF 30'000 · 25 Tage Stillstand · Sicherheit bleibt offen",
         tun(){ S.kasse-=30000; S.ausgegeben+=30000; S.minen[id].stillBis=S.tag+25; rufAendern(-12); S.minen[id].zufriedenheit=Math.max(15,S.minen[id].zufriedenheit-12); notiz(`Notreparatur in ${def.ort}. Sicherheitsproblem bleibt offen.`,"alarm"); }}
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
  rechercheEv.bau = function(){
    const id = offeneMinen().find(i => !S.minen[i].nachweis);
    const def = MINEN.find(x=>x.id===id);
    return {
      art:"Recherche", titel:"Fragen zu deiner Lieferkette", land:def.land,
      text:`Eine Recherche stellt Fragen zu den Arbeitsbedingungen in ${def.ort}. Deine Firma kann für diese Rohstoffquelle noch keine unabhängige Prüfung vorlegen.`,
      wahlen:[
        {text:"Unabhängige Prüfung beauftragen", klein:"CHF 90'000 · Nachweis vorhanden",
         tun(){ S.kasse-=90000; S.ausgegeben+=90000; S.minen[id].nachweis=true; rufAendern(8); notiz(`${def.ort}: unabhängige Prüfung abgeschlossen.`,"gut"); }},
        {text:"Keine Prüfung vorlegen", klein:"Kostet nichts · Ruf und Nachfrage leiden",
         tun(){ rufAendern(-18); S.nachfrageMod.phone={faktor:.8,bis:S.tag+60}; notiz("Keine unabhängigen Nachweise vorgelegt. Die Nachfrage leidet.","alarm"); }}
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
      return {passiv:true, text:"<b>Lieferkettengesetz</b> – die geforderten Herkunftsnachweise fehlen. Busse: CHF 180'000.", art:"alarm"};
    }
    S.nachfrageMod.board = {faktor:1.3, bis:S.tag+90};
    return {passiv:true, text:`<b>Lieferkettengesetz</b> – deine Nachweise sind ${status.text}. Grosskunden bestellen 90 Tage lang mehr Mainboards.`, art:"gut"};
  };
}

rundeBeenden = function(){
  const gewinn = S.eingenommen - S.ausgegeben;
  const geschafft = gewinn >= ZIEL_GEWINN && S.ruf >= ZIEL_RUF;
  S.ende = {gewinn, ruf:Math.round(S.ruf), geschafft};
  tempoSetzen(0);
  dialogZeigen({
    art:"Runde beendet", titel:geschafft?"Ziel erreicht":"Ziel verfehlt",
    text:`Gewinn: ${chf(gewinn)} (Ziel ${chf(ZIEL_GEWINN)}) · Ruf: ${Math.round(S.ruf)} (Ziel ${ZIEL_RUF}).<br><br>` +
      (geschafft ? "Du hast Geld verdient und den Ruf gehalten. Welche Entscheidung war dafür besonders wichtig?" :
       gewinn>=ZIEL_GEWINN ? "Der Gewinn stimmt, aber der Ruf nicht. Welche sichtbaren Entscheidungen oder Ereignisse haben Ruf gekostet?" :
       "Der Gewinn reicht nicht. Wo war der Engpass – Rohstoff, Raffination, Produktion oder Verkauf?"),
    wahlen:[{text:"Neue Runde starten", klein:"Alles auf Anfang", tun:()=>{ zuruecksetzen(); }}]
  });
};

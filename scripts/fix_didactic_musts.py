from pathlib import Path

path = Path("erzwelt.html")
text = path.read_text(encoding="utf-8")

def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, found {count}")
    text = text.replace(old, new, 1)
    print(f"ok: {label}")

# 1) Material model: no simulated raw-material prices; show real source material -> usable material.
replace_once(
'''/* Materialien: Preis = CHF pro Einheit im Weltmarkt-Grundzustand.
   ausbeute = wie viel Material aus 1 Einheit Roherz entsteht.
   Je tiefer die Ausbeute, desto mehr Gestein muss bewegt werden. */
const MATERIAL = {
  kupfer:  {name:"Kupfer",        sym:"Cu", farbe:"#cc7a45", preis:  9, ausbeute:.35, wofuer:"Leiterbahnen, Kabel, Spulen"},
  alu:     {name:"Aluminium",     sym:"Al", farbe:"#9fb0c4", preis:  7, ausbeute:.50, wofuer:"Gehäuse, Kühlkörper"},
  silizium:{name:"Silizium",      sym:"Si", farbe:"#4bb6ca", preis: 15, ausbeute:.70, wofuer:"Chips, Prozessoren, Speicher"},
  zinn:    {name:"Zinn",          sym:"Sn", farbe:"#8394a7", preis: 30, ausbeute:.40, wofuer:"Lötzinn – hält jede Platine zusammen"},
  nickel:  {name:"Nickel",        sym:"Ni", farbe:"#7cae66", preis: 18, ausbeute:.40, wofuer:"Akku-Kathode, Kontakte"},
  lithium: {name:"Lithium",       sym:"Li", farbe:"#9a6ce4", preis: 28, ausbeute:.45, wofuer:"Akku – speichert die Ladung"},
  kobalt:  {name:"Kobalt",        sym:"Co", farbe:"#4a6cf7", preis: 34, ausbeute:.40, wofuer:"Akku-Kathode, macht sie stabil"},
  silber:  {name:"Silber",        sym:"Ag", farbe:"#9fa9b6", preis: 58, ausbeute:.15, wofuer:"Bester Leiter: Kontakte, Lötpaste"},
  seltene: {name:"Seltene Erden", sym:"SE", farbe:"#d94a80", preis: 72, ausbeute:.25, wofuer:"Magnete: Lautsprecher, Vibration, Motoren"},
  tantal:  {name:"Tantal",        sym:"Ta", farbe:"#7a5ad8", preis: 88, ausbeute:.20, wofuer:"Kondensatoren – winzig, aber unersetzlich"},
  indium:  {name:"Indium",        sym:"In", farbe:"#22b98a", preis:118, ausbeute:.10, wofuer:"Touchscreen & Display (ITO-Schicht)"},
  gold:    {name:"Gold",          sym:"Au", farbe:"#d9a516", preis:150, ausbeute:.08, wofuer:"Kontakte, die nicht rosten dürfen"}
};''',
'''/* Materialien im Spielmodell.
   rohstoff = das, was an der Lagerstätte gewonnen wird.
   ausbeute = vereinfachter Spielwert dafür, wie viel nutzbares Material
   nach der Raffination übrig bleibt. Diese Zahlen sind Balancingwerte. */
const MATERIAL = {
  kupfer:  {name:"Kupfer",        sym:"Cu", farbe:"#cc7a45", rohstoff:"Kupfererz",                     ausbeute:.35, wofuer:"Leiterbahnen, Kabel, Spulen"},
  alu:     {name:"Aluminium",     sym:"Al", farbe:"#9fb0c4", rohstoff:"Bauxit",                        ausbeute:.50, wofuer:"Gehäuse, Kühlkörper"},
  silizium:{name:"Silizium",      sym:"Si", farbe:"#4bb6ca", rohstoff:"Quarz / Rohsilizium",           ausbeute:.70, wofuer:"Chips, Prozessoren, Speicher"},
  zinn:    {name:"Zinn",          sym:"Sn", farbe:"#8394a7", rohstoff:"Zinnerz (Kassiterit)",          ausbeute:.40, wofuer:"Lötzinn – hält jede Platine zusammen"},
  nickel:  {name:"Nickel",        sym:"Ni", farbe:"#7cae66", rohstoff:"Nickelerz",                     ausbeute:.40, wofuer:"Akku-Kathode, Kontakte"},
  lithium: {name:"Lithium",       sym:"Li", farbe:"#9a6ce4", rohstoff:"Lithiumerz / Sole",             ausbeute:.45, wofuer:"Akku – speichert die Ladung"},
  kobalt:  {name:"Kobalt",        sym:"Co", farbe:"#4a6cf7", rohstoff:"Kupfer-/Kobalterz",             ausbeute:.40, wofuer:"Akku-Kathode, macht sie stabil"},
  silber:  {name:"Silber",        sym:"Ag", farbe:"#9fa9b6", rohstoff:"Silbererz",                     ausbeute:.15, wofuer:"Bester Leiter: Kontakte, Lötpaste"},
  seltene: {name:"Seltene Erden", sym:"SE", farbe:"#d94a80", rohstoff:"Erz mit Seltenen Erden",        ausbeute:.25, wofuer:"Magnete: Lautsprecher, Vibration, Motoren"},
  tantal:  {name:"Tantal",        sym:"Ta", farbe:"#7a5ad8", rohstoff:"Coltan",                        ausbeute:.20, wofuer:"Kondensatoren – winzig, aber unersetzlich"},
  indium:  {name:"Indium",        sym:"In", farbe:"#22b98a", rohstoff:"Zinkerz (Indium als Nebenprodukt)", ausbeute:.10, wofuer:"Touchscreen & Display (ITO-Schicht)"},
  gold:    {name:"Gold",          sym:"Au", farbe:"#d9a516", rohstoff:"Golderz",                       ausbeute:.08, wofuer:"Kontakte, die nicht rosten dürfen"}
};''',
"material definitions")

replace_once(
'''/* Lohnstufen: Faktor auf den Landeslohn, Zielwert der Zufriedenheit, Risikofaktor. */
const LOHNSTUFE = [
  {label:"knapp",  faktor:0.7, ziel:22, name:"unter üblichem Lohn"},
  {label:"üblich", faktor:1.0, ziel:56, name:"landesüblicher Lohn"},
  {label:"fair",   faktor:1.45,ziel:86, name:"deutlich über üblich, mit Schutzausrüstung"}
];''',
'''/* Lohnstufen betreffen nur Bezahlung und Zufriedenheit.
   Sicherheit wird separat modelliert und darf nicht über den Lohn "mitgekauft" werden. */
const LOHNSTUFE = [
  {label:"knapp",  faktor:0.7, ziel:22, name:"unter üblichem Lohn"},
  {label:"üblich", faktor:1.0, ziel:56, name:"landesüblicher Lohn"},
  {label:"fair",   faktor:1.45,ziel:86, name:"deutlich über üblichem Lohn"}
];''',
"separate wage and safety")

for old,new,label in [
(
'''text:"Dein erstes Produkt ist ein Ladekabel. Dafür brauchst du Kupfer, Aluminium und Zinn – alles aus eigenen Minen. Tippe einen leuchtenden Pin an.",''',
'''text:"Dein erstes Produkt ist ein Ladekabel. Dafür brauchst du Kupfer, Aluminium und Zinn. Sichere zuerst eine eigene Rohstoffquelle. Tippe einen leuchtenden Pin an.",''',
"tutorial first mine"),
(
'''text:"Kupfer, Aluminium und Zinn. Rohstoffe lassen sich nicht zukaufen – jedes Material kommt aus deiner eigenen Mine.",''',
'''text:"Kupfererz, Bauxit für Aluminium und Zinnerz: Die Ausgangsrohstoffe förderst du selbst. Erst die Raffinerie macht daraus nutzbare Materialien.",''',
"tutorial three sources"),
(
'''text:"Roherz lässt sich nicht verbauen. Erst die Raffinerie macht Material daraus.",''',
'''text:"Roherz, Bauxit oder andere Ausgangsstoffe lassen sich nicht direkt verbauen. Erst die Raffinerie macht daraus nutzbares Material.",''',
"tutorial refinery"),
(
'''/* Rohstoffe lassen sich nicht zukaufen: Jedes Material muss aus einer
   eigenen Mine kommen. Das ist der Kern des Spiels. */''',
'''/* Primärrohstoffe lassen sich nicht zukaufen: Für jedes benötigte Material
   braucht die Firma eine eigene Rohstoffquelle und Raffination.
   Recycling-Ereignisse können später einen Teil als Sekundärrohstoff liefern. */''',
"core material comment"),
]:
    replace_once(old,new,label)

replace_once(
'''  {
    id:"leute", titel:"Menschen & Löhne", farbe:"#e0504a", ikon:"person",
    kurz:"Der Lohn entscheidet über Zufriedenheit, Streik und deinen Ruf.",
    text:["Die Länder mit den tiefsten Löhnen sind oft genau jene mit den Rohstoffen, die wir für Smartphones brauchen. Das ist kein Zufall, sondern Geschichte.",
      "Im Spiel gilt: Tiefe Löhne senken deine Kosten <b>sofort</b>. Sie senken auch die Zufriedenheit. Unter 32 % wird gestreikt, und ein Streik stoppt die Förderung ganz. Sitzt du ihn aus, fällt dein Ruf – und ein schlechter Ruf senkt die Nachfrage nach allem, was du verkaufst."],
    fakten:["In Kleinstminen («artisanal mining») arbeiten weltweit geschätzt über 40 Millionen Menschen.",
      "Schutzausrüstung kostet einen Bruchteil eines Monatslohns – und verhindert die meisten schweren Unfälle.",
      "Zufriedene Belegschaften fördern im Spiel bis zu 60 % mehr als unzufriedene."],
    perks:[
      {id:"leute1", titel:"Sicherheitsschulung", kosten:80000,
       text:"Helm, Gurt, Beleuchtung und eine Stunde Schulung pro Woche. Die Leute bleiben – und arbeiten ruhiger.",
       wirkung:["Zufriedenheit +5 in allen Minen"], plus:{zufrieden:5}},
      {id:"leute2", titel:"Betriebliche Mitbestimmung", kosten:230000,
       text:"Die Belegschaft wählt eine Vertretung, die mitredet. Konflikte kommen früher auf den Tisch.",
       wirkung:["Zufriedenheit +8","Ruf sofort +5"], plus:{zufrieden:8}, sofort:{ruf:5}}
    ]
  },''',
'''  {
    id:"leute", titel:"Menschen, Löhne & Sicherheit", farbe:"#e0504a", ikon:"person",
    kurz:"Lohn und Arbeitssicherheit hängen zusammen – sind aber nicht dasselbe.",
    text:["Die Länder mit den tiefsten Löhnen sind oft genau jene mit den Rohstoffen, die wir für Smartphones brauchen. Das ist kein Zufall, sondern Geschichte.",
      "Im Spiel gilt: Tiefe Löhne senken deine Kosten <b>sofort</b>, aber auch die Zufriedenheit. Unter 32 % kann gestreikt werden. <b>Sicherheit ist separat:</b> Schutz, Ausrüstung und Schulung senken das Unfallrisiko unabhängig davon, wie hoch der Lohn ist."],
    fakten:["In Kleinstminen («artisanal mining») arbeiten weltweit geschätzt über 40 Millionen Menschen.",
      "Schutzausrüstung kostet einen Bruchteil eines Monatslohns – und verhindert viele schwere Unfälle.",
      "Zufriedene Belegschaften fördern im Spiel bis zu 60 % mehr als unzufriedene."],
    perks:[
      {id:"leute1", titel:"Sicherheitsstandard", kosten:80000,
       text:"Helm, Gurt, Beleuchtung und regelmässige Schulung werden in allen bestehenden und künftigen Minen Standard.",
       wirkung:["Sicherheitsstandard in allen Minen","Zufriedenheit +5"], plus:{zufrieden:5}},
      {id:"leute2", titel:"Betriebliche Mitbestimmung", kosten:230000,
       text:"Die Belegschaft wählt eine Vertretung, die mitredet. Konflikte kommen früher auf den Tisch.",
       wirkung:["Zufriedenheit +8","Ruf sofort +5"], plus:{zufrieden:8}, sofort:{ruf:5}}
    ]
  },''',
"knowledge people")

replace_once(
'''  {
    id:"markt", titel:"Markt & Preise", farbe:"#f08c2e", ikon:"markt",
    kurz:"Nachfrage, Lager und Dollarkurs – und warum Verkaufen Arbeit ist.",
    text:["Ware verkauft sich nicht von allein. Entweder du verkaufst selber, oder du stellst Verkäuferinnen an, die es jeden Tag für dich erledigen. Jede von ihnen setzt rund " + STUECK_PRO_VERKAEUFER + " Stück pro Tag ab – und kostet Lohn.",
      "Der Markt nimmt pro Tag nur eine bestimmte Menge auf. Produzierst du mehr, füllt sich das Lager und der Preis fällt um bis zu 35 %. Rohstoffe und Waren werden zudem weltweit in Dollar gehandelt: Ein starker Dollar verändert alle Preise."],
    fakten:["Der Lithiumpreis fiel zwischen 2022 und 2024 um über 80 % – neue Minen lieferten zu viel.",
      "Exportbeschränkungen für Seltene Erden können den Preis binnen Wochen verdreifachen.",
      "Saison zählt: Konsolen und Fernseher verkaufen sich im November und Dezember fast doppelt so gut."],
    perks:[''',
'''  {
    id:"markt", titel:"Markt & Preise", farbe:"#f08c2e", ikon:"markt",
    kurz:"Nachfrage, Lager und Dollarkurs – und was das Spiel bewusst nicht simuliert.",
    text:["Ware verkauft sich nicht von allein. Entweder du verkaufst selber, oder du stellst Verkäuferinnen an, die es jeden Tag für dich erledigen. Jede von ihnen setzt rund " + STUECK_PRO_VERKAEUFER + " Stück pro Tag ab – und kostet Lohn.",
      "Der Markt nimmt pro Tag nur eine bestimmte Menge Fertigwaren auf. Produzierst du mehr, füllt sich das Lager und der Verkaufspreis fällt um bis zu 35 %. <b>Rohstoff-Weltmarktpreise sind reale Kontextfakten, aber kein Handelsmechanismus dieses Spiels:</b> Primärrohstoffe kaufst oder verkaufst du hier nicht. Der Dollarkurs wirkt im Modell nur auf deine Verkaufspreise fertiger Produkte."],
    fakten:["Der Lithiumpreis fiel zwischen 2022 und 2024 um über 80 % – das ist ein Realwelt-Beispiel, kein Spielpreis.",
      "Exportbeschränkungen für Seltene Erden können reale Preise stark verändern – Erzwelt bildet das nicht als Rohstoffhandel ab.",
      "Saison zählt: Konsolen und Fernseher verkaufen sich im November und Dezember häufig stärker."],
    perks:[''',
"knowledge market")

replace_once(
'''  {
    id:"ruf", titel:"Ruf & Verantwortung", farbe:"#2fbe7e", ikon:"schild",
    kurz:"Warum sauber gerechnet nicht reicht, wenn niemand mehr kauft.",
    text:["Dein <b>Ruf</b> ist keine Dekoration: Er steuert direkt, wie viele Menschen deine Produkte kaufen. Ein Ruf von 20 kostet dich rund ein Drittel deiner Nachfrage.",
      "Recherchen, Gesetze und Kundinnen schauen genauer hin als früher. Ein Lieferkettengesetz verlangt Nachweise – wer sie nicht hat, zahlt Bussen. Wer sie hat, gewinnt Grosskunden."],
    fakten:["Vier Rohstoffe gelten offiziell als «Konfliktmineralien»: Zinn, Tantal, Wolfram und Gold.",
      "Die EU und die Schweiz verlangen von grossen Firmen Sorgfaltsprüfungen in der Lieferkette.",
      "Ein einziger Medienbericht kann die Nachfrage nach einem Produkt monatelang drücken."],
    perks:[
      {id:"ruf1", titel:"Transparenzbericht", kosten:120000,
       text:"Du legst offen, woher jedes Material kommt – nachprüfbar, mit Zahlen.",
       wirkung:["Ruf sofort +8","Nachfrage +5 %"], mult:{nachfrage:1.05}, sofort:{ruf:8}},
      {id:"ruf2", titel:"Zertifizierte Lieferkette", kosten:330000,
       text:"Unabhängige Stellen prüfen jede Mine. Skandale treffen dich weniger hart.",
       wirkung:["Nachfrage +10 %","Rufverluste −40 %"], mult:{nachfrage:1.10, rufschutz:0.60}}
    ]
  },''',
'''  {
    id:"ruf", titel:"Ruf, Nachweise & Verantwortung", farbe:"#2fbe7e", ikon:"schild",
    kurz:"Ruf beeinflusst Kundschaft. Nachweise entscheiden über Compliance.",
    text:["Dein <b>Ruf</b> steuert, wie viele Menschen deine Produkte kaufen. Er ist öffentliche Wahrnehmung – nicht automatisch ein Beweis für saubere Prozesse.",
      "Ein Lieferkettengesetz verlangt <b>Nachweise</b>. Im Spiel entstehen sie durch Transparenzbericht oder Zertifizierung. Ein guter Ruf allein genügt dafür nicht; umgekehrt können saubere Nachweise deinen Ruf und die Nachfrage verbessern."],
    fakten:["Vier Rohstoffe gelten offiziell als «Konfliktmineralien»: Zinn, Tantal, Wolfram und Gold.",
      "Die EU und die Schweiz verlangen von grossen Firmen Sorgfaltsprüfungen in der Lieferkette.",
      "Ein einziger Medienbericht kann die Nachfrage nach einem Produkt monatelang drücken."],
    perks:[
      {id:"ruf1", titel:"Transparenzbericht", kosten:120000,
       text:"Du dokumentierst, woher deine Materialien kommen – nachprüfbar, mit Zahlen.",
       wirkung:["Nachweis für Lieferkettengesetz","Ruf sofort +8","Nachfrage +5 %"], mult:{nachfrage:1.05}, sofort:{ruf:8}},
      {id:"ruf2", titel:"Zertifizierte Lieferkette", kosten:330000,
       text:"Unabhängige Stellen prüfen deine Lieferkette. Die Zertifizierung gilt als stärkerer Nachweis und dämpft Rufverluste.",
       wirkung:["Zertifizierter Nachweis","Nachfrage +10 %","Rufverluste −40 %"], mult:{nachfrage:1.10, rufschutz:0.60}}
    ]
  },''',
"knowledge reputation vs compliance")

replace_once(
'''"Zufall gibt es nur bei Marktpreisen und Ereignissen. Alles andere ist berechenbar."''',
'''"Zufall gibt es im Spiel bei Ereignissen. Rohstoff-Weltmarktpreise werden bewusst nicht als Handelsmechanik simuliert."''',
"model knowledge random statement")

replace_once(
'''    minen:{},        // id -> {arbeiter, stufe, zufriedenheit, stillBis, malus, malusBis, ausbau}
    raff:{},         // id -> {arbeiter, ausbau}
    fabriken:[],     // {produkt, land, arbeiter, restbau}
    erz:{}, mat:{}, ware:{},
    perks:{},        // perkId -> true
    preisMod:{}, nachfrageMod:{},   // material/produkt -> {faktor, bis}
    globalMod:[],                   // {art, wert, bis, text}''',
'''    minen:{},        // id -> {arbeiter, stufe, zufriedenheit, stillBis, malus, malusBis, ausbau, sicherheit, audit}
    raff:{},         // id -> {arbeiter, ausbau}
    fabriken:[],     // {produkt, land, arbeiter, restbau}
    erz:{}, mat:{}, ware:{},
    perks:{},        // perkId -> true
    nachfrageMod:{}, // produkt -> {faktor, bis}
    globalMod:[],    // {art, wert, bis, text}''',
"state model")

replace_once(
'''/* Aktueller Marktpreis eines Materials */
function matPreis(k){
  const mod = S.preisMod[k];
  const f = (mod && mod.bis > S.tag) ? mod.faktor : 1;
  return MATERIAL[k].preis * f * dollarFaktor();
}
function dollarFaktor(){''',
'''function dollarFaktor(){''',
"remove material price function")

replace_once(
'''  // 7) Marktbewegung: Preise wandern zufällig
  if (S.tag % 5 === 0) marktBewegen();

  // 8) Ereignisse''',
'''  // 7) Rohstoff-Weltmarktpreise werden bewusst nicht als Handelsmechanik simuliert.

  // 8) Ereignisse''',
"remove market movement call")

replace_once(
'''function marktBewegen(){
  const k = Object.keys(MATERIAL)[Math.floor(Math.random()*12)];
  const alt = S.preisMod[k] && S.preisMod[k].bis > S.tag ? S.preisMod[k].faktor : 1;
  const neu = klemm(alt * zufall(0.88, 1.14), 0.55, 2.2);
  S.preisMod[k] = {faktor:neu, bis:S.tag + 60};
}

''',
'''/* Rohstoffpreise sind Realwelt-Kontext, aber kein interner Handelsmarkt. */

''',
"remove market movement function")

replace_once(
'''  const roh = Object.keys(MATERIAL).map(k => {
    const p = matPreis(k), d = p/MATERIAL[k].preis - 1;
    const meins = MINEN.some(m => m.mat === k && S.minen[m.id]);
    return `<tr><td><i class="punkt" style="background:${MATERIAL[k].farbe}"></i> ${MATERIAL[k].name}
        ${meins ? "" : `<br><small style="color:var(--grau);font-weight:600">keine eigene Mine</small>`}</td>
      <td class="n">${Math.round(S.mat[k]||0)}</td>
      <td class="n">${Math.round(S.erz[k]||0)}</td>
      <td class="n" style="color:${d>.03?"var(--gruen)":d<-.03?"var(--alarm)":"inherit"}">${p.toFixed(0)}${d>.03?" ▲":d<-.03?" ▼":""}</td></tr>`;
  }).join("");''',
'''  const roh = Object.keys(MATERIAL).map(k => {
    const mat = MATERIAL[k];
    const meins = MINEN.some(m => m.mat === k && S.minen[m.id]);
    return `<tr><td><i class="punkt" style="background:${mat.farbe}"></i> ${mat.rohstoff} → <b>${mat.name}</b>
        ${meins ? "" : `<br><small style="color:var(--grau);font-weight:600">keine eigene Rohstoffquelle</small>`}</td>
      <td class="n">${Math.round(S.mat[k]||0)}</td>
      <td class="n">${Math.round(S.erz[k]||0)}</td></tr>`;
  }).join("");''',
"market raw-material rows")

replace_once(
'''    <div class="karte"><h3>Deine Rohstoffe</h3>
      <table><tr><th>Material</th><th class="n">Bereit</th><th class="n">Erz</th><th class="n">Weltpreis</th></tr>${roh}</table>
      <div class="notiz">Rohstoffe kannst du nicht zukaufen. Jedes Material, das du brauchst, muss aus einer eigenen Mine kommen und durch eine Raffinerie gehen.</div></div>''',
'''    <div class="karte"><h3>Deine Rohstoffquellen</h3>
      <table><tr><th>Quelle → Material</th><th class="n">Bereit</th><th class="n">Rohstoff</th></tr>${roh}</table>
      <div class="notiz"><b>Spielregel:</b> Primärrohstoffe werden nicht am Weltmarkt gehandelt. Du sicherst eine Rohstoffquelle und raffinierst selbst. Recycling kann später Sekundärmaterial liefern.</div>
      <div class="notiz"><b>Spielmodell:</b> Mengen, Ausbeuten, Kosten, Löhne, Nachfrage und Produktrezepte sind vereinfachte Balancingwerte – keine 1:1-Realweltdaten.</div></div>''',
"market raw-material table")

replace_once(
'''  const band = `<div class="erzband" style="background:${mat.farbe}"><span class="kugel">${mat.sym}</span>${mat.name}</div>`;''',
'''  const band = `<div class="erzband" style="background:${mat.farbe}"><span class="kugel">${mat.sym}</span>${mat.rohstoff} → ${mat.name}</div>`;''',
"mine source band")

replace_once(
'''        <div class="wert"><span class="wi">${IK.berg}</span><span class="wt"><small>Ergiebigkeit</small><b>${def.ergiebigkeit} Erz</b></span></div>
        <div class="wert"><span class="wi">${IK.person}</span><span class="wt"><small>Plätze</small><b>${def.plaetze}</b></span></div>
        <div class="wert"><span class="wi">${IK.muenze}</span><span class="wt"><small>Lohn üblich</small><b>${chf(land.lohn)}</b></span></div>''',
'''        <div class="wert"><span class="wi">${IK.berg}</span><span class="wt"><small>Spiel-Ergiebigkeit</small><b>${def.ergiebigkeit} Erz</b></span></div>
        <div class="wert"><span class="wi">${IK.person}</span><span class="wt"><small>Plätze</small><b>${def.plaetze}</b></span></div>
        <div class="wert"><span class="wi">${IK.muenze}</span><span class="wt"><small>Modell-Lohn</small><b>${chf(land.lohn)}</b></span></div>''',
"mine model labels")

replace_once(
'''      <div class="notiz">${def.info}</div>
      <button class="cta ${geht?"puls":""}" data-tun="mine-auf" data-id="${id}" ${geht?"":"disabled"}>''',
'''      <div class="notiz">${def.info}</div>
      <div class="notiz"><b>Spielmodell:</b> Ergiebigkeit, Lohn und Erschliessungskosten sind vereinfachte Spielwerte. Der Infotext beschreibt den realen Kontext.</div>
      <button class="cta ${geht?"puls":""}" data-tun="mine-auf" data-id="${id}" ${geht?"":"disabled"}>''',
"mine model note")

replace_once(
'''      <div class="ort">Verkaufspreis ${chf(def.preis)} · Bauzeit ${tage} Tage · ${def.plaetze} Plätze</div>
      <div class="stueck">${Object.keys(def.rezept).map(k =>''',
'''      <div class="ort">Spielwerte: Verkaufspreis ${chf(def.preis)} · Bauzeit ${tage} Tage · ${def.plaetze} Plätze</div>
      <div class="ort"><b>Spielrezept</b> – vereinfachte Materialeinheiten pro Stück</div>
      <div class="stueck">${Object.keys(def.rezept).map(k =>''',
"factory model labels")

replace_once(
'''        <div class="wert"><span class="wi">${IK.kolben}</span><span class="wt"><small>Kapazität</small><b>${def.kapazitaet}/Tag</b></span></div>
        <div class="wert"><span class="wi">${IK.person}</span><span class="wt"><small>Plätze</small><b>${def.plaetze}</b></span></div>
        <div class="wert"><span class="wi">${IK.muenze}</span><span class="wt"><small>Lohn</small><b>${chf(land.lohn)}</b></span></div>''',
'''        <div class="wert"><span class="wi">${IK.kolben}</span><span class="wt"><small>Spiel-Kapazität</small><b>${def.kapazitaet}/Tag</b></span></div>
        <div class="wert"><span class="wi">${IK.person}</span><span class="wt"><small>Plätze</small><b>${def.plaetze}</b></span></div>
        <div class="wert"><span class="wi">${IK.muenze}</span><span class="wt"><small>Modell-Lohn</small><b>${chf(land.lohn)}</b></span></div>''',
"refinery model labels")

replace_once(
'''S.minen[id] = {arbeiter:0, stufe:1, zufriedenheit:55, stillBis:0, malus:1, malusBis:0, ausbau:0};''',
'''S.minen[id] = {arbeiter:0, stufe:1, zufriedenheit:55, stillBis:0, malus:1, malusBis:0, ausbau:0,
                     sicherheit:S.perks.leute1?1:0, audit:S.perks.ruf2?true:false};''',
"new mine safety/compliance")

replace_once(
'''    if (!S.perks || typeof S.perks !== "object") S.perks = {};
    // Ältere Spielstände kennen den Verkauf noch nicht:''',
'''    if (!S.perks || typeof S.perks !== "object") S.perks = {};
    // Didaktik-Modell v3: Sicherheit und Audit sind nicht mehr an die Lohnstufe gekoppelt.
    for (const id in S.minen){
      const m = S.minen[id];
      if (m.sicherheit === undefined) m.sicherheit = S.perks.leute1 ? 1 : 0;
      if (m.audit === undefined) m.audit = S.perks.ruf2 ? true : false;
    }
    // Ältere Spielstände kennen den Verkauf noch nicht:''',
"save migration")

replace_once(
'''      <div class="zeile"><span>${st.name}</span><b>${chf(land.lohn*st.faktor)}/Mt.</b></div>
      <div class="zeile"><span>Zielwert Zufriedenheit</span><b>${Math.round(st.ziel - (land.risiko-1)*8 + perkPlus("zufrieden"))} %</b></div>
    </div>

    <div class="karte">
      <h3>Zufriedenheit</h3>''',
'''      <div class="zeile"><span>${st.name}</span><b>${chf(land.lohn*st.faktor)}/Mt. <small style="color:var(--grau)">Spielwert</small></b></div>
      <div class="zeile"><span>Zielwert Zufriedenheit</span><b>${Math.round(st.ziel - (land.risiko-1)*8 + perkPlus("zufrieden"))} %</b></div>
    </div>

    <div class="karte">
      <h3>Sicherheit</h3>
      <div class="ort">Unabhängig vom Lohn: Ausrüstung und Schulung bestimmen den Sicherheitsstandard.</div>
      <div class="zeile"><span>Standard</span><b style="color:${m.sicherheit?"var(--gruen)":"var(--warn)"}">${m.sicherheit?"geschult & ausgerüstet":"Grundstandard · erhöhtes Risiko"}</b></div>
      ${m.sicherheit ? `<div class="notiz">Schutzstandard aktiv. Ein hoher Lohn ersetzt Sicherheit nicht – und umgekehrt.</div>`
        : `<button class="cta" data-tun="sicherheit" data-id="${id}" ${S.kasse>=60000?"":"disabled"}>${S.kasse>=60000?IK.schild:""}Sicherheitsstandard · ${chf(60000)}</button>`}
    </div>

    <div class="karte">
      <h3>Zufriedenheit</h3>''',
"mine safety card")

replace_once(
'''      m.stufe = neu; break; }
    case "raff-bau": {''',
'''      m.stufe = neu; break; }
    case "sicherheit": {
      const m = S.minen[id];
      if (!m || m.sicherheit) return;
      if (S.kasse < 60000) return;
      S.kasse -= 60000; S.ausgegeben += 60000;
      m.sicherheit = 1;
      m.zufriedenheit = Math.min(100, m.zufriedenheit + 4);
      rufAendern(2);
      notiz(`Sicherheitsstandard in <b>${MINEN.find(x=>x.id===id).ort}</b> eingeführt.`, "gut");
      funkenAn(t, ["#2fbe7e","#fff","#6fb8e0"], 18);
      break; }
    case "raff-bau": {''',
"safety action")

replace_once(
'''      S.perks[e2.perk.id] = true;
      if (e2.perk.sofort && e2.perk.sofort.ruf) rufAendern(e2.perk.sofort.ruf);''',
'''      S.perks[e2.perk.id] = true;
      if (e2.perk.id === "leute1") Object.values(S.minen).forEach(m => { m.sicherheit = 1; });
      if (e2.perk.id === "ruf2") Object.values(S.minen).forEach(m => { m.audit = true; });
      if (e2.perk.sofort && e2.perk.sofort.ruf) rufAendern(e2.perk.sofort.ruf);''',
"perk side effects")

replace_once(
'''text:`Die Arbeiterinnen und Arbeiter deiner ${MATERIAL[def.mat].name}-Mine legen die Arbeit nieder. Sie sagen: die Löhne reichen nicht zum Leben, und die Ausrüstung ist zu gefährlich. Die Förderung steht still. <b>Du musst entscheiden.</b>`,''',
'''text:`Die Arbeiterinnen und Arbeiter deiner ${MATERIAL[def.mat].name}-Mine legen die Arbeit nieder. Sie sagen: die Löhne reichen nicht zum Leben. Die Förderung steht still. <b>Du musst entscheiden.</b>`,''',
"strike text")

replace_once(
'''          {text:"Verhandeln und Sicherheitsausrüstung stellen", klein:"Einmalig CHF 60'000, Ruf steigt",
           tun(){ S.kasse -= 60000; S.ausgegeben += 60000; S.minen[id].zufriedenheit = 55; S.minen[id].stillBis = S.tag+5; rufAendern(10);
                  notiz(`Verhandlung in ${def.ort}: Ausrüstung bezahlt, Streik nach 5 Tagen beendet.`, "gut"); }},''',
'''          {text:"Verhandeln und einmalige Prämie zahlen", klein:"Einmalig CHF 60'000, löst den Lohnkonflikt vorläufig",
           tun(){ S.kasse -= 60000; S.ausgegeben += 60000; S.minen[id].zufriedenheit = 55; S.minen[id].stillBis = S.tag+5; rufAendern(5);
                  notiz(`Verhandlung in ${def.ort}: Prämie zugesagt, Streik nach 5 Tagen beendet.`, "gut"); }},''',
"strike alternative")

replace_once(
'''passt(){ return offeneMinen().some(id => S.minen[id].stufe === 0 && LAND[MINEN.find(x=>x.id===id).land].risiko >= 1.3) && S.tag > 90; },''',
'''passt(){ return offeneMinen().some(id => !S.minen[id].audit && !S.perks.ruf2 && LAND[MINEN.find(x=>x.id===id).land].risiko >= 1.3) && S.tag > 90; },''',
"child labour trigger")

replace_once(
'''const id = offeneMinen().find(i => S.minen[i].stufe === 0);''',
'''const id = offeneMinen().find(i => !S.minen[i].audit && !S.perks.ruf2 && LAND[MINEN.find(x=>x.id===i).land].risiko >= 1.3);''',
"child labour target")

replace_once(
'''           tun(){ S.kasse -= 90000; S.ausgegeben += 90000; S.minen[id].stufe = 2; rufAendern(14); notiz("Audit beauftragt, Löhne angehoben.", "gut"); }},''',
'''           tun(){ S.kasse -= 90000; S.ausgegeben += 90000; S.minen[id].audit = true; S.minen[id].sicherheit = 1;
                  S.minen[id].stufe = Math.max(1, S.minen[id].stufe); rufAendern(14);
                  notiz("Audit abgeschlossen: Nachweise, Sicherheitsmassnahmen und Korrekturplan umgesetzt.", "gut"); }},''',
"child labour remediation")

replace_once(
'''passt(){ return offeneMinen().some(id => S.minen[id].stufe === 0 && S.minen[id].arbeiter > 20) && Math.random() < .5; },''',
'''passt(){ return offeneMinen().some(id => !S.minen[id].sicherheit && S.minen[id].arbeiter > 20) && Math.random() < .5; },''',
"accident trigger")

replace_once(
'''const id = offeneMinen().find(i => S.minen[i].stufe === 0 && S.minen[i].arbeiter > 20);''',
'''const id = offeneMinen().find(i => !S.minen[i].sicherheit && S.minen[i].arbeiter > 20);''',
"accident target")

replace_once(
'''S.minen[id].stillBis = S.tag+10; S.minen[id].stufe = Math.max(1, S.minen[id].stufe); rufAendern(4);''',
'''S.minen[id].stillBis = S.tag+10; S.minen[id].sicherheit = 1; rufAendern(4);''',
"accident safety repair")

replace_once(
'''      if (S.ruf < 50){ S.kasse -= 180000; S.ausgegeben += 180000;
        return {passiv:true, text:"<b>Neues Lieferkettengesetz</b> – deine Firma kann die Herkunft nicht belegen. Busse: CHF 180'000.", art:"alarm"}; }
      S.nachfrageMod.board = {faktor:1.3, bis:S.tag+90};
      return {passiv:true, text:"<b>Neues Lieferkettengesetz</b> – deine Nachweise sind sauber. Grosskunden bestellen mehr Mainboards.", art:"gut"};''',
'''      if (!(S.perks.ruf1 || S.perks.ruf2)){ S.kasse -= 180000; S.ausgegeben += 180000;
        return {passiv:true, text:"<b>Neues Lieferkettengesetz</b> – dein Ruf hilft hier nicht: Es fehlen dokumentierte Nachweise. Busse: CHF 180'000.", art:"alarm"}; }
      S.nachfrageMod.board = {faktor:1.3, bis:S.tag+90};
      return {passiv:true, text:"<b>Neues Lieferkettengesetz</b> – Transparenz/Zertifizierung liefern die nötigen Nachweise. Grosskunden bestellen mehr Mainboards.", art:"gut"};''',
"compliance law")

replace_once(
'''      <div class="ort">Ziel ${ZIEL_RUF} · Ein tiefer Ruf senkt die Nachfrage nach allen deinen Produkten</div>
      <div class="zeile" style="margin-top:12px"><span>Verbleibende Tage</span><b>${Math.max(0, ZIEL_TAGE - S.tag)}</b></div>''',
'''      <div class="ort">Ziel ${ZIEL_RUF} · Ein tiefer Ruf senkt die Nachfrage nach allen deinen Produkten</div>
      <div class="zeile" style="margin-top:12px"><span>Lieferketten-Nachweise</span><b style="color:${S.perks.ruf2?"var(--gruen)":S.perks.ruf1?"var(--warn)":"var(--alarm)"}">${S.perks.ruf2?"zertifiziert":S.perks.ruf1?"dokumentiert":"fehlen"}</b></div>
      <div class="ort">Gesetze prüfen Nachweise – nicht deinen Ruf. Transparenzbericht oder Zertifizierung schaffen Compliance.</div>
      <div class="zeile" style="margin-top:12px"><span>Verbleibende Tage</span><b>${Math.max(0, ZIEL_TAGE - S.tag)}</b></div>''',
"goal compliance status")

replace_once(
'''  { id:"exportstopp", gewicht:6, wiederholbar:true, passt:()=>true, bau(){
      S.preisMod.seltene = {faktor:3.2, bis:S.tag+80};
      return {passiv:true, text:"<b>China beschränkt den Export Seltener Erden</b> – der Preis verdreifacht sich für 80 Tage. Wer eigene Minen und Raffinerien hat, verdient jetzt.", art:"warn"};
  }},
''',
'''  /* Exportpreis-Schocks bleiben als Realweltwissen im Wissensbereich.
     Ohne Rohstoffhandel hätten sie hier keine ehrliche Spielwirkung. */
''',
"remove export price event")

replace_once(
'''  { id:"taiwan", gewicht:5, wiederholbar:true, passt:()=>true, bau(){
      S.preisMod.silizium = {faktor:2.4, bis:S.tag+70};
      S.nachfrageMod.phone = {faktor:1.5, bis:S.tag+70};
      S.nachfrageMod.konsole = {faktor:1.5, bis:S.tag+70};
      return {passiv:true, text:"<b>Erdbeben bei Taiwan</b> – Chipfabriken stehen still. Silizium wird teuer, fertige Geräte sind gefragt wie nie.", art:"warn"};
  }},''',
'''  { id:"taiwan", gewicht:5, wiederholbar:true, passt:()=>true, bau(){
      S.nachfrageMod.phone = {faktor:1.5, bis:S.tag+70};
      S.nachfrageMod.konsole = {faktor:1.5, bis:S.tag+70};
      return {passiv:true, text:"<b>Erdbeben bei Taiwan</b> – Chipfabriken stehen still. Im Spiel wird kein Siliziumpreis gehandelt; modelliert wird nur die Knappheit fertiger Geräte: Phone- und Konsolen-Nachfrage +50 % für 70 Tage.", art:"warn"};
  }},''',
"taiwan honest effect")

replace_once(
'''  { id:"lithiumcrash", gewicht:6, wiederholbar:true, passt:()=>true, bau(){
      S.preisMod.lithium = {faktor:.45, bis:S.tag+70};
      return {passiv:true, text:"<b>Lithium-Preis bricht ein</b> – neue Minen weltweit liefern zu viel. Gut für Akku-Produzenten, schlecht für Lithium-Minen.", art:"warn"};
  }},
''',
'''  /* Lithiumpreis-Crash bleibt ein Realweltfakt im Wissensbereich;
     ohne Rohstoffhandel würde ein Preiseffekt hier nur eine Scheinmechanik erzeugen. */
''',
"remove lithium price event")

replace_once(
'''      return {passiv:true, text:`<b>US-Dollar ${schwach?"schwach":"stark"}</b> – Rohstoffe und Waren werden in Dollar gehandelt. Alle Preise ${schwach?"sinken":"steigen"} 50 Tage lang um ${Math.round(Math.abs(1-w)*100)} %.`, art:"warn"};''',
'''      return {passiv:true, text:`<b>US-Dollar ${schwach?"schwach":"stark"}</b> – im Spiel verändert der Dollarkurs nur die Verkaufspreise deiner fertigen Produkte: ${schwach?"−":"+"}${Math.round(Math.abs(1-w)*100)} % für 50 Tage. Rohstoffpreise werden nicht gehandelt.`, art:"warn"};''',
"dollar event wording")

replace_once(
'''      <div class="ort">Was du zahlst, entscheidet über Zufriedenheit und Ruf</div>''',
'''      <div class="ort">Lohn beeinflusst Zufriedenheit und Ruf. Sicherheit wird separat entschieden.</div>''',
"mine wage wording")

for forbidden in [
    "function matPreis(",
    "function marktBewegen(",
    "S.preisMod",
    "Weltpreis</th>",
    "mit Schutzausrüstung"
]:
    if forbidden in text:
        raise SystemExit(f"forbidden leftover: {forbidden}")

for required in [
    "Sicherheitsstandard",
    "Lieferketten-Nachweise",
    "Rohstoff-Weltmarktpreise sind reale Kontextfakten",
    "Zinkerz (Indium als Nebenprodukt)",
    "Spielmodell:"
]:
    if required not in text:
        raise SystemExit(f"required marker missing: {required}")

path.write_text(text, encoding="utf-8")
print("All didactic MUST FIX patches applied.")

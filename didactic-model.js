"use strict";

/* ============================================================
   DIDAKTISCHER MUST-FIX-PASS
   Die sichtbare Logik bleibt absichtlich klein:
   Rohstoff -> Raffination -> Material -> Produkt
   Lohn -> Zufriedenheit -> Streik
   Sicherheit -> Unfallrisiko
   Ruf -> Nachfrage
   Nachweise -> Lieferkettengesetz
   ============================================================ */

const DIDAKTIK_VERSION = 2;
const SICHERHEIT_BASIS_KOSTEN = 60000;

const ROHSTOFF_STANDARD = {
  kupfer: "Kupfererz",
  alu: "Bauxit",
  silizium: "Quarz / Rohsilizium",
  zinn: "Zinnerz (Kassiterit)",
  nickel: "Nickelerz",
  lithium: "Lithiumerz / Sole",
  kobalt: "Kupfer-/Kobalterz",
  silber: "Silbererz",
  seltene: "Erz mit Seltenen Erden",
  tantal: "Coltan",
  indium: "Zinkerz (Indium als Nebenprodukt)",
  gold: "Golderz"
};

const ROHSTOFF_ORT = {
  kolwezi: "Kupfer-/Kobalterz",
  katanga: "Kupfererz",
  rubaya: "Coltan",
  kigali: "Coltan",
  bayanobo: "Erz mit Seltenen Erden",
  jiangxi: "Quarz → Rohsilizium",
  liuzhou: "Zinkerz (Indium als Nebenprodukt)",
  sprucepine: "Quarz (Spielmodell)",
  mountainpass: "Erz mit Seltenen Erden",
  greenbushes: "Lithiumerz (Spodumen)",
  kalgoorlie: "Golderz",
  atacama: "Lithium-Sole",
  escondida: "Kupfererz",
  fresnillo: "Silbererz",
  sanrafael: "Zinnerz (Kassiterit)",
  bangka: "Zinnerz (Kassiterit)",
  sulawesi: "Nickelerz",
  obuasi: "Golderz",
  boke: "Bauxit",
  potosi: "Silbererz"
};

function rohstoffDerMine(def){
  return ROHSTOFF_ORT[def.id] || ROHSTOFF_STANDARD[def.mat] || "Rohstoff";
}

Object.entries(ROHSTOFF_STANDARD).forEach(([id, rohstoff]) => {
  if (MATERIAL[id]) MATERIAL[id].rohstoff = rohstoff;
});

/* Keine versteckte Länderwertung für Zufriedenheit oder Zwangsereignisse. */
Object.values(LAND).forEach(land => { land.risiko = 1; });

/* Lohn ist Lohn. Schutzhelm und Gefahrensymbol gehören nicht in die Lohnwahl. */
LOHNSTUFE[2].name = "deutlich über üblichem Lohn";
ikonLohn = function(stufe, aktiv){
  const n = stufe + 1;
  const gold = aktiv ? "#f5b73d" : "#cfc0a4";
  const rand = aktiv ? "#c48d1c" : "#b3a58a";
  let m = "";
  for (let i=0;i<n;i++){
    const x = 15 + (i-(n-1)/2)*5.5;
    m += `<circle cx="${x}" cy="11" r="5" fill="${gold}" stroke="${rand}" stroke-width="1.2"/>`;
    m += `<path d="M${x-1.8} 11h3.6" stroke="${rand}" stroke-width="1" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 30 22" aria-hidden="true">${m}</svg>`;
};

/* Sicherheit ist eine sichtbare Entscheidung pro Mine.
   Das Wissens-Upgrade macht diese Entscheidung günstiger, statt sie automatisch zu setzen. */
const leuteSeg = WISSEN.find(s => s.id === "leute");
if (leuteSeg){
  leuteSeg.titel = "Menschen, Löhne & Sicherheit";
  leuteSeg.kurz = "Lohn und Sicherheit sind zwei verschiedene Entscheidungen.";
  leuteSeg.text = [
    "Im Spiel beeinflusst der <b>Lohn</b> vor allem die Zufriedenheit. Sinkt sie stark, kann es zum Streik kommen.",
    "<b>Sicherheit ist separat:</b> Schutz, Ausrüstung und Schulung senken das Unfallrisiko. Ein hoher Lohn ersetzt keine Sicherheitsmassnahmen – und gute Sicherheit ersetzt keinen fairen Lohn."
  ];
  const sicherPerk = leuteSeg.perks.find(p => p.id === "leute1");
  if (sicherPerk){
    sicherPerk.titel = "Sicherheitsprogramm";
    sicherPerk.text = "Ein gemeinsamer Standard macht Sicherheitsausbauten in deinen Minen einfacher und günstiger.";
    sicherPerk.wirkung = ["Sicherheitsausbau −50 % Kosten"];
    delete sicherPerk.plus;
    sicherPerk.mult = {sicherheit:0.50};
  }
}

const marktSeg = WISSEN.find(s => s.id === "markt");
if (marktSeg){
  marktSeg.kurz = "Nachfrage, Lager und Dollarkurs bei Fertigwaren.";
  marktSeg.text = [
    "Ware verkauft sich nicht von allein. Entweder du verkaufst selber, oder dein Verkaufsteam erledigt das jeden Tag.",
    "Das Spiel simuliert Preis und Nachfrage deiner <b>Fertigwaren</b>. Weltmarktpreise der Rohstoffe sind Hintergrundwissen – du kaufst und verkaufst im Spiel keine Rohstoffe am Markt."
  ];
}

const rufSeg = WISSEN.find(s => s.id === "ruf");
if (rufSeg){
  rufSeg.titel = "Ruf & Nachweise";
  rufSeg.kurz = "Ruf beeinflusst Nachfrage. Nachweise belegen deine Lieferkette.";
  rufSeg.text = [
    "Dein <b>Ruf</b> zeigt, wie Kundinnen und Kunden deine Firma wahrnehmen. Ein tiefer Ruf senkt die Nachfrage nach deinen Produkten.",
    "<b>Nachweise</b> sind etwas anderes: Sie zeigen, ob du die Herkunft deiner Rohstoffe dokumentieren kannst. Ein Lieferkettengesetz prüft diese Nachweise – nicht deinen Ruf."
  ];
}

const modellSeg = WISSEN.find(s => s.id === "modell");
if (modellSeg){
  modellSeg.text = [
    "Erzwelt ist ein <b>Spielmodell</b>. Mengen, Kosten, Löhne und Rezepte sind bewusst vereinfacht und dienen dem Spiel – sie sind keine aktuellen Statistiken.",
    "Der Kern des Modells steht in <code>erzwelt-core.html</code>. Die didaktischen Korrekturen stehen in <code>didactic-model.js</code>, <code>didactic-events.js</code> und <code>didactic-ui.js</code>. Vergleiche: Welche Regeln wurden vereinfacht, damit Ursache und Wirkung klar bleiben?"
  ];
  modellSeg.fakten = [
    "Spielwerte sind gerundet und vereinfacht; reale Lieferketten haben deutlich mehr Faktoren.",
    "Die Reihenfolge im Tagesschritt ist Absicht: fördern, raffinieren, produzieren, verkaufen.",
    "Rohstoff-Weltmarktpreise werden im Spiel bewusst nicht simuliert."
  ];
  if (modellSeg.formeln){
    modellSeg.formeln = modellSeg.formeln.map(f => [f[0].replace("Material aus Erz", "Material aus Rohstoff"), f[1].replace("Erz ×", "Rohstoff ×")]);
  }
}

const ketteSeg = WISSEN.find(s => s.id === "kette");
if (ketteSeg){
  ketteSeg.kurz = "Rohstoff → Raffinerie → Material → Fabrik → Markt.";
  ketteSeg.text = [
    "Aus einer Rohstoffquelle kommt zunächst <b>Rohstoff</b>: zum Beispiel Bauxit, Coltan oder Kupfererz. Die <b>Raffinerie</b> macht daraus nutzbares Material wie Aluminium, Tantal oder Kupfer. Erst die <b>Fabrik</b> baut daraus ein Produkt.",
    "Reisst ein Glied, steht die Kette. Eine Rohstoffquelle ohne Raffinerie liefert noch kein Material für die Fabrik."
  ];
}

const chemieSeg = WISSEN.find(s => s.id === "chemie");
if (chemieSeg){
  chemieSeg.kurz = "Aus Rohstoffen werden nutzbare Materialien.";
  chemieSeg.text = [
    "Die <b>Ausbeute</b> ist im Spiel ein vereinfachter Wert: Sie bestimmt, wie viel nutzbares Material aus einer Einheit Rohstoff entsteht. Der Rest steht für Abraum und Verluste der Verarbeitung.",
    "Nicht nur der Abbau, auch die Raffination kann zum Engpass einer Lieferkette werden."
  ];
}

/* Bestehende Spielstände erweitern, ohne Progress zu verlieren. */
function didaktikMigration(){
  if (!S || typeof S !== "object") return;
  if (!S.preisMod || typeof S.preisMod !== "object") S.preisMod = {};
  S.preisMod = {};
  for (const id in S.minen){
    const m = S.minen[id];
    if (m.sicherheit === undefined) m.sicherheit = false;
    if (m.nachweis === undefined) m.nachweis = false;
  }
  S.didaktikVersion = DIDAKTIK_VERSION;
}

function nachweisStatus(){
  if (perkHat("ruf2")) return {stufe:2, text:"zertifiziert"};
  if (perkHat("ruf1")) return {stufe:1, text:"dokumentiert"};
  const ids = offeneMinen();
  if (ids.length && ids.every(id => S.minen[id] && S.minen[id].nachweis)) return {stufe:1, text:"dokumentiert"};
  return {stufe:0, text:"fehlen"};
}

/* Rohstoff-Weltmarktpreise sind kein Spielsystem mehr. */
marktBewegen = function(){};
matPreis = function(k){ return MATERIAL[k].preis || 0; };

/* Ruf wird nicht mehr jeden Monat heimlich aus dem Durchschnittslohn berechnet. */
rufAnpassen = function(){};
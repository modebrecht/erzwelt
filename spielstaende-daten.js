"use strict";

const SPIELSTAND_FORMAT = "erzwelt-save";
const SPIELSTAND_VERSION = 1;
const SPIELSTAND_DATEIGRENZE = 1024 * 1024;
const SPIELSTAND_NUMMERN = [1, 2, 3];
const SPIELSTAND_NAME_MAX = 60;
const SPIELSTAND_LETZTER = "erzwelt_slots_letzter_v1";
const SPIELSTAND_LEGACY = "erzwelt_slots_alt_v1";
const legacySchluessel = [SCHLUESSEL, "erzwelt_v1"];
const mineIds = MINEN.map(mine => mine.id);
const raffIds = RAFF_ORTE.map(ort => ort.id);
const materialIds = Object.keys(MATERIAL);
const produktIds = Object.keys(PRODUKT);
const wissenIds = WISSEN.map(feld => feld.id);
const slotSchluessel = id => "erzwelt_slot_v1_" + id;
const slotStandardname = id => textVon("slot.standardname", {id});

function spielstandFordern(ok, feld){
  if (!ok) throw new Error(textVon("daten.ungueltig", {feld}));
}
const spielstandObjekt = wert => wert !== null && typeof wert === "object" && !Array.isArray(wert);
const spielstandZahl = (wert, min = 0, max = 1e15) =>
  Number.isFinite(wert) && wert >= min && wert <= max;
const spielstandGanzzahl = (wert, min = 0, max = 10000000) =>
  Number.isInteger(wert) && spielstandZahl(wert, min, max);
const spielstandTag = wert => spielstandGanzzahl(wert, 1);
const spielstandText = (wert, max) => typeof wert === "string" && wert.length <= max;
const spielstandBoolean = wert => typeof wert === "boolean";
const spielstandDatum = datum => spielstandText(datum, 30) &&
  /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(datum) &&
  Number.isFinite(Date.parse(datum)) && new Date(datum).toISOString() === datum;

function spielstandName(wert){
  spielstandFordern(spielstandText(wert, SPIELSTAND_NAME_MAX) && !/[\x00-\x1f\x7f]/.test(wert), "Name");
  const name = wert.trim();
  spielstandFordern(name.length > 0, "Name");
  return name;
}

function spielstandBaumPruefen(wurzel){
  let anzahl = 0;
  function besuche(wert, tiefe){
    spielstandFordern(++anzahl <= 30000 && tiefe <= 16, "Dateistruktur");
    if (wert === null || typeof wert === "boolean") return;
    if (typeof wert === "number") return spielstandFordern(spielstandZahl(wert, -1e15), "Zahlenwert");
    if (typeof wert === "string") return spielstandFordern(spielstandText(wert, 8192), "Textlänge");
    spielstandFordern(typeof wert === "object", "Datenstruktur");
    for (const [schluessel, kind] of Object.entries(wert)){
      spielstandFordern(!["__proto__", "prototype", "constructor"].includes(schluessel), "Eigenschaft");
      besuche(kind, tiefe + 1);
    }
  }
  besuche(wurzel, 0);
}

function spielstandTabelle(wert, ids, pruefen){
  return spielstandObjekt(wert) && Object.entries(wert).every(([id, eintrag]) =>
    (!ids || ids.includes(id)) && pruefen(eintrag));
}

function spielstandFelder(wert, pflicht, optional = {}){
  return spielstandObjekt(wert) &&
    Object.entries(pflicht).every(([feld, pruefen]) => Object.hasOwn(wert, feld) && pruefen(wert[feld])) &&
    Object.entries(optional).every(([feld, pruefen]) => !Object.hasOwn(wert, feld) || pruefen(wert[feld]));
}

const spielstandFinanz = wert => spielstandZahl(wert, -1e15);
const spielstandRuf = wert => spielstandZahl(wert, 0, 100);
const spielstandSchwierigkeit = wert => wert === null || (typeof wert === "string" && Object.hasOwn(SCHWIERIGKEIT, wert));
const spielstandMod = wert => spielstandFelder(wert, {faktor:n => spielstandZahl(n, 0, 100), bis:spielstandTag});
const spielstandMenge = wert => spielstandZahl(wert, -1e-7);
const spielstandMine = wert => spielstandFelder(wert, {
  arbeiter:spielstandGanzzahl, stufe:n => spielstandGanzzahl(n, 0, 2), zufriedenheit:spielstandRuf,
  stillBis:spielstandGanzzahl, malus:n => spielstandZahl(n, 0, 100), malusBis:spielstandGanzzahl
}, {ausbau:n => spielstandGanzzahl(n, 0, 10), sicherheit:spielstandBoolean, nachweis:spielstandBoolean});
const spielstandRaff = wert => spielstandFelder(wert, {arbeiter:spielstandGanzzahl},
  {ausbau:n => spielstandGanzzahl(n, 0, 10)});
const spielstandFabrik = wert => spielstandFelder(wert, {
  produkt:id => produktIds.includes(id), land:id => FAB_ORTE.includes(id),
  arbeiter:spielstandGanzzahl, restbau:spielstandGanzzahl
});
const spielstandLeistungsdaten = wert => spielstandFelder(wert, {
  version:n => n === 1, abTag:spielstandTag, vollstaendig:spielstandBoolean,
  produkte:tab => spielstandTabelle(tab, produktIds, zeile =>
    spielstandFelder(zeile, {hergestellt:spielstandZahl, verkauft:spielstandZahl, erloes:spielstandZahl}))
});
const spielstandEnde = wert => wert === null || spielstandFelder(wert, {
  grund:id => ["etappe", "insolvenz"].includes(id), etappe:spielstandTag, gewinn:spielstandFinanz,
  ruf:spielstandRuf, geschafft:spielstandBoolean
});

// Meldungen enthalten spielinterne Formatierung. Alle Knoten und Attribute werden neu aufgebaut.
function spielstandMeldung(text){
  const quelle = document.createElement("template");
  quelle.innerHTML = text;
  const ausgabe = document.createElement("div");
  const format = ["B", "STRONG", "I", "EM", "SMALL", "BR", "SPAN"];
  const klassen = ["mb-kopf", "mb-plus", "mb-minus", "mb-zahl", "mb-trend", "mb-zeile", "mb-klein"];
  function kopiere(knoten, ziel){
    if (knoten.nodeType === Node.TEXT_NODE){
      ziel.append(document.createTextNode(knoten.data));
    } else if (knoten.nodeType === Node.ELEMENT_NODE && format.includes(knoten.tagName)){
      const el = document.createElement(knoten.tagName.toLowerCase());
      if (el.tagName === "SPAN"){
        el.className = [...knoten.classList].filter(klasse => klassen.includes(klasse)).join(" ");
        if (!el.className) el.removeAttribute("class");
        if (el.classList.contains("mb-trend") && spielstandText(knoten.getAttribute("title"), 120)){
          el.title = knoten.getAttribute("title");
        }
      }
      for (const kind of knoten.childNodes) kopiere(kind, el);
      ziel.append(el);
    } else if (knoten.nodeType === Node.ELEMENT_NODE && !["SCRIPT", "STYLE", "TEMPLATE"].includes(knoten.tagName)){
      ziel.append(document.createTextNode(knoten.textContent));
    }
  }
  // Begrenze auch die Baumtiefe von als Text eingebettetem HTML.
  spielstandFordern(quelle.content.querySelectorAll("* * * * * * * * *").length === 0, "Meldungsformat");
  for (const knoten of quelle.content.childNodes) kopiere(knoten, ausgabe);
  return ausgabe.innerHTML;
}

function spielstandZustand(daten, alt = false){
  spielstandBaumPruefen(daten);
  const pflicht = {
    tag:spielstandTag, kasse:spielstandFinanz, ruf:spielstandRuf, ausgegeben:spielstandZahl, eingenommen:spielstandZahl,
    arbeiterGesamt:spielstandGanzzahl, tutorial:n => spielstandGanzzahl(n, 0, 100),
    minen:tab => spielstandTabelle(tab, mineIds, spielstandMine),
    raff:tab => spielstandTabelle(tab, raffIds, spielstandRaff),
    fabriken:liste => Array.isArray(liste) && liste.length <= 200 && liste.every(spielstandFabrik),
    erz:tab => spielstandTabelle(tab, materialIds, spielstandMenge),
    mat:tab => spielstandTabelle(tab, materialIds, spielstandMenge),
    ware:tab => spielstandTabelle(tab, produktIds, spielstandMenge),
    log:liste => Array.isArray(liste) && liste.length <= 60 && liste.every(e =>
      spielstandFelder(e, {tag:spielstandTag, text:t => spielstandText(t, 8192),
        art:id => typeof id === "string" && /^[a-z-]{0,24}$/.test(id)}))
  };
  const neuer = {
    schwierigkeit:spielstandSchwierigkeit, etappe:spielstandTag, etappeStartEingenommen:spielstandZahl,
    etappeStartAusgegeben:spielstandZahl, hilfsBonus:spielstandBoolean,
    verkaeufer:spielstandGanzzahl, handverkaufTag:spielstandGanzzahl, verkauftSelber:spielstandBoolean,
    perks:tab => spielstandTabelle(tab, Object.keys(PERK_INDEX), spielstandBoolean),
    preisMod:tab => spielstandTabelle(tab, materialIds, spielstandMod),
    nachfrageMod:tab => spielstandTabelle(tab, produktIds, spielstandMod),
    globalMod:liste => Array.isArray(liste) && liste.every(e =>
      spielstandFelder(e, {art:id => ["dollar", "hafen"].includes(id), wert:n => spielstandZahl(n, 0, 100), bis:spielstandTag})),
    erledigt:tab => spielstandTabelle(tab, null, v => spielstandBoolean(v) || spielstandGanzzahl(v)),
    ende:spielstandEnde, leistungsdaten:spielstandLeistungsdaten
  };
  const optional = {
    startTeam:spielstandGanzzahl, einfuehrung:spielstandGanzzahl, investStartWert:spielstandZahl,
    verkaufsBonus:n => [40, 60].includes(n),
    tierAlbum:tab => spielstandTabelle(tab, null, n => spielstandGanzzahl(n, 1, 9999)) && Object.keys(tab).length <= 100,
    produktForschung:f => !!window.__erzweltProduktentwicklung && window.__erzweltProduktentwicklung.pruefen(f, daten.tag),
    einstiegGesehen:spielstandBoolean, didaktikVersion:spielstandGanzzahl, shouldDidaktikVersion:spielstandGanzzahl,
    produktEntdeckungen:tab => spielstandTabelle(tab, produktIds, e => spielstandFelder(e, {
      status:id => ["offen", "gesehen"].includes(id)
    }, {ersterTag:n => spielstandTag(n) && n <= daten.tag}) && (e.status === "gesehen" || Object.hasOwn(e, "ersterTag"))),
    wissenGesehen:tab => spielstandTabelle(tab, wissenIds, spielstandBoolean),
    wissenQuiz:tab => spielstandTabelle(tab, wissenIds, n => spielstandGanzzahl(n, 0, 2)),
    geschichte:tab => spielstandTabelle(tab, ["potosi", "kongo", "selten", "konflikt", "schweiz"], n => spielstandGanzzahl(n, 0, 2)),
    wissenQuestFlow:q => spielstandFelder(q, {}, {
      version:spielstandGanzzahl, startTag:spielstandTag, flags:tab => spielstandTabelle(tab, null, spielstandBoolean),
      collected:tab => spielstandTabelle(tab, null, spielstandBoolean),
      fields:tab => spielstandTabelle(tab, wissenIds, spielstandBoolean),
      geologieBesucht:liste => Array.isArray(liste) && liste.every(id => mineIds.includes(id))
    }),
    monatsBilanz:m => spielstandFelder(m, {ein:spielstandZahl, aus:spielstandZahl, letzt:v => v === null || spielstandFinanz(v)}),
    monatsVerlauf:liste => Array.isArray(liste) && liste.length <= 6 && liste.every(e =>
      spielstandFelder(e, {tag:spielstandTag, wert:spielstandFinanz})),
    monatsBuch:liste => Array.isArray(liste) && liste.length <= 240 && liste.every(e =>
      spielstandFelder(e, {tag:spielstandTag, ein:spielstandZahl, betrieb:spielstandZahl, aus:spielstandZahl, kasse:spielstandFinanz})),
    zertifikatProfil:p => spielstandFelder(p, {vorname:t => spielstandText(t, 120)}),
    offenesEreignis:e => spielstandFelder(e, {id:id => ["protest", "unglueck", "kinderarbeit"].includes(id),
      mine:id => typeof id === "string" && spielstandObjekt(daten.minen) && Object.hasOwn(daten.minen, id)})
  };
  spielstandFordern(spielstandObjekt(daten), "Spielzustand");
  for (const [feld, pruefen] of Object.entries({...pflicht, ...neuer, ...optional})){
    const vorhanden = Object.hasOwn(daten, feld);
    spielstandFordern(vorhanden ? pruefen(daten[feld]) :
      !Object.hasOwn(pflicht, feld) && (alt || !Object.hasOwn(neuer, feld)), feld);
  }
  // Unbekannte Felder bleiben in der Quelldatei. Ein neuer Datentyp braucht eine eigene Validierung.
  const zustand = {};
  for (const feld of Object.keys({...pflicht, ...neuer, ...optional})){
    if (Object.hasOwn(daten, feld)) zustand[feld] = daten[feld];
  }
  zustand.log = zustand.log.map(({tag, text, art}) => ({tag, text:spielstandMeldung(text), art}));
  return zustand;
}

function spielstandLesen(roh){
  if (roh.length > SPIELSTAND_DATEIGRENZE) throw new Error(textVon("datei.zuGross"));
  try { return JSON.parse(roh); }
  catch (e){ throw new Error(textVon("datei.keinJson")); }
}

function spielstandDatei(roh){
  const paket = spielstandLesen(roh);
  spielstandFordern(spielstandObjekt(paket) && paket.saveFormat === SPIELSTAND_FORMAT, "Dateiformat");
  if (paket.schemaVersion !== SPIELSTAND_VERSION) throw new Error(textVon("datei.version"));
  spielstandFordern(spielstandObjekt(paket.slot) && spielstandDatum(paket.slot.savedAt), "Speicherzeit");
  return {name:spielstandName(paket.slot.name), savedAt:paket.slot.savedAt,
    state:spielstandZustand(paket.gameState)};
}

function slotLesen(id){
  let roh;
  try {
    roh = SPEICHER.lies(slotSchluessel(id));
    if (roh === null) return {id, roh};
    const daten = spielstandLesen(roh);
    spielstandFordern(spielstandObjekt(daten) && daten.version === SPIELSTAND_VERSION && spielstandDatum(daten.savedAt), "Speicherplatz");
    return {id, roh, name:spielstandName(daten.name), savedAt:daten.savedAt,
      legacy:daten.legacy === true, state:spielstandZustand(daten.state)};
  } catch (e){ return {id, roh, fehler:true, name:slotStandardname(id)}; }
}

function slotSchreiben(slot, daten){
  const key = slotSchluessel(slot.id);
  const roh = JSON.stringify({...daten, version:SPIELSTAND_VERSION});
  if (roh.length > SPIELSTAND_DATEIGRENZE) throw new Error(textVon("speichern.zuGross"));
  try {
    if (SPEICHER.lies(key) !== slot.roh) throw new Error(textVon("slot.geaendert"));
    SPEICHER.schreib(key, roh);
    if (SPEICHER.lies(key) !== roh) throw new Error(textVon("speichern.nichtGeprueft"));
  } catch (e){ throw new Error(textVon("speichern.nichtGesichertPlatz") + (e.name === "Error" ? e.message : "")); }
  return roh;
}

function alteSpielstaendeUebernehmen(){
  try {
    if (SPEICHER.lies(SPIELSTAND_LEGACY) === "1") return "";
    const slots = SPIELSTAND_NUMMERN.map(slotLesen);
    const vorhanden = slots.find(slot => slot.legacy && slot.state);
    const leer = slots.find(slot => slot.roh === null);
    const kandidaten = [];
    let unlesbar = false;
    if (!vorhanden){
      for (const key of legacySchluessel){
        const roh = SPEICHER.lies(key);
        if (!roh) continue;
        try { kandidaten.push(spielstandZustand(spielzustandAufbauen(spielstandZustand(spielstandLesen(roh), true)))); }
        catch (e){ unlesbar = true; }
      }
      const state = kandidaten.sort((a, b) => b.tag - a.tag)[0];
      if (!state) return unlesbar ? textVon("alt.beschaedigt") : "";
      if (!leer) return textVon("alt.keinPlatz");
      slotSchreiben(leer, {name:slotStandardname(leer.id), savedAt:new Date().toISOString(), state, legacy:true});
      if (!slotLesen(leer.id).state) throw new Error();
    }
    SPEICHER.schreib(SPIELSTAND_LEGACY, "1");
    return textVon(unlesbar ? "alt.teilweise" : "alt.uebernommen");
  } catch (e){ return textVon("alt.fehler"); }
}

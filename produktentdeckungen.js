"use strict";

function produktentdeckungenInitialisieren(){
  if (S.produktEntdeckungen) return;
  const buchungen = S.leistungsdaten?.produkte || {};
  const historisch = S.leistungsdaten?.vollstaendig !== true;
  S.produktEntdeckungen = {};
  for (const id of Object.keys(PRODUKT)){
    const bekannt = buchungen[id]?.hergestellt > 0 || buchungen[id]?.verkauft > 0 || S.ware[id] > 0;
    const alteFabrik = historisch && S.fabriken.some(f => f.produkt === id && f.restbau === 0 && f.arbeiter > 0);
    if (bekannt || alteFabrik) S.produktEntdeckungen[id] = {status:"gesehen"};
  }
}

{
  const buchungVorher = produktBuchen;
  produktBuchen = function(produkt, hergestellt, verkauft = 0, erloes = 0){
    produktentdeckungenInitialisieren();
    buchungVorher(produkt, hergestellt, verkauft, erloes);
    if (hergestellt > 0 && Object.hasOwn(PRODUKT, produkt) && !S.produktEntdeckungen[produkt]){
      S.produktEntdeckungen[produkt] = {status:"offen", ersterTag:S.tag};
    }
  };
}

const produktEntdeckungsText = {
  motor:"Beim E-Bike wandelt der Motor Strom aus dem Akku in Bewegung um.",
  phone:"Im Smartphone arbeiten Bildschirm, Akku und winzige Schaltkreise zusammen.",
  board:"Das Mainboard verbindet die elektronischen Bauteile miteinander.",
  konsole:textVon("produktentdeck.chips-berechnen-das-spielbild"),
  tv:textVon("produktentdeck.der-bildschirm-nutzt-sehr"),
  akku:"Der Akku speichert Energie und versorgt den E-Bike-Motor mit Strom."
};

function entdeckungsRezept(rezept){
  const materialien = Object.keys(rezept);
  const liste = ids => `<ul class="entdeckung-materialien">${ids.map(id => {
    const m = MATERIAL[id];
    return `<li><span style="--materialfarbe:${m.farbe}">${m.sym}</span>${m.name}</li>`;
  }).join("")}</ul>`;
  return liste(materialien.slice(0, 4)) + (materialien.length > 4
    ? textVon("produktentdeck.alle-materialien-anzeigen", {p1:(liste(materialien.slice(4)))}) : "");
}

function produktentdeckungZeigen(tempoDanach = tempo, fokusDanach = document.activeElement){
  if (!spielAktiv || !S.schwierigkeit || S.ende || modalOffen || !$("#einst").hidden || !$("#lupe").hidden) return false;
  const offen = Object.entries(S.produktEntdeckungen || {})
    .filter(([, eintrag]) => eintrag.status === "offen")
    .sort((a, b) => a[1].ersterTag - b[1].ersterTag)[0];
  if (!offen) return false;
  const [id, eintrag] = offen;
  const produkt = PRODUKT[id];
  const kabel = id === "kabel";
  const titel = kabel ? textVon("produktentdeck.dein-erstes", {p1:(produkt.name)}) : `${produkt.name} erstmals hergestellt`;
  const beschreibung = kabel
    ? textVon("produktentdeck.aus-drei-materialien-hast")
    : produktEntdeckungsText[id] || produkt.info || textVon("produktentdeck.deine-fabrik-hat-das");
  const rezept = kabel ? kabelQuerschnitt() : entdeckungsRezept(produkt.rezept);
  tempoSetzen(0);
  $("#spiel").inert = true;
  dialogZeigen({
    art:textVon("produktentdeck.produkt-entdeckt"), titel,
    text:`<div class="entdeckung" data-produkt="${id}"><p>${beschreibung}</p>${rezept}</div>`,
    wahlen:[{text:textVon("intro.weiter"), tun:() => { eintrag.status = "gesehen"; }}],
    nachWahl:() => {
      if (produktentdeckungZeigen(tempoDanach, fokusDanach)) return;
      $("#spiel").inert = false;
      tempoSetzen(tempoDanach);
      const fokus = fokusDanach?.isConnected && fokusDanach.closest("#spiel") ? fokusDanach : $("#einstauf");
      fokus.focus({preventScroll:true});
    }
  });
  return true;
}

{
  const stil = document.createElement("style");
  stil.textContent = `
    .entdeckung p{margin:0 0 10px}
    .entdeckung-materialien{list-style:none;margin:8px 0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
    .entdeckung-materialien li{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:9px;
      background:var(--papier2);font-size:var(--f0);font-weight:800}
    .entdeckung-materialien span{border:2px solid var(--materialfarbe);min-width:26px;text-align:center;border-radius:5px}
    .entdeckung details{font-size:var(--f0)}
    .entdeckung summary{display:list-item;padding:9px 0;cursor:pointer}
  `;
  document.head.append(stil);
}

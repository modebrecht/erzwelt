"use strict";
/* Kurztexte für Sek B: lange Erklärsätze auf den Seiten und in den
   Blättern kürzer machen, Doppeltes weglassen. Lerninhalte im Wissen
   (Lupe) bleiben unverändert. Nur Text, keine Spiellogik. */
(function(){
  const VERSION = 1;
  /* Teiltext → kürzere Fassung. Leere Fassung = Element weglassen. */
  const KUERZER = [
    // Wissen
    [textVon("kurztexte.das-spiel-pausiert-hier"), "Die Zeit steht, solange du hier liest."],
    [textVon("kurztexte.wissen-ist-frei-zugaenglich"), "Lesen ist gratis. Nur Verbesserungen kosten Geld."],
    // Markt
    [textVon("kurztexte.einmal-pro-tag-kannst"), "Selbst verkaufen: einmal pro Tag. Das Verkaufsteam verkauft jeden Tag."],
    [textVon("kurztexte.einmal-pro-tag-kannst-2"), "Selbst verkaufen: einmal pro Tag. Das Verkaufsteam verkauft jeden Tag."],
    [textVon("kurztexte.produzierst-du-deutlich-mehr"), textVon("kurztexte.mehr-produziert-als-gekauft")],
    // Team
    [textVon("kurztexte.nicht-eingeteilte-leute-kosten"), "Leute ohne Aufgabe kosten trotzdem CHF 200 pro Monat."],
    // Ziel
    [textVon("kurztexte.tage-kommt-eine-abrechnung"), textVon("kurztexte.tage-abrechnung-danach-geht")],
    [textVon("kurztexte.ein-niedriger-ruf-senkt"), textVon("kurztexte.tiefer-ruf-weniger-nachfrage")],
    ["Noch keine Verbesserung finanziert. Im Reiter Wissen siehst du, welche Voraussetzungen noch fehlen.", textVon("kurztexte.noch-keine-im-reiter")],
    // Blatt Rohstoffquelle
    [textVon("kurztexte.jede-stufe-bringt-und"), textVon("kurztexte.jede-stufe-jede-stufe")],
    [textVon("kurztexte.sicherheitsmassnahmen-senken-das-unfallrisiko"), textVon("kurztexte.senkt-das-unfallrisiko-der")],
    ["Lohn beeinflusst die Zufriedenheit.", ""],
    ["Sicherheitsmassnahmen beeinflussen das Unfallrisiko.", ""]
  ];

  function kuerzen(root){
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const weg = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()){
      const v = n.nodeValue;
      if (!v || v.length < 20) continue;
      for (const [alt, neu] of KUERZER){
        if (!v.includes(alt)) continue;
        if (neu === "" && v.trim() === alt){ weg.push(n.parentElement); break; }
        n.nodeValue = v.replace(alt, neu);
        break;
      }
    }
    for (const el of weg) if (el && el !== root) el.remove();
  }

  /* Markt: Rohstoffe ohne eigene Quelle in einer Zeile zusammenfassen */
  function rohstoffTabelle(root){
    const karte = [...(root?.querySelectorAll(".karte") || [])].find(k => k.querySelector("h3")?.textContent.trim() === "Deine Rohstoffquellen");
    const tabelle = karte?.querySelector("table");
    if (!tabelle || tabelle.dataset.kurz) return;
    let ohne = 0;
    for (const tr of [...tabelle.querySelectorAll("tr")].slice(1)){
      const td = tr.querySelectorAll("td");
      if (td.length < 4) continue;
      const leer = td[1].textContent.trim() === "–" && !+td[2].textContent.replace(/[^\d]/g, "") && !+td[3].textContent.replace(/[^\d]/g, "");
      if (leer){ tr.remove(); ohne++; }
    }
    if (ohne){
      const tr = document.createElement("tr");
      tr.innerHTML = textVon("kurztexte.weitere-rohstoffe-noch-keine", {p1:(ohne)});
      tabelle.appendChild(tr);
    }
    tabelle.dataset.kurz = "1";
  }

  /* Ziel: Meldungsliste weglassen – dafür gibt es oben «Verlauf» */
  function meldungenWeg(root){
    const karte = [...(root?.querySelectorAll(".karte") || [])].find(k => k.querySelector(":scope > h3")?.textContent.trim() === "Meldungen");
    karte?.remove();
  }

  /* Reiter nach jedem Füllen kürzen (module/seiten.js) */
  (window.__erzweltSeitenTeile ||= {}).kuerzen = function(){
    const seite = document.getElementById("seite");
    kuerzen(seite); rohstoffTabelle(seite); meldungenWeg(seite);
  };
  /* Blätter nach jedem Füllen kürzen (module/blatt.js) */
  (window.__erzweltBlattTeile ||= {}).kuerzen = kuerzen;
  window.__erzweltKurztexte = {version:VERSION, anzahl:KUERZER.length};
})();

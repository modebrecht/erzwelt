"use strict";
/* Kurztexte für Sek B: lange Erklärsätze auf den Seiten und in den
   Blättern kürzer machen, Doppeltes weglassen. Lerninhalte im Wissen
   (Lupe) bleiben unverändert. Nur Text, keine Spiellogik. */
(function(){
  const VERSION = 1;
  /* Teiltext → kürzere Fassung. Leere Fassung = Element weglassen. */
  const KUERZER = [
    // Wissen
    ["Das Spiel pausiert hier automatisch. Beim Verlassen läuft es im vorherigen Tempo weiter.", "Die Zeit steht, solange du hier liest."],
    ["Wissen ist frei zugänglich. Geld wird nur für Verbesserungen verwendet, deren Voraussetzung im Spiel bereits erfüllt ist.", "Lesen ist gratis. Nur Verbesserungen kosten Geld."],
    // Markt
    ["Einmal pro Tag kannst du selbst verkaufen. Für den täglichen Verkauf setzt du Leute im Verkaufsteam ein.", "Selbst verkaufen: einmal pro Tag. Das Verkaufsteam verkauft jeden Tag."],
    ["Einmal pro Tag kannst du selbst verkaufen. Wer das nicht jeden Tag machen will, stellt Verkäuferinnen an.", "Selbst verkaufen: einmal pro Tag. Das Verkaufsteam verkauft jeden Tag."],
    ["Produzierst du deutlich mehr als nachgefragt wird, füllt sich das Lager und der Verkaufspreis sinkt.", "Mehr produziert als gekauft wird? Dann füllt sich das Lager und der Preis sinkt."],
    // Team
    ["Nicht eingeteilte Leute kosten CHF 200 pro Monat. Stell nur so viele an, wie du beschäftigen kannst.", "Leute ohne Aufgabe kosten trotzdem CHF 200 pro Monat."],
    // Ziel
    ["Tage kommt eine Abrechnung – danach kannst du weiterspielen", "Tage Abrechnung, danach geht es weiter"],
    ["Ein niedriger Ruf senkt die Nachfrage nach allen deinen Produkten", "Tiefer Ruf = weniger Nachfrage"],
    ["Noch keine Verbesserung finanziert. Im Reiter Wissen siehst du, welche Voraussetzungen noch fehlen.", "Noch keine. Im Reiter Wissen siehst du, was dafür fehlt."],
    // Blatt Rohstoffquelle
    ["Jede Stufe bringt +5 % und kostet mehr als die vorherige. Jede zehnte Stufe verdoppelt die Ausbringung.", "Jede Stufe +5 %, jede 10. Stufe verdoppelt."],
    ["Sicherheitsmassnahmen senken das Unfallrisiko – unabhängig vom Lohn.", "Senkt das Unfallrisiko. Der Lohn ändert daran nichts."],
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
      tr.innerHTML = `<td colspan="4" style="color:var(--grau);font-weight:700">+ ${ohne} weitere Rohstoffe: noch keine Quelle</td>`;
      tabelle.appendChild(tr);
    }
    tabelle.dataset.kurz = "1";
  }

  /* Ziel: Meldungsliste weglassen – dafür gibt es oben «Verlauf» */
  function meldungenWeg(root){
    const karte = [...(root?.querySelectorAll(".karte") || [])].find(k => k.querySelector(":scope > h3")?.textContent.trim() === "Meldungen");
    karte?.remove();
  }

  if (typeof seiteFuellen === "function"){
    const vorher = seiteFuellen;
    seiteFuellen = function(){
      const out = vorher.apply(this, arguments);
      const seite = document.getElementById("seite");
      kuerzen(seite); rohstoffTabelle(seite); meldungenWeg(seite);
      return out;
    };
  }
  if (typeof blattFuellen === "function"){
    const vorher = blattFuellen;
    blattFuellen = function(){
      const out = vorher.apply(this, arguments);
      kuerzen(document.getElementById("blattinhalt"));
      return out;
    };
  }
  window.__erzweltKurztexte = {version:VERSION, anzahl:KUERZER.length};
})();

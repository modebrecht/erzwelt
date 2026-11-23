"use strict";
/* Premium-Spielgefühl (nur Darstellung, keine Änderung an Wirtschaft):
   1. Rohstoff auf einen Blick (Pins: module/karte.js, «Kupfer (Cu)» im
      Aufgabentext: module/aufgabe.js).
   2. Lieferkette lebt (Lieferfluss auf der Karte: module/karte.js).
   3. Münzen: Kommt der Verkauf in der Kasse an, fallen Münzen hinein.
   4. Monatsabschluss als kleine Bilanz: laufendes Geschäft (Einnahmen minus
      Löhne und Betrieb) mit Trendpfeil, dazu was investiert wurde.
   5. Der Verkaufsbetrag erscheint kurz im Kassen-Feld statt darunter
      (dort liegt jetzt «Verlauf»).
   6. Beispiel-Lieferweg als kleiner Knopf (module/karte.js). */
(function(){
  const VERSION = 1;
  const reduziert = () => (typeof OPT !== "undefined" && OPT.anim === 0)
    || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /* 1. Rohstoff-Pins und 2. Lieferfluss: module/karte.js */

  /* ---------- 3. Münzen in die Kasse ---------- */
  function muenzenRegnen(){
    if (reduziert() || aktiveSeite !== "karte") return;
    const ziel = document.getElementById("h-kasse-i") || document.querySelector(".pille.kasse");
    if (!ziel) return;
    const r = ziel.getBoundingClientRect();
    if (!r.width) return;
    let ebene = document.getElementById("muenz-ebene");
    if (!ebene){ ebene = document.createElement("div"); ebene.id = "muenz-ebene"; document.body.appendChild(ebene); }
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const anzahl = OPT.anim === 2 ? 6 : 4;
    for (let i = 0; i < anzahl; i++){
      const c = document.createElement("span");
      c.className = "muenz-flug";
      c.style.left = x + "px"; c.style.top = y + "px";
      ebene.appendChild(c);
      const sx = (i % 2 ? 1 : -1) * (16 + Math.random() * 22), sy = 34 + Math.random() * 18;
      const a = c.animate([
        {transform:`translate(${sx}px,${sy}px) scale(.6) rotateY(0deg)`, opacity:0},
        {transform:`translate(${sx * .55}px,${sy * .2 - 26}px) scale(1) rotateY(180deg)`, opacity:1, offset:.45},
        {transform:"translate(0,0) scale(.55) rotateY(360deg)", opacity:.9}
      ], {duration:560, delay:i * 70, easing:"cubic-bezier(.3,.7,.4,1)", fill:"backwards"});
      a.finished.finally(() => c.remove());
    }
    const pille = document.querySelector(".pille.kasse");
    if (pille){
      setTimeout(() => {
        pille.classList.remove("muenz-glanz"); void pille.offsetWidth; pille.classList.add("muenz-glanz");
        setTimeout(() => pille.classList.remove("muenz-glanz"), 500);
      }, 480);
    }
  }
  const kassenPille = document.querySelector(".pille.kasse");
  if (kassenPille){
    let warPuls = false;
    new MutationObserver(() => {
      const puls = kassenPille.classList.contains("verkauf-puls");
      if (puls && !warPuls) muenzenRegnen();
      warPuls = puls;
    }).observe(kassenPille, {attributes:true, attributeFilter:["class"]});
  }

  /* ---------- 4. Monatsabschluss als kleine Bilanz ---------- */
  const zahlAus = t => +String(t || "0").replace(/[^\d]/g, "") || 0;
  function monatsBilanz(text){
    const roh = text.match(/Löhne (.+?), Betrieb (.+?)\.$/);
    const lohn = zahlAus(roh?.[1]), betrieb = zahlAus(roh?.[2]);
    const mb = S.monatsBilanz || {ein:S.etappeStartEingenommen || 0, aus:S.etappeStartAusgegeben || 0, letzt:null};
    if (S.eingenommen < mb.ein || S.ausgegeben < mb.aus){ mb.ein = 0; mb.aus = 0; mb.letzt = null; }
    const ein = S.eingenommen - mb.ein, aus = S.ausgegeben - mb.aus;
    const laufend = ein - lohn - betrieb, investiert = Math.max(0, aus - lohn - betrieb);
    const trend = mb.letzt === null ? "" : laufend > mb.letzt ? "▲" : laufend < mb.letzt ? "▼" : "►";
    const trendTitel = trend === "▲" ? "besser als im Vormonat" : trend === "▼" ? "schlechter als im Vormonat" : "gleich wie im Vormonat";
    const besser = mb.letzt === null || laufend >= mb.letzt;
    S.monatsBilanz = {ein:S.eingenommen, aus:S.ausgegeben, letzt:laufend};
    const monat = Math.max(1, Math.round((S.tag - 1) / 30));
    const betrag = v => `<span class="mb-zahl">${(v >= 0 ? "+" : "−") + chf(Math.abs(Math.round(v)))}</span>`;
    return `<span class="mb-kopf"><b>Monat ${monat} · Laufendes Geschäft <span class="${laufend >= 0 ? "mb-plus" : "mb-minus"}">${betrag(laufend)}</span></b>`
      + (trend ? ` <span class="mb-trend ${besser ? "mb-plus" : "mb-minus"}" title="${trendTitel}">${trend}</span>` : "") + `</span>`
      + ` <span class="mb-zeile">Einnahmen <span class="mb-plus">${betrag(ein)}</span> · Löhne und Betrieb <span class="mb-minus">${betrag(-(lohn + betrieb))}</span></span>`
      + (investiert >= 1 ? ` <span class="mb-klein">Dazu investiert: <span class="mb-zahl">${chf(Math.round(investiert))}</span></span>` : "");
  }
  if (typeof notiz === "function"){
    const vorherNotiz = notiz;
    notiz = function(text, art){
      if (typeof text === "string" && text.startsWith("Monatsabschluss:")){
        try { text = monatsBilanz(text); } catch (e){ /* Originaltext behalten */ }
      }
      return vorherNotiz.call(this, text, art);
    };
  }

  /* ---------- 5. Verkaufsbetrag im Kassen-Feld ---------- */
  const kassenBox = document.querySelector(".pille.kasse > div");
  let kassenTimer = 0;
  function kasseZeigt(text){
    if (!kassenBox) return;
    clearTimeout(kassenTimer);
    kassenBox.querySelector(".kasse-plus")?.remove();
    const el = document.createElement("span");
    el.className = "kasse-plus";
    el.textContent = text;
    kassenBox.appendChild(el);
    kassenTimer = setTimeout(() => el.remove(), 1550);
  }
  new MutationObserver(liste => {
    for (const eintrag of liste) for (const n of eintrag.addedNodes){
      if (n.nodeType === 1 && n.classList.contains("verkauf-geld")){
        const t = n.textContent.trim();
        n.remove();
        if (t) kasseZeigt(t.replace(/^\+\s*/, "+"));
      }
    }
  }).observe(document.body, {childList:true});

  /* 6. Lieferweg-Knopf: module/karte.js */

  window.__erzweltPremiumSpielgefuehl = {version:VERSION};
})();

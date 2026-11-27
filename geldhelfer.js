"use strict";
/* ============================================================
   GELDHELFER (nur Schwierigkeit «Einfach»)

   Wird die Kasse knapp, erscheint unten in der Aufgabenkarte ein Kasten
   «Die Kasse wird knapp» mit den wichtigsten Gründen aus dem Spielstand:
   Personen ohne Aufgabe, Ware ohne Verkauf, Fabrik ohne Personal oder ohne
   Material, noch keine Fabrik … Dazu Kosten und Einnahmen pro Monat und wie
   lange das Geld noch reicht.

   Knapp heisst: Kasse unter null, oder weniger als zwei Monate Löhne und
   Betrieb, oder bei Verlust weniger als drei Monate Verlust.
   «Verstanden» blendet den Kasten aus, bis die Kasse um die Hälfte weiter
   sinkt oder 30 Spieltage vergangen sind. Nur Anzeige: ändert nichts am Spiel.
   ============================================================ */
(function(){
  const VERSION = 1;
  const t = (k, w) => textVon("geldhelfer." + k, w);

  /* Einnahmen der letzten Tage (nur für die Anzeige, nicht gespeichert) */
  const verlauf = [];
  (window.__erzweltTagTeile ||= {}).geldhelfer = () => {
    verlauf.push({tag:S.tag, ein:S.eingenommen});
    while (verlauf.length > 31) verlauf.shift();
  };
  function einnahmenProMonat(){
    if (verlauf.length < 8) return null;
    const a = verlauf[0], b = verlauf[verlauf.length - 1];
    return Math.max(0, (b.ein - a.ein) / Math.max(1, b.tag - a.tag) * 30);
  }

  let weg = null;   // {bisKasse, bisTag} nach «Verstanden»
  let aufgeklappt = false;
  function lage(){
    if (S.schwierigkeit !== "einfach" || tutorialLaeuft() || S.ende) return null;
    const kosten = lohnsumme() + betriebskostenMonat();
    const ein = einnahmenProMonat();
    const netto = ein === null ? null : ein - kosten;
    const knapp = S.kasse < 0 || (kosten > 0 && S.kasse < 2 * kosten) || (netto !== null && netto < 0 && S.kasse < -3 * netto);
    if (!knapp) { weg = null; return null; }
    if (weg && S.kasse >= weg.bisKasse && S.tag < weg.bisTag) return null;
    return {kosten, ein, netto};
  }

  function gruende(){
    const out = [];
    const frei = freieArbeiter();
    if (frei > 0) out.push({ziel:"team", text:t("frei", {n:frei, kosten:chf(frei * LOHN_OHNE_EINSATZ)})});
    const lager = Math.round(warenLager()), kraft = verkaufsKraft();
    if (lager > 0 && kraft === 0) out.push({ziel:"markt", text:t("keineVerkaeufer", {n:lager})});
    else if (kraft > 0 && lager > kraft * 10) out.push({ziel:"markt", text:t("lagerVoll", {n:lager, kraft})});
    const fertig = S.fabriken.filter(f => f.restbau === 0);
    if (!S.fabriken.length) out.push({ziel:null, text:t("keineFabrik")});
    else if (!fertig.length) out.push({ziel:null, text:t("fabrikImBau", {tage:Math.min(...S.fabriken.map(f => f.restbau))})});
    const leer = fertig.find(f => f.arbeiter === 0);
    if (leer) out.push({ziel:null, text:t("fabrikLeer", {name:PRODUKT[leer.produkt].name})});
    const wartet = fertig.find(f => f.arbeiter > 0 && Object.keys(PRODUKT[f.produkt].rezept)
      .some(k => (S.mat[k] || 0) < PRODUKT[f.produkt].rezept[k]));
    if (wartet){
      const fehlt = Object.keys(PRODUKT[wartet.produkt].rezept).filter(k => (S.mat[k] || 0) < PRODUKT[wartet.produkt].rezept[k]);
      out.push({ziel:null, text:t("fabrikWartet", {name:PRODUKT[wartet.produkt].name, fehlt:fehlt.map(k => MATERIAL[k].name).join(", ")})});
    }
    if (out.length < 2){
      const h = window.__erzweltWissenTeile?.hinweis?.();
      if (h && h[0]) out.push({ziel:null, text:`<b>${h[0]}</b> ${h[1] || ""}`});
    }
    if (!out.length) out.push({ziel:null, text:t("zuVieleKosten")});
    return out.slice(0, 3);
  }

  function geldHelfer(){
    const q = document.getElementById("quest");
    if (!q) return;
    q.querySelector(".geld-helfer")?.remove();
    if (q.hidden) return;
    const l = lage();
    if (!l) return;
    const box = document.createElement("div");
    box.className = "geld-helfer";
    box.setAttribute("role", "status");
    const warn = window.__erzweltStil ? window.__erzweltStil.ikon.warnung : "";
    const geld = [t("kostenMonat", {betrag:chf(l.kosten)})];
    if (l.ein !== null) geld.push(t("einnahmenMonat", {betrag:chf(l.ein)}));
    const reicht = l.netto !== null && l.netto < 0 && S.kasse > 0
      ? t("reichtNoch", {monate:Math.max(0.1, S.kasse / -l.netto).toLocaleString("de-CH", {maximumFractionDigits:1})}) : "";
    const liste = gruende();
    const zeile = g => `${g.text}${g.ziel ? ` <button type="button" class="gh-link" data-gh-ziel="${g.ziel}">${t("zu." + g.ziel)}</button>` : ""}`;
    const knoepfe = `<span class="gh-knoepfe">${liste.length > 1 || l.ein !== null ? `<button type="button" class="gh-ok" data-gh-mehr="1" aria-expanded="${aufgeklappt}">${t(aufgeklappt ? "weniger" : "mehr")}</button>` : ""}
      <button type="button" class="gh-ok" data-gh-ok="1">${t("verstanden")}</button></span>`;
    box.innerHTML = `<b class="gh-titel">${warn} ${t(S.kasse < 0 ? "titelMinus" : "titel")}</b>
      ${reicht ? `<span class="gh-geld">${reicht}</span>` : ""}
      <span class="gh-grund">${zeile(liste[0])}</span>
      ${knoepfe}
      ${aufgeklappt ? `<span class="gh-details"><span class="gh-geld">${geld.join(" · ")}</span>${liste.slice(1).map(g => `<span class="gh-grund">${zeile(g)}</span>`).join("")}</span>` : ""}`;
    const vor = document.getElementById("q-punkte");
    if (vor) vor.insertAdjacentElement("afterend", box); else q.appendChild(box);
    if (typeof questHoeheMessen === "function") questHoeheMessen();
  }
  /* Nach dem Engpass-Kasten (module/quest.js) */
  (window.__erzweltQuestTeile ||= {}).geldHelfer = geldHelfer;

  document.addEventListener("click", e => {
    const b = e.target.closest?.("[data-gh-ziel], [data-gh-ok], [data-gh-mehr]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.ghZiel && typeof seiteWechseln === "function") seiteWechseln(b.dataset.ghZiel);
    if (b.dataset.ghMehr){ aufgeklappt = !aufgeklappt; geldHelfer(); }
    if (b.dataset.ghOk){ weg = {bisKasse:S.kasse >= 0 ? S.kasse * 0.5 : S.kasse - 100000, bisTag:S.tag + 30}; geldHelfer(); }
  }, true);

  const stil = document.createElement("style");
  stil.id = "erzwelt-geldhelfer-style";
  stil.textContent = `
    #quest .geld-helfer{display:block;margin-top:9px;padding:8px 10px;border-radius:12px;background:#fff1e3;
      border-left:4px solid var(--warn);font-size:var(--f0);line-height:1.35;color:var(--tinte)}
    #quest .geld-helfer .gh-titel{display:flex;align-items:center;gap:5px;font-family:"Baloo 2",sans-serif;font-size:var(--f1);color:#8a4b00}
    #quest .geld-helfer .gh-titel svg{width:16px;height:16px;flex:none}
    #quest .geld-helfer .gh-geld{display:block;margin:1px 0 3px;font-weight:700;color:#6b4a1f}
    #quest .geld-helfer .gh-grund{display:block;margin:3px 0}
    #quest .geld-helfer .gh-knoepfe{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
    #quest .geld-helfer .gh-details{display:block;max-height:30vh;overflow:auto;border-top:1px solid #f0d7b8;margin-top:6px;padding-top:4px}
    #quest .geld-helfer .gh-link{border:0;background:none;padding:0;color:#0b5f8a;font-weight:800;text-decoration:underline;cursor:pointer;font-size:inherit}
    #quest .geld-helfer .gh-ok{border:1px solid #e3c9a6;background:#fff;border-radius:10px;padding:5px 10px;min-height:32px;
      font-weight:800;font-size:var(--f0);color:var(--tinte);cursor:pointer}`;
  document.head.append(stil);

  window.__erzweltGeldhelfer = {version:VERSION, lage, gruende};
})();

"use strict";
/* ============================================================
   MONATSÜBERSICHT

   Tippen auf «Tag» (oder «Kasse») oben öffnet eine Tabelle mit Einnahmen und
   Ausgaben pro Monat:
     Einnahmen · Löhne und Betrieb · Investiert · Ergebnis
   Oben steht der laufende Monat (bisher), darunter die abgeschlossenen Monate,
   der neueste zuerst. Ergebnis = Einnahmen − Löhne und Betrieb − Investiert.

   Daten: Beim Monatsabschluss schreibt premium-spielgefuehl.js eine Zeile in
   S.monatsBuch (wird mit dem Spielstand gespeichert). Ältere Spielstände haben
   erst ab dem nächsten Monatsabschluss Zeilen; das steht dann als Hinweis da.
   Nur Anzeige: ändert nichts am Spiel. Fenster: #lupe (wie die Wissensfelder).
   ============================================================ */
(function(){
  const VERSION = 1;
  const t = (k, w) => textVon("monatsuebersicht." + k, w);
  const lupe = document.getElementById("lupe");
  const inhalt = document.getElementById("lupeinhalt");
  const tafel = lupe?.querySelector(".tafel");
  if (!lupe || !inhalt || !tafel) return;
  const wissenLabel = tafel.getAttribute("aria-label");
  let offen = false;

  const monatVon = tag => Math.max(1, Math.round((tag - 1) / 30));
  const betrag = (v, vorzeichen = false) => {
    const r = Math.round(v);
    const text = (r < 0 ? "−" : vorzeichen && r > 0 ? "+" : "") + kurz(Math.abs(r));
    return `<span class="${r < 0 ? "mu-minus" : vorzeichen && r > 0 ? "mu-plus" : ""}">${text}</span>`;
  };

  // Laufender Monat: seit dem letzten Monatsabschluss (wie premium-spielgefuehl.js)
  function laufend(){
    const mb = S.monatsBilanz || {ein:S.etappeStartEingenommen || 0, aus:S.etappeStartAusgegeben || 0};
    let ein0 = mb.ein, aus0 = mb.aus;
    if (S.eingenommen < ein0 || S.ausgegeben < aus0){ ein0 = 0; aus0 = 0; }
    return {ein:S.eingenommen - ein0, aus:S.ausgegeben - aus0};
  }

  function zeile(name, ein, betrieb, investiert, klasse = ""){
    const ergebnis = ein - (betrieb ?? 0) - investiert;
    return `<tr class="${klasse}"><th scope="row">${name}</th><td>${betrag(ein)}</td>
      <td>${betrieb === null ? "–" : betrag(-betrieb)}</td><td>${betrag(-investiert)}</td>
      <td class="mu-erg">${betrag(ergebnis, true)}</td></tr>`;
  }

  function fuellen(){
    const buch = Array.isArray(S.monatsBuch) ? S.monatsBuch : [];
    const imMonat = (S.tag - 1) % 30 + 1;
    const jetzt = laufend();
    // Im laufenden Monat sind Löhne und Betrieb noch nicht bezahlt (Monatsabschluss)
    const zeilen = [zeile(t("laufend", {monat:monat()}), jetzt.ein, null, jetzt.aus, "mu-jetzt")];
    for (const z of [...buch].reverse()){
      zeilen.push(zeile(t("monat", {monat:monatVon(z.tag)}), z.ein, z.betrieb, Math.max(0, z.aus - z.betrieb)));
    }
    const erster = buch.length ? monatVon(buch[0].tag) : monat();
    const hinweis = erster > 1 ? `<p class="mu-hinweis">${t("hinweisAb", {monat:erster})}</p>` : "";
    const gewinn = S.eingenommen - S.ausgegeben;
    inhalt.innerHTML = `<h2>${t("titel")}</h2>
      <div class="unter">${t("stand", {tag:S.tag, monat:monat(), imMonat})}</div>
      <div class="mu-rahmen"><table class="mu-tabelle">
        <thead><tr><th scope="col">${t("spMonat")}</th><th scope="col">${t("spEin")}</th>
          <th scope="col">${t("spBetrieb")}</th><th scope="col">${t("spInvest")}</th><th scope="col">${t("spErgebnis")}</th></tr></thead>
        <tbody>${zeilen.join("")}</tbody></table></div>
      ${hinweis}
      <p class="mu-erklaerung">${t("erklaerung")}</p>
      <div class="karte mu-gesamt"><b>${t("gesamtTitel")}</b>
        <span>${t("gesamt", {ein:betrag(S.eingenommen), aus:betrag(-S.ausgegeben), gewinn:betrag(gewinn, true)})}</span></div>`;
  }

  function oeffnen(){
    if (typeof spielAktiv !== "undefined" && !spielAktiv) return;
    fuellen();
    offen = true;
    tafel.setAttribute("aria-label", t("titel"));
    lupe.hidden = false;
    fensterKlasse();
    tafel.scrollTop = 0;
    lupe.querySelector(".xzu")?.focus({preventScroll:true});
  }

  // Wissensfelder nutzen dasselbe Fenster: Beschriftung zurücksetzen
  const kernLupe = lupeFuellen;
  lupeFuellen = function(...a){
    offen = false;
    tafel.setAttribute("aria-label", wissenLabel);
    return kernLupe.apply(this, a);
  };
  // Läuft das Spiel bei offener Übersicht weiter, zählen die Zahlen mit
  (window.__erzweltTagTeile ||= {}).monatsuebersicht = () => {
    if (offen && !lupe.hidden) fuellen();
    else offen = false;
  };

  /* ---------- Kasse und Tag oben antippbar ---------- */
  for (const pille of document.querySelectorAll("#hud .pille.tag, #hud .pille.kasse")){
    pille.setAttribute("role", "button");
    pille.tabIndex = 0;
    pille.setAttribute("aria-haspopup", "dialog");
    pille.title = t("oeffnen");
    pille.addEventListener("click", oeffnen);
    pille.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); oeffnen(); }
    });
  }

  const stil = document.createElement("style");
  stil.id = "erzwelt-monatsuebersicht-style";
  stil.textContent = `
    #hud .pille.tag,#hud .pille.kasse{cursor:pointer}
    #hud .pille.tag:focus-visible,#hud .pille.kasse:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
    @media (hover:hover){#hud .pille.tag:hover,#hud .pille.kasse:hover{border-color:#ffffff66}}
    #hud .pille.tag:active,#hud .pille.kasse:active{transform:translateY(1px)}
    .mu-rahmen{overflow-x:auto;margin:4px -4px 10px;padding:0 4px}
    .mu-tabelle{width:100%;border-collapse:collapse;font-size:var(--f0);font-variant-numeric:tabular-nums}
    .mu-tabelle th,.mu-tabelle td{padding:7px 5px;text-align:right;white-space:nowrap;border-bottom:1px solid #00000014}
    .mu-tabelle thead th{font-weight:800;color:var(--grau);font-size:var(--f0);vertical-align:bottom;white-space:normal;line-height:1.15}
    .mu-tabelle th[scope=row],.mu-tabelle thead th:first-child{text-align:left}
    .mu-tabelle td{font-weight:700}
    .mu-tabelle .mu-erg{font-weight:800}
    .mu-tabelle tr.mu-jetzt{background:#f5b73d26}
    .mu-tabelle tr.mu-jetzt th{font-weight:800}
    .mu-plus{color:#1f7a4a}
    .mu-minus{color:#b23a2f}
    .ueberlage p.mu-hinweis,.ueberlage p.mu-erklaerung{font-size:var(--f0);color:var(--grau);margin-bottom:8px}
    .mu-gesamt{display:flex;flex-direction:column;gap:3px;font-size:var(--f1)}
  `;
  document.head.append(stil);

  window.__erzweltMonatsuebersicht = {version:VERSION, oeffnen};
})();

"use strict";
/* ============================================================
   GESCHICHTE DER ROHSTOFFE

   Im Reiter Wissen ein Bereich mit fünf Kapiteln (Potosí, Kongo, Seltene
   Erden, Konfliktmineralien, Schweiz). Jedes Kapitel: kurzer Text, darunter
   eine Frage mit vier Antworten (Darstellung wie das Wissens-Quiz).
   - Richtig beim ersten Versuch: BELOHNUNG für die Firma (Kasse, nicht
     Verkaufserlös – zählt darum nicht fürs Etappenziel).
   - Falsch: alle vier wackeln rot, nochmals versuchen, ohne Belohnung.
   Nichts wird freigeschaltet; die Kapitel sind reiner Hintergrund.
   Stand in S.geschichte[kapitel]: 0 = falsch versucht, 1 = sofort richtig,
   2 = richtig nach Fehlversuch. Texte: texte.de.js (geschichte.*), die Fakten
   wurden im November 2026 geprüft.
   ============================================================ */
(function(){
  const VERSION = 1;
  const BELOHNUNG = 15000;
  const KAPITEL = ["potosi", "kongo", "selten", "konflikt", "schweiz"];
  const RICHTIG = {potosi:2, kongo:3, selten:1, konflikt:4, schweiz:1};
  const t = (k, w) => textVon("geschichte." + k, w);
  const stand = id => (S.geschichte || {})[id];
  const setzen = (id, wert) => { (S.geschichte ||= {})[id] = wert; };
  const betrag = () => chf(BELOHNUNG);

  /* ---------- Bereich im Reiter Wissen ---------- */
  function bereich(){
    const gelesen = KAPITEL.filter(id => stand(id) >= 1).length;
    const zeilen = KAPITEL.map(id => {
      const s = stand(id), fertig = s >= 1;
      const marke = fertig ? `<span class="gs-marke ok">✓ ${t("gelesen")}</span>`
        : s === 0 ? "" : `<span class="gs-marke">${t("offen", {betrag:betrag()})}</span>`;
      return `<button type="button" class="gs-kapitel${fertig ? " fertig" : ""}" data-geschichte="${id}">
        <span class="gs-zeit">${t(id + ".zeit")}</span><b>${t(id + ".titel")}</b>${marke}</button>`;
    }).join("");
    return `<section class="karte gs-bereich" aria-labelledby="gs-titel">
      <h3 id="gs-titel">${t("titel")}</h3>
      <div class="unter">${t("unter", {betrag:betrag()})}</div>
      <div class="gs-liste">${zeilen}</div>
      <small class="gs-stand">${t("stand", {n:gelesen, gesamt:KAPITEL.length})}</small>
    </section>`;
  }
  (window.__erzweltSeitenTeile ||= {}).geschichte = html => html + bereich();

  /* ---------- Kapitel im Fenster (#lupe) ---------- */
  const lupe = document.getElementById("lupe");
  const inhalt = document.getElementById("lupeinhalt");
  const tafel = lupe?.querySelector(".tafel");
  let offen = null;

  function fragekarte(id){
    const s = stand(id), geloest = s >= 1;
    const antworten = [1, 2, 3, 4].map(nr => {
      const richtig = geloest && nr === RICHTIG[id];
      return `<button type="button" class="quiz-antwort${richtig ? " richtig" : ""}" data-gs-antwort="${id}" data-nr="${nr}"
        ${geloest ? "disabled" : ""}>${t(id + ".a" + nr)}</button>`;
    }).join("");
    const rm = s === 1 ? t("sofort", {betrag:betrag()}) : s === 2 ? t("spaeter") : s === 0 ? t("falsch") : t("einleitung", {betrag:betrag()});
    return `<section class="karte quiz-karte${geloest ? " geloest" : ""}">
      <h3>${t("frageTitel")}</h3>
      <p class="quiz-frage">${t(id + ".frage")}</p>
      <div class="quiz-antworten">${antworten}</div>
      <p class="quiz-rueckmeldung ${s === 0 ? "falsch" : geloest ? "gut" : ""}" role="status">${rm}</p>
    </section>`;
  }
  function kapitelZeigen(id){
    if (!lupe || !inhalt) return;
    offen = id;
    inhalt.innerHTML = `<div class="titelzeile" style="padding-right:52px">
        <span class="sicon gs-icon">${IK.wissen || ""}</span>
        <div><h2>${t(id + ".titel")}</h2><div class="ort">${t(id + ".zeit")}</div></div></div>
      <div class="karte gs-text">${[1, 2, 3].map(n => `<p>${t(id + ".t" + n)}</p>`).join("")}</div>
      ${fragekarte(id)}`;
    tafel?.setAttribute("aria-label", t(id + ".titel"));
    lupe.hidden = false;
    fensterKlasse();
  }

  document.addEventListener("click", e => {
    const k = e.target.closest && e.target.closest("[data-geschichte]");
    if (k){ kapitelZeigen(k.dataset.geschichte); return; }
    const b = e.target.closest && e.target.closest("[data-gs-antwort]");
    if (!b || b.disabled) return;
    const id = b.dataset.gsAntwort, nr = +b.dataset.nr;
    if (stand(id) >= 1) return;
    if (nr === RICHTIG[id]){
      const sofort = stand(id) !== 0;
      setzen(id, sofort ? 1 : 2);
      if (sofort){
        S.kasse += BELOHNUNG;
        notiz(t("belohnung", {kapitel:t(id + ".titel"), betrag:betrag()}), "gut");
      }
      speichern();
      kapitelZeigen(id);
      const neu = inhalt.querySelector(`[data-gs-antwort="${id}"][data-nr="${nr}"]`);
      if (neu && typeof funkenAn === "function") funkenAn(neu, ["#2fbe7e", "#82e2b4", "#f5b73d", "#fff"], sofort ? 30 : 16);
      window.__erzweltErfolgFeier?.kaufTon?.();
      seitenStand = ""; zeichnen();
      return;
    }
    if (stand(id) === undefined){ setzen(id, 0); speichern(); }
    const karte = b.closest(".quiz-karte");
    const alle = karte.querySelectorAll(".quiz-antwort");
    alle.forEach(x => { x.classList.remove("wackeln"); void x.offsetWidth; x.classList.add("wackeln"); });
    const rm = karte.querySelector(".quiz-rueckmeldung");
    rm.textContent = t("falsch"); rm.className = "quiz-rueckmeldung falsch";
    if (navigator.vibrate && OPT.vib !== 0) try { navigator.vibrate([40, 40, 40]); } catch (err) {}
    setTimeout(() => alle.forEach(x => x.classList.remove("wackeln")), 650);
  });

  // Wissensfelder und Monatsübersicht nutzen dasselbe Fenster
  const vorher = lupeFuellen;
  lupeFuellen = function(...a){ offen = null; return vorher.apply(this, a); };

  const stil = document.createElement("style");
  stil.id = "erzwelt-geschichte-style";
  stil.textContent = `
    .gs-bereich .unter{margin-bottom:10px}
    .gs-liste{display:grid;gap:8px}
    .gs-kapitel{display:grid;grid-template-columns:minmax(0,1fr) auto;width:100%;min-width:0;box-sizing:border-box;align-items:center;gap:2px 10px;text-align:left;
      padding:10px 12px;min-height:56px;border-radius:14px;border:2px solid #e3d7bf;background:#fff;color:#192f36;
      box-shadow:0 3px 0 #e3d7bf;cursor:pointer;font:inherit}
    .gs-kapitel:active{transform:translateY(2px);box-shadow:0 1px 0 #e3d7bf}
    .gs-kapitel .gs-zeit{grid-column:1;font-size:var(--f0);font-weight:800;color:var(--grau)}
    .gs-kapitel b{grid-column:1;font-family:"Baloo 2",sans-serif;font-size:var(--f2);line-height:1.2}
    .gs-kapitel .gs-marke{grid-column:2;grid-row:1 / span 2;font-size:var(--f0);font-weight:800;padding:3px 9px;border-radius:99px;
      background:#fff2c9;color:#6b4a0a;white-space:nowrap}
    .gs-kapitel .gs-marke.ok{background:#e3f6ec;color:#155c3b}
    .gs-kapitel.fertig{border-color:#cfe6d8;box-shadow:0 3px 0 #cfe6d8}
    .gs-stand{display:block;margin-top:8px;color:var(--grau);font-weight:700;font-size:var(--f0)}
    .gs-icon{background:#f5b73d22;color:#a56d0c;width:48px;height:48px;border-radius:14px;display:grid;place-items:center;flex:none}
    .gs-icon svg{width:26px;height:26px}
    .ueberlage .gs-text p{font-size:var(--f1);line-height:1.55}
  `;
  document.head.append(stil);

  window.__erzweltGeschichte = {version:VERSION, kapitel:KAPITEL, richtig:RICHTIG, stand, kapitelZeigen};
})();

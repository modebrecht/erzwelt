"use strict";
/* ============================================================
   GESCHICHTE DER ROHSTOFFE

   Im Reiter Wissen ein Bereich mit neun Kapiteln: Ötzi, Bronze, Eisen, Gold
   und Silber, Potosí, Kongo, Seltene Erden, Konfliktmineralien, Schweiz. Jedes Kapitel: kurzer Text, darunter
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
  const KAPITEL = ["oetzi", "bronze", "eisen", "gold", "potosi", "kongo", "selten", "konflikt", "schweiz"];
  const RICHTIG = {oetzi:2, bronze:3, eisen:1, gold:4, potosi:2, kongo:3, selten:1, konflikt:4, schweiz:1};
  const t = (k, w) => textVon("geschichte." + k, w);
  const stand = id => (S.geschichte || {})[id];
  const setzen = (id, wert) => { (S.geschichte ||= {})[id] = wert; };
  const betrag = () => chf(BELOHNUNG);

  /* ---------- Bilder (eigene SVG, 320×140) ---------- */
  const B = {
    himmel:'<rect width="320" height="140" fill="#dbeef5"/>',
    boden:(f='#cdb68a')=>`<rect y="112" width="320" height="28" fill="${f}"/>`,
  };
  const BILD = {
    oetzi:`${B.himmel}<path d="M0 112 L70 40 L120 88 L175 22 L250 96 L290 60 L320 84 V112Z" fill="#8fa3ad"/>
      <path d="M150 50 L175 22 L200 50 L188 56 L175 46 L162 56Z" fill="#fff"/><path d="M50 60 L70 40 L90 60 L78 64 L70 56 L62 64Z" fill="#fff"/>
      ${B.boden('#e8eef1')}<g transform="translate(206 74) rotate(-28)"><rect x="0" y="-4" width="74" height="8" rx="4" fill="#8a5a2b"/>
      <path d="M58 -6 L80 -20 L86 -14 L84 14 L78 18 L58 6Z" fill="#d07a3a" stroke="#a5552a" stroke-width="2"/></g>
      <text x="16" y="132" font-size="12" font-weight="800" fill="#53656c">${t("bild.oetzi")}</text>`,
    bronze:`${B.himmel}${B.boden()}<text x="160" y="24" text-anchor="middle" font-size="12" font-weight="800" fill="#53656c">${t("bild.bronzeWeg")}</text>
      <path d="M40 66 C110 30 210 30 280 66" fill="none" stroke="#7a8a92" stroke-width="3" stroke-dasharray="6 6"/>
      <g transform="translate(22 72)"><path d="M0 18 L10 0 H50 L60 18Z" fill="#d07a3a"/><text x="30" y="36" text-anchor="middle" font-size="12" font-weight="800" fill="#7a3f1a">${t("bild.bronzeKupfer")}</text></g>
      <g transform="translate(238 72)"><path d="M0 18 L10 0 H50 L60 18Z" fill="#9aa7b0"/><text x="30" y="36" text-anchor="middle" font-size="12" font-weight="800" fill="#4c5a62">${t("bild.bronzeZinn")}</text></g>
      <g transform="translate(160 84) rotate(-20)"><rect x="-34" y="-4" width="50" height="8" rx="4" fill="#8a5a2b"/><path d="M8 -16 L30 -22 L34 0 L30 22 L8 16Z" fill="#c79a3c" stroke="#a37a24" stroke-width="2"/></g>
      <text x="160" y="130" text-anchor="middle" font-size="12" font-weight="800" fill="#6b4a0a">${t("bild.bronze")}</text>`,
    eisen:`<rect width="320" height="140" fill="#2d3438"/>
      <path d="M90 88 H230 L214 100 H200 V120 H230 V128 H90 V120 H120 V100 H106Z" fill="#59656b"/>
      <rect x="128" y="74" width="80" height="12" rx="3" fill="#ff7a2e"/><rect x="128" y="74" width="80" height="12" rx="3" fill="#ffd27a" opacity=".5"/>
      <g transform="translate(246 46) rotate(40)"><rect x="-4" y="0" width="8" height="50" rx="3" fill="#8a5a2b"/><rect x="-16" y="-8" width="32" height="16" rx="3" fill="#9aa7b0"/></g>
      <g fill="#ffd27a"><circle cx="196" cy="62" r="3"/><circle cx="208" cy="56" r="2"/><circle cx="184" cy="58" r="2"/><circle cx="216" cy="66" r="2"/></g>
      <text x="16" y="24" font-size="12" font-weight="800" fill="#ffd9b0">${t("bild.eisen")}</text>`,
    gold:`<rect width="320" height="140" fill="#fdf3dd"/>
      ${[0,1,2,3].map(i=>`<ellipse cx="110" cy="${112-i*12}" rx="40" ry="11" fill="#e0b13a" stroke="#a37a24" stroke-width="2"/>`).join("")}
      <ellipse cx="110" cy="76" rx="40" ry="11" fill="#f5cd55"/><circle cx="110" cy="76" r="6" fill="#c79a3c"/>
      ${[0,1,2].map(i=>`<ellipse cx="215" cy="${116-i*12}" rx="34" ry="10" fill="#c9d3d9" stroke="#8c99a1" stroke-width="2"/>`).join("")}
      <ellipse cx="215" cy="92" rx="34" ry="10" fill="#e5ecf0"/>
      <text x="160" y="28" text-anchor="middle" font-size="13" font-weight="800" fill="#6b4a0a">${t("bild.gold")}</text>`,
    potosi:`${B.himmel}<path d="M20 112 L130 22 L240 112Z" fill="#b5703c"/><path d="M102 45 L130 22 L158 45 L145 50 L130 40 L115 50Z" fill="#c98b5a"/>
      ${[[84,90],[122,72],[160,92],[104,100],[146,60]].map(([x,y])=>`<path d="M${x-7} ${y+8} V${y} a7 7 0 0 1 14 0 V${y+8}Z" fill="#3a2418"/>`).join("")}
      ${B.boden()}<g transform="translate(256 98)"><path d="M0 14 L6 6 H34 L40 14Z" fill="#d7dee3" stroke="#8c99a1"/><path d="M8 6 L14 -2 H42 L48 6Z" fill="#c9d3d9" stroke="#8c99a1"/></g>
      <text x="16" y="132" font-size="12" font-weight="800" fill="#53656c">${t("bild.potosi")}</text>`,
    kongo:`<rect width="320" height="140" fill="#e4f1e1"/>${B.boden('#a9845a')}
      ${[20,60,100].map(x=>`<rect x="${x+12}" y="60" width="8" height="52" fill="#6b4a2b"/><circle cx="${x+16}" cy="52" r="24" fill="#3f8a4a"/>`).join("")}
      <path d="M150 70 H170" stroke="#53656c" stroke-width="3"/><path d="M166 64 L174 70 L166 76" fill="none" stroke="#53656c" stroke-width="3"/>
      <path d="M186 112 L200 82 H240 L254 112Z" fill="#7d8f9a"/><circle cx="212" cy="96" r="5" fill="#2a63b8"/><circle cx="228" cy="102" r="4" fill="#d07a3a"/>
      <rect x="268" y="70" width="30" height="46" rx="5" fill="#2f3b40"/><rect x="278" y="64" width="10" height="7" rx="2" fill="#2f3b40"/><rect x="273" y="96" width="20" height="14" rx="2" fill="#2fbe7e"/>
      <text x="16" y="24" font-size="12" font-weight="800" fill="#2f5a36">${t("bild.kongo")}</text>`,
    selten:`${B.himmel}<text x="40" y="50" font-size="13" font-weight="800" fill="#53656c">${t("bild.seltenUsa")}</text>
      <text x="280" y="50" text-anchor="end" font-size="13" font-weight="800" fill="#53656c">${t("bild.seltenChina")}</text>
      <path d="M80 45 H226" stroke="#e0504a" stroke-width="3"/><path d="M218 38 L230 45 L218 52" fill="none" stroke="#e0504a" stroke-width="3"/>
      <g transform="translate(160 112)"><path d="M-30 0 V-22 a30 30 0 0 1 60 0 V0 H14 V-22 a14 14 0 0 0 -28 0 V0Z" fill="#e0504a"/><rect x="-30" y="-6" width="16" height="9" fill="#d7dee3"/><rect x="14" y="-6" width="16" height="9" fill="#d7dee3"/></g>
      <text x="160" y="132" text-anchor="middle" font-size="12" font-weight="800" fill="#53656c">${t("bild.selten")}</text>`,
    konflikt:`<rect width="320" height="140" fill="#f4efe4"/><rect x="128" y="14" width="64" height="112" rx="10" fill="#2f3b40"/><rect x="134" y="24" width="52" height="88" rx="4" fill="#5b7480"/>
      ${[["Sn","#7f8c95",40,40],["Ta","#6d6f7a",40,92],["W","#5b5e66",260,40],["Au","#d9a516",260,92]].map(([s,f,x,y])=>`<circle cx="${x}" cy="${y}" r="20" fill="${f}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${s}</text><path d="M${x<160?x+22:x-22} ${y} H${x<160?126:194}" stroke="#b9ab8d" stroke-width="2" stroke-dasharray="4 4"/>`).join("")}`,
    schweiz:`<rect width="320" height="140" fill="#eef4f7"/><rect x="40" y="30" width="70" height="70" rx="6" fill="#d52b1e"/><rect x="69" y="44" width="12" height="42" fill="#fff"/><rect x="54" y="59" width="42" height="12" fill="#fff"/>
      <rect x="170" y="62" width="100" height="58" rx="6" fill="#53656c"/><rect x="200" y="58" width="40" height="8" rx="2" fill="#2f3b40"/>
      <g transform="translate(206 20) rotate(8)"><rect width="30" height="40" rx="2" fill="#fff" stroke="#b9ab8d"/><path d="M7 14 L13 20 L23 8" fill="none" stroke="#2fbe7e" stroke-width="3"/></g>
      <text x="160" y="134" text-anchor="middle" font-size="12" font-weight="800" fill="#53656c">${t("bild.schweiz")}</text>`
  };
  const bild = (id, klein) => `<svg class="${klein ? "gs-mini" : "gs-bild"}" viewBox="0 0 320 140" role="img" aria-hidden="true" font-family="Nunito,sans-serif">${BILD[id] || ""}</svg>`;

  /* ---------- Bereich im Reiter Wissen ---------- */
  function bereich(){
    const gelesen = KAPITEL.filter(id => stand(id) >= 1).length;
    const zeilen = KAPITEL.map((id, i) => {
      const s = stand(id), fertig = s >= 1;
      const marke = fertig ? `<span class="gs-marke ok">✓ ${t("gelesen")}</span>`
        : s === 0 ? "" : `<span class="gs-marke">${t("offen", {betrag:betrag()})}</span>`;
      return `<button type="button" class="gs-kapitel${fertig ? " fertig" : ""}" data-geschichte="${id}">
        ${bild(id, true)}<span class="gs-zeit">${t("kapitelNr", {nr:i + 1})} · ${t(id + ".zeit")}</span><b>${t(id + ".titel")}</b>${marke}</button>`;
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
        <div><h2>${t(id + ".titel")}</h2><div class="ort">${t("kapitelNr", {nr:KAPITEL.indexOf(id) + 1})} · ${t(id + ".zeit")}</div></div></div>
      ${bild(id)}
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
    .gs-kapitel{display:grid;grid-template-columns:76px minmax(0,1fr);width:100%;min-width:0;box-sizing:border-box;align-items:center;gap:2px 10px;text-align:left;
      padding:10px 12px;min-height:56px;border-radius:14px;border:2px solid #e3d7bf;background:#fff;color:#192f36;
      box-shadow:0 3px 0 #e3d7bf;cursor:pointer;font:inherit}
    .gs-kapitel:active{transform:translateY(2px);box-shadow:0 1px 0 #e3d7bf}
    .gs-kapitel .gs-zeit{grid-column:2;font-size:var(--f0);font-weight:800;color:var(--grau)}
    .gs-kapitel b{grid-column:2;font-family:"Baloo 2",sans-serif;font-size:var(--f2);line-height:1.2}
    .gs-kapitel .gs-marke{grid-column:2;justify-self:start;margin-top:3px;font-size:var(--f0);font-weight:800;padding:3px 9px;border-radius:99px;
      background:#fff2c9;color:#6b4a0a;white-space:nowrap}
    .gs-kapitel .gs-marke.ok{background:#e3f6ec;color:#155c3b}
    .gs-kapitel.fertig{border-color:#cfe6d8;box-shadow:0 3px 0 #cfe6d8}
    .gs-mini{grid-column:1;grid-row:1 / span 3;align-self:center;width:76px;height:34px;border-radius:6px;display:block}
    .gs-bild{display:block;width:100%;height:auto;border-radius:16px;margin:0 0 12px;box-shadow:0 2px 8px #0001}
    .gs-stand{display:block;margin-top:8px;color:var(--grau);font-weight:700;font-size:var(--f0)}
    .gs-icon{background:#f5b73d22;color:#a56d0c;width:48px;height:48px;border-radius:14px;display:grid;place-items:center;flex:none}
    .gs-icon svg{width:26px;height:26px}
    .ueberlage .gs-text p{font-size:var(--f1);line-height:1.55}
  `;
  document.head.append(stil);

  window.__erzweltGeschichte = {version:VERSION, kapitel:KAPITEL, richtig:RICHTIG, stand, kapitelZeigen};
})();

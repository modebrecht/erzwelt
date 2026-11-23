"use strict";
/* ============================================================
   EINSTIEG – «Woher kommt dein Ladekabel?»

   Vor der Schwierigkeitswahl einer neuen Runde ein Startbild: ein
   aufgeschnittenes Ladekabel. Kupfer in der Leitung, Aluminium im Stecker,
   Zinn in der Lötstelle – jedes mit dem Ort, an dem die Einführung danach
   die Quelle eröffnet (Katanga, Boké, Bangka). Darunter die Kette
   Quelle → Raffinerie → Fabrik → Markt und «Firma gründen».

   Einmal pro Runde (S.einstiegGesehen). Ein einziger Ablauf beim Öffnen:
   das Kabel wird gezeichnet, dann erscheinen die drei Materialien.
   Bei «Animationen: aus» oder reduzierter Bewegung sofort vollständig.
   ============================================================ */
(function(){
  const VERSION = 1;
  const [CU, AL, SN] = START_MATERIALIEN;
  const ort = k => {
    const d = MINEN.filter(x => x.mat === k).sort((a, b) => a.erschliessung - b.erschliessung)[0];
    return d ? `${d.ort}, ${LAND[d.land].name}` : "";
  };
  // lage: {left|right: %, top: %}; «rechts» = Symbol rechts, Text rechtsbündig
  const chip = (k, wofuer, lage, rechts) => {
    const m = MATERIAL[k];
    const pos = Object.entries(lage).map(([a, v]) => `${a}:${v}%`).join(";");
    return `<div class="es-chip ${rechts ? "es-rechts" : ""}" style="${pos}">
      <span class="es-sym" style="background:${m.farbe}">${m.sym}</span>
      <span class="es-txt"><b>${m.name}</b><small>${wofuer}</small><small class="es-ort">${ort(k)}</small></span>
    </div>`;
  };

  /* Kabel: Stecker links und rechts aus Aluminium, Mitte aufgeschnitten (Kupfer),
     Lötstelle (Zinn) am rechten Stecker. viewBox 340 × 230 */
  const BILD = `<svg class="es-kabel" viewBox="0 0 340 230" aria-hidden="true">
    <path class="es-mantel" d="M66 168C120 168 112 110 168 108S224 76 262 76" fill="none" stroke="#1d2a33" stroke-width="12" stroke-linecap="round"/>
    <path class="es-kern" d="M138 125C150 112 158 109 170 108S190 104 198 99" fill="none" stroke="${MATERIAL[CU].farbe}" stroke-width="7" stroke-linecap="round"/>
    <path class="es-kern" d="M140 122C151 112 159 110 170 109.5S189 106 196 101" fill="none" stroke="#f2b27f" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="22" y="157" width="48" height="23" rx="7" fill="${MATERIAL[AL].farbe}" stroke="#6f8296" stroke-width="2"/>
    <rect x="9" y="162" width="15" height="13" rx="3" fill="#d6dee7" stroke="#6f8296" stroke-width="2"/>
    <rect x="258" y="64" width="48" height="24" rx="7" fill="${MATERIAL[AL].farbe}" stroke="#6f8296" stroke-width="2"/>
    <rect x="304" y="69" width="15" height="14" rx="3" fill="#d6dee7" stroke="#6f8296" stroke-width="2"/>
    <circle class="es-loet" cx="262" cy="76" r="6.5" fill="${MATERIAL[SN].farbe}" stroke="#fff" stroke-width="2"/>
    <path class="es-zeiger z1" d="M168 103 152 46" stroke="#ffffff88" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
    <path class="es-zeiger z2" d="M46 182 50 200" stroke="#ffffff88" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
    <path class="es-zeiger z3" d="M262 83 266 138" stroke="#ffffff88" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
  </svg>`;

  const KETTE = [["hacke", "Quelle"], ["kolben", "Raffinerie"], ["fabrik", "Fabrik"], ["markt", "Markt"]];

  function bauen(){
    const el = document.createElement("div");
    el.id = "einstieg";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "es-titel");
    el.innerHTML = `<div class="es-innen">
      <div class="es-marke">Erzwelt</div>
      <h1 id="es-titel">Woher kommt dein Ladekabel?</h1>
      <div class="es-bild">
        ${BILD}
        ${chip(CU, "leitet den Strom", {left: 39, top: 5})}
        ${chip(AL, "Steckergehäuse", {left: 4, top: 82})}
        ${chip(SN, "Lötstelle", {right: 19, top: 57}, true)}
      </div>
      <p class="es-text">Drei Rohstoffe aus drei Ländern. Du baust die Kette auf, die daraus ein Kabel macht – und verkaufst es.</p>
      <ol class="es-kette" aria-label="Deine Lieferkette">
        ${KETTE.map(([ik, name]) => `<li><span class="es-ik">${IK[ik] || ""}</span>${name}</li>`).join("")}
      </ol>
      <button type="button" class="cta es-los">Firma gründen</button>
    </div>`;
    return el;
  }

  const ruhig = () => (typeof OPT !== "undefined" && OPT.anim === 0) || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function zeigen(){
    if (document.getElementById("einstieg")) return;
    const el = bauen();
    if (!ruhig()) el.classList.add("es-ablauf");
    document.body.appendChild(el);
    const los = el.querySelector(".es-los");
    const weiter = () => {
      S.einstiegGesehen = true;
      if (typeof speichern === "function") speichern();
      el.classList.add("es-weg");
      setTimeout(() => el.remove(), ruhig() ? 0 : 260);
      setTimeout(() => document.querySelector("#d-wahlen .wahl:not([disabled])")?.focus(), ruhig() ? 0 : 280);
    };
    los.addEventListener("click", weiter);
    el.addEventListener("keydown", e => { if (e.key === "Escape"){ e.preventDefault(); weiter(); } });
    // Nach der Schwierigkeitswahl (die ihren Knopf nach 60 ms fokussiert) den Fokus hierher holen
    setTimeout(() => los.focus({focusVisible: false}), 150);   // kein Fokusrahmen auf dem Handy
  }
  const brauchtEinstieg = () => S && !S.einstiegGesehen && !SCHWIERIGKEIT[S.schwierigkeit] && !S.ende;

  /* Bei jeder neuen Runde: zuerst das Startbild, die Schwierigkeitswahl liegt darunter bereit. */
  const vorher = schwierigkeitZeigen;
  schwierigkeitZeigen = function(){
    const out = vorher.apply(this, arguments);
    if (brauchtEinstieg()) zeigen();
    return out;
  };
  if (brauchtEinstieg() && !$("#schleier").hidden) zeigen();

  window.__erzweltEinstieg = {version: VERSION, zeigen};
})();

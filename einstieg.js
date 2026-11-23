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

  const style = document.createElement("style");
  style.id = "erzwelt-einstieg-style";
  style.textContent = `
    #einstieg{position:fixed;inset:0;z-index:120;overflow:auto;color:#fff;
      background:radial-gradient(120% 80% at 50% 0%,#14587a 0%,#0b3648 55%,#082a39 100%)}
    #einstieg .es-innen{max-width:440px;margin:0 auto;min-height:100%;display:flex;flex-direction:column;justify-content:center;
      padding:calc(env(safe-area-inset-top) + 22px) 22px calc(env(safe-area-inset-bottom) + 22px)}
    #einstieg .es-marke{font-family:"Baloo 2",sans-serif;font-weight:800;font-size:var(--f1);color:var(--gold);opacity:.9}
    #einstieg h1{font-family:"Baloo 2",sans-serif;font-weight:800;font-size:clamp(30px,8.6vw,40px);line-height:1.02;margin:6px 0 4px;letter-spacing:-.01em}
    #einstieg .es-bild{position:relative;margin:12px -6px 4px;aspect-ratio:340/250}
    #einstieg .es-kabel{display:block;width:100%;height:auto;margin-top:6%}
    #einstieg .es-chip{position:absolute;display:flex;align-items:flex-start;gap:7px;max-width:52%}
    #einstieg .es-chip.es-rechts{flex-direction:row-reverse;text-align:right}
    #einstieg .es-chip.es-rechts .es-txt{align-items:flex-end}
    #einstieg .es-sym{flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;
      font-family:"Baloo 2",sans-serif;font-weight:800;font-size:16px;color:#fff;box-shadow:inset 0 0 0 2px #ffffff40}
    #einstieg .es-txt{display:flex;flex-direction:column;line-height:1.15;min-width:0}
    #einstieg .es-txt b{font-family:"Baloo 2",sans-serif;font-weight:800;font-size:var(--f2)}
    #einstieg .es-txt small{font-size:var(--f0);font-weight:700;color:#cfe4ef}
    #einstieg .es-txt small.es-ort{color:var(--gold);font-weight:800}
    #einstieg .es-text{font-size:var(--f2);font-weight:600;line-height:1.45;color:#e2eef5;margin:8px 0 14px;max-width:34ch}
    #einstieg .es-kette{list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:0;padding:0}
    #einstieg .es-kette li{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;
      font-size:var(--f0);font-weight:800;color:#cfe4ef;text-align:center}
    #einstieg .es-kette li + li::before{content:"";position:absolute;top:21px;right:calc(50% + 24px);width:calc(100% - 48px);
      border-top:2px dashed #ffffff40}
    #einstieg .es-ik{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#ffffff14;color:#fff}
    #einstieg .es-ik svg{width:24px;height:24px}
    #einstieg .es-los{margin-top:28px;font-size:var(--f4)}
    #einstieg.es-weg{opacity:0;transition:opacity .25s ease}

    /* Ein Ablauf: Kabel zeichnen, dann Kupfer, Aluminium, Zinn */
    #einstieg.es-ablauf .es-mantel{stroke-dasharray:330;stroke-dashoffset:330;animation:esZeichnen .9s .15s ease-out forwards}
    #einstieg.es-ablauf .es-kern,#einstieg.es-ablauf .es-loet,#einstieg.es-ablauf .es-zeiger,
    #einstieg.es-ablauf .es-chip{opacity:0;animation:esRein .45s ease-out forwards}
    #einstieg.es-ablauf .es-kern,#einstieg.es-ablauf .z1,#einstieg.es-ablauf .es-chip:nth-of-type(1){animation-delay:1s}
    #einstieg.es-ablauf .z2,#einstieg.es-ablauf .es-chip:nth-of-type(2){animation-delay:1.35s}
    #einstieg.es-ablauf .es-loet,#einstieg.es-ablauf .z3,#einstieg.es-ablauf .es-chip:nth-of-type(3){animation-delay:1.7s}
    @keyframes esZeichnen{to{stroke-dashoffset:0}}
    @keyframes esRein{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  `;
  document.head.appendChild(style);
  window.__erzweltEinstieg = {version: VERSION, zeigen};
})();

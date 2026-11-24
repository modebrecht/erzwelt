"use strict";

const kabelQuerschnitt = (() => {
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
    <path class="es-mantel" d="M66 168C120 168 112 110 168 108S224 76 262 76" fill="none" stroke="#607b91" stroke-width="12" stroke-linecap="round"/>
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

  const style = document.createElement("style");
  style.textContent = `
    .es-bild{position:relative;aspect-ratio:340/275;color:#fff;background:#0b3648;border-radius:14px}
    .es-bild .es-kabel{display:block;width:100%;height:auto;margin-top:0}
    .es-bild .es-chip{position:absolute;display:flex;align-items:flex-start;gap:7px;max-width:52%}
    .es-bild .es-chip.es-rechts{flex-direction:row-reverse;text-align:right}
    .es-bild .es-chip.es-rechts .es-txt{align-items:flex-end}
    .es-bild .es-sym{flex:none;width:27px;height:27px;border-radius:10px;display:grid;place-items:center;
      font-family:"Baloo 2",sans-serif;font-weight:800;font-size:16px;color:#fff;box-shadow:inset 0 0 0 2px #ffffff40}
    .es-bild .es-txt{display:flex;flex-direction:column;line-height:1.15;min-width:0}
    .es-bild .es-txt b{font-family:"Baloo 2",sans-serif;font-weight:800;font-size:var(--f1)}
    .es-bild .es-txt small{font-size:clamp(11px,var(--f0),16px);font-weight:700;color:#cfe4ef}
    .es-bild .es-txt small.es-ort{color:var(--gold);font-weight:800}
    /* Ein Ablauf: Kabel zeichnen, dann Kupfer, Aluminium, Zinn */
    .es-bild.es-ablauf .es-mantel{stroke-dasharray:330;stroke-dashoffset:330;animation:esZeichnen .9s .15s ease-out forwards}
    .es-bild.es-ablauf .es-kern,.es-bild.es-ablauf .es-loet,.es-bild.es-ablauf .es-zeiger,
    .es-bild.es-ablauf .es-chip{opacity:0;animation:esRein .45s ease-out forwards}
    .es-bild.es-ablauf .es-kern,.es-bild.es-ablauf .z1,.es-bild.es-ablauf .es-chip:nth-of-type(1){animation-delay:1s}
    .es-bild.es-ablauf .z2,.es-bild.es-ablauf .es-chip:nth-of-type(2){animation-delay:1.35s}
    .es-bild.es-ablauf .es-loet,.es-bild.es-ablauf .z3,.es-bild.es-ablauf .es-chip:nth-of-type(3){animation-delay:1.7s}
    @keyframes esZeichnen{to{stroke-dashoffset:0}}
    @keyframes esRein{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}

    @media(prefers-reduced-motion:reduce){
      .es-bild.es-ablauf *{animation:none!important;opacity:1!important}
      .es-bild.es-ablauf .es-mantel{stroke-dashoffset:0}
    }
    [data-anim="0"] .es-bild.es-ablauf *{animation:none!important;opacity:1!important}
    [data-anim="0"] .es-bild.es-ablauf .es-mantel{stroke-dashoffset:0}
  `;
  document.head.appendChild(style);

  return () => `<div class="es-bild es-ablauf">
    ${BILD}
    ${chip(CU, "leitet den Strom", {left:36, top:4})}
    ${chip(AL, "Steckergehäuse", {left:4, top:79})}
    ${chip(SN, "Lötstelle", {right:5, top:52}, true)}
  </div>`;
})();

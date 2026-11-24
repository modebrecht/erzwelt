"use strict";
/* Karte in der Mitte, Arbeiter an den Quellen:
   - Der grosse runde Knopf unten führt zur Weltkarte (Weltkugel). Team ist
     ein normaler Reiter; eine kleine Zahl zeigt Leute ohne Aufgabe.
   - Oben: «Ohne Aufgabe 10/54» statt «Team frei».
   - An jeder fördernden Rohstoffquelle arbeiten 1–3 kleine Figuren mit
     Spitzhacke (mehr Personal = mehr Figuren). Streik oder Stillstand:
     Figuren stehen still und grau. «Animationen: aus» stoppt sie.
   Nur Darstellung, keine Spiellogik. */
(function(){
  const VERSION = 1;
  const style = document.createElement("style");
  style.id = "erzwelt-karte-mitte-style";
  style.textContent = `
    .orbring.globus{background:radial-gradient(circle at 34% 28%,#bfe6f7 0%,#4fa3d1 45%,#1f6f9c 100%);box-shadow:0 6px 0 #154e6e,0 10px 22px #0007}
    .orbring.globus::before{border-color:#6fb8e055}
    #dock button.orb:active .orbring.globus{box-shadow:0 2px 0 #154e6e,0 4px 10px #0006}
    .orbring.globus svg{width:46px!important}
    #dock .dock-zahl{position:absolute;top:0;left:calc(50% + 6px);min-width:20px;height:20px;padding:0 5px;border-radius:99px;
      background:var(--gold);color:#4a3000;border:2px solid #0b3648;display:grid;place-items:center;
      font-size:11px;font-weight:800;font-family:"Baloo 2",sans-serif;line-height:1}

    .knopf > .pin-arbeiter{position:absolute;left:calc(100% - 3px);bottom:-5px;display:flex;gap:0;pointer-events:none;z-index:4}
    .knopf > .pin-arbeiter svg{width:12px;height:16px;overflow:visible;filter:drop-shadow(0 1px 1px #0008)}
    .pin-arbeiter .hacke{transform-origin:7px 9px;animation:hacken .9s ease-in-out infinite}
    .pin-arbeiter svg:nth-child(2) .hacke{animation-delay:-.3s}
    .pin-arbeiter svg:nth-child(3) .hacke{animation-delay:-.6s}
    @keyframes hacken{0%,100%{transform:rotate(-38deg)}55%{transform:rotate(22deg)}}
    .pin-arbeiter.steht{filter:grayscale(1);opacity:.75}
    .pin-arbeiter.steht .hacke{animation:none;transform:rotate(-10deg)}
    body[data-anim="0"] .pin-arbeiter .hacke{animation:none}
    @media (prefers-reduced-motion:reduce){.pin-arbeiter .hacke{animation:none}}
  `;
  document.head.appendChild(style);

  /* ---------- Dock: Karte in der Mitte ---------- */
  const globus = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="#ffffff22" stroke="#fff" stroke-width="2.6"/>
    <ellipse cx="24" cy="24" rx="7.5" ry="17" fill="none" stroke="#fff" stroke-width="2.2"/>
    <path d="M7.5 18.5h33M7.5 29.5h33M24 7v34" fill="none" stroke="#fff" stroke-width="2.2"/></svg>`;
  const REIHE = [
    {s:"markt", t:"Markt", ik:() => IK.markt},
    {s:"team", t:"Team", ik:() => ikonTeam(2, 26, .72)},
    {s:"karte", t:"Karte", orb:true},
    {s:"ziel", t:"Ziel", ik:() => IK.ziel},
    {s:"wissen", t:"Wissen", ik:() => IK.wissen}
  ];
  dockZeichnen = function(){
    const frei = freieArbeiter();
    const html = REIHE.map(d => d.orb
      ? `<button class="orb" role="tab" data-seite="karte" aria-selected="${aktiveSeite === "karte"}" aria-label="Weltkarte"><span class="orbring globus">${globus}</span>Karte</button>`
      : `<button role="tab" data-seite="${d.s}" aria-selected="${aktiveSeite === d.s}"${d.s === "team" && frei > 0 ? ` aria-label="Team – ${frei} ohne Aufgabe"` : ""}>${d.ik()}${d.t}`
        + (d.s === "team" && frei > 0 ? `<span class="dock-zahl">${frei}</span>` : "") + `</button>`).join("");
    const dock = $("#dock");
    // Nur neu schreiben, wenn sich etwas ändert (Zustände wie «wink» bleiben sonst erhalten)
    const schluessel = html.replace(/\s+/g, " ");
    if (dock.dataset.stand !== schluessel){ dock.innerHTML = html; dock.dataset.stand = schluessel; }
  };

  /* ---------- Oben: «Ohne Aufgabe» ---------- */
  const hudLabel = document.querySelector("#hud .pille.crew small");
  if (hudLabel){
    hudLabel.textContent = "Ohne Aufgabe";
    hudLabel.closest(".pille").title = "Leute ohne Aufgabe / Personal insgesamt";
  }

  /* ---------- Arbeiter an fördernden Quellen ---------- */
  const figur = `<svg viewBox="0 0 13 17" aria-hidden="true">
    <circle cx="6" cy="3" r="2.4" fill="#f5b73d" stroke="#5b3a00" stroke-width=".8"/>
    <path d="M3.4 7.2Q6 5.6 8.6 7.2V11H3.4Z" fill="#2f6f9a" stroke="#123" stroke-width=".7"/>
    <path d="M4.3 11v4.6M7.7 11v4.6" stroke="#123" stroke-width="1.6" stroke-linecap="round"/>
    <g class="hacke"><path d="M7 9 11.2 2.6" stroke="#6b4a2a" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M9.1 1.6Q11.6 1.2 13 3" fill="none" stroke="#cfd6dc" stroke-width="1.4" stroke-linecap="round"/></g></svg>`;
  function arbeiterZeigen(){
    for (const pin of document.querySelectorAll('#welt .pin[data-pin="mine"]')){
      const m = S.minen[pin.dataset.id];
      const knopf = pin.querySelector(".knopf");
      let el = knopf?.querySelector(":scope > .pin-arbeiter");
      if (!m || !(m.arbeiter > 0)){ el?.remove(); continue; }
      const n = m.arbeiter >= 30 ? 3 : m.arbeiter >= 10 ? 2 : 1;
      const steht = m.stillBis > S.tag;
      if (!knopf) continue;
      if (!el){ el = document.createElement("span"); el.className = "pin-arbeiter"; knopf.appendChild(el); }
      if (el.dataset.n !== String(n)){ el.innerHTML = figur.repeat(n); el.dataset.n = String(n); }
      el.classList.toggle("steht", steht);
    }
  }
  if (typeof pinsZeichnen === "function"){
    const vorher = pinsZeichnen;
    pinsZeichnen = function(){ const out = vorher.apply(this, arguments); arbeiterZeigen(); return out; };
  }
  if (typeof zeichnen === "function"){
    const vorherZ = zeichnen;
    zeichnen = function(){ const out = vorherZ.apply(this, arguments); arbeiterZeigen(); return out; };
  }
  dockZeichnen();
  window.__erzweltKarteMitte = {version:VERSION};
})();

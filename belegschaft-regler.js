"use strict";
/* ============================================================
   BELEGSCHAFT-REGLER

   Personal in Rohstoffquelle, Raffinerie, Fabrik und Verkauf wird mit
   einem Regler verteilt statt mit −10 / − / + / +10:
   - Zeile: − · Zahl «von Plätzen» · +   (einzelne Personen, gut antippbar)
   - darunter ein Regler 0 … Plätze. Der Teil, den das freie Team nicht
     füllen kann, ist schraffiert; weiter schieben geht nicht.
   - Im Tutorial zeigt eine Marke, wie viele Personen das Ziel verlangt;
     der Regler reicht nur so weit, wie die Einführung Personal braucht.
   Übernommen wird beim Loslassen, über die bestehende Spiellogik
   (data-tun crew/rcrew/fcrew/vcrew). Keine neue Wirtschaft.
   ============================================================ */
(function(){
  const VERSION = 1;
  const FARBE = {crew:"#6fb8e0", rcrew:"#5b8f7a", fcrew:"#b5703c", vcrew:"#e5a83a"};

  /* Alte Crewzeile (−n, −, Zahl, +, +n) samt Fortschrittsleiste direkt danach. */
  const ALT = /<div class="crewzeile">\s*<button data-tun="(crew|rcrew|fcrew|vcrew)"([^>]*)>[^<]*<\/button>\s*<button[^>]*>[^<]*<\/button>\s*<div class="zahl"><b>(\d+)<\/b><small>([^<]*)<\/small><\/div>\s*<button[^>]*>[^<]*<\/button>\s*<button[^>]*>[^<]*<\/button>\s*<\/div>(\s*<div class="leiste"><i style="[^"]*"><\/i><\/div>)?/g;

  const attr = (s, name) => { const m = s.match(new RegExp(`data-${name}="([^"]*)"`)); return m ? m[1] : null; };
  const prozent = (v, max) => (max > 0 ? Math.min(100, Math.max(0, v / max * 100)) : 0).toFixed(1) + "%";

  function zielFuer(tun, ref){
    const api = window.__erzweltEinfuehrung;
    return api && typeof api.besetzungsZiel === "function" ? api.besetzungsZiel(tun, ref) : null;
  }

  function obergrenze(tun, ref){
    const api = window.__erzweltEinfuehrung;
    return api && typeof api.obergrenze === "function" ? api.obergrenze(tun, ref) : null;
  }

  function bauen(tun, attrs, wert, klein){
    const id = attr(attrs, "id"), i = attr(attrs, "i");
    const ref = id !== null ? `data-id="${id}"` : i !== null ? `data-i="${i}"` : "";
    const vonMatch = klein.match(/von\s+(\d+)/);
    let max = vonMatch ? +vonMatch[1] : (typeof VERKAUF_PLAETZE === "number" ? VERKAUF_PLAETZE : 40);
    const plaetze = max;
    const frei = Math.max(0, freieArbeiter());
    const r = id !== null ? id : i !== null ? +i : null;
    // In der Einführung nur so viele, wie gebraucht werden (alte Spielstände: nie unter den Ist-Wert).
    const grenze = obergrenze(tun, r);
    if (grenze !== null) max = Math.min(plaetze, Math.max(grenze, wert));
    const erreichbar = grenze !== null
      ? Math.min(max, Math.max(wert, Math.min(grenze, wert + frei)))
      : Math.min(max, wert + frei);
    const ziel = zielFuer(tun, r);
    const zielMarke = ziel && ziel <= max ? `<span class="besetzung-ziel ${wert >= ziel ? "ok" : ""}" style="--z:${(ziel / max).toFixed(4)}"><i></i><b>${wert >= ziel ? "✓ " : ""}Ziel ${ziel}</b></span>` : "";
    const unten = tun === "vcrew" ? "im Verkauf" : `von ${plaetze}`;
    const hinweis = grenze !== null && wert + frei >= grenze
      ? `Einführung: ${grenze} reichen`
      : erreichbar < max
        ? (frei > 0 ? `Noch ${frei} frei im Team` : "Niemand frei im Team")
        : `${frei} frei im Team`;
    return `<div class="besetzung" data-art="${tun}" ${ref} data-wert="${wert}" data-max="${max}" data-erreichbar="${erreichbar}">
      <div class="besetzung-zeile">
        <button class="besetzung-schritt" data-tun="${tun}" ${ref} data-n="-1" ${wert <= 0 ? "disabled" : ""} aria-label="Eine Person weniger">−</button>
        <div class="zahl"><b>${wert}</b><small>${unten}</small></div>
        <button class="besetzung-schritt" data-tun="${tun}" ${ref} data-n="1" ${wert >= erreichbar ? "disabled" : ""} aria-label="Eine Person mehr">+</button>
      </div>
      <div class="besetzung-bahn ${zielMarke ? "mit-ziel" : ""}">
        <input type="range" class="regler besetzung-regler" min="0" max="${max}" step="1" value="${wert}"
          style="--c:${FARBE[tun]};--p:${prozent(wert, max)};--g:${prozent(erreichbar, max)}"
          aria-label="Personal" aria-valuetext="${wert} von ${max} Personen">
        ${zielMarke}
      </div>
      <div class="besetzung-skala"><span>0</span><span>${hinweis}</span><span>${max}</span></div>
      <button class="besetzung-anwenden" data-tun="${tun}" ${ref} data-n="0" tabindex="-1" aria-hidden="true"></button>
    </div>`;
  }

  const umbauen = html => typeof html === "string"
    ? html.replace(ALT, (_, tun, attrs, wert, klein) => bauen(tun, attrs, +wert, klein))
    : html;

  const mitRegler = vorher => function(){ return umbauen(vorher.apply(this, arguments)); };
  blattMine = mitRegler(blattMine);
  blattRaff = mitRegler(blattRaff);
  blattFab = mitRegler(blattFab);
  seiteMarkt = mitRegler(seiteMarkt);

  /* ---------- Bedienung ---------- */
  let gezogen = null;          // Regler, der gerade gezogen wird

  function anzeigen(r){
    const box = r.closest(".besetzung");
    if (!box) return;
    const max = +box.dataset.max, erreichbar = +box.dataset.erreichbar;
    if (+r.value > erreichbar) r.value = erreichbar;
    const v = +r.value;
    r.style.setProperty("--p", prozent(v, max));
    r.setAttribute("aria-valuetext", `${v} von ${max} Personen`);
    const b = box.querySelector(".zahl b");
    if (b) b.textContent = v;
    const z = box.querySelector(".besetzung-ziel");
    if (z){
      const ziel = Math.round(+z.style.getPropertyValue("--z") * max);
      z.classList.toggle("ok", v >= ziel);
      z.querySelector("b").textContent = (v >= ziel ? "✓ " : "") + "Ziel " + ziel;
    }
  }

  function anwenden(r){
    if (gezogen === r) gezogen = null;
    reglerAktiv = false;
    const box = r.closest(".besetzung");
    if (!box || !box.isConnected) return;
    anzeigen(r);
    const alt = +box.dataset.wert, neu = +r.value;
    if (neu === alt){ blattStand = ""; seitenStand = ""; zeichnen(); return; }
    box.dataset.wert = neu;
    const knopf = box.querySelector(".besetzung-anwenden");
    // Funken erscheinen beim Griff des Reglers
    const bahn = r.getBoundingClientRect(), anteil = neu / Math.max(1, +box.dataset.max);
    knopf.style.left = (anteil * (bahn.width - 34) + 17) + "px";
    knopf.dataset.n = neu - alt;
    knopf.click();
  }

  const greifen = e => {
    const r = e.target.closest && e.target.closest(".besetzung-regler");
    if (!r) return;
    gezogen = r; reglerAktiv = true;
  };
  document.addEventListener("pointerdown", greifen, true);
  document.addEventListener("touchstart", greifen, {capture:true, passive:true});
  document.addEventListener("input", e => {
    const r = e.target.closest && e.target.closest(".besetzung-regler");
    if (!r) return;
    gezogen = r; reglerAktiv = true;
    anzeigen(r);
  });
  document.addEventListener("change", e => {
    const r = e.target.closest && e.target.closest(".besetzung-regler");
    if (r) anwenden(r);
  });
  const loslassen = () => {
    const r = gezogen;
    if (r) setTimeout(() => { if (gezogen === r) anwenden(r); }, 40);
  };
  document.addEventListener("pointerup", loslassen, true);
  document.addEventListener("pointercancel", loslassen, true);
  document.addEventListener("touchend", loslassen, true);

  /* Solange ein Regler im Blatt gezogen wird, das Blatt nicht neu zeichnen –
     sonst springt der Griff unter dem Finger weg. */
  if (typeof blattFuellen === "function"){
    const vorher = blattFuellen;
    blattFuellen = function(art, id){
      if (gezogen && gezogen.isConnected && offenesBlatt && offenesBlatt.art === art && String(offenesBlatt.id) === String(id)) return;
      return vorher.apply(this, arguments);
    };
  }

  const style = document.createElement("style");
  style.id = "erzwelt-belegschaft-regler-style";
  style.textContent = `
    .besetzung{position:relative;margin:12px 0 4px}
    .besetzung-zeile{display:flex;align-items:center;justify-content:center;gap:14px}
    .besetzung-zeile .zahl{min-width:96px;text-align:center}
    .besetzung-zeile .zahl b{display:block;font-family:"Baloo 2",sans-serif;font-size:var(--f6);line-height:1;font-variant-numeric:tabular-nums}
    .besetzung-zeile .zahl small{color:var(--grau);font-size:var(--f0);font-weight:700}
    .besetzung-schritt{width:56px;height:56px;border-radius:16px;border:0;background:#f3e8d2;color:var(--tinte,#2b2116);
      font-family:"Baloo 2",sans-serif;font-size:30px;font-weight:800;line-height:1;box-shadow:0 4px 0 #e0d3b8;cursor:pointer}
    .besetzung-schritt:active{transform:translateY(2px);box-shadow:0 1px 0 #e0d3b8}
    .besetzung-schritt:disabled{opacity:.35}
    .besetzung-bahn{position:relative;margin:6px 0 0}
    .besetzung-bahn.mit-ziel{padding-bottom:20px}
    .besetzung-regler{display:block;height:44px}
    .besetzung-regler::-webkit-slider-runnable-track{
      background:linear-gradient(90deg,var(--c) 0 var(--p),#e3d7bf var(--p) var(--g),transparent var(--g)),
        repeating-linear-gradient(135deg,#efe7d7 0 5px,#d9ccb2 5px 10px)}
    .besetzung-regler::-webkit-slider-thumb{border-color:var(--c)}
    .besetzung-regler::-moz-range-track{
      background:linear-gradient(90deg,#e3d7bf 0 var(--g),transparent var(--g)),
        repeating-linear-gradient(135deg,#efe7d7 0 5px,#d9ccb2 5px 10px)}
    .besetzung-regler::-moz-range-progress{background:var(--c)}
    .besetzung-regler::-moz-range-thumb{border-color:var(--c)}
    .besetzung-ziel{position:absolute;top:32px;left:calc(17px + (100% - 34px) * var(--z));transform:translateX(-50%);
      display:flex;flex-direction:column;align-items:center;pointer-events:none;color:#8a5a00}
    .besetzung-ziel i{width:3px;height:9px;border-radius:2px;background:currentColor}
    .besetzung-ziel b{font-size:11px;font-weight:800;white-space:nowrap;background:#fff2c9;border-radius:99px;padding:0 7px;line-height:16px}
    .besetzung-ziel.ok{color:#1f7a4f}
    .besetzung-ziel.ok b{background:#e0f2e8}
    .besetzung-skala{display:flex;justify-content:space-between;gap:8px;color:var(--grau);font-size:var(--f0);font-weight:700;margin-top:2px}
    .besetzung-skala span:nth-child(2){text-align:center}
    .besetzung-anwenden{position:absolute;top:70px;left:50%;width:1px;height:1px;padding:0;border:0;opacity:0;pointer-events:none}
  `;
  document.head.appendChild(style);

  blattStand = ""; seitenStand = "";
  window.__erzweltBelegschaftRegler = {version:VERSION};
})();

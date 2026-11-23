"use strict";
/* Premium-Spielgefühl (nur Darstellung, keine Änderung an Wirtschaft):
   1. Rohstoff auf einen Blick: Auch noch nicht eröffnete Rohstoffquellen
      zeigen Kürzel und Farbe ihres Rohstoffs (Cu, Al, Sn …). Im Aufgabentext
      steht das Kürzel hinter dem Rohstoffnamen: «Kupfer (Cu)».
   2. Lieferkette lebt: Von jeder fördernden Quelle fährt Ware zur nächsten
      Raffinerie, von dort Material zu jeder laufenden Fabrik. Steht die Zeit
      still, steht auch die Ware still.
   3. Münzen: Kommt der Verkauf in der Kasse an, fallen Münzen hinein.
   4. Monatsabschluss als kleine Bilanz: laufendes Geschäft (Einnahmen minus
      Löhne und Betrieb) mit Trendpfeil, dazu was investiert wurde.
   5. Der Verkaufsbetrag erscheint kurz im Kassen-Feld statt darunter
      (dort liegt jetzt «Verlauf»).
   6. Beispiel-Lieferweg als kleiner Knopf unter «Verlauf» statt als
      Textkasten unten auf der Karte; Antippen zeigt die Erklärung. */
(function(){
  const VERSION = 1;
  const reduziert = () => (typeof OPT !== "undefined" && OPT.anim === 0)
    || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const style = document.createElement("style");
  style.id = "erzwelt-premium-spielgefuehl-style";
  style.textContent = `
    /* 1. Rohstoff-Pins */
    .pin.mat-pin.zu .knopf{color:#6d5e46;color:color-mix(in srgb,var(--mat) 60%,#1d1408)}
    .pin.mat-pin.zu:not(.wink):not(.alarm) .knopf{border-color:var(--mat);border-width:3px}
    .pin.mat-pin.zu:not(.wink) .knopf::after{border-top-color:var(--mat)}
    .pin.mat-pin .knopf .sym{font-size:15px;letter-spacing:-.01em}

    /* 3. Münzen */
    #muenz-ebene{position:fixed;inset:0;z-index:72;pointer-events:none;overflow:hidden}
    .muenz-flug{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;
      background:radial-gradient(circle at 35% 30%,#fff3c4 0 22%,#f8c84a 23% 62%,#d99a17 63%);
      border:1.5px solid #b07a0e;box-shadow:0 1px 2px #0005}
    .muenz-flug::after{content:"";position:absolute;inset:3px;border-radius:50%;border:1px solid #fff5}
    .pille.kasse.muenz-glanz i{animation:muenzGlanz .45s ease}
    @keyframes muenzGlanz{0%{box-shadow:0 0 0 0 #f5b73d00}40%{box-shadow:0 0 0 6px #f5b73d66;transform:scale(1.12)}100%{box-shadow:0 0 0 10px #f5b73d00;transform:scale(1)}}
    .verkauf-geld{display:none!important}
    body.fensterauf .verkauf-paket{display:none!important}
    .pille.kasse > div{position:relative}
    .pille.kasse .kasse-plus{position:absolute;left:0;top:0;white-space:nowrap;color:#7fe0a8;font-size:var(--f0);
      font-weight:800;line-height:1;letter-spacing:.02em;background:#0b3648;border-radius:4px;padding-right:3px;
      animation:kassePlus 1.5s ease both}
    @keyframes kassePlus{0%{opacity:0;transform:translateY(4px)}12%,78%{opacity:1;transform:none}100%{opacity:0}}

    /* 6. Beispiel-Lieferweg */
    #didaktik-route-note{display:none!important}
    #lieferweg-knopf{position:absolute;left:10px;top:calc(var(--hudh) - 1px);z-index:26;max-width:calc(100% - 20px);
      display:flex;align-items:center;gap:7px;padding:6px 11px 6px 8px;border-radius:13px;
      background:#0b3648ee;color:#fff;border:2px solid #ffffff2e;box-shadow:0 3px 0 #00000030;
      font-family:"Baloo 2",sans-serif;font-size:var(--f0);font-weight:800;line-height:1.15;text-align:left}
    #lieferweg-knopf[hidden]{display:none}
    #lieferweg-knopf .lw-ikon{font-size:16px}
    #lieferweg-knopf small{display:block;font-weight:700;opacity:.75}
    #lieferweg-knopf .lw-mehr{display:none;font-family:system-ui,sans-serif;font-weight:600;font-size:var(--f0);
      opacity:.85;margin-top:4px;max-width:270px}
    #lieferweg-knopf.offen{z-index:47;box-shadow:0 10px 26px #0006}
    #lieferweg-knopf.offen .lw-mehr{display:block}
    body.fensterauf #lieferweg-knopf{display:none}

    /* 4. Monatsbilanz */
    .toast .mb-kopf{display:block}
    .toast .mb-plus{color:#7fe0a8}
    .toast .mb-minus{color:#ff9a95}
    .toast .mb-trend{font-size:.95em;margin-left:2px}
    .toast .mb-zeile{display:block;font-weight:700;margin-top:2px}
    .toast .mb-klein{display:block;font-weight:600;opacity:.75;font-size:.92em;margin-top:1px}
    .toast .mb-zahl{white-space:nowrap}
  `;
  document.head.appendChild(style);

  /* ---------- 1. Rohstoff auf einen Blick ---------- */
  function pinsMitRohstoff(){
    for (const pin of document.querySelectorAll('#welt .pin[data-pin="mine"]')){
      const def = MINEN.find(d => d.id === pin.dataset.id);
      if (!def) continue;
      const mat = MATERIAL[def.mat];
      pin.classList.add("mat-pin");
      pin.style.setProperty("--mat", mat.farbe);
      if (pin.classList.contains("zu")){
        const knopf = pin.querySelector(".knopf");
        const icon = knopf?.querySelector(":scope > svg");
        if (icon && !knopf.querySelector(".sym")){
          const s = document.createElement("span");
          s.className = "sym"; s.textContent = mat.sym;
          icon.replaceWith(s);
        }
      }
      const label = pin.getAttribute("aria-label") || "";
      if (!label.includes(mat.name)) pin.setAttribute("aria-label", `${label}, ${mat.name}`);
    }
  }
  if (typeof pinsZeichnen === "function"){
    const vorherPins = pinsZeichnen;
    pinsZeichnen = function(){ const out = vorherPins.apply(this, arguments); pinsMitRohstoff(); return out; };
  }

  // «Kupfer» → «Kupfer (Cu)» im Aufgabentext (je Rohstoff einmal)
  const buchstabe = "A-Za-zÄÖÜäöüß";
  function kuerzelImText(el){
    if (!el || el.dataset.kuerzel === el.textContent) return;
    let t = el.textContent;
    for (const m of Object.values(MATERIAL)){
      const re = new RegExp(`(^|[^${buchstabe}])${m.name}(?![${buchstabe}]| \\()`);
      t = t.replace(re, `$1${m.name} (${m.sym})`);
    }
    if (t !== el.textContent) el.textContent = t;
    el.dataset.kuerzel = el.textContent;
  }
  if (typeof questZeichnen === "function"){
    const vorherQuest = questZeichnen;
    questZeichnen = function(){
      const out = vorherQuest.apply(this, arguments);
      kuerzelImText(document.getElementById("q-text"));
      return out;
    };
  }

  /* ---------- 2. Lieferkette lebt ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, String(attrs[k])); return e; };
  const abstand = (a, b) => { const p = px(a), q = px(b); return Math.hypot(p[0]-q[0], p[1]-q[1]); };
  function bogen(a, b, k){
    const p = px(a), q = px(b);
    const dx = q[0]-p[0], dy = q[1]-p[1], len = Math.max(1, Math.hypot(dx, dy));
    const off = Math.min(40, len * k);
    const cx = (p[0]+q[0])/2 - dy/len*off, cy = (p[1]+q[1])/2 + dx/len*off;
    return {d:`M ${p[0].toFixed(1)} ${p[1].toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`, len};
  }
  function beispielSichtbar(){
    if (typeof beispielKette !== "function") return null;
    if (aktiveSeite !== "karte" || offenesBlatt || tutorialLaeuft()) return null;
    try { return beispielKette(); } catch (e){ return null; }
  }
  function flussVerbindungen(){
    const links = [];
    if (typeof ebenen === "undefined") return links;
    const beispiel = beispielSichtbar();
    const raffAlle = Object.keys(S.raff || {});
    const raffAktiv = raffAlle.filter(id => S.raff[id].arbeiter > 0);
    if (ebenen.mine && ebenen.raff && raffAlle.length){
      const kandidaten = raffAktiv.length ? raffAktiv : raffAlle;
      for (const def of MINEN){
        const m = S.minen[def.id];
        if (!m || !(m.arbeiter > 0) || m.stillBis > S.tag) continue;
        let best = null, bestWert = Infinity;
        for (const rid of kandidaten){
          const wert = abstand(def.id, rid) * (((typeof RAFF_SPEZIAL !== "undefined" && RAFF_SPEZIAL[rid]) || []).includes(def.mat) ? .85 : 1);
          if (wert < bestWert){ bestWert = wert; best = rid; }
        }
        if (!best || (beispiel && beispiel.mineId === def.id && beispiel.raffId === best)) continue;
        links.push({von:def.id, nach:best, farbe:MATERIAL[def.mat].farbe, k:.12});
      }
    }
    if (ebenen.raff && ebenen.fab){
      const laender = [...new Set((S.fabriken || []).filter(f => !f.restbau && f.arbeiter > 0).map(f => f.land))];
      for (const rid of raffAktiv) for (const land of laender){
        if (beispiel && beispiel.raffId === rid && beispiel.fabId === "f_" + land) continue;
        links.push({von:rid, nach:"f_" + land, farbe:"#5b8f7a", k:-.1});
      }
    }
    return links;
  }
  let flussSchluessel = "";
  function lieferflussZeichnen(){
    const svg = document.querySelector("svg.weltkarte");
    if (!svg) return;
    const links = flussVerbindungen();
    const still = reduziert();
    const schnell = typeof tempo !== "undefined" && tempo >= 4 ? 1.8 : 1;
    const schluessel = JSON.stringify([links.map(l => l.von + ">" + l.nach), still, schnell]);
    const steht = typeof tempo !== "undefined" && tempo === 0;
    if (svg.pauseAnimations){ steht ? svg.pauseAnimations() : svg.unpauseAnimations(); }
    if (schluessel === flussSchluessel && svg.querySelector("#lieferfluss")) return;
    flussSchluessel = schluessel;
    svg.querySelector("#lieferfluss")?.remove();
    if (!links.length) return;
    const g = svgEl("g", {id:"lieferfluss", "pointer-events":"none"});
    for (const l of links){
      const {d, len} = bogen(l.von, l.nach, l.k);
      g.appendChild(svgEl("path", {d, fill:"none", stroke:"#0b3648", "stroke-width":4.2, "stroke-linecap":"round", opacity:.18}));
      g.appendChild(svgEl("path", {d, fill:"none", stroke:l.farbe, "stroke-width":2.2, "stroke-linecap":"round", "stroke-dasharray":"1.5 6", opacity:.85}));
      if (still) continue;
      const dauer = Math.min(9, Math.max(2.4, len / 55)) / schnell;
      const anzahl = len > 120 ? 3 : 2;
      for (let i = 0; i < anzahl; i++){
        const punkt = svgEl("circle", {r:3.6, fill:l.farbe, stroke:"#fffaf0", "stroke-width":1.3, opacity:0});
        const start = (i * dauer / anzahl).toFixed(2);
        punkt.appendChild(svgEl("animateMotion", {path:d, dur:dauer.toFixed(2) + "s", begin:start + "s", repeatCount:"indefinite"}));
        punkt.appendChild(svgEl("animate", {attributeName:"opacity", values:"0;1;1;0", keyTimes:"0;.12;.86;1", dur:dauer.toFixed(2) + "s", begin:start + "s", repeatCount:"indefinite"}));
        g.appendChild(punkt);
      }
    }
    const transport = svg.querySelector("#didaktik-transport");
    if (transport) svg.insertBefore(g, transport); else svg.appendChild(g);
  }
  if (typeof zeichnen === "function"){
    const vorherZeichnen = zeichnen;
    zeichnen = function(){ const out = vorherZeichnen.apply(this, arguments); lieferflussZeichnen(); return out; };
  }
  if (typeof tempoSetzen === "function"){
    const vorherTempo = tempoSetzen;
    tempoSetzen = function(){ const out = vorherTempo.apply(this, arguments); lieferflussZeichnen(); return out; };
  }

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

  /* ---------- 6. Beispiel-Lieferweg als kleiner Knopf ---------- */
  let lwKnopf = null;
  function lieferwegKnopf(){
    const r = typeof beispielKette === "function" ? (() => { try { return beispielKette(); } catch (e){ return null; } })() : null;
    const sichtbar = !!r && aktiveSeite === "karte" && !offenesBlatt;
    if (!lwKnopf){
      lwKnopf = document.createElement("button");
      lwKnopf.type = "button";
      lwKnopf.id = "lieferweg-knopf";
      lwKnopf.setAttribute("aria-expanded", "false");
      lwKnopf.addEventListener("click", ev => {
        ev.stopPropagation();
        const offen = lwKnopf.classList.toggle("offen");
        lwKnopf.setAttribute("aria-expanded", String(offen));
      });
      document.addEventListener("click", ev => {
        if (lwKnopf.classList.contains("offen") && !ev.target.closest("#lieferweg-knopf")){
          lwKnopf.classList.remove("offen"); lwKnopf.setAttribute("aria-expanded", "false");
        }
      });
      (document.getElementById("sicht") || document.body).appendChild(lwKnopf);
    }
    lwKnopf.hidden = !sichtbar;
    if (!sichtbar){ lwKnopf.classList.remove("offen"); return; }
    const mine = MINEN.find(x => x.id === r.mineId), raff = RAFF_ORTE.find(x => x.id === r.raffId);
    const km = Math.round(((r.d1 || 0) + (r.d2 || 0)) / 100) * 100;
    const inhalt = `<span class="lw-ikon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M2.6 6.6h10.9v9H2.6z"/><path d="M13.5 9.4h4.1l3 3.3v2.9h-7.1"/><circle cx="6.8" cy="17.3" r="1.8"/><circle cx="17" cy="17.3" r="1.8"/></svg></span><span>Lieferweg<small>≈ ${km.toLocaleString("de-CH")} km</small>`
      + `<span class="lw-mehr">${mine?.ort || ""} → ${raff?.ort || ""} → ${LAND[r.fabrik.land]?.name || ""}. LKW, Schiff, LKW. `
      + `Nur zur Orientierung: Transportkosten und Lieferzeiten rechnet das Spiel nicht.</span></span>`;
    if (lwKnopf.dataset.inhalt !== inhalt){ lwKnopf.innerHTML = inhalt; lwKnopf.dataset.inhalt = inhalt; }
  }
  if (typeof zeichnen === "function"){
    const vorherZ = zeichnen;
    zeichnen = function(){ const out = vorherZ.apply(this, arguments); lieferwegKnopf(); return out; };
  }

  if (typeof pinsZeichnen === "function"){ try { pinsMitRohstoff(); } catch (e){} }
  lieferflussZeichnen();
  window.__erzweltPremiumSpielgefuehl = {version:VERSION};
})();

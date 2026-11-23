"use strict";
/* ============================================================
   BELEGSCHAFT-REGLER

   Personal in Rohstoffquelle, Raffinerie, Fabrik und Verkauf wird mit
   einem Regler verteilt statt mit −10 / − / + / +10:
   - Zeile: − · Zahl «von Plätzen» · +   (einzelne Personen, gut antippbar)
   - darunter ein Regler 0 … Plätze. Hell: aus dem freien Team. Gelb: wird
     beim Loslassen neu eingestellt (einmalig CHF 1'800 pro Person), soweit
     das Geld reicht. Schraffiert: geht nicht.
   - Zwei Kacheln zeigen live: «Einmalig» (Einstellen) und «Jeden Monat» (Lohn).
   - Im Tutorial zeigt eine Marke, wie viele Personen das Ziel verlangt;
     der Regler reicht nur so weit, wie die Einführung Personal braucht.
   Übernommen wird beim Loslassen, über die bestehende Spiellogik
   (data-tun crew/rcrew/fcrew/vcrew). Keine neue Wirtschaft: Einstellen
   kostet dasselbe wie im Team-Reiter.
   Den Regler baut regler(tun, ref, wert, plaetze) (exportiert, von
   module/blaetter.js aufgerufen); im Markt ersetzt er vorerst noch die
   alte Crewzeile des Verkaufsteams.
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

  /* Lohn pro Person und Monat an dieser Station */
  function lohnProKopf(tun, ref){
    let l = 0;
    if (tun === "crew"){ const d = MINEN.find(x => x.id === ref), m = S.minen[ref]; if (d && m) l = LAND[d.land].lohn * LOHNSTUFE[m.stufe].faktor; }
    else if (tun === "rcrew"){ const d = RAFF_ORTE.find(x => x.id === ref); if (d) l = LAND[d.land].lohn; }
    else if (tun === "fcrew"){ const f = S.fabriken[+ref]; if (f) l = LAND[f.land].lohn; }
    else l = VERKAUF_LOHN;
    return l * (typeof perkMult === "function" ? perkMult("lohn") : 1);
  }
  const kannEinstellen = () => Math.max(0, Math.floor(S.kasse / LOHN_PRO_KOPF));

  /* Zwei Kacheln: was einmalig kostet, was jeden Monat */
  function kostenHtml(v, wert, frei, lohn){
    const d = v - wert;
    if (d > 0){
      const neu = Math.max(0, d - frei), ausTeam = d - neu;
      const wer = [ausTeam ? `${ausTeam} aus dem Team` : "", neu ? `${neu} neu eingestellt` : ""].filter(Boolean).join(" · ");
      return `<div class="kachel einmalig ${neu ? "" : "leer"}"><small>Einmalig</small><b>${neu ? chf(neu * LOHN_PRO_KOPF) : "CHF 0"}</b><span>${neu ? `${neu} × ${chf(LOHN_PRO_KOPF)} Einstellen` : "niemand neu"}</span></div>
        <div class="kachel monatlich"><small>Jeden Monat</small><b>+ ${chf(d * lohn)}</b><span>Lohn · ${wer}</span></div>`;
    }
    if (d < 0) return `<div class="kachel einmalig leer"><small>Einmalig</small><b>CHF 0</b><span>${-d} zurück ins Team</span></div>
        <div class="kachel monatlich"><small>Jeden Monat</small><b>− ${chf(-d * lohn)}</b><span>Lohn · im Team ohne Aufgabe je ${chf(200)}</span></div>`;
    return `<div class="kachel einmalig"><small>Einmalig</small><b>${chf(LOHN_PRO_KOPF)}</b><span>pro neue Person</span></div>
        <div class="kachel monatlich"><small>Jeden Monat</small><b>${chf(wert * lohn)}</b><span>Lohn hier · ${chf(lohn)} pro Person</span></div>`;
  }

  /* Der Regler für eine Station. ref: Id der Quelle/Raffinerie, Index der
     Fabrik in S.fabriken, beim Verkauf null. plaetze: Höchstzahl der Station. */
  function regler(tun, ref, wert, plaetze){
    const attr = tun === "fcrew" ? `data-i="${ref}"` : tun === "vcrew" || ref === null || ref === undefined ? "" : `data-id="${ref}"`;
    const r = tun === "fcrew" ? +ref : tun === "vcrew" ? null : ref;
    return reglerHtml(tun, attr, r, wert, plaetze);
  }

  function reglerHtml(tun, ref, r, wert, plaetze){
    let max = plaetze;
    const frei = Math.max(0, freieArbeiter());
    const lohn = lohnProKopf(tun, r);
    // Mehr Leute als frei sind werden beim Loslassen eingestellt, soweit das Geld reicht.
    let erreichbar = Math.min(max, wert + frei + kannEinstellen());
    // In der Einführung nur so viele, wie gebraucht werden (alte Spielstände: nie unter den Ist-Wert).
    const grenze = obergrenze(tun, r);
    if (grenze !== null){
      max = Math.min(plaetze, Math.max(grenze, wert));
      erreichbar = Math.min(max, Math.max(wert, Math.min(grenze, erreichbar)));
    }
    const ausTeam = Math.min(max, wert + frei);
    const ziel = zielFuer(tun, r);
    const zielMarke = ziel && ziel <= max ? `<span class="besetzung-ziel ${wert >= ziel ? "ok" : ""}" style="--z:${(ziel / max).toFixed(4)}"><i></i><b>${wert >= ziel ? "✓ " : ""}Ziel ${ziel}</b></span>` : "";
    const unten = tun === "vcrew" ? "im Verkauf" : `von ${plaetze}`;
    const hinweis = frei > 0 ? `${frei} frei im Team` : erreichbar > wert ? "Mehr = neu einstellen" : "Zu wenig Geld zum Einstellen";
    return `<div class="besetzung" data-art="${tun}" ${ref} data-wert="${wert}" data-max="${max}" data-erreichbar="${erreichbar}" data-frei="${frei}" data-lohn="${lohn}">
      <div class="besetzung-zeile">
        <button class="besetzung-schritt" data-tun="${tun}" ${ref} data-n="-1" ${wert <= 0 ? "disabled" : ""} aria-label="Eine Person weniger">−</button>
        <div class="zahl"><b>${wert}</b><small>${unten}</small></div>
        <button class="besetzung-schritt" data-tun="${tun}" ${ref} data-n="1" ${wert >= erreichbar ? "disabled" : ""} aria-label="Eine Person mehr">+</button>
      </div>
      <div class="besetzung-bahn ${zielMarke ? "mit-ziel" : ""}">
        <input type="range" class="regler besetzung-regler" min="0" max="${max}" step="1" value="${wert}"
          style="--c:${FARBE[tun]};--p:${prozent(wert, max)};--f:${prozent(ausTeam, max)};--g:${prozent(erreichbar, max)}"
          aria-label="Personal" aria-valuetext="${wert} von ${max} Personen">
        ${zielMarke}
      </div>
      <div class="besetzung-skala"><span>0</span><span>${hinweis}</span><span>${max}</span></div>
      <div class="besetzung-kosten">${kostenHtml(wert, wert, frei, lohn)}</div>
      <button class="besetzung-anwenden" data-tun="${tun}" ${ref} data-n="0" tabindex="-1" aria-hidden="true"></button>
    </div>`;
  }

  /* Markt (Verkaufsteam): alte Crewzeile vorerst noch ersetzen. Die Blätter
     rufen regler() direkt auf (module/blaetter.js). */
  function bauen(tun, attrs, wert, klein){
    const id = attr(attrs, "id"), i = attr(attrs, "i");
    const ref = id !== null ? `data-id="${id}"` : i !== null ? `data-i="${i}"` : "";
    const vonMatch = klein.match(/von\s+(\d+)/);
    const plaetze = vonMatch ? +vonMatch[1] : (typeof VERKAUF_PLAETZE === "number" ? VERKAUF_PLAETZE : 40);
    return reglerHtml(tun, ref, id !== null ? id : i !== null ? +i : null, wert, plaetze);
  }
  const umbauen = html => typeof html === "string"
    ? html.replace(ALT, (_, tun, attrs, wert, klein) => bauen(tun, attrs, +wert, klein))
    : html;
  const vorherMarkt = seiteMarkt;
  seiteMarkt = function(){ return umbauen(vorherMarkt.apply(this, arguments)); };

  /* ---------- Team: einmalige und monatliche Kosten getrennt zeigen ---------- */
  const lohnSpanne = () => {
    const l = Object.values(LAND).map(x => x.lohn);
    return `${chf(Math.min(...l))}–${chf(Math.max(...l)).replace(/^CHF\s*/, "")}`;
  };
  const EINMALIG = /(STELLE \d+ PERSONEN EIN · CHF[^<]*?)(?=\s*<\/button>)/;
  const vorherTeam = seiteTeam;
  seiteTeam = function(){
    let html = vorherTeam.apply(this, arguments);
    html = html.replace(EINMALIG, "$1 einmalig");
    const monat = `<div class="notiz monatskosten"><b>Danach jeden Monat Lohn:</b> je nach Land ${lohnSpanne()} pro Person,
      im Verkauf ${chf(VERKAUF_LOHN)}. Wer keine Aufgabe hat, kostet ${chf(200)}.</div>`;
    return html.replace(/(<button class="cta riesig[^"]*" data-tun="anstellen"[\s\S]*?<\/button>)/, `$1${monat}`);
  };
  /* Der Kern schreibt den Knopf beim Ziehen des Reglers neu – «einmalig» wieder anhängen. */
  document.addEventListener("input", e => {
    if (!e.target.closest || !e.target.closest('[data-regler="anstell"]')) return;
    const k = document.querySelector('[data-tun="anstellen"]');
    if (k && /PERSONEN EIN · CHF/.test(k.textContent) && !/einmalig/.test(k.textContent)) k.insertAdjacentText("beforeend", " einmalig");
  });

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
    const k = box.querySelector(".besetzung-kosten");
    if (k) k.innerHTML = kostenHtml(v, +box.dataset.wert, +box.dataset.frei, +box.dataset.lohn);
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
    // «angewendet» verhindert doppeltes Übernehmen (change + pointerup); «wert» bleibt der Ist-Wert.
    const alt = +(box.dataset.angewendet ?? box.dataset.wert), neu = +r.value;
    if (neu === alt){ blattStand = ""; seitenStand = ""; zeichnen(); return; }
    box.dataset.angewendet = neu;
    const knopf = box.querySelector(".besetzung-anwenden");
    // Funken erscheinen beim Griff des Reglers
    const bahn = r.getBoundingClientRect(), anteil = neu / Math.max(1, +box.dataset.max);
    knopf.style.left = (anteil * (bahn.width - 34) + 17) + "px";
    knopf.dataset.n = neu - alt;
    knopf.click();
  }

  /* Fehlen freie Leute, werden sie zuerst eingestellt (einmalig LOHN_PRO_KOPF),
     dann teilt die bestehende Spiellogik sie zu. In der Einführung nie über den Bedarf. */
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".besetzung [data-tun]");
    if (!b || !(+b.dataset.n > 0)) return;
    const box = b.closest(".besetzung");
    let n = +b.dataset.n;
    const tun = b.dataset.tun, ref = tun === "fcrew" ? b.dataset.i : tun === "vcrew" ? null : b.dataset.id;
    const grenze = obergrenze(tun, ref);
    if (grenze !== null) n = Math.min(n, Math.max(0, grenze - +box.dataset.wert));
    const neu = Math.min(Math.max(0, n - freieArbeiter()), kannEinstellen());
    n = Math.min(n, freieArbeiter() + neu);
    if (n <= 0){ e.preventDefault(); e.stopImmediatePropagation(); blattStand = ""; seitenStand = ""; zeichnen(); return; }
    b.dataset.n = n;
    if (neu > 0){
      const kosten = neu * LOHN_PRO_KOPF;
      S.kasse -= kosten; S.ausgegeben += kosten; S.arbeiterGesamt += neu;
      notiz(`<b>${neu} ${neu === 1 ? "Person" : "Personen"}</b> eingestellt · einmalig ${chf(kosten)}, danach Lohn jeden Monat.`, "geld");
    }
  }, true);

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

  blattStand = ""; seitenStand = "";
  window.__erzweltBelegschaftRegler = {version:VERSION, regler};
})();

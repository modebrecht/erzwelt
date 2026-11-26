"use strict";

let introBilderBereit;

async function introBildDekodieren(src){
  const bild = new Image(1672, 941);
  bild.className = "intro-bild";
  bild.decoding = "async";
  bild.src = src;
  try { await bild.decode(); return bild; }
  catch { return null; }
}

function bilderIntroVorbereiten(){
  if (!/^https?:$/.test(location.protocol)) return null;
  introBilderBereit ??= fetch("./assets/intro/bilder.json")
    .then(antwort => {
      if (!antwort.ok) throw new Error(textVon("bilderintro.intro-bilder-nicht-verfuegbar"));
      return antwort.json();
    })
    .then(bundle => Object.fromEntries(Object.entries(bundle).map(([datei, {src}]) => [
      "./" + datei, introBildDekodieren(src)
    ])))
    .catch(() => null);
  return introBilderBereit;
}

function bilderIntroZeigen(gruendung = false){
  const dialog = $("#bilder-intro");
  if (dialog.open) return;
  const folien = JSON.parse($("#erzwelt-intro-bilder").textContent);
  const bilderBereit = bilderIntroVorbereiten();
  const vorherigerFokus = document.activeElement;
  const spiel = S, vorherTempo = tempo;
  let index = 0;
  let touchStart = null;
  let aktiv = true;
  let wechselt = false;

  tempoSetzen(0);
  dialog.innerHTML = `
    <div class="intro-innen">
      <header><h2 id="bilder-intro-titel">${textVon("intro.titel")}</h2><span class="intro-zaehler" aria-live="polite"></span></header>
      <img class="intro-bild" width="1672" height="941" decoding="async">
      <p class="intro-text" aria-live="polite">${textVon("intro.laedt")}</p>
      <div class="intro-punkte" aria-hidden="true">${folien.map(() => "<span></span>").join("")}</div>
      <nav aria-label="${textVon("intro.navigation")}">
        <button type="button" class="cta still intro-zurueck" disabled>${textVon("intro.zurueck")}</button>
        <button type="button" class="cta still intro-sprung">${textVon("intro.ueberspringen")}</button>
        <button type="button" class="cta intro-weiter" disabled>${textVon("intro.weiter")}</button>
      </nav>
    </div>`;
  const innen = dialog.querySelector(".intro-innen");
  let bild = dialog.querySelector(".intro-bild");
  const begleittext = dialog.querySelector(".intro-text");
  const weiter = dialog.querySelector(".intro-weiter");
  const zurueck = dialog.querySelector(".intro-zurueck");
  const sprung = dialog.querySelector(".intro-sprung");
  const zaehler = dialog.querySelector(".intro-zaehler");
  const punkte = dialog.querySelectorAll(".intro-punkte span");
  let animation;

  async function folienwechsel(nach){
    wechselt = true;
    const {src, hintergrund, alt, text} = folien[nach];
    const bereit = await bilderBereit;
    if (!aktiv) return;
    const geladen = await bereit?.[src] ?? await introBildDekodieren(src);
    if (!aktiv) return;
    const hatteFokus = document.activeElement === zurueck;
    const ersteFolie = weiter.disabled;
    index = nach;
    animation?.cancel();
    if (geladen){
      geladen.alt = alt;
      if (geladen !== bild) bild.replaceWith(geladen);
      bild = geladen;
    } else {
      bild.remove();
      bild = Object.assign(new Image(1672, 941), {className:"intro-bild", alt});
      begleittext.before(bild);
    }
    dialog.style.setProperty("--intro-bg", `url("${hintergrund}")`);
    begleittext.textContent = text;
    zaehler.textContent = `${index + 1} / ${folien.length}`;
    punkte.forEach((punkt, i) => punkt.classList.toggle("aktiv", i === index));
    zurueck.disabled = index === 0;
    weiter.disabled = false;
    if (ersteFolie || (hatteFokus && zurueck.disabled)) weiter.focus();
    weiter.textContent = textVon(index < folien.length - 1 ? "intro.weiter" : gruendung ? "intro.gruenden" : "intro.schliessen");
    if (!ersteFolie && geladen && OPT.anim > 0 && !matchMedia("(prefers-reduced-motion: reduce)").matches){
      animation = bild.animate([{opacity:.65}, {opacity:1}], 150);
    }
    wechselt = false;
  }
  function navigieren(richtung){
    const nach = index + richtung;
    if (!wechselt && nach >= 0 && nach < folien.length) folienwechsel(nach);
  }
  function beenden(){
    aktiv = false;
    animation?.cancel();
    dialog.close();
    dialog.replaceChildren();
    dialog.style.removeProperty("--intro-bg");
    if (S !== spiel || !spielAktiv) return;
    if (gruendung){
      metaLaden();
      META.bilderIntroGesehen = true;
      metaSpeichern();
      schwierigkeitZeigen();
    } else {
      tempoSetzen(vorherTempo);
      vorherigerFokus?.focus();
    }
  }
  zurueck.onclick = () => navigieren(-1);
  sprung.onclick = beenden;
  weiter.onclick = () => index === folien.length - 1 ? beenden() : navigieren(1);
  dialog.onkeydown = e => {
    if (!["Escape", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Escape") beenden();
    else navigieren(e.key === "ArrowRight" ? 1 : -1);
  };
  dialog.oncancel = e => { e.preventDefault(); beenden(); };
  innen.ontouchstart = e => { touchStart = e.target === bild && e.touches.length === 1 ? e.touches[0] : null; };
  innen.ontouchcancel = () => { touchStart = null; };
  innen.ontouchend = e => {
    if (!touchStart) return;
    const ende = e.changedTouches[0];
    const dx = ende.clientX - touchStart.clientX, dy = ende.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.3 * Math.abs(dy)) navigieren(dx < 0 ? 1 : -1);
  };
  dialog.showModal();
  dialog.scrollTop = 0;
  folienwechsel(0);
}

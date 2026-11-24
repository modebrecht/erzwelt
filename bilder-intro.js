"use strict";

function bilderIntroZeigen(gruendung = false){
  const dialog = $("#bilder-intro");
  if (dialog.open) return;
  const folien = JSON.parse($("#erzwelt-intro-bilder").textContent);
  const vorherigerFokus = document.activeElement;
  const spiel = S, vorherTempo = tempo;
  let index = 0;
  let touchStart = null;

  tempoSetzen(0);
  dialog.innerHTML = `
    <div class="intro-innen">
      <header><h2 id="bilder-intro-titel">Erzwelt · Intro</h2><span class="intro-zaehler" aria-live="polite"></span></header>
      <img class="intro-bild" width="1672" height="941" decoding="async">
      <p class="intro-text"></p>
      <div class="intro-punkte" aria-hidden="true">${folien.map(() => "<span></span>").join("")}</div>
      <nav aria-label="Einführung">
        <button type="button" class="cta still intro-zurueck">Zurück</button>
        <button type="button" class="cta still intro-sprung">Überspringen</button>
        <button type="button" class="cta intro-weiter" autofocus>Weiter</button>
      </nav>
    </div>`;
  const bild = dialog.querySelector(".intro-bild");
  const begleittext = dialog.querySelector(".intro-text");
  const weiter = dialog.querySelector(".intro-weiter");
  const zurueck = dialog.querySelector(".intro-zurueck");
  const sprung = dialog.querySelector(".intro-sprung");
  const zaehler = dialog.querySelector(".intro-zaehler");
  const punkte = dialog.querySelectorAll(".intro-punkte span");
  let animation;

  function folienwechsel(nach){
    const hatteFokus = document.activeElement === zurueck;
    index = nach;
    const {src, alt, text} = folien[index];
    bild.src = src;
    bild.alt = alt;
    begleittext.textContent = text;
    zaehler.textContent = `${index + 1} / ${folien.length}`;
    punkte.forEach((punkt, i) => punkt.classList.toggle("aktiv", i === index));
    zurueck.disabled = index === 0;
    if (hatteFokus && zurueck.disabled) weiter.focus();
    weiter.textContent = index < folien.length - 1 ? "Weiter" : gruendung ? "Firma gründen" : "Schliessen";
    animation?.cancel();
    if (OPT.anim > 0 && !matchMedia("(prefers-reduced-motion: reduce)").matches){
      animation = bild.animate([{opacity:.3, transform:"translateY(5px)"}, {opacity:1, transform:"none"}], 230);
    }
  }
  function navigieren(richtung){
    const nach = index + richtung;
    if (nach >= 0 && nach < folien.length) folienwechsel(nach);
  }
  function beenden(){
    dialog.close();
    bild.removeAttribute("src");
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
  bild.ontouchstart = e => { touchStart = e.touches.length === 1 ? e.touches[0] : null; };
  bild.ontouchcancel = () => { touchStart = null; };
  bild.ontouchend = e => {
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

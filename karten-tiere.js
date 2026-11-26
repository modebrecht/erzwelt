"use strict";
/* ============================================================
   TIERE AUF DER KARTE

   Etwa alle drei Minuten laufender Spielzeit taucht im sichtbaren Teil der
   Karte ein Tier auf (3–5 pro Kontinent, dazu Meerestiere). Wer es antippt,
   bekommt einen kleinen Bonus: CHF 1’000, 1’500, 2’000, 2’500 oder 3’000.
   Nach 30 Sekunden zieht es weiter.

   - Zählt nur, wenn das Spiel läuft: nicht pausiert, kein Dialog, Seite
     sichtbar, Einführung abgeschlossen.
   - Erscheint nur, wenn die Karte offen ist, und nicht direkt auf einem Pin.
   - Der Bonus zählt als Einnahme (Kasse und Etappengewinn).
   - Nichts davon wird gespeichert ausser dem Bonus selbst.
   ============================================================ */
(function(){
  const ABSTAND_S = 180;      // laufende Sekunden zwischen zwei Tieren
  const SICHTBAR_S = 30;      // laufende Sekunden, die ein Tier bleibt
  const BETRAEGE = [1000, 1500, 2000, 2500, 3000];

  // [Zeichen, Name, Ort, Länge, Breite]
  const TIERE = {
    afrika: [["🦁", "Löwe", "Serengeti", 35, -3], ["🐘", "Elefant", "Okavango", 23, -19], ["🦒", "Giraffe", "Kenia", 37.5, 1],
             ["🦓", "Zebra", "Krüger-Park", 31.5, -24], ["🦏", "Nashorn", "Namibia", 16, -20]],
    suedamerika: [["🦥", "Faultier", "Amazonas", -62, -4], ["🦜", "Papagei", "Mato Grosso", -55, -11], ["🦙", "Lama", "Altiplano", -69, -16],
             ["🐆", "Jaguar", "Pantanal", -57, -18], ["🦩", "Flamingo", "Atacama", -67.5, -23]],
    nordamerika: [["🐻", "Grizzlybär", "Alaska", -150, 63], ["🦬", "Bison", "Great Plains", -102, 44], ["🦝", "Waschbär", "Ohio", -83, 40],
             ["🦅", "Weisskopfseeadler", "Kanada", -123, 52], ["🦌", "Wapiti", "Rocky Mountains", -110, 45]],
    europa: [["🦊", "Fuchs", "Deutschland", 10, 51], ["🦔", "Igel", "Frankreich", 2.5, 47], ["🐺", "Wolf", "Finnland", 27, 63],
             ["🦌", "Rothirsch", "Schottland", -4.5, 57], ["🐻", "Braunbär", "Karpaten", 25, 46]],
    asien: [["🐼", "Panda", "Sichuan", 103, 31], ["🐅", "Tiger", "Bengalen", 88, 23], ["🐫", "Kamel", "Gobi", 103, 43],
             ["🦧", "Orang-Utan", "Borneo", 114, 1], ["🐘", "Asiatischer Elefant", "Thailand", 101, 16]],
    australien: [["🦘", "Känguru", "Outback", 134, -25], ["🐨", "Koala", "New South Wales", 150, -31], ["🐊", "Krokodil", "Kakadu", 132.5, -13]],
    ozean: [["🐋", "Wal", "Atlantik", -38, 38], ["🐬", "Delfin", "Pazifik", -145, 12], ["🐢", "Meeresschildkröte", "Indischer Ozean", 75, -15],
             ["🦭", "Robbe", "Nordatlantik", -25, 58]]
  };
  const ALLE = Object.values(TIERE).flat();

  const kartenPunkt = (lon, lat) => [(lon + 180) / 360 * KARTE_B, (78 - lat) / 138 * KARTE_H];
  let gelaufen = 0, tier = null, tierRest = 0;

  /* ---------- Darstellung ---------- */
  const stil = document.createElement("style");
  stil.id = "erzwelt-karten-tiere-style";
  stil.textContent = `
    .karten-tier{position:absolute;z-index:4;transform-origin:50% 100%;border:0;padding:0;background:none;cursor:pointer;
      width:46px;height:46px;display:grid;place-items:center;-webkit-tap-highlight-color:transparent}
    .karten-tier .tier-koerper{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;
      background:#fdf8ec;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35),0 0 0 4px rgba(255,214,102,.45);
      font-size:24px;line-height:1;animation:tier-hopsen 1.6s ease-in-out infinite}
    .karten-tier.neu .tier-koerper{animation:tier-auftauchen .45s ease-out, tier-hopsen 1.6s ease-in-out .45s infinite}
    .karten-tier.geht{opacity:0;transition:opacity .5s}
    .karten-tier:focus-visible .tier-koerper{outline:3px solid #ffd666;outline-offset:2px}
    @keyframes tier-hopsen{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    @keyframes tier-auftauchen{from{transform:scale(.2);opacity:0}to{transform:scale(1);opacity:1}}
    .tier-bonus{position:absolute;z-index:5;pointer-events:none;transform:translate(-50%,-100%);font:800 15px/1 "Baloo 2",sans-serif;
      color:#ffe08a;text-shadow:0 2px 3px rgba(0,0,0,.6);white-space:nowrap;animation:tier-bonus 1.4s ease-out forwards}
    @keyframes tier-bonus{from{opacity:1;margin-top:0}to{opacity:0;margin-top:-34px}}
    body[data-anim="0"] .karten-tier .tier-koerper,body[data-anim="0"] .tier-bonus{animation:none}
    @media (prefers-reduced-motion: reduce){.karten-tier .tier-koerper,.tier-bonus{animation:none}}`;
  document.head.append(stil);

  // Grösse wie bei den Pins: beim Zoomen nicht mitwachsen
  function groesse(){
    if (!tier) return;
    const k = Math.max(0.62, Math.min(1, 0.45 + ansicht.z * 0.55));
    tier.el.style.transform = `translate(-50%,-100%) scale(${k / ansicht.z})`;
  }
  new MutationObserver(groesse).observe(welt, {attributes:true, attributeFilter:["style"]});

  /* ---------- Wo darf ein Tier auftauchen? ---------- */
  function sichtbereich(){
    const z = ansicht.z, h = typeof kartenSichthoehe === "function" ? kartenSichthoehe() : sicht.clientHeight;
    return {x0:-ansicht.x / z, y0:-ansicht.y / z, x1:(sicht.clientWidth - ansicht.x) / z, y1:(h - ansicht.y) / z};
  }
  function freierPlatz([x, y]){
    for (const k in POS){ const [px, py] = POS[k]; if (Math.hypot(px - x, py - y) < 40) return false; }
    return true;
  }
  function kandidaten(){
    const b = sichtbereich(), rand = 30;
    return ALLE.map(t => {
      const [x, y] = kartenPunkt(t[3], t[4]);
      return {t, x, y};
    }).filter(({x, y}) => x > b.x0 + rand && x < b.x1 - rand && y > b.y0 + 60 && y < b.y1 - rand && freierPlatz([x, y]));
  }

  /* ---------- Auftauchen, Antippen, Weiterziehen ---------- */
  function auftauchen(){
    const liste = kandidaten();
    if (!liste.length) return false;
    const {t, x, y} = liste[Math.floor(Math.random() * liste.length)];
    const [zeichen, name, ort] = t;
    const el = document.createElement("button");
    el.type = "button";
    el.className = "karten-tier neu";
    el.style.left = x.toFixed(1) + "px";
    el.style.top = y.toFixed(1) + "px";
    el.setAttribute("aria-label", textVon("tiere.antippen", {tier:name, ort}));
    el.innerHTML = `<span class="tier-koerper" aria-hidden="true">${zeichen}</span>`;
    el.addEventListener("click", e => { e.stopPropagation(); fangen(); });
    el.addEventListener("pointerdown", e => e.stopPropagation());
    welt.append(el);
    tier = {el, zeichen, name, ort, x, y};
    tierRest = SICHTBAR_S;
    groesse();
    return true;
  }
  function weg(){
    if (!tier) return;
    const el = tier.el;
    tier = null;
    el.classList.add("geht");
    el.disabled = true;
    setTimeout(() => el.remove(), 550);
  }
  function fangen(){
    if (!tier) return;
    const {zeichen, name, ort, x, y} = tier;
    const betrag = BETRAEGE[Math.floor(Math.random() * BETRAEGE.length)];
    S.kasse += betrag;
    S.eingenommen += betrag;
    const bonus = document.createElement("div");
    bonus.className = "tier-bonus";
    bonus.style.left = x + "px";
    bonus.style.top = (y - 40) + "px";
    bonus.textContent = "+" + chf(betrag);
    welt.append(bonus);
    setTimeout(() => bonus.remove(), 1500);
    weg();
    window.__erzweltErfolgFeier?.verkaufTon?.();
    notiz(textVon("tiere.gefunden", {zeichen, tier:name, ort, betrag:chf(betrag)}), "gut");
    speichern();
    zeichnen();
  }

  /* ---------- Uhr: zählt nur laufende Spielzeit ---------- */
  const laeuft = () => spielAktiv && tempo > 0 && !modalOffen && !S.ende && S.schwierigkeit &&
    document.visibilityState === "visible" && !tutorialLaeuft();
  setInterval(() => {
    if (!spielAktiv) { if (tier) weg(); gelaufen = 0; return; }
    if (!laeuft()) return;
    if (tier){
      if (--tierRest <= 0) weg();
      return;
    }
    gelaufen++;
    if (gelaufen >= ABSTAND_S && aktiveSeite === "karte" && !offenesBlatt && auftauchen()) gelaufen = 0;
  }, 1000);

  window.__erzweltKartenTiere = {version:1, tiere:TIERE, auftauchen, fangen, stand: () => ({gelaufen, tier: tier && tier.name, rest: tierRest})};
})();

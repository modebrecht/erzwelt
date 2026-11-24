"use strict";
/* Blatt einer eigenen Rohstoffquelle: Lohn direkt unter der Belegschaft.
   - Reihenfolge: Werte → Belegschaft → Lohnstufe → Zufriedenheit → Ausbau →
     Sicherheit → Herkunftsnachweis. So sieht man Personal, Lohn und ihre
     Wirkung zusammen, statt drei Bildschirme auseinander.
   - Jede Lohnstufe zeigt, was sie bewirkt: Lohnkosten pro Monat für die
     aktuelle Belegschaft und die Förderung pro Tag, sobald sich die
     Zufriedenheit eingependelt hat.
   - Die doppelten Überschriften «Lohn → Zufriedenheit → Streik» und
     «Sicherheit → Unfallrisiko» entfallen (stehen in den Karten selbst).
   Nur Darstellung, keine Spiellogik. */
(function(){
  const VERSION = 1;
  const style = document.createElement("style");
  style.id = "erzwelt-blatt-ordnung-style";
  style.textContent = `
    #blattinhalt .segment button .lohn-vorschau{display:block;margin-top:3px;font-size:10.5px;font-weight:700;line-height:1.25;
      color:var(--grau);font-family:system-ui,sans-serif;white-space:nowrap}
    #blattinhalt .segment button .lohn-vorschau span{display:block}
    #blattinhalt .segment button[aria-pressed="true"] .lohn-vorschau{color:inherit;opacity:.85}
    #blattinhalt .lohn-hinweis{margin:6px 0 2px;font-size:var(--f0);color:var(--grau);font-weight:600}
  `;
  document.head.appendChild(style);

  const karte = (inhalt, titel) => [...inhalt.children].find(k => k.querySelector(":scope > h3")?.textContent.trim().startsWith(titel));

  function foerderung(id, stufe){
    const m = S.minen[id], def = MINEN.find(x => x.id === id);
    const zuf = Math.max(0, Math.min(100, LOHNSTUFE[stufe].ziel - (LAND[def.land].risiko - 1) * 8 + perkPlus("zufrieden")));
    return m.arbeiter * def.ergiebigkeit * perkMult("foerderung") * ausbauFaktor(m.ausbau) * (0.55 + zuf / 100 * 0.6);
  }

  function ordnen(id){
    const inhalt = document.getElementById("blattinhalt");
    if (!inhalt) return;
    const beleg = karte(inhalt, "Belegschaft"), lohn = karte(inhalt, "Lohnstufe"),
          zuf = karte(inhalt, "Zufriedenheit");
    if (beleg && lohn && beleg.nextElementSibling !== lohn) beleg.after(lohn);
    if (lohn && zuf && lohn.nextElementSibling !== zuf) lohn.after(zuf);
    inhalt.querySelector(":scope > .mine-ursachen")?.remove();

    if (!lohn) return;
    const m = S.minen[id], def = MINEN.find(x => x.id === id);
    for (const b of lohn.querySelectorAll('.segment button[data-tun="lohn"]')){
      const st = +b.dataset.stufe;
      const kosten = Math.round(m.arbeiter * LAND[def.land].lohn * LOHNSTUFE[st].faktor);
      const html = `<span>${chf(kosten)}/Mt.</span><span>≈ ${Math.round(foerderung(id, st))} pro Tag</span>`;
      let v = b.querySelector(".lohn-vorschau");
      if (!v){ v = document.createElement("small"); v.className = "lohn-vorschau"; b.appendChild(v); }
      if (v.innerHTML !== html) v.innerHTML = html;
    }
    if (!lohn.querySelector(".lohn-hinweis")){
      const h = document.createElement("div");
      h.className = "lohn-hinweis";
      h.textContent = "Kosten für deine Belegschaft · Förderung, sobald sich die Zufriedenheit eingependelt hat.";
      lohn.querySelector(".segment")?.after(h);
    }
  }

  if (typeof blattFuellen === "function"){
    const vorher = blattFuellen;
    blattFuellen = function(art, id){
      const out = vorher.apply(this, arguments);
      if (art === "mine" && S.minen[id]) ordnen(id);
      return out;
    };
  }
  window.__erzweltBlattOrdnung = {version:VERSION};
})();

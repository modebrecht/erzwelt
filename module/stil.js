/* Erzwelt · module/stil.js – ein Stylesheet für alle Module
   ---------------------------------------------------------------
   Fügt genau einen <style>-Block in den <head> ein (nach dem Kern-<style>).
   Module erzeugen keine eigenen <style>-Blöcke mehr; neues CSS kommt hierher,
   in den Abschnitt des zuständigen Bereichs.

   Die Abschnitte stehen in der früheren Ladereihenfolge der Patches
   (patches.json). Die Kaskade hängt davon ab: bei gleicher Spezifität gewinnt
   der spätere Abschnitt. Reihenfolge nur ändern, wenn klar ist, dass keine
   Regel eine spätere überstimmt.

   Farbrollen (aus stil.js)
     Gold   #f5b73d  Tun: kaufen, bauen, einstellen, verkaufen, ausbauen.
                     Eine Hauptaktion pro Blatt.
     Grün   #2fbe7e  Wissen und Erfolg (Ansehen, Gewinn), nie für Käufe.
     Papier #ffffff + Linie #e3d7bf  Zweitaktionen: Ziel zeigen, Zum Team,
                     − / +, Neue Runde, Entlassen.
     Rot    #e0504a  Schliessen und Warnungen.
   Knöpfe
     Gross: Radius 18, 4 px Kante in dunklerem Ton. Klein: Radius 12, 3 px Kante.
   Beschriftungen
     Normale Gross-/Kleinschreibung, keine gesperrten Grossbuchstaben.

   «important» nur, wo ein Inline-Stil oder eine Kern-Regel übertroffen werden
   muss oder eine andere Regel mit gleicher oder höherer Spezifität konkurriert.
   Entfernt wurde es bisher nur, wo es nachweislich nichts bewirkt. */
"use strict";
(function(){
  const style = document.createElement("style");
  style.id = "erzwelt-stil";
  style.textContent = `
/* ===== aus didactic-transport.js: Lieferweg-Legende auf schmalen Bildschirmen ===== */
@media(max-width:560px){
  #didaktik-route-note{bottom:calc(var(--dockh) + 92px)!important;max-width:calc(100vw - 20px)!important}
  #didaktik-transport-legende{display:none!important}
}

/* ===== aus performance-pass.js: weniger Filter und Weichzeichner für flüssiges Zeichnen ===== */
#welt{will-change:transform}
.pin{filter:none!important}
.pin:active{filter:none!important}
.pin .knopf{box-shadow:0 3px 5px rgba(0,0,0,.32)}
.pin .bez{box-shadow:0 2px 4px rgba(0,0,0,.28)}
.didaktik-truck,.didaktik-ship{will-change:transform}
body[data-anim="1"] .pin.foerdert .staub.b,body[data-anim="1"] .pin.foerdert .staub.c{display:none}
#sicht.zieht .pin.foerdert .knopf>svg,#sicht.zieht .pin.foerdert .knopf>span.sym,
#sicht.zieht .pin.foerdert .staub{animation-play-state:paused!important}
#didaktik-transport-legende{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:#0b3648f2!important}
.ueberlage{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:#06202ef2!important}

/* ===== aus transformation-animations.js: Prozess-Szenen (Abbau, Raffinerie, Fabrik) und Verkauf ===== */
.prozessszene{
  --prozess-farbe:#5b8f7a;
  position:relative;overflow:hidden;margin:10px 0 12px;padding:10px 10px 8px;
  min-height:150px;border-radius:18px;background:linear-gradient(180deg,#fffdf7,#f3ead8);
  border:1px solid #dfd1b8;box-shadow:inset 0 1px 0 #fff;
}
.prozess-kopf{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;
  color:var(--grau);font-size:var(--f0);font-weight:800;text-align:center;margin-bottom:5px}
.prozess-kopf b{color:var(--tinte);font-size:var(--f1)}
.prozess-kopf span:first-child{text-align:left}.prozess-kopf span:last-child{text-align:right}
.prozessbahn{position:relative;height:82px;display:grid;grid-template-columns:1fr 72px 1fr;align-items:center;gap:5px}
.prozesslinie{position:absolute;left:12%;right:12%;top:50%;height:4px;transform:translateY(-50%);
  border-radius:99px;background:repeating-linear-gradient(90deg,#c9b99d 0 10px,#eee3cf 10px 18px);opacity:.8}
.prozessszene.aktiv .prozesslinie{animation:prozessBand 1.15s linear infinite}
@keyframes prozessBand{to{background-position:18px 0}}
.prozess-roh,.prozess-ausgang{position:relative;z-index:2;height:62px;display:flex;align-items:center;justify-content:center}
.rohbrocken{position:absolute;width:18px;height:16px;border-radius:50% 42% 55% 35%;background:var(--prozess-farbe);
  border:2px solid #fff;box-shadow:0 2px 3px #0002;opacity:.9}
.rohbrocken:nth-child(1){transform:translate(-20px,-11px) rotate(-14deg)}
.rohbrocken:nth-child(2){transform:translate(2px,8px) rotate(11deg);width:15px;height:14px}
.rohbrocken:nth-child(3){transform:translate(20px,-6px) rotate(24deg);width:13px;height:12px}
.prozessszene.aktiv .rohbrocken:nth-child(1){animation:rohRein 2.4s ease-in infinite}
.prozessszene.aktiv .rohbrocken:nth-child(2){animation:rohRein 2.4s .55s ease-in infinite}
.prozessszene.aktiv .rohbrocken:nth-child(3){animation:rohRein 2.4s 1.1s ease-in infinite}
@keyframes rohRein{0%,12%{opacity:0;transform:translate(-34px,-9px) scale(.8)}25%{opacity:1}72%{opacity:1}88%,100%{opacity:0;transform:translate(52px,0) scale(.55)}}
.prozess-reaktor{position:relative;z-index:3;width:66px;height:70px;display:grid;place-items:center}
.prozess-reaktor svg{width:62px;height:62px;overflow:visible}
.prozess-zahn{transform-origin:32px 31px}
.prozessszene.aktiv .prozess-zahn{animation:prozessDreh 2.8s linear infinite}
@keyframes prozessDreh{to{transform:rotate(360deg)}}
.prozess-fluessig{transform-origin:32px 43px}
.prozessszene.aktiv .prozess-fluessig{animation:prozessPuls 1.25s ease-in-out infinite}
@keyframes prozessPuls{0%,100%{transform:scaleY(.88);opacity:.72}50%{transform:scaleY(1.08);opacity:1}}
.materialblock{position:relative;width:44px;height:29px;border-radius:7px;background:linear-gradient(145deg,#fff8,#0001),var(--prozess-farbe);
  border:2px solid #fff;box-shadow:0 3px 5px #0002;display:grid;place-items:center;color:#fff;font-weight:900;font-family:"Baloo 2",sans-serif}
.materialblock::after{content:"";position:absolute;inset:4px;border:1px solid #ffffff70;border-radius:4px}
.prozessszene.aktiv .materialblock{animation:materialRaus 2.4s .88s ease-out infinite}
@keyframes materialRaus{0%,25%{opacity:0;transform:translateX(-42px) scale(.55)}42%{opacity:1}68%{transform:translateX(0) scale(1)}88%,100%{opacity:0;transform:translateX(30px) scale(.92)}}
.prozess-status{display:flex;justify-content:center;align-items:center;gap:7px;min-height:23px;margin-top:2px;
  color:var(--grau);font-size:var(--f0);font-weight:700;text-align:center}
.prozess-status i{width:8px;height:8px;border-radius:50%;background:#a99a80}
.prozessszene.aktiv .prozess-status i{background:var(--gruen);box-shadow:0 0 0 4px #2fbe7e1c}

.fabrik-prozess{--prozess-farbe:#b5703c}
.fabrik-prozess .prozessbahn{grid-template-columns:1fr 82px 1fr}
.rezeptchips{position:relative;z-index:2;height:68px;display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;max-width:105px;margin:auto}
.rezeptchip{width:26px;height:26px;border-radius:8px;background:var(--chip);border:2px solid #fff;color:#fff;
  display:grid;place-items:center;font-size:11px;font-family:"Baloo 2",sans-serif;font-weight:900;box-shadow:0 2px 4px #0002}
.fabrik-prozess.aktiv .rezeptchip:nth-child(1){animation:chipRein 2.6s ease-in infinite}
.fabrik-prozess.aktiv .rezeptchip:nth-child(2){animation:chipRein 2.6s .38s ease-in infinite}
.fabrik-prozess.aktiv .rezeptchip:nth-child(3){animation:chipRein 2.6s .76s ease-in infinite}
.fabrik-prozess.aktiv .rezeptchip:nth-child(4){animation:chipRein 2.6s 1.14s ease-in infinite}
@keyframes chipRein{0%,12%{opacity:0;transform:translateX(-25px) scale(.75)}24%{opacity:1}68%{opacity:1}84%,100%{opacity:0;transform:translateX(58px) scale(.55)}}
.fabrikmaschine{position:relative;z-index:3;width:78px;height:70px;display:grid;place-items:center}
.fabrikmaschine svg{width:76px;height:64px;overflow:visible}
.fabrikrad{transform-origin:center}
.fabrik-prozess.aktiv .fabrikrad{animation:prozessDreh 2.1s linear infinite}
.fabriklicht{opacity:.35}
.fabrik-prozess.aktiv .fabriklicht{animation:fabrikBlink 1.1s steps(2,end) infinite}
@keyframes fabrikBlink{50%{opacity:1}}
.produktkarton{position:relative;width:48px;height:40px;border-radius:5px;background:#d6aa67;border:2px solid #fff;
  box-shadow:0 3px 5px #0002;color:#5b3b17;display:grid;place-items:center;font-size:10px;font-weight:900;text-align:center;line-height:1.05;padding:3px}
.produktkarton::before{content:"";position:absolute;top:6px;left:0;right:0;border-top:2px solid #a7793e66}
.fabrik-prozess.aktiv .produktkarton{animation:produktRaus 2.6s 1.12s ease-out infinite}
@keyframes produktRaus{0%,22%{opacity:0;transform:translateX(-48px) scale(.6)}40%{opacity:1}70%{transform:translateX(0) scale(1)}90%,100%{opacity:0;transform:translateX(34px) scale(.94)}}
.fabrik-prozess.im-bau .prozesslinie,.fabrik-prozess.im-bau .rezeptchips,.fabrik-prozess.im-bau .produktkarton{opacity:.28}

body[data-anim="1"] .rohbrocken:nth-child(3),body[data-anim="1"] .rezeptchip:nth-child(n+4){display:none}
body[data-anim="0"] .prozessszene .prozesslinie{background:#ddd0b7}

#verkauf-visual-layer{position:fixed;inset:0;z-index:120;pointer-events:none;overflow:hidden}
.verkauf-paket{position:absolute;width:50px;height:42px;border-radius:7px;background:#d5a968;border:2px solid #fff;
  box-shadow:0 4px 12px #0004;display:grid;place-items:center;color:#5b3b17;font-family:"Baloo 2",sans-serif;font-weight:900;font-size:11px;text-align:center;line-height:1.05}
.verkauf-paket::after{content:"";position:absolute;left:5px;right:5px;top:8px;border-top:2px solid #9b6d3466}
.verkauf-geld{position:fixed;z-index:121;pointer-events:none;padding:5px 9px;border-radius:999px;background:#2fbe7e;color:#073b27;
  border:2px solid #fff;font-family:"Baloo 2",sans-serif;font-weight:900;font-size:var(--f1);box-shadow:0 3px 9px #0003;white-space:nowrap}
.pille.kasse.verkauf-puls{animation:kassenPuls .48s cubic-bezier(.2,1.7,.4,1)}
@keyframes kassenPuls{0%{transform:scale(1)}45%{transform:scale(1.16)}100%{transform:scale(1)}}
.verkauf-kette-mini{display:flex;align-items:center;justify-content:center;gap:7px;margin:8px 0 10px;padding:7px 10px;
  border-radius:12px;background:#eef7f1;color:#335246;font-size:var(--f0);font-weight:800}
.verkauf-kette-mini b{color:#1f7754}

/* ===== aus transformation-enhance.js: Prozess-Szenen: Zustände und Übergaben ===== */
.prozessszene{min-height:174px;padding:10px 10px 9px}
.prozess-kopf{margin-bottom:3px}
.prozess-meta{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:6px;align-items:center;
  min-height:34px;margin:0 2px 4px;font-size:var(--f0);color:var(--grau)}
.prozess-meta-seite{min-width:0;display:flex;flex-direction:column;gap:1px}
.prozess-meta-seite:last-child{text-align:right;align-items:flex-end}
.prozess-meta-seite b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tinte);font-size:var(--f0)}
.prozess-meta-seite small{font-size:10px;line-height:1.15;font-weight:700;color:var(--grau)}
.prozess-meta-pfeil{width:30px;height:20px;display:grid;place-items:center;border-radius:999px;background:#e8deca;color:#78684e;
  font-family:"Baloo 2",sans-serif;font-weight:900;transition:background .2s,color .2s,transform .2s}
.prozessszene.aktiv .prozess-meta-pfeil{background:#dff3e8;color:#23734f}
.prozessszene.prozess-takt .prozess-meta-pfeil{transform:scale(1.14)}

.prozessbahn{height:78px}
.prozesslinie{height:3px;opacity:.62}
.prozessszene.aktiv .prozesslinie{animation:prozessBand 3.2s linear infinite}
.prozessszene.aktiv .prozess-reaktor::after,.prozessszene.aktiv .fabrikmaschine::after{
  content:"";position:absolute;inset:8px;border:2px solid color-mix(in srgb,var(--prozess-farbe) 65%,white);border-radius:50%;opacity:0;pointer-events:none;
  animation:prozessImpuls 3.2s ease-in-out infinite}
.prozessszene.aktiv .fabrikmaschine::after{inset:9px 10px;border-radius:14px}
@keyframes prozessImpuls{0%,25%,68%,100%{opacity:0;transform:scale(.78)}38%{opacity:.75;transform:scale(1)}55%{opacity:.18;transform:scale(1.18)}}

.prozessszene.aktiv .rohbrocken:nth-child(1){animation:rohReinKlar 3.2s 0s ease-in-out infinite}
.prozessszene.aktiv .rohbrocken:nth-child(2){animation:rohReinKlar 3.2s .18s ease-in-out infinite}
.prozessszene.aktiv .rohbrocken:nth-child(3){animation:rohReinKlar 3.2s .36s ease-in-out infinite}
@keyframes rohReinKlar{
  0%,8%{opacity:0;transform:translate(-42px,-7px) scale(.72)}
  17%{opacity:1}
  33%{opacity:1;transform:translate(-5px,0) scale(1)}
  46%,100%{opacity:0;transform:translate(53px,0) scale(.48)}
}
.prozessszene.aktiv .prozess-zahn{animation:prozessDrehKlar 3.2s ease-in-out infinite}
@keyframes prozessDrehKlar{0%,24%{transform:rotate(0)}58%{transform:rotate(300deg)}70%,100%{transform:rotate(320deg)}}
.prozessszene.aktiv .prozess-fluessig{animation:prozessFluessigKlar 3.2s ease-in-out infinite}
@keyframes prozessFluessigKlar{0%,24%,72%,100%{transform:scaleY(.86);opacity:.62}44%{transform:scaleY(1.1);opacity:1}}
.prozessszene.aktiv .materialblock{animation:materialRausKlar 3.2s ease-out infinite}
@keyframes materialRausKlar{
  0%,46%{opacity:0;transform:translateX(-38px) scale(.55)}
  57%{opacity:1}
  72%{opacity:1;transform:translateX(0) scale(1)}
  90%,100%{opacity:0;transform:translateX(34px) scale(.9)}
}

.fabrik-prozess.aktiv .rezeptchip:nth-child(1){animation:chipReinKlar 3.4s 0s ease-in-out infinite}
.fabrik-prozess.aktiv .rezeptchip:nth-child(2){animation:chipReinKlar 3.4s .16s ease-in-out infinite}
.fabrik-prozess.aktiv .rezeptchip:nth-child(3){animation:chipReinKlar 3.4s .32s ease-in-out infinite}
.fabrik-prozess.aktiv .rezeptchip:nth-child(4){animation:chipReinKlar 3.4s .48s ease-in-out infinite}
@keyframes chipReinKlar{
  0%,8%{opacity:0;transform:translateX(-32px) scale(.7)}
  18%{opacity:1}
  34%{opacity:1;transform:translateX(-2px) scale(1)}
  47%,100%{opacity:0;transform:translateX(58px) scale(.5)}
}
.fabrik-prozess.aktiv .fabrikrad{animation:fabrikRadKlar 3.4s ease-in-out infinite}
@keyframes fabrikRadKlar{0%,27%{transform:rotate(0)}60%{transform:rotate(320deg)}72%,100%{transform:rotate(340deg)}}
.fabrik-prozess.aktiv .fabriklicht{animation:fabrikBlinkKlar 3.4s linear infinite}
@keyframes fabrikBlinkKlar{0%,28%,63%,100%{opacity:.28}36%,44%,52%{opacity:1}}
.fabrik-prozess.aktiv .produktkarton{animation:produktRausKlar 3.4s ease-out infinite}
@keyframes produktRausKlar{
  0%,48%{opacity:0;transform:translateX(-45px) scale(.55)}
  59%{opacity:1}
  75%{opacity:1;transform:translateX(0) scale(1)}
  92%,100%{opacity:0;transform:translateX(36px) scale(.92)}
}

.prozess-materialliste{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin:2px 0 1px}
.prozess-materialliste span{padding:2px 6px;border-radius:999px;background:#eee6d8;color:#5f5548;font-size:10px;font-weight:800;white-space:nowrap}
.prozess-materialliste span.ok{background:#e0f2e8;color:#266b4c}
.prozess-materialliste span.fehlt{background:#fae4e1;color:#9a342f;box-shadow:inset 0 0 0 1px #e9aaa4}
.prozessszene.wartet .prozesslinie{opacity:.28}
.prozessszene.wartet .prozess-reaktor,.prozessszene.wartet .fabrikmaschine{opacity:.72}
.prozessszene.wartet .prozess-status i{background:var(--warn)}

.prozessszene.prozess-takt .prozess-reaktor svg,.prozessszene.prozess-takt .fabrikmaschine svg{animation:prozessTakt .42s cubic-bezier(.2,1.5,.4,1)}
@keyframes prozessTakt{0%{transform:scale(1)}45%{transform:scale(1.07)}100%{transform:scale(1)}}

.verkauf-paket{will-change:transform,opacity}
.verkauf-paket::before{content:"Verkauf";position:absolute;left:50%;bottom:calc(100% + 4px);transform:translateX(-50%);
  padding:1px 5px;border-radius:999px;background:#fff8e9;color:#76511f;border:1px solid #d9bd91;font-size:9px;line-height:1.2}
.verkauf-geld{will-change:transform,opacity}
.pille.kasse.verkauf-puls{animation:kassenPulsNeu .5s cubic-bezier(.2,1.55,.4,1)}
@keyframes kassenPulsNeu{0%{transform:scale(1)}42%{transform:scale(1.11)}70%{transform:scale(.98)}100%{transform:scale(1)}}

body[data-anim="1"] .prozessszene.aktiv .prozesslinie{animation-duration:4s}
body[data-anim="1"] .prozessszene.aktiv .prozess-reaktor::after,
body[data-anim="1"] .prozessszene.aktiv .fabrikmaschine::after{display:none}
body[data-anim="1"] .prozess-materialliste span{font-size:9.5px}

@media (prefers-reduced-motion: reduce){
  .prozessszene *,.prozessszene *::before,.prozessszene *::after{animation:none!important;transition:none!important}
  .prozessszene.aktiv .materialblock,.prozessszene.aktiv .produktkarton,.prozessszene.aktiv .rezeptchip,.prozessszene.aktiv .rohbrocken{opacity:1!important;transform:none!important}
}

/* ===== aus tutorial-enhance.js: Einführung: Kette, Phase, Zusammenhang, Rückmeldung ===== */
#quest.tutorial-aktiv:not(.breit){width:min(64%,300px)}
#quest .tutorial-kette{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:8px 0 6px}
#quest .tutorial-phase{min-width:0;padding:4px 3px;border-radius:8px;background:#e8deca;color:#78684e;
  text-align:center;font-size:9px;font-weight:800;line-height:1.1;border:1px solid transparent}
#quest .tutorial-phase b{display:block;font-family:"Baloo 2",sans-serif;font-size:11px;line-height:1}
#quest .tutorial-phase.erledigt{background:#e0f2e8;color:#276b4d}
#quest .tutorial-phase.aktiv{background:#fff0c9;color:#71500e;border-color:#edc766;box-shadow:0 0 0 2px #f5b73d20}
#quest .tutorial-phase-name{font-size:10px;color:var(--grau);font-weight:800;text-align:center;margin:-1px 0 5px}
#quest .tutorial-zusammenhang{margin-top:6px;padding:6px 8px;border-radius:9px;background:#eef6f3;color:#31594a;
  font-size:10.5px;line-height:1.25;font-weight:700}
#quest .tutorial-zusammenhang b{display:inline;font-family:inherit;font-size:inherit;color:#1f6b4e;margin:0}
#quest:not(.breit) .tutorial-phase span{display:none}
#quest:not(.breit) .tutorial-phase{padding:4px 2px}

#tutorial-lernfeedback{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 68px);z-index:90;
  width:min(92vw,480px);transform:translateX(-50%);pointer-events:none;padding:10px 13px;border-radius:14px;
  background:#f5fff9;color:#214f3c;border:2px solid #69bf91;box-shadow:0 7px 22px #0003;
  font-size:var(--f1);font-weight:700;text-align:center}
#tutorial-lernfeedback b{font-family:"Baloo 2",sans-serif;color:#17613f}
#tutorial-lernfeedback.rein{animation:tutorialFeedback 2.8s ease both}
@keyframes tutorialFeedback{0%{opacity:0;transform:translate(-50%,-12px) scale(.96)}10%,78%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-7px) scale(.98)}}
@media(prefers-reduced-motion:reduce){#tutorial-lernfeedback.rein{animation:none}}

/* ===== aus construction-visibility.js: Bau- und Statusanzeige an den Pins ===== */
.pin .knopf{overflow:visible}
.pin-status-ring{position:absolute!important;inset:-8px auto auto -8px;width:58px!important;height:58px!important;
  overflow:visible;pointer-events:none;z-index:-1;transform:rotate(-90deg)}
.pin-status-ring .ring-bg{fill:none;stroke:#ffffff38;stroke-width:4}
.pin-status-ring .ring-fg{fill:none;stroke:var(--pin-status,#f5b73d);stroke-width:4;stroke-linecap:round;
  transition:stroke-dasharray .28s ease}
.pin-state-badge{position:absolute;left:-13px;top:-10px;z-index:5;min-width:24px;height:20px;padding:0 5px;
  display:grid;place-items:center;border-radius:999px;background:#fff;color:#4f4437;border:2px solid #fff;
  box-shadow:0 2px 5px #0004;font-family:"Baloo 2",sans-serif;font-weight:900;font-size:9.5px;line-height:1;white-space:nowrap}
.pin-state-badge.status-bau{background:#f5b73d;color:#533600}
.pin-state-badge.status-warn{background:#e0504a;color:#fff}
.pin-state-badge.status-inaktiv{background:#ece5d6;color:#5f5547}
.pin-state-badge.status-aktiv{left:-9px;top:-7px;min-width:13px;width:13px;height:13px;padding:0;background:#2fbe7e;border-width:2px;color:transparent}
.pin-build-tool{position:absolute;right:-12px;bottom:-9px;z-index:6;width:25px;height:25px;border-radius:50%;
  display:grid;place-items:center;background:#fff8e8;border:2px solid #f5b73d;box-shadow:0 2px 5px #0004;color:#7a5208;pointer-events:none}
.pin-build-tool svg{width:15px!important;height:15px!important;transform-origin:70% 75%}
.pin.bau-status .pin-build-tool svg,.pin.neu-status .pin-build-tool svg{animation:pinHammer 1.12s ease-in-out infinite}
@keyframes pinHammer{0%,100%{transform:rotate(-20deg)}45%{transform:rotate(18deg)}62%{transform:rotate(10deg)}}
.pin.bau-status .knopf{box-shadow:0 0 0 3px #f5b73d30,0 3px 5px rgba(0,0,0,.32)}
.pin.bau-status .bez{background:#795713}
.pin.inaktiv-status .knopf{filter:saturate(.62);opacity:.9}
.pin.aktiv-status .knopf{box-shadow:0 0 0 2px #2fbe7e2e,0 3px 5px rgba(0,0,0,.32)}
.pin.neu-status .knopf{box-shadow:0 0 0 3px #f5b73d38,0 3px 5px rgba(0,0,0,.32)}
.pin.neu-status .pin-state-badge{background:#fff2c8;color:#674708}
.pin-status-hint{position:absolute;left:50%;top:calc(100% + 31px);transform:translateX(-50%);z-index:0;
  padding:1px 6px;border-radius:999px;background:#0b3648e8;color:#fff;font-size:9px;font-weight:800;
  font-family:"Baloo 2",sans-serif;white-space:nowrap;pointer-events:none;box-shadow:0 2px 4px #0003}
#welt.weit .pin-status-hint{display:none}
body[data-anim="1"] .pin.bau-status .pin-build-tool svg,body[data-anim="1"] .pin.neu-status .pin-build-tool svg{animation-duration:1.55s}
@media(prefers-reduced-motion:reduce){
  .pin .pin-build-tool svg{animation:none!important}
  .pin-status-ring .ring-fg{transition:none!important}
}

/* ===== aus construction-animation-enhance.js: Bau- und Status-Animationen an den Pins ===== */
/* ---------- Construction: coordinated motion, not generic wobble ---------- */
.pin.bau-status .pin-build-tool,.pin.neu-status .pin-build-tool{
  transform-origin:50% 88%;will-change:transform;
  animation:bauToolRecoil 1.72s cubic-bezier(.22,.8,.3,1) infinite;
}
.pin.bau-status .pin-build-tool svg,.pin.neu-status .pin-build-tool svg{
  animation:bauHammerPremium 1.72s cubic-bezier(.2,.8,.25,1) infinite!important;
  transform-origin:72% 78%;will-change:transform;
}
@keyframes bauHammerPremium{
  0%,16%{transform:translate(-1px,1px) rotate(-31deg) scale(.98)}
  39%{transform:translate(0,-1px) rotate(-38deg) scale(1.02)}
  53%{transform:translate(1px,1px) rotate(23deg) scale(1.04)}
  58%{transform:translate(0,0) rotate(14deg) scale(.98)}
  70%,100%{transform:translate(-1px,1px) rotate(-28deg) scale(1)}
}
@keyframes bauToolRecoil{
  0%,48%,66%,100%{transform:translateY(0) scale(1)}
  54%{transform:translateY(1.5px) scale(.94)}
  60%{transform:translateY(-1px) scale(1.035)}
}

/* Impact burst is synced to hammer contact. */
.pin.bau-status .pin-build-tool::before,.pin.neu-status .pin-build-tool::before{
  content:"";position:absolute;left:-7px;bottom:-4px;width:18px;height:12px;pointer-events:none;
  background:
    radial-gradient(circle at 35% 65%,#f5b73d 0 1.4px,transparent 1.7px),
    radial-gradient(circle at 58% 35%,#fff4bd 0 1.2px,transparent 1.5px),
    radial-gradient(circle at 78% 74%,#d9971a 0 1.1px,transparent 1.4px);
  opacity:0;transform:scale(.35) rotate(-8deg);transform-origin:70% 75%;
  animation:bauImpactSpark 1.72s ease-out infinite;
}
.pin.bau-status .pin-build-tool::after,.pin.neu-status .pin-build-tool::after{
  content:"";position:absolute;left:-5px;bottom:-6px;width:16px;height:8px;border-radius:50%;
  background:radial-gradient(ellipse,#d8c39b80 0 30%,transparent 72%);opacity:0;
  transform:translateY(2px) scale(.4);animation:bauImpactDust 1.72s ease-out infinite;pointer-events:none;
}
@keyframes bauImpactSpark{
  0%,50%{opacity:0;transform:scale(.25) rotate(-8deg)}
  54%{opacity:1;transform:scale(1) rotate(4deg)}
  63%,100%{opacity:0;transform:translate(-4px,-5px) scale(1.35) rotate(12deg)}
}
@keyframes bauImpactDust{
  0%,51%{opacity:0;transform:translateY(2px) scale(.35)}
  57%{opacity:.65;transform:translateY(0) scale(.9)}
  72%,100%{opacity:0;transform:translate(-3px,-5px) scale(1.45)}
}

/* Factory construction gets a more readable, premium progress treatment. */
.pin.bau-status .pin-status-ring{overflow:visible}
.pin.bau-status .pin-status-ring .ring-bg{stroke:#ffffff30;stroke-width:4.5}
.pin.bau-status .pin-status-ring .ring-fg{
  stroke-width:4.5;stroke-linecap:round;
  transition:stroke-dasharray .55s cubic-bezier(.2,.8,.3,1);
  animation:bauRingAtmen 2.7s ease-in-out infinite;
}
@keyframes bauRingAtmen{
  0%,100%{opacity:.82}
  50%{opacity:1}
}
.pin.bau-status .knopf::before{
  content:"";position:absolute;inset:-5px;border-radius:inherit;border:1px solid #f5b73d55;
  opacity:.3;transform:scale(.96);pointer-events:none;
  animation:bauPinAtmen 2.7s ease-in-out infinite;
}
@keyframes bauPinAtmen{
  0%,100%{opacity:.18;transform:scale(.96)}
  50%{opacity:.58;transform:scale(1.055)}
}

/* Status changes settle into place instead of simply appearing. */
.pin .pin-state-badge,.pin .pin-status-hint,.pin .pin-build-tool{
  animation-fill-mode:both;
}
.pin.bau-status .pin-state-badge,.pin.neu-status .pin-state-badge,
.pin.inaktiv-status .pin-state-badge,.pin.world-warn-status .pin-state-badge{
  animation:statusBadgeIn .34s cubic-bezier(.18,1.25,.35,1) both;
}
@keyframes statusBadgeIn{
  from{opacity:0;transform:translateY(3px) scale(.72)}
  68%{opacity:1;transform:translateY(-1px) scale(1.06)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
.pin.bau-status .pin-status-hint,.pin.neu-status .pin-status-hint,
.pin.inaktiv-status .pin-status-hint,.pin.world-warn-status .pin-status-hint{
  animation:statusHintIn .3s .06s ease-out both;
}
@keyframes statusHintIn{
  from{opacity:0;transform:translate(-50%,3px)}
  to{opacity:1;transform:translate(-50%,0)}
}

/* Active status is alive but deliberately subtle. */
.pin.aktiv-status .pin-state-badge.status-aktiv{
  animation:aktivPunktPremium 2.25s ease-in-out infinite;
}
.pin.aktiv-status .pin-state-badge.status-aktiv::after{
  content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid #2fbe7e80;
  opacity:0;transform:scale(.6);animation:aktivHaloPremium 2.25s ease-out infinite;
}
@keyframes aktivPunktPremium{
  0%,100%{transform:scale(.94)}
  45%{transform:scale(1.08)}
}
@keyframes aktivHaloPremium{
  0%,20%{opacity:0;transform:scale(.6)}
  42%{opacity:.55}
  72%,100%{opacity:0;transform:scale(1.45)}
}

/* Warnings should be noticeable, not frantic. */
.pin.world-warn-status .pin-state-badge.status-warn{
  animation:statusBadgeIn .34s cubic-bezier(.18,1.25,.35,1) both, warnBadgePremium 1.8s .42s ease-in-out infinite;
}
@keyframes warnBadgePremium{
  0%,100%{box-shadow:0 2px 5px #0004,0 0 0 0 #e0504a00}
  50%{box-shadow:0 2px 5px #0004,0 0 0 5px #e0504a25}
}

/* Newly opened instant-build sites: one short staged entrance, then calm. */
.pin.neu-status .knopf{animation:neuStandortPremium .72s cubic-bezier(.18,1.35,.35,1) both}
@keyframes neuStandortPremium{
  0%{transform:translateY(6px) scale(.78);opacity:.45}
  58%{transform:translateY(-2px) scale(1.08);opacity:1}
  100%{transform:translateY(0) scale(1);opacity:1}
}

/* Quiet mode keeps the same meaning with fewer continuous effects. */
body[data-anim="1"] .pin.bau-status .pin-build-tool,
body[data-anim="1"] .pin.neu-status .pin-build-tool,
body[data-anim="1"] .pin.bau-status .pin-build-tool svg,
body[data-anim="1"] .pin.neu-status .pin-build-tool svg,
body[data-anim="1"] .pin.bau-status .pin-build-tool::before,
body[data-anim="1"] .pin.neu-status .pin-build-tool::before,
body[data-anim="1"] .pin.bau-status .pin-build-tool::after,
body[data-anim="1"] .pin.neu-status .pin-build-tool::after{animation-duration:2.35s!important}
body[data-anim="1"] .pin.aktiv-status .pin-state-badge.status-aktiv::after{display:none}
body[data-anim="1"] .pin.bau-status .knopf::before{animation:none;opacity:.28;transform:none}

@media(prefers-reduced-motion:reduce){
  .pin.bau-status .pin-build-tool,.pin.neu-status .pin-build-tool,
  .pin.bau-status .pin-build-tool svg,.pin.neu-status .pin-build-tool svg,
  .pin.bau-status .pin-build-tool::before,.pin.neu-status .pin-build-tool::before,
  .pin.bau-status .pin-build-tool::after,.pin.neu-status .pin-build-tool::after,
  .pin.bau-status .pin-status-ring .ring-fg,.pin.bau-status .knopf::before,
  .pin .pin-state-badge,.pin .pin-status-hint,.pin.aktiv-status .pin-state-badge.status-aktiv,
  .pin.aktiv-status .pin-state-badge.status-aktiv::after,.pin.world-warn-status .pin-state-badge.status-warn,
  .pin.neu-status .knopf{animation:none!important;transition:none!important}
}

/* ===== aus premium-animation-treatment.js: Bau-/Status-Animationen, Feinschliff ===== */
/* --- Shared material feel --- */
.pin .knopf{backface-visibility:hidden;transform:translateZ(0)}
.pin-state-badge,.pin-build-tool,.pin-status-hint{backface-visibility:hidden}

/* --- Construction: staged pulse + contact + settle --- */
.pin.bau-status .knopf{
  animation:premiumBuildBody 2.2s cubic-bezier(.22,.8,.28,1) infinite;
}
@keyframes premiumBuildBody{
  0%,37%,68%,100%{transform:translateY(0) scale(1)}
  50%{transform:translateY(.7px) scale(.985)}
  58%{transform:translateY(-.6px) scale(1.015)}
}
.pin.bau-status .pin-build-tool{
  animation:premiumToolBody 2.2s cubic-bezier(.18,.82,.25,1) infinite!important;
}
.pin.bau-status .pin-build-tool svg{
  animation:premiumHammer 2.2s cubic-bezier(.18,.82,.25,1) infinite!important;
}
@keyframes premiumToolBody{
  0%,35%,67%,100%{transform:translate(0,0) scale(1)}
  49%{transform:translate(.8px,1px) scale(.95)}
  57%{transform:translate(-.4px,-.7px) scale(1.035)}
}
@keyframes premiumHammer{
  0%,18%{transform:translate(-1px,1px) rotate(-34deg)}
  38%{transform:translate(-1px,-1px) rotate(-43deg)}
  51%{transform:translate(1px,1px) rotate(24deg) scale(1.04)}
  57%{transform:translate(0,0) rotate(11deg) scale(.98)}
  70%,100%{transform:translate(-1px,1px) rotate(-31deg) scale(1)}
}

/* richer impact without extra DOM */
.pin.bau-status .pin-build-tool::before{
  background:
    radial-gradient(circle at 18% 68%,#fff7c9 0 1.1px,transparent 1.5px),
    radial-gradient(circle at 42% 31%,#f5b73d 0 1.5px,transparent 1.9px),
    radial-gradient(circle at 66% 66%,#fff0a4 0 1.15px,transparent 1.55px),
    radial-gradient(circle at 86% 40%,#d9971a 0 1px,transparent 1.35px);
  filter:drop-shadow(0 0 2px #f5b73d66);
  animation:premiumImpactSpark 2.2s ease-out infinite!important;
}
.pin.bau-status .pin-build-tool::after{
  animation:premiumImpactDust 2.2s ease-out infinite!important;
}
@keyframes premiumImpactSpark{
  0%,48%{opacity:0;transform:scale(.2) rotate(-10deg)}
  52%{opacity:1;transform:scale(1.08) rotate(3deg)}
  63%,100%{opacity:0;transform:translate(-5px,-6px) scale(1.5) rotate(13deg)}
}
@keyframes premiumImpactDust{
  0%,49%{opacity:0;transform:translateY(2px) scale(.3)}
  55%{opacity:.68;transform:translateY(0) scale(.95)}
  74%,100%{opacity:0;transform:translate(-4px,-6px) scale(1.65)}
}

/* progress feels instrument-like instead of decorative */
.pin.bau-status .pin-status-ring .ring-bg{stroke:#ffffff28;stroke-width:4.2}
.pin.bau-status .pin-status-ring .ring-fg{
  stroke-width:4.8;
  filter:drop-shadow(0 0 2px #f5b73d55);
  transition:stroke-dasharray .62s cubic-bezier(.16,.84,.26,1),opacity .25s ease;
  animation:premiumRingGlow 3.2s ease-in-out infinite!important;
}
@keyframes premiumRingGlow{0%,100%{opacity:.82}50%{opacity:1}}

/* badges have depth and restrained entrance */
.pin-state-badge{box-shadow:0 1px 0 #fff8 inset,0 3px 7px #0004}
.pin.bau-status .pin-state-badge.status-bau{
  background:linear-gradient(#ffd96d,#f5b73d);
  border-color:#fff4c6;
  text-shadow:0 1px #fff6;
}
.pin.inaktiv-status .pin-state-badge.status-inaktiv{
  background:linear-gradient(#f5f0e6,#ddd2be);
  border-color:#fffaf1;
}
.pin.world-warn-status .pin-state-badge.status-warn{
  background:linear-gradient(#f06c65,#d94741);
  border-color:#ffe0dd;
}

/* active pins feel alive, but calmer than building */
.pin.aktiv-status .knopf{
  animation:premiumActiveBreath 4.8s ease-in-out infinite;
}
@keyframes premiumActiveBreath{
  0%,100%{box-shadow:0 0 0 2px #2fbe7e22,0 3px 5px rgba(0,0,0,.32)}
  50%{box-shadow:0 0 0 3px #2fbe7e38,0 3px 5px rgba(0,0,0,.32)}
}
.pin.aktiv-status .pin-state-badge.status-aktiv{
  box-shadow:0 0 0 2px #fff,0 2px 5px #0003,0 0 7px #2fbe7e55;
  animation:premiumActiveDot 3.4s ease-in-out infinite!important;
}
@keyframes premiumActiveDot{0%,100%{transform:scale(.94);opacity:.9}50%{transform:scale(1.08);opacity:1}}

/* inactive = visually settled, not disabled-looking */
.pin.inaktiv-status .knopf{
  filter:saturate(.72) brightness(.96)!important;
  opacity:.94!important;
  animation:premiumInactiveSettle .44s cubic-bezier(.2,1.15,.35,1) both;
}
@keyframes premiumInactiveSettle{
  from{transform:translateY(-1px) scale(1.025)}
  to{transform:translateY(0) scale(1)}
}

/* warning: deliberate heartbeat rather than frantic pulsing */
.pin.world-warn-status .knopf{
  animation:premiumWarningBeat 2.35s ease-in-out infinite!important;
}
@keyframes premiumWarningBeat{
  0%,100%{transform:scale(1)}
  42%{transform:scale(1.025)}
  50%{transform:scale(1.065)}
  61%{transform:scale(1)}
}

/* one-shot transition overlays */
.premium-pin-fx{position:absolute;inset:-18px;z-index:7;pointer-events:none;border-radius:50%;overflow:visible}
.premium-pin-fx::before,.premium-pin-fx::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none}
.premium-pin-fx.complete::before{
  border:2px solid #7ce3ae;opacity:0;
  animation:premiumCompleteRing .82s cubic-bezier(.18,.8,.25,1) both;
}
.premium-pin-fx.complete::after{
  inset:12px;background:radial-gradient(circle,#effff6 0 18%,#6edfa655 38%,transparent 70%);
  opacity:0;animation:premiumCompleteFlash .7s ease-out both;
}
@keyframes premiumCompleteRing{
  0%{opacity:0;transform:scale(.55)}
  28%{opacity:.95}
  100%{opacity:0;transform:scale(1.45)}
}
@keyframes premiumCompleteFlash{
  0%{opacity:0;transform:scale(.5)}
  24%{opacity:1;transform:scale(1)}
  100%{opacity:0;transform:scale(1.35)}
}
.pin.premium-complete .knopf{animation:premiumCompleteSettle .72s cubic-bezier(.16,1.3,.3,1) both!important}
@keyframes premiumCompleteSettle{
  0%{transform:scale(.96)}
  42%{transform:scale(1.13)}
  70%{transform:scale(.985)}
  100%{transform:scale(1)}
}

.premium-pin-fx.change::before{
  inset:5px;border:1.5px solid #ffffffb8;opacity:0;
  animation:premiumStateSweep .48s ease-out both;
}
@keyframes premiumStateSweep{
  0%{opacity:0;transform:scale(.75)}
  35%{opacity:.75}
  100%{opacity:0;transform:scale(1.18)}
}

/* freshly opened instant-build locations: staged materialisation */
.pin.neu-status .knopf{
  animation:premiumNewSite .82s cubic-bezier(.16,1.32,.3,1) both!important;
}
.pin.neu-status .pin-build-tool{animation-duration:2.15s!important}
@keyframes premiumNewSite{
  0%{opacity:.2;transform:translateY(8px) scale(.7)}
  52%{opacity:1;transform:translateY(-2px) scale(1.09)}
  74%{transform:translateY(.5px) scale(.985)}
  100%{transform:translateY(0) scale(1)}
}

/* quiet mode preserves hierarchy, removes secondary continuous polish */
body[data-anim="1"] .pin.bau-status .knopf,
body[data-anim="1"] .pin.bau-status .pin-build-tool,
body[data-anim="1"] .pin.bau-status .pin-build-tool svg,
body[data-anim="1"] .pin.bau-status .pin-build-tool::before,
body[data-anim="1"] .pin.bau-status .pin-build-tool::after{animation-duration:3s!important}
body[data-anim="1"] .pin.bau-status .pin-status-ring .ring-fg,
body[data-anim="1"] .pin.aktiv-status .knopf,
body[data-anim="1"] .pin.aktiv-status .pin-state-badge.status-aktiv{animation:none!important}

@media(prefers-reduced-motion:reduce){
  .pin.bau-status .knopf,.pin.bau-status .pin-build-tool,.pin.bau-status .pin-build-tool svg,
  .pin.bau-status .pin-build-tool::before,.pin.bau-status .pin-build-tool::after,
  .pin.bau-status .pin-status-ring .ring-fg,.pin.aktiv-status .knopf,
  .pin.aktiv-status .pin-state-badge.status-aktiv,.pin.inaktiv-status .knopf,
  .pin.world-warn-status .knopf,.premium-pin-fx::before,.premium-pin-fx::after,
  .pin.premium-complete .knopf,.pin.neu-status .knopf{animation:none!important;transition:none!important}
  .premium-pin-fx{display:none!important}
}

/* ===== aus premium-animation-polish.js: Prozess-, Verkaufs- und Einführungs-Animationen, Feinschliff ===== */
/* Process scenes: premium staging without extra continuous DOM work. */
.prozessszene{
  animation:premiumProcessSceneIn .46s cubic-bezier(.18,1.08,.32,1) both;
  box-shadow:inset 0 1px #ffffff90,0 6px 16px #3c2d1812;
}
@keyframes premiumProcessSceneIn{
  from{opacity:0;transform:translateY(5px) scale(.985)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
.prozessszene.aktiv .prozess-meta-pfeil{
  box-shadow:inset 0 1px #ffffffa0,0 2px 6px #23734f18;
  animation:premiumProcessArrow 3.4s ease-in-out infinite;
}
@keyframes premiumProcessArrow{
  0%,20%,100%{transform:scale(1);box-shadow:inset 0 1px #ffffffa0,0 2px 6px #23734f10}
  42%{transform:scale(1.08);box-shadow:inset 0 1px #ffffffa0,0 3px 10px #23734f28}
  60%{transform:scale(1)}
}
.prozessszene.aktiv .prozess-status i{
  box-shadow:0 0 0 2px #fff,0 0 7px #2fbe7e55;
  animation:premiumProcessStatus 3.4s ease-in-out infinite;
}
@keyframes premiumProcessStatus{
  0%,100%{transform:scale(.9);opacity:.85}
  50%{transform:scale(1.08);opacity:1}
}
.prozess-materialliste span.ok{box-shadow:inset 0 1px #ffffff90}
.prozess-materialliste span.fehlt{animation:premiumMissingMaterial 2.4s ease-in-out infinite}
@keyframes premiumMissingMaterial{
  0%,100%{box-shadow:inset 0 0 0 1px #e9aaa4,0 0 0 0 #e0504a00}
  50%{box-shadow:inset 0 0 0 1px #e9aaa4,0 0 0 3px #e0504a14}
}

/* Sale: tactile conversion from product to cash. */
.verkauf-paket{filter:drop-shadow(0 4px 5px #0002)}
.verkauf-paket::before{
  box-shadow:inset 0 1px #fff,0 2px 5px #0002;
  letter-spacing:.01em;
}
.verkauf-geld{
  text-shadow:0 1px #fff,0 3px 9px #2fbe7e30;
  filter:drop-shadow(0 2px 4px #0001);
}
.pille.kasse.verkauf-puls{
  animation:premiumCashPulse .68s cubic-bezier(.16,1.3,.3,1)!important;
}
@keyframes premiumCashPulse{
  0%{transform:scale(1)}
  28%{transform:translateY(-1px) scale(1.12)}
  55%{transform:translateY(0) scale(.985)}
  76%{transform:scale(1.025)}
  100%{transform:scale(1)}
}

/* Tutorial feedback: one clean acknowledgement, not arcade confetti. */
#tutorial-lernfeedback{
  box-shadow:inset 0 1px #ffffffc0,0 9px 24px #0003;
}
#tutorial-lernfeedback.rein{
  animation:premiumTutorialFeedback 2.9s cubic-bezier(.18,.85,.28,1) both!important;
}
@keyframes premiumTutorialFeedback{
  0%{opacity:0;transform:translate(-50%,-10px) scale(.965)}
  10%{opacity:1;transform:translate(-50%,1px) scale(1.025)}
  16%,76%{opacity:1;transform:translate(-50%,0) scale(1)}
  100%{opacity:0;transform:translate(-50%,-5px) scale(.99)}
}

/* Quiet mode: retain hierarchy, remove secondary continuous polish. */
body[data-anim="1"] .prozessszene.aktiv .prozess-meta-pfeil,
body[data-anim="1"] .prozessszene.aktiv .prozess-status i,
body[data-anim="1"] .prozess-materialliste span.fehlt{animation:none!important}

@media(prefers-reduced-motion:reduce){
  .prozessszene,.prozessszene.aktiv .prozess-meta-pfeil,.prozessszene.aktiv .prozess-status i,
  .prozess-materialliste span.fehlt,.pille.kasse.verkauf-puls,#tutorial-lernfeedback.rein{
    animation:none!important;transition:none!important
  }
}

/* ===== aus premium-animation-treatment-v2.js: einmalige Übergangs-Animationen an Pins ===== */
.premium-v2-fx{position:absolute;inset:-20px;z-index:8;pointer-events:none;border-radius:50%;overflow:visible}
.premium-v2-fx::before,.premium-v2-fx::after{content:"";position:absolute;pointer-events:none}
.premium-v2-fx.tick::before{inset:4px;border-radius:50%;border:2px solid #ffd66f;opacity:0;animation:premiumV2TickRing .62s cubic-bezier(.16,.84,.26,1) both}
.premium-v2-fx.tick::after{width:7px;height:7px;right:6px;top:7px;border-radius:50%;background:#fff7cc;box-shadow:-9px 5px 0 -1px #f5b73d,3px 10px 0 -2px #fff0a4;opacity:0;animation:premiumV2TickSpark .62s ease-out both}
@keyframes premiumV2TickRing{0%{opacity:0;transform:scale(.76)}30%{opacity:.78}100%{opacity:0;transform:scale(1.18)}}
@keyframes premiumV2TickSpark{0%,18%{opacity:0;transform:translate(0,0) scale(.5)}32%{opacity:1}100%{opacity:0;transform:translate(5px,-8px) scale(1.15)}}
.premium-v2-fx.final::before{inset:-3px;border-radius:50%;border:2px solid #8ce6b5;opacity:0;box-shadow:0 0 14px #64d99a66;animation:premiumV2FinalRing .95s cubic-bezier(.16,.9,.25,1) both}
.premium-v2-fx.final::after{inset:8px;border-radius:50%;background:radial-gradient(circle at 50% 50%,#ffffff 0 8%,#bdf3d555 27%,transparent 58%),conic-gradient(from 0deg,transparent 0 8%,#baf1d088 8% 10%,transparent 10% 23%,#fff7c988 23% 25%,transparent 25% 48%,#baf1d088 48% 50%,transparent 50% 73%,#fff7c988 73% 75%,transparent 75%);opacity:0;animation:premiumV2FinalFlash .86s ease-out both}
@keyframes premiumV2FinalRing{0%{opacity:0;transform:scale(.55)}25%{opacity:1}72%{opacity:.42}100%{opacity:0;transform:scale(1.55)}}
@keyframes premiumV2FinalFlash{0%{opacity:0;transform:scale(.58) rotate(-10deg)}22%{opacity:.95;transform:scale(1) rotate(0)}100%{opacity:0;transform:scale(1.42) rotate(12deg)}}
.pin.premium-v2-final .knopf{animation:premiumV2FinalSettle .82s cubic-bezier(.16,1.28,.3,1) both!important}
@keyframes premiumV2FinalSettle{0%{transform:scale(.96)}32%{transform:scale(1.14)}58%{transform:scale(.985)}78%{transform:scale(1.025)}100%{transform:scale(1)}}
.pin.bau-status .pin-state-badge.status-bau{overflow:hidden}
.pin.bau-status .pin-state-badge.status-bau::after{content:"";position:absolute;inset:-4px -18px;background:linear-gradient(105deg,transparent 25%,#ffffff80 48%,transparent 68%);transform:translateX(-120%);animation:premiumV2BuildBadgeGlint 4.6s ease-in-out infinite;pointer-events:none}
@keyframes premiumV2BuildBadgeGlint{0%,70%,100%{transform:translateX(-120%)}82%{transform:translateX(120%)}}
.pin.bau-status .pin-status-ring{filter:drop-shadow(0 2px 3px #0002)}
.prozess-reaktor,.fabrikmaschine{isolation:isolate}
.prozess-reaktor::after,.fabrikmaschine::after{content:"";position:absolute;inset:13px;border-radius:50%;z-index:-1;background:radial-gradient(circle,#fff8d8 0 14%,#f5b73d42 38%,transparent 72%);opacity:0;transform:scale(.7)}
.raff-prozess.aktiv .prozess-reaktor::after{animation:premiumV2MachineBeat 2.4s .8s ease-out infinite}
.fabrik-prozess.aktiv .fabrikmaschine::after{animation:premiumV2MachineBeat 2.6s 1.02s ease-out infinite}
@keyframes premiumV2MachineBeat{0%,38%{opacity:0;transform:scale(.68)}47%{opacity:.78;transform:scale(1)}67%,100%{opacity:0;transform:scale(1.38)}}
.raff-prozess.aktiv .prozess-reaktor svg{animation:premiumV2MachineSettle 2.4s .8s ease-in-out infinite}
.fabrik-prozess.aktiv .fabrikmaschine svg{animation:premiumV2MachineSettle 2.6s 1.02s ease-in-out infinite}
@keyframes premiumV2MachineSettle{0%,43%,70%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(.8px) scale(.985)}58%{transform:translateY(-.5px) scale(1.012)}}
.materialblock,.produktkarton{overflow:hidden}
.materialblock::before,.produktkarton::after{content:"";position:absolute;top:-30%;bottom:-30%;width:16px;background:linear-gradient(90deg,transparent,#ffffffb8,transparent);transform:translateX(-55px) rotate(14deg);opacity:0;pointer-events:none}
.raff-prozess.aktiv .materialblock::before{animation:premiumV2OutputGlint 2.4s 1.1s ease-in-out infinite}
.fabrik-prozess.aktiv .produktkarton::after{animation:premiumV2OutputGlint 2.6s 1.34s ease-in-out infinite}
@keyframes premiumV2OutputGlint{0%,38%{opacity:0;transform:translateX(-55px) rotate(14deg)}48%{opacity:.82}67%{opacity:0;transform:translateX(58px) rotate(14deg)}100%{opacity:0}}
.prozessszene.aktiv .prozesslinie{box-shadow:0 1px 0 #fff8,0 3px 6px #5b49311a}
.verkauf-paket{overflow:hidden;transform-origin:50% 82%;backface-visibility:hidden}
.verkauf-paket::before{content:"";position:absolute;inset:-12px -28px;background:linear-gradient(110deg,transparent 32%,#fff9 48%,transparent 64%);transform:translateX(-115%);animation:premiumV2ParcelGlint .85s .12s ease-out both;pointer-events:none}
@keyframes premiumV2ParcelGlint{0%,20%{transform:translateX(-115%);opacity:0}38%{opacity:.85}100%{transform:translateX(115%);opacity:0}}
.verkauf-geld{isolation:isolate;overflow:visible}
.verkauf-geld::before{content:"";position:absolute;inset:-7px;border-radius:999px;z-index:-1;border:1.5px solid #64d99a88;opacity:0;animation:premiumV2MoneyHalo .92s ease-out both}
@keyframes premiumV2MoneyHalo{0%{opacity:0;transform:scale(.65)}25%{opacity:.8}100%{opacity:0;transform:scale(1.4)}}
#didaktik-transport .didaktik-truck{filter:drop-shadow(0 3px 2px #0003)}
#didaktik-transport .didaktik-ship{filter:drop-shadow(0 4px 3px #0002)}
#didaktik-transport>circle{filter:drop-shadow(0 0 3px #fff8)}
#tutorial-lernfeedback{overflow:hidden}
#tutorial-lernfeedback::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,#2fbe7e,#8ce6b5,#f5b73d);transform-origin:left;animation:premiumV2TutorialLine 2.72s linear both}
@keyframes premiumV2TutorialLine{from{transform:scaleX(0);opacity:.9}78%{transform:scaleX(1);opacity:.9}to{transform:scaleX(1);opacity:0}}
body[data-anim="1"] .pin.bau-status .pin-state-badge.status-bau::after,body[data-anim="1"] .prozess-reaktor::after,body[data-anim="1"] .fabrikmaschine::after,body[data-anim="1"] .raff-prozess.aktiv .prozess-reaktor svg,body[data-anim="1"] .fabrik-prozess.aktiv .fabrikmaschine svg,body[data-anim="1"] .materialblock::before,body[data-anim="1"] .produktkarton::after{animation:none!important}
@media(prefers-reduced-motion:reduce){.premium-v2-fx,.pin.bau-status .pin-state-badge.status-bau::after,.prozess-reaktor::after,.fabrikmaschine::after,.raff-prozess.aktiv .prozess-reaktor svg,.fabrik-prozess.aktiv .fabrikmaschine svg,.materialblock::before,.produktkarton::after,.verkauf-paket::before,.verkauf-geld::before,#tutorial-lernfeedback::after{animation:none!important;transition:none!important}.premium-v2-fx{display:none!important}}

/* ===== aus notification-history.js: Meldungen und Meldungsverlauf ===== */
#toast-history-control{
  position:absolute;left:10px;top:calc(var(--hudh) + 4px);z-index:43;
  display:flex;align-items:center;gap:7px;height:30px;padding:0 10px 0 8px;
  border-radius:999px;background:#0b3648ee;color:#fff;border:1px solid #ffffff2f;
  box-shadow:0 2px 7px #0003;font-family:"Baloo 2",sans-serif;font-size:var(--f0);font-weight:800;
  transition:opacity .22s ease,transform .22s ease,background .2s ease;pointer-events:auto
}
#toast-history-control svg{width:15px;height:15px;opacity:.9}
#toast-history-control .toast-history-count{min-width:18px;height:18px;padding:0 5px;border-radius:999px;
  display:grid;place-items:center;background:#ffffff20;color:#fff;font-size:10px;font-variant-numeric:tabular-nums}
#toast-history-control:not(:disabled):active{transform:translateY(1px) scale(.98)}
#toast-history-control:disabled{opacity:.42;cursor:default}
body.fensterauf #toast-history-control{opacity:0;pointer-events:none}

#toasts{top:calc(var(--hudh) + 39px)!important;width:min(48%,330px)!important;gap:7px!important}
.toast{
  position:relative;isolation:isolate;overflow:hidden;
  background:transparent!important;color:#fff!important;border-radius:0 15px 15px 0!important;
  padding:10px 13px 10px 31px!important;border-left-width:4px!important;
  box-shadow:none!important;text-shadow:0 1px 2px #000b;
  animation:toastPremiumIn .44s cubic-bezier(.18,1.05,.3,1) both!important;
  transition:opacity .72s ease,transform .72s cubic-bezier(.2,.8,.3,1),filter .72s ease!important;
  transform-origin:left center
}
.toast::before{
  content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;
  background:linear-gradient(90deg,
    rgba(5,24,35,.16) 0%,
    rgba(5,24,35,.70) 15%,
    rgba(5,24,35,.90) 35%,
    rgba(5,24,35,.965) 72%,
    rgba(5,24,35,.985) 100%);
  border-radius:inherit
}
.toast::after{
  content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:inherit;
  background:linear-gradient(180deg,#ffffff10,transparent 38%,#00000016);
  box-shadow:inset 0 1px #ffffff1f,inset -1px 0 #ffffff15,0 5px 14px #0003
}
.toast.toast-aus{opacity:0!important;transform:translateX(-16px) scale(.985)!important;filter:blur(.35px)}
@keyframes toastPremiumIn{
  0%{opacity:0;transform:translateX(-18px) scale(.975);filter:blur(1px)}
  62%{opacity:1;transform:translateX(2px) scale(1.008);filter:blur(0)}
  100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}
}
.toast.gut{border-left-color:var(--gruen)!important}
.toast.warn{border-left-color:var(--warn)!important}
.toast.alarm{border-left-color:var(--alarm)!important}

#toast-history-backdrop{position:fixed;inset:0;z-index:88;background:#061b28a8;opacity:0;pointer-events:none;
  transition:opacity .22s ease}
#toast-history-panel{
  position:fixed;left:10px;top:calc(env(safe-area-inset-top) + 10px);bottom:calc(var(--dockh) + 10px);z-index:89;
  width:min(430px,calc(100vw - 20px));display:flex;flex-direction:column;overflow:hidden;
  background:linear-gradient(180deg,#fffdf7,#f4ead6);color:var(--tinte);border:1px solid #ffffff;
  border-radius:20px;box-shadow:0 18px 48px #0007,0 4px 0 #0002;
  opacity:0;transform:translateX(-18px) scale(.985);pointer-events:none;
  transition:opacity .26s ease,transform .3s cubic-bezier(.18,1.05,.3,1)
}
body.toast-history-open #toast-history-backdrop{opacity:1;pointer-events:auto}
body.toast-history-open #toast-history-panel{opacity:1;transform:translateX(0) scale(1);pointer-events:auto}
body.toast-history-open #toasts,body.toast-history-open #toast-history-control{opacity:0;pointer-events:none}
.toast-history-head{display:flex;align-items:center;gap:10px;padding:13px 13px 11px 15px;
  background:linear-gradient(135deg,#0b3648,#154e66);color:#fff;border-bottom:1px solid #ffffff20}
.toast-history-head .hist-icon{width:34px;height:34px;border-radius:11px;background:#ffffff16;display:grid;place-items:center;flex:none}
.toast-history-head .hist-icon svg{width:19px;height:19px}
.toast-history-head h2{font-size:var(--f3);margin:0}
.toast-history-head small{display:block;font-size:var(--f0);opacity:.72;font-weight:700;margin-top:1px}
#toast-history-close{margin-left:auto;width:36px;height:36px;border-radius:11px;background:#ffffff13;color:#fff;
  display:grid;place-items:center;font-size:22px;line-height:1}
#toast-history-list{overflow:auto;padding:9px 10px 16px;display:flex;flex-direction:column;gap:7px;overscroll-behavior:contain}
.toast-history-empty{padding:28px 12px;text-align:center;color:var(--grau);font-size:var(--f1)}
.toast-history-item{position:relative;padding:10px 11px 10px 15px;border-radius:14px;background:#fffaf0;
  border:1px solid #e4d8c1;box-shadow:0 2px 7px #4b38200d}
.toast-history-item::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:4px;border-radius:0 5px 5px 0;background:#8c806e}
.toast-history-item.gut::before{background:var(--gruen)}
.toast-history-item.warn::before{background:var(--warn)}
.toast-history-item.alarm::before{background:var(--alarm)}
.toast-history-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;
  color:var(--grau);font-size:var(--f0);font-weight:800}
.toast-history-message{font-size:var(--f1);font-weight:700;line-height:1.38;user-select:text;-webkit-user-select:text}

@media(max-width:560px){
  #toasts{width:min(72%,310px)!important}
  body:has(#quest:not([hidden])) #toasts{width:min(45%,300px)!important}
  #toast-history-panel{right:10px;width:auto}
}
@media(prefers-reduced-motion:reduce){
  .toast,#toast-history-control,#toast-history-backdrop,#toast-history-panel{animation:none!important;transition:none!important}
  .toast.toast-aus{filter:none!important}
}

/* ===== aus stop-safety-visual.js: Streik/Stillstand vs. Sicherheit/Unfall ===== */
/* A stopped mine must visibly stop. */
.pin.mine-stop .knopf>svg,.pin.mine-stop .knopf>span.sym{animation:none!important;transform:none!important}
.pin.mine-stop .staub{display:none!important;animation:none!important}
.pin.mine-stop .knopf{box-shadow:0 0 0 3px #ffffff12,0 3px 5px rgba(0,0,0,.32)!important}
.pin.mine-stop .pin-state-badge.status-warn{min-width:22px;height:22px;padding:0}
.pin.mine-stop .pin-status-hint{font-weight:900}

.pin.mine-stop-strike .knopf{border-color:#f08c2e!important;filter:saturate(.66) brightness(.94)!important}
.pin.mine-stop-strike .bez{background:#75441f!important}
.pin.mine-stop-strike .pin-state-badge.status-warn{background:#f08c2e!important;border-color:#ffe5bf!important;color:#fff!important}
.pin.mine-stop-safety .knopf{border-color:#e0504a!important;filter:saturate(.48) brightness(.92)!important}
.pin.mine-stop-safety .bez{background:#7d2f2b!important}
.pin.mine-stop-safety .pin-state-badge.status-warn{background:#e0504a!important;border-color:#ffd8d5!important;color:#fff!important}
.pin.mine-stop-generic .knopf{filter:saturate(.58) brightness(.93)!important}

.pin-stop-kind{position:absolute;right:-12px;bottom:-10px;z-index:8;width:25px;height:25px;border-radius:50%;
  display:grid;place-items:center;border:2px solid #fff;box-shadow:0 2px 5px #0004;color:#fff;pointer-events:none}
.pin-stop-kind svg{width:14px!important;height:14px!important;animation:none!important;transform:none!important}
.pin.mine-stop-strike .pin-stop-kind{background:#f08c2e}
.pin.mine-stop-safety .pin-stop-kind{background:#e0504a}
.pin.mine-stop-generic .pin-stop-kind{background:#7d7466}

.mine-stop-fx{position:absolute;inset:-11px;border-radius:50%;pointer-events:none;z-index:7;border:2px solid transparent;opacity:0}
.mine-stop-fx.rein{animation:mineStopEnter .7s cubic-bezier(.16,.9,.25,1) both}
.mine-resume-fx{position:absolute;inset:-12px;border-radius:50%;pointer-events:none;z-index:7;border:2px solid #73dfa9;opacity:0;
  animation:mineResume .75s cubic-bezier(.16,.9,.25,1) both}
.pin.mine-stop-strike .mine-stop-fx{border-color:#f08c2e}
.pin.mine-stop-safety .mine-stop-fx{border-color:#e0504a}
@keyframes mineStopEnter{0%{opacity:0;transform:scale(.72)}32%{opacity:.9}100%{opacity:0;transform:scale(1.34)}}
@keyframes mineResume{0%{opacity:0;transform:scale(.7)}28%{opacity:.95}100%{opacity:0;transform:scale(1.38)}}

/* Mine detail: make the two causal chains visibly separate. */
.sicherheitskarte{position:relative;overflow:hidden;border-color:#decaa8!important}
.sicherheitskarte::before{content:"";position:absolute;inset:0 auto 0 0;width:5px;background:var(--warn);border-radius:inherit 0 0 inherit}
.sicherheitskarte.sicher::before{background:var(--gruen)}
.sicherheitskopf{display:flex;align-items:center;gap:10px;margin-bottom:7px}
.sicherheits-symbol{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;background:#f08c2e18;color:#b85f17;border:1px solid #f08c2e3b}
.sicherheitskarte.sicher .sicherheits-symbol{background:#2fbe7e14;color:#207e57;border-color:#2fbe7e38}
.sicherheits-symbol svg{width:22px;height:22px}
.sicherheitskopf h3{margin:0!important}
.sicherheitskopf small{display:block;color:var(--grau);font-size:var(--f0);font-weight:700;line-height:1.25}

.mine-ursachen{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0 10px}
.mine-ursache{padding:8px 9px;border-radius:12px;border:1px solid #dfd3bd;background:#fffaf0;font-size:var(--f0);font-weight:800;line-height:1.3}
.mine-ursache b{display:block;font-size:var(--f0);margin:0 0 2px}
.mine-ursache.lohn{border-left:4px solid #6fb8e0}
.mine-ursache.sicherheit{border-left:4px solid #f08c2e}
.mine-ursache span{color:var(--grau);font-weight:700}

.mine-stillstand-card{position:relative;overflow:hidden}
.mine-stillstand-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#7d7466}
.mine-stillstand-card.streik::before{background:#f08c2e}
.mine-stillstand-card.sicherheit::before{background:#e0504a}
.mine-stillstand-head{display:flex;align-items:center;gap:9px;margin-bottom:6px}
.mine-stillstand-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#f3eee4;color:#615849;flex:none}
.mine-stillstand-card.streik .mine-stillstand-icon{background:#f08c2e18;color:#b85f17}
.mine-stillstand-card.sicherheit .mine-stillstand-icon{background:#e0504a15;color:#bb3731}
.mine-stillstand-icon svg{width:19px;height:19px}
.mine-stillstand-card h3{margin:0!important}
.mine-stillstand-card small{display:block;color:var(--grau);font-size:var(--f0);font-weight:700}

body[data-anim="1"] .mine-stop-fx,body[data-anim="1"] .mine-resume-fx{animation-duration:.9s!important}
@media(max-width:520px){.mine-ursachen{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){
  .mine-stop-fx,.mine-resume-fx{display:none!important;animation:none!important}
}

/* ===== aus map-focus-navigation.js: Karte zeigen: Fokus aus Meldungen und Aufgabenkarte ===== */
#welt.map-focus-moving{transition:transform .58s cubic-bezier(.2,.82,.22,1)!important}
.map-focus-ring{position:absolute;inset:-10px;border-radius:50%;z-index:20;pointer-events:none;
  border:3px solid #fff3b0;box-shadow:0 0 0 2px #f5b73dcc,0 0 18px #f5b73d99;
  animation:mapFocusRing .92s cubic-bezier(.16,.9,.25,1) both}
.pin.werk .map-focus-ring{border-radius:17px}
@keyframes mapFocusRing{0%{opacity:0;transform:scale(.55)}28%{opacity:1}72%{opacity:.95;transform:scale(1.18)}100%{opacity:0;transform:scale(1.42)}}
.map-focus-suggestion{position:absolute;left:50%;top:-38px;z-index:22;transform:translateX(-50%);
  padding:3px 8px;border-radius:999px;background:#f5b73d;color:#503300;border:2px solid #fff7d7;
  box-shadow:0 3px 8px #0004;font-family:"Baloo 2",sans-serif;font-size:10px;font-weight:900;white-space:nowrap;
  animation:mapSuggestion .32s cubic-bezier(.18,1.15,.3,1) both;pointer-events:none}
@keyframes mapSuggestion{0%{opacity:0;transform:translate(-50%,6px) scale(.88)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}

#toasts .toast.map-link{pointer-events:auto;cursor:pointer;padding-right:39px!important}
#toasts .toast.map-link:hover::after{background-color:#ffffff18}
.toast-map-cue{position:absolute;right:9px;top:50%;transform:translateY(-50%);z-index:3;width:25px;height:25px;
  border-radius:50%;display:grid;place-items:center;background:#ffffff12;border:1px solid #ffffff2e;color:#fff;pointer-events:none}
.toast-map-cue svg{width:14px;height:14px}

#quest.map-link{cursor:pointer;padding-right:43px!important;transition:transform .18s ease,box-shadow .18s ease}
#quest.map-link:active{transform:scale(.992)}
.quest-map-cue{position:absolute;right:10px;top:9px;width:27px;height:27px;border-radius:9px;display:grid;place-items:center;
  background:#0b364810;color:#315468;border:1px solid #0b364820;pointer-events:none}
.quest-map-cue svg{width:16px;height:16px}
#quest.map-link:hover .quest-map-cue{background:#f5b73d24;color:#835b0b;border-color:#f5b73d55}

@media(prefers-reduced-motion:reduce){
  #welt.map-focus-moving{transition:none!important}
  .map-focus-ring,.map-focus-suggestion{animation:none!important}
  .map-focus-ring{opacity:1!important}
}

/* ===== aus reduced-motion-final.js: reduzierte Bewegung und «Animationen: aus» ===== */
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto!important}
  *,*::before,*::after{
    animation-duration:.01ms!important;
    animation-delay:0ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
    transition-delay:0ms!important;
  }
  #welt{will-change:auto!important}
  .didaktik-truck,.didaktik-ship{will-change:auto!important}
}
body[data-anim="0"] *,body[data-anim="0"] *::before,body[data-anim="0"] *::after{
  animation:none!important;
  transition:none!important;
}
/* Premium presentation rules intentionally use !important. Give the final
   in-game motion gate an ID-scoped specificity advantage so Animationen = aus
   wins over every motion rule inside the game, plus body-level tutorial/toast UI. */
body[data-anim="0"] #spiel *,body[data-anim="0"] #spiel *::before,body[data-anim="0"] #spiel *::after,
body[data-anim="0"] #tutorial-lernfeedback,body[data-anim="0"] #tutorial-lernfeedback::before,body[data-anim="0"] #tutorial-lernfeedback::after,
body[data-anim="0"] #toasts,body[data-anim="0"] #toasts *,body[data-anim="0"] #toasts *::before,body[data-anim="0"] #toasts *::after,
body[data-anim="0"] #toast-history-control,body[data-anim="0"] #toast-history-backdrop,body[data-anim="0"] #toast-history-panel{
  animation:none!important;
  transition:none!important;
}
body[data-anim="0"] #welt,
body[data-anim="0"] .didaktik-truck,
body[data-anim="0"] .didaktik-ship{will-change:auto!important}

/* ===== aus knowledge-quest-flow.js: Wissens-Quests in der Aufgabenkarte ===== */
#quest.wissen-quest{border-top-color:#4aa978}
#quest.wissen-quest #q-punkte{margin-top:7px}
#quest.wissen-bereit{border-top-color:var(--gruen)}
#quest.wissen-bereit:not(.breit){animation:wissenQuestPulse .8s ease 3}
#quest .wissen-quest-action{width:100%;margin-top:8px;padding:8px 10px;border-radius:10px;
  background:var(--gruen);color:#fff;font-family:"Baloo 2",sans-serif;font-weight:800;
  box-shadow:0 3px 0 #18734a;font-size:var(--f1)}
#quest .wissen-quest-action:active{transform:translateY(2px);box-shadow:0 1px 0 #18734a}
@keyframes wissenQuestPulse{0%,100%{box-shadow:var(--sh)}50%{box-shadow:0 0 0 5px #2fbe7e45,var(--sh)}}
@media(prefers-reduced-motion:reduce){#quest.wissen-bereit:not(.breit){animation:none}}

/* ===== aus objective-guide.js: «Ziel zeigen» in der Aufgabenkarte ===== */
#quest .objective-guide-action{
  width:100%;min-height:42px;margin-top:8px;padding:8px 12px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;
  background:#fff7df;color:#704d0b;border:1.5px solid #e5ba55;
  font-family:"Baloo 2",sans-serif;font-weight:800;font-size:var(--f1);
  box-shadow:0 2px 0 #d6a438;
}
#quest .objective-guide-action:active{transform:translateY(1px);box-shadow:0 1px 0 #d6a438}
#quest .objective-guide-action svg{width:15px;height:15px;flex:none}
#quest.wissen-quest .objective-guide-action{background:#edf8f1;color:#276548;border-color:#83c69f;box-shadow:0 2px 0 #5aa77d}
#quest.wissen-quest .objective-guide-action:active{box-shadow:0 1px 0 #5aa77d}
@media(max-width:560px){
  #quest.wissen-quest:not(.breit){width:min(64%,300px)}
}

/* ===== aus abschluss-zertifikat.js: PDF-Abschluss im Enddialog ===== */
body:has(#erzwelt-zertifikat-form:focus-within) #quest{display:none!important}
.zertifikat-karte{border:2px solid #75aa93}
.zertifikat-karte p{overflow-wrap:anywhere}
.zertifikat-karte label{display:block;font-weight:700;margin:12px 0 5px}
.zertifikat-karte input{box-sizing:border-box;width:100%;min-width:0;min-height:44px;padding:10px;border:1px solid #9aaca8;border-radius:9px;background:#fff;color:#163c42;font:inherit}
.zertifikat-karte input:focus-visible{outline:3px solid #2584ac;outline-offset:2px}
.zertifikat-karte .cta{margin-top:16px;white-space:normal}
.zertifikat-summe{display:flex;flex-direction:column;gap:3px;padding:14px;background:#eef5f0;border-radius:10px;color:#163c42}
.zertifikat-summe b{font-size:var(--f3);overflow-wrap:anywhere}
.zertifikat-summe span{font-size:var(--f0)}
#zertifikat-status:empty{display:none}

/* ===== aus logik-fixes.js: Rahmen der Nachweis-Karten ===== */
.nachweiskarte.offen{border:2px solid #e6b450}.nachweiskarte.sicher{border:2px solid #75aa93}

/* ===== aus sek-b-klarheit.js: Aufgabenkarte kompakt, Engpass, Schwierigkeit, Blatt, Kaufleiste ===== */
#quest.tutorial-aktiv #q-punkte{display:none}
#quest.breit.kompakt{padding:7px 46px 8px 12px!important;cursor:pointer}
#quest.kompakt > :not(.kopf):not(#q-titel):not(.quest-map-cue){display:none!important}
#quest.kompakt .kopf{font-size:11px}
#quest.kompakt #q-titel{font-size:var(--f1);margin:1px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#quest.kompakt .quest-map-cue{top:50%;transform:translateY(-50%)}
#quest.kompakt:not(.map-link)::after{content:"";position:absolute;right:16px;top:50%;width:9px;height:9px;
  border:solid var(--grau);border-width:0 2.5px 2.5px 0;transform:translateY(-70%) rotate(45deg)}
#quest .tutorial-phase span{display:none}
body.ziel-fokus #toasts{opacity:.12;transition:opacity .2s}
body.fensterauf #tutorial-lernfeedback{top:calc(env(safe-area-inset-top) + 4px);padding:6px 12px;font-size:var(--f0)}
.wahl.schwierigkeit .empfohlen{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:99px;background:#e0f2e8;color:#1f6b4e;font-size:var(--f0);vertical-align:middle}
.wahl.schwierigkeit .sperre{font-weight:800}
.wert small.einheit{display:block;font-size:var(--f0);opacity:.7;margin-top:2px;font-weight:700;line-height:1.1}
.prozess-materialliste span b{font-weight:900}
#quest .engpass-kasten{display:block;width:100%;margin-top:8px;padding:7px 9px;border-radius:10px;text-align:left;
  background:#fff4e5;border:1.5px solid #e6a23c;color:#6b4206;font-size:var(--f0);line-height:1.25;cursor:pointer}
#blatt{bottom:calc(var(--dockh) + 14px);max-height:calc(76% + 16px)}
@media (max-width:819px){
  /* Handy: Blatt reicht über die Leiste unten bis an den Rand.
     Oben bleiben Kasse, Team und Tag sichtbar. */
  #blatt{bottom:0;max-height:calc(100% - 64px - env(safe-area-inset-top));padding-bottom:calc(env(safe-area-inset-bottom) + 4px)}
  body.dock-hinweis #blatt{bottom:calc(var(--dockh) + 14px);max-height:calc(100% - var(--dockh) - 78px - env(safe-area-inset-top));padding-bottom:10px}
}
#blattinhalt .kaufpause{margin:6px 0 4px;padding:7px 12px;border-radius:12px;background:#eef4fb;color:#24506f;font-size:var(--f0);font-weight:700;line-height:1.3}
#blattinhalt.kaufblatt .szene svg.buehne{height:clamp(84px,15vh,118px)}
#blattinhalt .kaufleiste{position:sticky;bottom:-14px;z-index:5;margin:12px -16px -14px;padding:8px 16px 14px;
  background:var(--papier);box-shadow:0 -12px 14px -10px rgba(0,0,0,.22)}
#blattinhalt .kaufleiste .cta{margin-top:0}
#blattinhalt .kaufpause-text{text-align:center;color:#24506f;font-size:var(--f0);font-weight:700;margin:0 0 7px;line-height:1.3}
.modell-regeln td{vertical-align:top;padding:6px 6px 6px 0}
.modell-regeln td:first-child{white-space:nowrap}
#quest .engpass-kasten b{display:block;font-family:"Baloo 2",sans-serif;font-size:var(--f1);color:#8a4b00;margin-bottom:2px}

/* ===== aus handy-layout.js: Handy-Layout: Verlauf oben, Meldungen unten, Filter-Knopf ===== */
/* 1. Verlauf in der oberen Leiste */
#hud #toast-history-control{position:static!important;height:40px;padding:0 11px 0 9px;border-radius:13px;
  border:2px solid #ffffff2e;box-shadow:0 3px 0 #00000030;font-size:var(--f1);pointer-events:auto}

/* 2. Meldungen links unten */
html body #toasts#toasts#toasts{top:auto!important;bottom:calc(var(--dockh) + 12px)!important;left:0!important;
  width:min(calc(100% - 66px),430px)!important}

/* 3. Filter-Knopf und Ebenen-Auswahl */
#zoom #filterknopf{position:relative;display:grid;place-items:center}
#zoom #filterknopf svg{width:20px;height:20px}
#zoom #filterknopf[aria-expanded="true"]{background:var(--gold);color:#4a3000;border-color:#fff6}
#filterknopf .filter-punkt{position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;
  background:var(--gold);border:2px solid #0b3648}
#filterknopf .filter-punkt[hidden]{display:none}
#ebenen{left:auto!important;right:62px;bottom:calc(var(--dockh) + 12px);max-width:none!important;
  flex-direction:column;flex-wrap:nowrap;gap:4px!important;padding:10px;border-radius:16px;
  background:var(--papier);box-shadow:0 10px 28px #0006;z-index:45;
  opacity:0;pointer-events:none;transform:translateX(8px) scale(.97);transform-origin:right bottom;
  transition:opacity .16s ease,transform .18s ease}
body.filter-offen #ebenen{opacity:1;pointer-events:auto;transform:none}
body.filter-offen #toasts{opacity:0;pointer-events:none}
body.fensterauf #ebenen{opacity:0!important;pointer-events:none!important}
#ebenen .filter-titel{margin:0 2px 4px;font-size:var(--f0);font-weight:800;color:var(--grau);
  text-transform:uppercase;letter-spacing:.05em}
#ebenen button{background:#fff8ea!important;color:var(--tinte)!important;border:2px solid #eadfc8!important;
  border-radius:12px!important;padding:8px 12px 8px 10px!important;font-size:var(--f1)!important;
  justify-content:flex-start;min-width:190px;opacity:1!important}
#ebenen button i{width:14px!important;height:14px!important;border-radius:4px!important}
#ebenen button::after{content:"";margin-left:auto;width:20px;height:20px;border-radius:6px;flex:none;
  border:2px solid #cdbf9f;background:#fff center/14px no-repeat}
#ebenen button[aria-pressed="true"]::after{border-color:#2f8a5f;background-color:#3aa56f;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='%23fff' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
#ebenen button[aria-pressed="false"]{color:var(--grau)!important}

/* Gleicher Abstand: Leiste 1 → Leiste 2 → Aufgabe (je 7px) */
#quest:not(.breit){top:calc(var(--hudh) - 1px)}

/* Aufgabe auch auf Markt, Team, Ziel und Wissen rechts – wie auf der Karte */
@media (max-width:819px){
  #quest.breit{left:auto;right:10px;width:min(68%,300px)}
}

/* 4. Aufgabenkasten kürzer */
#quest .phase-zeile{display:flex;align-items:center;gap:8px;margin:8px 0 0}
#quest .phase-zeile[hidden]{display:none}
#quest .phase-zeile .tutorial-phase-name{margin:0;text-align:left;white-space:nowrap;font-size:10.5px}
#quest .phase-zeile .tutorial-kette{flex:1;min-width:0;margin:0;gap:3px}
#quest .phase-zeile .tutorial-phase{height:7px;padding:0!important;border:0;border-radius:99px;box-shadow:none!important}
#quest .phase-zeile .tutorial-phase b,#quest .phase-zeile .tutorial-phase span{display:none}
#quest .phase-zeile .tutorial-phase.erledigt{background:var(--gruen)}
#quest .phase-zeile .tutorial-phase.aktiv{background:var(--gold)}
#quest .tutorial-zusammenhang{background:none;padding:0;margin-top:5px;border-radius:0}
#quest .objective-guide-action{margin-top:9px;padding-top:6px;padding-bottom:6px}
#quest:not(.kompakt):has(.objective-guide-action) .quest-map-cue{display:none}
#quest.map-link:not(.kompakt):has(.objective-guide-action){padding-right:12px!important}

/* ===== aus premium-spielgefuehl.js: Rohstoff-Pins, Münzen, Monatsbilanz, Lieferweg-Knopf ===== */
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

/* ===== aus belegschaft-regler.js: Belegschafts-Regler im Minen-Blatt ===== */
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
  background:linear-gradient(90deg,var(--c) 0 var(--p),#e3d7bf var(--p) var(--f),#f6dc94 var(--f) var(--g),transparent var(--g)),
    repeating-linear-gradient(135deg,#efe7d7 0 5px,#d9ccb2 5px 10px)}
.besetzung-regler::-webkit-slider-thumb{border-color:var(--c)}
.besetzung-regler::-moz-range-track{
  background:linear-gradient(90deg,#e3d7bf 0 var(--f),#f6dc94 var(--f) var(--g),transparent var(--g)),
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
#seite .monatskosten{margin-top:10px;text-align:left}
.besetzung-kosten{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.besetzung-kosten .kachel{border-radius:12px;padding:7px 10px;line-height:1.2;min-width:0}
.besetzung-kosten .kachel small{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;opacity:.75}
.besetzung-kosten .kachel b{display:block;font-family:"Baloo 2",sans-serif;font-size:var(--f2);font-variant-numeric:tabular-nums;white-space:nowrap}
.besetzung-kosten .kachel span{display:block;font-size:11px;font-weight:700;opacity:.8}
.besetzung-kosten .einmalig{background:#fff2c9;color:#6b4a0a}
.besetzung-kosten .einmalig.leer{background:#f4efe4;color:#7a6f5c}
.besetzung-kosten .monatlich{background:#e6f1f8;color:#1f4f6b}
.besetzung-anwenden{position:absolute;top:70px;left:50%;width:1px;height:1px;padding:0;border:0;opacity:0;pointer-events:none}

/* ===== aus einfuehrung.js: Einführung: Sperre, Hinweis und Bedarf im Blatt ===== */
#blattinhalt .einfuehrung-sperre{background:#fff4e0;border:1.5px solid #ecc06a;color:#6b4a0a}
#blattinhalt .einfuehrung-hin{display:flex;align-items:center;justify-content:center;width:100%;min-height:42px;margin-top:8px;
  border-radius:10px;border:1.5px solid #e5ba55;background:#fff7df;color:#704d0b;
  font-family:"Baloo 2",sans-serif;font-weight:800;font-size:var(--f1);box-shadow:0 2px 0 #d6a438;cursor:pointer}
.einfuehrung-bedarf{margin:14px 0 12px}
.einfuehrung-bedarf > b{display:block;font-family:"Baloo 2",sans-serif;font-size:var(--f3)}
.einfuehrung-bedarf .bedarf-liste{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:8px 0}
.einfuehrung-bedarf .bedarf-liste span{padding:3px 10px;border-radius:99px;background:#f3e8d2;font-size:var(--f0);font-weight:700}
.einfuehrung-bedarf small{display:block;color:var(--grau);font-size:var(--f0);font-weight:600;line-height:1.35}

/* ===== aus aufgabe-kompakt.js: kompakte Aufgabenkarte ===== */
@media (max-width:819px){
  #quest{padding:8px 11px 10px}
  #quest .kopf{white-space:nowrap;min-width:0;letter-spacing:.03em}
  #quest .kopf #q-art{overflow:hidden;text-overflow:ellipsis;min-width:0}
  #quest b#q-titel{margin:3px 0 1px}

  /* Tutorial auf der Karte */
  #quest:not(.breit) .tutorial-zusammenhang{display:none!important}
  #quest:not(.breit) .phase-zeile{margin-top:7px}
  #quest:not(.breit) .phase-zeile .tutorial-phase-name{display:none}
  #quest .objective-guide-action{min-height:36px;margin-top:8px;padding-top:4px;padding-bottom:4px;font-size:var(--f0)}

  /* Wissen freigeschaltet */
  #quest.wissen-quest #q-text{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  #quest .wissen-quest-action{min-height:36px;margin-top:7px;padding-top:5px;padding-bottom:5px}
  #quest .engpass-kasten{margin-top:7px;padding:6px 26px 6px 9px;position:relative}
  #quest .engpass-kasten b{font-size:var(--f0)!important;margin:0!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #quest .engpass-kasten span{display:none}
  #quest .engpass-kasten::after{content:"";position:absolute;right:11px;top:50%;width:7px;height:7px;
    border:solid currentColor;border-width:2px 2px 0 0;transform:translate(0,-50%) rotate(45deg)}

  /* Schmale Zeile auf anderen Reitern: «Ansehen» bleibt sichtbar */
  #quest.kompakt.wissen-bereit{padding-right:98px!important}
  #quest.kompakt.wissen-bereit > button.wissen-quest-action:not(#_){display:block!important;position:absolute;
    right:8px;top:50%;transform:translateY(-50%);width:auto;min-height:32px;margin:0;padding:3px 12px;font-size:var(--f0)}
  #quest.kompakt.wissen-bereit .quest-map-cue{display:none!important}

  /* Meldungen: nur die neueste */
  #toasts .toast:not(:last-child){display:none}
}

/* ===== aus ziel-positiv.js: Ziel-Seite mit Gewinn und Verlauf ===== */
.ziel-held{background:linear-gradient(160deg,#fffdf6,#eef7f1);border:2px solid #cfe6d8}
.ziel-held > small{display:block;font-size:var(--f0);font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--grau)}
.ziel-held-zahl{display:block;font-family:"Baloo 2",sans-serif;font-size:clamp(30px,9vw,40px);line-height:1.1;margin:2px 0 0;font-variant-numeric:tabular-nums}
.ziel-held-zahl.plus{color:#1f7a4f}
.ziel-held-zahl.minus{color:var(--alarm)}
.ziel-held-zahl.leer{color:var(--grau);font-size:var(--f4)}
.ziel-held-zahl .ziel-trend{font-style:normal;font-size:.55em;vertical-align:middle}
.ziel-held > span{display:block;color:var(--grau);font-size:var(--f0);font-weight:700}
.ziel-verlauf{display:flex;align-items:flex-end;gap:5px;height:42px;margin:10px 0 2px}
.ziel-verlauf span{flex:1;height:var(--h);border-radius:5px 5px 2px 2px;background:#9fd3b6}
.ziel-verlauf span.minus{background:#f0a9a4}
.ziel-verlauf span.jetzt.plus{background:#2fa36b}
.ziel-verlauf span.jetzt.minus{background:var(--alarm)}
.ziel-prognose{margin-top:10px;padding:8px 10px;border-radius:10px;background:#fff;color:var(--tinte,#2b2116);font-size:var(--f0);font-weight:600;line-height:1.35}
.ziel-prognose.gut{background:#e3f4ea;color:#1d5d40}
.ziel-prognose.warn{background:#fff1e0;color:#6b4206}
.ziel-klein{color:var(--grau);font-weight:700;font-size:11px}

/* ===== aus feinschliff.js: Kassen-Betrag, Rückmeldung, Produktname, fehlendes Material ===== */
/* 1. Betrag ersetzt das Wort «Kasse», solange er sichtbar ist */
.pille.kasse > div:has(.kasse-plus) > small{visibility:hidden}
.pille.kasse .kasse-plus{background:none!important;padding:0!important;top:1px!important}

/* 2. Rückmeldung auf der Karte unten; Meldungen treten solange zurück */
body:not(.fensterauf) #tutorial-lernfeedback{top:auto!important;bottom:calc(var(--dockh) + 12px)}
body:not(.fensterauf):has(#tutorial-lernfeedback) #toasts{opacity:0;transition:opacity .2s}

/* 3. Produktname nicht abschneiden */
.produktkarton{width:auto!important;min-width:48px;padding:3px 7px!important;font-size:9.5px!important;white-space:nowrap}
.prozess-meta-seite b{white-space:normal!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.2}

/* 4. Fehlendes Material deutlich, aber lesbar */
.stueck span.fehlt{opacity:1!important;text-decoration:none!important;background:#fae4e1!important;color:#9a342f!important;
  box-shadow:inset 0 0 0 1.5px #e39a93}
.stueck span.fehlt::after{content:" · fehlt";font-weight:700;font-size:.85em}

/* ===== aus stil.js: Knöpfe, Beschriftungen, Ikonen, «Al» ===== */
:root{--kante-gold:#c48d1c;--kante-papier:#ddd0b4}
/* Fremde Regeln wie «.stueck span» dürfen die Hülle nicht als Chip gestalten */
span.al-text.al-text,span.al-l.al-l,span.al-sr.al-sr{all:unset}
span.al-text.al-text{white-space:pre-wrap}
span.al-l.al-l{display:inline-block;position:relative}
span.al-l.al-l svg{display:inline-block;width:.34em;height:.72em;vertical-align:baseline;margin:0 .01em}
span.al-sr.al-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* Der Kern setzt svg auf display:block – Symbole im Text bleiben in der Zeile */
svg.stil-ikon{display:inline-block;width:1.1em;height:1.1em;vertical-align:-.18em;flex:none}
svg.stil-stufe{display:inline-block;width:28px;height:28px;flex:none}
#quest .engpass-kasten b svg.stil-ikon{margin-right:3px}
.zeile b svg.stil-stufe{width:24px;height:24px;vertical-align:-6px;margin-right:4px}
.wahl.schwierigkeit .schwierigkeitsicon svg.stil-stufe{width:38px;height:38px}
#lieferweg-knopf .lw-ikon{display:grid;place-items:center;font-size:20px}

/* Grosse Knöpfe: Gold = tun, Papier = zweitrangig */
.cta{border-radius:18px}
.cta.gruen:not(:disabled){background:var(--gold);color:#4a3000;box-shadow:0 4px 0 var(--kante-gold)}
.cta.gruen:not(:disabled):active{box-shadow:0 1px 0 var(--kante-gold)}
.cta.still:not(:disabled),.cta[data-tun="zumteam"]{background:#fff;color:var(--tinte);
  box-shadow:inset 0 0 0 2px var(--linie),0 4px 0 var(--kante-papier)}
.cta.still:not(:disabled):active,.cta[data-tun="zumteam"]:active{box-shadow:inset 0 0 0 2px var(--linie),0 1px 0 var(--kante-papier)}
.cta[data-tun="reset"]{color:var(--alarm)}
.cta:disabled{box-shadow:0 4px 0 #d6c9b0}
.cta.riesig{border-radius:18px;padding:17px;box-shadow:0 4px 0 var(--kante-gold)}
.cta.riesig:disabled{box-shadow:0 4px 0 #d6c9b0}

/* Kleine Knöpfe: gleiche Form, Papier für Zweitaktionen */
#quest .objective-guide-action,#blattinhalt .einfuehrung-hin,.besetzung-schritt{
  background:#fff;color:var(--tinte);border:0;border-radius:12px;
  box-shadow:inset 0 0 0 2px var(--linie),0 3px 0 var(--kante-papier)}
#quest .objective-guide-action:active,#blattinhalt .einfuehrung-hin:active,.besetzung-schritt:active{
  box-shadow:inset 0 0 0 2px var(--linie),0 1px 0 var(--kante-papier)}
.besetzung-schritt{border-radius:14px}
#quest .wissen-quest-action{border-radius:12px}
.xzu,.seitenknopf{border-width:2px}

/* Beschriftungen: normale Schreibweise statt gesperrter Grossbuchstaben */
.wert small,th,#quest .kopf,.besetzung-kosten .kachel small,.ziel-held > small,
#ebenen .filter-titel,.dialog .art,.perkkarte .marke,.wert small.einheit{
  text-transform:none!important;letter-spacing:normal!important}
.wert small,th,.besetzung-kosten .kachel small,.ziel-held > small{font-weight:700}
.besetzung-kosten .kachel small,.ziel-held > small{font-size:var(--f0)}
#quest .kopf{font-weight:800}

/* ===== aus einstieg.js: Startbild «Woher kommt dein Ladekabel?» ===== */
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
})();

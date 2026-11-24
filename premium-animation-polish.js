"use strict";
/* Final premium polish for recent process, sale and tutorial animations.
   Presentation only; no game-state or simulation changes. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-premium-animation-polish-style";
  style.textContent=`
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

    /* Tutorial feedback: one clean acknowledgement, not arcade confetti. */
    #tutorial-lernfeedback{
      box-shadow:inset 0 1px #ffffffc0,0 9px 24px #0003;
    }

    /* Quiet mode: retain hierarchy, remove secondary continuous polish. */
    body[data-anim="1"] .prozessszene.aktiv .prozess-meta-pfeil,
    body[data-anim="1"] .prozessszene.aktiv .prozess-status i,
    body[data-anim="1"] .prozess-materialliste span.fehlt{animation:none!important}

    @media(prefers-reduced-motion:reduce){
      .prozessszene,.prozessszene.aktiv .prozess-meta-pfeil,.prozessszene.aktiv .prozess-status i,
      .prozess-materialliste span.fehlt{
        animation:none!important;transition:none!important
      }
    }
  `;
  document.head.appendChild(style);

  window.__erzweltPremiumAnimationPolish={
    version:1,
    features:["process-staging","sale-feedback","tutorial-feedback","quiet-mode","reduced-motion"]
  };
})();

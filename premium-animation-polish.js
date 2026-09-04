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
  `;
  document.head.appendChild(style);

  window.__erzweltPremiumAnimationPolish={
    version:1,
    features:["process-staging","sale-feedback","tutorial-feedback","quiet-mode","reduced-motion"]
  };
})();

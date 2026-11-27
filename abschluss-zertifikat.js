"use strict";
/* Leistungsnachweis: gespeicherte Buchungen, PDF vollständig offline. */
(function(){
  const money = (n, signed=false) => (n < 0 ? "-" : signed && n > 0 ? "+" : "") +
    textVon("abschlusszerti.chf") + Math.abs(n).toLocaleString("de-CH", {maximumFractionDigits:0});
  const number = n => n.toLocaleString("de-CH", {maximumFractionDigits:0});
  const escape = text => String(text ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function report(){
    const daten = leistungsdatenSichern();
    const produkte = Object.entries(PRODUKT).map(([id,p]) => {
      const z = daten.produkte[id] || {hergestellt:0, verkauft:0, erloes:0};
      return {id, name:p.name, ...z, lager:S.ware[id] || 0};
    }).filter(p => p.hergestellt || p.verkauft || p.lager);
    const total = key => produkte.reduce((sum,p) => sum + p[key], 0);
    const minen = Object.values(S.minen);
    const profile = S.zertifikatProfil || {};
    return {
      name:String(profile.vorname ?? String(profile.name || "").trim().split(/\s+/)[0]).trim(),
      datum:new Date().toLocaleDateString("de-CH"), tag:S.tag, etappe:S.etappe || 1,
      abschluss:!!S.ende, status:S.ende ? (S.ende.grund === "insolvenz" ? textVon("abschlusszerti.insolvenz") :
        S.ende.geschafft ? textVon("slot.zielErreicht") : textVon("abschlusszerti.etappenziel-verfehlt")) : textVon("abschlusszerti.zwischenstand"),
      schwierigkeit:schwierigkeitInfo().name, bonus:S.verkaufsBonus || (S.hilfsBonus ? 50 : 0),
      abTag:daten.abTag, vollstaendig:daten.vollstaendig,
      produkte, hergestellt:total("hergestellt"), verkauft:total("verkauft"), erloes:total("erloes"), lager:total("lager"),
      startkapital:STARTKAPITAL, einnahmen:S.eingenommen, ausgaben:S.ausgegeben,
      bilanz:gesamtGewinn(), kasse:S.kasse, etappengewinn:etappenGewinn(),
      weitereKasse:S.kasse - (STARTKAPITAL + gesamtGewinn()),
      ruf:Math.round(S.ruf), minen:minen.length,
      rohstoffe:new Set(Object.keys(S.minen).map(id => MINEN.find(m => m.id === id)?.mat).filter(Boolean)).size,
      raffinerien:Object.keys(S.raff).length, fabriken:S.fabriken.filter(f => f.restbau === 0).length,
      imBau:S.fabriken.filter(f => f.restbau > 0).length,
      team:S.arbeiterGesamt, verkaufsteam:S.verkaeufer || 0,
      nachweise:nachweisStatus().text, sicher:minen.filter(m => m.sicherheit).length,
      wissen:WISSEN.filter(w => S.wissenGesehen?.[w.id] || S.wissenQuestFlow?.fields?.[w.id]).length,
      wissenTotal:WISSEN.length, verbesserungen:Object.values(S.perks).filter(Boolean).length
    };
  }

  function zeitraum(r){
    return r.vollstaendig ? textVon("abschlusszerti.produktzahlen-seit-spielstart") : textVon("abschlusszerti.produktzahlen-ab-tag-aelterer", {p1:(r.abTag)});
  }

  /* Snapshot hinein, PDF-Bytes heraus. Kein Nachladen von Schriften oder Bibliotheken. */
  async function pdf(r){
    const {PDFDocument, StandardFonts, rgb} = window.PDFLib;
    const doc = await PDFDocument.create();
    doc.setTitle(textVon("abschlusszerti.erzwelt-leistungsnachweis", {p1:(r.name)}));
    doc.setAuthor(textVon("abschlusszerti.erzwelt-informatische-bildung"));
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const ink=rgb(.08,.19,.23), muted=rgb(.36,.42,.44), blue=rgb(.04,.21,.28);
    const green=rgb(.10,.39,.28), red=rgb(.65,.17,.16), pale=rgb(.94,.96,.96), gold=rgb(.89,.67,.26);
    const margin=40, width=515, bottom=52;
    let page, y;
    const safe = value => Array.from(String(value ?? "").normalize("NFC")).map(c => {
      if (c === "\n") return c;
      try { regular.encodeText(c); return c; } catch { return "?"; }
    }).join("");
    function text(value,x,top,size=9,font=regular,color=ink){
      page.drawText(safe(value), {x,y:842-top-size,size,font,color});
    }
    function rect(x,top,w,h,color){page.drawRectangle({x,y:842-top-h,width:w,height:h,color});}
    function wrap(value,maxWidth,size=9,font=regular){
      const lines=[];
      for(const paragraph of safe(value).split("\n")){
        let line="";
        for(const word of paragraph.split(/\s+/)){
          const next=line?line+" "+word:word;
          if(font.widthOfTextAtSize(next,size)<=maxWidth){line=next;continue;}
          if(line){lines.push(line);line="";}
          for(const c of word){
            if(font.widthOfTextAtSize(line+c,size)>maxWidth&&line){lines.push(line);line="";}
            line+=c;
          }
        }
        lines.push(line);
      }
      return lines;
    }
    function newPage(){
      page=doc.addPage([595,842]); y=40;
      if(doc.getPageCount()>1){text(textVon("abschlusszerti.erzwelt-leistungsnachweis-fortsetzung"),margin,y,11,bold,blue);y+=30;}
    }
    function space(h){if(y+h>842-bottom)newPage();}
    function paragraph(value,size=9,color=muted){
      for(const line of wrap(value,width,size)){space(size+5);text(line,margin,y,size,regular,color);y+=size+5;}
    }
    function heading(value,reserve=45){space(reserve);y+=10;text(value,margin,y,11,bold,blue);y+=22;}
    function row(label,value,highlight=false){
      space(22);
      if(highlight)rect(margin,y-2,width,23,pale);
      text(label,margin+7,y+3,9,highlight?bold:regular);
      const v=safe(value), font=highlight?bold:regular;
      text(v,margin+width-7-font.widthOfTextAtSize(v,9),y+3,9,font,highlight?(r.bilanz<0?red:green):ink);
      y+=23;
    }
    newPage();
    rect(0,0,595,100,blue);rect(margin,27,34,3,gold);
    text(textVon("abschlusszerti.erzwelt"),margin,38,22,bold,rgb(1,1,1));
    text(r.abschluss?textVon("abschlusszerti.abschlusszertifikat"):textVon("abschlusszerti.leistungsnachweis-zwischenstand"),margin,69,11,regular,rgb(.85,.93,.95));
    y=117;
    const nameLines=wrap(r.name,width,17,bold);
    nameLines.forEach(line=>{space(22);text(line,margin,y,17,bold);y+=22;});
    paragraph(textVon("abschlusszerti.datum-spieltag", {p1:(r.datum), p2:(number(r.tag))}),9);
    paragraph(textVon("abschlusszerti.etappe", {p1:(r.schwierigkeit), p2:(r.bonus?` · Bonus Verkaufserlöse +${r.bonus} %`:""), p3:(r.etappe), p4:(r.status)}),9);
    y+=7;
    const metrics=[[textVon("abschlusszerti.hergestellt"),number(r.hergestellt)+textVon("abschlusszerti.stueck")],[textVon("abschlusszerti.verkauft"),number(r.verkauft)+textVon("abschlusszerti.stueck")],[textVon("abschlusszerti.verkaufserloes"),money(r.erloes)]];
    space(54);
    metrics.forEach(([label,value],i)=>{
      const x=margin+i*175;
      rect(x,y,165,47,pale);text(label,x+10,y+8,7,bold,muted);
      const size=Math.min(12,145/bold.widthOfTextAtSize(safe(value),1));
      text(value,x+10,y+23,size,bold,blue);
    });y+=54;
    heading(textVon("abschlusszerti.produktion-verkauf"),65);
    paragraph(zeitraum(r),8);
    if(!r.vollstaendig)paragraph(textVon("abschlusszerti.fruehere-mengen-und-produkterloese"),8);
    const columns=[margin+7,margin+188,margin+259,margin+323,margin+width-7];
    function tableHeader(){
      rect(margin,y,width,23,blue);
      [textVon("abschlusszerti.produkt"),textVon("abschlusszerti.hergestellt-2"),textVon("abschlusszerti.verkauft-2"),textVon("abschlusszerti.lager"),textVon("abschlusszerti.erloes-gesamt")].forEach((v,i)=>{
        const sz=8;const x=i===4?columns[i]-bold.widthOfTextAtSize(v,sz):columns[i];
        text(v,x,y+7,sz,bold,rgb(1,1,1));
      });y+=23;
    }
    space(47);tableHeader();
    if(!r.produkte.length){space(25);text("Noch keine Produkte hergestellt oder verkauft.",margin+7,y+7,9);y+=25;}
    r.produkte.forEach((p,i)=>{
      const lines=wrap(p.name,173,9), height=Math.max(25,lines.length*12+10);
      if(y+height>842-bottom){newPage();tableHeader();}
      if(i%2===0)rect(margin,y,width,height,pale);
      lines.forEach((line,j)=>text(line,columns[0],y+7+j*12,9));
      [p.hergestellt,p.verkauft,p.lager].forEach((v,j)=>text(number(v),columns[j+1],y+7,9));
      const amount=money(p.erloes);
      text(amount,columns[4]-regular.widthOfTextAtSize(safe(amount),8),y+7,8);
      y+=height;
    });
    heading(textVon("abschlusszerti.finanzbilanz-seit-spielstart"),180);
    row(textVon("abschlusszerti.startkapital"),money(r.startkapital));
    row(textVon("abschlusszerti.einnahmen-gesamt"),money(r.einnahmen));
    row(textVon("abschlusszerti.ausgaben-gesamt"),money(-r.ausgaben));
    row(textVon("abschlusszerti.gewinn-verlust-einnahmen-minus"),money(r.bilanz,true),true);
    if(Math.abs(r.weitereKasse)>.005)row(textVon("abschlusszerti.weitere-kassenbewegungen"),money(r.weitereKasse,true));
    row(textVon("abschlusszerti.schlusskasse-inklusive-startkapital"),money(r.kasse));
    if(r.etappe>1)row(textVon("abschlusszerti.gewinn-verlust-nur-etappe", {p1:(r.etappe)}),money(r.etappengewinn,true));
    paragraph(textVon("abschlusszerti.verkaufserloese-sind-einnahmen-vor"),8);
    heading(textVon("abschlusszerti.deine-lieferkette-entscheidungen"),100);
    paragraph(textVon("abschlusszerti.rohstoffquellen-rohstoffarten-raffinerien-fertige", {p1:(r.minen), p2:(r.rohstoffe), p3:(r.raffinerien), p4:(r.fabriken), p5:(r.imBau?` · ${r.imBau} im Bau`:"")}),9,ink);
    paragraph(textVon("abschlusszerti.team-personen-davon-im", {p1:(r.team), p2:(r.verkaufsteam), p3:(r.ruf)}),9,ink);
    paragraph(textVon("abschlusszerti.lieferkettennachweise-sicherheit-verbessert-quellen", {p1:(r.nachweise), p2:(r.sicher), p3:(r.minen)}),9,ink);
    paragraph(textVon("abschlusszerti.wissen-angesehen-bereiche-verbesserungen", {p1:(r.wissen), p2:(r.wissenTotal), p3:(r.verbesserungen)}),9,ink);
    if(r.produkte.length){
      const bestseller=[...r.produkte].sort((a,b)=>b.erloes-a.erloes)[0];
      if(bestseller.erloes>0)paragraph(textVon("abschlusszerti.hoechster-produkterloes-mit-verkauften", {p1:(bestseller.name), p2:(number(bestseller.verkauft)), p3:(money(bestseller.erloes))}),9,green);
    }
    const pages=doc.getPages();
    pages.forEach((p,i)=>{
      page=p;rect(margin,803,width,1,pale);
      text(textVon("abschlusszerti.erzwelt-rohstoffe-lieferketten-lernsimulation"),margin,813,8,regular,muted);
      text(`${i+1} / ${pages.length}`,520,813,8,regular,muted);
    });
    return doc.save();
  }

  function certificateCard(){
    const r=report();
    return textVon("abschlusszerti.produkte-verkaeufe-und-deine", {p1:(r.abschluss?"Dein PDF-Abschluss":"Dein Leistungsnachweis"), p2:(money(r.bilanz,true)), p3:(number(r.hergestellt)), p4:(number(r.verkauft)), p5:(number(r.lager)), p6:(escape(zeitraum(r))), p7:(r.vollstaendig?"":". Frühere Produktzahlen fehlen."), p8:(escape(r.name)), p9:(r.abschluss?"PDF-Abschluss herunterladen":"PDF-Zwischenstand herunterladen"), p10:(r.abschluss ? '<button type="button" class="cta still" data-tun="abschluss" aria-haspopup="dialog">Zurück zum Abschluss</button>' : "")});
  }
  /* Ziel-Reiter: Zertifikat-Karte vor «Neue Runde» (Reihenfolge: module/seiten.js) */
  const seitenTeile=(window.__erzweltSeitenTeile ||= {});
  seitenTeile.zielZertifikat=function(html){
    return html.replace('<button class="cta still" data-tun="reset">',certificateCard()+'<button class="cta still" data-tun="reset">');
  };
  // Ein laufender Spieltag darf das aktive Formular nicht ersetzen.
  seitenTeile.formularOffen=name=>!!(name==="ziel" && (exporting || document.activeElement?.closest("#erzwelt-zertifikat-form")));
  /* Nach dialogZeigen: PDF-Abschluss am Rundenende (module/meldungen.js) */
  (window.__erzweltMeldungenTeile ||= {}).dialogZertifikat=function(){
    if(!S.ende)return;
    const button=document.createElement("button");
    button.type="button";button.className="wahl";button.dataset.certificateOpen="1";
    button.innerHTML=textVon("abschlusszerti.pdf-abschluss-erstellen-produkte");
    document.getElementById("d-wahlen").prepend(button);
  };
  const style=document.createElement("style");
  style.textContent=`
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
  `;
  document.head.appendChild(style);
  document.addEventListener("click",e=>{
    if(!e.target.closest("[data-certificate-open]"))return;
    e.preventDefault();e.stopImmediatePropagation();
    modalOffen=false;document.getElementById("schleier").hidden=true;
    seiteWechseln("ziel");
    document.getElementById("zertifikat-name")?.focus();
  },true);
  document.addEventListener("input",e=>{
    if(!e.target.closest("#erzwelt-zertifikat-form"))return;
    S.zertifikatProfil={vorname:document.getElementById("zertifikat-name").value};
    speichern();
  });
  let exporting=false;
  document.addEventListener("submit",async e=>{
    if(e.target.id!=="erzwelt-zertifikat-form")return;
    e.preventDefault();
    if(exporting)return;
    const name=document.getElementById("zertifikat-name");
    if(!name.value.trim()){name.setCustomValidity("Bitte gib deinen Vornamen ein.");name.reportValidity();name.setCustomValidity("");return;}
    S.zertifikatProfil={vorname:name.value.trim()};speichern();
    const snapshot=report(); // Alle Werte vor dem ersten await festhalten.
    const status=document.getElementById("zertifikat-status");
    exporting=true;status.textContent=textVon("abschlusszerti.pdf-wird-erstellt");
    try{
      const bytes=await pdf(snapshot);
      const url=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
      const link=document.createElement("a");link.href=url;
      const filename=snapshot.name.replace(/[^\p{L}\p{N}_-]+/gu,"_");
      link.download=`Erzwelt_${snapshot.abschluss?"Abschluss":"Zwischenstand"}_${filename}_Tag${snapshot.tag}.pdf`;
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      status.textContent="";
    }catch(error){status.textContent="Das PDF konnte nicht erstellt werden. Bitte versuche es erneut.";console.error(textVon("abschlusszerti.erzwelt-pdf"),error);}
    finally{exporting=false;}
  });
  window.__erzweltCertificate={version:1,report,pdf};
})();

"use strict";
/* Leistungsnachweis: gespeicherte Buchungen, PDF vollständig offline. */
(function(){
  const money = (n, signed=false) => (n < 0 ? "-" : signed && n > 0 ? "+" : "") +
    "CHF " + Math.abs(n).toLocaleString("de-CH", {minimumFractionDigits:2, maximumFractionDigits:2});
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
      name:String(profile.name || "").trim(), klasse:String(profile.klasse || "").trim(),
      datum:new Date().toLocaleDateString("de-CH"), tag:S.tag, etappe:S.etappe || 1,
      abschluss:!!S.ende, status:S.ende ? (S.ende.grund === "insolvenz" ? "Insolvenz" :
        S.ende.geschafft ? "Etappenziel erreicht" : "Etappenziel verfehlt") : "Zwischenstand",
      schwierigkeit:schwierigkeitInfo().name, bonus:!!S.hilfsBonus,
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
    return r.vollstaendig ? "Produktzahlen seit Spielstart" : `Produktzahlen ab Tag ${r.abTag} (älterer Spielstand)`;
  }

  /* Snapshot hinein, PDF-Bytes heraus. Kein Nachladen von Schriften oder Bibliotheken. */
  async function pdf(r){
    const {PDFDocument, StandardFonts, rgb} = window.PDFLib;
    const doc = await PDFDocument.create();
    doc.setTitle(`Erzwelt - Leistungsnachweis - ${r.name}`);
    doc.setAuthor("Erzwelt · Informatische Bildung");
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
      if(doc.getPageCount()>1){text("ERZWELT · Leistungsnachweis · Fortsetzung",margin,y,11,bold,blue);y+=30;}
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
    text("ERZWELT",margin,38,22,bold,rgb(1,1,1));
    text(r.abschluss?"Abschlusszertifikat":"Leistungsnachweis · Zwischenstand",margin,69,11,regular,rgb(.85,.93,.95));
    y=117;
    const nameLines=wrap(r.name,width,17,bold);
    nameLines.forEach(line=>{space(22);text(line,margin,y,17,bold);y+=22;});
    paragraph(`Klasse: ${r.klasse || "keine Angabe"}   ·   Datum: ${r.datum}   ·   Spieltag ${number(r.tag)}`,9);
    paragraph(`${r.schwierigkeit}${r.bonus?" · Hilfsbonus +50 % aktiv":""}   ·   Etappe ${r.etappe}   ·   ${r.status}`,9);
    y+=7;
    const metrics=[["HERGESTELLT",number(r.hergestellt)+" Stück"],["VERKAUFT",number(r.verkauft)+" Stück"],["VERKAUFSERLÖS",money(r.erloes)]];
    space(54);
    metrics.forEach(([label,value],i)=>{
      const x=margin+i*175;
      rect(x,y,165,47,pale);text(label,x+10,y+8,7,bold,muted);
      const size=Math.min(12,145/bold.widthOfTextAtSize(safe(value),1));
      text(value,x+10,y+23,size,bold,blue);
    });y+=54;
    heading("Produktion & Verkauf",65);
    paragraph(zeitraum(r),8);
    if(!r.vollstaendig)paragraph("Frühere Mengen und Produkterlöse wurden nicht gespeichert. Lager und Finanzbilanz zeigen den gesamten aktuellen Spielstand.",8);
    const columns=[margin+7,margin+188,margin+259,margin+323,margin+width-7];
    function tableHeader(){
      rect(margin,y,width,23,blue);
      ["Produkt","Hergestellt","Verkauft","Lager","Erlös gesamt"].forEach((v,i)=>{
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
    heading("Finanzbilanz seit Spielstart",180);
    row("Startkapital",money(r.startkapital));
    row("Einnahmen gesamt",money(r.einnahmen));
    row("Ausgaben gesamt",money(-r.ausgaben));
    row("Gewinn / Verlust (Einnahmen minus Ausgaben)",money(r.bilanz,true),true);
    if(Math.abs(r.weitereKasse)>.005)row("Weitere Kassenbewegungen",money(r.weitereKasse,true));
    row("Schlusskasse (inklusive Startkapital)",money(r.kasse));
    if(r.etappe>1)row(`Gewinn / Verlust nur Etappe ${r.etappe}`,money(r.etappengewinn,true));
    paragraph("Verkaufserlöse sind Einnahmen vor Kosten. Unverkaufte Ware ist nicht als Einnahme verbucht.",8);
    heading("Deine Lieferkette & Entscheidungen",100);
    paragraph(`${r.minen} Rohstoffquellen · ${r.rohstoffe} Rohstoffarten · ${r.raffinerien} Raffinerien · ${r.fabriken} fertige Fabriken${r.imBau?` · ${r.imBau} im Bau`:""}`,9,ink);
    paragraph(`Team: ${r.team} Personen, davon ${r.verkaufsteam} im Verkauf · Ruf: ${r.ruf}/100`,9,ink);
    paragraph(`Lieferkettennachweise: ${r.nachweise} · Sicherheit verbessert: ${r.sicher}/${r.minen} Quellen`,9,ink);
    paragraph(`Wissen angesehen: ${r.wissen}/${r.wissenTotal} Bereiche · ${r.verbesserungen} Verbesserungen finanziert`,9,ink);
    if(r.produkte.length){
      const bestseller=[...r.produkte].sort((a,b)=>b.erloes-a.erloes)[0];
      if(bestseller.erloes>0)paragraph(`Höchster Produkterlös: ${bestseller.name} mit ${number(bestseller.verkauft)} verkauften Stück für insgesamt ${money(bestseller.erloes)}.`,9,green);
    }
    const pages=doc.getPages();
    pages.forEach((p,i)=>{
      page=p;rect(margin,803,width,1,pale);
      text("Erzwelt · Rohstoffe & Lieferketten · Lernsimulation",margin,813,8,regular,muted);
      text(`${i+1} / ${pages.length}`,520,813,8,regular,muted);
    });
    return doc.save();
  }

  function certificateCard(){
    const r=report();
    return `<section class="karte zertifikat-karte" aria-labelledby="zertifikat-titel">
      <h2 id="zertifikat-titel">${r.abschluss?"Dein PDF-Abschluss":"Dein Leistungsnachweis"}</h2>
      <p>Produkte, Verkäufe und deine Finanzbilanz als PDF für die Abgabe.</p>
      <div class="zertifikat-summe"><b>${money(r.bilanz,true)}</b><span>Gewinn / Verlust seit Spielstart</span></div>
      <p class="ort">${number(r.hergestellt)} hergestellt · ${number(r.verkauft)} verkauft · ${number(r.lager)} im Lager</p>
      <p class="ort">${escape(zeitraum(r))}${r.vollstaendig?"":". Frühere Produktzahlen fehlen."}</p>
      <form id="erzwelt-zertifikat-form">
        <label for="zertifikat-name">Vorname und Nachname</label>
        <input id="zertifikat-name" name="name" autocomplete="name" maxlength="120" required value="${escape(r.name)}" placeholder="Dein Name">
        <label for="zertifikat-klasse">Klasse (optional)</label>
        <input id="zertifikat-klasse" name="klasse" autocomplete="off" maxlength="60" value="${escape(r.klasse)}" placeholder="z. B. B24">
        <button type="submit" class="cta gruen">${r.abschluss?"PDF-Abschluss herunterladen":"PDF-Zwischenstand herunterladen"}</button>
        <p id="zertifikat-status" role="status" aria-live="polite"></p>
      </form>
    </section>`;
  }
  const originalZiel=seiteZiel;
  seiteZiel=function(){
    const html=originalZiel();
    return html.replace('<button class="cta still" data-tun="reset">',certificateCard()+'<button class="cta still" data-tun="reset">');
  };
  const originalSeiteFuellen=seiteFuellen;
  seiteFuellen=function(name){
    // Ein laufender Spieltag darf das aktive Formular nicht ersetzen.
    if(name==="ziel" && (exporting || document.activeElement?.closest("#erzwelt-zertifikat-form")))return;
    return originalSeiteFuellen(name);
  };
  const originalDialog=dialogZeigen;
  dialogZeigen=function(e){
    originalDialog(e);
    if(!S.ende)return;
    const button=document.createElement("button");
    button.type="button";button.className="wahl";button.dataset.certificateOpen="1";
    button.innerHTML="<b>PDF-Abschluss erstellen</b><small>Produkte, Verkäufe und Schlussbilanz für die Abgabe</small>";
    document.getElementById("d-wahlen").prepend(button);
  };
  const style=document.createElement("style");
  style.textContent=`
    body:has(#seite:not([hidden]) .zertifikat-karte) #quest{display:none!important}
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
    S.zertifikatProfil={name:document.getElementById("zertifikat-name").value,klasse:document.getElementById("zertifikat-klasse").value};
    speichern();
  });
  let exporting=false;
  document.addEventListener("submit",async e=>{
    if(e.target.id!=="erzwelt-zertifikat-form")return;
    e.preventDefault();
    if(exporting)return;
    const name=document.getElementById("zertifikat-name");
    if(!name.value.trim()){name.setCustomValidity("Bitte gib deinen Namen ein.");name.reportValidity();name.setCustomValidity("");return;}
    S.zertifikatProfil={name:name.value.trim(),klasse:document.getElementById("zertifikat-klasse").value.trim()};speichern();
    const snapshot=report(); // Alle Werte vor dem ersten await festhalten.
    const status=document.getElementById("zertifikat-status");
    exporting=true;status.textContent="PDF wird erstellt …";
    try{
      const bytes=await pdf(snapshot);
      const url=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
      const link=document.createElement("a");link.href=url;
      const filename=snapshot.name.replace(/[^\p{L}\p{N}_-]+/gu,"_");
      link.download=`Erzwelt_${snapshot.abschluss?"Abschluss":"Zwischenstand"}_${filename}_Tag${snapshot.tag}.pdf`;
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      status.textContent="PDF erstellt. Du findest es in deinen Downloads.";
    }catch(error){status.textContent="Das PDF konnte nicht erstellt werden. Bitte versuche es erneut.";console.error("Erzwelt PDF:",error);}
    finally{exporting=false;}
  });
  window.__erzweltCertificate={version:1,report,pdf};
})();

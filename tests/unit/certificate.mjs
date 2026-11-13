import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile, mkdir, writeFile} from 'node:fs/promises';

const core=await readFile('erzwelt-core.html','utf8');
const script=core.match(/<script>([\s\S]*?)<\/script>/)[1];
const model=script.slice(script.indexOf('const ZIEL_GEWINN'),script.indexOf('/* ============================================================\n   Ereignisse'));
const product=script.slice(script.indexOf('const PRODUKT ='),script.indexOf('const FAB_ORTE'));
const should=await readFile('didactic-should.js','utf8');
const effectiveDay=should.slice(should.indexOf('tagVor=function(){'),should.indexOf('function kmDistanz'));
const disk={};
const listeners={};
const elements={};
const document={
  head:{appendChild(){}}, body:{appendChild(){}}, activeElement:null,
  createElement:()=>({dataset:{},style:{},prepend(){},click(){},remove(){}}),
  addEventListener:(name,fn)=>{listeners[name]=fn;},
  getElementById:id=>(elements[id]??={prepend(){},hidden:true}),
};
const context=vm.createContext({console,setTimeout,clearTimeout,Uint8Array,ArrayBuffer,Date,Blob,URL,document,
  localStorage:{setItem:(k,v)=>disk[k]=v,getItem:k=>disk[k]??null,removeItem:k=>{delete disk[k];}},
  window:{},
});
const run=source=>vm.runInContext(source,context);
run(`
const MATERIAL={kupfer:{preis:1,ausbeute:1},alu:{preis:1,ausbeute:1},zinn:{preis:1,ausbeute:1}};
const MINEN=[],RAFF_ORTE=[],PERK_INDEX={},WISSEN=[{id:'kette'}];
const LOHNSTUFE=[{ziel:50,faktor:1}],LAND={china:{lohn:0,risiko:1}};
let anstellMenge=1,seitenStand='';
const ausbauFaktor=()=>1;
function tutorialLaeuft(){return false;}
function ereignisPruefen(){}
function nachweisStatus(){return {text:'fehlen'};}
function seiteZiel(){return '<button class="cta still" data-tun="reset">Neu</button>';}
function seiteFuellen(){return 'redrawn';}
function speichern(){SPEICHER.schreib(SCHLUESSEL,JSON.stringify(S));}
function seiteWechseln(){}
function dialogZeigen(){}
`);
run(product+script.slice(script.indexOf('const VERKAUF_LOHN'),script.indexOf('/* Lohnstufen'))+model);
// Test the real load/migration code, not a reimplementation.
run(script.slice(script.indexOf('function laden(){'),script.indexOf('window.addEventListener("pagehide"')));
run('S=neuerZustand();S.schwierigkeit="mittel";');
run(effectiveDay);
run(await readFile('vendor/pdf-lib-1.17.1.min.js','utf8'));
run('window.PDFLib=PDFLib;');
run(await readFile('abschluss-zertifikat.js','utf8'));
const get=()=>JSON.parse(run('JSON.stringify(window.__erzweltCertificate.report())'));

// Real daily production, two factories of one product, limited materials.
run(`S.mat={kupfer:200,alu:100,zinn:100};S.fabriken=[
 {produkt:'kabel',land:'china',arbeiter:3,restbau:0},
 {produkt:'kabel',land:'china',arbeiter:2,restbau:0}];tagVor();`);
assert.equal(get().hergestellt,15);
assert.equal(get().lager,15);
assert.equal(get().verkauft,0);

// Hand sale with changing real price, then automatic sale in the daily step.
run('wareVerkaufen(4);');
const first=get();
assert.equal(first.verkauft,4);
assert.ok(first.erloes>0);
run('S.verkaeufer=1;tagVor();');
const second=get();
assert.equal(second.hergestellt,30);
assert.equal(second.verkauft,9);
assert.equal(second.lager,21);
assert.equal(second.erloes,second.einnahmen);
assert.ok(second.erloes>first.erloes);
assert.equal(second.bilanz,second.einnahmen-second.ausgaben);
assert.ok(Math.abs(second.kasse-second.startkapital-second.bilanz)<1e-7);

// Saved totals survive load and stage continuation; new game resets them.
run('speichern(); S=null; laden();');
assert.equal(get().verkauft,9);
run('tempoSetzen=()=>{};etappeWeiter(1);');
assert.equal(get().verkauft,9);
assert.equal(get().etappe,2);
run('S=neuerZustand();S.schwierigkeit="mittel";');
assert.equal(get().hergestellt,0);

// Old save: never invent historical output from inventory or total income.
run('const old=neuerZustand();delete old.leistungsdaten;old.tag=200;old.eingenommen=9000;old.ware={kabel:50};SPEICHER.schreib(SCHLUESSEL,JSON.stringify(old));laden();');
assert.equal(get().vollstaendig,false);
assert.equal(get().abTag,200);
assert.equal(get().hergestellt,0);
assert.equal(get().verkauft,0);
assert.equal(get().lager,50);
run('wareVerkaufen(2);speichern();laden();');
assert.equal(get().verkauft,2);
assert.equal(get().abTag,200);

// Both engines contain exactly one booking at the real production point.
assert.equal((effectiveDay.match(/produktBuchen\(f.produkt,stueck\)/g)||[]).length,1);
assert.equal((model.match(/produktBuchen\(f.produkt, stueck\)/g)||[]).length,1);

// Guard against UI rerender destroying the input cursor or export.
document.activeElement={closest:()=>true};
assert.equal(run('seiteFuellen("ziel")'),undefined);
document.activeElement=null;
assert.equal(run('seiteFuellen("ziel")'),'redrawn');

// Generate actual PDFs with the same offline library used in the standalone.
await mkdir('artifacts/certificate',{recursive:true});
run(`S=neuerZustand();S.schwierigkeit='mittel';S.tag=721;
 S.ende={grund:'etappe',geschafft:false};S.zertifikatProfil={vorname:'Zoë'};
 S.leistungsdaten.produkte={kabel:{hergestellt:50,verkauft:33,erloes:9000},phone:{hergestellt:24,verkauft:20,erloes:2000}};
 S.ware={kabel:17,phone:4};S.eingenommen=11000;S.ausgegeben=10099.50;S.kasse=STARTKAPITAL+900.50;`);
const sample=get();
await writeFile('artifacts/certificate/sample-state.json',run('JSON.stringify(S)'));
assert.equal(sample.bilanz,900.5);
assert.equal(sample.hergestellt,74);
assert.equal(sample.verkauft,53);
assert.equal(sample.erloes,11000);
assert.equal(sample.lager,21);
const api=context.window.__erzweltCertificate;
for(const [name,r] of [
  ['standard',sample],
  ['loss-legacy',{...sample,bilanz:-987654.32,kasse:262345.68,ausgaben:998654.32,vollstaendig:false,abTag:550,status:'Insolvenz'}],
  ['long-full',{...sample,name:'Änne-Luise '.repeat(12),
    produkte:run('Object.entries(PRODUKT).map(([id,p])=>({id,name:p.name,hergestellt:123456,verkauft:100000,lager:23456,erloes:123456789.12}))'),
    bilanz:987654321.12,kasse:988904321.12,etappe:20,weitereKasse:10000}],
  ['empty',{...sample,abschluss:false,status:'Zwischenstand',produkte:[],hergestellt:0,verkauft:0,erloes:0,lager:0}]
]){
  const bytes=await api.pdf(r);
  assert.ok(bytes.length>1000);
  const parsed=await context.PDFLib.PDFDocument.load(bytes);
  assert.ok(parsed.getPageCount()>=1);
  await writeFile(`artifacts/certificate/${name}.pdf`,bytes);
  console.log(`PASS PDF ${name}: ${parsed.getPageCount()} page(s), ${bytes.length} bytes`);
}
console.log('PASS production, manual/automatic sales, real revenues, save/reload, stages, reset, legacy migration, input focus, PDF generation');

from playwright.sync_api import sync_playwright
import json, math

errors=[]
progress=[]

def dump(label,v): print(label,json.dumps(v,ensure_ascii=False,indent=2))

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":360,"height":800})
    page.on('pageerror',lambda e:errors.append('page:'+str(e)))
    page.on('console',lambda m:errors.append('console:'+m.type+':'+m.text) if m.type=='error' else None)
    page.goto('http://127.0.0.1:8000/index.html',wait_until='networkidle',timeout=30000)
    page.wait_for_timeout(120)
    page.evaluate("""()=>{let seed=0xE4512026;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}""")

    cfg=page.evaluate("""()=>({
      mines:MINEN.map(m=>({id:m.id,mat:m.mat,cost:m.erschliessung,land:m.land})),
      raffs:RAFF_ORTE.map(r=>({id:r.id,cost:r.bau,land:r.land})),
      products:Object.entries(PRODUKT).map(([id,p])=>({id,cost:p.kosten,rezept:Object.keys(p.rezept)})),
      lands:[...FAB_ORTE],starter:[...START_MATERIALIEN],patches:document.querySelectorAll('script[data-erzwelt-patch]').length
    })""")
    assert cfg['patches']==22
    dump('TARGETS',{'mines':len(cfg['mines']),'raff':len(cfg['raffs']),'factoryCountries':len(cfg['lands']),'products':len(cfg['products'])})

    # Choose Easy via the real chooser and enter post-tutorial game state.
    page.locator('#d-wahlen .wahl').nth(0).click();page.wait_for_timeout(50)
    assert page.evaluate('S.schwierigkeit')=='einfach'
    page.evaluate("()=>{S.tutorial=TUTORIAL.length;if(typeof tutorialErneuern==='function')tutorialErneuern();seiteWechseln('karte');zeichnen();}")

    def q(js): return page.evaluate(js)
    def click(sel): return page.evaluate("sel=>{const e=document.querySelector(sel);if(!e||e.disabled)return false;e.click();return true;}",sel)
    def sheet(kind,id): page.evaluate("x=>blattFuellen(x.k,x.id)",{'k':kind,'id':id})
    def map_page(): page.evaluate("()=>{seiteWechseln('karte');zeichnen();}")

    def state():
        return q("""()=>({tag:S.tag,etappe:S.etappe,kasse:Math.round(S.kasse),ein:Math.round(S.eingenommen),aus:Math.round(S.ausgegeben),gewinn:Math.round(S.eingenommen-S.ausgegeben),ruf:Math.round(S.ruf),
          mines:Object.keys(S.minen).length,raff:Object.keys(S.raff).length,fabs:S.fabriken.length,lands:[...new Set(S.fabriken.map(f=>f.land))],products:[...new Set(S.fabriken.map(f=>f.produkt))],
          staffedM:Object.values(S.minen).filter(m=>m.arbeiter>0).length,staffedR:Object.values(S.raff).filter(r=>r.arbeiter>0).length,staffedF:S.fabriken.filter(f=>f.restbau===0&&f.arbeiter>0).length,
          workers:S.arbeiterGesamt,free:freieArbeiter(),sellers:S.verkaeufer,bonus:!!S.hilfsBonus,ende:S.ende&&S.ende.grund})""")

    def resolve_modal():
        for _ in range(12):
            info=q("()=>({open:!!modalOffen,grund:S.ende&&S.ende.grund,buttons:[...document.querySelectorAll('#d-wahlen .wahl')].map(b=>b.innerText)})")
            if not info['open']: return True
            if info['grund']=='insolvenz':
                dump('INSOLVENCY',state()); return False
            if info['grund']=='etappe':
                # Never take assistance bonus. Continue normal Easy.
                ok=q("()=>{const b=[...document.querySelectorAll('#d-wahlen .wahl')].find(x=>x.innerText.includes('Weiter · Etappe'));if(!b)return false;b.click();return true;}")
                if not ok: raise AssertionError('no normal stage Continue')
                page.wait_for_timeout(2); continue
            # Deterministic event policy: first enabled option.
            ok=q("()=>{const b=[...document.querySelectorAll('#d-wahlen .wahl')].find(x=>!x.disabled);if(!b)return false;b.click();return true;}")
            if not ok: raise AssertionError('event had no enabled choice')
            page.wait_for_timeout(2)
        raise AssertionError('modal loop')

    last_log=0
    def advance(days):
        nonlocal_last=[0]
        left=days
        while left>0:
            if not resolve_modal(): return False
            n=min(30,left)
            moved=q(f"()=>{{const a=S.tag;for(let i=0;i<{n};i++){{if(modalOffen||S.ende)break;tagVor();}}return S.tag-a;}}")
            if moved==0:
                if not resolve_modal(): return False
            else: left-=moved
        return True

    def log_if(label='PROGRESS'):
        s=state();progress.append(s);dump(label,s);return s

    def hire_needed(n,reserve=150000):
        if n<=0:return True
        # Hire in batches, actual Team CTA. Hiring is cheap; keep a modest cash reserve.
        while q('freieArbeiter()')<n:
            missing=n-q('freieArbeiter()')
            batch=max(5,min(50,int(math.ceil(missing/5))*5))
            if q('S.kasse') < batch*q('LOHN_PRO_KOPF')+reserve:return False
            page.evaluate("n=>{anstellMenge=n;seiteWechseln('team');}",batch)
            if not click('[data-tun="anstellen"]'):return False
        return True

    def set_mine(id,target):
        cur=q(f"S.minen[{json.dumps(id)}]?.arbeiter||0")
        if cur>=target:return True
        if not hire_needed(target-cur):return False
        sheet('mine',id)
        while q(f"S.minen[{json.dumps(id)}].arbeiter")<target:
            left=target-q(f"S.minen[{json.dumps(id)}].arbeiter")
            n=5 if left>=5 else 1
            if not click(f'[data-tun="crew"][data-id="{id}"][data-n="{n}"]'):return False
        return True

    def set_raff(id,target):
        cur=q(f"S.raff[{json.dumps(id)}]?.arbeiter||0")
        if cur>=target:return True
        if not hire_needed(target-cur):return False
        sheet('raff',id)
        while q(f"S.raff[{json.dumps(id)}].arbeiter")<target:
            left=target-q(f"S.raff[{json.dumps(id)}].arbeiter")
            n=5 if left>=5 else 1
            if not click(f'[data-tun="rcrew"][data-id="{id}"][data-n="{n}"]'):return False
        return True

    def set_fab(index,target):
        f=q(f"S.fabriken[{index}]&&{{land:S.fabriken[{index}].land,rest:S.fabriken[{index}].restbau,crew:S.fabriken[{index}].arbeiter}}")
        if not f or f['rest']>0:return False
        if f['crew']>=target:return True
        if not hire_needed(target-f['crew']):return False
        sheet('fab',f['land'])
        while q(f"S.fabriken[{index}].arbeiter")<target:
            left=target-q(f"S.fabriken[{index}].arbeiter")
            n=5 if left>=5 else 1
            if not click(f'[data-tun="fcrew"][data-i="{index}"][data-n="{n}"]'):return False
        return True

    def set_sellers(target):
        cur=q('S.verkaeufer||0')
        if cur>=target:return True
        if not hire_needed(target-cur):return False
        page.evaluate("()=>seiteWechseln('markt')")
        while q('S.verkaeufer')<target:
            left=target-q('S.verkaeufer');n=5 if left>=5 else 1
            if not click(f'[data-tun="vcrew"][data-n="{n}"]'):return False
        map_page();return True

    def buy_mine(id):
        if q(f"!!S.minen[{json.dumps(id)}]"):return True
        map_page()
        if not click(f'[data-pin="mine"][data-id="{id}"]'):return False
        if not click(f'[data-tun="mine-auf"][data-id="{id}"]'):return False
        return q(f"!!S.minen[{json.dumps(id)}]")

    def buy_raff(id):
        if q(f"!!S.raff[{json.dumps(id)}]"):return True
        map_page()
        if not click(f'[data-pin="raff"][data-id="{id}"]'):return False
        if not click(f'[data-tun="raff-bau"][data-id="{id}"]'):return False
        return q(f"!!S.raff[{json.dumps(id)}]")

    def build_product(land,prod):
        exists=q(f"()=>S.fabriken.some(f=>f.land==={json.dumps(land)}&&f.produkt==={json.dumps(prod)})")
        if exists:return True
        map_page()
        if not click(f'[data-pin="fab"][data-id="{land}"]'):return False
        before=q('S.fabriken.length')
        if not click(f'[data-tun="fab-bau"][data-p="{prod}"][data-l="{land}"]'):return False
        return q('S.fabriken.length')==before+1

    def wait_cash(amount,maxdays=1800,label='WAIT'):
        waited=0
        while q('S.kasse')<amount and waited<maxdays:
            if not advance(60):raise AssertionError('insolvent while waiting for cash')
            waited+=60
            if waited%180==0:log_if(label)
        if q('S.kasse')<amount:
            raise AssertionError(f'cash stalled below {amount}: {state()}')

    # Cheapest mine for a material.
    def cheapest(mat): return min([m for m in cfg['mines'] if m['mat']==mat],key=lambda x:x['cost'])

    # ---------- PHASE 1: robust cable cash engine ----------
    for mat in cfg['starter']:
        m=cheapest(mat)
        assert buy_mine(m['id']);assert set_mine(m['id'],10)
    r0=min(cfg['raffs'],key=lambda r:r['cost'])
    assert buy_raff(r0['id']);assert set_raff(r0['id'],5)
    assert build_product('china','kabel')
    assert advance(10);assert set_fab(0,8);assert set_sellers(8)
    assert advance(240)
    s=log_if('CABLE_ENGINE_DAY_251')
    assert s['ein']>0 and not s['bonus']

    # ---------- PHASE 2: unlock product families in economical bundles ----------
    plans=[
      ('vietnam','board',['silizium','gold','tantal','silber']),
      ('mexiko','konsole',['seltene']),
      ('deutschland','tv',['indium']),
      ('usa','akku',['lithium','kobalt','nickel']),
      ('china','phone',[]),
    ]
    owned_materials=set(cfg['starter'])
    for land,prod,newmats in plans:
        # Capital required for missing mines + factory + 250k safety cushion.
        missing=[m for m in newmats if m not in owned_materials]
        mine_defs=[cheapest(m) for m in missing]
        pdef=next(x for x in cfg['products'] if x['id']==prod)
        need=sum(m['cost'] for m in mine_defs)+pdef['cost']+300000
        wait_cash(need,label=f'WAIT_{prod.upper()}')
        for m in mine_defs:
            assert buy_mine(m['id']);assert set_mine(m['id'],5);owned_materials.add(m['mat'])
        assert build_product(land,prod)
        idx=q('S.fabriken.length-1')
        # Let construction finish, then staff the new line.
        builddays=next(x for x in cfg['products'] if x['id']==prod)
        assert advance(35)
        assert set_fab(idx,5)
        set_sellers(min(30,8+q('S.fabriken.length')*3))
        assert advance(150)
        log_if('AFTER_'+prod.upper())

    # All six catalogue products must now exist.
    products=set(q("()=>S.fabriken.map(f=>f.produkt)"))
    assert products=={x['id'] for x in cfg['products']},products

    # ---------- PHASE 3: buy every remaining mine ----------
    for m in sorted(cfg['mines'],key=lambda x:x['cost']):
        if q(f"!!S.minen[{json.dumps(m['id'])}]"):continue
        wait_cash(m['cost']+300000,label='WAIT_ALL_MINES')
        assert buy_mine(m['id']);assert set_mine(m['id'],1)
        assert advance(30)
    log_if('ALL_MINES_BOUGHT')

    # ---------- PHASE 4: buy every refinery ----------
    for r in sorted(cfg['raffs'],key=lambda x:x['cost']):
        if q(f"!!S.raff[{json.dumps(r['id'])}]"):continue
        wait_cash(r['cost']+300000,label='WAIT_ALL_RAFF')
        assert buy_raff(r['id']);assert set_raff(r['id'],1)
        assert advance(30)
    log_if('ALL_RAFF_BOUGHT')

    # Ensure every factory country is represented (plans already should do this) and every finished factory staffed.
    assert advance(60)
    facts=q("()=>S.fabriken.map((f,i)=>({i,rest:f.restbau}))")
    for f in facts:
        if f['rest']==0:set_fab(f['i'],max(1,q(f'S.fabriken[{f["i"]}].arbeiter')))
    final=log_if('FINAL_FULL_EASY')

    assert final['mines']==len(cfg['mines']),final
    assert final['raff']==len(cfg['raffs']),final
    assert set(final['lands'])==set(cfg['lands']),(final,cfg['lands'])
    assert set(final['products'])=={x['id'] for x in cfg['products']},final
    assert final['staffedM']==len(cfg['mines'])
    assert final['staffedR']==len(cfg['raffs'])
    assert final['staffedF']>=len(cfg['products'])
    assert final['ende'] is None and final['bonus'] is False
    assert final['ein']>0

    # Full-company save/reload.
    before=q("()=>({tag:S.tag,etappe:S.etappe,mines:Object.keys(S.minen).length,raff:Object.keys(S.raff).length,fabs:S.fabriken.length,products:[...new Set(S.fabriken.map(f=>f.produkt))].sort(),difficulty:S.schwierigkeit,bonus:S.hilfsBonus})")
    page.evaluate('speichern()');page.reload(wait_until='networkidle');page.wait_for_timeout(150)
    after=q("()=>({tag:S.tag,etappe:S.etappe,mines:Object.keys(S.minen).length,raff:Object.keys(S.raff).length,fabs:S.fabriken.length,products:[...new Set(S.fabriken.map(f=>f.produkt))].sort(),difficulty:S.schwierigkeit,bonus:S.hilfsBonus})")
    dump('RELOAD',{'before':before,'after':after});assert before==after
    assert q('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=0
    assert not errors,errors
    browser.close()

print('STRATEGIC FULL EASY PLAYTHROUGH PASS')

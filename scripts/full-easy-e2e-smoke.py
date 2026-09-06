from playwright.sync_api import sync_playwright
import json, math

errors=[]
timeline=[]

def dump(label, value):
    print(label, json.dumps(value, ensure_ascii=False, indent=2))

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":360,"height":800})
    page.on("pageerror", lambda e: errors.append("page:"+str(e)))
    page.on("console", lambda m: errors.append("console:"+m.type+":"+m.text) if m.type=="error" else None)
    page.goto("http://127.0.0.1:8000/index.html", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(150)

    # Repeatable market/event path.
    page.evaluate("""()=>{let seed=0x5EED1234;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}""")

    config=page.evaluate("""()=>({
      start:STARTKAPITAL,
      mines:MINEN.map(m=>({id:m.id,mat:m.mat,cost:m.erschliessung,places:m.plaetze})),
      raffs:RAFF_ORTE.map(r=>({id:r.id,cost:r.bau,places:r.plaetze})),
      products:Object.entries(PRODUKT).map(([id,p])=>({id,cost:p.kosten,build:p.bauzeit,places:p.plaetze,rezept:Object.keys(p.rezept)})),
      fabPlaces:[...FAB_ORTE], starter:[...START_MATERIALIEN],
      patches:document.querySelectorAll('script[data-erzwelt-patch]').length,
      startCapital:STARTKAPITAL, hireCost:LOHN_PRO_KOPF
    })""")
    dump("CONFIG",config)
    assert config['patches']==22

    # Fresh Easy run through the real chooser.
    assert page.locator('#d-wahlen .wahl').count()==3
    page.locator('#d-wahlen .wahl').nth(0).click()
    page.wait_for_timeout(80)
    assert page.evaluate('S.schwierigkeit')=='einfach'

    # Tutorial 1-11 already has its own complete browser gate. Start this infrastructure
    # run immediately after it so no tutorial lock hides world assets.
    page.evaluate("""()=>{S.tutorial=TUTORIAL.length;if(typeof tutorialErneuern==='function')tutorialErneuern();seiteWechseln('karte');zeichnen();}""")

    def q(expr):
        return page.evaluate(expr)

    def click(sel):
        return page.evaluate("""sel=>{const e=document.querySelector(sel);if(!e||e.disabled)return false;e.click();return true;}""",sel)

    def close_to_map():
        page.evaluate("()=>{seiteWechseln('karte');zeichnen();}")

    def handle_modal():
        for _ in range(10):
            info=q("()=>({open:!!modalOffen,ende:S.ende&&S.ende.grund,buttons:[...document.querySelectorAll('#d-wahlen .wahl')].map(b=>b.innerText)})")
            if not info['open']:
                return True
            if info['ende']=='insolvenz':
                dump('INSOLVENCY',q("()=>({tag:S.tag,kasse:Math.round(S.kasse),ein:Math.round(S.eingenommen),aus:Math.round(S.ausgegeben),ruf:Math.round(S.ruf)})"))
                return False
            if info['ende']=='etappe':
                # Stay on normal Easy. Never take the assistance bonus in this smoke.
                ok=page.evaluate("""()=>{const b=[...document.querySelectorAll('#d-wahlen .wahl')].find(x=>x.innerText.includes('Weiter · Etappe'));if(!b)return false;b.click();return true;}""")
                if not ok: raise AssertionError('stage result missing normal Continue')
                page.wait_for_timeout(5)
                continue
            ok=page.evaluate("""()=>{const b=[...document.querySelectorAll('#d-wahlen .wahl')].find(x=>!x.disabled);if(!b)return false;b.click();return true;}""")
            if not ok: raise AssertionError('event modal without usable choice')
            page.wait_for_timeout(5)
        raise AssertionError('modal did not settle')

    def hire_to_free(target, reserve=300000):
        for _ in range(20):
            free=q('freieArbeiter()')
            if free>=target: return True
            cash=q('S.kasse')
            need=max(5,min(50,int(math.ceil((target-free)/5))*5))
            max_afford=max(0,int((cash-reserve)//q('LOHN_PRO_KOPF')))
            need=min(need,(max_afford//5)*5)
            if need<5: return False
            # Setting the slider model then opening Team is equivalent to moving the UI slider;
            # the actual hire still happens through the real CTA click.
            page.evaluate("n=>{anstellMenge=n;seiteWechseln('team');}",need)
            if not click('[data-tun="anstellen"]'): return False
            page.wait_for_timeout(3)
        return q('freieArbeiter()')>=target

    def ensure_sellers(target=5):
        if q('S.verkaeufer||0')>=target:return
        if not hire_to_free(target-q('S.verkaeufer||0'),350000):return
        page.evaluate("()=>seiteWechseln('markt')")
        for _ in range(20):
            if q('S.verkaeufer||0')>=target:break
            if not click('[data-tun="vcrew"][data-n="1"]'):break
        close_to_map()

    def open_pin(kind,id):
        close_to_map()
        sel=f'[data-pin="{kind}"][data-id="{id}"]'
        return click(sel)

    def assign_mine(id,target=3):
        if q(f"S.minen[{json.dumps(id)}]?.arbeiter||0")>=target:return True
        if not hire_to_free(target,300000):return False
        if not open_pin('mine',id):return False
        for _ in range(target+2):
            if q(f"S.minen[{json.dumps(id)}]?.arbeiter||0")>=target:return True
            if not click(f'[data-tun="crew"][data-id="{id}"][data-n="1"]'):break
        return q(f"S.minen[{json.dumps(id)}]?.arbeiter||0")>=target

    def assign_raff(id,target=3):
        if q(f"S.raff[{json.dumps(id)}]?.arbeiter||0")>=target:return True
        if not hire_to_free(target,300000):return False
        if not open_pin('raff',id):return False
        for _ in range(target+2):
            if q(f"S.raff[{json.dumps(id)}]?.arbeiter||0")>=target:return True
            if not click(f'[data-tun="rcrew"][data-id="{id}"][data-n="1"]'):break
        return q(f"S.raff[{json.dumps(id)}]?.arbeiter||0")>=target

    def assign_finished_factories(target=3):
        facts=q("()=>S.fabriken.map((f,i)=>({i,land:f.land,rest:f.restbau,crew:f.arbeiter,product:f.produkt}))")
        for f in facts:
            if f['rest']>0 or f['crew']>=target:continue
            if not hire_to_free(target,300000):return
            if not open_pin('fab',f['land']):continue
            for _ in range(target+2):
                if q(f"S.fabriken[{f['i']}]?.arbeiter||0")>=target:break
                if not click(f'[data-tun="fcrew"][data-i="{f["i"]}"][data-n="1"]'):break

    starter=[]
    for mat in config['starter']:
        opts=[m for m in config['mines'] if m['mat']==mat]
        if opts:starter.append(min(opts,key=lambda x:x['cost']))
    rest_mines=sorted([m for m in config['mines'] if m['id'] not in {x['id'] for x in starter}],key=lambda x:x['cost'])
    mine_order=starter+rest_mines
    raff_order=sorted(config['raffs'],key=lambda x:x['cost'])
    product_order=sorted(config['products'],key=lambda x:x['cost'])

    def buy_mine(m,reserve):
        if q(f"!!S.minen[{json.dumps(m['id'])}]"):return False
        if q('S.kasse')<m['cost']+reserve:return False
        if not open_pin('mine',m['id']):return False
        if not click(f'[data-tun="mine-auf"][data-id="{m["id"]}"]'):return False
        page.wait_for_timeout(2)
        assign_mine(m['id'])
        return True

    def buy_raff(r,reserve):
        if q(f"!!S.raff[{json.dumps(r['id'])}]"):return False
        if q('S.kasse')<r['cost']+reserve:return False
        if not open_pin('raff',r['id']):return False
        if not click(f'[data-tun="raff-bau"][data-id="{r["id"]}"]'):return False
        page.wait_for_timeout(2)
        assign_raff(r['id'])
        return True

    def build_factory(land,product,reserve):
        cost=next(x['cost'] for x in config['products'] if x['id']==product)
        if q('S.kasse')<cost+reserve:return False
        if not open_pin('fab',land):return False
        before=q('S.fabriken.length')
        if not click(f'[data-tun="fab-bau"][data-p="{product}"][data-l="{land}"]'):return False
        page.wait_for_timeout(2)
        return q('S.fabriken.length')==before+1

    def advance(days):
        left=days
        while left>0:
            if not handle_modal():return False
            step=min(30,left)
            got=q(f"()=>{{const start=S.tag;for(let i=0;i<{step};i++){{if(modalOffen||S.ende)break;tagVor();}}return S.tag-start;}}")
            if got==0:
                if not handle_modal():return False
            else:left-=got
        return True

    def state():
        return q("""()=>({tag:S.tag,kasse:Math.round(S.kasse),ruf:Math.round(S.ruf),ein:Math.round(S.eingenommen),aus:Math.round(S.ausgegeben),etappe:S.etappe,
          mines:Object.keys(S.minen).length,raff:Object.keys(S.raff).length,fabs:S.fabriken.length,
          fabLands:[...new Set(S.fabriken.map(f=>f.land))],products:[...new Set(S.fabriken.map(f=>f.produkt))],
          finished:S.fabriken.filter(f=>f.restbau===0).length,
          staffedM:Object.values(S.minen).filter(m=>m.arbeiter>0).length,staffedR:Object.values(S.raff).filter(r=>r.arbeiter>0).length,
          staffedF:S.fabriken.filter(f=>f.restbau===0&&f.arbeiter>0).length,workers:S.arbeiterGesamt,sellers:S.verkaeufer,
          ware:Math.round(Object.values(S.ware).reduce((a,b)=>a+b,0)),bonus:!!S.hilfsBonus,ende:S.ende&&S.ende.grund})""")

    # Starter chain through real purchase CTAs.
    for m in starter:
        if not buy_mine(m,350000):raise AssertionError(f'could not buy starter mine {m}')
    if not buy_raff(raff_order[0],350000):raise AssertionError('could not buy starter refinery')
    if not build_factory(config['fabPlaces'][0],'kabel',300000):raise AssertionError('could not build cable factory')
    ensure_sellers(5)

    # Let the starter company actually mine, refine, construct, produce and sell before expansion.
    assert advance(120)
    assign_finished_factories(3)
    assert advance(60)
    starter_state=state()
    dump('STARTER_AFTER_180_DAYS',starter_state)
    assert starter_state['ein']>0, 'starter chain produced no sales revenue'
    assert not starter_state['bonus'], 'Easy smoke accidentally entered assistance bonus'

    target_mines=len(config['mines']);target_raff=len(config['raffs']);target_lands=len(config['fabPlaces']);target_products=len(config['products'])

    max_day=5000
    last_log=0
    while q('S.tag')<max_day:
        if not handle_modal():raise AssertionError('Easy full-infrastructure run went insolvent')
        s0=state()
        reserve=450000 if s0['ein']<2000000 else 300000
        bought=False

        # One investment at a time: mines first, then refinery capacity, then factories.
        for m in mine_order:
            if buy_mine(m,reserve):bought=True;break
        if not bought:
            for r in raff_order:
                if buy_raff(r,reserve):bought=True;break

        existing_lands=set(q("()=>S.fabriken.map(f=>f.land)"));existing_products=set(q("()=>S.fabriken.map(f=>f.produkt)"))
        if not bought:
            for idx,land in enumerate(config['fabPlaces']):
                if land in existing_lands:continue
                missing=[p['id'] for p in product_order if p['id'] not in existing_products]
                prod=missing[0] if missing else product_order[idx%len(product_order)]['id']
                if build_factory(land,prod,reserve):bought=True;break
        if not bought and len(existing_lands)==target_lands:
            for pdef in product_order:
                if pdef['id'] in existing_products:continue
                if build_factory(config['fabPlaces'][0],pdef['id'],reserve):bought=True;break

        assign_finished_factories(3)
        ensure_sellers(8 if s0['ein']>2500000 else 5)
        if not advance(45):raise AssertionError('terminal insolvency while advancing')
        assign_finished_factories(3)

        s=state()
        if s['tag']-last_log>=180:
            timeline.append(s);last_log=s['tag'];dump('PROGRESS',s)

        all_bought=s['mines']==target_mines and s['raff']==target_raff and len(s['fabLands'])==target_lands and len(s['products'])==target_products
        all_running=s['staffedM']==target_mines and s['staffedR']==target_raff and s['staffedF']>=target_lands
        if all_bought and all_running and s['tag']>720:
            break

    if not handle_modal():raise AssertionError('terminal insolvency at finish')
    final=state();dump('FINAL',final);dump('TIMELINE_LAST',timeline[-12:])

    assert final['mines']==target_mines,(final,target_mines)
    assert final['raff']==target_raff,(final,target_raff)
    assert len(final['fabLands'])==target_lands,(final,target_lands)
    assert len(final['products'])==target_products,(final,target_products)
    assert final['staffedM']==target_mines
    assert final['staffedR']==target_raff
    assert final['staffedF']>=target_lands
    assert final['tag']>720 and final['ein']>0 and final['ende'] is None
    assert not final['bonus'],'full Easy run must remain normal Easy'

    before=q("()=>({mines:Object.keys(S.minen).length,raff:Object.keys(S.raff).length,fabs:S.fabriken.length,tag:S.tag,schwierigkeit:S.schwierigkeit,bonus:S.hilfsBonus})")
    page.evaluate('speichern()')
    page.reload(wait_until='networkidle');page.wait_for_timeout(150)
    after=q("()=>({mines:Object.keys(S.minen).length,raff:Object.keys(S.raff).length,fabs:S.fabriken.length,tag:S.tag,schwierigkeit:S.schwierigkeit,bonus:S.hilfsBonus})")
    dump('RELOAD',{'before':before,'after':after});assert after==before
    assert page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=0
    assert not errors,errors
    browser.close()

print('FULL EASY E2E INFRASTRUCTURE SMOKE PASS')

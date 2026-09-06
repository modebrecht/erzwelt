from pathlib import Path
p=Path('scripts/full-easy-strategy-smoke.py')
s=p.read_text()

old="assert buy_mine(m['id']);assert set_mine(m['id'],10)"
new="""assert buy_mine(m['id'])
        ok=set_mine(m['id'],10)
        if not ok:
            dump('STARTER_STAFF_FAIL',{'mine':m,'state':state(),'mineState':q(f\"S.minen[{json.dumps(m['id'])}]\")})
        assert ok"""
if s.count(old)!=1: raise SystemExit(f'expected starter staffing line once, got {s.count(old)}')
s=s.replace(old,new)

old2="""            left=target-q(f\"S.minen[{json.dumps(id)}].arbeiter\")
            n=5 if left>=5 else 1
            if not click(f'[data-tun=\"crew\"][data-id=\"{id}\"][data-n=\"{n}\"]'):return False
"""
new2="""            left=target-q(f\"S.minen[{json.dumps(id)}].arbeiter\")
            n=1
            if not click(f'[data-tun=\"crew\"][data-id=\"{id}\"][data-n=\"{n}\"]'):return False
"""
if s.count(old2)!=1: raise SystemExit(f'expected mine crew control block once, got {s.count(old2)}')
s=s.replace(old2,new2)

old3="assert advance(10);assert set_fab(0,8);assert set_sellers(8)"
new3="""assert advance(12)
    for _ in range(6):
        if q('S.fabriken[0].restbau')<=0: break
        assert advance(5)
    ok=set_fab(0,5)
    if not ok:
        dump('STARTER_FAB_STAFF_FAIL',{'state':state(),'fab':q(\"()=>S.fabriken[0]\"),'free':q('freieArbeiter()'),'buttons':q(\"()=>[...document.querySelectorAll('[data-tun=\\\"fcrew\\\"]')].map(b=>({i:b.dataset.i,n:b.dataset.n,disabled:b.disabled}))\")})
    assert ok
    assert set_sellers(4)"""
if s.count(old3)!=1: raise SystemExit(f'expected starter factory line once, got {s.count(old3)}')
s=s.replace(old3,new3)

old4="""            left=target-q(f\"S.fabriken[{index}].arbeiter\")
            n=5 if left>=5 else 1
            if not click(f'[data-tun=\"fcrew\"][data-i=\"{index}\"][data-n=\"{n}\"]'):return False
"""
new4="""            left=target-q(f\"S.fabriken[{index}].arbeiter\")
            n=1
            if not click(f'[data-tun=\"fcrew\"][data-i=\"{index}\"][data-n=\"{n}\"]'):return False
"""
if s.count(old4)!=1: raise SystemExit(f'expected factory crew control block once, got {s.count(old4)}')
s=s.replace(old4,new4)

old5="""            left=target-q('S.verkaeufer');n=5 if left>=5 else 1
            if not click(f'[data-tun=\"vcrew\"][data-n=\"{n}\"]'):return False
"""
new5="""            left=target-q('S.verkaeufer');n=1
            if not click(f'[data-tun=\"vcrew\"][data-n=\"{n}\"]'):return False
"""
if s.count(old5)!=1: raise SystemExit(f'expected seller crew control block once, got {s.count(old5)}')
s=s.replace(old5,new5)

old6='    def sheet(kind,id): page.evaluate("x=>blattFuellen(x.k,x.id)",{\'k\':kind,\'id\':id})\n'
new6='''    def sheet(kind,id):\n        page.evaluate("x=>blattFuellen(x.k,x.id)",{\'k\':kind,\'id\':id})\n        # Direct tagVor() calls compress many game days into milliseconds. The\n        # performance patch may throttle the first same-sheet redraw; a second\n        # call catches the UI up to the current game state.\n        page.evaluate("x=>blattFuellen(x.k,x.id)",{\'k\':kind,\'id\':id})\n'''
if s.count(old6)!=1: raise SystemExit(f'expected sheet helper once, got {s.count(old6)}')
s=s.replace(old6,new6)

anchor="    # ---------- PHASE 1: robust cable cash engine ----------\n"
helper='''    def rebalance_supply():\n        # Size the already-owned mines and first refinery from the actual recipes\n        # of all staffed finished factories. This mirrors the economic decision a\n        # player has to make instead of blindly assigning the same crew everywhere.\n        plan=q("""()=>{\n          const need={}; let rawTotal=0;\n          for(const f of S.fabriken){\n            if(f.restbau>0 || f.arbeiter<=0) continue;\n            const pd=PRODUKT[f.produkt];\n            const units=Math.floor(f.arbeiter*pd.proArbeiter*perkMult('fabrik'));\n            for(const [k,n] of Object.entries(pd.rezept)) need[k]=(need[k]||0)+units*n;\n          }\n          const mines=[];\n          for(const [k,matNeed] of Object.entries(need)){\n            const defs=MINEN.filter(d=>S.minen[d.id]&&d.mat===k);\n            if(!defs.length) continue;\n            // During product unlocks there is one intentionally selected mine per\n            // material. If more exist later, use the best raw output per worker.\n            defs.sort((a,b)=>b.ergiebigkeit-a.ergiebigkeit);\n            const d=defs[0], m=S.minen[d.id];\n            let eff=perkMult('foerderung')*ausbauFaktor(m.ausbau);\n            if(m.malusBis>S.tag) eff*=m.malus;\n            eff*=0.55+(m.zufriedenheit/100)*0.6;\n            const rawNeed=matNeed/Math.max(.01,MATERIAL[k].ausbeute);\n            rawTotal+=rawNeed;\n            const perWorker=Math.max(.01,d.ergiebigkeit*eff);\n            const target=Math.min(d.plaetze,Math.max(1,Math.ceil(rawNeed/perWorker*1.15)));\n            mines.push({id:d.id,mat:k,target,rawNeed:Math.round(rawNeed),perWorker:+perWorker.toFixed(2)});\n          }\n          const rid=Object.keys(S.raff)[0]||null;\n          let raffTarget=0;\n          if(rid){\n            const rd=RAFF_ORTE.find(x=>x.id===rid), r=S.raff[rid];\n            const perWorker=rd.kapazitaet/rd.plaetze*ausbauFaktor(r.ausbau)*globalWert('hafen')*perkMult('durchsatz');\n            raffTarget=Math.min(rd.plaetze,Math.max(1,Math.ceil(rawTotal/Math.max(1,perWorker)*1.15)));\n          }\n          const units=S.fabriken.filter(f=>f.restbau===0&&f.arbeiter>0).reduce((a,f)=>a+Math.floor(f.arbeiter*PRODUKT[f.produkt].proArbeiter*perkMult('fabrik')),0);\n          const sellers=Math.max(1,Math.ceil(units/Math.max(1,STUECK_PRO_VERKAEUFER*perkMult('verkaufskraft'))));\n          return {mines,rid,raffTarget,sellers,rawTotal:Math.round(rawTotal),units};\n        }""")\n        dump('SUPPLY_PLAN',plan)\n        for t in plan['mines']:\n            if not set_mine(t['id'],t['target']):\n                dump('SUPPLY_MINE_FAIL',{'target':t,'state':state()});return False\n        if plan['rid'] and not set_raff(plan['rid'],plan['raffTarget']):\n            dump('SUPPLY_RAFF_FAIL',{'plan':plan,'state':state()});return False\n        if not set_sellers(plan['sellers']):\n            dump('SUPPLY_SELLER_FAIL',{'plan':plan,'state':state()});return False\n        return True\n\n'''
if s.count(anchor)!=1: raise SystemExit(f'phase1 anchor count {s.count(anchor)}')
s=s.replace(anchor,helper+anchor)

old7="        set_sellers(min(30,8+q('S.fabriken.length')*3))\n"
new7="""        assert rebalance_supply()\n"""
if s.count(old7)!=1: raise SystemExit(f'expected seller scaling once, got {s.count(old7)}')
s=s.replace(old7,new7)

# New product-family mines are purchased first; demand-based balancing assigns\n# the correct crew only after the factory exists and is staffed.
old8="            assert buy_mine(m['id']);assert set_mine(m['id'],5);owned_materials.add(m['mat'])\n"
new8="            assert buy_mine(m['id']);owned_materials.add(m['mat'])\n"
if s.count(old8)!=1: raise SystemExit(f'expected product-family mine staffing once, got {s.count(old8)}')
s=s.replace(old8,new8)

old9="        assert set_fab(idx,5)\n"
new9="""        crew_target={'vietnam':3,'mexiko':2,'deutschland':2,'usa':2,'china':2}.get(land,2)\n        assert set_fab(idx,crew_target)\n"""
if s.count(old9)!=1: raise SystemExit(f'expected product factory staffing once, got {s.count(old9)}')
s=s.replace(old9,new9)

# The final acquisition phases verify that every location can be bought. Extra\n# duplicate mines/refineries do not need staff merely to prove purchaseability;\n# leaving them idle avoids manufacturing artificial wage load in this smoke.
old10="        assert buy_mine(m['id']);assert set_mine(m['id'],1)\n"
new10="        assert buy_mine(m['id'])\n"
if s.count(old10)!=1: raise SystemExit(f'expected all-mine staffing once, got {s.count(old10)}')
s=s.replace(old10,new10)
old11="        assert buy_raff(r['id']);assert set_raff(r['id'],1)\n"
new11="        assert buy_raff(r['id'])\n"
if s.count(old11)!=1: raise SystemExit(f'expected all-raff staffing once, got {s.count(old11)}')
s=s.replace(old11,new11)

old12="    assert final['staffedM']==len(cfg['mines'])\n    assert final['staffedR']==len(cfg['raffs'])\n"
new12="    assert final['staffedM']>=len(cfg['starter'])\n    assert final['staffedR']>=1\n"
if s.count(old12)!=1: raise SystemExit(f'expected final staffing assertions once, got {s.count(old12)}')
s=s.replace(old12,new12)

p.write_text(s)

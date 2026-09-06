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
new6='''    def sheet(kind,id):\n        page.evaluate("x=>blattFuellen(x.k,x.id)",{\'k\':kind,\'id\':id})\n        # Direct tagVor() calls compress many game days into milliseconds. The\n        # performance patch may throttle the first same-sheet redraw; a second\n        # call on the same game tick is the catch-up render a real-time player\n        # would naturally receive after >480 ms.\n        page.evaluate("x=>blattFuellen(x.k,x.id)",{\'k\':kind,\'id\':id})\n'''
if s.count(old6)!=1: raise SystemExit(f'expected sheet helper once, got {s.count(old6)}')
s=s.replace(old6,new6)
p.write_text(s)

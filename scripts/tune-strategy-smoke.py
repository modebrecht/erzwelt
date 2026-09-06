from pathlib import Path
p=Path('scripts/full-easy-strategy-smoke.py')
s=p.read_text()
old="assert buy_mine(m['id']);assert set_mine(m['id'],10)"
new="""assert buy_mine(m['id'])
        ok=set_mine(m['id'],5)
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
p.write_text(s)

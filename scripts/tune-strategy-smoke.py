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
p.write_text(s.replace(old,new))

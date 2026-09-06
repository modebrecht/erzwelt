from pathlib import Path

p = Path('scripts/full-easy-e2e-smoke.py')
s = p.read_text()
old = """            if not open_pin('fab',f['land']):continue
            for _ in range(target+2):
"""
new = """            # Open the factory sheet directly here. Map-pin navigation has its own smoke gate;
            # this run is about the full economy/infrastructure path.
            page.evaluate(\"land=>blattFuellen('fab',land)\", f['land'])
            sel=f'[data-tun=\"fcrew\"][data-i=\"{f[\"i\"]}\"][data-n=\"1\"]'
            if not page.evaluate(\"sel=>!!document.querySelector(sel)\", sel):
                raise AssertionError(f'factory staffing control missing for {f}')
            for _ in range(target+2):
"""
if s.count(old) != 1:
    raise SystemExit(f'expected factory staffing block once, got {s.count(old)}')
p.write_text(s.replace(old, new))

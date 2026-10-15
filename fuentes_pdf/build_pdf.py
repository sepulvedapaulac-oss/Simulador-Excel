#!/usr/bin/env python3
"""HTML -> PDF (carta) con Chromium. Uso: python3 build_pdf.py fuente.html salida.pdf
La fuente usa <link rel="stylesheet" href="../pdf.css"> y clases .page. Falla si alguna página desborda."""
import sys,os,glob
from playwright.sync_api import sync_playwright
src,out=os.path.abspath(sys.argv[1]),os.path.abspath(sys.argv[2])
exe=(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
  pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto('file://'+src);pg.wait_for_load_state('networkidle')
  over=pg.evaluate("""()=>[...document.querySelectorAll('.page')].map((p,i)=>{const o=p.scrollHeight>p.clientHeight+1||p.scrollWidth>p.clientWidth+1;if(o)p.classList.add('over');return o?i+1:0}).filter(Boolean)""")
  n=pg.evaluate("document.querySelectorAll('.page').length")
  pg.pdf(path=out,format='Letter',print_background=True,margin={'top':'0','bottom':'0','left':'0','right':'0'})
  b.close()
print(f'{"OK" if not over and not errs else "REVISAR"} {os.path.basename(out)} · {n} páginas · desbordes en páginas: {over or "ninguna"} · errores JS: {errs or "ninguno"}')
sys.exit(1 if over or errs else 0)

#!/usr/bin/env python3
"""Revisa errores JS y desbordes horizontales en escritorio y celular, y toma capturas.
Uso: python3 check_layout.py archivo.html [carpeta_capturas]
Recorre cada <section class="slide"> haciéndola visible para medirla."""
import sys,glob,os
from playwright.sync_api import sync_playwright
f=os.path.abspath(sys.argv[1]);out=sys.argv[2] if len(sys.argv)>2 else 'capturas';os.makedirs(out,exist_ok=True)
exe=(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
JS='''()=>{const W=document.documentElement.clientWidth,o=[];const sl=[...document.querySelectorAll('.slide,.etask')];
const res=[];(sl.length?sl:[document.body]).forEach((s,i)=>{sl.forEach(x=>{x.hidden=false;x.classList.toggle('active',x===s)});
document.querySelectorAll('.slide *,.etask *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>W+1&&e.offsetParent)o.push(i+':'+e.tagName+'.'+String(e.className).slice(0,30)+' →'+Math.round(r.right))})});
return {scroll:document.documentElement.scrollWidth,W,over:[...new Set(o)].slice(0,15)}}'''
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    for w,h in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':w,'height':h});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+f);pg.wait_for_timeout(600);pg.screenshot(path=f'{out}/inicio_{w}.png',full_page=True)
        r=pg.evaluate(JS);print(w,'px · errores JS:',errs or 'ninguno','· desbordes:',r['over'] or 'ninguno')
    b.close()

#!/usr/bin/env python3
"""Recorre la evaluación diagnóstica en escritorio (1366) y móvil (390x844): nombre, autoevaluación,
20 respuestas, mapa y PDF. Uso: python3 test_dg.py archivo.html carpeta_capturas"""
import sys,os,glob
from playwright.sync_api import sync_playwright
src,cap=os.path.abspath(sys.argv[1]),os.path.abspath(sys.argv[2]);os.makedirs(cap,exist_ok=True)
exe=(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
ok=True
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
  for tag,vp in [('desk',{'width':1366,'height':900}),('mob',{'width':390,'height':844})]:
    pg=b.new_page(viewport=vp);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+src);pg.wait_for_timeout(400)
    over=[]
    def chk(n):
      w=pg.evaluate("document.documentElement.scrollWidth-window.innerWidth")
      if w>1:over.append((n,w))
      pg.screenshot(path=f'{cap}/{tag}_{n}.png',full_page=True)
    chk('1_inicio')
    pg.fill('#dgFirst','Alex');pg.fill('#dgLast','Rivas');pg.click('#dgStart');pg.wait_for_timeout(300)
    for k in range(5):pg.click(f'#dgAuto button[data-k="{k}"][data-j="{k%4}"]');pg.wait_for_timeout(50)
    chk('2_auto');pg.click('#nextBtn');pg.wait_for_timeout(300)
    n=pg.evaluate("window.LESSON.dg.P.length")
    for i in range(n):
      pg.click('#dgQ .opt[data-j="%d"]'%(i%4));pg.wait_for_timeout(330)
      if i==2:chk('3_pregunta')
    pg.click('#dgFin');pg.wait_for_timeout(500);chk('4_mapa')
    pg.click('#dgPdf');pg.wait_for_timeout(500)
    pdf=pg.evaluate("window.__lastPdf?Array.from(window.__lastPdf):null")
    if pdf:open(f'{cap}/{tag}_mapa.pdf','wb').write(bytes(pdf))
    sc=pg.evaluate("window.LESSON.score()")
    print(tag,'errores JS:',errs or 'ninguno','· desborde:',over or 'ninguno','· PDF:',bool(pdf),'· score:',sc)
    ok=ok and not errs and not over and bool(pdf)
  b.close()
print('RECORRIDO OK' if ok else 'REVISAR');sys.exit(0 if ok else 1)

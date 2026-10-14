#!/usr/bin/env python3
"""Recorrido del carrusel de resumen del Módulo 5 con un API SCORM 1.2 falso.
Uso: python3 test.py [out/Resumen_y_glosario_Modulo_5.html] [cap]"""
import sys,os,glob,json
from playwright.sync_api import sync_playwright
f=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'out/Resumen_y_glosario_Modulo_5.html');cap=sys.argv[2] if len(sys.argv)>2 else 'cap';os.makedirs(cap,exist_ok=True)
MOCK="""window.__sc=[];window.__store={};window.__commits=0;
window.API={LMSInitialize:()=>'true',LMSFinish:()=>'true',LMSGetValue:k=>window.__store[k]||'',
LMSSetValue:(k,v)=>{window.__sc.push([k,v]);window.__store[k]=v;return 'true'},LMSCommit:()=>{window.__commits++;return 'true'},
LMSGetLastError:()=>'0',LMSGetErrorString:()=>'',LMSGetDiagnostic:()=>''};"""
exe=(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
allok=True
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
  for w,h,scheme in ((1366,900,'light'),(375,812,'light'),(375,812,'dark')):
    ctx=b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,has_touch=(w<500));pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.add_init_script(MOCK)
    pg.goto('file://'+f);pg.wait_for_timeout(300)
    N=pg.locator('.slide').count();tag=f'{w}_{scheme}';over=[]
    for i in range(N):
      s=pg.locator('.slide.active')
      title=s.get_attribute('data-title')
      if s.locator('[data-fix]').count():
        s.locator('[data-fix]').click();assert s.locator('.fix').is_visible()
      if title=='Ruta de cierre':
        for k in range(6):s.locator('.rnode').nth(k).click()
        assert 'seis pasos' in s.locator('#rhint').inner_text()
      if title=='Glosario':
        assert s.locator('.flip:visible').count()==16
        pg.fill('#gq','finiquito');n=s.locator('.flip:visible').count();assert n>=1,n
        pg.fill('#gq','zzzz');assert s.locator('#gempty').is_visible()
        pg.fill('#gq','');s.locator('#gfil button',has_text='Causales').click();assert s.locator('.flip:visible').count()==6
        s.locator('.flip:visible').first.click();assert s.locator('.flip.flipped').count()==1
      if title=='Autoevaluación':
        assert 'Repaso completado' in pg.locator('#endbox').inner_text(),'endbox no completado'
        qs=s.locator('.vfq')
        qs.nth(0).locator('[data-v="1"]').click();assert qs.nth(0).locator('.feedback.bad').count()==1  # error a propósito
        qs.nth(0).locator('[data-v="0"]').click();assert qs.nth(0).locator('.feedback.good').count()==1
        qs.nth(1).locator('[data-v="1"]').click();qs.nth(2).locator('[data-v="0"]').click()
        assert s.locator('.feedback.good').count()==3
        assert '3 de 3' in pg.locator('#endbox').inner_text()
      o=pg.evaluate('document.documentElement.scrollWidth>window.innerWidth+1')
      if o:over.append(i)
      pg.screenshot(path=f'{cap}/t_{tag}_{i+1:02d}.png',full_page=True)
      if i<N-1:
        if w<500 and i==1:  # deslizar en celular
          pg.evaluate("""()=>{const a=document.getElementById('app'),t=(x)=>new Touch({identifier:1,target:a,clientX:x,clientY:300});
            a.dispatchEvent(new TouchEvent('touchstart',{touches:[t(300)],changedTouches:[t(300)],bubbles:true}));
            a.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[t(100)],bubbles:true}))}""")
        elif i==2:pg.keyboard.press('ArrowRight')
        else:pg.click('#next')
        pg.wait_for_timeout(120)
        assert pg.locator('.slide').nth(i+1).evaluate('e=>e.classList.contains("active")'),f'no avanzó a {i+2}'
    sc=pg.evaluate('window.__sc');st=[v for k,v in sc if k=='cmi.core.lesson_status']
    # Teclado: Inicio vuelve a la portada; puntos navegan
    pg.keyboard.press('Home');assert pg.locator('.slide').nth(0).evaluate('e=>e.classList.contains("active")')
    pg.locator('.dot').nth(11).click();assert pg.locator('.slide').nth(11).evaluate('e=>e.classList.contains("active")')
    # Reanudación: recargar y comprobar que vuelve a la tarjeta 12 sin perder lo visto
    store=pg.evaluate('window.__store');pg.add_init_script('window.__store='+json.dumps(store)+';');pg.reload();pg.wait_for_timeout(300)
    res=pg.locator('.slide').nth(11).evaluate('e=>e.classList.contains("active")');seenDots=pg.locator('.dot.seen, .dot.active').count()
    print(f'{tag}: tarjetas {N} · estados SCORM {st} · commits {pg.evaluate("window.__commits")} · reanuda en 12: {res} · puntos vistos {seenDots}/{N} · desbordes {over or "ninguno"} · errores JS {errs or "ninguno"}')
    allok=allok and not errs and not over and st[-1:]==['completed'] and st.count('completed')==1 and res and seenDots==N
    ctx.close()
  b.close()
print('RECORRIDO OK' if allok else 'RECORRIDO CON FALLAS')

#!/usr/bin/env python3
"""Recorre un caso ramificado o laboratorio (build.py caso) de forma genérica.
Uso: python3 test_caso.py salida/Nombre.html [carpeta_capturas] [estrategia: primera|ultima|azar]
Responde cada etapa, llega al resultado, descarga el informe y revisa errores JS, desbordes y llamadas SCORM."""
import sys,random,os
from playwright.sync_api import sync_playwright
f=os.path.abspath(sys.argv[1]);cap=sys.argv[2] if len(sys.argv)>2 else None;st=sys.argv[3] if len(sys.argv)>3 else 'azar'
if cap:os.makedirs(cap,exist_ok=True)
MOCK="""window.__sc=[];window.API={LMSInitialize:()=>'true',LMSFinish:()=>'true',LMSGetValue:k=>'',LMSSetValue:(k,v)=>{window.__sc.push([k,v]);return 'true'},LMSCommit:()=>'true',LMSGetLastError:()=>'0',LMSGetErrorString:()=>'',LMSGetDiagnostic:()=>''};"""
ok=True
with sync_playwright() as p:
  import glob
  exe=(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
  b=p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
  for w,h in ((1366,900),(375,800)):
    pg=b.new_page(viewport={'width':w,'height':h},accept_downloads=True);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script(MOCK);pg.goto('file://'+f);pg.fill('#nm','Prueba Automática');pg.click('#startBtn');n=0;rnd=random.Random(w)
    while pg.locator('#result').is_hidden() and n<40:
      n+=1;nd=pg.locator('#nd')
      if nd.locator('.opt').count():
        k=nd.locator('.opt').count();i={'primera':0,'ultima':k-1}.get(st,rnd.randrange(k));nd.locator('.opt').nth(i).click()
      if nd.locator('textarea').count():nd.locator('textarea').fill(' '.join(['palabra']*60))
      if nd.locator('.chkgrid input').count():nd.locator('.chkgrid input').first.check()
      for s in nd.locator('select').all():
        k=s.locator('option').count();s.select_option(index=rnd.randrange(1,k))
      for i in nd.locator('.rowsel input').all():i.fill('1')
      nd.locator('#send').click()
      if nd.locator('.crit input').count():nd.locator('.crit input').first.check()
      if cap and n<=3:pg.screenshot(path=f'{cap}/caso_{w}_{n:02d}.png',full_page=True)
      pg.locator('#next').click()
    assert pg.locator('#result').is_visible(),'no llegó al resultado'
    pct=pg.locator('#result .ring span').inner_text()
    with pg.expect_download() as d:pg.click('#dl')
    dl=d.value;html=open(dl.path(),encoding='utf-8').read();assert 'Detalle del recorrido' in html and 'Prueba Automática' in html,'informe incompleto'
    pg.click('#tg');sc=dict(pg.evaluate('window.__sc'))
    ov=pg.evaluate('document.documentElement.scrollWidth>window.innerWidth+1')
    if cap:pg.screenshot(path=f'{cap}/caso_{w}_resultado.png',full_page=True)
    print(f'{w}px · etapas {n} · resultado {pct} · estado SCORM {sc.get("cmi.core.lesson_status")} nota {sc.get("cmi.core.score.raw")} · interacciones {sum(1 for k in sc if k.endswith(".id"))} · informe {len(html)//1024} KB · errores JS {errs or "ninguno"} · desborde {"SÍ" if ov else "no"}')
    ok=ok and not errs and not ov and sc.get('cmi.core.lesson_status') in('passed','failed')
  b.close()

# ---- Revisión estática de caminos (todas las etapas alcanzables, mismo máximo en todos los caminos) ----
import re,subprocess,json as _j
src=open(f,encoding='utf-8').read();m=re.search(r'const CASO=(\{[\s\S]*?\});\s*const \$=',src)
if m:
  C=_j.loads(subprocess.check_output(['node','-e','const C='+m.group(1)+';console.log(JSON.stringify(C))']))
  N={e['id']:e for e in C['etapas']};start=C.get('inicio') or C['etapas'][0]['id'];paths=[];seen=set()
  def mx(e):return 0 if e['tipo']=='abierta' else max(o.get('pts',0) for o in e['opciones']) if e['tipo']=='decision' else e.get('pts',0)
  def walk(i,acc,pts):
    assert i in N,f'etapa inexistente: {i}';assert i not in acc,f'ciclo en {i}'
    e=N[i];seen.add(i);acc=acc+[i];pts=pts+mx(e)
    nx={o.get('siguiente') or e.get('siguiente') for o in e['opciones']} if e['tipo']=='decision' else {e.get('siguiente')}
    for n in nx:
      if n:walk(n,acc,pts)
      else:paths.append((acc,pts))
  walk(start,[],0);maxs=sorted({p for _,p in paths});lens=sorted({len(a) for a,_ in paths})
  unreach=[i for i in N if i not in seen]
  print(f'caminos {len(paths)} · etapas por camino {lens} · máximo por camino {maxs} · sin alcanzar {unreach or "ninguna"}')
  if len(maxs)>1 or unreach:print('ADVERTENCIA: caminos con distinto máximo o etapas inalcanzables');ok=False
print('RECORRIDO OK' if ok else 'FALLÓ');sys.exit(0 if ok else 1)

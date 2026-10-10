from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
ZC={'z3':'concretos, verificables y anteriores a la decisión','z4':'relata esos hechos, no solo cita el artículo','z5':'no invoco esa causal, porque podría declararse improcedente o injustificada'}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        # 1 Inicio: solicitud por revisar + decisión
        assert pg.is_disabled('#nextBtn')
        for f in pg.query_selector_all('#form .ffield'): f.click()
        pg.wait_for_selector('#hookQ:not([hidden])',timeout=4000)
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert '30%' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert 'Correcto' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Acordeón
        assert pg.is_disabled('#nextBtn')
        heads=pg.query_selector_all('#acc .acc-head')
        for h in heads[:4]: h.click()
        assert pg.is_disabled('#nextBtn')
        heads[4].click(); assert pg.inner_text('#accTick')=='5 / 5'
        shot(pg,f'{W}_03'); nxt(pg,'acc')
        # 4 Tabla: primero con errores, luego corregir
        assert pg.is_disabled('#nextBtn')
        sels=pg.query_selector_all('#seltable select')
        for s,v in zip(sels,['0','1','0','2','3','0']): s.select_option(v)
        pg.click('#tblCheck'); assert '4 de 6' in pg.inner_text('#tblFb'); assert pg.is_disabled('#nextBtn')
        sels[2].select_option('4'); sels[5].select_option('4'); pg.click('#tblCheck'); assert 'Todo correcto' in pg.inner_text('#tblFb')
        shot(pg,f'{W}_04'); nxt(pg,'tbl')
        # 5 Verdadero o falso (una incorrecta)
        assert pg.is_disabled('#nextBtn')
        for v in ['1','1','0','0','1']:
            pg.click(f'#tf .tf-btns button[data-v="{v}"]'); pg.click('#tfNext')
        print('  tf:',pg.inner_text('#tf .feedback strong')); assert '4 de 5' in pg.inner_text('#tf .feedback strong')
        shot(pg,f'{W}_05'); nxt(pg,'tf')
        # 6 Fichas del art. 160
        assert pg.is_disabled('#nextBtn')
        tiles=pg.query_selector_all('#tiles .tile')
        for t in tiles[:6]: t.click()
        assert pg.is_disabled('#nextBtn')
        tiles[6].click(); assert pg.inner_text('#tlTick')=='7 / 7'; assert 'desafuero' in pg.inner_text('#tlFb')
        shot(pg,f'{W}_06'); nxt(pg,'tiles')
        # 7 Caso etapa 1 (incorrectas primero)
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso] [data-opt=A]'); assert '80%' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso] [data-opt=B]'); assert 'exclusiva confianza' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso] [data-opt=C]'); assert 'Buena decisión' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_07'); nxt(pg,'caso')
        # 8 Caso etapa 2 (correcta al primer intento)
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2] [data-opt=B]'); assert 'Correcto' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_08'); nxt(pg,'caso2')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200); assert pg.is_disabled('#nextBtn')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        # 10 Transferencia: sin situación, con error, luego correcto
        assert pg.is_disabled('#nextBtn')
        pg.click('#zCheck'); assert 'elige una situación' in pg.inner_text('#zFb')
        pg.click('#scChips .chip2[data-s="2"]'); assert 'Diferencias' in pg.inner_text('#planHead')
        pg.select_option('#z1',label='una diferencia de relación o de confianza')
        pg.select_option('#z2',label='el art. 161, necesidades de la empresa')
        for k,v in ZC.items(): pg.select_option('#'+k,label=v)
        pg.click('#zCheck'); assert '4 de 5' in pg.inner_text('#zFb'); assert pg.is_disabled('#nextBtn')
        pg.select_option('#z2',label='ninguna por ahora: se gestiona la situación y se documentan hechos'); pg.click('#zCheck')
        assert 'Análisis correcto' in pg.inner_text('#zFb'); assert 'difícil de reconstruir' in pg.inner_text('#zModel')
        shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%' and pg.inner_text('#fEsc')=='1 / 3'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="5"]'); assert pg.inner_text('#counter')=='Pantalla 6 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

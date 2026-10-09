from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
ZOK={'z1':'conversando con las personas del área y observando sus tareas e interacciones','z2':'con perspectiva de género, considerando quiénes están más expuestos','z3':'concreta, con responsable y un objetivo medible','z4':'los riesgos, las medidas, los derechos y responsabilidades, y los canales de denuncia','z5':'la privacidad y la honra de las personas involucradas','z6':'revisando el indicador y corrigiendo la medida si no funciona'}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        # 1 Inicio: matriz por revisar + decisión
        assert pg.is_disabled('#nextBtn')
        for f in pg.query_selector_all('#form .ffield'): f.click()
        pg.wait_for_selector('#hookQ:not([hidden])',timeout=4000)
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert 'Correcto' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Acordeón: cinco componentes
        assert pg.is_disabled('#nextBtn')
        heads=pg.query_selector_all('#acc .acc-head')
        for h in heads[:4]: h.click()
        assert pg.is_disabled('#nextBtn')
        heads[4].click(); assert pg.inner_text('#accTick')=='5 / 5'
        shot(pg,f'{W}_03'); nxt(pg,'acc')
        # 4 Ordenar: primero comprobar desordenado (incorrecto), luego ordenar
        assert pg.is_disabled('#nextBtn')
        pg.click('#orderCheck'); assert 'Aún no' in pg.inner_text('#orderFb'); assert pg.is_disabled('#nextBtn')
        # ordenamiento tipo burbuja usando el texto esperado
        EXP=['Identificar los peligros','Evaluar los riesgos','Definir medidas','Informar y capacitar','Hacer seguimiento']
        def pos():
            t=pg.evaluate("[...document.querySelectorAll('#order li')].map(li=>li.children[1].textContent)")
            return [next(k for k,e in enumerate(EXP) if x.startswith(e)) for x in t]
        for target in range(5):
            while pos().index(target)>target:
                i=pos().index(target); pg.click(f'#order [data-u="{i}"]')
        pg.click('#orderCheck'); assert 'correcta' in pg.inner_text('#orderFb')
        shot(pg,f'{W}_04'); nxt(pg,'order')
        # 5 Tabla: una incorrecta y corrección
        assert pg.is_disabled('#nextBtn')
        sels=pg.query_selector_all('#seltable select')
        for s,v in zip(sels,['0','1','3','2','4']): s.select_option(v)
        pg.click('#tblCheck'); print('  tbl 1:',pg.inner_text('#tblFb')[:20]); assert pg.is_disabled('#nextBtn')
        sels[2].select_option('2'); sels[3].select_option('3'); pg.click('#tblCheck'); print('  tbl 2:',pg.inner_text('#tblFb')[:20])
        shot(pg,f'{W}_05'); nxt(pg,'tbl')
        # 6 Comparador
        assert pg.is_disabled('#nextBtn')
        pg.fill('#cmpR','60'); pg.dispatch_event('#cmpR','input'); assert pg.is_disabled('#nextBtn')
        pg.fill('#cmpR','5'); pg.dispatch_event('#cmpR','input')
        shot(pg,f'{W}_06'); nxt(pg,'cmp')
        # 7 Caso 1 (primero incorrecta)
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso1] [data-opt=B]'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=C]'); assert 'Buena decisión' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_07'); nxt(pg,'caso1')
        # 8 Caso 2 (correcta al primer intento)
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2] [data-opt=A]'); assert 'Buena decisión' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_08'); nxt(pg,'caso2')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200); assert pg.is_disabled('#nextBtn')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        # 10 Transferencia: sin área, luego con errores, luego correcto
        assert pg.is_disabled('#nextBtn')
        pg.click('#zCheck'); assert 'elige un área' in pg.inner_text('#zFb')
        pg.click('#areaChips .chip2[data-a="1"]'); assert 'Terreno' in pg.inner_text('#planHead')
        for k,v in ZOK.items(): pg.select_option('#'+k,label=v)
        pg.select_option('#z6',label='solo cuando llega una denuncia')
        pg.click('#zCheck'); assert '5 de 6' in pg.inner_text('#zFb'); assert pg.is_disabled('#nextBtn')
        pg.select_option('#z6',label=ZOK['z6']); pg.click('#zCheck'); assert 'Plan completo' in pg.inner_text('#zFb')
        assert 'Terreno' in pg.inner_text('#zModel')
        shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%' and pg.inner_text('#fEsc')=='1 / 3'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="2"]'); assert pg.inner_text('#counter')=='Pantalla 3 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

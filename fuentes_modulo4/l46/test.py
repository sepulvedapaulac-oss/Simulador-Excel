from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
# índices correctos de CARDS (bins) y VL
BINS={0:1,1:0,2:1,3:0,4:1,5:0,6:1,7:0}
VL=[0,1,0,1,0,1]
QF=[0,1,0,1,0,1,0,1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        # 1 Inicio: chat en el celular + decisión
        assert pg.is_disabled('#nextBtn')
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
        assert 'bodega' in pg.inner_text('#phone')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert pg.query_selector('#reply')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Pestañas
        assert pg.is_disabled('#nextBtn')
        for t in (1,2,3,4): pg.click(f'#tabs .tab[data-t="{t}"]')
        assert pg.inner_text('#tabTick')=='5 / 5'
        shot(pg,f'{W}_03'); nxt(pg,'tabs')
        # 4 Clasificar: primero un error, luego todo correcto
        assert pg.is_disabled('#nextBtn')
        pg.click('.cardx[data-c="1"]'); pg.click('.bin[data-b="1"]'); assert 'No corresponde' in pg.inner_text('#binFb')
        for c,bb in BINS.items():
            pg.click(f'.cardx[data-c="{c}"]'); pg.click(f'.bin[data-b="{bb}"]')
        assert pg.inner_text('#binTick')=='8 / 8'
        shot(pg,f'{W}_04'); nxt(pg,'bins')
        # 5 Hotspots
        assert pg.is_disabled('#nextBtn')
        for i in range(5): pg.click(f'.hs[data-hs="{i}"]')
        shot(pg,f'{W}_05'); nxt(pg,'hs')
        # 6 Acordeón
        assert pg.is_disabled('#nextBtn')
        for h in pg.query_selector_all('#acc .acc-head'): h.click()
        pg.click('.slide.active details.pending summary')
        shot(pg,f'{W}_06'); nxt(pg,'acc')
        # 7 Veredicto por línea (una incorrecta primero)
        assert pg.is_disabled('#nextBtn')
        lines=pg.query_selector_all('#vlines .vline')
        lines[0].query_selector('button[data-a="1"]').click(); assert 'Revisa' in lines[0].inner_text()
        for l,a in zip(lines,VL): l.query_selector(f'button[data-a="{a}"]').click()
        assert pg.inner_text('#vlTick')=='6 / 6'
        shot(pg,f'{W}_07'); nxt(pg,'vl')
        # 8 Caso: informe (dos decisiones, una errónea)
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=C]'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=A]'); pg.wait_for_selector('#caso2:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2c] [data-opt=C]')
        shot(pg,f'{W}_08'); nxt(pg,'caso')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        # 10 Transferencia (bloqueada sin pass)
        for i,v in enumerate(QF):
            pg.click(f'#qf .btns button[data-v="{1-v if i==0 else v}"]'); pg.wait_for_timeout(1500)
        print('  qf:',pg.inner_text('#qf h3'))
        pg.wait_for_timeout(200); assert pg.is_disabled('#nextBtn'),'transferencia debería exigir pass'
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="3"]'); assert pg.inner_text('#counter')=='Pantalla 4 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

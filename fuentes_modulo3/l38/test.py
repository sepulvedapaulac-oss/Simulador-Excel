from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
def rng(pg,sel,v): pg.fill(sel,str(v)); pg.dispatch_event(sel,'input')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        # 1 Inicio: chat en el celular + decisión
        assert pg.is_disabled('#nextBtn')
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
        assert 'comité' in pg.inner_text('#phone')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert pg.query_selector('#reply')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Simulador de cuota
        assert pg.is_disabled('#nextBtn')
        rng(pg,'#sN',90); print('  sim 90:',pg.inner_text('#simV'))
        rng(pg,'#sN',100); print('  sim 100:',pg.inner_text('#simV'))
        rng(pg,'#sN',420); rng(pg,'#sH',2); print('  sim 420/2:',pg.inner_text('#simV')); assert 'No cumple' in pg.inner_text('#simV')
        rng(pg,'#sH',4); print('  sim 420/4:',pg.inner_text('#simV'),'|',pg.inner_text('#simWhy'))
        assert pg.inner_text('#simTick')=='3 / 3'
        shot(pg,f'{W}_03'); nxt(pg,'sim')
        # 4 Pestañas
        assert pg.is_disabled('#nextBtn')
        for t in (1,2,3): pg.click(f'#tabs .tab[data-t="{t}"]')
        shot(pg,f'{W}_04'); nxt(pg,'tabs')
        # 5 Hotspots
        assert pg.is_disabled('#nextBtn')
        for i in range(5): pg.click(f'.hs[data-hs="{i}"]')
        shot(pg,f'{W}_05'); nxt(pg,'hs')
        # 6 V/F (primera incorrecta)
        for v in ['1','0','0','1','1']:
            pg.click(f'#tf .tf-btns button[data-v="{v}"]'); pg.click('#tfNext')
        print('  tf:',pg.inner_text('#tf .feedback strong')); shot(pg,f'{W}_06'); nxt(pg,'tf')
        # 7 Tabla: una incorrecta y corrección
        sels=pg.query_selector_all('#seltable select')
        for s,v in zip(sels,['0','2','0','2']): s.select_option(v)
        pg.click('#tblCheck'); print('  tbl 1:',pg.inner_text('#tblFb')[:20]); assert pg.is_disabled('#nextBtn')
        sels[2].select_option('1'); pg.click('#tblCheck'); print('  tbl 2:',pg.inner_text('#tblFb')[:20])
        shot(pg,f'{W}_07'); nxt(pg,'tbl')
        # 8 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200); assert pg.is_disabled('#nextBtn')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_08'); nxt(pg,'quiz2')
        # 9 Transferencia: checklist (primera incorrecta) + modelo
        yn=[0,0,1,0,1]
        for i,it in enumerate(pg.query_selector_all('#ynList .yn-item')): it.query_selector(f'button[data-a="{yn[i]}"]').click()
        assert pg.is_disabled('#nextBtn')
        pg.click('#modelBtn'); shot(pg,f'{W}_09'); nxt(pg,'transfer')
        # 10 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_10')
        assert pg.inner_text('#counter')=='Pantalla 10 de 10'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="2"]'); assert pg.inner_text('#counter')=='Pantalla 3 de 10'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

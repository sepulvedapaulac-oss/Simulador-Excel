from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        assert pg.inner_text('#counter')=='Pantalla 1 de 11'
        # 1 Inicio: chat en el celular + decisión (A y C incorrectas, luego B)
        assert pg.is_disabled('#nextBtn')
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
        assert 'denuncia formal' in pg.inner_text('#phone')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert pg.query_selector('#reply')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(60)
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Tarjetas
        assert pg.is_disabled('#nextBtn')
        for c in pg.query_selector_all('.slide.active .flip'): c.click(); pg.wait_for_timeout(80)
        assert pg.inner_text('#fcTick')=='6 / 6' and pg.is_visible('#fcDone')
        shot(pg,f'{W}_03'); nxt(pg,'cards')
        # 4 Hotspots
        assert pg.is_disabled('#nextBtn')
        for i in range(5): pg.click(f'.hs[data-hs="{i}"]')
        assert 'Temor' in pg.inner_text('#hsPanel')
        shot(pg,f'{W}_04'); nxt(pg,'hs')
        # 5 V/F (primera incorrecta)
        assert pg.is_disabled('#nextBtn')
        for v in ['1','1','0','1','0']:
            pg.click(f'#tf .tf-btns button[data-v="{v}"]'); pg.click('#tfNext')
        print('  tf:',pg.inner_text('#tf .feedback strong')); assert pg.inner_text('#tf .feedback strong').startswith('4 de 5')
        shot(pg,f'{W}_05'); nxt(pg,'tf')
        # 6 Fichas
        assert pg.is_disabled('#nextBtn')
        for t in pg.query_selector_all('#tiles .tile'): t.click()
        assert pg.inner_text('#tlTick')=='8 / 8'
        shot(pg,f'{W}_06'); nxt(pg,'tiles')
        # 7 Caso 1: incorrecta B, reintento, correcta A
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso1] [data-opt=A]')
        shot(pg,f'{W}_07'); nxt(pg,'caso1')
        # 8 Caso 2: incorrecta B, reintento, correcta C
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso2] [data-opt=C]')
        shot(pg,f'{W}_08'); nxt(pg,'caso2')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); assert 'Aún no' in pg.inner_text('#qcard h3'); nxt(pg,'quiz')
        pg.wait_for_timeout(200); assert pg.is_disabled('#nextBtn')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); assert 'Aprobado' in pg.inner_text('#qcard h3'); shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        # 10 Transferencia: checklist (primera incorrecta) + modelo
        yn=[1,1,1,0,1]
        for i,it in enumerate(pg.query_selector_all('#ynList .yn-item')): it.query_selector(f'button[data-a="{yn[i]}"]').click()
        assert pg.is_disabled('#nextBtn')
        pg.click('#modelBtn'); shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%' and pg.inner_text('#fEsc')=='0 / 4'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="3"]'); assert pg.inner_text('#counter')=='Pantalla 4 de 11'
        pg.evaluate("document.querySelector('.topic-link[data-go=\"10\"]').click()"); assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        pg.click('[data-goto="5"]'); assert pg.inner_text('#counter')=='Pantalla 6 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

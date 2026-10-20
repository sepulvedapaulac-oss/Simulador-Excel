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
        # 1 Inicio: etiqueta + decisión
        assert pg.is_disabled('#nextBtn')
        shot(pg,f'{W}_00')
        pg.click('#sticker'); pg.wait_for_timeout(700)
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Tarjetas
        flips=pg.query_selector_all('.slide.active .flip')
        for i,f in enumerate(flips):
            f.click()
            if i==2: assert pg.is_disabled('#nextBtn')
        pg.wait_for_timeout(900); shot(pg,f'{W}_03'); nxt(pg,'cards')
        # 4 Calculadora
        print('  cal:',pg.inner_text('#calOut').replace('\n',' | '))
        pg.fill('#cDays','15'); pg.dispatch_event('#cDays','input'); print('  cal15:',pg.inner_text('#calOut').split('\n')[3])
        pg.fill('#pPrev','8'); pg.fill('#pCur','9'); pg.dispatch_event('#pCur','input'); print('  prog:',pg.inner_text('#pOut').replace('\n',' | '))
        pg.click('#chA button[data-v="b"]'); assert 'Revisa' in pg.inner_text('#chAFb')
        pg.click('#chA button[data-v="c"]')
        pg.fill('#chB','15'); pg.click('#chBCheck'); assert 'Aún no' in pg.inner_text('#chBFb'); assert pg.is_disabled('#nextBtn')
        pg.fill('#chB','17'); pg.click('#chBCheck')
        shot(pg,f'{W}_04'); nxt(pg,'calc')
        # 5 Fichas
        for i in range(6): pg.click(f'#tiles .tile[data-i="{i}"]')
        shot(pg,f'{W}_05'); nxt(pg,'tiles')
        # 6 Clasificar (una incorrecta)
        pg.click('.cardx[data-c="2"]'); pg.click('.bin[data-b="f"]'); assert 'No corresponde' in pg.inner_text('#binFb')
        for c,bn in enumerate('fplfplpf'):
            pg.click(f'.cardx[data-c="{c}"]'); pg.click(f'.bin[data-b="{bn}"] h3')
        shot(pg,f'{W}_06'); nxt(pg,'bins')
        # 7 Veredicto por línea (una incorrecta)
        pg.click('#vlines .vline[data-i="1"] button[data-a="1"]'); assert 'Revisa' in pg.inner_text('#vlines .vline[data-i="1"] .vexp'); pg.wait_for_timeout(1900)
        for i,a in enumerate([1,0,0,0,0,1]): pg.click(f'#vlines .vline[data-i="{i}"] button[data-a="{a}"]')
        shot(pg,f'{W}_07'); nxt(pg,'vl')
        # 8 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200); assert pg.is_disabled('#nextBtn')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_08'); nxt(pg,'quiz2')
        # 9 Transferencia: ronda rápida (una incorrecta)
        for i,v in enumerate([0,0,0,1,0,0,1,0]):
            pg.click(f'#qf .btns button[data-v="{v}"]'); pg.wait_for_timeout(2400)
        print('  qf:',pg.inner_text('#qf h3')); shot(pg,f'{W}_09'); nxt(pg,'qf')
        # 10 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_10')
        assert pg.inner_text('#counter')=='Pantalla 10 de 10'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="3"]'); assert pg.inner_text('#counter')=='Pantalla 4 de 10'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

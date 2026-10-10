from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
def choose(pg,key,wrong,right):
    for w in wrong:
        pg.click(f'[data-choice={key}] [data-opt={w}]')
        assert 'Consecuencia' in pg.inner_text(f'.slide.active [data-choice={key}] + .fb'),key+w
        assert pg.is_disabled('#nextBtn')
        pg.click(f'.slide.active [data-choice={key}] + .fb .retry')
    pg.click(f'[data-choice={key}] [data-opt={right}]')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        assert pg.inner_text('#counter')=='Pantalla 1 de 11'
        # 1 Inicio: mensajes en el celular + decisión (dos errores y reintento)
        assert pg.is_disabled('#nextBtn')
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
        assert pg.eval_on_selector_all('#threadBody .bubble','e=>e.length')==3
        choose(pg,'hook',['A','C'],'B')
        assert 'Correcto' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(60)
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Pestañas: tres familias
        assert pg.is_disabled('#nextBtn')
        pg.click('#tabs .tab[data-t="1"]'); assert pg.is_disabled('#nextBtn')
        pg.click('#tabs .tab[data-t="2"]'); assert pg.inner_text('#tabTick')=='3 / 3'
        shot(pg,f'{W}_03'); nxt(pg,'tabs')
        # 4 Parejas (una incorrecta)
        assert pg.is_disabled('#nextBtn')
        pg.click('.pr[data-i="0"]'); assert 'Primero elige' in pg.inner_text('#prFb')
        pg.click('.pl[data-i="0"]'); pg.click('.pr[data-i="2"]'); assert 'No corresponde' in pg.inner_text('#prFb')
        for i in range(6): pg.click(f'.pl[data-i="{i}"]'); pg.click(f'.pr[data-i="{i}"]')
        assert pg.inner_text('#prTick')=='6 / 6'
        shot(pg,f'{W}_04'); nxt(pg,'pairs')
        # 5 Cadena del cierre
        assert pg.is_disabled('#nextBtn')
        for k in range(6): pg.click(f'#dayline .dseg[data-k="{k}"]')
        assert pg.inner_text('#dayTick')=='6 / 6' and '10 días hábiles' in pg.inner_text('#dayline')
        shot(pg,f'{W}_05'); nxt(pg,'day')
        # 6 Tarjetas
        assert pg.is_disabled('#nextBtn')
        flips=pg.query_selector_all('.slide.active .flip')
        assert len(flips)==5
        for f in flips: f.click(); pg.wait_for_timeout(80)
        assert pg.inner_text('#fcTick')=='5 / 5'
        shot(pg,f'{W}_06'); nxt(pg,'cards')
        # 7 Caso: desvinculación
        assert pg.is_disabled('#nextBtn')
        choose(pg,'caso1',['A','C'],'B'); pg.wait_for_selector('#caso1b:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        choose(pg,'caso1b',['A','B'],'C')
        shot(pg,f'{W}_07'); nxt(pg,'caso')
        # 8 Caso: plazo fijo y renuncia
        assert pg.is_disabled('#nextBtn')
        choose(pg,'caso2',['B','C'],'A'); pg.wait_for_selector('#caso2b:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        choose(pg,'caso2b',['A'],'C')
        shot(pg,f'{W}_08'); nxt(pg,'caso2')
        # 9 Comprobación: reprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); assert 'Aún no' in pg.inner_text('#qcard h3')
        nxt(pg,'quiz')
        # 10 Transferencia bloqueada sin aprobar
        pg.wait_for_timeout(200)
        yn=[1,0,1,1,1]  # la primera respuesta es incorrecta
        for i,it in enumerate(pg.query_selector_all('#ynList .yn-item')): it.query_selector(f'button[data-a="{yn[i]}"]').click()
        assert '✕' in pg.inner_text('#ynList .yn-item:first-child .exp')
        pg.click('#modelBtn'); assert pg.is_disabled('#nextBtn'), 'debería exigir pass'
        assert '80%' in pg.inner_text('#gateMsg')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        assert pg.inner_text('#counter')=='Pantalla 9 de 11'
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); assert 'Aprobado' in pg.inner_text('#qcard h3')
        shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        assert not pg.is_disabled('#nextBtn')
        shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%' and pg.inner_text('#fEsc')=='0 / 5'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="4"]'); assert pg.inner_text('#counter')=='Pantalla 5 de 11'
        assert not pg.is_disabled('#nextBtn')
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

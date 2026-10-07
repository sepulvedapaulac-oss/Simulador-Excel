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
ORD=['Francisca presenta','Personas registra','La jefatura y Personas','La empresa responde','Si hay acuerdo','Si no hubo']
CLOZE={'z1':'15 días','z2':'te ofrecemos otra fórmula','z3':'recibes proveedores en sitio','z4':'la empresa','z5':'un anexo al contrato','z6':'ir a la Inspección del Trabajo'}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        # 1 Inicio: chat + decisión
        assert pg.is_disabled('#nextBtn')
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=8000)
        assert pg.locator('#threadBody .bubble').count()==5
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Ordenar (primero un intento incorrecto)
        pg.click('#orderCheck'); assert 'Aún no' in pg.inner_text('#orderFb'); assert pg.is_disabled('#nextBtn')
        for i in range(6):
            txt=pg.eval_on_selector_all('#order li span:nth-child(2)','e=>e.map(x=>x.textContent)')
            j=[n for n,t in enumerate(txt) if t.startswith(ORD[i])][0]
            for m in range(j,i,-1): pg.click(f'#order [data-u="{m}"]')
        pg.click('#orderCheck'); assert 'correcta' in pg.inner_text('#orderFb'); shot(pg,f'{W}_03'); nxt(pg,'order')
        # 4 Interruptores: intento incompleto y luego correcto
        pg.click('#slip36 .toggle-row[data-i="2"] .sw'); pg.click('#slip36 .toggle-row[data-i="0"] .sw'); pg.click('#tgCheck')
        print('  tog wrong:',pg.inner_text('#tgFb strong')); assert pg.is_disabled('#nextBtn')
        pg.click('#slip36 .toggle-row[data-i="0"] .sw'); pg.click('#slip36 .toggle-row[data-i="3"] .sw'); pg.click('#slip36 .toggle-row[data-i="4"] .sw'); pg.click('#tgCheck')
        print('  tog ok:',pg.inner_text('#tgFb strong')); shot(pg,f'{W}_04'); nxt(pg,'tog')
        # 5 Plazo
        pg.fill('#cDate','2026-03-10'); pg.dispatch_event('#cDate','input')
        pg.click('#cOpts .chip2[data-n="30"]'); assert 'feriado' in pg.inner_text('#cFb')
        pg.click('#cOpts .chip2[data-n="15"]'); print('  calc1:',pg.inner_text('#cFb strong'))
        assert pg.is_disabled('#nextBtn')
        rng(pg,'#cDays',17); print('  sema17:',pg.inner_text('#cSt'))
        rng(pg,'#cDays',12); print('  sema12:',pg.inner_text('#cSt'),'|',pg.inner_text('#cTx'))
        pg.click('#cQopts .chip2[data-v="0"]'); assert 'Revisa' in pg.inner_text('#cQfb')
        pg.click('#cQopts .chip2[data-v="1"]'); shot(pg,f'{W}_05'); nxt(pg,'calc')
        # 6 Comparador
        assert pg.is_disabled('#nextBtn')
        rng(pg,'#cmpR',50); assert pg.is_disabled('#nextBtn'); rng(pg,'#cmpR',5)
        shot(pg,f'{W}_06'); nxt(pg,'cmp')
        # 7 Caso: dos decisiones con un error
        pg.click('[data-choice=caso1] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso1] [data-opt=A]')
        pg.click('[data-choice=caso2c] [data-opt=C]'); shot(pg,f'{W}_07'); nxt(pg,'caso')
        # 8 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200)
        for k,v in CLOZE.items(): pg.select_option('#'+k,v)
        pg.click('#zCheck'); assert pg.is_disabled('#nextBtn'),'transferencia no exige pass'
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [2,0,3,1,2]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_08'); nxt(pg,'quiz2')
        # 9 Transferencia: plantilla (un error y luego correcto)
        pg.select_option('#z4','la persona trabajadora'); pg.click('#zCheck'); assert '5 de 6' in pg.inner_text('#zFb')
        pg.select_option('#z4','la empresa'); pg.click('#zCheck'); assert 'completa' in pg.inner_text('#zFb')
        shot(pg,f'{W}_09'); nxt(pg,'cloze')
        # 10 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_10')
        assert pg.inner_text('#counter')=='Pantalla 10 de 10'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="4"]'); assert pg.inner_text('#counter')=='Pantalla 5 de 10'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

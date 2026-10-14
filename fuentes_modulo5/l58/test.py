from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
def overflow(pg,W):
    return pg.evaluate('''(W)=>{const s=document.querySelector('.slide.active');const bad=[];
      s.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&e.offsetParent&&r.right>W+1)bad.push(e.tagName+'.'+e.className+' '+Math.round(r.right))});return bad.slice(0,5)}''',W)
TOG_OFF=[1,2,3]                 # respaldos que faltan
TBL=[1,0,0,1,4,3,2]             # índice del plazo correcto por fila
YN=[0,1,1,1,0]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        def chk(n):
            o=overflow(pg,W); assert not o,(n,o)
        # 1 Inicio: etiqueta despegable + decisión (dos errores y acierto)
        assert pg.is_disabled('#nextBtn')
        pg.click('#sticker'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=4000)
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert 'Buena decisión' in pg.inner_text('.slide.active .fb')
        chk('01');shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(80)
        chk('02');shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Hotspots: bloqueado hasta explorar los cuatro
        for k in range(3): pg.click(f'.hs[data-hs="{k}"]')
        assert pg.is_disabled('#nextBtn'),'hotspots incompletos no deberían avanzar'
        pg.click('.hs[data-hs="3"]'); assert 'Acceso' in pg.inner_text('#hsPanel'); assert pg.inner_text('#hsTick')=='4 / 4'
        chk('03');shot(pg,f'{W}_03'); nxt(pg,'hs')
        # 4 Fichas: bloqueado hasta descubrir las siete
        tiles=pg.query_selector_all('#tiles .tile')
        for t in tiles[:6]: t.click()
        assert pg.is_disabled('#nextBtn'),'fichas incompletas no deberían avanzar'
        tiles[6].click(); assert 'Finiquito' in pg.inner_text('#tlPanel'); assert pg.inner_text('#tlTick')=='7 / 7'
        chk('04');shot(pg,f'{W}_04'); nxt(pg,'tiles')
        # 5 Parejas (sin selección, luego pareja errónea, luego todas)
        pg.click('.pr[data-i="0"]'); assert 'Primero' in pg.inner_text('#prFb')
        pg.click('.pl[data-i="0"]'); pg.click('.pr[data-i="1"]'); assert 'No es' in pg.inner_text('#prFb'); assert pg.is_disabled('#nextBtn')
        for i in range(6): pg.click(f'.pl[data-i="{i}"]'); pg.click(f'.pr[data-i="{i}"]')
        assert pg.inner_text('#prTick')=='6 / 6'
        chk('05');shot(pg,f'{W}_05'); nxt(pg,'pairs')
        # 6 Interruptores: revisar sin cambios (falla), luego marcar lo que falta
        pg.click('#tgCheck'); assert '4 de 7' in pg.inner_text('#tgFb'); assert pg.is_disabled('#nextBtn')
        rows=pg.query_selector_all('#expList .exp-row')
        rows[0].query_selector('.sw').click(); pg.click('#tgCheck'); assert '3 de 7' in pg.inner_text('#tgFb')
        rows[0].query_selector('.sw').click()
        for i in TOG_OFF: rows[i].query_selector('.sw').click()
        pg.click('#tgCheck'); assert 'Expediente revisado' in pg.inner_text('#tgFb')
        chk('06');shot(pg,f'{W}_06'); nxt(pg,'tog')
        # 7 Tabla de plazos: confundir prescripción con 60 días hábiles (falla), luego corregir
        sels=pg.query_selector_all('#seltable select')
        for s,v in zip(sels,TBL): s.select_option(str(v))
        sels[5].select_option('2'); pg.click('#tblCheck'); assert '6 de 7' in pg.inner_text('#tblFb'); assert pg.is_disabled('#nextBtn')
        sels[5].select_option('3'); pg.click('#tblCheck'); assert 'Todo correcto' in pg.inner_text('#tblFb')
        chk('07');shot(pg,f'{W}_07'); nxt(pg,'tbl')
        # 8 Caso: dos decisiones ramificadas
        pg.click('[data-choice=caso1] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=C]'); pg.wait_for_selector('#caso2:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2] [data-opt=B]'); pg.click('#caso2 .retry'); pg.click('[data-choice=caso2] [data-opt=C]'); pg.click('#caso2 .retry')
        pg.click('[data-choice=caso2] [data-opt=A]')
        chk('08');shot(pg,f'{W}_08'); nxt(pg,'caso')
        # 9 Comprobación: reprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        # 10 Transferencia (error, checklist, modelo; bloqueada sin pass)
        pg.wait_for_timeout(200)
        items=pg.query_selector_all('#ynList .yn-item')
        items[0].query_selector('button[data-a="1"]').click(); assert 'Vuelve a elegir' in items[0].inner_text()
        for it,a in zip(items,YN): it.query_selector(f'button[data-a="{a}"]').click()
        pg.click('#modelBtn'); assert pg.is_visible('#model')
        pg.fill('#ownCase','Los cambios de turno se acuerdan por chat.')
        assert pg.is_disabled('#nextBtn'),'transferencia debería exigir pass'
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,3,0,2,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); chk('09');shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        chk('10');shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); chk('11');shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="6"]'); assert pg.inner_text('#counter')=='Pantalla 7 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

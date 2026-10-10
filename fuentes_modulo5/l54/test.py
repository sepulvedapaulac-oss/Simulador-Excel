from playwright.sync_api import sync_playwright
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
URL='file://'+os.path.abspath('out/Leccion.html');os.makedirs('cap',exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOCKED at {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'cap/t_{n}.png',full_page=True)
def blocked(pg): assert pg.is_disabled('#nextBtn'),'debería estar bloqueado'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        # 1 Inicio: dos versiones de la carta + decisión
        blocked(pg)
        vs=pg.query_selector_all('#versions .version'); assert len(vs)==2
        vs[0].click(); assert pg.is_hidden('#hookQ'); vs[1].click(); pg.wait_for_selector('#hookQ:not([hidden])')
        pg.click('[data-choice=hook] [data-opt=A]'); assert '454' in pg.inner_text('.slide.active .fb'); blocked(pg)
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'no invalidan' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        blocked(pg)
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Carta línea a línea (primer intento con un error)
        blocked(pg)
        rows=pg.query_selector_all('#carta .toggle-row'); assert len(rows)==7
        for i in (0,1,3,6): rows[i].query_selector('.sw').click()   # la 3 (índice 3) está mal: debería quedar en "Falta"
        pg.click('#tgCheck'); print('  tog 1:',pg.inner_text('#tgTick')); assert pg.inner_text('#tgTick')=='6 / 7'; blocked(pg)
        rows[3].query_selector('.sw').click(); pg.click('#tgCheck'); print('  tog 2:',pg.inner_text('#tgTick')); assert pg.inner_text('#tgTick')=='7 / 7'
        shot(pg,f'{W}_03'); nxt(pg,'tog')
        # 4 Copia a la Inspección en el celular
        blocked(pg)
        pg.click('#phone [data-m="fin"]'); assert 'finiquito' in pg.inner_text('#phoneFb'); blocked(pg)
        pg.click('#phone [data-m="term"]')
        pg.click('#p30'); assert 'aviso previo' in pg.inner_text('#phoneFb'); blocked(pg)
        pg.click('#p3'); pg.click('#pDrop'); assert 'comprobante' in pg.inner_text('#phoneFb').lower(); blocked(pg)
        pg.click('#pKeep'); assert 'Carpeta' in pg.inner_text('#phone')
        shot(pg,f'{W}_04'); nxt(pg,'phone')
        # 5 Evidencias + decisión
        blocked(pg)
        for k in range(4): pg.click(f'#evline .evnode[data-k="{k}"]')
        pg.wait_for_selector('#audQ:not([hidden])')
        pg.click('[data-choice=aud] [data-opt=A]'); blocked(pg); pg.click('.slide.active .retry')
        pg.click('[data-choice=aud] [data-opt=C]')
        shot(pg,f'{W}_05'); nxt(pg,'aud')
        # 6 Ronda rápida (una incorrecta)
        blocked(pg)
        ans=[1,1,0,0,1,0,1,0]
        for i,a in enumerate(ans):
            v=a if i!=2 else 1   # la tercera se responde mal a propósito
            pg.click(f'#qf .btns button[data-v="{v}"]'); pg.wait_for_timeout(1750)
        print('  qf:',pg.inner_text('#qf h3')); assert '7 de 8' in pg.inner_text('#qf h3')
        shot(pg,f'{W}_06'); nxt(pg,'qf')
        # 7 Caso: antes de enviar
        blocked(pg)
        pg.click('[data-choice=casoA] [data-opt=A]'); assert 'no produce' in pg.inner_text('.slide.active .fb'); blocked(pg); pg.click('.slide.active .retry')
        pg.click('[data-choice=casoA] [data-opt=C]'); pg.wait_for_selector('#casoPh2:not([hidden])')
        pg.click('[data-choice=casoB] [data-opt=C]'); blocked(pg); pg.click('#casoPh2 .retry')
        pg.click('[data-choice=casoB] [data-opt=B]')
        shot(pg,f'{W}_07'); nxt(pg,'caso')
        # 8 Caso: convalidar
        blocked(pg)
        pg.click('[data-choice=casoC] [data-opt=A]'); pg.wait_for_selector('#casoPh4:not([hidden])')
        pg.click('[data-choice=casoD] [data-opt=A]'); blocked(pg); pg.click('#casoPh4 .retry')
        pg.click('[data-choice=casoD] [data-opt=B]')
        shot(pg,f'{W}_08'); nxt(pg,'caso2')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,1,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200); blocked(pg)
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        # 10 Transferencia: Sí/No + respuesta modelo
        blocked(pg)
        items=pg.query_selector_all('#ynList .yn-item'); assert len(items)==5
        items[0].query_selector('button[data-a="0"]').click()  # incorrecta a propósito
        assert '✕' in items[0].inner_text()
        for i,a in [(1,1),(2,1),(3,0),(4,0)]: items[i].query_selector(f'button[data-a="{a}"]').click()
        blocked(pg); pg.click('#modelBtn'); assert pg.is_visible('#model')
        shot(pg,f'{W}_10'); nxt(pg,'yn')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="7"]'); assert pg.inner_text('#counter')=='Pantalla 8 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

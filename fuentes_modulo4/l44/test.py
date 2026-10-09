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
        # 1 Inicio: chat en el celular + decisión
        blocked(pg)
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=8000)
        assert 'auditoría' in pg.inner_text('#phone')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); blocked(pg)
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert pg.query_selector('#phone #reply')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        blocked(pg)
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Índice: interruptores (primer intento con un error)
        blocked(pg)
        rows=pg.query_selector_all('#idx .toggle-row'); assert len(rows)==7
        for i in (0,3,5,6): rows[i].query_selector('.sw').click()   # 6 (índice 6) mal: debería quedar en "Falta"
        pg.click('#tgCheck'); print('  tog 1:',pg.inner_text('#tgTick')); assert pg.inner_text('#tgTick')=='6 / 7'; blocked(pg)
        rows[6].query_selector('.sw').click(); pg.click('#tgCheck'); print('  tog 2:',pg.inner_text('#tgTick'))
        shot(pg,f'{W}_03'); nxt(pg,'tog')
        # 4 Intranet en el celular
        blocked(pg)
        pg.click('#phone2 [data-m="docs"]'); assert 'Revisa' in pg.inner_text('#phoneFb'); blocked(pg)
        pg.click('#phone2 [data-m="karin"]'); pg.click('#pRisk'); pg.click('#pHow')
        pg.click('#pBad'); assert 'carta formal' in pg.inner_text('#phoneFb'); blocked(pg)
        pg.click('#pGood'); assert 'acta' in pg.inner_text('#phone2')
        shot(pg,f'{W}_04'); nxt(pg,'phone')
        # 5 Evidencias + decisión de auditoría
        blocked(pg)
        for k in range(4): pg.click(f'#evline .evnode[data-k="{k}"]')
        pg.wait_for_selector('#audQ:not([hidden])')
        pg.click('[data-choice=aud] [data-opt=A]'); blocked(pg); pg.click('.slide.active .retry')
        pg.click('[data-choice=aud] [data-opt=C]')
        shot(pg,f'{W}_05'); nxt(pg,'aud')
        # 6 Tarjetas que se voltean
        blocked(pg)
        for c in pg.query_selector_all('.slide.active .flip'): c.click()
        assert pg.inner_text('#fcTick')=='6 / 6'
        shot(pg,f'{W}_06'); nxt(pg,'cards')
        # 7 Caso: plan de mejora
        blocked(pg)
        pg.click('[data-choice=casoA] [data-opt=C]'); blocked(pg); pg.click('.slide.active .retry')
        pg.click('[data-choice=casoA] [data-opt=B]'); pg.wait_for_selector('#casoPh2:not([hidden])')
        pg.click('[data-choice=casoB] [data-opt=C]')
        shot(pg,f'{W}_07'); nxt(pg,'caso')
        # 8 Caso: todo empleador
        blocked(pg)
        pg.click('[data-choice=casoC] [data-opt=A]'); pg.wait_for_selector('#casoPh4:not([hidden])')
        pg.click('[data-choice=casoD] [data-opt=A]'); blocked(pg); pg.click('#casoPh4 .retry')
        pg.click('[data-choice=casoD] [data-opt=B]')
        shot(pg,f'{W}_08'); nxt(pg,'caso2')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200); blocked(pg)
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        # 10 Transferencia: clasificar (una incorrecta primero)
        blocked(pg)
        pg.click('.cardx[data-c="1"]'); pg.click('.bin[data-b="1"]'); assert 'No corresponde' in pg.inner_text('#binFb')
        ans={0:1,1:0,2:1,3:0,4:1,5:1,6:0,7:1}
        for c,bn in ans.items(): pg.click(f'#pool .cardx[data-c="{c}"]'); pg.click(f'.bin[data-b="{bn}"] h3')
        assert pg.inner_text('#binTick')=='8 / 8'
        shot(pg,f'{W}_10'); nxt(pg,'bins')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="2"]'); assert pg.inner_text('#counter')=='Pantalla 3 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

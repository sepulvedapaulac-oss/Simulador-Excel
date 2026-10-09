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
        # 1 Inicio: reporte por revisar + decisión
        assert pg.is_disabled('#nextBtn')
        for f in pg.query_selector_all('#form .ffield'): f.click()
        pg.wait_for_selector('#hookQ:not([hidden])',timeout=4000)
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Correcto' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(80)
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Tabla con selectores: una incorrecta y corrección
        assert pg.is_disabled('#nextBtn')
        sels=pg.query_selector_all('#seltable select')
        for s,v in zip(sels,['0','1','0','3','4','2']): s.select_option(v)
        pg.click('#tblCheck'); print('  tbl 1:',pg.inner_text('#tblFb')[:20]); assert pg.is_disabled('#nextBtn')
        sels[2].select_option('2'); pg.click('#tblCheck'); print('  tbl 2:',pg.inner_text('#tblFb')[:20])
        shot(pg,f'{W}_03'); nxt(pg,'tbl')
        # 4 Árbol: un error con pista y luego los tres ejemplos
        assert pg.is_disabled('#nextBtn')
        pg.click('#tree .yn button[data-a="1"]'); assert 'Revisa' in pg.inner_text('#trFb')
        pg.click('#tree .yn button[data-a="0"]')
        for i,path in ((1,[1,0]),(2,[1,1,1])):
            pg.click(f'#exTabs .ex-tab[data-i="{i}"]')
            for a in path: pg.click(f'#tree .yn button[data-a="{a}"]')
        assert pg.inner_text('#trTick')=='3 / 3'; print('  tree:',pg.inner_text('#tree .tres')[:40])
        shot(pg,f'{W}_04'); nxt(pg,'tree')
        # 5 Tarjetas
        assert pg.is_disabled('#nextBtn')
        for c in pg.query_selector_all('.slide.active .flip'): c.click(); pg.wait_for_timeout(100)
        pg.wait_for_timeout(700); shot(pg,f'{W}_05'); nxt(pg,'cards')
        # 6 Verdadero o falso (primera incorrecta)
        assert pg.is_disabled('#nextBtn')
        for v in ['1','0','1','0','1']:
            pg.click(f'#tf .tf-btns button[data-v="{v}"]'); pg.click('#tfNext')
        print('  tf:',pg.inner_text('#tf .feedback strong')); shot(pg,f'{W}_06'); nxt(pg,'tf')
        # 7 Caso: dos decisiones (con errores y reintentos)
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso1] [data-opt=B]')
        pg.wait_for_selector('#caso2wrap:not([hidden])'); assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2] [data-opt=B]'); pg.click('#caso2wrap .retry'); pg.click('[data-choice=caso2] [data-opt=C]')
        shot(pg,f'{W}_07'); nxt(pg,'caso')
        # 8 Caso: dos semanas después
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso3] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso3] [data-opt=A]')
        shot(pg,f'{W}_08'); nxt(pg,'caso3')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200)
        # transferencia: orden correcto, pero bloqueada sin aprobar
        pg.click('#orderCheck'); assert 'Aún no' in pg.inner_text('#orderFb')
        # ordenar con burbuja usando los textos esperados
        ORDER=['Escuchar por separado','Revisar si hay agresión','Si es un conflicto','Acordar reglas','Registrar los acuerdos']
        for _ in range(10):
            texts=[li.inner_text() for li in pg.query_selector_all('#order li')]
            idx=[next(k for k,o in enumerate(ORDER) if o in t) for t in texts]
            sw=False
            for i in range(len(idx)-1):
                if idx[i]>idx[i+1]: pg.click(f'#order [data-d="{i}"]'); sw=True; break
            if not sw: break
        pg.click('#orderCheck'); assert 'correcta' in pg.inner_text('#orderFb')
        assert pg.is_disabled('#nextBtn'), 'transferencia no debe abrir sin aprobar'
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        # 10 Transferencia ya ordenada + aprobado
        shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="3"]'); assert pg.inner_text('#counter')=='Pantalla 4 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

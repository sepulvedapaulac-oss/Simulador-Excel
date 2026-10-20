from playwright.sync_api import sync_playwright
import glob,os
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
F='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'out/Leccion.html'))
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'shots');os.makedirs(SH,exist_ok=True)
def nxt(pg,label):
    assert not pg.is_disabled('#nextBtn'),f'BLOQUEADO en {label}: '+pg.inner_text('#gateMsg')
    pg.click('#nextBtn');pg.wait_for_timeout(250)
def quiz(pg,keys):
    for k in keys: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
def run(w,h,tag):
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    pg=b.new_page(viewport={'width':w,'height':h});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(500)
    # 1 Inicio
    assert pg.is_disabled('#nextBtn')
    pg.click('#pOpen');pg.click('#pResp')
    pg.click('[data-choice=hook] [data-opt=A]');assert pg.is_disabled('#nextBtn')
    pg.click('.slide.active .retry');pg.click('[data-choice=hook] [data-opt=B]')
    pg.screenshot(path=f'{SH}/{tag}_01.png',full_page=True);nxt(pg,'hook')
    # 2 Video
    for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
    pg.screenshot(path=f'{SH}/{tag}_02.png',full_page=True);nxt(pg,'video')
    # 3 Acordeón
    for h_ in pg.query_selector_all('#acc .acc-head'): h_.click()
    pg.screenshot(path=f'{SH}/{tag}_03.png',full_page=True);nxt(pg,'acc')
    # 4 Fichas
    for t in pg.query_selector_all('#tiles .tile'): t.click()
    pg.screenshot(path=f'{SH}/{tag}_04.png',full_page=True);nxt(pg,'tiles')
    # 5 Flujo (con un error)
    sol=[1,2,2,0,2]
    pg.click('#flow .node[data-i="0"] .fopts button[data-k="0"]');print('  flujo error:',pg.inner_text('#flFb')[:40].replace('\n',' '))
    assert pg.is_disabled('#nextBtn')
    for i,c in enumerate(sol):
        if not pg.is_visible(f'#flow .node[data-i="{i}"] .fopts'): pg.click(f'#flow .node[data-i="{i}"] .q')
        pg.click(f'#flow .node[data-i="{i}"] .fopts button[data-k="{c}"]')
    pg.screenshot(path=f'{SH}/{tag}_05.png',full_page=True);nxt(pg,'flujo')
    # 6 Interruptores (primero incompleto)
    bad=[2,3,6,7];rows=pg.query_selector_all('#mail .toggle-row')
    for i in [2,3]: rows[i].query_selector('.sw').click()
    pg.click('#mailCheck');print('  tog parcial:',pg.inner_text('#mailFb')[:40]);assert pg.is_disabled('#nextBtn')
    for i in [6,7]: rows[i].query_selector('.sw').click()
    pg.click('#mailCheck');pg.screenshot(path=f'{SH}/{tag}_06.png',full_page=True);nxt(pg,'tog')
    # 7 Tabla
    ans=[0,2,0,1,1];sels=pg.query_selector_all('#seltable select')
    for i,s in enumerate(sels): s.select_option(str(ans[i] if i!=3 else 0))
    pg.click('#tblCheck');print('  tbl:',pg.inner_text('#tblFb')[:20]);assert pg.is_disabled('#nextBtn')
    sels[3].select_option('1');pg.click('#tblCheck');pg.screenshot(path=f'{SH}/{tag}_07.png',full_page=True);nxt(pg,'tbl')
    # 8 Quiz: reprobar y luego aprobar
    quiz(pg,[0,0,0,3,1]);print('  quiz 1:',pg.inner_text('#qcard h3'))
    nxt(pg,'quiz')  # gate quiz cumplido aunque reprobado
    pg.click('[data-choice=trans] [data-opt=B]');
    for i in [0,2,3,5]: pg.click(f'#just .doc[data-i="{i}"]')
    pg.click('#justCheck')
    assert pg.is_disabled('#nextBtn'),'transferencia sin pass no debe avanzar'
    print('  gate sin pass:',pg.inner_text('#gateMsg'))
    pg.click('#toQuiz');quiz(pg,[1,2,0,3,1]);print('  quiz 2:',pg.inner_text('#qcard h3'))
    pg.screenshot(path=f'{SH}/{tag}_08.png',full_page=True);nxt(pg,'quiz2')
    pg.screenshot(path=f'{SH}/{tag}_09.png',full_page=True);nxt(pg,'trans')
    # 10 Final
    pg.screenshot(path=f'{SH}/{tag}_10.png',full_page=True)
    print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc'))
    assert pg.inner_text('#fPct')=='100%'
    assert all(not b_.is_disabled() for b_ in pg.query_selector_all('.topic-link')),'navegación no libre'
    pg.click('[data-goto="4"]');assert 'Pantalla 5' in pg.inner_text('#counter')
    sw=pg.evaluate('document.documentElement.scrollWidth');assert sw<=w,sw
    assert not errs,errs
    b.close()
run(1366,900,'d');run(375,800,'m')
print('RECORRIDO OK')

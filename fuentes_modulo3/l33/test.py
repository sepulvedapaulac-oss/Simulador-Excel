from playwright.sync_api import sync_playwright
import glob,os
D=os.path.dirname(os.path.abspath(__file__));F='file://'+D+'/out/Leccion.html';os.makedirs(D+'/cap',exist_ok=True)
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
def nxt(pg,label):
    if pg.is_disabled('#nextBtn'): raise SystemExit(f'BLOCKED at {label} | {pg.inner_text("#gateMsg")}')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def shot(pg,n): pg.screenshot(path=f'{D}/cap/t_{n}.png',full_page=True)
def run(w,h,tag):
    pg=b.new_page(viewport={'width':w,'height':h}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F); pg.wait_for_timeout(500)
    assert pg.is_disabled('#nextBtn'),'inicio no bloqueado'
    pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
    pg.click('[data-choice=hook] [data-opt=A]'); assert pg.is_disabled('#nextBtn')
    pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); shot(pg,tag+'01'); nxt(pg,'hook')
    for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
    shot(pg,tag+'02'); nxt(pg,'video')
    for k in range(6): pg.click(f'.slide.active [data-k="{k}"]')
    shot(pg,tag+'03'); nxt(pg,'day')
    pg.fill('#fmEnd','2027-01-10'); print('  fmOut:',pg.inner_text('#fmOut')[:40])
    pg.fill('#fmAns','2028-07-07'); pg.click('#fmCheck'); print('  calcA wrong:',pg.inner_text('#fmFb')[:35])
    pg.fill('#fmAns','2028-04-14'); pg.click('#fmCheck')
    pg.fill('#fpW','8'); pg.dispatch_event('#fpW','input'); print('  fpOut:',pg.inner_text('#fpOut')[:50])
    pg.fill('#fpAns','6'); pg.click('#fpCheck'); print('  calcB wrong:',pg.inner_text('#fpFb')[:20])
    pg.fill('#fpAns','12'); pg.click('#fpCheck'); shot(pg,tag+'04'); nxt(pg,'calc')
    pg.click('.pl[data-i="0"]'); pg.click('.pr[data-i="1"]'); print('  pair wrong:',pg.inner_text('#prFb')[:20])
    for i in range(5): pg.click(f'.pl[data-i="{i}"]'); pg.click(f'.pr[data-i="{i}"]')
    shot(pg,tag+'05'); nxt(pg,'pairs')
    ans=[1,0,0,1,1]
    for a in ans: pg.click(f'#tf .tf-btns button[data-v="{a}"]'); pg.click('#tfNext')
    print('  tf:',pg.inner_text('#tf .feedback strong')); pg.click('#tfAgain')
    for a in [0,0,0,1,1]: pg.click(f'#tf .tf-btns button[data-v="{a}"]'); pg.click('#tfNext')
    shot(pg,tag+'06'); nxt(pg,'tf')
    pg.click('[data-choice=caso1] [data-opt=A]'); pg.click('.slide.active .retry'); pg.click('[data-choice=caso1] [data-opt=C]')
    pg.click('[data-choice=caso2c] [data-opt=C]'); pg.click('#caso2 .retry'); pg.click('[data-choice=caso2c] [data-opt=A]'); shot(pg,tag+'07'); nxt(pg,'caso')
    def quiz(keys):
        for k in keys: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
    quiz([0,0,0,0,0]); print('  quiz 1:',pg.inner_text('#qcard h3'))
    nxt(pg,'quiz-fail-next')
    for _ in range(8):
        pg.click('#pool .cardx'); c=int(pg.get_attribute('.cardx.sel','data-c')); pg.click(f'.bin[data-b="{[0,0,1,1,2,2,3,3][c]}"] h3')
    assert pg.is_disabled('#nextBtn'),'transferencia sin pass debería bloquear'; print('  gate sin pass:',pg.inner_text('#gateMsg'))
    pg.click('#toQuiz'); pg.wait_for_timeout(300)
    quiz([1,2,0,3,1]); print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,tag+'08'); nxt(pg,'quiz')
    shot(pg,tag+'09'); nxt(pg,'bins')
    shot(pg,tag+'10')
    fin=(pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc'))
    print(' ',tag,'final:',fin)
    assert fin[1]=='100%'
    assert fin[2]=='0 / 4'  # todas las decisiones se fallaron a propósito al primer intento
    if w<900: pg.click('#routeBtn')
    pg.click('#topicList .topic-link[data-go="3"]'); assert 'Pantalla 4' in pg.inner_text('#counter'),'nav no libre'
    if w<900: pg.click('#routeBtn')
    pg.click('#topicList .topic-link[data-go="7"]'); assert not pg.is_disabled('#nextBtn')
    assert pg.evaluate('document.documentElement.scrollWidth')<=w+1,'desborde horizontal'
    assert not errs,errs
    pg.close()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    run(1366,900,'d'); run(375,800,'m')
    b.close()
print('RECORRIDO OK')

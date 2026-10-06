from playwright.sync_api import sync_playwright
import glob, os
HERE=os.path.dirname(os.path.abspath(__file__))
URL='file://'+os.path.join(HERE,'out','Leccion.html')
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
os.makedirs(os.path.join(HERE,'shots'),exist_ok=True)
def shot(pg,n): pg.screenshot(path=os.path.join(HERE,'shots',n+'.png'),full_page=True)
def nxt(pg,label):
    if pg.is_disabled('#nextBtn'):
        raise SystemExit(f'BLOQUEADO en {label}: {pg.inner_text("#gateMsg")}')
    pg.click('#nextBtn'); pg.wait_for_timeout(250)
def locked(pg): return pg.is_disabled('#nextBtn')
def quiz(pg,keys):
    for k in keys: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')

def run(w,h,tag,shots=True):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=exe)
        pg=b.new_page(viewport={'width':w,'height':h}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(300)
        # 1 Inicio
        assert locked(pg)
        pg.click('#sticker'); pg.wait_for_timeout(700)
        pg.click('[data-choice=hook] [data-opt=A]'); print('  hook incorrecta:',pg.inner_text('.slide.active .fb')[:45].replace('\n',' '))
        assert locked(pg)
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]')
        if shots: shot(pg,f'{tag}_01')
        nxt(pg,'hook')
        # 2 Video
        assert locked(pg)
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(120)
        if shots: shot(pg,f'{tag}_02')
        nxt(pg,'video')
        # 3 Cloze + chips
        pg.select_option('#z1','preferencias'); pg.select_option('#z2','mejoren'); pg.select_option('#z3','oportunidades o de trato'); pg.click('#zCheck')
        print('  cloze parcial:',pg.inner_text('#zFb')[:20]); assert locked(pg)
        pg.select_option('#z2','anulen o alteren'); pg.click('#zCheck')
        assert locked(pg)
        for i in range(6): pg.click(f'#exChips .chip2[data-k="{i}"]')
        if shots: shot(pg,f'{tag}_03')
        nxt(pg,'cloze ex')
        # 4 Ronda rápida (una incorrecta)
        ans=[0,1,0,1,0,1,0,0]; ans_try=ans[:]; ans_try[0]=1
        for a in ans_try: pg.click(f'#qf .btns button[data-v="{a}"]'); pg.wait_for_timeout(2300)
        print('  qf:',pg.inner_text('#qf')[:60].replace('\n',' '))
        if shots: shot(pg,f'{tag}_04')
        nxt(pg,'qf')
        # 5 Comparador
        assert locked(pg)
        pg.fill('#cmpR','50'); pg.dispatch_event('#cmpR','input')
        if shots: shot(pg,f'{tag}_05a')
        assert locked(pg)
        pg.fill('#cmpR','5'); pg.dispatch_event('#cmpR','input')
        if shots: shot(pg,f'{tag}_05')
        nxt(pg,'cmp')
        # 6 Pestañas
        assert locked(pg)
        for i in range(1,4):
            pg.click(f'#tabs .tab[data-t="{i}"]')
            if shots: shot(pg,f'{tag}_06_{i}')
        nxt(pg,'tabs')
        # 7 Veredicto por línea (uno incorrecto primero)
        vl=[1,0,1,1,0,0]
        lines=pg.query_selector_all('#vlines .vline')
        lines[1].query_selector('button[data-a="1"]').click(); print('  vl incorrecta:',lines[1].inner_text()[-60:].replace('\n',' ')); pg.wait_for_timeout(2100)
        for i,l in enumerate(lines): l.query_selector(f'button[data-a="{vl[i]}"]').click()
        if shots: shot(pg,f'{tag}_07')
        nxt(pg,'vl')
        # 8 Comprobación: reprobar y luego aprobar
        quiz(pg,[0,0,0,0,0]); print('  quiz 1:',pg.inner_text('#qcard h3'))
        pg.click('#qRetry'); quiz(pg,[1,2,0,3,1]); print('  quiz 2:',pg.inner_text('#qcard h3'))
        if shots: shot(pg,f'{tag}_08')
        nxt(pg,'quiz')
        # 9 Transferencia: ordenar (primero mal)
        pg.click('#orderCheck'); print('  orden inicial:',pg.inner_text('#orderFb')[:30]); assert locked(pg)
        cur=[2,4,0,3,1]
        for target in range(5):
            pos=cur.index(target)
            while pos>target:
                pg.click(f'#order [data-u="{pos}"]'); cur[pos-1],cur[pos]=cur[pos],cur[pos-1]; pos-=1
        pg.click('#orderCheck'); print('  orden:',pg.inner_text('#orderFb')[:22])
        if shots: shot(pg,f'{tag}_09')
        nxt(pg,'order pass')
        # 10 Finalización
        print('  final:',pg.inner_text('#counter'),'|',pg.inner_text('#fPct'),'|',pg.inner_text('#fEsc'))
        if shots: shot(pg,f'{tag}_10')
        # navegación libre
        links=pg.query_selector_all('#topicList .topic-link, #topicList button')
        pg.click('[data-goto="3"]'); pg.wait_for_timeout(200); c1=pg.inner_text('#counter')
        pg.evaluate("document.querySelectorAll('#topicList button')[1].click()"); pg.wait_for_timeout(200); c2=pg.inner_text('#counter')
        print('  navegación libre:',c1,'|',c2,'|',pg.inner_text('#navMode'))
        assert 'Pantalla 4' in c1 and 'Pantalla 2' in c2
        sw=pg.evaluate('document.documentElement.scrollWidth')
        print(f'  [{tag}] scrollWidth={sw} errores JS={errs}')
        assert not errs and sw<=w
        b.close()

print('Escritorio 1366'); run(1366,900,'d')
print('Celular 375'); run(375,812,'m')
print('RECORRIDO OK')

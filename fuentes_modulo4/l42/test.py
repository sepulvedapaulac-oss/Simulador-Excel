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
      s.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&(r.right>W+1||e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX==='visible'&&e.tagName!=='SELECT'&&e.clientWidth>0))bad.push(e.tagName+'.'+e.className+' '+Math.round(r.right))});return bad.slice(0,5)}''',W)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        def chk(n):
            o=overflow(pg,W)
            if o: print('  overflow',n,o)
        # 1 Inicio: etiquetas despegables + decisión
        assert pg.is_disabled('#nextBtn')
        for i in range(3):
            assert pg.is_hidden('#hookQ'); pg.click(f'.sticker[data-st="{i}"]')
        pg.wait_for_selector('#hookQ:not([hidden])',timeout=4000)
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]')
        chk('01');shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(80)
        chk('02');shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Completar definiciones: primero con un error
        assert pg.is_disabled('#nextBtn')
        ans={'z1':'trabajadores','z2':'al menos tres veces','z3':'humillación','z4':'no consentidos','z5':'con ocasión','z6':'clientes'}
        for k,v in ans.items(): pg.select_option('#'+k,label=v)
        pg.click('#zCheck'); print('  cloze 1:',pg.inner_text('#zFb')[:30]); assert pg.is_disabled('#nextBtn')
        pg.select_option('#z2',label='una sola vez'); pg.click('#zCheck'); print('  cloze 2:',pg.inner_text('#zFb')[:30])
        chk('03');shot(pg,f'{W}_03'); nxt(pg,'cloze')
        # 4 Parejas (una incorrecta)
        assert pg.is_disabled('#nextBtn')
        pg.click('.pl[data-i="0"]'); pg.click('.pr[data-i="1"]'); assert 'No corresponde' in pg.inner_text('#prFb')
        for i in range(5): pg.click(f'.pl[data-i="{i}"]'); pg.click(f'.pr[data-i="{i}"]')
        assert pg.inner_text('#prTick')=='5 / 5'
        chk('04');shot(pg,f'{W}_04'); nxt(pg,'pairs')
        # 5 Pestañas
        assert pg.is_disabled('#nextBtn')
        for t in (1,2): pg.click(f'#tabs .tab[data-t="{t}"]'); chk(f'05_{t}')
        shot(pg,f'{W}_05'); nxt(pg,'tabs')
        # 6 Ronda rápida (primera incorrecta)
        assert pg.is_disabled('#nextBtn')
        sol=[0,2,1,2,0,1,2,0]
        for i,v in enumerate(sol):
            pg.click(f'#qf .btns button[data-v="{(v+1)%3 if i==0 else v}"]'); pg.wait_for_timeout(1600)
        print('  qf:',pg.inner_text('#qf h3')); chk('06');shot(pg,f'{W}_06'); nxt(pg,'qf')
        # 7 Veredicto por reporte (primera incorrecta)
        assert pg.is_disabled('#nextBtn')
        lines=pg.query_selector_all('#vlines .vline')
        lines[0].query_selector('button[data-a="3"]').click(); pg.wait_for_timeout(1900)
        for i,a in enumerate([0,1,2,3]): lines[i].query_selector(f'button[data-a="{a}"]').click()
        assert pg.inner_text('#vlTick')=='4 / 4'
        chk('07');shot(pg,f'{W}_07'); nxt(pg,'vl')
        # 8 Decisión "una sola vez"
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=caso] [data-opt=B]'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso] [data-opt=C]'); chk('08');shot(pg,f'{W}_08'); nxt(pg,'caso')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200)
        # Transferencia completa pero bloqueada sin pass
        pg.click('.cardx[data-c="0"]'); pg.click('.bin[data-b="1"]'); assert 'No corresponde' in pg.inner_text('#binFb')
        for c in range(8):
            pg.click(f'.cardx[data-c="{c}"]'); pg.click(f'.bin[data-b="{[0,0,1,1,2,2,3,3][c]}"]')
        assert pg.inner_text('#binTick')=='8 / 8'
        assert pg.is_disabled('#nextBtn'), 'debería exigir pass'
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); chk('09');shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        # 10 Transferencia
        chk('10');shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); chk('11');shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="4"]'); assert pg.inner_text('#counter')=='Pantalla 5 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

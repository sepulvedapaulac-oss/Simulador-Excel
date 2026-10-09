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
        # 1 Inicio: etiqueta despegable + decisión (dos errores y reintento)
        assert pg.is_disabled('#nextBtn')
        pg.click('#sticker'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=4000)
        choose(pg,'hook',['A','C'],'B')
        assert 'Correcto' in pg.inner_text('.slide.active .fb')
        shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Línea de tiempo: siete momentos
        assert pg.is_disabled('#nextBtn')
        for k in range(7): pg.click(f'#dayline .dseg[data-k="{k}"]')
        assert pg.inner_text('#dayTick')=='7 / 7'
        shot(pg,f'{W}_03'); nxt(pg,'day')
        # 4 Comparador de actas
        assert pg.is_disabled('#nextBtn')
        rng(pg,'#cmpR',60); assert pg.is_disabled('#nextBtn')
        rng(pg,'#cmpR',10); assert 'acta correcta' in pg.inner_text('#cmpFb')
        shot(pg,f'{W}_04'); nxt(pg,'cmp')
        # 5 Ordenar: un intento incorrecto y luego ordenar
        assert pg.is_disabled('#nextBtn')
        pg.click('#orderCheck'); assert 'Aún no' in pg.inner_text('#orderFb'); assert pg.is_disabled('#nextBtn')
        for _ in range(12):
            items=pg.evaluate("[...document.querySelectorAll('#order li span:nth-child(2)')].map(e=>e.textContent)")
            # burbuja: usa el texto para saber la posición correcta
            target=['Recibir a la persona','Levantar el acta','Leer el acta','Informarle el procedimiento','Dentro de 3 días']
            idx=[next(j for j,t in enumerate(target) if it.startswith(t)) for it in items]
            moved=False
            for i in range(4):
                if idx[i]>idx[i+1]:
                    pg.click(f'#order [data-d="{i}"]'); moved=True; break
            if not moved: break
        pg.click('#orderCheck'); assert 'Secuencia correcta' in pg.inner_text('#orderFb')
        shot(pg,f'{W}_05'); nxt(pg,'order')
        # 6 Árbol: cuatro ejemplos (con un error)
        assert pg.is_disabled('#nextBtn')
        paths=[[0,0,0],[0,1],[1],[0,0,1]]
        for e,path in enumerate(paths):
            pg.click(f'#exTabs .ex-tab[data-i="{e}"]')
            for s,a in enumerate(path):
                if e==0 and s==0:
                    pg.click('#tree .tnode.cur .yn button[data-a="1"]'); assert 'Revisa' in pg.inner_text('#trFb')
                pg.click(f'#tree .tnode.cur .yn button[data-a="{a}"]')
            assert 'Investig' in pg.inner_text('#tree .tres')
        assert pg.inner_text('#trTick')=='4 / 4'
        shot(pg,f'{W}_06'); nxt(pg,'tree')
        # 7 Caso: recepción (dos decisiones)
        assert pg.is_disabled('#nextBtn')
        choose(pg,'caso1',['A'],'B'); pg.wait_for_selector('#caso1b:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        choose(pg,'caso1b',['A','B'],'C')
        shot(pg,f'{W}_07'); nxt(pg,'caso')
        # 8 Caso: después de recibir
        assert pg.is_disabled('#nextBtn')
        choose(pg,'caso2',['B'],'A'); pg.wait_for_selector('#caso2b:not([hidden])')
        assert 'no está vigente' in pg.inner_text('.slide.active [data-choice=caso2] + .fb')
        choose(pg,'caso2b',['C'],'B')
        shot(pg,f'{W}_08'); nxt(pg,'caso2')
        # 9 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); assert 'Aún no' in pg.inner_text('#qcard h3')
        nxt(pg,'quiz')
        # 10 Transferencia bloqueada sin aprobar
        pg.wait_for_timeout(200)
        yn=[1,1,0,1,1]  # la primera respuesta es incorrecta
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
        pg.click('[data-goto="3"]'); assert pg.inner_text('#counter')=='Pantalla 4 de 11'
        assert not pg.is_disabled('#nextBtn')
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

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
TREE=[[1],[0,1],[0,0,1],[0,0,0,1]]
QF=[0,1,2,0,1,2,1,2]
ORDER=['Identificar','Regularizar','Buscar','Ajustar','Verificar']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        def chk(n):
            o=overflow(pg,W); assert not o,(n,o)
        # 1 Inicio: chat de la gerencia + decisión (dos errores primero)
        assert pg.is_disabled('#nextBtn')
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
        assert 'ordenar la carpeta' in pg.inner_text('#phone')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert pg.query_selector('#reply')
        chk('01');shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(80)
        chk('02');shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Simulador de multas (sustitución que no procede primero)
        assert pg.is_disabled('#nextBtn')
        pg.click('#sizes [data-s="gra"]'); assert '3 a 60 UTM' in pg.inner_text('#simChecks')
        pg.check('#simSu'); assert 'no procede' in pg.inner_text('#simChecks'); assert pg.is_disabled('#nextBtn')
        pg.click('#sizes [data-s="med"]'); assert '2 a 40 UTM' in pg.inner_text('#simChecks'); assert 'no procede' in pg.inner_text('#simChecks')
        pg.click('#sizes [data-s="peq"]'); assert 'puede pedirse' in pg.inner_text('#simChecks')
        pg.fill('#simM','8'); assert '8 UTM' in pg.inner_text('#simV')
        assert pg.is_disabled('#nextBtn')
        pg.check('#simCo'); assert 'como máximo 4 UTM' in pg.inner_text('#simChecks')
        assert pg.inner_text('#simTick')=='5 / 5'
        chk('03');shot(pg,f'{W}_03'); nxt(pg,'sim')
        # 4 Parejas (una incorrecta primero)
        assert pg.is_disabled('#nextBtn')
        pg.click('.pl[data-i="0"]'); pg.click('.pr[data-i="1"]'); assert 'No corresponde' in pg.inner_text('#prFb'); assert pg.is_disabled('#nextBtn')
        for i in range(5): pg.click(f'.pl[data-i="{i}"]'); pg.click(f'.pr[data-i="{i}"]'); assert 'Pareja correcta' in pg.inner_text('#prFb')
        assert pg.inner_text('#prTick')=='5 / 5'
        chk('04');shot(pg,f'{W}_04'); nxt(pg,'pairs')
        # 5 Árbol de decisión (un error primero)
        assert pg.is_disabled('#nextBtn')
        pg.click('#tree .yn button[data-a="0"]'); assert 'Revisa' in pg.inner_text('#trFb'); assert pg.is_disabled('#nextBtn')
        for k,path in enumerate(TREE):
            pg.click(f'#exTabs .ex-tab[data-i="{k}"]')
            for a in path: pg.click(f'#tree .yn button[data-a="{a}"]')
            assert '→' in pg.inner_text('#tree')
        assert 'Multa administrativa' in pg.inner_text('#tree')
        assert pg.inner_text('#trTick')=='4 / 4'
        chk('05');shot(pg,f'{W}_05'); nxt(pg,'tree')
        # 6 Ronda rápida (la primera incorrecta)
        assert pg.is_disabled('#nextBtn')
        for i,c in enumerate(QF):
            ans=(c+1)%3 if i==0 else c
            pg.click(f'#qf .btns button[data-v="{ans}"]')
            assert ('No.' if i==0 else 'Correcto.') in pg.inner_text('#qf .fb')
            if i==0: assert pg.is_disabled('#nextBtn')
            pg.wait_for_timeout(1750)
        assert '7 de 8' in pg.inner_text('#qf')
        chk('06');shot(pg,f'{W}_06'); nxt(pg,'qf')
        # 7 Comparador + acciones de proceso (un error primero)
        assert pg.is_disabled('#nextBtn')
        assert pg.is_hidden('#pickQ')
        pg.fill('#cmpR','0'); pg.wait_for_selector('#pickQ:not([hidden])')
        pg.click('#chips .chip2[data-i="0"]'); pg.click('#chips .chip2[data-i="1"]'); pg.click('#pickCheck')
        assert 'Aún no' in pg.inner_text('#pickFb'); assert pg.is_disabled('#nextBtn')
        pg.click('#chips .chip2[data-i="0"]'); pg.click('#chips .chip2[data-i="3"]'); pg.click('#chips .chip2[data-i="4"]'); pg.click('#pickCheck')
        assert 'Correcto' in pg.inner_text('#pickFb')
        chk('07');shot(pg,f'{W}_07'); nxt(pg,'cmp')
        # 8 Caso ramificado
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=B]'); assert 'no procede' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=C]'); pg.wait_for_selector('#caso2:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2c] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('#caso2 .fb'); pg.click('#caso2 .retry')
        pg.click('[data-choice=caso2c] [data-opt=A]')
        chk('08');shot(pg,f'{W}_08'); nxt(pg,'caso')
        # 9 Comprobación: reprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        q1=pg.inner_text('#qcard h3'); print('  quiz 1:',q1); assert 'Aún no' in q1; nxt(pg,'quiz')
        # 10 Transferencia (bloqueada sin pass)
        pg.wait_for_timeout(200)
        pg.click('#orderCheck'); assert 'Aún no' in pg.inner_text('#orderFb')
        for i,word in enumerate(ORDER):
            items=[li.inner_text() for li in pg.query_selector_all('#order li')]
            j=next(k for k,t in enumerate(items) if word in t)
            for pos in range(j,i,-1): pg.click(f'#order [data-u="{pos}"]')
        pg.click('#orderCheck'); assert 'bien ordenado' in pg.inner_text('#orderFb')
        assert pg.is_disabled('#nextBtn'),'transferencia debería exigir pass'
        assert 'Necesitas al menos 80%' in pg.inner_text('#gateMsg')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        assert pg.inner_text('#counter')=='Pantalla 9 de 11'
        for k in [1,3,0,2,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        q2=pg.inner_text('#qcard h3'); print('  quiz 2:',q2); assert 'Aprobado' in q2
        chk('09');shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        chk('10');shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); chk('11');shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert pg.inner_text('#fPct')=='100%'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="4"]'); assert pg.inner_text('#counter')=='Pantalla 5 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

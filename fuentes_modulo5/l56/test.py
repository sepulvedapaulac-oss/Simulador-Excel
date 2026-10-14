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
TF_OK=[0,0,1,0,1]          # respuestas correctas (1 = Verdadero)
YN_OK=[0,1,1,0,0]          # respuestas correctas del checklist (1 = Sí)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        def chk(n):
            o=overflow(pg,W); assert not o,(n,o)
        # 1 Inicio: bandeja de correo + decisión
        assert pg.is_disabled('#nextBtn')
        assert pg.is_hidden('#hookQ')
        for i in range(3): pg.click(f'#inbox .msg[data-m="{i}"]'); pg.wait_for_timeout(60)
        assert pg.inner_text('#mailTick')=='3 / 3'
        pg.wait_for_selector('#hookQ:not([hidden])',timeout=3000)
        assert 'quedó cerrado' in pg.inner_text('#inbox')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert 'Buena respuesta' in pg.inner_text('.slide.active .fb')
        chk('01');shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(80)
        chk('02');shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Línea de tiempo del plazo
        assert pg.is_disabled('#nextBtn')
        for k in range(4): pg.click(f'#tline .dseg[data-k="{k}"]')
        assert pg.is_disabled('#nextBtn')
        pg.click('#tline .dseg[data-k="4"]')
        assert 'comparendo' in pg.inner_text('#tlPanel'); assert pg.inner_text('#tlTick')=='5 / 5'
        pg.click('#tline .dseg[data-k="3"]'); assert 'obliga al empleador' in pg.inner_text('#tlPanel')
        chk('03');shot(pg,f'{W}_03'); nxt(pg,'tl')
        # 4 Hotspots sobre el finiquito
        assert pg.is_disabled('#nextBtn')
        for k in range(5): pg.click(f'.slide.active .hs[data-hs="{k}"]'); pg.wait_for_timeout(50)
        assert pg.inner_text('#hsTick')=='5 / 5' and 'invocar' in pg.inner_text('#hsPanel')
        chk('04');shot(pg,f'{W}_04'); nxt(pg,'hs')
        # 5 Tarjetas
        assert pg.is_disabled('#nextBtn')
        for c in pg.query_selector_all('.slide.active .flip'): c.click(); pg.wait_for_timeout(60)
        assert pg.inner_text('#fcTick')=='4 / 4'
        chk('05');shot(pg,f'{W}_05'); nxt(pg,'cards')
        # 6 Ordenar pasos (primero un orden incorrecto)
        assert pg.is_disabled('#nextBtn')
        pg.click('#orderCheck'); assert 'Aún no' in pg.inner_text('#orderFb'); assert pg.is_disabled('#nextBtn')
        for target in range(5):
            while True:
                ks=[int(x.get_attribute('data-k')) for x in pg.query_selector_all('#order li')]
                j=ks.index(target)
                if j==target: break
                pg.click(f'#order [data-u="{j}"]')
        pg.click('#orderCheck'); assert 'Secuencia correcta' in pg.inner_text('#orderFb')
        chk('06');shot(pg,f'{W}_06'); nxt(pg,'order')
        # 7 Verdadero o falso (primero con errores, luego reintento)
        assert pg.is_disabled('#nextBtn')
        for i in range(5): pg.click('#tf .tf-btns button[data-v="1"]'); pg.click('#tfNext')
        assert 'de 5 correctas' in pg.inner_text('#tf') and pg.is_disabled('#nextBtn')
        pg.click('#tfRetry')
        for v in TF_OK: pg.click(f'#tf .tf-btns button[data-v="{v}"]'); pg.click('#tfNext')
        assert '5 de 5 correctas' in pg.inner_text('#tf')
        chk('07');shot(pg,f'{W}_07'); nxt(pg,'tf')
        # 8 Caso: reserva y cuotas
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=C]'); pg.wait_for_selector('#caso2:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2c] [data-opt=C]'); pg.click('#caso2 .retry'); assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2c] [data-opt=B]'); pg.click('#caso2 .retry')
        pg.click('[data-choice=caso2c] [data-opt=A]')
        chk('08');shot(pg,f'{W}_08'); nxt(pg,'caso')
        # 9 Comprobación: reprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        q1=pg.inner_text('#qcard h3'); print('  quiz 1:',q1); assert 'Aún no' in q1
        nxt(pg,'quiz')
        # 10 Transferencia (bloqueada sin pass)
        pg.wait_for_timeout(200)
        assert pg.is_disabled('#modelBtn')
        items=pg.query_selector_all('#ynList .yn-item')
        items[0].query_selector('button[data-a="1"]').click(); assert 'Revisa' in items[0].inner_text()
        for it,a in list(zip(items,YN_OK))[1:]: it.query_selector(f'button[data-a="{a}"]').click()
        pg.fill('#notes','Revisaría la fecha de puesta a disposición del finiquito.')
        pg.click('#modelBtn'); assert pg.is_visible('#model')
        assert pg.is_disabled('#nextBtn'),'transferencia debería exigir pass'
        assert '80%' in pg.inner_text('#gateMsg')
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

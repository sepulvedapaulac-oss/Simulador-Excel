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
BINS={0:0,1:0,2:1,3:1,4:1,5:1,6:2,7:2}
ORDER_KEYS=['Leer la citación','Reunir','Cruzar','Corregir','Asistir','Revisar la causa']
TF=[0,1,1,0,0,1]          # 1 = Verdadero
YN=[0,0,1,1,0]            # 1 = Sí
QOK=[2,0,3,1,2]
def order_pos(pg):
    txt=[li.inner_text() for li in pg.query_selector_all('#order li')]
    return [next(k for k,key in enumerate(ORDER_KEYS) if key in t) for t in txt]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        def chk(n):
            o=overflow(pg,W); assert not o,(n,o)
        # 1 Inicio: notificación en el celular + decisión
        assert pg.is_disabled('#nextBtn')
        pg.click('#openCit'); assert 'Registro de asistencia' in pg.inner_text('#phone')
        pg.click('#openChat'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
        assert 'fecha de ingreso' in pg.inner_text('#phone')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert pg.query_selector('#reply')
        chk('01');shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(80)
        chk('02');shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Facultades: acordeón + pregunta (primero errores)
        assert pg.is_disabled('#nextBtn')
        heads=pg.query_selector_all('#acc .acc-head')
        for h in heads[:5]: h.click(); pg.wait_for_timeout(40)
        assert pg.is_hidden('#suspQ')
        heads[5].click(); pg.wait_for_selector('#suspQ:not([hidden])')
        assert pg.inner_text('#accTick')=='6 / 6' and pg.is_disabled('#nextBtn')
        pg.click('[data-choice=susp] [data-opt=A]'); assert 'No corresponde' in pg.inner_text('#suspQ .fb'); pg.click('#suspQ .retry')
        pg.click('[data-choice=susp] [data-opt=B]'); assert pg.is_disabled('#nextBtn'); pg.click('#suspQ .retry')
        pg.click('[data-choice=susp] [data-opt=C]')
        chk('03');shot(pg,f'{W}_03'); nxt(pg,'acc')
        # 4 Clasificar documentos (un error primero)
        assert pg.is_disabled('#nextBtn')
        pg.click('.cardx[data-c="0"]'); pg.click('.bin[data-b="1"]'); assert 'No corresponde' in pg.inner_text('#binFb')
        for c,bb in BINS.items(): pg.click(f'.cardx[data-c="{c}"]'); pg.click(f'.bin[data-b="{bb}"]')
        assert pg.inner_text('#binTick')=='8 / 8'
        chk('04');shot(pg,f'{W}_04'); nxt(pg,'bins')
        # 5 Coherencia documental: evidencias + decisión
        assert pg.is_disabled('#nextBtn')
        for k in range(3): pg.click(f'#evline .evnode[data-k="{k}"]')
        assert '0 horas extraordinarias' in pg.inner_text('#evPanel')
        pg.wait_for_selector('#audQ:not([hidden])')
        pg.click('[data-choice=aud] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('#audQ .fb'); pg.click('#audQ .retry')
        pg.click('[data-choice=aud] [data-opt=C]'); pg.click('#audQ .retry')
        pg.click('[data-choice=aud] [data-opt=A]')
        chk('05');shot(pg,f'{W}_05'); nxt(pg,'ev aud')
        # 6 Ordenar pasos (comprobar mal primero)
        assert pg.is_disabled('#nextBtn')
        pg.click('#orderCheck'); assert 'Aún no' in pg.inner_text('#orderFb'); assert pg.is_disabled('#nextBtn')
        for t in range(6):
            pos=order_pos(pg).index(t)
            for i in range(pos,t,-1): pg.click(f'#order [data-u="{i}"]')
        assert order_pos(pg)==list(range(6))
        pg.click('#orderCheck'); assert 'Secuencia correcta' in pg.inner_text('#orderFb')
        chk('06');shot(pg,f'{W}_06'); nxt(pg,'order')
        # 7 Verdadero o falso (error en la primera, luego reintento completo)
        assert pg.is_disabled('#nextBtn')
        for i,v in enumerate(TF):
            ans=(1-v) if i==0 else v
            pg.click(f'#tf .tf-btns button[data-v="{ans}"]')
            if i==0: assert 'Incorrecto' in pg.inner_text('#tf .fb')
            if i==2: assert '50%' in pg.inner_text('#tf .tf-claim') and '511' in pg.inner_text('#tf .fb')
            pg.click('#tfNext')
        assert '5 de 6' in pg.inner_text('#tf')
        pg.click('#tfAgain')
        for v in TF: pg.click(f'#tf .tf-btns button[data-v="{v}"]'); pg.click('#tfNext')
        assert '6 de 6' in pg.inner_text('#tf')
        chk('07');shot(pg,f'{W}_07'); nxt(pg,'tf')
        # 8 Caso ramificado: visita nocturna
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=B]'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=C]'); pg.wait_for_selector('#caso2:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2c] [data-opt=A]'); pg.click('#caso2 .retry'); pg.click('[data-choice=caso2c] [data-opt=C]'); pg.click('#caso2 .retry')
        pg.click('[data-choice=caso2c] [data-opt=B]'); assert '50%' in pg.inner_text('#caso2 .fb')
        chk('08');shot(pg,f'{W}_08'); nxt(pg,'caso')
        # 9 Comprobación: reprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        h=pg.inner_text('#qcard h3'); print('  quiz 1:',h); assert 'Aún no' in h
        nxt(pg,'quiz')
        # 10 Transferencia (bloqueada sin pass)
        pg.wait_for_timeout(200)
        assert pg.is_disabled('#modelBtn')
        items=pg.query_selector_all('#ynList .yn-item')
        for i,(it,a) in enumerate(zip(items,YN)):
            ans=(1-a) if i==0 else a
            it.query_selector(f'button[data-a="{ans}"]').click()
        assert '✕' in items[0].inner_text()
        pg.click('#modelBtn'); assert pg.is_visible('#model')
        assert pg.is_disabled('#nextBtn'),'transferencia debería exigir pass'
        assert '80%' in pg.inner_text('#gateMsg')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in QOK: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        h=pg.inner_text('#qcard h3'); print('  quiz 2:',h); assert 'Aprobado' in h
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

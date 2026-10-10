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
VL=[0,1,0,1,1,0]
BINS={0:2,1:1,2:0,3:0,4:2,5:0,6:1,7:1}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        def chk(n):
            o=overflow(pg,W); assert not o,(n,o)
        # 1 Inicio: chat en el celular + decisión
        assert pg.is_disabled('#nextBtn')
        pg.click('#showMsg'); pg.wait_for_selector('#hookQ:not([hidden])',timeout=6000)
        assert 'causal' in pg.inner_text('#phone')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]'); assert pg.query_selector('#reply')
        chk('01');shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video: recorrer capítulos
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(80)
        chk('02');shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Simulador por causal
        assert pg.is_disabled('#nextBtn')
        pg.click('#causales [data-c="161"]'); assert 'Procede' in pg.inner_text('#simChecks') and '150 días' in pg.inner_text('#simChecks')
        pg.check('#simAv'); assert 'se dio aviso' in pg.inner_text('#simChecks')
        pg.fill('#simM','8'); assert 'un año o más' in pg.inner_text('#simChecks')
        pg.fill('#simM','160'); assert '330 días' in pg.inner_text('#simChecks')
        for c in ('ren','mut','ven','obra'): pg.click(f'#causales [data-c="{c}"]'); assert pg.is_disabled('#nextBtn')
        assert '400 días' in pg.inner_text('#simChecks')
        pg.click('#causales [data-c="160"]'); assert pg.inner_text('#simTick')=='6 / 6'
        chk('03');shot(pg,f'{W}_03'); nxt(pg,'sim')
        # 4 Calculadora (primero un error)
        assert pg.is_disabled('#nextBtn')
        pg.fill('#calcAns','3600000'); pg.click('#calcCheck'); assert 'fracción' in pg.inner_text('#calcFb'); assert pg.is_disabled('#nextBtn')
        for _ in range(5): pg.click('#calcStep')
        pg.fill('#calcAns','4.500.000'); pg.click('#calcCheck'); assert 'Correcto' in pg.inner_text('#calcFb')
        chk('04');shot(pg,f'{W}_04'); nxt(pg,'calc')
        # 5 Topes (primero valores incorrectos)
        assert pg.is_disabled('#nextBtn')
        pg.fill('#cD','300'); pg.fill('#cB','90'); assert 'Queda corto' in pg.inner_text('#capChecks'); assert pg.is_disabled('#nextBtn')
        pg.fill('#cD','330'); assert '990 UF' in pg.inner_text('#capRes')
        chk('05');shot(pg,f'{W}_05'); nxt(pg,'caps')
        # 6 Tarjetas
        assert pg.is_disabled('#nextBtn')
        for c in pg.query_selector_all('.slide.active .flip'): c.click(); pg.wait_for_timeout(60)
        assert pg.inner_text('#fcTick')=='6 / 6'
        chk('06');shot(pg,f'{W}_06'); nxt(pg,'cards')
        # 7 Veredicto por línea (una incorrecta primero)
        assert pg.is_disabled('#nextBtn')
        lines=pg.query_selector_all('#vlines .vline')
        lines[0].query_selector('button[data-a="1"]').click(); assert 'Revisa' in lines[0].inner_text()
        for l,a in zip(lines,VL): l.query_selector(f'button[data-a="{a}"]').click()
        assert pg.inner_text('#vlTick')=='6 / 6'
        chk('07');shot(pg,f'{W}_07'); nxt(pg,'vl')
        # 8 Caso: plazo y recargo
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso1] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=B]'); pg.wait_for_selector('#caso2:not([hidden])')
        assert pg.is_disabled('#nextBtn')
        pg.click('[data-choice=caso2c] [data-opt=C]'); pg.click('#caso2 .retry'); pg.click('[data-choice=caso2c] [data-opt=A]')
        chk('08');shot(pg,f'{W}_08'); nxt(pg,'caso')
        # 9 Comprobación: reprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        # 10 Transferencia (bloqueada sin pass)
        pg.wait_for_timeout(200)
        pg.click('.cardx[data-c="0"]'); pg.click('.bin[data-b="0"]'); assert 'No corresponde' in pg.inner_text('#binFb')
        for c,bb in BINS.items(): pg.click(f'.cardx[data-c="{c}"]'); pg.click(f'.bin[data-b="{bb}"]')
        assert pg.inner_text('#binTick')=='8 / 8'
        assert pg.is_disabled('#nextBtn'),'transferencia debería exigir pass'
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); chk('09');shot(pg,f'{W}_09'); nxt(pg,'quiz2')
        chk('10');shot(pg,f'{W}_10'); nxt(pg,'transfer')
        # 11 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); chk('11');shot(pg,f'{W}_11')
        assert pg.inner_text('#counter')=='Pantalla 11 de 11'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="3"]'); assert pg.inner_text('#counter')=='Pantalla 4 de 11'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

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
def chk(pg,sel,v):
    if pg.is_checked(sel)!=v: pg.click(sel)
ORD=['Recibir la solicitud','Verificar si la persona','Revisar el antecedente','Revisar los requisitos','Responder dentro','Dejar constancia']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe)
    for W,H in ((1366,900),(375,800)):
        pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(500)
        # 1 Inicio
        assert pg.is_disabled('#nextBtn')
        for k in range(3): pg.click(f'#solLine .evnode[data-k="{k}"]')
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb'); assert pg.is_disabled('#nextBtn')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=B]'); shot(pg,f'{W}_01'); nxt(pg,'hook')
        # 2 Video
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})')
        shot(pg,f'{W}_02'); nxt(pg,'video')
        # 3 Árbol
        pg.click('#tree .yn button[data-a="0"]'); assert 'Revisa' in pg.inner_text('#trFb'); print('  tree wrong ok')
        for i,pth in enumerate([[1],[0,1,0],[0,1,1]]):
            pg.click(f'#exTabs .ex-tab[data-i="{i}"]')
            for a in pth: pg.click(f'#tree .yn button[data-a="{a}"]')
        shot(pg,f'{W}_03'); nxt(pg,'tree')
        # 4 Pestañas
        assert pg.is_disabled('#nextBtn')
        pg.click('#tabs .tab[data-t="1"]'); pg.click('#tabs .tab[data-t="2"]'); shot(pg,f'{W}_04'); nxt(pg,'tabs')
        # 5 Simulador
        rng(pg,'#sDays',30); print('  sim1:',pg.inner_text('#simV'))
        pg.click('#sCond button[data-v="dep"]'); rng(pg,'#sAge',72); print('  sim2:',pg.inner_text('#simV'))
        chk(pg,'#sRem',True); pg.dispatch_event('#sRem','input'); print('  sim3:',pg.inner_text('#simV'))
        shot(pg,f'{W}_05'); nxt(pg,'sim')
        # 6 V/F (una incorrecta)
        for v in ['1','0','0','1','1']:
            pg.click(f'#tf .tf-btns button[data-v="{v}"]'); pg.click('#tfNext')
        print('  tf:',pg.inner_text('#tf .feedback strong')); shot(pg,f'{W}_06'); nxt(pg,'tf')
        # 7 Clasificar (una incorrecta)
        pg.click('.cardx[data-c="2"]'); pg.click('.bin[data-b="c"]'); assert 'No corresponde' in pg.inner_text('#binFb')
        for c,bn in enumerate('cfncncnf'):
            pg.click(f'.cardx[data-c="{c}"]'); pg.click(f'.bin[data-b="{bn}"] h3')
        shot(pg,f'{W}_07'); nxt(pg,'bins')
        # 8 Comprobación: reprobar y aprobar
        for k in [0,0,0,0,0]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 1:',pg.inner_text('#qcard h3')); nxt(pg,'quiz')
        pg.wait_for_timeout(200); assert pg.is_disabled('#nextBtn')
        pg.click('#toQuiz'); pg.wait_for_timeout(300)
        for k in [1,2,0,3,1]: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        print('  quiz 2:',pg.inner_text('#qcard h3')); shot(pg,f'{W}_08'); nxt(pg,'quiz2')
        # 9 Transferencia: ordenar
        pg.click('#orderCheck'); print('  order wrong:',pg.inner_text('#orderFb')[:30])
        for i in range(6):
            txt=pg.eval_on_selector_all('#order li span:nth-child(2)','e=>e.map(x=>x.textContent)')
            j=[n for n,t in enumerate(txt) if t.startswith(ORD[i])][0]
            for m in range(j,i,-1): pg.click(f'#order [data-u="{m}"]')
        pg.click('#orderCheck'); shot(pg,f'{W}_09'); nxt(pg,'order')
        # 10 Finalización
        print('  final:',pg.inner_text('#counter'),pg.inner_text('#fPct'),pg.inner_text('#fEsc')); shot(pg,f'{W}_10')
        assert pg.inner_text('#counter')=='Pantalla 10 de 10'
        assert all(not x.is_disabled() for x in pg.query_selector_all('.topic-link')),'navegación no libre'
        pg.click('[data-goto="2"]'); assert pg.inner_text('#counter')=='Pantalla 3 de 10'
        sw=pg.evaluate('document.documentElement.scrollWidth'); print(f'  {W}px scrollWidth',sw)
        assert sw<=W, 'desborde horizontal'
        assert not errs, errs
    b.close()
print('RECORRIDO OK')

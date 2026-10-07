from playwright.sync_api import sync_playwright
import glob, os
D = os.path.dirname(os.path.abspath(__file__))
F = 'file://' + os.path.join(D, 'out', 'Leccion.html')
SH = os.path.join(D, 'shots'); os.makedirs(SH, exist_ok=True)
exe = glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]

def nxt(pg, label):
    if pg.is_disabled('#nextBtn'):
        raise SystemExit(f'BLOCKED at {label} | {pg.inner_text("#gateMsg")}')
    pg.click('#nextBtn'); pg.wait_for_timeout(150)

def shot(pg, n):
    pg.screenshot(path=f'{SH}/{n}.png', full_page=True)

def run(w, h, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=exe)
        pg = b.new_page(viewport={'width': w, 'height': h}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(F); pg.wait_for_timeout(400)
        pg.uncheck('#autoNarr')
        # 1 Inicio
        assert pg.is_disabled('#nextBtn'), 'inicio no bloqueado'
        for f in pg.query_selector_all('#form .ffield'): f.click()
        pg.click('[data-choice=hook] [data-opt=A]'); assert 'Consecuencia' in pg.inner_text('.slide.active .fb')
        pg.click('.slide.active .retry'); pg.click('[data-choice=hook] [data-opt=C]')
        shot(pg, f'{tag}_01'); nxt(pg, 'hook')
        # 2 Video
        assert pg.is_disabled('#nextBtn')
        for i in range(7): pg.click(f'#chapters .chap:nth-child({i+1})'); pg.wait_for_timeout(120)
        shot(pg, f'{tag}_02'); nxt(pg, 'video')
        # 3 Tarjetas
        flips = pg.query_selector_all('.slide.active .flip')
        for f in flips[:5]: f.click()
        assert pg.is_disabled('#nextBtn'), 'cards se libera antes'
        flips[5].click(); pg.wait_for_timeout(700); shot(pg, f'{tag}_03'); nxt(pg, 'cards')
        # 4 Hotspots
        for i in range(5): pg.click(f'.hs[data-hs="{i}"]')
        shot(pg, f'{tag}_04'); nxt(pg, 'hs')
        # 5 Árbol
        paths = [[0], [1, 0], [1, 1, 1]]
        for i, pth in enumerate(paths):
            pg.click(f'#exTabs .ex-tab[data-i="{i}"]')
            if i == 1:
                pg.click('#tree .yn button[data-a="0"]'); print('  tree wrong:', pg.inner_text('#trFb')[:40])
            for a in pth: pg.click(f'#tree .yn button[data-a="{a}"]')
        shot(pg, f'{tag}_05'); nxt(pg, 'tree')
        # 6 Ruta de protección
        for i in range(5): pg.click(f'#dayline .dseg[data-k="{i}"]')
        shot(pg, f'{tag}_06'); nxt(pg, 'day')
        # 7 Caso
        pg.click('[data-choice=caso1] [data-opt=C]'); pg.click('.slide.active .retry')
        pg.click('[data-choice=caso1] [data-opt=B]')
        pg.click('[data-choice=caso2c] [data-opt=A]')
        shot(pg, f'{tag}_07'); nxt(pg, 'caso')
        # 8 Quiz: reprobar y luego aprobar
        def quiz(keys):
            for k in keys: pg.click(f'#qcard .opt[data-i="{k}"]'); pg.click('#qNext')
        quiz([0, 0, 0, 3, 1]); print('  quiz 1:', pg.inner_text('#qcard h3'))
        assert 'Aún no' in pg.inner_text('#qcard h3')
        nxt(pg, 'quiz-fail')  # quiz hecho, se puede ver la transferencia pero no finalizar
        # 9 Transferencia (sin aprobar aún)
        yn = [0, 0, 1, 1, 0]
        items = pg.query_selector_all('#ynList .yn-item')
        items[0].query_selector('button[data-a="1"]').click()  # respuesta incorrecta
        for i, it in enumerate(items[1:], 1): it.query_selector(f'button[data-a="{yn[i]}"]').click()
        pg.click('#modelBtn')
        assert pg.is_disabled('#nextBtn'), 'finaliza sin aprobar'
        print('  gate sin pass:', pg.inner_text('#gateMsg'))
        pg.click('#toQuiz'); pg.wait_for_timeout(200)
        quiz([1, 2, 0, 3, 1]); print('  quiz 2:', pg.inner_text('#qcard h3'))
        shot(pg, f'{tag}_08'); nxt(pg, 'quiz-pass')
        shot(pg, f'{tag}_09'); nxt(pg, 'transfer')
        # 10 Final
        pct, esc = pg.inner_text('#fPct'), pg.inner_text('#fEsc')
        shot(pg, f'{tag}_10')
        free = all(not l.is_disabled() for l in pg.query_selector_all('.topic-link'))
        print(f'  [{tag}] final:', pg.inner_text('#counter'), pct, esc, 'nav libre:', free)
        assert pct == '100%' and esc == '1 / 3' and free
        pg.click('[data-goto="4"]'); assert 'proporcional' in pg.inner_text('.slide.active h2').lower()
        sw = pg.evaluate('document.documentElement.scrollWidth')
        assert sw <= w, f'scroll horizontal {sw}'
        assert not errs, errs
        b.close()

run(1366, 900, 'd')
run(375, 800, 'm')
print('RECORRIDO OK')

#!/usr/bin/env python3
"""Construye las evaluaciones de módulo · Parte 2 (caso aplicado con rúbrica).

Uso:
  python3 evaluaciones/build_eval.py            # construye todas las de evaluaciones/src/
  python3 evaluaciones/build_eval.py src/EV_M2.html

Cada fuente declara su configuración en <!--CFG {...}-->, la rúbrica en
<script type="application/json" id="rubric-data"> y sus pantallas con
<section class="screen">. Las imágenes se toman de las lecciones con
data-img="M2_L4/02" (media/M2_L4/img/02.webp).
"""
import html, json, pathlib, re, sys, zipfile

ROOT = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from build import MANIFEST, b64  # noqa: E402

ENGINE = ROOT / 'engine'
DIST = ROOT.parent / 'dist'


def build(src: pathlib.Path):
    text = src.read_text(encoding='utf-8')
    m = re.search(r'<!--CFG\s*(\{.*?\})\s*-->', text, re.S)
    if not m:
        sys.exit(f'{src}: falta el bloque CFG')
    cfg = json.loads(m.group(1))
    body = text[m.end():].strip()
    rub = re.search(r'<script type="application/json" id="rubric-data">(.*?)</script>', body, re.S)
    crit = json.loads(rub.group(1))
    tasks = re.findall(r'data-task="(\w+)"', body)
    if sorted(tasks) != sorted(c['id'] for c in crit) or sum(c['pts'] for c in crit) != 100:
        sys.exit(f'{src}: la rúbrica no coincide con las tareas o no suma 100 puntos')
    imgs = {}
    for k in sorted(set(re.findall(r'data-img="([\w/]+)"', body))):
        lid, n = k.split('/')
        p = ROOT.parent / 'media' / lid / 'img' / f'{n}.webp'
        if not p.exists():
            sys.exit(f'{src}: falta la imagen {p}')
        imgs[k] = b64(p, 'image/webp')
    shell = (ENGINE / 'shell.html').read_text(encoding='utf-8')
    css = (ROOT.parent / 'engine' / 'lesson.css').read_text(encoding='utf-8') + (ENGINE / 'eval.css').read_text(encoding='utf-8')
    js = (ENGINE / 'eval.js').read_text(encoding='utf-8')
    data = 'window.EVAL=%s;window.IMGS=%s;' % (json.dumps(cfg, ensure_ascii=False), json.dumps(imgs))
    out = (shell.replace('{{TITLE}}', html.escape(cfg['title']))
                .replace('{{COURSE}}', html.escape(cfg['course']))
                .replace('{{META}}', html.escape(cfg['meta']))
                .replace('/*{{CSS}}*/', css)
                .replace('{{SCREENS}}', body)
                .replace('/*{{DATA}}*/', data)
                .replace('/*{{JS}}*/', js))
    DIST.mkdir(exist_ok=True)
    name = cfg['name']
    (DIST / f'{name}.html').write_text(out, encoding='utf-8')
    with zipfile.ZipFile(DIST / f'{name}_SCORM12.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('index.html', out)
        z.writestr('imsmanifest.xml', MANIFEST.format(ident=cfg['scorm_id'], code=cfg['id'], title=html.escape(cfg['title'])))
    print(f'{name}: {len(out) / 1e6:.1f} MB · {len(imgs)} imágenes · {len(crit)} criterios')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    for s in ([pathlib.Path(a) for a in args] or sorted((ROOT / 'src').glob('EV_*.html'))):
        build(s)

#!/usr/bin/env python3
"""Construye una lección: HTML autocontenido + paquete SCORM 1.2.

Uso:
  python3 build.py src/M1_L2.html            # construye una lección
  python3 build.py --all                     # construye todas las de src/
  python3 build.py src/M1_L2.html --narr     # solo exporta los textos de narración

La fuente declara su configuración en un comentario <!--CFG {...}--> y su
contenido con secciones <section class="screen">. Imágenes en
media/<id>/img/NN.webp y narraciones en media/<id>/aud/<clave>.mp3.
"""
import base64, html, json, pathlib, re, subprocess, sys, zipfile

ROOT = pathlib.Path(__file__).resolve().parent
ENGINE = ROOT / 'engine'
DIST = ROOT / 'dist'

MANIFEST = '''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{ident}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="ORG_{code}">
    <organization identifier="ORG_{code}">
      <title>{title}</title>
      <item identifier="ITEM_{code}" identifierref="RES_{code}" isvisible="true">
        <title>{title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_{code}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
'''


def parse(src: pathlib.Path):
    text = src.read_text(encoding='utf-8')
    m = re.search(r'<!--CFG\s*(\{.*?\})\s*-->', text, re.S)
    if not m:
        sys.exit(f'{src}: falta el bloque <!--CFG {{...}}-->')
    cfg = json.loads(m.group(1))
    body = text[m.end():].strip()
    return cfg, body


def json_block(body, ident):
    m = re.search(r'<script type="application/json" id="%s">(.*?)</script>' % ident, body, re.S)
    return json.loads(m.group(1)) if m else None


def narration(cfg, body):
    """Devuelve {clave: texto} con todas las narraciones de la lección."""
    out = dict(json_block(body, 'narr-data') or {})
    for i, sc in enumerate(json_block(body, 'video-data') or [], 1):
        out[f'v{i}'] = sc['txt']
    return out


def duration(p: pathlib.Path) -> float:
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)],
                       capture_output=True, text=True)
    return round(float(r.stdout.strip()), 2)


def b64(p: pathlib.Path, mime):
    return f'data:{mime};base64,' + base64.b64encode(p.read_bytes()).decode()


def build(src: pathlib.Path):
    cfg, body = parse(src)
    lid = cfg['id']
    media = ROOT / 'media' / lid
    # Imágenes realmente usadas
    used = set(re.findall(r'data-img="([\w-]+)"', body))
    for sc in json_block(body, 'video-data') or []:
        if sc.get('img'):
            used.add(sc['img'])
    imgs = {}
    for k in sorted(used):
        p = media / 'img' / f'{k}.webp'
        if not p.exists():
            sys.exit(f'{src}: falta la imagen {p}')
        imgs[k] = b64(p, 'image/webp')
    # Narraciones disponibles
    texts = narration(cfg, body)
    audio, adur, missing = {}, {}, []
    for k in texts:
        p = media / 'aud' / f'{k}.mp3'
        if p.exists():
            audio[k] = b64(p, 'audio/mpeg')
            adur[k] = duration(p)
        else:
            missing.append(k)
    shell = (ENGINE / 'shell.html').read_text(encoding='utf-8')
    css = (ENGINE / 'lesson.css').read_text(encoding='utf-8')
    js = (ENGINE / 'lesson.js').read_text(encoding='utf-8')
    data = 'window.LESSON=%s;window.IMGS=%s;window.AUDIO=%s;window.ADUR=%s;' % (
        json.dumps(cfg, ensure_ascii=False), json.dumps(imgs), json.dumps(audio), json.dumps(adur))
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
    zp = DIST / f'{name}_SCORM12.zip'
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('index.html', out)
        z.writestr('imsmanifest.xml', MANIFEST.format(ident=cfg['scorm_id'], code=lid, title=html.escape(cfg['title'])))
    size = (DIST / f'{name}.html').stat().st_size / 1e6
    print(f'{name}: {size:.1f} MB · {len(imgs)} imágenes · {len(audio)}/{len(texts)} narraciones'
          + (f' · faltan: {", ".join(missing)}' if missing else ''))


def export_narr(src):
    cfg, body = parse(src)
    out = ROOT / 'media' / cfg['id'] / 'narracion.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    texts = narration(cfg, body)
    out.write_text(json.dumps(texts, ensure_ascii=False, indent=1), encoding='utf-8')
    print(out, sum(len(t) for t in texts.values()), 'caracteres')


if __name__ == '__main__':
    args = sys.argv[1:]
    srcs = sorted((ROOT / 'src').glob('*.html')) if '--all' in args else [pathlib.Path(a) for a in args if not a.startswith('--')]
    for s in srcs:
        export_narr(s) if '--narr' in args else build(s)

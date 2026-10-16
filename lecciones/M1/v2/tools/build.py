#!/usr/bin/env python3
"""Arma una lección con la estructura de la Lección 3.1 (SCORM 1.2, carpetas audio/ e img/).
uso: build.py L1 --num 1.1 --title "..." --id PYMES_M1_L11 --name Leccion_1_1_Madurez_Digital"""
import argparse, json, os, re, shutil, subprocess, zipfile, html
from mutagen.mp3 import MP3

TOOLS = os.path.dirname(os.path.abspath(__file__))
p = argparse.ArgumentParser()
p.add_argument('--root', default=os.path.dirname(TOOLS)); p.add_argument('--module', default='1')
p.add_argument('--shared-audio', default=''); p.add_argument('--preview', action='store_true')
p.add_argument('lesson'); p.add_argument('--num', required=True); p.add_argument('--title', required=True)
p.add_argument('--id', required=True); p.add_argument('--name', required=True)
a = p.parse_args()
ROOT = os.path.abspath(a.root)
IMG = os.path.join(os.path.dirname(ROOT), 'img')

data = json.load(open(os.path.join(ROOT, 'data', a.lesson + '.json'), encoding='utf-8'))
body = open(os.path.join(ROOT, 'src', a.lesson + '.html'), encoding='utf-8').read()
conf = open(os.path.join(ROOT, 'src', a.lesson + '.config.js'), encoding='utf-8').read()
adir = os.path.join(ROOT, 'audio', a.lesson)
out = os.path.join(ROOT, 'dist', a.name);
if os.path.isdir(out): shutil.rmtree(out)
os.makedirs(out + '/audio'); os.makedirs(out + '/img')

def mmss(sec):
    s = round(sec); return f'{s // 60}:{s % 60:02d}'

# audio + duraciones (las locuciones comunes quiz/p10 pueden venir de --shared-audio)
aud, durs = {}, {}
srcs = {f[:-4]: os.path.join(adir, f) for f in sorted(os.listdir(adir))} if os.path.isdir(adir) else {}
if a.shared_audio:
    for k in ('quiz', 'p10'):
        f = os.path.join(ROOT, 'audio', a.shared_audio, k + '.mp3')
        if k not in srcs and os.path.exists(f): srcs[k] = f
for k, f in sorted(srcs.items()):
    shutil.copy(f, os.path.join(out, 'audio', k + '.mp3'))
    aud[k] = 'audio/' + k + '.mp3'; durs[k] = MP3(f).info.length
missing = [k for k in re.findall(r'data-audio="(\w+)"', body) if k not in aud]
vmissing = ['video_%d' % (i + 1) for i in range(len(data['video'])) if 'video_%d' % (i + 1) not in aud]
if missing or vmissing:
    assert a.preview, 'faltan audios: %s' % (missing + vmissing)
    # vista previa: pantallas sin botón de narración y video con pistas silenciosas de duración estimada
    for k in missing: body = body.replace(f' data-audio="{k}"', '')
    for k in vmissing:
        sc = data['video'][int(k[6:]) - 1]; dur = max(4, len(' '.join(sc['lines']).split()) / 2.5)
        f = os.path.join(out, 'audio', k + '.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '%.2f' % dur, '-q:a', '9', f], check=True)
        aud[k] = 'audio/' + k + '.mp3'; durs[k] = MP3(f).info.length
    print('VISTA PREVIA · sin narración:', missing + vmissing)
body = re.sub(r'data-audio="(\w+)"', lambda m: f'data-audio="{m.group(1)}" data-dur="{mmss(durs[m.group(1)])}"', body)

# imágenes
imgs = set(re.findall(r'img/([\w-]+\.jpg)', body)) | {s['img'] + '.jpg' for s in data['video']}
for f in imgs: shutil.copy(os.path.join(IMG, f), os.path.join(out, 'img', f))

video = {'durs': [round(durs['video_%d' % (i + 1)], 2) for i in range(len(data['video']))],
         'scenes': [dict(s, img='img/%s.jpg' % s['img']) for s in data['video']]}
vmin = round(sum(video['durs']) / 60)
body = body.replace('{{VMIN}}', str(max(1, vmin)))
L = {'id': a.id.lower(), 'aud': aud, 'video': video}

css = open(os.path.join(TOOLS, 'ref_base.css'), encoding='utf-8').read() + '\n' + open(os.path.join(TOOLS, 'extra.css'), encoding='utf-8').read()
js = open(os.path.join(TOOLS, 'engine.js'), encoding='utf-8').read()
n = len(re.findall(r'<section class="slide', body))
title = f'Lección {a.num} — {a.title}'
page = f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>{html.escape(title)}</title>
<style>
{css}
</style>
</head>
<body>
<main class="app">
<div class="topbar">
  <div class="topbar-row"><span class="course">HERRAMIENTAS DIGITALES PARA PYMES · MÓDULO {a.module} · LECCIÓN {a.num}</span><span style="display:inline-flex;gap:14px;align-items:center;flex-wrap:wrap"><label class="autonarr"><input type="checkbox" id="autoNarr" checked/> Narración automática</label><span id="counter">Pantalla 1 de {n}</span></span></div>
  <div class="progress"><span id="progressBar"></span></div>
</div>
<button class="route-btn" id="routeBtn" type="button" aria-expanded="false" aria-controls="topicPanel">☰ Ruta de la lección · <span id="routeNow">Inicio</span></button>
<aside aria-label="Ruta de la lección" class="topic-panel" id="topicPanel">
  <h3>Ruta de la lección</h3>
  <p class="mode" id="navMode">Avanza completando cada actividad</p>
  <div class="topic-list" id="topicList"></div>
</aside>
{body}
</main>

<nav aria-label="Navegación" class="bottom-nav"><div class="inner">
  <button class="nav-btn prev" id="prevBtn" type="button">← Anterior</button><span class="gate-msg" id="gateMsg"></span><button class="nav-btn next" id="nextBtn" type="button">Siguiente →</button>
</div></nav>
<script>
window.L={json.dumps(L, ensure_ascii=False)};
{conf}
{js}
</script>
</body>
</html>
'''
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)

files = sorted(['audio/' + f for f in os.listdir(out + '/audio')] + ['img/' + f for f in os.listdir(out + '/img')] + ['index.html'])
ident = a.id
man = f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{ident}" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="ORG-{ident}"><organization identifier="ORG-{ident}"><title>{html.escape(title)}</title>
    <item identifier="ITEM-{ident}" identifierref="RES-{ident}" isvisible="true"><title>{html.escape(title)}</title><adlcp:masteryscore>80</adlcp:masteryscore></item></organization></organizations>
  <resources><resource identifier="RES-{ident}" type="webcontent" adlcp:scormtype="sco" href="index.html">
''' + ''.join(f'      <file href="{f}"/>\n' for f in files) + '''  </resource></resources>
</manifest>
'''
open(os.path.join(out, 'imsmanifest.xml'), 'w', encoding='utf-8').write(man)
zp = os.path.join(ROOT, 'dist', a.name + '_SCORM12.zip')
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(os.path.join(out, 'imsmanifest.xml'), 'imsmanifest.xml')
    for f in files: z.write(os.path.join(out, f), f)
print(f'{a.name}: {n} pantallas, {len(aud)} audios, {len(imgs)} imágenes, video {sum(video["durs"]):.0f}s → {os.path.getsize(zp)//1024} KB')

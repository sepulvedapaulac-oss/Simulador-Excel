"""Empaqueta una actividad práctica o simulador como SCORM 1.2.
uso: python3 build.py fuente.html --tipo actividad|simulador --id PYMES_M1_A1 --name Practica_1_1_Nombre
       --title "Título" --module 1 --img carpeta_imagenes --out carpeta_salida
La fuente es un fragmento HTML (contenido del cuerpo + <script> opcional con window.SIM)."""
import argparse, os, re, shutil, zipfile, base64, html, json
T = os.path.dirname(os.path.abspath(__file__))
p = argparse.ArgumentParser()
p.add_argument('src'); p.add_argument('--tipo', default='actividad'); p.add_argument('--id', required=True)
p.add_argument('--name', required=True); p.add_argument('--title', required=True); p.add_argument('--module', required=True)
p.add_argument('--img', default=''); p.add_argument('--out', required=True); p.add_argument('--pass', dest='pss', type=int, default=80)
a = p.parse_args()
body = open(a.src, encoding='utf-8').read()
css = open(os.path.join(T, 'practica.css'), encoding='utf-8').read()
js = open(os.path.join(T, 'practica.js'), encoding='utf-8').read()
MOD = {'1': 'Fundamentos de la Digitalización y Productividad en la Nube', '2': 'Presencia Digital y Canales de Venta',
       '3': 'Marketing Digital y Redes Sociales', '4': 'Gestión de Clientes (CRM) y Análisis de Datos'}
if a.tipo == 'simulador':
    chips = ['🧪 Simulador de práctica', f'Completa {3} casos', 'Nota = % de aciertos']
else:
    chips = ['🛠️ Actividad práctica', 'Nota sobre 100', f'Apruebas con {a.pss}%']
page = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(a.title)}</title><style>{css}</style></head><body><main class="app">
<header class="top"><div class="course">Herramientas Digitales para el Crecimiento de PYMES · Módulo {a.module}: {MOD[a.module]}</div>
<h1>{html.escape(a.title)}</h1><div class="chips">{''.join(f'<span class="chip">{c}</span>' for c in chips)}</div><div class="prog"><i></i></div></header>
{body}
<div id="result" hidden></div>
<p class="foot">Casos y empresas ficticios con fines educativos · Las pantallas de plataformas son recreaciones simplificadas.</p>
</main><script>window.ACT={json.dumps({'id': a.id, 'tipo': a.tipo, 'pass': a.pss})};</script>
<script>{js}</script></body></html>"""
# el script del simulador debe ir antes del motor
m = re.search(r'<script data-sim>(.*?)</script>', page, re.S)
if m:
    page = page.replace(m.group(0), '')
    page = page.replace('<script>window.ACT=', f'<script>{m.group(1)}</script><script>window.ACT=', 1)
imgs = sorted(set(re.findall(r'img/([\w.-]+\.(?:jpg|png|webp|svg))', page)))
dst = os.path.join(a.out, a.name); shutil.rmtree(dst, ignore_errors=True); os.makedirs(os.path.join(dst, 'img'), exist_ok=True)
for f in imgs: shutil.copy(os.path.join(a.img, f), os.path.join(dst, 'img', f))
open(os.path.join(dst, 'index.html'), 'w', encoding='utf-8').write(page)
files = ['index.html'] + [f'img/{f}' for f in imgs]
man = f"""<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{a.id}" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
<metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
<organizations default="ORG-{a.id}"><organization identifier="ORG-{a.id}"><title>{html.escape(a.title)}</title>
<item identifier="ITEM-{a.id}" identifierref="RES-{a.id}" isvisible="true"><title>{html.escape(a.title)}</title>{'' if a.tipo == 'simulador' else f'<adlcp:masteryscore>{a.pss}</adlcp:masteryscore>'}</item></organization></organizations>
<resources><resource identifier="RES-{a.id}" type="webcontent" adlcp:scormtype="sco" href="index.html">
{''.join(f'<file href="{f}"/>' for f in files)}
</resource></resources></manifest>"""
open(os.path.join(dst, 'imsmanifest.xml'), 'w', encoding='utf-8').write(man)
z = os.path.join(a.out, a.name + '_SCORM12.zip')
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in files + ['imsmanifest.xml']: zf.write(os.path.join(dst, f), f)
prev = page
for f in imgs:
    b = base64.b64encode(open(os.path.join(a.img, f), 'rb').read()).decode()
    prev = prev.replace(f'img/{f}', f'data:image/{"jpeg" if f.endswith("jpg") else f.rsplit(".",1)[1]};base64,{b}')
open(os.path.join(a.out, a.name + '.preview.html'), 'w', encoding='utf-8').write(prev)
print('ok', z, len(imgs), 'imágenes')

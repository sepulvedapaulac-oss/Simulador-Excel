#!/usr/bin/env python3
"""Construye una lección autocontenida + paquete SCORM 1.2.
uso: build.py fuente.html --title T --id ID --name NOMBRE --module M --course C --img img/ --out dist/"""
import argparse,base64,os,re,zipfile,html
H=os.path.dirname(os.path.abspath(__file__))
p=argparse.ArgumentParser();p.add_argument('src')
for o in('--title','--id','--name','--img','--out'):p.add_argument(o,required=True)
p.add_argument('--course',default='Herramientas Digitales para el Crecimiento de PYMES');p.add_argument('--module',default='Módulo 1 · Fundamentos de la Digitalización y Productividad en la Nube')
a=p.parse_args()
body=open(a.src,encoding='utf-8').read()
def img(m):
    f=os.path.join(a.img,m.group(1)+'.jpg')
    return 'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode()
used=sorted(set(re.findall(r'\{\{IMG:([\w-]+)\}\}',body)))
body=re.sub(r'src="\{\{IMG:([\w-]+)\}\}"',r'data-img="\1"',body)
imgjs='(function(){var I={'+','.join('"%s":"%s"'%(n,img(re.match(r'(.*)', n))) for n in used)+'};document.querySelectorAll("img[data-img]").forEach(function(e){e.src=I[e.getAttribute("data-img")]})})();'
css=open(os.path.join(H,'base.css'),encoding='utf-8').read();js=open(os.path.join(H,'engine.js'),encoding='utf-8').read()
page=f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light dark"><title>{html.escape(a.title)}</title><style>{css}</style></head>
<body><div data-lesson="{a.id}"><header class="topbar"><div class="toprow"><div><div class="course">{html.escape(a.course)}</div><div class="module">{html.escape(a.title)}</div></div><div class="topright"><span class="counter" id="counter"></span><button class="menu-btn" id="menuBtn" type="button" aria-label="Abrir ruta de la lección">☰ Ruta</button></div></div><div class="progress" aria-hidden="true"><div id="progressBar"></div></div></header>
<div class="layout"><aside class="route" aria-label="Ruta de la lección"><h2>Ruta de la lección</h2><ol id="routeList"></ol><p class="rnote">🔒 Completa cada actividad para desbloquear la siguiente.</p></aside>
<main class="stage" id="stage">{body}</main></div>
<nav class="nav" aria-label="Navegación"><div class="navrow"><button class="navbtn" id="prevBtn" type="button">← Anterior</button><span class="navhint" id="navHint" aria-live="polite"></span><button class="navbtn primary" id="nextBtn" type="button">Siguiente →</button></div></nav>
</div><script>{imgjs}</script><script>{js}</script></body></html>'''
os.makedirs(a.out,exist_ok=True)
hp=os.path.join(a.out,a.name+'.html');open(hp,'w',encoding='utf-8').write(page)
man=f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{a.id}_MANIFEST" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
<metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
<organizations default="ORG_{a.id}"><organization identifier="ORG_{a.id}"><title>{html.escape(a.title)}</title>
<item identifier="ITEM_{a.id}" identifierref="RES_{a.id}" isvisible="true"><title>{html.escape(a.title)}</title><adlcp:masteryscore>80</adlcp:masteryscore></item></organization></organizations>
<resources><resource identifier="RES_{a.id}" type="webcontent" adlcp:scormtype="sco" href="index.html"><file href="index.html"/></resource></resources></manifest>'''
zp=os.path.join(a.out,a.name+'_SCORM12.zip')
with zipfile.ZipFile(zp,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('imsmanifest.xml',man);z.writestr('index.html',page)
print(hp,os.path.getsize(hp)//1024,'KB');print(zp,os.path.getsize(zp)//1024,'KB')

# vista previa para Artifact (sin esqueleto propio: lo agrega la plataforma)
art=re.sub(r'^<!doctype html><html lang="es"><head>.*?(<title>)',r'\1',page,flags=re.S).replace('</head>\n<body>','\n').replace('</body></html>','')
art=re.sub(r'<title>Lección [0-9.]+ — ','<title>',art,count=1)
open(os.path.join(a.out,a.name+'.artifact.html'),'w',encoding='utf-8').write(art)

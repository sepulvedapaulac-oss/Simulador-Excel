#!/usr/bin/env python3
"""Construye una lección, actividad o simulador a partir de una fuente con marcadores.

Uso:
  python3 build.py leccion  fuente.html --title "Lección 1.1 — Título" --id CURSO_M1_L11 --name Leccion_1_1_Titulo --img img/ --aud aud/ --out salida/
  python3 build.py actividad fuente.html --title "Actividad práctica 1 — ..." --id CURSO_M1_AP1 --name Actividad_1 --out salida/
  python3 build.py simulador fuente.html --title "Simulador ..." --id CURSO_M1_SIM --name Simulador --out salida/

Marcadores que reemplaza:
  /*{{BASECSS}}*/ /*{{COMPCSS}}*/ /*{{ENGINE}}*/  siempre
  {{IMG:nombre}}   -> img/nombre.jpg  (incrustada en el HTML; archivo en el SCORM)
  {{AUDIO_JSON}}   -> diccionario clave->audio (archivos aud/<clave>.mp3)
  {{VDURS}}        -> duraciones de aud/video_1.mp3 ... video_N.mp3 (ffprobe)
  /*{{TAIL}}*/     -> 'go(0);' en el HTML y el seguimiento SCORM en el paquete
Genera en --out: <name>.html (autocontenido), <name>_SCORM12.zip y <name>.artifact.html (sin doctype, para publicar).
"""
import argparse,base64,json,os,re,shutil,subprocess,tempfile,zipfile
A=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets')
rd=lambda f:open(os.path.join(A,f),encoding='utf-8').read()
p=argparse.ArgumentParser();p.add_argument('tipo',choices=['leccion','actividad','simulador']);p.add_argument('src')
for k in ('title','id','name','out'):p.add_argument('--'+k,required=True)
p.add_argument('--img',default='img');p.add_argument('--aud',default='aud');p.add_argument('--pass-pct',default='80')
a=p.parse_args();os.makedirs(a.out,exist_ok=True)
comp=rd('comp.css')+rd('comp2.css')+(rd('ev.css') if a.tipo!='leccion' else '')
eng={'leccion':rd('engine.js'),'actividad':rd('ev_core.js')+rd('ev_tasks.js'),'simulador':rd('ev_core.js')}[a.tipo]
src=open(a.src,encoding='utf-8').read().replace('/*{{BASECSS}}*/',rd('base.css')).replace('/*{{COMPCSS}}*/',comp).replace('/*{{ENGINE}}*/',eng)
def dur(f):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
aud={};imgs=sorted(set(re.findall(r'\{\{IMG:([\w-]+)\}\}',src)))
if '{{AUDIO_JSON}}' in src:
    aud={os.path.splitext(f)[0]:os.path.join(a.aud,f) for f in sorted(os.listdir(a.aud)) if f.endswith('.mp3')}
    used=set(re.findall(r'data-audio="([\w-]+)"',src))
    miss=[k for k in used if k not in aud];assert not miss,f'Faltan audios: {miss}'
if '{{VDURS}}' in src:
    n=len([k for k in aud if k.startswith('video_')]);src=src.replace('{{VDURS}}',json.dumps([round(dur(aud[f'video_{i}']),2) for i in range(1,n+1)]))
def ext(n):
    for e in ('jpg','jpeg','png','webp'):
        f=os.path.join(a.img,f'{n}.{e}')
        if os.path.exists(f):return f,e
    raise SystemExit(f'Falta imagen {n} en {a.img}')
def wrap(s):
    t,r=s.split('</title>',1);st,b=r.split('</style>',1)
    return f'<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>\n{t}</title>\n{st}</style>\n</head>\n<body>\n{b}\n</body>\n</html>\n'
# 1) HTML autocontenido
s=src
for n in imgs:
    f,e=ext(n);s=s.replace('{{IMG:%s}}'%n,f'data:image/{"jpeg" if e=="jpg" else e};base64,'+base64.b64encode(open(f,'rb').read()).decode())
s=s.replace('{{AUDIO_JSON}}',json.dumps({k:'data:audio/mpeg;base64,'+base64.b64encode(open(v,'rb').read()).decode() for k,v in aud.items()}))
s=s.replace('/*{{TAIL}}*/','go(0);');left=re.findall(r'\{\{[^}]*\}\}',s);assert not left,left[:5]
open(os.path.join(a.out,a.name+'.artifact.html'),'w',encoding='utf-8').write(s)
open(os.path.join(a.out,a.name+'.html'),'w',encoding='utf-8').write(wrap(s))
# 2) Paquete SCORM 1.2
s=src;D=tempfile.mkdtemp()
for n in imgs:
    f,e=ext(n);os.makedirs(D+'/img',exist_ok=True);shutil.copy(f,f'{D}/img/{n}.{e}');s=s.replace('{{IMG:%s}}'%n,f'img/{n}.{e}')
for k,v in aud.items():os.makedirs(D+'/audio',exist_ok=True);shutil.copy(v,f'{D}/audio/{k}.mp3')
s=s.replace('{{AUDIO_JSON}}',json.dumps({k:f'audio/{k}.mp3' for k in aud})).replace('/*{{TAIL}}*/',rd('scorm_generic.js'))
open(D+'/index.html','w',encoding='utf-8').write(wrap(s))
files=sorted(os.path.relpath(os.path.join(r,f),D) for r,_,fs in os.walk(D) for f in fs)
ms='' if a.tipo=='simulador' else f'<adlcp:masteryscore>{a.pass_pct}</adlcp:masteryscore>'
fl='\n'.join(f'      <file href="{f}"/>' for f in files)
open(D+'/imsmanifest.xml','w',encoding='utf-8').write(f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{a.id}" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="ORG-{a.id}"><organization identifier="ORG-{a.id}"><title>{a.title}</title>
    <item identifier="ITEM-{a.id}" identifierref="RES-{a.id}" isvisible="true"><title>{a.title}</title>{ms}</item></organization></organizations>
  <resources><resource identifier="RES-{a.id}" type="webcontent" adlcp:scormtype="sco" href="index.html">
{fl}
  </resource></resources>
</manifest>
''')
z=os.path.join(a.out,a.name+'_SCORM12.zip')
if os.path.exists(z):os.remove(z)
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as zf:
    for f in files+['imsmanifest.xml']:zf.write(os.path.join(D,f),f)
shutil.rmtree(D);print('OK',a.name,'html',os.path.getsize(os.path.join(a.out,a.name+'.html')),'zip',os.path.getsize(z))

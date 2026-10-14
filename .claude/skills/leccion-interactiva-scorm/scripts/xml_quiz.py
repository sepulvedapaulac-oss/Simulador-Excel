#!/usr/bin/env python3
"""Genera un banco de preguntas de selección múltiple en formato Moodle XML (+ vista previa HTML) desde un JSON.
Uso: python3 xml_quiz.py preguntas.json salida/Nombre   -> Nombre.xml y Nombre_vista_previa.html
JSON: {"categoria":"Legislación laboral/Evaluación módulo 2","puntaje":2,"preguntas":[
  {"id":"m2.p1","tipo":"concepto|caso","enunciado":"<p>...</p>","opciones":[{"texto":"...","correcta":true,"fb":"por qué"}, ...],
   "fb_correcta":"...","fb_incorrecta":"...","fuente":"..."}]}
Valida: 4 opciones, 1 correcta, ids únicos, retroalimentación en todas las opciones, mezcla de concepto y caso."""
import json,sys,html,re
from collections import Counter
src,out=sys.argv[1],sys.argv[2];D=json.load(open(src,encoding='utf-8'));P=D['preguntas'];pts=D.get('puntaje',2)
err=[]
ids=[p['id'] for p in P];dup=[k for k,v in Counter(ids).items() if v>1]
if dup:err.append(f'ids repetidos {dup}')
for p in P:
  o=p['opciones']
  if len(o)!=4:err.append(f"{p['id']}: {len(o)} opciones (deben ser 4)")
  if sum(1 for x in o if x.get('correcta'))!=1:err.append(f"{p['id']}: debe haber exactamente 1 correcta")
  if not all(x.get('fb','').strip() for x in o):err.append(f"{p['id']}: falta retroalimentación en alguna opción")
  if not p.get('fb_correcta') or not p.get('fb_incorrecta'):err.append(f"{p['id']}: falta fb_correcta/fb_incorrecta")
tipos=Counter(p.get('tipo') for p in P)
if tipos.get('caso',0)<len(P)*0.4:err.append(f'pocas preguntas de caso práctico: {dict(tipos)}')
pos=Counter([i for p in P for i,x in enumerate(p['opciones']) if x.get('correcta')])
if len(P)>=4 and len(pos)<4:err.append(f'la posición de la correcta no varía lo suficiente: {dict(pos)}')
if err:sys.exit('ERRORES:\n- '+'\n- '.join(err))
c=lambda s:'<![CDATA['+s.replace(']]>',']]]]><![CDATA[>')+']]>'
x=['<?xml version="1.0" encoding="UTF-8"?>','<quiz>',f'  <question type="category"><category><text>$course$/top/{html.escape(D["categoria"])}</text></category><info format="html"><text></text></info></question>']
for p in P:
  gen=p['fb_correcta'] if False else ''
  x.append(f'''  <question type="multichoice">
    <name><text>{html.escape(p["id"])}</text></name>
    <questiontext format="html"><text>{c(p["enunciado"])}</text></questiontext>
    <generalfeedback format="html"><text>{c(p.get("fuente") and "<p><small>Fuente: "+p["fuente"]+"</small></p>" or "")}</text></generalfeedback>
    <defaultgrade>{pts}</defaultgrade><penalty>0</penalty><hidden>0</hidden><idnumber>{html.escape(p["id"])}</idnumber>
    <single>true</single><shuffleanswers>true</shuffleanswers><answernumbering>abc</answernumbering><showstandardinstruction>0</showstandardinstruction>
    <correctfeedback format="html"><text>{c("<p><b>¡Correcto!</b> "+p["fb_correcta"]+"</p>")}</text></correctfeedback>
    <partiallycorrectfeedback format="html"><text></text></partiallycorrectfeedback>
    <incorrectfeedback format="html"><text>{c("<p><b>Incorrecto.</b> "+p["fb_incorrecta"]+"</p>")}</text></incorrectfeedback>''')
  for o in p['opciones']:
    x.append(f'''    <answer fraction="{100 if o.get("correcta") else 0}" format="html"><text>{c(o["texto"])}</text><feedback format="html"><text>{c(o["fb"])}</text></feedback></answer>''')
  x.append('  </question>')
x.append('</quiz>')
open(out+'.xml','w',encoding='utf-8').write('\n'.join(x)+'\n')
import xml.dom.minidom;xml.dom.minidom.parse(out+'.xml')
L='ABCD'
rows=''.join(f'''<article><h3>{html.escape(p["id"])} <span class="t">{"Caso práctico" if p.get("tipo")=="caso" else "Concepto"} · {pts} puntos</span></h3>{p["enunciado"]}<ol type="a">{"".join(f'<li class="{"ok" if o.get("correcta") else ""}">{o["texto"]}<div class="fb">{"✔ " if o.get("correcta") else "✘ "}{o["fb"]}</div></li>' for o in p["opciones"])}</ol>
<p class="g"><b>Si responde bien:</b> {p["fb_correcta"]}<br/><b>Si responde mal:</b> {p["fb_incorrecta"]}</p>{f'<p class="s">Fuente: {p["fuente"]}</p>' if p.get("fuente") else ""}</article>''' for p in P)
open(out+'_vista_previa.html','w',encoding='utf-8').write(f'''<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>{html.escape(D["categoria"])}</title>
<style>body{{font-family:system-ui,sans-serif;max-width:860px;margin:auto;padding:16px;line-height:1.5;color:#1d2b33;background:#f6f8f9}}article{{background:#fff;border:1px solid #d6dee2;border-radius:14px;padding:14px 18px;margin:14px 0}}h3{{margin:0 0 6px}}.t{{font-size:.8rem;color:#5b6b73;font-weight:600}}li{{margin:6px 0}}li.ok{{font-weight:700;color:#11683f}}.fb{{font-weight:400;font-size:.88rem;color:#46555d}}.g{{background:#eef6f4;border-radius:10px;padding:8px 12px}}.s{{font-size:.8rem;color:#6b7a82}}</style></head>
<body><h1>{html.escape(D["categoria"])}</h1><p>{len(P)} preguntas · {pts} puntos cada una · total {len(P)*pts} puntos · tipos: {dict(tipos)}</p>{rows}</body></html>''')
print('OK',out+'.xml',len(P),'preguntas',dict(tipos),'posiciones',dict(pos))

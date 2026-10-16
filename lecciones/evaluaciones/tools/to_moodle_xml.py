"""Convierte un banco JSON en Moodle XML (opción múltiple, una respuesta correcta).
uso: python3 to_moodle_xml.py fuente.json salida.xml
JSON: {"categoria": "...", "puntaje": 2, "preguntas": [{"id","tema","caso"?, "q","o":[...],"c":i,"f":[...], "g"?}]}"""
import json, sys, html
src, out = sys.argv[1:3]
d = json.load(open(src, encoding='utf-8'))
pts = d.get('puntaje', 2)
cdata = lambda s: '<![CDATA[' + s.replace(']]>', ']]]]><![CDATA[>') + ']]>'
def para(s):
    return ''.join(f'<p>{html.escape(x)}</p>' for x in s.split('\n') if x.strip())
L = ['<?xml version="1.0" encoding="UTF-8"?>', '<quiz>',
     '<question type="category"><category><text>$course$/top/' + html.escape(d['categoria']) + '</text></category>'
     '<info format="html"><text></text></info></question>']
ids = set()
for q in d['preguntas']:
    assert q['id'] not in ids, q['id']; ids.add(q['id'])
    assert len(q['o']) == len(q['f']) and 0 <= q['c'] < len(q['o']), q['id']
    body = ''
    if q.get('caso') or q.get('caso_html'):
        inner = q.get('caso_html') or para(q['caso'])
        body = '<div style="background:#f4fbfb;border-left:4px solid #0f7a82;padding:10px 14px;margin-bottom:10px"><p><strong>Caso</strong></p>' + inner + '</div>'
    body += para(q['q'])
    ok = q['f'][q['c']]
    L.append('<question type="multichoice">')
    L.append(f'<name><text>{html.escape(q["id"])}</text></name>')
    L.append(f'<questiontext format="html"><text>{cdata(body)}</text></questiontext>')
    L.append(f'<generalfeedback format="html"><text>{cdata(para(q.get("g", "")))}</text></generalfeedback>')
    L.append(f'<defaultgrade>{pts}</defaultgrade><penalty>0</penalty><hidden>0</hidden>')
    L.append(f'<idnumber>{html.escape(q["id"])}</idnumber>')
    L.append('<single>true</single><shuffleanswers>true</shuffleanswers><answernumbering>abc</answernumbering><showstandardinstruction>0</showstandardinstruction>')
    L.append(f'<correctfeedback format="html"><text>{cdata("<p><strong>✔ Respuesta correcta.</strong></p>")}</text></correctfeedback>')
    L.append(f'<partiallycorrectfeedback format="html"><text></text></partiallycorrectfeedback>')
    L.append(f'<incorrectfeedback format="html"><text>{cdata("<p><strong>✘ Respuesta incorrecta.</strong> " + html.escape(ok) + "</p>")}</text></incorrectfeedback>')
    L.append('<shownumcorrect/>')
    for i, (o, f) in enumerate(zip(q['o'], q['f'])):
        pre = '✔ Correcto. ' if i == q['c'] else '✘ Incorrecto. '
        L.append(f'<answer fraction="{100 if i == q["c"] else 0}" format="html"><text>{cdata("<p>" + html.escape(o) + "</p>")}</text>'
                 f'<feedback format="html"><text>{cdata("<p>" + html.escape(pre + f) + "</p>")}</text></feedback></answer>')
    L.append('</question>')
L.append('</quiz>')
open(out, 'w', encoding='utf-8').write('\n'.join(L))
print(out, len(d['preguntas']), 'preguntas ·', pts * len(d['preguntas']), 'puntos')

#!/usr/bin/env python3
"""Genera cuestionarios Moodle XML (opción múltiple, una respuesta correcta) con feedback
en cada alternativa, correcta o incorrecta, y feedback general por pregunta.

Uso: python3 tools/build_xml.py src/modulo1/cuestionario.py
El archivo .py debe definir CATEGORY (str) y QUESTIONS (lista de dicts):
  {"name": "...", "text": "...", "answers": [("texto", correcta(bool), "feedback"), ...], "general": "..."}
Salida: dist/<modulo>/Cuestionario_<modulo>_Moodle.xml
"""
import html, runpy, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def cdata(s):
    return "<![CDATA[" + s.replace("]]>", "]]]]><![CDATA[>") + "]]>"


def question(q):
    ans = []
    for text, ok, fb in q["answers"]:
        ans.append(f"""    <answer fraction="{100 if ok else 0}" format="html">
      <text>{cdata('<p>' + text + '</p>')}</text>
      <feedback format="html"><text>{cdata('<p>' + ('<strong>Correcto.</strong> ' if ok else '<strong>Incorrecto.</strong> ') + fb + '</p>')}</text></feedback>
    </answer>""")
    return f"""  <question type="multichoice">
    <name><text>{html.escape(q['name'])}</text></name>
    <questiontext format="html"><text>{cdata('<p>' + q['text'] + '</p>')}</text></questiontext>
    <generalfeedback format="html"><text>{cdata('<p>' + q.get('general', '') + '</p>')}</text></generalfeedback>
    <defaultgrade>1.0000000</defaultgrade>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>abc</answernumbering>
    <showstandardinstruction>0</showstandardinstruction>
    <correctfeedback format="html"><text>{cdata('<p>¡Respuesta correcta!</p>')}</text></correctfeedback>
    <partiallycorrectfeedback format="html"><text></text></partiallycorrectfeedback>
    <incorrectfeedback format="html"><text>{cdata('<p>Respuesta incorrecta. Revisa la explicación de tu alternativa.</p>')}</text></incorrectfeedback>
{chr(10).join(ans)}
  </question>"""


def main(src):
    src = (ROOT / src).resolve()
    d = runpy.run_path(str(src))
    qs = d["QUESTIONS"]
    for q in qs:
        assert sum(1 for a in q["answers"] if a[1]) == 1, f"Pregunta sin una única correcta: {q['name']}"
        assert all(a[2] for a in q["answers"]), f"Falta feedback en: {q['name']}"
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="category">
    <category><text>$course$/top/{html.escape(d['CATEGORY'])}</text></category>
  </question>
{chr(10).join(question(q) for q in qs)}
</quiz>
"""
    out = ROOT / "dist" / src.parent.relative_to(ROOT / "src") / d["FILENAME"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(xml, encoding="utf-8")
    print(f"OK {out.relative_to(ROOT)} · {len(qs)} preguntas")


if __name__ == "__main__":
    main(sys.argv[1])

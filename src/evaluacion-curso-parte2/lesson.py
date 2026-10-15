# Evaluación final · Parte 2 (caso práctico integrador) como SCORM independiente.
# Se usa cuando la Parte 1 se monta como cuestionario Moodle XML (banco Evaluacion_final_curso_Parte1_Moodle.xml).
# Reutiliza lesson.js y content.html de src/evaluacion-curso: quita la pantalla de la Parte 1 y ajusta las instrucciones.
import json, pathlib, re
here = pathlib.Path(__file__).parent
base = here.parent / "evaluacion-curso"
L = {"id": "ia_rem_eval_curso_p2", "ident": "IAREM_EVAL_CURSO_P2", "zip_name": "Evaluacion_final_Parte2_caso_practico",
     "title": "Evaluación final · Parte 2: Caso práctico integrador — IA aplicada a la Gestión de Remuneraciones",
     "course_label": "IA EN REMUNERACIONES · EVALUACIÓN FINAL · PARTE 2",
     "voice": False, "pass": 0.7, "lab": True, "hoja": True, "p1": [], "soloP2": True}
here.joinpath("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
(here / "lesson.js").write_text((base / "lesson.js").read_text(encoding="utf-8"), encoding="utf-8")
c = (base / "content.html").read_text(encoding="utf-8")
c = re.sub(r'<!-- 2 · PARTE 1 -->\s*<section class="slide" data-title="Parte 1: preguntas".*?</section>\s*', "", c, flags=re.S)
rep = [
 ('<span class="lab-badge">Evaluación final del curso</span>', '<span class="lab-badge">Evaluación final del curso · Parte 2</span>'),
 ('<h1>Integra lo aprendido en los cuatro módulos</h1>', '<h1>Caso práctico integrador</h1>'),
 ('Tiene dos partes y, al terminar, podrás', 'Ya respondiste la Parte 1 (cuestionario). Esta Parte 2 es un caso práctico que integra los cuatro módulos y, al terminar, podrás'),
 ('<div class="fe-part"><b>Parte 1 · 20 preguntas</b>Cinco preguntas de selección múltiple por módulo, identificadas como M1.P1, M1.P2… hasta M4.P5. Al responder cada una verás si es correcta o incorrecta, con su explicación. Cada pregunta se responde una sola vez.</div>',
  '<div class="fe-part"><b>Lo que harás</b>Actuarás como Camila en el cierre de noviembre de AndesCorp. Cada tarea corresponde a un aprendizaje esperado del curso (AE1 a AE4) y recibes retroalimentación al confirmarla.</div>'),
 ('<b>Parte 2 · Laboratorio de análisis</b>', '<b>Cuatro tareas</b>'),
 ('Parte 1 (50 %) + Parte 2 (50 %). Apruebas con <b>70 %</b>.', 'Promedio de las cuatro tareas. Apruebas con <b>70 %</b>. Esta parte equivale al 35 % de la nota final del curso y debes aprobarla.'),
 ('<span class="lab-badge">Parte 2 de 2 · Laboratorio de análisis</span>', '<span class="lab-badge">Parte 2 · Caso práctico integrador</span>'),
]
for a, b in rep:
    assert a in c, a
    c = c.replace(a, b)
(here / "content.html").write_text(c, encoding="utf-8")
print("lesson.json, lesson.js y content.html OK")

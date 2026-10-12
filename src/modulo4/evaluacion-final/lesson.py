import json, pathlib
L = {"id": "ia_rem_eval4", "ident": "IAREM_M4_EVAL", "zip_name": "Evaluacion_final_Modulo_4_Modernizando_el_cierre",
 "title": "Evaluación final del Módulo 4 — Modernizando el cierre mensual",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 4 · EVALUACIÓN FINAL",
 "voice": False, "pass": 0.7, "lab": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

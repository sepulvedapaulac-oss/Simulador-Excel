import json, pathlib
L = {"id": "ia_rem_eval3", "ident": "IAREM_M3_EVAL", "zip_name": "Evaluacion_final_Modulo_3_La_gerencia_necesita_respuestas",
 "title": "Evaluación final del Módulo 3 — La gerencia necesita respuestas",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 3 · EVALUACIÓN FINAL",
 "voice": False, "pass": 0.7, "lab": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

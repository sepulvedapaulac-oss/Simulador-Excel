import json, pathlib
L = {"id": "ia_rem_eval2", "ident": "IAREM_M2_EVAL", "zip_name": "Evaluacion_final_Modulo_2_Cierre_bajo_revision",
 "title": "Evaluación final del Módulo 2 — Cierre de remuneraciones bajo revisión",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 2 · EVALUACIÓN FINAL",
 "voice": False, "pass": 0.7, "lab": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

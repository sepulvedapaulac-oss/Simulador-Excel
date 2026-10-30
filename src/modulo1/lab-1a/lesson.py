import json, pathlib
L = {"id": "ia_rem_lab1a", "ident": "IAREM_M1_LAB1A", "zip_name": "Laboratorio_1A_Prompts",
 "title": "Laboratorio 1A — Laboratorio de prompts", "course_label": "IA EN REMUNERACIONES · MÓDULO 1 · LABORATORIO 1A",
 "voice": False, "pass": 0.7, "practice": True, "lab": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

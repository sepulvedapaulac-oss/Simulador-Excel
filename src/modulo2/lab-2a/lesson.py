import json, pathlib
L = {"id": "ia_rem_lab2a", "ident": "IAREM_M2_LAB2A", "zip_name": "Laboratorio_2A_Formulas_de_control",
 "title": "Laboratorio 2A — Fórmulas de control", "course_label": "IA EN REMUNERACIONES · MÓDULO 2 · LABORATORIO 2A",
 "voice": False, "pass": 0.7, "lab": True, "hoja": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

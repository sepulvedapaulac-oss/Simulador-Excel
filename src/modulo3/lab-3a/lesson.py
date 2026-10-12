import json, pathlib
L = {"id": "ia_rem_lab3a", "ident": "IAREM_M3_LAB3A", "zip_name": "Laboratorio_3A_Variaciones_mensuales",
 "title": "Laboratorio 3A — Variaciones mensuales", "course_label": "IA EN REMUNERACIONES · MÓDULO 3 · LABORATORIO 3A",
 "voice": False, "pass": 0.7, "lab": True, "hoja": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

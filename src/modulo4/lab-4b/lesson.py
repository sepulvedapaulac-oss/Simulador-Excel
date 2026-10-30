import json, pathlib
L = {"id": "ia_rem_lab4b", "ident": "IAREM_M4_LAB4B", "zip_name": "Laboratorio_4B_Simulador_de_flujo",
 "title": "Laboratorio 4B — Simulador de flujo con puntos de control", "course_label": "IA EN REMUNERACIONES · MÓDULO 4 · LABORATORIO 4B",
 "voice": False, "pass": 0.7, "practice": True, "lab": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

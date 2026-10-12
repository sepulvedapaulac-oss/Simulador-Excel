import json, pathlib
L = {"id": "ia_rem_lab3b", "ident": "IAREM_M3_LAB3B", "zip_name": "Laboratorio_3B_Tablero_de_indicadores",
 "title": "Laboratorio 3B — Tablero de indicadores", "course_label": "IA EN REMUNERACIONES · MÓDULO 3 · LABORATORIO 3B",
 "voice": False, "pass": 0.7, "lab": True, "hoja": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

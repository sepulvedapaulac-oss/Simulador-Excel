import json, pathlib
L = {"id": "ia_rem_lab4a", "ident": "IAREM_M4_LAB4A", "zip_name": "Laboratorio_4A_Checklist_de_cierre",
 "title": "Laboratorio 4A — Checklist de cierre con controles automáticos", "course_label": "IA EN REMUNERACIONES · MÓDULO 4 · LABORATORIO 4A",
 "voice": False, "pass": 0.7, "practice": True, "lab": True, "hoja": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

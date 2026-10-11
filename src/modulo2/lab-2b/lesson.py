import json, pathlib
L = {"id": "ia_rem_lab2b", "ident": "IAREM_M2_LAB2B", "zip_name": "Laboratorio_2B_Auditoria_del_cierre",
 "title": "Laboratorio 2B — Auditoría del cierre: 12 registros con errores",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 2 · LABORATORIO 2B",
 "voice": False, "pass": 0.7, "lab": True, "hoja": True}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok")

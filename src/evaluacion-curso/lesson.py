# Genera lesson.json de la Evaluación final del curso (sin narración)
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from preguntas import P

L = {"id": "ia_rem_eval_curso", "ident": "IAREM_EVAL_CURSO", "zip_name": "Evaluacion_final_del_curso",
     "title": "Evaluación final del curso — IA aplicada a la Gestión de Remuneraciones",
     "course_label": "IA EN REMUNERACIONES · EVALUACIÓN FINAL DEL CURSO",
     "voice": False, "pass": 0.6, "lab": True, "hoja": True, "p1": P}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")

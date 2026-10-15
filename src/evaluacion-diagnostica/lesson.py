# Genera lesson.json de la Evaluación diagnóstica integral (sin narración, sin nota)
import json, pathlib, sys
here = pathlib.Path(__file__).parent
sys.path.insert(0, str(here)); sys.path.insert(0, str(here.parent / "curso"))
from preguntas import P, AUTO, NIVELES_AUTO
from datos import MODULOS, COMPETENCIA, CURSO, HORAS

AE = [{"ae": m["ae"], "mod": f"Módulo {m['n']} · {m['titulo']}", "corto": m["titulo"], "txt": m["aprendizaje"],
       "lecc": {l.split(" ", 1)[0]: l for l in m["lecciones"]}} for m in MODULOS]
L = {"id": "ia_rem_diagnostico", "ident": "IAREM_DIAGNOSTICO", "zip_name": "Evaluacion_diagnostica_integral",
     "title": "Evaluación diagnóstica integral — IA aplicada a la Gestión de Remuneraciones",
     "course_label": "IA EN REMUNERACIONES · EVALUACIÓN DIAGNÓSTICA",
     "badge": "🧭 Diagnóstico sin nota",
     "voice": False, "pass": 0, "lab": True,
     "dg": {"P": P, "AUTO": AUTO, "NIV": NIVELES_AUTO, "AE": AE, "COMP": COMPETENCIA, "CURSO": CURSO, "HORAS": HORAS}}
here.joinpath("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")

# Banco Moodle XML con las 20 preguntas de la Parte 1 de la evaluación final del curso (M1.P1 … M4.P5)
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from preguntas import P
CATEGORY = "IA en Remuneraciones/Evaluación final del curso · Parte 1"
FILENAME = "Evaluacion_final_curso_Parte1_Moodle.xml"
QUESTIONS = [{"name": f"{q['id']} {q['tema']}", "text": q["q"],
              "answers": [(o, j == q["c"], q["f"][j]) for j, o in enumerate(q["o"])],
              "general": q["f"][q["c"]]} for q in P]

"""Empaqueta los recursos de un módulo en una carpeta + zip para entregar.
Uso: python3 tools/entrega/pack.py N  (lee la configuración de CFG[N])"""
import sys, shutil, pathlib, zipfile, glob
ROOT = pathlib.Path('/home/user/Simulador-Excel')
SP = ROOT / 'entregas'
CFG = {
 2: {"name": "Modulo2_IA_Remuneraciones", "title": "MÓDULO 2 · Revisión asistida por IA",
     "lessons": ["Leccion_2_1", "Leccion_2_2", "Leccion_2_3", "Leccion_2_4"], "labs": ["Laboratorio_2A", "Laboratorio_2B"], "eval": "Evaluacion_final_Modulo_2",
     "mind": ("El cierre con diferencias en horas extraordinarias", "cmv38qdi3000006k1j4nd1mfc"),
     "lesson_txt": ["Lección 2.1 La información que debe revisar la IA  (con voz)", "Lección 2.2 IA como asistente para fórmulas de Excel  (sin voz)", "Lección 2.3 Detección asistida de inconsistencias  (con voz)", "Lección 2.4 Validación y control de calidad  (sin voz)"],
     "lab_txt": ["Laboratorio 2A: fórmulas de control en el simulador de Excel", "Laboratorio 2B: auditoría del cierre (12 registros con errores)"],
     "eval_txt": "Evaluación final ramificada: “Cierre de remuneraciones bajo revisión” (SCORM con nota, aprobación 70 %)"},
 3: {"name": "Modulo3_IA_Remuneraciones", "title": "MÓDULO 3 · Análisis e informes con IA",
     "lessons": ["Leccion_3_1", "Leccion_3_2", "Leccion_3_3", "Leccion_3_4"], "labs": ["Laboratorio_3A", "Laboratorio_3B"], "eval": "Evaluacion_final_Modulo_3",
     "mind": ("Explicar a la gerencia el aumento del 8 %", "cmv4svhtu000006l33odfrudv"),
     "lesson_txt": ["Lección 3.1 Preparación de datos para análisis  (con voz)", "Lección 3.2 Variaciones mensuales  (sin voz)", "Lección 3.3 Indicadores y visualización  (con voz)", "Lección 3.4 Informes ejecutivos con IA  (sin voz)"],
     "lab_txt": ["Laboratorio 3A: variaciones mensuales por área en el simulador de Excel", "Laboratorio 3B: tablero de indicadores y gráfico honesto"],
     "eval_txt": "Evaluación final ramificada: “La gerencia necesita respuestas” (SCORM con nota, aprobación 70 %)"},
 4: {"name": "Modulo4_IA_Remuneraciones", "title": "MÓDULO 4 · Automatización y proyecto integrador",
     "lessons": ["Leccion_4_1", "Leccion_4_2", "Leccion_4_3", "Leccion_4_4"], "labs": ["Laboratorio_4A", "Laboratorio_4B"], "eval": "Evaluacion_final_Modulo_4",
     "mind": ("Rediseñar una tarea del cierre con control humano", "cmv4tzacm000006pdw1ewhn55"),
     "lesson_txt": ["Lección 4.1 Oportunidades de automatización  (con voz)", "Lección 4.2 Asistentes de IA para tareas administrativas  (sin voz)", "Lección 4.3 Flujo de remuneraciones asistido por IA  (con voz)", "Lección 4.4 Proyecto integrador  (sin voz)"],
     "lab_txt": ["Laboratorio 4A: hoja de controles del cierre en el simulador de Excel", "Laboratorio 4B: simulador de flujo con puntos de control"],
     "eval_txt": "Evaluación final ramificada: “Modernizando el cierre mensual” (SCORM con nota, aprobación 70 %)"},
}
n = int(sys.argv[1]); c = CFG[n]; out = SP / c["name"]
if out.exists(): shutil.rmtree(out)
dirs = {k: out / k for k in ["01_Lecciones_SCORM", "02_Laboratorios_y_Evaluacion_SCORM", "03_Cuestionario_Moodle_XML", "04_PDF", "05_Resumen_y_Glosario_HTML", "06_Video_MP4"]}
for d in dirs.values(): d.mkdir(parents=True)
def one(pat):
    m = sorted(glob.glob(str(ROOT / 'dist' / (pat + '*_SCORM12.zip'))))
    assert len(m) == 1, (pat, m); return m[0]
for p in c["lessons"]: shutil.copy(one(p), dirs["01_Lecciones_SCORM"])
for p in c["labs"] + [c["eval"]]: shutil.copy(one(p), dirs["02_Laboratorios_y_Evaluacion_SCORM"])
md = ROOT / 'dist' / f'modulo{n}'
for f in md.glob('*.xml'): shutil.copy(f, dirs["03_Cuestionario_Moodle_XML"])
for f in md.glob('*.pdf'): shutil.copy(f, dirs["04_PDF"])
for f in md.glob('*.html'): shutil.copy(f, dirs["05_Resumen_y_Glosario_HTML"])
vids = list(md.glob('*.mp4')) + list(md.glob('*.vtt'))
for f in vids: shutil.copy(f, dirs["06_Video_MP4"])
L = [f"CURSO: Inteligencia Artificial aplicada a la Gestión de Remuneraciones", c["title"], "",
     "01_Lecciones_SCORM (Moodle: Agregar actividad > Paquete SCORM, subir el .zip tal cual)"] + ["   " + t for t in c["lesson_txt"]] + ["",
     "02_Laboratorios_y_Evaluacion_SCORM (paquetes SCORM con nota; aprobación 70 %)"] + ["   " + t for t in c["lab_txt"]] + ["   " + c["eval_txt"],
     "   Laboratorios sin narración: pendiente de tu aprobación para agregarla.", "",
     "03_Cuestionario_Moodle_XML (Banco de preguntas > Importar > formato \"Moodle XML\")", "   10 preguntas de selección múltiple con feedback en cada alternativa.", "",
     "04_PDF", ] + ["   " + f.name for f in sorted(md.glob('*.pdf'))] + ["",
     "05_Resumen_y_Glosario_HTML (Moodle: Recurso > Archivo, o incrustar en una Página)", "   Carruseles responsivos claro/oscuro.", "",
     "06_Video_MP4", "   Video de presentación del módulo (1080p, voz, sin música) + subtítulos .vtt" + ("" if vids else " (se entrega aparte apenas termine de generarse)."), "",
     f"CASO MINDSMITH (Módulo {n})", f"   \"{c['mind'][0]}\"", f"   Editor: https://app.mindsmith.ai/lesson/{c['mind'][1]}", "   Está sin publicar: revísalo y publícalo desde Mindsmith cuando lo apruebes."]
(out / 'LEEME.txt').write_text("\n".join(L) + "\n", encoding='utf-8')
z = SP / (c["name"] + '.zip')
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(out.rglob('*')): zf.write(f, f.relative_to(SP))
print(z, round(z.stat().st_size / 1e6, 1), 'MB', 'video' if vids else 'sin video')

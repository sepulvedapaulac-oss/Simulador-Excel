#!/usr/bin/env python3
"""Guía del participante (versión Moodle) actualizada a la planilla SENCE de reingreso (sol. 1960022).
Cuerpo en HTML -> PDF A4 con Chromium; portada = página 1 del PDF publicado en Moodle."""
import os,glob,sys
from html import escape as e
H=os.path.dirname(os.path.abspath(__file__))
CSS=open(os.path.join(H,'guia.css'),encoding='utf-8').read()
AE=["Identificar principios del Derecho Laboral en la relación de trabajo, de acuerdo al Código del Trabajo.",
"Describir condiciones del contrato individual de trabajo en la gestión de la contratación, de acuerdo al Código del Trabajo.",
"Explicar derechos laborales en la tramitación de solicitudes del trabajador, de acuerdo al Código del Trabajo.",
"Distinguir conductas de acoso en la gestión de denuncias laborales, de acuerdo a la Ley N.º 21.643.",
"Analizar procedimientos de término del contrato de trabajo en la gestión de personas, de acuerdo al Código del Trabajo."]
CRIT=["Identifica"+AE[0][len("Identificar"):],"Describe"+AE[1][len("Describir"):],"Explica"+AE[2][len("Explicar"):],"Distingue"+AE[3][len("Distinguir"):],"Analiza"+AE[4][len("Analizar"):]]
MOD=[("Fundamentos de la legislación laboral chilena",9,"5 h 25 min","2 h 05 min","1 h 30 min",
  "Microlecciones interactivas y un caso aplicado en que reconoces principios, fuentes, organismos fiscalizadores y obligaciones de las partes; luego haces el diagnóstico de riesgos de una situación laboral.",
  ["1.1 ¿Por qué existe el Derecho Laboral?","1.2 ¿De dónde provienen las reglas laborales?","1.3 ¿Quién fiscaliza y orienta?","1.4 Dos partes, derechos y obligaciones","1.5 Derechos que no pueden simplemente dejarse sin efecto"],
  ["Caso aplicado · decisiones cotidianas que pueden generar incumplimientos","Actividad práctica 1.1 · Revisión preventiva","Actividad práctica 1.2 · Construye el diagnóstico","PDF: Ficha de diagnóstico de riesgos laborales","PDF: Mapa rápido de derechos, obligaciones y límites laborales","Resumen y glosario interactivos","Evaluación del módulo: cuestionario de 10 preguntas (8 %)"]),
 ("Contratación, jornada de trabajo y remuneraciones",11,"8 h 25 min","55 min","1 h 40 min",
  "Microlecciones, comparadores interactivos, un simulador y documentos simulados en que describes el contrato, la jornada, las horas extraordinarias, el registro de asistencia, las remuneraciones y los descuentos.",
  ["2.1 La relación laboral comienza","2.2 No todos los contratos funcionan igual","2.3 ¿Qué debe decir el contrato?","2.4 Organizar el tiempo de trabajo","2.5 Ley de 40 Horas en la práctica","2.6 Cuando la jornada se extiende","2.7 Registrar para demostrar","2.8 Leer una remuneración","2.9 ¿Qué puede descontarse?"],
  ["Actividad práctica 2.1 · Jornada y horas extra","Actividad práctica 2.2 · Remuneraciones y descuentos","Práctica formativa · Simulador de remuneraciones","Práctica formativa · Laboratorio «Auditoría de jornada y sueldo»","PDF: Ficha de revisión de contrato y jornada","PDF: Guía rápida: jornada, horas extraordinarias y remuneraciones 2026","Resumen y glosario interactivos","Evaluación del módulo: Parte 1: cuestionario de 10 preguntas (4 %) · Parte 2: tarea con rúbrica «El primer mes de Francisca», corregida por la tutora (4 %)"]),
 ("Derechos laborales, conciliación y corresponsabilidad",12,"7 h","3 h 20 min","1 h 40 min",
  "Microlecciones y escenarios ramificados en que explicas derechos fundamentales, igualdad de trato, protección familiar, conciliación, cuidados, feriado, permisos e inclusión, y fundamentas la respuesta a solicitudes laborales.",
  ["3.1 Derechos fundamentales dentro de la empresa","3.2 Igualdad de trato y no discriminación","3.3 Maternidad, paternidad y protección familiar","3.4 Conciliar trabajo y vida personal","3.5 Personas que ejercen labores de cuidado","3.6 Gestionar solicitudes vinculadas a responsabilidades familiares","3.7 Feriado, permisos y licencias","3.8 Inclusión laboral"],
  ["Actividad práctica 3.1 · Teletrabajo para una persona cuidadora","Actividad práctica 3.2 · Selección sin discriminación","Práctica formativa · Laboratorio «Cierre anual de Personas»","PDF: Ficha para resolver solicitudes laborales con fundamentación","PDF: Mapa de derechos: dignidad, protección familiar, conciliación e inclusión","Evaluación del módulo: Parte 1: cuestionario de 10 preguntas (4 %) · Parte 2: tarea con rúbrica «Las cinco solicitudes de Cristián», corregida por la tutora (4 %)"]),
 ("Prevención del acoso, violencia y gestión de relaciones laborales",13,"6 h 25 min","4 h 55 min","1 h 40 min",
  "Microlecciones y actividades de clasificación en que distingues acoso laboral, acoso sexual, violencia y conflicto, junto con las medidas de prevención, denuncia, investigación y resguardo.",
  ["4.1 El derecho a trabajar en un entorno seguro","4.2 Distinguir acoso laboral, acoso sexual y violencia","4.3 Prevenir antes de reaccionar","4.4 El protocolo como herramienta de gestión","4.5 ¿Qué ocurre cuando se presenta una denuncia?","4.6 Investigación y medidas de resguardo","4.7 Conflicto no es lo mismo que acoso"],
  ["Actividad práctica 4.1 · Denuncia y resguardo","Actividad práctica 4.2 · ¿Conflicto o acoso?","Práctica formativa · Laboratorio «Protocolo y denuncia»","PDF: Ficha de clasificación: conflicto, acoso o violencia","PDF: Ruta de actuación Ley Karin","Evaluación del módulo: Parte 1: cuestionario de 10 preguntas (4 %) · Parte 2: tarea con rúbrica «Cinco reportes en una semana», corregida por la tutora (4 %)"]),
 ("Término de la relación laboral y cumplimiento normativo",15,"7 h 55 min","2 h 55 min","4 h 10 min",
  "Microlecciones, actividades y un laboratorio en que analizas causales, comunicación del término, indemnizaciones, finiquito, fiscalización y evidencia de cumplimiento; luego auditas un caso completo y rindes la evaluación final del curso.",
  ["5.1 ¿Cómo puede terminar una relación laboral?","5.2 Renuncia, acuerdo y vencimiento","5.3 Necesidades de la empresa y otras causales","5.4 Comunicar correctamente el término","5.5 Indemnizaciones y prestaciones asociadas","5.6 Finiquito y formalización del cierre","5.7 Fiscalización laboral","5.8 La evidencia también es cumplimiento","5.9 ¿Qué ocurre cuando se incumple?"],
  ["Actividad práctica 5.1 · Causal y carta de despido","Actividad práctica 5.2 · Plazo fijo y mutuo acuerdo","Práctica formativa · Laboratorio «Finiquito e indemnizaciones»","PDF: Auditoría simplificada del término de la relación laboral","PDF: Mapa del cierre: causales, plazos, pagos y evidencia","Resumen y glosario interactivos","Evaluación del módulo: Parte 1: cuestionario de 10 preguntas (4 %) · Parte 2: tarea con rúbrica «El cierre del servicio Los Aromos», corregida por la tutora (4 %)"]),
]
TOT=("35 h 10 min","14 h 10 min","10 h 40 min")
EVAL=[("Módulo 1: cuestionario de 10 preguntas","8 %"),("Cuestionarios de los módulos 2 a 5, Parte 1 (4 % cada uno)","16 %"),("Tareas con rúbrica de los módulos 2 a 5, Parte 2, corregidas por la tutora (4 % cada una)","16 %"),("Evaluación final · Parte 1: cuestionario de 20 preguntas","20 %"),("Evaluación final · Parte 2: caso práctico integrador «El caso de Javier en Soporte»","40 %")]
SEC=['Competencia y aprendizajes esperados','Metodología y acompañamiento','Distribución horaria','Los cinco módulos','Recorrido sugerido de cada módulo','Formato de evaluación','Evaluación diagnóstica y mapa de competencias','Requisitos técnicos y recomendaciones']
h=lambda i:f'<h2 class="sec"><span>{i}</span>{e(SEC[i-1])}</h2>'
ul=lambda xs:'<ul>'+''.join(f'<li>{x}</li>' for x in xs)+'</ul>'
def tbl(head,rows,cls=''):
    th='' if not any(head) else '<thead><tr>'+''.join(f'<th>{x}</th>' for x in head)+'</tr></thead>'
    return f'<table class="tb {cls}">{th}<tbody>'+''.join('<tr>'+''.join(f'<td>{c}</td>' for c in r)+'</tr>' for r in rows)+'</tbody></table>'
mods=''
for i,(t,hh,p,a,ev,como,lec,rec) in enumerate(MOD,1):
    mods+=f'''<div class="mod"><div class="keep"><h3>Módulo {i} · {e(t)} ({hh} h)</h3><div class="box"><b>Aprendizaje esperado AE{i}.</b> {e(AE[i-1])}</div>
<p><b>Cómo lo lograrás:</b> {e(como)}</p></div>{tbl(['Microlecciones','Actividades y recursos'],[[ul([e(x) for x in lec]),ul([e(x) for x in rec])]],'two')}
<p class="crit">Criterio de evaluación: {e(CRIT[i-1])} · Distribución: {p} plataforma, {a} trabajo autónomo y {ev} evaluación.</p></div>'''
body=f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Guía del participante · Legislación Laboral</title><style>{CSS}</style></head><body>
<h1 class="w">Te damos la bienvenida</h1>
<p>El curso <b>Legislación Laboral</b> te prepara para reconocer, interpretar y aplicar la legislación laboral chilena en las situaciones habituales de una relación de trabajo, desde la contratación hasta el término: qué observar, qué riesgo existe, qué decisión corresponde y qué evidencia conservar.</p>
{tbl(['',''],[['Modalidad','E-learning asincrónico, a tu propio ritmo'],['Duración','60 horas · 5 módulos · 38 microlecciones'],['Plataforma','Aula virtual Tremen Partner (Moodle). Consultas de contenido a la tutora por mensajería y foro del aula, con respuesta en un plazo máximo de 48 horas hábiles.'],['Público','Analistas de recursos humanos, analistas de remuneraciones, analistas de personal y analistas administrativos que desempeñan funciones de gestión de contratos de trabajo, control de jornada y asistencia, tramitación de solicitudes laborales y documentación del término de la relación laboral.'],['Caso conductor','Camila, del Equipo de Personas de Horizonte Servicios, una empresa ficticia de servicios en Santiago. Todos los datos del curso son ficticios.']],'kv')}
<h4>Requisitos de ingreso</h4>{ul(['Experiencia laboral en funciones administrativas o de gestión de personas que impliquen manejo de contratos, registros de asistencia, remuneraciones o documentación laboral.','No se requieren conocimientos jurídicos previos.'])}
<div class="toc">{"".join(f"<div><b>{i}</b>{e(s)}</div>" for i,s in enumerate(SEC,1))}</div>
<div class="pb"></div>{h(1)}
<div class="box"><b>Competencia a desarrollar.</b> Analizar procedimientos laborales del ciclo de la relación de trabajo en la gestión de personas, de acuerdo al Código del Trabajo.</div>
<p>La competencia se construye con cinco aprendizajes esperados (AE), uno por módulo. Cada uno tiene su criterio de evaluación.</p>
{tbl(['AE','Módulo','Aprendizaje esperado','Horas'],[[f'<b>AE{i}</b>',f'{i} · {e(m[0])}',e(AE[i-1]),f'{m[1]} h'] for i,m in enumerate(MOD,1)])}
<div class="key"><b>Idea clave:</b> La ley fija mínimos: un acuerdo entre las partes no puede dejar sin efecto un derecho laboral.</div>
{h(2)}
<p>La metodología Tremen Learning System (TLS) integra storytelling, escenarios de decisión y práctica con casos y documentos simulados.</p>
<div class="grid2"><div><b>Storytelling</b>Acompañas a Camila, del Equipo de Personas de Horizonte Servicios, en situaciones reales de la relación laboral.</div><div><b>Escenarios de decisión</b>Eliges qué hacer y ves las consecuencias, con retroalimentación en cada alternativa.</div><div><b>Actividades prácticas</b>Resuelves casos ramificados en que describes, explicas y analizas, con documentos laborales simulados.</div><div><b>Transferencia al trabajo</b>Cada módulo trae una ficha y una guía en PDF que puedes usar en tu organización.</div></div>
<h4>Tu tutora</h4><p>Consuelo Belén Ramos Tapia, abogada. Relatora de cursos de legislación laboral vigente y abogada litigante.</p>
{ul(['Corrige tus tareas de módulo (Parte 2 de la evaluación de los módulos 2 a 5) con la rúbrica y te escribe, por criterio, qué lograste y qué mejorar, en un plazo máximo de 48 horas hábiles.','Responde tus consultas de contenido por la mensajería y el foro del aula, en el mismo plazo.','Las consultas técnicas (acceso, archivos que no cargan) las atiende la mesa de ayuda del aula virtual.','Su retroalimentación, tus calificaciones y los mensajes quedan registrados en el aula virtual.'])}
{tbl(['Pregunta','Respuesta'],[['<b>¿Qué harás?</b>','Revisarás microlecciones interactivas, casos, infografías de decisión, documentos laborales simulados y fichas sobre fundamentos, contratación, jornada, remuneraciones, derechos laborales, prevención del acoso y término de la relación laboral. Comienzas con un diagnóstico sin nota y cierras con una evaluación final en dos partes.'],['<b>¿Cómo lo harás?</b>','Cada microlección sigue la secuencia situación, decisión, explicación, práctica con retroalimentación y transferencia. Cada módulo suma dos actividades prácticas, un laboratorio de práctica en los módulos 2 a 5 y su evaluación: un cuestionario y, en los módulos 2 a 5, una tarea con rúbrica.'],['<b>¿Con qué y dónde?</b>','En el aula virtual Moodle, disponible 24/7: 38 microlecciones SCORM que funcionan en computador, tablet y celular, 10 actividades prácticas, 10 PDF de apoyo, resúmenes y glosarios, cuestionarios y tareas en línea. La tutora responde por mensajería y foro en un máximo de 48 horas hábiles.']])}
{h(3)}
<p>De las 60 horas, {TOT[0]} (59 %) corresponden a plataforma, {TOT[1]} (24 %) a trabajo autónomo y {TOT[2]} (18 %) a evaluación.</p>
<table class="tb"><thead><tr><th>Módulo</th><th>Plataforma</th><th>Autónomo</th><th>Evaluación</th><th>Total</th></tr></thead><tbody>
{"".join(f'<tr><td>AE{i} · Módulo {i}: {e(m[0])}</td><td class="n">{m[2]}</td><td class="n">{m[3]}</td><td class="n">{m[4]}</td><td class="n">{m[1]} h</td></tr>' for i,m in enumerate(MOD,1))}
<tr class="tot"><td>Total</td><td class="n">{TOT[0]}</td><td class="n">{TOT[1]}</td><td class="n">{TOT[2]}</td><td class="n">60 h</td></tr></tbody></table>
<p class="crit">Tiempos de referencia: microlección 35 min, caso aplicado 30 min, actividad práctica 30 min, simulador 30 min, práctica formativa 40 min, PDF 20 min, resumen y glosario 20 min, diagnóstico 30 min, cuestionario de módulo 1 h, tarea 40 min (70 min en el módulo 5) y evaluación final 1 h + 1 h.</p>
<div class="key"><b>Recomendación.</b> Avanza un poco cada día. Reserva bloques de al menos 45 minutos para las actividades prácticas y los laboratorios.</div>
{h(4)}{mods}
{h(5)}<ol><li><b>Microlecciones del módulo</b>: en orden (en el Módulo 1, incluido el caso aplicado)</li><li><b>Dos PDF de apoyo</b>: una ficha de trabajo y una guía o mapa para consultar</li><li><b>Actividades prácticas 1 y 2</b>: casos con escenarios ramificados para practicar; en los módulos 2 a 5, también un laboratorio de práctica</li><li><b>Resumen y glosario</b>: para repasar, en los módulos que lo traen</li><li><b>Evaluación del módulo</b>: Parte 1, cuestionario de 10 preguntas; Parte 2 (módulos 2 a 5), tarea con rúbrica que corrige la tutora</li></ol>
<p>Al terminar el Módulo 5 rindes la evaluación final, en dos partes: un cuestionario de 20 preguntas (4 por módulo, 1 hora) y el caso práctico integrador «El caso de Javier en Soporte» (1 hora).</p>
{h(6)}
<table class="tb"><thead><tr><th>Componente</th><th>Peso</th></tr></thead><tbody>{"".join(f"<tr><td>{e(a)}</td><td class='n'>{b}</td></tr>" for a,b in EVAL)}<tr class="tot"><td>Total</td><td class="n">100 %</td></tr></tbody></table>
<div class="key"><b>Norma de evaluación:</b> Escala de 1,0 a 7,0 con 60 % de exigencia. Nota mínima de aprobación: 4,0 en la nota final ponderada del curso. Requisito administrativo: al menos 40 % de participación en el aula virtual.</div>
<p>Los cuestionarios y la Parte 1 de la evaluación final tienen calificación automática. Las tareas de los módulos 2 a 5 las corrige la tutora con rúbrica y retroalimentación escrita. La Parte 2 de la evaluación final da puntaje por decisión o tarea, con retroalimentación inmediata y un informe descargable al terminar. La evaluación diagnóstica, las actividades prácticas, los laboratorios y las prácticas de cada microlección son formativas, sin nota.</p>
<h4>Criterios de evaluación</h4>{ul([f'<b>AE{i}:</b> {e(c)}' for i,c in enumerate(CRIT,1)])}
{h(7)}
<p>Antes del Módulo 1 responderás una evaluación diagnóstica breve, sin nota, en dos pasos:</p>
<ol><li><b>Autoevaluación:</b> indicas cómo te percibes en cada aprendizaje esperado.</li><li><b>Situaciones:</b> respondes 20 preguntas de selección múltiple, cuatro por módulo.</li></ol>
<p>Al terminar verás tu mapa de competencias: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado, tu nivel en cada uno (inicial, en desarrollo o avanzado) y las lecciones en que conviene poner más atención. Puedes descargarlo en PDF con todas tus respuestas.</p>
<div class="box">Para que tu ruta sea útil, responde con honestidad y sin buscar las respuestas. El diagnóstico no afecta tu nota.</div>
{h(8)}<ul class="chk">{"".join(f"<li>{e(r)}</li>" for r in ["Computador o notebook con Windows 10 o superior, o macOS 11 o superior.","Procesador de doble núcleo y 4 GB de memoria RAM como mínimo.","Conexión a internet de banda ancha de 10 Mbps o superior.","Navegador actualizado (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).","Parlantes o audífonos para los videos y la narración.","Los recursos funcionan dentro del aula virtual: no necesitas instalar otros programas."])}</ul>
<div class="box"><b>Consejos para avanzar.</b> Las lecciones se adaptan al celular, pero usa un computador para los laboratorios y el caso integrador, que trabajan con un expediente de varios documentos.</div>
</body></html>'''
gp=os.path.join(H,'_guia_cuerpo.html');open(gp,'w',encoding='utf-8').write(body)
from playwright.sync_api import sync_playwright
exe=(glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
hdr='<div style="font-family:Inter,Arial;font-size:7px;color:#5f7180;width:100%;padding:0 18mm;display:flex;justify-content:space-between"><span>Guía del participante · Legislación Laboral</span><span>Presentación del curso</span></div>'
ftr='<div style="font-family:Inter,Arial;font-size:7px;color:#5f7180;width:100%;padding:0 18mm;text-align:right">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe);pg=b.new_page();pg.goto('file://'+gp);pg.wait_for_load_state('networkidle')
    pg.pdf(path=gp+'.pdf',format='A4',print_background=True,display_header_footer=True,header_template=hdr,footer_template=ftr,prefer_css_page_size=True);b.close()
from pypdf import PdfWriter
w=PdfWriter();w.append(os.path.join(H,'moodle_Guia_del_participante.pdf'),pages=(0,1));w.append(gp+'.pdf')
out=os.path.join(H,'Guia_del_participante.pdf');w.write(out);w.close();os.remove(gp);os.remove(gp+'.pdf');print('OK',out)

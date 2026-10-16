#!/usr/bin/env python3
"""Genera la Presentación del curso (HTML autocontenido, carrusel) y la Guía del participante (PDF A4)
a partir de datos.py. Uso: python3 gen.py carpeta_salida"""
import os, sys, base64, glob
from html import escape as e
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from datos import *

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'out'))
os.makedirs(out, exist_ok=True)
img = lambda k: 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(here, 'img', k + '.jpg'), 'rb').read()).decode()
pct = lambda h: round(h / HORAS * 100)
ALT = {'bienvenida': 'Equipo de Personas conversando en una sala de reuniones', 'publico': 'Camila conversando con una colega del Equipo de Personas',
       'metodo': 'Camila planificando frente a un panel con notas', 'm1': 'Camila revisando un documento laboral en su escritorio',
       'm2': 'Calculadora, liquidación de sueldo y registro de horas sobre un escritorio', 'm3': 'Oficina inclusiva con personas trabajando',
       'm4': 'Conversación reservada entre dos personas en una oficina', 'm5': 'Revisión de documentos del término de un contrato',
       'diag': 'Camila revisando un documento junto a su computador'}

# ------------------------------------------------------------------ Presentación (carrusel)
def card(kicker, h2, body, key, im=None):
    inner = f'<div class="cols{" has-img" if im else ""}"><div>{body}</div>' + (f'<img src="{img(im)}" alt="{e(ALT[im])}"/>' if im else '') + '</div>'
    return f'<article class="card"><span class="kicker">{e(kicker)}</span><h2>{e(h2)}</h2>\n{inner}\n<div class="key"><b>Idea clave:</b> {key}</div></article>'

pts = lambda xs: '<ul class="points">' + ''.join(f'<li>{x}</li>' for x in xs) + '</ul>'
cards = []
cards.append(card('Bienvenida', CURSO,
    f'<p>Este curso te prepara para reconocer, interpretar y aplicar la legislación laboral chilena en las situaciones habituales de una relación de trabajo, <b>desde la contratación hasta el término</b>: qué observar, qué riesgo existe, qué decisión corresponde y qué evidencia conservar.</p>'
    + pts([f'<b>Modalidad:</b> {e(MODALIDAD)}', f'<b>Duración:</b> {HORAS} horas en {len(MODULOS)} módulos', '<b>Plataforma:</b> Aula virtual Tremen Partner (Moodle)', f'<b>Caso conductor:</b> {e(CASO)}']),
    'Todos los datos del curso son ficticios: puedes practicar sin riesgo.', 'bienvenida'))
cards.append(card('Competencia a desarrollar', 'Lo que serás capaz de hacer al terminar',
    f'<div class="ae"><small>Competencia del curso</small>{e(COMPETENCIA)}</div><p>La competencia se construye paso a paso con <b>cinco aprendizajes esperados</b>, uno por módulo:</p>'
    + pts([f'<b>AE{m["n"]} · Módulo {m["n"]}:</b> {e(m["ae"])}' for m in MODULOS]),
    'Cada aprendizaje esperado se evalúa con su propio criterio y con las actividades del módulo.'))
cards.append(card('Para quién es', 'Público y requisitos de ingreso', f'<p>{e(PUBLICO)}</p>' + pts([e(r) for r in REQUISITOS]),
    'No necesitas formación jurídica: el curso parte desde situaciones cotidianas del trabajo.', 'publico'))
cards.append(card('Metodología', 'Tremen Learning System (TLS)',
    '<p>El curso integra estrategias que se repiten en cada módulo: aprendes con una historia, decides en escenarios realistas y practicas con casos y documentos simulados.</p>'
    + pts(['<b>Storytelling:</b> acompañas a Camila en situaciones reales del Equipo de Personas.',
           '<b>Escenarios de decisión:</b> eliges qué hacer y ves las consecuencias, con retroalimentación en cada alternativa.',
           '<b>Actividades prácticas:</b> resuelves casos ramificados en que describes, explicas y analizas.',
           '<b>Transferencia al trabajo:</b> cada módulo trae fichas y guías en PDF que puedes usar en tu organización.']),
    'Cada microlección sigue la secuencia situación, decisión, explicación, demostración, práctica, retroalimentación y transferencia.', 'metodo'))
cards.append(card('Metodología', '¿Qué harás, cómo y con qué?',
    f'<div class="tri"><div><b>¿Qué harás?</b>Recorrerás {len(MODULOS)} módulos: identificarás principios, describirás el contrato y la jornada, explicarás derechos laborales, distinguirás conductas de acoso y analizarás el término del contrato.</div>'
    f'<div><b>¿Cómo lo harás?</b>Con {N_LECC} microlecciones interactivas, casos aplicados, 10 actividades prácticas y un caso integrador final, a tu propio ritmo.</div>'
    '<div><b>¿Con qué y dónde?</b>En el aula virtual Moodle, disponible 24/7: lecciones SCORM que funcionan en computador, tablet y celular, PDF de apoyo, resumen y glosario por módulo y cuestionarios en línea.</div></div>',
    'Un tutor responde tus consultas por mensajería y foro en un plazo máximo de 48 horas hábiles.'))
rows = ''.join(f'<tr><td><b>M{m["n"]}</b> {e(m["titulo"])}</td><td class="n">{m["plat"]} h</td><td class="n">{m["aut"]} h</td><td class="n">{m["ev"]} h</td><td class="n">{m["horas"]} h</td></tr>' for m in MODULOS)
mx = max(DIST.values())
cards.append(card('Distribución horaria', f'Tus {HORAS} horas de dedicación',
    '<div class="hb">' + ''.join(f'<div><span>{l}</span><i><b style="width:{round(v/mx*100)}%"></b></i><strong>{v} h · {pct(v)} %</strong></div>' for l, v in [('Plataforma', DIST['plataforma']), ('Trabajo autónomo', DIST['autonomo']), ('Evaluación', DIST['evaluacion'])]) + '</div>'
    f'<div class="tw"><table class="mini"><thead><tr><th>Módulo</th><th>Plataf.</th><th>Autón.</th><th>Eval.</th><th>Total</th></tr></thead><tbody>{rows}<tr class="tot"><td>Total</td><td class="n">{DIST["plataforma"]} h</td><td class="n">{DIST["autonomo"]} h</td><td class="n">{DIST["evaluacion"]} h</td><td class="n">{HORAS} h</td></tr></tbody></table></div>'
    '<p style="font-size:.85rem;color:var(--muted)">Plataf.: horas en plataforma · Autón.: trabajo autónomo · Eval.: evaluación.</p>',
    'Organiza tu semana: avanzar un poco cada día rinde más que una sola sesión larga.'))
for m in MODULOS:
    cards.append(card(f'Módulo {m["n"]} · {m["horas"]} horas', m['titulo'],
        f'<div class="ae"><small>Aprendizaje esperado AE{m["n"]}</small>{e(m["ae"])}</div><p><b>Cómo lo lograrás:</b> {e(m["como"])}</p>'
        + pts([f'Lección {e(l)}' for l in m['lecciones']])
        + f'<table class="mini"><tbody><tr><td>🎬 Caso</td><td>{e(m["caso"])}</td></tr><tr><td>🧩 Actividades</td><td>{" · ".join(e(a) for a in m["actividades"])}</td></tr>'
          f'<tr><td>📄 PDF</td><td>{" · ".join(e(p) for p in m["pdf"])}</td></tr><tr><td>📝 Evaluación</td><td>{e(m["evaluacion"])}</td></tr>'
          f'<tr><td>⏱ Horas</td><td>{m["plat"]} h plataforma · {m["aut"]} h trabajo autónomo · {m["ev"]} h evaluación</td></tr></tbody></table>',
        f'Criterio de evaluación: {e(m["criterio"])}', m['img']))
cards.append(card('Recorrido de cada módulo', 'El orden sugerido dentro de un módulo',
    '<ol class="steps">' + ''.join(f'<li><b>{e(a)}</b>: {e(b)}</li>' for a, b in RECORRIDO) + '</ol>'
    '<p>Al terminar el Módulo 5 rindes la <b>evaluación final</b>, en dos partes: un cuestionario de 20 preguntas y un caso práctico integrador.</p>',
    'Debes aprobar la evaluación de cada módulo y completar el 100 % de las actividades obligatorias.'))
cards.append(card('Formato de evaluación', 'Cómo se calcula tu nota final',
    '<table class="mini"><thead><tr><th>Componente</th><th>Peso</th></tr></thead><tbody>' + ''.join(f'<tr><td>{e(a)}</td><td class="n">{b}</td></tr>' for a, b in EVAL) + '<tr class="tot"><td>Total</td><td class="n">100 %</td></tr></tbody></table>'
    + pts(['Escala de 1,0 a 7,0 con 60 % de exigencia. Nota mínima de aprobación: 4,0 en la nota final ponderada.',
           'La evaluación diagnóstica y las prácticas de cada microlección son formativas: tienen retroalimentación y no llevan nota.']),
    'Requisito administrativo: completar el 100 % de las actividades obligatorias del aula virtual.'))
cards.append(card('Criterios de evaluación', 'Qué se evalúa en cada módulo',
    '<table class="mini"><thead><tr><th>AE</th><th>Criterio de evaluación</th></tr></thead><tbody>' + ''.join(f'<tr><td><b>AE{m["n"]}</b></td><td>{e(m["criterio"])}</td></tr>' for m in MODULOS) + '</tbody></table>'
    '<p>La evaluación final integra los cinco criterios: 4 preguntas por módulo en la Parte 1 y un caso que recorre todo el ciclo laboral en la Parte 2.</p>',
    'Al terminar cada laboratorio y el caso integrador puedes descargar un informe con tus resultados.'))
cards.append(card('Antes de empezar', 'Evaluación diagnóstica y mapa de competencias',
    '<p>Antes del Módulo 1 responderás una <b>evaluación diagnóstica</b> breve, sin nota. Primero te autoevalúas en cada aprendizaje esperado y luego respondes 20 situaciones laborales, cuatro por módulo.</p>'
    + pts(['Al terminar verás tu <b>mapa de competencias</b>: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado.',
           'Recibirás una ruta sugerida con las lecciones en que conviene poner más atención.', 'Podrás <b>descargar un PDF</b> con tu mapa y todas tus respuestas.']),
    'El diagnóstico no afecta tu nota: responde con honestidad para que tu ruta sea útil.', 'diag'))
cards.append(card('Requisitos técnicos', 'Lo que necesitas para el curso',
    '<p>Las lecciones se adaptan al celular, pero te recomendamos un computador para los laboratorios y el caso integrador, que usan un expediente con varios documentos.</p>' + pts([e(r) for r in REQ_TEC]),
    '¡Te damos la bienvenida! Comienza por la evaluación diagnóstica.'))

css = open(os.path.join(here, 'carrusel_base.css.html'), encoding='utf-8').read()
js = open(os.path.join(here, 'carrusel_base.js.html'), encoding='utf-8').read()
pres = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>Presentación del curso</title>
{css}</head>
<body><main class="wrap">
<div class="top"><span class="course">{e(CURSO)}</span><button class="theme" id="theme" type="button">☾ Oscuro</button></div>
<h1>Presentación del curso</h1>
<p class="sub">{e(CURSO)} · E-learning asincrónico · {HORAS} horas</p><div class="bar"><span></span></div>
<div class="viewport"><div class="track">{"".join(cards)}</div></div>
<div class="nav"><button class="arrow" id="prev" type="button" aria-label="Anterior">←<span class="lbl"> Anterior</span></button><div class="dots"></div><button class="arrow" id="next" type="button" aria-label="Siguiente"><span class="lbl">Siguiente </span>→</button></div>
<div class="count"></div>
<p class="foot">Presentación del curso · Usa las flechas, desliza en el celular o toca los puntos para avanzar.</p>
</main>
{js}
</body></html>'''
open(os.path.join(out, 'Presentacion_del_curso_Legislacion_Laboral.html'), 'w', encoding='utf-8').write(pres)

# ------------------------------------------------------------------ Guía del participante (PDF)
SEC = ['Competencia y aprendizajes esperados', 'Metodología Tremen Learning System', 'Distribución horaria', f'Los {len(MODULOS)} módulos'.replace('5', 'cinco'),
       'Recorrido sugerido de cada módulo', 'Formato de evaluación', 'Evaluación diagnóstica y mapa de competencias', 'Requisitos técnicos y recomendaciones']
h = lambda i: f'<h2 class="sec"><span>{i}</span>{e(SEC[i-1])}</h2>'
tbl = lambda head, rows, cls='': f'<table class="tb {cls}"><thead><tr>{"".join(f"<th>{x}</th>" for x in head)}</tr></thead><tbody>{"".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)}</tbody></table>'
ul = lambda xs: '<ul>' + ''.join(f'<li>{x}</li>' for x in xs) + '</ul>'
mods = ''
for m in MODULOS:
    mods += f'''<div class="mod"><div class="keep"><h3>Módulo {m["n"]} · {e(m["titulo"])} ({m["horas"]} h)</h3>
<div class="box"><b>Aprendizaje esperado AE{m["n"]}.</b> {e(m["ae"])}</div>
<p><b>Cómo lo lograrás:</b> {e(m["como"])}</p></div>
{tbl(['Microlecciones', 'Actividades y recursos'], [[ul([e(l) for l in m['lecciones']]), ul([f'Caso aplicado · {e(m["caso"].split(": ",1)[-1])}'] + [f'Actividad práctica {m["n"]}.{i+1} · {e(a)}' for i, a in enumerate(m['actividades'])] + [f'PDF: {e(p)}' for p in m['pdf']] + ['Resumen y glosario interactivos', f'Evaluación del módulo: {e(m["evaluacion"])}'])]], 'two')}
<p class="crit">Criterio de evaluación: {e(m["criterio"])} · Distribución: {m["plat"]} h plataforma, {m["aut"]} h trabajo autónomo y {m["ev"]} h evaluación.</p></div>'''
COVER = f'''<section class="cover"><div class="ph"></div><div class="ct"><div class="k">{e(CURSO)}</div><span class="pill">Presentación del curso</span><h1>Guía del participante</h1>
<p>Competencia, aprendizajes esperados, metodología, módulos y formato de evaluación del curso.</p><div class="ln"></div></div>
<div class="ft"><span>Material de apoyo del curso · Uso formativo</span><span>Guía del participante</span></div></section>'''
guide = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Guía del participante · {e(CURSO)}</title><style>
@page{{size:A4;margin:22mm 18mm 20mm}}
*{{box-sizing:border-box}}
:root{{--ink:#1d2b36;--muted:#5f7180;--teal:#0f7a82;--teal2:#2bc2b1;--navy:#173f4e;--mint:#eaf7f6;--mint-line:#a9dbd7;--amber:#c97d0e;--amber-soft:#fff6e6;--line:#d5e0e4}}
html,body{{margin:0;font-family:Inter,Arimo,Arial,sans-serif;color:var(--ink);font-size:9.6pt;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.cover{{height:297mm;width:210mm;position:relative;break-after:page;background:linear-gradient(180deg,#123b4a,#0f7a82)}}
.cover .ph{{height:46%;background:url({img("portada")}) center/cover}}
.cover .ct{{padding:12mm 15mm;color:#fff}}
.cover .k{{font-size:8pt;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#7fe0d8}}
.cover .pill{{display:inline-block;border:1px solid #7fe0d8;border-radius:99px;padding:2pt 9pt;font-size:7.5pt;font-weight:700;margin:10pt 0 6pt}}
.cover h1{{font-size:28pt;margin:4pt 0 8pt;font-weight:800}}
.cover p{{font-size:11.5pt;color:#d7ecee;max-width:120mm;margin:0}}
.cover .ln{{width:38mm;height:3pt;background:#2bc2b1;border-radius:3pt;margin-top:9mm}}
.cover .ft{{position:absolute;left:15mm;right:15mm;bottom:12mm;border-top:1px solid rgba(255,255,255,.25);padding-top:5pt;display:flex;justify-content:space-between;font-size:7.5pt;color:#cfe7ea}}
h1.w{{font-size:16pt;color:var(--navy);margin:0 0 8pt}}
h2.sec{{font-size:15pt;color:var(--navy);display:flex;align-items:center;gap:9pt;margin:18pt 0 9pt;break-after:avoid}}
h2.sec span{{display:inline-grid;place-items:center;width:20pt;height:20pt;border-radius:50%;background:var(--teal);color:#fff;font-size:9.5pt;flex:none}}
h3{{font-size:12.5pt;color:var(--navy);margin:14pt 0 7pt;break-after:avoid}}
h4{{color:var(--teal);font-size:10.5pt;margin:12pt 0 5pt}}
p{{margin:0 0 7pt}}
ul{{margin:3pt 0 7pt;padding-left:13pt}}li{{margin:1.5pt 0}}
.box{{background:var(--mint);border:1px solid var(--mint-line);border-radius:7pt;padding:8pt 11pt;margin:6pt 0 9pt}}
.key{{background:var(--amber-soft);border:1px solid #f0d9b0;border-left:4pt solid var(--amber);border-radius:6pt;padding:8pt 11pt;margin:9pt 0}}
.key b{{color:#9a5e04}}
table.tb{{width:100%;border-collapse:collapse;margin:5pt 0 9pt;font-size:8.8pt;break-inside:auto}}
table.tb th{{background:var(--navy);color:#fff;text-align:left;padding:5pt 7pt;font-size:8.3pt}}
table.tb td{{padding:5pt 7pt;border-bottom:1px solid var(--line);vertical-align:top}}
table.tb tr{{break-inside:avoid}}
table.tb tbody tr:nth-child(even) td{{background:#f6fafb}}
table.tb.two td{{width:50%;background:#fff!important}}
table.tb.two ul{{margin:0;padding-left:12pt}}
table.kv td:first-child{{font-weight:700;width:30%}}
td.n{{text-align:right;white-space:nowrap}}
tr.tot td{{font-weight:800;border-top:2px solid var(--teal)}}
.toc div{{display:flex;gap:12pt;padding:5pt 0;border-bottom:1px dashed var(--line)}}.toc b{{color:var(--teal);width:10pt}}
.mod{{break-inside:auto}}.keep{{break-inside:avoid}}
.crit{{font-size:8.3pt;color:var(--muted);border-top:1px solid var(--line);padding-top:4pt}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:8pt;margin:6pt 0 9pt}}
.grid2 div{{border:1px solid var(--line);border-radius:7pt;padding:8pt 10pt;background:#fbfdfd}}
.grid2 b{{display:block;color:var(--navy)}}
ol{{padding-left:15pt}}
.pb{{break-before:page}}
.chk li{{list-style:none;position:relative}}.chk li::before{{content:"☐";position:absolute;left:-13pt;color:var(--teal)}}
</style></head><body>


<h1 class="w">Te damos la bienvenida</h1>
<p>El curso <b>{e(CURSO)}</b> te prepara para reconocer, interpretar y aplicar la legislación laboral chilena en las situaciones habituales de una relación de trabajo, desde la contratación hasta el término: qué observar, qué riesgo existe, qué decisión corresponde y qué evidencia conservar.</p>
{tbl(['', ''], [['Modalidad', e(MODALIDAD)], ['Duración', f'{HORAS} horas · {len(MODULOS)} módulos · {N_LECC} microlecciones'], ['Plataforma', e(PLATAFORMA)], ['Público', e(PUBLICO)], ['Caso conductor', e(CASO)]], 'kv').replace('<thead><tr><th></th><th></th></tr></thead>', '')}
<h4>Requisitos de ingreso</h4>{ul([e(r) for r in REQUISITOS])}
<div class="toc">{"".join(f"<div><b>{i}</b>{e(s)}</div>" for i, s in enumerate(SEC, 1))}</div>

<div class="pb"></div>{h(1)}
<div class="box"><b>Competencia a desarrollar.</b> {e(COMPETENCIA)}</div>
<p>La competencia se construye con cinco aprendizajes esperados (AE), uno por módulo. Cada uno tiene su criterio de evaluación.</p>
{tbl(['AE', 'Módulo', 'Aprendizaje esperado', 'Horas'], [[f'<b>AE{m["n"]}</b>', f'{m["n"]} · {e(m["titulo"])}', e(m['ae']), f'{m["horas"]} h'] for m in MODULOS])}
<div class="key"><b>Idea clave:</b> {e(IDEA_CURSO)}</div>

{h(2)}
<p>La metodología Tremen Learning System (TLS) integra storytelling, escenarios de decisión y práctica con casos y documentos simulados.</p>
<div class="grid2"><div><b>Storytelling</b>Acompañas a Camila, del Equipo de Personas de Horizonte Servicios, en situaciones reales de la relación laboral.</div>
<div><b>Escenarios de decisión</b>Eliges qué hacer y ves las consecuencias, con retroalimentación en cada alternativa.</div>
<div><b>Actividades prácticas</b>Resuelves casos ramificados en que describes, explicas y analizas, con documentos laborales simulados.</div>
<div><b>Transferencia al trabajo</b>Cada módulo trae una ficha y una guía en PDF que puedes usar en tu organización.</div></div>
{tbl(['Pregunta', 'Respuesta'], [['<b>¿Qué harás?</b>', 'Revisarás microlecciones interactivas, casos, infografías de decisión, documentos laborales simulados y fichas sobre fundamentos, contratación, jornada, remuneraciones, derechos laborales, prevención del acoso y término de la relación laboral. Comienzas con un diagnóstico sin nota y cierras con una evaluación final situacional.'],
 ['<b>¿Cómo lo harás?</b>', f'Cada microlección sigue la secuencia situación, decisión, explicación, demostración, práctica con retroalimentación y transferencia. Cada módulo suma un caso aplicado, dos actividades prácticas y su evaluación.'],
 ['<b>¿Con qué y dónde?</b>', f'En el aula virtual Moodle, disponible 24/7: {N_LECC} microlecciones SCORM que funcionan en computador, tablet y celular, 10 actividades prácticas, 10 PDF de apoyo, resumen y glosario por módulo y cuestionarios en línea. Un tutor responde por mensajería y foro en un máximo de 48 horas hábiles.']])}

{h(3)}
<p>De las {HORAS} horas, {DIST["plataforma"]} h ({pct(DIST["plataforma"])} %) corresponden a plataforma, {DIST["autonomo"]} h ({pct(DIST["autonomo"])} %) a trabajo autónomo y {DIST["evaluacion"]} h ({pct(DIST["evaluacion"])} %) a evaluación.</p>
<table class="tb"><thead><tr><th>Módulo</th><th>Plataforma</th><th>Autónomo</th><th>Evaluación</th><th>Total</th></tr></thead><tbody>
{"".join(f'<tr><td>AE{m["n"]} · Módulo {m["n"]}: {e(m["titulo"])}</td><td class="n">{m["plat"]} h</td><td class="n">{m["aut"]} h</td><td class="n">{m["ev"]} h</td><td class="n">{m["horas"]} h</td></tr>' for m in MODULOS)}
<tr class="tot"><td>Total</td><td class="n">{DIST["plataforma"]} h</td><td class="n">{DIST["autonomo"]} h</td><td class="n">{DIST["evaluacion"]} h</td><td class="n">{HORAS} h</td></tr></tbody></table>
<div class="key"><b>Recomendación.</b> Avanza un poco cada día. Reserva bloques de al menos 45 minutos para las actividades prácticas y los laboratorios.</div>

<div class="pb"></div>{h(4)}{mods}

{h(5)}<ol>{"".join(f"<li><b>{e(a)}</b>: {e(b)}</li>" for a, b in RECORRIDO)}</ol>
<p>Al terminar el Módulo 5 rindes la evaluación final, en dos partes: un cuestionario de 20 preguntas (4 por módulo) y el caso práctico integrador «El caso de Javier en Soporte».</p>

{h(6)}
<table class="tb"><thead><tr><th>Componente</th><th>Peso</th></tr></thead><tbody>{"".join(f"<tr><td>{e(a)}</td><td class='n'>{b}</td></tr>" for a, b in EVAL)}<tr class="tot"><td>Total</td><td class="n">100 %</td></tr></tbody></table>
<div class="key"><b>Norma de evaluación:</b> {e(NORMA)}</div>
<p>Los cuestionarios y la Parte 1 de la evaluación final tienen calificación automática; los laboratorios y la Parte 2, puntaje por decisión o tarea, con retroalimentación inmediata y un informe descargable al terminar. La evaluación diagnóstica y las prácticas de cada microlección son formativas, sin nota.</p>
<h4>Criterios de evaluación</h4>{ul([f'<b>AE{m["n"]}:</b> {e(m["criterio"])}' for m in MODULOS])}

{h(7)}
<p>Antes del Módulo 1 responderás una evaluación diagnóstica breve, sin nota, en dos pasos:</p>
<ol><li><b>Autoevaluación:</b> indicas cómo te percibes en cada aprendizaje esperado.</li><li><b>Situaciones:</b> respondes 20 preguntas de selección múltiple, cuatro por módulo.</li></ol>
<p>Al terminar verás tu mapa de competencias: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado, tu nivel en cada uno (inicial, en desarrollo o avanzado) y las lecciones en que conviene poner más atención. Puedes descargarlo en PDF con todas tus respuestas.</p>
<div class="box">Para que tu ruta sea útil, responde con honestidad y sin buscar las respuestas. El diagnóstico no afecta tu nota.</div>

{h(8)}<ul class="chk">{"".join(f"<li>{e(r)}</li>" for r in REQ_TEC)}</ul>
<div class="box"><b>Consejos para avanzar.</b> Las lecciones se adaptan al celular, pero usa un computador para los laboratorios y el caso integrador, que trabajan con un expediente de varios documentos. Ante cualquier duda, escribe al tutor por la mensajería o el foro del aula.</div>
</body></html>'''
gp = os.path.join(out, 'Guia_del_participante.html')
open(gp, 'w', encoding='utf-8').write(guide)
cp = os.path.join(out, 'Guia_portada.html')
open(cp, 'w', encoding='utf-8').write(guide.split('<body>')[0].replace('@page{size:A4;margin:22mm 18mm 20mm}','@page{size:A4;margin:0}') + '<body>' + COVER + '</body></html>')
from playwright.sync_api import sync_playwright
exe = (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
hdr = f'<div style="font-family:Inter,Arial;font-size:7px;color:#5f7180;width:100%;padding:0 18mm;display:flex;justify-content:space-between"><span>Guía del participante · {e(CURSO)}</span><span>Presentación del curso</span></div>'
ftr = '<div style="font-family:Inter,Arial;font-size:7px;color:#5f7180;width:100%;padding:0 18mm;text-align:right">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    pg = b.new_page(); pg.goto('file://' + gp); pg.wait_for_load_state('networkidle')
    pg.pdf(path=gp + '.pdf', format='A4', print_background=True,
           display_header_footer=True, header_template=hdr, footer_template=ftr, prefer_css_page_size=True)
    pg.goto('file://' + cp); pg.wait_for_load_state('networkidle')
    pg.pdf(path=cp + '.pdf', format='A4', print_background=True, prefer_css_page_size=True)
    b.close()
from pypdf import PdfWriter
w = PdfWriter(); w.append(cp + '.pdf', pages=(0, 1)); w.append(gp + '.pdf')
w.write(os.path.join(out, 'Guia_del_participante_Legislacion_Laboral.pdf')); w.close()
for f in (gp, cp, gp + '.pdf', cp + '.pdf'): os.remove(f)
print('OK', out)

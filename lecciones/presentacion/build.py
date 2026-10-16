"""Genera la Presentación del curso (HTML autocontenido) y la Guía del participante (HTML → PDF).
uso: python3 build.py   (desde lecciones/presentacion; requiere Playwright + Chromium para el PDF)"""
import base64, io, os, subprocess, html
from PIL import Image
from datos import *
D = os.path.dirname(os.path.abspath(__file__)); L = os.path.dirname(D)
OUT = os.path.join(D, 'dist'); os.makedirs(OUT, exist_ok=True)
e = html.escape

def img64(rel, w=900):
    im = Image.open(os.path.join(L, rel)).convert('RGB'); im.thumbnail((w, w))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=78); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

IMG = dict(bienv=("M2/img/m5_crecer.jpg", "Marcela y una colaboradora revisan resultados de ventas en una tablet"),
           publico=("M1/img/l1_equipo.jpg", "Equipo de Empanadas Doña María trabajando junto a un computador"),
           metodo=("M4/img/m13_hero.jpg", "Marcela organiza su plan con notas en un muro"),
           diag=("M4/img/m13_equipo.jpg", "Marcela registra pedidos en una tablet mientras su colaboradora prepara un envío"))
P, A, E = TOT
pct = lambda x: round(x / HORAS * 100)
def h(n): return f"{n} h"

# ---------------- Presentación (carrusel) ----------------
def card(kicker, title, body, key, img=None):
    im = f'<img src="{img64(img[0])}" alt="{e(img[1])}"/>' if img else ''
    return (f'<article class="card"><span class="kicker">{kicker}</span><h2>{title}</h2>\n'
            f'<div class="cols{" has-img" if img else ""}"><div>{body}</div>{im}</div>\n'
            f'<div class="key"><b>Idea clave:</b> {key}</div></article>')
pts = lambda xs: '<ul class="points">' + ''.join(f'<li>{x}</li>' for x in xs) + '</ul>'
cards = []
cards.append(card("Bienvenida", CURSO, f"<p>{BIENVENIDA}</p>" + pts([
    "<b>Modalidad:</b> E-learning asincrónico, a tu propio ritmo",
    f"<b>Duración:</b> {HORAS} horas en {len(MODS)} módulos", f"<b>Plataforma:</b> {PLATAFORMA}", f"<b>Casos conductores:</b> {CASO}"]),
    "Todo lo que aprendes lo aplicas a tu propio negocio: terminas con un Plan de Acción Digital priorizado.", IMG['bienv']))
cards.append(card("Competencia a desarrollar", "Lo que serás capaz de hacer al terminar",
    f'<div class="ae"><small>Competencia del curso</small>{COMP}</div><p>La competencia se construye paso a paso con <b>cuatro aprendizajes esperados</b>, uno por módulo:</p>'
    + pts([f"<b>{m['ae']} · Módulo {m['n']}:</b> {m['aetxt']}" for m in MODS]),
    "Cada aprendizaje esperado se evalúa con su propio criterio y con las actividades del módulo."))
cards.append(card("Para quién es", "Público y requisitos de ingreso", f"<p>{PUBLICO}</p>" + pts(REQUISITOS),
    "No necesitas experiencia técnica: el curso parte desde situaciones cotidianas de un negocio.", IMG['publico']))
cards.append(card("Metodología", "Tremen Learning System (TLS)",
    "<p>El curso integra estrategias que se repiten en cada módulo: aprendes con una historia, decides en escenarios realistas y practicas con casos, simuladores y pantallas recreadas de las herramientas.</p>"
    + pts(["<b>Storytelling:</b> acompañas a María y a Marcela mientras digitalizan sus negocios.",
           "<b>Escenarios de decisión:</b> eliges qué hacer y ves las consecuencias, con retroalimentación en cada alternativa.",
           "<b>Actividades prácticas:</b> laboratorios y simuladores con casos aleatorios para practicar con datos.",
           "<b>Transferencia al negocio:</b> cada módulo trae dos herramientas en PDF rellenable para aplicar en tu PYME."]),
    "Cada microlección sigue la secuencia situación, decisión, explicación, demostración, práctica, retroalimentación y transferencia.", IMG['metodo']))
cards.append(card("Metodología", "¿Qué harás, cómo y con qué?",
    '<div class="tri">'
    f'<div><b>¿Qué harás?</b>Recorrerás {len(MODS)} módulos: diagnosticarás tu negocio y ordenarás el trabajo en la nube, elegirás canales de venta, pagos y despachos, diseñarás acciones de marketing y atención automática, y gestionarás clientes y datos para construir tu Plan de Acción Digital.</div>'
    f'<div><b>¿Cómo lo harás?</b>Con {NLECC} microlecciones interactivas, 8 videos demostrativos, 8 actividades prácticas (laboratorios y simuladores) y un caso integrador final, a tu propio ritmo.</div>'
    '<div><b>¿Con qué y dónde?</b>En el aula virtual Moodle, disponible 24/7: lecciones SCORM que funcionan en computador, tablet y celular, 8 PDF de apoyo y evaluaciones en línea.</div></div>',
    "Un tutor responde tus consultas por mensajería y foro en un plazo máximo de 48 horas hábiles."))
rows = ''.join(f'<tr><td><b>M{m["n"]}</b> {m["titulo"]}</td>' + ''.join(f'<td class="n">{h(x)}</td>' for x in m['h']) + f'<td class="n">{h(sum(m["h"]))}</td></tr>' for m in MODS)
cards.append(card("Distribución horaria", f"Tus {HORAS} horas de dedicación",
    f'<div class="hb"><div><span>Plataforma</span><i><b style="width:100%"></b></i><strong>{h(P)} · {pct(P)} %</strong></div>'
    f'<div><span>Trabajo autónomo</span><i><b style="width:{round(A/P*100)}%"></b></i><strong>{h(A)} · {pct(A)} %</strong></div>'
    f'<div><span>Evaluación</span><i><b style="width:{round(E/P*100)}%"></b></i><strong>{h(E)} · {pct(E)} %</strong></div></div>'
    f'<div class="tw"><table class="mini"><thead><tr><th>Módulo</th><th>Plataf.</th><th>Autón.</th><th>Eval.</th><th>Total</th></tr></thead><tbody>{rows}'
    f'<tr class="tot"><td>Total</td><td class="n">{h(P)}</td><td class="n">{h(A)}</td><td class="n">{h(E)}</td><td class="n">{h(HORAS)}</td></tr></tbody></table></div>'
    '<p style="font-size:.85rem;color:var(--muted)">Plataf.: horas en plataforma · Autón.: trabajo autónomo (aplicar las fichas a tu negocio) · Eval.: evaluación.</p>',
    "Organiza tu semana: avanzar un poco cada día rinde más que una sola sesión larga."))
for m in MODS:
    t = (f'<div class="ae"><small>Aprendizaje esperado {m["ae"]}</small>{m["aetxt"]}</div><p><b>Cómo lo lograrás:</b> {m["como"]}</p>'
         + pts([f"Lección {x}" for x in m['lecc']])
         + '<table class="mini"><tbody>'
         f'<tr><td>🎬 Videos</td><td>{m["videos"]}</td></tr>'
         f'<tr><td>🧩 Actividades</td><td>{" · ".join(m["acts"])}</td></tr>'
         f'<tr><td>📄 PDF</td><td>{" · ".join(m["pdfs"])}</td></tr>'
         f'<tr><td>📝 Evaluación</td><td>{m["ev"]}</td></tr>'
         f'<tr><td>⏱ Horas</td><td>{h(m["h"][0])} plataforma · {h(m["h"][1])} trabajo autónomo · {h(m["h"][2])} evaluación</td></tr></tbody></table>')
    cards.append(card(f"Módulo {m['n']} · {h(sum(m['h']))}oras".replace(' hora', ' hora'), m['titulo'], t, f"Criterio de evaluación: {m['crit']}", (m['img'], m['alt'])))
cards.append(card("Recorrido de cada módulo", "El orden sugerido dentro de un módulo",
    '<ol class="steps"><li><b>Microlecciones del módulo</b>: en orden; cada una incluye su video y su comprobación</li>'
    '<li><b>Videos demostrativos</b>: recorridos por las herramientas (Microsoft 365, WhatsApp Business, Canva, Meta Ads, Google Ads, CRM)</li>'
    '<li><b>Dos PDF de apoyo</b>: fichas rellenables para aplicar en tu negocio</li>'
    '<li><b>Actividades prácticas</b>: un laboratorio y un simulador para practicar</li>'
    '<li><b>Evaluación del módulo</b>: cuestionario y, desde el Módulo 2, análisis de casos. Debes aprobarla.</li></ol>'
    f'<p>Al terminar el Módulo 4 rindes la <b>evaluación final</b>, en dos partes: un cuestionario de 20 preguntas y el caso práctico integrador {CASO_FINAL}.</p>',
    "Debes aprobar la evaluación de cada módulo y completar el 100 % de las actividades obligatorias."))
cards.append(card("Formato de evaluación", "Cómo se calcula tu nota final",
    '<table class="mini"><thead><tr><th>Componente</th><th>Peso</th></tr></thead><tbody>' + ''.join(f'<tr><td>{a}</td><td class="n">{b}</td></tr>' for a, b in PESOS)
    + '<tr class="tot"><td>Total</td><td class="n">100 %</td></tr></tbody></table>'
    + pts(["Escala de 1,0 a 7,0 con 60 % de exigencia. Nota mínima de aprobación: 4,0 en la nota final ponderada.",
           "Cada pregunta de las evaluaciones vale 2 puntos.",
           "La evaluación diagnóstica, las comprobaciones de cada lección, los laboratorios y los simuladores son formativos: tienen retroalimentación y no ponderan en la nota final."]),
    "Requisito administrativo: completar el 100 % de las actividades obligatorias del aula virtual."))
cards.append(card("Criterios de evaluación", "Qué se evalúa en cada módulo",
    '<table class="mini"><thead><tr><th>AE</th><th>Criterio de evaluación</th></tr></thead><tbody>'
    + ''.join(f'<tr><td><b>{m["ae"]}</b></td><td>{m["crit"]}</td></tr>' for m in MODS) + '</tbody></table>',
    "Al terminar cada análisis de casos y el caso integrador ves el detalle por pregunta y la retroalimentación completa."))
cards.append(card("Antes de empezar", "Evaluación diagnóstica y mapa de competencias",
    "<p>Antes del Módulo 1 responderás una <b>evaluación diagnóstica</b> breve, sin nota. Primero te autoevalúas en cada aprendizaje esperado y luego respondes 20 situaciones, cinco por módulo.</p>"
    + pts(["Al terminar verás tu <b>mapa de competencias</b>: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado.",
           "Recibirás una ruta sugerida con las lecciones en que conviene poner más atención.",
           "Podrás <b>descargar un PDF</b> con tu mapa y todas tus respuestas."]),
    "El diagnóstico no afecta tu nota: responde con honestidad para que tu ruta sea útil.", IMG['diag']))
cards.append(card("Requisitos técnicos", "Lo que necesitas para el curso",
    "<p>Las lecciones se adaptan al celular, pero te recomendamos un computador para los laboratorios, los simuladores y el caso integrador, que trabajan con tablas y pantallas recreadas.</p>" + pts(TEC),
    "¡Te damos la bienvenida! Comienza por la evaluación diagnóstica."))

css = open(os.path.join(D, 'tpl', 'presentacion.css'), encoding='utf-8').read()
js = open(os.path.join(D, 'tpl', 'presentacion.js'), encoding='utf-8').read()
pres = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>Presentación del curso</title>
<style>{css}</style></head>
<body><main class="wrap">
<div class="top"><span class="course">{CURSO}</span><button class="theme" id="theme" type="button">☾ Oscuro</button></div>
<h1>Presentación del curso</h1>
<p class="sub">{CURSO} · E-learning asincrónico · {HORAS} horas</p><div class="bar"><span></span></div>
<div class="viewport"><div class="track">{''.join(cards)}</div></div>
<div class="nav"><button class="arrow" id="prev" type="button" aria-label="Anterior">←<span class="lbl"> Anterior</span></button><div class="dots"></div><button class="arrow" id="next" type="button" aria-label="Siguiente"><span class="lbl">Siguiente </span>→</button></div>
<div class="count"></div>
<p class="foot">Presentación del curso · Usa las flechas, desliza en el celular o toca los puntos para avanzar.</p>
</main>
<script>{js}</script>
</body></html>"""
open(os.path.join(OUT, 'Presentacion_del_curso_Herramientas_Digitales_PYMES.html'), 'w', encoding='utf-8').write(pres)

# ---------------- Guía del participante (PDF) ----------------
sec = lambda n, t: f'<h2 class="sec"><span>{n}</span>{t}</h2>'
modblocks = ''
for m in MODS:
    modblocks += (f'<div class="mod"><h3>Módulo {m["n"]} · {m["titulo"]} ({h(sum(m["h"]))})</h3>'
        f'<div class="box"><b>Aprendizaje esperado {m["ae"]}.</b> {m["aetxt"]}</div>'
        f'<p><b>Cómo lo lograrás:</b> {m["como"]}</p>'
        '<table class="t"><thead><tr><th>Microlecciones</th><th>Actividades y recursos</th></tr></thead><tbody><tr><td><ul>'
        + ''.join(f'<li>{x}</li>' for x in m['lecc']) + '</ul></td><td><ul>'
        + f'<li>Videos: {m["videos"]}</li>' + ''.join(f'<li>Actividad práctica {m["n"]}.{i+1} · {a}</li>' for i, a in enumerate(m['acts']))
        + ''.join(f'<li>PDF: {p}</li>' for p in m['pdfs']) + f'<li>Evaluación del módulo: {m["ev"]}</li></ul></td></tr></tbody></table>'
        f'<p class="small">Criterio de evaluación: {m["crit"]} · Distribución: {h(m["h"][0])} plataforma, {h(m["h"][1])} trabajo autónomo y {h(m["h"][2])} evaluación.</p></div>')
guia = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Guía del participante · {CURSO}</title><style>
@page{{size:A4;margin:22mm 16mm 18mm}}
*{{box-sizing:border-box}} body{{margin:0;font:10.4pt/1.5 Inter,"Segoe UI",Arial,sans-serif;color:#172431}}
.cover{{height:297mm;position:relative;page-break-after:always;background:#0f6f76;color:#fff}}
.cover .ph{{height:150mm;background:url({img64(IMG['bienv'][0],1400)}) center/cover}}
.cover .tx{{padding:16mm 16mm}} .cover small{{letter-spacing:.18em;font-weight:700;font-size:8.5pt;opacity:.9}}
.cover .pill{{display:inline-block;border:1px solid rgba(255,255,255,.6);border-radius:20px;padding:2px 12px;font-size:8.5pt;margin:8px 0 14px}}
.cover h1{{font-size:30pt;margin:0 0 8px}} .cover p{{font-size:11.5pt;max-width:140mm;opacity:.95}}
.cover .ft{{position:absolute;left:16mm;right:16mm;bottom:12mm;display:flex;justify-content:space-between;font-size:8.5pt;opacity:.85}}
h2.sec{{display:flex;align-items:center;gap:10px;color:#173f4e;font-size:15pt;margin:18px 0 8px;page-break-after:avoid}}
h2.sec span{{width:26px;height:26px;border-radius:50%;background:#0f7a82;color:#fff;font-size:10pt;display:grid;place-items:center;flex:none}}
h1.w{{color:#173f4e;font-size:17pt;margin:0 0 6px}} h3{{color:#173f4e;font-size:12pt;margin:14px 0 6px;page-break-after:avoid}}
.box{{background:#eaf7f6;border:1px solid #a9dbd7;border-radius:8px;padding:8px 12px;margin:8px 0}}
.key{{background:#fff8ed;border-left:4px solid #c97d0e;border-radius:6px;padding:8px 12px;margin:10px 0}} .key b{{color:#9a5e04}}
table.t{{width:100%;border-collapse:collapse;margin:8px 0;font-size:9.4pt;page-break-inside:avoid}}
table.t th{{background:#173f4e;color:#fff;text-align:left;padding:6px 8px}} table.t td{{padding:6px 8px;border-bottom:1px solid #d8e2e6;vertical-align:top}}
table.t tr:nth-child(even) td{{background:#f7fafb}} table.t td.n,table.t th.n{{text-align:right;white-space:nowrap}} table.t tr.tot td{{font-weight:700;border-top:2px solid #0f7a82;background:#fff}}
table.t ul{{margin:0;padding-left:16px}} .kv td:first-child{{font-weight:700;width:34mm}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:8px}} .grid div{{border:1px solid #d8e2e6;border-radius:8px;padding:8px 10px;background:#fbfcfd}} .grid b{{display:block;color:#173f4e}}
.small{{font-size:8.6pt;color:#5f7180}} .mod{{page-break-inside:avoid}} ol,ul{{margin:4px 0;padding-left:18px}} .toc li{{margin:2px 0}}
.chk li{{list-style:'☐  '}}
</style></head><body>
<section class="cover"><div class="ph"></div><div class="tx"><small>{CURSO.upper()}</small><br><span class="pill">Presentación del curso</span>
<h1>Guía del participante</h1><p>Competencia, aprendizajes esperados, metodología, módulos y formato de evaluación del curso.</p></div>
<div class="ft"><span>Material de apoyo del curso · Uso formativo</span><span>Guía del participante</span></div></section>

<h1 class="w">Te damos la bienvenida</h1>
<p>El curso <b>{CURSO}</b> te prepara para {BIENVENIDA.split('te prepara para ',1)[1]}</p>
<table class="t kv"><tbody>
<tr><td>Modalidad</td><td>E-learning asincrónico, a tu propio ritmo</td></tr>
<tr><td>Duración</td><td>{HORAS} horas · {len(MODS)} módulos · {NLECC} microlecciones</td></tr>
<tr><td>Plataforma</td><td>{PLATAFORMA}. Consultas al tutor por mensajería y foro del aula, con respuesta en un plazo máximo de 48 horas hábiles.</td></tr>
<tr><td>Público</td><td>{PUBLICO}</td></tr>
<tr><td>Casos conductores</td><td>{CASO}</td></tr></tbody></table>
<h3>Requisitos de ingreso</h3><ul>{''.join(f'<li>{x}</li>' for x in REQUISITOS)}</ul>
<ol class="toc"><li>Competencia y aprendizajes esperados</li><li>Metodología Tremen Learning System</li><li>Distribución horaria</li><li>Los cuatro módulos</li><li>Recorrido sugerido de cada módulo</li><li>Formato de evaluación</li><li>Evaluación diagnóstica y mapa de competencias</li><li>Requisitos técnicos y recomendaciones</li></ol>

<div style="page-break-before:always"></div>
{sec(1,'Competencia y aprendizajes esperados')}
<div class="box"><b>Competencia a desarrollar.</b> {COMP}</div>
<p>La competencia se construye con cuatro aprendizajes esperados (AE), uno por módulo. Cada uno tiene su criterio de evaluación.</p>
<table class="t"><thead><tr><th>AE</th><th>Módulo</th><th>Aprendizaje esperado</th><th class="n">Horas</th></tr></thead><tbody>
{''.join(f'<tr><td><b>{m["ae"]}</b></td><td>{m["n"]} · {m["titulo"]}</td><td>{m["aetxt"]}</td><td class="n">{h(sum(m["h"]))}</td></tr>' for m in MODS)}</tbody></table>
<div class="key"><b>Idea clave:</b> digitalizar no es usar más herramientas: es elegir las que resuelven un problema real del negocio y medir si funcionan.</div>
{sec(2,'Metodología Tremen Learning System')}
<p>La metodología Tremen Learning System (TLS) integra storytelling, escenarios de decisión y práctica con casos, simuladores y pantallas recreadas de las herramientas.</p>
<div class="grid"><div><b>Storytelling</b>Acompañas a María (Empanadas Doña María) y a Marcela (Casa Nativa) mientras digitalizan sus negocios.</div>
<div><b>Escenarios de decisión</b>Eliges qué hacer y ves las consecuencias, con retroalimentación en cada alternativa.</div>
<div><b>Actividades prácticas</b>Laboratorios y simuladores con casos aleatorios: calculas márgenes, costos de campaña e indicadores.</div>
<div><b>Transferencia al negocio</b>Cada módulo trae dos herramientas en PDF rellenable para aplicar en tu PYME.</div></div>
<table class="t"><thead><tr><th>Pregunta</th><th>Respuesta</th></tr></thead><tbody>
<tr><td><b>¿Qué harás?</b></td><td>Revisarás microlecciones interactivas, videos demostrativos, casos y pantallas recreadas de Microsoft 365, Drive/OneDrive, WhatsApp Business, Canva, Meta Ads, Google Ads, un CRM y Google Analytics 4. Comienzas con un diagnóstico sin nota y cierras con un Plan de Acción Digital y una evaluación final con un caso integrador.</td></tr>
<tr><td><b>¿Cómo lo harás?</b></td><td>Cada microlección sigue la secuencia situación, decisión, explicación, demostración, práctica con retroalimentación y transferencia. Cada módulo suma dos actividades prácticas (laboratorio y simulador), dos PDF de apoyo y su evaluación.</td></tr>
<tr><td><b>¿Con qué y dónde?</b></td><td>En el aula virtual Moodle, disponible 24/7: {NLECC} microlecciones SCORM que funcionan en computador, tablet y celular, 8 videos, 8 actividades prácticas, 8 PDF de apoyo y evaluaciones en línea. Un tutor responde por mensajería y foro en un máximo de 48 horas hábiles.</td></tr></tbody></table>
{sec(3,'Distribución horaria')}
<p>De las {HORAS} horas, {h(P)} ({pct(P)} %) corresponden a plataforma, {h(A)} ({pct(A)} %) a trabajo autónomo y {h(E)} ({pct(E)} %) a evaluación.</p>
<table class="t"><thead><tr><th>Módulo</th><th class="n">Plataforma</th><th class="n">Autónomo</th><th class="n">Evaluación</th><th class="n">Total</th></tr></thead><tbody>
{''.join(f'<tr><td>{m["ae"]} · Módulo {m["n"]}: {m["titulo"]}</td>' + ''.join(f'<td class="n">{h(x)}</td>' for x in m['h']) + f'<td class="n">{h(sum(m["h"]))}</td></tr>' for m in MODS)}
<tr class="tot"><td>Total</td><td class="n">{h(P)}</td><td class="n">{h(A)}</td><td class="n">{h(E)}</td><td class="n">{h(HORAS)}</td></tr></tbody></table>
<p class="small">Plataforma: lecciones, videos, laboratorios y simuladores. Trabajo autónomo: completar las fichas PDF con los datos de tu negocio y avanzar tu Plan de Acción Digital. Evaluación: cuestionarios, análisis de casos y evaluación final (Módulo 4).</p>
<div class="key"><b>Recomendación.</b> Avanza un poco cada día. Reserva bloques de al menos 45 minutos para los laboratorios, los simuladores y el análisis de casos.</div>

<div style="page-break-before:always"></div>
{sec(4,'Los cuatro módulos')}
{modblocks}
{sec(5,'Recorrido sugerido de cada módulo')}
<ol><li><b>Microlecciones del módulo</b>: en orden; cada una incluye su video y su comprobación</li>
<li><b>Videos demostrativos</b>: recorridos por las herramientas del módulo</li>
<li><b>Dos PDF de apoyo</b>: fichas rellenables para aplicar en tu negocio</li>
<li><b>Actividades prácticas</b>: un laboratorio y un simulador</li>
<li><b>Evaluación del módulo</b>: cuestionario de 10 preguntas y, desde el Módulo 2, análisis de casos. Debes aprobarla.</li></ol>
<p>Al terminar el Módulo 4 rindes la evaluación final, en dos partes: un cuestionario de 20 preguntas (5 por módulo) y el caso práctico integrador {CASO_FINAL}.</p>
{sec(6,'Formato de evaluación')}
<table class="t"><thead><tr><th>Componente</th><th class="n">Peso</th></tr></thead><tbody>
{''.join(f'<tr><td>{a}</td><td class="n">{b}</td></tr>' for a, b in PESOS)}<tr class="tot"><td>Total</td><td class="n">100 %</td></tr></tbody></table>
<div class="key"><b>Norma de evaluación:</b> escala de 1,0 a 7,0 con 60 % de exigencia. Nota mínima de aprobación: 4,0 en la nota final ponderada del curso. Requisito administrativo: completar el 100 % de las actividades obligatorias del aula virtual.</div>
<p>Cada pregunta vale 2 puntos. Los cuestionarios y la Parte 1 de la evaluación final tienen calificación automática y retroalimentación por alternativa. El análisis de casos de cada módulo y la Parte 2 se responden con cálculos, clasificaciones, priorizaciones y pantallas recreadas; al enviar ves tu puntaje, el detalle por pregunta y la revisión con retroalimentación. La evaluación diagnóstica, las comprobaciones de cada lección, los laboratorios y los simuladores son formativos y no ponderan.</p>
<h3>Criterios de evaluación</h3><ul>{''.join(f'<li><b>{m["ae"]}:</b> {m["crit"]}</li>' for m in MODS)}</ul>
{sec(7,'Evaluación diagnóstica y mapa de competencias')}
<p>Antes del Módulo 1 responderás una evaluación diagnóstica breve, sin nota, en dos pasos:</p>
<ol><li><b>Autoevaluación:</b> indicas cómo te percibes en cada aprendizaje esperado.</li><li><b>Situaciones:</b> respondes 20 preguntas de selección múltiple, cinco por módulo.</li></ol>
<p>Al terminar verás tu mapa de competencias: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado, tu nivel en cada uno (inicial, en desarrollo o avanzado) y las lecciones en que conviene poner más atención. Puedes descargarlo en PDF con todas tus respuestas.</p>
<div class="box">Para que tu ruta sea útil, responde con honestidad y sin buscar las respuestas. El diagnóstico no afecta tu nota.</div>
{sec(8,'Requisitos técnicos y recomendaciones')}
<ul class="chk">{''.join(f'<li>{x}</li>' for x in TEC)}</ul>
<div class="box"><b>Consejos para avanzar.</b> Las lecciones se adaptan al celular, pero usa un computador para los laboratorios, los simuladores y el caso integrador, que trabajan con tablas y pantallas recreadas. Ante cualquier duda, escribe al tutor por la mensajería o el foro del aula.</div>
</body></html>"""
import re as _re
cover_html = _re.sub(r'(<body>).*', lambda m: m.group(1) + _re.search(r'<section class="cover">.*?</section>', guia, _re.S).group(0) + '</body></html>', guia, flags=_re.S)
body_html = guia.replace(_re.search(r'<section class="cover">.*?</section>', guia, _re.S).group(0), '')
cover_html = cover_html.replace('@page{size:A4;margin:22mm 16mm 18mm}', '@page{size:A4;margin:0}')
gc = os.path.join(OUT, '_portada.html'); open(gc, 'w', encoding='utf-8').write(cover_html)
gh = os.path.join(OUT, '_guia.html'); open(gh, 'w', encoding='utf-8').write(body_html)
js_pdf = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch({{executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}});const p=await b.newPage();
await p.goto('file://{gc}');await p.waitForTimeout(400);await p.pdf({{path:'{os.path.join(OUT,'_portada.pdf')}',format:'A4',printBackground:true,margin:{{top:0,bottom:0,left:0,right:0}}}});
await p.goto('file://{gh}');await p.waitForTimeout(400);
await p.pdf({{path:'{os.path.join(OUT, '_cuerpo.pdf')}',format:'A4',printBackground:true,displayHeaderFooter:true,
headerTemplate:'<div style="font-size:7px;width:100%;padding:0 16mm;display:flex;justify-content:space-between;color:#5f7180;font-family:Arial"><span>Guía del participante · {CURSO}</span><span>Presentación del curso</span></div>',
footerTemplate:'<div style="font-size:7px;width:100%;padding:0 16mm;text-align:right;color:#5f7180;font-family:Arial">Página <span class=pageNumber></span> de <span class=totalPages></span></div>'}});
await b.close()}})();"""
open(os.path.join(OUT, '_pdf.js'), 'w').write(js_pdf)
npm = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
subprocess.run(['node', os.path.join(OUT, '_pdf.js')], check=True, env={**os.environ, 'NODE_PATH': npm})
os.remove(os.path.join(OUT, '_pdf.js'))
from pypdf import PdfWriter, PdfReader
w = PdfWriter()
for f in ('_portada.pdf', '_cuerpo.pdf'):
    for pg in PdfReader(os.path.join(OUT, f)).pages[:1 if f == '_portada.pdf' else None]: w.add_page(pg)
w.add_metadata({'/Title': f'Guía del participante · {CURSO}'})
w.write(os.path.join(OUT, 'Guia_del_participante_Herramientas_Digitales_PYMES.pdf'))
for f in ('_portada.pdf', '_cuerpo.pdf', '_portada.html', '_guia.html'): os.remove(os.path.join(OUT, f))
print('ok', TOT, NLECC)

#!/usr/bin/env python3
"""Genera la presentación del curso (carrusel HTML autocontenido) y la guía del participante (PDF) desde un solo archivo de datos.

Uso: python3 tools/build_presentacion.py src/bienvenida/presentacion.py
Salida: dist/bienvenida/Presentacion_del_curso.html
        src/bienvenida/pdf/guia_participante.html (fragmento) → dist/bienvenida/Guia_del_participante.pdf
Ambos documentos usan los mismos datos, así nunca se contradicen. La competencia, los aprendizajes esperados,
los criterios y las horas salen de curso.json → "sence" cuando el archivo de datos no los trae (fuente única).
Los colores son los del curso (curso.json → "colores"). Ejemplo de datos: src/ejemplos/bienvenida/presentacion.py.
Junto con `python3 tools/build_moodle.py bienvenida` completa las tres piezas de la bienvenida.
"""
import html, runpy, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import build_carousel as bc  # noqa: E402
import build_pdf  # noqa: E402
from moodle import paleta, sence  # noqa: E402
from curso import curso  # noqa: E402

E = html.escape


def hours(m):
    p, a, e = m["h"]
    return p, a, e, p + a + e


def totals(D):
    t = [sum(hours(m)[i] for m in D["MODULOS"]) for i in range(4)]
    return t


def fh(v):
    return str(v).replace('.', ',').removesuffix(',0')


def pct(x, tot):
    return round(x / tot * 100)


def lecc_items(m):
    return [("🎬 " if l.split(" ")[0] in m["video"] else "") + "Lección " + l for l in m["lecc"]]


def completar(D):
    """Completa competencia, AE, criterios y horas desde curso.json → "sence" (fuente única)."""
    S = sence()
    D.setdefault("COMPETENCIA", S["competencia"])
    for k, m in enumerate(D["MODULOS"]):
        m.setdefault("aprend", S["ae"][k])
        m.setdefault("criterio", S["criterios"][k])
        m.setdefault("ae", f"AE{k + 1}")
    D.setdefault("FACILITADORA", {"nombre": "", "profesion": "", "exp": ""})
    D["FACILITADORA"].setdefault("rol", "facilitadora")
    return D


def img(D, clave):
    """Imagen de una tarjeta: D["IMAGENES"][clave] = (archivo en src/img, alt)."""
    return D.get("IMAGENES", {}).get(clave, (None, ""))


# Piezas de las tarjetas de la presentación (las mismas de la presentación de referencia).
CSS_TARJETAS = """<style>
.cols>div{min-width:0}.tw{overflow-x:auto;max-width:100%}
.mini{width:100%;border-collapse:collapse;font-size:.9rem;margin:4px 0 12px}
.mini th{background:var(--navy);color:#fff;text-align:left;padding:7px 10px;font-size:.8rem}
.mini td{padding:7px 10px;border-top:1px solid var(--line2);vertical-align:top}
.mini td.n{text-align:right;font-weight:850;white-space:nowrap;font-variant-numeric:tabular-nums}
.mini tr.tot td{font-weight:900;border-top:2px solid var(--teal)}
.hb{display:grid;gap:10px;margin:6px 0 12px}
.hb div{display:grid;grid-template-columns:minmax(0,9rem) minmax(0,1fr) auto;gap:10px;align-items:center;font-size:.92rem}
.hb i{display:block;height:14px;border-radius:999px;background:var(--track);overflow:hidden}
.hb i b{display:block;height:100%;background:linear-gradient(90deg,var(--teal),var(--teal2))}
.ae{background:var(--mint);border:1px solid var(--mint-line);border-radius:16px;padding:10px 14px;margin:2px 0 12px;font-weight:700;color:var(--teal-ink)}
.ae small{display:block;font-weight:850;letter-spacing:.04em;text-transform:uppercase;font-size:.72rem;margin-bottom:2px}
.steps{list-style:none;counter-reset:s;margin:4px 0 12px;padding:0;display:grid;gap:8px}
.steps li{counter-increment:s;background:var(--surface2);border:1px solid var(--line2);border-radius:14px;padding:9px 12px 9px 46px;position:relative}
.steps li::before{content:counter(s);position:absolute;left:10px;top:8px;width:26px;height:26px;border-radius:50%;background:var(--navy);color:#fff;font-weight:900;font-size:.8rem;display:grid;place-items:center}
.tri{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));margin:4px 0 12px}
.tri div{background:var(--surface2);border:1px solid var(--line2);border-radius:16px;padding:12px 14px}
.tri b{display:block;color:var(--navy);margin-bottom:4px}
@media(max-width:560px){.hb div{grid-template-columns:1fr auto}.hb i{grid-column:1/-1;grid-row:2}.mini{font-size:.84rem}.mini th,.mini td{padding:6px 7px}}
</style>"""


def colores_css():
    """Sobrescribe los tokens del tema claro con la paleta del curso, si curso.json la declara."""
    if not curso().get("colores"):
        return ""
    c = paleta()
    return (f"<style>:root:not([data-theme=dark]){{--navy:{c['oscuro']};--teal:{c['primario']};--teal2:{c['acento']};--teal-ink:{c['acento_txt']};"
            f"--mint:{c['suave']};--line:{c['linea']}}}.bar span{{background:linear-gradient(90deg,{c['acento']},{c['destaque']})}}</style>")


# ---------------- Presentación (carrusel) ----------------
def card(kicker, title, body, points=None, key=None, img=None, alt=""):
    im = f'<img src="{bc.img_uri(img)}" alt="{E(alt)}"/>' if img else ""
    pts = "".join(f"<li>{p}</li>" for p in (points or []))
    return f"""<article class="card"><span class="kicker">{kicker}</span><h2>{title}</h2>
<div class="cols{' has-img' if im else ''}"><div>{body}{f'<ul class="points">{pts}</ul>' if pts else ''}</div>{im}</div>
{f'<div class="key"><b>Idea clave:</b> {key}</div>' if key else ''}</article>"""


def presentacion(D):
    M = D["MODULOS"]
    tp, ta, te, tt = totals(D)
    cards = [
        card("Bienvenida", E(D["CURSO"]), f"<p>{D['BIENVENIDA']}</p>",
             [f"<b>Modalidad:</b> {D['MODALIDAD']}", f"<b>Duración:</b> {fh(tt)} horas en {len(M)} módulos y {sum(len(m['lecc']) for m in M)} lecciones",
              f"<b>Plataforma:</b> {D['PLATAFORMA']}", f"<b>Caso conductor:</b> {D['CASO']}"],
             "Todos los datos del curso son ficticios: puedes practicar sin riesgo.", *img(D, "bienvenida")),
        card("Competencia a desarrollar", "Lo que serás capaz de hacer al terminar",
             f'<div class="ae"><small>Competencia del curso</small>{D["COMPETENCIA"]}</div><p>La competencia se construye paso a paso con <b>{len(M)} aprendizajes esperados</b>, uno por módulo:</p>',
             [f"<b>{m['ae']} · Módulo {m['n']}:</b> {m['aprend']}" for m in M],
             "Cada aprendizaje esperado se evalúa con su propio criterio y con las actividades prácticas del módulo."),
        card("Para quién es", "Público y requisitos de ingreso", f"<p>{D['PUBLICO']}</p>", D["REQUISITOS"],
             D.get("IDEA_PUBLICO", "El curso te guía paso a paso desde los fundamentos."), *img(D, "publico")),
        card("Metodología", "Tremen Learning System (TLS)",
             "<p>El curso integra estrategias que se repiten en cada módulo: aprendes con una historia, decides en escenarios realistas y practicas en simuladores.</p>",
             [f"<b>{a}:</b> {b[0].lower() + b[1:]}" for a, b in D["METODO"]],
             "Aprendes haciendo: cada concepto se aplica de inmediato en una decisión o un ejercicio.", *img(D, "metodologia")),
        card("Acompañamiento", f"Tu {D['FACILITADORA']['rol']}: {E(D['FACILITADORA']['nombre'])}",
             f'<div class="ae"><small>{D["FACILITADORA"]["rol"].capitalize()} responsable del curso</small>{E(D["FACILITADORA"]["nombre"])} · {E(D["FACILITADORA"]["profesion"])}</div><p>{D["FACILITADORA"]["exp"]}</p>',
             D["ACOMP"], f"Tu aprendizaje no ocurre solo: tu {D['FACILITADORA']['rol']} revisa tus tareas y te orienta durante todo el curso.", *img(D, "tutor")),
        card("Metodología", "¿Qué harás, cómo y con qué?",
             f'<div class="tri"><div><b>¿Qué harás?</b>{D["QUE"]}</div><div><b>¿Cómo lo harás?</b>{D["COMO"]}</div><div><b>¿Con qué y dónde?</b>{D["CON"]}</div></div>',
             None, f"Las consultas de contenido se hacen a tu {D['FACILITADORA']['rol']} por la mensajería del aula."),
    ]
    rows = "".join(f'<tr><td><b>M{m["n"]}</b> {E(m["corto"])}</td>' + "".join(f'<td class="n">{fh(v)} h</td>' for v in hours(m)) + "</tr>" for m in M)
    hb = "".join(f'<div><span>{n}</span><i><b style="width:{round(v / tp * 100)}%"></b></i><strong>{fh(v)} h · {pct(v, tt)} %</strong></div>'
                 for n, v in (("Plataforma", tp), ("Trabajo autónomo", ta), ("Evaluación", te)))
    cards.append(card("Distribución horaria", f"Tus {fh(tt)} horas de dedicación",
                      f'<div class="hb">{hb}</div><div class="tw"><table class="mini"><thead><tr><th>Módulo</th><th>Plataf.</th><th>Autón.</th><th>Eval.</th><th>Total</th></tr></thead><tbody>{rows}'
                      f'<tr class="tot"><td>Total</td><td class="n">{fh(tp)} h</td><td class="n">{fh(ta)} h</td><td class="n">{fh(te)} h</td><td class="n">{fh(tt)} h</td></tr></tbody></table></div>'
                      '<p style="font-size:.85rem;color:var(--muted)">Plataf.: horas en plataforma · Autón.: trabajo autónomo · Eval.: evaluación.</p>',
                      None, "Organiza tu semana: avanzar un poco cada día rinde más que una sola sesión larga."))
    for m in M:
        p, a, e, t = hours(m)
        body = (f'<div class="ae"><small>Aprendizaje esperado {m["ae"]}</small>{m["aprend"]}</div><p><b>Cómo lo lograrás:</b> {m["como"]}</p>'
                f'<ul class="points">{"".join(f"<li>{E(x)}</li>" for x in lecc_items(m))}</ul>'
                f'<div class="tw"><table class="mini"><tbody><tr><td>🧪 Laboratorios</td><td>{" · ".join(E(x) for x in m["labs"])}</td></tr>'
                f'<tr><td>📄 PDF</td><td>{" · ".join(E(x) for x in m["pdf"])}</td></tr>'
                f'<tr><td>▶ Videos</td><td>Presentación del módulo · {E(m["vcont"])}</td></tr>'
                f'<tr><td>⏱ Horas</td><td>{fh(p)} h plataforma · {fh(a)} h trabajo autónomo · {fh(e)} h evaluación</td></tr></tbody></table></div>')
        cards.append(card(f"Módulo {m['n']} · {fh(t)} horas", E(m["titulo"]), body,
                          ["<b>Además:</b> resumen y glosario interactivos y cuestionario de 10 preguntas",
                           f"<b>Evaluación del módulo, parte 2:</b> {E(m.get('p2', 'evaluación ramificada «' + m['ram'] + '»'))}"],
                          f"Criterio de evaluación: {m['criterio']}", m.get("img"), m.get("alt", "")))
    cards.append(card("Recorrido de cada módulo", "El orden sugerido dentro de un módulo",
                      f'<ol class="steps">{"".join(f"<li>{x}</li>" for x in D["RECORRIDO"])}</ol><p>🎬 = lección con video integrado por capítulos. {D["ESTRUCTURA_LECCION"]}</p>',
                      None, "Sigue el orden de la plataforma: cada recurso prepara el siguiente."))
    ev = "".join(f'<tr><td>{E(a)}</td><td class="n">{b}</td></tr>' for a, b in D["EVAL"])
    cards.append(card("Formato de evaluación", "Cómo se calcula tu nota final",
                      f'<div class="tw"><table class="mini"><thead><tr><th>Componente</th><th>Peso</th></tr></thead><tbody>{ev}<tr class="tot"><td>Total</td><td class="n">100 %</td></tr></tbody></table></div>',
                      D["NORMA"], "Las actividades se califican automáticamente y entregan retroalimentación en cada alternativa."))
    ins = "".join(f'<tr><td>Módulo {m["n"]} ({m["ae"]})</td><td>Laboratorios: {E(m["labs"][0].split(" · ")[1])} y {E(m["labs"][1].split(" · ")[1])}. Evaluación: cuestionario de 10 preguntas y {E(m.get("p2", "evaluación ramificada «" + m["ram"] + "»"))}.</td></tr>' for m in D["MODULOS"])
    ins += "".join(f"<tr><td>{a}</td><td>{E(b)}</td></tr>" for a, b in D["INSTRUMENTOS_FINAL"])
    cards.append(card("Instrumentos de evaluación", "Qué se evalúa en cada etapa",
                      f'<div class="tw"><table class="mini"><thead><tr><th>Etapa</th><th>Instrumento</th></tr></thead><tbody>{ins}</tbody></table></div>',
                      None, "Al terminar la evaluación final descargas un PDF con tus resultados."))
    cards.append(card("Antes de empezar", "Evaluación diagnóstica y mapa de competencias",
                      "<p>Antes del Módulo 1 responderás una <b>evaluación diagnóstica</b>, sin nota, en dos pasos:</p>"
                      f'<ol class="steps">{"".join(f"<li>{x}</li>" for x in D["DIAG"])}</ol>',
                      ["Al terminar verás tu <b>mapa de competencias</b>: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado.",
                       "Recibirás tu nivel en cada aprendizaje esperado y una ruta con las lecciones en que conviene poner más atención.",
                       "Podrás <b>descargar un PDF</b> con tu mapa y tus respuestas."],
                      "El diagnóstico no afecta tu nota: responde con honestidad para que tu ruta sea útil.", *img(D, "diagnostico")))
    cards.append(card("Requisitos técnicos", "Lo que necesitas para el curso",
                      f"<p>{D.get('CONSEJO_EQUIPO', 'Las lecciones se adaptan al celular, pero te recomendamos usar un computador para los laboratorios, las tareas y las evaluaciones.')}</p>",
                      D["TECNICOS"], "¡Te damos la bienvenida! Comienza por la evaluación diagnóstica."))
    body = f"""<h1>Presentación del curso</h1>
<p class="sub">{E(D['CURSO'])} · E-learning asincrónico · {fh(tt)} horas</p><div class="bar"><span></span></div>
<div class="viewport"><div class="track">{''.join(cards)}</div></div>"""
    return bc.page("Presentación del curso", "Presentación del curso", body).replace("</head>", CSS_TARJETAS + colores_css() + "</head>", 1)


# ---------------- Guía del participante (fragmento para build_pdf) ----------------
def guia(D):
    M = D["MODULOS"]
    tp, ta, te, tt = totals(D)
    nl = sum(len(m["lecc"]) for m in M)
    meta = ('<!--{"title": "Guía del participante", "subtitle": "Competencia, aprendizajes esperados, metodología, módulos y formato de evaluación del curso.", '
            '"module": "Presentación del curso", "kind": "Guía del participante", "file": "Guia_del_participante.pdf", "img": "' + (img(D, "bienvenida")[0] or "") + '", '
            f'"short": "Guía del participante · {D["CORTO"]}"' + '}-->')
    toc = ["Competencia y aprendizajes esperados", f"Metodología y acompañamiento de tu {D['FACILITADORA']['rol']}", "Distribución horaria", f"Los {len(M)} módulos",
           "Recorrido sugerido de cada módulo", "Formato de evaluación", "Evaluación diagnóstica y mapa de competencias", "Requisitos técnicos y recomendaciones"]
    o = [meta, f"""<section><h2>Te damos la bienvenida</h2>
<p class="lead">El curso <b>{E(D['CURSO'])}</b> {D['BIENVENIDA'][len('El curso '):]}</p>
<table><colgroup><col style="width:30%"/><col/></colgroup><tbody>
<tr><td><b>Modalidad</b></td><td>{D['MODALIDAD']}</td></tr>
<tr><td><b>Duración</b></td><td>{fh(tt)} horas · {len(M)} módulos · {nl} lecciones</td></tr>
<tr><td><b>Plataforma</b></td><td>{D['PLATAFORMA']}</td></tr>
<tr><td><b>{D['FACILITADORA']['rol'].capitalize()}</b></td><td>{D['FACILITADORA']['nombre']}, {D['FACILITADORA']['profesion'].lower()}</td></tr>
<tr><td><b>Público</b></td><td>{D['PUBLICO']}</td></tr>
<tr><td><b>Caso conductor</b></td><td>{D['CASO']}</td></tr></tbody></table>
<h3>Requisitos de ingreso</h3><ul>{''.join(f'<li>{x}</li>' for x in D['REQUISITOS'])}</ul>
<ol class="toc" style="columns:2;column-gap:8mm">{''.join(f'<li>{x}</li>' for x in toc)}</ol></section>"""]
    o.append(f"""<section class="page"><h2><span class="n">1</span>Competencia y aprendizajes esperados</h2>
<div class="box info"><b>Competencia a desarrollar.</b> {D['COMPETENCIA']}</div>
<p>La competencia se construye con {len(M)} aprendizajes esperados (AE), uno por módulo. Cada uno tiene su criterio de evaluación.</p>
<table><colgroup><col style="width:9%"/><col style="width:30%"/><col/><col style="width:10%"/></colgroup><thead><tr><th>AE</th><th>Módulo</th><th>Aprendizaje esperado</th><th>Horas</th></tr></thead><tbody>
{''.join(f'<tr><td><b>{m["ae"]}</b></td><td>{m["n"]} · {E(m["titulo"])}</td><td>{m["aprend"]}</td><td>{fh(hours(m)[3])} h</td></tr>' for m in M)}</tbody></table>
<div class="box key"><b>Idea clave:</b> {D['IDEA_CLAVE']}</div></section>""")
    o.append(f"""<section><h2><span class="n">2</span>Metodología y acompañamiento de tu {D['FACILITADORA']['rol']}</h2>
<p>La metodología Tremen Learning System (TLS) integra storytelling, escenarios de decisión y laboratorios interactivos.</p>
<div class="grid2">{''.join(f'<div class="card"><h4>{a}</h4>{b}</div>' for a, b in D['METODO'])}</div>
<table style="margin-top:4mm"><colgroup><col style="width:24%"/><col/></colgroup><thead><tr><th>Pregunta</th><th>Respuesta</th></tr></thead><tbody>
<tr><td><b>¿Qué harás?</b></td><td>{D['QUE']}</td></tr><tr><td><b>¿Cómo lo harás?</b></td><td>{D['COMO']}</td></tr><tr><td><b>¿Con qué y dónde?</b></td><td>{D['CON']}</td></tr></tbody></table>
<h3>Tu {D['FACILITADORA']['rol']} y el acompañamiento obligatorio</h3>
<p><b>{D['FACILITADORA']['nombre']}</b>, {D['FACILITADORA']['profesion'].lower()}. {D['FACILITADORA']['exp']}</p>
<ul>{''.join(f'<li>{x}</li>' for x in D['ACOMP'])}</ul></section>""")
    o.append(f"""<section style="break-inside:avoid"><h2><span class="n">3</span>Distribución horaria</h2>
<p>De las {fh(tt)} horas, {fh(tp)} h ({pct(tp, tt)} %) corresponden a plataforma, {fh(ta)} h ({pct(ta, tt)} %) a trabajo autónomo y {fh(te)} h ({pct(te, tt)} %) a evaluación.</p>
<table><colgroup><col/><col style="width:13%"/><col style="width:13%"/><col style="width:13%"/><col style="width:10%"/></colgroup><thead><tr><th>Módulo</th><th>Plataforma</th><th>Autónomo</th><th>Evaluación</th><th>Total</th></tr></thead><tbody>
{''.join(f'<tr><td>{m["ae"]} · Módulo {m["n"]}: {E(m["titulo"])}</td>' + ''.join(f'<td>{fh(v)} h</td>' for v in hours(m)) + '</tr>' for m in M)}
<tr><td><b>Total</b></td><td><b>{fh(tp)} h</b></td><td><b>{fh(ta)} h</b></td><td><b>{fh(te)} h</b></td><td><b>{fh(tt)} h</b></td></tr></tbody></table>
<div class="box key"><b>Recomendación.</b> Avanza un poco cada día. Reserva bloques de al menos 45 minutos para los laboratorios.</div></section>""")
    for i, m in enumerate(M):
        p, a, e, t = hours(m)
        o.append(f"""<section class="page"><h2>{'<span class="n">4</span>' if i == 0 else ''}Módulo {m['n']} · {E(m['titulo'])} ({fh(t)} h)</h2>
<div class="box info"><b>Aprendizaje esperado {m['ae']}.</b> {m['aprend']}</div>
<p><b>Cómo lo lograrás:</b> {m['como']}</p>
<table><colgroup><col style="width:47%"/><col/></colgroup><thead><tr><th>Lecciones (🎬 con video integrado)</th><th>Actividades y recursos</th></tr></thead><tbody><tr>
<td><ul>{''.join(f'<li>{"🎬 " if l.split(" ")[0] in m["video"] else ""}{E(l)}</li>' for l in m['lecc'])}</ul></td>
<td><ul>{''.join(f'<li>Laboratorio {E(x)}</li>' for x in m['labs'])}{''.join(f'<li>PDF: {E(x)}</li>' for x in m['pdf'])}
<li>Video de presentación y video de contenido: {E(m['vcont'])}</li><li>Resumen y glosario interactivos</li><li>Cuestionario de 10 preguntas</li><li>Evaluación del módulo, parte 2: {E(m.get('p2', 'evaluación ramificada «' + m['ram'] + '»'))}</li></ul></td></tr></tbody></table>
<p class="src"><b>Criterio de evaluación:</b> {m['criterio']} · Distribución: {fh(p)} h plataforma, {fh(a)} h trabajo autónomo y {fh(e)} h evaluación.</p></section>""")
    o.append(f"""<section class="page"><h2><span class="n">5</span>Recorrido sugerido de cada módulo</h2>
<ol>{''.join(f'<li>{x}</li>' for x in D['RECORRIDO'])}</ol><p>{D['ESTRUCTURA_LECCION']}</p></section>""")
    o.append(f"""<section><h2><span class="n">6</span>Formato de evaluación</h2>
<table><colgroup><col/><col style="width:14%"/></colgroup><thead><tr><th>Componente</th><th>Peso</th></tr></thead><tbody>
{''.join(f'<tr><td>{E(a)}</td><td>{b}</td></tr>' for a, b in D['EVAL'])}<tr><td><b>Total</b></td><td><b>100 %</b></td></tr></tbody></table>
<div class="box key"><b>Norma de evaluación:</b> {' '.join(D['NORMA'])}</div>
<p>Las actividades configuradas en la plataforma tienen calificación automática y retroalimentación por alternativa. Las respuestas de desarrollo se revisan con rúbrica o pauta de cotejo. Al terminar la evaluación final descargas un PDF con tus resultados.</p>
<h3>Instrumentos de la evaluación final integradora</h3><ul>{''.join(f'<li><b>{a}:</b> {E(b)}</li>' for a, b in D['INSTRUMENTOS_FINAL'])}</ul>
<h3>Criterios de evaluación</h3><ul>{''.join(f'<li><b>{m["ae"]}:</b> {m["criterio"]}</li>' for m in M)}</ul></section>""")
    o.append(f"""<section class="page"><h2><span class="n">7</span>Evaluación diagnóstica y mapa de competencias</h2>
<p>Antes del Módulo 1 responderás una evaluación diagnóstica breve, sin nota, en dos pasos:</p><ol>{''.join(f'<li>{x}</li>' for x in D['DIAG'])}</ol>
<p>Al terminar verás tu mapa de competencias: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado, tu nivel en cada uno y las lecciones en que conviene poner más atención. Puedes descargarlo en PDF con todas tus respuestas.</p>
<div class="box key"><b>Para que tu ruta sea útil,</b> responde con honestidad y sin buscar las respuestas. El diagnóstico no afecta tu nota.</div></section>""")
    o.append(f"""<section><h2><span class="n">8</span>Requisitos técnicos y recomendaciones</h2>
<ul class="check">{''.join(f'<li>{x}</li>' for x in D['TECNICOS'])}</ul>
<div class="box info"><b>Consejos para avanzar.</b> Si sales de una lección, tu avance queda guardado. Las lecciones se adaptan al celular, pero usa un computador para los laboratorios, las tareas y las evaluaciones. Ante cualquier duda, escribe por la mensajería interna de la plataforma.</div></section>""")
    return "\n".join(o)


def main(src):
    src = (ROOT / src).resolve()
    D = completar(dict(runpy.run_path(str(src))))
    out = ROOT / "dist" / src.parent.relative_to(ROOT / "src")
    out.mkdir(parents=True, exist_ok=True)
    f = out / "Presentacion_del_curso.html"
    f.write_text(presentacion(D), encoding="utf-8")
    print(f"OK {f.relative_to(ROOT)} · {f.stat().st_size // 1024} KB")
    frag = src.parent / "pdf" / "guia_participante.html"
    frag.parent.mkdir(exist_ok=True)
    frag.write_text(guia(D), encoding="utf-8")
    build_pdf.build(frag)


if __name__ == "__main__":
    main(sys.argv[1])

# -*- coding: utf-8 -*-
"""Módulo 1 · Herramienta PDF 1: Checklist de madurez digital.
Contenido (26 afirmaciones, 5 dimensiones, 4 etapas, máximo 78) homologado con
M1/recursos/checklist_madurez_digital.html."""
import os
from cnpdf import *  # noqa

OUT = os.path.join(os.path.dirname(__file__), '..', 'M1', 'recursos', 'pdf')

SECTIONS = [
    ('Organización y gestión de la información', [
        'Los documentos importantes del negocio están almacenados de manera ordenada.',
        'Existe una estructura clara de carpetas para encontrar archivos con rapidez.',
        'Los archivos tienen nombres comprensibles y consistentes.',
        'Evitamos depender de un único computador o teléfono para guardar información crítica.',
        'Sabemos cuál es la versión vigente de los documentos importantes.']),
    ('Trabajo en la nube y colaboración', [
        'Utilizamos herramientas en la nube para acceder a documentos desde distintos dispositivos.',
        'Compartimos archivos mediante enlaces o permisos, evitando enviar múltiples copias.',
        'Sabemos diferenciar entre permisos de lectura y edición.',
        'Las personas del equipo pueden colaborar sobre un mismo documento cuando corresponde.',
        'Revisamos periódicamente quién tiene acceso a carpetas o documentos compartidos.']),
    ('Productividad digital', [
        'Utilizamos herramientas digitales para organizar tareas, documentos o comunicaciones.',
        'Las herramientas que usamos responden a necesidades reales del negocio.',
        'Evitamos duplicar información en distintas aplicaciones sin necesidad.',
        'El equipo conoce las herramientas principales que debe utilizar para su trabajo.',
        'Tenemos criterios básicos para decidir cuándo incorporar una nueva herramienta.']),
    ('Seguridad digital básica', [
        'Cada persona utiliza su propia cuenta de acceso.',
        'Evitamos compartir contraseñas.',
        'Utilizamos contraseñas robustas y diferentes para cuentas importantes.',
        'Activamos la verificación en dos pasos cuando está disponible.',
        'Revisamos los permisos antes de compartir información sensible.',
        'Contamos con una forma de recuperar archivos o versiones anteriores cuando es necesario.']),
    ('Presencia y gestión digital del negocio', [
        'La información digital del negocio se mantiene actualizada.',
        'Los canales digitales de atención tienen responsables definidos.',
        'Registramos información básica de clientes, ventas o consultas.',
        'Utilizamos datos o métricas simples para tomar decisiones.',
        'Identificamos tareas repetitivas que podrían simplificarse con herramientas digitales.']),
]
STAGES = [
    (0, 20, 'Etapa inicial', 'Herramientas usadas de manera aislada o informal. Prioriza ordenar la información, '
     'definir una estructura básica de carpetas y fortalecer la seguridad de las cuentas.'),
    (21, 40, 'Etapa en desarrollo', 'Hay prácticas útiles, pero dependen de hábitos individuales. Estandariza '
     'herramientas, permisos, nombres de archivos y responsabilidades.'),
    (41, 60, 'Etapa funcional', 'Uso habitual de herramientas digitales. Integra procesos, reduce duplicidades y '
     'usa mejor la información para decidir.'),
    (61, 78, 'Etapa consolidada', 'Prácticas sistemáticas. Optimiza, automatiza y mide resultados sin perder '
     'control ni seguridad.'),
]
# Ejemplo ficticio: Empanadas Doña María
MARIA = [6, 5, 7, 6, 8]
MARIA_NOTE = [
    'Lista de precios en tres versiones y en tres lugares distintos.',
    'Usa la nube, pero envía copias por WhatsApp en vez de compartir un enlace.',
    'Pedidos anotados en el chat y en un cuaderno: se perdieron dos esta semana.',
    'Pedro, que ya no trabaja ahí, conocía la contraseña del correo del negocio.',
    'Responde rápido por Instagram, pero no registra ventas ni consultas.',
]


def m1_pdf1():
    path = os.path.join(OUT, 'M1_PDF1_Checklist_Madurez_Digital.pdf')
    d = Doc(path, 1, 1, 'Checklist de madurez digital',
            'Identifica de manera simple el nivel actual de digitalización de tu negocio y detecta '
            'oportunidades concretas de mejora.',
            4, short_title='Checklist de madurez digital para PYMES',
            disclaimer='Empanadas Doña María es una empresa ficticia con fines educativos')
    d.new_page()
    d.howto([
        'Lee cada afirmación y marca la opción que mejor representa la <b>situación actual</b> de tu negocio, no la ideal.',
        'Usa la escala de <b>0 a 3</b> (abajo). Responde las 26 afirmaciones.',
        'Suma el puntaje de cada dimensión y el total (máximo <b>78</b>) en la página 3 y ubica tu etapa.',
        'Elige <b>una mejora concreta</b> para esta semana y anótala en la página 4.',
    ], '≈ 20 minutos',
        extra='La madurez digital no depende de utilizar muchas aplicaciones, sino de que las herramientas ayuden '
              'al negocio a trabajar de forma más ordenada, segura y eficiente.')
    d.labeled([('Nombre', 'm1_nombre', 0.35), ('Negocio / PYME', 'm1_negocio', 0.45), ('Fecha', 'm1_fecha', 0.2)])
    # leyenda
    LEG = [('0', 'No lo hacemos'), ('1', 'Ocasional o informal'), ('2', 'Habitual, puede mejorar'),
           ('3', 'Sistemática y controlada')]
    cw = (CONTENT_W - 18) / 4
    x = MARGIN
    for n, t in LEG:
        d.box(x, d.y - 24, cw, 24, fill=MINT, stroke=None, r=6)
        d.c.setFillColor(TEAL)
        d.c.circle(x + 13, d.y - 12, 8, stroke=0, fill=1)
        d.c.setFillColor(white)
        d.c.setFont(FB, 9.5)
        d.c.drawCentredString(x + 13, d.y - 15.3, n)
        d.c.setFillColor(INK)
        d.c.setFont(F, 8.6)
        d.c.drawString(x + 26, d.y - 15, t)
        x += cw + 6
    d.space(34)

    hdr = ['#', 'Afirmación', '0', '1', '2', '3']
    cols = [0.06, 0.66, 0.07, 0.07, 0.07, 0.07]

    def rows_for(idx):
        rows = []
        for si in idx:
            t, items = SECTIONS[si]
            rows.append({'span': '%d · %s' % (si + 1, t)})
            for ii, txt in enumerate(items, 1):
                g = 'm1_item_%d_%d' % (si + 1, ii)
                rows.append({'h': 24, 'cells': ['<b>%d.%d</b>' % (si + 1, ii), txt] +
                             [{'radio': (g, str(v)), 'tip': '%d.%d: %d puntos' % (si + 1, ii, v)} for v in range(4)]})
        return rows

    d.table(cols, hdr, rows_for([0, 1]), head_center=[0, 2, 3, 4, 5], after=0)

    # ---------------- página 2
    d.new_page()
    d.table(cols, hdr, rows_for([2, 3, 4]), head_center=[0, 2, 3, 4, 5], after=10)
    d.note('Si dudas entre dos puntajes, elige el menor. El objetivo no es obtener un número alto, sino ver con '
           'honestidad dónde está la oportunidad de mejora.', label='Consejo', label_color=TEAL, fill=MINT,
           stroke=LINE, after=0)

    # ---------------- página 3: resultado
    d.new_page()
    d.section(1, 'Tu resultado por dimensión',
              'Suma los puntos de cada dimensión. Compara tu puntaje con el ejemplo de María para ver cómo se lee.')
    rows = []
    for i, (t, items) in enumerate(SECTIONS):
        mx = len(items) * 3
        rows.append({'h': 26, 'cells': ['<b>%d · %s</b>' % (i + 1, t), '<para alignment="center">%d</para>' % mx,
                     {'tf': 'm1_sub%d' % (i + 1), 'tip': 'Subtotal dimensión %d (máx. %d)' % (i + 1, mx)},
                     '<para alignment="center">%d</para>' % MARIA[i], P(MARIA_NOTE[i], style(7.8, 9.6))]})
    rows.append({'h': 26, 'cells': [{'text': '<b>TOTAL</b>', 'fill': MINT},
                                    {'text': '<para alignment="center"><b>78</b></para>', 'fill': MINT},
                                    {'tf': 'm1_total', 'tip': 'Puntaje total (máx. 78)'},
                                    {'text': '<para alignment="center"><b>%d</b></para>' % sum(MARIA), 'fill': MINT},
                                    {'text': '<b>Etapa en desarrollo</b>', 'fill': MINT}]})
    d.table([0.33, 0.07, 0.12, 0.1, 0.38], ['Dimensión', 'Máx.', 'Tu puntaje', 'María', 'Lo que vio María (ejemplo)'],
            rows, head_center=[1, 3], after=14)

    d.section(2, 'Tu etapa de madurez digital', 'Marca la etapa que corresponde a tu puntaje total.')
    cw = (CONTENT_W - 18) / 4
    x = MARGIN
    top = d.y
    H = 128
    for i, (a, b, n, t) in enumerate(STAGES):
        maria = a <= sum(MARIA) <= b
        d.box(x, top - H, cw, H, fill=white, stroke=AMBER if maria else LINE, r=8, lw=1.4 if maria else 0.8)
        d._top_round(x, top - 34, cw, 34, 8, [TEAL, NAVY, HexColor('#4f8f95'), HexColor('#0b5b61')][i])
        d.c.setFillColor(white)
        d.c.setFont(FB, 9.6)
        d.c.drawString(x + 8, top - 15, n)
        d.c.setFont(F, 8.4)
        d.c.drawString(x + 8, top - 27, '%d a %d puntos' % (a, b))
        p = P(t, style(7.9, 9.8))
        _, ph = p.wrap(cw - 16, 100)
        p.drawOn(d.c, x + 8, top - 40 - ph)
        d.cb('m1_etapa_%d' % (i + 1), x + 8, top - H + 9, 10, tip='Mi etapa: %s' % n)
        d.c.setFillColor(NAVY)
        d.c.setFont(FB, 8.4)
        d.c.drawString(x + 22, top - H + 11, 'Mi etapa')
        if maria:
            d._pill(x + cw - 8, top - H + 7, 'María', fill=AMBER, size=7.4, h=13, anchor='right')
        x += cw + 6
    d.y = top - H - 14
    d.note('<b>Lectura de María:</b> obtuvo %d puntos (etapa en desarrollo). Sus prácticas útiles dependen de su memoria '
           'y de la de su equipo. Su brecha más urgente está en la seguridad (contraseñas compartidas) y en la versión '
           'vigente de los documentos. <b>No necesita más aplicaciones: necesita acuerdos simples y un responsable.</b>'
           % sum(MARIA), label='Ejemplo', after=10)
    d.labeled([('Mis dos dimensiones más bajas y por qué', 'm1_dimensiones_bajas', 1.0)], h=40)

    # ---------------- página 4: prioridad de mejora
    d.new_page()
    d.section(3, 'Mi prioridad de mejora',
              'Elige una brecha concreta y conviértela en una mejora pequeña, realizable y sostenible.')
    d.example_header('Ejemplo · Empanadas Doña María')
    EX = [('La práctica digital que mejor realizamos hoy', 'Respondemos rápido los pedidos por WhatsApp e Instagram.'),
          ('La principal dificultad que detectamos', 'Hay tres versiones de la lista de precios y cobramos un precio antiguo.'),
          ('Mejora concreta para esta semana', 'Dejar una sola lista de precios en una carpeta compartida, con el nombre '
           '«2026-10_lista-precios_ventas», y borrar las copias.'),
          ('Persona responsable', 'María'),
          ('Fecha objetivo', 'Viernes de esta semana'),
          ('Cómo sabremos que mejoró', 'Durante un mes, cero cobros con precios antiguos y todo el equipo usa el mismo enlace.')]
    d.table([0.34, 0.66], ['Pregunta', 'Respuesta de María'], [['<b>%s</b>' % a, b] for a, b in EX],
            zebra=True, after=14)
    d.yours_header('Tu prioridad')
    d.labeled([('La práctica digital que mejor realizamos hoy', 'm1_q1', 1.0)], h=36)
    d.labeled([('La principal dificultad que detectamos', 'm1_q2', 1.0)], h=36)
    d.labeled([('Una mejora concreta que podemos implementar esta semana', 'm1_q3', 1.0)], h=44)
    d.labeled([('Persona responsable', 'm1_q4', 0.6), ('Fecha objetivo', 'm1_q5', 0.4)])
    d.labeled([('Cómo sabremos que mejoró', 'm1_q6', 1.0)], h=36)
    d.note('<b>Regla de oro:</b> primero la necesidad, después la herramienta. Repite este checklist en 3 meses '
           'para ver tu avance.', label='Clave', label_color=TEAL, fill=MINT, stroke=LINE, after=0)
    return d


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    d = m1_pdf1()
    ov = d.finish()
    print(d.path, 'fields:', d.nfields, 'overflow:', ov)

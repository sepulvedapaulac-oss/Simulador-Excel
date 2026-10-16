# -*- coding: utf-8 -*-
"""Módulo 3 · Herramientas PDF 1 y 2."""
import os
from cnpdf import *  # noqa

OUT = os.path.join(os.path.dirname(__file__), '..', 'M3', 'recursos', 'pdf')


def q(t, hint):
    return '<b>%s</b><br/><font size="7.4" color="#55636f">%s</font>' % (t, hint)


# =====================================================================
#  M3 · PDF 1 · Cliente ideal, calendario editorial y checklist visual
# =====================================================================
def m3_pdf1():
    path = os.path.join(OUT, 'M3_PDF1_Cliente_Ideal_Calendario_Checklist_Visual.pdf')
    d = Doc(path, 3, 1, 'Cliente ideal, calendario y checklist visual',
            'Define a quién le hablas, planifica un mes de contenidos por pilar y revisa que cada '
            'pieza sea reconocible, clara y accesible antes de publicar.',
            4, short_title='Cliente ideal, calendario editorial y checklist visual')
    d.new_page()
    d.howto([
        'Completa la <b>ficha de cliente ideal</b> pensando en una persona concreta que ya te compra o que quieres atraer.',
        'Con sus dudas y necesidades, llena el <b>calendario de 4 semanas</b>: una idea por pilar y por semana.',
        'Antes de publicar cada pieza, pásala por el <b>checklist visual</b> (página 3).',
        'Define tu <b>mini guía visual</b> (página 4) y úsala en todas tus piezas para que te reconozcan.',
    ], '≈ 40 minutos')
    d.section(1, 'Ficha de cliente ideal',
              'Segmentar no es excluir: es priorizar a quién le hablas primero. Un perfil práctico, no una ficha decorativa.')
    FICHA = [
        ('¿Quién es?', 'Edad aproximada, dónde vive, a qué se dedica.',
         'Daniela, 34 años. Vive en un departamento pequeño y trabaja jornada completa.'),
        ('Contexto y etapa de compra', '¿Qué está viviendo? ¿Recién mira, compara o ya decidió?',
         'Está renovando su living. Compara opciones y guarda ideas antes de comprar.'),
        ('Necesidades y deseos', '¿Qué quiere lograr?',
         'Un living cálido y ordenado, con piezas únicas, sin gastar de más.'),
        ('Dudas y barreras', '¿Qué la frena o le da miedo?',
         'Teme comprar objetos grandes o difíciles de combinar. Duda de tamaños y despacho.'),
        ('Cómo decide', '¿Dónde busca? ¿En qué confía?',
         'Guarda ideas en Instagram, consulta por WhatsApp y confía en fotos reales y opiniones.'),
        ('Contenido que la ayuda', '¿Qué información le reduce dudas?',
         'Medidas en contexto, combinaciones por color, fotos en livings pequeños y testimonios.'),
        ('Mensaje clave', 'Una frase que le hable directamente.',
         'Piezas hechas a mano que caben y combinan en espacios pequeños.'),
    ]
    rows = []
    for i, (a, b, ex) in enumerate(FICHA, 1):
        rows.append({'h': 54, 'cells': [q(a, b), ex,
                     {'tf': 'm3a_ficha%d' % i, 'ml': True, 'tip': 'Tu cliente ideal: %s' % a}]})
    d.table([0.25, 0.33, 0.42], ['Pregunta', 'Ejemplo · Daniela (Casa Nativa)', 'Tu cliente ideal'],
            rows, after=0)

    # ---------------- página 2: calendario
    d.new_page()
    d.section(2, 'Calendario editorial de 4 semanas',
              'Cuatro pilares de contenido: educar (reduce dudas), inspirar (muestra contextos de uso), '
              'generar confianza (procesos y testimonios) y activar (invita a consultar o comprar).')
    d.example_header('Ejemplo · Casa Nativa (para Daniela)')
    EX = [
        ('Semana 1', 'Carrusel: 3 medidas para elegir un cojín según tu sofá.', 'Reel: living de 12 m², antes y después.',
         'Historias: así tejemos un pie de cama.', 'Nueva colección: «Escríbenos y te ayudamos a combinar».'),
        ('Semana 2', 'Guía: cómo combinar 3 texturas sin recargar.', 'Foto: rincón de lectura con manta tejida.',
         'Testimonio de una clienta con foto de su living.', 'Historia con encuesta y enlace al catálogo.'),
        ('Semana 3', 'Video corto: cómo cuidar piezas de lana.', 'Paleta de temporada en tonos tierra.',
         'Detrás de escena: embalaje y despacho.', 'Recordatorio de despacho a regiones con plazo claro.'),
        ('Semana 4', 'Preguntas frecuentes: tamaños y plazos.', 'Carrusel: 3 estilos para un mismo sofá.',
         'Reseñas del mes.', 'Últimas unidades y botón directo a WhatsApp.'),
    ]
    st = style(7.8, 9.6)
    rows = [[('<b>%s</b>' % r[0])] + [P(t, st) for t in r[1:]] for r in EX]
    d.table([0.12, 0.22, 0.22, 0.22, 0.22], ['', 'Educar', 'Inspirar', 'Generar confianza', 'Activar'],
            rows, min_h=16, pad=3.4, zebra=True, after=12)
    d.yours_header('Tu calendario')
    d.labeled([('Cliente ideal al que le hablas', 'm3a_cal_cliente', 0.4),
               ('Canal principal', 'm3a_cal_canal', 0.3),
               ('Publicaciones por semana', 'm3a_cal_frecuencia', 0.3)])
    rows = []
    for w_ in range(1, 5):
        rows.append({'h': 74, 'cells': ['<b>Semana %d</b><br/><font size="7.2" color="#55636f">Del ____ al ____</font>' % w_] +
                     [{'tf': 'm3a_cal_s%d_%s' % (w_, k), 'ml': True, 'tip': 'Semana %d · %s' % (w_, lab)}
                      for k, lab in (('educar', 'Educar'), ('inspirar', 'Inspirar'),
                                     ('confianza', 'Generar confianza'), ('activar', 'Activar'))]})
    d.table([0.12, 0.22, 0.22, 0.22, 0.22], ['', 'Educar', 'Inspirar', 'Generar confianza', 'Activar'],
            rows, after=8)
    d.labeled([('¿Qué medirás para saber si funcionó? (ej.: consultas, guardados, mensajes)', 'm3a_cal_medicion', 0.62),
               ('Día de revisión', 'm3a_cal_revision', 0.38)])

    # ---------------- página 3: checklist visual
    d.new_page()
    d.section(3, 'Checklist de diseño accesible',
              'Revisa hasta tres piezas antes de publicarlas. Marca cada ítem que cumple; corrige los que no.')
    CK = [
        ('Contraste y color', [
            ('El texto se distingue claramente del fondo.',
             'Referencia WCAG: contraste mínimo 4,5:1 para texto normal y 3:1 para texto grande. Usa un verificador de contraste gratuito.'),
            ('No dependo solo del color para comunicar algo importante.',
             'Ej.: «Agotado» escrito, no solo un producto en gris.'),
        ]),
        ('Tamaño y lectura', [
            ('El texto se lee en el celular sin hacer zoom.', 'Revisa la pieza en tu teléfono, con el brillo bajo.'),
            ('Uso máximo 2 tipografías y evito letras decorativas en textos largos.', 'Una para títulos y otra para textos.'),
            ('Frases cortas y claras; poco texto sobre la imagen.', 'El detalle va en la descripción de la publicación.'),
        ]),
        ('Jerarquía', [
            ('Hay un solo mensaje principal y se ve primero.', 'Orden: mensaje principal → apoyo → acción.'),
            ('La acción está clara (qué hacer y dónde).', 'Ej.: «Escríbenos por WhatsApp».'),
            ('Hay espacio vacío: la pieza no se ve recargada.', 'El espacio también ordena la mirada.'),
        ]),
        ('Imágenes y texto alternativo', [
            ('Agregué texto alternativo que describe la imagen.',
             'En Instagram suele estar en la configuración avanzada al publicar; en tu web, en cada imagen.'),
            ('Los videos tienen subtítulos.', 'Muchas personas los ven sin sonido.'),
            ('Hashtags con mayúscula inicial y emojis al final, sin reemplazar palabras.', 'Ej.: #CasaNativa. Facilita los lectores de pantalla.'),
        ]),
        ('Marca: logo y colores', [
            ('Uso los colores de mi paleta (2 o 3) y mi estilo de imagen.', 'Revisa tu mini guía visual (página 4).'),
            ('El logo es visible, pero no compite con el mensaje.', 'Siempre en la misma posición y tamaño.'),
            ('Prueba de 5 segundos: ¿se entiende la idea y se reconoce la marca?', 'Muéstrala 5 segundos a alguien y pregúntale qué entendió.'),
        ]),
    ]
    rows = [[{'text': '<b>Nombre de la pieza →</b>', 'fill': MINT}] +
            [{'tf': 'm3a_pieza%d_nombre' % k, 'tip': 'Nombre de la pieza %d' % k} for k in (1, 2, 3)]]
    n = 0
    for g, items in CK:
        rows.append({'span': g})
        for t, h in items:
            n += 1
            rows.append({'h': 26, 'cells': [q(t, h)] +
                         [{'cb': 'm3a_ck%02d_p%d' % (n, k), 'tip': 'Ítem %d · pieza %d' % (n, k)} for k in (1, 2, 3)]})
    d.table([0.64, 0.12, 0.12, 0.12], ['Ítem', 'Pieza 1', 'Pieza 2', 'Pieza 3'], rows,
            head_center=[1, 2, 3], after=8)
    d.note('<b>Casa Nativa</b> publicó una promoción en letra cursiva clara sobre una foto con fondo claro. Una clienta '
           'le escribió que no podía leer el plazo. Marcela cambió a su tipografía de textos, agregó una franja '
           'oscura detrás del texto y movió el detalle a la descripción. <b>Lo bonito también debe leerse.</b>',
           label='Ejemplo', after=0)

    # ---------------- página 4: mini guía visual
    d.new_page()
    d.section(4, 'Mini guía visual de tu marca',
              'Pocas decisiones, bien repetidas: así te reconocen antes de leer tu nombre.')
    d.example_header('Ejemplo · Casa Nativa')
    top = d.y
    H = 112
    d.box(MARGIN, top - H, CONTENT_W, H, fill=white, stroke=AMBER_LINE, r=8)
    # muestras de color
    sw = [('#9c5a2e', 'Terracota', 'Títulos y botones'), ('#f3e9dc', 'Crema', 'Fondos'),
          ('#5b6b3a', 'Oliva', 'Detalles')]
    x = MARGIN + 12
    d.c.setFillColor(NAVY)
    d.c.setFont(FB, 9)
    d.c.drawString(x, top - 18, 'Colores (3)')
    for i, (hx, nm, use) in enumerate(sw):
        yy = top - 30 - i * 31
        d.c.setFillColor(HexColor(hx))
        d.c.setStrokeColor(LINE)
        d.c.roundRect(x, yy - 24, 26, 24, 5, stroke=1, fill=1)
        d.c.setFillColor(INK)
        d.c.setFont(FB, 8.6)
        d.c.drawString(x + 33, yy - 10, '%s  %s' % (nm, hx.upper()))
        d.c.setFillColor(MUTED)
        d.c.setFont(F, 8)
        d.c.drawString(x + 33, yy - 21, use)
    colx = MARGIN + 175
    items = [('Tipografías', 'Títulos: una serif cálida. Textos: una sans serif simple (ej.: Lato o Montserrat). Nunca más de dos.'),
             ('Estilo de imagen', 'Luz natural, fondos neutros, piezas en espacios reales y pequeños. Siempre una mano o un objeto cotidiano que da escala.'),
             ('Tono', 'Cercano y claro. Tutea, explica medidas y combinaciones, evita la jerga y los «¡¡OFERTA!!».'),
             ('Regla de claridad', 'Un mensaje por pieza, texto oscuro sobre fondo claro y una sola acción.')]
    yy = top - 12
    for t, body in items:
        p = P('<b>%s.</b> %s' % (t, body), style(8.6, 10.8))
        _, ph = p.wrap(CONTENT_W - 175 - 12, 100)
        p.drawOn(d.c, colx, yy - ph)
        yy -= ph + 6
    d.y = top - H - 14

    d.yours_header('Tu mini guía visual')
    d.c.setFillColor(MUTED)
    d.c.setFont(FB, 8)
    d.c.drawString(MARGIN, d.y - 8, 'Colores (nombre, código y uso)')
    d.y -= 12
    for i in range(1, 4):
        d.c.setStrokeColor(FIELD_LINE)
        d.c.setFillColor(white)
        d.c.roundRect(MARGIN, d.y - 20, 20, 20, 4, stroke=1, fill=1)
        d.tf('m3a_color%d_nombre' % i, MARGIN + 28, d.y - 20, 150, 20, tip='Color %d: nombre' % i)
        d.tf('m3a_color%d_codigo' % i, MARGIN + 186, d.y - 20, 90, 20, tip='Color %d: código (ej. #9C5A2E)' % i)
        d.tf('m3a_color%d_uso' % i, MARGIN + 284, d.y - 20, CONTENT_W - 284, 20, tip='Color %d: uso' % i)
        d.y -= 26
    d.space(4)
    d.labeled([('Tipografía para títulos', 'm3a_tipo_titulos', 0.5), ('Tipografía para textos', 'm3a_tipo_textos', 0.5)])
    d.labeled([('Estilo de imagen (luz, fondos, encuadre, qué siempre aparece)', 'm3a_estilo_imagen', 1.0)], h=40)
    d.labeled([('Tono de la marca (3 palabras y una frase que nunca dirías)', 'm3a_tono', 1.0)], h=40)
    d.labeled([('Mi regla de claridad', 'm3a_regla', 0.6), ('Posición del logo', 'm3a_logo', 0.4)])
    d.note('<b>Antes de publicar, cuatro preguntas:</b> ¿se entiende la idea en pocos segundos? ¿se lee bien en el celular? '
           '¿se parece a mi marca? ¿la acción está clara?', label='Clave', label_color=TEAL, fill=MINT, stroke=LINE, after=0)
    return d


# =====================================================================
#  M3 · PDF 2 · Planificador de campaña y banco de respuestas automáticas
# =====================================================================
def m3_pdf2():
    path = os.path.join(OUT, 'M3_PDF2_Planificador_Campana_Respuestas_Automaticas.pdf')
    d = Doc(path, 3, 2, 'Planificador de campaña y respuestas',
            'Planifica una campaña pequeña con objetivo, presupuesto y reglas para ajustar, y arma tu banco '
            'de respuestas automáticas sin perder el trato humano.',
            4, short_title='Planificador de campaña y banco de respuestas automáticas')
    d.new_page()
    d.howto([
        'Lee el <b>ejemplo de Casa Nativa</b>: muestra cómo se ve una campaña bien definida antes de gastar.',
        'Completa <b>tu planificador</b> (página 2). Decide el monto al final, no al principio.',
        'Define tus <b>reglas para ajustar</b> antes de lanzar: así decides con datos y no con ansiedad.',
        'Escribe tu <b>banco de respuestas</b> (páginas 3 y 4) y cárgalo en WhatsApp Business o tu herramienta de mensajes.',
    ], '≈ 45 minutos',
        extra='Los montos del ejemplo son ficticios, en pesos chilenos. Revisa en la plataforma los mínimos de '
              'inversión, formatos y condiciones vigentes antes de lanzar tu campaña.')
    d.section(1, 'Ejemplo: campaña de la nueva colección de Casa Nativa')
    EX = [
        ('Objetivo', '¿Qué quieres que ocurra gracias al anuncio?',
         '<b>Consideración:</b> lograr 20 conversaciones por WhatsApp sobre la nueva colección en 7 días.'),
        ('Público', '¿A quién le hablas? ¿Dónde está?',
         'Personas de 28 a 45 años en Santiago, interesadas en decoración y espacios pequeños (perfil Daniela).'),
        ('Plataforma', '¿Ya buscan tu producto o aún no?',
         'Aún no lo buscan → anuncios en Meta (Instagram y Facebook) con botón para enviar mensaje por WhatsApp.'),
        ('Presupuesto', 'Máximo que no afecta tu operación.',
         '$10.000 diarios × 7 días = <b>$70.000 en total</b>.'),
        ('Duración', 'Fechas de inicio y término.', 'Lunes a domingo (7 días), con revisión el día 3.'),
        ('Anuncio', 'Oferta, mensaje, imagen y llamado.',
         'Cojines tejidos en un living pequeño real · «¿No sabes cómo combinarlos? Escríbenos y te ayudamos» · Botón: Enviar mensaje.'),
        ('Métrica principal', 'El indicador que responde a tu objetivo.',
         'Conversaciones iniciadas y <b>costo por conversación</b> (inversión ÷ conversaciones). Meta: ≤ $3.500.'),
        ('Criterio para ajustar', 'Si pasa X, haré Y.',
         'Día 3: con menos de 6 conversaciones, cambiar imagen o texto (no subir el monto). Si el costo es menor a la meta y hay tiempo para responder, mantener.'),
    ]
    rows = [[q(a, b), c_] for a, b, c_ in EX]
    d.table([0.27, 0.73], ['Elemento', 'Ejemplo · Casa Nativa'], rows, zebra=True, after=12)
    d.subhead('Referencia rápida: mide según tu objetivo', color=NAVY, after=6)
    d.table([0.22, 0.4, 0.38], ['Objetivo', 'Qué mirar', 'Lo que te dice'], [
        ['<b>Descubrimiento</b>', 'Alcance e impresiones', 'Cuántas personas vieron tu anuncio (exposición).'],
        ['<b>Consideración</b>', 'Clics, visitas, conversaciones iniciadas', 'Interés y oportunidades de venta.'],
        ['<b>Conversión</b>', 'Compras, reservas, cotizaciones enviadas', 'Resultado de negocio.'],
        ['<b>Eficiencia</b>', 'Costo por resultado = inversión ÷ resultados', 'Cuánto te cuesta cada resultado; compáralo con tu meta.'],
    ], zebra=True, after=0)

    # ---------------- página 2: planificador en blanco
    d.new_page()
    d.section(2, 'Tu planificador de campaña')
    d.check_inline('m3b_obj_', 'Objetivo:', [('descubrimiento', 'Descubrimiento (que te conozcan)'),
                                             ('consideracion', 'Consideración (visitas, consultas)'),
                                             ('conversion', 'Conversión (compras, reservas)')], after=4)
    d.labeled([('Resultado concreto que buscas (cuánto y en cuánto tiempo)', 'm3b_resultado', 1.0)])
    d.labeled([('Público: quién es, dónde está, qué le interesa', 'm3b_publico', 1.0)], h=40)
    d.check_inline('m3b_plat_', 'Plataforma:', [('meta', 'Redes (ej.: Meta) · aún no busca'),
                                                ('google', 'Búsqueda (ej.: Google) · ya busca'),
                                                ('otra', 'Otra')], after=4)
    d.labeled([('Presupuesto diario', 'm3b_diario', 0.25), ('N.º de días', 'm3b_dias', 0.15),
               ('Presupuesto total', 'm3b_total', 0.25), ('Inicio', 'm3b_inicio', 0.175), ('Término', 'm3b_termino', 0.175)])
    d.subhead('Anuncio', after=5)
    d.labeled([('Oferta o producto', 'm3b_oferta', 0.5), ('Llamado a la acción (botón)', 'm3b_cta', 0.5)])
    d.labeled([('Mensaje principal (texto del anuncio)', 'm3b_mensaje', 0.6), ('Imagen o video', 'm3b_visual', 0.4)], h=44)
    d.subhead('Medición', after=5)
    d.labeled([('Métrica principal', 'm3b_metrica', 0.4), ('Meta (resultado esperado)', 'm3b_meta', 0.3),
               ('Costo por resultado máximo', 'm3b_cpr', 0.3)])
    d.para('<b>Fórmulas:</b> presupuesto total = diario × días · costo por resultado = inversión ÷ resultados · '
           'costo por resultado máximo = presupuesto total ÷ meta.', S_MUTED, after=6)
    d.subhead('Reglas para ajustar (decide antes de lanzar)', after=4)
    rows = []
    for i in range(1, 4):
        rows.append({'h': 32, 'cells': [{'tf': 'm3b_regla%d_dia' % i, 'tip': 'Regla %d: día de revisión' % i},
                                        {'tf': 'm3b_regla%d_si' % i, 'ml': True, 'tip': 'Regla %d: si pasa…' % i},
                                        {'tf': 'm3b_regla%d_entonces' % i, 'ml': True, 'tip': 'Regla %d: entonces haré…' % i}]})
    d.table([0.16, 0.42, 0.42], ['Día de revisión', 'Si pasa… (dato)', 'Entonces… (detener, corregir o aumentar)'], rows, after=8)
    d.subhead('Al cerrar la campaña', after=4)
    d.labeled([('Inversión real', 'm3b_inv_real', 0.25), ('Resultados', 'm3b_res_real', 0.25),
               ('Costo por resultado', 'm3b_cpr_real', 0.25), ('Ventas asociadas', 'm3b_ventas', 0.25)])
    d.check_inline('m3b_dec_', 'Decisión:', [('mantener', 'Mantener'), ('ajustar', 'Ajustar'),
                                             ('detener', 'Detener'), ('aumentar', 'Aumentar')], after=2)
    d.labeled([('Aprendizaje para la próxima campaña', 'm3b_aprendizaje', 1.0)], h=40)

    # ---------------- página 3: banco de respuestas
    d.new_page()
    d.section(3, 'Banco de respuestas automáticas',
              'Automatiza lo repetitivo y humaniza lo importante. Escribe cada mensaje con tus datos reales y tu tono.')
    RS = [
        ('Bienvenida', 'Primer mensaje o tras 14 días sin conversar.',
         '¡Hola! Soy el asistente automático de Casa Nativa. Puedo ayudarte con: 1) catálogo, 2) medios de pago, '
         '3) despachos, 4) hablar con Marcela. Responde con el número.'),
        ('Horario', 'Atajo sugerido: /horario',
         'Atendemos de lunes a viernes de 10:00 a 18:00 y los sábados de 10:00 a 14:00. Si escribes fuera de ese horario, te respondemos apenas abramos.'),
        ('Medios de pago', 'Atajo sugerido: /pago',
         'Puedes pagar por transferencia o con link de pago (débito o crédito). Al confirmar tu pedido te enviamos los datos; luego, envíanos el comprobante por aquí.'),
        ('Despachos', 'Atajo sugerido: /despacho',
         'Despachamos a todo Chile por courier. Te informamos el plazo según tu comuna al confirmar el pedido y te enviamos el número de seguimiento cuando sale.'),
        ('Derivación a una persona', 'Reclamos, excepciones o casos sensibles.',
         'Gracias por contarnos. Para ayudarte bien, te paso con Marcela. Ya le compartí tu mensaje para que no tengas que repetirlo; te responde hoy antes de las 18:00.'),
        ('Fuera de horario', 'Mensaje de ausencia automático.',
         '¡Gracias por escribir a Casa Nativa! Ahora estamos fuera de horario. Mañana desde las 10:00 respondemos tu mensaje. Mientras, puedes ver el catálogo aquí: [enlace].'),
    ]
    rows = []
    for i, (a, b, ex) in enumerate(RS, 1):
        rows.append({'h': 74, 'cells': [q(a, b), P(ex, style(8.2, 10.2)),
                     {'tf': 'm3b_resp%d' % i, 'ml': True, 'tip': 'Tu respuesta: %s' % a}]})
    d.table([0.2, 0.38, 0.42], ['Situación', 'Ejemplo · Casa Nativa', 'Tu versión'], rows, after=8)
    d.para('En WhatsApp Business, el mensaje de bienvenida, el de ausencia y las respuestas rápidas están en '
           '«Herramientas para la empresa». Los nombres de los menús pueden cambiar con las actualizaciones.',
           S_MUTED, after=0)

    # ---------------- página 4: tono y derivación
    d.new_page()
    d.section(4, 'Revisa el tono de tus respuestas')
    TON = [
        ('auto', 'Queda claro que responde una automatización, no finge ser una persona.'),
        ('persona', 'Siempre ofrece una forma de hablar con una persona.'),
        ('tono', 'Usa el tono de la marca: cálido, claro, sin jerga ni «solicitud recibida, espere».'),
        ('corto', 'Se lee sin desplazar la pantalla del celular.'),
        ('datos', 'Los datos que cambian (precios, stock, plazos) tienen fecha de revisión.'),
        ('ia', 'Si usas un agente de IA, revisaste sus condiciones y costos, y definiste cuándo transfiere a una persona.'),
    ]
    for k, t in TON:
        d.cb('m3b_tono_' + k, MARGIN + 4, d.y - 11, 10, tip=t)
        d.para(t, style(9.2, 11.8), x=MARGIN + 22, w=CONTENT_W - 22, after=6)
    d.space(6)
    d.section(5, 'Qué se deriva a una persona',
              'Lo que depende de contexto o emoción lo atiende una persona. Define quién y en cuánto tiempo.')
    DR = [('Reclamos', 'Producto dañado, pedido atrasado.'),
          ('Excepciones', 'Cambios de dirección, devoluciones fuera de plazo.'),
          ('Negociaciones', 'Pedidos especiales, compras por volumen, cotizaciones a medida.'),
          ('Situaciones sensibles', 'Clientes molestos, datos personales, problemas de pago.')]
    rows = [['<b>%s</b><br/><font size="7.4" color="#55636f">%s</font>' % (a, b),
             {'tf': 'm3b_der%d_quien' % i, 'tip': '%s: quién atiende' % a},
             {'tf': 'm3b_der%d_plazo' % i, 'tip': '%s: plazo de respuesta' % a}] for i, (a, b) in enumerate(DR, 1)]
    rows = [{'h': 34, 'cells': r} for r in rows]
    d.table([0.5, 0.28, 0.22], ['Tipo de consulta', '¿Quién atiende?', 'Plazo de respuesta'], rows, after=10)
    d.subhead('Información que la persona debe recibir para que el cliente no repita todo', after=6)
    INF = [('nombre', 'Nombre del cliente'), ('pedido', 'N.º de pedido'), ('resumen', 'Resumen del problema'),
           ('canal', 'Canal de contacto'), ('urgencia', 'Nivel de urgencia'), ('fotos', 'Fotos o comprobantes')]
    colw = CONTENT_W / 3
    for i, (k, t) in enumerate(INF):
        x = MARGIN + (i % 3) * colw
        yy = d.y - (i // 3) * 18
        d.cb('m3b_info_' + k, x + 4, yy - 11, 10, tip=t)
        d.c.setFillColor(INK)
        d.c.setFont(F, 9.2)
        d.c.drawString(x + 20, yy - 9.5, t)
    d.y -= 40
    d.labeled([('Otro dato que necesita tu equipo', 'm3b_info_otro', 1.0)])
    d.note('<b>Casa Nativa</b> automatizó horario, pagos y despachos. Cuando una clienta escribió que su florero llegó '
           'quebrado, el flujo no intentó resolverlo: pidió una foto, le avisó que Marcela la contactaría y le pasó el '
           'caso con nombre, pedido y foto. <b>Automatizar lo repetitivo le dejó tiempo para lo importante.</b>',
           label='Ejemplo', after=0)
    return d


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for fn in (m3_pdf1, m3_pdf2):
        d = fn()
        ov = d.finish()
        print(d.path, 'fields:', d.nfields, 'overflow:', ov)

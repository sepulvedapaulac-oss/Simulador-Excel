# -*- coding: utf-8 -*-
"""Módulo 2 · Herramientas PDF 1 y 2."""
import os
from cnpdf import *  # noqa

OUT = os.path.join(os.path.dirname(__file__), '..', 'M2', 'recursos', 'pdf')


def item(t, hint):
    return '<b>%s</b><br/><font size="7.6" color="#55636f">%s</font>' % (t, hint)


# =====================================================================
#  M2 · PDF 1 · Checklist de perfil comercial
# =====================================================================
CHECK = [
    ('A · Identidad y datos del negocio', [
        ('Nombre comercial claro e igual en todos tus canales.',
         'Que te encuentren con el mismo nombre en WhatsApp, Instagram y Google.'),
        ('Foto de perfil o logo que se reconoce en tamaño pequeño.',
         'Revísalo como se ve en la lista de chats: pequeño y redondo.'),
        ('Descripción que dice qué vendes, para quién y dónde, en 1 o 2 líneas.',
         'Ej.: «Decoración hecha a mano para espacios pequeños · Despachos a todo Chile».'),
        ('Categoría, zona de cobertura o dirección, correo y sitio web al día.',
         'WhatsApp Business: perfil de empresa. Instagram: cuenta profesional › editar perfil.'),
    ]),
    ('B · Información que evita preguntas', [
        ('Horario de atención visible y coincide con el real.',
         'Si cambias horario en temporada alta, actualízalo el mismo día.'),
        ('Medios de pago informados (transferencia, tarjeta, link de pago, etc.).',
         'En la descripción, el catálogo o una historia destacada.'),
        ('Condiciones de despacho o retiro: zonas, plazos y quién paga el envío.',
         'Una historia destacada «Envíos» o una ficha en el catálogo funciona bien.'),
    ]),
    ('C · Acción: el siguiente paso es obvio', [
        ('Catálogo con tus productos principales: foto, nombre, precio o «desde», descripción y disponibilidad.',
         'WhatsApp Business: catálogo. Instagram: publicaciones fijadas o tienda, si la tienes.'),
        ('Enlace directo de contacto visible (wa.me, botón de contacto o link en la bio).',
         'Pruébalo desde otro celular: debe abrir el chat sin pasos extra.'),
        ('Llamado a la acción claro: «Escríbenos para cotizar», «Reserva aquí», «Compra en…».',
         'Un solo llamado principal; evita tres opciones distintas.'),
    ]),
    ('D · Atención eficiente', [
        ('Mensaje de bienvenida activo, breve y en el tono de la marca.',
         'Dice en qué puedes ayudar y cómo seguir.'),
        ('Mensaje de ausencia o fuera de horario que indica cuándo responderás.',
         'Ej.: «Te respondemos mañana desde las 10:00». Evita «solicitud recibida».'),
        ('Respuestas rápidas para las 5 preguntas más frecuentes.',
         'WhatsApp Business: respuestas rápidas con atajo «/». Instagram: respuestas guardadas.'),
        ('Etiquetas para ordenar chats: nuevo, pedido pendiente, pagado, despachado, seguimiento.',
         'Etiquetas en WhatsApp Business; en Instagram, carpetas o marcas de la bandeja.'),
    ]),
]


def m2_pdf1():
    path = os.path.join(OUT, 'M2_PDF1_Checklist_Perfil_Comercial.pdf')
    d = Doc(path, 2, 1, 'Checklist de perfil comercial',
            'Revisa tu perfil de WhatsApp Business o Instagram como lo vería un cliente '
            'y convierte lo que falta en un plan de mejora concreto.',
            3, short_title='Checklist de perfil comercial')
    d.new_page()
    d.howto([
        'Abre tu perfil desde <b>otro celular o una cuenta de prueba</b>, como si fueras un cliente nuevo.',
        'Marca cada ítem: <b>Sí = 2</b> (está y funciona), <b>Parcial = 1</b> (existe pero incompleto), <b>No = 0</b>.',
        'Suma tu puntaje por bloque y revisa el nivel de tu perfil en la página 2.',
        'Elige <b>3 mejoras</b> y anótalas en el plan de la página 3 con responsable y fecha.',
    ], '≈ 20 minutos',
        extra='Los nombres de los menús de WhatsApp Business e Instagram pueden cambiar con las '
              'actualizaciones. Si no encuentras una opción, búscala en «Herramientas para la empresa» o '
              'en la configuración de la cuenta profesional.')
    d.labeled([('Nombre del negocio', 'p1_negocio', 0.5),
               ('Revisado por', 'p1_revisor', 0.3),
               ('Fecha', 'p1_fecha', 0.2)])
    d.check_inline('p1_canal_', 'Perfil que revisas:',
                   [('whatsapp', 'WhatsApp Business'), ('instagram', 'Instagram'),
                    ('otro', 'Otro:')], after=4)
    # campo «otro» al final de la línea
    d.tf('p1_canal_otro_cual', MARGIN + 340, d.y + 2, 183, 14, tip='Otro canal revisado')
    d.space(6)

    def block(rows_spec, gi_start):
        rows = []
        gi = gi_start
        for title, items in rows_spec:
            rows.append({'span': title})
            for t, hint in items:
                gi += 1
                g = 'p1_item%02d' % gi
                rows.append({'h': 30, 'cells': [
                    '<b>%d</b>' % gi, item(t, hint),
                    {'radio': (g, 'si_2'), 'tip': 'Ítem %d: Sí (2 puntos)' % gi},
                    {'radio': (g, 'parcial_1'), 'tip': 'Ítem %d: Parcial (1 punto)' % gi},
                    {'radio': (g, 'no_0'), 'tip': 'Ítem %d: No (0 puntos)' % gi}]})
        return rows, gi

    rows, gi = block(CHECK[:3], 0)
    d.table([0.05, 0.71, 0.08, 0.08, 0.08], ['#', 'Ítem del perfil', 'Sí<br/>2', 'Parcial<br/>1', 'No<br/>0'],
            rows, head_center=[0, 2, 3, 4])

    # ---------------- página 2
    d.new_page()
    rows, gi = block(CHECK[3:], gi)
    d.table([0.05, 0.71, 0.08, 0.08, 0.08], ['#', 'Ítem del perfil', 'Sí<br/>2', 'Parcial<br/>1', 'No<br/>0'],
            rows, head_center=[0, 2, 3, 4])

    d.section(1, 'Tu puntaje', 'Suma los puntos de cada bloque. Máximo: 28 puntos.')
    bw = (CONTENT_W - 4 * 8) / 5
    x = MARGIN
    for i, (lab, mx) in enumerate([('A · Identidad', 8), ('B · Información', 6), ('C · Acción', 6),
                                   ('D · Atención', 8), ('TOTAL', 28)]):
        tot = lab == 'TOTAL'
        d.box(x, d.y - 44, bw, 44, fill=NAVY if tot else MINT, stroke=None, r=7)
        d.c.setFillColor(white if tot else NAVY)
        d.c.setFont(FB, 8.6)
        d.c.drawString(x + 8, d.y - 13, lab)
        d.tf('p1_puntaje_%s' % ('total' if tot else 'abcd'[i]), x + 8, d.y - 37, bw - 52, 17,
             tip='Puntaje %s' % lab)
        d.c.setFillColor(white if tot else MUTED)
        d.c.setFont(FB, 10)
        d.c.drawString(x + bw - 40, d.y - 32, '/ %d' % mx)
        x += bw + 8
    d.space(54)
    lv = [('0 – 13', 'Perfil vitrina', 'Hay presencia, pero el cliente debe preguntar casi todo. Parte por el bloque B.'),
          ('14 – 21', 'Perfil en construcción', 'El cliente se orienta, pero aún hay fricción. Revisa C y D.'),
          ('22 – 28', 'Perfil comercial', 'Informa, orienta y facilita la compra. Mantén todo al día cada mes.')]
    cw = (CONTENT_W - 16) / 3
    x = MARGIN
    for rng, name, txt in lv:
        d.box(x, d.y - 58, cw, 58, fill=white, stroke=LINE, r=7)
        d._pill(x + 8, d.y - 20, rng, fill=TEAL, size=8, h=14)
        d.c.setFillColor(NAVY)
        d.c.setFont(FB, 9.6)
        d.c.drawString(x + 62, d.y - 16.5, name)
        p = P(txt, style(8.4, 10.4, color=MUTED))
        _, ph = p.wrap(cw - 16, 60)
        p.drawOn(d.c, x + 8, d.y - 26 - ph)
        x += cw + 8
    d.space(70)

    d.section(2, 'Así lo aplicó Marcela en Casa Nativa',
              'Marcela revisó el WhatsApp Business de Casa Nativa desde el celular de su hermana.')
    d.table([0.25, 0.12, 0.63], ['Bloque', 'Puntaje', 'Lo que encontró'], [
        ['A · Identidad', '7 / 8', 'Logo y nombre claros. La descripción decía solo «Decoración», sin zona ni tipo de producto.'],
        ['B · Información', '3 / 6', 'No informaba despachos ni medios de pago: casi todas las consultas eran sobre eso.'],
        ['C · Acción', '3 / 6', 'Catálogo con fotos, pero sin precios ni disponibilidad. El link de Instagram llevaba a un perfil personal.'],
        ['D · Atención', '2 / 8', 'Sin mensaje fuera de horario ni etiquetas. Respondía todo escribiendo desde cero.'],
        [{'text': '<b>Total</b>', 'fill': MINT}, {'text': '<b>15 / 28</b>', 'fill': MINT},
         {'text': '<b>Perfil en construcción.</b> Prioridades: despachos y pagos visibles, mensaje fuera de horario y precios «desde» en el catálogo.', 'fill': MINT}],
    ], first_bold=True, cell_style=S_CELL, after=0)

    # ---------------- página 3
    d.new_page()
    d.section(3, 'Plan de mejora', 'Elige las 3 mejoras con más impacto: primero lo que hoy genera más preguntas repetidas o clientes perdidos.')
    d.example_header()
    d.table([0.2, 0.38, 0.14, 0.14, 0.14], ['Ítem a mejorar', 'Acción concreta', 'Responsable', 'Fecha', 'Hecho'], [
        ['7 · Despacho', 'Crear historia destacada «Envíos» y agregar zonas y plazos a la descripción.', 'Marcela', 'Esta semana', 'Sí (lunes)'],
        ['12 · Fuera de horario', 'Activar mensaje de ausencia: «Te respondemos mañana desde las 10:00».', 'Marcela', 'Hoy', 'Sí'],
        ['8 · Catálogo', 'Agregar precio «desde» y disponibilidad a los 12 productos principales.', 'Camila (apoyo)', '2 semanas', 'En curso'],
    ], first_bold=True, after=14)
    d.yours_header('Tu plan de mejora')
    rows = []
    for i in range(1, 4):
        rows.append({'h': 44, 'cells': [
            {'tf': 'p1_plan%d_item' % i, 'ml': True, 'tip': 'Mejora %d: ítem' % i},
            {'tf': 'p1_plan%d_accion' % i, 'ml': True, 'tip': 'Mejora %d: acción concreta' % i},
            {'tf': 'p1_plan%d_resp' % i, 'ml': True, 'tip': 'Mejora %d: responsable' % i},
            {'tf': 'p1_plan%d_fecha' % i, 'tip': 'Mejora %d: fecha' % i},
            {'cb': 'p1_plan%d_hecho' % i, 'tip': 'Mejora %d: hecho' % i}]})
    d.table([0.2, 0.38, 0.14, 0.14, 0.14], ['Ítem a mejorar', 'Acción concreta', 'Responsable', 'Fecha', 'Hecho'],
            rows, head_center=[4], after=14)

    d.section(4, 'Prueba del cliente misterioso', 'Cuando termines tus mejoras, pide a alguien de confianza que haga estas pruebas y marca las que funcionen.')
    tests = [
        ('mis1', 'Escribe fuera de horario y recibe un mensaje que dice cuándo le responderán.'),
        ('mis2', 'Encuentra horario, medios de pago y despacho sin tener que preguntar.'),
        ('mis3', 'Llega al chat desde Instagram o tu web en un solo toque.'),
        ('mis4', 'Ve al menos un producto con precio o «desde» y sabe cómo comprarlo.'),
        ('mis5', 'Recibe una respuesta clara a una pregunta frecuente en menos tiempo que antes.'),
    ]
    for key, txt in tests:
        d.cb('p1_' + key, MARGIN + 4, d.y - 11, 10, tip=txt)
        d.para(txt, style(9.2, 11.8), x=MARGIN + 22, w=CONTENT_W - 22, after=6)
    d.space(4)
    d.labeled([('¿Qué aprendiste de la prueba? ¿Qué ajustarás?', 'p1_aprendizaje', 1.0)], h=52)
    d.note('<b>Revisa tu perfil una vez al mes</b> y cada vez que cambien tus precios, horarios, '
           'despachos o productos. Un dato desactualizado genera más consultas que un dato ausente.',
           label='Consejo', label_color=TEAL, fill=MINT, stroke=LINE, after=0)
    return d


# =====================================================================
#  M2 · PDF 2 · Matriz de canales y mapa de venta, pago y despacho
# =====================================================================
CRIT = [
    ('Control', '¿Cuánto decides sobre marca, precios, reglas y datos de clientes?',
     'Alto: tu marca, tus reglas y tus datos.', 'Bajo a medio: el marketplace fija reglas, comisiones y diseño.',
     'Medio: tu marca, pero la plataforma decide alcance y funciones.'),
    ('Velocidad', '¿Qué tan rápido puedes empezar a vender?',
     'Media: requiere configurar, cargar productos y medios de pago.', 'Alta: publicas en una plataforma ya armada.',
     'Alta: puedes vender desde hoy con catálogo y chat.'),
    ('Alcance', '¿Llegarás a personas que aún no te conocen?',
     'Bajo al inicio: necesitas atraer tráfico (redes, anuncios, buscadores).', 'Alto: hay compradores que ya están buscando.',
     'Medio: depende de tu comunidad, contenido y anuncios.'),
    ('Costo', '¿Qué pagas por vender? (plan, comisión, envío, anuncios)',
     'Plan o desarrollo + pasarela de pago + tráfico.', 'Comisión por venta y posibles cargos de publicación o envío.',
     'Bajo costo fijo; pagas en tiempo de atención y anuncios.'),
    ('Capacidad operativa', '¿Puedes cumplir sus exigencias de stock, plazos y atención?',
     'Tú defines plazos, pero haces todo el proceso.', 'Exige cumplir plazos y reglas de despacho con rigor.',
     'Atención uno a uno: consume tiempo si crece el volumen.'),
    ('Relación con el cliente', '¿Puedes volver a contactar a quien te compró?',
     'Sí: con su consentimiento, sus datos quedan en tu registro.', 'Limitada: el contacto lo gestiona el marketplace.',
     'Sí: conversación directa, si la ordenas y registras.'),
]


def m2_pdf2():
    path = os.path.join(OUT, 'M2_PDF2_Matriz_Canales_Mapa_Venta.pdf')
    d = Doc(path, 2, 2, 'Matriz de canales y mapa de venta',
            'Compara tienda propia, marketplace y redes sociales con tus propios criterios, evalúa '
            'pasarelas de pago y ordena el recorrido completo: de la compra a la posventa.',
            4, short_title='Matriz de canales y mapa de venta, pago y despacho')
    d.new_page()
    d.howto([
        'Lee la <b>matriz de referencia</b> (abajo): describe cómo suele comportarse cada canal.',
        'En la página 2 asigna un <b>peso de 1 a 3</b> a cada criterio según lo que más importa hoy a tu negocio.',
        'Pon una <b>nota de 1 a 5</b> a cada canal, multiplica por el peso y suma. Gana el canal con más puntos, no el más popular.',
        'Compara pasarelas de pago con datos <b>reales de tu proveedor</b> (página 3) y dibuja tu flujo de venta (página 4).',
    ], '≈ 45 minutos',
        extra='No hay un canal mejor para todas las pymes. Repite este ejercicio cada 6 meses: '
              'cuando cambian tus recursos o tus ventas, tu decisión también puede cambiar.')
    d.section(1, 'Matriz de referencia: tres caminos para vender',
              'Tendencias generales. Las condiciones exactas dependen de cada plataforma y cambian con el tiempo.')
    rows = [['<b>%s</b><br/><font size="7.4" color="#55636f">%s</font>' % (a, b), c_, m, r]
            for a, b, c_, m, r in CRIT]
    d.table([0.25, 0.25, 0.25, 0.25], ['Criterio', 'Tienda propia', 'Marketplace', 'Redes sociales + WhatsApp'],
            rows, zebra=True, after=0)

    # ---------------- página 2: matriz ponderada
    d.new_page()
    d.section(2, 'Matriz ponderada de canales',
              'Peso: 1 = poco importante · 2 = importante · 3 = clave. Nota: 1 = muy débil · 5 = muy fuerte. '
              'Puntaje = peso × nota.')
    d.example_header('Ejemplo · Casa Nativa (hoy)')
    ex = [('Control', 2, (5, 2, 4)), ('Velocidad', 3, (2, 5, 5)), ('Alcance', 2, (2, 5, 3)),
          ('Costo', 3, (2, 3, 5)), ('Capacidad operativa', 3, (3, 2, 4)), ('Relación con el cliente', 2, (5, 2, 4))]
    rows = []
    tot = [0, 0, 0]
    for name, w_, notes in ex:
        cells = ['<b>%s</b>' % name, '<para alignment="center">%d</para>' % w_]
        for i, n in enumerate(notes):
            tot[i] += w_ * n
            cells.append('<para alignment="center">%d × %d = <b>%d</b></para>' % (w_, n, w_ * n))
        rows.append(cells)
    rows.append([{'text': '<b>Total</b>', 'fill': MINT}, {'text': '', 'fill': MINT}] +
                [{'text': '<para alignment="center"><b>%d</b></para>' % t, 'fill': MINT} for t in tot])
    d.table([0.31, 0.09, 0.2, 0.2, 0.2], ['Criterio', 'Peso', 'Tienda propia', 'Marketplace', 'Redes + WhatsApp'],
            rows, head_center=[1, 2, 3, 4], min_h=16, pad=3.2, after=6)
    d.note('<b>Lectura:</b> hoy gana <b>redes + WhatsApp</b> (%d puntos): Marcela tiene poco tiempo y presupuesto, y '
           'necesita vender pronto. Plan: ordenar su catálogo y su perfil ahora, y evaluar una tienda propia '
           'cuando supere los pedidos que puede atender por chat.' % tot[2], after=12)

    d.yours_header('Tu matriz')
    hdr = ['Criterio', 'Peso<br/>1–3'] + ['%s<br/>nota · puntaje' % n for n in ('Tienda propia', 'Marketplace', 'Redes + WhatsApp')]
    rows = []
    crit = [c_[0] for c_ in CRIT] + [None]
    for i, name in enumerate(crit, 1):
        cells = [{'tf': 'p2_crit%d' % i, 'tip': 'Criterio adicional'} if name is None else '<b>%s</b>' % name,
                 {'tf': 'p2_peso%d' % i, 'tip': 'Peso criterio %d (1 a 3)' % i}]
        for ch in ('tienda', 'market', 'redes'):
            cells.append({'tf': 'p2_%s_nota%d' % (ch, i), 'tip': 'Nota %s criterio %d (1 a 5)' % (ch, i)})
            cells.append({'tf': 'p2_%s_pts%d' % (ch, i), 'tip': 'Puntaje %s criterio %d' % (ch, i)})
        rows.append({'h': 21, 'cells': cells})
    totals = [{'text': '<b>Total</b>', 'fill': MINT}, {'text': '', 'fill': MINT}]
    for ch in ('tienda', 'market', 'redes'):
        totals += [{'text': '', 'fill': MINT}, {'tf': 'p2_%s_total' % ch, 'tip': 'Total %s' % ch}]
    rows.append({'h': 22, 'cells': totals})
    # cabecera con columnas dobles: dibujamos 8 columnas
    d.table([0.25, 0.09, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11],
            ['Criterio', 'Peso<br/>1–3', 'Tienda<br/>nota', 'Tienda<br/>puntaje', 'Market-<br/>place nota',
             'Market-<br/>place puntaje', 'Redes<br/>nota', 'Redes<br/>puntaje'],
            rows, head_center=[1, 2, 3, 4, 5, 6, 7], after=8)
    d.labeled([('Mi decisión para los próximos 6 meses y por qué', 'p2_decision', 1.0)], h=40)

    # ---------------- página 3: pasarelas
    d.new_page()
    d.section(3, 'Ficha para comparar pasarelas de pago',
              'Una pasarela no se elige solo porque acepta tarjetas. Pide los datos por escrito o revísalos en el '
              'sitio oficial del proveedor: comisiones, plazos y requisitos cambian según el plan y la fecha.')
    PQ = [
        ('Costo total', '¿Qué comisión cobra por venta? ¿Hay costo fijo, de activación o mensual? ¿Incluye IVA?'),
        ('Plazo de abono', '¿En cuántos días hábiles llega el dinero a mi cuenta? ¿Cambia el costo si elijo recibirlo antes?'),
        ('Medios disponibles', '¿Débito, crédito, prepago, transferencia, cuotas, billeteras digitales?'),
        ('Integración', '¿Funciona con mi canal: link de pago, botón en la tienda, QR, catálogo o redes?'),
        ('Confianza', '¿Es una marca conocida por mis clientes? ¿La página de pago es clara y segura?'),
        ('Soporte', '¿Cómo resuelven pagos rechazados, devoluciones y contracargos? ¿Por qué canal y en qué horario?'),
        ('Requisitos', '¿Qué documentos piden para abrir la cuenta? ¿Cuánto tarda la activación?'),
    ]
    rows = [[{'text': '', 'fill': MINT}, {'text': '<b>Nombre del proveedor →</b>', 'fill': MINT},
             {'tf': 'p3_prov_a', 'tip': 'Proveedor A'}, {'tf': 'p3_prov_b', 'tip': 'Proveedor B'},
             {'tf': 'p3_prov_c', 'tip': 'Proveedor C'}]]
    for i, (k, q) in enumerate(PQ, 1):
        rows.append({'h': 46, 'cells': ['<b>%s</b>' % k, '<font size="7.8">%s</font>' % q] +
                     [{'tf': 'p3_%s_%d' % (o, i), 'ml': True, 'tip': '%s · proveedor %s' % (k, o.upper())}
                      for o in ('a', 'b', 'c')]})
    rows.append({'h': 22, 'cells': ['<b>Nota global</b>', '<font size="7.8">De 1 a 5, según lo que más pesa para ti.</font>'] +
                 [{'tf': 'p3_nota_%s' % o, 'tip': 'Nota global proveedor %s' % o.upper()} for o in ('a', 'b', 'c')]})
    d.table([0.14, 0.32, 0.18, 0.18, 0.18], ['Criterio', 'Pregunta para el proveedor', 'Opción A', 'Opción B', 'Opción C'],
            rows, after=8)
    d.labeled([('Pasarela elegida y razón principal', 'p3_eleccion', 1.0)], h=40)
    d.note('<b>Casa Nativa</b> comparó dos pasarelas. Una tenía una comisión algo menor, pero abonaba más tarde y '
           'no ofrecía link de pago para WhatsApp. Marcela eligió la otra: le permitía cobrar desde el chat, recibir '
           'el dinero antes para comprar materiales y tenía soporte por chat. <b>Decidió por el costo total y la operación, '
           'no solo por la comisión.</b>', label='Ejemplo', after=0)

    # ---------------- página 4: mapa de flujo
    d.new_page()
    d.section(4, 'Mapa del flujo: de la compra a la posventa',
              'Una venta no termina cuando el cliente paga. Define qué pasa, quién lo hace y en cuánto tiempo en cada etapa.')
    d.example_header('Ejemplo · Casa Nativa')
    stages = [('Compra', 'Clienta elige por catálogo y confirma por WhatsApp.', 'Marcela', 'Responde en < 2 h hábiles'),
              ('Pago', 'Recibe link de pago y comprobante; se valida el pedido.', 'Marcela', 'Confirmación el mismo día'),
              ('Preparación', 'Revisa calidad, embala con protección y tarjeta.', 'Camila', '1–2 días hábiles'),
              ('Despacho', 'Entrega al courier; envía n.º de seguimiento.', 'Camila', 'Máx. 3 días hábiles desde el pago'),
              ('Entrega', 'Aviso de entrega y confirmación de recepción.', 'Courier / Marcela', 'Según zona: informar plazo'),
              ('Posventa', 'Pregunta cómo llegó, pide opinión y registra la compra.', 'Marcela', '2–3 días después')]
    n = len(stages)
    gap = 9
    bw = (CONTENT_W - gap * (n - 1)) / n
    bh = 108
    x = MARGIN
    top = d.y
    for i, (name, what, who, when) in enumerate(stages):
        d.box(x, top - bh, bw, bh, fill=white, stroke=LINE, r=7)
        d._top_round(x, top - 24, bw, 24, 7, TEAL if i % 2 == 0 else NAVY)
        d.c.setFillColor(white)
        d.c.setFont(FB, 9.2)
        d.c.drawString(x + 7, top - 16, '%d · %s' % (i + 1, name))
        yy = top - 30
        for lab, txt in (('', what), ('Quién', who), ('Tiempo', when)):
            st = style(7.8, 9.6) if not lab else style(7.6, 9.4, color=MUTED)
            t = txt if not lab else '<b>%s:</b> %s' % (lab, txt)
            p = P(t, st)
            _, ph = p.wrap(bw - 12, 100)
            p.drawOn(d.c, x + 6, yy - ph)
            yy -= ph + 4
        if i < n - 1:
            ax = x + bw + 1.2
            d.c.setFillColor(AMBER)
            pth = d.c.beginPath()
            ay = top - bh / 2
            pth.moveTo(ax, ay + 5)
            pth.lineTo(ax + gap - 2.4, ay)
            pth.lineTo(ax, ay - 5)
            pth.close()
            d.c.drawPath(pth, stroke=0, fill=1)
        x += bw + gap
    d.y = top - bh - 14

    d.yours_header('Tu flujo de venta')
    rows = []
    for i, (name, *_r) in enumerate(stages, 1):
        rows.append({'h': 50, 'cells': ['<b>%d · %s</b>' % (i, name)] +
                     [{'tf': 'p4_%s_%d' % (k, i), 'ml': True, 'tip': '%s · %s' % (name, lab)}
                      for k, lab in (('que', 'qué debe pasar'), ('resp', 'responsable'),
                                     ('tiempo', 'tiempo objetivo'), ('aviso', 'aviso al cliente'))]})
    d.table([0.15, 0.31, 0.15, 0.15, 0.24], ['Etapa', 'Qué debe pasar', 'Responsable', 'Tiempo objetivo', 'Aviso al cliente'],
            rows, after=8)
    d.note('<b>Punto crítico:</b> marca la etapa donde hoy se generan más reclamos o consultas y empieza a mejorar por ahí. '
           'Una entrega tardía con aviso a tiempo genera menos desconfianza que una entrega incierta.',
           label='Clave', label_color=TEAL, fill=MINT, stroke=LINE, after=0)
    return d


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for fn in (m2_pdf1, m2_pdf2):
        d = fn()
        ov = d.finish()
        print(d.path, 'fields:', d.nfields, 'overflow:', ov)

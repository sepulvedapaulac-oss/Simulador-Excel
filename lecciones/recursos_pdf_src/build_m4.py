# -*- coding: utf-8 -*-
"""Módulo 4 · Herramientas PDF 1 y 2."""
import os
from cnpdf import *  # noqa

OUT = os.path.join(os.path.dirname(__file__), '..', 'M4', 'recursos', 'pdf')


def q(t, hint):
    return '<b>%s</b><br/><font size="7.4" color="#55636f">%s</font>' % (t, hint)


# =====================================================================
#  M4 · PDF 1 · Plantilla de base de clientes y guía rápida de indicadores
# =====================================================================
def m4_pdf1():
    path = os.path.join(OUT, 'M4_PDF1_Base_Clientes_Guia_Indicadores.pdf')
    d = Doc(path, 4, 1, 'Base de clientes e indicadores',
            'Ordena a tus clientes con las columnas mínimas, segméntalos con reglas simples, cuida su '
            'consentimiento y mide lo que importa con cinco indicadores clave.',
            4, short_title='Plantilla de base de clientes y guía rápida de indicadores')
    d.new_page()
    d.howto([
        'Crea una <b>planilla compartida</b> (o la versión gratuita de un CRM) con las columnas mínimas de abajo.',
        'Define tus <b>reglas de segmentación</b> y la acción para cada segmento (página 2).',
        'Revisa el <b>consentimiento</b>: registra cómo y cuándo cada persona aceptó recibir mensajes.',
        'Elige 3 indicadores de la <b>guía rápida</b> (página 4) y revísalos cada semana.',
    ], '≈ 40 minutos')
    d.section(1, 'Columnas mínimas de tu base de clientes',
              'Registra solo lo útil para la relación comercial. Más columnas no significan mejor información.')
    COLS = [
        ('ID', 'Evita duplicados y permite ubicar a la persona rápido.', 'CN-024'),
        ('Nombre', 'Saludar y personalizar.', 'Daniela R.'),
        ('Teléfono o correo', 'Contactar por el canal correcto.', '+56 9 XXXX XXXX'),
        ('Canal preferido', 'Escribir donde la persona sí responde.', 'WhatsApp'),
        ('Consentimiento', '¿Aceptó recibir novedades? ¿Cuándo y por qué medio?', 'Sí · 12/03/2026 · por WhatsApp'),
        ('Primera / última compra', 'Saber si es nuevo, recurrente o inactivo.', '12/03/2026 · 20/08/2026'),
        ('N.º de compras', 'Medir recompra y fidelidad.', '3'),
        ('Monto acumulado', 'Calcular ticket promedio y valor del cliente.', '$84.000'),
        ('Intereses', 'Ofrecer algo pertinente, no promociones a todos.', 'Cojines, mantas, tonos tierra'),
        ('Segmento', 'Agrupar para decidir qué mensaje enviar.', 'Recurrente'),
        ('Próxima acción y fecha', 'Que ninguna cotización o seguimiento se olvide.', '15/10: enviar ideas de la nueva colección'),
        ('Notas', 'Contexto útil para la próxima conversación.', 'Living pequeño; prefiere despacho a domicilio'),
    ]
    rows = [['<b>%s</b>' % a, b, c_] for a, b, c_ in COLS]
    d.table([0.24, 0.43, 0.33], ['Columna', 'Para qué sirve', 'Ejemplo · Casa Nativa'], rows,
            min_h=17, pad=3.6, zebra=True, after=12)
    d.note('<b>¿Planilla o CRM?</b> Empieza con una planilla compartida: una fila por cliente y una columna por dato. '
           'Considera la versión gratuita de un CRM cuando necesites recordatorios automáticos, historial de conversaciones '
           'o varias personas atendiendo. Lo importante es mantenerla actualizada.',
           label='Consejo', label_color=TEAL, fill=MINT, stroke=LINE, after=0)

    # ---------------- página 2: segmentación y consentimiento
    d.new_page()
    d.section(2, 'Reglas de segmentación y acción por segmento',
              'Ajusta los plazos a tu ciclo de compra: no es lo mismo vender velas que muebles.')
    SEG = [
        ('Nuevo', '1 compra en los últimos 90 días.',
         'Agradecer, preguntar cómo llegó el pedido y compartir cuidados del producto.'),
        ('Recurrente', '2 o más compras en los últimos 12 meses.',
         'Avisarle primero de novedades, pedir una reseña y ofrecer un beneficio por fidelidad.'),
        ('Inactivo', 'Compró antes, pero no en los últimos 6 meses.',
         'Un mensaje personal con una novedad ligada a lo que compró. Si no responde, no insistir.'),
        ('Interesado', 'Consultó o cotizó, pero aún no compra.',
         'Seguimiento a los 2 o 3 días resolviendo su duda. Registrar el motivo si no compra.'),
    ]
    rows = []
    for i, (s, r, a) in enumerate(SEG, 1):
        rows.append({'h': 50, 'cells': ['<b>%s</b>' % s, P(r, style(8.2, 10.2)),
                     {'tf': 'm4a_seg%d_regla' % i, 'ml': True, 'tip': 'Tu regla: %s' % s},
                     P(a, style(8.2, 10.2)),
                     {'tf': 'm4a_seg%d_accion' % i, 'ml': True, 'tip': 'Tu acción: %s' % s}]})
    d.table([0.12, 0.18, 0.2, 0.25, 0.25],
            ['Segmento', 'Regla sugerida', 'Tu regla', 'Acción sugerida (Casa Nativa)', 'Tu acción'], rows, after=8)
    d.note('<b>Casa Nativa</b> tenía 60 clientas en su planilla: 22 nuevas, 18 recurrentes, 12 inactivas y 8 interesadas. '
           'En vez de enviar la misma promoción a todas, Marcela mandó a las recurrentes un adelanto de la colección '
           'y a las interesadas una respuesta a su duda pendiente. Dos interesadas compraron esa semana.',
           label='Ejemplo', after=14)

    d.section(3, 'Consentimiento y cuidado de los datos',
              'Fidelizar es aportar valor en el momento adecuado y respetar a quien no quiere ser contactado.')
    CONS = [
        ('permiso', 'Pido permiso explícito antes de enviar novedades o promociones (haber comprado no basta).'),
        ('registro', 'Registro la fecha y el medio por el que la persona aceptó.'),
        ('para_que', 'Explico para qué usaré sus datos y con qué frecuencia escribiré.'),
        ('baja', 'Ofrezco una forma simple de dejar de recibir mensajes y la respeto de inmediato.'),
        ('minimo', 'Guardo solo lo necesario: no registro datos sensibles (salud, religión, etc.) ni datos de tarjetas.'),
        ('acceso', 'Solo accede quien lo necesita; la planilla tiene permisos y respaldo.'),
        ('actualizo', 'Actualizo o elimino los datos cuando la persona lo pide.'),
    ]
    for k, t in CONS:
        d.cb('m4a_cons_' + k, MARGIN + 4, d.y - 11, 10, tip=t)
        d.para(t, style(9.2, 11.8), x=MARGIN + 22, w=CONTENT_W - 22, after=5)
    d.space(4)
    d.note('En Chile, considera <b>la Ley 21.719 de protección de datos personales, que fortalece estas exigencias</b>. '
           'Revisa tus obligaciones en fuentes oficiales o con asesoría; esta lista es un punto de partida, '
           'no asesoría legal.', label='Importante', label_color=TEAL, fill=MINT, stroke=LINE, after=0)

    # ---------------- página 3: base inicial
    d.new_page()
    d.section(4, 'Tu base inicial: los primeros 10 clientes',
              'Úsala para partir hoy. Luego traspásala a tu planilla compartida o CRM y mantenla al día.')
    hdr = ['Nombre', 'Teléfono o correo', 'Canal', 'Consen-<br/>timiento', 'Última<br/>compra',
           'N.º de<br/>compras', 'Segmento', 'Próxima acción y fecha']
    cols = [0.15, 0.15, 0.09, 0.08, 0.1, 0.08, 0.11, 0.24]
    ex = [{'text': P(t, style(7.8, 9.6, color=HexColor('#7a4a06'))), 'fill': AMBER_SOFT} for t in
          ['<b>Ej.: Daniela R.</b>', '+56 9 XXXX XXXX', 'WhatsApp', 'Sí', '20/08/2026', '3', 'Recurrente',
           '15/10: ideas de la nueva colección']]
    rows = [{'h': 20, 'cells': ex}]
    for i in range(1, 11):
        rows.append({'h': 30, 'cells': [
            {'tf': 'm4a_base%02d_nombre' % i, 'size': 8, 'tip': 'Cliente %d: nombre' % i},
            {'tf': 'm4a_base%02d_contacto' % i, 'size': 8, 'tip': 'Cliente %d: teléfono o correo' % i},
            {'tf': 'm4a_base%02d_canal' % i, 'size': 8, 'tip': 'Cliente %d: canal preferido' % i},
            {'cb': 'm4a_base%02d_consent' % i, 'tip': 'Cliente %d: consentimiento' % i},
            {'tf': 'm4a_base%02d_ultima' % i, 'size': 8, 'tip': 'Cliente %d: última compra' % i},
            {'tf': 'm4a_base%02d_compras' % i, 'size': 8, 'tip': 'Cliente %d: n.º de compras' % i},
            {'tf': 'm4a_base%02d_segmento' % i, 'size': 8, 'tip': 'Cliente %d: segmento' % i},
            {'tf': 'm4a_base%02d_accion' % i, 'size': 8, 'tip': 'Cliente %d: próxima acción y fecha' % i}]})
    d.table(cols, hdr, rows, head_center=[3, 5], after=10)
    d.section(5, 'Rutina semanal de 15 minutos', after=4)
    RUT = [('r1', 'Registro las ventas, consultas y cotizaciones de la semana.'),
           ('r2', 'Actualizo el segmento de quienes compraron o dejaron de comprar.'),
           ('r3', 'Reviso las próximas acciones con fecha de esta semana y las agendo.'),
           ('r4', 'Anoto el motivo cuando una cotización no se concreta.')]
    for k, t in RUT:
        d.cb('m4a_rutina_' + k, MARGIN + 4, d.y - 11, 10, tip=t)
        d.para(t, style(9.2, 11.8), x=MARGIN + 22, w=CONTENT_W - 22, after=5)
    d.labeled([('Día y hora fija para tu rutina', 'm4a_rutina_dia', 0.5), ('Responsable', 'm4a_rutina_resp', 0.5)])

    # ---------------- página 4: KPI
    d.new_page()
    d.section(6, 'Guía rápida de indicadores',
              'Un KPI es un indicador con propósito: responde una pregunta y anticipa una decisión. '
              'En Google Analytics 4 (GA4) los menús pueden cambiar de nombre; busca el informe equivalente.')
    st = style(7.9, 9.8)
    KPI = [
        ('Sesiones', '¿Cuántas visitas llegan y desde qué canal?',
         'Visitas al sitio en un periodo.',
         'Informes › Adquisición › Adquisición de tráfico (por grupo de canales).',
         '1.200 al mes; 45% desde Instagram.'),
        ('Eventos clave', '¿Las visitas hacen lo que buscamos?',
         'N.º de acciones importantes: compra, clic a WhatsApp, formulario.',
         'Informes › Interacción › Eventos clave. Se marcan en Administrar › Visualización de datos.',
         '54 clics a WhatsApp y 12 compras.'),
        ('Tasa de conversión', '¿Qué parte de las visitas termina en la acción?',
         'Conversiones ÷ sesiones × 100',
         'Adquisición de tráfico: métrica «Tasa de eventos clave de la sesión».',
         '12 ÷ 1.200 × 100 = 1%.'),
        ('Ticket promedio', '¿Cuánto gasta cada compra en promedio?',
         'Ventas totales ($) ÷ n.º de pedidos',
         'Informes › Monetización, si tu tienda envía el evento de compra. Si vendes por chat, usa tu registro de ventas.',
         '$336.000 ÷ 12 = $28.000.'),
        ('Tasa de recompra', '¿Nuestros clientes vuelven?',
         'Clientes con 2 o más compras ÷ total de clientes × 100',
         'Tu base de clientes (columna N.º de compras). GA4 muestra usuarios recurrentes en Retención, pero no reemplaza tu registro.',
         '18 ÷ 60 × 100 = 30%.'),
    ]
    rows = []
    for i, (k, qq, f, ga, ex) in enumerate(KPI, 1):
        rows.append({'h': 58, 'cells': [q(k, qq), P(f, st), P(ga, st), P(ex, st),
                     {'tf': 'm4a_kpi%d_valor' % i, 'ml': True, 'size': 8, 'tip': '%s: tu valor actual' % k},
                     {'tf': 'm4a_kpi%d_meta' % i, 'ml': True, 'size': 8, 'tip': '%s: tu meta' % k}]})
    d.table([0.18, 0.17, 0.25, 0.14, 0.13, 0.13],
            ['Indicador y pregunta', 'Fórmula', 'Dónde verlo', 'Ej. Casa Nativa (mes)', 'Tu valor', 'Tu meta'],
            rows, after=10)
    d.subhead('Mi panel mínimo: 3 indicadores, revisados cada semana', color=NAVY, after=5)
    rows = []
    for i in range(1, 4):
        rows.append({'h': 36, 'cells': [{'tf': 'm4a_panel%d_%s' % (i, k), 'ml': k in ('decision', 'pregunta'), 'size': 8,
                                         'tip': 'Panel fila %d: %s' % (i, lab)}
                                        for k, lab in (('indicador', 'indicador'), ('pregunta', 'pregunta que responde'),
                                                       ('actual', 'valor actual'), ('meta', 'meta'),
                                                       ('decision', 'si no se cumple, haré…'))]})
    d.table([0.18, 0.26, 0.12, 0.12, 0.32], ['Indicador', 'Pregunta que responde', 'Valor actual', 'Meta',
                                             'Si no se cumple, haré…'], rows, after=10)
    d.note('<b>Casa Nativa</b> eligió tres indicadores: tasa de conversión, ticket promedio y tasa de recompra. Cada lunes, '
           'Marcela los anota en su planilla y se pregunta: ¿qué está pasando, por qué importa y qué haremos esta semana?',
           label='Ejemplo', after=0)
    return d


# =====================================================================
#  M4 · PDF 2 · Plantilla del Plan de Acción Digital
# =====================================================================
MODS = [('1 · Productividad y nube', '¿Qué debemos ordenar, proteger o estandarizar?'),
        ('2 · Canales de venta', '¿Qué parte del proceso comercial necesita menos fricción?'),
        ('3 · Marketing digital', '¿A quién queremos llegar y con qué estrategia?'),
        ('4 · Clientes y datos', '¿Qué necesitamos registrar, medir y mejorar?')]


def m4_pdf2():
    path = os.path.join(OUT, 'M4_PDF2_Plan_Accion_Digital.pdf')
    d = Doc(path, 4, 2, 'Plan de Acción Digital',
            'Convierte lo aprendido en el curso en tres prioridades realistas para los próximos 90 días, '
            'con responsable, plazo, indicador y meta.',
            4, short_title='Plantilla del Plan de Acción Digital')
    d.new_page()
    d.howto([
        'Haz un <b>diagnóstico honesto</b> por módulo: qué funciona, qué duele, qué falta y qué puede esperar.',
        'Ubica tus ideas en la <b>matriz impacto/esfuerzo</b> y elige solo <b>3 prioridades</b>.',
        'Convierte cada prioridad en una acción con <b>problema, acción, responsable, plazo, indicador y meta</b>.',
        'Distribuye el trabajo en un <b>cronograma de 3 meses</b> y revisa el avance una vez al mes.',
    ], '≈ 60 minutos',
        extra='Digitalizar no es hacer todo al mismo tiempo. Tres prioridades cumplidas valen más que diez ideas sueltas.')
    d.section(1, 'Diagnóstico resumen por módulo')
    d.example_header()
    EX = [
        ('Carpetas compartidas con reglas de nombres.', 'Fotos de productos repartidas en el celular.',
         'Respaldo automático del celular.', 'Cambiar de herramienta de oficina.'),
        ('Catálogo de WhatsApp y link de pago.', 'Consultas repetidas sobre despachos.',
         'Aviso de despacho con n.º de seguimiento.', 'Tienda propia (evaluar en 6 meses).'),
        ('Fotos reales en espacios pequeños.', 'Responde lo mismo todo el día.',
         'Respuestas rápidas y mensaje fuera de horario.', 'Videos diarios en una red nueva.'),
        ('Conoce bien a sus clientas frecuentes.', 'Olvida el seguimiento de cotizaciones y pierde ventas.',
         'Registro de clientes y panel semanal.', 'App propia.'),
    ]
    st = style(7.8, 9.6)
    rows = [['<b>%s</b>' % MODS[i][0]] + [P(t, st) for t in r] for i, r in enumerate(EX)]
    d.table([0.2, 0.2, 0.2, 0.2, 0.2], ['Módulo', 'Qué funciona', 'Qué duele', 'Qué falta', 'Qué puede esperar'],
            rows, min_h=16, pad=3.4, zebra=True, after=12)
    d.yours_header('Tu diagnóstico')
    rows = []
    for i, (m, qq) in enumerate(MODS, 1):
        rows.append({'h': 52, 'cells': [q(m, qq)] +
                     [{'tf': 'm4b_diag%d_%s' % (i, k), 'ml': True, 'size': 8, 'tip': 'Módulo %d · %s' % (i, lab)}
                      for k, lab in (('funciona', 'qué funciona'), ('duele', 'qué duele'),
                                     ('falta', 'qué falta'), ('espera', 'qué puede esperar'))]})
    d.table([0.2, 0.2, 0.2, 0.2, 0.2], ['Módulo', 'Qué funciona', 'Qué duele', 'Qué falta', 'Qué puede esperar'],
            rows, after=0)

    # ---------------- página 2: matriz impacto / esfuerzo
    d.new_page()
    d.section(2, 'Prioriza: impacto y esfuerzo',
              'Escribe en cada cuadrante las ideas de tu diagnóstico. Los problemas que hoy cuestan tiempo, ventas o '
              'clientes son buenos candidatos para empezar.')
    QD = [('Alto impacto · bajo esfuerzo', 'Priorizar primero', TEAL,
           'Ej.: registrar clientes y próximas acciones; automatizar 5 preguntas frecuentes.'),
          ('Alto impacto · alto esfuerzo', 'Planificar por etapas', NAVY,
           'Ej.: campañas con panel de medición; tienda en línea propia.'),
          ('Bajo impacto · bajo esfuerzo', 'Resolver si no distrae', HexColor('#4f8f95'),
           'Ej.: actualizar el horario en Google Maps.'),
          ('Bajo impacto · alto esfuerzo', 'Postergar o descartar', HexColor('#8a6a3a'),
           'Ej.: desarrollar una app propia; videos diarios en una red nueva.')]
    ax = 22
    gx = MARGIN + ax
    gw = (CONTENT_W - ax - 10) / 2
    gh = 172
    top = d.y - 4
    for i, (t, sub, col, ex) in enumerate(QD):
        cx = gx + (i % 2) * (gw + 10)
        cy = top - (i // 2) * (gh + 10)
        d.box(cx, cy - gh, gw, gh, fill=white, stroke=LINE, r=8)
        d._top_round(cx, cy - 34, gw, 34, 8, col)
        d.c.setFillColor(white)
        d.c.setFont(FB, 10)
        d.c.drawString(cx + 10, cy - 15, t)
        d.c.setFont(F, 8.6)
        d.c.drawString(cx + 10, cy - 27, sub)
        p = P(ex, style(7.8, 9.6, color=MUTED, font=FI))
        _, ph = p.wrap(gw - 20, 40)
        p.drawOn(d.c, cx + 10, cy - 40 - ph)
        d.tf('m4b_matriz_q%d' % (i + 1), cx + 8, cy - gh + 8, gw - 16, gh - 52 - ph,
             multiline=True, tip='Cuadrante: %s' % t)
    # ejes
    d.c.saveState()
    d.c.setFillColor(MUTED)
    d.c.setFont(FB, 8.4)
    d.c.translate(MARGIN + 9, top - gh - 5)
    d.c.rotate(90)
    d.c.drawCentredString(0, 0, 'IMPACTO  ↑')
    d.c.restoreState()
    d.y = top - 2 * gh - 10
    d.c.setFillColor(MUTED)
    d.c.setFont(FB, 8.4)
    d.c.drawCentredString(gx + gw + 5, d.y - 12, 'ESFUERZO  →  (izquierda: bajo · derecha: alto)')
    d.y -= 26
    d.labeled([('Mis 3 prioridades elegidas (en orden)', 'm4b_prioridades_lista', 1.0)], h=40)
    d.note('Si tienes más de tres ideas en «Priorizar primero», elige las que atacan el problema que más te cuesta hoy. '
           'Las demás pasan al próximo ciclo de 90 días.', label='Clave', label_color=TEAL, fill=MINT, stroke=LINE, after=0)

    # ---------------- página 3: 3 prioridades
    d.new_page()
    d.section(3, 'Tres prioridades a 90 días')
    d.example_header('Ejemplo · Plan de Casa Nativa')
    PR = [
        ('Pierde ventas por olvidar el seguimiento de cotizaciones.',
         'Registrar cada cliente y cotización con su próxima acción en una planilla compartida.',
         'Marcela', '2 semanas', 'Cotizaciones con próxima acción y fecha', '100%'),
        ('Responde las mismas preguntas todo el día.',
         'Configurar bienvenida, fuera de horario y 5 respuestas rápidas en WhatsApp Business.',
         'Marcela y Camila', 'Mes 1', 'Tiempo de primera respuesta', 'Menos de 2 h hábiles'),
        ('No sabe qué publicidad funciona.',
         'Una campaña pequeña al mes con objetivo y panel semanal de 3 indicadores.',
         'Marcela', 'Meses 2 y 3', 'Costo por conversación', '≤ meta definida en la campaña'),
    ]
    st = style(7.8, 9.6)
    rows = [['<b>%d</b>' % i] + [P(t, st) for t in r] for i, r in enumerate(PR, 1)]
    d.table([0.04, 0.22, 0.27, 0.11, 0.09, 0.15, 0.12],
            ['#', 'Problema', 'Acción', 'Responsable', 'Plazo', 'Indicador', 'Meta'],
            rows, head_center=[0], min_h=16, pad=3.4, zebra=True, after=12)
    d.yours_header('Tu plan')
    for i in range(1, 4):
        top = d.y
        H = 140
        d.box(MARGIN, top - H, CONTENT_W, H, fill=SOFT, stroke=LINE, r=8)
        d._pill(MARGIN + 10, top - 22, 'PRIORIDAD %d' % i, fill=NAVY, size=8, h=15)
        x0 = MARGIN + 10
        w0 = CONTENT_W - 20

        def lab(t, x, y):
            d.c.setFillColor(MUTED)
            d.c.setFont(FB, 7.8)
            d.c.drawString(x, y, t)
        y = top - 34
        half = (w0 - 10) / 2
        lab('Problema (qué nos cuesta hoy)', x0, y)
        lab('Acción concreta', x0 + half + 10, y)
        d.tf('m4b_p%d_problema' % i, x0, y - 44, half, 40, multiline=True, tip='Prioridad %d: problema' % i)
        d.tf('m4b_p%d_accion' % i, x0 + half + 10, y - 44, half, 40, multiline=True, tip='Prioridad %d: acción' % i)
        y -= 54
        ws = [0.22, 0.18, 0.34, 0.26]
        gap = 8
        tot = w0 - gap * 3
        x = x0
        for (t, k), f in zip((('Responsable', 'responsable'), ('Plazo', 'plazo'),
                              ('Indicador (cómo sabremos si funcionó)', 'indicador'), ('Meta', 'meta')), ws):
            lab(t, x, y)
            d.tf('m4b_p%d_%s' % (i, k), x, y - 40, tot * f, 36, multiline=True, tip='Prioridad %d: %s' % (i, t))
            x += tot * f + gap
        d.y = top - H - 8

    # ---------------- página 4: cronograma y seguimiento
    d.new_page()
    d.section(4, 'Cronograma mensual', 'Divide cada prioridad en pasos pequeños. Un paso por mes es suficiente.')
    ex = [{'text': P(t, style(7.8, 9.6, color=HexColor('#7a4a06'))), 'fill': AMBER_SOFT} for t in
          ['<b>Ej.: Casa Nativa · Prioridad 1</b>', 'Crear la planilla y registrar el 100% de las cotizaciones.',
           'Segmentar en nuevos, recurrentes, inactivos e interesados.', 'Primera acción de fidelización para recurrentes.']]
    rows = [{'h': 20, 'cells': ex}]
    for i in range(1, 4):
        rows.append({'h': 60, 'cells': ['<b>Prioridad %d</b>' % i] +
                     [{'tf': 'm4b_crono_p%d_m%d' % (i, m), 'ml': True, 'size': 8,
                       'tip': 'Prioridad %d · mes %d' % (i, m)} for m in (1, 2, 3)]})
    d.table([0.19, 0.27, 0.27, 0.27], ['', 'Mes 1 · ________', 'Mes 2 · ________', 'Mes 3 · ________'], rows, after=12)
    d.section(5, 'Seguimiento mensual', 'Revisa los indicadores, aprende y ajusta. Un plan que no se revisa se olvida.')
    rows = []
    for m in range(1, 4):
        g = 'm4b_seg_m%d_avanza' % m
        rows.append({'h': 40, 'cells': [
            '<b>Revisión mes %d</b>' % m,
            {'tf': 'm4b_seg_m%d_fecha' % m, 'size': 8, 'tip': 'Mes %d: fecha de revisión' % m},
            {'tf': 'm4b_seg_m%d_indicadores' % m, 'ml': True, 'size': 8, 'tip': 'Mes %d: indicadores y valores' % m},
            {'radio': (g, 'si'), 'tip': 'Mes %d: avanza sí' % m},
            {'radio': (g, 'parcial'), 'tip': 'Mes %d: avanza parcial' % m},
            {'radio': (g, 'no'), 'tip': 'Mes %d: no avanza' % m},
            {'tf': 'm4b_seg_m%d_ajuste' % m, 'ml': True, 'size': 8, 'tip': 'Mes %d: ajuste' % m}]})
    d.table([0.13, 0.1, 0.25, 0.08, 0.08, 0.08, 0.28],
            ['', 'Fecha', 'Indicadores y valores', 'Avanza:<br/>sí', 'Avanza:<br/>parcial', 'No<br/>avanza', 'Ajuste para el próximo mes'],
            rows, head_center=[3, 4, 5], after=8)
    d.note('<b>Casa Nativa, mes 1:</b> el 100% de las cotizaciones quedó con próxima acción y Marcela recuperó dos ventas '
           'que habría olvidado. Las respuestas rápidas avanzaron a medias: solo configuró tres. <b>Ajuste:</b> terminar '
           'las dos que faltan antes de lanzar la campaña del mes 2.', label='Ejemplo', after=12)
    d.subhead('Mi compromiso', color=NAVY, after=5)
    d.labeled([('Nombre', 'm4b_compromiso_nombre', 0.4), ('Fecha de inicio', 'm4b_compromiso_inicio', 0.3),
               ('Próxima revisión', 'm4b_compromiso_revision', 0.3)])
    return d


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for fn in (m4_pdf1, m4_pdf2):
        d = fn()
        ov = d.finish()
        print(d.path, 'fields:', d.nfields, 'overflow:', ov)

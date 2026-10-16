# -*- coding: utf-8 -*-
"""Mini motor de maquetación para las herramientas PDF del curso
"Herramientas Digitales para el Crecimiento de PYMES".

Usa reportlab (canvas + AcroForm) para producir PDF A4 imprimibles con
campos rellenables (texto, casillas y botones de opción).
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# ---------------------------------------------------------------- paleta
TEAL = HexColor('#0f7a82')
NAVY = HexColor('#173f4e')
MINT = HexColor('#eaf7f6')
AMBER = HexColor('#c97d0e')
INK = HexColor('#172431')
MUTED = HexColor('#55636f')
LINE = HexColor('#c9dedd')
SOFT = HexColor('#f5fbfa')
AMBER_SOFT = HexColor('#fdf4e6')
AMBER_LINE = HexColor('#ecd3a8')
FIELD_FILL = HexColor('#fbfefe')
FIELD_LINE = HexColor('#8fc7c3')
TEAL_LIGHT = HexColor('#d3eeec')

COURSE = 'Herramientas Digitales para el Crecimiento de PYMES'
DISCLAIMER = 'Casa Nativa es una empresa ficticia con fines educativos'

# ---------------------------------------------------------------- fuentes
_FD = '/usr/share/fonts/truetype/crosextra/'
pdfmetrics.registerFont(TTFont('Carlito', _FD + 'Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', _FD + 'Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Italic', _FD + 'Carlito-Italic.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-BoldItalic', _FD + 'Carlito-BoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
addMapping('Carlito', 0, 0, 'Carlito')
addMapping('Carlito', 1, 0, 'Carlito-Bold')
addMapping('Carlito', 0, 1, 'Carlito-Italic')
addMapping('Carlito', 1, 1, 'Carlito-BoldItalic')

F, FB, FI = 'Carlito', 'Carlito-Bold', 'Carlito-Italic'


def style(size=9.5, leading=None, color=INK, font=F, align=TA_LEFT, **kw):
    return ParagraphStyle('s%s' % size, fontName=font, fontSize=size,
                          leading=leading or size * 1.28, textColor=color,
                          alignment=align, **kw)


S_BODY = style(9.6)
S_SMALL = style(8.4)
S_CELL = style(8.6, 10.6)
S_CELL_B = style(8.6, 10.6, font=FB, color=NAVY)
S_TINY = style(7.6, 9.4, color=MUTED)
S_HEAD = style(8.4, 10, color=white, font=FB)
S_HEAD_C = style(8.4, 10, color=white, font=FB, align=TA_CENTER)
S_MUTED = style(8.8, 11.4, color=MUTED)

PAGE_W, PAGE_H = A4
MARGIN = 36
CONTENT_W = PAGE_W - 2 * MARGIN
BOTTOM = 52  # límite inferior del contenido (sobre el pie)


def P(text, st=S_CELL):
    return Paragraph(text, st)


class Doc:
    def __init__(self, path, module, tool, title, subtitle, total_pages,
                 short_title=None, disclaimer=DISCLAIMER):
        self.disclaimer = disclaimer
        self.path = path
        self.module = module
        self.tool = tool
        self.title = title
        self.subtitle = subtitle
        self.short = short_title or title
        self.total = total_pages
        self.c = canvas.Canvas(path, pagesize=A4)
        self.c.setTitle('%s · Módulo %s' % (title, module))
        self.c.setAuthor('Curso ' + COURSE)
        self.c.setSubject('Herramienta de trabajo · Módulo %s · %s' % (module, title))
        self.c.setKeywords('PYMES, herramientas digitales, Casa Nativa, plantilla')
        self.c.setCreator('Curso ' + COURSE)
        self.page = 0
        self.y = 0
        self.nfields = 0
        self.overflow = []

    # ------------------------------------------------------------ páginas
    def new_page(self):
        if self.page:
            self._footer()
            self.c.showPage()
        self.page += 1
        if self.page == 1:
            self._header_big()
        else:
            self._header_small()

    def finish(self):
        self._footer()
        self.c.showPage()
        self.c.save()
        if self.page != self.total:
            raise SystemExit('Total de páginas incorrecto en %s: %d != %d' %
                             (self.path, self.page, self.total))
        return self.overflow

    def _pill(self, x, y, text, fill=AMBER, color=white, size=8.2, h=15,
              anchor='left'):
        c = self.c
        w = pdfmetrics.stringWidth(text, FB, size) + 16
        if anchor == 'right':
            x = x - w
        c.setFillColor(fill)
        c.roundRect(x, y, w, h, h / 2, stroke=0, fill=1)
        c.setFillColor(color)
        c.setFont(FB, size)
        c.drawString(x + 8, y + (h - size) / 2 + 1.6, text)
        return w

    def _header_big(self):
        c = self.c
        h = 112
        top = PAGE_H
        c.setFillColor(NAVY)
        c.rect(0, top - h, PAGE_W, h, stroke=0, fill=1)
        c.setFillColor(TEAL)
        c.rect(0, top - h, PAGE_W, 6, stroke=0, fill=1)
        # motivo decorativo: círculos suaves
        c.saveState()
        c.setFillColor(TEAL)
        c.setFillAlpha(0.35)
        c.circle(PAGE_W - 40, top - 20, 70, stroke=0, fill=1)
        c.setFillAlpha(0.25)
        c.circle(PAGE_W - 92, top - 92, 22, stroke=0, fill=1)
        c.restoreState()
        c.setFillColor(HexColor('#bfe6e3'))
        c.setFont(FB, 8.6)
        c.drawString(MARGIN, top - 28, COURSE.upper())
        self._pill(MARGIN, top - 50, 'Módulo %s · Herramienta %s' % (self.module, self.tool))
        c.setFillColor(white)
        c.setFont(FB, 21)
        c.drawString(MARGIN, top - 76, self.title)
        p = Paragraph(self.subtitle, style(10, 12.5, color=HexColor('#d9efed')))
        w, ph = p.wrap(CONTENT_W - 90, 40)
        p.drawOn(c, MARGIN, top - 84 - ph)
        self.y = top - h - 16

    def _header_small(self):
        c = self.c
        h = 40
        top = PAGE_H
        c.setFillColor(NAVY)
        c.rect(0, top - h, PAGE_W, h, stroke=0, fill=1)
        c.setFillColor(TEAL)
        c.rect(0, top - h, PAGE_W, 3, stroke=0, fill=1)
        c.setFillColor(HexColor('#bfe6e3'))
        c.setFont(FB, 7.4)
        c.drawString(MARGIN, top - 16, COURSE.upper())
        c.setFillColor(white)
        c.setFont(FB, 11.5)
        c.drawString(MARGIN, top - 31, self.short)
        self._pill(PAGE_W - MARGIN, top - 30, 'Módulo %s · Herramienta %s' %
                   (self.module, self.tool), anchor='right', size=7.8, h=14)
        self.y = top - h - 16

    def _footer(self):
        c = self.c
        if self.y < BOTTOM - 2:
            self.overflow.append((self.page, round(self.y, 1)))
        c.setStrokeColor(LINE)
        c.setLineWidth(0.7)
        c.line(MARGIN, 36, PAGE_W - MARGIN, 36)
        c.setFillColor(MUTED)
        c.setFont(FI, 8)
        c.drawString(MARGIN, 24, self.disclaimer)
        c.setFont(FB, 8)
        c.drawRightString(PAGE_W - MARGIN, 24, 'Página %d de %d' % (self.page, self.total))
        c.setFont(F, 7.6)
        c.drawCentredString(PAGE_W / 2 + 40, 24, 'Módulo %s · Herramienta %s' % (self.module, self.tool))

    # ------------------------------------------------------------ texto
    def space(self, h):
        self.y -= h

    def para(self, text, st=S_BODY, x=None, w=None, after=4):
        x = MARGIN if x is None else x
        w = CONTENT_W if w is None else w
        p = Paragraph(text, st)
        _, h = p.wrap(w, 1000)
        p.drawOn(self.c, x, self.y - h)
        self.y -= h + after
        return h

    def section(self, num, title, lead=None, after=6):
        c = self.c
        r = 9.5
        cy = self.y - r
        c.setFillColor(TEAL)
        c.circle(MARGIN + r, cy, r, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont(FB, 10)
        c.drawCentredString(MARGIN + r, cy - 3.4, str(num))
        c.setFillColor(NAVY)
        c.setFont(FB, 13.5)
        c.drawString(MARGIN + 2 * r + 8, cy - 4.6, title)
        self.y -= 2 * r + 5
        if lead:
            self.para(lead, S_MUTED, x=MARGIN + 2 * r + 8, w=CONTENT_W - 2 * r - 8, after=2)
        self.y -= after

    def subhead(self, text, color=TEAL, after=4, size=10.5):
        self.c.setFillColor(color)
        self.c.setFont(FB, size)
        self.c.drawString(MARGIN, self.y - size, text)
        self.y -= size + after

    # ------------------------------------------------------------ cajas
    def box(self, x, y, w, h, fill=white, stroke=LINE, r=8, lw=0.8):
        c = self.c
        c.setLineWidth(lw)
        c.setFillColor(fill)
        if stroke is None:
            c.roundRect(x, y, w, h, r, stroke=0, fill=1)
        else:
            c.setStrokeColor(stroke)
            c.roundRect(x, y, w, h, r, stroke=1, fill=1)

    def _top_round(self, x, y, w, h, r, fill):
        c = self.c
        p = c.beginPath()
        p.moveTo(x, y)
        p.lineTo(x, y + h - r)
        p.arcTo(x, y + h - 2 * r, x + 2 * r, y + h, startAng=180, extent=-90)
        p.lineTo(x + w - r, y + h)
        p.arcTo(x + w - 2 * r, y + h - 2 * r, x + w, y + h, startAng=90, extent=-90)
        p.lineTo(x + w, y)
        p.close()
        c.setFillColor(fill)
        c.drawPath(p, stroke=0, fill=1)

    def howto(self, steps, time_txt, extra=None):
        """Tarjeta 'Cómo usar esta herramienta'."""
        c = self.c
        x, w = MARGIN, CONTENT_W
        pad = 12
        col_w = (w - 2 * pad - 14) / 2
        paras = [Paragraph(s, style(9, 11.6)) for s in steps]
        hs = [p.wrap(col_w - 20, 200)[1] for p in paras]
        half = (len(steps) + 1) // 2
        left_h = sum(hs[:half]) + 6 * (half - 1)
        right_h = sum(hs[half:]) + 6 * (len(steps) - half - 1)
        body_h = max(left_h, right_h)
        extra_p = Paragraph(extra, style(8.4, 10.6, color=MUTED, font=FI)) if extra else None
        eh = extra_p.wrap(w - 2 * pad, 100)[1] + 6 if extra_p else 0
        h = pad + 16 + 8 + body_h + eh + pad
        top = self.y
        self.box(x, top - h, w, h, fill=MINT, stroke=None, r=10)
        c.setFillColor(TEAL)
        c.rect(x, top - h, 4, h, stroke=0, fill=1)
        c.setFillColor(NAVY)
        c.setFont(FB, 12)
        c.drawString(x + pad + 2, top - pad - 11, 'Cómo usar esta herramienta')
        self._pill(x + w - pad, top - pad - 13, time_txt, fill=TEAL, anchor='right', size=8)
        yy = [top - pad - 24, top - pad - 24]
        for i, (p, ph) in enumerate(zip(paras, hs)):
            col = 0 if i < half else 1
            cx = x + pad + 2 + col * (col_w + 14)
            cy = yy[col]
            c.setFillColor(TEAL)
            c.circle(cx + 7, cy - 6.5, 7, stroke=0, fill=1)
            c.setFillColor(white)
            c.setFont(FB, 8.5)
            c.drawCentredString(cx + 7, cy - 9.4, str(i + 1))
            p.drawOn(c, cx + 20, cy - ph)
            yy[col] = cy - ph - 6
        if extra_p:
            extra_p.drawOn(c, x + pad + 2, top - h + pad - 2)
        self.y = top - h - 12

    def note(self, text, fill=AMBER_SOFT, stroke=AMBER_LINE, label=None,
             label_color=AMBER, st=None, after=10, x=None, w=None):
        c = self.c
        x = MARGIN if x is None else x
        w = CONTENT_W if w is None else w
        pad = 9
        st = st or style(8.8, 11.4)
        p = Paragraph(text, st)
        lw = 0
        if label:
            lw = pdfmetrics.stringWidth(label, FB, 7.6) + 16 + 8
        _, h = p.wrap(w - 2 * pad - lw, 400)
        H = max(h, 14) + 2 * pad
        top = self.y
        self.box(x, top - H, w, H, fill=fill, stroke=stroke, r=7)
        if label:
            self._pill(x + pad, top - pad - 13, label, fill=label_color, size=7.6, h=14)
        p.drawOn(c, x + pad + lw, top - pad - h)
        self.y = top - H - after

    def example_header(self, text='Ejemplo · Casa Nativa'):
        self._pill(MARGIN, self.y - 15, text.upper(), fill=AMBER, size=7.8, h=15)
        self.y -= 21

    def yours_header(self, text='Tu negocio'):
        self._pill(MARGIN, self.y - 15, text.upper(), fill=TEAL, size=7.8, h=15)
        self.y -= 21

    # ------------------------------------------------------------ campos
    def _fname(self, name):
        self.nfields += 1
        return name

    def tf(self, name, x, y, w, h, tip='', multiline=None, size=None, value=''):
        if multiline is None:
            multiline = h > 22
        flags = 'multiline doNotSpellCheck' if multiline else 'doNotSpellCheck'
        if size is None:
            size = 8.5 if multiline else (9 if h >= 16 else 8)
        self.c.acroForm.textfield(
            name=self._fname(name), tooltip=tip or name, x=x, y=y, width=w, height=h,
            value=value, fontName='Helvetica', fontSize=size,
            borderColor=FIELD_LINE, fillColor=FIELD_FILL, textColor=INK,
            borderWidth=0.6, borderStyle='solid', fieldFlags=flags,
            forceBorder=True, maxlen=4000 if multiline else 300)

    def cb(self, name, x, y, size=10, tip=''):
        self.c.acroForm.checkbox(
            name=self._fname(name), tooltip=tip or name, x=x, y=y, size=size,
            buttonStyle='check', borderColor=TEAL, fillColor=white, textColor=TEAL,
            borderWidth=0.8, forceBorder=True, fieldFlags='')

    def radio(self, group, value, x, y, size=10, tip=''):
        self.c.acroForm.radio(
            name=group, value=value, selected=False, x=x, y=y, size=size,
            buttonStyle='circle', shape='square', borderColor=TEAL, fillColor=white,
            textColor=TEAL, borderWidth=0.8, forceBorder=True,
            tooltip=tip or group, fieldFlags='noToggleToOff radio')

    def labeled(self, items, h=18, gap=10, label_w=None):
        """Fila de campos con rótulo encima: items=[(label, name, frac)]."""
        c = self.c
        x = MARGIN
        tot = CONTENT_W - gap * (len(items) - 1)
        for label, name, frac in items:
            w = tot * frac
            c.setFillColor(MUTED)
            c.setFont(FB, 8)
            c.drawString(x, self.y - 8, label)
            self.tf(name, x, self.y - 11 - h, w, h, tip=label)
            x += w + gap
        self.y -= 11 + h + 8

    def check_inline(self, prefix, label, options, after=8, x=None):
        """Rótulo + varias casillas en una línea: options=[(name, text)]."""
        c = self.c
        x = MARGIN if x is None else x
        c.setFillColor(NAVY)
        c.setFont(FB, 8.8)
        c.drawString(x, self.y - 9, label)
        x += pdfmetrics.stringWidth(label, FB, 8.8) + 10
        for name, text in options:
            self.cb(prefix + name, x, self.y - 11, 10, tip=text)
            c.setFillColor(INK)
            c.setFont(F, 8.8)
            c.drawString(x + 14, self.y - 9, text)
            x += 14 + pdfmetrics.stringWidth(text, F, 8.8) + 14
        self.y -= 12 + after

    # ------------------------------------------------------------ tablas
    def table(self, cols, header, rows, x=None, w=None, min_h=18, pad=4,
              head_center=None, zebra=False, after=10, first_bold=False,
              cell_style=S_CELL, head_fill=NAVY):
        """cols: fracciones de ancho. rows: listas de celdas.
        Celda: str (texto con marcado), Paragraph, None, o dict:
          {'tf': nombre, 'ml': bool, 'tip': str}
          {'cb': nombre, 'tip': str}  (casilla centrada)
          {'radio': (grupo, valor), 'tip': str}
          {'fill': color, 'text': str}
        Una fila puede ser {'span': texto} para un subtítulo a lo ancho
        o {'h': alto, 'cells': [...]} para fijar la altura mínima.
        """
        c = self.c
        x = MARGIN if x is None else x
        w = CONTENT_W if w is None else w
        widths = [w * f for f in cols]
        head_center = head_center or []
        # cabecera
        hp = []
        for i, t in enumerate(header):
            st = S_HEAD_C if i in head_center else S_HEAD
            p = Paragraph(t, st)
            hp.append((p, p.wrap(widths[i] - 2 * pad, 200)[1]))
        hh = max(h for _, h in hp) + 2 * pad + 1
        # filas: calcular alturas
        laid = []
        for r in rows:
            if isinstance(r, dict) and 'span' in r:
                p = Paragraph(r['span'], style(8.8, 10.6, color=NAVY, font=FB))
                ph = p.wrap(w - 2 * pad, 100)[1]
                laid.append(('span', p, ph + 2 * pad - 1))
                continue
            rmin = min_h
            cells = r
            if isinstance(r, dict):
                rmin = r.get('h', min_h)
                cells = r['cells']
            items = []
            rh = rmin
            for i, cell in enumerate(cells):
                if isinstance(cell, dict) and ('tf' in cell or 'cb' in cell or 'radio' in cell):
                    items.append((cell, 0))
                    continue
                fill = None
                if isinstance(cell, dict) and 'text' in cell:
                    fill = cell.get('fill')
                    cell = cell['text']
                if cell is None or cell == '':
                    items.append((None, 0, fill))
                    continue
                if isinstance(cell, Paragraph):
                    p = cell
                else:
                    st = S_CELL_B if (first_bold and i == 0) else cell_style
                    p = Paragraph(cell, st)
                ph = p.wrap(widths[i] - 2 * pad, 1000)[1]
                items.append((p, ph, fill))
                rh = max(rh, ph + 2 * pad + 1)
            laid.append(('row', items, rh))
        total_h = hh + sum(l[2] for l in laid)
        top = self.y
        # marco
        self.box(x, top - total_h, w, total_h, fill=white, stroke=LINE, r=7)
        self._top_round(x, top - hh, w, hh, 7, head_fill)
        cx = x
        for i, (p, ph) in enumerate(hp):
            p.drawOn(c, cx + pad, top - pad - ph - 0.5)
            cx += widths[i]
        yy = top - hh
        for k, item in enumerate(laid):
            kind, data, rh = item
            ytop = yy
            if kind == 'span':
                last = k == len(laid) - 1
                c.setFillColor(MINT)
                c.rect(x + 0.6, ytop - rh, w - 1.2, rh, stroke=0, fill=1)
                data.drawOn(c, x + pad + 2, ytop - pad - data.wrap(w - 2 * pad, 100)[1] + 0.5)
            else:
                if zebra and k % 2 == 1:
                    c.setFillColor(SOFT)
                    c.rect(x + 0.6, ytop - rh, w - 1.2, rh, stroke=0, fill=1)
                cx = x
                for i, it in enumerate(data):
                    cw = widths[i]
                    cell = it[0]
                    if isinstance(cell, dict):
                        tip = cell.get('tip', '')
                        if 'tf' in cell:
                            self.tf(cell['tf'], cx + 2.5, ytop - rh + 2.5, cw - 5, rh - 5,
                                    tip=tip, multiline=cell.get('ml'), size=cell.get('size'))
                        elif 'cb' in cell:
                            s = 10
                            self.cb(cell['cb'], cx + (cw - s) / 2, ytop - rh / 2 - s / 2, s, tip=tip)
                        elif 'radio' in cell:
                            s = 10
                            g, v = cell['radio']
                            self.radio(g, v, cx + (cw - s) / 2, ytop - rh / 2 - s / 2, s, tip=tip)
                    else:
                        fill = it[2] if len(it) > 2 else None
                        if fill is not None:
                            c.setFillColor(fill)
                            c.rect(cx + 0.6, ytop - rh + 0.4, cw - 0.6, rh - 0.4, stroke=0, fill=1)
                        if cell is not None:
                            cell.drawOn(c, cx + pad, ytop - pad - it[1] - 0.5)
                    cx += cw
            # línea inferior
            if k < len(laid) - 1:
                c.setStrokeColor(LINE)
                c.setLineWidth(0.5)
                c.line(x, ytop - rh, x + w, ytop - rh)
            yy -= rh
        # verticales
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        cx = x
        for i in range(len(widths) - 1):
            cx += widths[i]
            # no cruzar filas 'span'
            yy = top - hh
            for kind, data, rh in laid:
                if kind != 'span':
                    c.line(cx, yy, cx, yy - rh)
                yy -= rh
            c.setStrokeColor(HexColor('#3d6573'))
            c.line(cx, top, cx, top - hh)
            c.setStrokeColor(LINE)
        self.y = top - total_h - after
        return total_h


def check_glyph(c, x, y, size=7, color=TEAL):
    """Dibuja un ticket (para ejemplos estáticos)."""
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(1.4)
    c.setLineCap(1)
    c.setLineJoin(1)
    p = c.beginPath()
    p.moveTo(x, y + size * 0.5)
    p.lineTo(x + size * 0.38, y + size * 0.12)
    p.lineTo(x + size, y + size * 0.95)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()

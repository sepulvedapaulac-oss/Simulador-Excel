"""Bloques HTML para pegar en Moodle (descripción de una sección o actividad, editor › Código fuente).

Los textos se entregan como .txt: HTML con estilos en línea, sin <style>, <script>, flex, grid ni degradados,
porque el filtro de Moodle los elimina. Los usan tools/build_moodle.py (bienvenida y evaluación final)
y tools/build_tarea.py (instrucción de cada tarea).

Colores: los del curso. Se toman de curso.json → "colores" y, si falta alguno, de tools/base.css
(paleta por defecto verde azulado y azul petróleo). Así cada curso conserva la paleta de sus recursos.
"""
import html, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from curso import curso  # noqa: E402

E = html.escape
SERIF = "Georgia,'Times New Roman',serif"


def _token(css, name):
    m = re.search(rf"--{name}:\s*(#[0-9A-Fa-f]{{3,6}})", css)
    return m.group(1) if m else None


def paleta():
    """Colores del curso para Moodle y Word. curso.json → "colores" manda sobre tools/base.css."""
    css = (ROOT / "tools" / "base.css").read_text(encoding="utf-8")
    p = {
        "oscuro": _token(css, "navy") or "#173f4e",         # encabezado, títulos y cierre
        "primario": _token(css, "teal") or "#0f7a82",       # números, encabezados de tabla, subtítulos
        "acento": _token(css, "teal2") or "#2bc2b1",        # borde izquierdo de las cajas y flechas
        "acento_txt": _token(css, "teal-ink") or "#0b666d",  # etiquetas en mayúsculas sobre fondo blanco
        "destaque": "#f0a83a",                              # línea inferior del encabezado y de los títulos de sección
        "claro": "#cfe6ea",                                 # texto secundario sobre fondo oscuro
        "suave": _token(css, "mint") or "#eaf7f6",          # fondo de chips y del ejemplo resuelto
        "linea": _token(css, "line") or "#c9d6dc",
        "alterna": "#f4f8f9",                               # filas alternas de tablas
        "tinta": _token(css, "ink") or "#172431",
        "gris": _token(css, "muted") or "#5f7180",
    }
    p.update(curso().get("colores", {}))
    return p


def marca():
    """Texto del encabezado (por ejemplo «TREMEN PARTNER · TLS® · SERVICIO Y ATENCIÓN AL CLIENTE»)."""
    c = curso()
    return c.get("marca") or " · ".join(x for x in (c.get("otec", ""), c["nombre"]) if x).upper()


class Moodle:
    """Construye un bloque para el código fuente de Moodle con la paleta del curso."""

    def __init__(self):
        self.c = paleta()
        self.o = []

    # ---- piezas ----
    def hero(self, kicker, titulo, sub="", chips=()):
        c = self.c
        ch = " ".join(f'<span style="display: inline-block; margin: 0 6px 6px 0; padding: 5px 13px; border: 1px solid {c["claro"]}; '
                      f'border-radius: 999px; font-size: 14px; font-weight: bold; color: #ffffff;">{E(x)}</span>' for x in chips)
        self.o.append(
            f'<div style="background: {c["oscuro"]}; border-bottom: 6px solid {c["destaque"]}; border-radius: 22px; padding: 22px 24px; color: #ffffff; margin-bottom: 18px;">'
            f'<p style="margin: 0 0 6px; color: {c["destaque"]}; font-size: 12px; font-weight: bold; letter-spacing: 2px;">{E(kicker.upper())}</p>'
            f'<h2 style="margin: 0; font-family: {SERIF}; font-size: 28px; line-height: 1.2; color: #ffffff;">{titulo}</h2>'
            + (f'<p style="margin: 8px 0 0; color: {c["claro"]}; font-size: 15px;">{sub}</p>' if sub else "")
            + (f'<p style="margin: 12px 0 0;">{ch}</p>' if ch else "") + "</div>")
        return self

    def p(self, texto, size=15):
        self.o.append(f'<p style="margin: 0 0 12px; font-size: {size}px;">{self.b(texto)}</p>')
        return self

    def b(self, texto):
        """**negrita** → <strong> con el color oscuro del curso."""
        return re.sub(r"\*\*(.+?)\*\*", lambda m: f'<strong style="color: {self.c["oscuro"]};">{m.group(1)}</strong>', texto)

    def h3(self, t):
        c = self.c
        self.o.append(f'<h3 style="margin: 26px 0 8px; padding-top: 14px; border-top: 3px solid {c["destaque"]}; font-family: {SERIF}; '
                      f'font-size: 23px; color: {c["oscuro"]};">{t}</h3>')
        return self

    def h4(self, t):
        self.o.append(f'<h4 style="margin: 20px 0 8px; font-family: {SERIF}; font-size: 19px; color: {self.c["primario"]};">{t}</h4>')
        return self

    def ficha(self, etiqueta, filas):
        """Caja con borde de acento y tabla de dos columnas (por ejemplo «Antes de empezar»)."""
        c = self.c
        td = f"padding: 9px 12px; border-top: 1px solid {c['linea']}; vertical-align: top;"
        rows = "".join(f'<tr><td style="width: 34%; {td} font-weight: bold; color: {c["oscuro"]}; font-size: 14px;">{E(k)}</td>'
                       f'<td style="{td} font-size: 15px;">{self.b(v)}</td></tr>' for k, v in filas)
        self.o.append(f'<div style="margin: 14px 0 18px; border: 1px solid {c["linea"]}; border-left: 6px solid {c["acento"]}; border-radius: 16px; background: #ffffff; padding: 6px 4px;">'
                      f'<p style="margin: 6px 12px 6px; color: {c["acento_txt"]}; font-size: 12px; font-weight: bold; letter-spacing: 2px;">{E(etiqueta.upper())}</p>'
                      f'<table style="width: 100%; border-collapse: collapse; border: 0;"><tbody>{rows}</tbody></table></div>')
        return self

    def caja(self, texto, etiqueta=""):
        """Recuadro destacado (competencia, criterios evaluados, avisos)."""
        c = self.c
        et = (f'<p style="margin: 0 0 4px; color: {c["acento_txt"]}; font-size: 12px; font-weight: bold; letter-spacing: 2px;">{E(etiqueta.upper())}</p>'
              if etiqueta else "")
        self.o.append(f'<div style="margin: 14px 0 16px; padding: 14px 18px; border: 1px solid {c["linea"]}; border-left: 6px solid {c["primario"]}; '
                      f'border-radius: 16px; background: #ffffff;">{et}<p style="margin: 0; font-size: 15px;">{self.b(texto)}</p></div>')
        return self

    def pasos(self, items):
        """Lista numerada con círculos: [(título en negrita, texto)]."""
        c = self.c
        rows = "".join(
            f'<tr><td style="width: 34px; vertical-align: top; padding: 8px 0; border: 0;"><span style="display: inline-block; width: 26px; height: 26px; '
            f'line-height: 26px; text-align: center; border-radius: 50%; background: {c["primario"]}; color: #ffffff; font-size: 14px; font-weight: bold;">{i}</span></td>'
            f'<td style="vertical-align: top; padding: 9px 0 8px 4px; border: 0; font-size: 15px;">'
            f'<strong style="color: {c["oscuro"]};">{E(t)}</strong> {self.b(x)}</td></tr>'
            for i, (t, x) in enumerate(items, 1))
        self.o.append(f'<table style="width: 100%; border-collapse: collapse; border: 0; margin: 4px 0 12px;"><tbody>{rows}</tbody></table>')
        return self

    def lista(self, items):
        """Viñetas: textos o pares (término en negrita, explicación)."""
        li = "".join(f'<li style="margin: 0 0 6px;">' + (f'<strong style="color: {self.c["oscuro"]};">{E(x[0])}:</strong> {self.b(x[1])}'
                                                         if isinstance(x, (tuple, list)) else self.b(x)) + "</li>" for x in items)
        self.o.append(f'<ul style="margin: 4px 0 14px; padding-left: 22px; font-size: 15px;">{li}</ul>')
        return self

    def tabla(self, cols, filas, der=()):
        """Tabla con encabezado del color primario y filas alternas. der: índices de columnas alineadas a la derecha."""
        c = self.c
        th = "".join(f'<th style="background: {c["primario"]}; color: #ffffff; text-align: {"right" if i in der else "left"}; padding: 8px 10px; '
                     f'font-size: 14px; border: 1px solid {c["primario"]};">{E(h)}</th>' for i, h in enumerate(cols))
        tr = "".join("<tr>" + "".join(
            f'<td style="padding: 8px 10px; border: 1px solid {c["linea"]}; vertical-align: top; text-align: {"right" if i in der else "left"}; '
            f'background: {"#ffffff" if k % 2 == 0 else c["alterna"]}; font-size: 14px;">{self.b(str(v))}</td>' for i, v in enumerate(f)) + "</tr>"
            for k, f in enumerate(filas))
        self.o.append(f'<div style="overflow-x: auto; max-width: 100%;"><table style="width: 100%; border-collapse: collapse; margin: 8px 0 16px; overflow-wrap: break-word;">'
                      f'<thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>')
        return self

    def chips(self, items):
        """Ciclo de verbos en chips unidos por flechas."""
        c = self.c
        sp = f' <span style="color: {c["acento"]}; font-weight: bold;">→</span> '
        self.o.append('<p style="margin: 0 0 18px;">' + sp.join(
            f'<span style="display: inline-block; margin: 0 2px 6px 0; padding: 5px 13px; border-radius: 999px; background: {c["suave"]}; '
            f'color: {c["primario"]}; font-size: 13px; font-weight: bold; letter-spacing: 1px;">{E(x.upper())}</span>' for x in items) + "</p>")
        return self

    def tarjetas(self, items):
        """Tarjetas desplegables en dos columnas: [(número, título, etiqueta, texto)]. En Moodle <details> se abre al tocar."""
        c = self.c
        cel = lambda n, t, et, x: (
            f'<td style="width: 50%; vertical-align: top; padding: 0 6px 12px 6px; border: 0;">'
            f'<details style="border: 1px solid {c["linea"]}; border-left: 6px solid {c["acento"]}; border-radius: 16px; background: #ffffff; padding: 14px 16px;">'
            f'<summary style="cursor: pointer; font-weight: bold; font-size: 16px; color: {c["oscuro"]};"><span style="display: inline-block; width: 26px; height: 26px; '
            f'line-height: 26px; text-align: center; border-radius: 50%; background: {c["primario"]}; color: #ffffff; font-size: 14px; margin-right: 6px;">{n}</span>{t}</summary>'
            f'<p style="margin: 10px 0 2px; color: {c["acento_txt"]}; font-size: 12px; font-weight: bold; letter-spacing: 1px;">{E(et.upper())}</p>'
            f'<p style="margin: 0; font-size: 15px;">{x}</p></details></td>')
        filas = [items[i:i + 2] for i in range(0, len(items), 2)]
        tr = "".join("<tr>" + "".join(cel(*x) for x in f) + ("" if len(f) == 2 else '<td style="width: 50%; border: 0;"></td>') + "</tr>" for f in filas)
        self.o.append(f'<table style="width: 100%; table-layout: fixed; border-collapse: collapse; border: 0; margin: 0 -6px;"><tbody>{tr}</tbody></table>')
        return self

    def rubrica(self, n, criterio, peso, niveles):
        """Un criterio de la rúbrica: niveles = [(nombre, puntos, descripción)] de mayor a menor."""
        c = self.c
        col = {"Excelente": "#1a7f4b", "Logrado": "#1a7f4b", "Bueno": c["acento_txt"], "Suficiente": "#9a6b00",
               "En desarrollo": "#9a6b00", "Insuficiente": "#b42318", "No logrado": "#b42318"}
        td = f"padding: 7px 8px; border-top: 1px solid {c['linea']}; vertical-align: top;"
        rows = "".join(f'<tr><td style="width: 96px; {td} font-weight: bold; font-size: 13px; color: {col.get(nv, c["oscuro"])};">{E(nv)}</td>'
                       f'<td style="{td} font-size: 14px;"><strong style="color: {c["oscuro"]};">{fmt(pt)} pts.</strong> {self.b(d)}</td></tr>'
                       for nv, pt, d in niveles)
        self.o.append(f'<div style="margin: 0 0 14px; border: 1px solid {c["linea"]}; border-left: 6px solid {c["primario"]}; border-radius: 14px; background: #ffffff; padding: 12px 12px 6px;">'
                      f'<p style="margin: 0 0 6px; font-size: 15px; color: {c["oscuro"]};"><strong style="color: {c["oscuro"]};">{n}. {E(criterio)}</strong> ({fmt(peso)} %)</p>'
                      f'<table style="width: 100%; border-collapse: collapse; border: 0;"><tbody>{rows}</tbody></table></div>')
        return self

    def cierre(self, titulo, texto=""):
        c = self.c
        self.o.append(f'<div style="background: {c["oscuro"]}; border-radius: 18px; padding: 14px 20px; color: #ffffff; margin-top: 20px;">'
                      f'<p style="margin: 0; font-weight: bold; font-size: 16px; color: #ffffff;">{titulo}</p>'
                      + (f'<p style="margin: 4px 0 0; color: {c["claro"]}; font-size: 15px;">{texto}</p>' if texto else "") + "</div>")
        return self

    def raw(self, h):
        self.o.append(h)
        return self

    # ---- salida ----
    def html(self):
        blk = (f'<div style="font-family: Arial,Helvetica,sans-serif; color: {self.c["tinta"]}; max-width: 980px; margin: 0 auto; line-height: 1.5;">'
               + "\n".join(self.o) + "</div>")
        for bad in ("<style", "<script", "flex", "grid", "gradient"):
            assert bad not in blk, f"Moodle elimina «{bad}»"
        return blk

    def guardar(self, ruta):
        ruta = Path(ruta)
        ruta.parent.mkdir(parents=True, exist_ok=True)
        ruta.write_text(self.html() + "\n", encoding="utf-8")
        print(f"OK {ruta.relative_to(ROOT)} · {ruta.stat().st_size // 1024} KB")
        return ruta


def fmt(x):
    """Número con coma decimal y sin «,0»."""
    return str(x).replace(".", ",").removesuffix(",0")


def sence():
    """Competencia, aprendizajes esperados, criterios y horas: la única fuente es curso.json → "sence"
    (se actualiza junto con la planilla SENCE; todos los recursos que los muestran se regeneran)."""
    s = curso().get("sence")
    if not s or not s.get("competencia") or not s.get("ae"):
        sys.exit("Falta curso.json → \"sence\" (competencia, ae, criterios, horas). Complétalo desde la planilla SENCE aprobada.")
    s.setdefault("criterios", [tercera(a) for a in s["ae"]])
    return s


def tercera(ae):
    """«Identificar …» → «Identifica …» (criterio de evaluación a partir del aprendizaje esperado)."""
    v, r = ae.split(" ", 1)
    irregulares = {"Evaluar": "Evalúa", "Actuar": "Actúa", "Continuar": "Continúa", "Distinguir": "Distingue", "Construir": "Construye", "Elegir": "Elige", "Seguir": "Sigue", "Medir": "Mide"}
    if v in irregulares:
        return irregulares[v] + " " + r
    for suf, rep in (("ar", "a"), ("er", "e"), ("ir", "e")):
        if v.endswith(suf):
            return v[: -len(suf)] + rep + " " + r
    return ae

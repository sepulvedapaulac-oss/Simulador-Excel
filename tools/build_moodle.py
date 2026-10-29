#!/usr/bin/env python3
"""Textos para Moodle (.txt para pegar en el editor › Código fuente) de la bienvenida y de la evaluación final.

Uso: python3 tools/build_moodle.py bienvenida   (datos: src/bienvenida/bienvenida.py)
     python3 tools/build_moodle.py final        (datos: src/evaluacion-curso/instrucciones.py)
     python3 tools/build_moodle.py todo
Salida: dist/bienvenida/Bienvenida_Moodle.txt
        dist/evaluacion-curso/Moodle_Evaluacion_final_instruccion_general.txt
        dist/evaluacion-curso/Moodle_Evaluacion_final_Parte_1.txt
        dist/evaluacion-curso/Moodle_Evaluacion_final_Parte_2.txt
La competencia, los aprendizajes esperados, los criterios y las horas salen de curso.json → "sence";
la ponderación, de curso.json → "evaluacion". Ejemplos de datos: src/ejemplos/bienvenida/ y src/ejemplos/evaluacion-final-curso/instrucciones.py.
"""
import runpy, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from curso import curso  # noqa: E402
from moodle import Moodle, E, marca, sence, fmt  # noqa: E402


def datos(ruta, ejemplo):
    f = ROOT / ruta
    if not f.exists():
        sys.exit(f"Falta {ruta}. Cópialo desde {ejemplo} y adáptalo al curso.")
    return f


def bienvenida():
    B = runpy.run_path(str(datos("src/bienvenida/bienvenida.py", "src/ejemplos/bienvenida/bienvenida.py")))
    C, S = curso(), sence()
    n = len(S["ae"])
    m = Moodle()
    m.hero(marca(), "Te damos la bienvenida", f"{E(C['nombre'])}. {B['LEMA']}",
           [f"{fmt(sum(S['horas']))} horas", f"{n} módulos", f"{B['LECCIONES']} lecciones", "A tu ritmo"])
    m.caja(f'<span style="font-family: Georgia,\'Times New Roman\',serif; font-size: 19px; color: {m.c["oscuro"]};">{E(S["competencia"])}</span>',
           "Competencia a desarrollar")
    m.raw(f'<h3 style="margin: 22px 0 2px; font-family: Georgia,\'Times New Roman\',serif; font-size: 22px; color: {m.c["oscuro"]};">Aprendizajes esperados por módulo</h3>'
          f'<p style="margin: 0 0 12px; color: {m.c["gris"]}; font-size: 15px;">Toca cada tarjeta para ver qué lograrás en ese módulo.</p>')
    tit = lambda k: C["modulos"].get(str(k), {}).get("titulo", f"Módulo {k}").split(" · ", 1)[-1]
    m.tarjetas([(k, f'{E(tit(k))} <span style="color: {m.c["acento_txt"]}; font-size: 13px;">· {fmt(h)} h</span>', f"Aprendizaje esperado {k}", E(a))
                for k, (a, h) in enumerate(zip(S["ae"], S["horas"]), 1)])
    if B.get("CICLO"):
        m.raw(f'<h3 style="margin: 14px 0 2px; font-family: Georgia,\'Times New Roman\',serif; font-size: 22px; color: {m.c["oscuro"]};">{E(B["CICLO_TITULO"])}</h3>'
              f'<p style="margin: 0 0 10px; color: {m.c["gris"]}; font-size: 15px;">{B["CICLO_INTRO"]}</p>')
        m.chips(B["CICLO"])
    m.cierre(*B["CIERRE"])
    m.guardar(ROOT / "dist" / "bienvenida" / "Bienvenida_Moodle.txt")


def final():
    F = runpy.run_path(str(datos("src/evaluacion-curso/instrucciones.py", "src/ejemplos/evaluacion-final-curso/instrucciones.py")))
    C, S = curso(), sence()
    Ev = C.get("evaluacion", {})
    w1, w2 = Ev.get("final_parte1", 20), Ev.get("final_parte2", 40)
    exig = Ev.get("exigencia", 60)
    P1, P2 = F["PARTE1"], F["PARTE2"]
    n = len(S["criterios"])
    q = P1["preguntas"] // n                      # preguntas por criterio
    pp = P1["puntos"]                             # puntos por pregunta
    t1, t2 = P1["preguntas"] * pp, sum(t[2] for t in P2["tareas"])
    tot = t1 + t2
    aprueba = round(tot * exig / 100)
    out = ROOT / "dist" / "evaluacion-curso"

    # ---- instrucción general ----
    m = Moodle()
    m.hero("Evaluación final del curso", "Instrucción general", E(C["nombre"]))
    m.p(f"Esta evaluación cierra el curso **{E(C['nombre'])}** y mide la competencia del curso: <em>{E(S['competencia'][0].lower() + S['competencia'][1:])}</em>")
    m.p(f"Tiene **dos partes** que se responden en orden. Equivale al **{fmt(w1 + w2)} % de la nota final del curso**: {fmt(w1)} % la Parte 1 y {fmt(w2)} % la Parte 2.")
    m.h4("Antes de comenzar")
    m.lista(F["ANTES"])
    m.h4("Puntaje y aprobación")
    m.tabla(["Parte", "Instrumento", "Puntaje"],
            [("Parte 1", f"{P1['instrumento']}: {P1['preguntas']} preguntas de selección única, {fmt(pp)} puntos cada una", f"{fmt(t1)} puntos"),
             ("Parte 2", f"{P2['instrumento']}: {len(P2['tareas'])} tareas", f"{fmt(t2)} puntos"),
             ("**Total**", "", f"**{fmt(tot)} puntos**")], der=(2,))
    m.p(f"**Puntaje de aprobación: {aprueba} puntos de {fmt(tot)} ({exig} % de exigencia), equivalente a la nota 4,0** en la escala de 1,0 a 7,0.")
    m.h4("Criterios de evaluación")
    m.p(f"Las dos partes evalúan los mismos {n} criterios. Cada criterio vale **{fmt(q * pp)} puntos en la Parte 1** ({q} preguntas de {fmt(pp)} puntos) y su tarea en la Parte 2.")
    m.tabla(["Criterio de evaluación", "Parte 1", "Parte 2"],
            [(f"{k}. {E(c)}", f"Preguntas M{k}.P1 a M{k}.P{q} · {fmt(q * pp)} pts", f"Tarea {k} · {E(P2['tareas'][k - 1][0])} · {fmt(P2['tareas'][k - 1][2])} pts")
             for k, c in enumerate(S["criterios"], 1)])
    m.guardar(out / "Moodle_Evaluacion_final_instruccion_general.txt")

    # ---- Parte 1 ----
    m = Moodle()
    m.hero("Evaluación final · Parte 1", E(P1["instrumento"]), f"{fmt(t1)} puntos · {fmt(w1)} % de la nota final")
    m.p(f"**Qué encontrarás.** {P1['preguntas']} preguntas de selección única {P1['sobre']}, {q} por criterio de evaluación, identificadas como "
        f"M1.P1 a M{n}.P{q}. Cada respuesta correcta vale **{fmt(pp)} puntos**.")
    m.h4("Cómo responder")
    m.pasos([("", x) for x in P1["como"]])
    m.h4("Ten en cuenta")
    m.lista(P1["ten_en_cuenta"])
    m.caja(f"**Criterios evaluados:** los {n} criterios de evaluación, {fmt(q * pp)} puntos cada uno ({q} preguntas por criterio).")
    m.guardar(out / "Moodle_Evaluacion_final_Parte_1.txt")

    # ---- Parte 2 ----
    m = Moodle()
    m.hero("Evaluación final · Parte 2", E(P2["instrumento"]), f"{fmt(t2)} puntos · {fmt(w2)} % de la nota final")
    m.p(f"**El caso.** {P2['caso']}")
    m.h4(f"Tus {len(P2['tareas'])} tareas")
    m.tabla(["Tarea", "Criterio de evaluación", "Qué debes hacer", "Puntaje"],
            [(f"Tarea {k} · {E(t)}", f"{k}. {E(S['criterios'][k - 1])}", x, fmt(p)) for k, (t, x, p) in enumerate(P2["tareas"], 1)]
            + [("**Total**", "", "", f"**{fmt(t2)}**")], der=(3,))
    m.h4("Cómo responder")
    m.pasos([("", x) for x in P2["como"]])
    if P2.get("ten_en_cuenta"):
        m.h4("Ten en cuenta")
        m.lista(P2["ten_en_cuenta"])
    m.cierre("Resultados", F["RESULTADOS"])
    m.guardar(out / "Moodle_Evaluacion_final_Parte_2.txt")


if __name__ == "__main__":
    que = sys.argv[1] if len(sys.argv) > 1 else "todo"
    if que in ("bienvenida", "todo"):
        bienvenida()
    if que in ("final", "todo"):
        final()

# -*- coding: utf-8 -*-
"""Genera las 7 herramientas PDF (Módulos 1 a 4). Uso: python3 build_all.py"""
import os
import build_m1, build_m2, build_m3, build_m4

for mod, fns in ((build_m1, ('m1_pdf1',)), (build_m2, ('m2_pdf1', 'm2_pdf2')), (build_m3, ('m3_pdf1', 'm3_pdf2')),
                 (build_m4, ('m4_pdf1', 'm4_pdf2'))):
    os.makedirs(mod.OUT, exist_ok=True)
    for fn in fns:
        d = getattr(mod, fn)()
        ov = d.finish()
        print(os.path.normpath(d.path), '| overflow:', ov or 'no')

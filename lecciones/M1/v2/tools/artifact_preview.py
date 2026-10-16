#!/usr/bin/env python3
"""Genera dist/<lección>/preview.artifact.html (versión para publicar como Artifact) a partir de index.html.
uso: artifact_preview.py <carpeta dist>"""
import re, os, sys
dist = sys.argv[1]
for d in sorted(os.listdir(dist)):
    p = os.path.join(dist, d, 'index.html')
    if not os.path.isfile(p): continue
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'^<!DOCTYPE html>\s*<html lang="es">\s*<head>.*?(<title>)', r'\1', s, flags=re.S)
    s = s.replace('</head>\n<body>', '\n').replace('</body>\n</html>\n', '')
    s = re.sub(r'<title>Lección [0-9.]+ — ', '<title>', s, count=1)
    open(os.path.join(dist, d, 'preview.artifact.html'), 'w', encoding='utf-8').write(s)
    print(d)

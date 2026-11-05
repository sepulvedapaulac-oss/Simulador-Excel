#!/usr/bin/env python3
"""Aplica a la presentación publicada en Moodle los datos de la planilla SENCE de reingreso (sol. 1960022)."""
import os
H=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(H,'moodle_Presentacion_del_curso.html'),encoding='utf-8').read()
EV='Parte 1: cuestionario de 10 preguntas (3 %) · Parte 2: tarea con rúbrica «{t}», corregida por la tutora (5 %)'
R=[
 (EV.format(t='Dos semanas en bodega'),'Cuestionario de 10 preguntas (8 %)'),
]+[(EV.format(t=t),f'Parte 1: cuestionario de 10 preguntas (4 %) · Parte 2: tarea con rúbrica «{t}», corregida por la tutora (4 %)') for t in ['El primer mes de Francisca','Las cinco solicitudes de Cristián','Cinco reportes en una semana','El cierre del servicio Los Aromos']]+[
 ('5 h 30 min plataforma · 2 h trabajo autónomo · 1 h 30 min evaluación','5 h 25 min plataforma · 2 h 05 min trabajo autónomo · 1 h 30 min evaluación'),
 ('8 h 35 min plataforma · 1 h 25 min trabajo autónomo · 1 h evaluación','8 h 25 min plataforma · 55 min trabajo autónomo · 1 h 40 min evaluación'),
 ('7 h 15 min plataforma · 3 h 45 min trabajo autónomo · 1 h evaluación','7 h plataforma · 3 h 20 min trabajo autónomo · 1 h 40 min evaluación'),
 ('6 h 35 min plataforma · 5 h 25 min trabajo autónomo · 1 h evaluación','6 h 25 min plataforma · 4 h 55 min trabajo autónomo · 1 h 40 min evaluación'),
 ('8 h 10 min plataforma · 3 h 50 min trabajo autónomo · 3 h evaluación','7 h 55 min plataforma · 2 h 55 min trabajo autónomo · 4 h 10 min evaluación'),
 ('<td class="n">5 h 30 min</td><td class="n">2 h</td><td class="n">1 h 30 min</td>','<td class="n">5 h 25 min</td><td class="n">2 h 05 min</td><td class="n">1 h 30 min</td>'),
 ('<td class="n">8 h 35 min</td><td class="n">1 h 25 min</td><td class="n">1 h</td>','<td class="n">8 h 25 min</td><td class="n">55 min</td><td class="n">1 h 40 min</td>'),
 ('<td class="n">7 h 15 min</td><td class="n">3 h 45 min</td><td class="n">1 h</td>','<td class="n">7 h</td><td class="n">3 h 20 min</td><td class="n">1 h 40 min</td>'),
 ('<td class="n">6 h 35 min</td><td class="n">5 h 25 min</td><td class="n">1 h</td>','<td class="n">6 h 25 min</td><td class="n">4 h 55 min</td><td class="n">1 h 40 min</td>'),
 ('<td class="n">8 h 10 min</td><td class="n">3 h 50 min</td><td class="n">3 h</td>','<td class="n">7 h 55 min</td><td class="n">2 h 55 min</td><td class="n">4 h 10 min</td>'),
 ('<td class="n">36 h 5 min</td><td class="n">16 h 25 min</td><td class="n">7 h 30 min</td>','<td class="n">35 h 10 min</td><td class="n">14 h 10 min</td><td class="n">10 h 40 min</td>'),
 ('<strong>36 h 5 min · 60 %</strong>','<strong>35 h 10 min · 59 %</strong>'),
 ('<b style="width:45%"></b></i><strong>16 h 25 min · 27 %</strong>','<b style="width:40%"></b></i><strong>14 h 10 min · 24 %</strong>'),
 ('<b style="width:21%"></b></i><strong>7 h 30 min · 12 %</strong>','<b style="width:30%"></b></i><strong>10 h 40 min · 18 %</strong>'),
 ('Tiempos de referencia: microlección 40 min, actividad práctica, laboratorio o simulador 25 min, PDF 20 min, resumen y glosario 15 min, cuestionario de módulo 20 min, tarea 40 min (70 min en el módulo 5), diagnóstico 30 min y evaluación final 40 + 50 min.',
  'Tiempos de referencia: microlección 35 min, caso aplicado 30 min, actividad práctica 30 min, simulador 30 min, práctica formativa 40 min, PDF 20 min, resumen y glosario 20 min, diagnóstico 30 min, cuestionario de módulo 1 h, tarea 40 min (70 min en el módulo 5) y evaluación final 1 h + 1 h.'),
 ('<tr><td>Cuestionarios de los módulos 1 a 5, Parte 1 (3 % cada uno)</td><td class="n">15 %</td></tr><tr><td>Tareas con rúbrica de los módulos 1 a 5, Parte 2, corregidas por la tutora (5 % cada una)</td><td class="n">25 %</td></tr><tr><td>Evaluación final · Parte 1: cuestionario de 20 preguntas</td><td class="n">30 %</td></tr><tr><td>Evaluación final · Parte 2: caso práctico integrador «El caso de Javier en Soporte»</td><td class="n">30 %</td></tr>',
  '<tr><td>Módulo 1: cuestionario de 10 preguntas</td><td class="n">8 %</td></tr><tr><td>Cuestionarios de los módulos 2 a 5, Parte 1 (4 % cada uno)</td><td class="n">16 %</td></tr><tr><td>Tareas con rúbrica de los módulos 2 a 5, Parte 2, corregidas por la tutora (4 % cada una)</td><td class="n">16 %</td></tr><tr><td>Evaluación final · Parte 1: cuestionario de 20 preguntas</td><td class="n">20 %</td></tr><tr><td>Evaluación final · Parte 2: caso práctico integrador «El caso de Javier en Soporte»</td><td class="n">40 %</td></tr>'),
 ('5 tareas con rúbrica','4 tareas con rúbrica'),
 ('<b>Corrige tus tareas de módulo (Parte 2 de cada evaluación)</b>','<b>Corrige tus tareas de módulo (Parte 2 de la evaluación de los módulos 2 a 5)</b>'),
 ('Parte 1, cuestionario de 10 preguntas; Parte 2, tarea con rúbrica que corrige la tutora</li>','Parte 1, cuestionario de 10 preguntas; Parte 2 (módulos 2 a 5), tarea con rúbrica que corrige la tutora</li>'),
]
for a,b in R:
    n=s.count(a)
    if n!=1: raise SystemExit(f'esperaba 1 y hay {n}: {a[:70]}')
    s=s.replace(a,b)
out=os.path.join(H,'Presentacion_del_curso.html');open(out,'w',encoding='utf-8').write(s)
import re
t=re.sub(r'data:image[^"]+','',s)
viejo=[x for x in ['(3 %','(5 %','36 h 5','16 h 25','7 h 30','Dos semanas','40 + 50','30 %','módulos 1 a 5, Parte'] if x in t]
print('OK',out,'· textos antiguos que quedan:',viejo or 'ninguno')

#!/usr/bin/env python3
"""Planilla SENCE de reingreso (solicitud anterior 1960022) - Legislación Laboral, e-learning asincrónico."""
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os
H=os.path.dirname(os.path.abspath(__file__));R=lambda f:open(os.path.join(H,f),encoding='utf-8').read().strip()
AE=[l.strip() for l in open(os.path.join(H,'ae.txt'),encoding='utf-8') if l.strip()]
CONT=[["Módulo 1: Fundamentos de la legislación laboral chilena","¿Por qué existe el Derecho Laboral?","¿De dónde provienen las reglas laborales?","¿Quién fiscaliza y orienta?","Dos partes, derechos y obligaciones","Derechos que no pueden simplemente dejarse sin efecto","Diagnóstico de Riesgos Laborales","Mapa de derechos, obligaciones y límites laborales"],
 ["Módulo 2: Contratación, jornada de trabajo y remuneraciones","La relación laboral comienza","No todos los contratos funcionan igual","¿Qué debe decir el contrato?","Organizar el tiempo de trabajo","Ley de 40 Horas en la práctica","Cuando la jornada se extiende","Registrar para demostrar","Leer una remuneración","¿Qué puede descontarse?","Ficha revisión contrato y jornada","Guía rápida jornada horas extra y remuneraciones"],
 ["Módulo 3: Derechos laborales, conciliación y corresponsabilidad","Derechos fundamentales dentro de la empresa","Igualdad de trato y no discriminación","Maternidad, paternidad y protección familiar","Conciliar trabajo y vida personal","Personas que ejercen labores de cuidado","Gestionar solicitudes vinculadas a responsabilidades familiares","Feriado, permisos y licencias","Inclusión laboral","Ficha solicitudes laborales con fundamentación","Mapa derechos protección familiar conciliación inclusión"],
 ["Módulo 4: Prevención del acoso, violencia y gestión de relaciones laborales","El derecho a trabajar en un entorno seguro","Distinguir acoso laboral, acoso sexual y violencia","Prevenir antes de reaccionar","El protocolo como herramienta de gestión","¿Qué ocurre cuando se presenta una denuncia?","Investigación y medidas de resguardo","Conflicto no es lo mismo que acoso","Ficha clasificación conflicto acoso o violencia","Ruta de actuación Ley Karin"],
 ["Módulo 5: Término de la relación laboral y cumplimiento normativo","¿Cómo puede terminar una relación laboral?","Renuncia, acuerdo y vencimiento","Necesidades de la empresa y otras causales","Comunicar correctamente el término","Indemnizaciones y prestaciones asociadas","Finiquito y formalización del cierre","Fiscalización laboral","La evidencia también es cumplimiento","¿Qué ocurre cuando se incumple?","Auditoría simplificada del término laboral","Mapa del cierre causales plazos pagos y evidencia"]]
HORAS=[9,11,12,13,15]
doc=Document()
st=doc.styles['Normal'];st.font.name='Arial';st.font.size=Pt(10);st.element.rPr.rFonts.set(qn('w:eastAsia'),'Arial')
for s in doc.sections: s.left_margin=s.right_margin=Cm(2);s.top_margin=s.bottom_margin=Cm(2)
def shade(cell,c):
    tcPr=cell._tc.get_or_add_tcPr();sh=OxmlElement('w:shd');sh.set(qn('w:val'),'clear');sh.set(qn('w:color'),'auto');sh.set(qn('w:fill'),c);tcPr.append(sh)
def P(text='',bold_lead=None,size=10,bold=False,color=None,after=6):
    p=doc.add_paragraph();p.paragraph_format.space_after=Pt(after)
    if bold_lead: r=p.add_run(bold_lead);r.bold=True;r.font.size=Pt(size)
    r=p.add_run(text);r.font.size=Pt(size);r.bold=bold
    if color: r.font.color.rgb=RGBColor.from_string(color)
    return p
def lines(text): 
    for l in text.split('\n'): P(l,after=3)
def table(head,rows,widths,hshade='D9E2F3'):
    t=doc.add_table(rows=1,cols=len(head));t.style='Table Grid';t.alignment=WD_TABLE_ALIGNMENT.CENTER
    for i,h in enumerate(head):
        c=t.rows[0].cells[i];c.text='';r=c.paragraphs[0].add_run(h);r.bold=True;r.font.size=Pt(9);shade(c,hshade)
    for row in rows:
        cs=t.add_row().cells
        for i,v in enumerate(row):
            cs[i].text=''
            vs=v if isinstance(v,list) else [v]
            for k,x in enumerate(vs):
                p=cs[i].paragraphs[0] if k==0 else cs[i].add_paragraph()
                r=p.add_run(str(x));r.font.size=Pt(9)
                if isinstance(v,list) and k==0: r.bold=True
    t.autofit=False
    tblW=t._tbl.tblPr.find(qn('w:tblLayout'))
    lay=OxmlElement('w:tblLayout');lay.set(qn('w:type'),'fixed');t._tbl.tblPr.append(lay)
    for i,w in enumerate(widths): t.columns[i].width=Cm(w)
    for row in t.rows:
        for i,w in enumerate(widths): row.cells[i].width=Cm(w)
    doc.add_paragraph()
    return t
h=doc.add_paragraph();r=h.add_run('PLANILLA DE CODIFICACIÓN SENCE - VERSIÓN AJUSTADA PARA REINGRESO');r.bold=True;r.font.size=Pt(13)
P('Legislación Laboral',bold_lead='Curso: ')
P('1960022 (rechazada en noviembre de 2026)',bold_lead='Solicitud anterior: ')
P('Tremen Partner Spa',bold_lead='OTEC: ')
P('E-Learning - Asincrónico',bold_lead='1.- Modalidad de Capacitación: ')
P('Legislación Laboral',bold_lead='2.- Nombre Curso de Capacitación: ')
P('Analistas de recursos humanos, analistas de remuneraciones, analistas de personal y analistas administrativos que desempeñan funciones de gestión de contratos de trabajo, control de jornada y asistencia, tramitación de solicitudes laborales y documentación del término de la relación laboral. La capacitación tiene por finalidad fortalecer la gestión de los procesos del ciclo de la relación de trabajo, contribuyendo a prevenir incumplimientos en la contratación, la jornada, las solicitudes laborales, las denuncias y el término del contrato, de acuerdo con el Código del Trabajo y los procedimientos de la organización.',bold_lead='3.- Características de los participantes del curso: ')
P('1',bold_lead='4.- Número de participantes: ')
P('Experiencia laboral en funciones administrativas o de gestión de personas que impliquen manejo de contratos, registros de asistencia, remuneraciones o documentación laboral. No se requieren conocimientos jurídicos previos.',bold_lead='5.- Requisitos de ingreso de los participantes: ')
P('Analizar procedimientos laborales del ciclo de la relación de trabajo en la gestión de personas, de acuerdo al Código del Trabajo.',bold_lead='6.- Competencia a desarrollar: ')
P('',bold_lead='7.- Aprendizajes Esperados, Contenidos y Horas E-Learning')
table(['#','Aprendizajes','Contenidos','Horas E-Learning'],[[str(i+1),AE[i],CONT[i],str(HORAS[i])] for i in range(5)],[0.8,5,9,2.2])
P(str(sum(HORAS)),bold_lead='8.- Total Horas Cronológicas del Curso: ')
P('',bold_lead='10.- Datos de ingreso a Plataforma')
P('https://aulavirtual.tremenpartner.com/course/view.php?id=110',bold_lead='Dirección Web: ')
P('Usuario: sence · Clave: la misma de la solicitud 1960022'.replace(' · ','. '),bold_lead='Datos de acceso a la plataforma: ')
P('',bold_lead='11.- Competencias laborales y docente de los instructores y/o facilitadores')
table(['Facilitador','Profesión y función formativa','Experiencia docente','Experiencia laboral'],[
 ['Consuelo Belén Ramos Tapia (RUT 19.257.639)','Abogada - tutora experta. Califica con rúbrica la tarea (Parte 2) de la evaluación de los módulos 2 a 5 y entrega retroalimentación escrita individual en el aula virtual en un máximo de 48 horas hábiles; responde las consultas del foro de cada módulo.','Independiente - Abogada relatora curso legislación laboral vigente, 2022-2026.','Estudio jurídico Vía Judicial Chile - Abogada litigante, 2022-2026.'],
 ['Paula Alejandra Sepúlveda Caniuqueo (RUT 17.023.000)','Ingeniera en RRHH - diseñadora instruccional - tutora de seguimiento. Acompaña el avance de cada participante y envía orientaciones de estudio en el aula virtual al cierre de cada módulo y antes de la evaluación final.','Independiente - Diseñadora instruccional de programas de capacitación e-learning para personas adultas, 2017-2026.','Academia Adity - Product Manager, 2017-2022.']],[3.5,6,3.5,4])
P('',bold_lead='12.- Técnicas Metodológicas')
lines(R('tecnicas.txt'))
P('',bold_lead='13.- Material Didáctico')
mat=[('Guía del participante y presentación del curso',2),('Evaluación diagnóstica (formativa)',1),('Microlecciones interactivas SCORM',38),('Caso aplicado del módulo 1 (formativo)',1),('PDF explicativos (fichas y guías)',10),('Resumen y glosario de términos (módulos 1, 2 y 5)',3),('Actividades prácticas SCORM (formativas)',10),('Simulador de remuneraciones 2026 (formativo)',1),('Prácticas formativas de los módulos 2 a 5',4),('Evaluación de módulo Parte 1: cuestionario',5),('Evaluación de módulo Parte 2: tarea con rúbrica de la tutora (módulos 2 a 5)',4),('Evaluación final del curso Parte 1: cuestionario',1),('Evaluación final del curso Parte 2: caso práctico integrador',1)]
table(['Descripción','Cantidad'],[[a,str(b)] for a,b in mat]+[['Totales',str(sum(b for a,b in mat))]],[13,3])
P('',bold_lead='14.- Requisitos Técnicos y Administrativos')
P('40',bold_lead='Requisitos Administrativos, porcentaje asistencia dependiendo de la Modalidad y Curso: ')
P('Texto de requisitos administrativos (promoción del curso):',bold=True,after=3);lines(R('req_admin.txt'))
P('Requisitos Técnicos:',bold=True,after=3);lines(R('req_tecnicos.txt'))
P('Se utilizará plataforma LMS/Aula virtual. Servidor: para asegurar la continuidad operativa del servicio que tiene por objetivo reinicio de plataforma en no menos de 24 horas, respaldo automático de la base de datos de los cursos, up time de 95% y conectividad que permite concurrencia de participantes.',bold_lead='15.- Infraestructura: ')
P('',bold_lead='16.- Material y Equipos')
eq=['Computador o notebook con Windows 10 o superior, o macOS 11 o superior','Procesador de doble núcleo y 4 GB de memoria RAM como mínimo','Conexión a internet de banda ancha de 10 Mbps o superior','Navegador web actualizado (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari)','Parlantes o audífonos para la reproducción de videos y narraciones','Aula virtual Moodle compatible con SCORM, tareas y cuestionarios (no requiere instalar software adicional)']
table(['Descripción','Cantidad'],[[e,'1'] for e in eq]+[['Totales',str(len(eq))]],[13,3])
P('',bold_lead='17.- Valores del Curso')
table(['Ítem','Valor'],[['Costos Facilitador / Instructores / Relatores','25.600'],['Costos Infraestructura','30.000'],['Costos Materiales y Equipos','32.500'],['Costos Administrativos y Generales','75.900'],['Costos Utilidades','166.000'],['La suma de todos los ítems activos','330.000']],[11,5])
P('',bold_lead='Comentario sugerido para el reingreso en SoliCurso')
P(R('comentario.txt'))
P('',bold_lead='Pendientes por completar antes de enviar a SoliCurso')
for x in R('pendientes.txt').split('\n'): doc.add_paragraph(x,style='List Number')
P('',bold_lead='Cambios respecto de la solicitud 1960022')
for x in R('cambios.txt').split('\n'): doc.add_paragraph(x,style='List Bullet')
out=os.path.join(H,'Planilla_SENCE_Legislacion_Laboral_reingreso_1960022.docx');doc.save(out);print('OK',out)

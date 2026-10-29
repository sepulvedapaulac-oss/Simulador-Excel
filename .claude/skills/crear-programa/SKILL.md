---
name: crear-programa
description: Cuando la autora dice «vamos a hacer el curso» y sube el archivo del programa, crea el storyboard en Word desde ese archivo (y, si no hay archivo, redacta también el programa). Crea el programa del curso (de qué se trata, público objetivo, temario por módulo con horas, recursos de cada módulo, caso conductor con elenco diverso, evaluación y aprobación) y su storyboard, ambos en Word. Úsala cuando la autora diga «quiero hacer un curso de…», pida un programa, temario, malla o storyboard, o al iniciar un curso nuevo antes de producir recursos.
---
# Crear el programa y el storyboard del curso

El programa es lo primero que ve la autora: con él aprueba el curso. Después de su aprobación se hace la planilla SENCE (habilidad `codificador-cursos-sence`) y recién entonces se configura y produce el curso (habilidad `crear-curso`).

## 0. Flujo cuando la autora sube el programa (caso habitual)
Cuando la autora dice «vamos a hacer el curso» y sube un archivo (Word, PDF u otro), **ese archivo es el programa**:
1. Conviértelo a `docs/programa/programa.md` respetando su temario, títulos, horas y textos de forma **textual** (sin reformular ni fusionar). No redactes otro programa; si falta algo obligatorio para codificar (público, requisitos, AE, horas, evaluación), anótalo como pendiente y pregúntalo.
2. Crea el **storyboard** (sección 4) desde ese programa y compílalo a Word.
3. En la misma entrega pregunta (AskUserQuestion si está disponible): **¿las evaluaciones Parte 2 de los módulos serán tareas o foros?** (Res. Ex. SENCE N.º 2484 y N.º 2486). Recomienda tareas con rúbrica, que es la preferencia de la autora. Registra la respuesta en `curso.json` → `evaluacion.parte2_modulo` (`"tarea"` o `"foro"`).
4. **Espera la aprobación.** Aprobado el storyboard: planilla SENCE (`codificador-cursos-sence`) → `curso.json` → `"sence"` → configuración (`crear-curso`) → recursos, empezando por la bienvenida (`crear-bienvenida`).

Las secciones 1 a 3 aplican cuando no hay archivo y hay que redactar el programa desde cero.

## 1. Leer antes de escribir
- `docs/estandar-cursos.md` (recursos por defecto, evaluación, redacción, storytelling).
- `docs/plantillas/programa.md` y `docs/plantillas/storyboard.md` (estructura obligatoria).
- `src/ejemplos/programa/programa-haccp.md` (nivel de detalle esperado).
- `.claude/skills/codificador-cursos-sence/SKILL.md` §3 y §5, y `references/reglas-aprendidas.md`: el programa debe quedar listo para codificar (AE, público, requisitos, horas).

## 2. Preguntar lo mínimo
Con lo que diga la autora («quiero hacer un curso de bodega») propón todo lo demás. Pregunta en un solo mensaje (AskUserQuestion si está disponible) solo lo que cambie el programa y no se pueda suponer:
- Público (cargos) y rubro; horas totales y número de módulos (por defecto: 5 módulos, 50 h).
- País y normativa de referencia; organismo capacitador y plataforma (van a `curso.json`: `otec`, `plataforma`).
- Si tiene temario propio. Si lo tiene, sus títulos e ítems se copian textuales, sin reformular ni fusionar.

## 3. Redactar `docs/programa/programa.md`
Copia `docs/plantillas/programa.md` y completa todas las secciones:
- **De qué se trata:** el problema laboral, qué hará la persona al terminar y por qué importa. La normativa se cita con precisión, sin inventar artículos ni cifras.
- **Público objetivo:** cargos específicos del mismo nivel jerárquico + funciones concretas. **Requisitos de ingreso:** solo experiencia, conocimientos o habilidades laborales.
- **Competencia y AE:** un AE por módulo con VERBO + OBJETO + CONDICIÓN, ascenso Bloom, el último con el verbo de la competencia, sin «y» ni «para». En asincrónico, techo «Analizar».
- **Horas:** ascendentes según el nivel del AE (por ejemplo, 8-9-10-11-12 en 50 h), con el desglose de unidades por módulo.
- **Temario y recursos por módulo:** unidades con horas y la tabla de recursos del estándar (4 lecciones con título, voz y herramientas interactivas distintas; video; 2 PDF; resumen y glosario; laboratorios A y B; cuestionario; evaluación ramificada desde el módulo 2; caso Mindsmith), actividad aplicada y evidencia.
- **Caso conductor y storytelling:** empresa ficticia y un elenco de 4 a 6 personas. Reglas:
  - El protagonismo **rota entre módulos** y entre personas de distintos géneros, edades y orígenes. **No siempre una mujer** ni siempre la misma persona.
  - Nadie queda fijo en el rol de quien se equivoca, de quien manda o de quien apoya.
  - Sin estereotipos de rol por género. Nombres variados de la región. Todos los datos son ficticios.
- **Evaluación de cada módulo:** Parte 1 cuestionario (Moodle XML) y Parte 2 tarea con rúbrica corregida por el tutor (o foro, según lo que elija la autora).
- **Evaluación:** diagnóstico SCORM sin nota (5 preguntas por módulo, una por unidad del temario) con gráfico de araña y PDF; evaluación de salida con comparador al final (antes de la evaluación final), con inicio y final en el mismo gráfico y módulos por repasar. Ponderación por defecto: actividades de los módulos 40 % + evaluación final Parte 1 20 % (Moodle XML, 5 preguntas por módulo, 2 puntos cada una, feedback en cada alternativa) + Parte 2 40 % (caso aplicado integrador SCORM). Explica cómo se reparte el 40 % entre módulos, con la aritmética explícita. Aprobación: nota 4,0 en escala de 1,0 a 7,0 con 60 % de exigencia; requisito administrativo de participación 40 % en asincrónico; salvo que la autora defina otra regla.
- **Pendientes para la codificación SENCE** y **referencias** oficiales con enlace.

## 4. Redactar `docs/programa/storyboard.md`
Copia `docs/plantillas/storyboard.md`. Una tabla por recurso, en el orden en que la persona los recorre:
1. Diagnóstico.
2. Por cada módulo: video, lecciones (8 pantallas del flujo estándar), laboratorios, evaluación ramificada y caso Mindsmith.
3. Evaluación de salida con comparador, evaluación final Parte 1 (una fila por pregunta M1.P1…) y Parte 2 (una tarea por módulo).

Cada fila dice qué ve, qué hace y qué escucha la persona, qué feedback recibe y qué imagen o recurso visual usa. La narración se escribe para leerse en voz alta, con números y siglas en palabras.

## 5. Compilar, revisar y entregar
```bash
python3 tools/build_doc.py docs/programa/programa.md docs/programa/storyboard.md
```
1. Convierte a PDF para revisar (`soffice --headless --convert-to pdf`, `pdftoppm`): tablas que no quepan, páginas casi vacías, marcadores `[…]` sin completar.
2. Repasa lo no negociable: lenguaje neutro en género, feedback en todas las alternativas, datos ficticios y que no aparezca la palabra «determinístico».
3. Entrega a la autora los dos .docx (SendUserFile) con un resumen: módulos, horas, AE, elenco y ponderación. Pide aprobación o cambios.
4. Commit y push de `docs/programa/` y `dist/programa/`.

## 6. Después de la aprobación
1. **Planilla SENCE:** habilidad `codificador-cursos-sence`, a partir del programa aprobado (sección 11 de esa habilidad).
2. **Configurar el curso:** habilidad `crear-curso`. Llena `curso.json` y `docs/diseno-curso.md` desde el programa, sin volver a preguntar lo que ya está decidido.
3. Si un cambio posterior toca AE, horas o evaluación, actualiza en el mismo commit el programa, el storyboard, la planilla y el diseño.

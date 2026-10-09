# Simulador de Nivel Excel (Básico · Intermedio · Avanzado)

Plataforma web de **nivelación**: identifica el nivel de Excel de cada alumno para **recomendarle qué curso tomar**, mediante **actividades prácticas en un entorno similar a Microsoft Excel**: cinta de opciones, barra de fórmulas, celdas, hojas, fórmulas en español, gráficos, tablas dinámicas, filtros, escenarios, controles de formulario y macros.

- **Alumno** (`index.html`): se identifica con **nombre, apellido y correo**, resuelve las actividades de los tres niveles y al final ve su **curso recomendado** y su perfil por nivel. No hay nota de aprobación.
- **Docente** (`admin.html`): ve el listado de todos los alumnos con nombre, apellido, correo, **curso recomendado**, nivel identificado y % logrado por nivel, más el detalle de cada actividad (incluye las que el alumno marcó "No sé hacerlo"). Puede descargarlo en CSV para abrirlo en Excel.
- Los resultados también quedan en una **planilla de Google Sheets** de su cuenta.

No necesita Lovable ni servidores pagados: funciona con **GitHub Pages** (gratis) y **Google Sheets** (gratis).

---

## ¿Cómo se evalúa?

| Nivel | Actividades | Basado en |
|---|---|---|
| Básico | 11 (10 prácticas + 1 de preguntas rápidas) | Curso *Herramientas de Microsoft Excel nivel básico* (módulos 1 a 9) |
| Intermedio | 13 (12 prácticas + 1 de preguntas rápidas) | Curso *nivel intermedio* (módulos 1 a 8) |
| Avanzado | 11 (10 prácticas + 1 de preguntas rápidas) | Curso *nivel avanzado* (módulos 1 a 7) |

- El alumno rinde **Básico → Intermedio → Avanzado**. No hay "aprobado" ni "reprobado". Si no conoce un tema, presiona **No sé hacerlo** y sigue; al terminar un nivel puede continuar o terminar y ver su recomendación.
- Cada actividad práctica se corrige automáticamente revisando **lo que el alumno hizo en la planilla**: valores, si usó fórmulas (y cuáles), referencias absolutas, formatos, reglas, gráficos, tablas dinámicas, etc. En varias actividades se cambian los datos "por detrás" para comprobar que las fórmulas funcionan de verdad y no son valores escritos a mano.
- **Curso recomendado** = el primer nivel que el alumno todavía no domina. Internamente se considera que "domina" un nivel cuando logra el 70 % de sus actividades (valor `MASTERY_PERCENT`, ajustable). El alumno ve un perfil cualitativo por nivel: *Lo domina*, *Conocimiento parcial* o *Por aprender*.

### Contenidos evaluados

**Básico:** ingreso y corrección de datos · fórmulas y controlador de relleno · referencias absolutas · SUMA, PROMEDIO, MAX, MIN, CONTAR, CONTARA · formato de celdas (negrita, relleno, alineación, moneda, porcentaje, bordes) · formato condicional · hojas, insertar columnas, inmovilizar paneles · buscar y reemplazar, comentarios · ordenar · filtro automático.

**Intermedio:** nombres de rango · DIA, MES, AÑO, HOY · IZQUIERDA, DERECHA, LARGO, NOMPROPIO, CONCATENAR · ENTERO, REDONDEAR, TRUNCAR · BUSCARV · CONTAR.SI y SUMAR.SI · SI, Y, SI anidado · gráficos de columnas y circular · tablas dinámicas · ordenamiento por varios niveles · validación de datos · auditoría de fórmulas y SI.ERROR.

**Avanzado:** funciones anidadas · INDICE + COINCIDIR · SUMAR.SI.CONJUNTO / CONTAR.SI.CONJUNTO · administrador de escenarios · consolidación de datos de varias hojas · filtro avanzado con criterios Y/O · formularios con cuadro combinado y control de número · crear y ejecutar macros (grabadas o escritas en VBA) · corregir código VBA · tablas dinámicas de doble entrada.

### Macros y alumnos que ya saben Excel

- **Programador > Visual Basic (Alt+F11)** abre un editor de VBA real: se puede escribir, modificar y ejecutar código (F5). El simulador interpreta VBA habitual: `Range`, `Cells`, `Selection`, `ActiveCell`, `Offset`, `.Value`, `.Formula`, `.Font`, `.Interior`, `.HorizontalAlignment`, `.NumberFormat`, `With`, `For`, `For Each`, `If/ElseIf/Else`, `Do/Loop`, `MsgBox`, `WorksheetFunction`, `RGB`, `vbRed`, etc. Muestra errores de compilación y de ejecución con número de línea, como Excel.
- La **grabadora** genera el mismo código que Excel e incluye la opción **Usar referencias relativas**.
- Las macros se corrigen **por lo que hacen**: el simulador ejecuta la macro del alumno en una copia del libro y revisa el resultado, así que da igual si la grabó o la escribió a mano.
- Se aceptan los atajos de experto: Ctrl+1 (Formato de celdas), Alt+F11, Alt+F8, Ctrl+Shift+L (filtro), Alt+= (autosuma), F4 (referencias absolutas), Ctrl+Shift+$ y Ctrl+Shift+%. En general, la corrección revisa el **resultado** y no el camino usado.

---

## Puesta en marcha (≈ 15 minutos, una sola vez)

### Paso 1 · Publicar el simulador con GitHub Pages

1. En GitHub abra el repositorio **Simulador-Excel** → **Settings** → **Pages**.
2. En *Build and deployment* elija **Deploy from a branch**, seleccione la rama donde está este código (por ejemplo `main`) y la carpeta **/ (root)**. Guarde.
3. En uno o dos minutos aparecerá la dirección, por ejemplo:
   - Alumnos: `https://sepulvedapaulac-oss.github.io/Simulador-Excel/`
   - Panel docente: `https://sepulvedapaulac-oss.github.io/Simulador-Excel/admin.html`

> Hasta completar el Paso 2 el simulador funciona en **modo demostración**: los resultados se guardan solo en el navegador donde se rindió la evaluación.

### Paso 2 · Recibir los resultados en Google Sheets

1. Cree una **hoja de cálculo nueva** en Google Drive (por ejemplo "Resultados Simulador Excel").
2. En la hoja: menú **Extensiones → Apps Script**.
3. Borre el código que aparece y pegue el contenido del archivo [`backend/Code.gs`](backend/Code.gs).
4. En la línea `const ADMIN_KEY = 'CAMBIE-ESTA-CLAVE';` escriba **su propia clave** (la usará para entrar al panel docente). Guarde (💾).
5. Botón **Implementar → Nueva implementación** → ícono ⚙ → **Aplicación web**:
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier usuario**
   - Presione **Implementar** y autorice el acceso con su cuenta de Google.
6. Copie la **URL de la aplicación web** (termina en `/exec`).
7. En GitHub abra `js/config.js`, presione ✏️ (editar) y pegue la URL:
   ```js
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```
   Guarde con **Commit changes**.

Listo: cada alumno que rinda la evaluación aparecerá en la pestaña **Resultados** de su planilla y en el **panel docente** (`admin.html`, ingresando su clave). La fila se crea al comenzar (estado *En curso*) y se actualiza al terminar cada nivel.

> Si más adelante modifica `Code.gs`, use **Implementar → Administrar implementaciones → Editar → Nueva versión** para mantener la misma URL.

### Paso 3 · Compartir con los alumnos

Envíe a los alumnos solo el enlace del simulador (no el de `admin.html`).

---

## Ajustes (archivo `js/config.js`)

| Opción | Para qué sirve | Valor inicial |
|---|---|---|
| `ORG_NAME` | Nombre que aparece en el encabezado | `Tremen Partner` |
| `APPS_SCRIPT_URL` | URL de Google Apps Script (Paso 2) | vacío |
| `MASTERY_PERCENT` | Uso interno: % desde el que se considera que domina un nivel (define el curso recomendado; el alumno no lo ve como nota) | `70` |
| `TIME_LIMITS` | Minutos por nivel (`0` = sin límite) | 30 / 40 / 45 |
| `SHOW_DETAIL_TO_STUDENT` | Mostrar al alumno el detalle por actividad | `true` |

Las actividades están en `js/tasks.js` (datos, instrucciones y criterios de corrección de cada una).

---

## Qué puede hacer el alumno dentro del simulador

- Escribir datos y fórmulas en español (`=SUMA(A1:A5)`, `=SI(B2>=4;"Aprobado";"Reprobado")`, `=BUSCARV(...)`…), con ayuda de sintaxis y autocompletado de funciones.
- Hacer clic en celdas mientras escribe una fórmula para insertar referencias (también de otras hojas), **F4** para referencias absolutas.
- Copiar/cortar/pegar, **controlador de relleno** (series y fórmulas), deshacer/rehacer, atajos (Ctrl+B, Ctrl+Z, Ctrl+L…).
- Cinta de opciones: **Inicio, Insertar, Fórmulas, Datos, Revisar, Vista, Programador** (formato, formato condicional, insertar/eliminar filas y columnas, gráficos, tablas dinámicas, comentarios, nombres, auditoría, ordenar, filtros, filtro avanzado, validación, consolidar, escenarios, proteger hoja, inmovilizar paneles, macros y controles de formulario).

---

## Estructura

```
index.html        Simulador para alumnos
admin.html        Panel docente
backend/Code.gs   Google Apps Script (guardar y leer resultados)
js/config.js      Configuración
js/tasks.js       Banco de actividades y corrección
js/formula.js     Motor de fórmulas (español)
js/vba.js         Intérprete de VBA para las macros
js/workbook.js    Modelo del libro (ordenar, filtrar, tablas dinámicas, …)
js/sheetui.js     Interfaz tipo Excel
js/app.js         Flujo del alumno
js/admin.js       Panel docente
js/storage.js     Envío/lectura de resultados
tests/            Pruebas automáticas (Playwright)
```

### Pruebas

```bash
python3 -m http.server 8765          # en la carpeta del proyecto
node tests/run.js                    # cada actividad: 0 % vacía y 100 % con la solución
node tests/ui.js                     # recorrido completo usando la interfaz
node tests/smoke.js                  # todos los botones de la cinta, deshacer, recarga
node tests/expert.js                 # Ctrl+1, "No sé hacerlo", VBA escrito a mano, grabadora relativa
```

# Resultados en Excel (OneDrive / SharePoint) con Power Automate

Con esta opción, cada evaluación queda como una fila en un **archivo Excel** de su OneDrive o SharePoint, y (opcionalmente) también se ve en el **Panel docente**.

> **Licencia necesaria.** El disparador **"Cuando se recibe una solicitud HTTP"** y la acción **"Respuesta"** de Power Automate son **Premium**. Necesita **Power Automate Premium** (o un plan de Microsoft 365 / Dynamics que lo incluya). Para revisarlo: en make.powerautomate.com, al agregar el disparador, si aparece el sello **"Premium"** y su cuenta no lo tiene, Power Automate le avisará al guardar.
> Si no cuenta con esa licencia, use la opción gratuita de Google Sheets (README, Paso 2B). El simulador funciona igual con ambas: lo único que cambia es dónde quedan guardados los resultados.

---

## Paso 1 · Subir el archivo Excel

1. Descargue [`Resultados-Simulador.xlsx`](Resultados-Simulador.xlsx) (botón **Download raw file** en GitHub).
2. Súbalo a su **OneDrive** (o a una biblioteca de SharePoint), por ejemplo en la raíz de *Mis archivos*.
3. No cambie el nombre de la tabla (**Resultados**) ni los encabezados de las columnas.

## Paso 2 · Flujo "Simulador · Guardar resultado"

En **https://make.powerautomate.com** → **Crear** → **Flujo de nube instantáneo** → *Omitir* → nombre: `Simulador · Guardar resultado`.

**2.1 Disparador:** busque **"Cuando se recibe una solicitud HTTP"** (Request).
- *Quién puede desencadenar el flujo*: **Cualquiera**.
- *Esquema JSON del cuerpo de la solicitud*: pegue esto:

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "fechaInicio": { "type": "string" },
    "fechaTermino": { "type": "string" },
    "nombre": { "type": "string" },
    "apellido": { "type": "string" },
    "correo": { "type": "string" },
    "estado": { "type": "string" },
    "cursoRecomendado": { "type": "string" },
    "nivel": { "type": "string" },
    "recomendacion": { "type": "string" },
    "basico": {},
    "intermedio": {},
    "avanzado": {},
    "duracionMin": {},
    "detalle": { "type": "string" }
  }
}
```

**2.2 Acción "Actualizar una fila"** (conector **Excel Online (Business)**; con una cuenta personal use **Excel Online (OneDrive)**):
- Ubicación: *OneDrive para la Empresa* · Biblioteca: *OneDrive* · Archivo: `Resultados-Simulador.xlsx` · Tabla: `Resultados`
- Columna de clave: **ID evaluación** · Valor de clave: contenido dinámico **id**
- Complete cada columna con el contenido dinámico del mismo nombre:

| Columna en Excel | Contenido dinámico |
|---|---|
| Fecha inicio | fechaInicio |
| Fecha término | fechaTermino |
| Nombre | nombre |
| Apellido | apellido |
| Correo | correo |
| Estado | estado |
| Curso recomendado | cursoRecomendado |
| Nivel identificado | nivel |
| Recomendación | recomendacion |
| % Básico | basico |
| % Intermedio | intermedio |
| % Avanzado | avanzado |
| Duración (min) | duracionMin |
| Detalle (JSON) | detalle |

**2.3 Acción "Agregar una fila a una tabla"** (mismo archivo y tabla). Complete las mismas columnas y además **ID evaluación** = **id**.
- En los **…** de esta acción → **Configurar ejecución posterior** → marque solo **"ha fallado"** (desmarque "se realizó correctamente").
  *Así: si el alumno ya tenía una fila, se actualiza; si no, se agrega una nueva.*

**2.4 Acción "Respuesta"**:
- Código de estado: `200`
- Encabezados: `Access-Control-Allow-Origin` = `*`
- Cuerpo: `{"ok": true}`
- En los **…** → **Configurar ejecución posterior** → marque **"se realizó correctamente"** y **"se omitió"**.

**2.5** Guarde el flujo. Abra de nuevo el disparador y **copie la "URL de HTTP POST"**.

## Paso 3 · Configurar el simulador

En GitHub abra `js/config.js`, presione ✏️ y complete:

```js
BACKEND: 'microsoft',
POWER_AUTOMATE_SAVE_URL: 'https://...pegue aquí la URL del Paso 2.5...',
EXCEL_RESULTS_URL: 'https://...enlace al archivo Excel (Compartir > Copiar vínculo)...',
```

Guarde con **Commit changes**. Desde ese momento, cada alumno que comience la evaluación aparecerá en el Excel (estado *En curso*) y su fila se actualizará al terminar.

## Paso 4 (opcional) · Flujo "Simulador · Listar resultados" para el Panel docente

Sin este flujo, el Panel docente le muestra un botón para **abrir el Excel**. Con él, además verá la tabla con buscador, filtros y detalle por alumno.

1. Nuevo flujo instantáneo con disparador **"Cuando se recibe una solicitud HTTP"**, *Quién puede desencadenar*: **Cualquiera**, esquema:
   ```json
   { "type": "object", "properties": { "key": { "type": "string" } } }
   ```
2. **Condición**: `key` **es igual a** `SU-CLAVE` (invente una clave; será la clave del Panel docente).
3. En **Si es verdadero**:
   - **Enumerar filas presentes en una tabla** (mismo archivo y tabla `Resultados`). En **…** → **Configuración** → active **Paginación** con umbral `5000`.
   - **Respuesta**: código `200`; encabezados `Access-Control-Allow-Origin` = `*` y `Content-Type` = `application/json`; cuerpo: contenido dinámico **value** de "Enumerar filas presentes en una tabla".
4. En **Si es falso**: **Respuesta** con código `401`, encabezado `Access-Control-Allow-Origin` = `*`, cuerpo `{"ok": false, "error": "Clave incorrecta"}`.
5. Guarde, copie la URL HTTP POST y péguela en `js/config.js`:
   ```js
   POWER_AUTOMATE_LIST_URL: 'https://...',
   ```

## Comprobar que funciona

1. Abra el simulador, ingrese un nombre de prueba y comience.
2. En Power Automate → *Mis flujos* → **Simulador · Guardar resultado** → *Historial de ejecuciones*: debe aparecer una ejecución correcta.
3. Abra el Excel: debe haber una fila con el nombre de prueba.

**Si no aparece nada:** en el navegador presione F12 → *Consola* y revise si hay un error. Los más comunes:
- *401/403*: en el disparador no quedó **"Cualquiera"** en "Quién puede desencadenar el flujo".
- *Error de CORS*: falta el encabezado `Access-Control-Allow-Origin: *` en la acción **Respuesta**.
- *La fila no se crea*: revise que **Agregar una fila** tenga "Configurar ejecución posterior" = **ha fallado**.

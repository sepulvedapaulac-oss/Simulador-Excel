L.first=['hook','tf','cls','ord','sim','caso1','caso2c'];
L.TF=[
 ['Los archivos guardados en Drive u OneDrive se pueden abrir desde distintos dispositivos con una cuenta autorizada.',1,'Verdadero. Es la ventaja de guardar en la nube: el archivo no depende de un solo computador o teléfono.'],
 ['En la nube ya no es necesario organizar carpetas, porque el buscador encuentra todo.',0,'Falso. El buscador ayuda, pero sin carpetas y nombres claros aparecen duplicados y nadie sabe cuál es la versión vigente.'],
 ['Varias personas pueden trabajar sobre el mismo archivo compartido sin enviarse copias.',1,'Verdadero. La edición colaborativa mantiene una sola versión común.'],
 ['Al compartir un archivo, todas las personas reciben siempre permiso de edición.',0,'Falso. Quien comparte elige el permiso: ver, comentar o editar, según la tarea de cada persona.'],
 ['Ambos servicios guardan un historial de versiones que permite recuperar cambios anteriores.',1,'Verdadero. Drive y OneDrive conservan versiones anteriores de los archivos, lo que permite revisar o restaurar cambios.']
];
L.Q=[
 {q:'¿Qué nombre de archivo sigue mejor una convención clara?',o:['2026-10_ListaPrecios_Proveedores.xlsx','Lista precios FINAL2.xlsx','nueva definitiva (1).xlsx','Documento sin título.xlsx'],c:0,f:'Año y mes al inicio, luego contenido y detalle: el archivo se ordena solo y se entiende sin abrirlo.'},
 {q:'Un proveedor necesita consultar la lista de precios. ¿Qué permiso corresponde?',o:['Editar.','Compartirle la contraseña de la cuenta.','Ver (solo lectura).','Propietario del archivo.'],c:2,f:'Si la tarea es consultar, el permiso de lectura evita cambios accidentales.'},
 {q:'¿Cuál es el primer paso para ordenar un espacio de trabajo en la nube?',o:['Asignar permisos a todo el equipo.','Hacer un inventario de documentos y de quién los usa.','Mover todos los archivos sin revisarlos.','Crear una carpeta por persona.'],c:1,f:'Primero se identifica qué documentos existen y quién los usa; sin inventario, se migra el desorden.'},
 {q:'¿Qué agrega la verificación en dos pasos a una cuenta?',o:['Una copia de seguridad automática de los archivos.','Permiso de edición para todo el equipo.','Una contraseña más corta y fácil de recordar.','Un segundo factor, además de la contraseña, para iniciar sesión.'],c:3,f:'La verificación en dos pasos pide un segundo factor (por ejemplo, un código en el celular), así que una contraseña filtrada no basta para entrar.'},
 {q:'Una persona deja la empresa. ¿Qué corresponde hacer con sus accesos?',o:['Mantenerlos por si vuelve.','Retirar los accesos que ya no necesita y dejar los archivos en cuentas del negocio.','Eliminar todas las carpetas que usaba.','Compartirle los archivos con un enlace público.'],c:1,f:'Se entrega el acceso necesario para trabajar, no más; cuando ya no se necesita, se retira y la información queda en cuentas del negocio.'}
];
L.YN=[
 ['¿“precios FINAL2.xlsx” permite reconocer el contenido y la fecha sin abrir el archivo?',0,'No. Le falta la fecha y el detalle; con la convención sería, por ejemplo, 2026-10_ListaPrecios_Proveedores.xlsx.'],
 ['¿Conviene mantener un enlace “cualquier persona con el enlace” para documentos internos?',0,'No. Si el enlace se reenvía, cualquiera podría abrirlo. Para información interna, usa acceso restringido.'],
 ['¿Hay que retirar el acceso de edición de quien ya no trabaja en la empresa?',1,'Sí. El acceso se entrega según la necesidad; si ya no la tiene, se retira.'],
 ['¿El permiso de cada persona debe corresponder a su tarea (ver, comentar o editar)?',1,'Sí. Así se reduce el riesgo de cambios accidentales o de exponer información.'],
 ['¿Es buena práctica que todo el equipo use la misma contraseña para la cuenta del negocio?',0,'No. Lo recomendable son cuentas individuales con contraseñas robustas y verificación en dos pasos.']
];

/* Lección 3.1 · Limpiar la tabla: cada celda marcada se corrige eligiendo la acción adecuada */
(function(){
const ROWS=[
 ['EMP-101','Ventas','2026-10','900.000','4','45.000','Vigente'],
 ['EMP-102','Ventas ','2026-10','720.000','10','0','Vigente'],
 ['EMP-103','PLANTA','2026-10','1.080.000','12','50.000','Vigente'],
 ['EMP-104','Bodega','2026-10','810.000','8','40.000','Vigente'],
 ['EMP-104','Bodega','2026-10','810.000','8','40.000','Vigente'],
 ['EMP-105','Planta','2026-10','“1.440.000 ”','8','0','Vigente'],
 ['EMP-106','','2026-10','1.260.000','0','0','Ingreso'],
 ['TOTAL','','2026-10','7.020.000','50','175.000','']];
/* Problemas: fila, columna, valor corregido, pregunta, opciones, correcta, explicación */
const P=[
 {r:1,c:1,fix:'Ventas',t:'“Ventas ” tiene un espacio al final',q:'Si no se corrige, la IA y las tablas dinámicas contarán “Ventas” y “Ventas ” como dos áreas distintas. ¿Qué haces?',
  o:['Dejarlo así: se ve igual.','Quitar los espacios sobrantes con =ESPACIOS() y unificar el área.','Borrar la fila.'],k:1,
  why:'Con =ESPACIOS(B3) el área queda “Ventas” y se agrupa bien. Los espacios invisibles son una causa frecuente de totales por área mal calculados.'},
 {r:2,c:1,fix:'Planta',t:'“PLANTA” está en mayúsculas',q:'Las demás filas dicen “Planta”. ¿Cómo lo resuelves?',
  o:['Unificar al formato del maestro de áreas (“Planta”) o usar una lista validada.','Cambiar todas las áreas a mayúsculas a mano.','Crear un área nueva llamada “PLANTA”.'],k:0,
  why:'El valor válido sale del maestro de áreas. Una lista desplegable validada evita que el problema se repita el próximo mes.'},
 {r:4,c:0,fix:'(duplicado eliminado)',row:true,t:'EMP-104 aparece dos veces con los mismos datos',q:'Los dos registros son idénticos. ¿Qué haces?',
  o:['Dejar ambos: más datos es mejor.','Verificar en el sistema que es una duplicación de la exportación y eliminar uno, dejando registro.','Sumar los dos montos en una sola fila.'],k:1,
  why:'Primero se confirma que es un duplicado de la exportación (y no dos pagos reales). Luego se elimina uno y se anota en el registro de limpieza. =CONTAR.SI($A$2:$A$9;A2)>1 los detecta.'},
 {r:5,c:3,fix:'1.440.000',t:'El sueldo base está guardado como texto',q:'La celda tiene comillas y un espacio: Excel no la suma. ¿Qué haces?',
  o:['Convertirla a número y comprobar que el total de la columna cambie.','Dejarla: la IA entiende el texto.','Borrar el sueldo de esa persona.'],k:0,
  why:'Un monto como texto queda fuera de las sumas sin avisar. Al convertirlo a número, el total de sueldos sube $1.440.000 y vuelve a cuadrar con el sistema.'},
 {r:6,c:1,fix:'Finanzas',t:'EMP-106 no tiene área',q:'Es un ingreso de octubre y el área está vacía. ¿Cómo la completas?',
  o:['Inventar el área más probable.','Completarla desde el maestro de personal con BUSCARX por código.','Dejarla vacía.'],k:1,
  why:'El dato se completa desde la fuente: el maestro de personal indica “Finanzas”. Nunca se adivina; si no está en el maestro, se consulta.'},
 {r:7,c:0,fix:'(fila de total eliminada)',row:true,t:'Una fila “TOTAL” está mezclada con los datos',q:'Si queda en la base, ¿qué pasa?',
  o:['Nada, ayuda a revisar.','Se suma dos veces: duplica el costo total en cualquier análisis. Hay que quitarla de la base.','La IA la ignora automáticamente.'],k:1,
  why:'Las filas de subtotal o total se eliminan de la base de análisis; los totales se calculan aparte con fórmulas.'}];
let done=null,solved=new Set(),cur=null,S=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(){const tb=document.querySelector('#cleanRoot tbody');
  tb.innerHTML=ROWS.map((row,r)=>{const rowFixed=P.some((p,i)=>p.row&&p.r===r&&solved.has(i));
    return `<tr class="${rowFixed?'gone':''}">${row.map((v,c)=>{const pi=P.findIndex(p=>p.r===r&&p.c===c);const num=c>=3&&c<=5;
      if(pi<0)return `<td class="${num?'n':''}">${esc(v)}</td>`;
      const ok=solved.has(pi);const shown=ok&&!P[pi].row?P[pi].fix:(v===''?'(vacío)':v);
      return `<td class="${num?'n':''}"><button type="button" class="cbtn ${ok?'ok':''} ${cur===pi?'sel':''}" data-p="${pi}" ${ok?'disabled':''} aria-label="Celda con problema: ${esc(P[pi].t)}">${esc(shown)}</button></td>`}).join('')}</tr>`}).join('');
  tb.querySelectorAll('.cbtn:not(.ok)').forEach(b=>b.addEventListener('click',()=>open(+b.dataset.p)))}
function open(i){cur=i;render();const p=P[i],pan=document.querySelector('#cleanRoot .clean-panel');
  pan.innerHTML=`<h4>${esc(p.t)}</h4><p style="margin:0">${p.q}</p><div class="options">${p.o.map((o,j)=>`<button class="opt" type="button" data-j="${j}"><span class="letter">${'ABC'[j]}</span><span>${esc(o)}</span></button>`).join('')}</div><div class="cfb"></div>`;
  pan.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>pick(i,+b.dataset.j,b)));
  pan.scrollIntoView({behavior:'smooth',block:'nearest'})}
function pick(i,j,btn){const p=P[i],pan=document.querySelector('#cleanRoot .clean-panel'),fb=pan.querySelector('.cfb');const key='limpia'+i;
  if(!(key in S.first))S.first[key]=j===p.k;
  if(j===p.k){solved.add(i);cur=null;render();
    pan.innerHTML=`<div class="feedback good"><strong>✓ Corregido.</strong> <span class="fb-body">${p.why}</span></div>`+(solved.size<P.length?`<p class="hint" style="margin:8px 0 0">Quedan ${P.length-solved.size} problemas por corregir.</p>`:'<div class="ok-row" style="margin-top:8px">✓ ¡Base limpia! 6 registros válidos, sin duplicados ni filas de total. Ahora sí puede cuadrarse con el sistema.</div>');
    const t=document.querySelector('#cleanRoot .tick');t.textContent=`${solved.size} / ${P.length}`;
    if(solved.size===P.length){document.querySelector('#cleanRoot .task').classList.add('ok');done('limpiar')}}
  else{btn.classList.add('bad');fb.innerHTML=`<div class="feedback bad"><strong>Revisa esa opción.</strong> <span class="fb-body">${j===0&&p.k!==0?'Ese problema no se resuelve solo: afecta los totales o la agrupación.':'Esa acción no corrige la causa del problema o pierde información.'} Elige otra alternativa.</span></div>`}}
Object.assign(window.LESSON,{init(api){done=api.done;S=api.S;if(document.getElementById('cleanRoot'))render()}});
})();

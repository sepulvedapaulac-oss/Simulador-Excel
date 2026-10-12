/* Lección 4.4 · Rúbrica de autoevaluación del proyecto integrador */
(function(){
const R=[
 {t:'1 · Problema y objetivo',lv:[
   ['Inicial','“Queremos usar IA” sin un problema medido.','Escribe el problema con cifras: horas al mes, errores o reclamos. Sin eso, la gerencia no puede dimensionar el beneficio.'],
   ['En desarrollo','Problema claro, pero sin cifras.','Agrega la línea base: cuántas horas y cuántos errores hoy. Será tu punto de comparación.'],
   ['Logrado','Problema medido y objetivo concreto.','Bien: un problema medido permite mostrar el resultado del piloto con evidencia.']]},
 {t:'2 · Datos y protección',lv:[
   ['Inicial','Usa datos personales completos o una herramienta no autorizada.','Revisa el Módulo 1: herramienta autorizada, datos mínimos, códigos en vez de nombres y RUT.'],
   ['En desarrollo','Protege los datos, pero no define cuáles son los mínimos.','Lista las columnas que realmente necesita la tarea y elimina el resto.'],
   ['Logrado','Datos mínimos, seudonimizados y herramienta autorizada.','Bien: la protección de datos está resuelta desde el diseño.']]},
 {t:'3 · Herramienta y control humano',lv:[
   ['Inicial','La IA decide o calcula lo oficial sin revisión.','Ubica un punto de control humano antes de cargar o pagar, y deja el cálculo oficial en el sistema.'],
   ['En desarrollo','Hay revisión, pero después del pago o sin responsable.','Mueve el control antes del pago y nombra a la persona responsable y a su reemplazo.'],
   ['Logrado','Herramienta más simple, control antes del pago y responsable definido.','Bien: la IA asiste, el sistema calcula y una persona decide.']]},
 {t:'4 · Indicadores',lv:[
   ['Inicial','Sin indicador o solo la opinión del equipo.','Define al menos un indicador de tiempo y uno de calidad, como horas al mes y errores detectados.'],
   ['En desarrollo','Indicador definido, pero sin línea base ni meta.','Agrega el valor actual y la meta del piloto, por ejemplo de 8 a 3 horas al mes.'],
   ['Logrado','Indicadores con línea base, meta y plazo.','Bien: podrás demostrar el resultado con cifras.']]},
 {t:'5 · Plan y riesgos',lv:[
   ['Inicial','Implementación completa de una vez, sin piloto.','Parte con un piloto corto, con datos ficticios primero, y amplía solo si funciona.'],
   ['En desarrollo','Hay piloto, pero no se identifican riesgos ni aprobaciones.','Agrega las aprobaciones necesarias (jefatura, Tecnología, protección de datos) y qué harás si algo falla.'],
   ['Logrado','Piloto por etapas, aprobaciones y plan ante fallas.','Bien: el proyecto está listo para presentarse.']]}];
Object.assign(window.LESSON,{init(api){const root=document.getElementById('rubRoot');if(!root)return;const {done}=api;
  const sel={},box=root.querySelector('.rub'),sum=root.querySelector('.rub-sum'),tick=root.querySelector('.tick'),task=root.querySelector('.task');
  box.innerHTML=R.map((r,i)=>`<div class="rub-row" data-i="${i}"><h4>${r.t}</h4><div class="rub-lv" role="group" aria-label="${r.t}">${r.lv.map((l,j)=>`<button type="button" data-j="${j}"><b>${l[0]}</b>${l[1]}</button>`).join('')}</div><div class="rub-tip"></div></div>`).join('');
  box.querySelectorAll('.rub-row').forEach(row=>{const i=+row.dataset.i;row.querySelectorAll('.rub-lv button').forEach(b=>b.addEventListener('click',()=>{const j=+b.dataset.j;sel[i]=j;
    row.querySelectorAll('.rub-lv button').forEach(x=>{x.classList.toggle('sel',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});
    row.querySelector('.rub-tip').innerHTML=`<div class="${j===2?'ok-row':'alert-row'}">${j===2?'✓':'→'} ${R[i].lv[j][2]}</div>`;
    const n=Object.keys(sel).length;tick.textContent=`${n} / ${R.length}`;
    if(n===R.length){task.classList.add('ok');const pts=Object.values(sel).reduce((a,v)=>a+v+1,0),max=R.length*3;
      const msg=pts>=13?'Tu proyecto está listo para presentarse. Revisa los detalles marcados y llévalo a tu jefatura.':pts>=9?'Tu proyecto va bien encaminado. Aplica las recomendaciones de los criterios en desarrollo antes de presentarlo.':'Tu proyecto necesita ajustes. Vuelve al constructor y usa las recomendaciones de cada criterio.';
      sum.innerHTML=`<div class="callout"><strong>Resultado de tu autoevaluación: ${pts} de ${max} puntos.</strong> ${msg}</div>`;done('rubrica')}}))})}});
})();

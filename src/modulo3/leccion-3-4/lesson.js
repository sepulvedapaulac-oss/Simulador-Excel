/* Lección 3.4 · Editor de informe: marcar las frases que deben corregirse */
(function(){
const S_=[
 {t:'En octubre, el costo de remuneraciones fue de $537,9 M, un 8,0 % más que en septiembre ($498,0 M).'},
 {t:'Este incremento se explica principalmente por el reajuste salarial de 2 %.',bad:'Cifra errónea',why:'El reajuste aporta $9,2 M de $39,9 M (23 %). El efecto principal son los bonos (+$18,6 M).',rw:'Casi la mitad del incremento ($18,6 M) corresponde al bono anual de cumplimiento; el reajuste aporta $9,2 M.'},
 {t:'El bono anual de cumplimiento, un pago único de octubre, aportó $18,6 M.'},
 {t:'Ingresaron 8 personas netas, entre ellas la nueva gerenta de Finanzas, con un sueldo de $4,2 M.',bad:'Dato personal identificable',why:'Un cargo único con su sueldo identifica a la persona. El informe solo necesita el efecto agregado.',rw:'Ingresaron 8 personas netas, con un efecto de $8,8 M en el costo del mes.'},
 {t:'Las horas extra de Planta aumentaron 18 %, seguramente por mala planificación de la jefatura.',bad:'Juicio sin evidencia',why:'Atribuye una causa negativa a personas sin respaldo. La causa informada es un pedido especial, aún por confirmar.',rw:'Las horas extra de Planta aumentaron 18 % (+$3,2 M); Operaciones informa un pedido especial, por confirmar.'},
 {t:'El costo por trabajador disminuyó gracias a los nuevos ingresos.',bad:'Cifra errónea',why:'Subió de $1.208.738 a $1.280.667 por persona.',rw:'El costo promedio por persona subió de $1,21 M a $1,28 M, principalmente por el bono anual.'},
 {t:'Según la Circular N.º 3.214 de la Dirección del Trabajo, estas variaciones son normales en el segundo semestre.',bad:'Referencia sin respaldo',why:'Es una referencia con apariencia oficial que nadie verificó. Si no existe en la fuente oficial, se elimina.',rw:'(Frase eliminada: no hay una norma que respalde esa afirmación.)'},
 {t:'Sin el bono anual, el costo de noviembre se estima cerca de $519 M (+4 % respecto de septiembre).'},
 {t:'Se recomienda confirmar con Operaciones si el pedido especial continúa en noviembre.'},
 {t:'Fuente: base de remuneraciones cuadrada con el sistema, octubre 2026. Datos ficticios.'}];
Object.assign(window.LESSON,{init(api){const box=document.getElementById('memoText');if(!box)return;
  const total=S_.filter(s=>s.bad).length;let found=0;const msg=document.querySelector('#memoRoot .memo-msg'),fix=document.querySelector('#memoRoot .fixbox');
  box.innerHTML='<p style="margin:0">'+S_.map((s,i)=>`<button type="button" class="sent" data-i="${i}">${s.t}</button>`).join(' ')+'</p>';
  box.querySelectorAll('.sent').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i,s=S_[i],key='memo'+i;
    if(b.classList.contains('flag')||b.classList.contains('okc'))return;
    if(!(key in api.S.first))api.S.first[key]=!!s.bad;
    if(s.bad){b.classList.add('flag');found++;
      fix.insertAdjacentHTML('beforeend',`<div class="fix"><span class="tagp">${s.bad}</span><div>${s.why}</div><div class="rw"><b>Versión corregida:</b> ${s.rw}</div></div>`);
      document.querySelector('#memoRoot .tick').textContent=`${found} / ${total}`;
      msg.innerHTML=found===total?'<div class="ok-row">✓ ¡Borrador corregido! Las cinco frases quedaron con su versión verificada. El resto del informe se mantiene: son hechos con fuente o hipótesis bien planteadas.</div>':`<p class="hint" style="margin:0">Encontraste ${found} de ${total}.</p>`;
      if(found===total){document.querySelector('#memoRoot .task').classList.add('ok');api.done('memo')}}
    else{b.classList.add('okc');msg.innerHTML='<div class="feedback good" style="margin:0"><strong>Esta frase está bien.</strong> <span class="fb-body">Es un hecho verificado con la base o una recomendación bien planteada. Busca las que tienen cifras erróneas, juicios, datos personales o referencias sin respaldo.</span></div>'}}))}});
})();

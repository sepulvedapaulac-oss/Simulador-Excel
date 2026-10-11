/* Ganchos propios de la Lección 2.1 */
Object.assign(window.LESSON,{
  builderRender:{
    ficha(vals,cfg){
      const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      const tips={
        1:'Agrega más fuentes: la liquidación sola no muestra novedades faltantes, horas sin respaldo ni cambios de parámetros.',
        2:'Las reglas deben ser explícitas y verificadas por ti en la fuente oficial del período; la IA no debe suponerlas.',
        3:'Entrega solo lo que cada regla necesita, con un código seudónimo. Nombre, RUT y cuenta nunca son necesarios; los totales solos no permiten encontrar casos.',
        4:'Pide una tabla revisable caso por caso. La IA no corrige montos ni entrega veredictos generales.'};
      let hits=0;const miss=[];
      [1,2,3,4].forEach(i=>{if(vals[i].i===cfg.rows[i].model)hits++;else miss.push(i)});
      const proc=vals[0]||'Cierre mensual de remuneraciones';
      const extra=vals[5]?`<h4>Regla propia</h4><ul><li>${esc(vals[5])}</li></ul>`:'';
      const lvl=hits===4?['ok','Ficha sólida']:hits>=2?['mid','Puede mejorar']:['no','Ficha riesgosa'];
      const risk=vals[3].i===0?'<div class="alert-row">⚠️ <b>Riesgo de confidencialidad:</b> tu ficha entrega nombre, RUT y cuenta bancaria. Reemplázalos por un código seudónimo.</div>':'';
      return `<div class="out fout"><strong>${cfg.title}</strong> <span class="lvl ${lvl[0]}">${lvl[1]}</span>
        <h4>Proceso</h4><ul><li>${esc(proc)}</li></ul>
        <h4>Fuentes</h4><ul><li>${vals[1].t}</li></ul>
        <h4>Reglas de comparación</h4><ul><li>${vals[2].t}</li></ul>${extra}
        <h4>Datos que entran a la IA</h4><ul><li>${vals[3].t}</li></ul>
        <h4>Formato de salida</h4><ul><li>${vals[4].t}</li></ul>
        <h4>Decisión</h4><ul><li>La IA señala posibles inconsistencias; yo reviso la fuente original y decido.</li></ul>
        ${risk}${miss.length?miss.map(i=>`<div class="alert-row">✎ <b>${cfg.rows[i].label.replace(/^\d · /,'')}:</b> ${tips[i]}</div>`).join(''):'<div class="ok-row">✓ Tu ficha cruza varias fuentes, usa reglas verificadas, protege los datos y pide un resultado revisable.</div>'}
        <p class="hint" style="margin:10px 0 0">Coincides con la respuesta modelo en <b>${hits} de 4</b> elementos. Puedes cambiar opciones y volver a generar.</p>
        <div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar mi ficha</button></div></div>`}
  },
  init({$,$$}){
    /* Correo de Rodrigo */
    const btn=$('#openMail');
    btn.addEventListener('click',()=>{
      $('#mailBody').innerHTML=`<p>Hola, Camila:</p><p>Para el cierre de octubre quiero que probemos el asistente de IA corporativo en la revisión previa al pago.</p><p><b>¿Le pasas la planilla de octubre y que nos diga si está todo bien?</b> Así llegamos más tranquilos al pago.</p><p>Gracias,<br/>Rodrigo</p>`;
      btn.closest('.mfoot').remove()});

    /* Ficha del caso: cada decisión correcta completa una parte */
    const fill={caso1:['slot1','Tabla seudonimizada: código EMP, área, conceptos y montos de octubre y septiembre, novedades y horas por código.'],
      caso2:['slot2','Parámetros oficiales de octubre verificados, reglas internas escritas y umbral de variación respecto de septiembre.'],
      caso3:['slot3','Tabla de posibles inconsistencias: código, concepto, regla, diferencia y dato para confirmar. Camila decide.']};
    Object.entries(fill).forEach(([k,[id,txt]])=>{const box=$(`[data-choice="${k}"]`);if(!box)return;
      const ok=$(`.opt[data-opt="${box.dataset.correct}"]`,box);
      ok.addEventListener('click',()=>{const s=$('#'+id);s.classList.add('filled');$('.v',s).textContent=txt})});

    /* Liquidación: en pantallas angostas, el panel se abre bajo la zona tocada */
    const root=$('[data-hotspot="liq"]');if(!root)return;
    const pan=$('.hs-panel',root),home=pan.parentNode,mq=window.matchMedia('(max-width:860px)');
    let last=null;
    const place=()=>{if(mq.matches&&last){last.after(pan);pan.classList.add('inline')}else{home.appendChild(pan);pan.classList.remove('inline')}};
    $$('.hs',root).forEach(b=>b.addEventListener('click',()=>{last=b.closest('.liq-sec');place();
      if(mq.matches)setTimeout(()=>pan.scrollIntoView({behavior:'smooth',block:'nearest'}),60)}));
    if(mq.addEventListener)mq.addEventListener('change',place);
  }
});

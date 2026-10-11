/* Ganchos propios de la Lección 1.3: evaluación del constructor de prompts */
Object.assign(window.LESSON,{
  builderRender:{
    prompt(vals,cfg){
      const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      const tips={
        'Tarea':'Usa un verbo concreto y di exactamente qué buscar.',
        'Contexto':'Indica el rol, el propósito y el periodo.',
        'Información':'Nunca entregues nombres, RUT ni cuentas: usa datos ficticios con las columnas necesarias.',
        'Restricciones':'Pide que no modifique valores ni invente datos, y que pregunte si falta algo.',
        'Formato':'Define una tabla con columnas para revisar rápido.'};
      let good=0;const miss=[];
      const parts=cfg.rows.map((r,i)=>{const ok=vals[i].i===r.good;if(ok)good++;else miss.push(r.label);return vals[i].i===0&&r.label==='Contexto'?'':vals[i].t}).filter(Boolean);
      const pct=Math.round(good/cfg.rows.length*100);
      const lvl=pct===100?['ok','Instrucción efectiva']:pct>=60?['mid','Puede mejorar']:['no','Instrucción vaga'];
      const risk=vals[2].i===0?'<div class="alert-row">⚠️ <b>Riesgo de confidencialidad:</b> la instrucción entrega nombres, RUT y cuentas bancarias. Usa datos ficticios o anonimizados.</div>':'';
      return `<div class="out"><strong>${cfg.title}</strong> <span class="lvl ${lvl[0]}">${lvl[1]}</span>
        <div class="qbar"><span style="width:${pct}%"></span></div><small>Calidad: ${good} de ${cfg.rows.length} componentes bien definidos</small>
        <div class="promptbox">${esc(parts.join(' '))}</div>${risk}
        ${miss.length?miss.map(m=>`<div class="alert-row">✎ <b>${m}:</b> ${tips[m]}</div>`).join(''):'<div class="ok-row">✓ Los cinco componentes están bien definidos. Esta instrucción producirá una respuesta concreta y verificable.</div>'}
        <p class="hint" style="margin:10px 0 0">Puedes cambiar las opciones y volver a generar para comparar.</p>
        <div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar instrucción</button></div></div>`}
  }
});

/* Ganchos propios de la Lección 1.2: evaluación de la ficha de selección */
Object.assign(window.LESSON,{
  builderRender:{
    ficha(vals,cfg){
      const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      const tarea=vals[0]||'(sin descripción)',dato=vals[1].i,tool=vals[2].i,ctrl=vals[3].i;
      const alerts=[],oks=[];
      // Compatibilidad entre tipo de dato y herramienta
      if(tool===3)alerts.push('Una extensión o servicio <b>no revisado por TI</b> no debe recibir información interna. Usa una alternativa autorizada.');
      if(dato===2&&tool===0)alerts.push('Los <b>datos personales o salariales reales</b> nunca van a una herramienta pública con cuenta personal. Cambia a un entorno autorizado o usa datos ficticios.');
      if(dato===2&&(tool===1||tool===2))alerts.push('El entorno es adecuado, pero aplica la <b>minimización</b>: reemplaza nombres y RUT por códigos y quita datos bancarios si la tarea no los necesita.');
      if(dato===1&&tool===0)alerts.push('Con datos anonimizados, revisa que no se pueda <b>reidentificar</b> a nadie (por ejemplo, áreas con una sola persona). Si es posible, prefiere un entorno corporativo.');
      if(ctrl===3)alerts.push('Todo resultado de IA es un borrador: define un <b>control</b> antes de usarlo.');
      if(dato===0&&tool!==3)oks.push('Datos ficticios o públicos: riesgo de confidencialidad bajo con cualquier herramienta autorizada.');
      if((tool===1||tool===2)&&dato!==2)oks.push('Entorno corporativo con datos adecuados: buena combinación.');
      if(ctrl!==3)oks.push(`Control definido: ${esc(cfg.rows[3].options[ctrl]).toLowerCase()}.`);
      const verdict=alerts.some(a=>a.includes('nunca')||a.includes('no revisado'))?'<span class="lvl no">Requiere cambios</span>':alerts.length?'<span class="lvl mid">Usable con ajustes</span>':'<span class="lvl ok">Combinación segura</span>';
      return `<div class="out"><strong>${cfg.title}</strong> ${verdict}
        <table><tbody><tr><td><b>Tarea</b></td><td>${esc(tarea)}</td></tr><tr><td><b>Datos</b></td><td>${vals[1].t}</td></tr><tr><td><b>Herramienta</b></td><td>${vals[2].t}</td></tr><tr><td><b>Control</b></td><td>${vals[3].t}</td></tr></tbody></table>
        ${alerts.map(a=>`<div class="alert-row">⚠️ ${a}</div>`).join('')}${oks.map(o=>`<div class="ok-row">✓ ${o}</div>`).join('')}
        <p style="margin:10px 0 0" class="hint">Puedes cambiar las opciones y volver a generar la ficha para comparar combinaciones.</p>
        <div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar mi ficha</button></div></div>`}
  }
});

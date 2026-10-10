/* Ganchos propios de la Lección 1.1 */
Object.assign(window.LESSON,{
  builderRender:{
    matriz(vals,cfg){
      const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      const cls=['ok','mid','no'];let hits=0,n=0;
      const rows=cfg.rows.map((r,i)=>{
        if(r.type==='text')return vals[i]?`<tr><td>${esc(vals[i])}</td><td><span class="lvl mid">Tarea propia</span></td></tr>`:'';
        n++;if(vals[i].i===r.model)hits++;
        return `<tr><td>${r.label}</td><td><span class="lvl ${cls[vals[i].i]}">${vals[i].t}</span></td></tr>`}).join('');
      return `<div class="out"><strong>${cfg.title}</strong><table><thead><tr><th>${cfg.colA}</th><th>${cfg.colB}</th></tr></thead><tbody>${rows}</tbody></table>
        <p style="margin:10px 0 0">Coincides con la respuesta modelo en <b>${hits} de ${n}</b> tareas. Abre la respuesta modelo para ver el criterio de cada una.</p>
        <div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar mi matriz</button></div></div>`}
  },
  init({$}){
    const btn=$('#openMail');
    btn.addEventListener('click',()=>{
      $('#mailBody').innerHTML=`<p>Hola, Camila:</p><p>Vi que varias empresas están usando inteligencia artificial en remuneraciones. Este mes estamos muy ajustados con el cierre.</p><p><b>¿Qué te parece si la IA calcula todos los sueldos este mes</b> y así cerramos antes? Coméntame hoy.</p><p>Saludos,<br/>Marcela</p>`;
      btn.closest('.mfoot').remove()});
  }
});

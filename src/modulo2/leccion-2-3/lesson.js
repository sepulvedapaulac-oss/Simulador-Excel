/* Ganchos propios de la Lección 2.3: tabla de alertas (corregir / investigar / descartar) y matriz personal */
Object.assign(window.LESSON,{
  builderRender:{
    matriz(vals,cfg){
      const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      const sel=[0,1,8];let hits=0;sel.forEach(i=>{if(vals[i].i===cfg.rows[i].model)hits++});
      const cell=(v,d)=>v?esc(v):`<span style="color:var(--muted);font-style:italic">${d}</span>`;
      const mine=[2,5].map((b,k)=>(vals[b]||vals[b+1]||vals[b+2])?`<tr><td>${cell(vals[b],'Sin criterio')}</td><td>${cell(vals[b+1],'Sin evidencia definida')}</td><td>${cell(vals[b+2],'Sin responsable')}</td></tr>`:'').join('');
      const empty=!mine;
      return `<div class="out"><strong>${cfg.title}</strong>
        <table><thead><tr><th>Criterio para la IA</th><th>Evidencia</th><th>Responsable</th></tr></thead><tbody>
        <tr><td>Días trabajados mayores que los días del mes</td><td>${esc(vals[0].t)}</td><td>${esc(vals[1].t)}</td></tr>${mine}</tbody></table>
        <p style="margin:10px 0 0"><b>Registro de decisiones:</b> ${esc(vals[8].t)}</p>
        ${empty?'<div class="alert-row">✎ Agrega al menos una alerta propia con su criterio, evidencia y responsable para que la matriz te sirva en tu próximo cierre.</div>':''}
        <p style="margin:10px 0 0">Coincides con el modelo en <b>${hits} de ${sel.length}</b> preguntas cerradas. Abre la matriz modelo para ver el criterio de cada una.</p>
        <div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar mi matriz</button></div></div>`}
  },
  init({$,$$,done,S,esc}){
    const root=$('#alertas');if(!root)return;
    const A=window.LESSON.alerts,list=$('.al-list',root),sum=$('.al-sum',root),tick=$('.tick',root),task=$('.task',root);
    const NAME={c:'Corregir',i:'Investigar',d:'Descartar'},ICON={c:'🔧',i:'🔎',d:'✓'};
    /* Consecuencia según la decisión elegida y la correcta */
    const WHY={
      'c>d':'Corregir un dato que está respaldado crea un error nuevo en el pago.',
      'c>i':'Todavía no tienes evidencia suficiente para corregir: podrías cambiar un dato que estaba bien.',
      'd>c':'Descartar un error real lo deja llegar al pago.',
      'd>i':'Aún no sabes si el dato es correcto: descartarlo sin evidencia es un riesgo.',
      'i>c':'La evidencia ya es concluyente; seguir investigando solo retrasa una corrección necesaria.',
      'i>d':'La evidencia ya explica el dato; no hace falta investigar más, solo descartar y documentar.'};
    const solved=new Set(),first={},tried=new Set();
    list.innerHTML=A.map((a,i)=>`<div class="al-row" data-i="${i}">
      <div class="al-id"><span class="al-n">Alerta ${i+1}</span><b>${a.emp}</b><span class="pill info">${a.area}</span></div>
      <div><div class="al-t">${a.t}</div><div class="al-d">${a.dato}</div></div>
      <div class="al-acts" role="group" aria-label="Decisión para la alerta ${i+1}">${['c','i','d'].map(k=>`<button type="button" data-k="${k}">${ICON[k]} ${NAME[k]}</button>`).join('')}</div>
      <div class="al-fb" aria-live="polite"></div></div>`).join('');
    const upd=()=>{tick.textContent=`${solved.size} / ${A.length}`;if(solved.size===A.length){task.classList.add('ok');summary();done('alertas')}};
    function summary(){const ok=Object.values(first).filter(Boolean).length;const cnt={c:0,i:0,d:0};A.forEach(a=>cnt[a.d]++);
      sum.innerHTML=`<div class="feedback good"><strong>Tabla resuelta · ${ok} de ${A.length} al primer intento.</strong> <span class="fb-body">De diez alertas, solo ${cnt.c} eran errores reales para corregir, ${cnt.i} requerían investigar y ${cnt.d} eran falsos positivos. Por eso cada alerta necesita evidencia y una decisión humana, y queda registrada.</span>
        <div class="tally"><span class="pill bad">🔧 Corregir: ${cnt.c}</span><span class="pill warn">🔎 Investigar: ${cnt.i}</span><span class="pill good">✓ Descartar: ${cnt.d}</span></div></div>`}
    $$('.al-row',list).forEach(row=>{const i=+row.dataset.i,a=A[i],btns=$$('button',row),fb=$('.al-fb',row);
      btns.forEach(b=>b.addEventListener('click',()=>{if(solved.has(i))return;const k=b.dataset.k,ok=k===a.d;
        if(!(i in first)){first[i]=ok;S.first['al'+i]=ok}
        row.classList.add('tried');
        if(ok){solved.add(i);row.classList.add('solved');
          btns.forEach(x=>{x.disabled=true;x.classList.remove('bad');x.classList.toggle('good',x===b);x.classList.toggle('dim',x!==b)});
          fb.innerHTML=`<div class="feedback good"><strong>${ICON[k]} ${NAME[k]} · ${a.kind}.</strong> <span class="fb-body">${a.why}</span></div>`;upd()}
        else{b.classList.add('bad');b.disabled=true;
          fb.innerHTML=`<div class="feedback bad"><strong>${NAME[k]} no es la mejor decisión.</strong> <span class="fb-body">${WHY[k+'>'+a.d]} ${a.hint} Elige otra opción.</span></div>`}
      }))});
    upd();
  }
});

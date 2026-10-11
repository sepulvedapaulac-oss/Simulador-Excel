/* Ganchos propios de la Lección 2.4: ordenar secuencia, resaltar la premisa errónea,
   stepper de validación guiada y evaluación del protocolo personal. */
Object.assign(window.LESSON,{
  builderRender:{
    protocolo(vals,cfg){
      const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      const res=vals[0]||'(sin descripción)',reg=vals[6]||'(sin definir)';
      const tips=[
        ['El criterio debe ser verificable y escrito <b>antes</b> de ver el resultado. “Se ve razonable” no es un criterio.','La IA puede confirmar su propio error: su confirmación no es evidencia. Define un criterio verificable.'],
        [null,'Otra respuesta de IA no es una fuente. Contrasta con el sistema o con la fuente oficial de la norma.'],
        [null,'Sin caso conocido no sabrás si la lógica del cálculo es correcta. Usa un trabajador calculado a mano o un mes cerrado.'],
        ['Los montos altos son solo un tipo de caso borde. Suma ingresos, egresos, licencias, topes y cambios de jornada.','Los casos borde son donde más se equivoca la IA. Define cuáles revisarás.'],
        ['Revisar tu propio trabajo ayuda, pero no es cuatro ojos. Pide a otra persona que revise con tu evidencia.','Sin segunda revisión no hay control independiente. Busca a otra persona del equipo.']];
      const alerts=[];[1,2,3,4,5].forEach((r,k)=>{const i=vals[r].i;if(i>0&&tips[k][i-1])alerts.push(tips[k][i-1])});
      if(!vals[6])alerts.push('Define dónde quedará el registro y quién aprueba: sin eso no hay trazabilidad.');
      const verdict=alerts.length===0?'<span class="lvl ok">Protocolo sólido</span>':alerts.length<=2?'<span class="lvl mid">Usable con ajustes</span>':'<span class="lvl no">Requiere cambios</span>';
      const rows=[['1. Criterio de aceptación',vals[1].t],['2. Contraste',vals[2].t],['3. Caso conocido',vals[3].t],['4. Casos borde',vals[4].t],['5. Segunda revisión',vals[5].t],['6. Registro y aprobación',esc(reg)]];
      return `<div class="out"><strong>${cfg.title}</strong> ${verdict}
        <p style="margin:6px 0 8px"><b>Resultado que valido:</b> ${esc(res)}</p>
        <table><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join('')}</tbody></table>
        ${alerts.map(a=>`<div class="alert-row">⚠️ ${a}</div>`).join('')}${alerts.length?'':'<div class="ok-row">✓ Tu protocolo cubre criterio, evidencia, segunda revisión y registro.</div>'}
        <p style="margin:10px 0 0" class="hint">Puedes cambiar las opciones y volver a generarlo para comparar.</p>
        <div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar mi protocolo</button></div></div>`}
  },
  init(api){
    const {$,$$,done,feedback,S,esc}=api;const L=window.LESSON;

    /* ---------- Ordenar secuencia ---------- */
    (function(){const root=$('#ordRoot');if(!root)return;const cfg=L.order.protocolo,list=$('.order',root),fb=$('.fb',root),btn=$('#ordCheck'),tick=$('.tick',root),task=$('.task',root);
      let ord=cfg.start.slice(),solved=false,tries=0;
      function render(focusIdx,dir){list.innerHTML=ord.map((k,p)=>`<li data-k="${k}"><span class="pos">${p+1}</span><span class="txt">${cfg.steps[k].t}${solved?`<small>${cfg.steps[k].why}</small>`:''}</span><span class="mv"><button type="button" data-d="-1" aria-label="Subir: ${esc(cfg.steps[k].t)}" ${p===0?'disabled':''}>↑</button><button type="button" data-d="1" aria-label="Bajar: ${esc(cfg.steps[k].t)}" ${p===ord.length-1?'disabled':''}>↓</button></span></li>`).join('');
        $$('.mv button',list).forEach(b=>b.addEventListener('click',()=>{const li=b.closest('li'),p=[...list.children].indexOf(li),d=+b.dataset.d,q=p+d;if(q<0||q>=ord.length)return;
          [ord[p],ord[q]]=[ord[q],ord[p]];fb.innerHTML='';render(q,d)}));
        if(focusIdx!=null){const li=list.children[focusIdx];const t=li&&li.querySelector(`button[data-d="${dir}"]:not(:disabled)`)||li&&li.querySelector('button:not(:disabled)');if(t)t.focus()}}
      render();
      btn.addEventListener('click',()=>{if(solved)return;tries++;let ok=0;
        [...list.children].forEach((li,p)=>{const g=+li.dataset.k===p;li.classList.toggle('good',g);li.classList.toggle('bad',!g);if(g)ok++});
        tick.textContent=`${ok} / ${ord.length}`;if(!('orden' in S.first))S.first.orden=ok===ord.length;
        if(ok===ord.length){solved=true;list.classList.add('locked');render();[...list.children].forEach(li=>li.classList.add('good'));task.classList.add('ok');btn.disabled=true;
          feedback(fb,true,'¡Orden correcto!','Primero el criterio, luego la evidencia (sistema, caso conocido, casos borde), después la segunda revisión y, al final, el registro y la aprobación.');done('orden')}
        else feedback(fb,false,`${ok} de ${ord.length} pasos en su lugar.`,tries>1?'Pista: el criterio va siempre primero y la aprobación, al final. Entre ambos, la evidencia va de lo general (sistema) a lo particular (caso conocido y casos borde) y luego la segunda revisión.':'Los pasos marcados en rojo están fuera de lugar. Pregúntate: ¿qué necesitas tener definido antes de revisar?')})})();

    /* ---------- Resaltar la premisa errónea ---------- */
    (function(){const root=$('#pmRoot');if(!root)return;const P=L.premisas,wrap=$('.pm-list',root),tick=$('.tick',root),task=$('.task',root);let found=0;
      wrap.innerHTML=P.map((p,i)=>`<div class="pm-card" data-i="${i}"><div class="ahead"><span class="dot">✦</span>Asistente de IA · respuesta ${i+1}<span class="st">Busca la frase errónea</span></div>
        <div class="pm-q">${p.q}</div><div class="pm-a">${p.s.map((s,j)=>`<span class="sent" role="button" tabindex="0" data-j="${j}">${s}</span>`).join(' ')}</div><div class="fb"></div></div>`).join('');
      $$('.pm-card',wrap).forEach(card=>{const i=+card.dataset.i,p=P[i],fb=$('.fb',card);
        const pick=el=>{if(card.classList.contains('solved'))return;const j=+el.dataset.j,ok=j===p.c,key='pm'+i;if(!(key in S.first))S.first[key]=ok;
          if(ok){el.classList.add('found');card.classList.add('solved');$('.st',card).textContent='✓ Encontrada';feedback(fb,true,'Premisa errónea encontrada.',p.why);found++;
            tick.textContent=`${found} / ${P.length}`;if(found===P.length){task.classList.add('ok');done('premisa')}}
          else{el.classList.add('okpick');feedback(fb,false,'Esta frase es correcta.',p.ok[j]+' Sigue buscando la que falla.')}};
        $$('.sent',card).forEach(el=>{el.addEventListener('click',()=>pick(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(el)}})})})})();

    /* ---------- Stepper: validación guiada ---------- */
    (function(){const root=$('#stpRoot');if(!root)return;const ST=L.stepper,side=$('.steps-side',root),pan=$('.stp-panel',root),log=$('.stp-log ol',root);let cur=0;
      side.innerHTML=ST.map((s,i)=>`<div class="sstep" data-i="${i}"><span class="n">${i+1}</span><span>${s.t}</span></div>`).join('');
      const marks=()=>$$('.sstep',side).forEach((x,i)=>{x.classList.toggle('on',i===cur);x.classList.toggle('ok',i<cur||(i===cur&&cur>=ST.length));x.setAttribute('aria-current',i===cur?'step':'false')});
      function table(t){return `<div class="tblwrap" style="overflow:auto"><table class="datatbl"><thead><tr>${t[0].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${t.slice(1).map(r=>`<tr>${r.map((c,k)=>`<td class="${k>0&&r[1]!==r[2]?'diff':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
      function show(){marks();
        if(cur>=ST.length){pan.innerHTML=`<h3>✓ Informe validado</h3><p>Camila siguió el protocolo completo. El informe que llega a Rodrigo tiene <b>criterio, evidencia, hallazgos corregidos, segunda revisión y responsable de la aprobación</b>. La bitácora es la prueba.</p><div class="feedback good"><strong>Resultado:</strong> <span class="fb-body">la IA aceleró el borrador; la validación evitó que dos errores (ingresos omitidos y recargo de 25 %) llegaran a la gerencia.</span></div>`;done('stepper');return}
        const s=ST[cur];
        pan.innerHTML=`<span class="eyebrow">Paso ${cur+1} de ${ST.length}</span><h3>${s.t}</h3><p class="ctx">${s.ctx}</p>${s.table?table(s.table):''}<h4 style="margin:14px 0 6px">${s.q}</h4><div class="options">${s.o.map((o,k)=>`<button class="opt" type="button" data-k="${k}"><span class="letter">${'ABC'[k]}</span><span>${o}</span></button>`).join('')}</div><div class="fb"></div>`;
        const opts=$$('.opt',pan),fb=$('.fb',pan);
        opts.forEach(b=>b.addEventListener('click',()=>{const k=+b.dataset.k,ok=k===s.c,key='stp'+cur;if(!(key in S.first))S.first[key]=ok;
          opts.forEach(x=>{x.disabled=true;x.classList.toggle('dim',x!==b)});b.classList.remove('dim');b.classList.add(ok?'good':'bad');
          if(ok){fb.innerHTML=`<div class="feedback good"><strong>Buena decisión.</strong> <span class="fb-body">${s.f[k]}</span><div class="stp-next"><button class="small-btn primary" type="button">${cur<ST.length-1?'Siguiente paso →':'Ver resultado'}</button></div></div>`;
            const li=document.createElement('li');li.innerHTML=s.log;log.appendChild(li);
            $('button',fb).addEventListener('click',()=>{cur++;show();pan.scrollIntoView({behavior:'smooth',block:'nearest'})})}
          else feedback(fb,false,'Revisa esta decisión.',s.f[k],()=>{fb.innerHTML='';opts.forEach(x=>{x.disabled=false;x.classList.remove('good','bad','dim')});opts[0].focus()});
          fb.firstElementChild&&fb.firstElementChild.scrollIntoView({behavior:'smooth',block:'nearest'})}))}
      show()})();
  }
});

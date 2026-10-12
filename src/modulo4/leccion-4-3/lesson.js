/* Lección 4.3 · Ordenar el flujo del cierre y stepper del primer cierre asistido (componentes de la lección 2.4) */
Object.assign(window.LESSON,{
  init(api){
    const {$,$$,done,feedback,S,esc}=api;const L=window.LESSON;

    /* ---------- Ordenar secuencia ---------- */
    (function(){const root=$('#ordRoot');if(!root)return;const cfg=L.order.flujo,list=$('.order',root),fb=$('.fb',root),btn=$('#ordCheck'),tick=$('.tick',root),task=$('.task',root);
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
          feedback(fb,true,'¡Orden correcto!','Primero se ordenan y validan las novedades, luego el sistema calcula, después vienen los controles y la revisión de alertas, y al final la aprobación y el pago.');done('orden')}
        else feedback(fb,false,`${ok} de ${ord.length} pasos en su lugar.`,tries>1?'Pista: nada se calcula sin novedades validadas, nada se aprueba sin revisar las alertas y nada se paga sin aprobación.':'Los pasos marcados en rojo están fuera de lugar. Pregúntate: ¿qué necesita estar listo antes de cada paso?')})})();


    /* ---------- Stepper: validación guiada ---------- */
    (function(){const root=$('#stpRoot');if(!root)return;const ST=L.stepper,side=$('.steps-side',root),pan=$('.stp-panel',root),log=$('.stp-log ol',root);let cur=0;
      side.innerHTML=ST.map((s,i)=>`<div class="sstep" data-i="${i}"><span class="n">${i+1}</span><span>${s.t}</span></div>`).join('');
      const marks=()=>$$('.sstep',side).forEach((x,i)=>{x.classList.toggle('on',i===cur);x.classList.toggle('ok',i<cur||(i===cur&&cur>=ST.length));x.setAttribute('aria-current',i===cur?'step':'false')});
      function table(t){return `<div class="tblwrap" style="overflow:auto"><table class="datatbl"><thead><tr>${t[0].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${t.slice(1).map(r=>`<tr>${r.map((c,k)=>`<td class="${k>0&&r[1]!==r[2]?'diff':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
      function show(){marks();
        if(cur>=ST.length){pan.innerHTML=`<h3>✓ Cierre de noviembre completado</h3><p>El cierre tomó <b>cuatro días hábiles en vez de seis</b>. La IA ordenó y señaló, el sistema calculó y Camila y Rodrigo decidieron en cada punto de control. La bitácora deja la evidencia.</p><div class="feedback good"><strong>Resultado:</strong> <span class="fb-body">ningún error llegó al pago y cada decisión quedó registrada con su responsable.</span></div>`;done('stepper');return}
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

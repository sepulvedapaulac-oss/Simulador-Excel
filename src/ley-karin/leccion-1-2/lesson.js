/* Actividades TLS sin equivalente en el motor común (selección múltiple, ordenar, completar,
   tarjetas para explorar, compromisos y transferencia) + informe final con botones de repaso.
   lesson.py antepone este archivo al lesson.js de cada lección. */
(function(){
let API=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const first=(k,ok)=>{if(!(k in API.S.first))API.S.first[k]=ok};
function gate(root,txt){let g=root._g;if(!g){g=document.createElement('p');g.className='lk-gate';g.setAttribute('aria-live','polite');root.appendChild(g);root._g=g}g.textContent=txt}
function fbAfter(root){let f=root._fb;if(!f){f=document.createElement('div');f.setAttribute('aria-live','polite');root.appendChild(f);root._fb=f}return f}
function row(root,label){const r=document.createElement('div');r.className='lk-row';r.innerHTML=`<button class="small-btn primary" type="button">${label}</button>`;root.appendChild(r);return r.firstChild}
function tick(root,n,total){const t=$('.tick',root),task=$('.task',root);if(t)t.textContent=`${Math.min(n,total)} / ${total}`;if(n>=total&&task)task.classList.add('ok')}

const W={
  multi(root,key){const opts=$$('.opt',root),need=opts.filter(o=>o.dataset.ok==='1').length;
    opts.forEach(o=>{o.setAttribute('aria-pressed','false');o.addEventListener('click',()=>{if(o.disabled)return;o.classList.toggle('sel');o.setAttribute('aria-pressed',o.classList.contains('sel'))})});
    const b=row(root,'Revisar'),fb=fbAfter(root);
    b.addEventListener('click',()=>{let right=0,wrong=0;opts.forEach(o=>{const s=o.classList.contains('sel'),ok=o.dataset.ok==='1';if(s&&ok)right++;if(s&&!ok)wrong++});
      const good=right===need&&wrong===0;first(key,good);
      if(good){opts.forEach(o=>{o.disabled=true;o.classList.remove('sel');if(o.dataset.ok==='1')o.classList.add('good');else o.classList.add('dim')});b.disabled=true;
        API.feedback(fb,true,'Exacto.',root.dataset.okmsg);API.done(key)}
      else API.feedback(fb,false,'Revisa tu selección.',`Marcaste ${right} de ${need} correctas${wrong?` y ${wrong} que no corresponde${wrong>1?'n':''}`:''}. ${root.dataset.hint||''}`)})},
  order(root,key){const correct=JSON.parse(root.dataset.items),start=JSON.parse(root.dataset.start||'null')||correct.map((_,k)=>k).reverse();
    let cur=start.map(k=>correct[k]),solved=false;const ol=document.createElement('ol');ol.className='lk-order';root.appendChild(ol);
    const b=row(root,'Comprobar orden'),fb=fbAfter(root);
    function draw(){ol.innerHTML='';cur.forEach((t,k)=>{const li=document.createElement('li');li.innerHTML=`<span>${t}</span><button type="button" aria-label="Subir «${t}»">▲</button><button type="button" aria-label="Bajar «${t}»">▼</button>`;
      const [up,dn]=$$('button',li);up.disabled=k===0||solved;dn.disabled=k===cur.length-1||solved;
      up.addEventListener('click',()=>{[cur[k-1],cur[k]]=[cur[k],cur[k-1]];draw();$$('button',ol.children[k-1])[0].focus()});
      dn.addEventListener('click',()=>{[cur[k+1],cur[k]]=[cur[k],cur[k+1]];draw();$$('button',ol.children[k+1])[1].focus()});ol.appendChild(li)});
      ol.classList.toggle('ok',solved);b.disabled=solved}
    draw();
    b.addEventListener('click',()=>{const good=cur.every((t,k)=>t===correct[k]);first(key,good);
      if(good){solved=true;draw();API.feedback(fb,true,'Orden correcto.',root.dataset.okmsg);API.done(key)}
      else{const ok=cur.filter((t,k)=>t===correct[k]).length;API.feedback(fb,false,'Aún no.',`Tienes ${ok} de ${correct.length} en su lugar. ${root.dataset.hint||''}`)}})},
  cloze(root,key){const sels=$$('select',root);sels.forEach((s,k)=>s.setAttribute('aria-label','Espacio '+(k+1)));
    const b=row(root,'Revisar'),fb=fbAfter(root);
    b.addEventListener('click',()=>{let ok=0;sels.forEach(s=>{const g=s.value===s.dataset.ok;s.classList.toggle('ok',g);s.classList.toggle('bad',!g&&s.value!=='');if(g)ok++});
      const good=ok===sels.length;first(key,good);
      if(good){sels.forEach(s=>s.disabled=true);b.disabled=true;API.feedback(fb,true,'Correcto.',root.dataset.okmsg);API.done(key)}
      else API.feedback(fb,false,`${ok} de ${sels.length} correctas.`,`Revisa los espacios marcados. ${root.dataset.hint||''}`)})},
  reveal(root,key){const items=$$('.lk-rv',root),pan=$('.lk-rv-panel',root),seen=new Set();
    items.forEach((it,k)=>it.addEventListener('click',()=>{items.forEach(x=>x.classList.toggle('active',x===it));it.classList.add('seen');seen.add(k);
      pan.hidden=false;pan.className='lk-rv-panel '+(it.dataset.kind||'');pan.innerHTML=`<h3>${$('b',it).innerHTML}</h3><div>${it.dataset.fb}</div>`;
      tick(root,seen.size,items.length);if(seen.size>=items.length)API.done(key)}))},
  checklist(root,key){const cs=$$('.lk-chk',root),on=new Set();
    cs.forEach((c,k)=>{c.insertAdjacentHTML('afterbegin','<span class="bx" aria-hidden="true"></span>');c.setAttribute('aria-pressed','false');
      c.addEventListener('click',()=>{const v=!c.classList.contains('on');c.classList.toggle('on',v);c.setAttribute('aria-pressed',v);v?on.add(k):on.delete(k);
        tick(root,on.size,cs.length);if(on.size>=cs.length)API.done(key)})})},
  transfer(root,key){const tas=$$('textarea',root),MIN=20,model=$('.lk-model',root);
    tas.forEach((t,k)=>{t.id=key+'_'+k;const lab=t.previousElementSibling;if(lab&&lab.tagName==='LABEL')lab.htmlFor=t.id;
      t.insertAdjacentHTML('afterend','<div class="lk-cnt"></div>');t.addEventListener('input',upd)});
    const r=document.createElement('div');r.className='lk-row';r.innerHTML='<button class="small-btn primary" type="button" disabled>Comparar con la referencia</button>';model.before(r);const b=r.firstChild;
    function upd(){let all=true;tas.forEach(t=>{const v=t.value.trim().length;t.nextElementSibling.textContent=`${v} / ${MIN} caracteres mínimos`;if(v<MIN)all=false});b.disabled=!all;return all}
    b.addEventListener('click',()=>{if(!upd())return;model.hidden=false;API.done(key);model.scrollIntoView({behavior:'smooth',block:'nearest'})});upd()}
};

Object.assign(window.LESSON,{
  init(api){API=api;$$('[data-lk]').forEach(el=>W[el.dataset.lk](el,el.dataset.key));
    /* Idea clave que aparece al terminar una actividad del motor (clasificar, unir) */
    $$('.lk-after').forEach(c=>{const t=$('.task',c.parentElement);if(!t)return;new MutationObserver(()=>{if(t.classList.contains('ok'))c.hidden=false}).observe(t,{attributes:true})})},
  report(){const S=API.S,Q=window.LESSON.quiz||[],pct=Q.length?Math.round(S.quiz.score/Q.length*100):0,fk=Object.keys(S.first);
    if($('#fPct'))$('#fPct').textContent=pct+'%';
    if($('#fEsc'))$('#fEsc').textContent=`${fk.filter(k=>S.first[k]).length} / ${fk.length}`;
    const rb=$('#reviewBtns');if(rb&&!rb.childElementCount)$$('.slide[data-review]').forEach(s=>{const b=document.createElement('button');b.type='button';b.className='small-btn';b.textContent=s.dataset.review;
      b.addEventListener('click',()=>API.go(+s.dataset.idx));rb.appendChild(b)})}
});
})();

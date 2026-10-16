/* Motor de actividades prácticas y simuladores · SCORM 1.2
   ACT (window.ACT): {id, tipo:'actividad'|'simulador', pass:80}
   Actividad: secciones .etask[data-id][data-pts][data-title][data-lesson][data-auto=mc|multi|match|order|num|hot]
   Simulador: window.SIM={min:3, gen(), render(caso, el), check(caso, el) -> {ok, sol}} */
(function(){
const A=window.ACT||{},$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const PASS=A.pass||80;
/* ---------- SCORM 1.2 ---------- */
function findAPI(w){let n=0;while(w&&n<12){if(w.API)return w.API;if(w.parent===w)break;w=w.parent;n++}return null}
let api=findAPI(window);if(!api&&window.opener)api=findAPI(window.opener);
const SC={ok:false,t0:Date.now(),get(k){try{return this.ok?String(api.LMSGetValue(k)):''}catch(e){return ''}},set(k,v){try{if(this.ok)api.LMSSetValue(k,String(v))}catch(e){}},commit(){try{if(this.ok)api.LMSCommit('')}catch(e){}}};
if(api){try{SC.ok=String(api.LMSInitialize(''))==='true'}catch(e){}}
const store={get(){try{return JSON.parse(SC.ok?SC.get('cmi.suspend_data')||'{}':localStorage.getItem('act_'+A.id)||'{}')}catch(e){return {}}},
 set(d){const s=JSON.stringify(d);if(SC.ok)SC.set('cmi.suspend_data',s);else try{localStorage.setItem('act_'+A.id,s)}catch(e){}}};
let D=store.get();D.v=1;D.best=D.best||0;D.tries=D.tries||0;
if(SC.ok){const st=SC.get('cmi.core.lesson_status');if(!st||st==='not attempted')SC.set('cmi.core.lesson_status','incomplete');SC.commit()}
function report(score,status,keep=true){D.best=keep?Math.max(D.best,score):score;store.set(D);
 SC.set('cmi.core.score.min',0);SC.set('cmi.core.score.max',100);SC.set('cmi.core.score.raw',D.best);if(status)SC.set('cmi.core.lesson_status',status);SC.commit()}
let fin=false;function finish(){if(fin||!SC.ok)return;fin=true;const s=Math.round((Date.now()-SC.t0)/1000),p=n=>String(n).padStart(2,'0');
 SC.set('cmi.core.session_time',`${String(Math.floor(s/3600)).padStart(4,'0')}:${p(Math.floor(s/60)%60)}:${p(s%60)}.00`);SC.set('cmi.core.exit','suspend');SC.commit();try{api.LMSFinish('')}catch(e){}}
addEventListener('pagehide',finish);addEventListener('beforeunload',finish);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const prog=v=>{const b=$('.prog i');if(b)b.style.width=v+'%'};

/* ---------- Actividad evaluada ---------- */
if(A.tipo!=='simulador'){
 const T=$$('.etask'),R={};let cur=-1;
 const total=T.reduce((s,t)=>s+(+t.dataset.pts),0),EV=!!A.eval;if(EV)document.body.classList.add('evalmode');
 T.forEach((t,i)=>{const h=t.querySelector('h2');
  const head=document.createElement('div');head.className='thead';head.innerHTML=`<span class="eyebrow">${EV?'Pregunta':'Tarea'} ${i+1} de ${T.length}</span><span class="pts">${t.dataset.pts} pts</span>`;t.prepend(head);
  if(t.dataset.auto==='mc'||t.dataset.auto==='multi'){const o=t.querySelector('.opts');if(o&&!o.hasAttribute('data-fixed'))shuffle([...o.children]).forEach(c=>o.appendChild(c));
   $$('.opt',t).forEach(op=>{const inp=op.querySelector('input');inp.addEventListener('change',()=>{$$('.opt',t).forEach(x=>x.classList.toggle('sel',x.querySelector('input').checked))})})}
  if(t.dataset.auto==='order'){const ol=t.querySelector('.ord');shuffle([...ol.children]).forEach(c=>ol.appendChild(c));
   [...ol.children].forEach(li=>{li.innerHTML=`<span class="n"></span><span class="t">${li.innerHTML}</span><button type="button" aria-label="Subir">↑</button><button type="button" aria-label="Bajar">↓</button>`;
    const [up,dn]=li.querySelectorAll('button');up.onclick=()=>{if(li.previousElementSibling)ol.insertBefore(li,li.previousElementSibling);num(ol)};dn.onclick=()=>{if(li.nextElementSibling)ol.insertBefore(li.nextElementSibling,li);num(ol)}});num(ol)}
  if(t.dataset.auto==='match')$$('select',t).forEach(s=>{if(!s.querySelector('option[value=""]'))s.insertAdjacentHTML('afterbegin','<option value="" selected>Elige…</option>');s.value=''});
  if(t.dataset.auto==='hot')$$('.hs',t).forEach(b=>{b.type='button';b.onclick=()=>{if(!t.dataset.answered){b.classList.toggle('sel');b.setAttribute('aria-pressed',b.classList.contains('sel'))}}});
  const bar=document.createElement('div');bar.className='row-btns';bar.innerHTML=`<button class="btn" data-respond>Responder</button><button class="btn ghost" data-next hidden>${i===T.length-1?'Ver resultado':(A.eval?'Siguiente pregunta →':'Siguiente tarea →')}</button><span class="muted" data-msg></span>`;
  const why=t.querySelector('.why');t.insertBefore(bar,why);
  bar.querySelector("[data-respond]").onclick=()=>answer(t,i);bar.querySelector('[data-next]').onclick=()=>show(i+1)});
 function num(ol){[...ol.children].forEach((li,k)=>li.querySelector('.n').textContent=k+1)}
 function show(i){cur=i;$('#intro').hidden=true;T.forEach((t,k)=>t.classList.toggle('on',k===i));$('#result').hidden=i<T.length;if(i>=T.length)result();prog(Math.round(Math.min(i,T.length)/T.length*100));scrollTo({top:0,behavior:'smooth'})}
 function answer(t,i){const tp=t.dataset.auto,pts=+t.dataset.pts,msg=t.querySelector('[data-msg]');let frac=0;
  if(tp==='mc'){const s=t.querySelector('.opt input:checked');if(!s){msg.textContent='Elige una alternativa.';return}
   $$('.opt',t).forEach(o=>{const ok=o.hasAttribute('data-ok');if(ok)o.classList.add('ok');else if(o.querySelector('input').checked)o.classList.add('ko')});frac=s.closest('.opt').hasAttribute('data-ok')?1:0}
  else if(tp==='multi'||tp==='hot'){const items=tp==='multi'?$$('.opt',t):$$('.hs',t),sel=x=>tp==='multi'?x.querySelector('input').checked:x.classList.contains('sel');
   if(!items.some(sel)){msg.textContent='Selecciona al menos una opción.';return}
   const good=items.filter(x=>x.hasAttribute('data-ok'));let hit=0,bad=0;
   items.forEach(x=>{const ok=x.hasAttribute('data-ok'),s=sel(x);if(ok&&s){hit++;x.classList.add('ok')}else if(!ok&&s){bad++;x.classList.add('ko')}else if(ok&&!s)x.classList.add(tp==='hot'?'miss':'ok')});
   frac=Math.max(0,(hit-bad)/good.length)}
  else if(tp==='match'){const ss=$$('select',t);if(ss.some(s=>!s.value)){msg.textContent='Completa todas las filas.';return}
   let ok=0;ss.forEach(s=>{const r=s.value===s.dataset.ans,mk=s.closest('.mrow').querySelector('.mk');if(r)ok++;if(mk){mk.textContent=r?'✔':'✘';mk.className='mk '+(r?'ok':'ko')}
    if(!r){const o=[...s.options].find(o=>o.value===s.dataset.ans);(mk||s).insertAdjacentHTML('afterend',`<small class="muted">Correcto: ${o?o.textContent:''}</small>`)}});frac=ok/ss.length}
  else if(tp==='order'){const li=[...t.querySelectorAll('.ord li')];let ok=0;li.forEach((l,k)=>{const r=+l.dataset.pos===k+1;if(r)ok++;l.classList.add(r?'ok':'ko')});frac=ok/li.length}
  else if(tp==='num'){const ins=$$('input[data-ans]',t);if(ins.some(x=>x.value.trim()==='')){msg.textContent='Completa todos los campos.';return}
   let ok=0;ins.forEach(x=>{const raw=x.value.trim().replace(/[$\s]/g,''),v=parseFloat(raw.includes(',')||/^\d{1,3}(\.\d{3})+$/.test(raw)?raw.replace(/\./g,'').replace(',','.'):raw),a=+x.dataset.ans,tol=+(x.dataset.tol||0);const r=Math.abs(v-a)<=tol+1e-9;if(r)ok++;
    x.style.borderColor=r?'var(--good-line)':'var(--bad-line)';x.insertAdjacentHTML('afterend',`<small class="${r?'mk ok':'mk ko'}">${r?'✔ Correcto':'✘ Correcto: '+(x.dataset.show||a)}</small>`)});frac=ok/ins.length}
  const got=Math.round(pts*frac*10)/10;R[t.dataset.id]=got;t.dataset.answered=1;
  $$('input,select,.ord button',t).forEach(x=>x.disabled=true);
  t.querySelector("[data-respond]").hidden=true;t.querySelector('[data-next]').hidden=false;
  msg.innerHTML=EV?'<b>✔ Respuesta registrada</b>':`<b>${got} de ${pts} pts</b>`;t.dataset.got=got;if(!EV)t.querySelector('.why').classList.add('show')}
 function result(){const pts=Math.round(Object.values(R).reduce((a,b)=>a+b,0)*10)/10,sc=Math.round(pts/total*100),ok=sc>=PASS;D.tries++;
  report(sc,ok?'passed':(D.best>=PASS?'passed':'failed'));if(EV){D.evalDone={sc,pts};store.set(D)}
  const fmt=n=>String(n).replace('.',',');
  $('#result').innerHTML=`<div class="card result"><span class="eyebrow">Resultado</span><div class="score">${total===100?sc+'<small style="font-size:1.2rem">/100</small>':fmt(pts)+'<small style="font-size:1.2rem"> de '+total+' pts</small>'}</div>
   ${total===100?'':`<p class="muted" style="margin:6px 0 0">Logro: <b>${sc}%</b></p>`}
   <span class="badge ${ok?'ok':'ko'}">${ok?`Aprobada · lograste el ${PASS}% o más`:`Aún no apruebas · necesitas el ${PASS}%`}</span>
   <p class="muted">${EV?'Evaluación enviada a Moodle':'Intento '+D.tries+' · Mejor nota registrada: <b>'+D.best+'</b>/100'}</p>
   <div class="rlist">${T.map(t=>{const g=R[t.dataset.id]||0,p=+t.dataset.pts,c=g>=p?'full':g>0?'part':'zero';
    return `<div class="ritem"><div><b>${t.dataset.title}</b>${g<p?`<small>Repasa: ${t.dataset.lesson}</small>`:'<small>Logrado</small>'}</div><b class="${c}">${fmt(g)}/${p}</b></div>`}).join('')}</div>
   <div class="row-btns" style="justify-content:center">${EV?'<button class="btn" id="revBtn">Revisar mis respuestas y la retroalimentación</button>':'<button class="btn" onclick="location.reload()">Nuevo intento</button>'}</div></div>`;
  if(EV)$('#revBtn').onclick=()=>{document.body.classList.add('review');T.forEach(t=>{t.classList.add('on');const m=t.querySelector('[data-msg]');m.innerHTML=`<b>${fmt(+t.dataset.got||0)} de ${t.dataset.pts} pts</b>`;t.querySelector('[data-next]').hidden=true;t.querySelector('.why').classList.add('show')});$('#revBtn').hidden=true;T[0].scrollIntoView({behavior:'smooth'})}}
 if(EV&&D.evalDone){const st=$('[data-start]');st.disabled=true;st.textContent='Evaluación ya respondida';
  $('#intro .muted.best').innerHTML=`Ya respondiste esta evaluación en este intento: <b>${D.evalDone.sc}%</b> de logro. Si corresponde otro intento, se habilita desde Moodle.`}
 $('[data-start]').onclick=()=>show(0);
 if(D.best)$('#intro .muted.best')&&($('#intro .muted.best').textContent=`Mejor nota registrada: ${D.best}/100 (${D.tries} intento${D.tries===1?'':'s'}).`);
}

/* ---------- Simulador ---------- */
else{
 const S=window.SIM,MIN=S.min||3;D.n=D.n||0;D.ok=D.ok||0;
 $$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('on',x===b));$$('.pane').forEach(p=>p.classList.toggle('on',p.id===b.dataset.pane))});
 let caso=null,checked=false;
 const box=$('#simCase'),cnt=()=>{$('#simCount').innerHTML=`Casos resueltos: <b>${D.n}</b> · Correctos: <b>${D.ok}</b>${D.n?` · Nota: <b>${Math.round(D.ok/D.n*100)}</b>/100`:''}${D.n<MIN?` · Te faltan <b>${MIN-D.n}</b> para completar`:' · ✔ Simulador completado'}`;prog(Math.min(100,Math.round(D.n/MIN*100)))};
 function nuevo(){caso=S.gen();window.__caso=caso;checked=false;box.innerHTML='';S.render(caso,box);$('#simCheck').hidden=false;$('#simNext').hidden=true;$('#simMsg').textContent=''}
 $('#simCheck').onclick=()=>{if(checked)return;const r=S.check(caso,box);if(r===null){$('#simMsg').textContent='Completa tu respuesta antes de revisar.';return}
  checked=true;D.n++;if(r.ok)D.ok++;const sc=Math.round(D.ok/D.n*100);
  box.insertAdjacentHTML('beforeend',`<div class="why show" style="${r.ok?'':'background:var(--bad-soft);border-color:var(--bad-line)'}"><h4>${r.ok?'✔ ¡Bien resuelto!':'✘ Revisa la solución'}</h4>${r.sol}</div>`);
  $$('input,select,button.hs',box).forEach(x=>x.disabled=true);
  report(sc,D.n>=MIN?'completed':null,false);
  $('#simCheck').hidden=true;$('#simNext').hidden=false;cnt()};
 $('#simNext').onclick=nuevo;
 $('[data-start]').onclick=()=>{$('#intro').hidden=true;$('#sim').hidden=false;nuevo();cnt()};
 if(S.calc)S.calc();cnt();
}
})();

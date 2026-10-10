(function(){
/* Motor común de lecciones · IA aplicada a la Gestión de Remuneraciones
   Basado en la estructura de la Lección 5.1 de referencia (ruta lateral, pantallas con
   compuertas, video por capítulos, comprobación 80 % y registro SCORM 1.2).
   La configuración de cada lección llega en window.LESSON. */
const L=window.LESSON;
const AUD=L.audio||{};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const fmt=h=>{const m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0')};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Navegación con ruta obligatoria ---------- */
const slides=$$('.slide');
const S={cur:0,max:0,completed:false,done:new Set(),first:{},quiz:{answers:[],score:0,taken:false}};
const list=$('#topicList');
slides.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='topic-link';b.dataset.go=i;
  b.innerHTML=`<span class="dotnum">${i===slides.length-1?'✓':i+1}</span><span>${s.dataset.title}</span><span class="lock"></span>`;
  b.addEventListener('click',()=>{go(i);closeRoute()});list.appendChild(b)});
const links=$$('.topic-link');
const gatesOf=i=>(slides[i].dataset.gate||'').split(/\s+/).filter(Boolean);
const slideDone=i=>gatesOf(i).every(g=>S.done.has(g));
function gateMsg(i){const miss=gatesOf(i).filter(g=>!S.done.has(g));if(!miss.length)return '';
  if(miss.length===1&&miss[0]==='pass')return 'Necesitas al menos 80% en la Comprobación para finalizar.';return slides[i].dataset.gateMsg||'Completa la actividad para continuar.'}
function refreshNav(){
  const ok=slideDone(S.cur)||S.completed;
  $('#nextBtn').disabled=S.cur===slides.length-1||!ok;
  $('#prevBtn').disabled=S.cur===0;
  $('#gateMsg').textContent=ok?'':gateMsg(S.cur);
  links.forEach((b,i)=>{const reachable=S.completed||i<=S.max;
    b.disabled=!reachable;b.classList.toggle('active',i===S.cur);
    b.classList.toggle('done',slideDone(i)&&i<=S.max&&i!==S.cur);
    b.querySelector('.lock').textContent=reachable?'':'🔒'});
  $('#navMode').textContent=S.completed?'Navegación libre: vuelve a cualquier tema':'Avanza completando cada actividad';
  $('#routeNow').textContent=`${S.cur+1}/${slides.length} · ${slides[S.cur].dataset.title}`;
}
let go=function(i){
  i=Math.max(0,Math.min(slides.length-1,i));
  if(!S.completed&&i>S.max)return;
  if(V&&slides[S.cur].contains($('#player'))&&S.cur!==i)V.pause();
  S.cur=i;slides.forEach((s,k)=>{s.classList.toggle('active',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});
  if(i===slides.length-1)S.completed=true;
  $('#counter').textContent=`Pantalla ${i+1} de ${slides.length}`;
  $('#progressBar').style.width=`${(i+1)/slides.length*100}%`;
  if(slides[i].dataset.report!==undefined)renderReport();
  refreshNav();window.scrollTo({top:0,behavior:'smooth'});
  PN.stop();if(autoBox&&autoBox.checked&&interacted&&slides[i].dataset.audio)setTimeout(()=>{if(S.cur===i)PN.play(slides[i])},450);
};
let done=function(key){S.done.add(key);refreshNav()};
$('#prevBtn').addEventListener('click',()=>go(S.cur-1));
$('#nextBtn').addEventListener('click',()=>{if(slideDone(S.cur)||S.completed){S.max=Math.max(S.max,S.cur+1);go(S.cur+1)}});
const panel=$('#topicPanel'),rb=$('#routeBtn');
function closeRoute(){panel.classList.remove('open');rb.setAttribute('aria-expanded','false')}
rb.addEventListener('click',()=>{const o=panel.classList.toggle('open');rb.setAttribute('aria-expanded',o?'true':'false')});
slides.forEach((s,i)=>s.dataset.idx=i);

/* ---------- Narración por pantalla (solo lecciones con voz) ---------- */
const pA=new Audio();pA.preload='none';
let V=null;
const PN={slide:null,
  stop(){pA.pause();this.slide=null;$$('.narr').forEach(b=>{b.classList.remove('playing');b.querySelector('.ic').textContent='▶'})},
  play(sl){if(!AUD[sl.dataset.audio])return;if(V)V.pause();this.stop();this.slide=sl;pA.src=AUD[sl.dataset.audio];const b=$('.narr',sl);b.classList.add('playing');b.querySelector('.ic').textContent='❚❚';
    const p=pA.play();if(p&&p.catch)p.catch(()=>this.stop())},
  toggle(sl){if(this.slide===sl&&!pA.paused)this.stop();else this.play(sl)}};
$$('.slide[data-audio]').forEach(sl=>{if(!AUD[sl.dataset.audio])return;const row=document.createElement('div');row.className='narr-row';
  row.innerHTML=`<button class="narr" type="button" aria-label="Escuchar narración de esta pantalla"><span class="ic">▶</span><span>Escuchar narración</span><span class="nbar"><span></span></span><span class="nt">${sl.dataset.dur||''}</span></button>`;
  sl.prepend(row);$('.narr',row).addEventListener('click',()=>PN.toggle(sl))});
pA.addEventListener('timeupdate',()=>{if(!PN.slide||!pA.duration)return;const b=$('.narr',PN.slide);b.querySelector('.nbar span').style.width=(pA.currentTime/pA.duration*100)+'%';b.querySelector('.nt').textContent=fmt(pA.currentTime/60)});
pA.addEventListener('ended',()=>{const sl=PN.slide;PN.stop();if(sl){$('.narr .nt',sl).textContent=sl.dataset.dur;$('.narr .nbar span',sl).style.width='100%'}});
const autoBox=$('#autoNarr');
if(autoBox){if(store.get(L.id+'-autonarr')==='0')autoBox.checked=false;
  autoBox.addEventListener('change',()=>{store.set(L.id+'-autonarr',autoBox.checked?'1':'0');if(!autoBox.checked)PN.stop()})}
let interacted=false;document.addEventListener('pointerdown',()=>{interacted=true},{once:true,capture:true});
document.addEventListener('keydown',()=>{interacted=true},{once:true,capture:true});

/* ---------- Utilidades ---------- */
function tracker(key,total,root){const seen=new Set();const tick=$('.tick',root),task=$('.task',root);
  const upd=()=>{if(tick)tick.textContent=`${Math.min(seen.size,total)} / ${total}`;if(seen.size>=total){if(task)task.classList.add('ok');done(key)}};upd();
  return id=>{seen.add(id);upd()}}
function feedback(el,ok,title,body,retry){el.innerHTML=`<div class="feedback ${ok?'good':'bad'}"><strong>${title}</strong> <span class="fb-body">${body}</span>${retry?'<div style="margin-top:10px"><button class="small-btn retry" type="button">Intentar de nuevo</button></div>':''}</div>`;
  const r=$('.retry',el);if(r&&retry)r.addEventListener('click',retry)}
function shuffleBy(arr,order){return order?order.map(i=>arr[i]):arr}

/* ---------- Decisiones con consecuencias ---------- */
function setupChoice(box){
  const key=box.dataset.choice,correct=box.dataset.correct,sec=box.closest('section');
  const fb=box.nextElementSibling,opts=$$('.opt',box);
  opts.forEach(b=>b.addEventListener('click',()=>{
    const o=b.dataset.opt,ok=o===correct;if(!(key in S.first))S.first[key]=ok;
    opts.forEach(x=>{x.disabled=true;x.classList.toggle('dim',x!==b)});b.classList.remove('dim');b.classList.add(ok?'good':'bad');
    const t=$(`template[data-for="${key}-${o}"]`,sec);fb.innerHTML='';fb.appendChild(t.content.cloneNode(true));
    const r=$('.retry',fb);if(r)r.addEventListener('click',()=>{fb.innerHTML='';opts.forEach(x=>{x.disabled=false;x.classList.remove('good','bad','dim')});opts[0].focus()});
    if(ok){const nxt=box.dataset.then?$('#'+box.dataset.then):null;if(nxt){nxt.hidden=false;setTimeout(()=>nxt.scrollIntoView({behavior:'smooth',block:'start'}),200)}else done(box.dataset.gate||key)}
    fb.firstElementChild&&fb.firstElementChild.scrollIntoView({behavior:'smooth',block:'nearest'});
  }));
}
$$('[data-choice]').forEach(setupChoice);

/* ---------- Video por capítulos (narrado o silencioso) ---------- */
if(L.video&&$('#player')){
  const VID=L.video,silent=!VID.voice;
  VID.scenes.forEach((sc,si)=>{
    if(!VID.durs||VID.durs[si]==null){(VID.durs=VID.durs||[])[si]=sc.lines.reduce((a,l)=>a+Math.max(3.2,l.split(/\s+/).length/2.4+1.2),0)}
    sc.dur=VID.durs[si];const w=sc.lines.map(l=>l.split(/\s+/).length),tw=w.reduce((x,y)=>x+y,0);let acc=0;sc.starts=w.map(x=>{const st=acc/tw*sc.dur;acc+=x;return st})});
  const vTotal=VID.durs.reduce((x,y)=>x+y,0),sceneStart=si=>VID.durs.slice(0,si).reduce((x,y)=>x+y,0);
  $('#transcript').innerHTML=VID.scenes.map(s=>`<p><strong>${s.t}.</strong> ${s.lines.join(' ')}</p>`).join('');
  const chapWrap=$('#chapters');
  VID.scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='chap';b.textContent=`${i+1}. ${s.t}`;b.addEventListener('click',()=>V.jump(i));chapWrap.appendChild(b)});
  const chaps=$$('.chap');
  /* Reloj: audio real si hay voz; temporizador si es silencioso */
  const vA=new Audio();vA.preload='auto';
  const clock={t:0,run:false,last:0,raf:0,
    get time(){return silent?this.t:vA.currentTime},
    set(src){if(silent){this.t=0}else{vA.src=src}},
    play(){if(silent){this.run=true;this.last=performance.now();const tick=now=>{if(!this.run)return;this.t+=(now-this.last)/1000;this.last=now;onTime();this.raf=requestAnimationFrame(tick)};this.raf=requestAnimationFrame(tick)}
      else{const p=vA.play();if(p&&p.catch)p.catch(()=>{vA.muted=true;updMute();vA.play().catch(()=>{})})}},
    pause(){if(silent){this.run=false;cancelAnimationFrame(this.raf)}else vA.pause()}};
  function onTime(){const sc=VID.scenes[V.si];V.sync(clock.time);if(silent&&clock.t>=sc.dur)onEnded()}
  function onEnded(){if(V.si<VID.scenes.length-1){V.load(V.si+1);if(V.playing)clock.play()}else{clock.pause();V.playing=false;V.ended=true;V.sync(VID.scenes[V.si].dur);done('video');V.btn();$('#vPlay').textContent='↺ Repetir'}}
  if(!silent){vA.addEventListener('timeupdate',onTime);vA.addEventListener('ended',onEnded)}
  V={si:0,li:-1,playing:false,ended:false,seen:new Set(),
    renderScene(si){const sc=VID.scenes[si],el=$('#scene');el.innerHTML=sc.html;el.style.animation='none';void el.offsetWidth;el.style.animation='';
      $('#stageTag').textContent=`Capítulo ${si+1} de ${VID.scenes.length} · ${sc.t}`;chaps.forEach((c,k)=>c.classList.toggle('on',k===si))},
    load(si,mark){clock.pause();this.si=si;this.li=-1;clock.set(AUD['video_'+(si+1)]);this.renderScene(si);this.sync(0,mark)},
    sync(t,mark=true){const sc=VID.scenes[this.si];let li=0;sc.starts.forEach((st,k)=>{if(t>=st-0.05)li=k});
      if(li!==this.li){this.li=li;$$('#scene [data-at]').forEach(e=>e.classList.toggle('on',li>=+e.dataset.at));$('#caption').textContent=sc.lines[li]}
      if(mark){this.seen.add(this.si);chaps[this.si].classList.add('seen')}
      const e=sceneStart(this.si)+Math.min(t,sc.dur);$('#vBar').style.width=(e/vTotal*100)+'%';$('#vTime').textContent=`${fmt(e/60)} / ${fmt(vTotal/60)}`;
      if(this.si===VID.scenes.length-1&&this.seen.size===VID.scenes.length)done('video')},
    play(){if(this.ended){this.ended=false;this.load(0)}this.playing=true;$('#bigPlay').hidden=true;PN.stop();clock.play();this.btn()},
    pause(){this.playing=false;clock.pause();this.btn()},
    jump(si){this.ended=false;this.load(si,true);$('#bigPlay').hidden=true;if(this.playing)clock.play();this.btn()},
    btn(){$('#vPlay').textContent=this.playing?'❚❚ Pausa':'▶ Reproducir'}};
  V.load(0,false);V.li=-1;$('#caption').textContent='Presiona reproducir para comenzar.';
  $('#bigPlay').addEventListener('click',()=>V.play());
  $('#vPlay').addEventListener('click',()=>V.playing?V.pause():V.play());
  $('#vPrev').addEventListener('click',()=>V.jump(Math.max(0,V.si-1)));
  $('#vNext').addEventListener('click',()=>V.jump(Math.min(VID.scenes.length-1,V.si+1)));
  $('#vCC').addEventListener('click',e=>{e.currentTarget.classList.toggle('on');$('#caption').classList.toggle('off')});
  function updMute(){const b=$('#vMute');if(!b)return;b.classList.toggle('on',!vA.muted);b.textContent=vA.muted?'🔇 Silencio':'🔊 Sonido'}
  const mb=$('#vMute');if(mb){if(silent)mb.remove();else mb.addEventListener('click',()=>{vA.muted=!vA.muted;updMute()})}
}

/* ---------- Pestañas ---------- */
$$('[data-tabs]').forEach(root=>{const key=root.dataset.tabs,tabs=$$('.tab',root),panes=$$('.tabpane',root);
  const t=tracker(key,tabs.length,root);
  const open=k=>{tabs[k].classList.add('seen');tabs.forEach((x,i)=>x.classList.toggle('active',i===k));panes.forEach((p,i)=>p.classList.toggle('active',i===k));t(k)};
  tabs.forEach((b,k)=>b.addEventListener('click',()=>open(k)));open(0)});

/* ---------- Acordeón ---------- */
$$('[data-acc]').forEach(root=>{const key=root.dataset.acc,items=$$('.acc-item',root);const t=tracker(key,items.length,root);
  items.forEach((it,k)=>$('.acc-head',it).addEventListener('click',()=>{const o=!it.classList.contains('open');items.forEach(x=>x.classList.remove('open'));if(o){it.classList.add('open','seen');t(k)}}))});

/* ---------- Tarjetas que se voltean ---------- */
$$('[data-flip]').forEach(root=>{const cards=$$('.flip',root),t=tracker(root.dataset.flip,cards.length,root);
  cards.forEach((c,k)=>c.addEventListener('click',()=>{c.classList.toggle('flipped');t(k)}))});

/* ---------- Hotspots ---------- */
$$('[data-hotspot]').forEach(root=>{const key=root.dataset.hotspot,data=L.hotspots[key],pts=$$('.hs',root),pan=$('.hs-panel',root);
  const t=tracker(key,pts.length,root);
  pts.forEach(b=>b.addEventListener('click',()=>{const k=+b.dataset.k,d=data[k];pts.forEach(x=>x.classList.toggle('active',x===b));b.classList.add('seen');
    pan.innerHTML=`<h3 style="margin-top:0">${d.t}</h3>${d.lvl?`<span class="lvl ${d.lvl[0]}">${d.lvl[1]}</span>`:''}<div class="pp">${d.html}</div>`;t(k)}))});

/* ---------- Clasificar (arrastrar o tocar) ---------- */
$$('[data-sort]').forEach(root=>{const key=root.dataset.sort,cfg=L.sorts[key],pool=$('.pool',root),binsEl=$('.bins',root),fb=$('.fb',root);
  const t=tracker(key,cfg.items.length,root);let sel=null;
  binsEl.innerHTML=cfg.bins.map(b=>`<div class="bin ${b.cls||''}" data-b="${b.id}" role="button" tabindex="0" aria-label="Columna ${esc(b.title)}"><h3>${b.title}</h3>${b.sub?`<small>${b.sub}</small>`:''}</div>`).join('');
  pool.innerHTML=shuffleBy(cfg.items.map((it,i)=>[it,i]),cfg.order).map(([it,i])=>`<button class="cardx" type="button" draggable="true" data-i="${i}">${it.t}</button>`).join('');
  const select=c=>{sel=c;$$('.cardx',pool).forEach(x=>x.classList.toggle('sel',x===c))};
  function place(i,binEl){const it=cfg.items[i],c=$(`.cardx[data-i="${i}"]`,pool);if(!c)return;
    if(it.bin===binEl.dataset.b){c.remove();c.classList.remove('sel');c.classList.add('placed','good');c.draggable=false;c.textContent='✓ '+c.textContent;binEl.appendChild(c);
      if(!(('s'+i) in S.first))S.first['s'+i]=true;feedback(fb,true,'Bien clasificada.',it.why);sel=null;t(i)}
    else{if(!(('s'+i) in S.first))S.first['s'+i]=false;binEl.classList.remove('shake');void binEl.offsetWidth;binEl.classList.add('shake');
      feedback(fb,false,'Revisa esta clasificación.',it.hint||'Piensa en el riesgo para la exactitud del pago y la confidencialidad de los datos.')}}
  $$('.cardx',pool).forEach(c=>{c.addEventListener('click',()=>select(c));
    c.addEventListener('dragstart',e=>{select(c);try{e.dataTransfer.setData('text/plain',c.dataset.i)}catch(_){}})});
  $$('.bin',binsEl).forEach(b=>{
    b.addEventListener('click',e=>{if(e.target.closest('.cardx.placed'))return;if(!sel){feedback(fb,false,'Primero elige una tarea.','Toca una tarjeta y luego la columna donde corresponde, o arrástrala.');return}place(sel.dataset.i,b)});
    b.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&sel){e.preventDefault();place(sel.dataset.i,b)}});
    b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('dragover')});
    b.addEventListener('dragleave',()=>b.classList.remove('dragover'));
    b.addEventListener('drop',e=>{e.preventDefault();b.classList.remove('dragover');let i=null;try{i=e.dataTransfer.getData('text/plain')}catch(_){}if(i==null||i==='')i=sel&&sel.dataset.i;if(i!=null)place(i,b)})});
});

/* ---------- Emparejar ---------- */
$$('[data-pairs]').forEach(root=>{const key=root.dataset.pairs,cfg=L.pairs[key],fb=$('.fb',root);let selL=null,n=0;
  const t=tracker(key,cfg.items.length,root);
  $('.pl-col',root).innerHTML=cfg.items.map((p,i)=>`<button class="pl" type="button" data-i="${i}">${p[0]}</button>`).join('');
  $('.pr-col',root).innerHTML=shuffleBy(cfg.items.map((p,i)=>i),cfg.order).map(i=>`<button class="pr" type="button" data-i="${i}">${cfg.items[i][1]}</button>`).join('');
  $$('.pl',root).forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('done'))return;selL=b.dataset.i;$$('.pl',root).forEach(x=>x.classList.toggle('sel',x===b))}));
  $$('.pr',root).forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('done'))return;
    if(selL==null){feedback(fb,false,'Primero elige una necesidad.','Selecciona un elemento de la columna izquierda.');return}
    if(b.dataset.i===selL){b.classList.add('done');const l=$(`.pl[data-i="${selL}"]`,root);l.classList.add('done');l.classList.remove('sel');l.textContent='✓ '+l.textContent;
      feedback(fb,true,'Pareja correcta.',cfg.items[+selL][2]);t(selL);selL=null}
    else{b.classList.remove('wrong');void b.offsetWidth;b.classList.add('wrong');feedback(fb,false,'No corresponde.',cfg.hint||'Fíjate en qué hace cada modalidad y qué datos necesita.')}}));
});

/* ---------- Tabla comparativa con revelado ---------- */
$$('[data-reveal]').forEach(root=>{const rows=$$('tbody tr',root),t=tracker(root.dataset.reveal,rows.length,root);
  rows.forEach((r,k)=>$('td',r).addEventListener('click',()=>{r.classList.add('open');t(k)}))});

/* ---------- Bandeja / correo / apps que se abren ---------- */
$$('[data-open]').forEach(root=>{const items=$$('[data-o]',root),t=tracker(root.dataset.open,items.length,root);
  items.forEach((it,k)=>it.addEventListener('click',()=>{it.classList.add('open','read');t(k);
    if(root.dataset.then&&items.every(x=>x.classList.contains('open'))){const n=$('#'+root.dataset.then);if(n&&n.hidden){n.hidden=false;setTimeout(()=>n.scrollIntoView({behavior:'smooth',block:'start'}),250)}}}))});

/* ---------- Constructor (matriz o ficha) con respuesta modelo ---------- */
$$('[data-builder]').forEach(root=>{const key=root.dataset.builder,cfg=L.builders[key],box=$('.builder',root),out=$('.out-wrap',root),btn=$('.mk',root),mb=$('.model-btn',root);
  box.innerHTML=cfg.rows.map((r,i)=>r.type==='text'
    ?`<div class="brow full"><label for="${key}_${i}">${r.label}</label><textarea id="${key}_${i}" data-r="${i}" placeholder="${esc(r.ph||'')}"></textarea></div>`
    :`<div class="brow"><label for="${key}_${i}">${r.label}</label><select id="${key}_${i}" data-r="${i}"><option value="">Elige…</option>${r.options.map((o,j)=>`<option value="${j}">${o}</option>`).join('')}</select>${r.why?`<div class="bwhy">${r.why}</div>`:''}</div>`).join('');
  const fields=$$('[data-r]',box);
  const ready=()=>cfg.rows.every((r,i)=>r.type==='text'||fields[i].value!=='');
  fields.forEach(f=>f.addEventListener('input',()=>{btn.disabled=!ready()}));btn.disabled=true;
  btn.addEventListener('click',()=>{const vals=cfg.rows.map((r,i)=>r.type==='text'?fields[i].value.trim():{i:+fields[i].value,t:r.options[+fields[i].value]});
    const res=(L.builderRender&&L.builderRender[key])?L.builderRender[key](vals,cfg):defaultRender(vals,cfg);
    out.innerHTML=res;out.hidden=false;if(mb)mb.disabled=false;done(key);
    const cp=$('.copy',out);if(cp)cp.addEventListener('click',()=>{const txt=$('.out',out).innerText;(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{cp.textContent='✓ Copiado'},()=>{cp.textContent='Selecciona y copia el texto'})})});
  if(mb)mb.addEventListener('click',()=>{box.classList.add('show-model');const m=$('.model',root);if(m)m.hidden=false;done(key+'_model')});
  function defaultRender(vals,cfg){return `<div class="out"><strong>${cfg.title}</strong><table><thead><tr><th>${cfg.colA||'Elemento'}</th><th>${cfg.colB||'Tu decisión'}</th></tr></thead><tbody>${cfg.rows.map((r,i)=>r.type==='text'?(vals[i]?`<tr><td>${r.label}</td><td>${esc(vals[i])}</td></tr>`:''):`<tr><td>${r.label}</td><td>${vals[i].t}</td></tr>`).join('')}</tbody></table><div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar</button></div></div>`}
});

/* ---------- Comprobación (80 %) con feedback por alternativa ---------- */
const Q=L.quiz||[];const PASS=L.pass||0.8,passScore=()=>Q.length&&S.quiz.score/Q.length>=PASS;let qi=0;
function qRender(){if(!$('#qcard'))return;
  $('#qdots').innerHTML=Q.map((_,i)=>{const a=S.quiz.answers[i];return `<span class="${a==null?(i===qi?'cur':''):(a===Q[i].c?'g':'b')}"></span>`}).join('');
  const card=$('#qcard');const need=Math.ceil(PASS*Q.length);
  if(qi>=Q.length){const sc=S.quiz.answers.filter((a,i)=>a===Q[i].c).length;S.quiz.score=sc;S.quiz.taken=true;const pass=passScore();
    if(pass)S.done.add('pass');else S.done.delete('pass');
    card.innerHTML=`<div class="score"><div class="ring" style="background:conic-gradient(var(--teal) ${sc/Q.length*360}deg,var(--track) 0)"><span style="background:var(--surface3);width:84px;height:84px;border-radius:50%;display:grid;place-items:center">${Math.round(sc/Q.length*100)}%</span></div><div><h3>${pass?'Aprobado':'Aún no alcanzas el 80%'} · ${sc} de ${Q.length} correctas</h3><p>${pass?'Dominas los criterios clave. Continúa con la siguiente pantalla.':`Necesitas al menos 80% (${need} de ${Q.length}) para finalizar. Repasa el video o las pantallas anteriores y vuelve a intentarlo.`}</p>${pass?'':'<button class="small-btn primary" type="button" id="qRetry">Reintentar</button>'}</div></div>`;
    const r=$('#qRetry');if(r)r.addEventListener('click',()=>{S.quiz.answers=[];qi=0;S.done.delete('pass');qRender()});
    done('quiz');renderPassBox();return}
  const q=Q[qi];
  card.innerHTML=`<p class="hint">Pregunta ${qi+1} de ${Q.length}</p><h3>${q.q}</h3><div class="options">${q.o.map((o,i)=>`<button class="opt" type="button" data-i="${i}"><span class="letter">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div><div class="fb"></div>`;
  $$('.opt',card).forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i,ok=i===q.c;S.quiz.answers[qi]=i;
    $$('.opt',card).forEach((x,k)=>{x.disabled=true;if(k===q.c)x.classList.add('good');else if(k===i)x.classList.add('bad');else x.classList.add('dim')});
    const f=Array.isArray(q.f)?q.f[i]:q.f;
    $('.fb',card).innerHTML=`<div class="feedback ${ok?'good':'bad'}"><strong>${ok?'Correcto.':'Incorrecto.'}</strong> <span class="fb-body">${f}</span>${!ok&&Array.isArray(q.f)?`<span class="fb-body quiz-opt-fb"><b>La respuesta correcta es la ${'ABCD'[q.c]}:</b> ${q.f[q.c]}</span>`:''}<div style="margin-top:10px"><button class="small-btn primary" type="button" id="qNext">${qi<Q.length-1?'Siguiente pregunta →':'Ver resultado'}</button></div></div>`;
    $('#qNext').addEventListener('click',()=>{qi++;qRender()});$('#qdots').children[qi].className=ok?'g':'b'}));
}
qRender();
function renderPassBox(){const el=$('#passBox');if(!el)return;const pct=Math.round(S.quiz.score/Q.length*100);
  el.innerHTML=!S.quiz.taken?'':passScore()?`<div class="feedback good"><strong>Comprobación: ${pct}%.</strong> <span class="fb-body">Superaste el mínimo de 80%. Completa esta actividad y presiona <b>Siguiente</b> para finalizar.</span></div>`
    :`<div class="feedback bad"><strong>Comprobación: ${pct}%.</strong> <span class="fb-body">Necesitas al menos 80% para finalizar la lección.</span><div style="margin-top:10px"><button class="small-btn primary" type="button" id="toQuiz">Volver a la Comprobación</button></div></div>`;
  const tq=$('#toQuiz');if(tq)tq.addEventListener('click',()=>{S.quiz.answers=[];qi=0;S.done.delete('pass');qRender();go(+$('#qcard').closest('section').dataset.idx)})}
function renderReport(){const pct=Q.length?Math.round(S.quiz.score/Q.length*100):0;const fk=Object.keys(S.first);
  if($('#fPct'))$('#fPct').textContent=`${pct}%`;
  if($('#fEsc'))$('#fEsc').textContent=`${fk.filter(k=>S.first[k]).length} / ${fk.length}`}
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.goto)));

/* ---------- Ganchos propios de la lección ---------- */
if(typeof L.init==='function')L.init({$,$$,done:k=>done(k),feedback,S,esc,go:i=>go(i)});

/* ---------- SCORM 1.2 ---------- */
const SC=(function(){
  function find(w){let n=0;try{while(w&&!w.API&&w.parent&&w.parent!==w&&n<10){w=w.parent;n++}return w&&w.API?w.API:null}catch(e){return null}}
  let api=find(window);if(!api){try{if(window.opener)api=find(window.opener)}catch(e){}}
  let ok=false,fin=false;if(api){try{ok=String(api.LMSInitialize(''))==='true'}catch(e){}}
  const get=k=>{try{return ok?String(api.LMSGetValue(k)||''):''}catch(e){return ''}};
  const set=(k,v)=>{try{if(ok)api.LMSSetValue(k,String(v))}catch(e){}};
  const commit=()=>{try{if(ok)api.LMSCommit('')}catch(e){}};
  const finish=()=>{if(!ok||fin)return;fin=true;try{api.LMSFinish('')}catch(e){}};
  return {get ok(){return ok&&!fin},get,set,commit,finish}})();
const T0=Date.now();let startSlide=0;
function scSave(){if(!SC.ok)return;
  const d={v:1,cur:S.cur,max:S.max,done:[...S.done],first:S.first,qa:S.quiz.answers.length===Q.length?S.quiz.answers:[],c:S.completed};
  SC.set('cmi.suspend_data',JSON.stringify(d));SC.set('cmi.core.lesson_location',String(S.cur));
  if(S.quiz.taken){SC.set('cmi.core.score.min',0);SC.set('cmi.core.score.max',100);SC.set('cmi.core.score.raw',Math.round(S.quiz.score/Q.length*100))}
  if(S.completed&&passScore())SC.set('cmi.core.lesson_status','passed');SC.commit()}
if(SC.ok){const st=SC.get('cmi.core.lesson_status');if(st===''||st==='not attempted')SC.set('cmi.core.lesson_status','incomplete');
  try{const d=JSON.parse(SC.get('cmi.suspend_data')||'{}');if(d.v===1){S.max=+d.max||0;(d.done||[]).forEach(k=>S.done.add(k));S.first=d.first||{};S.completed=!!d.c;
    if(d.qa&&d.qa.length===Q.length){S.quiz.answers=d.qa;qi=Q.length;qRender()}
    startSlide=Math.max(0,Math.min(+d.cur||0,S.completed?slides.length-1:S.max))}}catch(e){}
  const _go=go;go=function(i){_go(i);scSave()};const _done=done;done=function(k){_done(k);scSave()};
  const bye=()=>{if(!SC.ok)return;scSave();const s=Math.round((Date.now()-T0)/1000),p=n=>String(n).padStart(2,'0');
    SC.set('cmi.core.session_time',`${String(Math.floor(s/3600)).padStart(4,'0')}:${p(Math.floor(s/60)%60)}:${p(s%60)}.00`);
    SC.set('cmi.core.exit',S.completed&&passScore()?'':'suspend');SC.commit();SC.finish()};
  window.addEventListener('pagehide',bye);window.addEventListener('beforeunload',bye)}
go(startSlide);
})();

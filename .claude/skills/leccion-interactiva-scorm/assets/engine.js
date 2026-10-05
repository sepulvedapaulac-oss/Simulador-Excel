const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const fmt=h=>{const m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0')};
const clp=n=>'$'+Math.round(n).toLocaleString('es-CL');

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
function go(i){
  i=Math.max(0,Math.min(slides.length-1,i));
  if(!S.completed&&i>S.max)return;
  if(typeof V!=='undefined'&&slides[S.cur].contains($('#player'))&&S.cur!==i)V.pause();
  S.cur=i;slides.forEach((s,k)=>{s.classList.toggle('active',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});
  if(i===slides.length-1)S.completed=true;
  $('#counter').textContent=`Pantalla ${i+1} de ${slides.length}`;
  $('#progressBar').style.width=`${(i+1)/slides.length*100}%`;
  if(slides[i].dataset.report!==undefined)renderReport();
  refreshNav();window.scrollTo({top:0,behavior:'smooth'});
  PN.stop();if(autoBox.checked&&interacted&&slides[i].dataset.audio)setTimeout(()=>{if(S.cur===i)PN.play(slides[i])},450);
}
function done(key){S.done.add(key);refreshNav()}
function undone(key){S.done.delete(key);refreshNav()}
$('#prevBtn').addEventListener('click',()=>go(S.cur-1));
$('#nextBtn').addEventListener('click',()=>{if(slideDone(S.cur)||S.completed){S.max=Math.max(S.max,S.cur+1);go(S.cur+1)}});
const panel=$('#topicPanel'),rb=$('#routeBtn');
function closeRoute(){panel.classList.remove('open');rb.setAttribute('aria-expanded','false')}
rb.addEventListener('click',()=>{const o=panel.classList.toggle('open');rb.setAttribute('aria-expanded',o?'true':'false')});

/* ---------- Narración por pantalla ---------- */
const pA=new Audio();pA.preload='none';
const PN={slide:null,
  stop(){pA.pause();this.slide=null;$$('.narr').forEach(b=>{b.classList.remove('playing');b.querySelector('.ic').textContent='▶'})},
  play(sl){if(typeof V!=='undefined')V.pause();this.stop();this.slide=sl;pA.src=AUD[sl.dataset.audio];const b=$('.narr',sl);b.classList.add('playing');b.querySelector('.ic').textContent='❚❚';
    const p=pA.play();if(p&&p.catch)p.catch(()=>this.stop())},
  toggle(sl){if(this.slide===sl&&!pA.paused)this.stop();else this.play(sl)}};
$$('.slide[data-audio]').forEach(sl=>{const row=document.createElement('div');row.className='narr-row';
  row.innerHTML=`<button class="narr" type="button" aria-label="Escuchar narración de esta pantalla"><span class="ic">▶</span><span>Escuchar narración</span><span class="nbar"><span></span></span><span class="nt">${sl.dataset.dur}</span></button>`;
  sl.prepend(row);$('.narr',row).addEventListener('click',()=>PN.toggle(sl))});
pA.addEventListener('timeupdate',()=>{if(!PN.slide||!pA.duration)return;const b=$('.narr',PN.slide);b.querySelector('.nbar span').style.width=(pA.currentTime/pA.duration*100)+'%';b.querySelector('.nt').textContent=fmt(pA.currentTime/60)});
pA.addEventListener('ended',()=>{const sl=PN.slide;PN.stop();if(sl){$('.narr .nt',sl).textContent=sl.dataset.dur;$('.narr .nbar span',sl).style.width='100%'}});
const autoBox=$('#autoNarr');if(store.get(LESSON_ID+'-autonarr')==='0')autoBox.checked=false;
autoBox.addEventListener('change',()=>{store.set(LESSON_ID+'-autonarr',autoBox.checked?'1':'0');if(!autoBox.checked)PN.stop()});
let interacted=false;document.addEventListener('pointerdown',()=>{interacted=true},{once:true,capture:true});
document.addEventListener('keydown',()=>{interacted=true},{once:true,capture:true});

/* ---------- Utilidades de actividades ---------- */
function tracker(key,total,tickEl,taskEl){const seen=new Set();
  const upd=()=>{$(tickEl).textContent=`${seen.size} / ${total}`;if(seen.size>=total){$(taskEl).classList.add('ok');done(key)}};upd();
  return id=>{seen.add(id);upd()}}
function feedback(el,ok,title,body,retry){el.innerHTML=`<div class="feedback ${ok?'good':'bad'}"><strong>${title}</strong> <span class="fb-body">${body}</span>${retry?'<div style="margin-top:10px"><button class="small-btn retry" type="button">Intentar de nuevo</button></div>':''}</div>`;
  const r=$('.retry',el);if(r&&retry)r.addEventListener('click',retry)}

/* Decisiones con consecuencias: [data-choice] + <template data-for="clave-LETRA"> en la misma sección */
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

/* ---------- Video explicativo narrado ---------- */
const chapWrap=$('#chapters');
VIDEO.scenes.forEach((sc,si)=>{sc.dur=VIDEO.durs[si];const w=sc.lines.map(l=>l.split(/\s+/).length),tw=w.reduce((x,y)=>x+y,0);let acc=0;sc.starts=w.map(x=>{const st=acc/tw*sc.dur;acc+=x;return st})});
const vTotal=VIDEO.durs.reduce((x,y)=>x+y,0),sceneStart=si=>VIDEO.durs.slice(0,si).reduce((x,y)=>x+y,0);
$('#transcript').innerHTML=VIDEO.scenes.map(s=>`<p><strong>${s.t}.</strong> ${s.lines.join(' ')}</p>`).join('');
VIDEO.scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='chap';b.textContent=`${i+1}. ${s.t}`;b.addEventListener('click',()=>V.jump(i));chapWrap.appendChild(b)});
const chaps=$$('.chap');
const vA=new Audio();vA.preload='auto';
const V={si:0,li:-1,playing:false,ended:false,seen:new Set(),
  renderScene(si){const sc=VIDEO.scenes[si],el=$('#scene');el.innerHTML=sc.html;el.style.animation='none';void el.offsetWidth;el.style.animation='';
    $('#stageTag').textContent=`Capítulo ${si+1} de ${VIDEO.scenes.length} · ${sc.t}`;chaps.forEach((c,k)=>c.classList.toggle('on',k===si))},
  load(si,mark){this.si=si;this.li=-1;vA.src=AUD['video_'+(si+1)];this.renderScene(si);this.sync(0,mark)},
  sync(t,mark=true){const sc=VIDEO.scenes[this.si];let li=0;sc.starts.forEach((st,k)=>{if(t>=st-0.05)li=k});
    if(li!==this.li){this.li=li;$$('#scene [data-at]').forEach(e=>e.classList.toggle('on',li>=+e.dataset.at));$('#caption').textContent=sc.lines[li]}
    if(mark){this.seen.add(this.si);chaps[this.si].classList.add('seen')}
    const e=sceneStart(this.si)+Math.min(t,sc.dur);$('#vBar').style.width=(e/vTotal*100)+'%';$('#vTime').textContent=`${fmt(e/60)} / ${fmt(vTotal/60)}`;
    if(this.si===VIDEO.scenes.length-1&&this.seen.size===VIDEO.scenes.length)done('video')},
  start(){const p=vA.play();if(p&&p.catch)p.catch(()=>{vA.muted=true;updMute();vA.play().catch(()=>{})})},
  play(){if(this.ended){this.ended=false;this.load(0)}this.playing=true;$('#bigPlay').hidden=true;PN.stop();this.start();this.btn()},
  pause(){this.playing=false;vA.pause();this.btn()},
  jump(si){this.ended=false;this.load(si,true);$('#bigPlay').hidden=true;if(this.playing)this.start();this.btn()},
  btn(){$('#vPlay').textContent=this.playing?'❚❚ Pausa':'▶ Reproducir'}};
vA.addEventListener('timeupdate',()=>V.sync(vA.currentTime));
vA.addEventListener('ended',()=>{if(V.si<VIDEO.scenes.length-1){V.load(V.si+1);if(V.playing)V.start()}else{V.playing=false;V.ended=true;V.sync(VIDEO.scenes[V.si].dur);done('video');V.btn();$('#vPlay').textContent='↺ Repetir'}});
V.load(0,false);V.li=-1;$('#caption').textContent='Presiona reproducir para comenzar.';
$('#bigPlay').addEventListener('click',()=>V.play());
$('#vPlay').addEventListener('click',()=>V.playing?V.pause():V.play());
$('#vPrev').addEventListener('click',()=>V.jump(Math.max(0,V.si-1)));
$('#vNext').addEventListener('click',()=>V.jump(Math.min(VIDEO.scenes.length-1,V.si+1)));
$('#vCC').addEventListener('click',e=>{e.currentTarget.classList.toggle('on');$('#caption').classList.toggle('off')});
function updMute(){const b=$('#vMute');b.classList.toggle('on',!vA.muted);b.textContent=vA.muted?'🔇 Silencio':'🔊 Sonido'}
$('#vMute').addEventListener('click',()=>{vA.muted=!vA.muted;updMute()});

/* ---------- Comprobación (80%) ---------- */
const PASS=0.8,passScore=()=>S.quiz.score/Q.length>=PASS;let qi=0;
function qRender(){
  $('#qdots').innerHTML=Q.map((_,i)=>{const a=S.quiz.answers[i];return `<span class="${a==null?(i===qi?'cur':''):(a===Q[i].c?'g':'b')}"></span>`}).join('');
  const card=$('#qcard');
  if(qi>=Q.length){const sc=S.quiz.answers.filter((a,i)=>a===Q[i].c).length;S.quiz.score=sc;S.quiz.taken=true;const pass=passScore();
    if(pass)S.done.add('pass');else S.done.delete('pass');
    card.innerHTML=`<div class="score"><div class="ring" style="background:conic-gradient(var(--teal) ${sc/Q.length*360}deg,var(--track) 0)"><span style="background:var(--surface3);width:84px;height:84px;border-radius:50%;display:grid;place-items:center">${Math.round(sc/Q.length*100)}%</span></div><div><h3>${pass?'Aprobado':'Aún no alcanzas el 80%'} · ${sc} de ${Q.length} correctas</h3><p>${pass?'Dominas los criterios clave. Continúa con la siguiente pantalla.':'Necesitas al menos 80% (4 de 5) para finalizar. Repasa el video o las pantallas anteriores y vuelve a intentarlo.'}</p>${pass?'':'<button class="small-btn primary" type="button" id="qRetry">Reintentar</button>'}</div></div>`;
    const r=$('#qRetry');if(r)r.addEventListener('click',()=>{S.quiz.answers=[];qi=0;S.done.delete('pass');qRender()});
    done('quiz');renderPassBox();return}
  const q=Q[qi];
  card.innerHTML=`<p class="hint">Pregunta ${qi+1} de ${Q.length}</p><h3>${q.q}</h3><div class="options">${q.o.map((o,i)=>`<button class="opt" type="button" data-i="${i}"><span class="letter">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div><div class="fb"></div>`;
  $$('.opt',card).forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i,ok=i===q.c;S.quiz.answers[qi]=i;
    $$('.opt',card).forEach((x,k)=>{x.disabled=true;if(k===q.c)x.classList.add('good');else if(k===i)x.classList.add('bad');else x.classList.add('dim')});
    $('.fb',card).innerHTML=`<div class="feedback ${ok?'good':'bad'}"><strong>${ok?'Correcto.':'Incorrecto.'}</strong> <span class="fb-body">${q.f}</span><div style="margin-top:10px"><button class="small-btn primary" type="button" id="qNext">${qi<Q.length-1?'Siguiente pregunta →':'Ver resultado'}</button></div></div>`;
    $('#qNext').addEventListener('click',()=>{qi++;qRender()});$('#qdots').children[qi].className=ok?'g':'b'}));
}
qRender();
function renderPassBox(){const el=$('#passBox');if(!el)return;const pct=Math.round(S.quiz.score/Q.length*100);
  el.innerHTML=!S.quiz.taken?'':passScore()?`<div class="feedback good"><strong>Comprobación: ${pct}%.</strong> <span class="fb-body">Superaste el mínimo de 80%. Completa esta actividad y presiona <b>Siguiente</b> para finalizar.</span></div>`
    :`<div class="feedback bad"><strong>Comprobación: ${pct}%.</strong> <span class="fb-body">Necesitas al menos 80% para finalizar la lección.</span><div style="margin-top:10px"><button class="small-btn primary" type="button" id="toQuiz">Volver a la Comprobación</button></div></div>`;
  const tq=$('#toQuiz');if(tq)tq.addEventListener('click',()=>{S.quiz.answers=[];qi=0;S.done.delete('pass');qRender();go(+$('#qcard').closest('section').dataset.idx)})}
slides.forEach((s,i)=>s.dataset.idx=i);
function renderReport(){const pct=Math.round(S.quiz.score/Q.length*100);
  if($('#fPct'))$('#fPct').textContent=`${pct}%`;
  if($('#fEsc'))$('#fEsc').textContent=`${FIRST_KEYS.filter(k=>S.first[k]).length} / ${FIRST_KEYS.length}`}
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.goto)));

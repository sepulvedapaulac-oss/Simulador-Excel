(function(){
/* Motor común de lecciones (estructura homologada con Lección 3.1). Configuración en window.L */
const L=window.L,AUD=L.aud,LESSON_ID=L.id,FIRST_KEYS=L.first,VIDEO=L.video,Q=L.Q;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const fmt=h=>{const m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0')};

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
  if(slides[S.cur].contains($('#player'))&&S.cur!==i)V.pause();
  S.cur=i;slides.forEach((s,k)=>{s.classList.toggle('active',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});
  if(i===slides.length-1)S.completed=true;
  $('#counter').textContent=`Pantalla ${i+1} de ${slides.length}`;
  $('#progressBar').style.width=`${(i+1)/slides.length*100}%`;
  if(slides[i].dataset.report!==undefined)renderReport();
  if(slides[i].querySelector('#passBox'))renderPassBox();
  refreshNav();window.scrollTo({top:0,behavior:'smooth'});
  PN.stop();if(autoBox.checked&&interacted&&slides[i].dataset.audio)setTimeout(()=>{if(S.cur===i)PN.play(slides[i])},450);
};
let done=function(key){S.done.add(key);refreshNav()};
$('#prevBtn').addEventListener('click',()=>go(S.cur-1));
$('#nextBtn').addEventListener('click',()=>{if(slideDone(S.cur)||S.completed){S.max=Math.max(S.max,S.cur+1);go(S.cur+1)}});
const panel=$('#topicPanel'),rb=$('#routeBtn');
function closeRoute(){panel.classList.remove('open');rb.setAttribute('aria-expanded','false')}
rb.addEventListener('click',()=>{const o=panel.classList.toggle('open');rb.setAttribute('aria-expanded',o?'true':'false')});

/* ---------- Narración por pantalla (voz Ninoska) ---------- */
const pA=new Audio();pA.preload='none';
const PN={slide:null,
  stop(){pA.pause();this.slide=null;$$('.narr').forEach(b=>{b.classList.remove('playing');b.querySelector('.ic').textContent='▶'})},
  play(sl){V.pause();this.stop();this.slide=sl;pA.src=AUD[sl.dataset.audio];const b=$('.narr',sl);b.classList.add('playing');b.querySelector('.ic').textContent='❚❚';
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
function firstTry(key,ok){if(!(key in S.first))S.first[key]=ok}

/* Pantalla de inicio: revisar elementos antes de decidir ([data-reveal] → id de la pregunta) */
$$('[data-reveal]').forEach(box=>{const items=$$('[data-ri]',box),cls=box.dataset.cls||'open',q=$('#'+box.dataset.reveal);
  items.forEach(it=>it.addEventListener('click',()=>{it.classList.add(cls);if(items.every(x=>x.classList.contains(cls))&&q.hidden){q.hidden=false;setTimeout(()=>q.scrollIntoView({behavior:'smooth',block:'start'}),200)}}))});

/* Decisiones con consecuencias: [data-choice] + <template data-for="clave-LETRA"> en la misma sección */
$$('[data-choice]').forEach(box=>{
  const key=box.dataset.choice,correct=box.dataset.correct,sec=box.closest('section');
  const fb=box.nextElementSibling,opts=$$('.opt',box);
  opts.forEach(b=>b.addEventListener('click',()=>{
    const o=b.dataset.opt,ok=o===correct;firstTry(key,ok);
    opts.forEach(x=>{x.disabled=true;x.classList.toggle('dim',x!==b)});b.classList.remove('dim');b.classList.add(ok?'good':'bad');
    const t=$(`template[data-for="${key}-${o}"]`,sec);fb.innerHTML='';fb.appendChild(t.content.cloneNode(true));
    const r=$('.retry',fb);if(r)r.addEventListener('click',()=>{fb.innerHTML='';opts.forEach(x=>{x.disabled=false;x.classList.remove('good','bad','dim')});opts[0].focus()});
    if(ok){const nxt=box.dataset.then?$('#'+box.dataset.then):null;if(nxt){nxt.hidden=false;setTimeout(()=>nxt.scrollIntoView({behavior:'smooth',block:'start'}),200)}else done(box.dataset.gate||key)}
    fb.firstElementChild&&fb.firstElementChild.scrollIntoView({behavior:'smooth',block:'nearest'});
  }));
});

/* ---------- Video explicativo narrado (compacto y ampliable, temas clave debajo) ---------- */
const chapWrap=$('#chapters');
VIDEO.scenes.forEach((sc,si)=>{sc.dur=VIDEO.durs[si];const w=sc.lines.map(l=>l.split(/\s+/).length),tw=w.reduce((x,y)=>x+y,0);let acc=0;sc.starts=w.map(x=>{const st=acc/tw*sc.dur;acc+=x;return st})});
const vTotal=VIDEO.durs.reduce((x,y)=>x+y,0),sceneStart=si=>VIDEO.durs.slice(0,si).reduce((x,y)=>x+y,0);
$('#transcript').innerHTML=VIDEO.scenes.map(s=>`<p><strong>${s.t}.</strong> ${s.lines.join(' ')}</p>`).join('');
VIDEO.scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='chap';b.textContent=`${i+1}. ${s.t}`;b.addEventListener('click',()=>V.jump(i));chapWrap.appendChild(b)});
const chaps=$$('.chap');
const vA=new Audio();vA.preload='auto';
const V={si:0,li:-1,playing:false,ended:false,seen:new Set(),
  renderScene(si){const sc=VIDEO.scenes[si],el=$('#scene');
    el.innerHTML=`<img class="v-photo" src="${sc.img}" alt=""><div class="v-title">${sc.t}</div>`;
    $('#stageTag').textContent=`Capítulo ${si+1} de ${VIDEO.scenes.length}`;chaps.forEach((c,k)=>c.classList.toggle('on',k===si));
    $('#vkTitle').textContent=sc.t;
    $('#vkList').innerHTML=sc.keys.map(k=>`<li data-at="${k[1]}">${k[0]}</li>`).join('')},
  load(si,mark){this.si=si;this.li=-1;vA.src=AUD['video_'+(si+1)];this.renderScene(si);this.sync(0,mark)},
  sync(t,mark=true){const sc=VIDEO.scenes[this.si];let li=0;sc.starts.forEach((st,k)=>{if(t>=st-0.05)li=k});
    if(li!==this.li){this.li=li;$$('#vkList [data-at]').forEach(e=>e.classList.toggle('on',li>=+e.dataset.at||this.seen.has(this.si)&&!this.playing));$('#caption').textContent=sc.lines[li]}
    if(mark){this.seen.add(this.si);chaps[this.si].classList.add('seen')}
    const e=sceneStart(this.si)+Math.min(t,sc.dur);$('#vBar').style.width=(e/vTotal*100)+'%';$('#vTime').textContent=`${fmt(e/60)} / ${fmt(vTotal/60)}`;
    if(this.seen.size===VIDEO.scenes.length)done('video')},
  start(){const p=vA.play();if(p&&p.catch)p.catch(()=>{vA.muted=true;updMute();vA.play().catch(()=>{})})},
  play(){if(this.ended){this.ended=false;this.load(0)}this.playing=true;$('#bigPlay').hidden=true;PN.stop();this.start();this.btn()},
  pause(){this.playing=false;vA.pause();this.btn()},
  jump(si){this.ended=false;this.load(si,true);$('#bigPlay').hidden=true;if(this.playing)this.start();else $$('#vkList li').forEach(e=>e.classList.add('on'));this.btn()},
  btn(){$('#vPlay').textContent=this.playing?'❚❚ Pausa':'▶ Reproducir'}};
vA.addEventListener('timeupdate',()=>V.sync(vA.currentTime));
vA.addEventListener('ended',()=>{if(V.si<VIDEO.scenes.length-1){V.load(V.si+1);if(V.playing)V.start()}else{V.playing=false;V.ended=true;V.sync(VIDEO.scenes[V.si].dur);$$('#vkList li').forEach(e=>e.classList.add('on'));done('video');V.btn();$('#vPlay').textContent='↺ Repetir'}});
V.load(0,false);V.li=-1;$('#caption').textContent='Presiona reproducir para comenzar.';
$('#bigPlay').addEventListener('click',()=>V.play());
$('#vPlay').addEventListener('click',()=>V.playing?V.pause():V.play());
$('#vPrev').addEventListener('click',()=>V.jump(Math.max(0,V.si-1)));
$('#vNext').addEventListener('click',()=>V.jump(Math.min(VIDEO.scenes.length-1,V.si+1)));
$('#vCC').addEventListener('click',e=>{e.currentTarget.classList.toggle('on');$('#caption').classList.toggle('off')});
function updMute(){const b=$('#vMute');b.classList.toggle('on',!vA.muted);b.textContent=vA.muted?'🔇 Silencio':'🔊 Sonido'}
$('#vMute').addEventListener('click',()=>{vA.muted=!vA.muted;updMute()});
/* Ampliar: pantalla completa si el navegador lo permite; si no, ventana ampliada dentro de la página */
const pl=$('#player'),vBig=$('#vBig');
function setBigLabel(on){vBig.textContent=on?'⤡ Reducir':'⤢ Ampliar';vBig.classList.toggle('on',on);vBig.setAttribute('aria-pressed',on)}
vBig.addEventListener('click',()=>{const fs=document.fullscreenElement===pl,big=pl.classList.contains('big');
  if(fs){document.exitFullscreen&&document.exitFullscreen();return}
  if(big){pl.classList.remove('big');setBigLabel(false);return}
  const r=pl.requestFullscreen?pl.requestFullscreen():null;
  if(r&&r.then)r.then(()=>setBigLabel(true)).catch(()=>{pl.classList.add('big');setBigLabel(true)});else{pl.classList.add('big');setBigLabel(true)}});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&!pl.classList.contains('big'))setBigLabel(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pl.classList.contains('big')){pl.classList.remove('big');setBigLabel(false)}});

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

/* ---------- Componentes genéricos ---------- */
/* Tarjetas que se voltean */
$$('.flipdeck[data-gate]').forEach(d=>{const fl=$$('.flip',d),t=tracker(d.dataset.gate,fl.length,'#'+d.dataset.tick,'#'+d.dataset.task);
  fl.forEach((c,k)=>c.addEventListener('click',()=>{c.classList.toggle('flipped');t('f'+k)}))});
/* Puntos sobre imagen */
$$('.hs-wrap[data-gate]').forEach(w=>{const hs=$$('.hs',w),t=tracker(w.dataset.gate,hs.length,'#'+w.dataset.tick,'#'+w.dataset.task),pn=$('.hs-panel',w);
  hs.forEach((b,k)=>b.addEventListener('click',()=>{hs.forEach(x=>x.classList.toggle('active',x===b));b.classList.add('seen');
    pn.innerHTML=`<h3 style="margin-top:0">${k+1}. ${b.dataset.t}</h3><p>${b.dataset.d}</p>`;t(k)}))});
/* Acordeón */
$$('.acc[data-gate]').forEach(a=>{const it=$$('.acc-item',a),t=tracker(a.dataset.gate,it.length,'#'+a.dataset.tick,'#'+a.dataset.task);
  it.forEach((x,k)=>$('.acc-head',x).addEventListener('click',()=>{const o=!x.classList.contains('open');it.forEach(y=>{y.classList.remove('open');$('.acc-head',y).setAttribute('aria-expanded','false')});
    if(o){x.classList.add('open');$('.acc-head',x).setAttribute('aria-expanded','true')}x.classList.add('seen');t(k)}))});
/* Pestañas */
$$('.tabset[data-gate]').forEach(ts=>{const tb=$$('.tab',ts),pn=$$('.tabpane',ts),t=tracker(ts.dataset.gate,tb.length,'#'+ts.dataset.tick,'#'+ts.dataset.task);
  tb.forEach((b,k)=>b.addEventListener('click',()=>{tb.forEach((x,j)=>{x.classList.toggle('active',j===k);x.setAttribute('aria-selected',j===k);pn[j].classList.toggle('active',j===k)});b.classList.add('seen');t(k)}))});
/* Línea de tiempo */
$$('.evline[data-gate]').forEach(ev=>{const nd=$$('.evnode',ev),pn=$('#'+ev.dataset.panel),t=tracker(ev.dataset.gate,nd.length,'#'+ev.dataset.tick,'#'+ev.dataset.task);
  nd.forEach((b,k)=>b.addEventListener('click',()=>{nd.forEach(x=>x.classList.toggle('active',x===b));b.classList.add('seen');pn.innerHTML=`<h3 style="margin-top:0">${b.dataset.t}</h3><p>${b.dataset.d}</p>`;t(k)}))});
/* Clasificar en categorías */
$$('.classify[data-gate]').forEach(c=>{const key=c.dataset.gate,cards=$$('.cardx',c),bins=$$('.bin',c),fb=$('.fb',c);let sel=null,left=cards.length,errs=0;
  const tick=$('#'+c.dataset.tick),task=$('#'+c.dataset.task),upd=()=>{tick.textContent=`${cards.length-left} / ${cards.length}`};upd();
  function place(cd,bin){if(cd.classList.contains('placed'))return;
    if(cd.dataset.cat===bin.dataset.cat){cd.classList.remove('sel');cd.classList.add('placed');cd.draggable=false;bin.appendChild(cd);left--;upd();
      feedback(fb,true,'Correcto.',cd.dataset.fb||'Bien ubicado.');if(!left){task.classList.add('ok');firstTry(key,errs===0);done(key)}}
    else{errs++;bin.classList.add('shake');setTimeout(()=>bin.classList.remove('shake'),400);feedback(fb,false,'Revisa.',cd.dataset.no||'No corresponde a esa categoría.')}sel=null;bins.forEach(b=>b.classList.remove('target'))}
  cards.forEach(cd=>{cd.draggable=true;cd.addEventListener('click',e=>{e.stopPropagation();if(cd.classList.contains('placed'))return;cards.forEach(x=>x.classList.remove('sel'));sel=cd;cd.classList.add('sel');bins.forEach(b=>b.classList.add('target'))});
    cd.addEventListener('dragstart',e=>{sel=cd;e.dataTransfer.setData('text','x')})});
  bins.forEach(b=>{b.addEventListener('click',()=>{if(sel)place(sel,b)});b.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&sel){e.preventDefault();place(sel,b)}});
    b.addEventListener('dragover',e=>e.preventDefault());b.addEventListener('drop',e=>{e.preventDefault();if(sel)place(sel,b)})})});
/* Ordenar pasos */
$$('.order-box[data-gate]').forEach(o=>{const key=o.dataset.gate,ul=$('.order',o),fb=$('.fb',o);let tries=0;
  function num(){$$('li',ul).forEach((li,k)=>{$('.pos',li).textContent=k+1})}
  $$('li',ul).forEach(li=>{const t=li.innerHTML;li.innerHTML=`<span class="pos"></span><span>${t}</span><span class="mv"><button type="button" class="up" aria-label="Subir">↑</button><button type="button" class="dn" aria-label="Bajar">↓</button></span>`;
    $('.up',li).addEventListener('click',()=>{if(li.previousElementSibling)ul.insertBefore(li,li.previousElementSibling);$$('li',ul).forEach(x=>x.classList.remove('good','bad'));num()});
    $('.dn',li).addEventListener('click',()=>{if(li.nextElementSibling)ul.insertBefore(li.nextElementSibling,li);$$('li',ul).forEach(x=>x.classList.remove('good','bad'));num()})});num();
  $('.ocheck',o).addEventListener('click',()=>{tries++;let bad=0;$$('li',ul).forEach((li,k)=>{const ok=+li.dataset.p===k+1;li.classList.toggle('good',ok);li.classList.toggle('bad',!ok);if(!ok)bad++});
    if(!bad){feedback(fb,true,'Correcto.',o.dataset.ok);firstTry(key,tries===1);done(key)}else feedback(fb,false,`Hay ${bad} paso(s) fuera de lugar.`,o.dataset.no)})});
/* Unir parejas */
$$('.pairs[data-gate]').forEach(p=>{const key=p.dataset.gate,ls=$$('.pl',p),rs=$$('.pr',p),fb=$('#'+p.dataset.fb);let sel=null,n=0,errs=0;
  const tick=$('#'+p.dataset.tick),task=$('#'+p.dataset.task);tick.textContent=`0 / ${ls.length}`;
  ls.forEach(l=>l.addEventListener('click',()=>{if(l.classList.contains('done'))return;ls.forEach(x=>x.classList.remove('sel'));sel=l;l.classList.add('sel')}));
  rs.forEach(r=>r.addEventListener('click',()=>{if(!sel||r.classList.contains('done'))return;
    if(r.dataset.k===sel.dataset.k){sel.classList.remove('sel');sel.classList.add('done');r.classList.add('done');sel.insertAdjacentHTML('beforeend',`<small style="display:block;font-weight:600;margin-top:4px">→ ${r.textContent}</small>`);n++;tick.textContent=`${n} / ${ls.length}`;
      feedback(fb,true,'Correcto.',r.dataset.fb||'Relación correcta.');sel=null;if(n===ls.length){task.classList.add('ok');firstTry(key,errs===0);done(key)}}
    else{errs++;r.classList.add('wrong');setTimeout(()=>r.classList.remove('wrong'),400);feedback(fb,false,'No corresponde.',p.dataset.no)}}))});
/* Completar (cloze) */
$$('.cloze-box[data-gate]').forEach(c=>{const key=c.dataset.gate,fb=$('.fb',c);let tries=0;
  $('.ccheck',c).addEventListener('click',()=>{tries++;const sels=$$('select',c);if(sels.some(s=>!s.value))return feedback(fb,false,'Faltan espacios.','Completa todos los espacios antes de comprobar.');
    let bad=0;sels.forEach(s=>{const ok=s.value===s.dataset.ans;s.classList.toggle('good',ok);s.classList.toggle('bad',!ok);if(!ok)bad++});
    if(!bad){feedback(fb,true,'Correcto.',c.dataset.ok);firstTry(key,tries===1);done(key)}else feedback(fb,false,`${bad} espacio(s) con error.`,c.dataset.no)})});
/* Interruptores de autodiagnóstico */
$$('.toggles[data-gate]').forEach(tg=>{const rows=$$('.toggle-row',tg),bar=$('#'+tg.dataset.meter),res=$('#'+tg.dataset.res);
  rows.forEach(r=>$('.sw',r).addEventListener('click',()=>{r.classList.toggle('on');$('.sw',r).setAttribute('aria-checked',r.classList.contains('on'));bar.style.width=(rows.filter(x=>x.classList.contains('on')).length/rows.length*100)+'%'}));
  $('#'+tg.dataset.btn).addEventListener('click',()=>{const n=rows.filter(x=>x.classList.contains('on')).length,miss=rows.filter(x=>!x.classList.contains('on')).map(x=>`<li>${x.dataset.area}</li>`).join('');
    const lvl=n<=1?['Punto de partida inicial','Hay varias bases por ordenar. Elige una brecha prioritaria y conviértela en una mejora concreta.']:n<=3?['Avance en construcción','Ya existen prácticas digitales; el siguiente paso es conectarlas y hacerlas consistentes.']:['Base digital favorable','Hay prácticas instaladas. Revisa la integración, la continuidad y el uso de datos para decidir.'];
    res.innerHTML=`<div class="feedback good"><strong>${lvl[0]} · ${n} de ${rows.length}.</strong> <span class="fb-body">${lvl[1]}${miss?' Áreas para priorizar:<ul style="margin:6px 0 0">'+miss+'</ul>':''}</span></div>`;done(tg.dataset.gate)})});
/* Verdadero o falso */
if(L.TF){const tf=$('#tf'),TF=L.TF;let ti=0,errs=0;const prog=$('.tf-prog',tf);prog.innerHTML=TF.map(()=>'<span></span>').join('');
  function tfDraw(){$$('span',prog).forEach((s,k)=>{if(k===ti)s.classList.add('cur')});if(ti>=TF.length){$('.tf-claim',tf).textContent='¡Completaste las afirmaciones!';$('.tf-btns',tf).hidden=true;$('.tf-exp',tf).innerHTML=`<div class="feedback good"><strong>${TF.length-errs} de ${TF.length} al primer intento.</strong> <span class="fb-body">${L.TFsum||'Drive y OneDrive comparten la misma lógica: guardar, organizar, compartir y colaborar sobre una versión común.'}</span></div>`;firstTry('tf',errs===0);done('tf');return}
    $('.tf-claim',tf).textContent=`${ti+1}. ${TF[ti][0]}`;$('.tf-exp',tf).innerHTML='';$$('.tf-btns button',tf).forEach(b=>{b.disabled=false;b.classList.remove('good','bad')})}
  $$('.tf-btns button',tf).forEach(b=>b.addEventListener('click',()=>{const a=+b.dataset.a,ok=a===TF[ti][1];if(!ok)errs++;
    $$('.tf-btns button',tf).forEach(x=>{x.disabled=true;if(+x.dataset.a===TF[ti][1])x.classList.add('good');else if(x===b)x.classList.add('bad')});
    prog.children[ti].className=ok?'g':'b';
    $('.tf-exp',tf).innerHTML=`<div class="feedback ${ok?'good':'bad'}"><strong>${ok?'Correcto.':'Incorrecto.'}</strong> <span class="fb-body">${TF[ti][2]}</span><div style="margin-top:10px"><button class="small-btn primary" type="button" id="tfNext">${ti<TF.length-1?'Siguiente afirmación →':'Terminar'}</button></div></div>`;
    $('#tfNext').addEventListener('click',()=>{ti++;tfDraw()})}));tfDraw()}
/* Opciones largas: muestra el texto completo de la opción elegida bajo el selector */
$$('.seltable.stack select').forEach(sel=>sel.addEventListener('change',()=>{let f=sel.nextElementSibling;if(!f||!f.classList.contains('selfull')){f=document.createElement('div');f.className='selfull';sel.after(f)}f.textContent=sel.value?sel.options[sel.selectedIndex].text:''}));
/* Simulador de permisos (tabla con selectores) */
$$('.simbox[data-gate]').forEach(sm=>{const key=sm.dataset.gate,rows=$$('tr[data-ans]',sm),fb=$('.fb',sm);let tries=0;
  $('.scheck',sm).addEventListener('click',()=>{tries++;if(rows.some(r=>!$('select',r).value))return feedback(fb,false,sm.dataset.missT||'Faltan accesos.',sm.dataset.missB||'Configura el acceso de todas las filas antes de guardar.');let bad=0;
    rows.forEach(r=>{const ok=$('select',r).value===r.dataset.ans;r.classList.toggle('good',ok);r.classList.toggle('bad',!ok);$('.why',r).innerHTML=(ok?'✓ ':'✕ ')+(ok?r.dataset.ok:r.dataset.no);if(!ok)bad++});
    if(!bad){feedback(fb,true,'Configuración correcta.',sm.dataset.ok);firstTry(key,tries===1);done(key)}else feedback(fb,false,`Revisa ${bad} ${sm.dataset.unit||'acceso(s)'} marcados en rojo.`,'Ajusta y vuelve a guardar.')})});

/* ---------- Checklist con respuesta modelo ---------- */
const YN=L.YN;
$('#ynList').innerHTML=YN.map((y,i)=>`<div class="yn-item" data-i="${i}"><span><b>${i+1}.</b> ${y[0]}</span><span class="yn"><button type="button" data-a="1">Sí</button><button type="button" data-a="0">No</button></span><div class="exp"></div></div>`).join('');
let ynN=0;
$$('#ynList .yn-item').forEach(it=>$$('.yn button',it).forEach(b=>b.addEventListener('click',()=>{if(it.classList.contains('answered'))return;const y=YN[+it.dataset.i],ok=+b.dataset.a===y[1];
  it.classList.add('answered');$$('.yn button',it).forEach(x=>{x.disabled=true;if(+x.dataset.a===y[1])x.classList.add('good');else if(x===b)x.classList.add('bad')});
  $('.exp',it).innerHTML=`<span style="color:${ok?'var(--good)':'var(--bad)'};font-weight:800">${ok?'✓':'✕'}</span> ${y[2]}`;ynN++;if(ynN===YN.length){done('yn');$('#modelBtn').disabled=false}})));
$('#modelBtn').addEventListener('click',()=>{$('#model').hidden=false;done('model')});

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

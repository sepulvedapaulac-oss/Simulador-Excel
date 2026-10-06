(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var PASS=80;
/* ---------- SCORM 1.2 ---------- */
var API=null;
function findAPI(w){var n=0;while(w&&n<12){try{if(w.API)return w.API}catch(e){}if(w.parent===w)break;w=w.parent;n++}return null}
try{API=findAPI(window)||(window.opener?findAPI(window.opener):null)}catch(e){}
var scorm={ok:false,
 init:function(){if(!API)return;try{this.ok=String(API.LMSInitialize(''))==='true'}catch(e){}},
 get:function(k){if(!this.ok)return '';try{return API.LMSGetValue(k)||''}catch(e){return ''}},
 set:function(k,v){if(!this.ok)return;try{API.LMSSetValue(k,String(v))}catch(e){}},
 commit:function(){if(!this.ok)return;try{API.LMSCommit('')}catch(e){}},
 finish:function(){if(!this.ok)return;try{API.LMSCommit('');API.LMSFinish('')}catch(e){}}};
scorm.init();
var LE=document.querySelector('[data-lesson]'),LID=(LE&&LE.getAttribute('data-lesson'))||'leccion';
/* ---------- estado ---------- */
var S={d:{},m:0,c:0,sc:null,best:null,f:{},tr:{},fin:false};
function load(){var raw=scorm.get('cmi.suspend_data');if(!raw){try{raw=localStorage.getItem('L_'+LID)}catch(e){}}
 if(raw){try{var o=JSON.parse(raw);for(var k in o)S[k]=o[k]}catch(e){}}}
function save(){var j=JSON.stringify(S);scorm.set('cmi.suspend_data',j);scorm.set('cmi.core.lesson_location',String(cur));scorm.commit();try{localStorage.setItem('L_'+LID,j)}catch(e){}}
load();
if(scorm.ok){var st=scorm.get('cmi.core.lesson_status');if(!st||st==='not attempted')scorm.set('cmi.core.lesson_status','incomplete');scorm.set('cmi.core.score.min','0');scorm.set('cmi.core.score.max','100')}
var screens=$$('.screen'),cur=0,N=screens.length;
var routeOl=$('#routeList'),nextB=$('#nextBtn'),prevB=$('#prevBtn'),counter=$('#counter'),bar=$('#progressBar'),hint=$('#navHint');
function keys(i){var g=screens[i].getAttribute('data-gate');return g?g.split(/\s+/):[]}
function complete(i){return keys(i).every(function(k){return S.d[k]})}
function passed(){return S.best!==null&&S.best>=PASS}
function unlockedUpTo(){if(S.fin)return N-1;var m=0;for(var i=0;i<N-1;i++){if(complete(i))m=i+1;else break}return m}
function done(k){if(S.d[k])return;S.d[k]=1;save();refresh()}
window.LessonDone=done;
/* ---------- ruta ---------- */
screens.forEach(function(s,i){var li=document.createElement('li'),b=document.createElement('button');b.type='button';
 b.innerHTML='<span class="st">'+(i+1)+'</span><span>'+s.getAttribute('data-title')+'</span>';b.addEventListener('click',function(){go(i);$('.route').classList.remove('open')});li.appendChild(b);routeOl.appendChild(li)});
function refresh(){var m=unlockedUpTo();
 $$('button',routeOl).forEach(function(b,i){var lock=i>m;b.disabled=lock;b.classList.toggle('done',complete(i)&&keys(i).length>0||(S.fin&&i<=m));b.classList.toggle('cur',i===cur);
  b.setAttribute('aria-current',i===cur?'step':'false');b.querySelector('.st').textContent=lock?'🔒':(complete(i)&&keys(i).length?'✓':(i+1))});
 var ok=complete(cur);prevB.disabled=cur===0;
 if(cur===N-1){nextB.textContent='Volver al inicio';nextB.disabled=false}else{nextB.textContent='Siguiente →';nextB.disabled=!ok}
 hint.textContent=ok?(cur===N-1?'Lección finalizada: puedes repasar cualquier pantalla.':'Actividad completada. Puedes continuar.'):(screens[cur].getAttribute('data-hint')||'Completa la actividad de esta pantalla para continuar.');
 counter.textContent='Pantalla '+(cur+1)+' de '+N;bar.style.width=(S.fin?100:m/(N-1)*100)+'%'}
function go(i){if(i<0||i>=N)return;if(i>unlockedUpTo())return;stopNarr();cur=i;screens.forEach(function(s,n){s.classList.toggle('active',n===i)});
 save();refresh();window.scrollTo({top:0,behavior:'smooth'});var h=screens[i].querySelector('h1,h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
 screens[i].dispatchEvent(new Event('enter'));if(autoNarr)setTimeout(function(){narrate(screens[i])},450)}
window.LessonGo=go;
nextB.addEventListener('click',function(){if(cur===N-1)go(0);else if(complete(cur))go(cur+1)});
prevB.addEventListener('click',function(){go(cur-1)});
$('#menuBtn').addEventListener('click',function(){$('.route').classList.toggle('open')});
/* ---------- narración ---------- */
var AUD=window.LESSON_AUDIO||{},audio=null,autoNarr=false;try{autoNarr=localStorage.getItem('autoNarr')==='1'}catch(e){}
var voice=null;function pickVoice(){if(!window.speechSynthesis)return;var v=speechSynthesis.getVoices();voice=v.filter(function(x){return /es[-_](CL|419|MX|US|AR|CO)/i.test(x.lang)})[0]||v.filter(function(x){return /^es/i.test(x.lang)})[0]||null}
if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function stopNarr(){if(audio){audio.pause();audio=null}if(window.speechSynthesis)speechSynthesis.cancel();$$('.nplay').forEach(function(b){b.setAttribute('aria-pressed','false');b.textContent='🔊 Escuchar'})}
function speak(text,onend){var idx=null;
 if(AUD[text]){audio=new Audio(AUD[text]);audio.onended=function(){audio=null;onend&&onend()};audio.play().catch(function(){onend&&onend()});return}
 if(!window.speechSynthesis){onend&&setTimeout(onend,text.length*55);return}
 var u=new SpeechSynthesisUtterance(text);u.lang='es-CL';if(voice)u.voice=voice;u.rate=1;u.onend=function(){onend&&onend()};u.onerror=function(){onend&&onend()};speechSynthesis.speak(u)}
window.LessonSpeak=speak;window.LessonStop=stopNarr;
function narrate(s){var t=s.getAttribute('data-narr');if(!t)return;stopNarr();var b=s.querySelector('.nplay');if(b){b.setAttribute('aria-pressed','true');b.textContent='⏹ Detener'}
 speak(t,function(){if(b){b.setAttribute('aria-pressed','false');b.textContent='🔊 Escuchar'}})}
screens.forEach(function(s){var h=s.querySelector('.shead');if(!h)return;var w=document.createElement('div');w.className='narr';
 w.innerHTML='<button type="button" class="nbtn nplay" aria-pressed="false">🔊 Escuchar</button><button type="button" class="nbtn nauto" aria-pressed="'+autoNarr+'" title="Narrar automáticamente cada pantalla">Auto</button>';h.appendChild(w);
 w.querySelector('.nplay').addEventListener('click',function(){if(this.getAttribute('aria-pressed')==='true')stopNarr();else narrate(s)});
 w.querySelector('.nauto').addEventListener('click',function(){autoNarr=!autoNarr;try{localStorage.setItem('autoNarr',autoNarr?'1':'0')}catch(e){}$$('.nauto').forEach(function(x){x.setAttribute('aria-pressed',autoNarr)});if(autoNarr)narrate(s);else stopNarr()})});
/* ---------- utilidades ---------- */
function fb(el,cls,html){if(!el)return;el.className='fb show '+cls;el.innerHTML=html}
function first(id,ok,label){if(!(id in S.f)){S.f[id]={ok:ok?1:0,l:label||id};save()}}
/* ---------- ramificación / decisión ---------- */
$$('.branch').forEach(function(br){var key=br.getAttribute('data-key'),steps=$$('.bstep',br);
 steps.forEach(function(st,si){var opts=$$('.opt',st),f=$('.fb',st),nx=$('.bnext',st),tried=false;
  opts.forEach(function(o){o.addEventListener('click',function(){var ok=o.hasAttribute('data-ok');if(!tried){first(key+'_'+si,ok,st.getAttribute('data-label'));tried=true}
   o.classList.add(ok?'ok':'no');fb(f,ok?'ok':'no',o.getAttribute('data-fb'));
   if(ok){opts.forEach(function(x){x.disabled=true});if(si<steps.length-1){if(nx){nx.style.display='inline-block';nx.onclick=function(){steps[si+1].classList.add('on');nx.style.display='none';steps[si+1].scrollIntoView({behavior:'smooth',block:'start'})}}}else done(key)}else{o.disabled=true}})});
  if(nx)nx.style.display='none'});
 steps[0].classList.add('on');
 if(S.d[key]){steps.forEach(function(st){st.classList.add('on');$$('.opt',st).forEach(function(o){o.disabled=true;if(o.hasAttribute('data-ok'))o.classList.add('ok')})})}});
/* ---------- video ---------- */
$$('.vplayer').forEach(function(vp){var key=vp.getAttribute('data-key'),sc=$$('.vscene',vp),cap=$('.vcap',vp),pb=$('.vprog>div',vp),play=$('.vplay',vp),ccb=$('.vcc',vp),chs=$('.chapters',vp),i=0,playing=false,timer=null,seen={},token=0;
 sc.forEach(function(s,n){var b=document.createElement('button');b.type='button';b.textContent=(n+1)+'. '+s.getAttribute('data-ch');b.addEventListener('click',function(){show(n,playing)});chs.appendChild(b)});
 var cbs=$$('button',chs);
 function mark(n){seen[n]=1;cbs[n].classList.add('seen');if(Object.keys(seen).length===sc.length)done(key)}
 function show(n,autoplay){i=n;token++;clearTimeout(timer);stopNarr();sc.forEach(function(s,k){s.classList.toggle('on',k===n)});cbs.forEach(function(b,k){b.classList.toggle('cur',k===n)});
  cap.textContent=sc[n].getAttribute('data-cap');pb.style.width=((n+1)/sc.length*100)+'%';mark(n);if(autoplay)run()}
 function run(){var t=token;playing=true;play.textContent='⏸ Pausa';speak(sc[i].getAttribute('data-cap'),function(){if(t!==token||!playing)return;timer=setTimeout(function(){if(t!==token)return;if(i<sc.length-1)show(i+1,true);else{playing=false;play.textContent='↺ Repetir'}},700)})}
 play.addEventListener('click',function(){if(playing){playing=false;token++;stopNarr();clearTimeout(timer);play.textContent='▶ Reproducir'}else{if(i===sc.length-1&&play.textContent.indexOf('Repetir')>-1)show(0,true);else run()}});
 ccb.addEventListener('click',function(){cap.classList.toggle('hide');ccb.setAttribute('aria-pressed',!cap.classList.contains('hide'))});
 vp.closest('.screen').addEventListener('enter',function(){});
 show(0,false);seen={};cbs.forEach(function(b){b.classList.remove('seen')});mark(0);
 if(S.d[key])cbs.forEach(function(b,n){seen[n]=1;b.classList.add('seen')})});
/* ---------- hotspot ---------- */
$$('.hotspot').forEach(function(h){var key=h.getAttribute('data-key'),pts=$$('.hs',h),panel=$('#'+h.getAttribute('data-panel')),seen={};
 pts.forEach(function(p,n){p.style.left=p.getAttribute('data-x')+'%';p.style.top=p.getAttribute('data-y')+'%';p.setAttribute('aria-label','Punto '+(n+1)+': '+p.getAttribute('data-t'));
  p.addEventListener('click',function(){seen[n]=1;p.classList.add('seen');panel.innerHTML='<h3>'+p.getAttribute('data-t')+'</h3><p>'+p.getAttribute('data-d')+'</p><small>'+Object.keys(seen).length+' de '+pts.length+' puntos revisados</small>';if(Object.keys(seen).length===pts.length)done(key)})});
 if(S.d[key])pts.forEach(function(p){p.classList.add('seen')})});
/* ---------- tarjetas ---------- */
$$('.cards[data-key]').forEach(function(c){var key=c.getAttribute('data-key'),fl=$$('.flip',c),seen={};
 fl.forEach(function(f,n){f.setAttribute('aria-pressed','false');f.addEventListener('click',function(){f.classList.toggle('on');f.setAttribute('aria-pressed',f.classList.contains('on'));seen[n]=1;if(Object.keys(seen).length===fl.length)done(key)})})});
/* ---------- clasificar ---------- */
$$('.classify').forEach(function(c){var key=c.getAttribute('data-key'),items=$$('.citem',c),bins=$$('.cbin',c),f=$('.fb',c),sel=null,left=items.length,errs=0;
 function place(it,bin){if(it.classList.contains('placed'))return;var ok=it.getAttribute('data-cat')===bin.getAttribute('data-cat');
  if(ok){it.classList.remove('sel');it.classList.add('placed');it.draggable=false;it.setAttribute('aria-disabled','true');bin.appendChild(it);left--;fb(f,'ok','✔ '+(it.getAttribute('data-fb')||'Bien ubicado.'));if(!left){fb(f,'ok','¡Completado! '+(errs?'Tuviste '+errs+' intento(s) por corregir; revisa el porqué en cada caso.':'Clasificaste todo correctamente al primer intento.'));first(key,errs===0,c.getAttribute('data-label'));done(key)}}
  else{errs++;it.classList.add('shake');setTimeout(function(){it.classList.remove('shake')},400);fb(f,'no','✖ '+(it.getAttribute('data-no')||'No corresponde a esa categoría. Vuelve a intentarlo.'))}sel=null}
 items.forEach(function(it){it.draggable=true;it.addEventListener('click',function(){if(it.classList.contains('placed'))return;items.forEach(function(x){x.classList.remove('sel')});sel=it;it.classList.add('sel')});
  it.addEventListener('dragstart',function(e){sel=it;e.dataTransfer.setData('text','x')})});
 bins.forEach(function(b){b.addEventListener('click',function(e){if(sel&&!e.target.closest('.citem.placed'))place(sel,b)});
  b.addEventListener('dragover',function(e){e.preventDefault();b.classList.add('over')});b.addEventListener('dragleave',function(){b.classList.remove('over')});
  b.addEventListener('drop',function(e){e.preventDefault();b.classList.remove('over');if(sel)place(sel,b)})});
 if(S.d[key])items.forEach(function(it){var b=bins.filter(function(x){return x.getAttribute('data-cat')===it.getAttribute('data-cat')})[0];it.classList.add('placed');b.appendChild(it)})});
/* ---------- ordenar ---------- */
$$('.order').forEach(function(o){var key=o.getAttribute('data-key'),ul=$('.olist',o),f=$('.fb',o),tries=0;
 function wire(){$$('li',ul).forEach(function(li){$('.up',li).onclick=function(){if(li.previousElementSibling)ul.insertBefore(li,li.previousElementSibling);ul.classList.remove('right')};$('.dn',li).onclick=function(){if(li.nextElementSibling)ul.insertBefore(li.nextElementSibling,li);ul.classList.remove('right')}})}
 $$('li',ul).forEach(function(li){var t=li.innerHTML;li.innerHTML='<span>'+t+'</span><button type="button" class="mv up" aria-label="Subir">↑</button><button type="button" class="mv dn" aria-label="Bajar">↓</button>'});
 if(S.d[key]){$$('li',ul).sort(function(a,b){return a.getAttribute('data-p')-b.getAttribute('data-p')}).forEach(function(li){ul.appendChild(li)});ul.classList.add('right')}
 wire();
 $('.ocheck',o).addEventListener('click',function(){tries++;var li=$$('li',ul),bad=0;li.forEach(function(x,n){if(+x.getAttribute('data-p')!==n+1)bad++});
  if(!bad){ul.classList.add('right');fb(f,'ok',o.getAttribute('data-ok'));first(key,tries===1,o.getAttribute('data-label'));done(key)}else fb(f,'no','Hay '+bad+' paso(s) fuera de lugar. '+o.getAttribute('data-no'))})});
/* ---------- escala / autodiagnóstico ---------- */
$$('.scale').forEach(function(sc){var key=sc.getAttribute('data-key'),rows=$$('.srow',sc),meter=$('.meter>div',sc.parentNode),res=$('.fb',sc.parentNode),val={};
 rows.forEach(function(r,n){var bs=$$('button',r);bs.forEach(function(b,v){b.addEventListener('click',function(){bs.forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false')});b.classList.add('on');b.setAttribute('aria-pressed','true');val[n]=v;upd()})})});
 function upd(){var k=Object.keys(val),sum=0;k.forEach(function(x){sum+=val[x]});var max=rows.length*2;meter.style.width=(sum/max*100)+'%';
  if(k.length<rows.length){fb(res,'info','Respondidas '+k.length+' de '+rows.length+'.');return}
  var p=sum/max,low=rows.filter(function(r,n){return val[n]===0}).map(function(r){return '<li>'+r.getAttribute('data-area')+'</li>'}).join('');
  fb(res,'info',(p<.4?'<b>Punto de partida inicial.</b> Hay bases por ordenar. ':p<.75?'<b>Avance en construcción.</b> Ya existen prácticas digitales; falta conectarlas y hacerlas consistentes. ':'<b>Base digital favorable.</b> Revisa integración, continuidad y uso de datos para decidir. ')+(low?'Áreas para priorizar:<ul>'+low+'</ul>':'No marcaste áreas en nivel inicial.'));done(key)}});
/* ---------- acordeón ---------- */
$$('.acc').forEach(function(a){var key=a.getAttribute('data-key'),hs=$$('.ah',a),seen={};
 hs.forEach(function(h,n){var body=h.nextElementSibling;h.setAttribute('aria-expanded','false');h.addEventListener('click',function(){var open=h.getAttribute('aria-expanded')==='true';hs.forEach(function(x){x.setAttribute('aria-expanded','false');x.nextElementSibling.classList.remove('on')});
  if(!open){h.setAttribute('aria-expanded','true');body.classList.add('on')}h.classList.add('seen');seen[n]=1;if(Object.keys(seen).length===hs.length)done(key)})})});
/* ---------- unir ---------- */
$$('.match').forEach(function(m){var key=m.getAttribute('data-key'),rows=$$('.mrow',m),f=$('.fb',m.parentNode),tries=0;
 $('.mcheck',m.parentNode).addEventListener('click',function(){tries++;var bad=0,empty=0;rows.forEach(function(r){var s=$('select',r);r.classList.remove('ok','no');if(!s.value){empty++;return}var ok=s.value===r.getAttribute('data-ans');r.classList.add(ok?'ok':'no');if(!ok)bad++});
  if(empty)return fb(f,'info','Te faltan '+empty+' relación(es) por elegir.');
  if(!bad){fb(f,'ok',m.getAttribute('data-ok'));first(key,tries===1,m.getAttribute('data-label'));done(key)}else fb(f,'no',bad+' relación(es) no corresponden (marcadas en rojo). '+m.getAttribute('data-no'))})});
/* ---------- pestañas ---------- */
$$('.tabset').forEach(function(t){var key=t.getAttribute('data-key'),tabs=$$('.tab',t),ps=$$('.tpanel',t),seen={};
 tabs.forEach(function(b,n){b.setAttribute('role','tab');b.addEventListener('click',function(){tabs.forEach(function(x,k){x.setAttribute('aria-selected',k===n);ps[k].classList.toggle('on',k===n)});b.classList.add('seen');seen[n]=1;if(Object.keys(seen).length===tabs.length)done(key)})});
 tabs[0].click()});
/* ---------- completar ---------- */
$$('.fill').forEach(function(fl){var key=fl.getAttribute('data-key'),f=$('.fb',fl.parentNode),tries=0;
 $('.fcheck',fl.parentNode).addEventListener('click',function(){tries++;var bad=0,empty=0;$$('.fs',fl).forEach(function(s){var ok=true;$$('select',s).forEach(function(x){if(!x.value)empty++;else if(x.value!==x.getAttribute('data-ans'))ok=false});s.classList.remove('ok','no');if(!ok){bad++;s.classList.add('no')}else if($$('select',s).every(function(x){return x.value}))s.classList.add('ok')});
  if(empty)return fb(f,'info','Completa todos los espacios antes de comprobar.');
  if(!bad){fb(f,'ok',fl.getAttribute('data-ok'));first(key,tries===1,fl.getAttribute('data-label'));done(key)}else fb(f,'no',bad+' acuerdo(s) con errores. '+fl.getAttribute('data-no'))})});
/* ---------- línea de tiempo ---------- */
$$('.timeline').forEach(function(t){var key=t.getAttribute('data-key'),bs=$$('.tlb',t),p=$('.tlpanel',t),seen={};
 bs.forEach(function(b,n){b.addEventListener('click',function(){bs.forEach(function(x,k){x.setAttribute('aria-selected',k===n)});b.classList.add('seen');seen[n]=1;p.innerHTML='<h3>'+b.getAttribute('data-t')+'</h3><p>'+b.getAttribute('data-d')+'</p>';if(Object.keys(seen).length===bs.length)done(key)})})});
/* ---------- simulador ---------- */
$$('.sim').forEach(function(sm){var key=sm.getAttribute('data-key'),rows=$$('.simrow',sm),f=$('.fb',sm),tries=0;
 $('.scheck',sm).addEventListener('click',function(){tries++;var bad=0,empty=0;rows.forEach(function(r){var s=$('select',r);r.classList.remove('ok','no');if(!s.value){empty++;return}var ok=s.value===r.getAttribute('data-ans');r.classList.add(ok?'ok':'no');$('.why',r).innerHTML=(ok?'✔ ':'✖ ')+r.getAttribute(ok?'data-ok':'data-no');if(!ok)bad++});
  if(empty)return fb(f,'info','Configura el acceso de todas las personas antes de guardar.');
  if(!bad){fb(f,'ok',sm.getAttribute('data-ok'));first(key,tries===1,sm.getAttribute('data-label'));done(key)}else fb(f,'no','Revisa los '+bad+' permiso(s) marcados en rojo y vuelve a guardar.')})});
/* ---------- comprobación ---------- */
$$('.quiz').forEach(function(qz){var key=qz.getAttribute('data-key'),qs=$$('.q',qz),prog=$('.qprog',qz),res=$('.result',qz),answered,right;
 qs.forEach(function(){prog.appendChild(document.createElement('span'))});
 function reset(){answered=0;right=0;res.className='result';qs.forEach(function(q,n){prog.children[n].className='';var f=$('.fb',q);f.className='fb';$$('.opt',q).forEach(function(o){o.disabled=false;o.classList.remove('ok','no')})})}
 qs.forEach(function(q,n){var os=$$('.opt',q);os.forEach(function(o){o.addEventListener('click',function(){var ok=o.hasAttribute('data-ok');os.forEach(function(x){x.disabled=true;if(x.hasAttribute('data-ok'))x.classList.add('ok')});if(!ok)o.classList.add('no');
  prog.children[n].className=ok?'ok':'no';fb($('.fb',q),ok?'ok':'no',(ok?'✔ Correcto. ':'✖ Incorrecto. ')+q.getAttribute('data-why'));answered++;if(ok)right++;
  if(answered===qs.length){var sc=Math.round(right/qs.length*100);S.sc=sc;if(S.best===null||sc>S.best)S.best=sc;
   scorm.set('cmi.core.score.raw',S.best);
   if(sc>=PASS){res.className='result show pass';res.innerHTML='<b>Obtuviste '+sc+'%.</b> ¡Aprobado! Superaste el mínimo de '+PASS+'%. Continúa con la siguiente pantalla.';done('pass');done(key)}
   else{res.className='result show fail';res.innerHTML='<b>Obtuviste '+sc+'%.</b> Necesitas al menos '+PASS+'%. Revisa las explicaciones y vuelve a intentarlo. <button type="button" class="btn qretry" style="margin-left:8px">Reintentar</button>';$('.qretry',res).addEventListener('click',function(){reset();qs[0].scrollIntoView({behavior:'smooth'})})}
   save();res.scrollIntoView({behavior:'smooth',block:'center'})}})})});
 reset();if(S.d[key]){res.className='result show pass';res.innerHTML='<b>Mejor resultado: '+S.best+'%.</b> Comprobación aprobada. Puedes volver a responder para repasar. <button type="button" class="btn qretry">Responder de nuevo</button>';$('.qretry',res).addEventListener('click',reset)}});
/* ---------- transferencia ---------- */
$$('.tr').forEach(function(t){var key=t.getAttribute('data-key'),tas=$$('textarea',t),min=+(t.getAttribute('data-min')||25),lock=$('.lockmsg',t.parentNode),f=$('.fb',t.parentNode);
 tas.forEach(function(ta,n){var id=key+n;if(S.tr[id])ta.value=S.tr[id];var c=ta.parentNode.querySelector('.cnt');function upd(){var l=ta.value.trim().length;c.textContent=l>=min?'✔ Listo':'Escribe al menos '+min+' caracteres ('+l+'/'+min+')';S.tr[id]=ta.value}ta.addEventListener('input',function(){upd();check()});ta.addEventListener('blur',save);upd()});
 function check(){var all=tas.every(function(ta){return ta.value.trim().length>=min});if(!all)return;if(!passed()){lock.classList.add('show');return}lock.classList.remove('show');if(!S.d[key]){fb(f,'ok',t.getAttribute('data-ok'));done(key)}}
 t.closest('.screen').addEventListener('enter',function(){if(!passed())lock.classList.add('show');else lock.classList.remove('show');check()})});
/* ---------- finalización ---------- */
var fin=screens[N-1];
fin.addEventListener('enter',function(){if(!passed())return;S.fin=true;
 var ks=Object.keys(S.f),ok=ks.filter(function(k){return S.f[k].ok});
 $('#finScore').textContent=S.best+'%';$('#finFirst').textContent=ok.length+' de '+ks.length;
 $('#finList').innerHTML=ks.map(function(k){return '<li>'+(S.f[k].ok?'✔ ':'↻ ')+S.f[k].l+'</li>'}).join('');
 scorm.set('cmi.core.score.raw',S.best);scorm.set('cmi.core.lesson_status','passed');save();refresh()});
$$('[data-goto]').forEach(function(b){b.addEventListener('click',function(){go(+b.getAttribute('data-goto'))})});
window.addEventListener('beforeunload',function(){save();scorm.finish()});
window.addEventListener('pagehide',function(){save()});
/* ---------- inicio ---------- */
var start=0;var loc=parseInt(scorm.get('cmi.core.lesson_location'),10);if(!isNaN(loc))start=loc;else if(S.c)start=S.c;
start=Math.min(start,unlockedUpTo());cur=start;screens.forEach(function(s,n){s.classList.toggle('active',n===start)});refresh();screens[start].dispatchEvent(new Event('enter'));
})();

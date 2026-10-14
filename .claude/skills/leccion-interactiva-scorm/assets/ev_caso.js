/* ---------- Motor de casos ramificados y laboratorios (requiere ev_core.js y const CASO) ----------
Tipos de etapa: decision · abierta · multi · clasificar · numero · ordenar
Cada etapa: {id, tipo, titulo, escena?, competencia?, siguiente?, ...}. Una etapa sin "siguiente" cierra el caso. */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>String(Math.round(n*100)/100).replace('.',',');
const words=t=>(String(t).trim().match(/\S+/g)||[]).length;
const N={};CASO.etapas.forEach(e=>N[e.id]=e);
const COMP={};(CASO.competencias||[]).forEach(c=>COMP[c.id]=c);
const LAB=CASO.tipo==='laboratorio';
let ST={nombre:'',ruta:[],res:{},cur:null,t0:Date.now()};
const maxOf=e=>e.tipo==='abierta'?0:e.tipo==='decision'?Math.max(...e.opciones.map(o=>o.pts||0)):(e.pts||0);
const app=$('#app');
function shell(){app.innerHTML=`
<div class="topbar"><div class="topbar-row"><span class="course">${esc(CASO.curso)}</span><span id="where">${LAB?'Laboratorio':'Caso práctico'}</span></div></div>
<section class="slide active" id="intro">
  <div class="ev-hero"><div>
    <span class="eyebrow">${esc(CASO.eyebrow||'')}</span><h1>${esc(CASO.titulo)}</h1>
    <div class="lead">${CASO.contexto}</div>
    ${CASO.objetivos?`<ul class="ev-list">${CASO.objetivos.map((o,i)=>`<li><span>${i+1}</span>${o}<small></small></li>`).join('')}</ul>`:''}
    <div class="callout"><strong>Cómo se evalúa:</strong> ${CASO.comoSeEvalua||`cada decisión se responde una sola vez y verás de inmediato su consecuencia y la explicación. Las preguntas de desarrollo no tienen nota automática: al enviarlas verás una respuesta modelo y una lista de criterios para revisar la tuya. Necesitas <strong>${PASS_PCT}%</strong> de los puntos de las decisiones para aprobar.`}</div>
    <label class="namebox"><span style="font-weight:800">Tu nombre (aparecerá en el informe)</span><input id="nm" type="text" maxlength="80" placeholder="Nombre y apellido"/></label>
    <button class="small-btn primary" type="button" id="startBtn" style="margin-top:14px">${LAB?'Entrar al laboratorio →':'Comenzar el caso →'}</button>
  </div>
  <div class="ev-badge"><span>Tiempo estimado</span><b>${esc(CASO.tiempo||'30 min')}</b><span>${esc(CASO.resumen||'')}</span><span>Aprobación: ${PASS_PCT}%</span></div></div>
</section>
<section class="slide active" id="work" hidden>
  <div class="path" id="path"></div>
  <div class="ws ${CASO.expediente&&CASO.expediente.length?'':'noexp'}"><div id="nodeBox"></div>
  ${CASO.expediente&&CASO.expediente.length?`<aside class="exp"><h3>${esc(CASO.expedienteTitulo||'Expediente del caso')}</h3>${CASO.expediente.map(d=>`<details><summary>${esc(d.titulo)}</summary><div class="docb">${d.html}</div></details>`).join('')}</aside>`:''}</div>
</section>
<section class="slide active" id="result" hidden></section>`}
shell();
$('#startBtn').addEventListener('click',()=>{ST.nombre=$('#nm').value.trim();$('#intro').hidden=true;$('#work').hidden=false;go(CASO.inicio||CASO.etapas[0].id)});
function drawPath(){$('#path').innerHTML=ST.ruta.map((id,i)=>{const r=ST.res[id],e=N[id],m=maxOf(e);
  const cls=id===ST.cur&&!r?'cur':!r?'':m===0?'ok':r.pts>=m?'ok':r.pts>0?'mid':'ko';return `<span class="${cls}" title="${esc(e.titulo)}">${i+1}. ${esc(e.corto||e.titulo)}</span>`}).join('');
  const done=ST.ruta.filter(id=>ST.res[id]).length;$('#where').textContent=`Etapa ${ST.ruta.length} · ${done} resueltas`}
function go(id){ST.cur=id;if(!ST.ruta.includes(id))ST.ruta.push(id);const e=N[id];drawPath();
  const head=`<span class="eyebrow">${esc(e.eyebrow||(LAB?'Tarea':'Escena'))} ${ST.ruta.length}</span>${e.competencia&&COMP[e.competencia]?`<span class="ctag">${esc(COMP[e.competencia].nombre)}</span>`:''}
   <h2>${esc(e.titulo)}</h2>${e.escena?`<div class="scene">${e.escena}</div>`:''}`;
  $('#nodeBox').innerHTML=`<div class="cnode" id="nd">${head}${body(e)}<div class="efb"></div><div class="nodeact"><button class="small-btn primary" type="button" id="send" disabled>${e.tipo==='decision'?'Confirmar decisión':'Enviar respuesta'}</button><button class="small-btn primary" type="button" id="next" hidden>${e.siguiente||e.tipo==='decision'?'Continuar →':'Ver resultado →'}</button></div></div>`;
  wire(e);window.scrollTo({top:0,behavior:'smooth'})}
function body(e){
  if(e.tipo==='decision')return `<p class="ask">${e.pregunta}</p><div class="options">${e.opciones.map((o,i)=>`<button class="opt" type="button" data-i="${i}"><span class="letter">${'ABCDE'[i]}</span><span>${o.texto}</span></button>`).join('')}</div>`;
  if(e.tipo==='abierta')return `<p class="ask"><span class="verbo">${esc(e.verbo||'Explica')}</span> ${e.consigna}</p><textarea id="ta" placeholder="Escribe tu respuesta aquí…"></textarea><div class="wc" id="wc">Mínimo ${e.minPalabras||40} palabras · 0 escritas</div>`;
  if(e.tipo==='multi')return `<p class="ask">${e.pregunta}</p><div class="chkgrid">${e.items.map((it,i)=>`<label><input type="checkbox" value="${i}"/> <span>${it.texto}</span></label>`).join('')}</div>`;
  if(e.tipo==='clasificar')return `<p class="ask">${e.pregunta}</p>${e.items.map((it,i)=>`<div class="rowsel"><span>${it.texto}</span><select data-i="${i}"><option value="">Elige…</option>${e.categorias.map((c,k)=>`<option value="${k}">${esc(c)}</option>`).join('')}</select><div class="why" hidden></div></div>`).join('')}`;
  if(e.tipo==='ordenar'){const ord=e.items.map((_,i)=>i);for(let k=ord.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[ord[k],ord[j]]=[ord[j],ord[k]]}
    if(ord.every((v,i)=>v===i))ord.reverse();
    return `<p class="ask">${e.pregunta}</p>${ord.map(i=>e.items[i]).map((it,n)=>`<div class="rowsel"><span>${it.texto}</span><select data-i="${ord[n]}">`+e.items.map((_,k)=>`<option value="${k}">${k+1}º</option>`).join('').replace(/^/,'<option value="">Posición…</option>')+`</select><div class="why" hidden></div></div>`).join('')}`}
  if(false)return `<p class="ask">${e.pregunta}</p>${e.items.map((it,i)=>`<div class="rowsel"><span>${it.texto}</span><select data-i="${i}"><option value="">Posición…</option>${e.items.map((_,k)=>`<option value="${k}">${k+1}º</option>`).join('')}</select><div class="why" hidden></div></div>`).join('')}`;
  if(e.tipo==='numero')return `<p class="ask">${e.pregunta}</p>${e.campos.map((c,i)=>`<div class="rowsel"><span>${c.label}</span><input inputmode="decimal" data-i="${i}" placeholder="${esc(c.unidad||'')}"/></div>`).join('')}`;
  return ''}
function wire(e){const nd=$('#nd'),send=$('#send');
  if(e.tipo==='decision')$$('.opt',nd).forEach(b=>b.addEventListener('click',()=>{if(ST.res[e.id])return;$$('.opt',nd).forEach(x=>x.classList.toggle('sel',x===b));nd.dataset.sel=b.dataset.i;send.disabled=false}));
  if(e.tipo==='abierta'){const ta=$('#ta'),mn=e.minPalabras||40;ta.addEventListener('input',()=>{const w=words(ta.value);$('#wc').textContent=`Mínimo ${mn} palabras · ${w} escritas`;$('#wc').classList.toggle('ok',w>=mn);send.disabled=w<mn})}
  if(e.tipo==='multi')$$('input',nd).forEach(i=>i.addEventListener('change',()=>send.disabled=!$$('input',nd).some(x=>x.checked)));
  if(['clasificar','ordenar'].includes(e.tipo))$$('select',nd).forEach(s=>s.addEventListener('change',()=>send.disabled=$$('select',nd).some(x=>x.value==='')));
  if(e.tipo==='numero')$$('input',nd).forEach(s=>s.addEventListener('input',()=>send.disabled=$$('input',nd).some(x=>x.value.trim()==='')));
  send.addEventListener('click',()=>{send.hidden=true;evaluate(e);$('#next').hidden=false});
  $('#next').addEventListener('click',()=>{const r=ST.res[e.id],nx=r&&r.next!==undefined?r.next:e.siguiente;nx?go(nx):result()})}
function fb(cls,html){$('#nd .efb').innerHTML=`<div class="feedback ${cls}">${html}</div>`}
function evaluate(e){const nd=$('#nd'),m=maxOf(e);let pts=0,ans='',det='';
  if(e.tipo==='decision'){const i=+nd.dataset.sel,o=e.opciones[i],best=Math.max(...e.opciones.map(x=>x.pts||0));pts=o.pts||0;ans=o.texto.replace(/<[^>]+>/g,'');
    $$('.opt',nd).forEach((b,k)=>{b.disabled=true;const ok=(e.opciones[k].pts||0)===best;b.classList.add(k===i?(pts===best?'good':pts>0?'sel':'bad'):ok?'good':'dim')});
    det=o.fb;fb(pts===best?'good':pts>0?'warn':'bad',`<strong>${pts===best?'Buena decisión.':pts>0?'Decisión parcialmente adecuada.':'Decisión riesgosa.'} ${fmt(pts)} de ${fmt(m)} ${m===1?'punto':'puntos'}.</strong> <span class="fb-body">${o.fb}</span>${pts<best&&e.ideal?`<p style="margin:.5em 0 0"><b>Lo recomendable:</b> ${e.ideal}</p>`:''}`);
    ST.res[e.id]={pts,max:m,ans,fb:o.fb+(pts<best&&e.ideal?' Lo recomendable: '+e.ideal:''),next:o.siguiente||e.siguiente||null}}
  else if(e.tipo==='abierta'){const ta=$('#ta');ta.disabled=true;ans=ta.value.trim();
    fb('good',`<strong>Respuesta registrada.</strong> <span class="fb-body">Compárala con la respuesta modelo y marca los criterios que cumple tu respuesta.</span>
     <div class="model"><b>Respuesta modelo:</b> ${e.modelo}</div><div class="crit">${e.criterios.map((c,i)=>`<label><input type="checkbox" data-c="${i}"/> <span>${c}</span></label>`).join('')}</div>`);
    ST.res[e.id]={pts:0,max:0,ans,fb:e.modelo,crit:e.criterios.map(c=>({c,ok:false})),abierta:true};
    $$('.crit input',nd).forEach(x=>x.addEventListener('change',()=>{ST.res[e.id].crit[+x.dataset.c].ok=x.checked}))}
  else if(e.tipo==='multi'){const sel=$$('input',nd).map(x=>x.checked),nOk=e.items.filter(i=>i.ok).length;let hit=0,miss=0;
    $$('.chkgrid label',nd).forEach((l,i)=>{const it=e.items[i],c=sel[i];$('input',l).disabled=true;l.classList.add(c&&it.ok?'good':c&&!it.ok?'bad':!c&&it.ok?'miss':'x');if(c&&it.ok)hit++;if(c&&!it.ok)miss++});
    pts=Math.max(0,m*(hit-miss)/nOk);ans=e.items.filter((_,i)=>sel[i]).map(i=>i.texto.replace(/<[^>]+>/g,'')).join(' | ');
    det=e.items.map((it,i)=>`${it.ok?'✔':'✘'} ${it.texto}${it.fb?': '+it.fb:''}`).join('<br/>');
    fb(pts>=m?'good':pts>0?'warn':'bad',`<strong>${fmt(pts)} de ${fmt(m)} puntos.</strong> <span class="fb-body">${e.fb?e.fb+'<br/>':''}${det}</span>`);ST.res[e.id]={pts,max:m,ans,fb:(e.fb||'')+' '+det}}
  else if(['clasificar','ordenar'].includes(e.tipo)){let ok=0;const ss=$$('select',nd),parts=[];
    ss.forEach(s=>{const i=+s.dataset.i,it=e.items[i],good=e.tipo==='ordenar'?+s.value===i:+s.value===it.cat;s.disabled=true;s.classList.add(good?'good':'bad');if(good)ok++;
      const w=s.parentElement.querySelector('.why');const right=e.tipo==='ordenar'?`${i+1}º`:e.categorias[it.cat];w.hidden=false;w.innerHTML=`${good?'✔':'✘ Correcto: <b>'+esc(right)+'</b>.'} ${it.fb||''}`;
      parts.push(`${it.texto.replace(/<[^>]+>/g,'')} → ${e.tipo==='ordenar'?(+s.value+1)+'º':e.categorias[+s.value]}`)});
    pts=m*ok/e.items.length;ans=parts.join(' | ');fb(pts>=m?'good':pts>0?'warn':'bad',`<strong>${ok} de ${e.items.length} correctas · ${fmt(pts)} de ${fmt(m)} puntos.</strong> <span class="fb-body">${e.fb||''}</span>`);
    ST.res[e.id]={pts,max:m,ans,fb:e.fb||''}}
  else if(e.tipo==='numero'){let ok=0;const ii=$$('input',nd),parts=[];
    ii.forEach((x,i)=>{const c=e.campos[i],v=num(x.value),good=!isNaN(v)&&Math.abs(v-c.valor)<=(c.tol||0);x.disabled=true;x.classList.add(good?'good':'bad');if(good)ok++;parts.push(`${c.label.replace(/<[^>]+>/g,'')}: ${x.value}`)});
    pts=m*ok/e.campos.length;ans=parts.join(' | ');fb(pts>=m?'good':pts>0?'warn':'bad',`<strong>${ok} de ${e.campos.length} correctas · ${fmt(pts)} de ${fmt(m)} puntos.</strong> <span class="fb-body">${e.solucion||''}</span>`);
    ST.res[e.id]={pts,max:m,ans,fb:e.solucion||''}}
  ST.res[e.id].titulo=e.titulo;ST.res[e.id].comp=e.competencia;ST.res[e.id].tipo=e.tipo;ST.res[e.id].pregunta=(e.pregunta||e.consigna||'').replace(/<[^>]+>/g,'');
  if(e.siguiente===undefined&&e.tipo!=='decision')$('#next').textContent='Ver resultado →';
  if(e.tipo==='decision'&&!ST.res[e.id].next)$('#next').textContent='Ver resultado →';
  drawPath()}
function summary(){const ids=ST.ruta.filter(id=>ST.res[id]);const g=ids.filter(id=>ST.res[id].max>0);
  const pts=g.reduce((a,id)=>a+ST.res[id].pts,0),max=g.reduce((a,id)=>a+ST.res[id].max,0),pct=max?Math.round(pts/max*100):100;
  const cs={};g.forEach(id=>{const r=ST.res[id],k=r.comp||'_';cs[k]=cs[k]||{p:0,m:0};cs[k].p+=r.pts;cs[k].m+=r.max});
  return {ids,pts,max,pct,pass:pct>=PASS_PCT,cs}}
function globalFb(S){const fu=[],me=[];Object.entries(S.cs).forEach(([k,v])=>{const c=COMP[k];if(!c)return;const p=Math.round(v.p/v.m*100);
  (p>=80?fu:me).push(p>=80?`<li><b>${esc(c.nombre)}</b> (${p}%): ${c.fortaleza||'aplicaste correctamente los criterios.'}</li>`:`<li><b>${esc(c.nombre)}</b> (${p}%): ${c.mejora||'repasa los contenidos asociados.'}${c.repasar?` <i>Repasa: ${esc(c.repasar)}.</i>`:''}</li>`)});
  const ab=S.ids.filter(id=>ST.res[id].abierta),cc=ab.reduce((a,id)=>a+ST.res[id].crit.filter(x=>x.ok).length,0),ct=ab.reduce((a,id)=>a+ST.res[id].crit.length,0);
  return {fu,me,ab:ab.length,txt:ct?`En tus respuestas de desarrollo marcaste ${cc} de ${ct} criterios cumplidos.`:''}}
function reportHTML(S,G,full){const fecha=new Date().toLocaleString('es-CL');
  const items=S.ids.map((id,i)=>{const r=ST.res[id];return `<div class="ritem"><h4>${i+1}. ${esc(r.titulo)}${r.max?` · ${fmt(r.pts)} / ${fmt(r.max)} pts`:' · desarrollo'}</h4>${r.pregunta?`<div><i>${esc(r.pregunta)}</i></div>`:''}<div class="ans">${esc(r.ans)}</div>
    ${r.abierta?`<div><b>Respuesta modelo:</b> ${r.fb}</div><div><b>Autoevaluación:</b><br/>${r.crit.map(x=>`${x.ok?'☑':'☐'} ${esc(x.c)}`).join('<br/>')}</div>`:`<div><b>Retroalimentación:</b> ${r.fb}</div>`}</div>`}).join('');
  const comp=Object.entries(S.cs).filter(([k])=>COMP[k]).map(([k,v])=>{const p=Math.round(v.p/v.m*100);return `<div class="comp"><span>${esc(COMP[k].nombre)}</span><span class="bar"><i style="width:${p}%"></i></span><b>${p}%</b></div>`}).join('');
  const head=`<h2 style="margin:.2em 0">${esc(CASO.titulo)}</h2><p><b>Participante:</b> ${esc(ST.nombre||'(sin nombre)')} · <b>Fecha:</b> ${fecha}<br/><b>Puntaje:</b> ${fmt(S.pts)} / ${fmt(S.max)} (${S.pct}%) · <b>Estado:</b> ${S.pass?'Aprobado':'No aprobado'} (mínimo ${PASS_PCT}%)</p>`;
  const glob=`<div class="glob"><div><h3>Fortalezas</h3><ul>${G.fu.join('')||'<li>Aún no hay competencias sobre 80%.</li>'}</ul></div><div><h3>Aspectos a mejorar</h3><ul>${G.me.join('')||'<li>No hay competencias bajo 80%. ¡Buen trabajo!</li>'}</ul></div></div>${G.txt?`<p>${G.txt}</p>`:''}`;
  return full?{head,comp,glob,items}:head+comp+glob+'<h3>Detalle del recorrido</h3>'+items}
function result(){const S=summary(),G=globalFb(S),R=reportHTML(S,G,true);$('#work').hidden=true;const box=$('#result');box.hidden=false;
  box.innerHTML=`<div class="score"><div class="ring" style="background:conic-gradient(${S.pass?'var(--good-line)':'var(--bad-line)'} ${S.pct*3.6}deg,var(--track) 0)"><span style="background:var(--surface);width:84px;height:84px;border-radius:50%;display:grid;place-items:center;font-size:1.4rem">${S.pct}%</span></div>
   <div><span class="eyebrow">Resultado · ${esc(CASO.eyebrow||'')}</span><h2>${S.pass?'¡Aprobado!':'Aún no alcanzas el mínimo'}</h2><p><b>Puntaje: ${fmt(S.pts)} / ${fmt(S.max)}</b></p><p>${S.pass?`Superaste el ${PASS_PCT}% requerido.`:`Necesitas al menos ${PASS_PCT}% para aprobar. Revisa la retroalimentación, repasa lo indicado e inténtalo de nuevo.`}</p></div></div>
   <h3 style="margin-top:18px">Retroalimentación global</h3>${R.comp}${R.glob}${CASO.cierre?`<div class="callout" style="margin-top:12px">${CASO.cierre}</div>`:''}
   <div class="completion-actions noprint" style="justify-content:flex-start;flex-wrap:wrap"><button class="small-btn primary" type="button" id="dl">Descargar informe</button><button class="small-btn" type="button" id="pr">Imprimir o guardar PDF</button><button class="small-btn" type="button" id="tg">Ver detalle de mis respuestas</button><button class="small-btn" type="button" id="retry">Nuevo intento</button></div>
   <div class="rep" id="rep" hidden>${R.head}<h3>Detalle del recorrido</h3>${R.items}</div>`;
  $('#tg').addEventListener('click',()=>{$('#rep').hidden=!$('#rep').hidden});
  $('#pr').addEventListener('click',()=>{$('#rep').hidden=false;window.print()});
  $('#retry').addEventListener('click',()=>location.reload());
  $('#dl').addEventListener('click',()=>{const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');
    const doc=`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Informe — ${esc(CASO.titulo)}</title><style>${css}</style></head><body><main class="app ev caso" style="padding:24px">${reportHTML(S,G,false)}</main></body></html>`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([doc],{type:'text/html'}));a.download=`Informe_${(CASO.codigo||'caso')}_${(ST.nombre||'participante').replace(/[^\wÁÉÍÓÚáéíóúñÑ]+/g,'_')}.html`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)});
  S.ids.forEach((id,n)=>{const r=ST.res[id],b=`cmi.interactions.${n}.`;SC.set(b+'id',(CASO.codigo||'C')+'_'+id);SC.set(b+'type',r.abierta?'fill-in':'choice');
    SC.set(b+'student_response',r.ans.replace(/[\r\n]+/g,' ').slice(0,250));if(!r.abierta)SC.set(b+'result',r.pts>=r.max?'correct':'wrong')});
  SC.set('cmi.core.score.min',0);SC.set('cmi.core.score.max',100);SC.set('cmi.core.score.raw',S.pct);SC.set('cmi.core.lesson_status',S.pass?'passed':'failed');SC.set('cmi.core.exit','');SC.commit();
  window.scrollTo({top:0,behavior:'smooth'})}

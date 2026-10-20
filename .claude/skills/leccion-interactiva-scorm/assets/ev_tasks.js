
/* ---------- Motor de tareas calificadas ---------- */
const tasks=$$('.etask'),R={};let cur=0;
const totalPts=tasks.reduce((a,t)=>a+ +t.dataset.pts,0);
$('#totPts').textContent=totalPts;
function draw(){
  tasks.forEach((t,i)=>t.classList.toggle('active',i===cur));
  $('#steps').innerHTML=tasks.map((t,i)=>`<span class="${i===cur?'cur':''} ${R[t.id]?'done':''}" title="${t.dataset.title}">${i+1}</span>`).join('');
  $('#evNext').disabled=!R[tasks[cur].id];$('#evNext').textContent=cur===tasks.length-1?'Ver resultado →':'Siguiente tarea →';
  $('#evPrev').disabled=cur===0;$('#taskN').textContent=`Tarea ${cur+1} de ${tasks.length}`;
  window.scrollTo({top:0,behavior:'smooth'})}
function grade(id,earned,max,html){R[id]={earned:Math.round(earned*100)/100,max};
  const t=$('#'+id);$$('input,select,button.opt,button.gbtn,.yn button',t).forEach(e=>{if(!e.classList.contains('keep'))e.disabled=true});
  const sb=$('.submit',t);if(sb)sb.disabled=true;
  $('.efb',t).innerHTML=`<div class="feedback ${earned>=max?'good':earned>0?'warn':'bad'}"><strong>Obtuviste ${String(R[id].earned).replace('.',',')} de ${max} ${max===1?'punto':'puntos'}.</strong> <span class="fb-body">${html}</span></div>`;draw()}
$('#evPrev').addEventListener('click',()=>{if(cur>0){cur--;draw()}});
$('#evNext').addEventListener('click',()=>{if(!R[tasks[cur].id])return;if(cur<tasks.length-1){cur++;draw()}else result()});
$('#startBtn').addEventListener('click',()=>{$('#intro').hidden=true;$('#work').hidden=false;draw()});
function result(){const pts=Object.values(R).reduce((a,r)=>a+r.earned,0),pct=Math.round(pts/totalPts*100),pass=pct>=PASS_PCT;
  $('#work').hidden=true;$('#result').hidden=false;
  $('#rScore').textContent=`${String(Math.round(pts*10)/10).replace('.',',')} / ${totalPts}`;$('#rPct').textContent=pct+'%';
  $('#rRing').style.background=`conic-gradient(${pass?'var(--good-line)':'var(--bad-line)'} ${pct*3.6}deg,var(--track) 0)`;
  $('#rTitle').textContent=pass?'¡Aprobado!':'Aún no alcanzas el mínimo';
  $('#rMsg').textContent=pass?`Superaste el ${PASS_PCT}% requerido.`:`Necesitas al menos ${PASS_PCT}% para aprobar. Revisa el detalle, repasa las lecciones indicadas e inténtalo de nuevo.`;
  $('#rTable').innerHTML=tasks.map(t=>{const r=R[t.id];return `<tr><td>${t.dataset.title}<br/><small>${t.dataset.lesson}</small></td><td>${String(r.earned).replace('.',',')} / ${r.max}</td></tr>`}).join('');
  SC.set('cmi.core.score.min',0);SC.set('cmi.core.score.max',100);SC.set('cmi.core.score.raw',pct);SC.set('cmi.core.lesson_status',pass?'passed':'failed');SC.set('cmi.core.exit','');SC.commit();
  window.scrollTo({top:0,behavior:'smooth'})}
$('#retry').addEventListener('click',()=>location.reload());
$('#review').addEventListener('click',()=>{$('#result').hidden=true;$('#work').hidden=false;cur=0;draw()});

/* Opción múltiple calificada: <div class="options" data-mc="id" data-correct="B" data-fb-ok=".." data-fb-ko=".."> */
$$('[data-mc]').forEach(box=>{const t=box.closest('.etask'),key=box.dataset.mc;
  $$('.opt',box).forEach(b=>b.addEventListener('click',()=>{$$('.opt',box).forEach(x=>x.classList.toggle('sel',x===b));box.dataset.sel=b.dataset.opt;
    const sb=$('.submit',t);if(sb&&$$('[data-mc]',t).every(x=>x.dataset.sel))sb.disabled=false}))});
function mcScore(t){let e=0,msgs=[];$$('[data-mc]',t).forEach(box=>{const ok=box.dataset.sel===box.dataset.correct;if(ok)e+= +(box.dataset.w||1);
  $$('.opt',box).forEach(x=>{if(x.dataset.opt===box.dataset.correct)x.classList.add('good');else if(x.dataset.opt===box.dataset.sel)x.classList.add('bad');else x.classList.add('dim')});
  msgs.push(ok?box.dataset.fbOk:box.dataset.fbKo)});return [e,msgs.join(' ')]}
$$('.etask[data-auto="mc"] .submit').forEach(sb=>sb.addEventListener('click',()=>{const t=sb.closest('.etask');const [e,m]=mcScore(t);grade(t.id,e,+t.dataset.pts,m)}));

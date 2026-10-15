/* Evaluación diagnóstica integral
   Paso 1: autoevaluación por aprendizaje esperado (AE1–AE4).
   Paso 2: 20 situaciones, 5 por módulo (D1.1…D4.5), sin retroalimentación inmediata.
   Paso 3: mapa de competencias (radar resultado vs. autopercepción, nivel por AE, mapa por lección,
   ruta sugerida y detalle con retroalimentación de cada alternativa) y PDF descargable (generado en el navegador).
   Sin nota de aprobación: registra el porcentaje global como referencia. */
(function(){
const D=window.LESSON.dg,P=D.P,AE=D.AE,L4='ABCD';
const SH=['Fundamentos de IA','Revisión y validación','Análisis y reportes','Automatización'];
let api=null,S=null,qi=0;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function ST(){if(!S.first.dg)S.first.dg={fn:'',ln:'',auto:[-1,-1,-1,-1],a:Array(P.length).fill(-1),fin:0};return S.first.dg}
const okQ=(st,i)=>st.a[i]===P[i].c;
const res=st=>[0,1,2,3].map(k=>{const qs=P.map((q,i)=>i).filter(i=>P[i].ae===k);return Math.round(qs.filter(i=>okQ(st,i)).length/qs.length*100)});
const per=st=>st.auto.map(v=>v<0?0:Math.round((v+1)/4*100));
const glob=st=>Math.round(P.filter((q,i)=>okQ(st,i)).length/P.length*100);
const LV=p=>p>=80?['Avanzado','good']:p>=60?['En desarrollo','warn']:['Inicial','bad'];
const LVTXT={Avanzado:'Dominas los criterios principales: aprovecha el módulo para profundizar y aplicar lo aprendido en tu trabajo.',
 'En desarrollo':'Tienes una base: refuerza las lecciones indicadas en tu ruta sugerida.',
 Inicial:'Este módulo será clave para ti: recórrelo completo y con calma, incluidos los laboratorios.'};
function gapTxt(r,p){if(p-r>=40)return 'Tu autopercepción es mayor que tu resultado: revisa con atención las lecciones de tu ruta.';
  if(r-p>=40)return 'Tu resultado supera tu autopercepción: sabes más de lo que crees.';return 'Tu autopercepción es coherente con tu resultado.'}
function lessonName(q){const m=AE[q.ae];return m.lecc[q.lec]?'Lección '+m.lecc[q.lec]:'Integración del '+m.mod.split(' · ')[0]+': laboratorios A y B'}
function route(st){const out=[];P.forEach((q,i)=>{if(!okQ(st,i)){const n=lessonName(q);if(!out.includes(n))out.push(n)}});return out}
function fullName(st){return (st.fn+' '+st.ln).trim()}
function studentName(){try{let w=window,n=0;while(w&&!w.API&&w.parent&&w.parent!==w&&n<10){w=w.parent;n++}if(w&&w.API){const v=String(w.API.LMSGetValue('cmi.core.student_name')||'');if(v){const p=v.split(',');return p.length===2?[p[1].trim(),p[0].trim()]:[v,'']}}}catch(e){}return ['','']}

/* ---------- Paso 1: inicio ---------- */
function startInit(){const st=ST(),f=$('#dgFirst'),l=$('#dgLast');
  if(!st.fn&&!st.ln){const n=studentName();st.fn=n[0];st.ln=n[1]}
  f.value=st.fn;l.value=st.ln;$('#dgComp').textContent=D.COMP;
  f.addEventListener('input',()=>{st.fn=f.value.trim().slice(0,40)});l.addEventListener('input',()=>{st.ln=l.value.trim().slice(0,40)});
  $('#dgStart').addEventListener('click',()=>{if(!st.fn||!st.ln){$('#dgErr').textContent='Escribe tu nombre y tu apellido para continuar.';return}
    $('#dgErr').textContent='';api.done('start');document.getElementById('nextBtn').click()})}

/* ---------- Paso 2: autoevaluación ---------- */
function autoRender(){const st=ST(),root=$('#dgAuto');
  root.innerHTML=D.AUTO.map((t,k)=>`<div class="dg-ai"><span class="ae">${AE[k].ae} · ${esc(AE[k].mod)}</span><p>${esc(t)}</p>
    <div class="dg-lv" role="group" aria-label="Nivel en ${AE[k].ae}">${D.NIV.map((n,j)=>`<button type="button" class="${st.auto[k]===j?'on':''}" data-k="${k}" data-j="${j}" aria-pressed="${st.auto[k]===j}"><i>${'●'.repeat(j+1)}${'○'.repeat(3-j)}</i>${esc(n)}</button>`).join('')}</div></div>`).join('');
  root.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{st.auto[+b.dataset.k]=+b.dataset.j;if(st.auto.every(v=>v>=0))api.done('auto');autoRender()}))}

/* ---------- Paso 3: preguntas ---------- */
function qRender(){const st=ST(),root=$('#dgQ');if(qi<0||qi>=P.length)qi=0;
  const q=P[qi],a=st.a[qi],n=st.a.filter(x=>x>=0).length,all=n===P.length;
  root.innerHTML=`<div class="dg-dots">${P.map((p,i)=>`<button type="button" class="${i===qi?'now':st.a[i]>=0?'a':''}" data-i="${i}" aria-label="Pregunta ${p.id}${st.a[i]>=0?' (respondida)':''}"></button>`).join('')}</div>
   <div class="dg-q"><div class="dg-qhead"><span class="dg-id">${q.id}</span><span>${esc(AE[q.ae].mod)} · ${esc(q.tema)}</span><span class="dg-n">Pregunta ${qi+1} de ${P.length}</span></div>
   <h3>${esc(q.q)}</h3><div class="options">${q.o.map((o,j)=>`<button class="opt ${a===j?'sel':''}" type="button" data-j="${j}" ${st.fin?'disabled':''} aria-pressed="${a===j}"><span class="letter">${L4[j]}</span><span>${esc(o)}</span></button>`).join('')}</div></div>
   <div class="dg-nav"><button class="small-btn" type="button" id="dgPrev" ${qi===0?'disabled':''}>← Anterior</button>
   ${qi<P.length-1?`<button class="small-btn primary" type="button" id="dgNext" ${a<0?'disabled':''}>Siguiente pregunta →</button>`:''}</div>
   <div class="callout" style="margin-top:12px"><strong>${n} de ${P.length} respondidas</strong>
   <p style="margin:6px 0 0">${st.fin?'Diagnóstico terminado. Presiona <b>Siguiente</b> para ver tu mapa de competencias.':all?'Ya respondiste todas. Puedes revisar tus respuestas o terminar.':'Responde todas las preguntas para ver tu mapa de competencias.'}</p>
   ${all&&!st.fin?'<button class="small-btn primary" type="button" id="dgFin" style="margin-top:10px">Ver mi mapa de competencias →</button>':''}</div>`;
  root.querySelectorAll('.dg-dots button').forEach(b=>b.addEventListener('click',()=>{qi=+b.dataset.i;qRender()}));
  root.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{if(st.fin)return;st.a[qi]=+b.dataset.j;
    if(qi<P.length-1&&st.a.filter(x=>x>=0).length<P.length){qRender();setTimeout(()=>{qi++;qRender()},260)}else qRender()}));
  const pv=$('#dgPrev');if(pv)pv.addEventListener('click',()=>{qi--;qRender()});
  const nx=$('#dgNext');if(nx)nx.addEventListener('click',()=>{qi++;qRender()});
  const fn=$('#dgFin');if(fn)fn.addEventListener('click',()=>{st.fin=1;api.done('q');qRender();document.getElementById('nextBtn').click()})}

/* ---------- Radar (SVG) ---------- */
function radarSVG(r,p){const cx=320,cy=220,R=130,ang=k=>-Math.PI/2+k*Math.PI/2,pt=(k,v)=>[cx+Math.cos(ang(k))*R*v/100,cy+Math.sin(ang(k))*R*v/100];
  const ring=v=>[0,1,2,3].map(k=>pt(k,v).map(n=>n.toFixed(1)).join(',')).join(' ');
  const lab=[[cx,cy-R-34,'middle'],[cx+R+14,cy-6,'start'],[cx,cy+R+26,'middle'],[cx-R-14,cy-6,'end']];
  return `<svg viewBox="0 0 640 440" role="img" aria-label="Radar de competencias: ${r.map((v,k)=>AE[k].ae+' resultado '+v+' por ciento, autopercepción '+p[k]+' por ciento').join('; ')}">
   ${[25,50,75,100].map(v=>`<polygon class="grid" points="${ring(v)}"/>`).join('')}
   ${[0,1,2,3].map(k=>{const e=pt(k,100);return `<line class="axis" x1="${cx}" y1="${cy}" x2="${e[0]}" y2="${e[1]}"/>`}).join('')}
   ${[25,50,75,100].map(v=>`<text class="v" x="${cx+5}" y="${(cy-R*v/100+12).toFixed(0)}">${v}%</text>`).join('')}
   <polygon class="res" points="${r.map((v,k)=>pt(k,Math.max(v,3)).join(',')).join(' ')}"/>
   <polygon class="per" points="${p.map((v,k)=>pt(k,Math.max(v,3)).join(',')).join(' ')}"/>
   ${r.map((v,k)=>{const q=pt(k,Math.max(v,3));return `<circle class="dot" cx="${q[0]}" cy="${q[1]}" r="5"/>`}).join('')}
   ${p.map((v,k)=>{const q=pt(k,Math.max(v,3));return `<circle class="pdot" cx="${q[0]}" cy="${q[1]}" r="3.5"/>`}).join('')}
   ${lab.map((l,k)=>`<text x="${l[0]}" y="${l[1]}" text-anchor="${l[2]}">${AE[k].ae} · ${r[k]}%</text><text class="v" x="${l[0]}" y="${l[1]+15}" text-anchor="${l[2]}">${SH[k]}</text>`).join('')}
  </svg>`}

/* ---------- Mapa de competencias ---------- */
function report(){const st=ST(),el=$('#dgReport');if(!el)return;const r=res(st),p=per(st),g=glob(st),rt=route(st),nc=P.filter((q,i)=>okQ(st,i)).length;
  el.innerHTML=`<p class="lead" style="margin:.2rem 0 0">${esc(fullName(st))}, este es tu punto de partida en la competencia: <em>${esc(D.COMP)}</em></p>
   <div class="dg-sum"><div>Respuestas correctas<b>${nc} de ${P.length}</b></div><div>Resultado global<b>${g} %</b></div><div>Aprendizajes esperados<b>4</b></div></div>
   <div class="dg-map"><div class="dg-radar">${radarSVG(r,p)}<div class="dg-leg"><span><i></i>Resultado del diagnóstico</span><span><i class="p"></i>Tu autopercepción</span></div></div>
   <div>${r.map((v,k)=>{const l=LV(v);return `<div class="dg-ae"><div class="top"><b>${AE[k].ae} · ${esc(AE[k].corto)}</b><span class="pill ${l[1]}">${l[0]}</span></div>
     <div class="dg-bars"><span>Resultado</span><span class="dg-bar"><span style="width:${v}%"></span></span><span>${v}%</span><span>Autopercepción</span><span class="dg-bar p"><span style="width:${p[k]}%"></span></span><span>${p[k]}%</span></div>
     <p>${LVTXT[l[0]]} ${gapTxt(v,p[k])}</p></div>`}).join('')}</div></div>
   <h3 style="margin-top:16px">Mapa por aprendizaje esperado y lección</h3>
   <p class="hint">Cada casilla es una situación: verde, respuesta correcta; rojo, por reforzar. La última columna integra el criterio del aprendizaje esperado.</p>
   <div class="dg-grid"><span></span>${['x.1','x.2','x.3','x.4','<span class="lg">Integración</span><span class="sm">Integr.</span>'].map(h=>`<span class="h">${h}</span>`).join('')}
   ${[0,1,2,3].map(k=>`<span class="r">${AE[k].ae}</span>`+P.map((q,i)=>[q,i]).filter(([q])=>q.ae===k).map(([q,i])=>`<span class="c ${okQ(st,i)?'ok':'no'}" title="${q.id} · ${esc(q.tema)}">${okQ(st,i)?'✓':'✕'} ${q.lec.startsWith('AE')?'':q.lec}</span>`).join('')).join('')}</div>
   <h3 style="margin-top:16px">Tu ruta sugerida</h3>
   ${rt.length?`<p>Pon especial atención a:</p><ol class="dg-route">${rt.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:'<p>Respondiste todas las situaciones correctamente. Recorre el curso completo para profundizar y aplicar cada criterio en tu trabajo.</p>'}
   <div class="callout" style="margin-top:14px"><strong>Descarga tu mapa de competencias</strong>
     <p style="margin:6px 0 0">El PDF incluye tu radar, tu nivel por aprendizaje esperado, tu ruta sugerida y todas tus respuestas con su retroalimentación.</p>
     <button class="small-btn primary" type="button" id="dgPdf" style="margin-top:10px">⬇ Descargar PDF</button><span class="hint" id="dgPdfMsg" style="margin-left:8px"></span></div>
   <details class="dg-det"><summary>Ver el detalle de tus respuestas</summary>${P.map((q,i)=>{const a=st.a[i],ok=okQ(st,i);return `<div class="dg-rev ${ok?'ok':'no'}"><span class="tag">${q.id} · ${esc(AE[q.ae].ae)} · ${esc(q.tema)} · ${ok?'✓ Correcta':'✕ Por reforzar'}</span><h4>${esc(q.q)}</h4>
     <p><b>Tu respuesta:</b> ${a>=0?L4[a]+') '+esc(q.o[a]):'—'}${a>=0?'<br><i>'+esc(q.f[a])+'</i>':''}</p>${ok?'':`<p><b>Mejor respuesta:</b> ${L4[q.c]}) ${esc(q.o[q.c])}<br><i>${esc(q.f[q.c])}</i></p>`}</div>`}).join('')}</details>`;
  $('#dgPdf').addEventListener('click',()=>{try{downloadPDF(st);$('#dgPdfMsg').textContent='PDF generado.'}catch(e){$('#dgPdfMsg').textContent='No se pudo generar el PDF: '+e.message}})}

/* ---------- PDF (generador propio, Helvetica WinAnsi, A4) ---------- */
const HW=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const SPECIAL={'€':128,'‚':130,'„':132,'…':133,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151};
function winAnsi(s){let o='';for(const ch of String(s)){let c=ch.codePointAt(0);
  if(SPECIAL[ch]){o+=String.fromCharCode(SPECIAL[ch]);continue}
  if(ch==='✓'){o+='OK';continue}if(ch==='✕'){o+='X';continue}if(ch==='→'){o+='->';continue}if(ch==='≥'){o+='>=';continue}if(ch==='−'){o+='-';continue}
  if(c<32)continue;if(c<127||(c>=160&&c<=255)){o+=ch;continue}o+='?'}return o}
const base=ch=>{const n=ch.normalize('NFD').replace(/[̀-ͯ]/g,'');return n.charCodeAt(0)||32};
function tw(s,size,bold){let w=0;for(const ch of winAnsi(s)){const c=ch.charCodeAt(0),b=c<127?c:base(ch);w+=(b>=32&&b<=126?HW[b-32]:556)}return w*size/1000*(bold?1.06:1)}
function wrap(s,size,bold,maxw){const out=[];String(s).split('\n').forEach(par=>{let line='';par.split(/\s+/).forEach(word=>{const t=line?line+' '+word:word;if(tw(t,size,bold)>maxw&&line){out.push(line);line=word}else line=t});out.push(line)});return out}
function pdfEsc(s){return winAnsi(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function buildPDF(draw){const W=595,H=842,M=48;const pages=[];let ops=[],y=0;
  const rgb=h=>{const n=parseInt(h.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255].map(x=>x.toFixed(3)).join(' ')};
  const doc={W,M,get y(){return y},set y(v){y=v},
    newPage(){if(ops.length)pages.push(ops.join('\n'));ops=[];y=H-M;
      ops.push(`${rgb('#5f7180')} rg BT /F1 8 Tf ${M} 24 Td (${pdfEsc('IA aplicada a la Gestión de Remuneraciones · Evaluación diagnóstica integral')}) Tj ET`);
      ops.push(`BT /F1 8 Tf ${W-M-40} 24 Td (${pdfEsc('Página '+(pages.length+1))}) Tj ET`)},
    need(h){if(y-h<50)doc.newPage()},
    rect(x,yy,w,h,col){ops.push(`${rgb(col)} rg ${x} ${yy} ${w} ${h} re f`)},
    text(x,yy,s,size=10,bold=false,col='#172431'){ops.push(`${rgb(col)} rg BT /${bold?'F2':'F1'} ${size} Tf ${x.toFixed(1)} ${yy.toFixed(1)} Td (${pdfEsc(s)}) Tj ET`)},
    para(s,size=10,bold=false,col='#172431',x=M,maxw=W-2*M,lead=1.35){const ls=wrap(s,size,bold,maxw);ls.forEach(l=>{doc.need(size*lead);y-=size*lead;doc.text(x,y,l,size,bold,col)});return ls.length},
    gap(h){y-=h},
    poly(pts,o={}){if(!pts.length)return;let s=(o.lw?o.lw+' w ':'')+(o.dash?'['+o.dash+'] 0 d ':'[] 0 d ')+(o.fill?rgb(o.fill)+' rg ':'')+(o.stroke?rgb(o.stroke)+' RG ':'');
      s+=pts.map((p,i)=>p[0].toFixed(1)+' '+p[1].toFixed(1)+(i?' l':' m')).join(' ')+(o.close!==false?' h':'')+' '+(o.fill&&o.stroke?'B':o.fill?'f':'S');ops.push(s+' [] 0 d')},
    circle(x,yy,r,col){const k=0.5523*r;ops.push(`${rgb(col)} rg ${x+r} ${yy} m ${x+r} ${yy+k} ${x+k} ${yy+r} ${x} ${yy+r} c ${x-k} ${yy+r} ${x-r} ${yy+k} ${x-r} ${yy} c ${x-r} ${yy-k} ${x-k} ${yy-r} ${x} ${yy-r} c ${x+k} ${yy-r} ${x+r} ${yy-k} ${x+r} ${yy} c f`)},
    table(cols,rows,opt={}){const size=opt.size||8.6,pad=4;const X=[M];cols.forEach(c=>X.push(X[X.length-1]+c.w));
      const head=()=>{doc.need(size*2+pad*2);const h=size*1.4+pad*2;doc.rect(M,y-h,X[X.length-1]-M,h,'#123b4a');cols.forEach((c,i)=>doc.text(X[i]+pad,y-h+pad+2,c.t,size,true,'#ffffff'));y-=h};
      head();rows.forEach((r,ri)=>{const cells=r.map((v,i)=>wrap(v,size,false,cols[i].w-2*pad));const n=Math.max(...cells.map(c=>c.length));const h=n*size*1.3+pad*2;
        if(y-h<50){doc.newPage();head()}
        if(ri%2===0)doc.rect(M,y-h,X[X.length-1]-M,h,'#f1f6f7');
        cells.forEach((ls,i)=>ls.forEach((l,k)=>doc.text(X[i]+pad,y-pad-size*(k+1)*1.3+size*0.3,l,size,false,(opt.color&&opt.color(ri,i))||'#172431')));y-=h})}};
  doc.newPage();draw(doc);pages.push(ops.join('\n'));
  /* ensamblado */
  const objs=[];const add=s=>{objs.push(s);return objs.length};
  add('<< /Type /Catalog /Pages 2 0 R >>');add('PAGES');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids=[];pages.forEach(c=>{const cs=add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`);kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cs} 0 R >>`))});
  objs[1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
  let out='%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';const off=[];objs.forEach((o,i)=>{off.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
  const xref=out.length;out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes=new Uint8Array(out.length);for(let i=0;i<out.length;i++)bytes[i]=out.charCodeAt(i)&255;return bytes}
function downloadPDF(st){const r=res(st),p=per(st),g=glob(st),rt=route(st),nc=P.filter((q,i)=>okQ(st,i)).length,d=new Date(),
  fecha=d.toLocaleDateString('es-CL',{day:'2-digit',month:'long',year:'numeric'})+' · '+d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
  const bytes=buildPDF(doc=>{const M=doc.M,W=doc.W;
    doc.rect(0,842-118,W,118,'#123b4a');doc.rect(0,842-122,W,4,'#159aa3');
    doc.text(M,842-44,'IA APLICADA A LA GESTIÓN DE REMUNERACIONES',9,true,'#7fd8d0');
    doc.text(M,842-72,'Mapa de competencias · Evaluación diagnóstica',20,true,'#ffffff');
    doc.text(M,842-94,'Autoevaluación y 20 situaciones por aprendizaje esperado · Sin nota',10,false,'#d7ecee');
    doc.y=842-150;
    doc.text(M,doc.y,'Participante:',10,true);doc.text(M+80,doc.y,fullName(st)||'(sin nombre)',10);doc.gap(16);
    doc.text(M,doc.y,'Fecha:',10,true);doc.text(M+80,doc.y,fecha,10);doc.gap(10);
    doc.para('Competencia del curso: '+D.COMP,9.5,false,'#28404e');doc.gap(10);
    const bx=doc.y-46;doc.rect(M,bx,W-2*M,52,'#e9f6f5');
    doc.text(M+16,bx+28,'Resultado global: '+g+' %  ·  '+nc+' de '+P.length+' respuestas correctas',14,true,'#0b666d');
    doc.text(M+16,bx+11,'Diagnóstico inicial de conocimientos: no es una calificación ni una certificación de competencias.',9,false,'#5f7180');
    doc.y=bx-20;doc.text(M,doc.y,'Radar de competencias',13,true,'#123b4a');
    /* radar */
    const cx=M+150,cy=doc.y-148,R=88,pt=(k,v)=>{const a=Math.PI/2-k*Math.PI/2;return [cx+Math.cos(a)*R*v/100,cy+Math.sin(a)*R*v/100]};
    doc.poly([0,1,2,3].map(k=>pt(k,Math.max(r[k],3))),{fill:'#cdeeea'});
    [25,50,75,100].forEach(v=>doc.poly([0,1,2,3].map(k=>pt(k,v)),{stroke:'#c9d6dc',lw:0.8}));
    [0,1,2,3].forEach(k=>doc.poly([[cx,cy],pt(k,100)],{stroke:'#c9d6dc',lw:0.8,close:false}));
    doc.poly([0,1,2,3].map(k=>pt(k,Math.max(r[k],3))),{stroke:'#0f7a82',lw:2.2});
    doc.poly([0,1,2,3].map(k=>pt(k,Math.max(p[k],3))),{stroke:'#c97d0e',lw:1.6,dash:'4 3'});
    [0,1,2,3].forEach(k=>{const q=pt(k,Math.max(r[k],3));doc.circle(q[0],q[1],3,'#0f7a82')});
    const lab=[[cx,cy+R+22,'c'],[cx+R+8,cy+3,'l'],[cx,cy-R-16,'c'],[cx-R-8,cy+3,'r']];
    lab.forEach((l,k)=>{const t1=AE[k].ae+' · '+r[k]+' %',t2=SH[k];[[t1,9,true,'#172431'],[t2,7.5,false,'#5f7180']].forEach(([t,s,b,c],j)=>{const w=tw(t,s,b);const x=l[2]==='c'?l[0]-w/2:l[2]==='r'?l[0]-w:l[0];doc.text(x,l[1]-j*10,t,s,b,c)})});
    [25,50,75,100].forEach(v=>doc.text(cx+3,cy+R*v/100-9,v+'%',6.5,false,'#5f7180'));
    /* leyenda y niveles a la derecha */
    const lx=M+328;let ly=cy+R+10;
    doc.poly([[lx,ly+3],[lx+22,ly+3]],{stroke:'#0f7a82',lw:2.2,close:false});doc.text(lx+28,ly,'Resultado del diagnóstico',8.5,false);ly-=14;
    doc.poly([[lx,ly+3],[lx+22,ly+3]],{stroke:'#c97d0e',lw:1.6,dash:'4 3',close:false});doc.text(lx+28,ly,'Tu autopercepción',8.5,false);ly-=24;
    r.forEach((v,k)=>{const l=LV(v);doc.text(lx,ly,AE[k].ae+' · '+SH[k],9.5,true);ly-=13;
      doc.text(lx,ly,'Resultado '+v+' %  ·  Autopercepción '+p[k]+' %',8.5,false,'#28404e');ly-=12;
      doc.text(lx,ly,'Nivel: '+l[0],8.5,true,l[1]==='good'?'#1d7a46':l[1]==='warn'?'#9a5e04':'#b3263e');ly-=20});
    doc.y=cy-R-58;
    doc.text(M,doc.y,'Nivel por aprendizaje esperado',13,true,'#123b4a');doc.gap(6);
    r.forEach((v,k)=>{const l=LV(v);doc.para(AE[k].ae+' · '+AE[k].mod+' · '+l[0]+' ('+v+' %)',10,true);doc.para(AE[k].txt,8.8,false,'#5f7180');
      doc.para(LVTXT[l[0]]+' '+gapTxt(v,p[k]),9.3);doc.gap(6)});
    doc.gap(10);doc.need(120);doc.text(M,doc.y,'Mapa por aprendizaje esperado y lección',13,true,'#123b4a');doc.gap(10);
    const cell=(i)=>{const q=P[i];return (okQ(st,i)?'Correcta':'Por reforzar')};
    const idx=k=>P.map((q,i)=>i).filter(i=>P[i].ae===k);
    doc.table([{t:'AE',w:52},{t:'x.1',w:89},{t:'x.2',w:89},{t:'x.3',w:89},{t:'x.4',w:89},{t:'Integración',w:91}],
      [0,1,2,3].map(k=>[AE[k].ae].concat(idx(k).map(cell))),{color:(ri,ci)=>ci===0?null:(okQ(st,idx(ri)[ci-1])?'#1d7a46':'#b3263e')});
    doc.gap(18);doc.need(60);doc.text(M,doc.y,'Tu ruta sugerida',13,true,'#123b4a');doc.gap(4);
    if(rt.length){doc.para('Pon especial atención a:',9.5);rt.forEach((x,i)=>doc.para((i+1)+'. '+x,9.5,false,'#172431',M+10,W-2*M-10))}
    else doc.para('Respondiste todas las situaciones correctamente. Recorre el curso completo para profundizar y aplicar cada criterio en tu trabajo.',9.5);
    doc.gap(18);doc.need(60);doc.text(M,doc.y,'Autoevaluación',13,true,'#123b4a');doc.gap(8);
    doc.table([{t:'AE',w:52},{t:'Afirmación',w:330},{t:'Tu nivel',w:117}],D.AUTO.map((t,k)=>[AE[k].ae,t,st.auto[k]>=0?D.NIV[st.auto[k]]:'—']));
    doc.gap(18);doc.need(60);doc.text(M,doc.y,'Detalle de tus respuestas',13,true,'#123b4a');doc.gap(4);
    P.forEach((q,i)=>{const a=st.a[i],ok=okQ(st,i);doc.need(70);doc.gap(6);
      doc.para(q.id+' · '+AE[q.ae].ae+' · '+q.tema+' · '+(ok?'Correcta':'Por reforzar'),9.5,true,ok?'#1d7a46':'#b3263e');
      doc.para(q.q,9,false,'#172431');
      doc.para('Tu respuesta: '+(a>=0?L4[a]+') '+q.o[a]:'—'),8.8,true,'#28404e',M+10,W-2*M-10);
      if(a>=0)doc.para(q.f[a],8.6,false,'#5f7180',M+10,W-2*M-10);
      if(!ok){doc.para('Mejor respuesta: '+L4[q.c]+') '+q.o[q.c],8.8,true,'#28404e',M+10,W-2*M-10);doc.para(q.f[q.c],8.6,false,'#5f7180',M+10,W-2*M-10)}});
    doc.gap(14);doc.para('Diagnóstico con caso simulado y datos ficticios. Documento generado automáticamente al finalizar la evaluación diagnóstica.',8,false,'#5f7180')});
  const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Mapa_de_competencias_'+((fullName(st)||'participante').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'')||'participante')+'.pdf';
  document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},4000);window.__lastPdf=bytes}

/* ---------- Integración con el motor ---------- */
Object.assign(window.LESSON,{
  pass:0,
  score(){return S&&S.first.dg&&S.first.dg.fin?glob(ST()):0},
  report,
  init(a){api=a;S=a.S;startInit();
    const show=()=>{const st=ST();$('#dgFirst').value=st.fn;$('#dgLast').value=st.ln;const n=st.a.findIndex(x=>x<0);qi=n<0?0:n;autoRender();qRender()};
    show();setTimeout(show,0)}
});
})();

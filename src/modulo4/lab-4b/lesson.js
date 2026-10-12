/* Laboratorio 4B · Simulador de flujo: asignar actores a cada etapa y simular cinco incidentes */
(function(){
const ACT={ia:'IA (asiste)',sis:'Sistema (calcula)',per:'Persona (decide)'};
/* etapa, descripción, actores aceptados como correctos, horas por actor */
const ST=[
 {t:'Recepción de novedades',d:'64 novedades llegan por formulario',ok:['ia'],h:{ia:3,sis:3,per:10}},
 {t:'Validación de novedades dudosas',d:'Aclarar lo ambiguo con las jefaturas',ok:['per'],h:{ia:1,sis:1,per:2}},
 {t:'Cálculo de liquidaciones',d:'422 liquidaciones con parámetros vigentes',ok:['sis'],h:{ia:1,sis:1,per:30}},
 {t:'Controles automáticos',d:'Cuadraturas y alertas contra el mes anterior',ok:['ia','sis'],h:{ia:1,sis:1,per:8}},
 {t:'Revisión de alertas',d:'Corregir, investigar o descartar',ok:['per'],h:{ia:1,sis:1,per:3}},
 {t:'Aprobación y pago',d:'Cuatro ojos antes de enviar al banco',ok:['per'],h:{ia:0,sis:0,per:1}}];
const LIM=20;
/* incidentes: función que dice si se controla y textos */
const INC=[
 {t:'Novedad ambigua: “pagar lo de siempre a EMP-144”',ok:a=>a[1]==='per',
  y:'Camila la aclaró con la jefatura: era un bono de turno de $45.000, aprobado por correo.',n:'Nadie la aclaró: se pagó un monto supuesto que la jefatura no había aprobado.'},
 {t:'Cálculo con un parámetro mal interpretado',ok:a=>a[2]==='sis',
  y:'El sistema calculó con los parámetros vigentes del período: no hubo error de cálculo.',n:a=>a[2]==='ia'?'La IA calculó algunas cotizaciones con una tasa equivocada y nadie lo notó hasta el reclamo.':'Calcular 422 liquidaciones a mano generó errores de digitación y consumió el tiempo del cierre.'},
 {t:'Registro duplicado de EMP-317',ok:a=>a[3]!=='per'&&a[4]==='per',
  y:'El control automático lo señaló y Camila lo corrigió en el sistema antes de aprobar.',n:a=>a[3]==='per'?'La revisión manual de controles pasó por alto el duplicado entre 422 registros.':'El control lo señaló, pero nadie revisó la alerta: se pagó dos veces.'},
 {t:'Bono cargado sin aprobación de la jefatura',ok:a=>a[5]==='per',
  y:'Rodrigo lo detectó al aprobar con el resumen de cambios: se retiró antes del pago.',n:'Sin aprobación de una persona, el bono se pagó sin respaldo.'},
 {t:'Plazo del cierre: el equipo dispone de 20 horas',ok:(a,h)=>h<=LIM,
  y:h=>`El flujo usa ${h} horas: el cierre se completa a tiempo.`,n:h=>`El flujo necesita ${h} horas y el equipo dispone de ${LIM}: el cierre se atrasa.`}];
let S=null,api=null,runs=0,bestA=0,bestI=0;
const sel=()=>[...document.querySelectorAll('#simRoot .fl select')].map(s=>s.value);
function paintRows(){document.querySelectorAll('#simRoot .fl-row').forEach((r,i)=>{const v=r.querySelector('select').value;r.classList.remove('ia','sis','per');if(v)r.classList.add(v)})}
function run(){const a=sel(),out=document.getElementById('simOut');
  if(a.some(x=>!x)){out.innerHTML='<div class="alert-row">Asigna un actor a las seis etapas antes de simular.</div>';return}
  runs++;document.getElementById('simInfo').textContent='Simulaciones: '+runs;
  const h=a.reduce((s,x,i)=>s+ST[i].h[x],0);
  const res=INC.map(c=>c.ok(a,h));const nI=res.filter(Boolean).length;const nA=a.filter((x,i)=>ST[i].ok.includes(x)).length;
  if(!('sim1' in S.first))S.first.sim1=nI===5;
  bestA=Math.max(bestA,nA,S.first.l4b_a||0);bestI=Math.max(bestI,nI,S.first.l4b_i||0);S.first.l4b_a=bestA;S.first.l4b_i=bestI;
  const pay=res.slice(0,4).filter(x=>!x).length;
  const txt=(v,arg)=>typeof v==='function'?v(arg):v;
  out.innerHTML=`<div class="sim-kpi"><div><b style="color:${nI===5?'var(--good)':'var(--bad)'}">${nI} / 5</b><small>Incidentes controlados</small></div><div><b style="color:${pay?'var(--bad)':'var(--good)'}">${pay}</b><small>Errores que llegaron al pago</small></div><div><b style="color:${h<=LIM?'var(--good)':'var(--bad)'}">${h} h</b><small>Horas del equipo (máximo ${LIM})</small></div></div>
   <div class="inc">${INC.map((c,i)=>`<div class="${res[i]?'ok':'no'}"><b>${res[i]?'✓':'✕'} ${c.t}</b><br/>${res[i]?txt(c.y,h):txt(c.n,i===4?h:a)}</div>`).join('')}</div>
   ${nI===5?'<div class="ok-row" style="margin-top:10px">✓ ¡Flujo robusto! Ningún incidente llegó al pago y el cierre se completa a tiempo. La IA asiste, el sistema calcula y las personas deciden en los puntos de control.</div>':'<p class="hint" style="margin-top:10px">Ajusta las etapas marcadas en rojo y vuelve a simular.</p>'}`;
  if(nI===5)api.done('sim')}
Object.assign(window.LESSON,{
  score(){const v=['v1','v2'].filter(k=>S.first[k]===true).length;const a=Math.max(bestA,S.first.l4b_a||0),i=Math.max(bestI,S.first.l4b_i||0);return Math.round(a/6*40+i/5*40+v/2*20)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);$('#labPct').textContent=sc+'%';$('#labDet').textContent=`${Math.max(bestA,S.first.l4b_a||0)}/6 · ${Math.max(bestI,S.first.l4b_i||0)}/5`;
    $('#labState').textContent=sc>=70?'Aprobado':'Pendiente';$('#labState').style.color=sc>=70?'var(--good)':'var(--bad)'},
  init(a){api=a;S=a.S;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    const fl=document.querySelector('#simRoot .fl');
    fl.innerHTML=ST.map((s,i)=>`<div class="fl-row"><span class="n">${i+1}</span><div><b>${s.t}</b><small>${s.d}</small></div><select aria-label="Actor de la etapa ${s.t}"><option value="">¿Quién lo hace?</option>${Object.entries(ACT).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>`).join('');
    fl.querySelectorAll('select').forEach(s=>s.addEventListener('change',paintRows));
    document.getElementById('simRun').addEventListener('click',run)}
});
})();

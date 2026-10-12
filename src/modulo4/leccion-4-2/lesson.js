/* Lección 4.2 · Configurador de asistente: las respuestas simuladas dependen de la configuración elegida */
(function(){
const LAB={rol:'Rol',fuente:'Fuentes',datos:'Datos personales',lim:'Límites y derivación',tono:'Estilo'};
const TXT={
 rol:{a:'experto legal que responde cualquier duda laboral',b:'asistente de Compensaciones de AndesCorp que explica conceptos de la liquidación',c:'asistente general'},
 fuente:{a:'internet y tu propio conocimiento',b:'solo la guía de liquidación y las políticas internas aprobadas adjuntas'},
 datos:{a:'puedes pedir RUT y sueldo para revisar casos',b:'no pides ni recibes datos personales; los casos individuales van al canal formal'},
 lim:{a:'respondes siempre con seguridad',b:'si algo no está en las fuentes o es un tema legal, lo dices y derivas a Compensaciones'},
 tono:{a:'técnico y extenso, con citas de artículos',b:'claro, breve y amable, con un ejemplo cuando ayuda'}};
/* Cada consulta depende de dos partes de la configuración; si alguna falla, se muestra la respuesta defectuosa de esa parte */
const T=[
 {q:'¿Por qué mi gratificación aparece con un tope?',need:['fuente','tono'],
  ok:'La gratificación tiene un tope anual definido por ley; la guía de liquidación de AndesCorp lo explica en la sección 4. <b>Ejemplo:</b> si el 25 % de tus remuneraciones del año supera ese tope, se paga el tope. Si tienes dudas sobre tu caso, escribe a Compensaciones por el canal formal.',
  bad:{fuente:['Según información de internet, la gratificación en algunos países equivale a un sueldo completo en diciembre…','Usó información genérica de internet, que puede ser de otro país o estar desactualizada. Limítalo a las fuentes aprobadas.'],
       tono:['Conforme a lo dispuesto en los artículos 46 a 52 del Código del Trabajo y la jurisprudencia administrativa vigente, el beneficio de gratificación legal se encuentra sujeto a…','La respuesta es técnica y larga: la persona no entiende su liquidación. Elige un estilo claro y breve.']}},
 {q:'Mi RUT es 12.345.678-9. ¿Me pagaron bien las horas extra?',need:['datos','rol'],
  ok:'No puedo revisar casos individuales ni recibir datos personales por este medio. Te sugiero <b>no compartir tu RUT aquí</b> y escribir a Compensaciones por el canal formal, donde revisarán tu liquidación. Si quieres, te explico cómo se calculan en general las horas extra.',
  bad:{datos:['Gracias. Para revisar tu caso, envíame también tu sueldo base y tu liquidación de octubre…','Pidió más datos personales en un chat que no está autorizado para tratarlos. Configura que no reciba datos personales.'],
       rol:['Claro, revisemos: con un sueldo típico, tus horas extra deberían ser unos $60.000…','Sin un rol definido, intentó resolver un caso individual inventando cifras. Define que explica conceptos, no casos.']}},
 {q:'¿Me pueden despedir si estoy con licencia médica?',need:['lim','rol'],
  ok:'Es una consulta legal que no puedo responder. Para tu situación, contacta a Personas o a Compensaciones por el canal formal; también puedes consultar en la Dirección del Trabajo.',
  bad:{lim:['No, nunca pueden despedirte si estás con licencia, en ningún caso.','Respondió con total seguridad un tema legal con matices. Configura que derive los temas legales.'],
       rol:['Como experto legal, te confirmo que el despido sería nulo y puedes demandar…','El rol de “experto legal” lo llevó a dar asesoría que no le corresponde. Define el rol de Compensaciones.']}},
 {q:'¿Cuándo se paga el bono de Fiestas Patrias este año?',need:['lim','fuente'],
  ok:'Esa información no está en la guía ni en las políticas que tengo disponibles. Te sugiero confirmarla con Compensaciones, que publica el calendario de pagos cada año.',
  bad:{lim:['El bono de Fiestas Patrias se paga el 15 de septiembre junto con un monto de $80.000.','Inventó una fecha y un monto que no están en las fuentes. Configura que diga cuando no sabe y derive.'],
       fuente:['Según varias empresas en internet, se suele pagar a mediados de septiembre…','Respondió con prácticas de otras empresas. Para AndesCorp vale solo lo que dicen sus políticas.']}}];
let S=null,api=null,cur=null;const passed=new Set();
const val=()=>{const o={};document.querySelectorAll('#cfgRoot select').forEach(s=>o[s.dataset.k]=s.value);return o};
function prompt(){const v=val(),el=document.getElementById('sysPrompt');
  const part=(k,pre)=>v[k]?`${pre} <b>${TXT[k][v[k]]}</b>.`:`${pre} <i>(sin definir)</i>.`;
  el.innerHTML='<b>Instrucciones del asistente:</b> '+part('rol','Eres')+' '+part('fuente','Usas')+' '+part('datos','Sobre datos personales:')+' '+part('lim','Cuando no sabes:')+' '+part('tono','Estilo:')}
function good(v,k){return k==='rol'?v.rol==='b':v[k]==='b'}
function renderTests(){document.getElementById('tests').innerHTML=T.map((t,i)=>`<button class="tbtn ${passed.has(i)?'ok':''} ${cur===i?'cur':''}" type="button" data-i="${i}"><span class="st">${passed.has(i)?'✓':i+1}</span><span>${t.q}</span></button>`).join('');
  document.querySelectorAll('#tests .tbtn').forEach(b=>b.addEventListener('click',()=>run(+b.dataset.i)));
  document.getElementById('tTick').textContent=passed.size+' / 4'}
function run(i){const v=val(),t=T[i];cur=i;const chat=document.getElementById('tChat');
  const missing=Object.keys(LAB).filter(k=>!v[k]);
  if(missing.length){chat.innerHTML=`<div class="ahead"><span class="dot">✦</span> Asistente de Compensaciones · prueba</div><div class="alert-row">Completa primero la configuración: falta ${missing.map(k=>LAB[k]).join(', ')}.</div>`;renderTests();return}
  const fail=t.need.find(k=>!good(v,k));
  if(!('asis'+i in S.first))S.first['asis'+i]=!fail;
  if(fail)passed.delete(i);else passed.add(i);
  const r=fail?t.bad[fail][0]:t.ok;
  chat.innerHTML=`<div class="ahead"><span class="dot">✦</span> Asistente de Compensaciones · prueba</div><div class="u">${t.q}</div><div class="a">${r}</div>`+
    (fail?`<div class="tverdict no">✕ Respuesta defectuosa · ${LAB[fail]}: ${t.bad[fail][1]}</div>`:`<div class="tverdict ok">✓ Respuesta adecuada: usa las fuentes, protege los datos y deriva cuando corresponde.</div>`);
  renderTests();
  if(passed.size===4){chat.insertAdjacentHTML('beforeend','<div class="ok-row" style="margin-top:8px">✓ El asistente pasó las cuatro pruebas. Esta configuración es la base de un asistente confiable.</div>');api.done('asis')}}
Object.assign(window.LESSON,{init(a){api=a;S=a.S;if(!document.getElementById('cfgRoot'))return;
  document.querySelectorAll('#cfgRoot select').forEach(s=>s.addEventListener('change',()=>{prompt();
    /* un cambio de configuración invalida las pruebas que dependen de esa parte */
    const k=s.dataset.k;T.forEach((t,i)=>{if(t.need.includes(k))passed.delete(i)});renderTests()}));
  prompt();renderTests()}});
})();

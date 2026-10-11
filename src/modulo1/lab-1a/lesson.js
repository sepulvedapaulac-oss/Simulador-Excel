/* Laboratorio 1A · Asistente de IA simulado que evalúa instrucciones (prompts) */
(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const COMP=[
  {k:'Tarea',re:/\b(explica|explicame|explicar|identifica|identificar|detecta|detectar|revisa|revisar|compara|comparar|clasifica|redacta|redactar|escribe|resume|analiza|analizar|calcula|verifica|verificar|senala|indica|lista|encuentra)\b/,tip:'Empieza con un verbo concreto: explica, identifica, redacta…'},
  {k:'Contexto',re:/(actua como|eres un|como asistente|como analista|rol|empresa|chile|chilena|remuneraciones|cierre|periodo|mes de|octubre|septiembre|colaborador|area de|proposito|para que)/,tip:'Indica el rol, el propósito o el periodo (por ejemplo: “Actúa como analista de remuneraciones…”).'},
  {k:'Información',re:/(te entrego|te comparto|adjunto|la tabla|esta tabla|los datos|columnas|columna|la formula|esta formula|ficticio|ficticia|codigo|unidades|horas|valor hora|bono|sueldo base|regla|recibio|informacion)/,tip:'Describe los datos que entregas: columnas, regla o fórmula.'},
  {k:'Restricciones',re:/(no inventes|no invente|no modifiques|no cambies|no corrijas|no calcules|no afirmes|no incluyas|no uses|solo con|solo los datos|unicamente|si falta|si necesitas|preguntame|pregunta|sin suponer|no supongas|indica que falta|marca)/,tip:'Fija límites: que no invente datos, que no modifique valores, que pregunte si falta algo.'},
  {k:'Formato',re:/(tabla|lista|vinetas|pasos|paso a paso|maximo|palabras|parrafo|columnas con|formato|en una frase|breve|tono|resumen de|ejemplo)/,tip:'Define cómo quieres el resultado: tabla, lista, pasos o extensión máxima.'}];
const PRIV=[/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/,/\brut\b/,/cuenta (bancaria|corriente|vista)|n(u|ú)mero de cuenta/,/\b(juan|maria|pedro|ana|jose|camila torres|luis|carolina)\b/];
const RESP=[
  { // explicar fórmula
    low:'Esta fórmula usa la función SI para evaluar una condición y devolver un valor. Las fórmulas de Excel pueden ser complejas; te recomiendo revisar la documentación de Microsoft.',
    mid:'La fórmula revisa si las horas semanales (C2) superan 45 y si la jornada (D2) es “Turno”. Si ambas condiciones se cumplen, calcula las horas sobre 45 por el valor hora con un recargo del 50 %. En otro caso devuelve 0.',
    high:`<b>Paso a paso:</b><br/>1. <b>Y(C2&gt;45; D2="Turno")</b>: exige dos condiciones a la vez: más de 45 horas y jornada “Turno”.<br/>2. Si se cumplen: <b>(C2-45)*E2*1,5</b> = horas sobre 45 × valor hora × 1,5 (recargo del 50 %).<br/>3. Si no: devuelve <b>0</b>.<br/><b>Por qué da cero a veces:</b> si D2 dice “turno” con otra ortografía, tiene espacios extra o la persona tiene otra jornada, la condición falla. <b>Prueba sugerida:</b> C2=50, D2="Turno", E2=5.000 → debe dar 37.500.<br/><i>No calculé montos reales: verifica con tus registros.</i>`},
  { // detectar inconsistencias
    low:'Para revisar bonos te recomiendo verificar que los datos estén completos y que las fórmulas sean correctas. También puedes comparar con meses anteriores.',
    mid:'Revisé la tabla y hay algunas diferencias en los bonos de Planta y Bodega. Te sugiero revisar los registros P-03 y P-05 porque los montos no parecen coincidir.',
    high:`<table class="datatbl"><thead><tr><th>Código</th><th>Esperado</th><th>Pagado</th><th>Diferencia</th><th>Posible causa</th></tr></thead><tbody><tr><td>P-03</td><td>$132.000</td><td>$121.000</td><td>−$11.000</td><td>Unidades mal registradas (¿100 en vez de 110?)</td></tr><tr><td>P-05</td><td>$156.000</td><td>$165.000</td><td>+$9.000 (pagado de más)</td><td>Tarifa distinta o ajuste no documentado</td></tr></tbody></table><small>Los demás registros cumplen la regla. Antes de corregir, confirma las unidades en el registro de producción. No modifiqué valores.</small>`},
  { // consulta AFP
    low:'Los descuentos de AFP dependen de varios factores. Te recomiendo consultar con el área de remuneraciones o revisar tu liquidación.',
    mid:'Hola. El descuento de AFP se calcula sobre tu remuneración imponible. Este mes recibiste horas extra y un bono, por lo que el monto sobre el que se calcula fue mayor y el descuento también.',
    high:`Hola, gracias por escribir. Tu sueldo base no cambió, pero este mes recibiste <b>horas extra y un bono</b>. Ambos forman parte de la <b>remuneración imponible</b>, que es la base sobre la que se calcula el descuento de la AFP. Como esa base fue mayor, el descuento también lo fue, en la misma proporción. Si quieres, podemos revisar juntos tu liquidación. [Verificar: porcentaje de cotización y comisión de la AFP del colaborador.]<br/><small>(Borrador de 85 palabras, tono cercano.)</small>`}];

const best=[0,0,0],bestText=['','',''];let tries=0;
function analyze(text){const n=norm(text);const comps=COMP.map(c=>c.re.test(n));const priv=PRIV.some(r=>r.test(n));
  const words=text.trim().split(/\s+/).filter(Boolean).length;
  let pts=comps.filter(Boolean).length;if(words<8)pts=Math.min(pts,1);if(priv)pts=Math.max(0,pts-2);return {comps,priv,pts,words}}
function mount(root,i,api){
  root.innerHTML=`<label class="field" style="margin-top:12px">Tu instrucción para la IA<textarea class="promptarea" placeholder="Escribe aquí tu instrucción…"></textarea></label>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><button class="small-btn primary send" type="button">Enviar al asistente</button><span class="hint" style="align-self:center">Mejor puntaje: <b class="bestv">—</b></span></div>
    <div class="labout"></div>`;
  const ta=root.querySelector('textarea'),out=root.querySelector('.labout');
  root.querySelector('.send').addEventListener('click',()=>{const text=ta.value.trim();if(!text){out.innerHTML='<div class="alert-row">Escribe una instrucción antes de enviarla.</div>';return}
    tries++;const a=analyze(text);const lvl=a.pts>=4?'high':a.pts>=2?'mid':'low';
    if(a.pts>=best[i]){best[i]=a.pts;bestText[i]=text}
    root.querySelector('.bestv').textContent=`${best[i]} / 5`;
    out.innerHTML=`<div class="aichat" style="margin-top:12px"><div class="ahead"><span class="dot">✦</span> Asistente simulado</div><div class="u">${esc(text)}</div><div class="a">${RESP[i][lvl]}</div></div>
      <div class="out"><strong>Análisis de tu instrucción · ${a.pts} / 5 puntos</strong>
      <div class="comp-chips">${COMP.map((c,k)=>`<span class="${a.comps[k]?'ok':'no'}">${a.comps[k]?'✓':'✕'} ${c.k}</span>`).join('')}</div>
      ${a.priv?'<div class="alert-row">⚠️ <b>Datos personales detectados</b> (RUT, nombre o cuenta). Nunca los incluyas en una instrucción: −2 puntos.</div>':''}
      ${a.words<8?'<div class="alert-row">✎ La instrucción es demasiado breve para dar un resultado útil.</div>':''}
      ${COMP.map((c,k)=>a.comps[k]?'':`<div class="alert-row">✎ <b>${c.k}:</b> ${c.tip}</div>`).join('')}
      ${a.pts>=4&&!a.priv?'<div class="ok-row">✓ Instrucción efectiva: la respuesta es concreta y verificable.</div>':''}
      <p class="hint" style="margin:8px 0 0">Puedes mejorar tu instrucción y volver a enviarla.</p></div>`;
    api.done('d'+i)});
}
Object.assign(window.LESSON,{
  pass:0.7,
  score(){return Math.round(best.reduce((a,b)=>a+b,0)/15*100)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);
    $('#labPct').textContent=sc+'%';$('#labState').textContent=sc>=70?'Aprobado':'Pendiente';$('#labState').style.color=sc>=70?'var(--good)':'var(--bad)';$('#labTries').textContent=tries;
    $('#labDetail').innerHTML=`<div class="checks2">${['Explicar una fórmula','Detectar inconsistencias','Responder una consulta'].map((t,i)=>`<div class="${best[i]>=4?'ok':'no'}">Desafío ${i+1} · ${t}: <b>${best[i]} / 5</b>${best[i]<4?' · puedes mejorarlo':''}</div>`).join('')}</div>`;
    $('#labLib').innerHTML=bestText.map((t,i)=>`<div class="promptbox"><b>Desafío ${i+1}:</b> ${t?esc(t):'(sin instrucción)'}</div>`).join('')},
  init(api){
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    document.querySelectorAll('[data-prompt-lab]').forEach(r=>mount(r,+r.dataset.promptLab,api));
    document.getElementById('copyLib').addEventListener('click',e=>{const txt=bestText.map((t,i)=>`Desafío ${i+1}: ${t}`).join('\n\n');
      (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{e.target.textContent='✓ Copiadas'},()=>{e.target.textContent='Selecciona y copia el texto'})})}
});
})();

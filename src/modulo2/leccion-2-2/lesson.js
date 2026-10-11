/* Ganchos propios de la Lección 2.2: chat IA simulado, probador de fórmulas (hoja.js) y plantilla de instrucción */
(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const F=s=>`<span class="fml">${esc(s)}</span>`;

/* ---------- Chat IA simulado ---------- */
/* Cada pedido: pre = mensajes que aparecen antes de decidir (n = nota de lo que ocurre en la planilla),
   opts = mensajes que Camila puede enviar: u (texto), a (respuesta de la IA), ok, fb (feedback). */
const ROUNDS=[
 {tag:'Pedido 1 · Pedir la fórmula',
  pre:[['n','Camila necesita la fórmula del monto de horas extra para F2, que luego copiará hasta F9.']],
  ask:'¿Qué instrucción le envías a la IA?',
  opts:[
   {u:'Dame una fórmula para calcular las horas extra.',
    a:`Claro, puedes usar: ${F('=B2*C2*1.5')} Multiplica las horas por el valor y por el recargo.`,ok:false,
    fb:'<strong>Sin contexto, la IA adivinó.</strong> Inventó las columnas (B y C) y usó punto decimal, que no corresponde a Excel en español. Tendrías que descubrir tú qué ajustar.'},
   {u:'Uso Excel en español (separador ;). En mi planilla, D2:D9 tiene las horas extra del mes, E2:E9 el valor hora y la celda I2 el recargo (1,5, es decir, 50 %). Necesito una fórmula para F2 que calcule el monto de horas extra y que pueda copiar hasta F9. Explícala en una línea.',
    a:`En F2 escribe: ${F('=D2*E2*I2')} Multiplica las horas extra por el valor hora y por el recargo de la celda I2. Luego cópiala hacia abajo hasta F9.`,ok:true,
    fb:'<strong>Buena instrucción.</strong> Con columnas, regla, celda de destino y versión de Excel, la IA usa tus celdas y tu separador. Aun así, toda fórmula se prueba: mira qué pasa al copiarla.'},
   {u:'Te pego la planilla completa para que entiendas el contexto: [nombres, RUT y sueldos de las 8 personas]…',
    a:'',ok:false,
    fb:'<strong>Datos personales sin ningún beneficio.</strong> Para escribir una fórmula, la IA no necesita saber quiénes son las personas: basta con describir qué hay en cada columna. Usa códigos y describe la estructura.'}]},
 {tag:'Pedido 2 · La fórmula al copiarla',
  pre:[['n','Camila copia la fórmula hasta F9 y prueba un caso conocido: EMP-003 tiene 8 horas extra y valor hora $4.000, así que debería dar $48.000. F2 está bien, pero desde F3 todas las filas muestran $0.']],
  ask:'¿Qué le respondes a la IA?',
  opts:[
   {u:'No funciona, arréglala.',
    a:`Disculpa el error. Prueba con ${F('=D2*E2*1,5*I2')}`,ok:false,
    fb:'<strong>Una queja vaga obliga a la IA a adivinar.</strong> Ahora el recargo se aplicaría dos veces (1,5 × 1,5 = 2,25) y se pagaría de más. Describe qué falló y dónde.'},
   {u:'Al copiar la fórmula hacia abajo, I2 se convierte en I3, I4… y esas celdas están vacías. Fija el recargo con referencia absoluta.',
    a:`Tienes razón. Usa ${F('=D2*E2*$I$2')} Los signos $ mantienen fija la celda I2 al copiar, mientras D2 y E2 siguen cambiando de fila.`,ok:true,
    fb:'<strong>Corrección precisa.</strong> Dijiste qué falló (la referencia se desplaza) y qué necesitas (referencia absoluta con $).'},
   {u:'Gracias, la dejo así: en F2 da el resultado correcto.',
    a:'',ok:false,
    fb:'<strong>Probar solo la primera fila esconde el error.</strong> Siete de las ocho personas quedarían con $0 de horas extra. Después de copiar, revisa también una fila del medio y la última.'}]},
 {tag:'Pedido 3 · Buscar por código',
  pre:[['u','En I5 necesito traer el valor hora del código que escriba en I4, buscándolo en la tabla A2:E9 (el valor hora está en la columna 5).'],
       ['a',`Usa ${F('=BUSCARV(I4;A2:E9;5)')} Busca el código de I4 en la primera columna y devuelve la quinta columna.`],
       ['n','Camila prueba con EMP-099, un código que no existe… y la fórmula igual devuelve un valor hora.']],
  ask:'¿Qué le respondes a la IA?',
  opts:[
   {u:'Perfecto: si devuelve un número, está funcionando.',
    a:'',ok:false,
    fb:'<strong>Un código que no existe debería dar error, no un monto.</strong> Sin coincidencia exacta, BUSCARV devuelve el dato de otra fila: podrías pagar con el valor hora de otra persona sin enterarte.'},
   {u:'Con EMP-099, que no existe, igual devuelve un valor. Necesito coincidencia exacta: agrega FALSO como cuarto argumento y fija el rango con $.',
    a:`Corregida: ${F('=BUSCARV(I4;$A$2:$E$9;5;FALSO)')} Con FALSO, BUSCARV solo acepta el código exacto; si no existe, muestra #N/A para que lo revises. Si prefieres un aviso, envuélvela en SI.ERROR(…;"Código no existe").`,ok:true,
    fb:'<strong>Exacto.</strong> Para buscar códigos, la coincidencia siempre debe ser exacta (FALSO). Y el caso de prueba con un código inexistente fue lo que reveló el problema.'},
   {u:'Ordena tú la tabla por código y vuelve a intentarlo.',
    a:'',ok:false,
    fb:'<strong>Ordenar no basta.</strong> Con la tabla ordenada, un código inexistente seguiría trayendo el valor de la fila anterior. Para códigos, la búsqueda debe ser exacta (FALSO), esté o no ordenada la tabla.'}]},
 {tag:'Pedido 4 · Total por área',
  pre:[['u','Ahora necesito el total de horas extra del área Operaciones. El área está en B2:B9 y las horas en D2:D9.'],
       ['a',`Aquí tienes: ${F('=SUMAR.SI(B2:B9,"Operaciones",D2:D9)')}`],
       ['n','Al pegarla, Excel muestra un mensaje de error en la fórmula y no la acepta.']],
  ask:'¿Qué le respondes a la IA?',
  opts:[
   {u:'Cambia las comillas dobles por apóstrofes.',
    a:'',ok:false,
    fb:'<strong>Las comillas están bien.</strong> El texto de un criterio va entre comillas dobles. El problema está en el separador entre argumentos.'},
   {u:'Mi Excel está en español y usa punto y coma (;) para separar argumentos. Corrígela.',
    a:`Corregida: ${F('=SUMAR.SI(B2:B9;"Operaciones";D2:D9)')} En Excel con configuración en español, la coma es el separador decimal, por eso los argumentos se separan con punto y coma.`,ok:true,
    fb:'<strong>Correcto.</strong> La coma como separador es uno de los errores más frecuentes, porque muchos ejemplos están escritos para Excel en inglés. Indícalo desde la primera instrucción.'},
   {u:'Mejor dame otra función que no tenga errores.',
    a:'',ok:false,
    fb:'<strong>La función es la adecuada.</strong> Cambiarla no resuelve el separador y te aleja de una solución simple. Corrige el detalle concreto.'}]},
 {tag:'Pedido 5 · Contar casos',
  pre:[['u','Por último, ¿cuántas personas tienen más de 10 horas extra? Las horas están en D2:D9.'],
       ['a',`Puedes usar ${F('=COUNTIF(D2:D9;">10")')}`],
       ['n','La celda muestra #¿NOMBRE?']],
  ask:'¿Qué le respondes a la IA?',
  opts:[
   {u:'Agrega más paréntesis a la fórmula.',
    a:'',ok:false,
    fb:'<strong>Los paréntesis están completos.</strong> #¿NOMBRE? indica que Excel no reconoce el nombre de la función.'},
   {u:'Mi Excel está en español: escribe la función con su nombre en español.',
    a:`Disculpa: ${F('=CONTAR.SI(D2:D9;">10")')} COUNTIF es el nombre en inglés; en Excel en español la función se llama CONTAR.SI.`,ok:true,
    fb:'<strong>Correcto.</strong> #¿NOMBRE? suele aparecer cuando la función está en otro idioma o mal escrita. Si indicas la versión de Excel desde el inicio, la IA responde directo en español.'},
   {u:'Debe ser un problema de mi computador; reinstalo Excel.',
    a:'',ok:false,
    fb:'<strong>No es un problema del equipo.</strong> La función está escrita en inglés (COUNTIF) y tu Excel está en español. Pide la versión en español: CONTAR.SI.'}]}
];

function chatInit(api){
  const root=document.getElementById('chat22');if(!root)return;
  const log=document.getElementById('chatLog'),askEl=document.getElementById('chatAsk'),fb=document.getElementById('chatFb');
  const tick=root.querySelector('.tick'),task=root.querySelector('.task');
  let ri=0,solved=0;
  const add=(who,html)=>{const d=document.createElement('div');d.className=who;d.innerHTML=html;log.appendChild(d);return d};
  function render(){
    if(ri>=ROUNDS.length){askEl.innerHTML='';fb.innerHTML=`<div class="feedback good"><strong>Conversación completa.</strong> <span class="fb-body">Viste los cuatro errores típicos de la IA con fórmulas: referencia sin <b>$</b>, BUSCARV sin <b>FALSO</b>, <b>coma</b> en vez de punto y coma y función en <b>inglés</b>. En el probador los corregirás y comprobarás con casos conocidos.</span></div>`;return}
    const r=ROUNDS[ri];
    r.pre.forEach(([w,h])=>add(w,w==='u'?esc(h):h));
    askEl.innerHTML=`<span class="round-tag">${r.tag}</span><p class="ask">${r.ask}</p><div class="options">${r.opts.map((o,i)=>`<button class="opt" type="button" data-i="${i}"><span class="letter">${'ABC'[i]}</span><span>${esc(o.u)}</span></button>`).join('')}</div>`;
    fb.innerHTML='';
    askEl.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>pick(+b.dataset.i)));
  }
  function pick(i){
    const r=ROUNDS[ri],o=r.opts[i],key='chat'+ri;
    if(!(key in api.S.first))api.S.first[key]=o.ok;
    const btns=[...askEl.querySelectorAll('.opt')];
    btns.forEach((x,k)=>{x.disabled=true;x.classList.toggle('dim',k!==i)});btns[i].classList.remove('dim');btns[i].classList.add(o.ok?'good':'bad');
    const tmp=[add('u',esc(o.u))];if(o.a)tmp.push(add('a',o.a));
    if(o.ok){
      solved++;tick.textContent=`${solved} / ${ROUNDS.length}`;
      fb.innerHTML=`<div class="feedback good">${o.fb}<div style="margin-top:10px"><button class="small-btn primary" type="button" id="chatNext">${ri<ROUNDS.length-1?'Siguiente pedido →':'Terminar la conversación'}</button></div></div>`;
      document.getElementById('chatNext').addEventListener('click',()=>{ri++;render();if(ri>=ROUNDS.length){task.classList.add('ok');api.done('chat')}const last=log.lastElementChild;last&&last.scrollIntoView({behavior:'smooth',block:'nearest'})});
    }else{
      fb.innerHTML=`<div class="feedback bad">${o.fb}<div style="margin-top:10px"><button class="small-btn retry" type="button">Elegir otro mensaje</button></div></div>`;
      fb.querySelector('.retry').addEventListener('click',()=>{tmp.forEach(n=>n.remove());fb.innerHTML='';btns.forEach(x=>{x.disabled=false;x.classList.remove('good','bad','dim')});btns[0].focus()});
    }
    fb.firstElementChild.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  render();
}

/* ---------- Probador de fórmulas ---------- */
const ROWS=[ // código, área, sueldo base, horas extra, valor hora (ficticios; tabla no ordenada por código)
 ['EMP-004','Bodega',620000,12,3444],['EMP-001','Ventas',850000,6,4722],['EMP-007','Planta',700000,14,3889],['EMP-002','Operaciones',680000,10,3778],
 ['EMP-006','Finanzas',1100000,0,6111],['EMP-003','Operaciones',720000,8,4000],['EMP-008','Planta',650000,16,3611],['EMP-005','Operaciones',760000,4,4222]];
const PROP=[['F2','=D2*E2*I2'],['I5','=BUSCARV(I4;A2:E9;5)'],['I7','=SUMAR.SI(B2:B9,"Operaciones",D2:D9)'],['I8','=COUNTIF(D2:D9;">10")']];
const money=n=>'$'+Math.round(n).toLocaleString('es-CL');
let hoja=null;
function buildHoja(){
  const data={},locked=[];const L=(k,v)=>{if(v!==undefined)data[k]=String(v);locked.push(k)};
  ['Código','Área','Sueldo base','Horas extra','Valor hora','Monto HE'].forEach((h,i)=>L('ABCDEF'[i]+'1',h));
  ROWS.forEach((r,i)=>r.forEach((v,c)=>L('ABCDE'[c]+(i+2),v)));
  L('A10','TOTAL');L('D10','=SUMA(D2:D9)');L('F10','=SUMA(F2:F9)');['B10','C10','E10'].forEach(k=>L(k));
  L('H1','Parámetros y controles');L('I1','Valor');
  L('H2','Recargo HE (50 %)');L('I2','1,5');
  L('H4','Código a buscar');data.I4='EMP-007';
  L('H5','Valor hora del código');
  L('H7','Horas extra Operaciones');L('H8','Personas con más de 10 h');
  const free=new Set(['F2','F3','F4','F5','F6','F7','F8','F9','I4','I5','I7','I8']);
  for(let c=0;c<9;c++)for(let r=1;r<=10;r++){const k=String.fromCharCode(65+c)+r;if(!free.has(k)&&!locked.includes(k))locked.push(k)}
  hoja=Hoja(document.getElementById('hoja22'),{cols:9,rows:10,data,locked,start:'F2'});
  ['A1','B1','C1','D1','E1','F1','H1','I1'].forEach(k=>hoja.cells[k].classList.add('hdr'));
  ['A10','D10','F10'].forEach(k=>hoja.cells[k].style.fontWeight='900');
}
/* Cada prueba devuelve {ok, cases:[[ok,texto]], tip} */
function tests(){
  const v=k=>hoja.value(k),f=k=>hoja.get(k),out=[];
  // 1 · Monto HE
  {const cases=[];let all=true,empty=0,fx=true;
    for(let r=2;r<=9;r++){const exp=hoja.value('D'+r)*hoja.value('E'+r)*1.5,got=v('F'+r);const good=typeof got==='number'&&Math.abs(got-exp)<0.01;if(!good)all=false;if(f('F'+r)==='')empty++;else if(!f('F'+r).startsWith('='))fx=false}
    const g3=v('F7'),g6=v('F6'),g9=v('F9');
    cases.push([typeof g3==='number'&&Math.abs(g3-48000)<0.01,`EMP-003 (fila 7): esperado $48.000 · obtenido ${hoja.display('F7')||'(vacío)'}`]);
    cases.push([g6===0&&f('F6')!=='',`EMP-006 con 0 horas (fila 6): esperado $0 · obtenido ${f('F6')===''?'(vacío)':hoja.display('F6')}`]);
    cases.push([typeof g9==='number'&&Math.abs(g9-25332)<0.01,`Última fila, EMP-005: esperado $25.332 · obtenido ${hoja.display('F9')||'(vacío)'}`]);
    let tip='';const src=f('F2');
    if(!src)tip='Pega la propuesta en F2 y prueba.';
    else if(empty)tip='Rellena F2 hacia abajo para copiar la fórmula hasta F9: el error típico aparece al copiar.';
    else if(!fx)tip='Usa fórmulas, no valores escritos a mano: así el monto se actualiza si cambian las horas.';
    else if(/\bI3\b|\bI4\b|\bI9\b/i.test(f('F3')+f('F4')+f('F9')))tip='Al copiar, I2 se desplazó a I3, I4… Fija el recargo con $I$2 en F2 y vuelve a rellenar hacia abajo.';
    else if(!all)tip='Revisa la regla: monto = horas extra × valor hora × 1,5.';
    out.push({ok:all&&fx&&!empty,cases,tip})}
  // 2 · Búsqueda: se prueban tres códigos conocidos en I4 y se restaura el valor del aprendiz
  {const cases=[],orig=f('I4'),src=f('I5');let all=true;
    [['EMP-007',3889],['EMP-003',4000],['EMP-099',null]].forEach(([code,exp])=>{hoja.raw.I4=code;const got=v('I5');
      const good=exp===null?(typeof got==='string'&&got!==''):(typeof got==='number'&&got===exp);if(!good)all=false;
      const shown=typeof got==='number'?money(got):(got===''?'(vacío)':got);
      cases.push([good,exp===null?`${code} (no existe): esperado un error o aviso · obtenido ${shown}`:`${code}: esperado ${money(exp)} · obtenido ${shown}`])});
    hoja.raw.I4=orig;hoja.paint();
    let tip='';if(!src)tip='Pega la propuesta en I5 y prueba.';
    else if(!src.startsWith('='))tip='Escribe una fórmula de búsqueda, no el valor.';
    else if(!all&&/BUSCARV/i.test(src)&&!/;\s*(FALSO|0)\s*\)/i.test(src))tip='Sin coincidencia exacta, BUSCARV trae el valor de otra fila. Agrega FALSO como cuarto argumento.';
    else if(!all)tip='Si el código no existe, la fórmula debe mostrar #N/A o un aviso de texto, nunca un monto ni un 0.';
    out.push({ok:all&&src.startsWith('='),cases,tip})}
  // 3 · SUMAR.SI
  {const src=f('I7'),got=v('I7');const good=got===22&&/SUMAR\.SI/i.test(src);
    const cases=[[good,`Operaciones (EMP-002, EMP-003, EMP-005): 10 + 8 + 4 = 22 h · obtenido ${src?hoja.display('I7'):'(vacío)'}`]];
    let tip='';if(!src)tip='Pega la propuesta en I7 y prueba.';else if(src.includes(','))tip='Excel en español separa los argumentos con punto y coma (;). Reemplaza las comas.';
    else if(!/SUMAR\.SI/i.test(src))tip='Usa SUMAR.SI (o SUMAR.SI.CONJUNTO) para que el total se actualice solo.';else if(!good)tip='Revisa los rangos: el criterio va sobre B2:B9 y la suma sobre D2:D9.';
    out.push({ok:good,cases,tip})}
  // 4 · CONTAR.SI
  {const src=f('I8'),got=v('I8');const good=got===3&&/CONTAR\.SI/i.test(src);
    const cases=[[good,`Más de 10 h: EMP-004 (12), EMP-007 (14) y EMP-008 (16) = 3 personas · obtenido ${src?hoja.display('I8'):'(vacío)'}`]];
    let tip='';if(!src)tip='Pega la propuesta en I8 y prueba.';else if(/COUNTIF/i.test(src))tip='#¿NOMBRE?: la función está en inglés. En Excel en español se llama CONTAR.SI.';
    else if(!/CONTAR\.SI/i.test(src))tip='Usa CONTAR.SI con el criterio ">10".';else if(!good)tip='Revisa el criterio: “más de 10” es ">10" (10 no se cuenta).';
    out.push({ok:good,cases,tip})}
  return out}

function probadorInit(api){
  if(!document.getElementById('hoja22')||typeof Hoja!=='function')return;
  buildHoja();
  const cards=[...document.querySelectorAll('#tests22 .tcard')];
  cards.forEach((c,i)=>{c.querySelector('.paste').addEventListener('click',()=>{const [k,fm]=PROP[i];hoja.set(k,fm);hoja.select(k);
      c.querySelector('.cases').innerHTML=`<div>Pegada en ${k}: resultado ${esc(hoja.display(k)||'(vacío)')}. Corrígela en la barra fx y luego prueba.</div>`;
      document.getElementById('hoja22').scrollIntoView({behavior:'smooth',block:'nearest'})})});
  cards[0].querySelector('.fill').addEventListener('click',()=>{if(!hoja.get('F2')){cards[0].querySelector('.cases').innerHTML='<div class="no">Primero escribe o pega una fórmula en F2.</div>';return}
    hoja.fillDown('F2',9);hoja.select('F9');cards[0].querySelector('.cases').innerHTML=`<div>Fórmula copiada hasta F9. F3 muestra ${esc(hoja.display('F3'))}. Presiona “Probar con casos conocidos”.</div>`});
  document.getElementById('testBtn').addEventListener('click',()=>{
    const res=tests();let n=0;
    res.forEach((r,i)=>{const c=cards[i];if(r.ok)n++;c.classList.toggle('ok',r.ok);c.classList.toggle('no',!r.ok);c.querySelector('.st').textContent=r.ok?'✓ Prueba superada':'✕ No pasa la prueba';
      c.querySelector('.cases').innerHTML=r.cases.map(([ok,t])=>`<div class="${ok?'ok':'no'}">${ok?'✓':'✕'} ${esc(t)}</div>`).join('')+(r.ok||!r.tip?'':`<div>💡 ${esc(r.tip)}</div>`)});
    for(let r=2;r<=9;r++){const exp=hoja.value('D'+r)*hoja.value('E'+r)*1.5,got=hoja.value('F'+r),good=typeof got==='number'&&Math.abs(got-exp)<0.01;hoja.cells['F'+r].classList.toggle('ok',good);hoja.cells['F'+r].classList.toggle('bad',!good&&hoja.get('F'+r)!=='')}
    [['I5',res[1].ok],['I7',res[2].ok],['I8',res[3].ok]].forEach(([k,ok])=>{hoja.cells[k].classList.toggle('ok',ok);hoja.cells[k].classList.toggle('bad',!ok&&hoja.get(k)!=='')});
    document.getElementById('testOut').innerHTML=n===4?`<div class="feedback good"><strong>¡Las cuatro fórmulas pasan las pruebas!</strong> <span class="fb-body">Total de control: ${esc(hoja.display('F10'))} en montos de horas extra. Corregiste los cuatro errores típicos ($, FALSO, ; y nombre en español) y lo comprobaste con casos de resultado conocido, incluidos un caso con 0 horas y un código inexistente.</span></div>`
      :`<div class="feedback bad"><strong>${n} de 4 fórmulas pasan las pruebas.</strong> <span class="fb-body">Revisa las tarjetas marcadas con ✕: cada una indica qué caso falló y una pista para corregirla.</span></div>`;
    if(n===4){api.S.first.probador=api.S.first.probador??true;api.done('probador')}else if(!('probador' in api.S.first))api.S.first.probador=false;
    document.getElementById('tests22').scrollIntoView({behavior:'smooth',block:'nearest'})});
}

/* ---------- Plantilla de instrucción + checklist de prueba ---------- */
const CHECK=['Pega la fórmula en una sola fila y revisa que use tus columnas, nombres en español y punto y coma.',
 'Compárala con un caso cuyo resultado conoces (cálculo manual).',
 'Prueba casos borde: 0 horas, una celda vacía y un código que no existe.',
 'Cópiala hacia abajo y revisa la primera fila, una del medio y la última (referencias con $).',
 'Cuadra un total de control (SUMA) con el sistema o con el mes anterior.',
 'Documenta la fórmula, la instrucción que usaste y los casos probados.'];

Object.assign(window.LESSON,{
  builderRender:{
    plantilla(vals,cfg){
      const [tarea,cols,regla,ver,ret,casos]=vals;
      const parts=[];
      if(ver.i===0)parts.push('Uso Excel en español (funciones en español y punto y coma como separador).');
      else if(ver.i===1)parts.push('Uso Excel en inglés (separador coma).');
      if(cols)parts.push(`En mi planilla: ${cols}.`);
      parts.push(`Necesito una fórmula para: ${tarea||'[describe qué debe calcular o controlar]'}.`);
      if(regla)parts.push(`Regla de negocio: ${regla}.`);
      if(ret.i===0)parts.push('Explícame la fórmula paso a paso, indica qué referencias deben ir fijas con $ y sugiere casos de prueba con su resultado esperado. No calcules los montos.');
      else if(ret.i===1)parts.push('Entrégame solo la fórmula.');
      else parts.push('Calcula los resultados.');
      if(casos)parts.push(`La probaré con estos casos: ${casos}.`);
      const txt=parts.join(' ').replace(/\.\./g,'.');
      const alerts=[],oks=[];
      if(ver.i===2)alerts.push('Indica la <b>versión de Excel</b>: sin ella, la IA suele responder con funciones en inglés y comas como separador.');
      else if(ver.i===1)alerts.push('Si tu Excel está en español, cámbialo: la respuesta vendría con comas y nombres en inglés (por ejemplo, COUNTIF en vez de CONTAR.SI).');
      else oks.push('Versión de Excel indicada: funciones en español y punto y coma.');
      if(!cols)alerts.push('Describe las <b>columnas y celdas</b> (sin datos de personas): si no, la IA inventa referencias.');else oks.push('Columnas y celdas descritas.');
      if(!tarea)alerts.push('Falta la <b>tarea</b>: qué debe calcular o controlar la fórmula.');
      if(!regla)alerts.push('Agrega la <b>regla de negocio</b> (por ejemplo, recargo de 50 % o una tolerancia por redondeo).');else oks.push('Regla de negocio explícita.');
      if(ret.i===2)alerts.push('No le pidas a la IA que <b>calcule</b> los resultados: pide la fórmula y deja que la planilla calcule.');
      else if(ret.i===1)alerts.push('Pide también la <b>explicación</b>: si no entiendes la fórmula, no podrás revisarla ni corregirla.');
      else oks.push('Pides explicación y casos de prueba: podrás revisar la fórmula.');
      if(!casos)alerts.push('Anota al menos un <b>caso de prueba</b> con su resultado esperado antes de pedir la fórmula.');else oks.push('Tienes casos de prueba conocidos.');
      if(/\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b/.test(tarea+cols+regla+casos))alerts.push('Detectamos algo con formato de <b>RUT</b>: elimínalo y usa códigos como EMP-001.');
      const lvl=alerts.length===0?['ok','Instrucción completa']:alerts.length<=2?['mid','Puede mejorar']:['no','Instrucción incompleta'];
      return `<div class="out"><strong>${cfg.title}</strong> <span class="lvl ${lvl[0]}">${lvl[1]}</span>
        <div class="promptbox">${esc(txt)}</div>
        ${alerts.map(a=>`<div class="alert-row">✎ ${a}</div>`).join('')}${oks.map(o=>`<div class="ok-row">✓ ${o}</div>`).join('')}
        <h3 style="margin:14px 0 0">Mi checklist de prueba antes de usar la fórmula</h3>
        <ol class="checklist22">${CHECK.map((c,i)=>`<li><b>${i+1}.</b> ${c}</li>`).join('')}</ol>
        <p class="hint" style="margin:10px 0 0">Puedes cambiar los campos y volver a generar la instrucción.</p>
        <div style="margin-top:10px"><button class="small-btn copy" type="button">Copiar instrucción y checklist</button></div></div>`}
  },
  init(api){chatInit(api);probadorInit(api)}
});
})();

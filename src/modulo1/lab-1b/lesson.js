/* Laboratorio 1B · Tabla segura en el simulador de Excel */
(function(){
const DATA=[
 ['Andrea Muñoz','15.234.567-8','Ventas',820000,6,'0012345678','Modelo','—'],
 ['Bruno Castillo','16.987.654-3','Operaciones',690000,14,'0098765432','Habitat','Lumbago'],
 ['Carla Díaz','13.456.789-0','Ventas',910000,2,'0034567890','Capital','—'],
 ['Diego Fuentes','17.321.654-K','Operaciones',650000,18,'0076543210','Provida','—'],
 ['Elena Rojas','14.789.123-4','Finanzas',1150000,0,'0045678901','Cuprum','Gripe'],
 ['Felipe Soto','18.123.456-7','Operaciones',700000,12,'0011223344','Modelo','—'],
 ['Gabriela Vera','12.654.987-1','Ventas',880000,4,'0055667788','Uno','—'],
 ['Hernán Paredes','19.876.543-2','Finanzas',1050000,1,'0099887766','Habitat','—'],
 ['Isabel Torres','16.543.210-5','Operaciones',720000,16,'0033445566','Capital','Esguince'],
 ['Jorge Lagos','15.678.901-6','Ventas',860000,5,'0077889900','Provida','—']];
const HEAD=['Nombre','RUT','Área','Sueldo base','Horas extra','Cuenta bancaria','AFP','Licencia (diagnóstico)'];
const COLS='ABCDEFGH';
let hoja=null,S=null,checks=[],bestTable=0;
function build(){const data={},locked=[];
  HEAD.forEach((h,i)=>{data[COLS[i]+'1']=h;locked.push(COLS[i]+'1')});
  DATA.forEach((row,r)=>row.forEach((v,i)=>{const k=COLS[i]+(r+2);data[k]=String(v);locked.push(k)}));
  [['J1','Código'],['K1','Área'],['L1','Sueldo base'],['M1','Horas extra']].forEach(([k,v])=>{data[k]=v;locked.push(k)});
  DATA.forEach((_,r)=>{const k='J'+(r+2);data[k]='EMP-'+String(r+1).padStart(3,'0');locked.push(k)});
  data['J13']='TOTAL';locked.push('J13');data['C13']='TOTAL original';locked.push('C13');
  data['D13']='=SUMA(D2:D11)';data['E13']='=SUMA(E2:E11)';locked.push('D13','E13');
  for(let c=0;c<13;c++)for(let r=1;r<=13;r++){const k=String.fromCharCode(65+c)+r;if(!data[k]&&!['K','L','M'].includes(k[0]))locked.push(k)}
  hoja=Hoja(document.getElementById('hoja1'),{cols:13,rows:13,data,locked,start:'K2'});
  ['A1','B1','C1','D1','E1','F1','G1','H1','J1','K1','L1','M1'].forEach(k=>hoja.cells[k].classList.add('hdr'));
  ['A','B','F','G','H'].forEach(c=>{for(let r=2;r<=11;r++)hoja.cells[c+r].style.opacity='.55'})}
function check(){const out=[];let ok=0;const v=k=>hoja.value(k);
  const colOk=(dst,src,label)=>{let good=true,formula=true;for(let r=2;r<=11;r++){if(v(dst+r)!==v(src+r))good=false;if(!hoja.get(dst+r).startsWith('='))formula=false}
    out.push([good&&formula,good&&formula?`Columna ${dst} (${label}) correcta y conectada con fórmulas.`:good?`Columna ${dst} (${label}): los valores coinciden, pero usa fórmulas (por ejemplo =${src}2) en vez de escribirlos.`:`Columna ${dst} (${label}): revisa las filas 2 a 11; deben mostrar los valores de la columna ${src}.`])};
  colOk('K','C','área');colOk('L','D','sueldo base');colOk('M','E','horas extra');
  const tot=(k,src,label)=>{const g=v(k)===v(src)&&/SUMA\(/i.test(hoja.get(k));out.push([g,g?`Control ${k}: el total de ${label} cuadra con el original (${hoja.display(k)}).`:`Control ${k}: escribe =SUMA(${k[0]}2:${k[0]}11) y verifica que cuadre con ${src} (${hoja.display(src)}).`])};
  tot('L13','D13','sueldos');tot('M13','E13','horas extra');
  out.forEach(o=>{if(o[0])ok++});checks=out;bestTable=Math.max(bestTable,ok);
  ['K','L','M'].forEach(c=>{for(let r=2;r<=11;r++){const good=v(c+r)===v({K:'C',L:'D',M:'E'}[c]+r);hoja.cells[c+r].classList.toggle('ok',good);hoja.cells[c+r].classList.toggle('bad',!good&&hoja.get(c+r)!=='')}});
  document.getElementById('checkOut').innerHTML=`<div class="checks2">${out.map(o=>`<div class="${o[0]?'ok':'no'}">${o[0]?'✓':'✕'} ${o[1]}</div>`).join('')}</div>${ok===out.length?'<div class="ok-row" style="margin-top:8px">✓ ¡Tabla segura lista! Sin nombres, RUT, cuentas, AFP ni diagnósticos, y con los totales cuadrados.</div>':''}`;
  return ok===out.length}
Object.assign(window.LESSON,{
  score(){const keys=Object.keys(S.first).filter(k=>k.startsWith('stsemaforo'));const sem=keys.length?keys.filter(k=>S.first[k]).length/8:0;return Math.round(sem*40+bestTable/5*60)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);const keys=Object.keys(S.first).filter(k=>k.startsWith('stsemaforo'));
    $('#labPct').textContent=sc+'%';$('#labSem').textContent=`${keys.filter(k=>S.first[k]).length} / 8`;$('#labState').textContent=sc>=70?'Buen dominio':'Sigue practicando';$('#labState').style.color=sc>=70?'var(--good)':'var(--teal-ink)'},
  init(api){S=api.S;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    build();
    document.getElementById('fillBtn').addEventListener('click',()=>{const k=hoja.sel;if(!['K','L','M'].includes(k[0])||k.slice(1)!=='2'){document.getElementById('checkOut').innerHTML='<div class="alert-row">Selecciona primero K2, L2 o M2 (la celda con tu fórmula) y luego presiona “Rellenar hacia abajo”.</div>';return}hoja.fillDown(k,11)});
    document.getElementById('checkBtn').addEventListener('click',()=>{if(check())api.done('tabla')})}
});
})();

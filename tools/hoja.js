/* Simulador de hoja de cálculo para los laboratorios (estilo Excel en español).
   - Celdas A1…, barra de fórmulas, selección, edición con Enter/Tab/flechas.
   - Fórmulas: números (coma decimal), referencias, rangos, + - * / ^ &, comparaciones,
     funciones SUMA, PROMEDIO, CONTAR, CONTARA, MAX, MIN, SI, Y, O, NO, REDONDEAR, ABS,
     BUSCARV, CONTAR.SI, SUMAR.SI, TEXTO, CONCATENAR, SI.ERROR, ESBLANCO.
   - Separador de argumentos: punto y coma (;), como en Excel en español.
   Uso: const h = Hoja(contenedor, {cols, rows, data:{A1:'Nombre',...}, locked:['A1',...], onChange}) */
(function(){
const colName=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
const colIndex=s=>s.split('').reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1;
const parseRef=r=>{const m=/^\$?([A-Z]+)\$?(\d+)$/.exec(r);return m?{c:colIndex(m[1]),r:+m[2]-1}:null};
const fmtNum=v=>{if(typeof v!=='number')return v;if(!isFinite(v))return '#¡DIV/0!';const r=Math.round(v*100)/100;return r.toLocaleString('es-CL',{maximumFractionDigits:2})};
class FErr extends Error{constructor(c){super(c);this.code=c}}

function tokenize(src){const t=[];let i=0;
  while(i<src.length){const ch=src[i];
    if(/\s/.test(ch)){i++;continue}
    if(ch==='"'){let j=i+1,s='';while(j<src.length&&src[j]!=='"'){s+=src[j];j++}t.push({k:'str',v:s});i=j+1;continue}
    const num=/^\d+(,\d+)?/.exec(src.slice(i));if(num){t.push({k:'num',v:parseFloat(num[0].replace(',','.'))});i+=num[0].length;continue}
    const id=/^\$?[A-Za-z][A-Za-z0-9.$]*/.exec(src.slice(i));
    if(id){const w=id[0].toUpperCase();
      const rng=/^(\$?[A-Z]+\$?\d+):(\$?[A-Z]+\$?\d+)/.exec(src.slice(i).toUpperCase());
      if(rng){t.push({k:'rng',a:rng[1].replace(/\$/g,''),b:rng[2].replace(/\$/g,'')});i+=rng[0].length;continue}
      if(/^\$?[A-Z]+\$?\d+$/.test(w)){t.push({k:'ref',v:w.replace(/\$/g,'')});i+=w.length;continue}
      t.push({k:'id',v:w});i+=w.length;continue}
    const two=src.slice(i,i+2);if(['<=','>=','<>'].includes(two)){t.push({k:'op',v:two});i+=2;continue}
    if('+-*/^&=<>();'.includes(ch)){t.push({k:'op',v:ch});i++;continue}
    if(ch===','){throw new FErr('#¿NOMBRE?')}
    throw new FErr('#¿NOMBRE?')}
  return t}

function Hoja(root,opts){
  const C=opts.cols,R=opts.rows,raw={},locked=new Set(opts.locked||[]);let sel='A1';
  Object.entries(opts.data||{}).forEach(([k,v])=>raw[k]=String(v));
  const get=k=>raw[k]||'';
  function evalCell(k,stack=new Set()){
    if(stack.has(k))throw new FErr('#¡REF!');
    const s=get(k);if(s==='')return '';
    if(s[0]!=='='&&/^0\d/.test(s))return s;if(s[0]!=='=' ){const n=s.replace(/\./g,'').replace(',','.');return /^-?\d+(\.\d+)?$/.test(n)&&/^[-\d.,]+$/.test(s)?parseFloat(n):s}
    stack.add(k);const v=evalFormula(s.slice(1),stack);stack.delete(k);return v}
  function rangeVals(a,b,stack){const A=parseRef(a),B=parseRef(b);const out=[];
    for(let r=Math.min(A.r,B.r);r<=Math.max(A.r,B.r);r++){const row=[];for(let c=Math.min(A.c,B.c);c<=Math.max(A.c,B.c);c++)row.push(evalCell(colName(c)+(r+1),stack));out.push(row)}return out}
  function evalFormula(src,stack){const t=tokenize(src);let p=0;
    const peek=()=>t[p],eat=v=>{const x=t[p];if(!x||(v&&x.v!==v))throw new FErr('#¡VALOR!');p++;return x};
    const num=v=>{if(v===''||v===null)return 0;if(typeof v==='boolean')return v?1:0;if(typeof v==='number')return v;const n=parseFloat(String(v).replace(/\./g,'').replace(',','.'));if(isNaN(n))throw new FErr('#¡VALOR!');return n};
    function expr(){return cmp()}
    function cmp(){let a=cat();while(peek()&&['=','<','>','<=','>=','<>'].includes(peek().v)){const o=eat().v,b=cat();
      const x=typeof a==='string'?a.toLowerCase():a,y=typeof b==='string'?b.toLowerCase():b;
      a=o==='='?x==y:o==='<>'?x!=y:o==='<'?x<y:o==='>'?x>y:o==='<='?x<=y:x>=y}return a}
    function cat(){let a=add();while(peek()&&peek().v==='&'){eat();const b=add();a=String(a===''?'':fmtPlain(a))+String(b===''?'':fmtPlain(b))}return a}
    function fmtPlain(v){return typeof v==='number'?String(Math.round(v*100)/100).replace('.',','):typeof v==='boolean'?(v?'VERDADERO':'FALSO'):v}
    function add(){let a=mul();while(peek()&&['+','-'].includes(peek().v)){const o=eat().v,b=mul();a=o==='+'?num(a)+num(b):num(a)-num(b)}return a}
    function mul(){let a=pow();while(peek()&&['*','/'].includes(peek().v)){const o=eat().v,b=pow();if(o==='/'&&num(b)===0)throw new FErr('#¡DIV/0!');a=o==='*'?num(a)*num(b):num(a)/num(b)}return a}
    function pow(){let a=unary();while(peek()&&peek().v==='^'){eat();a=Math.pow(num(a),num(unary()))}return a}
    function unary(){if(peek()&&peek().v==='-'){eat();return -num(unary())}if(peek()&&peek().v==='+'){eat();return num(unary())}return atom()}
    function atom(){const x=peek();if(!x)throw new FErr('#¡VALOR!');
      if(x.k==='num'){p++;return x.v}if(x.k==='str'){p++;return x.v}
      if(x.k==='ref'){p++;return evalCell(x.v,stack)}
      if(x.k==='rng'){p++;return {range:rangeVals(x.a,x.b,stack)}}
      if(x.v==='('){eat('(');const v=expr();eat(')');return v}
      if(x.k==='id'){p++;
        if(x.v==='VERDADERO')return true;if(x.v==='FALSO')return false;
        eat('(');const args=[];if(peek()&&peek().v!==')'){args.push(argLazy());while(peek()&&peek().v===';'){eat(';');args.push(argLazy())}}eat(')');
        return call(x.v,args)}
      throw new FErr('#¡VALOR!')}
    function argLazy(){const start=p;let depth=0;while(p<t.length){const v=t[p].v;if(v==='(')depth++;if(v===')'){if(depth===0)break;depth--}if(v===';'&&depth===0)break;p++}
      const sub=t.slice(start,p);return ()=>{const save=[t,p];return evalTokens(sub)}}
    function evalTokens(sub){const saveT=t.slice(),saveP=p;t.length=0;sub.forEach(s=>t.push(s));p=0;try{const v=expr();if(p<t.length)throw new FErr('#¡VALOR!');return v}finally{t.length=0;saveT.forEach(s=>t.push(s));p=saveP}}
    const flat=vals=>vals.flatMap(v=>v&&v.range?v.range.flat():[v]);
    function call(fn,args){const ev=i=>args[i]?args[i]():undefined;
      switch(fn){
        case 'SUMA':return flat(args.map(a=>a())).filter(v=>typeof v==='number').reduce((a,b)=>a+b,0);
        case 'PROMEDIO':{const v=flat(args.map(a=>a())).filter(v=>typeof v==='number');if(!v.length)throw new FErr('#¡DIV/0!');return v.reduce((a,b)=>a+b,0)/v.length}
        case 'CONTAR':return flat(args.map(a=>a())).filter(v=>typeof v==='number').length;
        case 'CONTARA':return flat(args.map(a=>a())).filter(v=>v!=='').length;
        case 'MAX':{const v=flat(args.map(a=>a())).filter(v=>typeof v==='number');return v.length?Math.max(...v):0}
        case 'MIN':{const v=flat(args.map(a=>a())).filter(v=>typeof v==='number');return v.length?Math.min(...v):0}
        case 'SI':{const c=ev(0);return (c===true||(typeof c==='number'&&c!==0))?(args[1]?ev(1):true):(args[2]?ev(2):false)}
        case 'Y':return args.every(a=>{const v=a();return v===true||(typeof v==='number'&&v!==0)});
        case 'O':return args.some(a=>{const v=a();return v===true||(typeof v==='number'&&v!==0)});
        case 'NO':{const v=ev(0);return !(v===true||(typeof v==='number'&&v!==0))}
        case 'REDONDEAR':{const n=num(ev(0)),d=num(ev(1)||0),f=Math.pow(10,d);return Math.round(n*f)/f}
        case 'ABS':return Math.abs(num(ev(0)));
        case 'ESBLANCO':return ev(0)==='';
        case 'SI.ERROR':try{return ev(0)}catch(e){return ev(1)}
        case 'CONCATENAR':return args.map(a=>fmtPlain(a())).join('');
        case 'TEXTO':{const v=num(ev(0)),f=String(ev(1)||'');const z=(f.match(/0/g)||[]).length;return z?String(Math.round(v)).padStart(z,'0'):String(v)}
        case 'BUSCARV':{const key=ev(0),tbl=ev(1),col=num(ev(2)),exact=args[3]?ev(3):true;if(!tbl||!tbl.range)throw new FErr('#¡VALOR!');
          const rows=tbl.range;const k=typeof key==='string'?key.toLowerCase():key;
          let row=null;if(exact===false||exact===0)row=rows.find(r=>(typeof r[0]==='string'?r[0].toLowerCase():r[0])==k);else{for(const r of rows){if(typeof r[0]==='number'&&typeof key==='number'&&r[0]<=key)row=r;else if(typeof r[0]==='string'&&String(r[0]).toLowerCase()<=String(k))row=r}}
          if(!row)throw new FErr('#N/A');if(col<1||col>row.length)throw new FErr('#¡REF!');return row[col-1]}
        case 'CONTAR.SI':{const vals=flat([ev(0)]),crit=ev(1);return vals.filter(v=>matchCrit(v,crit)).length}
        case 'SUMAR.SI':{const vals=flat([ev(0)]),crit=ev(1),sum=args[2]?flat([ev(2)]):vals;return vals.reduce((a,v,i)=>a+(matchCrit(v,crit)&&typeof sum[i]==='number'?sum[i]:0),0)}
        default:throw new FErr('#¿NOMBRE?')}}
    function matchCrit(v,c){if(typeof c==='number')return v===c;const m=/^(<=|>=|<>|<|>|=)?(.*)$/.exec(String(c));const o=m[1]||'=',x=m[2];const n=parseFloat(x.replace(',','.'));
      const a=isNaN(n)?String(v).toLowerCase():v,b=isNaN(n)?x.toLowerCase():n;
      return o==='='?a==b:o==='<>'?a!=b:o==='<'?a<b:o==='>'?a>b:o==='<='?a<=b:a>=b}
    const v=expr();if(p<t.length)throw new FErr('#¡VALOR!');if(v&&v.range)throw new FErr('#¡VALOR!');return v}
  function value(k){try{return evalCell(k)}catch(e){return e.code||'#¡VALOR!'}}
  function display(k){const v=value(k);if(typeof v==='boolean')return v?'VERDADERO':'FALSO';return fmtNum(v)}
  /* ---- interfaz ---- */
  root.classList.add('hoja');
  root.innerHTML=`<div class="hj-bar"><span class="hj-name">A1</span><span class="hj-fx">fx</span><input class="hj-input" type="text" spellcheck="false" aria-label="Barra de fórmulas"/><button type="button" class="hj-ok" aria-label="Confirmar">✓</button></div>
    <div class="hj-wrap"><table class="hj-grid"><thead><tr><th class="hj-corner"></th>${Array.from({length:C},(_,c)=>`<th>${colName(c)}</th>`).join('')}</tr></thead><tbody>${
      Array.from({length:R},(_,r)=>`<tr><th>${r+1}</th>${Array.from({length:C},(_,c)=>`<td data-k="${colName(c)}${r+1}" tabindex="-1"></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const inp=root.querySelector('.hj-input'),nameEl=root.querySelector('.hj-name');
  const cells=Object.fromEntries([...root.querySelectorAll('td')].map(td=>[td.dataset.k,td]));
  function paint(){Object.entries(cells).forEach(([k,td])=>{const d=display(k);td.textContent=d;const v=value(k);
    td.classList.toggle('num',typeof v==='number');td.classList.toggle('err',typeof v==='string'&&v.startsWith('#'));td.classList.toggle('fx',get(k).startsWith('='));td.classList.toggle('lock',locked.has(k))})}
  function select(k){sel=k;Object.values(cells).forEach(td=>td.classList.remove('sel'));cells[k].classList.add('sel');nameEl.textContent=k;inp.value=get(k);inp.readOnly=locked.has(k);inp.placeholder=locked.has(k)?'Celda con datos de origen (no editable)':'Escribe un valor o una fórmula, por ejemplo =SUMA(D2:D11)'}
  function commit(){if(locked.has(sel))return;raw[sel]=inp.value.trim();paint();opts.onChange&&opts.onChange(api,sel)}
  function move(dc,dr){const p=parseRef(sel);const c=Math.max(0,Math.min(C-1,p.c+dc)),r=Math.max(0,Math.min(R-1,p.r+dr));select(colName(c)+(r+1));cells[sel].scrollIntoView({block:'nearest',inline:'nearest'})}
  Object.entries(cells).forEach(([k,td])=>{td.addEventListener('click',()=>select(k));td.addEventListener('dblclick',()=>{select(k);inp.focus()})});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();move(0,1)}else if(e.key==='Tab'){e.preventDefault();commit();move(e.shiftKey?-1:1,0)}else if(e.key==='Escape'){inp.value=get(sel)}});
  root.querySelector('.hj-ok').addEventListener('click',()=>{commit()});
  root.addEventListener('keydown',e=>{if(e.target===inp)return;const m={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]}[e.key];if(m){e.preventDefault();move(...m)}else if(e.key==='Enter'){e.preventDefault();inp.focus()}});
  /* Rellenar hacia abajo: copia la fórmula ajustando las filas relativas (como Excel) */
  function shift(f,dr){return f.replace(/("[^"]*")|(\$?)([A-Z]+)(\$?)(\d+)/g,(m,str,d1,col,d2,row)=>str?str:(d2?m:d1+col+(+row+dr)))}
  function fillDown(from,toRow){const p0=parseRef(from);const src=get(from);for(let r=p0.r+1;r<toRow;r++){const k=colName(p0.c)+(r+1);if(locked.has(k))continue;raw[k]=src.startsWith('=')?'='+shift(src.slice(1),r-p0.r):src}paint();opts.onChange&&opts.onChange(api,from)}
  const api={fillDown,get sel(){return sel},get,value,display,set(k,v){raw[k]=String(v);paint()},lock(k){locked.add(k);paint()},select,paint,
    setColumn(col,vals){vals.forEach((v,i)=>raw[col+(i+2)]=String(v));paint()},raw,cells,colName};
  paint();select(opts.start||'A1');return api}
window.Hoja=Hoja;
})();

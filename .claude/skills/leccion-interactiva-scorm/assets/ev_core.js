const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clp=n=>'$'+Math.round(n).toLocaleString('es-CL');
const num=v=>{v=String(v||'').trim();if(!v)return NaN;if(/,\d{1,2}$/.test(v))v=v.replace(/\./g,'').replace(',','.');else v=v.replace(/[^\d.-]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'');return parseFloat(v)};
const near=(a,b,t=2)=>Math.abs(a-b)<=t;

/* ---------- SCORM 1.2 (solo informa el resultado final) ---------- */
const SC=(function(){
  function find(w){let n=0;try{while(w&&!w.API&&w.parent&&w.parent!==w&&n<10){w=w.parent;n++}return w&&w.API?w.API:null}catch(e){return null}}
  let api=find(window);if(!api){try{if(window.opener)api=find(window.opener)}catch(e){}}
  let ok=false,fin=false;if(api){try{ok=String(api.LMSInitialize(''))==='true'}catch(e){}}
  const set=(k,v)=>{try{if(ok&&!fin)api.LMSSetValue(k,String(v))}catch(e){}};
  const get=k=>{try{return ok?String(api.LMSGetValue(k)||''):''}catch(e){return ''}};
  const commit=()=>{try{if(ok&&!fin)api.LMSCommit('')}catch(e){}};
  const finish=()=>{if(!ok||fin)return;try{api.LMSCommit('');api.LMSFinish('')}catch(e){}fin=true};
  if(ok){const st=get('cmi.core.lesson_status');if(st===''||st==='not attempted')set('cmi.core.lesson_status','incomplete');commit()}
  const T0=Date.now();
  window.addEventListener('pagehide',()=>{if(!ok||fin)return;const s=Math.round((Date.now()-T0)/1000),p=n=>String(n).padStart(2,'0');
    set('cmi.core.session_time',`${String(Math.floor(s/3600)).padStart(4,'0')}:${p(Math.floor(s/60)%60)}:${p(s%60)}.00`);finish()});
  return {ok,set,get,commit}})();

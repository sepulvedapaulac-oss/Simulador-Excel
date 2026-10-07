/* ---------- SCORM 1.2 ---------- */
const SC=(function(){
  function find(w){let n=0;try{while(w&&!w.API&&w.parent&&w.parent!==w&&n<10){w=w.parent;n++}return w&&w.API?w.API:null}catch(e){return null}}
  let api=find(window);if(!api){try{if(window.opener)api=find(window.opener)}catch(e){}}
  let ok=false,fin=false;if(api){try{ok=String(api.LMSInitialize(''))==='true'}catch(e){}}
  const get=k=>{try{return ok?String(api.LMSGetValue(k)||''):''}catch(e){return ''}};
  const set=(k,v)=>{try{if(ok)api.LMSSetValue(k,String(v))}catch(e){}};
  const commit=()=>{try{if(ok)api.LMSCommit('')}catch(e){}};
  const finish=()=>{if(!ok||fin)return;fin=true;try{api.LMSFinish('')}catch(e){}};
  return {get ok(){return ok&&!fin},get,set,commit,finish}})();
const T0=Date.now();let startSlide=0;
function scSave(){if(!SC.ok)return;
  const d={v:1,cur:S.cur,max:S.max,done:[...S.done],first:S.first,qa:S.quiz.answers.length===Q.length?S.quiz.answers:[],c:S.completed};
  SC.set('cmi.suspend_data',JSON.stringify(d));SC.set('cmi.core.lesson_location',String(S.cur));
  if(S.quiz.taken){SC.set('cmi.core.score.min',0);SC.set('cmi.core.score.max',100);SC.set('cmi.core.score.raw',Math.round(S.quiz.score/Q.length*100))}
  if(S.completed&&passScore())SC.set('cmi.core.lesson_status','passed');SC.commit()}
if(SC.ok){const st=SC.get('cmi.core.lesson_status');if(st===''||st==='not attempted')SC.set('cmi.core.lesson_status','incomplete');
  try{const d=JSON.parse(SC.get('cmi.suspend_data')||'{}');if(d.v===1){S.max=+d.max||0;(d.done||[]).forEach(k=>S.done.add(k));S.first=d.first||{};S.completed=!!d.c;
    if(d.qa&&d.qa.length===Q.length){S.quiz.answers=d.qa;qi=Q.length;qRender()}
    startSlide=Math.max(0,Math.min(+d.cur||0,S.completed?slides.length-1:S.max))}}catch(e){}
  const _go=go;go=function(i){_go(i);scSave()};const _done=done;done=function(k){_done(k);scSave()};
  const bye=()=>{if(!SC.ok)return;scSave();const s=Math.round((Date.now()-T0)/1000),p=n=>String(n).padStart(2,'0');
    SC.set('cmi.core.session_time',`${String(Math.floor(s/3600)).padStart(4,'0')}:${p(Math.floor(s/60)%60)}:${p(s%60)}.00`);
    SC.set('cmi.core.exit',S.completed&&passScore()?'':'suspend');SC.commit();SC.finish()};
  window.addEventListener('pagehide',bye);window.addEventListener('beforeunload',bye)}
go(startSlide);

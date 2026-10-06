// Renderiza el Video 2 cuadro a cuadro desde stage.html + narraciones. uso: node render.js salida.mp4 [preview_dir]
const {chromium}=require('playwright');const {execSync,spawn}=require('child_process');const fs=require('fs');const path=require('path');
const D=__dirname,OUT=process.argv[2],PREV=process.argv[3],FPS=25,PAD_IN=.5,PAD_OUT=1.0,XF=.4;
const TXT=JSON.parse(fs.readFileSync(path.join(D,'locucion.json'),'utf8'));
const dur=f=>parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString());
let t0=0;const plan=TXT.map((txt,i)=>{const a=path.join(D,'audio',`t${String(i+1).padStart(2,'0')}.mp3`),d=dur(a),T=PAD_IN+d+PAD_OUT,p={k:i+1,a,d,T,st:t0,txt};t0+=T;return p});const TOTAL=t0;
// subtítulos: frases cortas (se divide en comas si la frase es larga), tiempo proporcional a las letras
const subs=[];for(const p of plan){let parts=p.txt.split(/(?<=[.:?!])\s+/);parts=parts.flatMap(s=>s.length>95?s.split(/(?<=,)\s+/).reduce((acc,x)=>{if(acc.length&&(acc[acc.length-1]+' '+x).length<95)acc[acc.length-1]+=' '+x;else acc.push(x);return acc},[]):[s]);
  const tot=parts.reduce((a,s)=>a+s.length,0);let t=p.st+PAD_IN;for(const s of parts){const dd=p.d*s.length/tot;subs.push([t,t+dd,s]);t+=dd}}
const subAt=t=>{const s=subs.find(x=>t>=x[0]&&t<x[1]);return s?s[2]:''};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const pg=await b.newPage({viewport:{width:1920,height:1080}});
 await pg.goto('file://'+path.join(D,'stage.html'));await pg.waitForTimeout(500);
 if(PREV){fs.mkdirSync(PREV,{recursive:true});for(const p of plan)for(const f of [.1,.3,.5,.7,.9]){const t=p.st+p.T*f;await pg.evaluate(([k,f,T,s])=>R(k,f,T,s),[p.k,f,p.T,subAt(t)]);await pg.screenshot({path:`${PREV}/s${String(p.k).padStart(2,'0')}_${Math.round(f*100)}.jpg`,type:'jpeg',quality:70})}await b.close();return}
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',OUT+'.v.mp4'],{stdio:['pipe','inherit','inherit']});
 const N=Math.round(TOTAL*FPS);
 for(let i=0;i<N;i++){const t=i/FPS;let p=plan[plan.length-1];for(const q of plan)if(t>=q.st)p=q;const f=(t-p.st)/p.T;
  await pg.evaluate(([k,f,T,s])=>R(k,f,T,s),[p.k,f,p.T,subAt(t)]);
  // fundido de entrada en cada escena
  const fade=Math.min(1,(t-p.st)/XF);await pg.evaluate(o=>{document.body.style.opacity=o},p.k>1?Math.max(.0,fade):1);
  const buf=await pg.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%500===0)console.log(i+'/'+N)}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
 // audio
 const inputs=plan.flatMap(p=>['-i',p.a]),filt=plan.map((p,k)=>{const ms=Math.round((p.st+PAD_IN)*1000);return `[${k}:a]adelay=${ms}|${ms}[a${k}]`}).join(';');
 execSync(`ffmpeg -y -loglevel error ${inputs.map(x=>x.includes('/')?`"${x}"`:x).join(' ')} -filter_complex "${filt};${plan.map((p,k)=>`[a${k}]`).join('')}amix=inputs=${plan.length}:normalize=0,apad[o]" -map "[o]" -t ${TOTAL.toFixed(2)} -c:a aac -b:a 160k "${OUT}.a.m4a"`);
 execSync(`ffmpeg -y -loglevel error -i "${OUT}.v.mp4" -i "${OUT}.a.m4a" -c copy -movflags +faststart "${OUT}"`);fs.unlinkSync(OUT+'.v.mp4');fs.unlinkSync(OUT+'.a.m4a');
 const ts=x=>{const ms=Math.round(x*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`};
 fs.writeFileSync(OUT.replace(/\.mp4$/,'.srt'),subs.map((s,i)=>`${i+1}\n${ts(s[0])} --> ${ts(s[1])}\n${s[2]}\n`).join('\n'));
 console.log('listo',OUT,TOTAL.toFixed(1)+'s')})();

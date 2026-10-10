# Narración del módulo 5: voz Piper es_AR-daniela-high ajustada a español latino neutro
# (ll/y consonántica -> sonido "i", menos variación de ruido y entonación aplanada con WORLD).
# Requiere: pip install sherpa-onnx soundfile pyworld; modelo vits-piper-es_AR-daniela-high
# (releases "tts-models" de k2-fsa/sherpa-onnx). Uso: python3 gen_audio.py <carpeta_modelo> [l51 l52 ...]
import json,os,re,subprocess,sys,numpy as np,soundfile as sf,sherpa_onnx,pyworld as pw
M=sys.argv[1]; R=os.path.dirname(os.path.abspath(__file__)); L=sys.argv[2:] or ['l51','l52','l53','l54','l55']
V='aeiouáéíóú'
def neutral(t):
  t=re.sub(rf'(?i)ll(?=[{V}])',lambda m:'I' if m.group(0)[0].isupper() else 'i',t)
  t=re.sub(rf'(?<![A-Za-zÁÉÍÓÚáéíóúñ])([Yy])(?=[{V}])',lambda m:'I' if m.group(1)=='Y' else 'i',t)
  return re.sub(rf'(?<=[{V}])y(?=[{V}])','i',t)
def suavizar(a,n): return np.convolve(np.pad(a,(n//2,n//2),'edge'),np.ones(n)/n,'valid')
def aplanar(x,sr,k=0.55):
  x=x.astype(np.float64); f0,t=pw.harvest(x,sr,f0_floor=110,f0_ceil=420,frame_period=5)
  sp=pw.cheaptrick(x,f0,t,sr); ap=pw.d4c(x,f0,t,sr); v=f0>0
  lf=np.log(np.where(v,f0,1)); m=lf[v].mean(); i=np.arange(len(f0)); tr=suavizar(np.interp(i,i[v],lf[v]),121)
  f2=np.where(v,np.exp(m+(tr-m)*0.8+(lf-tr)*k),0); y=pw.synthesize(f2,sp,ap,sr,5); return y/np.max(np.abs(y))*0.9
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
  model=f"{M}/es_AR-daniela-high.onnx",tokens=f"{M}/tokens.txt",data_dir=f"{M}/espeak-ng-data",noise_scale=0.5,noise_scale_w=0.6,length_scale=1.06),num_threads=6),max_num_sentences=1))
for l in L:
  n=json.load(open(f'{R}/{l}/narr.json')); os.makedirs(f'{R}/{l}/aud',exist_ok=True)
  for k,txt in n.items():
    a=tts.generate(neutral(txt),sid=0); sr=a.sample_rate
    y=np.concatenate([np.zeros(int(.25*sr)),aplanar(np.array(a.samples),sr),np.zeros(int(.35*sr))])
    sf.write('/tmp/_n.wav',y,sr)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','/tmp/_n.wav','-af','loudnorm=I=-16:TP=-1.5','-ar','44100','-ac','1','-b:a','96k',f'{R}/{l}/aud/{k}.mp3'],check=True)
  print(l,len(n),flush=True)

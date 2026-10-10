import json,os,subprocess,sys,soundfile as sf,numpy as np
# requiere: pip install sherpa-onnx soundfile; modelo kokoro-multi-lang-v1_0 (releases de k2-fsa/sherpa-onnx)
from tts_kokoro import mk
t=mk('es-419'); R='/home/user/Simulador-Excel/fuentes_modulo5'
for l in ['l51','l52','l53','l54','l55']:
  n=json.load(open(f'{R}/{l}/narr.json')); os.makedirs(f'{R}/{l}/aud',exist_ok=True)
  for k,txt in n.items():
    a=t.generate(txt,sid=28,speed=0.95); s=np.concatenate([np.zeros(int(.25*a.sample_rate)),np.array(a.samples),np.zeros(int(.35*a.sample_rate))])
    sf.write('tmp.wav',s,a.sample_rate)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','tmp.wav','-af','loudnorm=I=-16:TP=-1.5','-ar','44100','-ac','1','-b:a','96k',f'{R}/{l}/aud/{k}.mp3'],check=True)
  print(l,len(n),flush=True)

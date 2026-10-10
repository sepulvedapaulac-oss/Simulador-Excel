# Narración del módulo 5 con Piper (voz es_MX-claude-high, femenina, español latino neutro).
# Requiere: pip install sherpa-onnx soundfile; modelo vits-piper-es_MX-claude-high
# (releases "tts-models" de k2-fsa/sherpa-onnx). Uso: python3 gen_audio.py <carpeta_modelo> [l51 l52 ...]
import json,os,subprocess,sys,soundfile as sf,numpy as np,sherpa_onnx
M=sys.argv[1]; R=os.path.dirname(os.path.abspath(__file__)); L=sys.argv[2:] or ['l51','l52','l53','l54','l55']
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
  model=f"{M}/es_MX-claude-high.onnx",tokens=f"{M}/tokens.txt",data_dir=f"{M}/espeak-ng-data"),num_threads=6),max_num_sentences=1)
t=sherpa_onnx.OfflineTts(cfg)
for l in L:
  n=json.load(open(f'{R}/{l}/narr.json')); os.makedirs(f'{R}/{l}/aud',exist_ok=True)
  for k,txt in n.items():
    a=t.generate(txt,sid=0,speed=1.0); sr=a.sample_rate
    s=np.concatenate([np.zeros(int(.25*sr)),np.array(a.samples),np.zeros(int(.35*sr))])
    sf.write('/tmp/_n.wav',s,sr)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','/tmp/_n.wav','-af','loudnorm=I=-16:TP=-1.5','-ar','44100','-ac','1','-b:a','96k',f'{R}/{l}/aud/{k}.mp3'],check=True)
  print(l,len(n),flush=True)

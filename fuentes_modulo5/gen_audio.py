# Narración del módulo 5: Kokoro v1.0 (voz ef_dora) con fonética de español latinoamericano (espeak es-419).
# Requiere: pip install sherpa-onnx soundfile; modelo kokoro-multi-lang-v1_0
# (releases "tts-models" de k2-fsa/sherpa-onnx). Uso: python3 gen_audio.py <carpeta_modelo> [l51 l52 ...]
import json,os,subprocess,sys,numpy as np,soundfile as sf,sherpa_onnx
M=sys.argv[1]; R=os.path.dirname(os.path.abspath(__file__)); L=sys.argv[2:] or ['l51','l52','l53','l54','l55']
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
  model=f"{M}/model.onnx",voices=f"{M}/voices.bin",tokens=f"{M}/tokens.txt",data_dir=f"{M}/espeak-ng-data",lang="es-419"),num_threads=8)))
for l in L:
  n=json.load(open(f'{R}/{l}/narr.json')); os.makedirs(f'{R}/{l}/aud',exist_ok=True)
  for k,txt in n.items():
    a=tts.generate(txt,sid=28,speed=1.0); sr=a.sample_rate
    sf.write(f'/tmp/_n_{l}.wav',np.concatenate([np.zeros(int(.25*sr)),np.array(a.samples),np.zeros(int(.35*sr))]),sr)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'/tmp/_n_{l}.wav','-af','loudnorm=I=-16:TP=-1.5','-ar','44100','-ac','1','-b:a','96k',f'{R}/{l}/aud/{k}.mp3'],check=True)
  print(l,len(n),flush=True)

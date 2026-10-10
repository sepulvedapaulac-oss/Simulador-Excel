import sys,sherpa_onnx,soundfile as sf
d="kokoro-multi-lang-v1_0"
def mk(lang):
  cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=f"{d}/model.onnx",voices=f"{d}/voices.bin",tokens=f"{d}/tokens.txt",data_dir=f"{d}/espeak-ng-data",lexicon="",lang=lang),num_threads=6))
  return sherpa_onnx.OfflineTts(cfg)
if __name__=="__main__":
  t=mk(sys.argv[1]); a=t.generate(sys.argv[2],sid=28,speed=float(sys.argv[4]) if len(sys.argv)>4 else 1.0)
  sf.write(sys.argv[3],a.samples,a.sample_rate); print(len(a.samples)/a.sample_rate)

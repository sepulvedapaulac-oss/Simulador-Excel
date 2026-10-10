import sys, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("/tmp/voz/kokoro-v1.0.onnx", "/tmp/voz/voices-v1.0.bin")
samples, sr = k.create(sys.argv[1], voice=sys.argv[2], speed=0.95, lang=(sys.argv[4] if len(sys.argv)>4 else "es"))
sf.write(sys.argv[3], samples, sr); print("ok")

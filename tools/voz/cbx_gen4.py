import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from tts_norm import norm
parts = ["Te damos la bienvenida a la lección uno punto uno.",
 "Camila Torres, analista senior de remuneraciones en AndesCorp, acaba de recibir un correo de su jefatura.",
 "Ábrelo y ayúdala a responder:",
 "¿qué tareas del proceso se le pueden confiar a una inteligencia artificial?"]
model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
for name, exa, cfg in [("emocion_media", 0.5, 0.5), ("emocion_alta", 0.8, 0.35)]:
    out = []
    for p in parts:
        w = model.generate(norm(p), language_id="es", audio_prompt_path="/tmp/voz/kokoro_es419.wav", exaggeration=exa, cfg_weight=cfg)
        out += [w, torch.zeros(1, int(model.sr * 0.35))]
    ta.save(f"cbx4_{name}.wav", torch.cat(out, dim=1), model.sr)
    print("ok", name)

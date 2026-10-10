"""Genera narraciones con Chatterbox Multilingual (MIT) en un solo proceso.

Voz del curso: "Chatterbox latino v2 · emoción media", clonada desde
referencia_latina.wav (Kokoro, Apache 2.0, pronunciación es-419).
Uso (lo llama build_lesson.py):  python cbx_batch.py trabajos.json
trabajos.json = [{"text": "...", "out": "/ruta/salida.wav"}, ...]
"""
import json, re, sys
from pathlib import Path
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
sys.path.insert(0, str(Path(__file__).parent))
from tts_norm import norm

REF = str(Path(__file__).with_name("referencia_latina.wav"))
EXAGGERATION, CFG = 0.5, 0.5   # emoción media (elegida por la autora del curso)
PAUSE = 0.35                    # segundos entre frases


def sentences(text):
    """Frases cortas: Chatterbox corta el final de textos largos."""
    parts = re.split(r'(?<=[.!?:;])\s+', text.strip())
    out = []
    for p in parts:
        # frases muy largas se dividen además por comas
        if len(p) > 170:
            chunks, cur = [], ""
            for c in re.split(r'(?<=,)\s+', p):
                if cur and len(cur) + len(c) > 150:
                    chunks.append(cur); cur = c
                else:
                    cur = f"{cur} {c}".strip()
            out += chunks + ([cur] if cur else [])
        elif p:
            out.append(p)
    return out


def main():
    jobs = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    for i, job in enumerate(jobs, 1):
        pieces = []
        for s in sentences(job["text"]):
            w = model.generate(norm(s), language_id="es", audio_prompt_path=REF,
                               exaggeration=EXAGGERATION, cfg_weight=CFG)
            pieces += [w, torch.zeros(1, int(model.sr * PAUSE))]
        ta.save(job["out"], torch.cat(pieces[:-1], dim=1), model.sr)
        print(f"[{i}/{len(jobs)}] {Path(job['out']).name}", flush=True)


if __name__ == "__main__":
    main()

"""Genera narraciones con Chatterbox Multilingual (MIT) en un solo proceso.

Voz del curso: "Chatterbox latino v2 · emoción media", clonada desde
referencia_latina.wav (Kokoro, Apache 2.0, pronunciación es-419).

Control de calidad por frase con Whisper (faster-whisper, MIT):
  - recorta el audio justo después de la última palabra (elimina ruidos finales)
  - compara lo transcrito con el texto y reintenta si no coincide

Uso (lo llama build_lesson.py):  python cbx_batch.py trabajos.json
trabajos.json = [{"text": "...", "out": "/ruta/salida.wav"}, ...]
"""
import difflib, json, re, sys, unicodedata
from pathlib import Path
import numpy as np
import torch, torchaudio as ta
import torchaudio.functional as AF
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
sys.path.insert(0, str(Path(__file__).parent))
from tts_norm import norm

REF = str(Path(__file__).with_name("referencia_latina.wav"))
EXAGGERATION, CFG = 0.5, 0.5   # emoción media (elegida por la autora del curso)
PAUSE = 0.35                    # segundos entre frases
TAIL, HEAD, FADE = 0.14, 0.06, 0.05
MIN_SIM, TRIES = 0.84, 3


def sentences(text):
    """Frases cortas: Chatterbox corta o deforma el final de textos largos."""
    out = []
    for p in re.split(r'(?<=[.!?:;])\s+', text.strip()):
        if len(p) > 170:
            cur = ""
            for c in re.split(r'(?<=,)\s+', p):
                if cur and len(cur) + len(c) > 150:
                    out.append(cur); cur = c
                else:
                    cur = f"{cur} {c}".strip()
            if cur:
                out.append(cur)
        elif p:
            out.append(p)
    return out


def plain(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"\buno punto uno\b", "1 1", s)
    return re.sub(r"[^a-z0-9 ]+", " ", s).split()


def check_and_trim(wav, sr, text, asr):
    """Devuelve (audio recortado, similitud, transcripción)."""
    x16 = AF.resample(wav, sr, 16000)[0].numpy().astype(np.float32)
    segs, _ = asr.transcribe(x16, language="es", word_timestamps=True, beam_size=1)
    words = [w for s in segs for w in s.words]
    if not words:
        return wav, 0.0, ""
    heard = " ".join(w.word.strip() for w in words)
    sim = difflib.SequenceMatcher(None, plain(text), plain(heard)).ratio()
    start = max(0, int((words[0].start - HEAD) * sr))
    end = min(wav.shape[1], int((words[-1].end + TAIL) * sr))
    cut = wav[:, start:end].clone()
    n = int(FADE * sr)
    if cut.shape[1] > 2 * n:
        cut[:, -n:] *= torch.linspace(1, 0, n)
        cut[:, :n] *= torch.linspace(0, 1, n)
    return cut, sim, heard


def main():
    jobs = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    asr = WhisperModel("small", device="cpu", compute_type="int8")
    report = []
    for i, job in enumerate(jobs, 1):
        pieces = []
        for s in sentences(job["text"]):
            best = None
            for t in range(TRIES):
                w = model.generate(norm(s), language_id="es", audio_prompt_path=REF,
                                   exaggeration=EXAGGERATION, cfg_weight=CFG)
                cut, sim, heard = check_and_trim(w, model.sr, s, asr)
                if best is None or sim > best[1]:
                    best = (cut, sim, heard)
                if sim >= MIN_SIM:
                    break
            report.append({"texto": s, "escuchado": best[2], "similitud": round(best[1], 2)})
            pieces += [best[0], torch.zeros(1, int(model.sr * PAUSE))]
        ta.save(job["out"], torch.cat(pieces[:-1], dim=1), model.sr)
        print(f"[{i}/{len(jobs)}] {Path(job['out']).name}", flush=True)
    rep = Path(sys.argv[1]).with_name("control_calidad_voz.json")
    old = json.loads(rep.read_text(encoding="utf-8")) if rep.exists() else []
    rep.write_text(json.dumps(old + report, ensure_ascii=False, indent=1), encoding="utf-8")
    low = [r for r in report if r["similitud"] < MIN_SIM]
    print(f"Control de calidad: {len(report) - len(low)}/{len(report)} frases OK", flush=True)
    for r in low:
        print(f"  REVISAR ({r['similitud']}): «{r['texto']}» → «{r['escuchado']}»", flush=True)


if __name__ == "__main__":
    main()

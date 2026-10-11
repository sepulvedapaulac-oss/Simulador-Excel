"""Compone una música de fondo alegre y en bucle (libre de derechos: generada aquí).

Estilo corporativo optimista: 112 BPM, progresión C – G – Am – F, arpegio brillante en
semicorcheas, bajo, colchón suave y percusión ligera (bombo, aplauso y shaker).
Uso: python musica.py salida.mp3
"""
import subprocess, sys
import numpy as np

SR = 44100
BPM = 112
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [  # (bajo, notas del acorde) en MIDI
    (36, [60, 64, 67, 72]),   # C
    (43, [59, 62, 67, 71]),   # G
    (45, [60, 64, 69, 72]),   # Am
    (41, [60, 65, 69, 72]),   # F
]
REPEATS = 4                    # 16 compases ≈ 34 s
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(7)


def env_t(dur):
    return np.arange(int(dur * SR)) / SR


def pluck(freq, dur=0.5, bright=0.45):
    t = env_t(dur)
    w = np.sin(2 * np.pi * freq * t) + bright * np.sin(4 * np.pi * freq * t) + 0.15 * np.sin(6 * np.pi * freq * t)
    return w * np.exp(-t * 7) * np.minimum(1, t / 0.004)


def pad(freqs, dur):
    t = env_t(dur)
    w = sum(np.sin(2 * np.pi * f * d * t) for f in freqs for d in (1, 1.004)) / (2 * len(freqs))
    return w * np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4)


def bass(freq, dur):
    t = env_t(dur)
    w = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)
    return w * np.exp(-t * 2.5) * np.minimum(1, t / 0.01)


def kick():
    t = env_t(0.35)
    f = 110 * np.exp(-t * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def clap():
    t = env_t(0.18)
    return rng.standard_normal(len(t)) * np.exp(-t * 28) * 0.6


def shaker():
    t = env_t(0.06)
    n = rng.standard_normal(len(t))
    n = n - np.convolve(n, np.ones(6) / 6, mode="same")   # paso alto simple
    return n * np.exp(-t * 60) * 0.35


def put(buf, x, sec, gain):
    i = int(sec * SR)
    buf[i:i + len(x)] += x[:max(0, len(buf) - i)] * gain


def main(out):
    total = len(CHORDS) * REPEATS * BAR
    mix = np.zeros(int((total + 2) * SR))
    for r in range(REPEATS):
        for c, (b, notes) in enumerate(CHORDS):
            t0 = (r * len(CHORDS) + c) * BAR
            put(mix, pad([hz(n) for n in notes], BAR + 0.3), t0, 0.22)
            put(mix, bass(hz(b), BEAT * 1.9), t0, 0.5)
            put(mix, bass(hz(b), BEAT * 0.9), t0 + 2.5 * BEAT, 0.4)
            put(mix, bass(hz(b + 7), BEAT * 0.9), t0 + 3.5 * BEAT, 0.35)
            seq = [notes[0], notes[1], notes[2], notes[3], notes[2], notes[1]]
            for k in range(16):                                   # semicorcheas
                put(mix, pluck(hz(seq[k % 6] + 12)), t0 + k * BEAT / 4, 0.16 if k % 4 else 0.22)
            if r > 0:                                             # la percusión entra en la 2.ª vuelta
                for k in range(4):
                    if k in (0, 2):
                        put(mix, kick(), t0 + k * BEAT, 0.55)
                    else:
                        put(mix, clap(), t0 + k * BEAT, 0.25)
                for k in range(8):
                    put(mix, shaker(), t0 + k * BEAT / 2 + BEAT / 4, 0.5)
    n = int(total * SR)
    tail = mix[n:]
    mix = mix[:n]
    mix[:len(tail)] += tail                                       # bucle sin cortes
    mix = np.tanh(mix * 1.2)                                      # compresión suave
    mix = mix / np.abs(mix).max() * 0.6
    stereo = np.stack([mix, np.roll(mix, int(0.009 * SR))], axis=1).astype(np.float32)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-b:a", "128k", out], input=stereo.tobytes(), check=True)
    print("ok", out, f"{total:.1f}s")


if __name__ == "__main__":
    main(sys.argv[1])

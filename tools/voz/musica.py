"""Compone una música de fondo ambiental, suave y en bucle (libre de derechos: generada aquí).

Progresión Cmaj9 – Am9 – Fmaj7 – G6 con colchón de cuerdas sintéticas y un arpegio tenue.
Uso: python musica.py salida.mp3
"""
import subprocess, sys
import numpy as np

SR = 44100
BPM = 80
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [  # notas MIDI
    [48, 55, 59, 62, 64],   # Cmaj9
    [45, 52, 55, 59, 60],   # Am9
    [41, 48, 52, 55, 57],   # Fmaj7 (add9)
    [43, 50, 55, 59, 64],   # G6
]
REPEATS = 2                  # 8 compases ≈ 24 s
hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def pad(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    tone = sum(np.sin(2 * np.pi * freq * d * t + p) for d, p in [(1, 0), (1.003, 1.1), (0.997, 2.3)]) / 3
    tone += 0.25 * np.sin(2 * np.pi * freq * 2 * t)          # octava suave
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)  # ataque y caída lentos
    return tone * env


def pluck(freq, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * np.exp(-t * 3.2)


def main(out):
    total = len(CHORDS) * REPEATS * BAR
    mix = np.zeros(int((total + 3) * SR))
    for r in range(REPEATS):
        for c, notes in enumerate(CHORDS):
            t0 = (r * len(CHORDS) + c) * BAR
            i0 = int(t0 * SR)
            for n in notes:
                p = pad(hz(n), BAR + 1.0) * (0.55 if n < 50 else 0.35)
                mix[i0:i0 + len(p)] += p
            arp = [notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[4] + 12]
            for k in range(8):                                    # corcheas
                pk = pluck(hz(arp[k % 4])) * 0.18
                j = i0 + int(k * BEAT / 2 * SR)
                mix[j:j + len(pk)] += pk
    # bucle perfecto: la cola se suma al inicio
    n = int(total * SR)
    tail = mix[n:]
    mix = mix[:n]
    mix[:len(tail)] += tail
    # suavizado (paso bajo simple) y normalización a un nivel discreto
    k = np.ones(9) / 9
    mix = np.convolve(mix, k, mode="same")
    mix = mix / np.abs(mix).max() * 0.5
    stereo = np.stack([mix, np.roll(mix, int(0.012 * SR))], axis=1).astype(np.float32)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-b:a", "96k", out], input=stereo.tobytes(), check=True)
    print("ok", out, f"{total:.1f}s")


if __name__ == "__main__":
    main(sys.argv[1])

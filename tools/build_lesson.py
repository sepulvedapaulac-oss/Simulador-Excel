#!/usr/bin/env python3
"""Construye una lección SCORM 1.2 a partir de src/<modulo>/<leccion>/.

Archivos de la lección:
  lesson.json   metadatos, narración, video, comprobación y datos de componentes
  content.html  pantallas (<section class="slide" ...>)
  lesson.js     (opcional) ganchos propios: Object.assign(window.LESSON, {...})

Uso:  python3 tools/build_lesson.py src/modulo1/leccion-1-1 [--voice edge|pocket]
Salida: dist/<modulo>/<leccion>/ y dist/<Leccion_X_Y>_SCORM12.zip
"""
import argparse, hashlib, html, json, os, re, shutil, subprocess, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
CACHE = ROOT / ".cache" / "tts"
EDGE_VOICE = "es-CL-CatalinaNeural"


def tag(engine):
    """Versión de la voz en la clave de caché: cambiarla obliga a regenerar."""
    return "chatterbox-v3-neutra-viva" if engine == "chatterbox" else engine


def tts(text, out, engine):
    """Genera un MP3 con la voz elegida (con caché por texto y motor)."""
    CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(f"{tag(engine)}|{EDGE_VOICE}|{text}".encode()).hexdigest()
    cached = CACHE / f"{key}.mp3"
    if not cached.exists():
        if engine == "edge":
            env = dict(os.environ, SSL_CERT_FILE="/root/.ccr/ca-bundle.crt")
            cmd = ["edge-tts", "--voice", EDGE_VOICE, "--rate=-4%", "--text", text, "--write-media", str(cached)]
            if os.environ.get("HTTPS_PROXY"):
                cmd[1:1] = ["--proxy", os.environ["HTTPS_PROXY"]]
            subprocess.run(cmd, check=True, env=env, capture_output=True)
        elif engine == "pocket":
            wav = cached.with_suffix(".wav")
            subprocess.run([os.environ.get("POCKET_TTS", "pocket-tts"), "generate", "--language",
                            os.environ.get("POCKET_LANG", "spanish_24l"), "--text", text,
                            "--output-path", str(wav)] + (["--voice", os.environ["POCKET_VOICE"]] if os.environ.get("POCKET_VOICE") else []),
                           check=True, capture_output=True)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "64k", str(cached)], check=True)
            wav.unlink(missing_ok=True)
        elif engine == "chatterbox":
            sys.exit(f"Falta pregenerar con Chatterbox: {text[:60]}…")
        else:
            sys.exit(f"Motor de voz desconocido: {engine}")
    shutil.copy(cached, out)


def cache_path(text, engine):
    return CACHE / (hashlib.sha1(f"{tag(engine)}|{EDGE_VOICE}|{text}".encode()).hexdigest() + ".mp3")


def pregenerate_chatterbox(texts):
    """Genera en un solo proceso todos los textos que aún no están en caché."""
    CACHE.mkdir(parents=True, exist_ok=True)
    todo = [t for t in dict.fromkeys(texts) if not cache_path(t, "chatterbox").exists()]
    if not todo:
        return
    jobs = [{"text": t, "out": str(cache_path(t, "chatterbox").with_suffix(".wav"))} for t in todo]
    jf = CACHE / "jobs.json"
    jf.write_text(json.dumps(jobs, ensure_ascii=False), encoding="utf-8")
    print(f"Chatterbox: generando {len(jobs)} audios…", flush=True)
    subprocess.run([os.environ.get("CBX_PYTHON", "/tmp/cbx2/bin/python"), str(TOOLS / "voz" / "cbx_batch.py"), str(jf)], check=True)
    for j in jobs:
        wav = Path(j["out"])
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "80k", str(wav.with_suffix(".mp3"))], check=True)
        wav.unlink(missing_ok=True)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def mmss(sec):
    s = round(sec)
    return f"{s // 60}:{s % 60:02d}"


TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>{title_full}</title>
<style>
{css}
</style>
</head>
<body>

<main class="app">
<div class="topbar">
  <div class="topbar-row"><span class="course">{course_label}</span><span style="display:inline-flex;gap:14px;align-items:center;flex-wrap:wrap">{autonarr}<span id="counter">Pantalla 1</span></span></div>
  <div class="progress"><span id="progressBar"></span></div>
</div>
<button class="route-btn" id="routeBtn" type="button" aria-expanded="false" aria-controls="topicPanel">☰ Ruta de la lección · <span id="routeNow">Inicio</span></button>
<aside aria-label="Ruta de la lección" class="topic-panel" id="topicPanel">
  <h3>Ruta de la lección</h3>
  <p class="mode" id="navMode">Avanza completando cada actividad</p>
  <div class="topic-list" id="topicList"></div>
</aside>

{content}
</main>

<nav aria-label="Navegación" class="bottom-nav"><div class="inner">
  <button class="nav-btn prev" id="prevBtn" type="button">← Anterior</button><span class="gate-msg" id="gateMsg"></span><button class="nav-btn next" id="nextBtn" type="button">Siguiente →</button>
</div></nav>

<script>
window.LESSON={lesson_json};
</script>
<script>
{lesson_js}
</script>
<script>
{engine}
</script>
</body>
</html>
"""

MANIFEST = """<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{ident}" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="ORG-{ident}"><organization identifier="ORG-{ident}"><title>{title}</title>
    <item identifier="ITEM-{ident}" identifierref="RES-{ident}" isvisible="true"><title>{title}</title><adlcp:masteryscore>{mastery}</adlcp:masteryscore></item></organization></organizations>
  <resources><resource identifier="RES-{ident}" type="webcontent" adlcp:scormtype="sco" href="index.html">
{files}
  </resource></resources>
</manifest>
"""


def build(src: Path, engine: str):
    meta = json.loads((src / "lesson.json").read_text(encoding="utf-8"))
    content = (src / "content.html").read_text(encoding="utf-8")
    lesson_js = (src / "lesson.js").read_text(encoding="utf-8") if (src / "lesson.js").exists() else ""
    rel = src.relative_to(ROOT / "src")
    out = ROOT / "dist" / rel
    if out.exists():
        shutil.rmtree(out)
    (out / "audio").mkdir(parents=True)
    (out / "img").mkdir()

    voice = bool(meta.get("voice"))
    audio = {}
    if voice and engine == "chatterbox":
        texts = list(meta.get("narration", {}).values())
        if meta.get("video", {}).get("voice"):
            texts += [" ".join(sc["lines"]) for sc in meta["video"]["scenes"]]
        pregenerate_chatterbox(texts)
    if voice:
        for key, text in meta.get("narration", {}).items():
            f = out / "audio" / f"{key}.mp3"
            tts(text, f, engine)
            audio[key] = f"audio/{key}.mp3"
            d = mmss(duration(f))
            content = re.sub(rf'data-audio="{re.escape(key)}"', f'data-audio="{key}" data-dur="{d}"', content)
        video = meta.get("video")
        if video and video.get("voice"):
            durs = []
            for i, sc in enumerate(video["scenes"], 1):
                f = out / "audio" / f"video_{i}.mp3"
                tts(" ".join(sc["lines"]), f, engine)
                audio[f"video_{i}"] = f"audio/video_{i}.mp3"
                durs.append(round(duration(f), 2))
            video["durs"] = durs
    else:
        # Sin narración: se quitan los atributos de audio para que no aparezcan botones
        content = re.sub(r'\sdata-audio="[^"]*"', "", content)
    music = None
    if meta.get("video") and meta.get("music", True):
        shutil.copy(TOOLS / "assets" / "musica_fondo.mp3", out / "audio" / "musica_fondo.mp3")
        music = "audio/musica_fondo.mp3"
    if not any((out / "audio").iterdir()):
        (out / "audio").rmdir()

    for img in sorted(set(re.findall(r'img/([\w.-]+\.(?:jpg|png|webp|svg))', content))):
        shutil.copy(ROOT / "src" / "img" / img, out / "img" / img)
    if not any((out / "img").iterdir()):
        (out / "img").rmdir()

    lesson = {k: v for k, v in meta.items() if k not in ("narration", "title", "course_label", "ident", "zip_name")}
    lesson["audio"] = audio
    lesson["music"] = music
    autonarr = ('<label class="autonarr"><input type="checkbox" id="autoNarr" checked/> Narración automática</label>'
                if voice else '<span class="autonarr" title="Esta lección no tiene narración">🔇 Lección sin narración</span>')
    page = TEMPLATE.format(
        title_full=html.escape(meta["title"]), course_label=meta["course_label"], autonarr=autonarr,
        css=(TOOLS / "base.css").read_text(encoding="utf-8"), content=content,
        lesson_json=json.dumps(lesson, ensure_ascii=False), lesson_js=lesson_js,
        engine=(TOOLS / "engine.js").read_text(encoding="utf-8"))
    (out / "index.html").write_text(page, encoding="utf-8")

    files = sorted(p.relative_to(out).as_posix() for p in out.rglob("*") if p.is_file())
    (out / "imsmanifest.xml").write_text(MANIFEST.format(
        ident=meta["ident"], title=html.escape(meta["title"]), mastery=int(meta.get("pass", 0.8) * 100),
        files="\n".join(f'      <file href="{f}"/>' for f in files)), encoding="utf-8")

    zpath = ROOT / "dist" / f"{meta['zip_name']}_SCORM12.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(out.rglob("*")):
            if p.is_file():
                z.write(p, p.relative_to(out).as_posix())
    print(f"OK {zpath.relative_to(ROOT)} ({zpath.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src", nargs="+")
    ap.add_argument("--voice", default=os.environ.get("VOICE_ENGINE", "chatterbox"), choices=["chatterbox", "edge", "pocket"])
    a = ap.parse_args()
    for s in a.src:
        build((ROOT / s).resolve(), a.voice)

#!/usr/bin/env python3
"""Genera el video MP4 de presentación de un módulo (1920×1080, voz del curso, sin música) y sus subtítulos .vtt.

Uso: python3 tools/build_video.py src/modulo1/video.py
El archivo .py define:
  MODULE = "Módulo 1 · ..."   FILE = "M1_Video_presentacion"   (sin extensión)
  SCENES = [{"kicker","title","points":[...] (aparecen de a uno),"img" (src/img, opcional),"say": "narración"}]
Las viñetas aparecen sincronizadas con las frases de la narración.
Salida: dist/<modulo>/<FILE>.mp4 y dist/<modulo>/<FILE>.vtt
"""
import base64, html, json, re, runpy, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build_lesson import pregenerate_chatterbox, cache_path, duration  # noqa: E402

NODE_PW = "/opt/node22/lib/node_modules/playwright"
GAP = 0.6  # silencio al final de cada escena

CSS = """
*{box-sizing:border-box;margin:0}
body{width:1920px;height:1080px;overflow:hidden;font-family:"Segoe UI",Roboto,"Noto Sans",Arial,sans-serif;color:#eaf7f6;
 background:radial-gradient(circle at 85% 0%,rgba(43,194,177,.28),transparent 45%),linear-gradient(150deg,#10303c 0%,#173f4e 60%,#0f5560 100%)}
.brand{position:absolute;top:56px;left:110px;font-size:22px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#7fe0d8}
.mod{position:absolute;top:50px;right:110px;font-size:22px;font-weight:700;color:#cff3ef;border:1px solid rgba(127,224,216,.5);background:rgba(43,194,177,.15);border-radius:999px;padding:8px 22px}
.wrap{position:absolute;inset:150px 110px 120px;display:grid;grid-template-columns:1fr;gap:70px;align-items:center}
.wrap.img{grid-template-columns:1.15fr .85fr}
.kicker{display:inline-block;font-size:26px;font-weight:800;color:#06181c;background:linear-gradient(90deg,#3cc2c0,#2bc2b1);border-radius:999px;padding:8px 24px;margin-bottom:28px}
h1{font-size:76px;line-height:1.06;font-weight:850;letter-spacing:-.01em;margin-bottom:34px;text-wrap:balance}
.big h1{font-size:96px}
ul{list-style:none;padding:0;display:grid;gap:20px}
li{font-size:36px;line-height:1.3;background:rgba(255,255,255,.07);border:1px solid rgba(159,195,200,.28);border-radius:22px;padding:20px 28px 20px 84px;position:relative}
li::before{content:"✓";position:absolute;left:26px;top:22px;width:38px;height:38px;border-radius:50%;background:#2bc2b1;color:#06181c;font-weight:900;font-size:22px;display:grid;place-items:center}
li.off{visibility:hidden}
li b{color:#ffc56b}
.photo{width:100%;aspect-ratio:4/3;border-radius:36px;background-size:cover;background-position:center;border:2px solid rgba(127,224,216,.35);box-shadow:0 40px 80px rgba(0,0,0,.35)}
.bar{position:absolute;left:110px;right:110px;bottom:64px;height:6px;border-radius:9px;background:rgba(159,195,200,.2)}
.bar span{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#3cc2c0,#2bc2b1)}
"""


def scene_html(s, k, n, module, shown):
    img = ""
    if s.get("img"):
        b64 = base64.b64encode((ROOT / "src" / "img" / s["img"]).read_bytes()).decode()
        img = f'<div class="photo" style="background-image:url(data:image/jpeg;base64,{b64})"></div>'
    pts = "".join(f'<li class="{"" if i < shown else "off"}">{p}</li>' for i, p in enumerate(s.get("points", [])))
    return f"""<!doctype html><html><head><meta charset="utf-8"/><style>{CSS}</style></head><body class="{'big' if s.get('big') else ''}">
<div class="brand">IA aplicada a la gestión de remuneraciones</div><div class="mod">{html.escape(module.split(' · ')[0])}</div>
<div class="wrap{' img' if img else ''}"><div><span class="kicker">{s['kicker']}</span><h1>{s['title']}</h1>{f'<ul>{pts}</ul>' if pts else ''}</div>{img}</div>
<div class="bar"><span style="width:{(k + 1) / n * 100:.1f}%"></span></div></body></html>"""


def sentences(t):
    return [p for p in re.split(r'(?<=[.!?:;])\s+', t.strip()) if p]


def ts(sec):
    h, r = divmod(sec, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"


def main(src):
    src = (ROOT / src).resolve()
    d = runpy.run_path(str(src))
    scenes, module = d["SCENES"], d["MODULE"]
    out_dir = ROOT / "dist" / src.parent.relative_to(ROOT / "src")
    out_dir.mkdir(parents=True, exist_ok=True)
    pregenerate_chatterbox([s["say"] for s in scenes])
    tmp = Path(tempfile.mkdtemp(prefix="vid_"))
    # 1) capturas: un estado por cada viñeta revelada
    shots = []
    for k, s in enumerate(scenes):
        npts = len(s.get("points", []))
        for st in range(npts + 1):
            f = tmp / f"s{k:02d}_{st}.html"
            f.write_text(scene_html(s, k, len(scenes), module, st), encoding="utf-8")
            shots.append((str(f), str(f.with_suffix(".png"))))
    js = f"""const {{chromium}}=require('{NODE_PW}');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1920,height:1080}}}});
for(const [h,o] of {json.dumps(shots)}){{await p.goto('file://'+h);await p.screenshot({{path:o}})}}await b.close()}})();"""
    subprocess.run(["node", "-e", js], check=True)
    # 2) segmentos por escena, sincronizando viñetas con frases
    segs, vtt, t0 = [], ["WEBVTT", ""], 0.0
    for k, s in enumerate(scenes):
        audio = cache_path(s["say"], "chatterbox")
        dur = duration(audio)
        total = dur + GAP
        sents = sentences(s["say"])
        chars = [len(x) for x in sents]
        bounds, acc = [], 0
        for c in chars:
            bounds.append((acc / sum(chars) * dur, (acc + c) / sum(chars) * dur))
            acc += c
        for (a, b), text in zip(bounds, sents):
            vtt += [f"{ts(t0 + a)} --> {ts(t0 + b)}", text, ""]
        npts = len(s.get("points", []))
        # la viñeta i aparece al comenzar la frase i+1 (la primera frase presenta el título)
        starts = [0.0] + [bounds[min(i + 1, len(bounds) - 1)][0] if i + 1 < len(bounds) else dur * (i + 1) / (npts + 1) for i in range(npts)]
        starts = [min(x, total - 0.2) for x in starts]
        lst = tmp / f"s{k:02d}.txt"
        lines = []
        for st in range(npts + 1):
            end = starts[st + 1] if st < npts else total
            lines += [f"file '{tmp}/s{k:02d}_{st}.png'", f"duration {max(end - starts[st], 0.04):.3f}"]
        lines.append(f"file '{tmp}/s{k:02d}_{npts}.png'")
        lst.write_text("\n".join(lines) + "\n")
        seg = tmp / f"seg{k:02d}.mp4"
        fo = max(total - 0.35, 0)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-i", str(audio),
                        "-filter_complex", f"[0:v]fps=30,format=yuv420p,fade=t=in:st=0:d=0.35,fade=t=out:st={fo:.2f}:d=0.35[v];[1:a]aresample=48000,apad=pad_dur={GAP}[a]",
                        "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                        "-c:a", "aac", "-b:a", "128k", "-ac", "1", str(seg)], check=True)
        segs.append(seg)
        t0 += duration(seg)
    cl = tmp / "all.txt"
    cl.write_text("".join(f"file '{p}'\n" for p in segs))
    mp4 = out_dir / f"{d['FILE']}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(cl), "-c", "copy", "-movflags", "+faststart", str(mp4)], check=True)
    (out_dir / f"{d['FILE']}.vtt").write_text("\n".join(vtt), encoding="utf-8")
    print(f"OK {mp4.relative_to(ROOT)} · {duration(mp4):.0f} s · {mp4.stat().st_size // 1024 // 1024} MB (+ .vtt)")


if __name__ == "__main__":
    main(sys.argv[1])

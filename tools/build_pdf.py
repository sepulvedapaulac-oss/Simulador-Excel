#!/usr/bin/env python3
"""Genera los PDF de apoyo de un módulo a partir de fragmentos HTML (impresión con Chromium).

Uso: python3 tools/build_pdf.py src/modulo1/pdf/guia.html [otro.html ...]
Cada fragmento empieza con un comentario de metadatos en JSON:
  <!--{"title": "...", "subtitle": "...", "module": "Módulo 1 · ...", "file": "M1_Guia_IA_generativa.pdf", "img": "i11_hero.jpg"}-->
Salida: dist/<modulo>/<file>  (A4, portada, encabezado y número de página)
"""
import base64, html, json, re, subprocess, sys
from pypdf import PdfReader, PdfWriter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NODE_PW = "/opt/node22/lib/node_modules/playwright"

CSS = r"""
@page{size:A4;margin:22mm 18mm 20mm}
:root{--teal:#0f7a82;--teal2:#2bc2b1;--navy:#173f4e;--ink:#172431;--muted:#5f7180;--line:#c9d6dc;--mint:#eaf7f6;--mint-line:#a9dbd7;
 --amber:#c97d0e;--amber-ink:#9a5e04;--story:#fff8ed;--story-line:#eed4aa;--good:#166534;--good-soft:#edf9ef;--bad:#9e1c40;--bad-soft:#fff0f4;--violet:#6c3dd1;--violet-soft:#f2ecff}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:"Segoe UI",Roboto,"Noto Sans",Arial,sans-serif;color:var(--ink);font-size:10.5pt;line-height:1.5}
.cover{height:297mm;width:210mm;margin:0;position:relative;overflow:hidden;background:linear-gradient(160deg,#10303c 0%,#173f4e 55%,#0f7a82 100%);color:#fff;page-break-after:always;display:flex;flex-direction:column}
.cover .img{height:118mm;background-size:cover;background-position:center;position:relative}
.cover .img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(16,48,60,0) 40%,#10303c 100%)}
.cover .txt{padding:10mm 18mm 0;flex:1;display:flex;flex-direction:column}
.cover .course{font-size:9.5pt;letter-spacing:.14em;text-transform:uppercase;color:#7fe0d8;font-weight:800}
.cover .mod{display:inline-block;margin-top:6mm;align-self:flex-start;background:rgba(43,194,177,.18);border:1px solid rgba(127,224,216,.5);border-radius:999px;padding:3px 12px;font-size:9.5pt;font-weight:700;color:#cff3ef}
.cover h1{font-size:30pt;line-height:1.08;margin:6mm 0 4mm;font-weight:850}
.cover .sub{font-size:13pt;color:#cfe6ea;max-width:150mm}
.cover .foot{margin-top:auto;padding:0 0 14mm;font-size:9pt;color:#9fc3c8;display:flex;justify-content:space-between;border-top:1px solid rgba(159,195,200,.3);padding-top:5mm}
.cover .bar{height:5px;width:46mm;background:linear-gradient(90deg,var(--teal2),#7fe0d8);border-radius:9px;margin-top:6mm}
h2{font-size:17pt;color:var(--navy);margin:0 0 3mm;padding-top:2mm;break-after:avoid}
h2 .n{display:inline-block;min-width:9mm;height:9mm;line-height:9mm;text-align:center;border-radius:50%;background:var(--teal);color:#fff;font-size:11pt;margin-right:3mm;vertical-align:3px}
h3{font-size:12pt;color:var(--teal);margin:5mm 0 2mm;break-after:avoid}
p{margin:0 0 3mm}
section{margin-bottom:7mm}
section.page{break-before:page}
ul,ol{margin:0 0 3mm;padding-left:6mm}
li{margin-bottom:1.2mm}
.lead{font-size:11.5pt;color:#28404e}
.box{border-radius:4mm;padding:4mm 5mm;margin:3mm 0 4mm;break-inside:avoid}
.box.key{background:var(--story);border:1px solid var(--story-line);border-left:5px solid var(--amber)}
.box.key b:first-child{color:var(--amber-ink)}
.box.info{background:var(--mint);border:1px solid var(--mint-line)}
.box.warn{background:var(--bad-soft);border:1px solid #e6a1b2;border-left:5px solid var(--bad)}
.box.ok{background:var(--good-soft);border:1px solid #8dcf9d;border-left:5px solid var(--good)}
.box.prompt{background:#f6f8fa;border:1px dashed var(--line);font-family:"Cascadia Mono",Consolas,"DejaVu Sans Mono",monospace;font-size:9.2pt;white-space:pre-wrap}
table{width:100%;border-collapse:collapse;margin:2mm 0 4mm;font-size:9.6pt;break-inside:auto}
th{background:var(--navy);color:#fff;text-align:left;padding:2.2mm 2.6mm;font-weight:700}
td{border-bottom:1px solid var(--line);padding:2.2mm 2.6mm;vertical-align:top}
tr{break-inside:avoid}
tbody tr:nth-child(even) td{background:#f4f8f9}
.tag{display:inline-block;border-radius:999px;padding:.4mm 2.4mm;font-size:8.4pt;font-weight:800}
.tag.g{background:var(--good-soft);color:var(--good)}.tag.a{background:#fff2dc;color:var(--amber-ink)}.tag.r{background:var(--bad-soft);color:var(--bad)}.tag.v{background:var(--violet-soft);color:var(--violet)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.card{border:1px solid var(--line);border-radius:4mm;padding:3.5mm 4.5mm;break-inside:avoid}
.card h4{margin:0 0 1.5mm;color:var(--navy);font-size:10.8pt}
.check{list-style:none;padding:0}
.check li{position:relative;padding:2mm 0 2mm 9mm;border-bottom:1px solid #e3eaed;break-inside:avoid}
.check li::before{content:"";position:absolute;left:0;top:2.4mm;width:4.6mm;height:4.6mm;border:1.6px solid var(--teal);border-radius:1.2mm;background:#fff}
.check li small{display:block;color:var(--muted);font-size:8.8pt}
.sign{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6mm;margin-top:8mm}
.sign div{border-top:1px solid var(--muted);padding-top:1.5mm;font-size:8.8pt;color:var(--muted)}
.src{font-size:8.6pt;color:var(--muted)}
.toc{list-style:none;padding:0;counter-reset:t}
.toc li{display:flex;gap:3mm;padding:2mm 0;border-bottom:1px dotted var(--line)}
.toc li::before{counter-increment:t;content:counter(t);color:var(--teal);font-weight:800;min-width:5mm}
"""


def build(frag: Path):
    raw = frag.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(\{.*?\})-->", raw, re.S)
    meta = json.loads(m.group(1))
    body = raw[m.end():]
    img = ""
    if meta.get("img"):
        b64 = base64.b64encode((ROOT / "src" / "img" / meta["img"]).read_bytes()).decode()
        img = f'<div class="img" style="background-image:url(data:image/jpeg;base64,{b64})"></div>'
    head_html = f'<!doctype html><html lang="es"><head><meta charset="utf-8"/><title>{html.escape(meta["title"])}</title><style>{CSS}</style></head><body>'
    cover = f"""{head_html}<style>@page{{margin:0}}</style>
<div class="cover">{img}<div class="txt"><div class="course">IA aplicada a la gestión de remuneraciones</div><span class="mod">{html.escape(meta['module'])}</span>
<h1>{meta['title']}</h1><div class="sub">{meta.get('subtitle', '')}</div><div class="bar"></div>
<div class="foot"><span>Material de apoyo del curso · Uso formativo</span><span>{html.escape(meta.get('kind', 'Guía'))}</span></div></div></div></body></html>"""
    doc = f"{head_html}{body}</body></html>"
    rel = frag.parent.parent.relative_to(ROOT / "src")
    out = ROOT / "dist" / rel / meta["file"]
    out.parent.mkdir(parents=True, exist_ok=True)
    tc, tb = out.with_suffix(".cover.html"), out.with_suffix(".body.html")
    pc, pb = out.with_suffix(".cover.pdf"), out.with_suffix(".body.pdf")
    tc.write_text(cover, encoding="utf-8"); tb.write_text(doc, encoding="utf-8")
    head = f'<div style="font-size:7.5pt;color:#5f7180;width:100%;padding:0 18mm;display:flex;justify-content:space-between;font-family:Segoe UI,Arial"><span>{html.escape(meta.get("short", meta["title"]))}</span><span>{html.escape(meta["module"].split(" · ")[0])}</span></div>'
    foot = '<div style="font-size:7.5pt;color:#5f7180;width:100%;padding:0 18mm;text-align:right;font-family:Segoe UI,Arial">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'
    js = f"""
const {{chromium}}=require('{NODE_PW}');
(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{tc}');await p.pdf({{path:'{pc}',format:'A4',printBackground:true,preferCSSPageSize:true}});
await p.goto('file://{tb}');await p.waitForTimeout(200);
await p.pdf({{path:'{pb}',format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,
headerTemplate:{json.dumps(head)},footerTemplate:{json.dumps(foot)}}});await b.close()}})();"""
    subprocess.run(["node", "-e", js], check=True)
    w = PdfWriter()
    for f in (pc, pb):
        for pg in PdfReader(str(f)).pages:
            w.add_page(pg)
    w.add_metadata({"/Title": re.sub("<[^>]+>", "", meta["title"]), "/Author": "Curso IA aplicada a la gestión de remuneraciones"})
    with open(out, "wb") as fh:
        w.write(fh)
    pages = len(w.pages)
    for f in (tc, tb, pc, pb):
        f.unlink()
    print(f"OK {out.relative_to(ROOT)} · {pages} páginas · {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    for f in sys.argv[1:]:
        build((ROOT / f).resolve())

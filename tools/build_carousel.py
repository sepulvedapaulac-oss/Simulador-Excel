#!/usr/bin/env python3
"""Genera el resumen y el glosario tipo carrusel (HTML autocontenido) de un módulo.

Uso: python3 tools/build_carousel.py src/modulo1/carruseles.py
El archivo .py define:
  MODULE  = "Módulo 1 · Fundamentos de IA en remuneraciones"
  SLUG    = "Modulo1"
  RESUMEN = [{"kicker","title","body"(html),"points":[...],"key"(frase clave),"img"(opcional, en src/img)}]
  GLOSARIO = [{"term","def","ex"(ejemplo en remuneraciones),"tag"(lección)}]
Salida: dist/<modulo>/Resumen_<SLUG>.html y dist/<modulo>/Glosario_<SLUG>.html
Los colores y temas usan los mismos tokens de tools/base.css (claro/oscuro).
"""
import base64, html, json, runpy, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"


def tokens():
    css = (TOOLS / "base.css").read_text(encoding="utf-8")
    start = css.index(":root{")
    return css[start:css.index("*{box-sizing")]


CSS = r"""
*{box-sizing:border-box}
body{margin:0;font-family:var(--font);background:linear-gradient(180deg,var(--bg2),var(--bg)) fixed;background-color:var(--bg);color:var(--ink);line-height:1.5;overflow-x:hidden}
button{font:inherit;color:inherit}
button:focus-visible,input:focus-visible{outline:3px solid var(--teal2);outline-offset:2px}
.wrap{max-width:980px;margin:auto;padding:14px 16px 28px}
.top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:.82rem;font-weight:850;color:var(--muted)}
.top .course{color:var(--teal);letter-spacing:.04em;text-transform:uppercase}
.theme{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 12px;cursor:pointer;font-weight:800;font-size:.8rem}
h1{font-size:clamp(1.5rem,3.6vw,2.3rem);line-height:1.15;margin:.6rem 0 .2rem;text-wrap:balance}
.sub{color:var(--muted);margin:0 0 12px}
.bar{height:8px;background:var(--track);border-radius:999px;overflow:hidden;margin:6px 0 14px}
.bar span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--teal2));transition:width .3s ease}
.viewport{overflow:hidden;border-radius:28px;touch-action:pan-y}
.track{display:flex;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.card{flex:0 0 100%;min-width:0;background:var(--surface);border:1px solid var(--line);border-radius:28px;box-shadow:var(--shadow);padding:clamp(18px,3.5vw,34px);min-height:440px;display:flex;flex-direction:column}
.card .kicker{display:inline-block;align-self:flex-start;background:var(--mint);color:var(--teal-ink);border:1px solid var(--mint-line);border-radius:999px;padding:4px 12px;font-size:.78rem;font-weight:850;letter-spacing:.03em}
.card h2{font-size:clamp(1.3rem,2.8vw,1.9rem);line-height:1.18;margin:.7rem 0 .6rem;text-wrap:balance}
.card p{margin:.3rem 0 .9rem;max-width:70ch}
.cols{display:grid;gap:18px;grid-template-columns:1fr}
@media(min-width:760px){.cols.has-img{grid-template-columns:1.25fr 1fr;align-items:start}}
.cols img{width:100%;border-radius:20px;border:1px solid var(--line);aspect-ratio:4/3;object-fit:cover}
.points{list-style:none;margin:4px 0 12px;padding:0;display:grid;gap:8px}
.points li{background:var(--surface2);border:1px solid var(--line2);border-radius:14px;padding:9px 12px 9px 38px;position:relative}
.points li::before{content:"✓";position:absolute;left:12px;top:9px;width:18px;height:18px;border-radius:50%;background:var(--teal);color:var(--on-accent);font-size:.7rem;font-weight:900;display:grid;place-items:center}
.key{margin-top:auto;background:var(--story-bg);border:1px solid var(--story-line);border-left:6px solid var(--amber);border-radius:16px;padding:12px 14px;font-weight:700}
.key b{color:var(--amber-ink)}
.nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px}
.nav button.arrow{border:0;background:linear-gradient(90deg,var(--teal),var(--teal2));color:var(--on-accent);border-radius:999px;padding:11px 18px;font-weight:850;cursor:pointer;min-width:118px}
.nav button.arrow:disabled{opacity:.35;cursor:default}
.dots{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.dots button{width:11px;height:11px;border-radius:50%;border:0;background:var(--track);cursor:pointer;padding:0}
.dots button.on{background:var(--teal);width:26px;border-radius:999px}
.count{text-align:center;font-size:.82rem;color:var(--muted);font-weight:800;margin-top:6px}
.foot{font-size:.78rem;color:var(--muted);margin-top:16px;text-align:center}
/* Glosario */
.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.search{flex:1 1 220px;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:10px 16px;font:inherit}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chips button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 12px;font-size:.8rem;font-weight:800;cursor:pointer}
.chips button.on{background:var(--teal);color:var(--on-accent);border-color:var(--teal)}
.flip{perspective:1400px;flex:0 0 100%;min-width:0}
.flip .inner{position:relative;min-height:400px;transition:transform .6s;transform-style:preserve-3d;cursor:pointer}
.flip.turned .inner{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:var(--surface);border:1px solid var(--line);border-radius:28px;box-shadow:var(--shadow);padding:clamp(20px,4vw,40px);display:flex;flex-direction:column}
.face.front{align-items:center;justify-content:center;text-align:center;background:radial-gradient(circle at 20% 10%,color-mix(in srgb,var(--teal2) 18%,transparent),transparent 55%),var(--surface)}
.face.front .term{font-size:clamp(1.7rem,4.6vw,2.8rem);font-weight:900;color:var(--navy);line-height:1.1;text-wrap:balance}
.face.front .hint{margin-top:18px;font-size:.85rem;color:var(--muted);font-weight:700}
.face.back{transform:rotateY(180deg);overflow:auto}
.face.back h2{margin:.5rem 0 .4rem;color:var(--navy);font-size:clamp(1.25rem,2.6vw,1.7rem)}
.face .tag{align-self:flex-start;background:var(--violet-soft);color:var(--violet);border-radius:999px;padding:3px 10px;font-size:.75rem;font-weight:850}
.face.front .tag{align-self:center;margin-bottom:14px}
.ex{margin-top:auto;background:var(--callout-bg);border:1px solid var(--callout-line);border-radius:16px;padding:12px 14px}
.ex b{color:var(--teal-ink)}
.empty{background:var(--surface);border:1px dashed var(--line);border-radius:28px;padding:40px;text-align:center;color:var(--muted)}
@media(max-width:560px){.card,.flip .inner{min-height:480px}.nav button.arrow{min-width:0;padding:10px 18px}.nav .lbl{display:none}.dots{display:none}.top .course{flex:1 1 60%}}
@media(prefers-reduced-motion:reduce){.track,.flip .inner{transition:none}}
"""

JS = r"""
(function(){
const root=document.documentElement,tb=document.getElementById('theme');
const setT=t=>{root.dataset.theme=t;tb.textContent=t==='dark'?'☀︎ Claro':'☾ Oscuro';try{localStorage.setItem('car-theme',t)}catch(e){}};
let saved=null;try{saved=localStorage.getItem('car-theme')}catch(e){}
setT(saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
tb.onclick=()=>setT(root.dataset.theme==='dark'?'light':'dark');
const track=document.querySelector('.track'),prev=document.getElementById('prev'),next=document.getElementById('next'),dots=document.querySelector('.dots'),count=document.querySelector('.count'),bar=document.querySelector('.bar span');
let items=[],i=0;
window.Carousel={refresh(list){items=list;i=0;draw(true)},get index(){return i}};
function draw(rebuild){
  if(rebuild){dots.innerHTML=items.map((_,k)=>`<button type="button" aria-label="Ir a la tarjeta ${k+1}"></button>`).join('');[...dots.children].forEach((b,k)=>b.onclick=()=>go(k))}
  track.style.transform=`translateX(-${i*100}%)`;
  [...dots.children].forEach((b,k)=>b.classList.toggle('on',k===i));
  items.forEach((el,k)=>{el.setAttribute('aria-hidden',k!==i);el.inert=k!==i});
  prev.disabled=i===0;next.disabled=i>=items.length-1;
  count.textContent=items.length?`${i+1} de ${items.length}`:'';
  bar.style.width=items.length?((i+1)/items.length*100)+'%':'0';
}
function go(k){if(k<0||k>=items.length)return;i=k;draw();document.querySelectorAll('.flip.turned').forEach(f=>f.classList.remove('turned'))}
prev.onclick=()=>go(i-1);next.onclick=()=>go(i+1);
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight')go(i+1);if(e.key==='ArrowLeft')go(i-1)});
let x0=null,y0=null;const vp=document.querySelector('.viewport');
vp.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
vp.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))go(i+(dx<0?1:-1));x0=null},{passive:true});
window.Carousel.refresh([...track.children]);
})();
"""

GLOSS_JS = r"""
(function(){
const DATA=__DATA__;const track=document.querySelector('.track'),q=document.getElementById('q'),chips=document.querySelector('.chips');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const tags=[...new Set(DATA.map(d=>d.tag))];let tag='';
chips.innerHTML=['<button type="button" class="on" data-t="">Todos</button>'].concat(tags.map(t=>`<button type="button" data-t="${esc(t)}">${esc(t)}</button>`)).join('');
chips.onclick=e=>{const b=e.target.closest('button');if(!b)return;tag=b.dataset.t;[...chips.children].forEach(c=>c.classList.toggle('on',c===b));render()};
q.oninput=render;
function render(){const n=norm(q.value.trim());
  const list=DATA.filter(d=>(!tag||d.tag===tag)&&(!n||norm(d.term+' '+d.def).includes(n)));
  track.innerHTML=list.length?list.map(d=>`<div class="flip"><div class="inner" role="button" tabindex="0" aria-label="${esc(d.term)}: ver definición">
    <div class="face front"><span class="tag">${esc(d.tag)}</span><div class="term">${esc(d.term)}</div><div class="hint">Toca la tarjeta para ver la definición ↻</div></div>
    <div class="face back"><span class="tag">${esc(d.tag)}</span><h2>${esc(d.term)}</h2><p>${d.def}</p>${d.ex?`<div class="ex"><b>En remuneraciones:</b> ${d.ex}</div>`:''}</div></div></div>`).join('')
    :'<div class="flip"><div class="empty">No hay términos que coincidan con tu búsqueda.</div></div>';
  track.querySelectorAll('.inner').forEach(el=>{const t=()=>el.parentElement.classList.toggle('turned');el.onclick=t;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}}});
  window.Carousel&&window.Carousel.refresh([...track.children]);}
render();
})();
"""


def page(title, module, body, extra_js=""):
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>{html.escape(title)}</title>
<style>{tokens()}{CSS}</style></head>
<body><main class="wrap">
<div class="top"><span class="course">IA aplicada a la gestión de remuneraciones</span><button class="theme" id="theme" type="button">☾ Oscuro</button></div>
{body}
<div class="nav"><button class="arrow" id="prev" type="button" aria-label="Anterior">←<span class="lbl"> Anterior</span></button><div class="dots"></div><button class="arrow" id="next" type="button" aria-label="Siguiente"><span class="lbl">Siguiente </span>→</button></div>
<div class="count"></div>
<p class="foot">{html.escape(module)} · Usa las flechas, desliza en el celular o toca los puntos para avanzar.</p>
</main>
<script>{extra_js}{JS}</script></body></html>
"""


def img_uri(name):
    p = ROOT / "src" / "img" / name
    return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode()


def resumen(d):
    cards = []
    for s in d["RESUMEN"]:
        img = f'<img src="{img_uri(s["img"])}" alt="{html.escape(s.get("alt", ""))}"/>' if s.get("img") else ""
        pts = "".join(f"<li>{p}</li>" for p in s.get("points", []))
        cards.append(f"""<article class="card"><span class="kicker">{s['kicker']}</span><h2>{s['title']}</h2>
<div class="cols{' has-img' if img else ''}"><div><p>{s.get('body', '')}</p>{f'<ul class="points">{pts}</ul>' if pts else ''}</div>{img}</div>
{f'<div class="key"><b>Idea clave:</b> {s["key"]}</div>' if s.get('key') else ''}</article>""")
    body = f"""<h1>Resumen del {html.escape(d['MODULE'].split(' · ')[0])}</h1>
<p class="sub">{html.escape(d['MODULE'])}</p><div class="bar"><span></span></div>
<div class="viewport"><div class="track">{''.join(cards)}</div></div>"""
    return page(f"Resumen {d['MODULE'].split(' · ')[0]}", d["MODULE"], body)


def glosario(d):
    data = json.dumps(d["GLOSARIO"], ensure_ascii=False)
    body = f"""<h1>Glosario del {html.escape(d['MODULE'].split(' · ')[0])}</h1>
<p class="sub">{html.escape(d['MODULE'])} · {len(d['GLOSARIO'])} términos. Gira cada tarjeta para ver la definición y un ejemplo.</p>
<div class="tools"><input class="search" id="q" type="search" placeholder="Buscar un término…" aria-label="Buscar un término"/><div class="chips"></div></div>
<div class="bar"><span></span></div>
<div class="viewport"><div class="track"></div></div>"""
    return page(f"Glosario {d['MODULE'].split(' · ')[0]}", d["MODULE"], body, GLOSS_JS.replace("__DATA__", data))


def main(src):
    src = (ROOT / src).resolve()
    d = runpy.run_path(str(src))
    out = ROOT / "dist" / src.parent.relative_to(ROOT / "src")
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in (("Resumen", resumen), ("Glosario", glosario)):
        f = out / f"{name}_{d['SLUG']}.html"
        f.write_text(fn(d), encoding="utf-8")
        print(f"OK {f.relative_to(ROOT)} · {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1])

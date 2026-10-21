#!/usr/bin/env python3
"""Genera las actividades prácticas del Módulo 1 en SCORM 1.2 a partir de los HTML originales.

Aplica correcciones puntuales (diseño responsivo, botones siempre visibles, puntaje,
reintento y registro SCORM) sin cambiar los colores ni el contenido de cada actividad.

    python3 actividades/build_act.py
"""
import html, pathlib, sys, zipfile

ROOT = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
from build import MANIFEST  # noqa: E402

DIST = ROOT.parent / 'dist'


def patch(text, pairs, name):
    for old, new in pairs:
        n = text.count(old)
        if n != 1:
            raise SystemExit(f'{name}: se esperaba 1 coincidencia y hay {n} para:\n{old[:120]}')
        text = text.replace(old, new)
    return text


# ───────────────────────── Desafío: ¿Qué equipo corresponde? ─────────────────────────
DESAFIO_CSS = '''
  /* Ajustes TLS: navegación siempre visible y diseño responsivo */
  .bottom-nav{position:sticky;bottom:0;z-index:20;padding:10px 18px calc(10px + env(safe-area-inset-bottom));
    background:rgba(242,244,250,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-top:1px solid #dfe3f2;}
  .bottom-nav .nav-row{margin-top:0;}
  .option.correct-family{border-color:var(--green);background:#eaf7ec;}
  img{max-width:100%;}
  .scenario-figure{margin:0 0 12px;}
  @media(max-width:520px){
    header.topbar{padding:10px 14px 12px;}
    .topbar-name{font-size:.95rem;}
    main{padding:12px;}
    .card{padding:16px;}
    h1{font-size:1.2rem;}
    h2{font-size:1.04rem;}
    .nav-row .btn{min-width:0;padding:11px 12px;}
    table.matrix{font-size:.78rem;}
    .bottom-nav{padding:8px 12px calc(8px + env(safe-area-inset-bottom));}
  }
</style>'''

DESAFIO = [
    ('</style>', DESAFIO_CSS),
    ('<div style="padding:0 18px 24px;">\n    <div class="nav-row">',
     '<div class="bottom-nav">\n    <div class="nav-row">'),
    # La familia ya no se corrige al seleccionarla: antes se podía cambiar hasta acertar y siempre sumaba 50 puntos.
    ('''    var val = e.target.value;
    var fb = sc.feedback[val];
    familyFeedback.className = "feedback-box show " + (fb.type === "ok" ? "ok" : (fb.type === "info" ? "info" : "bad"));
    familyFeedback.innerHTML = '<div class="feedback-title">'+fb.title+'</div><div>'+fb.text+'</div>';
    stopBanner.classList.toggle("show", val === "insuficiente" && sc.correctFamily === "insuficiente");
    stepJust''',
     '''    stepJust'''),
    ('''    if(!justChoice || riskChoices.length === 0){''',
     '''    if(!familyChoice){
      fullFeedback.className = "feedback-box show info";
      fullFeedback.innerHTML = '<div class="feedback-title">Falta completar</div><div>Selecciona una familia (Decisión 1) antes de comprobar.</div>';
      return;
    }
    if(!justChoice || riskChoices.length === 0){'''),
    ('''    Array.prototype.forEach.call(section.querySelectorAll('[data-role="family-opt"]'), function(el){
      el.classList.add("disabled");
      el.querySelector("input").disabled = true;
    });''',
     '''    Array.prototype.forEach.call(section.querySelectorAll('[data-role="family-opt"]'), function(el){
      var inp = el.querySelector("input");
      el.classList.add("disabled");
      inp.disabled = true;
      if(inp.value === sc.correctFamily) el.classList.add("correct");
      else if(inp.checked) el.classList.add("incorrect");
    });
    var fb = sc.feedback[familyChoice.value];
    familyFeedback.className = "feedback-box show " + (fb.type === "ok" ? "ok" : (fb.type === "info" ? "info" : "bad"));
    familyFeedback.innerHTML = '<div class="feedback-title">'+fb.title+'</div><div>'+fb.text+'</div>';
    stopBanner.classList.toggle("show", sc.correctFamily === "insuficiente");'''),
    ('''    familyFeedback.className = "feedback-box";
    familyFeedback.innerHTML = "";
    fullFeedback.className''',
     '''    familyFeedback.className = "feedback-box";
    familyFeedback.innerHTML = "";
    stopBanner.classList.remove("show");
    fullFeedback.className'''),
    # SCORM: no escribir después de LMSFinish y cerrar la sesión si se sale sin finalizar.
    ('var API = null;', 'var API = null;\nvar scormDone = false;'),
    ('''function saveProgress(){
  try{
    if(API){''', '''function saveProgress(){
  try{
    if(API && !scormDone){'''),
    ('''function finishChallenge(){
  try{
    if(API){''', '''function finishChallenge(){
  try{
    if(API && !scormDone){'''),
    ('''      API.LMSFinish("");
    }
  }catch(e){}
  finishBtn.textContent''', '''      API.LMSFinish("");
      scormDone = true;
    }
  }catch(e){}
  finishBtn.textContent'''),
    ('''window.addEventListener("beforeunload", function(){
  try{ if(API) API.LMSCommit(""); }catch(e){}
});''', '''function closeScorm(){
  try{ if(API && !scormDone){ saveProgress(); API.LMSCommit(""); API.LMSFinish(""); scormDone = true; } }catch(e){}
}
window.addEventListener("pagehide", closeScorm);
window.addEventListener("beforeunload", closeScorm);'''),
]

# ───────────────────────── Laboratorio: Reconoce la PEMP y sus riesgos ─────────────────────────
LAB_CSS = '''
/* Ajustes TLS: navegación siempre visible, puntos accesibles y diseño responsivo */
img{max-width:100%;}
.card > .btn-row:last-child{position:sticky;bottom:0;z-index:5;background:var(--tarjeta);
  margin:18px -24px -22px;padding:12px 24px calc(12px + env(safe-area-inset-bottom));
  border-top:1px solid var(--borde);border-radius:0 0 12px 12px;box-shadow:0 -6px 14px rgba(20,20,60,.06);}
.choice-btn:disabled{color:var(--texto);}
.hotspot{font-size:.8rem;}
.hotspot.visited{font-size:0;}
.hotspot.visited::after{font-size:.9rem;}
.hs-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
.hs-chip{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1.5px solid var(--borde);
  color:var(--azul-marino);border-radius:999px;padding:6px 12px;font-size:.8rem;font-weight:600;}
.hs-chip b{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;
  background:var(--azul-principal);color:#fff;font-size:.72rem;}
.hs-chip.visited{border-color:var(--turquesa);background:#e6f7f7;}
.hs-chip.visited b{background:var(--turquesa);}
.hs-chip.active{border-color:var(--azul-principal);box-shadow:0 0 0 2px rgba(23,22,151,.18);}
@media (max-width:600px){
  #topbar{padding:8px 12px;}
  #topbar .tb-course{display:none;}
  #topbar .tb-resource{font-size:.85rem;}
  .card > .btn-row:last-child{margin:16px -16px -16px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));}
  .btn-row .btn{flex:1 1 auto;padding:12px 14px;}
  .hotspot{width:24px;height:24px;font-size:.7rem;box-shadow:0 0 0 3px rgba(23,22,151,.18);}
  .scene-grid{grid-template-columns:1fr 1fr;gap:10px;}
  .scene-card{padding:8px;}
  .opt-btn{min-width:0;flex:1 1 100%;}
  h1{font-size:1.3rem !important;}
}
@media (max-width:380px){.scene-grid{grid-template-columns:1fr;}}
</style>'''

LAB_JS_EXTRA = '''
  /* ---------- Ajustes TLS: lista de puntos bajo cada imagen ---------- */
  crearChips(){
    document.querySelectorAll(".photo-frame").forEach(frame=>{
      const hs = frame.querySelectorAll(".hotspot");
      if(!hs.length || frame.nextElementSibling && frame.nextElementSibling.classList.contains("hs-chips")) return;
      const wrap = document.createElement("div");
      wrap.className = "hs-chips";
      hs.forEach((h,i)=>{
        h.textContent = i+1;
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "hs-chip";
        chip.innerHTML = "<b>"+(i+1)+"</b>"+h.getAttribute("aria-label").replace(/^Riesgo: (.)/,(m,c)=>c.toUpperCase());
        chip.addEventListener("click", ()=>h.click());
        h.addEventListener("click", ()=>{
          wrap.querySelectorAll(".hs-chip").forEach(c=>c.classList.remove("active"));
          chip.classList.add("active");
          setTimeout(()=>TLS.sincronizarChips(), 0);
        });
        wrap.appendChild(chip);
      });
      frame.after(wrap);
    });
  },
  sincronizarChips(){
    document.querySelectorAll(".hs-chips").forEach(wrap=>{
      const hs = wrap.previousElementSibling.querySelectorAll(".hotspot");
      wrap.querySelectorAll(".hs-chip").forEach((c,i)=>c.classList.toggle("visited", hs[i].classList.contains("visited")));
    });
  },

  /* ---------- Reintento sin recargar la página (la recarga cerraba la sesión SCORM) ---------- */
  reiniciarEstado(){
    Object.assign(TLS_STATE, {
      score:{familias:0, componentes:0, riesgos:0, responsabilidad:0},
      familiasRespondidas:0, familiasCorrectas:0,
      hotspotsTijeraVisitados:new Set(), hotspotsBrazoVisitados:new Set(),
      riesgosResueltos:{}, responsabilidadRespondidas:0, responsabilidadCorrectas:0,
      integradaRespuestas:{familia:null, componentes:new Set(), riesgo:null, decision:null},
      integradaCorrectas:0, completado:false
    });
    ESCENAS.forEach(e=>delete e.respondida);
    RESP_CASOS.forEach(c=>delete c.respondido);
    this.renderEscenas();
    this.renderResponsabilidad();
    this.renderIntegrada();
    document.querySelectorAll(".hotspot").forEach(h=>h.classList.remove("visited"));
    document.querySelectorAll(".hs-chip").forEach(c=>c.classList.remove("visited","active"));
    ["hs-panel-tijera","hs-panel-brazo","riesgo-panel","confirmacion-cierre"].forEach(id=>{ document.getElementById(id).innerHTML = ""; });
    document.getElementById("hs-progreso-tijera").textContent = "0 de 7 puntos explorados";
    document.getElementById("hs-progreso-brazo").textContent = "0 de 7 puntos explorados";
    document.getElementById("riesgos-progreso").textContent = "0 de 8 riesgos resueltos";
    [3,4,5,6,7,8].forEach(n=>{ document.getElementById("btn-continuar-"+n).disabled = true; });
    this.irAPantalla(1);
  },
'''

LAB = [
    ('</style>', LAB_CSS),
    # SCORM: no volver a "incomplete" si la actividad ya estaba completada en un intento anterior.
    ('''        if(this.initialized){
          this.api.LMSSetValue("cmi.core.lesson_status","incomplete");''',
     '''        if(this.initialized){
          const st = this.api.LMSGetValue("cmi.core.lesson_status");
          if(st !== "completed" && st !== "passed") this.api.LMSSetValue("cmi.core.lesson_status","incomplete");'''),
    ('''  finish(){
    if(this.api && this.initialized){
      try{ this.api.LMSFinish(""); }catch(e){}
    }
  }''', '''  finish(){
    if(this.api && this.initialized){
      try{ this.api.LMSCommit(""); this.api.LMSFinish(""); }catch(e){}
      this.initialized = false;
    }
  }'''),
    ('''  reintentar(){
    if(!confirm("¿Deseas reiniciar el laboratorio? Se perderá tu progreso actual.")) return;
    location.reload();
  },''', '''  reintentar(){
    if(!confirm("¿Deseas reiniciar el laboratorio? Se perderá tu progreso actual.")) return;
    this.reiniciarEstado();
  },
''' + LAB_JS_EXTRA),
    ('''    this.renderIntegrada();
    SCORM.init();
  }''', '''    this.renderIntegrada();
    this.crearChips();
    SCORM.init();
  }'''),
    ('''document.addEventListener("DOMContentLoaded", ()=>TLS.init());''',
     '''document.addEventListener("DOMContentLoaded", ()=>TLS.init());
window.addEventListener("pagehide", ()=>SCORM.finish());'''),
]

ACTIVIDADES = [
    dict(src='M1_DESAFIO_que_equipo_corresponde.html', patches=DESAFIO,
         name='Actividad_M1_Desafio_Que_equipo_corresponde', ident='TLS_PEMP_M1_DESAFIO_V2', code='M1_DESAFIO',
         title='Desafío TLS — ¿Qué equipo corresponde? (Módulo 1)'),
    dict(src='M1_LAB_reconoce_la_pemp.html', patches=LAB,
         name='Actividad_M1_Laboratorio_Reconoce_la_PEMP', ident='TLS_PEMP_M1_LAB_V2', code='M1_LAB',
         title='Laboratorio TLS — Reconoce la PEMP y sus riesgos (Módulo 1)'),
]

if __name__ == '__main__':
    DIST.mkdir(exist_ok=True)
    for a in ACTIVIDADES:
        text = (ROOT / 'orig' / a['src']).read_text(encoding='utf-8')
        out = patch(text, a['patches'], a['src'])
        (DIST / f"{a['name']}.html").write_text(out, encoding='utf-8')
        with zipfile.ZipFile(DIST / f"{a['name']}_SCORM12.zip", 'w', zipfile.ZIP_DEFLATED) as z:
            z.writestr('index.html', out)
            z.writestr('imsmanifest.xml', MANIFEST.format(ident=a['ident'], code=a['code'], title=html.escape(a['title'])))
        print(f"{a['name']}: {len(out)/1e6:.1f} MB")

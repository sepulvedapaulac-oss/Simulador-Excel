#!/usr/bin/env python3
"""Genera las actividades prácticas de los módulos en SCORM 1.2 a partir de los HTML originales.

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

# ───────────────────────── M2 Desafío: Autorizar no es marcar casillas ─────────────────────────
M2_DESAFIO_CSS = '''
/* Ajustes TLS: navegación siempre visible y diseño responsivo */
img{max-width:100%;}
.screen .nav-row{position:sticky;bottom:0;z-index:20;background:var(--white);
  margin:28px -32px -32px;padding:14px 32px calc(14px + env(safe-area-inset-bottom));
  border-top:1px solid var(--line);border-radius:0 0 var(--radius) var(--radius);box-shadow:0 -6px 14px rgba(23,22,151,.06);}
@media (max-width:600px){
  .app{padding:10px 10px 40px;}
  .topbar{flex-wrap:wrap;padding:12px 14px;border-radius:12px;position:sticky;top:6px;z-index:30;}
  .progress-wrap{min-width:0;flex:1 1 100%;}
  .screen .nav-row{margin:22px -20px -20px;padding:10px 20px calc(10px + env(safe-area-inset-bottom));}
  .nav-row .btn,.btn-row .btn{flex:1 1 auto;padding:12px 16px;}
  .option{padding:12px 14px;font-size:14.5px;}
  .score-hero .score{font-size:44px;}
}
</style>'''

M2_DESAFIO = [
    ('</style>', M2_DESAFIO_CSS),
    # SCORM: cerrar la sesión una sola vez y dejar de escribir después.
    ('''      commit();
      api.LMSFinish("");
    }catch(e){}
  }''', '''      commit();
      api.LMSFinish("");
    }catch(e){}
    found = false;
  }'''),
    # El reintento no debe devolver a "incomplete" una actividad ya completada.
    ('''  SCORM.setValue("cmi.core.lesson_status","incomplete");
  SCORM.commit();
  showScreen(0);''', '''  var st = SCORM.getValue("cmi.core.lesson_status");
  if (st !== "completed" && st !== "passed") SCORM.setValue("cmi.core.lesson_status","incomplete");
  SCORM.commit();
  showScreen(0);'''),
    # La actividad queda completada al ver el resultado, aunque no se presione "Finalizar".
    ('''  SCORM.setValue("cmi.core.score.max", "100");
  SCORM.commit();
}''', '''  SCORM.setValue("cmi.core.score.max", "100");
  SCORM.setValue("cmi.core.lesson_status", "completed");
  SCORM.commit();
}'''),
    ('''  if (state.finished){
    document.getElementById('btnFinish').disabled = true;''', '''  window.addEventListener('pagehide', function(){ if (SCORM.isFound()){ saveProgress(); SCORM.finish(SCORM.getValue("cmi.core.lesson_status") || "incomplete"); } });
  if (state.finished){
    document.getElementById('btnFinish').disabled = true;'''),
]

# ───────────────────────── M2 Laboratorio: Inspección preoperacional virtual ─────────────────────────
M2_LAB_CSS = '''
/* Ajustes TLS: navegación siempre visible, puntos numerados con lista tocable y diseño responsivo */
img{max-width:100%;}
#main > .botonera:last-child{position:sticky;bottom:0;z-index:40;margin:22px -18px 0;padding:12px 18px calc(12px + env(safe-area-inset-bottom));
  background:rgba(245,246,250,.95);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-top:1px solid var(--gris-medio);}
.hs-item{cursor:pointer;width:100%;text-align:left;font:inherit;color:inherit;}
.hs-item:hover{border-color:var(--turquesa);}
.hs-item .hs-num{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;
  background:var(--amarillo);color:#3a2c00;font-weight:800;font-size:12.5px;flex-shrink:0;}
.hs-item.marcada .hs-num{background:var(--turquesa);color:#fff;}
@media(max-width:520px){
  header.tls-header{padding:12px 14px;}
  header.tls-header .titulo{font-size:15px;}
  .hotspot{width:30px;height:30px;font-size:13px;border-width:2px;}
  #main > .botonera:last-child{margin:18px -12px 0;padding:10px 12px calc(10px + env(safe-area-inset-bottom));}
  #main > .botonera:last-child .btn{flex:1 1 auto;}
  table.informe-tabla{font-size:12.5px;}
  table.informe-tabla th,table.informe-tabla td{padding:6px 7px;}
}
</style>'''

M2_LAB = [
    ('</style>', M2_LAB_CSS),
    # Puntos numerados y lista bajo la imagen que también abre cada punto (en celular los puntos quedaban encimados).
    ('''  var marcadores = lista.map(function(h){
    var resp = respuestas[h.id];
    var cls = claseHotspot(h.real, !!resp);
    var sim = simboloHotspot(h.real, !!resp);''', '''  var marcadores = lista.map(function(h, i){
    var resp = respuestas[h.id];
    var cls = claseHotspot(h.real, !!resp);
    var sim = resp ? simboloHotspot(h.real, true) : String(i+1);'''),
    ('''  var listaTexto = lista.map(function(h){''', '''  var listaTexto = lista.map(function(h, i){'''),
    ('''    var texto = resp ? (tipo==='equipo'?estadoLabelEquipo(h.real):estadoLabelEntorno(h.real)) : 'Sin revisar — toca el punto en la imagen';
    return '<div class="tarjeta-check'+(resp?' marcada':'')+'"><div style="flex:1;"><strong>'+h.label+'</strong><br><span class="pill '+pill+'">'+ texto +'</span></div></div>';''',
     '''    var texto = resp ? (tipo==='equipo'?estadoLabelEquipo(h.real):estadoLabelEntorno(h.real)) : 'Sin revisar — toca el punto o esta fila';
    return '<button type="button" class="tarjeta-check hs-item'+(resp?' marcada':'')+'" data-hs="'+h.id+'"><span class="hs-num">'+(i+1)+'</span><div style="flex:1;"><strong>'+h.label+'</strong><br><span class="pill '+pill+'">'+ texto +'</span></div></button>';'''),
    ('''    var hsBtn = t.closest('.hotspot');''', '''    var hsBtn = t.closest('.hotspot, .hs-item');'''),
    # Puntaje al primer intento: antes había que acertar todo para avanzar y el puntaje final salía siempre 100.
    ('''  hotspotModalActivo: null
};''', '''  hotspotModalActivo: null,
  primerIntento: {}
};
function registrarPrimerIntento(clave, correcto){
  if (estado.primerIntento[clave] === undefined) estado.primerIntento[clave] = correcto;
}'''),
    ('''    if (resp && resp === h.real) visualPts += 2;
  });
  var pesosImg = [2,2,2,1];
  HALLAZGOS_IMAGEN.forEach(function(hi, idx){
    var resp = estado.imagenRespuestas[hi.id];
    if (resp && resp === hi.correcta) visualPts += pesosImg[idx];''', '''    if (resp && estado.primerIntento['e:'+h.id] === true) visualPts += 2;
  });
  var pesosImg = [2,2,2,1];
  HALLAZGOS_IMAGEN.forEach(function(hi, idx){
    var resp = estado.imagenRespuestas[hi.id];
    if (resp && estado.primerIntento['m:'+hi.id] === true) visualPts += pesosImg[idx];'''),
    ('''  if (seq.length === 6){
    var correctPositions = 0;
    for (var i=0;i<6;i++){ if (seq[i] === PASOS_CONTROL_ORDEN_CORRECTO[i]) correctPositions++; }
    ordenPts = correctPositions * 2;
    if (correctPositions === 6) ordenPts += 2;
  }
  var decisionPts = (estado.decisionAnormal === 'detener') ? 6 : 0;''', '''  if (typeof estado.primerIntento.seq === 'number'){
    var correctPositions = estado.primerIntento.seq;
    ordenPts = correctPositions * 2;
    if (correctPositions === 6) ordenPts += 2;
  }
  var decisionPts = (estado.decisionAnormal === 'detener' && estado.primerIntento.d === true) ? 6 : 0;'''),
    ('''    if (resp && resp === h.real) entornoPts += 2;''',
     '''    if (resp && estado.primerIntento['n:'+h.id] === true) entornoPts += 2;'''),
    ('''    if (resp && resp === c.real) personasCorrectas++;''',
     '''    if (resp && estado.primerIntento['c:'+c.id] === true) personasCorrectas++;'''),
    ('''  estado.puntajes.veredicto = (estado.veredictoElegido && estado.veredictoElegido === correcto) ? 10 : 0;''',
     '''  estado.puntajes.veredicto = (estado.veredictoElegido && estado.veredictoElegido === correcto && estado.primerIntento.v === true) ? 10 : 0;'''),
    ('''      if (hotspotAbierto.tipo==='equipo') estado.equipoRespuestas[hotspotAbierto.h.id] = val;''',
     '''      registrarPrimerIntento((hotspotAbierto.tipo==='equipo'?'e:':'n:')+hotspotAbierto.h.id, val===hotspotAbierto.h.real);
      if (hotspotAbierto.tipo==='equipo') estado.equipoRespuestas[hotspotAbierto.h.id] = val;'''),
    ('''        estado.imagenRespuestas[iid] = opv;''', '''        registrarPrimerIntento('m:'+iid, opv===HALLAZGOS_IMAGEN.filter(function(x){return x.id===iid;})[0].correcta);
        estado.imagenRespuestas[iid] = opv;'''),
    ('''      estado.secuenciaVerificada = true;''', '''      estado.secuenciaVerificada = true;
      if (estado.primerIntento.seq === undefined) estado.primerIntento.seq = estado.secuenciaActual.filter(function(pid,i){ return pid===PASOS_CONTROL_ORDEN_CORRECTO[i]; }).length;'''),
    ('''      estado.decisionAnormal = decisionBtn.getAttribute('data-decision');''', '''      estado.decisionAnormal = decisionBtn.getAttribute('data-decision');
      registrarPrimerIntento('d', estado.decisionAnormal==='detener');'''),
    ('''        estado.checklistRespuestas[cid] = cval;''', '''        registrarPrimerIntento('c:'+cid, cval===coordReal);
        estado.checklistRespuestas[cid] = cval;'''),
    ('''      estado.veredictoElegido = veredictoBtn.getAttribute('data-veredicto');''', '''      estado.veredictoElegido = veredictoBtn.getAttribute('data-veredicto');
      registrarPrimerIntento('v', estado.veredictoElegido===veredictoCorrecto());'''),
    # Al cambiar de ruta o reiniciar también se reinician los primeros intentos.
    ('''      estado.ruta = opcionRuta.getAttribute('data-ruta');''', '''      estado.ruta = opcionRuta.getAttribute('data-ruta');
      estado.primerIntento = {}; estado.imagenRespuestas = {};'''),
    ('''      estado.ruta = (estado.ruta==='A') ? 'B' : 'A';''', '''      estado.ruta = (estado.ruta==='A') ? 'B' : 'A';
      estado.primerIntento = {}; estado.imagenRespuestas = {};'''),
    ('''  estado.puntajes = { identificacion:0, visual:0, controles:0, entorno:0, personas:0, veredicto:0 };
  try{ localStorage.removeItem(CLAVE_LOCAL); }catch(e){}
  scormSetValue('cmi.core.lesson_status','incomplete');''', '''  estado.puntajes = { identificacion:0, visual:0, controles:0, entorno:0, personas:0, veredicto:0 };
  estado.primerIntento = {};
  try{ localStorage.removeItem(CLAVE_LOCAL); }catch(e){}
  var stPrev = scormActivo ? obtenerAPI().LMSGetValue('cmi.core.lesson_status') : '';
  if (stPrev !== 'completed' && stPrev !== 'passed') scormSetValue('cmi.core.lesson_status','incomplete');'''),
    # Persistencia: guardar los primeros intentos; reanudar de verdad (antes se buscaba "ruta" y se guardaba "r").
    ('''    c:estado.checklistRespuestas,v:estado.veredictoElegido,pt:estado.puntajes
  };''', '''    c:estado.checklistRespuestas,v:estado.veredictoElegido,pt:estado.puntajes,pi:estado.primerIntento
  };'''),
    ('''  estado.puntajes = data.pt || data.puntajes || estado.puntajes;
}''', '''  estado.puntajes = data.pt || data.puntajes || estado.puntajes;
  estado.primerIntento = data.pi || {};
}'''),
    ('''  if (!json){ try{ json = localStorage.getItem(CLAVE_LOCAL); }catch(e){} }''',
     '''  if (!json && !scormActivo){ try{ json = localStorage.getItem(CLAVE_LOCAL); }catch(e){} }'''),
    ('''  if (datosPrevios && datosPrevios.ruta){''', '''  if (datosPrevios && (datosPrevios.r || datosPrevios.ruta)){'''),
    # La actividad queda completada con su nota al llegar al informe, aunque no se presione "Finalizar".
    ('''  estado.pantallaActual = n;
  computeScores();
  render();
  guardarProgreso();''', '''  estado.pantallaActual = n;
  computeScores();
  render();
  if (n >= 10 && estado.ruta){
    scormSetValue('cmi.core.score.raw', String(totalPuntaje()));
    scormSetValue('cmi.core.score.min', '0');
    scormSetValue('cmi.core.score.max', '100');
    scormSetValue('cmi.core.lesson_status', 'completed');
  }
  guardarProgreso();'''),
    ('''window.addEventListener('beforeunload', function(){
  scormCommit();
});''', '''window.addEventListener('beforeunload', function(){
  scormCommit();
});
window.addEventListener('pagehide', function(){ guardarProgreso(); scormFinish(); });'''),
]

# ───────────────────────── Registro SCORM 1.2 común (para recursos que no lo traían) ─────────────────────────
SCORM_JS = """<script>
/* Registro SCORM 1.2 para Moodle: estado, nota y cierre de la sesión */
(function(){
  function buscar(w){var n=0;while(w&&!w.API&&w.parent&&w.parent!==w&&n<10){w=w.parent;n++;}return w&&w.API?w.API:null;}
  var api=buscar(window)||(window.opener?buscar(window.opener):null), activo=false, cerrado=false;
  function leer(k){try{return api?String(api.LMSGetValue(k)):'';}catch(e){return '';}}
  function escribir(k,v){try{if(activo)api.LMSSetValue(k,String(v));}catch(e){}}
  function guardar(){try{if(activo)api.LMSCommit('');}catch(e){}}
  if(api){try{activo=String(api.LMSInitialize(''))==='true';}catch(e){}}
  if(activo){var st=leer('cmi.core.lesson_status');if(st===''||st==='not attempted'){escribir('cmi.core.lesson_status','incomplete');guardar();}}
  window.TLS_SCORM={
    completar:function(nota){
      if(!activo)return;
      escribir('cmi.core.score.min','0');escribir('cmi.core.score.max','100');
      escribir('cmi.core.score.raw',Math.max(0,Math.min(100,Math.round(nota))));
      escribir('cmi.core.lesson_status','completed');guardar();
    },
    finalizar:function(){if(!activo||cerrado)return;cerrado=true;guardar();try{api.LMSFinish('');}catch(e){}}
  };
  window.addEventListener('pagehide',function(){window.TLS_SCORM.finalizar();});
})();
</script>
</head>"""


# ───────────────────────── Módulo 3 · Desafío: El techo está cerca ─────────────────────────
M3_DESAFIO = [
    ('html,body{height:100%;}', 'html,body{min-height:100%;}'),
    ('''  .app{
    width:100%;
    max-width:760px;
  }''', '''  .app{
    width:100%;
    max-width:760px;
    margin:auto;
  }'''),
    ('''    overflow:hidden;
    animation:fadeIn''', '''    overflow:clip;
    animation:fadeIn'''),
    ('  @media (max-width:520px){', '''  /* Ajustes TLS: botón de avance siempre visible, resultado y diseño en celular */
  .btn.sticky-next{position:sticky;bottom:12px;z-index:5;}
  .btn.sticky-next:disabled{background:#b9bcd8;}
  .resultado-nota{background:var(--gris-claro);border-radius:12px;padding:14px 18px;margin:6px 0 4px;text-align:center;font-size:16px;color:var(--azul-marino);}
  .resultado-nota strong{font-size:22px;color:var(--azul-profundo);}
  .resultado-nota small{display:block;margin-top:4px;color:var(--gris);font-size:13px;}
  .option,.check-item,.tf-btn,.step-card,.btn{-webkit-tap-highlight-color:transparent;}
  img{max-width:100%;}
  @media (max-width:520px){
    body{padding:10px;}
    .statement-box{font-size:20px;padding:26px 16px;}
    .tf-btn{padding:16px;}
    .btn.sticky-next{bottom:8px;}'''),
    ('var photoIndex = 0;', '''var photoIndex = 0;

  // Puntaje: se considera la primera respuesta de cada decisión (pantallas 3 a 6)
  function notaDesafio(){
    var total = (state.ok3 ? 1 : 0) + (state.ok4 || 0) + (state.ok5 ? 1 : 0) + (state.ok6 ? 1 : 0);
    return Math.round(total / 4 * 100);
  }'''),
    ('''  function render(){
    setProgress();''', '''  function render(){
    setProgress();
    photoIndex = state.screen === 2 ? 1 : 0;'''),
    ('''    }
  }

  // ---------- PANTALLA 1 ----------''', '''    }
    var principal = content.querySelector('#btnCheck4') || content.querySelector('[id^="btnNext"]');
    if(principal) principal.classList.add('sticky-next');
    var siguiente = content.querySelector('#btnNext4');
    if(siguiente) siguiente.classList.add('sticky-next');
  }

  // ---------- PANTALLA 1 ----------'''),
    ('''        if(state.q3Answered) return;
        state.q3Answered = true;''', '''        if(state.q3Answered) return;
        state.q3Answered = true;
        state.ok3 = opt.correct;'''),
    ('''        if(state.q5Answered) return;
        state.q5Answered = true;''', '''        if(state.q5Answered) return;
        state.q5Answered = true;
        state.ok5 = opt.correct;'''),
    ('''      state.q6Answered = true;''', '''      state.q6Answered = true;
      state.ok6 = !isTrue;'''),
    ('''      var fb = document.getElementById('fb4');''', '''      state.ok4 = (items.length - missed.length - extra.length) / items.length;
      var fb = document.getElementById('fb4');'''),
    ('''      this.disabled = true;
      document.getElementById('btnNext4').style.display = 'block';''', '''      this.disabled = true;
      this.style.display = 'none';
      document.getElementById('btnNext4').style.display = 'block';'''),
    ('''  function renderScreen8(){
    content.innerHTML =''', '''  function renderScreen8(){
    var nota = notaDesafio();
    if(window.TLS_SCORM) window.TLS_SCORM.completar(nota);
    content.innerHTML ='''),
    ("""'<div class="idea-fuerza">"Cuando""", """'<div class="resultado-nota">Tu puntaje: <strong>' + nota + '</strong> / 100<small>Se considera tu primera respuesta en cada una de las cuatro decisiones.</small></div>' +
      '<div class="idea-fuerza">"Cuando"""),
    ('</style>\n</head>', '</style>\n' + SCORM_JS),
]


# ───────────────────────── Módulo 3 · Laboratorio: Ruta vertical segura ─────────────────────────
M3_LAB = [
    ('''    overflow:hidden;
    display:flex;
    flex-direction:column;
    min-height: 640px;''', '''    overflow:clip;
    display:flex;
    flex-direction:column;
    min-height: 640px;'''),
    ('''  @media (max-width: 640px){''', '''  /* Ajustes TLS: navegación fija, clasificación con botones y diseño en celular */
  footer.navbar{position:sticky;bottom:0;z-index:10;}
  .nav-btn.next:disabled{opacity:.45;}
  img{max-width:100%;}
  .item-clasificable .destinos{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;}
  .item-clasificable .destinos button{flex:1;min-width:120px;padding:8px 6px;border-radius:8px;border:2px solid var(--gris-medio);
    background:var(--gris-claro);font-family:"Helvetica Neue",Arial,sans-serif;font-size:12.5px;font-weight:700;color:var(--azul-principal);cursor:pointer;}
  .item-clasificable .destinos button:hover{border-color:var(--turquesa);}
  .item-clasificable .exp{font-size:12.5px;line-height:1.45;margin-top:6px;color:var(--gris-texto);}
  .item-clasificable.correcto,.item-clasificable.incorrecto{cursor:default;}
  .orden-lista li > span:nth-child(2){flex:1;min-width:0;}
  .orden-lista li button{min-width:38px;min-height:34px;font-size:13px;}
  .info-card.visto h4::after{content:" ✓";color:var(--turquesa);}
  .opcion-btn,.info-card,.check-item,.seguro-botones button{-webkit-tap-highlight-color:transparent;}
  @media (max-width: 640px){
    body{padding:0;}
    #app{border-radius:0;min-height:100vh;}
    .nav-btn{padding:10px 16px;}
    h3.titulo-pantalla{font-size:22px;}
    .hook{font-size:17px;}
    .orden-lista li{padding:10px;gap:8px;font-size:13.5px;}'''),
    ('arrastrándola (o tocándola y eligiendo un destino) hacia la zona correspondiente.',
     'arrastrándola o usando los botones de cada tarjeta. Tu primera clasificación es la que cuenta.'),
    ('''    if(n===9){ calcularResultado(); }''', '''    if(n===9){ calcularResultado(); }
    actualizarNav();'''),
    ('''  function cambiarPantalla(delta){''', '''  // Avance habilitado solo cuando la actividad de la pantalla está resuelta
  function pantallaLista(n){
    switch(n){
      case 2: return document.querySelectorAll("#escenarioCards .info-card.visto").length >= 4;
      case 3: return estado.p3.verificado;
      case 4: return estado.p4.clasificado >= p4Items.length;
      case 5: return estado.p5.verificado;
      case 6: return estado.p6.respondido;
      case 7: return estado.p7.respondidos >= p7Items.length;
      case 8: return estado.p8.verificado;
    }
    return true;
  }
  function actualizarNav(){
    document.getElementById("btnSiguiente").disabled = !pantallaLista(actual);
  }
  document.getElementById("main").addEventListener("click", function(){ setTimeout(actualizarNav, 0); });
  document.getElementById("main").addEventListener("drop", function(){ setTimeout(actualizarNav, 0); });

  function cambiarPantalla(delta){
    if(delta===1 && !pantallaLista(actual)) return;'''),
    ('''    initP3(); initP4(); initP5(); initP6(); initP7(); initP8();
    goTo(1);''', '''    initP3(); initP4(); initP5(); initP6(); initP7(); initP8();
    document.querySelectorAll("#escenarioCards .info-card").forEach(function(c){ c.classList.remove("revealed","visto"); });
    goTo(1);'''),
    ('''    el.classList.toggle("revealed");''', '''    el.classList.toggle("revealed");
    el.classList.add("visto");'''),
    ('''    estado.p3.correctas = seleccionCorrecta;''', '''    var extras = document.querySelectorAll("#p3-opciones .opcion-btn.selected.incorrecta").length;
    estado.p3.correctas = Math.max(0, seleccionCorrecta - extras);'''),
    ('''    if(seleccionCorrecta === total){
      fb.className = "feedback-box show ok";''', '''    if(seleccionCorrecta === total && extras === 0){
      fb.className = "feedback-box show ok";'''),
    ('''      div.textContent = item.t;
      div.setAttribute("data-zona", item.zona);''', '''      div.setAttribute("data-t", item.t);
      var txt = document.createElement("div");
      txt.textContent = item.t;
      div.appendChild(txt);
      var destinos = document.createElement("div");
      destinos.className = "destinos";
      [["controlada","Condición controlada"],["correccion","Requiere corrección"]].forEach(function(d){
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = d[1];
        b.addEventListener("click", function(){ moverItem(div, d[0]); });
        destinos.appendChild(b);
      });
      div.appendChild(destinos);
      div.setAttribute("data-zona", item.zona);'''),
    ('''      div.addEventListener("click", function(){
        // alternativa táctil: click alterna destino tentativo
        var destino = prompt('Escribe "1" para Condición controlada o "2" para Requiere corrección:\\n\\n' + item.t);
        if(destino === "1") moverItem(div,"controlada");
        else if(destino === "2") moverItem(div,"correccion");
      });
''', ''),
    ('''    var yaClasificado = div.getAttribute("data-clasificado")==="1";''', '''    var yaClasificado = div.getAttribute("data-clasificado")==="1";
    if(yaClasificado) return; // cuenta la primera clasificación
    div.draggable = false;
    var dest = div.querySelector(".destinos");
    if(dest) dest.remove();
    var exp = document.createElement("div");
    exp.className = "exp";
    exp.textContent = p4Explicaciones[div.getAttribute("data-t")] || "";
    div.appendChild(exp);'''),
    ('''      return el.textContent === texto;''', '''      return el.getAttribute("data-t") === texto;'''),
    ('''    var fb = document.getElementById("p5-feedback");
    fb.classList.add("show");
    estado.p5.verificado = true;''', '''    var fb = document.getElementById("p5-feedback");
    fb.classList.add("show");
    if(estado.p5.primer == null) estado.p5.primer = correctos / p5Correcto.length; // cuenta la primera verificación
    estado.p5.verificado = true;'''),
    ('''(estado.p5.correcto?1:0)''', '''(estado.p5.primer||0)'''),
    ('''  function verificarP8(){
    var rows''', '''  function verificarP8(){
    if(estado.p8.verificado) return;
    var rows'''),
    ('''    estado.p8.correcto = correctos;''', '''    var extras8 = p8Items.filter(function(it, i){ return !it.correct && estado.p8.marcados[i]; }).length;
    estado.p8.correcto = Math.max(0, correctos - extras8);'''),
    ('''    if(correctos === totalCorrectas){
      fb.className = "feedback-box show ok";
      fb.textContent = "Cierre correcto.''', '''    if(correctos === totalCorrectas && extras8 === 0){
      fb.className = "feedback-box show ok";
      fb.textContent = "Cierre correcto.'''),
    ('''    var promedio = Math.round((posicionamiento+preparacion+operacion+cierre)/4);''', '''    var promedio = Math.round((posicionamiento+preparacion+operacion+cierre)/4);
    if(window.TLS_SCORM) window.TLS_SCORM.completar(promedio);'''),
    ('''      <div class="resultado-final" id="p9-resultado"></div>''', '''      <div class="resultado-final" id="p9-resultado"></div>
      <p class="sans" style="text-align:center;font-size:13.5px;margin:-8px 0 18px;">Puntaje registrado: <strong id="p9-nota"></strong> / 100 · se considera tu primera respuesta en cada actividad.</p>'''),
    ('''    var resDiv = document.getElementById("p9-resultado");''', '''    document.getElementById("p9-nota").textContent = promedio;
    var resDiv = document.getElementById("p9-resultado");'''),
    ('</style>\n</head>', '</style>\n' + SCORM_JS),
]

ACTIVIDADES = [
    dict(src='M1_DESAFIO_que_equipo_corresponde.html', patches=DESAFIO,
         name='Actividad_M1_Desafio_Que_equipo_corresponde', ident='TLS_PEMP_M1_DESAFIO_V2', code='M1_DESAFIO',
         title='Desafío TLS — ¿Qué equipo corresponde? (Módulo 1)'),
    dict(src='M1_LAB_reconoce_la_pemp.html', patches=LAB,
         name='Actividad_M1_Laboratorio_Reconoce_la_PEMP', ident='TLS_PEMP_M1_LAB_V2', code='M1_LAB',
         title='Laboratorio TLS — Reconoce la PEMP y sus riesgos (Módulo 1)'),
    dict(src='M2_DESAFIO_autorizar_no_es_marcar_casillas.html', patches=M2_DESAFIO,
         name='Actividad_M2_Desafio_Autorizar_no_es_marcar_casillas', ident='TLS_PEMP_M2_DESAFIO_V2', code='M2_DESAFIO',
         title='Desafío TLS — Autorizar no es marcar casillas (Módulo 2)'),
    dict(src='M2_LAB_inspeccion_preoperacional_virtual.html', patches=M2_LAB,
         name='Actividad_M2_Laboratorio_Inspeccion_preoperacional', ident='TLS_PEMP_M2_LAB_V2', code='M2_LAB',
         title='Laboratorio TLS — Inspección preoperacional virtual (Módulo 2)'),
    dict(src='M3_DESAFIO_el_techo_esta_cerca.html', patches=M3_DESAFIO,
         name='Actividad_M3_Desafio_El_techo_esta_cerca', ident='TLS_PEMP_M3_DESAFIO_V2', code='M3_DESAFIO',
         title='Desafío TLS — El techo está cerca (Módulo 3)'),
    dict(src='M3_LAB_ruta_vertical_segura.html', patches=M3_LAB,
         name='Actividad_M3_Laboratorio_Ruta_vertical_segura', ident='TLS_PEMP_M3_LAB_V2', code='M3_LAB',
         title='Laboratorio TLS — Ruta vertical segura (Módulo 3)'),
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

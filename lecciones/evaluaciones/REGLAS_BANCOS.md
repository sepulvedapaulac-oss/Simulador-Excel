# Reglas para los bancos de preguntas (Moodle XML)

Curso: "Herramientas Digitales para el Crecimiento de PYMES" (Moodle, asincrónico, Chile, 2026).
Personajes: Módulo 1 = María, dueña de "Empanadas Doña María". Módulos 2–4 = Marcela, dueña de "Casa Nativa" (decoración artesanal para el hogar, vende por Instagram/WhatsApp/tienda en línea). Empresas ficticias.

Fuentes de contenido (leer antes de escribir): lecciones/M{n}/v2/src/L*.html y lecciones/M{n}/v2/data/L*.json (guion, narración, quiz). Videos: lecciones/M*/videos/*/locucion.json. Temario: módulo 1 (madurez digital, Microsoft 365, Drive/OneDrive y seguridad), módulo 2 (perfil comercial WhatsApp Business, tienda propia vs marketplace, pasarelas de pago, logística y envíos), módulo 3 (audiencia y contenido orgánico, Canva y accesibilidad, Meta Ads y Google Ads con presupuesto acotado, automatización y chatbots), módulo 4 (CRM, registro/segmentación/fidelización, Google Analytics 4 y paneles, Plan de Acción Digital).

Formato JSON (lecciones/evaluaciones/fuentes/<archivo>.json):
{"categoria": "Herramientas Digitales PYMES/Módulo 1/Evaluación", "puntaje": 2, "preguntas": [
  {"id": "M1.P1", "tema": "…", "caso": "texto opcional (\n = párrafo)", "caso_html": "opcional, HTML simple con <p>, <table>, <ul>",
   "q": "enunciado", "o": ["A","B","C","D"], "c": 0-3, "f": ["retro A","retro B","retro C","retro D"], "g": "idea clave (retro general)"}]}
Generar: python3 lecciones/evaluaciones/tools/to_moodle_xml.py fuentes/X.json xml/X.xml  y validar con xmllint --noout.

Calidad:
- 4 alternativas, una sola correcta, todas plausibles y de largo parecido (la correcta NO debe ser la más larga). Nada de "todas/ninguna de las anteriores".
- Posición de la correcta repartida de forma pareja entre A, B, C y D en cada banco.
- Cada alternativa tiene retroalimentación que explica POR QUÉ es correcta o incorrecta (1–2 frases). No empezar con "Correcto"/"Incorrecto": el generador antepone ✔/✘.
- Preguntas de aplicación (situación del personaje → decisión), no de memoria literal. Cubrir todas las lecciones del módulo de forma equilibrada.
- Exactitud: datos vigentes a 2026 y verificables; si un dato (precio, comisión, plazo) puede cambiar, plantearlo como dato del caso, no como hecho universal. No inventar cifras oficiales.
- No usar la palabra "pyme" en mayúsculas como marca; puede decirse "negocio" o "PYME" con naturalidad. Nunca mencionar "Tremen learning studio".
- Parte 2 (casos, M2–M4): cada pregunta tiene "caso" o "caso_html" con datos concretos (tabla de métricas, conversación, costos, comparativa) y exige analizar/calcular/priorizar; nivel más avanzado que la parte 1.

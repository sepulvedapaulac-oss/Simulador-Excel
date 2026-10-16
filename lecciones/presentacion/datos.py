"""Datos del curso para la Presentación del curso (HTML) y la Guía del participante (PDF)."""
CURSO = "Herramientas Digitales para el Crecimiento de PYMES"
HORAS = 30
PLATAFORMA = "Aula virtual Tremen Partner (Moodle)"
BIENVENIDA = ("Este curso te prepara para <b>diseñar e implementar un plan básico de digitalización</b> para una PYME: "
              "organizar el trabajo en la nube, vender por canales digitales, comunicar la marca, automatizar la atención y "
              "decidir con datos de clientes y ventas.")
CASO = ("María, de <i>Empanadas Doña María</i> (Módulo 1), y Marcela, de <i>Casa Nativa</i>, un emprendimiento de "
        "decoración artesanal para el hogar (Módulos 2 a 4). Ambas empresas son ficticias y todos los datos del curso también.")
COMP = "Diseñar e implementar un plan básico de digitalización para una PYME, integrando herramientas en la nube, canales de venta digitales, automatización y análisis de datos."
PUBLICO = ("Emprendedoras, emprendedores, dueñas y dueños de micro, pequeñas y medianas empresas, y las personas que trabajan con ellos, "
           "que quieren ordenar su trabajo con herramientas digitales, vender por canales digitales, comunicar su marca y tomar decisiones con datos.")
REQUISITOS = ["Manejo de computador y celular a nivel usuario, y una cuenta de correo electrónico activa.",
              "Contar con un negocio propio o en el que trabajes para aplicar las fichas y el plan; si no lo tienes, puedes trabajar con el caso del curso.",
              "No se requieren conocimientos técnicos ni de marketing previos."]
# horas: plataforma, autónomo, evaluación
MODS = [
 dict(n=1, ae="AE1", titulo="Fundamentos de la Digitalización y Productividad en la Nube", h=(4, 1, 1),
      aetxt="Diagnosticar el nivel de madurez digital de una PYME y organizar sus herramientas y archivos en la nube según criterios de productividad, permisos y seguridad.",
      crit="Diagnostica el nivel de madurez digital de una PYME y organiza sus herramientas y archivos en la nube según criterios de productividad, permisos y seguridad.",
      como="Microlecciones interactivas en que diagnosticas la madurez digital del negocio de María, eliges herramientas de Microsoft 365 según cada necesidad y organizas, compartes y proteges archivos en Drive y OneDrive.",
      lecc=["1.1 ¿Qué tan digital es tu PYME?", "1.2 Tu ecosistema de trabajo digital", "1.3 Organiza y protege tus archivos en la nube"],
      videos="Recorrido por Microsoft 365 · Organiza y protege tus archivos en la nube",
      acts=["Laboratorio: ordena, comparte y protege la nube del negocio", "Simulador: elige la herramienta de Microsoft 365 adecuada"],
      pdfs=["Checklist de madurez digital", "Guía: organización y seguridad en la nube"],
      ev="Cuestionario de 10 preguntas", img="M1/img/l1_hero.jpg", alt="María revisa pedidos en su celular en el local de empanadas"),
 dict(n=2, ae="AE2", titulo="Presencia Digital y Canales de Venta (E-commerce)", h=(4, 2, 1),
      aetxt="Seleccionar canales de venta digitales, medios de pago y procesos de entrega para una PYME según criterios de control, costos y capacidad operativa.",
      crit="Selecciona canales de venta digitales, medios de pago y procesos de entrega para una PYME según criterios de control, costos y capacidad operativa.",
      como="Microlecciones, demostraciones y casos de decisión en que configuras un perfil comercial, comparas tienda propia y marketplace, eliges una pasarela de pago y diseñas el flujo desde la compra hasta la entrega.",
      lecc=["2.1 Convierte tu presencia digital en un canal comercial", "2.2 ¿Tienda propia o marketplace?", "2.3 Del pago a la entrega"],
      videos="Perfil comercial en WhatsApp Business · Del clic al pago",
      acts=["Laboratorio: audita y mejora el perfil comercial y el flujo de pedidos", "Simulador: ¿cuánto queda por venta en cada canal?"],
      pdfs=["Checklist de perfil comercial", "Matriz de canales y mapa de venta, pago y despacho"],
      ev="Cuestionario de 10 preguntas y análisis de casos", img="M2/img/m6_hero.jpg", alt="Marcela prepara un pedido de Casa Nativa para despacho"),
 dict(n=3, ae="AE3", titulo="Marketing Digital y Redes Sociales para PYMES", h=(5, 2, 1),
      aetxt="Diseñar acciones de marketing digital y de atención automatizada para una PYME según su audiencia, objetivos medibles y criterios de accesibilidad.",
      crit="Diseña acciones de marketing digital y de atención automatizada para una PYME según su audiencia, objetivos medibles y criterios de accesibilidad.",
      como="Microlecciones, demostraciones en Canva, Meta Ads y Google Ads, y casos en que defines a tu cliente ideal, diseñas publicaciones claras y accesibles, planificas una campaña con presupuesto acotado y un flujo de atención automática.",
      lecc=["3.1 Hablarle a la audiencia correcta", "3.2 Una marca reconocible y accesible", "3.3 Invertir en publicidad sin perder el control", "3.4 Automatizar sin perder el trato humano"],
      videos="Publicación clara en Canva · Estructura de una campaña digital · Flujo simple de atención automática",
      acts=["Laboratorio: diseña una publicación clara y accesible", "Simulador de campaña con presupuesto acotado"],
      pdfs=["Cliente ideal, calendario editorial y checklist visual", "Planificador de campaña y banco de respuestas automáticas"],
      ev="Cuestionario de 10 preguntas y análisis de casos", img="M3/img/m8_hero.jpg", alt="Marcela elige colores y piezas para su marca"),
 dict(n=4, ae="AE4", titulo="Gestión de Clientes (CRM) y Análisis de Datos", h=(4, 2, 3),
      aetxt="Gestionar la relación con los clientes y analizar los datos de una PYME para priorizar un plan de acción digital según indicadores de gestión.",
      crit="Gestiona la relación con los clientes y analiza los datos de una PYME para priorizar un plan de acción digital según indicadores de gestión.",
      como="Microlecciones, un recorrido por un CRM y paneles de Google Analytics 4 en que registras y segmentas clientes, interpretas indicadores y construyes tu Plan de Acción Digital; luego rindes la evaluación final del curso.",
      lecc=["4.1 De contactos dispersos a clientes que vuelven", "4.2 Usa tus datos para decidir", "4.3 Construye tu plan de acción digital"],
      videos="Recorrido práctico por un CRM",
      acts=["Laboratorio CRM: organiza y segmenta la base de Casa Nativa", "Simulador de indicadores: lee tus datos y decide"],
      pdfs=["Plantilla de base de clientes y guía de indicadores", "Plantilla del Plan de Acción Digital"],
      ev="Cuestionario de 10 preguntas y análisis de casos · Evaluación final del curso", img="M4/img/m12_hero.jpg", alt="Marcela revisa indicadores de ventas en su computador y celular"),
]
TOT = tuple(sum(m['h'][i] for m in MODS) for i in range(3))
assert sum(TOT) == HORAS, TOT
NLECC = sum(len(m['lecc']) for m in MODS)
PESOS = [("Evaluación del Módulo 1: cuestionario", "10 %"),
         ("Evaluación del Módulo 2: cuestionario y análisis de casos", "10 %"),
         ("Evaluación del Módulo 3: cuestionario y análisis de casos", "10 %"),
         ("Evaluación del Módulo 4: cuestionario y análisis de casos", "10 %"),
         ("Evaluación final · Parte 1: cuestionario de 20 preguntas", "30 %"),
         ("Evaluación final · Parte 2: caso práctico integrador", "30 %")]
CASO_FINAL = "«Casa Nativa: un año de digitalización»"
TEC = ["Computador o notebook con Windows 10 o superior, o macOS 11 o superior.",
       "Procesador de doble núcleo y 4 GB de memoria RAM como mínimo.",
       "Conexión a internet de banda ancha de 10 Mbps o superior.",
       "Navegador actualizado (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).",
       "Parlantes o audífonos para los videos y la narración.",
       "Un lector de PDF (Adobe Acrobat Reader o el navegador) para completar las fichas rellenables.",
       "Los recursos funcionan dentro del aula virtual: no necesitas instalar programas."]

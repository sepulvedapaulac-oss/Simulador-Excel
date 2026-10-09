L.first=['hook','cls','ord','tf','sim','caso1','caso2c'];
L.TF=[
 ['Un chatbot debería presentarse como si fuera una persona para generar más confianza.',0,'Falso. Debe quedar claro cuándo responde una automatización. Fingir ser humano daña la confianza cuando el cliente lo descubre.'],
 ['Las preguntas frecuentes con respuestas estables son un buen punto de partida para automatizar.',1,'Verdadero. Horarios, pagos, despacho o ubicación son predecibles y se repiten mucho.'],
 ['Una vez configuradas, las respuestas automáticas no necesitan revisarse.',0,'Falso. Precios, horarios y condiciones cambian: una respuesta desactualizada genera errores y reclamos.'],
 ['Al derivar a una persona, conviene conservar lo que el cliente ya contó.',1,'Verdadero. Así el cliente no repite su problema y la persona atiende más rápido.'],
 ['Antes de activar un agente de IA en WhatsApp Business conviene revisar sus condiciones, como el costo según uso y qué mensajes automáticos reemplaza.',1,'Verdadero. Su disponibilidad es gradual, tiene costo según uso y, al activarlo, se desactivan los mensajes de bienvenida y de ausencia.']
];
L.TFsum='La automatización funciona cuando es transparente, está actualizada y siempre ofrece una salida hacia una persona.';
L.Q=[
 {q:'¿Qué conviene automatizar primero?',o:['Los reclamos.','Las negociaciones de precio.','Las preguntas frecuentes con respuestas estables.','Las situaciones sensibles.'],c:2,f:'Lo repetitivo y predecible es el mejor punto de partida.'},
 {q:'Según la regla útil de la lección, ¿cuándo gana importancia la intervención humana?',o:['Cuando la respuesta depende mucho del contexto o de cómo se siente el cliente.','Cuando el cliente escribe de noche.','Cuando la pregunta es corta.','Nunca, si el bot es bueno.'],c:0,f:'Contexto y emoción requieren criterio y empatía.'},
 {q:'¿Cuál es el primer paso de un flujo básico de chatbot?',o:['Derivar a una persona.','Saludar y explicar qué puede hacer.','Pedir todos los datos personales.','Enviar el catálogo completo.'],c:1,f:'El cliente debe saber desde el inicio qué puede resolver el asistente.'},
 {q:'¿Qué mensaje mantiene mejor el tono de la marca?',o:['“Solicitud recibida. Espere.”','“Error. Opción incorrecta.”','“Estamos cerrados.”','“Gracias por escribirnos. Puedo ayudarte con despacho o pagos; si necesitas otra cosa, te derivamos con una persona.”'],c:3,f:'Automatizado no significa frío: cálido, claro y con salida a una persona.'},
 {q:'Al derivar un caso urgente a una persona, ¿qué es lo más importante?',o:['Conservar el contexto para que el cliente no repita la información.','Cerrar la conversación automática.','Pedirle al cliente que escriba otro día.','Enviar la política de cambios.'],c:0,f:'La persona que recibe la conversación debe saber qué preguntó el cliente y por qué es urgente.'}
];
L.YN=[
 ['¿Está claro para el cliente que le responde una automatización?',0,'No. “Hola, soy Camila” hace creer que es una persona.'],
 ['¿Existe una salida para hablar con una persona?',0,'No. El menú solo ofrece despacho y medios de pago; falta la opción de hablar con alguien.'],
 ['¿Las respuestas están actualizadas?',0,'No. Los precios del año pasado generarán errores y reclamos.'],
 ['¿Automatizar despacho y medios de pago es una buena elección?',1,'Sí. Son preguntas frecuentes con respuestas estables.'],
 ['¿Conviene responder los reclamos solo con la política de devoluciones?',0,'No. Un reclamo requiere contexto y empatía: debe derivarse a una persona.']
];

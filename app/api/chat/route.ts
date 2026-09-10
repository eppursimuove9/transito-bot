import { NextResponse } from 'next/server';

function generarFolio(anio: number = 2026): string {
  const correlativo = Math.floor(1000 + Math.random() * 9000);
  return `#LUN-${anio}-${correlativo}`;
}

const KNOWLEDGE_BASE = [
  {
    keywords: ["EVENTO", "FIESTA", "TRUMAO", "PUERTO NUEVO", "SEMANA", "COSTUMBRISTA"],
    response: `🎭 *Eventos y Actividades en La Unión 2026*\n\n• *Muestra Fluvial de Trumao:* Sábado y Domingo en el Muelle Fluvial.\n• *Feria Costumbrista Puerto Nuevo:* Fin de semana en ribera Lago Ranco.\n• *Semana Unionina:* Actividades en Plaza de la Concordia y Parque Municipal.\n\n_Escribe otra consulta o *MENU* para volver._`
  },
  {
    keywords: ["FARMACIA", "TURNO", "REMEDIO", "SALUD", "HOSPITAL", "CESFAM"],
    response: `💊 *Farmacias de Turno y Salud Comunal*\n\n• *Farmacia Cruz Verde (Calle Comercio 310)*: Turno 24 Horas activo hoy.\n• *Hospital de La Unión (Urgencias)*: 24/7 en Los Canelos s/n.\n• *CESFAM Dr. Alfredo Gantz Mann*: Atención diurna y SAPU de urgencia.\n\n_Escribe otra consulta o *MENU* para volver._`
  },
  {
    keywords: ["TELEFONO", "ANEXO", "CONTACTO", "DIDECO", "OBRAS", "TRANSITO"],
    response: `📞 *Directorio Municipal de La Unión*\n\n• *Central Telefónica:* +56 64 232 2000\n• *Tránsito y Licencias:* Anexo 112 • Comercio 340\n• *Rentas y Finanzas:* Anexo 106 • Comercio 340\n• *DIDECO (Social):* Anexo 104 • Manuel Montt 530\n• *Operaciones y Emergencias:* +56 64 276 5230 (24/7)\n\n_Escribe otra consulta o *MENU* para volver._`
  }
];

const MENSAJE_INICIAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de La Unión* 🇨🇱

Canal municipal directo y abierto para toda la comuna. Selecciona el área de tu trámite:

1️⃣ 🚗 *Tránsito y Vehículos* (Requisitos Permiso, Licencias, Multas JPL y Pasarela Web)
2️⃣ 🏪 *Rentas y Comercio* (Patentes Comerciales, Ferias Libres, Plazos y Enlaces)
3️⃣ 🚜 *Reporte de Incidencias Comunitarias* (Hoyos, Caminos Rurales, Luminarias, Ramas y Chatarra)
4️⃣ 🤝 *DIDECO y Acción Social* (Subsidio Agua Potable Rural APR, Registro Social de Hogares)
5️⃣ ℹ️ *Guía Comunal e Información RAG* (Ordenanzas, Farmacias de Turno, Eventos)
6️⃣ 👵 *Modo Asistido / Adulto Mayor* (Texto claro y sencillo)
0️⃣ 👤 *Solicitar contacto telefónico de un funcionario*

_Escribe el número de tu opción (1-6 o 0). Para emergencias escribe *SOS*._`;

export async function POST(req: Request) {
  const { message, step, hasImage } = await req.json();
  const rawMessage = (message || '').trim();
  const cleanMsg = rawMessage.toUpperCase();

  // --- 1. SOS DE EMERGENCIA ---
  if (['SOS', 'EMERGENCIA', 'BOMBEROS', 'CARABINEROS', 'AMBULANCIA'].some(k => cleanMsg.includes(k))) {
    return NextResponse.json({
      reply: `🚨 *CENTRAL DE EMERGENCIAS • LA UNIÓN* 🚨\n\nComunícate de inmediato:\n\n🚒 *Bomberos La Unión:* 132\n🚓 *Carabineros (3ª Comisaría La Unión):* 133 / +56 64 276 5230\n🚓 *Retén Puerto Nuevo:* +56 64 276 5240\n🚑 *Ambulancia SAMU:* 131\n📞 *Seguridad Pública Municipal:* +56 64 232 2000\n\n_Escribe *MENU* para volver._`,
      next_step: 'INIT'
    });
  }

  // --- 2. COMANDOS GLOBALES ---
  if (['MENU', 'VOLVER', 'INICIO', 'HOLA', 'CANCELAR'].includes(cleanMsg)) {
    return NextResponse.json({ reply: MENSAJE_INICIAL, next_step: 'INIT' });
  }

  if (cleanMsg === '0' || ['FUNCIONARIO', 'HUMANO', 'LLAMAR'].includes(cleanMsg)) {
    const folio = generarFolio();
    return NextResponse.json({
      reply: `👤 *Solicitud de Contacto Telefónico Registrada (${folio})*\n\nUn funcionario municipal se comunicará al número de este WhatsApp durante horario hábil (08:30 a 14:00 hrs).\n\n_Escribe *MENU* para volver al inicio._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Vecino WhatsApp',
        type: 'CALLBACK',
        description: 'Solicitud de llamado ciudadano directo',
        slaMinutes: 60
      }
    });
  }

  // --- 3. MODO ASISTIDO (ADULTO MAYOR) ---
  if (cleanMsg === '6' || cleanMsg === 'MODO SIMPLE') {
    return NextResponse.json({
      reply: `👵👴 *MODO ASISTIDO (Lenguaje Claro y Letra Grande)*\n\nLe ayudamos con sus dudas sobre trámites en La Unión:\n\n1️⃣ *Cómo pagar el Permiso de Circulación y qué papeles necesita*\n2️⃣ *Avisar de un camino con hoyos, rama caída o luminaria apagada*\n3️⃣ *Pedir que un funcionario le llame por teléfono a su casa*\n4️⃣ *Saber las farmacias de turno hoy*\n\n👉 Escriba el número de su opción (por ejemplo: *1*).\nPara salir escriba *MENU*. Para emergencias escriba *SOS*.`,
      next_step: 'AWAIT_SENIOR_OPTION'
    });
  }

  if (step === 'AWAIT_SENIOR_OPTION') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `🚗 *Información Permiso de Circulación*\n\nPara renovar su permiso en La Unión necesita:\n1. Permiso de circulación anterior pagado.\n2. Revisión técnica y gases al día.\n3. Seguro Obligatorio (SOAP) vigente al 2027.\n\n📍 *Lugar de pago presencial:* Dirección de Tránsito (Comercio 340).\n🌐 *Pago por internet:* Puede pagar directo en el portal municipal: https://www.munilaunion.cl/pagos\n\n_Escriba *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "🚜 *Aviso de Caminos o Luminarias (100% Anónimo)*\n\nCuéntenos dónde está el problema y qué ocurre (por ejemplo: _\"Hay un hoyo hondo en el camino a Trumao en el km 10\"_). Si puede, tome una foto 📷:\n\n_Escriba *MENU* para volver._",
        next_step: 'INCIDENCIA_ANONIMA_TEXTO'
      });
    }
    if (cleanMsg === '3') {
      const folio = generarFolio();
      return NextResponse.json({
        reply: `📞 *Solicitud Registrada (${folio})*\n\nUn funcionario municipal le llamará con calma a este número para ayudarle.\n\n_Escriba *MENU* para volver._`,
        next_step: 'INIT',
        ticketSync: {
          id: folio,
          citizen: 'Adulto Mayor (Modo Asistido)',
          type: 'CALLBACK',
          description: 'Llamado prioritario Adulto Mayor',
          slaMinutes: 30
        }
      });
    }
    if (cleanMsg === '4') {
      const farmacia = KNOWLEDGE_BASE.find(k => k.keywords.includes("FARMACIA"));
      return NextResponse.json({ reply: farmacia ? farmacia.response : "Farmacia Cruz Verde (Comercio 310) de turno 24 hrs.", next_step: 'INIT' });
    }
  }

  // --- 4. ENRUTADOR PRINCIPAL ---
  if (step === 'INIT') {
    // 1. Tránsito
    if (cleanMsg === '1' || cleanMsg.includes('TRANSITO')) {
      const sub = `🚗 *Dirección de Tránsito y Transporte Público*\n\nSelecciona el trámite sobre el que deseas orientación:\n\n1️⃣ *Permiso de Circulación* (Requisitos, fechas y enlace oficial de pago)\n2️⃣ *Licencias de Conducir* (Primeras licencias, renovaciones y cómo pedir hora)\n3️⃣ *Multas y JPL* (Dónde consultar y cómo pagar multas pendientes)\n\n_Escribe tu opción (1-3) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_TRANSITO' });
    }

    // 2. Rentas
    if (cleanMsg === '2' || cleanMsg.includes('RENTA') || cleanMsg.includes('PATENTE') || cleanMsg.includes('COMERCIO')) {
      const sub = `🏪 *Departamento de Rentas y Patentes Comerciales*\n\nSelecciona la consulta de tu interés:\n\n1️⃣ *Patentes Comerciales y MEF* (Requisitos de apertura, plazos y pago web)\n2️⃣ *Derechos de Feria Libre y Permisos Ambulantes* (Días de pago y requisitos)\n3️⃣ *Derechos de Aseo Domiciliario* (Quiénes pagan, exenciones adulto mayor)\n\n_Escribe tu opción (1-3) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_RENTAS' });
    }

    // 3. REPORTE DE INCIDENCIAS COMUNITARIAS (NUEVO NOMBRE Y SUBMENÚ)
    if (cleanMsg === '3' || cleanMsg.includes('INCIDENCIA') || cleanMsg.includes('CAMINO') || cleanMsg.includes('HOYO') || cleanMsg.includes('BACHE') || cleanMsg.includes('LUMINARIA') || cleanMsg.includes('CHATARRA')) {
      const sub = `🚜 *Reporte de Incidencias Comunitarias*\n\nCanal directo con la Dirección de Operaciones para atender contingencias en la comuna:\n\n1️⃣ 🕳️ *Reportar Hoyo, Camino en Mal Estado, Luminaria o Rama Caída* (100% Anónimo)\n2️⃣ ♻️ *Solicitar Retiro de Chatarra, Baterías o Metales*\n\n_Escribe 1 o 2, o escribe *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_INCIDENCIAS' });
    }

    // 4. DIDECO
    if (cleanMsg === '4' || cleanMsg.includes('DIDECO') || cleanMsg.includes('APR')) {
      const sub = `🤝 *DIDECO - Orientación Social y Subsidios*\n\n1️⃣ *Subsidio al Agua Potable Rural (APR)* (Requisitos y documentos necesarios)\n2️⃣ *Registro Social de Hogares (RSH)* (Horarios, actualización y citas)\n\n_Escribe tu opción (1-2) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_DIDECO' });
    }

    // 5. RAG / Consultas Libres
    if (cleanMsg === '5' || cleanMsg.includes('INFO') || cleanMsg.includes('GUIA')) {
      return NextResponse.json({
        reply: `ℹ️ *Consultas Normativas e Información Comunal (RAG)*\n\nPuedes hacerme preguntas directas, tales como:\n• _"¿Qué farmacia está de turno hoy?"_\n• _"¿Qué eventos hay este fin de semana en Trumao o Puerto Nuevo?"_\n• _"¿Cuál es el teléfono de Obras o Tránsito?"_\n• _"¿Cuáles son los horarios del municipio?"_\n\n_Escribe tu consulta o *MENU* para volver._`,
        next_step: 'AWAIT_RAG_QUERY'
      });
    }

    // Match RAG directo desde la raíz
    const ragMatch = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    if (ragMatch) {
      return NextResponse.json({ reply: ragMatch.response, next_step: 'INIT' });
    }

    return NextResponse.json({ reply: `⚠️ Opción no reconocida.\n\n${MENSAJE_INICIAL}`, next_step: 'INIT' });
  }

  // --- 5. SUBMENÚ INCIDENCIAS COMUNITARIAS ---
  if (step === 'SUB_INCIDENCIAS') {
    // Opción 1: Reporte Anónimo (Caminos, Hoyos, Luminarias, Ramas)
    if (cleanMsg === '1' || cleanMsg.includes('HOYO') || cleanMsg.includes('CAMINO') || cleanMsg.includes('LUMINARIA')) {
      return NextResponse.json({
        reply: `🕳️ *Reporte de Camino, Hoyo, Luminaria o Rama (100% Anónimo)*\n\n🛡️ _No solicitamos tu nombre ni RUT. Tu número no se publica._\n\nPor favor, escribe en un mensaje el lugar aproximado y el problema. Por ejemplo:\n👉 _"Hay un hoyo peligroso en el camino a Trumao en el km 10, adjunto foto"_\n\nSi puedes, adjunta una fotografía usando el botón de la cámara 📷:\n\n_Escribe *MENU* para cancelar._`,
        next_step: 'INCIDENCIA_ANONIMA_TEXTO'
      });
    }

    // Opción 2: Chatarra (Bifurcación: Domicilio vs Lugar Público)
    if (cleanMsg === '2' || cleanMsg.includes('CHATARRA') || cleanMsg.includes('BATERIA')) {
      return NextResponse.json({
        reply: `♻️ *Retiro de Chatarra, Baterías y Metales*\n\n¿Dónde se encuentra la chatarra u objetos a retirar?\n\n🅰️ *En mi domicilio o predio particular*\n🅱️ *En la vía pública, calle o sector rural de la comuna*\n\n_Responde con *A* o *B* (o escribe *MENU* para volver)._`,
        next_step: 'CHATARRA_UBICACION_SELECT'
      });
    }
  }

  // --- 6. PROCESAMIENTO DE REPORTE ANÓNIMO (HOYOS / CAMINOS / LUMINARIAS) ---
  if (step === 'INCIDENCIA_ANONIMA_TEXTO') {
    const folio = generarFolio();
    return NextResponse.json({
      reply: `✅ *Reporte Recibido y Foliado (${folio})*\n\n• *Tipo:* Incidencia en Vía Pública (100% Anónimo)\n• *Estado:* Derivado a Cuadrilla de Operaciones\n• *Detalle ingresado:* "${rawMessage}"\n\nTu aviso ha ingresado al panel de control municipal para programar la inspección en terreno.\n\n_Escribe *MENU* para realizar otro trámite._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Reporte Vecinal Anónimo',
        type: 'CAMINO',
        description: rawMessage || 'Reporte territorial en vía pública',
        slaMinutes: 120
      }
    });
  }

  // --- 7. FLUJO DE RETIRO DE CHATARRA ---
  if (step === 'CHATARRA_UBICACION_SELECT') {
    if (cleanMsg === 'A' || cleanMsg.includes('DOMICILIO') || cleanMsg.includes('CASA')) {
      return NextResponse.json({
        reply: `🏠 *Retiro de Chatarra en Domicilio Particular*\n\nPara que la cuadrilla coordine la visita a tu hogar, por favor indícanos:\n\n1. Tu *Nombre*\n2. Tu *Dirección o Sector rural exacto*\n3. Breve detalle de lo que necesitas retirar (ej: _"2 baterías viejas y planchas de zinc"_) y foto opcional 📷.\n\n_Escribe tus datos en un solo mensaje o *MENU* para cancelar._`,
        next_step: 'CHATARRA_DOMICILIO_DATOS'
      });
    }

    if (cleanMsg === 'B' || cleanMsg.includes('CALLE') || cleanMsg.includes('PUBLICA') || cleanMsg.includes('COMUNA')) {
      return NextResponse.json({
        reply: `🚜 *Chatarra o Microbasural en Espacio Público (100% Anónimo)*\n\nIndícanos la ubicación aproximada donde se encuentran los fierros, chatarra o escombros abandonados (ej: _"A orillas del camino a Mashue frente al puente"_). Si puedes, adjunta foto 📷:\n\n_Escribe tu mensaje o *MENU* para cancelar._`,
        next_step: 'CHATARRA_PUBLICA_TEXTO'
      });
    }
  }

  if (step === 'CHATARRA_DOMICILIO_DATOS') {
    const folio = generarFolio();
    return NextResponse.json({
      reply: `✅ *Solicitud de Retiro en Domicilio Registrada (${folio})*\n\n• *Estado:* Agendado para evaluación de ruta\n• *Datos registrados:* "${rawMessage}"\n\nLa Dirección de Operaciones o la empresa recicladora en convenio se comunicará o visitará el sector en las próximas rondas programadas.\n\n_Escribe *MENU* para volver al inicio._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Vecino en Domicilio',
        type: 'CHATARRA',
        description: `Retiro domicilio: ${rawMessage}`,
        slaMinutes: 180
      }
    });
  }

  if (step === 'CHATARRA_PUBLICA_TEXTO') {
    const folio = generarFolio();
    return NextResponse.json({
      reply: `✅ *Aviso de Chatarra en Espacio Público Foliado (${folio})*\n\n• *Tipo:* Limpieza y Retiro en Vía Pública (Anónimo)\n• *Ubicación informada:* "${rawMessage}"\n\nEl sector ha sido registrado en la hoja de ruta de aseo y reciclaje comunal.\n\n_Escribe *MENU* para volver al inicio._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Reporte Anónimo Vía Pública',
        type: 'CHATARRA',
        description: `Chatarra vía pública: ${rawMessage}`,
        slaMinutes: 240
      }
    });
  }

  // --- 8. SUBMENÚ TRÁNSITO (ORIENTACIÓN ASISTIVA RAG) ---
  if (step === 'SUB_TRANSITO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `🚗 *Guía de Pago: Permiso de Circulación*\n\n📄 *Documentos obligatorios para renovar:*\n1. Permiso de circulación del año anterior.\n2. Certificado de Revisión Técnica y Emisión de Gases vigente.\n3. Seguro Obligatorio de Accidentes Personales (SOAP) con vencimiento al 31 de marzo del próximo año.\n4. Padrón del vehículo (si hubo cambio de propietario).\n\n💳 *¿Dónde pagar?*\n• *En línea:* Directo en el portal oficial de la municipalidad:\n👉 https://pagos.munilaunion.cl/transito\n• *Presencial:* Dirección de Tránsito, Calle Comercio 340 (08:30 a 14:00 hrs).\n\n_Escribe *MENU* para volver o *0* para que te contacte un funcionario._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `🪪 *Licencias de Conducir - Dirección de Tránsito*\n\n• *Lugar de atención:* Calle Comercio 340.\n• *Horario de atención:* Lunes a Viernes de 08:30 a 13:30 hrs.\n\n📋 *Requisitos por trámite:*\n• *Renovación:* Cédula de identidad vigente y licencia anterior.\n• *Primera Licencia (Clase B/C):* 18 años cumplidos, certificado de estudios (mínimo 8° básico aprobado) y cédula de identidad.\n\n📅 *Agendamiento de horas:* Las horas se solicitan presencialmente en mesón de Tránsito o llamando al anexo 112 (+56 64 232 2000).\n\n_Escribe *0* si deseas solicitar orientación telefónica directa o *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: `⚖️ *Multas y Juzgado de Policía Local (JPL)*\n\n• *Juzgado de Policía Local de La Unión:* Calle Arturo Prat 680.\n• *Atención:* Lunes a Viernes de 08:30 a 13:00 hrs.\n\nℹ️ *¿Cómo saber si tu vehículo tiene multas impagas en el Registro Civil?*\nPuedes consultar el Certificado de Multas de Tránsito No Empadronadas directamente en el portal oficial del Registro Civil (\`registrocivil.cl\`) con la patente del móvil.\n\n_Escribe *MENU* para volver al menú principal._`,
        next_step: 'INIT'
      });
    }
  }

  // --- 9. SUBMENÚ RENTAS Y COMERCIO (ORIENTACIÓN RAG) ---
  if (step === 'SUB_RENTAS') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `🏪 *Patentes Comerciales, Industriales y Profesionales*\n\n📅 *Plazos de Pago:* Se cancelan semestralmente en los meses de **Enero** (1er semestre) y **Julio** (2do semestre).\n\n📄 *Requisitos para nueva patente:* Formulario de solicitud en Rentas, inicio de actividades del SII, acreditación de título de dominio o contrato de arriendo del local, y recepción definitiva de la Dirección de Obras (DOM).\n\n💳 *Pago en línea:* Si tu patente ya está enrolada, cancela en:\n👉 https://pagos.munilaunion.cl/rentas\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `🧺 *Derechos de Feria Libre y Permisos Ambulantes*\n\n• *Oficina encargada:* Departamento de Rentas y Patentes (Comercio 340).\n• *Pago mensual:* Se cancela los primeros 5 días hábiles de cada mes en Tesorería Municipal.\n• *Requisitos:* Cédula de identidad, registro en el padrón comunal de feriantes y pago al día de derechos de aseo.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: `🧹 *Derechos de Aseo Domiciliario*\n\n• *¿Quiénes pagan?* Las propiedades cuyo avalúo fiscal supere las 225 UTM y que no estén exentas por ley.\n• *Exención Adulto Mayor:* Personas mayores con vulnerabilidad socioeconómica (RSH) pueden postular en DIDECO durante el mes de octubre para exención total o parcial del año siguiente.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  // --- 10. SUBMENÚ DIDECO / SUBSIDIO APR ---
  if (step === 'SUB_DIDECO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `💧 *Orientación: Subsidio de Agua Potable Rural (APR)*\n\nPara que la asistente social tramite tu subsidio en los sectores rurales (Puerto Nuevo, Mashue, Choroico, Trumao, Llancacura), debes presentar en DIDECO:\n\n1. Fotocopia de la cédula de identidad del jefe(a) de hogar.\n2. Cartola del *Registro Social de Hogares (RSH)* en la comuna de La Unión (prioridad hasta el 40% y 60%).\n3. Última boleta o comprobante de pago emitido por tu comité de APR al día (sin deuda pendiente).\n\n📍 *Atención:* Manuel Montt 530, de Lunes a Viernes de 08:30 a 14:00 hrs.\n\n_Escribe *0* para solicitar un llamado municipal o *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `📋 *Registro Social de Hogares (RSH)*\n\n• *Presencial:* Departamento Social DIDECO (Manuel Montt 530).\n• *Documentos para actualizar:* Boleta de consumo para certificar domicilio (luz o agua) y cédula de identidad de los integrantes del hogar.\n• *En línea:* Puedes realizar solicitudes de ingreso y actualización directamente con tu ClaveÚnica en:\n👉 https://www.registrosocial.gob.cl\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  // --- 11. MOTOR RAG (PREGUNTAS LIBRES) ---
  if (step === 'AWAIT_RAG_QUERY') {
    const match = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    if (match) {
      return NextResponse.json({ reply: match.response, next_step: 'AWAIT_RAG_QUERY' });
    }
    return NextResponse.json({
      reply: `🏛️ *Asistente Comunal de La Unión*\n\nNo se encontró información oficial sobre "${rawMessage}". Recuerda que puedo responder sobre farmacias de turno, eventos locales en Trumao/Puerto Nuevo, teléfonos de departamentos o trámites municipales.\n\n_Escribe otra consulta, *MENU* para volver o *0* para que te contacte un funcionario._`,
      next_step: 'AWAIT_RAG_QUERY'
    });
  }

  return NextResponse.json({ reply: MENSAJE_INICIAL, next_step: 'INIT' });
}
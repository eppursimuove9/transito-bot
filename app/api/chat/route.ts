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
        reply: "🚜 *Aviso de Caminos o Luminarias (100% Anónimo)*\n\nIndícanos qué problema hay y dónde se ubica exactamente (por ejemplo: _\"Hay un hoyo en Arturo Prat cerca de la municipalidad\"_):\n\n_Escriba *MENU* para volver._",
        next_step: 'AWAIT_INCIDENCIA_DESCRIPCION'
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
    if (cleanMsg === '1' || cleanMsg.includes('TRANSITO')) {
      const sub = `🚗 *Dirección de Tránsito y Transporte Público*\n\nSelecciona el trámite sobre el que deseas orientación:\n\n1️⃣ *Permiso de Circulación* (Requisitos, fechas y enlace oficial de pago)\n2️⃣ *Licencias de Conducir* (Primeras licencias, renovaciones y cómo pedir hora)\n3️⃣ *Multas y JPL* (Dónde consultar y cómo pagar multas pendientes)\n\n_Escribe tu opción (1-3) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_TRANSITO' });
    }

    if (cleanMsg === '2' || cleanMsg.includes('RENTA') || cleanMsg.includes('PATENTE') || cleanMsg.includes('COMERCIO')) {
      const sub = `🏪 *Departamento de Rentas y Patentes Comerciales*\n\nSelecciona la consulta de tu interés:\n\n1️⃣ *Patentes Comerciales y MEF* (Requisitos de apertura, plazos y pago web)\n2️⃣ *Derechos de Feria Libre y Permisos Ambulantes* (Días de pago y requisitos)\n3️⃣ *Derechos de Aseo Domiciliario* (Quiénes pagan, exenciones adulto mayor)\n\n_Escribe tu opción (1-3) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_RENTAS' });
    }

    if (cleanMsg === '3' || cleanMsg.includes('INCIDENCIA') || cleanMsg.includes('CAMINO') || cleanMsg.includes('HOYO') || cleanMsg.includes('BACHE') || cleanMsg.includes('LUMINARIA') || cleanMsg.includes('CHATARRA')) {
      const sub = `🚜 *Reporte de Incidencias Comunitarias*\n\nCanal directo con la Dirección de Operaciones:\n\n1️⃣ 🕳️ *Reportar Hoyo, Camino en Mal Estado, Luminaria o Rama Caída* (100% Anónimo)\n2️⃣ ♻️ *Solicitar Retiro de Chatarra, Baterías o Metales*\n\n_Escribe 1 o 2, o escribe *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_INCIDENCIAS' });
    }

    if (cleanMsg === '4' || cleanMsg.includes('DIDECO') || cleanMsg.includes('APR')) {
      const sub = `🤝 *DIDECO - Orientación Social y Subsidios*\n\n1️⃣ *Subsidio al Agua Potable Rural (APR)* (Requisitos y documentos necesarios)\n2️⃣ *Registro Social de Hogares (RSH)* (Horarios, actualización y citas)\n\n_Escribe tu opción (1-2) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_DIDECO' });
    }

    if (cleanMsg === '5' || cleanMsg.includes('INFO') || cleanMsg.includes('GUIA')) {
      return NextResponse.json({
        reply: `ℹ️ *Consultas Normativas e Información Comunal (RAG)*\n\nPuedes hacerme preguntas directas:\n• _"¿Qué farmacia está de turno hoy?"_\n• _"¿Qué eventos hay este fin de semana en Trumao o Puerto Nuevo?"_\n• _"¿Cuál es el teléfono de Obras o Tránsito?"_\n• _"¿Cuáles son los horarios del municipio?"_\n\n_Escribe tu consulta o *MENU* para volver._`,
        next_step: 'AWAIT_RAG_QUERY'
      });
    }

    const ragMatch = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    if (ragMatch) {
      return NextResponse.json({ reply: ragMatch.response, next_step: 'INIT' });
    }

    return NextResponse.json({ reply: `⚠️ Opción no reconocida.\n\n${MENSAJE_INICIAL}`, next_step: 'INIT' });
  }

  // --- 5. SUBMENÚ INCIDENCIAS COMUNITARIAS ---
  if (step === 'SUB_INCIDENCIAS') {
    if (cleanMsg === '1' || cleanMsg.includes('HOYO') || cleanMsg.includes('CAMINO') || cleanMsg.includes('LUMINARIA')) {
      return NextResponse.json({
        reply: `🕳️ *Reporte de Hoyo, Camino, Luminaria o Rama (100% Anónimo)*\n\nPor favor, describe en un mensaje **el problema y la ubicación exacta o referencia cercana**.\n\nEjemplo:\n👉 _"Hay un hoyo profundo en Arturo Prat cerca de la municipalidad"_\n👉 _"Camino a Trumao km 10 rama grande sobre tendido"_\n\n_Escribe tu detalle o *MENU* para volver._`,
        next_step: 'AWAIT_INCIDENCIA_DESCRIPCION'
      });
    }

    if (cleanMsg === '2' || cleanMsg.includes('CHATARRA') || cleanMsg.includes('BATERIA')) {
      return NextResponse.json({
        reply: `♻️ *Retiro de Chatarra, Baterías y Metales*\n\n¿Dónde se encuentra la chatarra u objetos a retirar?\n\n🅰️ *En mi domicilio o predio particular*\n🅱️ *En la vía pública, calle o sector rural de la comuna*\n\n_Responde con *A* o *B* (o escribe *MENU* para volver)._`,
        next_step: 'CHATARRA_UBICACION_SELECT'
      });
    }
  }

  // --- 6. EXIGENCIA OBLIGATORIA DE FOTOGRAFÍA: INCIDENCIA EN VÍA PÚBLICA ---
  if (step === 'AWAIT_INCIDENCIA_DESCRIPCION') {
    return NextResponse.json({
      reply: `📍 *Ubicación y Detalle Registrado:*\n"${rawMessage}"\n\n📸 **FOTOGRAFÍA OBLIGATORIA:**\nPara que la municipalidad corrobore la incidencia y despache la cuadrilla, **es obligatorio adjuntar una fotografía del problema**.\n\n👉 Por favor, presiona el botón de la cámara 📷 en el chat y envía la foto de evidencia ahora.\n\n_(Sin la fotografía no será posible generar el folio ni validar la visita en terreno. Escribe *MENU* si deseas cancelar)_.`,
      next_step: 'AWAIT_INCIDENCIA_FOTO'
    });
  }

  if (step === 'AWAIT_INCIDENCIA_FOTO') {
    // FILTRO ESTRICTO: Si no viene foto, se rechaza y no se genera folio
    if (!hasImage) {
      return NextResponse.json({
        reply: `⚠️ **Falta la Fotografía de Evidencia**\n\nNo hemos recibido la foto del problema. Por protocolo municipal para evitar el gasto innecesario de recursos, **no podemos emitir un folio de inspección sin una imagen que corrobore el hecho**.\n\n📷 Usa el botón de la cámara adjunto al chat para subir la foto.\n_O escribe *MENU* para cancelar el reporte._`,
        next_step: 'AWAIT_INCIDENCIA_FOTO'
      });
    }

    const folio = generarFolio();
    return NextResponse.json({
      reply: `✅ *Incidencia Verificada y Foliada (${folio})*\n\n• *Tipo:* Vía Pública (100% Anónimo)\n• *Evidencia:* Fotografía adjuntada y validada 📸\n• *Estado:* Ingresado a la Hoja de Ruta de Operaciones\n\nTu requerimiento ya se visualiza en el panel directivo \`/admin\` para coordinar la inspección en terreno.\n\n_Escribe *MENU* para realizar otro trámite._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Reporte Anónimo con Foto',
        type: 'CAMINO',
        description: 'Incidencia vial con foto de evidencia adjunta',
        slaMinutes: 120
      }
    });
  }

  // --- 7. EXIGENCIA OBLIGATORIA DE FOTOGRAFÍA: RETIRO DE CHATARRA ---
  if (step === 'CHATARRA_UBICACION_SELECT') {
    if (cleanMsg === 'A' || cleanMsg.includes('DOMICILIO') || cleanMsg.includes('CASA')) {
      return NextResponse.json({
        reply: `🏠 *Retiro de Chatarra en Domicilio*\n\nIndícanos tu **Nombre**, **Dirección / Sector exacto** y una breve descripción de lo que se va a retirar (ej: _"Héctor Manqui, Parcela 14 Puerto Nuevo, 2 baterías de tractor y fierros"_):\n\n_Escribe tus datos o *MENU* para cancelar._`,
        next_step: 'AWAIT_CHATARRA_DOMICILIO_DESC'
      });
    }

    if (cleanMsg === 'B' || cleanMsg.includes('CALLE') || cleanMsg.includes('PUBLICA') || cleanMsg.includes('COMUNA')) {
      return NextResponse.json({
        reply: `🚜 *Chatarra en Espacio Público (100% Anónimo)*\n\nIndícanos la ubicación o punto de referencia exacto donde se encuentran los residuos abandonados:\n\n_Escribe el lugar o *MENU* para cancelar._`,
        next_step: 'AWAIT_CHATARRA_PUBLICA_DESC'
      });
    }
  }

  // Chatarra Domicilio: Paso 1 Texto -> Paso 2 Foto Obligatoria
  if (step === 'AWAIT_CHATARRA_DOMICILIO_DESC') {
    return NextResponse.json({
      reply: `📝 *Datos de Domicilio Registrados:*\n"${rawMessage}"\n\n📸 **FOTOGRAFÍA OBLIGATORIA:**\nPara evaluar el volumen y destinar el camión adecuado, **es obligatorio adjuntar una fotografía de los objetos/chatarra a retirar**.\n\n👉 Envía la foto usando el botón de la cámara 📷 ahora.\n\n_(Escribe *MENU* para cancelar)._`,
      next_step: 'AWAIT_CHATARRA_DOMICILIO_FOTO'
    });
  }

  if (step === 'AWAIT_CHATARRA_DOMICILIO_FOTO') {
    if (!hasImage) {
      return NextResponse.json({
        reply: `⚠️ **Falta la Fotografía de la Chatarra**\n\nPara autorizar la orden de retiro es indispensable contar con una foto del volumen de metales o baterías acumuladas.\n\n📷 Por favor presiona el botón de la cámara y adjunta la imagen.\n_O escribe *MENU* para volver._`,
        next_step: 'AWAIT_CHATARRA_DOMICILIO_FOTO'
      });
    }

    const folio = generarFolio();
    return NextResponse.json({
      reply: `✅ *Solicitud de Retiro en Domicilio Foliada (${folio})*\n\n• *Estado:* En cola de despacho de cuadrilla\n• *Evidencia:* Volumen fotográfico corroborado 📸\n\nEl equipo municipal o reciclador asociado coordinará la visita al domicilio indicado.\n\n_Escribe *MENU* para volver al inicio._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Vecino en Domicilio',
        type: 'CHATARRA',
        description: 'Retiro domicilio con evidencia fotográfica obligatoria',
        slaMinutes: 180
      }
    });
  }

  // Chatarra Vía Pública: Paso 1 Texto -> Paso 2 Foto Obligatoria
  if (step === 'AWAIT_CHATARRA_PUBLICA_DESC') {
    return NextResponse.json({
      reply: `📍 *Lugar Informado:*\n"${rawMessage}"\n\n📸 **FOTOGRAFÍA OBLIGATORIA:**\nPara no enviar cuadrillas a verificar avisos sin sustento, **debes adjuntar la fotografía del lugar y la chatarra abandonada**.\n\n👉 Adjunta la foto con el botón 📷 para generar el ticket municipal.\n\n_(Escribe *MENU* para cancelar)._`,
      next_step: 'AWAIT_CHATARRA_PUBLICA_FOTO'
    });
  }

  if (step === 'AWAIT_CHATARRA_PUBLICA_FOTO') {
    if (!hasImage) {
      return NextResponse.json({
        reply: `⚠️ **Fotografía Requerida**\n\nNo es posible generar una orden de cuadrilla en vía pública sin la evidencia fotográfica correspondiente.\n\n📷 Adjunta la foto con la cámara para completar el trámite o escribe *MENU* para cancelar.`,
        next_step: 'AWAIT_CHATARRA_PUBLICA_FOTO'
      });
    }

    const folio = generarFolio();
    return NextResponse.json({
      reply: `✅ *Aviso de Chatarra en Espacio Público Foliado (${folio})*\n\n• *Tipo:* Retiro en Vía Pública (100% Anónimo)\n• *Evidencia:* Foto confirmada 📸\n• *Estado:* Programado para recorrido de aseo pesado\n\n_Escribe *MENU* para volver al menú principal._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Aviso Anónimo Vía Pública',
        type: 'CHATARRA',
        description: 'Residuos en vía pública con foto corroborada',
        slaMinutes: 240
      }
    });
  }

  // --- 8. SUBMENÚ TRÁNSITO (ORIENTACIÓN RAG) ---
  if (step === 'SUB_TRANSITO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `🚗 *Guía de Pago: Permiso de Circulación*\n\n📄 *Documentos obligatorios para renovar:*\n1. Permiso de circulación anterior pagado.\n2. Certificado de Revisión Técnica y Gases vigente.\n3. Seguro Obligatorio (SOAP) vigente al 31 de marzo del próximo año.\n4. Padrón del vehículo (si hubo transferencia).\n\n💳 *¿Dónde pagar?*\n• *En línea:* En el portal oficial: https://pagos.munilaunion.cl/transito\n• *Presencial:* Dirección de Tránsito, Comercio 340 (08:30 a 14:00 hrs).\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `🪪 *Licencias de Conducir - Dirección de Tránsito*\n\n• *Atención:* Calle Comercio 340 (08:30 a 13:30 hrs).\n• *Renovaciones:* Cédula de identidad vigente y licencia anterior.\n• *Primera Licencia:* 18 años, certificado de estudios (mínimo 8° básico) y cédula.\n\n📅 *Agendamiento:* Presencial en mesón o al anexo 112 (+56 64 232 2000).\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: `⚖️ *Multas y JPL de La Unión*\n\n• *Juzgado de Policía Local:* Calle Arturo Prat 680.\n• *Atención:* Lunes a Viernes de 08:30 a 13:00 hrs.\n\nℹ️ Consulta el Certificado de Multas No Empadronadas en \`registrocivil.cl\` con la patente del vehículo.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  // --- 9. SUBMENÚ RENTAS (ORIENTACIÓN RAG) ---
  if (step === 'SUB_RENTAS') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `🏪 *Patentes Comerciales e Industriales*\n\n📅 *Plazos:* Vencen semestralmente en Enero y Julio.\n💳 *Pago en línea:* https://pagos.munilaunion.cl/rentas\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `🧺 *Derechos de Feria Libre y Ambulantes*\n\n• *Oficina:* Departamento de Rentas (Comercio 340).\n• *Pago:* Primeros 5 días hábiles de cada mes en Tesorería.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: `🧹 *Derechos de Aseo Domiciliario*\n\n• Aplica a avalúos fiscales sobre 225 UTM.\n• Adultos mayores con vulnerabilidad pueden postular a exención en DIDECO durante octubre.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  // --- 10. SUBMENÚ DIDECO ---
  if (step === 'SUB_DIDECO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `💧 *Orientación: Subsidio Agua Potable Rural (APR)*\n\nRequisitos para postular en DIDECO (Manuel Montt 530):\n1. Fotocopia cédula de identidad del jefe(a) de hogar.\n2. Cartola Registro Social de Hogares en La Unión (hasta 60%).\n3. Última boleta del comité de APR pagada y al día.\n\n_Escribe *MENU* para volver o *0* para contacto telefónico._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `📋 *Registro Social de Hogares (RSH)*\n\n• *Presencial:* Manuel Montt 530 (08:30 a 14:00 hrs).\n• *En línea:* https://www.registrosocial.gob.cl (con ClaveÚnica).\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  // --- 11. MOTOR RAG LIBRE ---
  if (step === 'AWAIT_RAG_QUERY') {
    const match = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    if (match) {
      return NextResponse.json({ reply: match.response, next_step: 'AWAIT_RAG_QUERY' });
    }
    return NextResponse.json({
      reply: `🏛️ *Asistente Comunal de La Unión*\n\nNo se encontró información oficial sobre "${rawMessage}". Recuerda que puedo responder sobre farmacias de turno, eventos comunales, teléfonos o trámites municipales.\n\n_Escribe otra consulta o *MENU* para volver._`,
      next_step: 'AWAIT_RAG_QUERY'
    });
  }

  return NextResponse.json({ reply: MENSAJE_INICIAL, next_step: 'INIT' });
}
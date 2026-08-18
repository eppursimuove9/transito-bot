import { NextResponse } from 'next/server';

// --- BASE DE DATOS TRANSACCIONAL ---
const VEHICULOS_DB: Record<string, any> = {
  "ABCD12": {
    ppu: "ABCD12",
    marca: "Toyota",
    modelo: "Hilux 4x4",
    anio: 2021,
    comuna: "Purranque",
    sector: "Corte Alto",
    propietario: "Juan Carlos Gallardo",
    propietario_run: "17.894.562-K",
    prt_vigente: true,
    prt_vence: "30-Nov-2026",
    soap_vigente: true,
    multas: [],
    valor_permiso: 54200,
    folio_anterior: "PUR-2025-08912"
  },
  "GFHY45": {
    ppu: "GFHY45",
    marca: "Nissan",
    modelo: "Terrano",
    anio: 2018,
    comuna: "Purranque",
    sector: "Hueyusca",
    propietario: "María Elena Soto",
    propietario_run: "15.432.987-4",
    prt_vigente: true,
    prt_vence: "31-Oct-2026",
    soap_vigente: true,
    multas: [
      { juzgado: "JPL Purranque", motivo: "Estacionar sobre acera", monto: 35000 }
    ],
    valor_permiso: 38000,
    folio_anterior: "PUR-2025-04311"
  },
  "KJTR88": {
    ppu: "KJTR88",
    marca: "Chevrolet",
    modelo: "Sail",
    anio: 2017,
    comuna: "Purranque",
    sector: "Crucero",
    propietario: "Pedro Almonacid",
    propietario_run: "18.765.432-1",
    prt_vigente: false,
    prt_vence: "31-Mar-2026 (VENCIDA)",
    soap_vigente: true,
    multas: [],
    valor_permiso: 31000,
    folio_anterior: "PUR-2025-01290"
  }
};

const PATENTES_COMERCIALES_DB: Record<string, any> = {
  "76123456-7": {
    rut: "76.123.456-7",
    razon_social: "Agrícola y Quesos Corte Alto SpA",
    rol: "ROL-COM-2026-412",
    tipo: "Microempresa Familiar (MEF) / Agro",
    estado: "AL_DIA",
    monto_semestre: 42300,
    vencimiento: "31-Jul-2026"
  }
};

const ASEO_DOMICILIARIO_DB: Record<string, any> = {
  "123-45": {
    rol: "123-45",
    direccion: "Pedro Montt 340, Purranque",
    titular: "Héctor Barría",
    cuotas_pendientes: 2,
    monto_total: 18400
  }
};

// --- BASE DE CONOCIMIENTO MUNICIPAL (RAG SIMULADO) ---
const KNOWLEDGE_BASE = [
  {
    keywords: ["EVENTO", "VERANO", "FIESTA", "COSTUMBRISTA", "FESTIVAL", "SEMANA", "SHOW"],
    response: `🎭 *Eventos y Actividades de Verano 2026*\n\n• *Festival Costumbrista de Hueyusca:* Sábado y Domingo en Recinto Los Castaños (Música en vivo, gastronomía típica y artesanía).\n• *Feria de Tradiciones Corte Alto:* Próximo fin de semana en Plaza de Armas.\n• *Noche Purranquina:* Cierre del verano con artistas nacionales en el Gimnasio Municipal.\n\n📄 [Descargar_Programa_Completo_Verano_2026.pdf]\n\n_Escribe otra pregunta o *MENU* para volver._`
  },
  {
    keywords: ["FARMACIA", "TURNO", "MEDICAMENTO", "REMEDIO", "SALUD"],
    response: `💊 *Farmacia de Turno en Purranque*\n\n• *Farmacia Cruz Verde (Pedro Montt 210)*\n• *Turno:* 24 Horas disponible hoy.\n• *Fono Central:* +56 64 235 1200\n• *CESFAM Purranque Urgencias (SAPU):* Abierto 24/7 en 21 de Mayo 450.\n\n_Escribe otra pregunta o *MENU* para volver._`
  },
  {
    keywords: ["TELEFONO", "ANEXO", "NUMERO", "CONTACTO", "DIDECO", "OBRAS", "DOM", "ALCALDIA"],
    response: `📞 *Directorio y Anexos Telefónicos Municipales*\n\n• *Central Telefónica:* +56 64 235 1200\n• *DIDECO (Social y Subsidios):* Anexo 104 • \`dideco@purranque.cl\`\n• *Dirección de Obras (DOM):* Anexo 108 • \`obras@purranque.cl\`\n• *Tránsito y Licencias:* Anexo 112 • \`transito@purranque.cl\`\n• *Seguridad Ciudadana & Cuadrante:* +56 9 8765 4321 (24/7)\n\n_Escribe otra pregunta o *MENU* para volver._`
  },
  {
    keywords: ["SUBSIDIO", "AGUA", "RSH", "REGISTRO SOCIAL", "LEÑA", "AYUDA SOCIAL"],
    response: `🤝 *Subsidios y Beneficios Sociales DIDECO*\n\n• *Subsidio al Agua Potable Rural (APR):* Postulaciones abiertas en DIDECO (Requisito: RSH hasta el 60%).\n• *Actualización de Registro Social de Hogares:* Atención de lunes a viernes de 08:30 a 14:00 hrs.\n\n📄 [Descargar_Guia_Postulacion_Subsidios_2026.pdf]\n\n_Escribe otra pregunta o *MENU* para volver._`
  }
];

const MENU_PRINCIPAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de Purranque* 🇨🇱

Selecciona el área de tu trámite:

1️⃣ 🚗 *Tránsito y Vehículos* (Permisos, Duplicados, Licencias, Multas)
2️⃣ 🏪 *Negocios y Rentas* (Patentes Comerciales, Ferias, Certificados)
3️⃣ 🏡 *Vecinos y Hogar* (Aseo, Caminos, Ramas y Chatarra)
4️⃣ ℹ️ *Información, Eventos y Guía Comunal* (Preguntas Libres / RAG)
0️⃣ 👤 *Solicitar que un funcionario municipal me llame*

_Escribe el número de tu opción (1, 2, 3, 4 o 0)._`;

const MENU_TRANSITO = `🚗 *Dirección de Tránsito - Municipalidad de Purranque*

1️⃣ Pagar Permiso de Circulación (Pago Express por Patente)
2️⃣ Obtener Duplicado de Permiso (PDF Oficial)
3️⃣ Consultar y Pagar Multas JPL pendientes
4️⃣ Agendar Licencia (Pre-chequeo rural con ClaveÚnica)

_Escribe tu opción (1-4), *0* para funcionario o *MENU* para volver._`;

const MENU_RENTAS = `🏪 *Departamento de Rentas y Patentes Comerciales*

1️⃣ Consultar y Pagar Patente Comercial / MEF (Por RUT)
2️⃣ Pago de Derechos de Feria Libre / Permiso Ambulante
3️⃣ Descargar Certificado de Patente al Día (PDF)

_Escribe tu opción (1-3), *0* para funcionario o *MENU* para volver._`;

const MENU_VECINOS = `🏡 *Servicios Comunitarios y Atención al Vecino*

1️⃣ Consultar / Pagar Derechos de Aseo Domiciliario (Por Rol)
2️⃣ Reportar estado de camino rural o luminaria (100% Anónimo + Foto)
3️⃣ Solicitar retiro de ramas y escombros (Con foto de evidencia)
4️⃣ Retiro de Chatarra y Residuos Contaminantes (Baterías, fierros, metales)

_Escribe tu opción (1-4), *0* para funcionario o *MENU* para volver._`;

export async function POST(req: Request) {
  const { message, step } = await req.json();
  const cleanMsg = (message || '').trim().toUpperCase();

  // COMANDO DE TRANSFERENCIA A EJECUTIVO / FUNCIONARIO HUMANO
  if (['0', 'EJECUTIVO', 'HUMANO', 'PERSONA', 'FUNCIONARIO', 'SECRETARIA', 'AYUDA'].includes(cleanMsg)) {
    const ticketId = "ATN-" + Math.floor(1000 + Math.random() * 9000);
    return NextResponse.json({
      reply: `👤 *Solicitud de Contacto Telefónico (#${ticketId})*\n\nUn funcionario municipal se comunicará contigo al teléfono asociado a este chat.\n\n⏰ *Horario de Atención:* Lunes a Viernes de 08:30 a 14:00 hrs.\n\n_Tu orden fue enviada a la bandeja institucional con todo el historial de la conversación._\n\n*(Escribe 'MENU' para volver al asistente automatizado)*`,
      next_step: 'AWAIT_HUMAN_CHAT'
    });
  }

  // COMANDO UNIVERSAL DE REGRESO AL MENÚ
  if (['MENU', 'VOLVER', 'CANCELAR', 'INICIO', 'HOLA', 'SALIR'].includes(cleanMsg)) {
    return NextResponse.json({
      reply: MENU_PRINCIPAL,
      next_step: 'INIT'
    });
  }

  if (step === 'AWAIT_HUMAN_CHAT') {
    return NextResponse.json({
      reply: `📩 *Mensaje anexado al ticket:* "${message}"\n\nEl funcionario revisará tus antecedentes antes de llamarte.\n\n_Escribe *MENU* para volver al menú principal._`,
      next_step: 'AWAIT_HUMAN_CHAT'
    });
  }

  // --- 1. MENÚ PRINCIPAL ---
  if (step === 'INIT') {
    if (cleanMsg === '1' || cleanMsg.includes('TRANSITO') || cleanMsg.includes('VEHICULO')) {
      return NextResponse.json({ reply: MENU_TRANSITO, next_step: 'SUBMENU_TRANSITO' });
    }
    if (cleanMsg === '2' || cleanMsg.includes('COMERCIO') || cleanMsg.includes('RENTA') || cleanMsg.includes('NEGOCIO')) {
      return NextResponse.json({ reply: MENU_RENTAS, next_step: 'SUBMENU_RENTAS' });
    }
    if (cleanMsg === '3' || cleanMsg.includes('VECINO') || cleanMsg.includes('HOGAR') || cleanMsg.includes('ASEO') || cleanMsg.includes('CAMINO') || cleanMsg.includes('CHATARRA')) {
      return NextResponse.json({ reply: MENU_VECINOS, next_step: 'SUBMENU_VECINOS' });
    }
    if (cleanMsg === '4' || cleanMsg.includes('INFO') || cleanMsg.includes('EVENTO') || cleanMsg.includes('GUIA') || cleanMsg.includes('PREGUNTA')) {
      return NextResponse.json({
        reply: `ℹ️ *Centro de Información, Eventos y Guía Comunal (RAG)*\n\nPregúntame lo que necesites en lenguaje natural, por ejemplo:\n• _"¿Qué eventos hay este fin de semana?"_\n• _"¿Cuál es la farmacia de turno hoy?"_\n• _"¿Qué número tiene DIDECO u Obras?"_\n• _"¿Cómo postular al subsidio de agua potable?"_\n\n_Escribe tu consulta o *MENU* para volver._`,
        next_step: 'AWAIT_RAG_QUERY'
      });
    }

    // Si el usuario escribe una pregunta abierta directamente en el inicio, intentamos procesarla vía RAG
    const ragMatch = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    if (ragMatch) {
      return NextResponse.json({
        reply: `${ragMatch.response}`,
        next_step: 'AWAIT_RAG_QUERY'
      });
    }

    return NextResponse.json({
      reply: `⚠️ Opción no válida.\n\n${MENU_PRINCIPAL}`,
      next_step: 'INIT'
    });
  }

  // --- RAG: PROCESAMIENTO DE PREGUNTAS LIBRES ---
  if (step === 'AWAIT_RAG_QUERY') {
    const match = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    
    if (match) {
      return NextResponse.json({
        reply: `${match.response}`,
        next_step: 'AWAIT_RAG_QUERY'
      });
    }

    // Guardrail: Protección de tokens fuera de contexto municipal
    return NextResponse.json({
      reply: `🏛️ *Asistente Municipal de Purranque*\n\nNo encontré información oficial sobre "${message}". Recuerda que solo puedo resolver consultas sobre trámites, eventos, directorios y beneficios de la comuna.\n\n💡 *Puedes consultar por:* Eventos de verano, Farmacias de turno, Teléfonos de departamentos o Subsidios.\n\n_O escribe *0* para solicitar que un funcionario te llame._`,
      next_step: 'AWAIT_RAG_QUERY'
    });
  }

  // --- 2. SUBMENÚ TRÁNSITO ---
  if (step === 'SUBMENU_TRANSITO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🚗 *Pago Express de Permiso de Circulación*\n\nIngresa la *Placa Patente (PPU)* de tu vehículo (ej: `ABCD12`, `GFHY45`):\n\n_Escribe *MENU* para volver o *0* para un funcionario._",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "📄 *Duplicado de Permiso de Circulación*\n\nIngresa la *Placa Patente* para buscar la copia oficial timbrada:\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_DUPLICADO'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: "⚖️ *Consulta de Multas - Juzgado de Policía Local Purranque*\n\nIngresa la *Placa Patente* a consultar (ej: `GFHY45`):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_PATENTE_MULTA'
      });
    }
    if (cleanMsg === '4') {
      return NextResponse.json({
        reply: "🪪 *Licencias de Conducir - Pre-chequeo Rural*\n\nPara revisar tu hoja de vida del conductor y evitar traslados en vano, requerimos autenticación vía *ClaveÚnica*:",
        requires_auth: true,
        tramite_id: "LIC-2026-PURR",
        next_step: 'AUTH_PENDING'
      });
    }
  }

  // --- 3. SUBMENÚ RENTAS Y COMERCIO ---
  if (step === 'SUBMENU_RENTAS') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🏪 *Consulta de Patente Comercial / MEF*\n\nIngresa el RUT de la empresa o titular (ej: `76123456-7`):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "🧺 *Pago de Derechos de Feria Libre / Ambulante*\n\nIngresa tu RUN de comerciante registrado en Purranque:\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_RUN_FERIA'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: "📜 *Certificado de Patente Comercial al Día*\n\nIngresa el RUT de la empresa para emitir el certificado digital con firma electrónica:\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_RUT_CERTIFICADO'
      });
    }
  }

  // --- 4. SUBMENÚ VECINOS Y HOGAR ---
  if (step === 'SUBMENU_VECINOS') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🧹 *Derechos de Aseo Domiciliario*\n\nIngresa el *Rol de Avalúo* de tu propiedad (ej: `123-45`):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_ROL_ASEO'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "🚜 *Reportes de Caminos Rurales y Luminarias (100% Anónimo)*\n\n🛡️ _Este canal es directo y privado con la Dirección de Operaciones._\n\n¿En qué sector se ubica el problema? (Corte Alto, Hueyusca, Crucero, Concordia, Manquemapu):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_SECTOR_REPORTE'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: "🌿 *Solicitud de Retiro de Ramas y Escombros*\n\nIndica tu sector y una breve descripción de los escombros o ramas a retirar:\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_RAMAS_DESC'
      });
    }
    if (cleanMsg === '4') {
      return NextResponse.json({
        reply: "♻️ *Retiro de Chatarra y Residuos Contaminantes*\n\nServicio enfocado en evacuar fierros, baterías de auto, electrodomésticos en desuso u otros metales acumulados.\n\nIndica tu sector y detalle de la chatarra:\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_CHATARRA_DESC'
      });
    }
  }

  // --- CASOS ESPECÍFICOS TRANSACCIONALES ---

  // Tránsito: Pago Express
  if (step === 'AWAIT_PATENTE') {
    const vehiculo = VEHICULOS_DB[cleanMsg];
    if (!vehiculo) {
      return NextResponse.json({
        reply: `⚠️ La patente *${cleanMsg}* no registra en Purranque. Patentes de prueba: \`ABCD12\` (Al día), \`GFHY45\` (Multa JPL).\n\n_Escribe otra patente, *MENU* para volver o *0* para un funcionario._`,
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (!vehiculo.prt_vigente) {
      return NextResponse.json({
        reply: `🛑 *Trámite Bloqueado: Revisión Técnica Vencida*\n\nVehículo: *${vehiculo.marca} ${vehiculo.modelo}*\nSector: *${vehiculo.sector}*\nEstado: *${vehiculo.prt_vence}*\n\nℹ️ Para no perder el viaje a Purranque, regulariza en planta PRT antes de pagar.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }

    const totalMultas = vehiculo.multas.reduce((acc: number, m: any) => acc + m.monto, 0);
    const totalPagar = vehiculo.valor_permiso + totalMultas;

    let d = `✅ *Vehículo Habilitado para Pago Express*\n\n`;
    d += `• Patente: *${vehiculo.ppu}*\n`;
    d += `• Propietario: *${vehiculo.propietario}*\n`;
    d += `• Sector: *${vehiculo.sector}*\n\n`;
    d += `💰 *Liquidación:*\n`;
    d += `• Permiso: *$${vehiculo.valor_permiso.toLocaleString('es-CL')}*\n`;
    if (totalMultas > 0) d += `• Multas JPL: *$${totalMultas.toLocaleString('es-CL')}*\n`;
    d += `• *TOTAL A PAGAR: $${totalPagar.toLocaleString('es-CL')}*\n\n`;
    d += `¿Deseas pagar ahora vía Webpay? Responde *SI* o escribe *MENU* para cancelar.`;

    return NextResponse.json({ reply: d, next_step: 'CONFIRM_PAYMENT' });
  }

  // Tránsito: Duplicados
  if (step === 'AWAIT_DUPLICADO') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v) {
      return NextResponse.json({
        reply: `⚠️ No se encontró registro para *${cleanMsg}*. Escribe otra patente o *MENU* para volver.`,
        next_step: 'AWAIT_DUPLICADO'
      });
    }
    return NextResponse.json({
      reply: `✅ *Duplicado Oficial Encontrado*\n\nVehículo: *${v.marca} ${v.modelo}*\nFolio SUBDERE: *${v.folio_anterior}*\n\n📄 Copia timbrada lista para descarga:\n👉 [Descargar_Duplicado_${v.ppu}.pdf]\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7* o escribe un comentario corto, opcional):`,
      next_step: 'ASK_FEEDBACK'
    });
  }

  // Tránsito: Consulta Multas JPL
  if (step === 'AWAIT_PATENTE_MULTA') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v || v.multas.length === 0) {
      return NextResponse.json({
        reply: `✅ La patente *${cleanMsg}* no registra multas de Policía Local en Purranque.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    return NextResponse.json({
      reply: `⚠️ *Infracciones Pendientes en JPL Purranque:*\n\n• Causa: *${v.multas[0].motivo}*\n• Tribunal: *${v.multas[0].juzgado}*\n• Monto: *$${v.multas[0].monto.toLocaleString('es-CL')}*\n\n¿Deseas liquidar esta multa? Responde *SI* o *MENU* para cancelar.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Rentas: Patentes Comerciales
  if (step === 'AWAIT_RUT_COMERCIAL' || step === 'AWAIT_RUT_CERTIFICADO') {
    const raw = cleanMsg.replace(/\./g, '');
    const p = PATENTES_COMERCIALES_DB[raw];
    if (!p) {
      return NextResponse.json({
        reply: `⚠️ RUT no encontrado. Para la demo usa: \`76123456-7\` (Quesos Corte Alto).\n\n_Escribe otro RUT o *MENU* para volver._`,
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    if (step === 'AWAIT_RUT_CERTIFICADO') {
      return NextResponse.json({
        reply: `📜 *Certificado de Patente al Día*\n\n• Razón Social: *${p.razon_social}*\n• Rol: *${p.rol}*\n\n📄 Documento timbrado listo:\n👉 [Descargar_Certificado_${p.rol}.pdf]\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
        next_step: 'ASK_FEEDBACK'
      });
    }
    return NextResponse.json({
      reply: `🏪 *Patente Comercial Encontrada*\n\n• Razón Social: *${p.razon_social}*\n• Rol: *${p.rol}*\n• Valor 1er Semestre: *$${p.monto_semestre.toLocaleString('es-CL')}*\n\n¿Pagar ahora vía Webpay? Responde *SI* o *MENU* para volver.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Vecinos: Aseo Domiciliario
  if (step === 'AWAIT_ROL_ASEO') {
    const a = ASEO_DOMICILIARIO_DB[cleanMsg];
    if (!a) {
      return NextResponse.json({
        reply: `⚠️ Rol no registrado en Purranque. Usa el Rol demo: \`123-45\`.\n\n_Escribe otro Rol o *MENU* para volver._`,
        next_step: 'AWAIT_ROL_ASEO'
      });
    }
    return NextResponse.json({
      reply: `🧹 *Derechos de Aseo Domiciliario*\n\n• Propiedad: *${a.direccion}*\n• Cuotas Pendientes: *${a.cuotas_pendientes}*\n• Total a Pagar: *$${a.monto_total.toLocaleString('es-CL')}*\n\n¿Deseas pagar en línea? Responde *SI* o *MENU* para volver.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Vecinos: Reporte Anónimo Camino
  if (step === 'AWAIT_SECTOR_REPORTE') {
    return NextResponse.json({
      reply: `📍 Sector registrado: *${message}*.\n\n📸 Describe brevemente el problema y adjunta una fotografía (usa el botón de la cámara 📷 en el chat):\n\n_Escribe *MENU* para cancelar._`,
      next_step: 'AWAIT_FOTO_REPORTE'
    });
  }

  if (step === 'AWAIT_FOTO_REPORTE') {
    const folio = "REP-" + Math.floor(1000 + Math.random() * 9000);
    return NextResponse.json({
      reply: `✅ *Reporte Recibido y Foliado (#${folio})*\n\n📸 *Evidencia:* Foto adjuntada con éxito.\n🛡️ *Privacidad:* 100% Anónimo ante redes sociales.\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
      next_step: 'ASK_FEEDBACK'
    });
  }

  // Vecinos: Retiro de Ramas y Escombros
  if (step === 'AWAIT_RAMAS_DESC') {
    return NextResponse.json({
      reply: `📝 Solicitud registrada: "${message}".\n\n📸 *Paso final:* Adjunta una fotografía de las ramas o escombros acumulados (usa el botón de la cámara 📷):\n\n_Escribe *MENU* para cancelar._`,
      next_step: 'AWAIT_RAMAS_FOTO'
    });
  }

  if (step === 'AWAIT_RAMAS_FOTO') {
    const folio = "RAM-" + Math.floor(1000 + Math.random() * 9000);
    return NextResponse.json({
      reply: `✅ *Solicitud de Retiro de Ramas Ingresada (#${folio})*\n\n📸 Foto de evidencia registrada.\n🚛 El camión municipal pasará según la programación de rutas sectoriales.\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
      next_step: 'ASK_FEEDBACK'
    });
  }

  // Vecinos: Retiro de Chatarra
  if (step === 'AWAIT_CHATARRA_DESC') {
    return NextResponse.json({
      reply: `📝 Detalle registrado: "${message}".\n\n📸 *Paso final:* Adjunta una fotografía de la chatarra, baterías o metales (usa el botón de la cámara 📷) para coordinar el retiro seguro:\n\n_Escribe *MENU* para cancelar._`,
      next_step: 'AWAIT_CHATARRA_FOTO'
    });
  }

  if (step === 'AWAIT_CHATARRA_FOTO') {
    const folio = "CHAT-" + Math.floor(1000 + Math.random() * 9000);
    return NextResponse.json({
      reply: `✅ *Solicitud de Retiro de Chatarra Ingresada (#${folio})*\n\n📸 Evidencia fotográfica registrada.\n🤝 Datos y foto derivados a la empresa recicladora colaboradora para retiro seguro.\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
      next_step: 'ASK_FEEDBACK'
    });
  }

  // Paso Feedback
  if (step === 'ASK_FEEDBACK') {
    return NextResponse.json({
      reply: `⭐ ¡Muchas gracias por tu evaluación de "${message}"! Tu opinión nos ayuda a mejorar la atención ciudadana en Purranque 🇨🇱\n\nEscribe *MENU* para realizar otro trámite.`,
      next_step: 'INIT'
    });
  }

  // Confirmación de Pagos
  if (step === 'CONFIRM_PAYMENT') {
    if (cleanMsg === 'SI' || cleanMsg === 'SÍ') {
      return NextResponse.json({
        reply: `💳 *Pasarela Segura Municipal (Webpay / TGR)*\n\n🔗 https://pagos.purranque.cl/pay/tx_998234\n\n⏳ _Expira en 15 minutos._\n\n*(Escribe 'PAGADO' para simular confirmación bancaria o 'MENU' para cancelar)*`,
        next_step: 'AWAIT_WEBHOOK'
      });
    }
    return NextResponse.json({ reply: `Operación cancelada.\n\n${MENU_PRINCIPAL}`, next_step: 'INIT' });
  }

  if (step === 'AWAIT_WEBHOOK') {
    if (cleanMsg === 'PAGADO') {
      return NextResponse.json({
        reply: `🎉 *¡Pago Aprobado Exitosamente!* (Folio #PUR-2026-9041)\n\nAdjuntamos tu comprobante oficial timbrado digitalmente.\n\n📄 [Descargar_Comprobante_Oficial.pdf]\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
        next_step: 'ASK_FEEDBACK'
      });
    }
  }

  return NextResponse.json({ reply: MENU_PRINCIPAL, next_step: 'INIT' });
}
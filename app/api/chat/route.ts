import { NextResponse } from 'next/server';

// --- BASE DE DATOS TRANSACCIONAL (LA UNIÓN) ---
const VEHICULOS_DB: Record<string, any> = {
  "ABCD12": {
    ppu: "ABCD12",
    marca: "Toyota",
    modelo: "Hilux 4x4",
    anio: 2021,
    comuna: "La Unión",
    sector: "Puerto Nuevo",
    propietario: "Héctor Manqui",
    propietario_run: "17.894.562-K",
    prt_vigente: true,
    prt_vence: "30-Nov-2026",
    soap_vigente: true,
    multas: [],
    valor_permiso: 54200,
    folio_anterior: "UNI-2025-08912"
  },
  "GFHY45": {
    ppu: "GFHY45",
    marca: "Nissan",
    modelo: "Terrano",
    anio: 2018,
    comuna: "La Unión",
    sector: "Mashue",
    propietario: "Gladys Monsalve",
    propietario_run: "15.432.987-4",
    prt_vigente: true,
    prt_vence: "31-Oct-2026",
    soap_vigente: true,
    multas: [
      { juzgado: "JPL La Unión", motivo: "Estacionar sobre acera en Arturo Prat", monto: 35000 }
    ],
    valor_permiso: 38000,
    folio_anterior: "UNI-2025-04311"
  },
  "KJTR88": {
    ppu: "KJTR88",
    marca: "Chevrolet",
    modelo: "Sail",
    anio: 2017,
    comuna: "La Unión",
    sector: "Choroico",
    propietario: "Juan Pablo Ortiz",
    propietario_run: "18.765.432-1",
    prt_vigente: false,
    prt_vence: "31-Mar-2026 (VENCIDA)",
    soap_vigente: true,
    multas: [],
    valor_permiso: 31000,
    folio_anterior: "UNI-2025-01290"
  }
};

const PATENTES_COMERCIALES_DB: Record<string, any> = {
  "76123456-7": {
    rut: "76.123.456-7",
    razon_social: "Agrícola y Lácteos Puerto Nuevo SpA",
    rol: "ROL-COM-2026-412",
    tipo: "Microempresa Familiar (MEF) / Agro",
    estado: "AL_DIA",
    monto_semestre: 42300,
    vencimiento: "31-Jul-2026"
  }
};

const FERIA_LIBRE_DB: Record<string, any> = {
  "15432987-4": {
    run: "15.432.987-4",
    titular: "Gladys Monsalve",
    puesto: "Puesto N° 18 - Feria Libre Calle Prat",
    rubro: "Hortalizas y Frutas Locales",
    monto_mes: 12500,
    estado: "PENDIENTE"
  }
};

const ASEO_DOMICILIARIO_DB: Record<string, any> = {
  "123-45": {
    rol: "123-45",
    direccion: "Arturo Prat 450, La Unión",
    titular: "Carlos Vera",
    cuotas_pendientes: 2,
    monto_total: 18400
  }
};

// --- BASE DE CONOCIMIENTO MUNICIPAL (RAG SIMULADO - LA UNIÓN) ---
const KNOWLEDGE_BASE = [
  {
    keywords: ["EVENTO", "VERANO", "FIESTA", "COSTUMBRISTA", "FESTIVAL", "SEMANA", "SHOW", "TRUMAO"],
    response: `🎭 *Eventos y Actividades en La Unión 2026*\n\n• *Feria Fluvial y Tradiciones de Trumao:* Sábado y Domingo en el Puerto de Trumao (Paseos por el Río Bueno, gastronomía y artesanía).\n• *Semana Unionina:* Actividades en Plaza de la Concordia y Parque Municipal.\n• *Muestra Costumbrista Puerto Nuevo:* Próximo fin de semana a orillas del Lago Ranco.\n\n📄 [Descargar_Programa_Completo_La_Union_2026.pdf]\n\n_Escribe otra pregunta o *MENU* para volver._`
  },
  {
    keywords: ["FARMACIA", "TURNO", "MEDICAMENTO", "REMEDIO", "SALUD", "CESFAM", "HOSPITAL"],
    response: `💊 *Farmacia de Turno y Salud en La Unión*\n\n• *Farmacia Cruz Verde (Calle Comercio 310)*\n• *Turno:* 24 Horas disponible hoy.\n• *Fono Central:* +56 64 232 2000\n• *Hospital de La Unión (Urgencias):* 24/7 en Los Canelos s/n.\n• *CESFAM Dr. Alfredo Gantz Mann:* Atención diurna y urgencia SAPU.\n\n_Escribe otra pregunta o *MENU* para volver._`
  },
  {
    keywords: ["TELEFONO", "ANEXO", "NUMERO", "CONTACTO", "DIDECO", "OBRAS", "DOM", "ALCALDIA"],
    response: `📞 *Directorio y Anexos Municipales • La Unión*\n\n• *Central Telefónica Municipal:* +56 64 232 2000\n• *DIDECO (Social y Subsidios):* Anexo 104 • \`dideco@munilaunion.cl\`\n• *Dirección de Obras (DOM):* Anexo 108 • \`obras@munilaunion.cl\`\n• *Tránsito y Licencias:* Anexo 112 • \`transito@munilaunion.cl\`\n• *Seguridad Pública y Cuadrante:* +56 64 276 5230 (24/7)\n\n_Escribe otra pregunta o *MENU* para volver._`
  },
  {
    keywords: ["SUBSIDIO", "AGUA", "RSH", "REGISTRO SOCIAL", "LEÑA", "AYUDA SOCIAL", "APR"],
    response: `🤝 *Subsidios y Beneficios Sociales DIDECO La Unión*\n\n• *Subsidio al Agua Potable Rural (APR):* Postulaciones abiertas para comités de Puerto Nuevo, Mashue y Choroico (RSH hasta 60%).\n• *Actualización Registro Social de Hogares:* De lunes a viernes de 08:30 a 14:00 hrs en Manuel Montt 530.\n\n📄 [Descargar_Guia_Postulacion_Subsidios_2026.pdf]\n\n_Escribe otra pregunta o *MENU* para volver._`
  }
];

const MENU_PRINCIPAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de La Unión* 🇨🇱

Selecciona el área de tu trámite:

1️⃣ 🚗 *Tránsito y Vehículos* (Permisos, Duplicados, Licencias, Multas)
2️⃣ 🏪 *Negocios y Rentas* (Patentes Comerciales, Ferias, Certificados)
3️⃣ 🏡 *Vecinos y Hogar* (Aseo, Caminos, Ramas y Chatarra)
4️⃣ ℹ️ *Información, Eventos y Guía Comunal* (Preguntas Libres / RAG)
5️⃣ 👵 *Modo Asistido / Adulto Mayor* (Texto claro y sencillo)
0️⃣ 👤 *Solicitar que un funcionario municipal me llame*

_Escribe el número de tu opción (1-5 o 0). Para emergencias escribe *SOS*._`;

const MENU_TRANSITO = `🚗 *Dirección de Tránsito - Municipalidad de La Unión*

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
  const rawMessage = (message || '').trim();
  const cleanMsg = rawMessage.toUpperCase();

  // --- INTERCEPTOR DE EMERGENCIA INMEDIATA (SOS) ---
  if (['SOS', 'EMERGENCIA', 'URGENCIA', 'BOMBEROS', 'CARABINEROS', 'AMBULANCIA'].some(k => cleanMsg.includes(k))) {
    const sosReply = `🚨 *CENTRAL DE EMERGENCIAS • LA UNIÓN* 🚨\n\nSi estás en una situación de riesgo vital o peligro inminente, comunícate de inmediato:\n\n📞 *Seguridad Pública Municipal:* +56 64 232 2000\n🚒 *Bomberos La Unión:* 132\n🚓 *Carabineros (3ª Comisaría La Unión):* 133 / +56 64 276 5230\n🚓 *Retén Puerto Nuevo:* +56 64 276 5240\n🚑 *Ambulancia SAMU:* 131\n\n_Escribe *MENU* o *0* en cualquier momento para volver a los trámites municipales._`;
    return NextResponse.json({ reply: sosReply, next_step: 'INIT' });
  }

  // --- CONMUTADOR DE MODO ASISTIDO / ADULTO MAYOR ---
  if (cleanMsg === 'MODO SIMPLE' || cleanMsg === '5') {
    const seniorMenu = `👵👴 *MODO ASISTIDO ACTIVADO (Lenguaje Claro y Letra Grande)*\n\nBienvenido(a) a la Municipalidad de La Unión. Aquí le ayudamos paso a paso con sus trámites:\n\n1️⃣ *Pagar el Permiso de su Auto o Camioneta* (con su tarjeta del banco)\n2️⃣ *Pedir que una persona de la Municipalidad le llame por teléfono a su casa*\n3️⃣ *Avisar de un camino con hoyos, basura o luminaria apagada*\n4️⃣ *Saber las farmacias de turno y horas de atención*\n\n👉 Responda escribiendo solamente el número de lo que necesita (por ejemplo: *1*).\nSi necesita ayuda urgente, escriba *SOS*. Escriba *MENU* para salir.`;
    return NextResponse.json({ reply: seniorMenu, next_step: 'AWAITING_SENIOR_OPTION' });
  }

  // Submenú para Modo Asistido
  if (step === 'AWAITING_SENIOR_OPTION') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🚗 *Pago de Permiso*\n\nPor favor, escriba la patente de su vehículo (por ejemplo: ABCD12):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2') {
      const ticketId = "ATN-" + Math.floor(1000 + Math.random() * 9000);
      return NextResponse.json({
        reply: `📞 *Solicitud Registrada (#${ticketId})*\n\nUna persona de la Municipalidad le llamará por teléfono en horario hábil para ayudarle con lo que necesita con mucha paciencia.\n\n_Escriba *MENU* para volver al inicio._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: "🚜 *Aviso de Caminos o Luminarias*\n\n¿En qué sector se ubica el problema? (Por ejemplo: Puerto Nuevo, Mashue, Choroico o La Unión Centro):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_SECTOR_REPORTE'
      });
    }
    if (cleanMsg === '4') {
      const farmaciaInfo = KNOWLEDGE_BASE.find(k => k.keywords.includes("FARMACIA"));
      return NextResponse.json({
        reply: farmaciaInfo ? farmaciaInfo.response : "Farmacia de Turno: Cruz Verde (Calle Comercio 310).",
        next_step: 'INIT'
      });
    }
  }

  // COMANDO DE TRANSFERENCIA A EJECUTIVO / FUNCIONARIO HUMANO
  if (['0', 'EJECUTIVO', 'HUMANO', 'PERSONA', 'FUNCIONARIO', 'SECRETARIA', 'AYUDA'].includes(cleanMsg)) {
    const ticketId = "ATN-" + Math.floor(1000 + Math.random() * 9000);
    return NextResponse.json({
      reply: `👤 *Solicitud de Contacto Telefónico (#${ticketId})*\n\nUn funcionario municipal de La Unión se comunicará contigo al teléfono asociado a este chat.\n\n⏰ *Horario de Atención:* Lunes a Viernes de 08:30 a 14:00 hrs.\n\n_Tu orden fue enviada al Dashboard de Gestión con todo el historial de la conversación._\n\n*(Escribe 'MENU' para volver al asistente automatizado)*`,
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

    // Procesamiento RAG en el inicio
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

    return NextResponse.json({
      reply: `🏛️ *Asistente Municipal de La Unión*\n\nNo encontré información oficial sobre "${message}". Recuerda que solo puedo resolver consultas sobre trámites, eventos, directorios y beneficios de la comuna.\n\n💡 *Puedes consultar por:* Eventos en Trumao o Puerto Nuevo, Farmacias de turno, Teléfonos municipales o Subsidios APR.\n\n_O escribe *0* para solicitar que un funcionario te llame._`,
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
        reply: "⚖️ *Consulta de Multas - Juzgado de Policía Local La Unión*\n\nIngresa la *Placa Patente* a consultar (ej: `GFHY45`):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_PATENTE_MULTA'
      });
    }
    if (cleanMsg === '4') {
      return NextResponse.json({
        reply: "🪪 *Licencias de Conducir - Pre-chequeo Rural*\n\nPara revisar tu hoja de vida del conductor y evitar traslados en vano, haz clic en el botón azul para ingresar con tu *ClaveÚnica*:",
        auth_url: "/auth/claveunica",
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
        reply: "🧺 *Pago de Derechos de Feria Libre / Ambulante*\n\nIngresa tu RUN de comerciante registrado en La Unión (ej: `15432987-4`):\n\n_Escribe *MENU* para volver._",
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
        reply: "🚜 *Reportes de Caminos Rurales y Luminarias (100% Anónimo)*\n\n🛡️ _Este canal es directo y privado con la Dirección de Operaciones._\n\n¿En qué sector se ubica el problema? (Puerto Nuevo, Mashue, Choroico, Trumao, Llancacura, Centro):\n\n_Escribe *MENU* para volver._",
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
        reply: `⚠️ La patente *${cleanMsg}* no registra en La Unión. Patentes demo: \`ABCD12\` (Al día), \`GFHY45\` (Multa JPL).\n\n_Escribe otra patente, *MENU* para volver o *0* para un funcionario._`,
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (!vehiculo.prt_vigente) {
      return NextResponse.json({
        reply: `🛑 *Trámite Bloqueado: Revisión Técnica Vencida*\n\nVehículo: *${vehiculo.marca} ${vehiculo.modelo}*\nSector: *${vehiculo.sector}*\nEstado: *${vehiculo.prt_vence}*\n\nℹ️ Para no perder el viaje al centro de La Unión, regulariza en planta PRT antes de pagar.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }

    const totalMultas = vehiculo.multas.reduce((acc: number, m: any) => acc + m.monto, 0);
    const totalPagar = vehiculo.valor_permiso + totalMultas;

    let d = `✅ *Vehículo Habilitado para Pago Express*\n\n`;
    d += `• Patente: *${vehiculo.ppu}*\n`;
    d += `• Propietario: *${vehiculo.propietario}*\n`;
    d += `• Sector: *${vehiculo.sector}*\n\n`;
    d += `💰 *Liquidación Oficial:*\n`;
    d += `• Permiso: *$${vehiculo.valor_permiso.toLocaleString('es-CL')}*\n`;
    if (totalMultas > 0) d += `• Multas JPL: *$${totalMultas.toLocaleString('es-CL')}*\n`;
    d += `• *TOTAL A PAGAR: $${totalPagar.toLocaleString('es-CL')}*\n\n`;
    d += `¿Deseas pagar ahora vía Webpay seguro? Responde *SI* o escribe *MENU* para cancelar.`;

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
      reply: `✅ *Duplicado Oficial Encontrado*\n\nVehículo: *${v.marca} ${v.modelo}*\nFolio SUBDERE: *${v.folio_anterior}*\n\n📄 Copia timbrada lista para descarga:\n👉 [Descargar_Duplicado_${v.ppu}.pdf]\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
      next_step: 'ASK_FEEDBACK'
    });
  }

  // Tránsito: Consulta Multas JPL
  if (step === 'AWAIT_PATENTE_MULTA') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v || v.multas.length === 0) {
      return NextResponse.json({
        reply: `✅ La patente *${cleanMsg}* no registra multas de Policía Local en La Unión.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    return NextResponse.json({
      reply: `⚠️ *Infracciones Pendientes en JPL La Unión:*\n\n• Causa: *${v.multas[0].motivo}*\n• Tribunal: *${v.multas[0].juzgado}*\n• Monto: *$${v.multas[0].monto.toLocaleString('es-CL')}*\n\n¿Deseas liquidar esta multa en línea? Responde *SI* o *MENU* para cancelar.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Rentas: Feria Libre
  if (step === 'AWAIT_RUN_FERIA') {
    const raw = cleanMsg.replace(/\./g, '');
    const feria = FERIA_LIBRE_DB[raw];
    if (!feria) {
      return NextResponse.json({
        reply: `⚠️ RUN no registrado en el padrón de Ferias Libres. Para la prueba usa: \`15432987-4\`.\n\n_Escribe otro RUN o *MENU* para volver._`,
        next_step: 'AWAIT_RUN_FERIA'
      });
    }
    return NextResponse.json({
      reply: `🧺 *Derechos de Feria Libre Registrados*\n\n• Titular: *${feria.titular}*\n• Ubicación: *${feria.puesto}*\n• Rubro: *${feria.rubro}*\n• Mensualidad: *$${feria.monto_mes.toLocaleString('es-CL')}*\n\n¿Pagar ahora vía Webpay? Responde *SI* o *MENU* para cancelar.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Rentas: Patentes Comerciales
  if (step === 'AWAIT_RUT_COMERCIAL' || step === 'AWAIT_RUT_CERTIFICADO') {
    const raw = cleanMsg.replace(/\./g, '');
    const p = PATENTES_COMERCIALES_DB[raw];
    if (!p) {
      return NextResponse.json({
        reply: `⚠️ RUT no encontrado. Para la demo usa: \`76123456-7\` (Lácteos Puerto Nuevo).\n\n_Escribe otro RUT o *MENU* para volver._`,
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
        reply: `⚠️ Rol no registrado en La Unión. Usa el Rol demo: \`123-45\`.\n\n_Escribe otro Rol o *MENU* para volver._`,
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
      reply: `✅ *Reporte Recibido y Foliado (#${folio})*\n\n📸 *Evidencia:* Foto adjuntada con éxito.\n🛡️ *Privacidad:* 100% Anónimo ante la comunidad.\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
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
      reply: `✅ *Solicitud de Retiro de Ramas Ingresada (#${folio})*\n\n📸 Foto de evidencia registrada.\n🚛 El camión municipal pasará según la programación de rutas sectoriales de La Unión.\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
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
      reply: `✅ *Solicitud de Retiro de Chatarra Ingresada (#${folio})*\n\n📸 Evidencia fotográfica registrada.\n🤝 Datos derivados a la empresa recicladora colaboradora para retiro seguro en la provincia del Ranco.\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
      next_step: 'ASK_FEEDBACK'
    });
  }

  // Paso Feedback
  if (step === 'ASK_FEEDBACK') {
    return NextResponse.json({
      reply: `⭐ ¡Muchas gracias por tu evaluación de "${message}"! Tu opinión nos ayuda a mejorar la atención ciudadana en La Unión 🇨🇱\n\nEscribe *MENU* para realizar otro trámite.`,
      next_step: 'INIT'
    });
  }

  // Confirmación de Pagos
  if (step === 'CONFIRM_PAYMENT') {
    if (cleanMsg === 'SI' || cleanMsg === 'SÍ') {
      return NextResponse.json({
        reply: `💳 *Pasarela Segura Municipal (Webpay / TGR)*\n\n🔗 https://pagos.munilaunion.cl/pay/tx_998234\n\n⏳ _Expira en 15 minutos._\n\n*(Escribe 'PAGADO' para simular confirmación bancaria o 'MENU' para cancelar)*`,
        next_step: 'AWAIT_WEBHOOK'
      });
    }
    return NextResponse.json({ reply: `Operación cancelada.\n\n${MENU_PRINCIPAL}`, next_step: 'INIT' });
  }

  if (step === 'AWAIT_WEBHOOK') {
    if (cleanMsg === 'PAGADO') {
      return NextResponse.json({
        reply: `🎉 *¡Pago Aprobado Exitosamente!* (Folio #UNI-2026-9041)\n\nAdjuntamos tu comprobante oficial timbrado digitalmente con código QR.\n\n📄 [Descargar_Comprobante_Oficial_LaUnion.pdf]\n\n¿Qué te pareció la atención de este asistente virtual? (Califica de *1 a 7*, opcional):`,
        next_step: 'ASK_FEEDBACK'
      });
    }
  }

  return NextResponse.json({ reply: MENU_PRINCIPAL, next_step: 'INIT' });
}
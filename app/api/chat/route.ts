import { NextResponse } from 'next/server';

// --- VALIDADOR SINTÁCTICO DE RUN CHILENO (MÓDULO 11) ---
function validarRutChileno(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  const limpio = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  if (limpio.length < 8 || limpio.length > 9) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += multiplo * parseInt(cuerpo.charAt(i), 10);
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = '';
  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();

  return dv === dvCalculado;
}

// Generador de folio institucional
function generarFolio(anio: number = 2026): string {
  const correlativo = Math.floor(1000 + Math.random() * 9000);
  return `#LUN-${anio}-${correlativo}`;
}

// --- BASES DE DATOS LOCALES SIMULADAS ---
const VEHICULOS_DB: Record<string, any> = {
  "ABCD12": {
    ppu: "ABCD12",
    marca: "Toyota",
    modelo: "Hilux 4x4",
    anio: 2021,
    comuna: "La Unión",
    sector: "Puerto Nuevo",
    propietario: "Héctor Manqui",
    prt_vigente: true,
    prt_vence: "30-Nov-2026",
    valor_permiso: 54200,
    multas: []
  },
  "GFHY45": {
    ppu: "GFHY45",
    marca: "Nissan",
    modelo: "Terrano",
    anio: 2018,
    comuna: "La Unión",
    sector: "Mashue",
    propietario: "Gladys Monsalve",
    prt_vigente: true,
    prt_vence: "31-Oct-2026",
    valor_permiso: 38000,
    multas: [
      { juzgado: "JPL La Unión", motivo: "Estacionamiento indebido en calle Prat", monto: 35000 }
    ]
  }
};

const PATENTES_COMERCIALES_DB: Record<string, any> = {
  "761234567": {
    rut: "76.123.456-7",
    razon_social: "Agrícola y Lácteos Puerto Nuevo SpA",
    rol: "ROL-COM-2026-412",
    monto_semestre: 42300
  }
};

// --- BASE DE CONOCIMIENTO (RAG COMUNAL DE LA UNIÓN) ---
const KNOWLEDGE_BASE = [
  {
    keywords: ["EVENTO", "FIESTA", "TRUMAO", "PUERTO NUEVO", "SEMANA", "COSTUMBRISTA"],
    response: `🎭 *Eventos y Festividades en La Unión 2026*\n\n• *Feria Fluvial y Tradiciones de Trumao:* Sábado y Domingo en el Muelle de Trumao.\n• *Muestra Costumbrista Puerto Nuevo:* Todo el fin de semana a orillas del Lago Ranco.\n• *Semana Unionina:* Actividades en Plaza de la Concordia y Parque Municipal.\n\n_Escribe otra consulta comunal o *MENU* para volver._`
  },
  {
    keywords: ["FARMACIA", "TURNO", "REMEDIO", "SALUD", "HOSPITAL", "CESFAM"],
    response: `💊 *Farmacias de Turno y Salud Comunal*\n\n• *Farmacia Cruz Verde (Calle Comercio 310)*: Turno 24 Horas activo hoy.\n• *Hospital de La Unión (Urgencias)*: 24/7 en Los Canelos s/n.\n• *CESFAM Dr. Alfredo Gantz Mann*: Atención diurna y SAPU de urgencia.\n\n_Escribe otra consulta o *MENU* para volver._`
  },
  {
    keywords: ["TELEFONO", "ANEXO", "CONTACTO", "DIDECO", "OBRAS", "TRANSITO"],
    response: `📞 *Directorio Municipal de La Unión*\n\n• *Central Consistorial:* +56 64 232 2000\n• *DIDECO:* Anexo 104 • Manuel Montt 530\n• *Dirección de Tránsito:* Anexo 112 • Comercio 340\n• *Dirección de Operaciones y Obras:* Anexo 108\n• *Seguridad Pública y Cuadrante:* +56 64 276 5230 (24/7)\n\n_Escribe otra consulta o *MENU* para volver._`
  }
];

const MENSAJE_INICIAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de La Unión* 🇨🇱

Canal municipal directo y abierto para toda la comuna. Selecciona el área de tu trámite:

1️⃣ 🚗 *Tránsito y Vehículos* (Permisos de Circulación, Licencias, Multas JPL)
2️⃣ 🏪 *Rentas y Comercio* (Patentes Comerciales, Ferias Libres)
3️⃣ 🏡 *Operaciones en Terreno* (Baches, Caminos Rurales, Luminarias, Ramas y Chatarra)
4️⃣ 🤝 *DIDECO y Acción Social* (Subsidio Agua Potable Rural APR, Registro Social de Hogares)
5️⃣ ℹ️ *Guía Comunal e Información RAG* (Ordenanzas, Farmacias de Turno, Eventos)
6️⃣ 👵 *Modo Asistido / Adulto Mayor* (Texto claro y sencillo)
0️⃣ 👤 *Solicitar contacto telefónico de un funcionario*

_Escribe el número de tu opción (1-6 o 0). Para emergencias escribe *SOS*._`;

export async function POST(req: Request) {
  const { message, step, hasImage } = await req.json();
  const rawMessage = (message || '').trim();
  const cleanMsg = rawMessage.toUpperCase();

  // --- 1. INTERCEPTOR DE EMERGENCIA (SOS) ---
  if (['SOS', 'EMERGENCIA', 'BOMBEROS', 'CARABINEROS', 'AMBULANCIA'].some(k => cleanMsg.includes(k))) {
    const sosReply = `🚨 *CENTRAL DE EMERGENCIAS • LA UNIÓN* 🚨\n\nComunícate de inmediato con las unidades de respuesta:\n\n🚒 *Bomberos La Unión:* 132\n🚓 *Carabineros (3ª Comisaría La Unión):* 133 / +56 64 276 5230\n🚓 *Retén Puerto Nuevo:* +56 64 276 5240\n🚑 *Ambulancia SAMU:* 131\n📞 *Seguridad Pública Municipal:* +56 64 232 2000\n\n_Escribe *MENU* para volver a la atención municipal._`;
    return NextResponse.json({ reply: sosReply, next_step: 'INIT' });
  }

  // --- 2. COMANDOS UNIVERSALES ---
  if (['MENU', 'VOLVER', 'INICIO', 'HOLA', 'CANCELAR'].includes(cleanMsg)) {
    return NextResponse.json({ reply: MENSAJE_INICIAL, next_step: 'INIT' });
  }

  // Solicitud de contacto telefónico (Opción 0)
  if (cleanMsg === '0' || ['FUNCIONARIO', 'HUMANO', 'LLAMAR'].includes(cleanMsg)) {
    const folio = generarFolio();
    return NextResponse.json({
      reply: `👤 *Solicitud de Contacto Telefónico Registrada (${folio})*\n\nUn funcionario municipal se comunicará al número telefónico de este WhatsApp durante el próximo bloque de atención hábil (08:30 a 14:00 hrs).\n\n_El requerimiento ha ingresado al panel de control directivo._\n\nEscribe *MENU* para volver.`,
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

  // --- 3. MODO ASISTIDO / ADULTO MAYOR (Opción 6) ---
  if (cleanMsg === '6' || cleanMsg === 'MODO SIMPLE') {
    const modoSenior = `👵👴 *MODO ASISTIDO (Lenguaje Claro y Letra Grande)*\n\nBienvenido(a) a la Municipalidad de La Unión. Le ayudamos paso a paso:\n\n1️⃣ *Pagar el Permiso de Circulación de su vehículo*\n2️⃣ *Avisar de un camino en mal estado, rama caída o luminaria*\n3️⃣ *Pedir que un funcionario le llame por teléfono a su casa*\n4️⃣ *Consultar farmacias de turno*\n\n👉 Escriba el número de lo que necesita (por ejemplo: *1*).\nPara salir escriba *MENU*. Para emergencias escriba *SOS*.`;
    return NextResponse.json({ reply: modoSenior, next_step: 'AWAIT_SENIOR_OPTION' });
  }

  if (step === 'AWAIT_SENIOR_OPTION') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🚗 *Pago de Permiso*\n\nPor favor, escriba la patente de su auto o camioneta (ejemplo: ABCD12):\n\n_Escriba *MENU* para volver._",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "🚜 *Aviso de Caminos o Luminarias*\n\n¿En qué sector rural o calle de La Unión está el problema? (Ejemplo: Puerto Nuevo, Mashue, Choroico):\n\n_Escriba *MENU* para volver._",
        next_step: 'TERRENO_STEP_SECTOR'
      });
    }
    if (cleanMsg === '3') {
      const folio = generarFolio();
      return NextResponse.json({
        reply: `📞 *Solicitud Registrada (${folio})*\n\nUn funcionario municipal le llamará por teléfono con tiempo y paciencia para ayudarle.\n\n_Escriba *MENU* para volver._`,
        next_step: 'INIT',
        ticketSync: {
          id: folio,
          citizen: 'Adulto Mayor (Modo Asistido)',
          type: 'CALLBACK',
          description: 'Llamado prioritario Modo Senior',
          slaMinutes: 30
        }
      });
    }
    if (cleanMsg === '4') {
      const farmacia = KNOWLEDGE_BASE.find(k => k.keywords.includes("FARMACIA"));
      return NextResponse.json({ reply: farmacia ? farmacia.response : "Farmacia Cruz Verde (Comercio 310) de turno 24 hrs.", next_step: 'INIT' });
    }
  }

  // --- 4. ENRUTADOR DEL MENÚ PRINCIPAL ---
  if (step === 'INIT') {
    // 1. Tránsito
    if (cleanMsg === '1' || cleanMsg.includes('TRANSITO')) {
      const sub = `🚗 *Dirección de Tránsito - Municipalidad de La Unión*\n\n1️⃣ Pagar Permiso de Circulación (Enlace Oficial Webpay)\n2️⃣ Consultar Multas JPL Pendientes\n3️⃣ Requisitos y Agendamiento de Licencia de Conducir\n\n_Escribe el número de tu opción (1-3) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_TRANSITO' });
    }

    // 2. Rentas
    if (cleanMsg === '2' || cleanMsg.includes('RENTA') || cleanMsg.includes('COMERCIO')) {
      const sub = `🏪 *Departamento de Rentas y Patentes*\n\n1️⃣ Consultar y Pagar Patente Comercial / MEF (Por RUT)\n2️⃣ Orientación Pago Feria Libre y Permisos Ambulantes\n\n_Escribe tu opción (1-2) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_RENTAS' });
    }

    // 3. Operaciones en Terreno (Baches, Caminos, Ramas, Chatarra)
    if (cleanMsg === '3' || cleanMsg.includes('TERRENO') || cleanMsg.includes('CAMINO')) {
      return NextResponse.json({
        reply: `🏡 *Operaciones en Terreno e Incidencias Territoriales*\n\nCanal directo para atender problemas viales y de aseo en sectores urbanos y rurales (Puerto Nuevo, Mashue, Choroico, Trumao, Llancacura, etc.).\n\n👉 Para iniciar el reporte foliado, indícanos el *Sector o Localidad* afectada:\n\n_Escribe *MENU* para cancelar._`,
        next_step: 'TERRENO_STEP_SECTOR'
      });
    }

    // 4. DIDECO / APR
    if (cleanMsg === '4' || cleanMsg.includes('DIDECO') || cleanMsg.includes('APR')) {
      const sub = `🤝 *DIDECO - Atención Social y Subsidios Comunitarios*\n\n1️⃣ Requisitos y Postulación a Subsidio de Agua Potable Rural (APR)\n2️⃣ Orientación Actualización Registro Social de Hogares (RSH)\n\n_Escribe tu opción (1-2) o *MENU* para volver._`;
      return NextResponse.json({ reply: sub, next_step: 'SUB_DIDECO' });
    }

    // 5. RAG / Consultas Libres
    if (cleanMsg === '5' || cleanMsg.includes('INFO') || cleanMsg.includes('GUIA')) {
      return NextResponse.json({
        reply: `ℹ️ *Consultas Normativas e Información Comunal (RAG)*\n\nPuedes consultar directamente:\n• _"¿Qué farmacia está de turno hoy?"_\n• _"¿Qué eventos hay este fin de semana en Trumao o Puerto Nuevo?"_\n• _"¿Cuál es el teléfono de Obras o Tránsito?"_\n• _"¿Cuáles son los horarios de atención?"_\n\n_Escribe tu pregunta o *MENU* para volver._`,
        next_step: 'AWAIT_RAG_QUERY'
      });
    }

    // Búsqueda RAG directa en el menú raíz
    const ragMatch = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    if (ragMatch) {
      return NextResponse.json({ reply: ragMatch.response, next_step: 'INIT' });
    }

    return NextResponse.json({ reply: `⚠️ Opción no reconocida.\n\n${MENSAJE_INICIAL}`, next_step: 'INIT' });
  }

  // --- 5. FLUJO OPERACIONES EN TERRENO (CON VALIDACIÓN RUN MÓDULO 11) ---
  if (step === 'TERRENO_STEP_SECTOR') {
    return NextResponse.json({
      reply: `📍 Sector registrado: *${rawMessage}*.\n\nPor favor, indícanos tu *Nombre completo y RUN* para asociarlo al folio oficial de seguimiento (Ejemplo: *Gladys Monsalve 15.432.987-4*):\n\n_Escribe *MENU* para cancelar._`,
      next_step: 'TERRENO_STEP_IDENTIFICACION'
    });
  }

  if (step === 'TERRENO_STEP_IDENTIFICACION') {
    const rutEncontrado = rawMessage.match(/(\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK])/);
    const rutCandidato = rutEncontrado ? rutEncontrado[0] : rawMessage;

    if (!validarRutChileno(rutCandidato)) {
      return NextResponse.json({
        reply: `⚠️ El RUN ingresado (*${rutCandidato}*) no es válido según el algoritmo oficial (Módulo 11).\n\nPor favor, escribe un RUN chileno válido con su dígito verificador para generar el folio de seguimiento municipal (Ejemplo: \`15.432.987-4\`):\n\n_O escribe *MENU* para volver._`,
        next_step: 'TERRENO_STEP_IDENTIFICACION'
      });
    }

    return NextResponse.json({
      reply: `✅ RUN validado exitosamente: *${rutCandidato}*.\n\n📸 *Detalle del Requerimiento:*\nDescribe brevemente la situación y adjunta una fotografía (usa el botón de la cámara 📷 en el chat):\n\n_Escribe *MENU* para cancelar._`,
      next_step: 'TERRENO_STEP_EVIDENCIA'
    });
  }

  if (step === 'TERRENO_STEP_EVIDENCIA') {
    const folio = generarFolio();
    return NextResponse.json({
      reply: `✅ *Requerimiento Territorial Foliado (${folio})*\n\n• *Tipo:* Inspección Operativa en Terreno\n• *Estado:* Pendiente de Asignación de Cuadrilla\n• *Respaldo:* Evidencia fotográfica sincronizada con la Dirección de Operaciones.\n\nPodrás hacer seguimiento de los trabajos con el folio *${folio}*.\n\n_Escribe *MENU* para realizar otro trámite._`,
      next_step: 'INIT',
      ticketSync: {
        id: folio,
        citizen: 'Vecino Acreditado',
        rut: 'Validado Módulo 11',
        type: 'CAMINO',
        description: `Incidencia en terreno: "${rawMessage}"`,
        slaMinutes: 120
      }
    });
  }

  // --- 6. SUBMENÚ DIDECO / SUBSIDIO APR ---
  if (step === 'SUB_DIDECO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: `💧 *Orientación Subsidio Agua Potable Rural (APR)*\n\nPara postular en la comuna de La Unión necesitas cumplir con los siguientes requisitos previos:\n\n1. Estar inscrito en el *Registro Social de Hogares (RSH)* en la comuna de La Unión (tramo hasta el 40% o 60% según cupos vigentes).\n2. Ser residente permanente del sector rural postulado (Puerto Nuevo, Mashue, Choroico, Trumao, Llancacura, etc.).\n3. Contar con la última boleta o colilla de cobro del comité de APR pagada y al día.\n\n📍 *Lugar de Entrega de Antecedentes:*\nDIDECO (Manuel Montt 530) o en rondas rurales periódicas.\n\n_Escribe *0* si deseas que un funcionario de DIDECO te contacte o *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `📋 *Actualización Registro Social de Hogares (RSH)*\n\n• Atención presencial: Lunes a Viernes de 08:30 a 14:00 hrs en Manuel Montt 530.\n• Documentos habituales: Cédula de identidad vigente y boleta de servicios para acreditar domicilio.\n• Trámite digital autónomo: \`registrosocial.gob.cl\` (requiere ClaveÚnica).\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  // --- 7. SUBMENÚ TRÁNSITO & DERIVACIÓN SEGURA WEBPAY ---
  if (step === 'SUB_TRANSITO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🚗 *Pago de Permiso de Circulación*\n\nIngresa la *Placa Patente (PPU)* de tu vehículo (ejemplo: `ABCD12`, `GFHY45`):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "⚖️ *Consulta de Multas - Juzgado de Policía Local*\n\nIngresa la Placa Patente a verificar:\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_PATENTE_MULTA'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: `🪪 *Licencias de Conducir - Dirección de Tránsito*\n\n• *Renovaciones y Primeras Licencias:* Calle Comercio 340.\n• *Requisitos Base:* Cédula de identidad vigente, certificado de residencia comunal y acreditar estudios mínimos.\n• *Días de Examen Práctico:* Martes y Jueves (coordinado con recorrido de transporte rural).\n\n_Escribe *0* para solicitar agendamiento telefónico o *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  if (step === 'AWAIT_PATENTE') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v) {
      return NextResponse.json({
        reply: `⚠️ La patente *${cleanMsg}* no registra historial en La Unión. Patentes demo: \`ABCD12\` (Al día) o \`GFHY45\` (Multa JPL).\n\n_Ingresa otra patente o escribe *MENU*._`,
        next_step: 'AWAIT_PATENTE'
      });
    }

    const totalMultas = v.multas.reduce((acc: number, m: any) => acc + m.monto, 0);
    const totalPagar = v.valor_permiso + totalMultas;

    let res = `✅ *Liquidación Permiso de Circulación*\n\n`;
    res += `• Patente: *${v.ppu}*\n`;
    res += `• Propietario: *${v.propietario}* (${v.sector})\n`;
    res += `• Permiso: *$${v.valor_permiso.toLocaleString('es-CL')}*\n`;
    if (totalMultas > 0) res += `• Multas JPL: *$${totalMultas.toLocaleString('es-CL')}*\n`;
    res += `• *TOTAL A PAGAR: $${totalPagar.toLocaleString('es-CL')}*\n\n`;
    res += `🔗 *Enlace Oficial de Recaudación Municipal (Webpay / TGR):*\n`;
    res += `https://pagos.munilaunion.cl/transito/pay?ppu=${v.ppu}\n\n`;
    res += `_La transacción se ejecuta directamente en los servidores de recaudación institucional sin intermediación de fondos._\n\nEscribe *MENU* para volver.`;

    return NextResponse.json({ reply: res, next_step: 'INIT' });
  }

  if (step === 'AWAIT_PATENTE_MULTA') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v || v.multas.length === 0) {
      return NextResponse.json({
        reply: `✅ La patente *${cleanMsg}* no registra multas pendientes en el Juzgado de Policía Local de La Unión.\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
    return NextResponse.json({
      reply: `⚠️ *Infracción Registrada en JPL La Unión*\n\n• Causa: *${v.multas[0].motivo}*\n• Tribunal: *${v.multas[0].juzgado}*\n• Monto: *$${v.multas[0].monto.toLocaleString('es-CL')}*\n\n🔗 *Portal de Pago Oficial:* https://pagos.munilaunion.cl/jpl/multas\n\n_Escribe *MENU* para volver._`,
      next_step: 'INIT'
    });
  }

  // --- 8. SUBMENÚ RENTAS ---
  if (step === 'SUB_RENTAS') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🏪 *Consulta de Patentes Comerciales*\n\nIngresa el RUT de la empresa o titular (ejemplo: `76.123.456-7`):\n\n_Escribe *MENU* para volver._",
        next_step: 'AWAIT_RUT_PATENTE'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: `🧺 *Derechos de Feria Libre y Comercio Ambulante*\n\n• Unidad de Rentas: Calle Comercio 340.\n• Horario de pago presencial: 08:30 a 14:00 hrs.\n• Enlace de derivación tributaria: https://pagos.munilaunion.cl/rentas/ferias\n\n_Escribe *MENU* para volver._`,
        next_step: 'INIT'
      });
    }
  }

  if (step === 'AWAIT_RUT_PATENTE') {
    const rutLimpio = cleanMsg.replace(/\./g, '').replace(/-/g, '');
    const p = PATENTES_COMERCIALES_DB[rutLimpio];
    if (!p) {
      return NextResponse.json({
        reply: `⚠️ RUT no encontrado en el padrón activo. Usa el registro demo: \`76.123.456-7\`.\n\n_Ingresa otro RUT o escribe *MENU*._`,
        next_step: 'AWAIT_RUT_PATENTE'
      });
    }
    return NextResponse.json({
      reply: `🏪 *Patente Comercial Registrada*\n\n• Razón Social: *${p.razon_social}*\n• Rol: *${p.rol}*\n• Monto Semestre: *$${p.monto_semestre.toLocaleString('es-CL')}*\n\n🔗 *Enlace de Pago Oficial:* https://pagos.munilaunion.cl/rentas/pay?rol=${p.rol}\n\n_Escribe *MENU* para volver._`,
      next_step: 'INIT'
    });
  }

  // --- 9. MOTOR RAG (CONSULTAS LIBRES) ---
  if (step === 'AWAIT_RAG_QUERY') {
    const match = KNOWLEDGE_BASE.find(item => item.keywords.some(kw => cleanMsg.includes(kw)));
    if (match) {
      return NextResponse.json({ reply: match.response, next_step: 'AWAIT_RAG_QUERY' });
    }
    return NextResponse.json({
      reply: `🏛️ *Asistente Comunal de La Unión*\n\nNo se halló normativa u ordenanza indexada para tu consulta ("${rawMessage}").\n\nPuedes consultar por: Eventos en Trumao/Puerto Nuevo, Farmacias de turno o Teléfonos municipales.\n\n_O escribe *0* para solicitar el llamado de un funcionario._`,
      next_step: 'AWAIT_RAG_QUERY'
    });
  }

  return NextResponse.json({ reply: MENSAJE_INICIAL, next_step: 'INIT' });
}
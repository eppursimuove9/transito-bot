import { NextResponse } from 'next/server';

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
  },
  "LLPP90": {
    ppu: "LLPP90",
    marca: "Mitsubishi",
    modelo: "L200",
    anio: 2022,
    comuna: "Osorno",
    sector: "Traslado a Purranque",
    propietario: "Carlos Hinostroza",
    propietario_run: "16.543.210-9",
    prt_vigente: true,
    prt_vence: "31-Dic-2026",
    soap_vigente: true,
    multas: [],
    valor_permiso: 62000,
    folio_anterior: "OS-2025-99214"
  }
};

const PATENTES_COMERCIALES_DB: Record<string, any> = {
  "76123456-7": {
    rut: "76.123.456-7",
    razon_social: "Agrícola y Quesos Corte Alto SpA",
    rol_patente: "ROL-COM-2026-412",
    tipo: "Microempresa Familiar / Agro",
    estado: "AL_DIA",
    monto_semestre: 42300,
    vencimiento: "31-Jul-2026"
  }
};

export async function POST(req: Request) {
  const { message, step } = await req.json();
  const cleanMsg = message.trim().toUpperCase();

  // Menú Principal
  if (step === 'INIT') {
    if (cleanMsg === '1' || cleanMsg.includes('PAGAR PERMISO')) {
      return NextResponse.json({
        reply: "🚗 *Pago de Permiso de Circulación (Pago Express Purranque)*\n\nPor favor, escribe la *Placa Patente (PPU)* de tu vehículo (ej: `ABCD12`, `GFHY45`, `KJTR88`):",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2' || cleanMsg.includes('DUPLICADO')) {
      return NextResponse.json({
        reply: "📄 *Obtener Duplicado de Permiso de Circulación*\n\nIngresa la *Patente* del vehículo para buscar tu documento histórico:",
        next_step: 'AWAIT_DUPLICADO'
      });
    }
    if (cleanMsg === '3' || cleanMsg.includes('LICENCIA')) {
      return NextResponse.json({
        reply: "🪪 *Licencias de Conducir - Pre-chequeo Rural*\n\nPara validar tu documentación antes de viajar a Purranque centro, necesitamos verificar tu identidad vía *ClaveÚnica*:",
        requires_auth: true,
        tramite_id: "LIC-2026-PURR",
        next_step: 'AUTH_PENDING'
      });
    }
    if (cleanMsg === '4' || cleanMsg.includes('COMERCIAL') || cleanMsg.includes('RENTA')) {
      return NextResponse.json({
        reply: "🏪 *Patentes Comerciales e Industriales*\n\nIngresa el RUT de la empresa o titular (ej: `76123456-7`):",
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    if (cleanMsg === '5' || cleanMsg.includes('REPORTE') || cleanMsg.includes('CAMINO')) {
      return NextResponse.json({
        reply: "🚜 *Reportes de Caminos Rurales y Servicios Municipales*\n\n¿En qué sector se presenta el problema?\n1. Corte Alto\n2. Hueyusca\n3. Concordia / Crucero\n4. Manquemapu\n\n_Escribe el nombre del sector y una breve descripción:_ ",
        next_step: 'AWAIT_REPORTE'
      });
    }

    return NextResponse.json({
      reply: "👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de Purranque* 🇨🇱\n\n¿Qué trámite deseas realizar?\n\n1️⃣ Pagar Permiso de Circulación (Pago Express)\n2️⃣ Obtener Duplicado de Permiso (Instantáneo)\n3️⃣ Agendar Licencia (Pre-chequeo rural sin filas)\n4️⃣ Consultar / Pagar Patente Comercial\n5️⃣ Reportar estado de camino o luminaria rural\n\n_Responde con el número de tu opción._",
      next_step: 'INIT'
    });
  }

  // Flujo Duplicados
  if (step === 'AWAIT_DUPLICADO') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v) {
      return NextResponse.json({
        reply: `⚠️ No se encontró registro histórico para la patente *${cleanMsg}* en Purranque. Escribe *HOLA* para volver.`,
        next_step: 'INIT'
      });
    }
    return NextResponse.json({
      reply: `✅ *Duplicado Encontrado*\n\nVehículo: *${v.marca} ${v.modelo}*\nFolio SUBDERE: *${v.folio_anterior}*\nPropietario: *${v.propietario}* (RUN: ${v.propietario_run})\n\n📄 Tu copia digital timbrada está lista:\n👉 [Descargar_Duplicado_${v.ppu}.pdf]\n\n_Válido para presentar ante Carabineros o Juzgados._`,
      next_step: 'INIT'
    });
  }

  // Flujo Patentes Comerciales
  if (step === 'AWAIT_RUT_COMERCIAL') {
    const rawRut = cleanMsg.replace(/\./g, '');
    const p = PATENTES_COMERCIALES_DB[rawRut];
    if (!p) {
      return NextResponse.json({
        reply: `⚠️ RUT no encontrado en el catastro de Rentas. Para la demo usa el RUT: \`76123456-7\` (Quesería Corte Alto).`,
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    return NextResponse.json({
      reply: `🏪 *Patente Comercial Encontrada*\n\n• Razón Social: *${p.razon_social}*\n• Rol: *${p.rol_patente}*\n• Tipo: *${p.tipo}*\n• Estado: *AL DÍA*\n• Valor 1er Semestre 2026: *$${p.monto_semestre.toLocaleString('es-CL')}*\n\n¿Deseas pagar en línea este semestre? Responde *SI* o escribe *HOLA* para volver.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Flujo Reportes Rurales
  if (step === 'AWAIT_REPORTE') {
    return NextResponse.json({
      reply: `📋 *Ticket Municipal Registrado (#REC-2026-1092)*\n\nTu solicitud fue derivada a la *Dirección de Operaciones y Caminos Rurales de Purranque*.\n\nTe notificaremos por este mismo chat cuando la cuadrilla municipal acuda al lugar. ¡Gracias por colaborar con la comuna! 🌾`,
      next_step: 'INIT'
    });
  }

  // Flujo Pago Permiso (PPU)
  if (step === 'AWAIT_PATENTE') {
    const vehiculo = VEHICULOS_DB[cleanMsg];

    if (!vehiculo) {
      return NextResponse.json({
        reply: `⚠️ La patente *${cleanMsg}* no figura en Purranque.\n\nPatentes de prueba demo:\n• \`ABCD12\` (Al día - Corte Alto)\n• \`GFHY45\` (Con multas JPL - Hueyusca)\n• \`KJTR88\` (Revisión Vencida)\n• \`LLPP90\` (Traslado desde Osorno)`,
        next_step: 'AWAIT_PATENTE'
      });
    }

    if (!vehiculo.prt_vigente) {
      return NextResponse.json({
        reply: `🛑 *Trámite Bloqueado por Revisión Técnica*\n\nVehículo: *${vehiculo.marca} ${vehiculo.modelo}*\nSector: *${vehiculo.sector}*\n\nTu Revisión Técnica figura *VENCIDA (${vehiculo.prt_vence})*.\n\nℹ️ Para no viajar en vano al centro de Purranque, debes regularizarla en una planta PRT autorizada antes de pagar.`,
        next_step: 'INIT'
      });
    }

    const totalMultas = vehiculo.multas.reduce((acc: number, m: any) => acc + m.monto, 0);
    const totalPagar = vehiculo.valor_permiso + totalMultas;

    let detalle = `✅ *Vehículo Habilitado para Pago Express*\n\n`;
    detalle += `📋 *Datos del Móvil:*\n`;
    detalle += `• Patente: *${vehiculo.ppu}*\n`;
    detalle += `• Propietario: *${vehiculo.propietario}*\n`;
    detalle += `• Sector: *${vehiculo.sector}*\n`;
    detalle += `• Revisión Técnica: *Vigente hasta ${vehiculo.prt_vence}*\n\n`;
    detalle += `💰 *Liquidación:*\n`;
    detalle += `• Permiso Municipal: *$${vehiculo.valor_permiso.toLocaleString('es-CL')}*\n`;

    if (totalMultas > 0) {
      detalle += `• Multas JPL pendientes (${vehiculo.multas.length}): *$${totalMultas.toLocaleString('es-CL')}*\n`;
    }

    detalle += `• *TOTAL A PAGAR: $${totalPagar.toLocaleString('es-CL')}*\n\n`;
    detalle += `¿Deseas pagar ahora con Webpay / Tesorería?\n\nResponde *SI* para confirmar o *NO* para cancelar.`;

    return NextResponse.json({
      reply: detalle,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Confirmación de pago
  if (step === 'CONFIRM_PAYMENT') {
    if (cleanMsg === 'SI' || cleanMsg === 'SÍ') {
      return NextResponse.json({
        reply: `💳 *Pasarela Segura Municipal*\n\nAccede a pagar con Webpay / Débito / Tarjetas:\n🔗 https://pagos.purranque.cl/pay/tx_998234\n\n⏳ _Expira en 15 minutos._\n\n*(Escribe 'PAGADO' para simular la confirmación bancaria)*`,
        next_step: 'AWAIT_WEBHOOK'
      });
    }
    return NextResponse.json({
      reply: "Operación cancelada. Escribe 'HOLA' para volver al inicio.",
      next_step: 'INIT'
    });
  }

  if (step === 'AWAIT_WEBHOOK') {
    return NextResponse.json({
      reply: `🎉 *¡Pago Aprobado Exitosamente!* (Folio SUBDERE: #PUR-2026-9041)\n\nAdjuntamos tu *Permiso de Circulación 2026* timbrado digitalmente.\n\n📄 [Descargar Permiso_2026_ABCD12.pdf]\n\n¡Gracias por aportar a los caminos y progreso de Purranque! 🚜`,
      next_step: 'INIT'
    });
  }

  return NextResponse.json({
    reply: "Escribe *HOLA* para ver el menú de trámites.",
    next_step: 'INIT'
  });
}
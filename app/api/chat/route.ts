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

const MENU_TEXT = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de Purranque* 🇨🇱

¿Qué trámite deseas realizar?

1️⃣ Pagar Permiso de Circulación (Pago Express)
2️⃣ Obtener Duplicado de Permiso (Instantáneo)
3️⃣ Agendar Licencia (Pre-chequeo rural sin filas)
4️⃣ Consultar / Pagar Patente Comercial
5️⃣ Reportar estado de camino o luminaria (100% Anónimo)

_Responde con el número de tu opción (1-5) o escribe MENU en cualquier momento para volver._`;

export async function POST(req: Request) {
  const { message, step, hasImage } = await req.json();
  const cleanMsg = (message || '').trim().toUpperCase();

  // COMANDO UNIVERSAL: Regresar al menú desde cualquier parte
  if (['0', 'MENU', 'VOLVER', 'CANCELAR', 'INICIO', 'HOLA', 'SALIR'].includes(cleanMsg)) {
    return NextResponse.json({
      reply: MENU_TEXT,
      next_step: 'INIT'
    });
  }

  // Paso Inicial: Menú Principal
  if (step === 'INIT') {
    if (cleanMsg === '1' || cleanMsg.includes('PAGAR')) {
      return NextResponse.json({
        reply: "🚗 *Pago de Permiso de Circulación (Pago Express Purranque)*\n\nPor favor, escribe la *Placa Patente (PPU)* de tu vehículo (ej: `ABCD12`, `GFHY45`):\n\n_Escribe *0* o *VOLVER* para regresar al menú._",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2' || cleanMsg.includes('DUPLICADO')) {
      return NextResponse.json({
        reply: "📄 *Obtener Duplicado de Permiso de Circulación*\n\nIngresa la *Patente* del vehículo para buscar tu documento histórico:\n\n_Escribe *0* o *VOLVER* para regresar al menú._",
        next_step: 'AWAIT_DUPLICADO'
      });
    }
    if (cleanMsg === '3' || cleanMsg.includes('LICENCIA')) {
      return NextResponse.json({
        reply: "🪪 *Licencias de Conducir - Pre-chequeo Rural*\n\nPara validar tu hoja de conductor antes de viajar a Purranque, requerimos autenticación vía *ClaveÚnica*:",
        requires_auth: true,
        tramite_id: "LIC-2026-PURR",
        next_step: 'AUTH_PENDING'
      });
    }
    if (cleanMsg === '4' || cleanMsg.includes('COMERCIAL')) {
      return NextResponse.json({
        reply: "🏪 *Patentes Comerciales e Industriales*\n\nIngresa el RUT de la empresa o titular (ej: `76123456-7`):\n\n_Escribe *0* o *VOLVER* para regresar al menú._",
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    if (cleanMsg === '5' || cleanMsg.includes('REPORTE') || cleanMsg.includes('CAMINO') || cleanMsg.includes('ANONIMO')) {
      return NextResponse.json({
        reply: "🚜 *Reportes de Caminos y Servicios Rurales (100% Anónimo)*\n\n🛡️ _Este canal es directo y privado con la Dirección de Operaciones de Purranque. Tu identidad está protegida para evitar exposiciones o funas en redes sociales._\n\n¿En qué sector rural está el incidente? (Corte Alto, Hueyusca, Concordia, Crucero, Manquemapu, etc.):\n\n_Escribe *0* o *VOLVER* para cancelar._",
        next_step: 'AWAIT_SECTOR_REPORTE'
      });
    }

    return NextResponse.json({
      reply: `⚠️ Opción no reconocida.\n\n${MENU_TEXT}`,
      next_step: 'INIT'
    });
  }

  // Flujo Reporte Rural Anónimo: Paso 1 (Sector)
  if (step === 'AWAIT_SECTOR_REPORTE') {
    return NextResponse.json({
      reply: `📍 Sector registrado: *${message}*.\n\n📸 Por favor, describe brevemente el problema y *adjunta una fotografía del camino o luminaria* (usa el botón de la cámara 📷 en el chat para enviar la imagen).\n\n_Escribe *0* o *VOLVER* para cancelar._`,
      next_step: 'AWAIT_FOTO_REPORTE',
      sector: message
    });
  }

  // Flujo Reporte Rural Anónimo: Paso 2 (Foto y Confirmación)
  if (step === 'AWAIT_FOTO_REPORTE') {
    const folio = "REP-" + Math.floor(1000 + Math.random() * 9000);
    return NextResponse.json({
      reply: `✅ *Reporte Recibido y Foliado (#${folio})*\n\n📸 *Evidencia fotográfica:* Adjuntada correctamente.\n🛡️ *Privacidad:* Registro anónimo sin datos públicos.\n🚜 *Derivación:* Cuadrilla de Maquinaria y Caminos Rurales asignada.\n\nTe notificaremos por este canal cuando el equipo municipal inspeccione el terreno.\n\n_Escribe *MENU* para realizar otro trámite._`,
      next_step: 'INIT'
    });
  }

  // Flujo Duplicados
  if (step === 'AWAIT_DUPLICADO') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v) {
      return NextResponse.json({
        reply: `⚠️ No se encontró registro para la patente *${cleanMsg}*.\n\n_Escribe otra patente o escribe *0* para volver al menú principal._`,
        next_step: 'AWAIT_DUPLICADO'
      });
    }
    return NextResponse.json({
      reply: `✅ *Duplicado Encontrado*\n\nVehículo: *${v.marca} ${v.modelo}*\nFolio SUBDERE: *${v.folio_anterior}*\nPropietario: *${v.propietario}* (RUN: ${v.propietario_run})\n\n📄 Tu copia oficial digital:\n👉 [Descargar_Duplicado_${v.ppu}.pdf]\n\n_Escribe *MENU* para volver al inicio._`,
      next_step: 'INIT'
    });
  }

  // Flujo Patentes Comerciales
  if (step === 'AWAIT_RUT_COMERCIAL') {
    const rawRut = cleanMsg.replace(/\./g, '');
    const p = PATENTES_COMERCIALES_DB[rawRut];
    if (!p) {
      return NextResponse.json({
        reply: `⚠️ RUT no encontrado en catastro. (Demo: usa \`76123456-7\`).\n\n_Escribe otro RUT o *0* para volver al menú._`,
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    return NextResponse.json({
      reply: `🏪 *Patente Comercial Encontrada*\n\n• Razón Social: *${p.razon_social}*\n• Rol: *${p.rol_patente}*\n• Tipo: *${p.tipo}*\n• Estado: *AL DÍA*\n• Valor 1er Semestre 2026: *$${p.monto_semestre.toLocaleString('es-CL')}*\n\n¿Deseas pagar en línea este semestre? Responde *SI* o escribe *0* para volver.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Flujo Pago Permiso (PPU)
  if (step === 'AWAIT_PATENTE') {
    const vehiculo = VEHICULOS_DB[cleanMsg];

    if (!vehiculo) {
      return NextResponse.json({
        reply: `⚠️ La patente *${cleanMsg}* no figura en Purranque.\n\nPatentes de prueba demo:\n• \`ABCD12\` (Al día - Corte Alto)\n• \`GFHY45\` (Con multas JPL - Hueyusca)\n• \`KJTR88\` (Revisión Vencida)\n\n_Escribe otra patente o *0* para volver al menú._`,
        next_step: 'AWAIT_PATENTE'
      });
    }

    if (!vehiculo.prt_vigente) {
      return NextResponse.json({
        reply: `🛑 *Trámite Bloqueado por Revisión Técnica*\n\nVehículo: *${vehiculo.marca} ${vehiculo.modelo}*\nSector: *${vehiculo.sector}*\n\nTu Revisión Técnica figura *VENCIDA (${vehiculo.prt_vence})*.\n\nℹ️ Para no perder el viaje a Purranque, debes regularizarla en una planta PRT autorizada antes de pagar.\n\n_Escribe *MENU* para volver al inicio._`,
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
    detalle += `¿Deseas pagar ahora vía Webpay?\n\nResponde *SI* para confirmar o *0* para volver al menú.`;

    return NextResponse.json({
      reply: detalle,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Confirmación de Pago
  if (step === 'CONFIRM_PAYMENT') {
    if (cleanMsg === 'SI' || cleanMsg === 'SÍ') {
      return NextResponse.json({
        reply: `💳 *Pasarela Segura Municipal*\n\nAccede a pagar con Webpay / Débito / Tarjetas:\n🔗 https://pagos.purranque.cl/pay/tx_998234\n\n⏳ _Expira en 15 minutos._\n\n*(Escribe 'PAGADO' para simular la confirmación bancaria o '0' para cancelar)*`,
        next_step: 'AWAIT_WEBHOOK'
      });
    }
    return NextResponse.json({
      reply: `Operación cancelada.\n\n${MENU_TEXT}`,
      next_step: 'INIT'
    });
  }

  if (step === 'AWAIT_WEBHOOK') {
    if (cleanMsg === 'PAGADO') {
      return NextResponse.json({
        reply: `🎉 *¡Pago Aprobado Exitosamente!* (Folio SUBDERE: #PUR-2026-9041)\n\nAdjuntamos tu *Permiso de Circulación 2026* con firma electrónica.\n\n📄 [Descargar Permiso_2026_ABCD12.pdf]\n\n¡Gracias por aportar al progreso de Purranque! 🚜\n\n_Escribe *MENU* para realizar otro trámite._`,
        next_step: 'INIT'
      });
    }
  }

  return NextResponse.json({
    reply: MENU_TEXT,
    next_step: 'INIT'
  });
}
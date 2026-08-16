import { NextResponse } from 'next/server';

// Base de datos Mock con casos de Purranque (Ruralidad y Casos de Borde)
const VEHICULOS_DB: Record<string, any> = {
  "ABCD12": {
    ppu: "ABCD12",
    marca: "Toyota",
    modelo: "Hilux 4x4",
    anio: 2021,
    comuna: "Purranque",
    sector: "Corte Alto",
    propietario: "Juan Carlos Gallardo",
    prt_vigente: true,
    prt_vence: "30-Nov-2026",
    soap_vigente: true,
    multas: [],
    valor_permiso: 54200
  },
  "GFHY45": {
    ppu: "GFHY45",
    marca: "Nissan",
    modelo: "Terrano",
    anio: 2018,
    comuna: "Purranque",
    sector: "Hueyusca",
    propietario: "María Elena Soto",
    prt_vigente: true,
    prt_vence: "31-Oct-2026",
    soap_vigente: true,
    multas: [
      { juzgado: "JPL Purranque", motivo: "Estacionar sobre acera", monto: 35000 }
    ],
    valor_permiso: 38000
  },
  "KJTR88": {
    ppu: "KJTR88",
    marca: "Chevrolet",
    modelo: "Sail",
    anio: 2017,
    comuna: "Purranque",
    sector: "Crucero",
    propietario: "Pedro Almonacid",
    prt_vigente: false,
    prt_vence: "31-Mar-2026 (VENCIDA)",
    soap_vigente: true,
    multas: [],
    valor_permiso: 31000
  },
  "LLPP90": {
    ppu: "LLPP90",
    marca: "Mitsubishi",
    modelo: "L200",
    anio: 2022,
    comuna: "Osorno",
    sector: "Traslado a Purranque",
    propietario: "Carlos Hinostroza",
    prt_vigente: true,
    prt_vence: "31-Dic-2026",
    soap_vigente: true,
    multas: [],
    valor_permiso: 62000
  }
};

export async function POST(req: Request) {
  const { message, step, user_data } = await req.json();
  const cleanMsg = message.trim().toUpperCase();

  // Flujo 1: Menú Inicial
  if (step === 'INIT') {
    if (cleanMsg === '1' || cleanMsg.includes('PERMISO')) {
      return NextResponse.json({
        reply: "🚗 *Renovación de Permiso de Circulación - Purranque*\n\nPor favor, ingresa la *Placa Patente (PPU)* del vehículo (ej: `ABCD12`, `GFHY45`, `KJTR88` o `LLPP90`):",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2' || cleanMsg.includes('LICENCIA')) {
      return NextResponse.json({
        reply: "🪪 *Dirección de Tránsito - Licencias de Conducir*\n\nPara agendar tu hora y realizar el pre-chequeo rural sin viajar en vano, necesitamos verificar tu identidad con *ClaveÚnica*.",
        requires_auth: true,
        tramite_id: "LIC-2026-PURR",
        next_step: 'AUTH_PENDING'
      });
    }
    return NextResponse.json({
      reply: "👋 ¡Hola! Bienvenido al asistente de la *Ilustre Municipalidad de Purranque* 🇨🇱\n\n¿Qué trámite deseas realizar?\n\n1️⃣ Pagar Permiso de Circulación\n2️⃣ Agendar Licencia (Pre-chequeo rural sin filas)\n3️⃣ Consultar estado de caminos y OIRS\n\n_Responde con el número de tu opción._",
      next_step: 'INIT'
    });
  }

  // Flujo 2: Búsqueda y Validación de Patente
  if (step === 'AWAIT_PATENTE') {
    const vehiculo = VEHICULOS_DB[cleanMsg];

    if (!vehiculo) {
      return NextResponse.json({
        reply: `⚠️ La patente *${cleanMsg}* no figura en el registro comunal de Purranque.\n\nPara patentes de prueba en la demo, usa:\n• \`ABCD12\` (Al día - Corte Alto)\n• \`GFHY45\` (Con multas JPL - Hueyusca)\n• \`KJTR88\` (Revisión Vencida)\n• \`LLPP90\` (Traslado desde Osorno)`,
        next_step: 'AWAIT_PATENTE'
      });
    }

    if (!vehiculo.prt_vigente) {
      return NextResponse.json({
        reply: `🛑 *Trámite Bloqueado por Revisión Técnica*\n\nVehículo: *${vehiculo.marca} ${vehiculo.modelo}*\nSector: *${vehiculo.sector}*\n\nTu Revisión Técnica figura *VENCIDA (${vehiculo.prt_vence})* en la base de datos de Plantas PRT.\n\nℹ️ Para no perder el viaje a Purranque, debes regularizar tu revisión en una planta autorizada (Osorno o Frutillar) antes de pagar el permiso.`,
        next_step: 'INIT'
      });
    }

    const totalMultas = vehiculo.multas.reduce((acc: number, m: any) => acc + m.monto, 0);
    const totalPagar = vehiculo.valor_permiso + totalMultas;

    let detalle = `✅ *Vehículo Habilitado para Pago*\n\n`;
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
    detalle += `¿Deseas generar el enlace de pago seguro vía Webpay / Tesorería?\n\nResponde *SI* para confirmar o *NO* para cancelar.`;

    return NextResponse.json({
      reply: detalle,
      vehiculo_data: vehiculo,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Flujo 3: Confirmación de Pago
  if (step === 'CONFIRM_PAYMENT') {
    if (cleanMsg === 'SI' || cleanMsg === 'SÍ') {
      return NextResponse.json({
        reply: `💳 *Enlace de Pago Generado*\n\nAccede a la pasarela segura municipal (Transbank / TGR):\n🔗 https://pagos.purranque.cl/pay/tx_998234\n\n⏳ _Este enlace expira en 15 minutos._\n\n*(Escribe 'PAGADO' para simular la confirmación del Webhook bancario)*`,
        next_step: 'AWAIT_WEBHOOK'
      });
    }
    return NextResponse.json({
      reply: "Operación cancelada. Escribe 'HOLA' para volver al menú.",
      next_step: 'INIT'
    });
  }

  // Flujo 4: Simulación de Pago Exitoso y Emisión de Permiso
  if (step === 'AWAIT_WEBHOOK') {
    return NextResponse.json({
      reply: `🎉 *¡Pago Aprobado Exitosamente!* (Folio Subdere: #PUR-2026-9041)\n\nAdjuntamos tu *Permiso de Circulación 2026* con firma electrónica avanzada y timbre de agua municipal.\n\n📄 [Descargar Permiso_2026_ABCD12.pdf]\n\n¡Gracias por aportar al desarrollo de los caminos y servicios de Purranque! 🚜`,
      next_step: 'INIT'
    });
  }

  return NextResponse.json({
    reply: "Escribe *HOLA* para iniciar una nueva atención.",
    next_step: 'INIT'
  });
}
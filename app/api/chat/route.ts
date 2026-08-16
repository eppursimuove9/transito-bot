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

const MENU_PRINCIPAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de Purranque* 🇨🇱

Selecciona el área de tu trámite:

1️⃣ 🚗 *Tránsito y Vehículos* (Permisos, Duplicados, Licencias, Multas)
2️⃣ 🏪 *Negocios y Rentas* (Patentes Comerciales, Ferias, Certificados)
3️⃣ 🏡 *Vecinos y Hogar* (Aseo, Reporte de Caminos 100% Anónimo)

_Escribe el número de tu opción (1, 2 o 3)._`;

const MENU_TRANSITO = `🚗 *Dirección de Tránsito - Municipalidad de Purranque*

1️⃣ Pagar Permiso de Circulación (Pago Express por Patente)
2️⃣ Obtener Duplicado de Permiso (PDF Oficial)
3️⃣ Consultar y Pagar Multas JPL pendientes
4️⃣ Agendar Licencia (Pre-chequeo rural con ClaveÚnica)

_Escribe tu opción (1-4) o escribe *0* para volver al menú principal._`;

const MENU_RENTAS = `🏪 *Departamento de Rentas y Patentes Comerciales*

1️⃣ Consultar y Pagar Patente Comercial / MEF (Por RUT)
2️⃣ Pago de Derechos de Feria Libre / Permiso Ambulante
3️⃣ Descargar Certificado de Patente al Día (PDF)

_Escribe tu opción (1-3) o escribe *0* para volver al menú principal._`;

const MENU_VECINOS = `🏡 *Servicios Comunitarios y Atención al Vecino*

1️⃣ Consultar / Pagar Derechos de Aseo Domiciliario (Por Rol)
2️⃣ Reportar estado de camino rural o luminaria (100% Anónimo + Foto)
3️⃣ Solicitar retiro de ramas y escombros en sector rural

_Escribe tu opción (1-3) o escribe *0* para volver al menú principal._`;

export async function POST(req: Request) {
  const { message, step } = await req.json();
  const cleanMsg = (message || '').trim().toUpperCase();

  // COMANDO UNIVERSAL DE REGRESO
  if (['0', 'MENU', 'VOLVER', 'CANCELAR', 'INICIO', 'HOLA', 'SALIR'].includes(cleanMsg)) {
    return NextResponse.json({
      reply: MENU_PRINCIPAL,
      next_step: 'INIT'
    });
  }

  // --- 1. MENÚ PRINCIPAL ---
  if (step === 'INIT') {
    if (cleanMsg === '1' || cleanMsg.includes('TRANSITO') || cleanMsg.includes('VEHICULO')) {
      return NextResponse.json({
        reply: MENU_TRANSITO,
        next_step: 'SUBMENU_TRANSITO'
      });
    }
    if (cleanMsg === '2' || cleanMsg.includes('COMERCIO') || cleanMsg.includes('RENTA') || cleanMsg.includes('NEGOCIO')) {
      return NextResponse.json({
        reply: MENU_RENTAS,
        next_step: 'SUBMENU_RENTAS'
      });
    }
    if (cleanMsg === '3' || cleanMsg.includes('VECINO') || cleanMsg.includes('HOGAR') || cleanMsg.includes('ASEO') || cleanMsg.includes('CAMINO')) {
      return NextResponse.json({
        reply: MENU_VECINOS,
        next_step: 'SUBMENU_VECINOS'
      });
    }

    return NextResponse.json({
      reply: `⚠️ Opción no válida.\n\n${MENU_PRINCIPAL}`,
      next_step: 'INIT'
    });
  }

  // --- 2. SUBMENÚ TRÁNSITO ---
  if (step === 'SUBMENU_TRANSITO') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🚗 *Pago Express de Permiso de Circulación*\n\nIngresa la *Placa Patente (PPU)* de tu vehículo (ej: `ABCD12`, `GFHY45`, `KJTR88`):\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "📄 *Duplicado de Permiso de Circulación*\n\nIngresa la *Placa Patente* para buscar la copia oficial timbrada:\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_DUPLICADO'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: "⚖️ *Consulta de Multas - Juzgado de Policía Local Purranque*\n\nIngresa la *Placa Patente* a consultar (ej: `GFHY45`):\n\n_Escribe *0* para volver._",
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
        reply: "🏪 *Consulta de Patente Comercial / MEF*\n\nIngresa el RUT de la empresa o titular (ej: `76123456-7`):\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "🧺 *Pago de Derechos de Feria Libre / Ambulante*\n\nIngresa tu RUN de comerciante registrado en Purranque:\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_RUN_FERIA'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: "📜 *Certificado de Patente Comercial al Día*\n\nIngresa el RUT de la empresa para emitir el certificado digital con firma electrónica:\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_RUT_CERTIFICADO'
      });
    }
  }

  // --- 4. SUBMENÚ VECINOS Y HOGAR ---
  if (step === 'SUBMENU_VECINOS') {
    if (cleanMsg === '1') {
      return NextResponse.json({
        reply: "🧹 *Derechos de Aseo Domiciliario*\n\nIngresa el *Rol de Avalúo* de tu propiedad (ej: `123-45`):\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_ROL_ASEO'
      });
    }
    if (cleanMsg === '2') {
      return NextResponse.json({
        reply: "🚜 *Reportes de Caminos Rurales y Luminarias (100% Anónimo)*\n\n🛡️ _Este canal es directo y privado con la Dirección de Operaciones para evitar funas en redes sociales._\n\n¿En qué sector se ubica el problema? (Corte Alto, Hueyusca, Crucero, Concordia, Manquemapu):\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_SECTOR_REPORTE'
      });
    }
    if (cleanMsg === '3') {
      return NextResponse.json({
        reply: "🚛 *Retiro de Escombros y Ramas en Sector Rural*\n\nIndica tu dirección o sector y volumen aproximado ($m^3$):\n\n_Escribe *0* para volver._",
        next_step: 'AWAIT_ESCOMBROS'
      });
    }
  }

  // --- PROCESAMIENTO DE CASOS ESPECÍFICOS ---

  // Tránsito: Pago Express
  if (step === 'AWAIT_PATENTE') {
    const vehiculo = VEHICULOS_DB[cleanMsg];
    if (!vehiculo) {
      return NextResponse.json({
        reply: `⚠️ La patente *${cleanMsg}* no registra en Purranque. Patentes de prueba: \`ABCD12\` (Al día), \`GFHY45\` (Multa JPL), \`KJTR88\` (PRT Vencida).\n\n_Escribe otra patente o *0* para menú._`,
        next_step: 'AWAIT_PATENTE'
      });
    }
    if (!vehiculo.prt_vigente) {
      return NextResponse.json({
        reply: `🛑 *Trámite Bloqueado: Revisión Técnica Vencida*\n\nVehículo: *${vehiculo.marca} ${vehiculo.modelo}*\nSector: *${vehiculo.sector}*\nEstado: *${vehiculo.prt_vence}*\n\nℹ️ Para no perder el viaje a Purranque, regulariza en planta PRT antes de pagar.\n\n_Escribe *0* para menú._`,
        next_step: 'INIT'
      });
    }

    const totalMultas = vehiculo.multas.reduce((acc: number, m: any) => acc + m.monto, 0);
    const totalPagar = vehiculo.valor_permiso + totalMultas;

    let d = `✅ *Vehículo Habilitado para Pago Express*\n\n`;
    d += `• Patente: *${vehiculo.ppu}*\n`;
    d += `• Propietario: *${vehiculo.propietario}*\n`;
    d += `• Sector: *${vehiculo.sector}*\n`;
    d += `• PRT: *Vigente hasta ${vehiculo.prt_vence}*\n\n`;
    d += `💰 *Liquidación:*\n`;
    d += `• Permiso: *$${vehiculo.valor_permiso.toLocaleString('es-CL')}*\n`;
    if (totalMultas > 0) d += `• Multas JPL: *$${totalMultas.toLocaleString('es-CL')}*\n`;
    d += `• *TOTAL A PAGAR: $${totalPagar.toLocaleString('es-CL')}*\n\n`;
    d += `¿Deseas pagar ahora vía Webpay? Responde *SI* o escribe *0* para cancelar.`;

    return NextResponse.json({ reply: d, next_step: 'CONFIRM_PAYMENT' });
  }

  // Tránsito: Duplicados
  if (step === 'AWAIT_DUPLICADO') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v) {
      return NextResponse.json({
        reply: `⚠️ No se encontró registro para *${cleanMsg}*. Escribe otra patente o *0* para volver.`,
        next_step: 'AWAIT_DUPLICADO'
      });
    }
    return NextResponse.json({
      reply: `✅ *Duplicado Oficial Encontrado*\n\nVehículo: *${v.marca} ${v.modelo}*\nFolio SUBDERE: *${v.folio_anterior}*\nPropietario: *${v.propietario}*\n\n📄 Copia timbrada lista para descarga:\n👉 [Descargar_Duplicado_${v.ppu}.pdf]\n\n_Escribe *0* para volver al menú._`,
      next_step: 'INIT'
    });
  }

  // Tránsito: Consulta Multas JPL
  if (step === 'AWAIT_PATENTE_MULTA') {
    const v = VEHICULOS_DB[cleanMsg];
    if (!v || v.multas.length === 0) {
      return NextResponse.json({
        reply: `✅ La patente *${cleanMsg}* no registra multas de Policía Local en Purranque.\n\n_Escribe *0* para menú._`,
        next_step: 'INIT'
      });
    }
    return NextResponse.json({
      reply: `⚠️ *Infracciones Pendientes en JPL Purranque:*\n\n• Causa: *${v.multas[0].motivo}*\n• Tribunal: *${v.multas[0].juzgado}*\n• Monto: *$${v.multas[0].monto.toLocaleString('es-CL')}*\n\n¿Deseas liquidar esta multa en línea? Responde *SI* o *0* para cancelar.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Rentas: Patentes Comerciales
  if (step === 'AWAIT_RUT_COMERCIAL' || step === 'AWAIT_RUT_CERTIFICADO') {
    const raw = cleanMsg.replace(/\./g, '');
    const p = PATENTES_COMERCIALES_DB[raw];
    if (!p) {
      return NextResponse.json({
        reply: `⚠️ RUT no encontrado. Para la demo usa: \`76123456-7\` (Quesos Corte Alto).\n\n_Escribe otro RUT o *0* para volver._`,
        next_step: 'AWAIT_RUT_COMERCIAL'
      });
    }
    if (step === 'AWAIT_RUT_CERTIFICADO') {
      return NextResponse.json({
        reply: `📜 *Certificado de Patente al Día*\n\n• Razón Social: *${p.razon_social}*\n• Rol: *${p.rol}*\n• Estado: *AL DÍA*\n\n📄 Documento timbrado listo:\n👉 [Descargar_Certificado_Vigencia_${p.rol}.pdf]\n\n_Escribe *0* para volver._`,
        next_step: 'INIT'
      });
    }
    return NextResponse.json({
      reply: `🏪 *Patente Comercial Encontrada*\n\n• Razón Social: *${p.razon_social}*\n• Rol: *${p.rol}*\n• Tipo: *${p.tipo}*\n• Valor 1er Semestre: *$${p.monto_semestre.toLocaleString('es-CL')}*\n\n¿Pagar ahora vía Webpay? Responde *SI* o *0* para volver.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Vecinos: Aseo Domiciliario
  if (step === 'AWAIT_ROL_ASEO') {
    const a = ASEO_DOMICILIARIO_DB[cleanMsg];
    if (!a) {
      return NextResponse.json({
        reply: `⚠️ Rol no registrado en Purranque. Usa el Rol demo: \`123-45\`.\n\n_Escribe otro Rol o *0* para menú._`,
        next_step: 'AWAIT_ROL_ASEO'
      });
    }
    return NextResponse.json({
      reply: `🧹 *Derechos de Aseo Domiciliario*\n\n• Propiedad: *${a.direccion}*\n• Titular: *${a.titular}*\n• Cuotas Pendientes: *${a.cuotas_pendientes}*\n• Total a Pagar: *$${a.monto_total.toLocaleString('es-CL')}*\n\n¿Deseas pagar en línea? Responde *SI* o *0* para volver.`,
      next_step: 'CONFIRM_PAYMENT'
    });
  }

  // Vecinos: Reporte Anónimo Paso 1
  if (step === 'AWAIT_SECTOR_REPORTE') {
    return NextResponse.json({
      reply: `📍 Sector registrado: *${message}*.\n\n📸 Describe el problema y adjunta una foto (usa el botón de la cámara 📷 en el chat):\n\n_Escribe *0* para cancelar._`,
      next_step: 'AWAIT_FOTO_REPORTE'
    });
  }

  // Vecinos: Reporte Anónimo Paso 2
  if (step === 'AWAIT_FOTO_REPORTE') {
    const folio = "REP-" + Math.floor(1000 + Math.random() * 9000);
    return NextResponse.json({
      reply: `✅ *Reporte Recibido y Foliado (#${folio})*\n\n📸 *Foto:* Evidencia adjunta con éxito.\n🛡️ *Privacidad:* 100% Anónimo (sin exposición en redes sociales).\n🚜 *Derivación:* Cuadrilla de Caminos Rurales asignada.\n\n_Escribe *0* para realizar otro trámite._`,
      next_step: 'INIT'
    });
  }

  // Vecinos: Escombros
  if (step === 'AWAIT_ESCOMBROS') {
    return NextResponse.json({
      reply: `🚛 *Solicitud Registrada (#SOL-4091)*\n\nTu requerimiento de retiro de escombros fue ingresado a Operaciones. Te contactaremos para coordinar la pasada del camión tolva.\n\n_Escribe *0* para volver._`,
      next_step: 'INIT'
    });
  }

  // Confirmación de Pagos
  if (step === 'CONFIRM_PAYMENT') {
    if (cleanMsg === 'SI' || cleanMsg === 'SÍ') {
      return NextResponse.json({
        reply: `💳 *Pasarela Segura Municipal (Webpay / TGR)*\n\n🔗 https://pagos.purranque.cl/pay/tx_998234\n\n⏳ _Expira en 15 minutos._\n\n*(Escribe 'PAGADO' para simular confirmación bancaria o '0' para cancelar)*`,
        next_step: 'AWAIT_WEBHOOK'
      });
    }
    return NextResponse.json({ reply: `Operación cancelada.\n\n${MENU_PRINCIPAL}`, next_step: 'INIT' });
  }

  if (step === 'AWAIT_WEBHOOK') {
    if (cleanMsg === 'PAGADO') {
      return NextResponse.json({
        reply: `🎉 *¡Pago Aprobado Exitosamente!* (Folio #PUR-2026-9041)\n\nAdjuntamos tu comprobante oficial timbrado digitalmente.\n\n📄 [Descargar_Comprobante_Oficial.pdf]\n\n¡Gracias por aportar al desarrollo de Purranque! 🚜\n\n_Escribe *0* para volver al menú._`,
        next_step: 'INIT'
      });
    }
  }

  return NextResponse.json({ reply: MENU_PRINCIPAL, next_step: 'INIT' });
}
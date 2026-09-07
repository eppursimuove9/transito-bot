'use client';

import React, { useState } from 'react';

interface Ticket {
  id: string;
  citizen: string;
  phone: string;
  sector: string;
  type: 'CALLBACK' | 'CAMINO' | 'PERMISO' | 'CHATARRA';
  description: string;
  slaMinutes: number;
  status: 'PENDIENTE' | 'ATENDIDO' | 'EN_RUTA';
  createdAt: string;
}

interface IngestedDoc {
  id: string;
  title: string;
  department: string;
  tokens: number;
  status: 'INDEXADO' | 'PROCESANDO';
  date: string;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TK-1082',
    citizen: 'Héctor Manqui',
    phone: '+56 9 8451 2290',
    sector: 'Puerto Nuevo',
    type: 'CALLBACK',
    description: 'Solicita llamado: Problema con liquidación permiso camión 3/4',
    slaMinutes: 14,
    status: 'PENDIENTE',
    createdAt: 'Hace 14 min'
  },
  {
    id: 'TK-1081',
    citizen: 'Gladys Monsalve',
    phone: '+56 9 7612 0041',
    sector: 'Mashue',
    type: 'CAMINO',
    description: 'Reporte bache profundo en curva km 4 camino ripio [Foto adjunta]',
    slaMinutes: 45,
    status: 'EN_RUTA',
    createdAt: 'Hace 45 min'
  },
  {
    id: 'TK-1080',
    citizen: 'Carlos Vera',
    phone: '+56 9 9341 8812',
    sector: 'Urbano (Arturo Prat)',
    type: 'PERMISO',
    description: 'Pago Express completado PPU: GHJK99 (Permiso timbrado emitido)',
    slaMinutes: 0,
    status: 'ATENDIDO',
    createdAt: 'Hace 1 hora'
  },
  {
    id: 'TK-1079',
    citizen: 'Rosa Cárdenas',
    phone: '+56 9 8110 5543',
    sector: 'Trumao',
    type: 'CALLBACK',
    description: 'Duda sobre exención de derechos aseo adulto mayor DIDECO',
    slaMinutes: 72,
    status: 'PENDIENTE',
    createdAt: 'Hace 1 hora 12 min'
  },
  {
    id: 'TK-1078',
    citizen: 'Juan Pablo Ortiz',
    phone: '+56 9 6554 1120',
    sector: 'Choroico',
    type: 'CHATARRA',
    description: 'Solicitud retiro 3 baterías en desuso y fierros viejos',
    slaMinutes: 120,
    status: 'ATENDIDO',
    createdAt: 'Hace 2 horas'
  }
];

const INITIAL_DOCS: IngestedDoc[] = [
  {
    id: 'DOC-01',
    title: 'Decreto Alcaldicio N° 1.420 - Calendario Patentes 2026.pdf',
    department: 'Rentas y Finanzas',
    tokens: 3420,
    status: 'INDEXADO',
    date: 'Hoy, 09:15'
  },
  {
    id: 'DOC-02',
    title: 'Bases Postulación Subsidio Rural Agua Potable (APR).pdf',
    department: 'DIDECO (Social)',
    tokens: 8150,
    status: 'INDEXADO',
    date: 'Ayer, 16:40'
  },
  {
    id: 'DOC-03',
    title: 'Ordenanza Local de Cuidado de Caminos y Tránsito Pesado.pdf',
    department: 'Dirección de Tránsito',
    tokens: 5200,
    status: 'INDEXADO',
    date: '04 Sep 2026'
  }
];

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [filter, setFilter] = useState<'ALL' | 'CALLBACK' | 'CAMINO' | 'PERMISO'>('ALL');
  
  // Estado para gestión RAG Documental
  const [docs, setDocs] = useState<IngestedDoc[]>(INITIAL_DOCS);
  const [selectedDept, setSelectedDept] = useState('Dirección de Tránsito');
  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const markAsResolved = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'ATENDIDO' } : t))
    );
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);
    setUploadSuccess(false);

    // Simulación de procesamiento de embeddings y vectorización
    setTimeout(() => {
      const newDoc: IngestedDoc = {
        id: `DOC-${String(docs.length + 1).padStart(2, '0')}`,
        title: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
        department: selectedDept,
        tokens: Math.floor(Math.random() * 4000) + 2000,
        status: 'INDEXADO',
        date: 'Hace un momento'
      };

      setDocs([newDoc, ...docs]);
      setDocName('');
      setIsUploading(false);
      setUploadSuccess(true);

      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1200);
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.type === filter);

  // Datos para los gráficos
  const revenueHours = [
    { hour: '08:00', amount: '$420K', height: '25%' },
    { hour: '10:00', amount: '$980K', height: '65%' },
    { hour: '12:00', amount: '$1.45M', height: '95%' },
    { hour: '14:00', amount: '$610K', height: '40%' },
    { hour: '16:00', amount: '$840K', height: '55%' },
    { hour: '18:00', amount: '$550K', height: '35%' }
  ];

  const sectorStats = [
    { name: 'Puerto Nuevo', pct: 85, color: 'bg-blue-500' },
    { name: 'Mashue', pct: 65, color: 'bg-emerald-500' },
    { name: 'Choroico', pct: 50, color: 'bg-amber-500' },
    { name: 'Trumao / Llancacura', pct: 40, color: 'bg-purple-500' },
    { name: 'Urbano (La Unión Centro)', pct: 95, color: 'bg-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Barra Superior */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-50 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Ventanilla Única WhatsApp</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Centro de Control & Gestión • Ilustre Municipalidad de La Unión
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
            Rol: Administrador Municipal / Alcaldía
          </span>
          <span className="text-xs bg-blue-600/30 text-blue-400 border border-blue-500/40 px-3 py-1.5 rounded-lg">
            Nodo RAG Activo (pgvector)
          </span>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Fila de Métricas Principales (KPI Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Recaudación Permisos Hoy</p>
            <p className="text-2xl font-bold text-white mt-1">$4.850.300 <span className="text-xs text-emerald-400 font-normal">CLP</span></p>
            <p className="text-xs text-emerald-400 mt-2">↑ 38 trámites cerrados por Webpay</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Tasa Cumplimiento SLA (Callbacks)</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">94.2%</p>
            <p className="text-xs text-slate-400 mt-2">Promedio respuesta: 18 min</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Consultas RAG Comunal (IA)</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">1.240</p>
            <p className="text-xs text-slate-400 mt-2">Semantic Cache Hit: 88%</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Incidentes Vecinales Resueltos</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">19</p>
            <p className="text-xs text-slate-400 mt-2">Aseo, caminos y luminarias</p>
          </div>
        </div>

        {/* SECCIÓN DE GRÁFICOS ANALÍTICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Recaudación por Horario */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Flujo de Recaudación en Vivo (Permisos & Derechos)
                </h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  Pico: 12:00 hrs
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Ingresos procesados vía Webpay / TGR por tramo horario</p>
            </div>

            {/* Gráfico de Barras Verticales */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-700">
              {revenueHours.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {bar.amount}
                  </span>
                  <div className="w-full bg-slate-700/60 rounded-t-md overflow-hidden flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-500 group-hover:brightness-125"
                      style={{ height: bar.height }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{bar.hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico 2: Consultas por Sector Territorial */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Adopción Territorial de WhatsApp por Sector
                </h2>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                  Provincia del Ranco
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Interacciones ciudadanas registradas en áreas rurales y urbanas</p>
            </div>

            {/* Gráfico de Barras Horizontales */}
            <div className="space-y-3 pt-2">
              {sectorStats.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="text-slate-400 font-mono">{item.pct}% de cobertura</span>
                  </div>
                  <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN RAG: INGESTA DE DOCUMENTACIÓN MUNICIPAL POR DEPARTAMENTO */}
        <div className="bg-slate-800/70 border border-blue-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-slate-700/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded text-xs font-semibold mb-2">
                <span>🧠 Base de Conocimiento Inteligente (RAG Comunal)</span>
              </div>
              <h2 className="text-lg font-bold text-white">Cargar Nueva Documentación Municipal para la IA</h2>
              <p className="text-xs text-slate-400">
                Sube decretos, ordenanzas o bases por departamento. La IA los vectoriza para responder de inmediato por WhatsApp a los vecinos.
              </p>
            </div>
          </div>

          {/* Formulario de Carga */}
          <form onSubmit={handleUploadDocument} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-4">
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Departamento Municipal
              </label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option>Dirección de Tránsito</option>
                <option>DIDECO (Desarrollo Comunitario)</option>
                <option>Rentas, Patentes y Finanzas</option>
                <option>Dirección de Obras Municipales (DOM)</option>
                <option>Medio Ambiente, Aseo y Ornato</option>
                <option>Gabinete / Secretaría Municipal</option>
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Nombre o Título del Documento / Decreto
              </label>
              <input
                type="text"
                placeholder="Ej: Decreto 402 - Exención Derechos Aseo Rural 2026"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={isUploading || !docName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-md"
              >
                {isUploading ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Vectorizando...
                  </>
                ) : (
                  <>
                    <span>📤 Subir e Indexar al RAG</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feedback Éxito */}
          {uploadSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <span>✅</span>
              <span><strong>Documento procesado exitosamente:</strong> Se generaron los embeddings vectoriales. El asistente de WhatsApp ya puede responder consultas sobre este texto.</span>
            </div>
          )}

          {/* Lista de Documentos Indexados */}
          <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-700/60 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300">Documentos Activos en el Asistente</span>
              <span className="text-[11px] text-slate-400">{docs.length} archivos en pgvector</span>
            </div>
            <div className="divide-y divide-slate-800">
              {docs.map(doc => (
                <div key={doc.id} className="px-4 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2">
                  <div>
                    <span className="font-semibold text-white">{doc.title}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      <span className="text-blue-400 font-medium">{doc.department}</span> • {doc.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {doc.tokens} tokens
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLA DE TICKETS Y BANDEJA OPERATIVA */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Bandeja de Intervención en Tiempo Real</h2>
              <p className="text-xs text-slate-400">Tickets generados automáticamente desde WhatsApp con auditoría ciudadana</p>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2">
              {(['ALL', 'CALLBACK', 'CAMINO', 'PERMISO'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {f === 'ALL' ? 'Todos' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Folio</th>
                  <th className="p-3">Vecino / Teléfono</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Tipo / Motivo</th>
                  <th className="p-3">SLA / Semáforo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acción Funcionario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-700/30 transition">
                    <td className="p-3 font-mono font-bold text-blue-400">{ticket.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{ticket.citizen}</div>
                      <div className="text-[11px] text-slate-400">{ticket.phone}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-700/80 px-2 py-0.5 rounded text-slate-300 font-medium">
                        {ticket.sector}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate" title={ticket.description}>
                      <span className="font-semibold text-slate-200 block">[{ticket.type}]</span>
                      <span className="text-slate-400">{ticket.description}</span>
                    </td>
                    <td className="p-3">
                      {ticket.status === 'ATENDIDO' ? (
                        <span className="text-emerald-400 font-semibold">Cumplido</span>
                      ) : ticket.slaMinutes > 60 ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                          Alerta ({ticket.slaMinutes}m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
                          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                          En tiempo ({ticket.slaMinutes}m)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ticket.status === 'ATENDIDO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ticket.status === 'EN_RUTA'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {ticket.status !== 'ATENDIDO' ? (
                        <button
                          onClick={() => markAsResolved(ticket.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded text-xs transition shadow-sm"
                        >
                          Marcar Llamado
                        </button>
                      ) : (
                        <span className="text-slate-500 italic">Auditado ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
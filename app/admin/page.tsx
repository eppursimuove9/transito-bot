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

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [filter, setFilter] = useState<'ALL' | 'CALLBACK' | 'CAMINO' | 'PERMISO'>('ALL');

  const markAsResolved = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'ATENDIDO' } : t))
    );
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Barra Superior */}
      <header className="border-b border-slate-800 bg-slate-950/70 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            Rol: Administrador Municipal / DAF
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

        {/* Gráfico Visual en CSS: Rendimiento por Departamento */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Cumplimiento de Atención y Callbacks por Dirección
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Dirección de Tránsito (Permisos & Licencias)</span>
                <span className="font-bold text-emerald-400">97% a tiempo</span>
              </div>
              <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '97%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>DIDECO (Social, Adultos Mayores y Subsidios)</span>
                <span className="font-bold text-emerald-400">91% a tiempo</span>
              </div>
              <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Operaciones & Medio Ambiente (Caminos y Residuos)</span>
                <span className="font-bold text-amber-400">78% a tiempo (En revisión)</span>
              </div>
              <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bandeja Operativa de Tickets y Callbacks */}
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
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded text-xs transition"
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
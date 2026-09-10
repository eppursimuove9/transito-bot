'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, FileText, Bell, AlertTriangle, 
  Clock, CheckCircle, MapPin, Send, Database, Lock
} from 'lucide-react';

interface Ticket {
  id: string;
  citizen: string;
  rut?: string;
  phone: string;
  sector: string;
  type: 'CALLBACK' | 'CAMINO' | 'PERMISO' | 'CHATARRA' | 'DIDECO';
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
  status: 'INDEXADO' | 'EN_CURADURIA';
  date: string;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: '#LUN-2026-1082',
    citizen: 'Gladys Monsalve',
    rut: '15.432.987-4',
    phone: '+56 9 7612 0041',
    sector: 'Mashue',
    type: 'CAMINO',
    description: 'Bache profundo en curva km 4 camino ripio [Foto adjunta validada]',
    slaMinutes: 45,
    status: 'EN_RUTA',
    createdAt: 'Hace 45 min'
  },
  {
    id: '#LUN-2026-1081',
    citizen: 'Héctor Manqui',
    rut: '17.894.562-K',
    phone: '+56 9 8451 2290',
    sector: 'Puerto Nuevo',
    type: 'CALLBACK',
    description: 'Solicita llamado: Consulta de requisitos traslado patente camión',
    slaMinutes: 14,
    status: 'PENDIENTE',
    createdAt: 'Hace 14 min'
  },
  {
    id: '#LUN-2026-1080',
    citizen: 'Carlos Vera',
    rut: '14.220.891-3',
    phone: '+56 9 9341 8812',
    sector: 'La Unión Centro (Arturo Prat)',
    type: 'PERMISO',
    description: 'Enlace Webpay provisto - PPU: ABCD12 (Derivación transaccional)',
    slaMinutes: 0,
    status: 'ATENDIDO',
    createdAt: 'Hace 1 hora'
  },
  {
    id: '#LUN-2026-1079',
    citizen: 'Rosa Cárdenas',
    rut: '11.890.345-2',
    phone: '+56 9 8110 5543',
    sector: 'Trumao',
    type: 'DIDECO',
    description: 'Orientación Subsidio APR entregada - RSH Tramo 40% verificado',
    slaMinutes: 0,
    status: 'ATENDIDO',
    createdAt: 'Hace 2 horas'
  },
  {
    id: '#LUN-2026-1078',
    citizen: 'Juan Pablo Ortiz',
    rut: '18.765.432-1',
    phone: '+56 9 6554 1120',
    sector: 'Choroico',
    type: 'CHATARRA',
    description: 'Solicitud retiro chatarra y 3 baterías en desuso en predio',
    slaMinutes: 95,
    status: 'PENDIENTE',
    createdAt: 'Hace 2 horas 15 min'
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
  const [filter, setFilter] = useState<'ALL' | 'CALLBACK' | 'CAMINO' | 'PERMISO' | 'DIDECO'>('ALL');
  
  const [docs, setDocs] = useState<IngestedDoc[]>(INITIAL_DOCS);
  const [selectedDept, setSelectedDept] = useState('Dirección de Tránsito');
  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Estado para la maqueta interactiva del CRM Ficha Vecinal
  const [searchRut, setSearchRut] = useState('');
  const [citizenFound, setCitizenFound] = useState<any>(null);

  // Estados Upgrade Difusión
  const [broadcastSector, setBroadcastSector] = useState('Sector Puerto Nuevo (APR y Ribera)');
  const [broadcastMessage, setBroadcastMessage] = useState('Corte preventivo de ruta rural por faenas de motoniveladora municipal.');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    const syncTicketsFromStorage = () => {
      const stored = localStorage.getItem('launion_tickets');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTickets(parsed);
          }
        } catch (err) {
          console.error('Error sincronizando tickets:', err);
        }
      } else {
        localStorage.setItem('launion_tickets', JSON.stringify(INITIAL_TICKETS));
      }
    };

    syncTicketsFromStorage();

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'launion_tickets' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setTickets(parsed);
        } catch (err) {
          console.error('Error procesando evento de almacenamiento:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const markAsResolved = (id: string) => {
    setTickets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, status: 'ATENDIDO' as const } : t));
      localStorage.setItem('launion_tickets', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);
    setUploadSuccess(false);

    // Simula envío a la cola de curaduría técnica del consultor
    setTimeout(() => {
      const newDoc: IngestedDoc = {
        id: `DOC-${String(docs.length + 1).padStart(2, '0')}`,
        title: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
        department: selectedDept,
        tokens: Math.floor(Math.random() * 4000) + 2000,
        status: 'INDEXADO',
        date: 'Recién ingresado'
      };

      setDocs([newDoc, ...docs]);
      setDocName('');
      setIsUploading(false);
      setUploadSuccess(true);

      setTimeout(() => setUploadSuccess(false), 5000);
    }, 1200);
  };

  const handleSearchCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRut.trim()) return;
    
    // Simula búsqueda en la base consolidada
    setCitizenFound({
      rut: searchRut,
      nombre: 'Gladys Monsalve',
      sector: 'Sector Mashue (Rural)',
      totalAtenciones: 3,
      historial: [
        { fecha: 'Hoy, 09:20', canal: 'WhatsApp', detalle: 'Reporte fotográfico de socavón vial (#LUN-2026-1082) - Estado: En Ruta' },
        { fecha: '14 Ago 2026', canal: 'Presencial Mesón', detalle: 'Actualización tramo Registro Social de Hogares (DIDECO)' },
        { fecha: '28 Mar 2026', canal: 'WhatsApp', detalle: 'Derivación enlace Webpay Permiso de Circulación PPU: GFHY45' }
      ]
    });
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setBroadcastSuccess(false);

    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 5000);
    }, 1000);
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Barra Superior */}
      <header className="border-b border-slate-800 bg-slate-950/90 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-50 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Ventanilla Única WhatsApp</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Centro de Mando & Gestión Territorial • La Unión
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
            Vista: Alcaldía / Administrador Municipal
          </span>
          <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Núcleo Base Fase 1 Activo
          </span>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Derivaciones Recaudación Hoy</p>
            <p className="text-2xl font-bold text-white mt-1">$4.850.300 <span className="text-xs text-emerald-400 font-normal">CLP</span></p>
            <p className="text-xs text-emerald-400 mt-2">↑ 38 enlaces a Webpay municipal generados</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Cumplimiento de SLA</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">94.8%</p>
            <p className="text-xs text-slate-400 mt-2">Meta institucional &gt; 90%</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Consultas RAG Comunal</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">1.412</p>
            <p className="text-xs text-slate-400 mt-2">Respuestas normativas sin fila física</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Incidencias Territoriales</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">23</p>
            <p className="text-xs text-slate-400 mt-2">Caminos rurales, ramas y luminarias</p>
          </div>
        </div>

        {/* BANDEJA PRINCIPAL DE TICKETS FASE 1 (NÚCLEO BASE) */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase mb-1">
                <span>Núcleo Base • Operación en Terreno</span>
              </div>
              <h2 className="text-base font-bold text-white">Bandeja de Casos Ciudadanos con RUN Auditado</h2>
              <p className="text-xs text-slate-400">Requerimientos recibidos desde WhatsApp con validación sintética Módulo 11 y folio único</p>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'CAMINO', 'CALLBACK', 'DIDECO', 'PERMISO'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
                    filter === f
                      ? 'bg-emerald-600 text-white shadow-sm'
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
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Folio Institucional</th>
                  <th className="p-3">Vecino / RUN Auditado</th>
                  <th className="p-3">Sector Geográfico</th>
                  <th className="p-3">Detalle Requerimiento</th>
                  <th className="p-3">Semáforo SLA</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-700/30 transition">
                    <td className="p-3 font-mono font-bold text-emerald-400">{ticket.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{ticket.citizen}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {ticket.rut || 'RUN no requerido'} • {ticket.phone}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-700/80 px-2 py-0.5 rounded text-slate-200 font-medium">
                        {ticket.sector}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate" title={ticket.description}>
                      <span className="font-semibold text-slate-200 block">[{ticket.type}]</span>
                      <span className="text-slate-400">{ticket.description}</span>
                    </td>
                    <td className="p-3">
                      {ticket.status === 'ATENDIDO' ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Cumplido
                        </span>
                      ) : ticket.slaMinutes > 60 ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                          Alerta ({ticket.slaMinutes}m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                          <Clock className="w-3.5 h-3.5" /> En plazo ({ticket.slaMinutes}m)
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
                          Resolver
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

        {/* SECCIÓN RAG: REPOSITORIO NORMATIVO ASISTIDO */}
        <div className="bg-slate-800/70 border border-blue-500/30 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-slate-700/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded text-xs font-semibold mb-2">
                <FileText className="w-3.5 h-3.5" /> Repositorio Normativo (Motor RAG Comunal)
              </div>
              <h2 className="text-lg font-bold text-white">Carga Documental Municipal para Vectorización Asistida</h2>
              <p className="text-xs text-slate-400">
                Los decretos y ordenanzas ingresados entran a la cola de curaduría técnica del consultor (SLA 48 hrs) para evitar alucinaciones normativas.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono block">
                Supervisión Técnica: Ing. Alex Rojas
              </span>
            </div>
          </div>

          <form onSubmit={handleUploadDocument} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-4">
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Departamento Emisor
              </label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option>Dirección de Tránsito</option>
                <option>DIDECO (Desarrollo Comunitario)</option>
                <option>Rentas y Patentes Comerciales</option>
                <option>Dirección de Operaciones y Medio Ambiente</option>
                <option>Secretaría Municipal / Alcaldía</option>
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Identificador o Título del Documento Oficial
              </label>
              <input
                type="text"
                placeholder="Ej: Decreto 1.482 - Modificación Aseo y Extracción Rural"
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
                    Enviando a Curaduría...
                  </>
                ) : (
                  <span>📥 Ingresar a Cola RAG</span>
                )}
              </button>
            </div>
          </form>

          {uploadSuccess && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg text-xs text-blue-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span><strong>Documento registrado:</strong> Derivado al proceso de fragmentación y vectorización controlada para actualización del bot comunal.</span>
            </div>
          )}

          <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-700/60 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Cuerpo Normativo Activo en Producción</span>
              <span className="text-slate-400">{docs.length} documentos indexados en pgvector</span>
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

        {/* CATÁLOGO DE UPGRADES DE EXPANSIÓN (DISPONIBLES PARA ADENDA) */}
        <div className="border-t border-slate-800 pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                Módulos de Expansión Territorial
              </span>
              <h2 className="text-xl font-black text-white">Upgrades Opcionales Integrables al Ecosistema</h2>
            </div>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full">
              Escalabilidad Modular Planificada
            </span>
          </div>

          {/* UPGRADE 1: CRM CIUDADANO (FICHA VECINAL 360°) */}
          <div className="bg-slate-800/40 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Upgrade: Ficha Única Vecinal 360° (CRM Comunal para Mesón y Terreno)</h3>
              </div>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold">
                Disponible como Upgrade
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Unifica en una sola vista las atenciones presenciales de mesón con las solicitudes remotas de WhatsApp por RUN ciudadano.
            </p>

            {/* Simulador Interactivo de Búsqueda de Vecino */}
            <form onSubmit={handleSearchCitizen} className="flex gap-3 mb-4 max-w-xl">
              <input
                type="text"
                placeholder="Ingresa RUN del vecino (Ej: 15.432.987-4)..."
                value={searchRut}
                onChange={e => setSearchRut(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Consultar Expediente
              </button>
            </form>

            {citizenFound && (
              <div className="bg-slate-900/90 border border-indigo-500/40 rounded-lg p-4 space-y-3 animate-fadeIn text-xs">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{citizenFound.nombre}</h4>
                    <p className="text-slate-400 font-mono">{citizenFound.rut} • {citizenFound.sector}</p>
                  </div>
                  <span className="bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded text-[11px] font-bold">
                    {citizenFound.totalAtenciones} Atenciones Registradas
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-300 text-[11px] uppercase">Historial Unificado Omnicanal:</p>
                  {citizenFound.historial.map((h: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-800/60 p-2 rounded border border-slate-700/50 text-[11px]">
                      <span className="text-indigo-400 font-bold font-mono min-w-[75px]">{h.canal}</span>
                      <span className="text-slate-300 flex-1">{h.detalle}</span>
                      <span className="text-slate-500 font-mono">{h.fecha}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* UPGRADE 2: DIFUSIÓN MASIVA POR WHATSAPP */}
          <div className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Upgrade: Alertas Territoriales Masivas (Meta Broadcast API)</h3>
              </div>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                Disponible como Upgrade
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Difusión oficial segmentada por localidad geográfica rural y urbana para cortes de ruta o alertas climáticas.
            </p>

            <form onSubmit={handleSendBroadcast} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">Sector Destino</label>
                <select
                  value={broadcastSector}
                  onChange={e => setBroadcastSector(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option>Sector Puerto Nuevo (APR y Ribera)</option>
                  <option>Sector Mashue (Caminos Rurales)</option>
                  <option>Sector Choroico (Zona Agrícola)</option>
                  <option>Sector Trumao / Llancacura</option>
                  <option>Radio Urbano Central</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">Mensaje Oficial</label>
                <input
                  type="text"
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={isBroadcasting || !broadcastMessage.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                >
                  {isBroadcasting ? 'Despachando...' : 'Transmitir Alerta'}
                </button>
              </div>
            </form>

            {broadcastSuccess && (
              <div className="mt-3 p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs text-amber-200">
                Alerta de prueba despachada vía Meta Cloud API al sector <strong>{broadcastSector}</strong>.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
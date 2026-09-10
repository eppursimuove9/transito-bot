'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, FileText, Bell, Clock, 
  CheckCircle, Vote, UserPlus, FileSpreadsheet, PlusCircle, Trash2, 
  Smartphone, Camera, Eye, X, MapPin, Calendar, FileCheck
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
  imageUrl?: string;
}

interface IngestedDoc {
  id: string;
  title: string;
  department: string;
  uploadedBy: string;
  tokens: number;
  status: 'INDEXADO' | 'EN_CURADURIA_TECNICA';
  date: string;
}

interface CitizenRecord {
  rut: string;
  nombre: string;
  sector: string;
  telefono: string;
  historial: Array<{
    fecha: string;
    canal: string;
    detalle: string;
    funcionario: string;
  }>;
}

// Folios unificados bajo la norma estricta: #LUN-2026-XXXX
const INITIAL_TICKETS: Ticket[] = [
  {
    id: '#LUN-2026-1082',
    citizen: 'Reporte Anónimo',
    phone: '+56 9 •••• 0041',
    sector: 'Sector Mashue (km 4)',
    type: 'CAMINO',
    description: 'Bache profundo en curva km 4 de ripio frente a puente de madera. Riesgo de rotura de neumáticos.',
    slaMinutes: 45,
    status: 'EN_RUTA',
    createdAt: '10/09/2026 09:20',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '#LUN-2026-1081',
    citizen: 'Héctor Manqui',
    rut: '17.894.562-K',
    phone: '+56 9 8451 2290',
    sector: 'Puerto Nuevo',
    type: 'CHATARRA',
    description: 'Solicitud retiro en predio particular: 3 baterías viejas de tractor y fierros acumulados en patio trasero.',
    slaMinutes: 14,
    status: 'PENDIENTE',
    createdAt: '10/09/2026 10:15',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '#LUN-2026-1080',
    citizen: 'Carlos Vera',
    rut: '14.220.891-3',
    phone: '+56 9 9341 8812',
    sector: 'La Unión Centro (Arturo Prat)',
    type: 'PERMISO',
    description: 'Orientación de Permiso de Circulación provista: Se entregaron requisitos de renovación y enlace oficial a pasarela municipal Webpay.',
    slaMinutes: 0,
    status: 'ATENDIDO',
    createdAt: '10/09/2026 11:30'
  },
  {
    id: '#LUN-2026-1079',
    citizen: 'Rosa Cárdenas',
    rut: '11.890.345-2',
    phone: '+56 9 8110 5543',
    sector: 'Trumao',
    type: 'DIDECO',
    description: 'Orientación Subsidio APR entregada: Información de requisitos para presentar cartola RSH al 40% y colilla del comité de agua.',
    slaMinutes: 0,
    status: 'ATENDIDO',
    createdAt: '10/09/2026 12:10'
  },
  {
    id: '#LUN-2026-1078',
    citizen: 'Reporte Anónimo',
    phone: '+56 9 •••• 1120',
    sector: 'Choroico',
    type: 'CAMINO',
    description: 'Rama grande de eucalipto caída sobre camino vecinal obstaculizando el paso del furgón escolar.',
    slaMinutes: 95,
    status: 'PENDIENTE',
    createdAt: '10/09/2026 12:45',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80'
  }
];

const INITIAL_DOCS: IngestedDoc[] = [
  {
    id: 'DOC-01',
    title: 'Decreto Alcaldicio N° 1.420 - Calendario Patentes 2026.pdf',
    department: 'Rentas y Finanzas',
    uploadedBy: 'Patricio Miranda (Jefe Rentas)',
    tokens: 3420,
    status: 'INDEXADO',
    date: '10/09/2026 09:15'
  },
  {
    id: 'DOC-02',
    title: 'Bases Postulación Subsidio Rural Agua Potable (APR).pdf',
    department: 'DIDECO (Social)',
    uploadedBy: 'Marcela Henríquez (DIDECO)',
    tokens: 8150,
    status: 'INDEXADO',
    date: '09/09/2026 16:40'
  },
  {
    id: 'DOC-03',
    title: 'Ordenanza Local de Cuidado de Caminos y Tránsito Pesado.pdf',
    department: 'Dirección de Tránsito',
    uploadedBy: 'Gonzalo Vera (Dir. Tránsito)',
    tokens: 5200,
    status: 'INDEXADO',
    date: '04/09/2026 11:20'
  }
];

const INITIAL_CITIZENS: Record<string, CitizenRecord> = {
  '15.432.987-4': {
    rut: '15.432.987-4',
    nombre: 'Gladys Monsalve',
    sector: 'Sector Mashue (Rural)',
    telefono: '+56 9 7612 0041',
    historial: [
      { fecha: '10/09/2026 09:20', canal: 'WhatsApp', detalle: 'Reporte fotográfico bache vial (#LUN-2026-1082)', funcionario: 'Bot Municipal' },
      { fecha: '14/08/2026 11:15', canal: 'Mesón DIDECO', detalle: 'Actualización tramo Registro Social de Hogares', funcionario: 'M. Soto (Social)' },
      { fecha: '28/03/2026 15:40', canal: 'WhatsApp', detalle: 'Consulta de requisitos y fechas de Permiso de Circulación', funcionario: 'Bot Municipal' }
    ]
  }
};

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [filter, setFilter] = useState<'ALL' | 'CALLBACK' | 'CAMINO' | 'CHATARRA' | 'PERMISO' | 'DIDECO'>('ALL');
  
  // Modal de Detalle Completo de Ficha / Foto
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Documentos en Cola RAG
  const [docs, setDocs] = useState<IngestedDoc[]>(INITIAL_DOCS);
  const [selectedDept, setSelectedDept] = useState('Dirección de Tránsito');
  const [docName, setDocName] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Upgrade: CRM Ficha Vecinal
  const [citizensDb, setCitizensDb] = useState<Record<string, CitizenRecord>>(INITIAL_CITIZENS);
  const [searchQuery, setSearchQuery] = useState('');
  const [citizenFound, setCitizenFound] = useState<CitizenRecord | null>(null);
  const [searchError, setSearchError] = useState(false);

  // Formulario nueva atención presencial
  const [newRut, setNewRut] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newSector, setNewSector] = useState('Puerto Nuevo');
  const [newDept, setNewDept] = useState('DIDECO (Social)');
  const [newDetalle, setNewDetalle] = useState('');
  const [recordSaved, setRecordSaved] = useState(false);

  // Upgrade: Difusión Masiva y Consultas Ciudadanas
  const [broadcastMode, setBroadcastMode] = useState<'ALERTA' | 'ENCUESTA'>('ALERTA');
  const [broadcastSector, setBroadcastSector] = useState('Sector Puerto Nuevo (APR y Ribera)');
  
  const [broadcastMessage, setBroadcastMessage] = useState(
    'AVISO OFICIAL: Se informa a la comunidad del sector Puerto Nuevo que hoy entre 14:00 y 18:00 hrs se ejecutarán faenas de mantención en el sistema de Agua Potable Rural (APR). Se recomienda acopio preventivo de agua.'
  );

  const [surveyType, setSurveyType] = useState<'SI_NO' | 'MULTIPLE' | 'ESCALA' | 'ABIERTA'>('MULTIPLE');
  const [surveyQuestion, setSurveyQuestion] = useState('¿Qué obra prioriza para el presupuesto participativo del sector?');
  const [surveyOptions, setSurveyOptions] = useState<string[]>([
    'Ripio y bacheo de ruta principal',
    'Ampliación de luminarias solares',
    'Contenedores para reciclaje y chatarra'
  ]);
  const [newOptionText, setNewOptionText] = useState('');

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    const syncTicketsFromStorage = () => {
      const stored = localStorage.getItem('launion_tickets');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Normaliza cualquier folio antiguo para que sea #LUN-2026-XXXX
            const normalizados = parsed.map((t: any) => ({
              ...t,
              id: t.id.startsWith('#LUN-2026-') ? t.id : `#LUN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              imageUrl: t.imageUrl || (t.type === 'CAMINO' ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80' : undefined)
            }));
            setTickets(normalizados);
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
          console.error('Error procesando evento:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Cambiar estado en vivo
  const handleStatusChange = (id: string, newStatus: 'PENDIENTE' | 'ATENDIDO' | 'EN_RUTA') => {
    setTickets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, status: newStatus } : t));
      localStorage.setItem('launion_tickets', JSON.stringify(updated));
      return updated;
    });
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !uploaderName.trim()) return;

    setIsUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      const now = new Date();
      const newDoc: IngestedDoc = {
        id: `DOC-${String(docs.length + 1).padStart(2, '0')}`,
        title: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
        department: selectedDept,
        uploadedBy: uploaderName.trim(),
        tokens: Math.floor(Math.random() * 4000) + 2000,
        status: 'EN_CURADURIA_TECNICA',
        date: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };

      setDocs([newDoc, ...docs]);
      setDocName('');
      setUploaderName('');
      setIsUploading(false);
      setUploadSuccess(true);

      setTimeout(() => setUploadSuccess(false), 6000);
    }, 1200);
  };

  const handleSearchCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = Object.values(citizensDb).find(
      c => c.rut.toLowerCase().includes(query) || c.telefono.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''))
    );

    if (found) {
      setCitizenFound(found);
      setSearchError(false);
    } else {
      setCitizenFound(null);
      setSearchError(true);
    }
  };

  const handleAddCitizenRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRut.trim() || !newNombre.trim() || !newDetalle.trim()) return;

    const rutKey = newRut.trim();
    const existing = citizensDb[rutKey];
    const now = new Date();

    const newAttention = {
      fecha: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      canal: `Mesón ${newDept}`,
      detalle: newDetalle,
      funcionario: 'Atención Consistorial'
    };

    const updatedRecord: CitizenRecord = existing
      ? {
          ...existing,
          telefono: newTelefono.trim() || existing.telefono,
          sector: newSector,
          historial: [newAttention, ...existing.historial]
        }
      : {
          rut: rutKey,
          nombre: newNombre,
          sector: newSector,
          telefono: newTelefono.trim() || '+56 9 ' + Math.floor(70000000 + Math.random() * 29000000),
          historial: [newAttention]
        };

    setCitizensDb(prev => ({ ...prev, [rutKey]: updatedRecord }));
    setCitizenFound(updatedRecord);
    setSearchQuery(rutKey);
    setRecordSaved(true);
    setNewDetalle('');

    setTimeout(() => setRecordSaved(false), 4000);
  };

  const handleAddOption = () => {
    if (newOptionText.trim() && surveyOptions.length < 5) {
      setSurveyOptions([...surveyOptions, newOptionText.trim()]);
      setNewOptionText('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setSurveyOptions(surveyOptions.filter((_, i) => i !== index));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setBroadcastSuccess(false);

    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 6000);
    }, 1200);
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-40 backdrop-blur">
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
            <ShieldCheck className="w-3.5 h-3.5" /> Núcleo Base Activo
          </span>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* KPI Cards Reales y Honestos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Derivaciones a Webpay Hoy</p>
            <p className="text-2xl font-bold text-white mt-1">42 <span className="text-xs text-emerald-400 font-normal">vecinos</span></p>
            <p className="text-xs text-emerald-400 mt-2">↑ Enlaces oficiales provistos sin filas</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Cumplimiento SLA Cuadrillas</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">94.8%</p>
            <p className="text-xs text-slate-400 mt-2">Meta institucional &gt; 90%</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Consultas RAG Comunal</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">1.412</p>
            <p className="text-xs text-slate-400 mt-2">Respuestas normativas 24/7</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Reportes con Foto</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">23</p>
            <p className="text-xs text-slate-400 mt-2">Evidencias validadas en terreno</p>
          </div>
        </div>

        {/* BANDEJA DE TICKETS CON FECHA, MODAL Y SELECTOR DE ESTADO */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase mb-1">
                <span>Núcleo Base • Trazabilidad Territorial</span>
              </div>
              <h2 className="text-base font-bold text-white">Bandeja de Requerimientos Ciudadanos (WhatsApp)</h2>
              <p className="text-xs text-slate-400">Haz clic en cualquier fila para inspeccionar el detalle completo y la fotografía de la cuadrilla</p>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'CAMINO', 'CALLBACK', 'CHATARRA', 'DIDECO', 'PERMISO'] as const).map(f => (
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
                  <th className="p-3">Folio Oficial</th>
                  <th className="p-3">Fecha / Hora</th>
                  <th className="p-3">Modalidad / Vecino</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Detalle Requerimiento</th>
                  <th className="p-3 text-center">Foto</th>
                  <th className="p-3">SLA</th>
                  <th className="p-3">Estado Operativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredTickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-700/40 transition cursor-pointer group"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="p-3 font-mono font-bold text-emerald-400 group-hover:underline">
                      {ticket.id}
                    </td>
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{ticket.createdAt}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {ticket.citizen.includes('Anónimo') ? (
                        <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-700">
                          🛡️ 100% Anónimo
                        </span>
                      ) : (
                        <div>
                          <div className="font-semibold text-white">{ticket.citizen}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {ticket.rut ? `${ticket.rut} • ` : ''}{ticket.phone}
                          </div>
                        </div>
                      )}
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
                    
                    {/* Botón Foto */}
                    <td className="p-3 text-center" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                      {ticket.imageUrl ? (
                        <button
                          className="inline-flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 px-2 py-1 rounded text-[11px] font-bold transition"
                        >
                          <Camera className="w-3.5 h-3.5 text-blue-400" />
                          <span>Ver</span>
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 px-2 py-1 rounded text-[11px] hover:text-white transition"
                        >
                          <FileCheck className="w-3 h-3" /> Ficha
                        </button>
                      )}
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

                    {/* Selector de Estado en Vivo */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition ${
                          ticket.status === 'ATENDIDO'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : ticket.status === 'EN_RUTA'
                            ? 'bg-blue-950 text-blue-300 border-blue-700'
                            : 'bg-rose-950 text-rose-300 border-rose-700'
                        }`}
                      >
                        <option value="PENDIENTE" className="bg-slate-900 text-rose-300">⏳ PENDIENTE</option>
                        <option value="EN_RUTA" className="bg-slate-900 text-blue-300">🚛 EN RUTA</option>
                        <option value="ATENDIDO" className="bg-slate-900 text-emerald-300">✅ ATENDIDO</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL COMPLETO DE EXPEDIENTE / FOTO EN TAMAÑO COMPLETO */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-fadeIn">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    {selectedTicket.id}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Tipo: {selectedTicket.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Imagen si existe */}
                {selectedTicket.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-black max-h-[320px] flex items-center justify-center">
                    <img
                      src={selectedTicket.imageUrl}
                      alt="Evidencia fotográfica del requerimiento"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Metadatos */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Fecha y Hora de Ingreso:</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedTicket.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Sector Comunal:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedTicket.sector}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Vecino / Contacto:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedTicket.citizen} ({selectedTicket.phone})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Estado Operativo:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded px-2 py-1 outline-none"
                    >
                      <option value="PENDIENTE">⏳ PENDIENTE</option>
                      <option value="EN_RUTA">🚛 EN RUTA / CUADRILLA</option>
                      <option value="ATENDIDO">✅ ATENDIDO / RESUELTO</option>
                    </select>
                  </div>
                </div>

                {/* Descripción Completa sin cortes */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">
                    Descripción Completa del Requerimiento:
                  </span>
                  <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Canal de origen: WhatsApp Oficial verificado
                </span>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COLA DE CURADURÍA DOCUMENTAL ASISTIDA (MOTOR RAG) */}
        <div className="bg-slate-800/70 border border-blue-500/30 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-slate-700/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded text-xs font-semibold mb-2">
                <FileText className="w-3.5 h-3.5" /> Repositorio Normativo (Curaduría Técnica Asistida)
              </div>
              <h2 className="text-lg font-bold text-white">Remisión Documental Auditada para el RAG</h2>
              <p className="text-xs text-slate-400">
                Cada decreto u ordenanza remitido registra al funcionario responsable para coordinar la limpieza, fragmentación y vectorización con el consultor técnico.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] bg-slate-900 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-800/60 font-mono block">
                Ingeniería y Soporte: Alex Rojas
              </span>
            </div>
          </div>

          <form onSubmit={handleUploadDocument} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-3">
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

            <div className="md:col-span-3">
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Funcionario Responsable
              </label>
              <input
                type="text"
                placeholder="Ej: Marcela Henríquez (DIDECO)"
                value={uploaderName}
                onChange={e => setUploaderName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Título del Decreto u Ordenanza
              </label>
              <input
                type="text"
                placeholder="Ej: Decreto 512 - Exención Aseo Adulto Mayor 2026"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isUploading || !docName.trim() || !uploaderName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-md"
              >
                {isUploading ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Remitiendo...
                  </>
                ) : (
                  <span>📥 Remitir al RAG</span>
                )}
              </button>
            </div>
          </form>

          {uploadSuccess && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg text-xs text-blue-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span><strong>Documento registrado:</strong> El consultor técnico iniciará la depuración semántica, vectorización y testeo sintético antes de activarlo en el WhatsApp comunal.</span>
            </div>
          )}

          <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-700/60 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Documentación Indexada en pgvector</span>
              <span className="text-slate-400">{docs.length} archivos en producción</span>
            </div>
            <div className="divide-y divide-slate-800">
              {docs.map(doc => (
                <div key={doc.id} className="px-4 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2">
                  <div>
                    <span className="font-semibold text-white">{doc.title}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      <span className="text-blue-400 font-medium">{doc.department}</span> • Remitido por: <strong className="text-slate-300">{doc.uploadedBy}</strong> • {doc.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {doc.tokens} tokens
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      doc.status === 'INDEXADO' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CATÁLOGO DE UPGRADES DISPONIBLES */}
        <div className="border-t border-slate-800 pt-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                Módulos de Expansión Estratégica
              </span>
              <h2 className="text-xl font-black text-white">Upgrades Opcionales Integrables a la Plataforma</h2>
            </div>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full">
              Escalabilidad Modular
            </span>
          </div>

          {/* UPGRADE 1: CRM COMUNAL FICHA VECINAL 360° */}
          <div className="bg-slate-800/40 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Upgrade: Ficha Única Vecinal 360° (CRM Omnicanal Mesón + WhatsApp)</h3>
              </div>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold">
                Disponible como Upgrade
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Permite a los funcionarios de mesón consultar el historial ciudadano por RUN o Teléfono y registrar nuevas visitas presenciales, unificando la trazabilidad del edificio consistorial con las solicitudes de WhatsApp.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Formulario Nueva Atención */}
              <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/80 rounded-xl p-5">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase mb-4 border-b border-slate-800 pb-2">
                  <UserPlus className="w-4 h-4" /> Registrar Nueva Atención en Mesón
                </div>
                <form onSubmit={handleAddCitizenRecord} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">RUN del Vecino</label>
                      <input
                        type="text"
                        placeholder="Ej: 15.432.987-4"
                        value={newRut}
                        onChange={e => setNewRut(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej: Gladys Monsalve"
                        value={newNombre}
                        onChange={e => setNewNombre(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Teléfono de Contacto</label>
                      <input
                        type="text"
                        placeholder="Ej: +56 9 7612 0041"
                        value={newTelefono}
                        onChange={e => setNewTelefono(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Sector Comunal</label>
                      <select
                        value={newSector}
                        onChange={e => setNewSector(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option>Puerto Nuevo</option>
                        <option>Mashue</option>
                        <option>Choroico</option>
                        <option>Trumao / Llancacura</option>
                        <option>La Unión Centro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Departamento de Atención</label>
                    <select
                      value={newDept}
                      onChange={e => setNewDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option>DIDECO (Social)</option>
                      <option>Dirección de Tránsito</option>
                      <option>Rentas y Patentes</option>
                      <option>Dirección de Obras (DOM)</option>
                      <option>Secretaría Municipal / Alcaldía</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Detalle del Trámite o Consulta Presencial</label>
                    <textarea
                      rows={3}
                      placeholder="Ej: Viene a presentar antecedentes para subsidio de agua rural (APR). Se revisa cartola RSH al 40%."
                      value={newDetalle}
                      onChange={e => setNewDetalle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Guardar en Expediente Único
                  </button>

                  {recordSaved && (
                    <p className="text-emerald-400 text-xs flex items-center gap-1 pt-1">
                      <CheckCircle className="w-4 h-4" /> Atención guardada en la base comunal consolidada.
                    </p>
                  )}
                </form>
              </div>

              {/* Buscador de Expedientes */}
              <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase mb-4 border-b border-slate-800 pb-2">
                    <Search className="w-4 h-4" /> Consultar Historial (Por RUN o Teléfono)
                  </div>
                  
                  <form onSubmit={handleSearchCitizen} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Ingresa RUN o Teléfono (Ej: 15.432.987-4 o 76120041)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded text-xs transition flex items-center gap-1.5 shadow"
                    >
                      <Search className="w-3.5 h-3.5" /> Buscar
                    </button>
                  </form>

                  {searchError && (
                    <p className="text-amber-400 text-xs mb-3">
                      No se encontró expediente con ese dato. Puedes registrarlo con el formulario lateral.
                    </p>
                  )}

                  {citizenFound ? (
                    <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                        <div>
                          <h4 className="font-bold text-white text-sm">{citizenFound.nombre}</h4>
                          <p className="text-slate-400 font-mono text-xs mt-0.5">
                            RUN: {citizenFound.rut} • Tel: {citizenFound.telefono}
                          </p>
                          <p className="text-slate-300 text-[11px] mt-0.5">{citizenFound.sector}</p>
                        </div>
                        <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded text-[11px] font-bold">
                          {citizenFound.historial.length} atenciones registradas
                        </span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {citizenFound.historial.map((h, i) => (
                          <div key={i} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs">
                            <div className="flex justify-between text-indigo-300 font-medium mb-1">
                              <span className="font-bold">{h.canal}</span>
                              <span className="text-slate-500 font-mono text-[11px]">{h.fecha}</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{h.detalle}</p>
                            <p className="text-[10px] text-slate-500 mt-1">Registrado por: {h.funcionario}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs space-y-2">
                      <p>Ingresa el RUN o teléfono de un vecino para desplegar su expediente unificado.</p>
                      <p className="text-slate-600 text-[11px]">Prueba buscando: <span className="font-mono text-slate-400">15.432.987-4</span></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* UPGRADE 2: DIFUSIÓN MASIVA Y CONSTRUCTOR DE CONSULTAS CIUDADANAS */}
          <div className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Upgrade: Alertas Territoriales y Constructor de Encuestas Comunitarias</h3>
              </div>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                Disponible como Upgrade
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Plataforma oficial para despachar comunicados de emergencia georreferenciados o generar consultas ciudadanas interactivas (opción múltiple, escala de satisfacción, sí/no o preguntas abiertas) directo a WhatsApp.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Configuración del Envío */}
              <div className="lg:col-span-8 bg-slate-900/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBroadcastMode('ALERTA')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      broadcastMode === 'ALERTA'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <Bell className="w-4 h-4" /> 1. Comunicado / Alerta de Emergencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastMode('ENCUESTA')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      broadcastMode === 'ENCUESTA'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <Vote className="w-4 h-4" /> 2. Consulta Ciudadana Interactiva
                  </button>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                    Sector Geográfico Destino
                  </label>
                  <select
                    value={broadcastSector}
                    onChange={e => setBroadcastSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option>Sector Puerto Nuevo (APR y Ribera)</option>
                    <option>Sector Mashue (Caminos Rurales)</option>
                    <option>Sector Choroico (Zona Agrícola)</option>
                    <option>Sector Trumao / Llancacura (Río Bueno)</option>
                    <option>Radio Urbano Completo (La Unión Centro)</option>
                    <option>Toda la Comuna (Cadena Municipal General)</option>
                  </select>
                </div>

                {broadcastMode === 'ALERTA' ? (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs uppercase font-bold text-slate-300">
                        Contenido del Comunicado Oficial
                      </label>
                      <span className="text-[11px] text-slate-500">{broadcastMessage.length} caracteres</span>
                    </div>
                    <textarea
                      rows={6}
                      value={broadcastMessage}
                      onChange={e => setBroadcastMessage(e.target.value)}
                      placeholder="Redacta el comunicado oficial, corte de ruta, alerta climática o aviso de utilidad pública..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                    ></textarea>
                  </div>
                ) : (
                  <div className="space-y-4 border-t border-slate-800 pt-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-300 mb-2">
                        Tipo de Consulta Ciudadana
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'MULTIPLE', label: 'Opción Múltiple' },
                          { id: 'SI_NO', label: 'Sí / No' },
                          { id: 'ESCALA', label: 'Satisfacción (1-5)' },
                          { id: 'ABIERTA', label: 'Pregunta Abierta' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSurveyType(t.id as any)}
                            className={`py-2 px-2 rounded text-[11px] font-bold border transition ${
                              surveyType === t.id
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                        Pregunta o Enunciado de la Encuesta
                      </label>
                      <textarea
                        rows={3}
                        value={surveyQuestion}
                        onChange={e => setSurveyQuestion(e.target.value)}
                        placeholder="Escribe la pregunta que recibirán los vecinos..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                      ></textarea>
                    </div>

                    {surveyType === 'MULTIPLE' && (
                      <div className="space-y-2">
                        <label className="block text-xs uppercase font-bold text-slate-300">
                          Opciones de Respuesta (Máximo 5)
                        </label>
                        <div className="space-y-1.5">
                          {surveyOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                              <span className="font-mono text-amber-400 font-bold w-5">{idx + 1}.</span>
                              <span className="text-slate-200 flex-1">{opt}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(idx)}
                                className="text-slate-500 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {surveyOptions.length < 5 && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Agregar nueva alternativa..."
                              value={newOptionText}
                              onChange={e => setNewOptionText(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={handleAddOption}
                              className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Añadir
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  disabled={isBroadcasting}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-slate-950 font-black py-3 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {isBroadcasting ? (
                    'Transmitiendo por Meta Cloud API...'
                  ) : broadcastMode === 'ALERTA' ? (
                    '📢 Despachar Comunicado Oficial por WhatsApp'
                  ) : (
                    '🗳️ Lanzar Encuesta Ciudadana por WhatsApp'
                  )}
                </button>

                {broadcastSuccess && (
                  <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs text-amber-200 flex items-center gap-2 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span>
                      <strong>Despacho completado:</strong> El mensaje ha sido transmitido con éxito al sector <strong>{broadcastSector}</strong> mediante la línea oficial de WhatsApp.
                    </span>
                  </div>
                )}
              </div>

              {/* Vista Previa WhatsApp */}
              <div className="lg:col-span-4 flex flex-col justify-start space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                  <Smartphone className="w-4 h-4 text-amber-400" /> Vista Previa en Celular del Vecino
                </div>

                <div className="bg-[#0b141a] border-4 border-slate-800 rounded-3xl p-3.5 shadow-2xl flex flex-col space-y-2">
                  <div className="bg-[#075E54] text-white p-2 rounded-t-xl text-[11px] font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Muni La Unión • Canal Oficial</span>
                  </div>

                  <div className="bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-none text-xs space-y-2 border border-slate-700/40">
                    <p className="text-[10px] uppercase font-bold text-emerald-300">
                      {broadcastMode === 'ALERTA' ? '📢 COMUNICADO OFICIAL' : '🗳️ CONSULTA CIUDADANA'}
                    </p>

                    <p className="whitespace-pre-wrap leading-relaxed">
                      {broadcastMode === 'ALERTA' ? broadcastMessage : surveyQuestion}
                    </p>

                    {broadcastMode === 'ENCUESTA' && (
                      <div className="pt-2 border-t border-slate-700 space-y-1.5">
                        {surveyType === 'MULTIPLE' && (
                          surveyOptions.map((opt, i) => (
                            <div key={i} className="bg-[#0b141a] text-emerald-300 p-2 rounded-lg text-[11px] text-center font-bold border border-emerald-900/50">
                              {opt}
                            </div>
                          ))
                        )}
                        {surveyType === 'SI_NO' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#0b141a] text-emerald-300 p-2 rounded-lg text-center font-bold border border-emerald-900/50">
                              👍 Sí, de acuerdo
                            </div>
                            <div className="bg-[#0b141a] text-rose-300 p-2 rounded-lg text-center font-bold border border-rose-900/50">
                              👎 No, en desacuerdo
                            </div>
                          </div>
                        )}
                        {surveyType === 'ESCALA' && (
                          <div className="flex justify-between bg-[#0b141a] p-2 rounded-lg text-xs">
                            <span>⭐ 1</span>
                            <span>⭐ 2</span>
                            <span>⭐ 3</span>
                            <span>⭐ 4</span>
                            <span>⭐ 5</span>
                          </div>
                        )}
                        {surveyType === 'ABIERTA' && (
                          <p className="text-[10px] text-slate-400 italic">
                            _El vecino responderá escribiendo su opinión en el chat._
                          </p>
                        )}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block text-right">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
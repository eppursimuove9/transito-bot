'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Car, Camera, RefreshCw, Home, Sparkles, Store, Copy, Check, HeartHandshake
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

interface AdminTicket {
  id: string;
  citizen: string;
  rut: string;
  phone: string;
  sector: string;
  type: 'CALLBACK' | 'CAMINO' | 'PERMISO' | 'CHATARRA' | 'DIDECO';
  description: string;
  slaMinutes: number;
  status: 'PENDIENTE' | 'ATENDIDO' | 'EN_RUTA';
  createdAt: string;
}

const MENSAJE_INICIAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de La Unión* 🇨🇱

Canal municipal directo y abierto para toda la comuna. Selecciona el área de tu trámite:

1️⃣ 🚗 *Tránsito y Vehículos* (Requisitos Permiso, Licencias, Multas JPL y Pasarela Web)
2️⃣ 🏪 *Rentas y Comercio* (Patentes Comerciales, Ferias Libres, Plazos y Enlaces)
3️⃣ 🚜 *Reporte de Incidencias Comunitarias* (Hoyos, Caminos Rurales, Luminarias, Ramas y Chatarra)
4️⃣ 🤝 *DIDECO y Acción Social* (Subsidio Agua Potable Rural APR, Registro Social de Hogares)
5️⃣ ℹ️ *Guía Comunal e Información RAG* (Ordenanzas, Farmacias de Turno, Eventos)
6️⃣ 👵 *Modo Asistido / Adulto Mayor* (Texto claro y sencillo)
0️⃣ 👤 *Solicitar contacto telefónico de un funcionario*

_Escribe el número de tu opción (1-6 o 0). Para emergencias escribe *SOS*._`;

export default function LaUnionDemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: MENSAJE_INICIAL,
      timestamp: '10:00'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('INIT');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setInputValue(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const syncTicketToAdminDashboard = (ticketData: Partial<AdminTicket>) => {
    try {
      const stored = localStorage.getItem('launion_tickets');
      const currentTickets: AdminTicket[] = stored ? JSON.parse(stored) : [];

      const newTicket: AdminTicket = {
        id: ticketData.id || `#LUN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        citizen: ticketData.citizen || 'Vecino WhatsApp',
        rut: ticketData.rut || 'No requerido',
        phone: ticketData.phone || '+56 9 ' + Math.floor(74000000 + Math.random() * 25000000),
        sector: ticketData.sector || 'Radio Urbano',
        type: ticketData.type || 'CAMINO',
        description: ticketData.description || 'Requerimiento ingresado vía WhatsApp',
        slaMinutes: ticketData.slaMinutes || 120,
        status: 'PENDIENTE',
        createdAt: 'Hace unos momentos'
      };

      const updated = [newTicket, ...currentTickets];
      localStorage.setItem('launion_tickets', JSON.stringify(updated));
    } catch (err) {
      console.error('Error al sincronizar ticket con el panel directivo:', err);
    }
  };

  const handleSendMessage = async (customText?: string, customImage?: string) => {
    const textToSend = customText !== undefined ? customText : inputValue;
    if (!textToSend.trim() && !customImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend || (customImage ? "📸 [Fotografía de evidencia adjunta]" : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: customImage
    };

    setMessages(prev => [...prev, userMsg]);
    if (customText === undefined) setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          step: currentStep,
          hasImage: !!customImage
        })
      });

      const data = await res.json();
      setCurrentStep(data.next_step);

      if (data.ticketSync) {
        syncTicketToAdminDashboard(data.ticketSync);
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const restartDemo = () => {
    setCurrentStep('INIT');
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: MENSAJE_INICIAL,
        timestamp: '10:00'
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <header className="max-w-5xl w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-300 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Plataforma de Modernización Territorial • I. Municipalidad de La Unión
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Ventanilla Única WhatsApp La Unión
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Arquitectura no invasiva: Asistente RAG comunal, reportes viales confidenciales y trazabilidad en tiempo real.
        </p>
      </header>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Panel Izquierdo: Casos de Prueba */}
        <aside className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 max-h-[660px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>📋 Casos de Prueba Rápida</span>
              </h2>
              <p className="text-[11px] text-slate-400">Haz clic en cualquier opción para copiar al chat:</p>
            </div>
            <button
              onClick={restartDemo}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition bg-slate-800 px-2 py-1 rounded"
              title="Reiniciar conversación"
            >
              <RefreshCw className="w-3 h-3" /> Limpiar
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Tránsito Asistencial */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> 1. Tránsito & Vehículos (Opción 1)
              </div>
              <div className="space-y-1.5">
                <div 
                  onClick={() => copyToClipboard("1")}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition flex justify-between items-center group"
                >
                  <div>
                    <div className="font-bold text-white">Opción 1: Menú Tránsito</div>
                    <p className="text-[11px] text-slate-400">Requisitos Permisos, Licencias y JPL</p>
                  </div>
                  <span className="text-slate-500 group-hover:text-emerald-400 text-xs">
                    {copiedCode === "1" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Rentas Asistencial */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="text-indigo-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" /> 2. Rentas & Comercio (Opción 2)
              </div>
              <div 
                onClick={() => copyToClipboard("2")}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-white">Opción 2: Menú Rentas</div>
                  <p className="text-[11px] text-slate-400">Patentes Comerciales, Ferias y Aseo</p>
                </div>
                <span className="text-slate-500 group-hover:text-indigo-400 text-xs">
                  {copiedCode === "2" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
              </div>
            </div>

            {/* 3. Incidencias Comunitarias (Anónimo + Chatarra) */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="text-orange-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> 3. Reporte de Incidencias (Opción 3)
              </div>
              
              <div 
                onClick={() => copyToClipboard("Hay un hoyo peligroso en el camino a Trumao en el km 10, adjunto foto")}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-orange-500/50 cursor-pointer transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Reporte de Hoyo / Camino</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1 rounded">100% Anónimo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Camino a Trumao km 10 (Sin pedir RUN)</p>
                </div>
                <span className="text-slate-500 group-hover:text-orange-400 text-xs">
                  {copiedCode === "Hay un hoyo peligroso en el camino a Trumao en el km 10, adjunto foto" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
              </div>

              <div 
                onClick={() => copyToClipboard("Héctor Manqui, Parcela 14 Puerto Nuevo, 2 baterías de tractor y fierros")}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-orange-500/50 cursor-pointer transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Chatarra en Domicilio</span>
                    <span className="text-[10px] bg-blue-950 text-blue-300 px-1 rounded">Nombre + Dirección</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Coordinación directa de retiro en predio</p>
                </div>
                <span className="text-slate-500 group-hover:text-orange-400 text-xs">
                  {copiedCode === "Héctor Manqui, Parcela 14 Puerto Nuevo, 2 baterías de tractor y fierros" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
              </div>
            </div>

            {/* 4. DIDECO */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-1 text-[11px] text-slate-300">
              <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
                <HeartHandshake className="w-3.5 h-3.5" /> 4. DIDECO & Subsidio APR (Opción 4)
              </div>
              <p>• Explica los requisitos del subsidio de agua rural y los documentos necesarios para evitar que el vecino viaje en vano.</p>
            </div>

            {/* Comandos Rápidos */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-1 text-[11px] text-slate-300">
              <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Comandos Rápidos
              </div>
              <p>• Escribe <strong className="text-rose-300 font-mono">SOS</strong> para emergencias inmediatas.</p>
              <p>• Escribe <strong className="text-amber-300 font-mono">6</strong> para activar el Modo Adulto Mayor.</p>
              <p>• Escribe <strong className="text-purple-300 font-mono">0</strong> para pedir que te llame un funcionario.</p>
            </div>
          </div>
        </aside>

        {/* Panel Derecho: WhatsApp */}
        <main className="md:col-span-7 bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[660px]">
          <div className="bg-[#075E54] text-white p-3.5 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm border border-white/20">
              🇨🇱
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">Muni La Unión • Canal Vecinal Oficial</h3>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span> Verificado Meta Business
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs md:text-sm whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#005c4b] text-white rounded-tr-none'
                      : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/40'
                  }`}
                >
                  {m.imageUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-emerald-700/50">
                      <img src={m.imageUrl} alt="Evidencia" className="w-full h-36 object-cover" />
                    </div>
                  )}

                  {m.text}

                  <div className="text-[10px] text-slate-400 text-right mt-1">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#202c33] text-slate-400 rounded-2xl rounded-tl-none px-4 py-2 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-[#202c33] flex items-center gap-2 border-t border-slate-800"
          >
            <button
              type="button"
              onClick={() => handleSendMessage(
                "📸 Hay un hoyo peligroso en el camino a Trumao en el km 10, adjunto foto",
                "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
              )}
              title="Adjuntar fotografía de terreno"
              className="w-9 h-9 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full flex items-center justify-center transition shrink-0"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un número (1-6), SOS o tu consulta comunal..."
              className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 text-xs md:text-sm px-3.5 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[#00a884]"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="w-9 h-9 bg-[#00a884] hover:bg-[#06cf9c] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition shadow shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
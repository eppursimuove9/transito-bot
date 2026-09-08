'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Shield, Car, Camera, ExternalLink, RefreshCw, EyeOff, 
  Home, ArrowLeft, Trash2, PhoneCall, Sparkles, AlertTriangle, HeartHandshake, Store
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  authUrl?: string;
  imageUrl?: string;
}

interface AdminTicket {
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

const MENSAJE_INICIAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de La Unión* 🇨🇱

Selecciona el área de tu trámite:

1️⃣ 🚗 *Tránsito y Vehículos* (Permisos, Duplicados, Licencias, Multas)
2️⃣ 🏪 *Negocios y Rentas* (Patentes Comerciales, Ferias, Certificados)
3️⃣ 🏡 *Vecinos y Hogar* (Aseo, Caminos, Ramas y Chatarra)
4️⃣ ℹ️ *Información, Eventos y Guía Comunal* (Preguntas Libres / RAG)
5️⃣ 👵 *Modo Asistido / Adulto Mayor* (Texto claro y sencillo)
0️⃣ 👤 *Solicitar que un funcionario municipal me llame*

_Escribe el número de tu opción (1-5 o 0). Para emergencias escribe *SOS*._`;

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // FUNCIÓN DE SINCRONIZACIÓN EN TIEMPO REAL CON /admin VÍA localStorage
  const syncTicketToAdminDashboard = (
    type: 'CALLBACK' | 'CAMINO' | 'PERMISO' | 'CHATARRA',
    description: string,
    sector: string = 'Puerto Nuevo',
    citizen: string = 'Vecino en WhatsApp',
    customFolio?: string
  ) => {
    try {
      const stored = localStorage.getItem('launion_tickets');
      const currentTickets: AdminTicket[] = stored ? JSON.parse(stored) : [];

      const newTicket: AdminTicket = {
        id: customFolio || `TK-${Math.floor(1085 + Math.random() * 50)}`,
        citizen: citizen,
        phone: '+56 9 ' + Math.floor(74000000 + Math.random() * 25000000),
        sector: sector,
        type: type,
        description: description,
        slaMinutes: 1,
        status: type === 'PERMISO' ? 'ATENDIDO' : 'PENDIENTE',
        createdAt: 'Hace unos segundos'
      };

      const updated = [newTicket, ...currentTickets];
      localStorage.setItem('launion_tickets', JSON.stringify(updated));
    } catch (err) {
      console.error('Error al sincronizar con el panel de administración:', err);
    }
  };

  // Escuchar si el usuario completó la autenticación con ClaveÚnica
  useEffect(() => {
    const checkAuth = setInterval(() => {
      const auth = localStorage.getItem('launion_auth_verified');
      if (auth && currentStep === 'AUTH_PENDING') {
        const parsed = JSON.parse(auth);
        localStorage.removeItem('launion_auth_verified');
        setCurrentStep('INIT');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            text: `✅ *Identidad Validada con ClaveÚnica*\n\nHola *${parsed.nombre}* (Sector ${parsed.sector}).\n\nHemos pre-chequeado tu Hoja de Vida del Conductor.\n\n📅 *Horas Disponibles en Dirección de Tránsito (Comercio 340):*\n• Mañana martes 09:30 hrs\n• Jueves 11:15 hrs (Conexión directa bus rural Puerto Nuevo/Trumao)\n\n_Escribe el día de tu preferencia o *MENU* para volver._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 1500);
    return () => clearInterval(checkAuth);
  }, [currentStep]);

  const handleSendMessage = async (customText?: string, customImage?: string) => {
    const textToSend = customText !== undefined ? customText : inputValue;
    if (!textToSend.trim() && !customImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend || (customImage ? "📸 [Foto de evidencia adjunta]" : ""),
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

      // --- DETECTOR AUTOMÁTICO DE INTERACCIONES PARA EL DASHBOARD ---
      const replyText = data.reply || '';

      if (replyText.includes('Solicitud de Contacto Telefónico (#ATN-')) {
        const match = replyText.match(/#ATN-(\d+)/);
        const folio = match ? `TK-${match[1]}` : undefined;
        syncTicketToAdminDashboard('CALLBACK', 'Solicitud de llamado ciudadano directo desde WhatsApp', 'Puerto Nuevo', 'Vecino en Línea', folio);
      } else if (replyText.includes('Reporte Recibido y Foliado (#REP-')) {
        const match = replyText.match(/#REP-(\d+)/);
        const folio = match ? `TK-${match[1]}` : undefined;
        syncTicketToAdminDashboard('CAMINO', 'Reporte fotográfico de bache o luminaria en ruta rural', 'Mashue', 'Gladys Monsalve (Anónimo)', folio);
      } else if (replyText.includes('Retiro de Chatarra Ingresada (#CHAT-')) {
        const match = replyText.match(/#CHAT-(\d+)/);
        const folio = match ? `TK-${match[1]}` : undefined;
        syncTicketToAdminDashboard('CHATARRA', 'Solicitud retiro de baterías y metales en desuso', 'Choroico', 'Juan Pablo Ortiz', folio);
      } else if (replyText.includes('¡Pago Aprobado Exitosamente!')) {
        syncTicketToAdminDashboard('PERMISO', 'Pago Express completado vía Webpay / TGR (Timbrado emitido)', 'Urbano (Arturo Prat)', 'Carlos Vera');
      }

      let authLink: string | undefined = undefined;

      if (data.requires_auth) {
        const authRes = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wa_id: "+56987654321", id_tramite: data.tramite_id })
        });
        const authData = await authRes.json();
        authLink = authData.auth_url;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authUrl: authLink
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCaminoPhoto = () => {
    handleSendMessage(
      "📸 Camino sector Mashue curva km 4 con bache profundo tras lluvia",
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
    );
  };

  const handleSendChatarraPhoto = () => {
    handleSendMessage(
      "📸 Chatarra, fierros viejos y 2 baterías en desuso para reciclaje en Choroico",
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80"
    );
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
      {/* Encabezado */}
      <header className="max-w-5xl w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-300 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Piloto de Transformación Digital • I. Municipalidad de La Unión
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Ventanilla Única WhatsApp La Unión
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Plataforma modular con RAG inteligente, soporte fotográfico, callbacks telefónicos y enlace a panel administrativo en tiempo real.
        </p>
      </header>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Panel Izquierdo: Casos de Prueba */}
        <aside className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 max-h-[660px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
            <h2 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              Pruebas Rápidas (Demostración)
            </h2>
            <button
              onClick={restartDemo}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              title="Reiniciar conversación"
            >
              <RefreshCw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <div className="space-y-2 pb-4">
            {/* Categoría: Emergencias & Inclusión */}
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Seguridad & Inclusión Rural
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSendMessage("SOS")}
                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-700/50 transition text-left"
              >
                <div className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                  🚨 <span>Comando SOS</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Contactos directos</p>
              </button>

              <button
                onClick={() => handleSendMessage("MODO SIMPLE")}
                className="p-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/50 transition text-left"
              >
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3" /> <span>Modo Senior</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Lenguaje claro</p>
              </button>
            </div>

            {/* Categoría: RAG / Base de Conocimiento Inteligente */}
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> RAG / Consultas
            </div>

            <button
              onClick={() => handleSendMessage("¿Qué eventos costumbristas hay este verano en La Unión y Trumao?")}
              className="w-full text-left p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/50 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-cyan-300">
                <span>Eventos en Trumao & Pto Nuevo</span>
                <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1.5 py-0.5 rounded">RAG</span>
              </div>
            </button>

            <button
              onClick={() => handleSendMessage("¿Cuál es la farmacia de turno hoy en La Unión?")}
              className="w-full text-left p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/50 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-cyan-300">
                <span>Farmacia de Turno & Salud</span>
                <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1.5 py-0.5 rounded">RAG</span>
              </div>
            </button>

            {/* Categoría: Tránsito */}
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mt-2 flex items-center gap-1">
              <Car className="w-3.5 h-3.5" /> Tránsito y Recaudación
            </div>
            
            <button
              onClick={() => { handleSendMessage("1"); setTimeout(() => handleSendMessage("1"), 400); setTimeout(() => handleSendMessage("ABCD12"), 800); }}
              className="w-full text-left p-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-700/50 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-400">
                <span>1. Pago Exitoso (Toyota)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">ABCD12</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Simula un pago normal al día.</p>
            </button>

            <button
              onClick={() => { handleSendMessage("1"); setTimeout(() => handleSendMessage("1"), 400); setTimeout(() => handleSendMessage("GFHY45"), 800); }}
              className="w-full text-left p-2 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-700/50 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-amber-400">
                <span>2. Cobro con Multa JPL</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">GFHY45</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Muestra infracción pendiente ($35.000).</p>
            </button>

            <button
              onClick={() => { handleSendMessage("1"); setTimeout(() => handleSendMessage("1"), 400); setTimeout(() => handleSendMessage("KJTR88"), 800); }}
              className="w-full text-left p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-700/50 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-rose-400">
                <span>3. Bloqueo PRT Vencida</span>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-700/50">KJTR88</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Rechaza pago y manda a Planta de Revisión.</p>
            </button>

            {/* Categoría: Rentas y Patentes */}
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mt-2 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Negocios y Patentes
            </div>

            <button
              onClick={() => { handleSendMessage("2"); setTimeout(() => handleSendMessage("1"), 400); setTimeout(() => handleSendMessage("76123456-7"), 800); }}
              className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-indigo-400">
                <span>Patente Comercial (MEF)</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/50">76.123.456-7</span>
              </div>
            </button>

            {/* Categoría: Vecinos y Operaciones */}
            <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mt-2 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Vecinos y Operaciones
            </div>

            <button
              onClick={() => { handleSendMessage("3"); setTimeout(() => handleSendMessage("1"), 400); setTimeout(() => handleSendMessage("123-45"), 800); }}
              className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-orange-400">
                <span>Pago Aseo Domiciliario</span>
                <span className="text-[10px] bg-orange-950 text-orange-300 px-1.5 py-0.5 rounded border border-orange-700/50">Rol: 123-45</span>
              </div>
            </button>

            <button
              onClick={() => {
                handleSendMessage("3");
                setTimeout(() => {
                  handleSendMessage("2");
                  setTimeout(() => {
                    handleSendMessage("Mashue");
                    setTimeout(() => handleSendCaminoPhoto(), 500);
                  }, 500);
                }, 500);
              }}
              className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-orange-400">
                <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Reporte Camino + Foto</span>
                <span className="text-[9px] bg-orange-950 text-orange-300 px-1.5 py-0.5 rounded">Sincroniza Dashboard</span>
              </div>
            </button>

            {/* Categoría: Callback Telefónico */}
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-purple-400" /> Asistencia Municipal
            </div>

            <button
              onClick={() => handleSendMessage("0")}
              className="w-full text-left p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-purple-400">
                <span className="flex items-center gap-1">📞 Solicitar Llamado (Callback)</span>
                <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">Ticket al /admin</span>
              </div>
            </button>

            {/* Botón Volver */}
            <button
              onClick={() => handleSendMessage("MENU")}
              className="w-full text-center p-1.5 mt-2 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 border border-slate-700/40 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1 sticky bottom-0"
            >
              <ArrowLeft className="w-3 h-3" /> Volver al Menú Principal (MENU)
            </button>
          </div>
        </aside>

        {/* Panel Derecho: WhatsApp */}
        <main className="md:col-span-7 bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[660px]">
          {/* Header de WhatsApp */}
          <div className="bg-[#075E54] text-white p-3.5 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm border border-white/20">
              🇨🇱
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">Muni La Unión • Ventanilla Única</h3>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span> Bot Oficial Verificado
              </p>
            </div>
          </div>

          {/* Mensajes */}
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

                  {m.authUrl && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60">
                      <a
                        href={m.authUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow transition"
                      >
                        <Shield className="w-3.5 h-3.5 text-red-400" />
                        <span>Ingresar con ClaveÚnica</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}

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

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-[#202c33] flex items-center gap-2 border-t border-slate-800"
          >
            <button
              type="button"
              onClick={handleSendChatarraPhoto}
              title="Adjuntar foto de evidencia"
              className="w-9 h-9 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full flex items-center justify-center transition shrink-0"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un trámite (1-5), SOS o '0' para funcionario..."
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
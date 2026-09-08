'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Shield, Car, Camera, ExternalLink, RefreshCw, EyeOff, 
  Home, ArrowLeft, Trash2, PhoneCall, Sparkles, AlertTriangle, HeartHandshake, Store, Copy, Check
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Escuchar si volvió autenticado desde ClaveÚnica
  useEffect(() => {
    const authData = localStorage.getItem('launion_auth_verified');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        localStorage.removeItem('launion_auth_verified');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            text: `✅ *Identidad Validada con ClaveÚnica*\n\nHola *${parsed.nombre}* (RUN: ${parsed.rut}, Sector: ${parsed.sector}).\n\nHemos pre-chequeado tu Hoja de Vida del Conductor en el Registro Civil.\n\n📅 *Horas Disponibles en Dirección de Tránsito (Calle Comercio 340):*\n• Mañana martes 09:30 hrs\n• Jueves 11:15 hrs (Conexión bus rural Puerto Nuevo/Trumao)\n\n_Escribe el día de tu preferencia o *MENU* para volver._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setCurrentStep('INIT');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Copiar al portapapeles con feedback visual
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setInputValue(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Sincronización en tiempo real con /admin
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

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authUrl: data.auth_url
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
          Plataforma modular con RAG comunal, semáforos de SLA y sincronización con panel administrativo en tiempo real.
        </p>
      </header>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Panel Izquierdo: GUÍA INFORMATIVA */}
        <aside className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 max-h-[660px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>📋 Guía de Interacción y Datos</span>
              </h2>
              <p className="text-[11px] text-slate-400">Haz clic en cualquier caja para copiar al chat:</p>
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
            {/* 1. Tránsito y Vehículos */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> 1. Tránsito (Opción 1)</span>
              </div>
              
              <div className="space-y-1.5">
                <div 
                  onClick={() => copyToClipboard("ABCD12")}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition flex justify-between items-center group"
                >
                  <div>
                    <div className="font-mono font-bold text-white flex items-center gap-2">
                      <span>ABCD12</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 font-normal px-1.5 rounded">Al día</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Toyota Hilux (Puerto Nuevo) • Flujo normal de pago</p>
                  </div>
                  <span className="text-slate-500 group-hover:text-emerald-400 text-xs">
                    {copiedCode === "ABCD12" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </span>
                </div>

                <div 
                  onClick={() => copyToClipboard("GFHY45")}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-amber-500/50 cursor-pointer transition flex justify-between items-center group"
                >
                  <div>
                    <div className="font-mono font-bold text-white flex items-center gap-2">
                      <span>GFHY45</span>
                      <span className="text-[10px] bg-amber-950 text-amber-300 font-normal px-1.5 rounded">Multa JPL</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Nissan Terrano (Mashue) • Infracción de $35.000</p>
                  </div>
                  <span className="text-slate-500 group-hover:text-amber-400 text-xs">
                    {copiedCode === "GFHY45" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </span>
                </div>

                <div 
                  onClick={() => copyToClipboard("KJTR88")}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-rose-500/50 cursor-pointer transition flex justify-between items-center group"
                >
                  <div>
                    <div className="font-mono font-bold text-white flex items-center gap-2">
                      <span>KJTR88</span>
                      <span className="text-[10px] bg-rose-950 text-rose-300 font-normal px-1.5 rounded">PRT Vencida</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Chevrolet Sail (Choroico) • Bloqueo de seguridad</p>
                  </div>
                  <span className="text-slate-500 group-hover:text-rose-400 text-xs">
                    {copiedCode === "KJTR88" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Rentas, Patentes y Feria Libre */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="text-indigo-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" /> 2. Rentas & Negocios (Opción 2)
              </div>
              
              <div 
                onClick={() => copyToClipboard("76123456-7")}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-mono font-bold text-white flex items-center gap-2">
                    <span>76123456-7</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 font-normal px-1.5 rounded">RUT Patente</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Agrícola y Lácteos Puerto Nuevo SpA ($42.300)</p>
                </div>
                <span className="text-slate-500 group-hover:text-indigo-400 text-xs">
                  {copiedCode === "76123456-7" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
              </div>

              <div 
                onClick={() => copyToClipboard("15432987-4")}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-mono font-bold text-white flex items-center gap-2">
                    <span>15432987-4</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 font-normal px-1.5 rounded">Feria Libre</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Puesto N° 18 - Calle Prat (Gladys Monsalve • $12.500)</p>
                </div>
                <span className="text-slate-500 group-hover:text-indigo-400 text-xs">
                  {copiedCode === "15432987-4" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
              </div>
            </div>

            {/* 3. Vecinos, Aseo y Reportes */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="text-orange-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> 3. Vecinos & Operaciones (Opción 3)
              </div>
              <div 
                onClick={() => copyToClipboard("123-45")}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-orange-500/50 cursor-pointer transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-mono font-bold text-white flex items-center gap-2">
                    <span>123-45</span>
                    <span className="text-[10px] bg-orange-950 text-orange-300 font-normal px-1.5 rounded">Rol Aseo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Arturo Prat 450 (2 cuotas pendientes: $18.400)</p>
                </div>
                <span className="text-slate-500 group-hover:text-orange-400 text-xs">
                  {copiedCode === "123-45" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
              </div>
            </div>

            {/* 4. Comandos Especiales */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-1 text-[11px] text-slate-300">
              <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Atajos Rápidos
              </div>
              <p>• Escribe <strong className="text-rose-300 font-mono">SOS</strong> para emergencias.</p>
              <p>• Escribe <strong className="text-amber-300 font-mono">5</strong> o <strong className="text-amber-300 font-mono">MODO SIMPLE</strong> para modo adulto mayor.</p>
              <p>• En Licencias (1 ➔ 4), presiona el botón azul para simular ClaveÚnica.</p>
              <p>• Escribe <strong className="text-purple-300 font-mono">0</strong> para solicitar un llamado humano.</p>
            </div>
          </div>
        </aside>

        {/* Panel Derecho: WhatsApp Interactivo */}
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

                  {/* BOTÓN REAL DE CLAVEÚNICA */}
                  {m.authUrl && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60">
                      <a
                        href={m.authUrl}
                        className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0c3c66] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition"
                      >
                        <Shield className="w-4 h-4 text-white" />
                        <span>Ingresar con ClaveÚnica (Registro Civil)</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
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
              onClick={() => handleSendMessage(
                "📸 Camino sector Mashue curva km 4 con bache profundo tras lluvia",
                "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
              )}
              title="Adjuntar foto de evidencia (Cámara)"
              className="w-9 h-9 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full flex items-center justify-center transition shrink-0"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe aquí un número (1-5), SOS o tu consulta..."
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
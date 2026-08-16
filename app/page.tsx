'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, Car, Camera, MapPin, ExternalLink, RefreshCw, EyeOff, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  authUrl?: string;
  imageUrl?: string;
}

const MENSAJE_INICIAL = `👋 ¡Hola! Bienvenido a la *Ventanilla Única Digital de Purranque* 🇨🇱

¿Qué trámite deseas realizar?

1️⃣ Pagar Permiso de Circulación (Pago Express)
2️⃣ Obtener Duplicado de Permiso (Instantáneo)
3️⃣ Agendar Licencia (Pre-chequeo rural sin filas)
4️⃣ Consultar / Pagar Patente Comercial
5️⃣ Reportar estado de camino o luminaria (100% Anónimo)

_Responde con el número de tu opción (1-5) o escribe MENU en cualquier momento para volver._`;

export default function PurranqueDemoPage() {
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

  // Escuchar si el usuario completó la autenticación con ClaveÚnica
  useEffect(() => {
    const checkAuth = setInterval(() => {
      const auth = localStorage.getItem('purranque_auth_verified');
      if (auth && currentStep === 'AUTH_PENDING') {
        const parsed = JSON.parse(auth);
        localStorage.removeItem('purranque_auth_verified');
        setCurrentStep('INIT');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            text: `✅ *Identidad Confirmada con ClaveÚnica*\n\nHola *${parsed.nombre}* (Sector ${parsed.sector}).\n\nHemos validado tu Hoja de Vida del Conductor y Cédula.\n\n📅 *Horas Disponibles en Tránsito (Pedro Montt 249):*\n• Mañana martes 09:30 hrs\n• Jueves 11:00 hrs (Especial rural con bus de conexión)\n\n_Escribe el día de tu preferencia o *MENU* para volver._`,
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

  // Simular envío de foto de camino rural
  const handleSendPhotoSimulation = () => {
    handleSendMessage(
      "📸 Camino sector Hueyusca con bache profundo tras la lluvia",
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
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
          Piloto de Transformación Digital • I. Municipalidad de Purranque
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Ventanilla Única WhatsApp Purranque
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Canal automatizado para vecinos de Corte Alto, Hueyusca, Crucero y Purranque centro.
        </p>
      </header>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Panel Izquierdo: Casos de Prueba */}
        <aside className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" /> Casos de Borde (Demo)
            </h2>
            <button
              onClick={restartDemo}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              title="Reiniciar conversación"
            >
              <RefreshCw className="w-3 h-3" /> Reiniciar
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Haz clic en los botones para simular cada trámite en vivo:
          </p>

          <div className="space-y-2">
            {/* Botón 1: Pago Express */}
            <button
              onClick={() => { handleSendMessage("1"); setTimeout(() => handleSendMessage("ABCD12"), 600); }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-400">
                <span>1. Pago Express (ABCD12)</span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded">Al Día</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Corte Alto • Liquidación y pago Webpay</p>
            </button>

            {/* Botón 2: Duplicado Instantáneo */}
            <button
              onClick={() => { handleSendMessage("2"); setTimeout(() => handleSendMessage("ABCD12"), 600); }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-indigo-400">
                <span>2. Duplicado de Permiso</span>
                <span className="text-[10px] bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded">PDF Directo</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Descarga copia histórica sin ir al municipio</p>
            </button>

            {/* Botón 3: Licencia con ClaveÚnica */}
            <button
              onClick={() => handleSendMessage("3")}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-sky-400">
                <span>3. Licencia + ClaveÚnica</span>
                <span className="text-[10px] bg-sky-950/80 text-sky-300 px-2 py-0.5 rounded">Pre-chequeo</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Evita el viaje rural si faltan papeles</p>
            </button>

            {/* Botón 4: Patente Comercial */}
            <button
              onClick={() => { handleSendMessage("4"); setTimeout(() => handleSendMessage("76123456-7"), 600); }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-amber-400">
                <span>4. Patente Comercial (RUT)</span>
                <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded">Rentas</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Microempresa Quesería Corte Alto</p>
            </button>

            {/* Botón 5: Reporte Anónimo con Foto */}
            <button
              onClick={() => {
                handleSendMessage("5");
                setTimeout(() => {
                  handleSendMessage("Hueyusca");
                  setTimeout(() => handleSendPhotoSimulation(), 600);
                }, 600);
              }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-orange-400">
                <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> 5. Reporte Anónimo + Foto</span>
                <span className="text-[10px] bg-orange-950/80 text-orange-300 px-2 py-0.5 rounded">Sin Funas</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Envío de foto de camino rural a Operaciones</p>
            </button>

            {/* Botón de Cancelar / Volver al Menú */}
            <button
              onClick={() => handleSendMessage("0")}
              className="w-full text-center p-2 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 border border-slate-700/40 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Probar botón "Volver al Menú" (Escribe 0)
            </button>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl text-[11px] text-blue-300 space-y-1">
            <div className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" /> Impacto en Purranque:</div>
            <div>Canal confidencial directo con el municipio que sustituye la exposición en Facebook/Instagram.</div>
          </div>
        </aside>

        {/* Panel Derecho: Mock del Teléfono Celular (WhatsApp) */}
        <main className="md:col-span-7 bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[650px]">
          {/* Header de WhatsApp */}
          <div className="bg-[#075E54] text-white p-3.5 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm border border-white/20">
              🇨🇱
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">Muni Purranque • Ventanilla Única</h3>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span> Bot Oficial Verificado
              </p>
            </div>
          </div>

          {/* Área de Mensajes */}
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
                  {/* Foto adjunta si el mensaje la tiene */}
                  {m.imageUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-emerald-700/50">
                      <img src={m.imageUrl} alt="Evidencia Camino" className="w-full h-36 object-cover" />
                    </div>
                  )}

                  {m.text}

                  {/* Botón de ClaveÚnica */}
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

          {/* Input de Envío con Botón de Cámara para Adjuntar Evidencia */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-[#202c33] flex items-center gap-2 border-t border-slate-800"
          >
            {/* Botón de Cámara para simular subida de imagen */}
            <button
              type="button"
              onClick={handleSendPhotoSimulation}
              title="Adjuntar foto de evidencia (Caminos / Luminarias)"
              className="w-9 h-9 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full flex items-center justify-center transition shrink-0"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje, opción o '0' para menú..."
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
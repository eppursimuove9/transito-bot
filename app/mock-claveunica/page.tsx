'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

function ClaveUnicaForm() {
  const searchParams = useSearchParams();
  const ott = searchParams.get('ott');
  const waId = searchParams.get('wa_id');
  const [run, setRun] = useState('17894562-K');
  const [clave, setClave] = useState('Prueba2026*');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    // Guarda la confirmación para el simulador de chat
    if (typeof window !== 'undefined') {
      localStorage.setItem('purranque_auth_verified', JSON.stringify({
        run,
        nombre: 'Juan Carlos Gallardo',
        sector: 'Corte Alto',
        timestamp: Date.now()
      }));
    }
  };

  if (success) {
    return (
      <div className="bg-white text-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Autenticación Exitosa!</h2>
        <p className="text-sm text-slate-600 mb-6">
          Identidad validada ante el Estado de Chile para <strong>Juan Carlos Gallardo</strong> (RUN: {run}).
        </p>
        <button
          onClick={() => window.close()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          Volver al Chat de WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
      <div className="text-center mb-6 border-b-2 border-red-600 pb-4">
        <h1 className="text-2xl font-extrabold text-[#003366] tracking-tight">ClaveÚnica</h1>
        <p className="text-xs text-red-600 font-semibold tracking-wider uppercase">Identidad Digital del Estado de Chile</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-md mb-5">
        <strong>Modo Piloto Purranque:</strong> Las credenciales de prueba vienen precargadas para la demostración.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">R.U.N.</label>
          <input
            type="text"
            value={run}
            onChange={(e) => setRun(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña ClaveÚnica</label>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <span>Ingresar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Conexión protegida Dirección de Tránsito Purranque
      </div>
    </div>
  );
}

export default function MockClaveUnicaPage() {
  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white">Cargando pasarela oficial...</div>}>
        <ClaveUnicaForm />
      </Suspense>
    </div>
  );
}
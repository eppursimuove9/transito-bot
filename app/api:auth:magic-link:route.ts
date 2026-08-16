import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { wa_id, id_tramite } = await req.json();
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  // Retorna la URL relativa que funcionará tanto en localhost como en Vercel
  return NextResponse.json({
    token,
    auth_url: `/mock-claveunica?ott=${token}&wa_id=${encodeURIComponent(wa_id)}&tramite=${id_tramite}`,
    expires_in: 300
  });
}
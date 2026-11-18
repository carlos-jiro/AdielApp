import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PushServiceError, sendTestPush, type PushEnvironment } from './lib/pushService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Inicia sesión para enviar una prueba.' });
  }

  try {
    const environment: PushEnvironment = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    };
    const result = await sendTestPush(authorization.slice('Bearer '.length).trim(), environment);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    const statusCode = error instanceof PushServiceError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'No se pudo enviar la notificación.';
    return res.status(statusCode).json({ error: message });
  }
}

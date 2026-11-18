import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'node:module';

const webpush = createRequire(import.meta.url)('web-push') as typeof import('web-push');

export interface PushEnvironment {
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

export class PushServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'PushServiceError';
    this.statusCode = statusCode;
  }
}

interface StoredPushSubscription {
  id: string;
  subscription: {
    endpoint: string;
    expirationTime?: number | null;
    keys: { p256dh: string; auth: string };
  };
}

export async function sendTestPush(accessToken: string, env: PushEnvironment) {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublicKey = env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = env.VAPID_PRIVATE_KEY;
  const vapidSubject = env.VAPID_SUBJECT;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new PushServiceError('Falta configurar Supabase en el servidor.');
  }
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    throw new PushServiceError('Faltan las variables VAPID del servidor.');
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!userResponse.ok) throw new PushServiceError('La sesión expiró. Inicia sesión de nuevo.', 401);

  const user = await userResponse.json() as { id?: string };
  if (!user.id) throw new PushServiceError('No se pudo validar la sesión.', 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await adminClient
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('user_id', user.id);
  if (error) throw new PushServiceError('No se pudieron consultar los dispositivos registrados.');

  const subscriptions = (data || []) as StoredPushSubscription[];
  if (!subscriptions.length) {
    throw new PushServiceError('Este dispositivo todavía no está suscrito a las notificaciones.', 404);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const payload = JSON.stringify({
    title: 'Adiel · Prueba de notificación',
    body: 'Las notificaciones de Adiel están activas en este dispositivo.',
    url: '/settings',
    tag: 'adiel-push-test',
  });

  const results = await Promise.all(subscriptions.map(async row => {
    try {
      await webpush.sendNotification(row.subscription, payload, { TTL: 60 });
      return { id: row.id, delivered: true, expired: false };
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      return { id: row.id, delivered: false, expired: statusCode === 404 || statusCode === 410 };
    }
  }));

  const expiredIds = results.filter(result => result.expired).map(result => result.id);
  if (expiredIds.length) {
    await adminClient.from('push_subscriptions').delete().in('id', expiredIds).eq('user_id', user.id);
  }

  const sent = results.filter(result => result.delivered).length;
  if (!sent) throw new PushServiceError('No se pudo entregar la prueba. Revisa las claves VAPID y la suscripción.', 502);
  return { sent, expiredRemoved: expiredIds.length };
}

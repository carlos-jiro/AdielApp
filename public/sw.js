const APP_ICON = '/adiel-icon-192.png';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() || '' };
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'Adiel', {
    body: payload.body || 'Tienes una nueva notificación del coro.',
    icon: payload.icon || APP_ICON,
    badge: payload.badge || APP_ICON,
    tag: payload.tag || 'adiel-notification',
    data: { url: payload.url || '/' },
    renotify: false,
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const requestedUrl = new URL(event.notification.data?.url || '/', self.location.origin);
    const targetUrl = requestedUrl.origin === self.location.origin ? requestedUrl.href : self.location.origin;
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of clients) {
      if (new URL(client.url).origin !== self.location.origin) continue;
      if ('navigate' in client && client.url !== targetUrl) await client.navigate(targetUrl);
      await client.focus();
      return;
    }

    await self.clients.openWindow(targetUrl);
  })());
});

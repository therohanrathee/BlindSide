self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'BlindSide';
    const body = data.body || 'You have a new notification!';
    const url = data.url || '/dashboard';
    const tag = data.tag || 'default';
    const matchId = data.match_id || (tag !== 'default' ? tag : null);

    const options = {
      body,
      icon: '/icons/icon-512.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag,
      data: { url, match_id: matchId },
    };

    // Smart Muting: Check if the app is already open and focused
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        let isFocused = false;

        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.focused) {
            isFocused = true;
            // Also notify the active client so it can immediately refresh messages
            client.postMessage({
              type: 'PUSH_RECEIVED',
              title,
              body,
              url,
              match_id: matchId,
            });
            break;
          }
        }

        // If the user is currently focused on the app, suppress the push notification popup
        if (isFocused) {
          console.log('App is focused, suppressing push notification.');
          return;
        }

        // Otherwise, show the notification
        return self.registration.showNotification(title, options);
      })
    );
  } catch (err) {
    console.error('Error parsing push payload', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const rawUrl = (event.notification.data && event.notification.data.url) || '/dashboard';
  const targetUrl = new URL(rawUrl, self.location.origin).href;
  const isChat = rawUrl.includes('tab=chat') || rawUrl.includes('view=chat');
  const matchId = event.notification.data && event.notification.data.match_id;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Check if an existing dashboard window/tab is open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientUrl = new URL(client.url, self.location.origin);

        // Same origin and dashboard path
        if (clientUrl.origin === self.location.origin && clientUrl.pathname.startsWith('/dashboard')) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: rawUrl,
            action: isChat ? 'OPEN_CHAT' : 'NAVIGATE',
            match_id: matchId,
          });

          if ('focus' in client) {
            client.focus();
          }

          if (client.url !== targetUrl && 'navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }

      // 2. If any other window for this app is open, navigate and focus
      if (windowClients.length > 0 && 'focus' in windowClients[0]) {
        const client = windowClients[0];
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          url: rawUrl,
          action: isChat ? 'OPEN_CHAT' : 'NAVIGATE',
          match_id: matchId,
        });

        if ('navigate' in client) {
          client.navigate(targetUrl);
        }
        return client.focus();
      }

      // 3. If no window is open at all, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

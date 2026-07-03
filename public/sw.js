self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'BlindSide';
    const body = data.body || 'You have a new notification!';
    const url = data.url || '/dashboard';
    const tag = data.tag || 'default';

    const options = {
      body,
      icon: '/icon-512x512.png', // Assuming a standard icon exists, fallback if not
      badge: '/badge-72x72.png', // Transparent white icon for Android status bar
      vibrate: [200, 100, 200],
      tag,
      data: { url },
    };

    // Smart Muting: Check if the app is already open and focused
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        let isFocused = false;

        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.focused) {
            isFocused = true;
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

  const urlToOpen = event.notification.data.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If the URL matches or the app is just generally open, focus it and navigate
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If there is any app window open, focus it and navigate
      if (windowClients.length > 0 && 'focus' in windowClients[0]) {
        windowClients[0].navigate(urlToOpen);
        return windowClients[0].focus();
      }

      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

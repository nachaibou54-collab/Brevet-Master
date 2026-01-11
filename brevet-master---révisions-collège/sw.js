
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Brevet Master', body: 'Il est temps de réviser !' };
  
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '🎓',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

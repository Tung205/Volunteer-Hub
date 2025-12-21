// public/sw.js
self.addEventListener('push', function (event) {
    if (!event.data) {
        console.log('Push event but no data');
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/logo192.png', // Ensure this icon exists or use default
            badge: '/logo192.png', // Small icon for mobile status bar
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            },
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (e) {
        console.error('Error processing push data', e);
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');
    event.notification.close();
    // Open the app
    event.waitUntil(
        clients.openWindow('/')
    );
});

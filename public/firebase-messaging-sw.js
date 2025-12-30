// Firebase Messaging Service Worker
// This file handles background push notifications
// Note: Config is injected during build process

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config - these values are public and restricted by domain
// They are safe to be here as security is handled by Firebase Security Rules
const firebaseConfig = {
    apiKey: "AIzaSyDohK_oyIK6l3zWDq8fnqPPG8mu_p8Y-mc",
    authDomain: "project-3402036684893689390.firebaseapp.com",
    projectId: "project-3402036684893689390",
    storageBucket: "project-3402036684893689390.firebasestorage.app",
    messagingSenderId: "735385506042",
    appId: "1:735385506042:web:e1cb05eef316cdebe2f943"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || '2026 Vizyonu';
    const notificationOptions = {
        body: payload.notification?.body || 'Yeni bir bildiriminiz var!',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        vibrate: [100, 50, 100],
        data: payload.data,
        actions: [
            { action: 'open', title: 'Aç' },
            { action: 'close', title: 'Kapat' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

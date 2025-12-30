import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import app from './firebaseConfig';

let messaging = null;
let swRegistration = null;

// Register service worker first
const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            // Determine base path (for GitHub Pages deployment)
            const basePath = import.meta.env.BASE_URL || '/';
            // Register Firebase messaging SW
            swRegistration = await navigator.serviceWorker.register(`${basePath}firebase-messaging-sw.js`);
            console.log('Firebase Messaging SW registered:', swRegistration.scope);
            return swRegistration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
};

// Initialize messaging only in browser environment
const initializeMessaging = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('Notifications not supported');
        return null;
    }

    try {
        // Ensure service worker is registered first
        if (!swRegistration) {
            await registerServiceWorker();
        }

        messaging = getMessaging(app);
        console.log('Firebase Messaging initialized');
        return messaging;
    } catch (error) {
        console.error('Firebase Messaging initialization failed:', error);
        return null;
    }
};

// Request notification permission
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return { status: 'unsupported', token: null };
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        if (permission === 'granted') {
            try {
                const token = await getFCMToken();
                console.log('FCM Token obtained:', token ? 'Yes' : 'No');
                return { status: 'granted', token };
            } catch (tokenError) {
                console.error('Error getting FCM token:', tokenError);
                // Still return granted even if token fails
                return { status: 'granted', token: null };
            }
        } else if (permission === 'denied') {
            return { status: 'denied', token: null };
        } else {
            return { status: 'default', token: null };
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return { status: 'error', token: null };
    }
};

// Get FCM token
export const getFCMToken = async () => {
    try {
        const msg = await initializeMessaging();
        if (!msg) {
            console.log('Messaging not available');
            return null;
        }

        // Wait for service worker to be ready
        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.ready;
        }

        const token = await getToken(msg, {
            vapidKey: 'BKNJPtlt6kd-gICBToGITW-fdgz5RN1IgKxLHnjcIPUt2cWTGlt9kUee0hvtYxjmVnqR38i_VXthCgZGnNKphg8',
            serviceWorkerRegistration: swRegistration
        });

        if (token) {
            console.log('FCM Token:', token.substring(0, 20) + '...');
            await saveTokenToFirestore(token);
            return token;
        } else {
            console.log('No FCM token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        throw error;
    }
};

// Save FCM token to Firestore
export const saveTokenToFirestore = async (token) => {
    const user = auth.currentUser;
    if (!user) {
        console.log('No user logged in, cannot save FCM token');
        return;
    }

    try {
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            fcmToken: token,
            lastTokenUpdate: new Date().toISOString()
        }, { merge: true });
        console.log('FCM token saved to Firestore');
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
    if (!messaging) {
        initializeMessaging().then(msg => {
            if (msg) {
                onMessage(msg, (payload) => {
                    console.log('Foreground message received:', payload);
                    callback(payload);
                });
            }
        });
        return () => { };
    }

    return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
};

// Check notification permission status
export const getNotificationPermissionStatus = () => {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
};

// Show local notification (for foreground messages)
export const showLocalNotification = (title, options = {}) => {
    if (Notification.permission !== 'granted') return null;

    try {
        const notification = new Notification(title, {
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            vibrate: [100, 50, 100],
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.url) {
                window.location.href = options.url;
            }
        };

        return notification;
    } catch (error) {
        console.error('Error showing local notification:', error);
        return null;
    }
};

// Schedule a reminder (client-side, will only work if app is open)
export const scheduleReminder = (title, body, date) => {
    const now = Date.now();
    const scheduledTime = new Date(date).getTime();
    const delay = scheduledTime - now;

    if (delay <= 0) return null;

    const timeoutId = setTimeout(() => {
        showLocalNotification(title, { body });
    }, delay);

    return timeoutId;
};

export default {
    requestNotificationPermission,
    getFCMToken,
    onForegroundMessage,
    getNotificationPermissionStatus,
    showLocalNotification,
    scheduleReminder
};

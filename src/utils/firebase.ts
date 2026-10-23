import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import api from '../services/api';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let messagingInstance: Messaging | null = null;

export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim() !== '' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== '' &&
    firebaseConfig.appId &&
    firebaseConfig.appId.trim() !== ''
  );
};

export const initializeFirebase = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;

  if (!isNotificationSupported()) {
    return null;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    console.error('[FCM] Firebase initialization failed');
    return null;
  }
};

export const requestFirebaseNotificationPermission = async (): Promise<string | null> => {
  if (!isNotificationSupported()) {
    return null;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    const messaging = await initializeFirebase();
    if (!messaging) {
      return null;
    }

    // Register service worker with encoded config
    const configStr = encodeURIComponent(JSON.stringify(firebaseConfig));
    const swRegistration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?config=${configStr}`
    );
    await navigator.serviceWorker.ready;

    const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY || '').trim();
    const tokenOptions: { serviceWorkerRegistration: ServiceWorkerRegistration; vapidKey?: string } = {
      serviceWorkerRegistration: swRegistration,
      ...(vapidKey ? { vapidKey } : {}),
    };

    const currentToken = await getToken(messaging, tokenOptions);
    if (currentToken) {
      return currentToken;
    } else {
      console.warn('[FCM] No registration token received. Verify VAPID key in Firebase Console.');
      return null;
    }
  } catch {
    console.error('[FCM] Error occurred while retrieving FCM token');
    return null;
  }
};

export const registerTokenWithBackend = async (token: string): Promise<boolean> => {
  if (!token || token.trim() === '') return false;
  try {
    await api.post('/notifications/device-token', {
      fcmToken: token.trim(),
      deviceType: 'WEB',
      deviceName: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 200) : 'Web Browser',
    });
    console.log('[FCM] Device token registered with backend successfully.');
    return true;
  } catch {
    console.error('[FCM] Failed to register device token with backend');
    return false;
  }
};

/**
 * Automatically request notification permission and register the FCM token
 * with the backend. This should be called after user login.
 * Silently no-ops if notifications are not supported, permission is denied,
 * or Firebase is not configured.
 */
export const autoRegisterFCMToken = async (): Promise<void> => {
  try {
    if (!isNotificationSupported() || !isFirebaseConfigured()) {
      return;
    }

    // If permission was already granted, silently get the token and register it
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const token = await requestFirebaseNotificationPermission();
      if (token) {
        await registerTokenWithBackend(token);
      }
    }
    // If permission is 'default' (not yet asked), we request it
    else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const token = await requestFirebaseNotificationPermission();
      if (token) {
        await registerTokenWithBackend(token);
      }
    }
    // If permission is 'denied', we silently skip
  } catch {
    console.warn('[FCM] Auto-registration of FCM token failed (non-fatal)');
  }
};

export const onMessageListener = (callback: (payload: any) => void): (() => void) => {
  let unsub: (() => void) | null = null;
  let active = true;

  if (messagingInstance) {
    unsub = onMessage(messagingInstance, callback);
  } else {
    initializeFirebase().then((messaging) => {
      if (messaging && active) {
        unsub = onMessage(messaging, callback);
      }
    });
  }

  return () => {
    active = false;
    if (unsub) {
      unsub();
    }
  };
};

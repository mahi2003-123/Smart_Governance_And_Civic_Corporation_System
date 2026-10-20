import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import api from '../services/api';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBwoFo8fUwz-cu-vRUokqDdT5AuKPq-fTI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sgcs-civic-system.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sgcs-civic-system',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sgcs-civic-system.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '343274833225',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:343274833225:web:45e2517ce4d284b27b4698',
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
    firebaseConfig.apiKey !== 'dummy-api-key' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== '' &&
    firebaseConfig.projectId !== 'dummy-project' &&
    firebaseConfig.appId &&
    firebaseConfig.appId.trim() !== ''
  );
};

export const initializeFirebase = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;

  if (!isNotificationSupported()) {
    console.warn('[FCM] Push notifications are not supported in this browser environment.');
    return null;
  }

  if (!isFirebaseConfigured()) {
    console.warn(
      '[FCM] Firebase Web SDK configuration is incomplete. ' +
      'Please ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID ' +
      'are defined in your environment (.env.local or production hosting).'
    );
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('[FCM] Firebase Messaging is not supported in this browser context.');
      return null;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error('[FCM] Firebase initialization failed:', error);
    return null;
  }
};

export const requestFirebaseNotificationPermission = async (): Promise<string | null> => {
  if (!isNotificationSupported()) {
    console.warn('[FCM] Push notification is not supported by this browser.');
    return null;
  }

  if (!isFirebaseConfigured()) {
    console.warn('[FCM] Cannot request token: Firebase web configuration is missing or incomplete.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission was not granted (status:', permission, ')');
      return null;
    }

    const messaging = await initializeFirebase();
    if (!messaging) {
      console.warn('[FCM] Firebase messaging could not be initialized.');
      return null;
    }

    // Register service worker with encoded config without date-cache busting churn
    const configStr = encodeURIComponent(JSON.stringify(firebaseConfig));
    const swRegistration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?config=${configStr}`
    );
    await navigator.serviceWorker.ready;

    const DEFAULT_VAPID_KEY = 'BNwXaurkFdzfb4ToVbaNGm3moZTNrym9CO-VXAoJipCs3efi1-ud7_R6PNof1eRsH7XtYQx5gSW_YRYKfkNpWt4';
    const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY || DEFAULT_VAPID_KEY).trim();
    const tokenOptions: { serviceWorkerRegistration: ServiceWorkerRegistration; vapidKey?: string } = {
      serviceWorkerRegistration: swRegistration,
      vapidKey: vapidKey,
    };

    const currentToken = await getToken(messaging, tokenOptions);
    if (currentToken) {
      return currentToken;
    } else {
      console.warn('[FCM] No registration token received. Verify VAPID key in Firebase Console.');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error occurred while retrieving FCM token:', error);
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
  } catch (error) {
    console.error('[FCM] Failed to register device token with backend:', error);
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
  } catch (err) {
    console.warn('[FCM] Auto-registration of FCM token failed (non-fatal):', err);
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

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import axios from 'axios';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let messaging: any = null;

export const initializeFirebase = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      const app = initializeApp(firebaseConfig);
      messaging = getMessaging(app);
      return messaging;
    } else {
      console.warn("Firebase Messaging is not supported in this browser.");
      return null;
    }
  } catch (error) {
    console.error("Firebase initialization failed", error);
    return null;
  }
};

export const requestFirebaseNotificationPermission = async () => {
  if (!messaging) await initializeFirebase();
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.warn('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};

export const registerTokenWithBackend = async (token: string, tokenAuthKey: string) => {
  try {
    await axios.post('/api/notifications/device-token', {
      fcmToken: token,
      deviceType: 'WEB',
      deviceName: navigator.userAgent
    }, {
      headers: {
        Authorization: `Bearer ${tokenAuthKey}`
      },
      baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`
    });
  } catch (error) {
    console.error('Failed to register device token with backend', error);
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (messaging) {
    onMessage(messaging, (payload) => {
      callback(payload);
    });
  }
};

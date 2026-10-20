importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Activate new service worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const urlParams = new URLSearchParams(location.search);
let firebaseConfig = {
  apiKey: "AIzaSyBwoFo8fUwz-cu-vRUokqDdT5AuKPq-fTI",
  authDomain: "sgcs-civic-system.firebaseapp.com",
  projectId: "sgcs-civic-system",
  storageBucket: "sgcs-civic-system.firebasestorage.app",
  messagingSenderId: "343274833225",
  appId: "1:343274833225:web:45e2517ce4d284b27b4698"
};

try {
  if (urlParams.has('config')) {
    const parsed = JSON.parse(decodeURIComponent(urlParams.get('config')));
    if (parsed && typeof parsed === 'object') {
      firebaseConfig = { ...firebaseConfig, ...parsed };
    }
  }
} catch (e) {
  console.warn('[SW] Failed to parse config from SW url:', e);
}

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function (payload) {
    console.log('[SW] Received background message:', payload);

    const notificationTitle =
      payload?.data?.title ||
      payload?.notification?.title ||
      'SGCS Civic Alert';

    const notificationOptions = {
      body:
        payload?.data?.body ||
        payload?.notification?.body ||
        'You have a new update in SGCS.',
      icon: '/vite.svg',
      badge: '/vite.svg',
      vibrate: [200, 100, 200],
      data: payload?.data || {},
      tag: payload?.data?.taskId || payload?.data?.trackingNumber || undefined
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('[SW] Firebase SW initialization skipped or failed:', e);
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event.notification?.data || {};
  const clickAction = data.click_action || data.linkUrl || (data.taskId ? '/worker/tasks' : '/');
  const urlToOpen = new URL(clickAction, self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      return matchingClient.focus();
    } else {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

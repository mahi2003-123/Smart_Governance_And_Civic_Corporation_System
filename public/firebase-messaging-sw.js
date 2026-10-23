importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Activate new service worker immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const urlParams = new URLSearchParams(location.search);
let firebaseConfig = null;

try {
  if (urlParams.has('config')) {
    const parsed = JSON.parse(decodeURIComponent(urlParams.get('config')));
    if (parsed && typeof parsed === 'object' && parsed.apiKey) {
      firebaseConfig = parsed;
    }
  }
} catch {
  console.warn('[SW] Failed to parse config from service worker URL');
}

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function (payload) {
      console.log('[SW] Received background message');

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
  } catch {
    console.warn('[SW] Firebase background messaging initialization skipped or failed');
  }
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

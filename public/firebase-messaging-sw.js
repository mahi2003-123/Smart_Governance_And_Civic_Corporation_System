importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const urlParams = new URLSearchParams(location.search);
let firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "sgcs-civic-system.firebaseapp.com",
  projectId: "sgcs-civic-system",
  storageBucket: "sgcs-civic-system.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
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

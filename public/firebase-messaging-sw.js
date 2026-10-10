importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const urlParams = new URLSearchParams(location.search);
let firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "dummy-project.firebaseapp.com",
  projectId: "dummy-project",
  storageBucket: "dummy-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

try {
  if (urlParams.has('config')) {
    firebaseConfig = JSON.parse(decodeURIComponent(urlParams.get('config')));
  }
} catch(e) {
  console.log("Failed to parse config from SW url", e);
}

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function(payload) {
      console.log('Received background message ', payload);
      
      const notificationTitle = payload.data?.title || payload.notification?.title || '🚨 SGCS Urgent Task';
      const notificationOptions = {
        body: payload.data?.body || payload.notification?.body || 'You have an urgent task.',
        icon: '/vite.svg',
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

} catch (e) {
    console.log("Firebase SW init failed", e);
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = new URL(event.notification.data.click_action || '/worker/assigned', self.location.origin).href;

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

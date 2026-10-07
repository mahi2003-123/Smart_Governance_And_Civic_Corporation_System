importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "dummy-project.firebaseapp.com",
  projectId: "dummy-project",
  storageBucket: "dummy-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// We don't inject environment variables into this static file easily without a bundler plugin,
// so for this MCA project, we can just gracefully fail or rely on foreground if configs are missing.
// Alternatively, replace these placeholders before deployment.

try { // Wrap in try-catch in case config is invalid
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function(payload) {
      console.log('Received background message ', payload);
      
      const notificationTitle = payload.notification.title || '🚨 SGCS Urgent Task';
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg', // Default icon
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

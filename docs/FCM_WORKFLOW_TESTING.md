# FCM Workflow Testing & Verification Guide

This guide explains how to test the modernized Firebase Cloud Messaging (FCM) workflow in the SGCS application. Twilio SMS has been completely removed in favor of free, asynchronous, data-only Push Notifications for URGENT jobs.

## 1. Registration Flow

1. **Frontend Authentication**: A field technician logs into the `WorkerDashboard`.
2. **Permission Request**: If it's their first time, or if FCM isn't enabled, the user clicks **Enable Push Notifications**.
3. **Service Worker Init**: The browser securely loads `/firebase-messaging-sw.js`, passing the `firebaseConfig` via URL Query String to ensure dynamic credentials work properly. 
4. **Token Generation**: The browser prompts for permission. Once granted, it contacts Firebase returning a unique FCM registration token.
5. **Backend Binding**: The frontend uses `sgcs_auth_token` in `api.post('/notifications/device-token')` to durably link the FCM token to the logged-in worker in PostgreSQL (`UserDeviceToken` entity).

## 2. Triggering Push Notifications

Push notifications are exclusively generated for **URGENT** priority civic tasks. You can trigger them from the Councillor Dashboard (`ManageComplaints.tsx`) in two ways:

- **Assigning a Worker**: Click **Assign Task**, set priority to `URGENT`, and choose a worker. 
- **Promoting an existing Task**: Locate a non-urgent task in the grid, click the **amber warning icon (Promote to URGENT)**.

### What the Backend Does

- When the `ComplaintService` saves the priority change to PostgreSQL, an `@Async` process is spawned.
- `FirebaseNotificationService.sendUrgentTaskPushNotification` queries the DB for active tokens bound to the assigned worker ID.
- The server contacts the FCM API concurrently.
- Upon completion, the result (e.g. `URGENT PUSH sent`, or `URGENT PUSH failed`) is written persistently into the Complaint's Timeline using `AuditService.logActivity`. 

## 3. Foreground & Background Consumption

Notifications are dispatched as **DATA-ONLY messages**. This avoids standard UI limitations giving us total layout control, and is natively resistant to background throttling.

- **Foreground**: `WorkerDashboard.tsx` uses `onMessageListener`. When an event arrives, a dismissible Material UI `Alert` bar warns the worker synchronously and re-fetches their queue to reflect task mutations immediately.
- **Background / Browser Minimized**: `firebase-messaging-sw.js` catches `onBackgroundMessage`. Using native `self.registration.showNotification`, it spawns a browser-level alert dialog. Clicking the notification focuses the window (if open) or opens a new tab directed at `/worker/tasks`.

## 4. Troubleshooting Checklist

1. **`FATAL: password authentication failed`?** 
   - Ensure the `.env` variables matching local PostgreSQL credentials are set before running `spring-boot:run`. Our `application.properties` does not hardcode them.
2. **Push Token Silent failures?**
   - Verify `VITE_FIREBASE_API_KEY` and the FCM VAPID Key are available to the VITE bundler during local testing.
3. **Invalid Config JSON inside Service Worker?**
   - Inspect the Service Worker registration payload in the Network panel. If quotes are mangled, clear local storage and force unregister the SW (`chrome://serviceworker-internals/`). 
4. **FCM Timeout or Unregistered?**
   - The backend `FirebaseNotificationService` safely intercepts `UNREGISTERED` tokens and flips `isActive = false` silently in PostgreSQL.

With this modern integration, urgent municipal interventions are dispatched successfully and instantaneously.

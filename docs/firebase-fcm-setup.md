# Firebase FCM Push Notification Setup

This guide documents the setup and configuration process for URGENT push notifications using Firebase Cloud Messaging (FCM) in the Smart Governance and Civic Corporation System (SGCS).

## Architecture Overview

When a councillor assigns a task with `URGENT` priority, the following flow occurs:

1. **Councillor Assignment**: The councillor updates a task in the SGCS dashboard, selecting the `URGENT` risk level and assigning it to a specific worker.
2. **Spring Boot Backend**: 
   - Normal SGCS assignment and PostgreSQL updates are made.
   - Initial notification is logged in PostgreSQL `notifications` table.
   - If priority is URGENT, `FirebaseNotificationService` fetches active `UserDeviceToken` entries for the assigned worker.
3. **Firebase Admin SDK (Backend):**
   - The backend constructs an FCM push payload and utilizes the `firebase-admin` SDK to push the notification directly to the FCM endpoints.
4. **FCM Delivery**: FCM delivers the push notification.
5. **Assigned Worker's Device (Frontend):**
   - If in the foreground, `WorkerDashboard.tsx` intercepts the push event and displays an urgent banner.
   - If in the background, the service worker `firebase-messaging-sw.js` constructs the native browser push notification. Clicking it opens the SGCS Worker Dashboard.

## Setup Instructions

### 1. Create a Firebase Project
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Click **Add project** and name it (e.g., `sgcs-mca`).
- Turn off Google Analytics if not required.

### 2. Enable Cloud Messaging and Create a Web App
- Open your Firebase project. Under **Project settings** > **Cloud Messaging**, note the settings.
- Under **General**, click on the Web (`</>`) icon to register a web app.
- Name the app (e.g., `sgcs-web-client`) and register it.
- Copy the provided `firebaseConfig` object.

### 3. Frontend Firebase Configuration
In the React frontend, create an `.env` file (or provide environment variables to your deployment) with the following variables replacing the placeholders you received from Firebase:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

**Note on Service Worker (`public/firebase-messaging-sw.js`):**
If you choose to use background notifications, ensure the Firebase Config variables are also correctly set in `public/firebase-messaging-sw.js`.

### 4. Generate/Configure Firebase Admin Credentials (Backend)
- In the Firebase Console, go to **Project settings** > **Service accounts**.
- Click **Generate new private key**. This will download a JSON file.
- **SECURITY WARNING**: NEVER commit this JSON file to version control.

Configure the backend environment variables in `application.properties` or standard OS environments.

Method 1: Provide absolute path to JSON file
```properties
firebase.admin.credentials.file=/absolute/path/to/firebase-admin.json
```

Method 2 (Recommended for Production): Set the environment variable directly.
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/firebase-admin.json"
```

### 5. Running the Application
1. **Backend**: Provide Firebase configuration and run the Spring Boot app (`mvn clean compile spring-boot:run` or just run through IDE).
2. **Frontend**: Install `firebase` and other dependencies (`npm install`), then start Vite (`npm run dev`).

### 6. User Experience & Testing
1. Login as a **Worker**.
2. If push notifications are not enabled, a banner prompts: "Enable Push Notifications to instantly receive URGENT assigned tasks!". Click **Enable** and allow browser permissions.
3. Login as a **Councillor** on another browser profile or window.
4. Go to **Manage Complaints**, assign a task to the same **Worker**.
5. Crucially, set Priority/Risk Level to **URGENT**. 
6. Confirm Assignment.
7. The worker should receive the Push Notification immediately. Only that assigned worker will receive it.

## Troubleshooting

- **No push notification received?** Verify that the browser notification prompt was allowed. 
- **Firebase Initialization Failed?** Ensure the `VITE_FIREBASE_API_KEY` and other config values in the frontend `.env` matches your Firebase console exactly.
- **Invalid Token / UNREGISTERED:** If FCM responds with `UNREGISTERED`, the token is invalid and the backend will automatically set `is_active=false`. The worker should re-enable notifications via the UI.

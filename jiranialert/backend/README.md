# Jirani Alert Firebase Backend

Firebase backend scaffold for Jirani Alert.

## Setup

1. Create a Firebase project in the Firebase console.
2. Confirm `.firebaserc` points to the Firebase project ID `jiranialert`.
3. Install dependencies:

```bash
npm install
npm --prefix functions install
```

4. Log in and select the project:

```bash
npx firebase login
npx firebase use your-firebase-project-id
```

5. Run locally:

```bash
npm run emulators
```

For local frontend development, start the backend emulator first, then run the frontend dev server so `/api` requests can reach the emulator on `127.0.0.1:5005`.

On this Windows machine, you can also use the helper script that adds the installed Java runtime to PATH before starting Firebase:

```powershell
.\start-emulators.ps1
```

6. Deploy:

```bash
npm run deploy
```

### Firestore indexes
If you add or update composite indexes, deploy them with:

```bash
npx firebase deploy --only firestore:indexes
```

Or deploy both functions and indexes together:

```bash
npx firebase deploy --only functions,firestore:indexes
```

## Functions

- `health`: checks that the backend is running.
- `createEmergencyReport`: creates a report, alert, and reporter notification.
- `listEmergencyReports`: returns reports for a user, or all reports for responders/admins.
- `listNotifications`: returns notifications for a user.
- `markNotificationRead`: marks a notification as read.

## Frontend proxy

The frontend uses the same `/api` base in local development and on Vercel. In development, Vite proxies `/api` to the Functions emulator at `http://127.0.0.1:5005/jiranialert/us-central1`. In production, Vercel rewrites `/api/*` to the deployed Cloud Functions backend.

Requests should include a Firebase Auth ID token:

```http
Authorization: Bearer <firebase-id-token>
```

## Verification email delivery

The signup and resend verification flows use the backend SMTP configuration in `functions/.env`. To send branded verification emails instead of Firebase's default mail, configure either Gmail App Password settings or another SMTP provider and restart the backend emulator.

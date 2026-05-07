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

On this Windows machine, you can also use the helper script that adds the installed Java runtime to PATH before starting Firebase:

```powershell
.\start-emulators.ps1
```

6. Deploy:

```bash
npm run deploy
```

## Functions

- `health`: checks that the backend is running.
- `createEmergencyReport`: creates a report, alert, and reporter notification.
- `listEmergencyReports`: returns reports for a user, or all reports for responders/admins.
- `listNotifications`: returns notifications for a user.
- `markNotificationRead`: marks a notification as read.

Requests should include a Firebase Auth ID token:

```http
Authorization: Bearer <firebase-id-token>
```

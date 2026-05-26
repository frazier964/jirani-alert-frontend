# Backend Setup Guide

## Prerequisites

- Node.js installed
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud Account with Firebase project set up

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Initialize Firebase (if not already done)

```bash
firebase init
```

Select:
- **Firestore**: Yes (Database)
- **Functions**: Yes (Cloud Functions)
- **Emulators**: Yes (for local development)

### 3. Start Firebase Emulators

```bash
firebase emulators:start
```

Or use the PowerShell script:
```bash
.\start-emulators.ps1
```

**Default URLs:**
- Firestore Emulator: http://localhost:8181
- Functions Emulator: http://localhost:5002
- Emulator UI: http://localhost:4021

Local development for Jirani Alert uses the Functions emulator on port 5004 behind the frontend `/api` proxy. The emulator output may still mention a host port from the Firebase runtime, but the frontend should call the local app through `http://localhost:5173/api` during development.

### 4. Seed Demo Data (Optional)

If you want to populate initial community posts:

Create a `seed-data.js` file in the `functions/` directory and run it locally:

```bash
node seed-data.js
```

Or manually create posts via the Emulator UI at http://localhost:4000

### 5. Verify Backend is Running

Check the health endpoint:
```bash
curl http://127.0.0.1:5004/jiranialert/us-central1/health
```

Expected response:
```json
{
  "ok": true,
  "service": "jiranialert-firebase-backend",
  "timestamp": "2026-05-16T10:30:00.000Z"
}
```

## Frontend Configuration

The frontend is configured to use:
```
/api
```

### Environment Variables

Frontend Vite env (`.env.local`):
```
VITE_BACKEND_URL=/api
VITE_FUNCTIONS_BASE=/api
```

If not set, it defaults to the above.

For local development, Vite proxies `/api` to the emulator at `http://127.0.0.1:5004/jiranialert/us-central1`, so the browser and production deploy both use the same request path.

### Signup Confirmation Email

The signup flow creates the Firebase Auth account, saves a real Firestore profile through the backend, and sends a welcome confirmation email when SMTP is configured.

Create `backend/functions/.env` from `backend/functions/.env.example`:

```
APP_URL=https://jirani-alert-frontend.vercel.app
MAIL_FROM="Jirani Alert <officialmablaryyvisuals@gmail.com>"
GMAIL_USER=officialmablaryyvisuals@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

For Gmail, use a Google App Password, not your normal Gmail password.
A valid Gmail app password is 16 characters long and contains no spaces.
If the value in your `.env` file has spaces, remove them before restarting the emulator.

You can verify SMTP email delivery with a dedicated test endpoint.
Set `EMAIL_TEST_SECRET` to a secret string in `backend/functions/.env` and then POST to:

```bash
http://127.0.0.1:5004/jiranialert/us-central1/sendTestEmail?secret=your-secret
```

Request body example:
```json
{
  "to": "mabwogahillary@gmail.com",
  "subject": "Jirani Alert Test Email",
  "message": "This is a test email from the Jirani Alert backend."
}
```

> Note: local Firebase emulators use separate auth and Firestore data from your live project.
> If you want your local app to sign in with users from the deployed Firebase console,
> set `VITE_USE_FIREBASE_EMULATORS=false` in `frontend/.env.local` and point
> `VITE_BACKEND_URL` / `VITE_FUNCTIONS_BASE` to the deployed proxy target.
>
> For automatic emulator detection during local development, use:
> `VITE_USE_FIREBASE_EMULATORS=auto`

### Local startup order

Start the backend first, then the frontend:

```bash
cd backend
npm run dev
```

In a second terminal:

```bash
cd frontend
npm run dev
```

If the frontend starts before the backend emulator is listening, `/api` requests will fail with connection refused.

### Start the backend emulators
Run from the `backend` directory so Firebase finds `firebase.json` correctly:

```bash
cd backend
npm run emulators
```

If a previous emulator instance is still running, stop it first. Then refresh the frontend.

## API Endpoints

All endpoints require Firebase ID Token in `Authorization: Bearer {token}` header.

### POST /createUserProfile
Create or merge the authenticated user's profile after Firebase Auth signup, assign the selected role, create an account notification, and send a signup confirmation email when mail env vars are configured.

**Body:**
```json
{
  "displayName": "Resident Name",
  "role": "resident"
}
```

**Response:**
```json
{
  "ok": true,
  "profile": {
    "uid": "firebase-user-id",
    "email": "resident@example.com",
    "displayName": "Resident Name",
    "role": "resident",
    "accountStatus": "active"
  },
  "confirmationEmail": {
    "sent": true
  }
}
```

### GET /getCommunityFeed
Get all community posts with interaction counts.

**Query Params:**
- `limit` (optional): Max posts to return (default: 50, max: 100)

**Response:**
```json
{
  "posts": [
    {
      "id": "1",
      "name": "User Name",
      "post": "Post text",
      "likeCount": 5,
      "commentCount": 2,
      "shareCount": 1,
      "userLiked": false,
      "createdAt": "2026-05-16T10:00:00Z"
    }
  ]
}
```

### POST /toggleLikePost
Toggle like on a post.

**Body:**
```json
{
  "postId": "1"
}
```

**Response:**
```json
{
  "ok": true,
  "postId": "1",
  "liked": true,
  "likeCount": 5
}
```

### POST /commentOnPost
Add a comment to a post.

**Body:**
```json
{
  "postId": "1",
  "text": "Great initiative!"
}
```

**Response:**
```json
{
  "ok": true,
  "postId": "1",
  "commentId": "abc123",
  "commentCount": 3
}
```

### POST /sharePost
Track a share action on a post.

**Body:**
```json
{
  "postId": "1"
}
```

**Response:**
```json
{
  "ok": true,
  "postId": "1",
  "shareCount": 2
}
```

## Troubleshooting

### Backend Connection Issues

1. **Check if emulator is running:**
   ```bash
   curl http://localhost:5002/jiranialert/us-central1/health
   ```

2. **Check CORS settings:** The backend allows:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`

3. **Check Authorization header:** All requests must include valid Firebase ID token

4. **Clear browser cache:** localStorage might cache old data
   ```javascript
   localStorage.clear()
   ```

### Likes/Comments Not Persisting

- Ensure backend emulator is running
- Check browser console for authentication errors
- Verify Firestore collections are being created:
  - `communityPosts` collection
  - `communityPosts/{postId}/likes` subcollection
  - `communityPosts/{postId}/comments` subcollection

### Anonymous Authentication

Frontend automatically signs in anonymously if no user is logged in. This allows:
- Likes to work without explicit login
- Local queueing of likes while offline
- Automatic sync when connection restored

## Deployment

To deploy to production:

```bash
firebase deploy --only functions
```

Ensure:
- Valid Firebase project credentials
- Firestore security rules are configured
- Production database is set up in Firebase Console
- CORS origins include your production domain

## Database Schema

### communityPosts
```
{
  id: string,
  name: string,
  email: string,
  post: string,
  createdAt: timestamp
}
```

### communityPosts/{postId}/likes
```
{
  userId: string,
  createdAt: timestamp
}
```

### communityPosts/{postId}/comments
```
{
  userId: string,
  text: string,
  createdAt: timestamp
}
```

### communityPosts/{postId}/shares
```
{
  userId: string,
  createdAt: timestamp
}
```

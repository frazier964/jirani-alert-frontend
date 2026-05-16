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
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
- Emulator UI: http://localhost:4000

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
curl http://localhost:5001/jiranialert/us-central1/health
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
http://localhost:5001/jiranialert/us-central1
```

### Environment Variables

Frontend Vite env (`.env.local`):
```
VITE_BACKEND_URL=http://localhost:5001/jiranialert/us-central1
```

If not set, it defaults to the above.

## API Endpoints

All endpoints require Firebase ID Token in `Authorization: Bearer {token}` header.

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
   curl http://localhost:5001/jiranialert/us-central1/health
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

import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== '')

let app = null
if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig)
  } catch (e) {
    // initialization failed (possibly already initialized) — log and continue with nulls
    // avoid throwing so the app UI can still function without Firebase configured
    // eslint-disable-next-line no-console
    console.warn('Firebase initialization failed:', e?.message || e)
    app = null
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('Firebase not configured: VITE_FIREBASE_API_KEY missing. Firebase features disabled.')
}

const auth = app ? getAuth(app) : null
const storage = app ? getStorage(app) : null
const firestore = app ? getFirestore(app) : null

async function ensureAnonymous() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  try {
    const cred = await signInAnonymously(auth)
    return cred.user
  } catch (e) {
    return null
  }
}

export { app, auth, storage, firestore, storageRef, uploadBytesResumable, getDownloadURL, ensureAnonymous }

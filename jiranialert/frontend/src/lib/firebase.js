import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyD1mpP_omm9poTSwMWJq5oyBrPcSYHSYr8',
  authDomain: 'jiranialert.firebaseapp.com',
  projectId: 'jiranialert',
  storageBucket: 'jiranialert.firebasestorage.app',
  messagingSenderId: '232389120138',
  appId: '1:232389120138:web:b2b70087a13ad3413c9d73',
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
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
const prodApp = hasFirebaseConfig ? getApps().find((instance) => instance.name === 'prod') || initializeApp(firebaseConfig, 'prod') : null
const prodAuth = prodApp ? getAuth(prodApp) : null
const storage = app ? getStorage(app) : null
const firestore = app ? getFirestore(app) : null

const emulatorMode = String(import.meta.env.VITE_USE_FIREBASE_EMULATORS || '').trim().toLowerCase()
const useEmulatorsFlag = emulatorMode === 'true' || emulatorMode === 'auto' || emulatorMode === ''
const shouldUseEmulators = import.meta.env.DEV && useEmulatorsFlag
const shouldUseAuthEmulator = import.meta.env.DEV && emulatorMode === 'true'
const shouldUseFirestoreEmulator = import.meta.env.DEV && useEmulatorsFlag
let emulatorsConnected = false

async function isEmulatorAvailable(host, port, path = '/') {
  try {
    const response = await fetch(`http://${host}:${port}${path}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
    })
    return response.ok || response.status === 404 || response.status === 401
  } catch {
    return false
  }
}

async function connectEmulatorsIfAvailable() {
  if (!app || !shouldUseEmulators) return false

  const tryConnect = async () => {
    const authAvailable = await isEmulatorAvailable('127.0.0.1', 9099, '/')
    const firestoreAvailable = await isEmulatorAvailable('127.0.0.1', 9001, '/')
    const functionsAvailable = await isEmulatorAvailable('127.0.0.1', 5005, '/')
    return authAvailable && firestoreAvailable && functionsAvailable
  }

  const available = shouldUseEmulators ? true : (emulatorMode === 'true' ? true : await tryConnect())
  if (!available) {
    console.warn('Firebase emulators not available, using production Firebase services instead.')
    return false
  }

  try {
    if (auth && shouldUseAuthEmulator) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    }
    if (firestore && shouldUseFirestoreEmulator) {
      connectFirestoreEmulator(firestore, '127.0.0.1', 9001)
    }
    emulatorsConnected = true
    console.info(
      `Firebase emulators connected for ${shouldUseAuthEmulator ? 'auth and ' : ''}${shouldUseFirestoreEmulator ? 'firestore' : 'firebase'}`,
    )
    return true
  } catch (e) {
    if (e?.code === 'auth/emulator-config-failed') {
      console.warn('Firebase auth emulator config failed; falling back to production Firebase services.', e)
    } else {
      console.warn('Firebase emulator connection failed:', e)
    }
    return false
  }
}

const firebaseReadyPromise = (async () => {
  try {
    await connectEmulatorsIfAvailable()
  } catch (e) {
    console.warn('Firebase emulator readiness check failed:', e)
  }

  if (auth) {
    try {
      await setPersistence(auth, browserLocalPersistence)
    } catch (e) {
      console.warn('Firebase auth persistence failed:', e)
    }
  }

  return emulatorsConnected
})()

export async function waitForFirebaseReady() {
  await firebaseReadyPromise
  return emulatorsConnected
}

if (app) {
  firebaseReadyPromise.catch(() => null)
}

export { prodAuth }

async function ensureAnonymous() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  if (!shouldUseAuthEmulator) return null
  try {
    const cred = await signInAnonymously(auth)
    return cred.user
  } catch (e) {
    return null
  }
}

export { app, auth, storage, firestore, storageRef, uploadBytesResumable, getDownloadURL, ensureAnonymous }

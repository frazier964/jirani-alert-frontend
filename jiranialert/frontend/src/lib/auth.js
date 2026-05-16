import { auth, firestore } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const CURRENT_KEY = 'jiranialert_current'

function setCurrentUserLocal(userObj) {
  if (!userObj) localStorage.removeItem(CURRENT_KEY)
  else localStorage.setItem(CURRENT_KEY, JSON.stringify(userObj))
}

function emitProfileUpdated(profile) {
  try {
    if (typeof window !== 'undefined' && window?.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('jiranialert_profile_updated', { detail: profile }))
    }
  } catch (e) {
    // ignore
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null')
  } catch (e) {
    return null
  }
}

export async function registerUser({ email, password, role = 'resident', displayName = '' }) {
  if (!auth) throw new Error('Firebase not configured')
  let cred
  try {
    cred = await createUserWithEmailAndPassword(auth, email, password)
  } catch (e) {
    const code = e?.code || 'auth/unknown'
    const message = e?.message || String(e)
    const err = new Error(`${code}: ${message}`)
    err.original = e
    // log original Firebase error for debugging in dev only
    try {
      if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true') {
        // eslint-disable-next-line no-console
        console.error('Firebase registerUser error:', e)
        // also log identity toolkit token/server response when available
        // eslint-disable-next-line no-console
        console.error('tokenResponse:', e?._tokenResponse || e?.customData || null)
      }
    } catch (logErr) {
      // ignore logging failures
    }
    throw err
  }
  const user = cred.user

  // create profile doc
  if (firestore) {
    await setDoc(doc(firestore, 'profiles', user.uid), {
      displayName: displayName || '',
      role,
      createdAt: serverTimestamp(),
    })
  }

  const profile = { id: user.uid, email: user.email, displayName: displayName || '', profileImageUrl: '' }
  setCurrentUserLocal(profile)
  emitProfileUpdated(profile)
  return profile
}

export async function loginUser({ email, password }) {
  if (!auth) throw new Error('Firebase not configured')
  let cred
  try {
    cred = await signInWithEmailAndPassword(auth, email, password)
  } catch (e) {
    const code = e?.code || 'auth/unknown'
    const message = e?.message || String(e)
    const err = new Error(`${code}: ${message}`)
    err.original = e
    // log original Firebase error for debugging in dev only
    try {
      if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true') {
        // eslint-disable-next-line no-console
        console.error('Firebase loginUser error:', e)
        // eslint-disable-next-line no-console
        console.error('tokenResponse:', e?._tokenResponse || e?.customData || null)
      }
    } catch (logErr) {
      // ignore logging failures
    }
    throw err
  }
  const user = cred.user

  // fetch profile
  let profile = { id: user.uid, email: user.email }
  try {
    if (firestore) {
      const snap = await getDoc(doc(firestore, 'profiles', user.uid))
      if (snap.exists()) profile = { id: user.uid, email: user.email, ...(snap.data() || {}) }
    }
  } catch (e) {
    // ignore
  }

  setCurrentUserLocal(profile)
  emitProfileUpdated(profile)

  return profile
}

export async function logout() {
  try {
    if (auth) await fbSignOut(auth)
  } catch (e) {
    // ignore
  }
  setCurrentUserLocal(null)
  emitProfileUpdated(null)
}

export async function updateCurrentUserProfile(updates) {
  const current = auth && auth.currentUser
  if (!current) throw new Error('Not authenticated')
  const uid = current.uid
  if (firestore) {
    await updateDoc(doc(firestore, 'profiles', uid), { ...updates, updatedAt: serverTimestamp() })
    const snap = await getDoc(doc(firestore, 'profiles', uid))
    const profile = snap.exists() ? { id: uid, ...(snap.data() || {}) } : { id: uid }
    setCurrentUserLocal(profile)
    emitProfileUpdated(profile)
    return profile
  }
  // fallback: update local cache
  const local = getCurrentUser() || { id: uid }
  const merged = { ...local, ...updates }
  setCurrentUserLocal(merged)
  return merged
}

export function initAuthListener() {
  if (!auth) return
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setCurrentUserLocal(null)
      emitProfileUpdated(null)
      return
    }
    // load profile
    try {
      if (firestore) {
        const snap = await getDoc(doc(firestore, 'profiles', user.uid))
        const profile = snap.exists() ? { id: user.uid, email: user.email, ...(snap.data() || {}) } : { id: user.uid, email: user.email }
        setCurrentUserLocal(profile)
        emitProfileUpdated(profile)
      } else {
        setCurrentUserLocal({ id: user.uid, email: user.email })
        emitProfileUpdated({ id: user.uid, email: user.email })
      }
    } catch (e) {
      setCurrentUserLocal({ id: user.uid, email: user.email })
      emitProfileUpdated({ id: user.uid, email: user.email })
    }
  })
}

export default { registerUser, loginUser, logout, getCurrentUser, updateCurrentUserProfile, initAuthListener }

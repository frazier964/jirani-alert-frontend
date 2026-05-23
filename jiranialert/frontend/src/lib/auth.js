import { auth, firestore, ensureAnonymous, waitForFirebaseReady } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const CURRENT_KEY = 'jiranialert_current'
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? 'http://localhost:5002/jiranialert/us-central1' : 'https://us-central1-jiranialert.cloudfunctions.net')

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

async function waitForAuthReady() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser

  await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe()
      resolve()
    })
  })

  return auth.currentUser
}

async function sendVerificationEmailToUser(user) {
  if (!auth || !user || !user.email) {
    return { sent: false, reason: 'No authenticated user available' }
  }

  try {
    await sendEmailVerification(user)
    return { sent: true }
  } catch (e) {
    return { sent: false, reason: e?.message || 'Unable to send verification email' }
  }
}

export async function resendVerificationEmail() {
  if (!auth) throw new Error('Firebase not configured')
  await waitForFirebaseReady()
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in before requesting a new verification email.')
  return sendVerificationEmailToUser(user)
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
  await waitForFirebaseReady()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '')

  let cred
  try {
    cred = await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword)
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

  let savedProfile = null
  let verificationEmail = { sent: false, reason: 'Email not configured' }
  if (BACKEND_URL) {
    try {
      const token = await user.getIdToken()
      const res = await fetch(`${BACKEND_URL}/createUserProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: displayName || '',
          role,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Backend profile creation failed')
      }
      savedProfile = data?.profile || null
      verificationEmail = data?.verificationEmail || verificationEmail
    } catch (e) {
      // In local development the functions emulator may not be running.
      // Fall back to direct Firestore so the account still has a durable profile.
      if (!firestore) throw e
    }
  }

  // create profile doc fallback
  if (firestore) {
    await setDoc(
      doc(firestore, 'profiles', user.uid),
      {
        uid: user.uid,
        email: user.email,
        displayName: displayName || '',
        role,
        accountStatus: 'pending_verification',
        emailVerified: Boolean(user.emailVerified),
        authProvider: 'password',
        profileImageUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  if (!verificationEmail.sent) {
    const fallback = await sendVerificationEmailToUser(user)
    verificationEmail = fallback.sent
      ? { sent: true }
      : { sent: false, reason: verificationEmail.reason || fallback.reason }
  }

  const profile = savedProfile
    ? { id: user.uid, email: user.email, ...(savedProfile || {}) }
    : { id: user.uid, uid: user.uid, email: user.email, displayName: displayName || '', role, profileImageUrl: '', accountStatus: 'pending_verification' }

  setCurrentUserLocal(profile)
  emitProfileUpdated(profile)
  return { ...profile, verificationEmail }
}

export async function loginUser({ email, password }) {
  if (!auth) throw new Error('Firebase not configured')
  await waitForFirebaseReady()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '')
  let cred
  try {
    cred = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword)
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

  try {
    await user.reload()
  } catch (e) {
    // ignore reload failures, continue with the latest available state
  }

  if (!user.emailVerified) {
    throw new Error('auth/email-not-verified: Please verify your email before signing in.')
  }

  // fetch persisted profile from backend first, then fallback to Firestore
  let profile = { id: user.uid, email: user.email }
  try {
    if (BACKEND_URL) {
      const token = await user.getIdToken()
      const res = await fetch(
        `${BACKEND_URL}/getUserProfile/${encodeURIComponent(user.uid)}?userId=${encodeURIComponent(user.uid)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.profile) {
        profile = { id: user.uid, email: user.email, ...(data.profile || {}) }
      }

      if (profile.emailVerified === false) {
        await fetch(`${BACKEND_URL}/updateUserProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emailVerified: true, accountStatus: 'active' }),
        })
      }
    }
  } catch (e) {
    // ignore backend profile fetch failure and fallback to Firestore
  }

  if (profile.id === user.uid && profile.email === user.email && firestore) {
    try {
      const snap = await getDoc(doc(firestore, 'profiles', user.uid))
      if (snap.exists()) profile = { id: user.uid, email: user.email, ...(snap.data() || {}) }
    } catch (e) {
      // ignore
    }
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
  await waitForAuthReady()

  if (auth && !auth.currentUser) {
    try {
      await ensureAnonymous()
    } catch (e) {
      // ignore
    }
  }

  const current = auth && auth.currentUser
  if (!current) throw new Error('Not authenticated')
  const uid = current.uid

  // Prefer saving via backend functions when available so server becomes source of truth.
  if (BACKEND_URL) {
    try {
      const token = await current.getIdToken()
      const res = await fetch(`${BACKEND_URL}/updateUserProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates || {}),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Backend error')
      }
      const profile = data?.profile ? { id: uid, email: current.email, ...(data.profile || {}) } : { id: uid, email: current.email }
      setCurrentUserLocal(profile)
      emitProfileUpdated(profile)
      return profile
    } catch (e) {
      // If backend is unavailable in dev, fall back to direct Firestore update.
      // This still persists data and keeps the UI consistent.
      if (!firestore) throw e
    }
  }

  if (firestore) {
    await setDoc(doc(firestore, 'profiles', uid), { ...updates, updatedAt: serverTimestamp() }, { merge: true })
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
    await waitForFirebaseReady()

    if (!user) {
      // Don't clear cached profile here.
      // On initial page load, Firebase auth can briefly report null before
      // restoring the session; clearing would wipe the UI on refresh.
      // Explicit logout() already clears local state.
      try {
        await ensureAnonymous()
      } catch (e) {
        // ignore
      }
      return
    }

    // Load profile from backend when available; fallback to Firestore; then to auth info.
    if (BACKEND_URL) {
      try {
        const token = await user.getIdToken()
        const res = await fetch(
          `${BACKEND_URL}/getUserProfile/${encodeURIComponent(user.uid)}?userId=${encodeURIComponent(user.uid)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          const backendProfile = data?.profile || null
          const profile = backendProfile
            ? { id: user.uid, email: user.email, ...(backendProfile || {}) }
            : { id: user.uid, email: user.email }
          setCurrentUserLocal(profile)
          emitProfileUpdated(profile)
          return
        }
      } catch (e) {
        // ignore and fallback
      }
    }

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

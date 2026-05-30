import { auth, prodAuth, firestore, ensureAnonymous, waitForFirebaseReady } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth'
import { doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, collection } from 'firebase/firestore'
import { getFunctionsBaseUrl } from './backendBase'

const CURRENT_KEY = 'jiranialert_current'
const ROLE_CACHE_KEY = 'jiranialert_role_cache'
const BACKEND_URL = getFunctionsBaseUrl()
const VALID_ACCOUNT_ROLES = new Set(['resident', 'responder', 'admin'])
let backendAvailabilityPromise = null

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

export function cacheCurrentUserProfile(profile) {
  setCurrentUserLocal(profile)
  emitProfileUpdated(profile)
  return profile
}

function getRoleCache() {
  try {
    return JSON.parse(localStorage.getItem(ROLE_CACHE_KEY) || '{}') || {}
  } catch (e) {
    return {}
  }
}

function setCachedRoleForEmail(email, role) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedRole = normalizeAccountRole(role)
  if (!normalizedEmail || !normalizedRole) return

  try {
    const roleCache = getRoleCache()
    roleCache[normalizedEmail] = normalizedRole
    localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(roleCache))
  } catch (e) {
    // ignore cache write failures
  }
}

function getCachedRoleForEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) return null

  try {
    return normalizeAccountRole(getRoleCache()[normalizedEmail])
  } catch (e) {
    return null
  }
}

async function waitForAuthReady() {
  if (!auth && !prodAuth) return null
  if (auth?.currentUser) return auth.currentUser
  if (prodAuth?.currentUser) return prodAuth.currentUser

  await new Promise((resolve) => {
    let resolved = false
    const tryResolve = () => {
      if (resolved) return
      if (auth?.currentUser || prodAuth?.currentUser) {
        resolved = true
        unsubscribeAuth?.()
        unsubscribeProd?.()
        resolve()
      }
    }

    const unsubscribeAuth = auth
      ? onAuthStateChanged(auth, () => {
          tryResolve()
        })
      : null
    const unsubscribeProd = prodAuth
      ? onAuthStateChanged(prodAuth, () => {
          tryResolve()
        })
      : null
    // fallback if neither auth provider updates quickly
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        unsubscribeAuth?.()
        unsubscribeProd?.()
        resolve()
      }
    }, 2000)
  })

  return auth?.currentUser || prodAuth?.currentUser || null
}

export function getActiveUser() {
  return auth?.currentUser || prodAuth?.currentUser || null
}

export function getActiveAuth() {
  if (auth?.currentUser) return auth
  if (prodAuth?.currentUser) return prodAuth
  return auth || prodAuth
}

function isAccountDeactivated(profile) {
  return String(profile?.accountStatus || '').toLowerCase() === 'deactivated'
}

export async function isBackendAvailable() {
  if (!BACKEND_URL) return false
  if (backendAvailabilityPromise) return backendAvailabilityPromise

  backendAvailabilityPromise = (async () => {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null
      try {
        const response = await fetch(`${BACKEND_URL}/health`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller?.signal,
        })
        if (response.ok) {
          return true
        }
        backendAvailabilityPromise = null
        return false
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
      }
    } catch {
      backendAvailabilityPromise = null
      return false
    }
  })()

  return backendAvailabilityPromise
}

export function normalizeAccountRole(role) {
  const normalized = String(role || '').trim().toLowerCase()
  return VALID_ACCOUNT_ROLES.has(normalized) ? normalized : null
}

export function resolveAccountRole(profile) {
  return normalizeAccountRole(profile?.role) || normalizeAccountRole(profile?.accountType)
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

export async function resendVerificationEmail(email) {
  if (!auth) throw new Error('Firebase not configured')
  const usingEmulators = await waitForFirebaseReady()

  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Please enter the email address used for signup.')
  }

  let verificationEmail = { sent: false, reason: 'Unable to send verification email' }
  if (BACKEND_URL) {
    try {
      const res = await fetch(`${BACKEND_URL}/resendVerificationEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Backend resend failed')
      }
      verificationEmail = {
        sent: true,
        reason: data?.result?.messageId ? 'Email sent via backend' : 'Email sent'
      }
      if (data?.result?.verificationLink) {
        verificationEmail.verificationLink = data.result.verificationLink
      }
    } catch (e) {
      verificationEmail = { sent: false, reason: e?.message || 'Backend resend failed' }
    }
  }

  const currentUser = auth?.currentUser || prodAuth?.currentUser || null
  if (!verificationEmail.sent && currentUser?.email && String(currentUser.email).trim().toLowerCase() === normalizedEmail) {
    const fallback = await sendVerificationEmailToUser(currentUser)
    verificationEmail = fallback.sent
      ? { sent: true, reason: 'Email sent via Firebase auth fallback' }
      : { sent: false, reason: verificationEmail.reason || fallback.reason }
  }

  return verificationEmail
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
  const usingEmulators = await waitForFirebaseReady()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '')
  let createdUser = null

  if (usingEmulators && prodAuth) {
    try {
      const methods = await fetchSignInMethodsForEmail(prodAuth, normalizedEmail)
      if (Array.isArray(methods) && methods.length > 0) {
        const err = new Error('auth/email-already-in-use: This email is already registered with production Firebase. Please log in instead.')
        err.code = 'auth/email-already-in-use'
        throw err
      }
    } catch (prodCheckError) {
      // Ignore production lookup failures and continue with emulator registration.
      // We do not want a temporary network issue to block signup.
    }
  }

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
        // eslint-disable-next-line no-console
        console.error('tokenResponse:', e?._tokenResponse || e?.customData || null)
      }
    } catch (logErr) {
      // ignore logging failures
    }
    throw err
  }
  const user = cred.user
  createdUser = user

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
      if (verificationEmail.sent) {
        verificationEmail.source = 'backend'
      }
      if (data?.verificationLink && !verificationEmail.verificationLink) {
        verificationEmail.verificationLink = data.verificationLink
      }
    } catch (e) {
      const errorMessage = e?.message || 'Backend profile creation failed'
      verificationEmail = { sent: false, reason: errorMessage, source: 'backend' }
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
      ? { sent: true, source: 'firebase' }
      : { sent: false, reason: verificationEmail.reason || fallback.reason, source: 'firebase' }
  }

  const profile = savedProfile
    ? { id: user.uid, email: user.email, ...(savedProfile || {}) }
    : { id: user.uid, uid: user.uid, email: user.email, displayName: displayName || '', role, profileImageUrl: '', accountStatus: 'pending_verification' }

  setCachedRoleForEmail(user.email, profile.role || role)

  setCurrentUserLocal(profile)
  emitProfileUpdated(profile)

  try {
    return { ...profile, verificationEmail }
  } finally {
    if (auth?.currentUser?.uid === createdUser?.uid) {
      try {
        await fbSignOut(auth)
      } catch (e) {
        // ignore sign out errors; the account was still created and persisted
      }
    }
  }
}

export async function loginUser({ email, password }) {
  if (!auth) throw new Error('Firebase not configured')
  await waitForFirebaseReady()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '')
  let cred
  let authError = null
  let authSource = 'emulator'
  try {
    cred = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword)
  } catch (e) {
    authError = e
    if (prodAuth) {
      try {
        cred = await signInWithEmailAndPassword(prodAuth, normalizedEmail, normalizedPassword)
        authSource = 'production'
      } catch (prodError) {
        authError = prodError
      }
    }
  }

  if (!cred) {
    const code = authError?.code || 'auth/unknown'
    const message = authError?.message || String(authError)
    const err = new Error(`${code}: ${message}`)
    err.original = authError
    try {
      if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true') {
        // eslint-disable-next-line no-console
        console.error('Firebase loginUser error:', authError)
        // eslint-disable-next-line no-console
        console.error('tokenResponse:', authError?._tokenResponse || authError?.customData || null)
      }
    } catch (logErr) {
      // ignore logging failures
    }
    throw err
  }
  let user = cred.user

  try {
    await user.reload()
  } catch (e) {
    // ignore reload failures, continue with the latest available state
  }

  if (!user.emailVerified && authSource === 'emulator' && prodAuth) {
    try {
      const prodCred = await signInWithEmailAndPassword(prodAuth, normalizedEmail, normalizedPassword)
      const prodUser = prodCred.user
      await prodUser.reload()
      if (prodUser.emailVerified) {
        authSource = 'production'
        user = prodUser
      }
    } catch (prodError) {
      // ignore production fallback failures here, normal verification flow remains
    }
  }

  if (!user.emailVerified) {
    throw new Error('auth/email-not-verified: Please verify your email before signing in.')
  }

  // fetch persisted profile from backend first, then fallback to Firestore
  let profile = { id: user.uid, email: user.email }
  let loadedFromBackend = false
  let backendSourceUrl = null
  let tokenRole = null
  let backendFetchError = null
  const backendOnline = await isBackendAvailable()
  const backendCandidates = [BACKEND_URL]
  try {
    const tokenResult = await user.getIdTokenResult(true).catch(() => null)
    tokenRole = normalizeAccountRole(tokenResult?.claims?.role)
    const token = await user.getIdToken()
    for (const candidateUrl of backendCandidates) {
      if (!candidateUrl) continue
      try {
        const res = await fetch(
          `${candidateUrl}/getUserProfile/${encodeURIComponent(user.uid)}?userId=${encodeURIComponent(user.uid)}`,
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
          loadedFromBackend = true
          backendSourceUrl = candidateUrl
          break
        }
      } catch (e) {
        // try the next backend candidate
      }
    }

    if (loadedFromBackend && isAccountDeactivated(profile)) {
      await fbSignOut(auth)
      throw new Error('auth/account-deactivated: This account has been deactivated. Please contact support.')
    }

    if (loadedFromBackend && profile.emailVerified === false && backendSourceUrl) {
      try {
        await fetch(`${backendSourceUrl}/updateUserProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emailVerified: true, accountStatus: 'active' }),
        })
      } catch (e) {
        // ignore repair failures
      }
    }
  } catch (e) {
    backendFetchError = e
    // ignore backend profile fetch failure and fallback to Firestore
  }

  const cachedProfile = getCurrentUser()
  const cachedRole = normalizeAccountRole(cachedProfile?.role)
  const cachedEmailRole = getCachedRoleForEmail(user.email)

  if ((!loadedFromBackend || !normalizeAccountRole(profile.role)) && profile.id === user.uid && profile.email === user.email && firestore) {
    try {
      const snap = await getDoc(doc(firestore, 'profiles', user.uid))
      if (snap.exists()) {
        const firestoreProfile = { id: user.uid, email: user.email, ...(snap.data() || {}) }
        profile = { ...profile, ...firestoreProfile }
      }
    } catch (e) {
      // ignore
    }
  }

  if (!normalizeAccountRole(profile.role) && firestore && user.email) {
    try {
      const emailQuery = query(collection(firestore, 'profiles'), where('email', '==', user.email))
      const querySnap = await getDocs(emailQuery)
      const matchingDoc = querySnap.docs.find((docSnap) => normalizeAccountRole(docSnap.data()?.role) || docSnap.data()?.accountType)
      if (matchingDoc) {
        const recoveredProfile = { id: user.uid, email: user.email, ...(matchingDoc.data() || {}) }
        profile = { ...profile, ...recoveredProfile }
      }
    } catch (e) {
      // ignore email query fallback failures
    }
  }

  if (!normalizeAccountRole(profile.role)) {
    const fallbackRole = cachedRole || cachedEmailRole || resolveAccountRole(profile)
    if (fallbackRole && (!profile.email || profile.email === user.email)) {
      profile = {
        ...profile,
        ...cachedProfile,
        id: user.uid,
        email: user.email,
        role: fallbackRole,
      }
    }
  }

  const resolvedProfileRole = resolveAccountRole(profile)

  if (!resolvedProfileRole) {
    const resolvedRole = tokenRole || normalizeAccountRole(user?.role) || normalizeAccountRole(profile.role) || normalizeAccountRole(profile.accountType)
    if (!resolvedRole) {
      throw backendFetchError || new Error('auth/role-missing: Your account type is missing. Please sign up again or contact support.')
    }
    profile.role = resolvedRole
  } else {
    profile.role = resolvedProfileRole
  }

  if (profile.id === user.uid && profile.email === user.email && profile.role && backendOnline && backendSourceUrl === BACKEND_URL) {
    try {
      await updateCurrentUserProfile({
        displayName: profile.displayName || cachedProfile?.displayName || user.displayName || '',
        role: profile.role,
        emailVerified: Boolean(user.emailVerified),
        accountStatus: isAccountDeactivated(profile) ? 'deactivated' : 'active',
      })
    } catch (e) {
      // ignore repair failures; the local session still has a resolved role
    }
  }

  setCurrentUserLocal(profile)
  emitProfileUpdated(profile)

  if (isAccountDeactivated(profile)) {
    try {
      await fbSignOut(auth)
    } catch (e) {
      // ignore
    }
    setCurrentUserLocal(null)
    emitProfileUpdated(null)
    throw new Error('auth/account-deactivated: This account has been deactivated. Please contact support.')
  }

  return { ...profile, authSource }
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

export async function deactivateCurrentUserAccount() {
  await waitForAuthReady()
  const current = auth && auth.currentUser
  if (!current) throw new Error('Not authenticated')

  if (BACKEND_URL) {
    const token = await current.getIdToken()
    const res = await fetch(`${BACKEND_URL}/deactivateUserAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.error || 'Backend error')
    }
  }

  const profile = { ...(getCurrentUser() || {}), id: current.uid, accountStatus: 'deactivated' }
  setCurrentUserLocal(profile)
  emitProfileUpdated(profile)
  await logout()
  return profile
}

export async function deleteCurrentUserAccount() {
  await waitForAuthReady()
  const current = auth && auth.currentUser
  if (!current) throw new Error('Not authenticated')

  if (BACKEND_URL) {
    const token = await current.getIdToken()
    const res = await fetch(`${BACKEND_URL}/deleteUserAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.error || 'Backend error')
    }
  }

  await logout()
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
  const backendOnline = await isBackendAvailable()

  if (!backendOnline) {
    const local = getCurrentUser() || { id: uid, email: current.email }
    const merged = { ...local, ...updates, id: uid, email: current.email }
    return cacheCurrentUserProfile(merged)
  }

  // Prefer saving via backend functions when available so server becomes source of truth.
  if (BACKEND_URL && backendOnline) {
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
      // If backend request fails, keep a local profile so the UI can continue.
      const local = getCurrentUser() || { id: uid, email: current.email }
      const merged = { ...local, ...updates, id: uid, email: current.email }
      return cacheCurrentUserProfile(merged)
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
  return cacheCurrentUserProfile(merged)
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

    const backendOnline = await isBackendAvailable()

    // Load profile from backend when available; fallback to Firestore; then to auth info.
    if (BACKEND_URL && backendOnline) {
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
          const loadedFromBackend = Boolean(backendProfile)
          if (isAccountDeactivated(profile)) {
            await fbSignOut(auth)
            setCurrentUserLocal(null)
            emitProfileUpdated(null)
            return
          }
          setCurrentUserLocal(profile)
          emitProfileUpdated(profile)
          if (loadedFromBackend) {
            return
          }
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

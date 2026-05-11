// Simple API client to talk to the functions backend when available.
import { auth } from './firebase'

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE || ''

async function fetchJson(url, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }

  // attach Firebase ID token if available
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken()
      headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }

  const res = await fetch(url, {
    ...opts,
    headers,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

export async function getProfile(userId) {
  if (!FUNCTIONS_BASE) throw new Error('No functions base configured')
  const url = `${FUNCTIONS_BASE}/getUserProfile/${encodeURIComponent(userId)}`
  return fetchJson(url, { method: 'GET' })
}

export async function updateProfile(userId, updates) {
  if (!FUNCTIONS_BASE) throw new Error('No functions base configured')
  const url = `${FUNCTIONS_BASE}/updateUserProfile/${encodeURIComponent(userId)}`
  return fetchJson(url, { method: 'POST', body: JSON.stringify(updates) })
}

export default { getProfile, updateProfile }

import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { auth, ensureAnonymous, firestore, waitForFirebaseReady } from './firebase'
import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function waitForAuthReady() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  await ensureAnonymous()
  return auth.currentUser
}

async function callResponderBackend(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  const request = async (forceRefresh = false) => {
    await waitForAuthReady()
    const token = await auth.currentUser?.getIdToken(forceRefresh)
    if (!token) throw new Error('Not authenticated')

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    if (body) options.body = JSON.stringify(body)
    return fetch(`${BACKEND_URL}/${endpoint}`, options)
  }

  let response = await request()
  if (response.status === 401) response = await request(true)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || 'Backend error')
  return data
}

export async function subscribeToAssignedIncidents(onData, onError) {
  if (!firestore || !auth) throw new Error('Firebase Firestore is not configured')
  await waitForFirebaseReady()
  const user = await waitForAuthReady()
  if (!user) throw new Error('Not authenticated')
  return onSnapshot(
    query(collection(firestore, 'reports'), where('assignedResponderId', '==', user.uid), orderBy('updatedAt', 'desc')),
    (snapshot) => onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
    onError,
  )
}

export function listResponderIncidents(limit = 50) {
  return callResponderBackend(`listEmergencyReports?limit=${limit}`, 'GET')
}

export function listAssignedIncidents(limit = 50, search = '') {
  const params = new URLSearchParams({ limit: String(limit) })
  if (search.trim()) params.set('search', search.trim())
  return callResponderBackend(`listAssignedIncidents?${params.toString()}`, 'GET')
}

export function acceptIncident(reportId) {
  return callResponderBackend('acceptIncident', 'POST', { reportId })
}

export function rejectIncident(reportId, reason = '') {
  return callResponderBackend('rejectIncident', 'POST', { reportId, reason })
}

export function updateIncidentStatus(reportId, status, note = '') {
  return callResponderBackend('updateIncidentStatus', 'POST', { reportId, status, note })
}

export function assignIncident(reportId, responderId) {
  return callResponderBackend('assignIncident', 'POST', { reportId, responderId })
}

export function addIncidentNote(reportId, note) {
  return callResponderBackend('addIncidentNote', 'POST', { reportId, note })
}

export default {
  listResponderIncidents,
  listAssignedIncidents,
  subscribeToAssignedIncidents,
  acceptIncident,
  rejectIncident,
  updateIncidentStatus,
  assignIncident,
  addIncidentNote,
}

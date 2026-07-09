import { auth, ensureAnonymous } from './firebase'
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
  await waitForAuthReady()
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('Not authenticated')

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${BACKEND_URL}/${endpoint}`, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || 'Backend error')
  return data
}

export function listResponderIncidents(limit = 50) {
  return callResponderBackend(`listEmergencyReports?limit=${limit}`, 'GET')
}

export function listAssignedIncidents(limit = 50) {
  return callResponderBackend(`listAssignedIncidents?limit=${limit}`, 'GET')
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
  acceptIncident,
  rejectIncident,
  updateIncidentStatus,
  assignIncident,
  addIncidentNote,
}

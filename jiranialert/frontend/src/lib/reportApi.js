import { auth, storage, storageRef, uploadBytesResumable, getDownloadURL, ensureAnonymous } from './firebase'
import { getActiveUser } from './auth'

import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function waitForAuthReady() {
  if (!auth) return null
  const activeUser = getActiveUser()
  if (activeUser) return activeUser
  const user = await ensureAnonymous()
  if (!user) {
    throw new Error('We could not start a secure emergency-report session. Please check your connection and try again.')
  }
  return user
}

async function callBackend(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  const user = await waitForAuthReady()
  const token = await user?.getIdToken()
  const options = { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(`${BACKEND_URL}/${endpoint}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Backend error')
  return data
}

async function callOptionalBackend(endpoint, body) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  const token = await auth?.currentUser?.getIdToken().catch(() => null)
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(`${BACKEND_URL}/${endpoint}`, { method: 'POST', headers, body: JSON.stringify(body) })
  } catch (error) {
    throw new Error(`Unable to reach emergency service: ${error?.message || 'network error'}`, { cause: error })
  }
  const responseText = await res.text()
  let data
  try { data = responseText ? JSON.parse(responseText) : {} } catch { data = { error: responseText.slice(0, 300) } }
  if (!res.ok) throw new Error(data.error || `Emergency service returned HTTP ${res.status}`)
  return data
}

export async function uploadEvidenceFile(file) {
  if (!storage) throw new Error('Storage not configured')
  await waitForAuthReady()
  const user = getActiveUser()
  const path = `reports/${user ? user.uid : 'anonymous'}/${Date.now()}-${file.name}`
  const ref = storageRef(storage, path)

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref, file)
    task.on('state_changed', null, (err) => reject(err), async () => {
      try {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({ url, path })
      } catch (e) {
        reject(e)
      }
    })
  })
}

export async function createReport(payload) {
  return callBackend('createEmergencyReport', 'POST', payload)
}

export async function listReports(limit = 10) {
  return callBackend(`listEmergencyReports?limit=${limit}`, 'GET')
}

export async function getReport(reportId) {
  return callBackend(`getEmergencyReport/${encodeURIComponent(reportId)}`, 'GET')
}

async function callPublicBackend(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  const options = { method, headers: { 'Content-Type': 'application/json' } }
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 10000)
  options.signal = controller.signal
  if (body) options.body = JSON.stringify(body)
  try {
    const response = await fetch(`${BACKEND_URL}/${endpoint}`, options)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || 'Alert service error')
    return data
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('The alert service took too long to respond. Please try again.', { cause: error })
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export function getPublicReport(reportId) {
  return callPublicBackend(`getPublicEmergencyReport/${encodeURIComponent(reportId)}`)
}

export function listPublicAlerts(limit = 50) {
  return callPublicBackend(`listPublicAlerts?limit=${limit}&activeOnly=false`)
}

export function updatePublicAlert(payload) {
  return callPublicBackend('updatePublicAlert', 'POST', payload)
}

export async function submitEmergencyAlert(payload) {
  const endpoint = '/api/emergency/trigger'
  const requestPayload = {
    status: 'CRITICAL_ALERT',
    timestamp: new Date().toISOString(),
    location: payload.locationCoordinates || null,
    ...payload,
  }
  const headers = { 'Content-Type': 'application/json' }
  const token = await getActiveUser()?.getIdToken().catch(() => null)
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload),
      keepalive: true,
    })
  } catch (error) {
    throw new Error(`Unable to reach the emergency service. Check your connection and try again. ${error?.message || ''}`.trim(), { cause: error })
  }

  const responseText = await response.text()
  let data
  try { data = responseText ? JSON.parse(responseText) : {} } catch { data = { error: responseText.slice(0, 300) } }
  if (!response.ok) {
    if (response.status === 401) throw new Error(data.error || 'Your session has expired. Sign in again and retry.')
    throw new Error(data.error || `Emergency service returned HTTP ${response.status}`)
  }
  if (!data.reportId) throw new Error('The emergency service did not confirm that the alert was saved. Please retry.')
  return data
}

export function updateEmergencyReport(payload) {
  return callOptionalBackend('updateEmergencyReport', payload)
}

function coordinatesFromText(value) {
  const match = String(value || '').trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/)
  if (!match) return null
  const latitude = Number(match[1])
  const longitude = Number(match[2])
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    ? { latitude, longitude }
    : null
}

// Nominatim provides place-name lookup without requiring residents to have a maps API key.
// Keep this to deliberate lookups (rather than every keystroke) to respect its public usage policy.
export async function geocodeLocation(place) {
  const query = String(place || '').trim()
  if (!query) throw new Error('Enter a location first')

  const directCoordinates = coordinatesFromText(query)
  if (directCoordinates) {
    return [{
      label: `${directCoordinates.latitude.toFixed(6)}, ${directCoordinates.longitude.toFixed(6)}`,
      ...directCoordinates,
    }]
  }

  const countryAwareQuery = /\bkenya\b/i.test(query) ? query : `${query}, Kenya`
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=ke&q=${encodeURIComponent(countryAwareQuery)}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Location lookup is unavailable')
  const matches = await response.json()
  return matches
    .map((item) => ({
      label: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    }))
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
}

export default {
  uploadEvidenceFile,
  createReport,
  updateEmergencyReport,
  updatePublicAlert,
  submitEmergencyAlert,
  listReports,
  getReport,
  getPublicReport,
  listPublicAlerts,
  geocodeLocation,
}

import { auth, storage, storageRef, uploadBytesResumable, getDownloadURL, ensureAnonymous } from './firebase'

import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function waitForAuthReady() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  const user = await ensureAnonymous()
  if (!user) {
    throw new Error('We could not start a secure emergency-report session. Please check your connection and try again.')
  }
  return user
}

async function callBackend(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  await waitForAuthReady()
  const token = await auth.currentUser?.getIdToken()
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
  const user = auth.currentUser
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

export function activateEmergency(payload) {
  const configuredBackend = String(import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '')
  const directEndpoint = /^https:\/\/[a-z0-9-]+-[a-z0-9-]+\.cloudfunctions\.net$/i.test(configuredBackend)
    ? `${configuredBackend}/activateEmergency`
    : null
  const endpoint = directEndpoint || '/api/emergency/trigger'
  const queueKey = 'jiranialert_emergency_offline_queue'
  const requestPayload = {
    status: 'CRITICAL_ALERT',
    timestamp: new Date().toISOString(),
    location: payload.locationCoordinates || null,
    ...payload,
  }

  const queueFailure = () => {
    try {
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]')
      queue.push({ ...requestPayload, queuedAt: new Date().toISOString() })
      localStorage.setItem(queueKey, JSON.stringify(queue.slice(-10)))
    } catch {
      // Storage may be unavailable in private browsing; the request error remains visible.
    }
  }

  return (async () => {
    let lastError
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
          keepalive: true,
        })
        const responseText = await response.text()
        let data = {}
        try { data = responseText ? JSON.parse(responseText) : {} } catch { data = { error: responseText } }
        if (!response.ok) throw new Error(data.error || `Emergency service returned HTTP ${response.status}`)
        return data
      } catch (error) {
        lastError = error
        if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 150 * (attempt + 1)))
      }
    }
    queueFailure()
    throw lastError || new Error('Emergency service unavailable')
  })()
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

export default { uploadEvidenceFile, createReport, updateEmergencyReport, activateEmergency, listReports, getReport, geocodeLocation }

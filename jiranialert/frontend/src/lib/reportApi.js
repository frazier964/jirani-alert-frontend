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

export default { uploadEvidenceFile, createReport, listReports, getReport, geocodeLocation }

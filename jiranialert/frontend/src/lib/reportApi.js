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

export default { uploadEvidenceFile, createReport, listReports, getReport }

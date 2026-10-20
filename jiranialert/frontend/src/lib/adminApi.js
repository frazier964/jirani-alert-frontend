import { getActiveAuth } from './auth'
import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function request(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  const activeAuth = getActiveAuth()
  if (!activeAuth?.currentUser) throw new Error('You must be signed in to use the admin portal')

  const send = async (forceRefresh = false) => {
    const token = await activeAuth.currentUser.getIdToken(forceRefresh)
    if (!token) throw new Error('You must be signed in to use the admin portal')
    return fetch(`${BACKEND_URL}/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  let response = await send()
  if (response.status === 401) response = await send(true)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Admin request failed')
  return data
}

export const getAdminDashboard = () => request('getLocalAdminDashboard')
export const reviewResident = (residentId, action, reason = '') => request('reviewLocalResident', 'POST', { residentId, action, reason })
export const moderateAlert = (alertId, action) => request('moderateLocalAlert', 'POST', { alertId, action })
export const moderateAlertWithReason = (alertId, action, reason = '') =>
  request('moderateLocalAlert', 'POST', { alertId, action, reason })
export const manageUser = (userId, action, payload = {}) => request('manageLocalUser', 'POST', { userId, action, ...payload })
export const reviewResponder = (responderId, action, reason = '') => request('reviewLocalResponder', 'POST', { responderId, action, reason })
export const manageIncident = (incidentId, action, payload = {}) => request('manageLocalIncident', 'POST', { incidentId, action, ...payload })
export const createBroadcast = (title, message, severity = 'Info') =>
  request('createLocalBroadcast', 'POST', { title, message, severity })
export const getLocalAdminSettings = () => request('getLocalAdminSettings')
export const updateLocalAdminSettings = (settings) => request('updateLocalAdminSettings', 'POST', { settings })

export default { getAdminDashboard, reviewResident, moderateAlert, moderateAlertWithReason, manageUser, reviewResponder, manageIncident, createBroadcast, getLocalAdminSettings, updateLocalAdminSettings }

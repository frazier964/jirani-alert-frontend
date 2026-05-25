import { auth, ensureAnonymous } from './firebase'

import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function waitForAuthReady() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  await ensureAnonymous()
  return auth.currentUser
}

async function callBackend(endpoint, method = 'GET', body = null) {
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

  if (!response.ok) {
    throw new Error(data?.error || 'Backend error')
  }

  return data
}

export function listNotifications(limit = 50) {
  return callBackend(`listNotifications?limit=${limit}`, 'GET')
}

export function markNotificationRead(notificationId) {
  return callBackend('markNotificationRead', 'POST', { notificationId })
}

export function markAllNotificationsRead() {
  return callBackend('markAllNotificationsRead', 'POST')
}

export function deleteNotification(notificationId) {
  return callBackend('deleteNotification', 'POST', { notificationId })
}

export function clearNotifications() {
  return callBackend('clearNotifications', 'POST')
}

export default {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
}

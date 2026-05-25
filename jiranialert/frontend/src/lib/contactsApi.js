import { auth } from './firebase'

import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function waitForAuthReady() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      unsubscribe()
      resolve()
    })
  })
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

export async function listContacts() {
  return callBackend('listContacts', 'GET')
}

export async function upsertContact(contact) {
  return callBackend('upsertContact', 'POST', contact)
}

export async function deleteContact(contactId) {
  return callBackend('deleteContact', 'POST', { contactId })
}

export default { listContacts, upsertContact, deleteContact }

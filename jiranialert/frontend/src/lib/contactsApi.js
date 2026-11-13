import { auth, prodAuth } from './firebase'
import { getActiveAuth } from './auth'
import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function waitForAuthReady() {
  if (!auth && !prodAuth) return null
  const activeAuth = getActiveAuth()
  if (activeAuth?.currentUser) return activeAuth.currentUser

  await new Promise((resolve) => {
    let settled = false
    let unsubscribeAuth = null
    let unsubscribeProd = null
    const finish = () => {
      if (settled) return
      settled = true
      unsubscribeAuth?.()
      unsubscribeProd?.()
      resolve()
    }
    unsubscribeAuth = auth ? auth.onAuthStateChanged(finish) : null
    unsubscribeProd = prodAuth ? prodAuth.onAuthStateChanged(finish) : null
    window.setTimeout(finish, 2000)
  })

  return getActiveAuth()?.currentUser || null
}

async function callBackend(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  await waitForAuthReady()

  const activeAuth = getActiveAuth()
  const providers = [...new Set([activeAuth, auth, prodAuth].filter(Boolean))]
  let lastError = null

  for (const provider of providers) {
    const user = provider.currentUser
    if (!user) continue

    try {
      const token = await user.getIdToken(true)
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
      if (body) options.body = JSON.stringify(body)

      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 10000)
      options.signal = controller.signal

      try {
        const response = await fetch(`${BACKEND_URL}/${endpoint}`, options)
        const data = await response.json().catch(() => ({}))
        if (response.ok) return data
        lastError = new Error(data?.error || 'Backend error')
        if (response.status === 404) {
          throw new Error('The contact service is not deployed yet. Please deploy the Firebase contact functions and try again.')
        }
        if (response.status !== 401) throw lastError
      } finally {
        window.clearTimeout(timeout)
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('Saving the contact timed out. Please check your connection and try again.', { cause: error })
      }
      lastError = error
    }
  }

  if (lastError) throw lastError
  throw new Error('Not authenticated')
}

export function listContacts() {
  return callBackend('listContacts', 'GET')
}

export function upsertContact(contact) {
  return callBackend('upsertContact', 'POST', contact)
}

export function deleteContact(contactId) {
  return callBackend('deleteContact', 'POST', { contactId })
}

export default { listContacts, upsertContact, deleteContact }

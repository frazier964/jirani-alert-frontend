import { auth, ensureAnonymous } from './firebase'
import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function request(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  if (!auth?.currentUser) await ensureAnonymous()

  const send = async (forceRefresh = false) => {
    const token = await auth?.currentUser?.getIdToken(forceRefresh)
    if (!token) throw new Error('You must be signed in to use the responder workspace')
    return fetch(`${BACKEND_URL}/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  let response = await send()
  if (response.status === 401) response = await send(true)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Workspace request failed')
  return data
}

export const listTeamMembers = () => request('listResponderTeam')
export const updateAvailability = (availability) => request('updateResponderAvailability', 'POST', { availability })
export const listResources = () => request('listResponderResources')
export const updateResource = (resourceId, status) => request('updateResponderResource', 'POST', { resourceId, status })
export const recordDispatchAction = (reportId, action) => request('recordDispatchAction', 'POST', { reportId, action })
export const updateResponderProfile = (updates) => request('updateUserProfile', 'POST', updates)
export const listConversations = () => request('listResidentConversations')
export const listConversationMessages = (conversationId) => request(`listConversationMessages?conversationId=${encodeURIComponent(conversationId)}`)
export const sendConversationMessage = (conversationId, content) => request('sendConversationMessage', 'POST', { conversationId, content })
export const recordCommunicationAction = (conversationId, type) => request('recordCommunicationAction', 'POST', { conversationId, type })

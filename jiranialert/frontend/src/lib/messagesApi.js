import { auth, ensureAnonymous } from './firebase'
import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function request(endpoint, method = 'GET', body = null) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  if (!auth?.currentUser) await ensureAnonymous()
  const token = await auth?.currentUser?.getIdToken()
  if (!token) throw new Error('You must be signed in to use messages')

  const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Messaging request failed')
  return data
}

export const listConversations = () => request('listResidentConversations')
export const listMessages = (conversationId) => request(`listConversationMessages?conversationId=${encodeURIComponent(conversationId)}`)
export const sendMessage = (conversationId, content) => request('sendConversationMessage', 'POST', { conversationId, content })
export const recordCall = (conversationId, type) => request('recordCommunicationAction', 'POST', { conversationId, type })
export const broadcastEmergency = (conversationId, content) => request('sendEmergencyBroadcast', 'POST', { conversationId, content })
export const setMuted = (conversationId, muted) => request('setConversationMuted', 'POST', { conversationId, muted })
export const leaveConversation = (conversationId) => request('leaveConversation', 'POST', { conversationId })


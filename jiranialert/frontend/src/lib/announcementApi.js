import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

export async function listSystemAnnouncements() {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  const response = await fetch(`${BACKEND_URL}/listSystemAnnouncements`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Unable to load announcements')
  return Array.isArray(data.announcements) ? data.announcements : []
}

export default { listSystemAnnouncements }

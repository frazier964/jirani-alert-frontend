import { auth, ensureAnonymous } from './firebase'

import { getFunctionsBaseUrl } from './backendBase'

const BACKEND_URL = getFunctionsBaseUrl()

async function callBackend(endpoint, method = 'GET', body = null, options = {}) {
  if (!BACKEND_URL) throw new Error('Backend is not configured')
  const requireAuth = options.requireAuth !== false
  let token = null

  if (requireAuth) {
    if (!auth.currentUser) {
      await ensureAnonymous()
    }

    await new Promise((resolve) => {
      if (auth.currentUser) {
        resolve()
      } else {
        const unsubscribe = auth.onAuthStateChanged(() => {
          unsubscribe()
          resolve()
        })
      }
    })

    token = await auth.currentUser?.getIdToken()
    if (!token) {
      throw new Error('Not authenticated')
    }
  } else if (auth.currentUser) {
    token = await auth.currentUser.getIdToken().catch(() => null)
  }

  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (token) {
    requestOptions.headers.Authorization = `Bearer ${token}`
  }

  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  const response = await fetch(`${BACKEND_URL}/${endpoint}`, requestOptions)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Backend error')
  }

  return data
}

// Get all community posts with interaction counts
export async function getCommunityFeed(limit = 50) {
  return callBackend(`getCommunityFeed?limit=${limit}`, 'GET', null, { requireAuth: false })
}

// Toggle like on a post
export async function toggleLikePost(postId) {
  return callBackend('toggleLikePost', 'POST', { postId })
}

// Add comment to a post
export async function commentOnPost(postId, text) {
  return callBackend('commentOnPost', 'POST', { postId, text })
}

// Track share
export async function sharePost(postId) {
  return callBackend('sharePost', 'POST', { postId })
}

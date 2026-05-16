import { auth } from './firebase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/jiranialert/us-central1'

async function callBackend(endpoint, method = 'GET', body = null) {
  // Wait for auth to be ready
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

  const token = await auth.currentUser?.getIdToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BACKEND_URL}/${endpoint}`, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Backend error')
  }

  return data
}

// Get all community posts with interaction counts
export async function getCommunityFeed(limit = 50) {
  return callBackend(`getCommunityFeed?limit=${limit}`)
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

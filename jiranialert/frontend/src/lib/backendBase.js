const SAME_ORIGIN_API_BASE = '/api'
const PROD_FUNCTIONS_BASE = 'https://us-central1-jiranialert.cloudfunctions.net'

function isLocalhostHost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function getFunctionsBaseUrl() {
  const explicitBase = String(import.meta.env.VITE_FUNCTIONS_BASE || import.meta.env.VITE_BACKEND_URL || '').trim()
  if (explicitBase) return explicitBase

  if (typeof window !== 'undefined') {
    if (isLocalhostHost()) {
      return SAME_ORIGIN_API_BASE
    }

    // In browser deployments we prefer the same-origin /api proxy so Vercel
    // rewrites can forward requests to Cloud Functions without CORS issues.
    return SAME_ORIGIN_API_BASE
  }

  return PROD_FUNCTIONS_BASE
}

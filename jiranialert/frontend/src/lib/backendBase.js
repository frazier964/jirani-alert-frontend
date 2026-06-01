const LOCAL_FUNCTIONS_BASE = '/api'
const PROD_FUNCTIONS_BASE = 'https://us-central1-jiranialert.cloudfunctions.net'

function isLocalhostHost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function getFunctionsBaseUrl() {
  if (import.meta.env.DEV && isLocalhostHost()) {
    return LOCAL_FUNCTIONS_BASE
  }

  const explicitBase = String(import.meta.env.VITE_FUNCTIONS_BASE || import.meta.env.VITE_BACKEND_URL || '').trim()
  if (explicitBase) return explicitBase

  return PROD_FUNCTIONS_BASE
}
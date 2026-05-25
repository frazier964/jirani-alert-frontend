const LOCAL_FUNCTIONS_BASE = 'http://localhost:5002/jiranialert/us-central1'
const PRODUCTION_FUNCTIONS_BASE = 'https://us-central1-jiranialert.cloudfunctions.net'

function isLocalhostHost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function getFunctionsBaseUrl() {
  const explicitBase = String(import.meta.env.VITE_FUNCTIONS_BASE || '').trim()
  const backendBase = String(import.meta.env.VITE_BACKEND_URL || '').trim()

  if (import.meta.env.DEV && isLocalhostHost()) {
    if (explicitBase && /localhost|127\.0\.0\.1/i.test(explicitBase)) return explicitBase
    if (backendBase && /localhost|127\.0\.0\.1/i.test(backendBase)) return backendBase
    return LOCAL_FUNCTIONS_BASE
  }

  if (explicitBase) return explicitBase
  if (backendBase) return backendBase
  return PRODUCTION_FUNCTIONS_BASE
}
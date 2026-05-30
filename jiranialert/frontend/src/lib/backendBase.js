const LOCAL_FUNCTIONS_BASE = '/api'

function isLocalhostHost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function getFunctionsBaseUrl() {
  const explicitBase = String(import.meta.env.VITE_FUNCTIONS_BASE || '').trim()
  const backendBase = String(import.meta.env.VITE_BACKEND_URL || '').trim()
  const isRelativeApiBase = (value) => value === '/api'

  if (import.meta.env.DEV && isLocalhostHost()) {
    return LOCAL_FUNCTIONS_BASE
  }

  if (explicitBase && !isRelativeApiBase(explicitBase)) return explicitBase
  if (backendBase && !isRelativeApiBase(backendBase)) return backendBase

  return LOCAL_FUNCTIONS_BASE
}
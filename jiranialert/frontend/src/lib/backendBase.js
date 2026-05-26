const LOCAL_FUNCTIONS_BASE = '/api'
const PRODUCTION_FUNCTIONS_BASE = '/api'

function isLocalhostHost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

function isVercelHost() {
  if (typeof window === 'undefined') return false
  return /vercel\.app$/i.test(window.location.hostname)
}

export function getFunctionsBaseUrl() {
  const explicitBase = String(import.meta.env.VITE_FUNCTIONS_BASE || '').trim()
  const backendBase = String(import.meta.env.VITE_BACKEND_URL || '').trim()

  if (import.meta.env.DEV && isLocalhostHost()) {
    return LOCAL_FUNCTIONS_BASE
  }

  if (!import.meta.env.DEV && isVercelHost()) {
    return PRODUCTION_FUNCTIONS_BASE
  }

  if (explicitBase) return explicitBase
  if (backendBase) return backendBase

  return PRODUCTION_FUNCTIONS_BASE
}
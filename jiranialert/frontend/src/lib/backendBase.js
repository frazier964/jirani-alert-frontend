const LOCAL_FUNCTIONS_BASE = '/api'

function isLocalhostHost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function getFunctionsBaseUrl() {
  if (import.meta.env.DEV && isLocalhostHost()) {
    return LOCAL_FUNCTIONS_BASE
  }

  return LOCAL_FUNCTIONS_BASE
}
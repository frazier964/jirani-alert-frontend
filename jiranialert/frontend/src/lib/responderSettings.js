export const defaultResponderSettings = {
  theme: 'light',
  highContrast: false,
  textSize: 'Medium',
  alertTone: 'Gentle',
}

const STORAGE_KEY = 'jiranialert_responder_settings'

export function normalizeResponderSettings(value = {}) {
  return {
    ...defaultResponderSettings,
    ...value,
    theme: value.theme === 'dark' ? 'dark' : 'light',
    highContrast: value.highContrast === true,
    textSize: ['Small', 'Medium', 'Large'].includes(value.textSize) ? value.textSize : 'Medium',
    alertTone: ['Gentle', 'Loud', 'Siren'].includes(value.alertTone) ? value.alertTone : 'Gentle',
  }
}

export function getStoredResponderSettings() {
  try {
    return normalizeResponderSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))
  } catch {
    return defaultResponderSettings
  }
}

export function applyResponderSettings(value) {
  const settings = normalizeResponderSettings(value)
  const root = document.documentElement
  root.dataset.accountTheme = settings.theme
  root.dataset.accountTextSize = settings.textSize.toLowerCase()
  root.dataset.accountContrast = String(settings.highContrast)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  window.dispatchEvent(new CustomEvent('responder-settings-updated', { detail: settings }))
  return settings
}

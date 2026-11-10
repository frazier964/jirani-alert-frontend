import { useEffect, useState } from 'react'
import { Bell, Check, Contrast, Moon, Save, Sun, Type } from 'lucide-react'
import { auth } from '../../lib/firebase'
import { listTeamMembers, updateResponderProfile } from '../../lib/responderWorkspaceApi'
import { applyResponderSettings, getStoredResponderSettings, normalizeResponderSettings } from '../../lib/responderSettings'
import { ResponderShell } from './ResponderComponents'

export default function SettingsWorkspacePage() {
  const [savedSettings, setSavedSettings] = useState(() => getStoredResponderSettings())
  const [settings, setSettings] = useState(() => getStoredResponderSettings())
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateSetting = (key, value) => {
    const next = normalizeResponderSettings({ ...settings, [key]: value })
    setSettings(next)
    applyResponderSettings(next)
  }

  useEffect(() => {
    const load = async () => {
      try {
        const response = await listTeamMembers()
        const member = (response.members || []).find((item) => item.id === auth.currentUser?.uid)
        if (member) {
          const loaded = normalizeResponderSettings({ ...getStoredResponderSettings(), ...member })
          setSavedSettings(loaded)
          setSettings(loaded)
          applyResponderSettings(loaded)
        }
      } catch (requestError) {
        setError(requestError?.message || 'Unable to load settings')
      }
    }
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const next = normalizeResponderSettings(settings)
      await updateResponderProfile(next)
      setSavedSettings(next)
      setSettings(next)
      applyResponderSettings(next)
      setNotice('Settings saved to your responder account.')
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)

  return <ResponderShell><div className="responder-settings grid gap-5">
    <header className="border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Responder Workspace</p><h1 className="mt-3 text-3xl font-black text-slate-900">Responder Settings</h1><p className="mt-2 text-slate-600">Choose a preference to preview it immediately, then save it to your responder account.</p></header>
    {notice ? <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><Check className="mr-2 inline h-4 w-4" />{notice}</div> : null}{error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div> : null}
    <section className="grid gap-5 md:grid-cols-2"><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Sun className="h-5 w-5 text-amber-500" /><div><h2 className="font-black text-slate-900">Theme</h2><p className="text-sm text-slate-500">Preview the entire responder workspace.</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" aria-pressed={settings.theme === 'light'} disabled={saving} onClick={() => updateSetting('theme', 'light')} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${settings.theme === 'light' ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'}`}><Sun className="h-4 w-4" />Light<span className="sr-only">{settings.theme === 'light' ? ' selected' : ''}</span></button><button type="button" aria-pressed={settings.theme === 'dark'} disabled={saving} onClick={() => updateSetting('theme', 'dark')} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${settings.theme === 'dark' ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'}`}><Moon className="h-4 w-4" />Dark<span className="sr-only">{settings.theme === 'dark' ? ' selected' : ''}</span></button></div></div><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Contrast className="h-5 w-5 text-blue-600" /><div><h2 className="font-black text-slate-900">Contrast</h2><p className="text-sm text-slate-500">Increase contrast for field readability.</p></div></div><button type="button" aria-pressed={settings.highContrast} disabled={saving} onClick={() => updateSetting('highContrast', !settings.highContrast)} className={`mt-5 rounded-xl border px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${settings.highContrast ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'}`}>{settings.highContrast ? 'High contrast enabled' : 'Enable high contrast'}</button></div><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Type className="h-5 w-5 text-emerald-600" /><div><h2 className="font-black text-slate-900">Text size</h2><p className="text-sm text-slate-500">Apply a comfortable size immediately across the workspace.</p></div></div><div className="mt-5 flex flex-wrap gap-2">{['Small', 'Medium', 'Large'].map((size) => <button key={size} type="button" aria-pressed={settings.textSize === size} disabled={saving} onClick={() => updateSetting('textSize', size)} className={`rounded-xl border px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${settings.textSize === size ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400'}`}>{size}</button>)}</div></div><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-red-600" /><div><h2 className="font-black text-slate-900">Alert tone</h2><p className="text-sm text-slate-500">Set the sound profile for urgent alerts.</p></div></div><div className="mt-5 flex flex-wrap gap-2">{['Gentle', 'Loud', 'Siren'].map((tone) => <button key={tone} type="button" aria-pressed={settings.alertTone === tone} disabled={saving} onClick={() => updateSetting('alertTone', tone)} className={`rounded-xl border px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-red-100 ${settings.alertTone === tone ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-red-400'}`}>{tone}</button>)}</div></div></section><button type="button" disabled={saving || !hasChanges} onClick={save} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"><Save className="h-4 w-4" />{saving ? 'Saving...' : hasChanges ? 'Save current settings' : 'Settings saved'}</button>
  </div></ResponderShell>
}

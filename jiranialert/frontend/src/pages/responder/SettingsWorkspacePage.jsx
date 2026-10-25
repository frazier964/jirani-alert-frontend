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
    <header className="border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Responder Workspace</p><h1 className="mt-3 text-3xl font-black text-slate-900">Responder Settings</h1><p className="mt-2 text-slate-600">Control notifications and display preferences. Every change is saved to your account.</p></header>
    {notice ? <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><Check className="mr-2 inline h-4 w-4" />{notice}</div> : null}{error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div> : null}
    <section className="grid gap-5 md:grid-cols-2"><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Sun className="h-5 w-5 text-amber-500" /><div><h2 className="font-black text-slate-900">Theme</h2><p className="text-sm text-slate-500">Choose a readable workspace theme.</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={() => setSettings((current) => ({ ...current, theme: 'light' }))} className={`inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-bold ${settings.theme === 'light' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}><Sun className="h-4 w-4" />Light</button><button type="button" disabled={saving} onClick={() => setSettings((current) => ({ ...current, theme: 'dark' }))} className={`inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-bold ${settings.theme === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}><Moon className="h-4 w-4" />Dark</button></div></div><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Contrast className="h-5 w-5 text-blue-600" /><div><h2 className="font-black text-slate-900">Contrast</h2><p className="text-sm text-slate-500">Increase contrast for field readability.</p></div></div><button type="button" disabled={saving} onClick={() => setSettings((current) => ({ ...current, highContrast: !current.highContrast }))} className={`mt-5 border px-4 py-2.5 text-sm font-bold ${settings.highContrast ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{settings.highContrast ? 'High contrast enabled' : 'Enable high contrast'}</button></div><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Type className="h-5 w-5 text-emerald-600" /><div><h2 className="font-black text-slate-900">Text size</h2><p className="text-sm text-slate-500">Choose comfortable text for command work.</p></div></div><div className="mt-5 flex flex-wrap gap-2">{['Small', 'Medium', 'Large'].map((size) => <button key={size} type="button" disabled={saving} onClick={() => setSettings((current) => ({ ...current, textSize: size }))} className={`border px-4 py-2.5 text-sm font-bold ${settings.textSize === size ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{size}</button>)}</div></div><div className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-red-600" /><div><h2 className="font-black text-slate-900">Alert tone</h2><p className="text-sm text-slate-500">Set the sound profile for urgent alerts.</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button key="Gentle" type="button" disabled={saving} onClick={() => setSettings((current) => ({ ...current, alertTone: 'Gentle' }))} className={`border px-4 py-2.5 text-sm font-bold ${settings.alertTone === 'Gentle' ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>Gentle</button><button key="Loud" type="button" disabled={saving} onClick={() => setSettings((current) => ({ ...current, alertTone: 'Loud' }))} className={`border px-4 py-2.5 text-sm font-bold ${settings.alertTone === 'Loud' ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>Loud</button><button key="Siren" type="button" disabled={saving} onClick={() => setSettings((current) => ({ ...current, alertTone: 'Siren' }))} className={`border px-4 py-2.5 text-sm font-bold ${settings.alertTone === 'Siren' ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>Siren</button></div></div></section><button type="button" disabled={saving || !hasChanges} onClick={save} className="inline-flex w-full items-center justify-center gap-2 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"><Save className="h-4 w-4" />{saving ? 'Saving...' : hasChanges ? 'Save current settings' : 'Settings saved'}</button>
  </div></ResponderShell>
}

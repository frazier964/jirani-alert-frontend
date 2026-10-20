import { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  Eye,
  KeyRound,
  Lock,
  MapPin,
  Moon,
  Save,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { getCurrentUser, updateCurrentUserProfile } from '../../lib/auth'
import { auth } from '../../lib/firebase'
import { getLocalAdminSettings, updateLocalAdminSettings } from '../../lib/adminApi'

const defaultSettings = {
  notifications: {
    localIncidents: true,
    incidentUpdates: true,
    assignments: true,
    verificationRequests: true,
    announcements: true,
    securityAlerts: true,
  },
  response: {
    dashboardView: 'list',
    incidentSort: 'newest',
    soundAlerts: true,
  },
  appearance: {
    theme: 'light',
    highContrast: false,
    reducedMotion: false,
    textSize: 'Medium',
  },
}

function mergeSettings(value) {
  return {
    ...defaultSettings,
    ...(value || {}),
    notifications: { ...defaultSettings.notifications, ...(value?.notifications || {}) },
    response: { ...defaultSettings.response, ...(value?.response || {}) },
    appearance: { ...defaultSettings.appearance, ...(value?.appearance || {}) },
  }
}

function Section({ id, title, description, icon: Icon, children }) {
  return <section id={id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><Icon className="h-5 w-5" /></div>
      <div><h2 className="text-lg font-black text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
    </div>
    <div className="mt-6">{children}</div>
  </section>
}

function Field({ label, error, ...props }) {
  return <label className="block text-sm font-bold text-slate-700">{label}<input {...props} className={`mt-2 w-full rounded-xl border px-3 py-2.5 font-normal outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${error ? 'border-red-400' : 'border-slate-200'}`} />{error ? <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span> : null}</label>
}

function Toggle({ label, description, checked, onChange, disabled = false }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
    <span><span className="block text-sm font-bold text-slate-800">{label}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled} className="h-5 w-5 accent-red-600" />
  </label>
}

export default function AdminSettings() {
  const cached = getCurrentUser() || {}
  const [profile, setProfile] = useState({ firstName: cached.firstName || '', lastName: cached.lastName || '', phoneNumber: cached.phoneNumber || '' })
  const [settings, setSettings] = useState(defaultSettings)
  const [summary, setSummary] = useState({ ...cached })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    let active = true
    getLocalAdminSettings()
      .then((data) => {
        if (!active) return
        const nextProfile = data.profile || {}
        setSummary({ ...(getCurrentUser() || {}), ...nextProfile })
        setProfile({ firstName: nextProfile.firstName || '', lastName: nextProfile.lastName || '', phoneNumber: nextProfile.phoneNumber || '' })
        setSettings(mergeSettings(data.settings))
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Unable to load administrator settings.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const saveProfile = async (event) => {
    event.preventDefault()
    const errors = {}
    if (!profile.firstName.trim()) errors.firstName = 'First name is required.'
    if (!profile.lastName.trim()) errors.lastName = 'Last name is required.'
    if (profile.phoneNumber && !/^[+()\d\s-]{7,20}$/.test(profile.phoneNumber.trim())) errors.phoneNumber = 'Enter a valid phone number.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    setSaving('profile'); setNotice(''); setError('')
    try {
      const saved = await updateCurrentUserProfile(profile)
      setSummary((current) => ({ ...current, ...saved }))
      setNotice('Profile changes saved.')
    } catch (requestError) { setError(requestError.message || 'Unable to save profile changes.') } finally { setSaving('') }
  }

  const saveSettings = async (nextSettings) => {
    setSaving('settings'); setNotice(''); setError('')
    try {
      await updateLocalAdminSettings(nextSettings)
      setSettings(nextSettings)
      if (nextSettings.appearance) await updateCurrentUserProfile(nextSettings.appearance)
      setNotice('Preferences saved.')
    } catch (requestError) { setError(requestError.message || 'Unable to save preferences.') } finally { setSaving('') }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    if (passwords.next.length < 6 || passwords.next !== passwords.confirm) {
      setError(passwords.next.length < 6 ? 'New password must be at least 6 characters.' : 'New passwords do not match.')
      return
    }
    if (!auth?.currentUser?.email) { setError('A signed-in email account is required to change the password.'); return }
    setSaving('password'); setNotice(''); setError('')
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwords.current)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, passwords.next)
      setPasswords({ current: '', next: '', confirm: '' })
      setNotice('Password changed successfully.')
    } catch (requestError) {
      const messages = { 'auth/invalid-credential': 'The current password is incorrect.', 'auth/weak-password': 'Choose a stronger password.', 'auth/network-request-failed': 'Network error. Check your connection and try again.' }
      setError(messages[requestError.code] || requestError.message || 'Unable to change password.')
    } finally { setSaving('') }
  }

  const setPreference = (group, key, value) => setSettings((current) => ({ ...current, [group]: { ...current[group], [key]: value } }))
  const appearance = settings.appearance

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading administrator settings...</div>

  return <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
      <p className="px-3 text-xs font-black uppercase tracking-widest text-slate-400">Settings menu</p>
      <nav className="mt-3 grid gap-1 text-sm font-bold text-slate-600">
        {['profile', 'locality', 'notifications', 'security', 'response', 'permissions', 'appearance', 'help'].map((id) => <a key={id} href={`#${id}`} className="rounded-lg px-3 py-2.5 capitalize hover:bg-red-50 hover:text-red-700">{id === 'response' ? 'Emergency response' : id === 'permissions' ? 'Team & permissions' : id}</a>)}
      </nav>
    </aside>
    <div className="grid gap-5">
      {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><Check className="mr-2 inline h-4 w-4" />{notice}</div> : null}
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
      <Section id="profile" title="Profile & account" description="Update the contact details used for your local administration account." icon={User}>
        <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-black text-white">{(summary.firstName || summary.displayName || 'A').slice(0, 1).toUpperCase()}</div><div><p className="font-black text-slate-900">{summary.fullName || summary.displayName || 'Local administrator'}</p><p className="text-sm text-slate-500">{summary.email || 'Email unavailable'} · <span className="font-bold text-emerald-700">{summary.emailVerified ? 'Verified' : 'Verification pending'}</span></p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-red-600">Local administrator</p></div></div>
        <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2"><Field label="First name" value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} error={fieldErrors.firstName} /><Field label="Last name" value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} error={fieldErrors.lastName} /><Field label="Email address" value={summary.email || ''} readOnly /><Field label="Phone number" value={profile.phoneNumber} onChange={(event) => setProfile({ ...profile, phoneNumber: event.target.value })} error={fieldErrors.phoneNumber} /><button disabled={saving === 'profile'} className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 sm:col-span-2"><Save className="h-4 w-4" />{saving === 'profile' ? 'Saving...' : 'Save profile'}</button></form>
      </Section>
      <Section id="locality" title="Locality & coverage" description="Your official assignment is controlled by trusted administration data." icon={MapPin}><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assigned locality</p><p className="mt-2 font-black text-slate-900">{summary.jurisdictionName || summary.estateName || summary.estateId || 'Assigned locality unavailable'}</p></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Locality, jurisdiction, role, and permissions cannot be changed from this page.</div></div></Section>
      <Section id="notifications" title="Notification preferences" description="Choose which supported account notifications should be surfaced to you." icon={Bell}><div className="grid gap-3 md:grid-cols-2">{[['localIncidents', 'New local incidents', 'Reports within your assigned locality.'], ['incidentUpdates', 'Incident updates', 'Changes to incidents you manage.'], ['assignments', 'New assignments', 'Assignments sent to your local team.'], ['verificationRequests', 'Verification requests', 'Member verification activity.'], ['announcements', 'Community announcements', 'Announcements published for your locality.'], ['securityAlerts', 'Security alerts', 'Important account and access events.']].map(([key, label, description]) => <Toggle key={key} label={label} description={description} checked={settings.notifications[key]} disabled={saving === 'settings'} onChange={(value) => { const next = { ...settings, notifications: { ...settings.notifications, [key]: value } }; void saveSettings(next) }} />)}</div><p className="mt-4 text-xs text-slate-500">These preferences control supported in-app signals. They do not claim email or push delivery unless those channels are configured.</p></Section>
      <Section id="security" title="Security & privacy" description="Protect your account and keep sensitive access under your control." icon={Lock}><form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-3"><Field label="Current password" type="password" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required /><Field label="New password" type="password" autoComplete="new-password" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required /><Field label="Confirm new password" type="password" autoComplete="new-password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required /><button disabled={saving === 'password'} className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50 sm:col-span-3"><KeyRound className="h-4 w-4" />{saving === 'password' ? 'Changing...' : 'Change password'}</button></form><p className="mt-4 text-xs text-slate-500">Password changes use Firebase Authentication reauthentication. Passwords are never stored in Firestore or browser storage.</p></Section>
      <Section id="response" title="Emergency response preferences" description="Personalize your workspace without changing critical escalation policy." icon={ShieldCheck}><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-bold text-slate-700">Default dashboard<select value={settings.response.dashboardView} onChange={(event) => setPreference('response', 'dashboardView', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal"><option value="list">List view</option><option value="map">Map view</option></select></label><label className="text-sm font-bold text-slate-700">Incident sorting<select value={settings.response.incidentSort} onChange={(event) => setPreference('response', 'incidentSort', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal"><option value="newest">Newest first</option><option value="severity">Highest severity</option></select></label><Toggle label="Sound alerts" description="Play supported local alert sounds." checked={settings.response.soundAlerts} onChange={(value) => setPreference('response', 'soundAlerts', value)} /></div><button type="button" disabled={saving === 'settings'} onClick={() => void saveSettings(settings)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />Save response preferences</button></Section>
      <Section id="permissions" title="Team & permissions" description="Effective permissions are informational and come from trusted authorization logic." icon={Eye}><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="font-bold text-slate-800">Local incident management</p><p className="mt-1 text-sm text-slate-500">Manage reports and alerts within your assigned locality.</p></div><div className="rounded-xl border border-slate-200 p-4"><p className="font-bold text-slate-800">Member and responder review</p><p className="mt-1 text-sm text-slate-500">Review requests within your authorized scope.</p></div></div></Section>
      <Section id="appearance" title="Appearance & accessibility" description="Use a presentation that works for your environment." icon={Sun}><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setPreference('appearance', 'theme', 'light')} className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${appearance.theme === 'light' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}><Sun className="mr-2 inline h-4 w-4" />Light</button><button type="button" onClick={() => setPreference('appearance', 'theme', 'dark')} className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${appearance.theme === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}><Moon className="mr-2 inline h-4 w-4" />Dark</button></div><div className="mt-4 grid gap-3 md:grid-cols-2"><Toggle label="High contrast" description="Increase contrast for controls and text." checked={appearance.highContrast} onChange={(value) => setPreference('appearance', 'highContrast', value)} /><Toggle label="Reduced motion" description="Prefer fewer interface animations." checked={appearance.reducedMotion} onChange={(value) => setPreference('appearance', 'reducedMotion', value)} /></div><button type="button" disabled={saving === 'settings'} onClick={() => void saveSettings(settings)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />Save appearance</button></Section>
      <Section id="help" title="Help & support" description="Get assistance using real JiraniAlert destinations." icon={ShieldCheck}><div className="flex flex-wrap gap-3 text-sm font-bold"><a href="/support" className="rounded-xl border border-slate-200 px-4 py-2.5 hover:border-red-400 hover:text-red-700">Help & support</a><a href="/privacy" className="rounded-xl border border-slate-200 px-4 py-2.5 hover:border-red-400 hover:text-red-700">Privacy information</a></div></Section>
    </div>
  </div>
}

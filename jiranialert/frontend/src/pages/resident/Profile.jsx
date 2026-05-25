import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Download,
  Eye,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Navigation2,
  PhoneCall,
  Search,
  Settings2,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  SunMedium,
  Upload,
  UserCircle2,
  Wifi,
  X,
  Flame,
  HeartPulse,
  FileText,
} from 'lucide-react'
import ProfileImageUpload from '../../components/UI/ProfileImageUpload'
import Avatar from '../../components/UI/Avatar'
import { getCurrentUser, updateCurrentUserProfile, deactivateCurrentUserAccount, deleteCurrentUserAccount } from '../../lib/auth'
import { listContacts, upsertContact } from '../../lib/contactsApi'

const sidebarItems = [
  { label: 'Dashboard', to: '/resident/dashboard', icon: LayoutDashboard },
  { label: 'Report Emergency', to: '/report', icon: Siren },
  { label: 'Nearby Alerts', to: '/resident/map', icon: Navigation2 },
  { label: 'Community Feed', to: '/resident/notifications', icon: MessageSquare },
  { label: 'Messages', to: '/resident/notifications', icon: FileText },
  { label: 'My Reports', to: '/resident/notifications', icon: FileText },
  { label: 'Safety Tips', to: '/resident/contacts', icon: LifeBuoy },
  { label: 'Settings', to: '/resident/profile', icon: Settings2 },
]

const TEXT_SIZE_OPTIONS = ['Small', 'Medium', 'Large']
const ALERT_TONE_OPTIONS = ['Gentle', 'Loud', 'Siren']
const CONTACT_CATEGORY_OPTIONS = ['Family', 'Medical', 'Security', 'Emergency', 'Neighbors', 'Friends', 'Other']
const CONTACT_EMERGENCY_LEVEL_OPTIONS = ['Critical', 'High', 'Normal', 'Low']

const previewTips = [
  { title: 'Fire safety', description: 'Keep exits clear and avoid elevators during smoke or fire.', icon: Flame },
  { title: 'Emergency contacts', description: 'Keep trusted contacts current so responders can reach them quickly.', icon: PhoneCall },
  { title: 'Anonymous reporting', description: 'You can hide your identity while still sharing the critical details.', icon: Eye },
]

function settingBadgeTone(status) {
  return status ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
}

export default function Profile() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [fullName, setFullName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [residentialArea, setResidentialArea] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [textSize, setTextSize] = useState('Medium')
  const [alertTone, setAlertTone] = useState('Gentle')
  const [toneMenuOpen, setToneMenuOpen] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [shareLiveLocation, setShareLiveLocation] = useState(true)
  const [anonymousReporting, setAnonymousReporting] = useState(true)
  const [showProfile, setShowProfile] = useState(true)
  const [hideActivityStatus, setHideActivityStatus] = useState(false)
  const [emergencyAlerts, setEmergencyAlerts] = useState(true)
  const [nearbyIncidents, setNearbyIncidents] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [communityUpdates, setCommunityUpdates] = useState(true)
  const [frequency, setFrequency] = useState('Instant')
  const [radius, setRadius] = useState(2500)
  const [selectedTip, setSelectedTip] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastContent, setToastContent] = useState({
    tone: 'success',
    title: 'Settings saved',
    message: 'Your resident preferences are up to date.',
  })
  const [saving, setSaving] = useState(false)
  const [contacts, setContacts] = useState([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsError, setContactsError] = useState('')
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [contactSaving, setContactSaving] = useState(false)
  const [contactFormError, setContactFormError] = useState('')
  const [contactForm, setContactForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    category: 'Family',
    location: '',
    emergencyLevel: 'Normal',
    notes: '',
    favorite: false,
  })
  const [accountActionLoading, setAccountActionLoading] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Load user profile image from current user
    const currentUser = getCurrentUser()
    if (currentUser?.profileImageUrl) {
      setProfileImage(currentUser.profileImageUrl)
    }
    if (currentUser?.displayName) setFullName(currentUser.displayName)
    if (currentUser?.email) setEmailAddress(currentUser.email)
    if (currentUser?.phoneNumber) setPhoneNumber(currentUser.phoneNumber)
    if (currentUser?.residentialArea) setResidentialArea(currentUser.residentialArea)
    if (typeof currentUser?.theme === 'string') setDarkMode(currentUser.theme === 'dark')
    if (typeof currentUser?.highContrast === 'boolean') setHighContrast(currentUser.highContrast)
    if (typeof currentUser?.textSize === 'string' && TEXT_SIZE_OPTIONS.includes(currentUser.textSize)) {
      setTextSize(currentUser.textSize)
    }
    if (typeof currentUser?.alertTone === 'string' && ALERT_TONE_OPTIONS.includes(currentUser.alertTone)) {
      setAlertTone(currentUser.alertTone)
    }
    // respond to server-confirmed profile updates
    const handler = (e) => {
      const profile = e?.detail || null
      if (!profile) return
      if (profile.profileImageUrl) setProfileImage(profile.profileImageUrl)
      if (profile.displayName) setFullName(profile.displayName)
      if (profile.email) setEmailAddress(profile.email)
      if (typeof profile.phoneNumber === 'string') setPhoneNumber(profile.phoneNumber)
      if (typeof profile.residentialArea === 'string') setResidentialArea(profile.residentialArea)
      if (typeof profile.theme === 'string') setDarkMode(profile.theme === 'dark')
      if (typeof profile.highContrast === 'boolean') setHighContrast(profile.highContrast)
      if (typeof profile.textSize === 'string' && TEXT_SIZE_OPTIONS.includes(profile.textSize)) {
        setTextSize(profile.textSize)
      }
      if (typeof profile.alertTone === 'string' && ALERT_TONE_OPTIONS.includes(profile.alertTone)) {
        setAlertTone(profile.alertTone)
      }
    }
    window.addEventListener('jiranialert_profile_updated', handler)
    return () => window.removeEventListener('jiranialert_profile_updated', handler)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setContactsLoading(true)
      setContactsError('')
      try {
        const data = await listContacts()
        if (cancelled) return
        setContacts(Array.isArray(data?.contacts) ? data.contacts : [])
      } catch (e) {
        if (cancelled) return
        setContactsError(e?.message || 'Failed to load contacts')
      } finally {
        if (!cancelled) setContactsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelectedTip((current) => (current + 1) % previewTips.length)
    }, 5500)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!toastVisible) return undefined
    const timer = window.setTimeout(() => setToastVisible(false), 2800)
    return () => window.clearTimeout(timer)
  }, [toastVisible])

  const radiusLabel = useMemo(() => {
    if (radius <= 1000) return 'Close'
    if (radius <= 4000) return 'Balanced'
    return 'Wide'
  }, [radius])

  const selectedTipItem = previewTips[selectedTip]
  const SelectedTipIcon = selectedTipItem.icon

  const persistPreferenceChange = async (updates) => {
    try {
      await updateCurrentUserProfile(updates)
    } catch (e) {
      setToastContent({
        tone: 'error',
        title: 'Preference save failed',
        message: e?.message || 'Could not save your preference change.',
      })
      setToastVisible(true)
    }
  }

  const exportMyData = async () => {
    try {
      const current = getCurrentUser() || {}
      const contactsData = await listContacts().catch(() => ({ contacts: [] }))
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        profile: current,
        contacts: Array.isArray(contactsData?.contacts) ? contactsData.contacts : [],
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `jiranialert-account-${current?.id || 'data'}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setToastContent({
        tone: 'error',
        title: 'Export failed',
        message: e?.message || 'Could not export your account data.',
      })
      setToastVisible(true)
    }
  }

  const deactivateAccount = async () => {
    setAccountActionLoading('deactivate')
    try {
      await deactivateCurrentUserAccount()
      setToastContent({
        tone: 'success',
        title: 'Account deactivated',
        message: 'Your account has been saved as deactivated in the backend.',
      })
      setToastVisible(true)
      navigate('/login')
    } catch (e) {
      setToastContent({
        tone: 'error',
        title: 'Deactivate failed',
        message: e?.message || 'Could not deactivate your account.',
      })
      setToastVisible(true)
    } finally {
      setAccountActionLoading('')
    }
  }

  const confirmDeleteAccount = async () => {
    setDeleteConfirmOpen(false)
    setAccountActionLoading('delete')
    try {
      await deleteCurrentUserAccount()
      setToastContent({
        tone: 'success',
        title: 'Account deleted',
        message: 'Your account was removed from the backend.',
      })
      setToastVisible(true)
      navigate('/signup')
    } catch (e) {
      setToastContent({
        tone: 'error',
        title: 'Delete failed',
        message: e?.message || 'Could not delete your account.',
      })
      setToastVisible(true)
    } finally {
      setAccountActionLoading('')
    }
  }

  const handleSave = () => {
    // Persist profile fields (server-first). Include current avatar URL so it's kept.
    (async () => {
      setSaving(true)
      try {
        const current = getCurrentUser() || {}
        const payload = {
          displayName: fullName,
          profileImageUrl: current.profileImageUrl || profileImage || '',
          phoneNumber: phoneNumber,
          residentialArea: residentialArea,
          theme: darkMode ? 'dark' : 'light',
          highContrast: highContrast,
          textSize: textSize,
          alertTone: alertTone,
          showProfile: showProfile,
          hideActivityStatus: hideActivityStatus,
          emergencyAlerts: emergencyAlerts,
          nearbyIncidents: nearbyIncidents,
          smsNotifications: smsNotifications,
          emailNotifications: emailNotifications,
          pushNotifications: pushNotifications,
          communityUpdates: communityUpdates,
          autoDetect: autoDetect,
          shareLiveLocation: shareLiveLocation,
          anonymousReporting: anonymousReporting,
          frequency: frequency,
          radius: radius,
          updatedAt: new Date().toISOString(),
        }
        await updateCurrentUserProfile(payload)
        setToastContent({
          tone: 'success',
          title: 'Settings saved',
          message: 'Your resident preferences are up to date.',
        })
        setToastVisible(true)
      } catch (e) {
        setToastContent({
          tone: 'error',
          title: 'Save failed',
          message: e?.message || 'Could not save your settings. Please sign in and try again.',
        })
        setToastVisible(true)
      } finally {
        setSaving(false)
      }
    })()
  }

  const themeWrapperClass = [
    darkMode ? 'profile-theme-dark bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900',
    highContrast ? 'profile-theme-contrast' : '',
    textSize === 'Small' ? 'profile-text-small' : textSize === 'Large' ? 'profile-text-large' : 'profile-text-medium',
  ]
    .filter(Boolean)
    .join(' ')

  const visibleContacts = useMemo(() => {
    const items = Array.isArray(contacts) ? contacts : []
    return items.slice(0, 4)
  }, [contacts])

  const openContactModal = () => {
    setContactFormError('')
    setContactForm({
      fullName: '',
      phoneNumber: '',
      email: '',
      category: 'Family',
      location: '',
      emergencyLevel: 'Normal',
      notes: '',
      favorite: false,
    })
    setContactModalOpen(true)
  }

  const saveContact = async () => {
    setContactSaving(true)
    setContactFormError('')
    try {
      await upsertContact({
        fullName: contactForm.fullName,
        phoneNumber: contactForm.phoneNumber,
        email: contactForm.email,
        category: contactForm.category,
        location: contactForm.location,
        emergencyLevel: contactForm.emergencyLevel,
        notes: contactForm.notes,
        favorite: contactForm.favorite,
      })

      const data = await listContacts()
      setContacts(Array.isArray(data?.contacts) ? data.contacts : [])
      setContactModalOpen(false)
      setToastContent({
        tone: 'success',
        title: 'Contact saved',
        message: 'Your emergency contact is now saved.',
      })
      setToastVisible(true)
    } catch (e) {
      setContactFormError(e?.message || 'Failed to save contact')
    } finally {
      setContactSaving(false)
    }
  }

  return (
    <div className={`min-h-screen overflow-hidden ${themeWrapperClass}`}>

      <div className="w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <aside className="hidden">
          <div className="sticky top-28 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
            <div className="rounded-[22px] bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Settings</p>
                  <h2 className="mt-2 text-2xl font-black">Protected</h2>
                </div>
                <ShieldCheck className="h-10 w-10 text-white/80" />
              </div>
              <p className="mt-3 text-sm text-white/85">Secure your account, alert preferences, and emergency access tools.</p>
            </div>

            <nav className="mt-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const active = item.label === 'Settings'
                return (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${isActive || active ? 'bg-[#E53935] text-white shadow-[0_14px_30px_rgba(229,57,53,0.22)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                    }
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Wifi className="h-4 w-4 text-emerald-500" />
                Protected connection
              </div>
              <p className="mt-2 text-sm text-slate-500">Your account sync is encrypted and stable.</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4 pb-24 lg:pb-28">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-r from-[#1E3A5F] via-[#2563EB] to-[#0f172a] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:p-8"
          >
            <motion.div
              className="absolute right-6 top-6 h-28 w-28 rounded-full bg-white/10 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                  <Sparkles className="h-4 w-4" />
                  Secure settings center
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Settings</h1>
                <p className="mt-3 text-lg text-blue-100">Manage your account preferences, privacy, alerts, and emergency settings.</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                <CalendarClock className="h-5 w-5 text-white/90" />
                <span className="text-sm font-semibold">Last synced just now</span>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_480px]">
            <div className="space-y-4">
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Profile settings</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Profile Information</h2>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${settingBadgeTone(true)}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    Protected
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <label>
                    <span className="text-sm font-semibold text-slate-700">Full Name</span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-semibold text-slate-700">Email Address</span>
                    <input
                      type="text"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="Email Address"
                      disabled
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-semibold text-slate-700">Phone Number</span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone Number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </label>

                  <label className="md:col-span-3">
                    <span className="text-sm font-semibold text-slate-700">Residential Area / Estate</span>
                    <input
                      type="text"
                      value={residentialArea}
                      onChange={(e) => setResidentialArea(e.target.value)}
                      placeholder="Residential Area / Estate"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </label>

                  <label className="md:col-span-3">
                    <span className="text-sm font-semibold text-slate-700">Profile Picture</span>
                    <div className="mt-2 flex flex-col gap-4">
                      {profileImage && (
                        <div className="flex items-end gap-4">
                          <div>
                            <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Photo</p>
                            <Avatar src={profileImage} alt="Current profile" size={80} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">Photo uploaded successfully</p>
                            <p className="mt-1 text-xs text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                      <ProfileImageUpload 
                        onUploadComplete={(imageUrl) => setProfileImage(imageUrl)}
                      />
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={handleSave} disabled={saving} className="rounded-2xl bg-[#E53935] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(229,57,53,0.25)] hover:shadow-[0_0_36px_rgba(229,57,53,0.38)] disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </motion.section>

              <div className="grid gap-4 lg:grid-cols-2">
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Security</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">Account Security</h2>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {['Change Password', 'Enable Two-Factor Authentication', 'Login Activity History', 'Manage Devices'].map((item) => (
                      <button key={item} type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        <span>{item}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Danger zone</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">Alert Radius</h2>
                    </div>
                    <MapPin className="h-6 w-6 text-[#E53935]" />
                  </div>
                  <div className="mt-5 rounded-[28px] bg-slate-900 p-5 text-white">
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>How far should incident alerts reach you?</span>
                      <span className="font-bold text-white">{radiusLabel}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="500"
                      value={radius}
                      onChange={(event) => setRadius(Number(event.target.value))}
                      className="mt-5 w-full accent-[#E53935]"
                    />
                    <div className="mt-4 flex items-center justify-between text-xs text-white/65">
                      <span>500m</span>
                      <span className="font-semibold text-white">{radius / 1000} km</span>
                      <span>10km</span>
                    </div>
                  </div>
                </motion.section>
              </div>

              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Notification preferences</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Alert Notifications</h2>
                  </div>
                  <Bell className="h-6 w-6 text-[#E53935]" />
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {[
                    ['Emergency Alerts', emergencyAlerts, setEmergencyAlerts],
                    ['Nearby Incident Notifications', nearbyIncidents, setNearbyIncidents],
                    ['SMS Notifications', smsNotifications, setSmsNotifications],
                    ['Email Notifications', emailNotifications, setEmailNotifications],
                    ['Push Notifications', pushNotifications, setPushNotifications],
                    ['Community Updates', communityUpdates, setCommunityUpdates],
                  ].map(([label, checked, setter]) => (
                    <label key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                      <button type="button" onClick={() => setter((value) => !value)} className={`relative h-6 w-11 rounded-full transition-all ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </label>
                  ))}
                </div>

                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Frequency</p>
                      <p className="text-xs text-slate-500">Choose how often community alerts are summarized.</p>
                    </div>
                    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                      {['Instant', 'Every Hour', 'Daily Summary'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFrequency(item)}
                          className={`rounded-full px-3 py-2 text-xs font-bold transition-all ${frequency === item ? 'bg-[#1E3A5F] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              <div className="grid gap-4 lg:grid-cols-2">
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Privacy</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">Privacy Controls</h2>
                    </div>
                    <Eye className="h-6 w-6 text-[#2563EB]" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ['Show profile to neighbors', showProfile, setShowProfile],
                      ['Anonymous emergency reporting', anonymousReporting, setAnonymousReporting],
                      ['Share location during emergencies', shareLiveLocation, setShareLiveLocation],
                      ['Hide activity status', hideActivityStatus, setHideActivityStatus],
                    ].map(([label, value, setter]) => (
                      <label key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                        <button type="button" onClick={() => setter((current) => !current)} className={`relative h-6 w-11 rounded-full transition-all ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Privacy level</p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#2563EB] to-[#1E3A5F]" style={{ width: '78%' }} />
                    </div>
                  </div>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Accessibility</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">Accessibility</h2>
                    </div>
                    <SunMedium className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="mt-5 space-y-3">
                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">Dark Mode</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextValue = !darkMode
                          setDarkMode(nextValue)
                          void persistPreferenceChange({ theme: nextValue ? 'dark' : 'light' })
                        }}
                        className={`relative h-6 w-11 rounded-full transition-all ${darkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${darkMode ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </label>
                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">High contrast mode</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextValue = !highContrast
                          setHighContrast(nextValue)
                          void persistPreferenceChange({ highContrast: nextValue })
                        }}
                        className={`relative h-6 w-11 rounded-full transition-all ${highContrast ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${highContrast ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">Text size</span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {TEXT_SIZE_OPTIONS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setTextSize(item)
                              void persistPreferenceChange({ textSize: item })
                            }}
                            className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                              textSize === item ? 'bg-[#1E3A5F] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">Sound alert customization</span>
                      <div className="mt-3 relative">
                        <button
                          type="button"
                          onClick={() => setToneMenuOpen((v) => !v)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#E53935]" />
                            {alertTone} alert tone
                          </span>
                        </button>
                        <AnimatePresence>
                          {toneMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98 }}
                              className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                            >
                              {ALERT_TONE_OPTIONS.map((tone) => (
                                <button
                                  key={tone}
                                  type="button"
                                  onClick={() => {
                                    setAlertTone(tone)
                                    setToneMenuOpen(false)
                                    void persistPreferenceChange({ alertTone: tone })
                                  }}
                                  className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                                    alertTone === tone ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{tone}</span>
                                  {alertTone === tone ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Saved automatically and kept across your account.</p>
                    </div>
                  </div>
                </motion.section>
              </div>

              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Emergency contacts</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Emergency Contacts</h2>
                  </div>
                  <PhoneCall className="h-6 w-6 text-[#2563EB]" />
                </div>
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {contactsLoading ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:col-span-2">Loading contacts…</div>
                  ) : null}

                  {!contactsLoading && contactsError ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 lg:col-span-2">{contactsError}</div>
                  ) : null}

                  {!contactsLoading && !contactsError && visibleContacts.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:col-span-2">
                      No contacts saved yet. Add one to keep responders informed.
                    </div>
                  ) : null}

                  {!contactsLoading && !contactsError
                    ? visibleContacts.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.category || 'Contact'}</p>
                          <p className="mt-2 font-black text-slate-900">{item.fullName || 'Unnamed contact'}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.phoneNumber || ''}</p>
                        </div>
                      ))
                    : null}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={openContactModal}
                    className="rounded-2xl bg-[#1E3A5F] px-5 py-3 text-sm font-bold text-white hover:bg-[#14304d]"
                  >
                    Add Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/resident/contacts')}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Contacts
                  </button>
                </div>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Account actions</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Account Actions</h2>
                  </div>
                  <Download className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button type="button" onClick={exportMyData} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                    Export My Data
                  </button>
                  <button type="button" onClick={deactivateAccount} disabled={accountActionLoading === 'deactivate'} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60">
                    {accountActionLoading === 'deactivate' ? 'Deactivating...' : 'Deactivate Account'}
                  </button>
                  <button type="button" onClick={() => setDeleteConfirmOpen(true)} disabled={accountActionLoading === 'delete'} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
                    Delete Account
                  </button>
                </div>
              </motion.section>
            </div>

            <aside className="grid gap-4 xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)] xl:grid-rows-[minmax(0,1.35fr)_minmax(0,0.85fr)] xl:overflow-hidden">
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-0 flex-col rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Location settings</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">Location Preferences</h2>
                  </div>
                  <MapPin className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ['Auto-detect location', autoDetect, setAutoDetect],
                    ['Share live location during active emergencies', shareLiveLocation, setShareLiveLocation],
                  ].map(([label, value, setter]) => (
                    <label key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                      <button type="button" onClick={() => setter((current) => !current)} className={`relative h-6 w-11 rounded-full transition-all ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </label>
                  ))}
                  <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Manual location update
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                <div className="mt-4 flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#0f172a] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">Map preview</p>
                  <div className="relative mt-4 min-h-[220px] flex-1 overflow-hidden rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
                    <motion.div className="absolute left-8 top-8 rounded-2xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-700" animate={{ y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
                      Current location
                    </motion.div>
                    <motion.div className="absolute right-6 bottom-8 rounded-2xl bg-emerald-400/90 px-3 py-2 text-xs font-bold text-white" animate={{ y: [0, 4, 0] }} transition={{ duration: 3.1, repeat: Infinity }}>
                      Share live
                    </motion.div>
                  </div>
                </div>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-0 flex-col rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Preview</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">Security and privacy summary</h2>
                  </div>
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div className="mt-4 flex flex-1 flex-col justify-between rounded-[26px] bg-slate-900 p-5 text-white">
                  <p className="text-sm text-white/70">Selected safety guidance</p>
                  <h3 className="mt-2 text-lg font-black">{selectedTipItem.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{selectedTipItem.description}</p>
                  <SelectedTipIcon className="mt-4 h-6 w-6 text-[#E53935]" />
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Your profile is secure, alerts are protected, and your settings are ready to save.
                </div>
              </motion.section>
            </aside>
          </section>
        </main>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">Confirm deletion</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Delete your account?</h3>
              <p className="mt-3 text-sm text-slate-600">
                This will remove your account profile and contacts from the backend and sign you out.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setDeleteConfirmOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={confirmDeleteAccount} className="rounded-2xl border border-red-200 bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700">
                  Yes, delete it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1700px] items-center gap-3 sm:px-2 lg:px-8">
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 rounded-2xl bg-[#E53935] px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(229,57,53,0.2)] disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          
          <button type="button" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700">
            Reset to Default
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-sm lg:hidden">
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="h-full w-[86%] max-w-sm border-r border-slate-200 bg-white p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#E53935]">Navigation</p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">Jirani Alert</h2>
                </div>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-5 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to + item.label}
                      to={item.to}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${isActive || item.label === 'Settings' ? 'bg-[#E53935] text-white' : 'text-slate-700 hover:bg-slate-50'}`
                      }
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contactModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] bg-slate-950/45 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="mx-auto w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Emergency contact</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">Add Contact</h3>
                  <p className="mt-2 text-sm text-slate-600">Saved to your account so it stays after refresh.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {contactFormError ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {contactFormError}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Full Name</span>
                  <input
                    value={contactForm.fullName}
                    onChange={(e) => setContactForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    placeholder="e.g., Estate Security"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-700">Phone Number</span>
                  <input
                    value={contactForm.phoneNumber}
                    onChange={(e) => setContactForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    placeholder="e.g., +254 700 123 456"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-700">Email (optional)</span>
                  <input
                    value={contactForm.email}
                    onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    placeholder="e.g., security@estate.com"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-700">Category</span>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    {CONTACT_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-700">Emergency Level</span>
                  <select
                    value={contactForm.emergencyLevel}
                    onChange={(e) => setContactForm((f) => ({ ...f, emergencyLevel: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    {CONTACT_EMERGENCY_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Location (optional)</span>
                  <input
                    value={contactForm.location}
                    onChange={(e) => setContactForm((f) => ({ ...f, location: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    placeholder="e.g., Main Gate"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Notes (optional)</span>
                  <textarea
                    value={contactForm.notes}
                    onChange={(e) => setContactForm((f) => ({ ...f, notes: e.target.value }))}
                    className="mt-2 w-full min-h-[96px] rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    placeholder="Any special instructions"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:flex-1"
                  disabled={contactSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveContact}
                  className="rounded-2xl bg-[#E53935] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(229,57,53,0.25)] hover:shadow-[0_0_36px_rgba(229,57,53,0.38)] disabled:opacity-60 disabled:cursor-not-allowed sm:flex-1"
                  disabled={contactSaving}
                >
                  {contactSaving ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className={`fixed bottom-24 right-4 z-[90] max-w-sm rounded-3xl border bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] ${toastContent.tone === 'error' ? 'border-rose-200' : 'border-emerald-200'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toastContent.tone === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-slate-900">{toastContent.title}</p>
                <p className="mt-1 text-sm text-slate-500">{toastContent.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

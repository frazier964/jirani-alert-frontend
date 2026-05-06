import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  Car,
  CloudLightning,
  Eye,
  Flame,
  HeartPulse,
  Info,
  MapPin,
  MoonStar,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  Loader2,
  LocateFixed,
  Navigation2,
  Siren,
  FileText,
} from 'lucide-react'

const emergencyTypes = [
  { label: 'Fire Emergency', value: 'Fire', icon: Flame, tone: 'from-red-500 to-orange-500', helper: 'Evacuate and notify responders immediately.' },
  { label: 'Medical Emergency', value: 'Medical', icon: HeartPulse, tone: 'from-emerald-500 to-green-500', helper: 'Get help fast and stay calm.' },
  { label: 'Security Threat', value: 'Security', icon: ShieldAlert, tone: 'from-slate-700 to-slate-900', helper: 'Protect the area and avoid confrontation.' },
  { label: 'Accident', value: 'Accident', icon: Car, tone: 'from-amber-500 to-orange-500', helper: 'Mark the scene and prevent further harm.' },
  { label: 'Natural Disaster', value: 'Disaster', icon: CloudLightning, tone: 'from-indigo-500 to-violet-600', helper: 'Move to safety and follow official guidance.' },
  { label: 'Other Emergency', value: 'Other', icon: AlertTriangle, tone: 'from-[#2563EB] to-cyan-500', helper: 'Provide as many details as possible.' },
]

const severities = [
  { label: 'Low', value: 'Low', tone: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Medium', value: 'Medium', tone: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'High', value: 'High', tone: 'bg-orange-100 text-orange-800 border-orange-200' },
  { label: 'Critical', value: 'Critical', tone: 'bg-red-100 text-red-800 border-red-200' },
]

const notifyOptions = [
  'Nearby Residents',
  'Security Personnel',
  'Medical Responders',
  'Fire Department',
]

const recentReportsSeed = [
  { type: 'Fire Emergency', location: 'Westlands', time: '3m ago', severity: 'Critical' },
  { type: 'Medical Emergency', location: 'Kilimani', time: '11m ago', severity: 'High' },
  { type: 'Security Threat', location: 'South B', time: '24m ago', severity: 'Medium' },
]

function getAlerts() {
  try {
    return JSON.parse(localStorage.getItem('jiranialert_alerts') || '[]')
  } catch (e) {
    return []
  }
}

function saveAlerts(alerts) {
  localStorage.setItem('jiranialert_alerts', JSON.stringify(alerts || []))
}

function getSafetyTip(type) {
  switch (type) {
    case 'Fire':
      return 'Evacuate immediately and avoid elevators.'
    case 'Medical':
      return 'Stay calm and provide first aid if safe.'
    case 'Security':
      return 'Move to a secure area and avoid direct contact.'
    case 'Accident':
      return 'Secure the scene and check for injuries.'
    case 'Disaster':
      return 'Follow shelter guidance and official alerts.'
    default:
      return 'Share clear details and your exact location.'
  }
}

export default function ReportEmergency() {
  const [selectedType, setSelectedType] = useState('Fire')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [severity, setSeverity] = useState('Critical')
  const [anonymous, setAnonymous] = useState(false)
  const [notify, setNotify] = useState([true, true, true, true])
  const [evidenceName, setEvidenceName] = useState('')
  const [geoPending, setGeoPending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [recentReports, setRecentReports] = useState(recentReportsSeed)

  const navigate = useNavigate()

  useEffect(() => {
    const stored = getAlerts()
    if (stored.length) {
      setRecentReports(
        stored.slice(0, 3).map((item) => ({
          type: item.type,
          location: item.location || 'Community Area',
          time: 'just now',
          severity: item.severity,
        })),
      )
    }
  }, [])

  const selectedEmergency = useMemo(
    () => emergencyTypes.find((item) => item.value === selectedType) || emergencyTypes[0],
    [selectedType],
  )

  const handleTypeSelect = (value) => {
    setSelectedType(value)
    setError('')
  }

  const handleLocationDetect = () => {
    setGeoPending(true)
    setError('')
    if (!navigator.geolocation) {
      setLocation('GPS unavailable - manual entry required')
      setGeoPending(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        setGeoPending(false)
      },
      () => {
        setLocation('Location detection failed - please enter manually')
        setGeoPending(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const handleEvidenceChange = (file) => {
    if (file) setEvidenceName(file.name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedType || !title.trim() || !description.trim() || !location.trim()) {
      setError('Please complete the emergency type, title, description, and location.')
      return
    }

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const alert = {
      id: Date.now().toString(),
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      severity,
      anonymous,
      notify,
      evidenceName,
      status: 'active',
      createdAt: new Date().toISOString(),
      comments: [],
    }

    const alerts = getAlerts()
    alerts.unshift(alert)
    saveAlerts(alerts)
    setRecentReports([
      { type: alert.type, location: alert.location, time: 'just now', severity: alert.severity },
      ...recentReports,
    ].slice(0, 3))

    setSuccess({
      id: alert.id,
      responseTime: '3-7 minutes',
      responders: 'Nearby responders and community members notified',
    })
    setSubmitting(false)
  }

  const resetForm = () => {
    setSuccess(null)
    setTitle('')
    setDescription('')
    setLocation('')
    setSeverity('Critical')
    setAnonymous(false)
    setNotify([true, true, true, true])
    setEvidenceName('')
    setSelectedType('Fire')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden">
      <main className="relative z-10 pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] bg-gradient-to-r from-[#1d4ed8] via-[#2563EB] to-[#0f172a] p-6 sm:p-8 text-white shadow-[0_30px_80px_rgba(37,99,235,0.24)] overflow-hidden relative"
          >
            <motion.div
              className="absolute right-6 top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.14, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                  <Siren className="h-4 w-4 animate-pulse" />
                  Report an Emergency
                </div>
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold">Report an Emergency</h1>
                <p className="mt-3 text-blue-100 text-lg">Quickly notify your community and responders.</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                <motion.span
                  className="h-3 w-3 rounded-full bg-red-400 shadow-[0_0_24px_rgba(248,113,113,0.9)]"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                <span className="text-sm font-semibold">Live response center ready</span>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Quick Emergency Buttons</h2>
                    <p className="text-sm text-slate-500">Tap the emergency type to prefill the report.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Sparkles className="h-4 w-4 text-[#2563EB]" />
                    Optimized for speed
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {emergencyTypes.map((item) => {
                    const Icon = item.icon
                    const active = selectedType === item.value
                    return (
                      <motion.button
                        key={item.value}
                        type="button"
                        onClick={() => handleTypeSelect(item.value)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`text-left rounded-2xl border p-4 transition-all ${active ? 'border-[#2563EB] bg-blue-50 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]' : 'border-slate-200 bg-white hover:border-[#2563EB]/40 hover:shadow-md'}`}
                      >
                        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${item.tone} text-white flex items-center justify-center shadow-lg`}> 
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 font-bold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Report Form</h2>
                    <p className="text-sm text-slate-500">Please provide clear details for the fastest response.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Data protected
                  </div>
                </div>

                <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Emergency Type</label>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
                        {emergencyTypes.slice(0, 6).map((item) => {
                          const Icon = item.icon
                          const active = selectedType === item.value
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => handleTypeSelect(item.value)}
                              className={`rounded-xl border px-3 py-2 text-left transition-all ${active ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-slate-200 bg-white hover:border-[#2563EB]/40'}`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-semibold">{item.label}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700" htmlFor="severity">Severity Level</label>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                        {severities.map((item) => (
                          <button
                            type="button"
                            key={item.value}
                            onClick={() => setSeverity(item.value)}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${severity === item.value ? item.tone + ' shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700" htmlFor="title">Emergency Title</label>
                      <input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]/35 focus:border-[#2563EB] transition-all"
                        placeholder="Short title for the incident"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700" htmlFor="location">Location</label>
                      <div className="mt-2 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-32 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]/35 focus:border-[#2563EB] transition-all"
                          placeholder="Enter your exact location"
                        />
                        <button
                          type="button"
                          onClick={handleLocationDetect}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          {geoPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                          Detect
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]/35 focus:border-[#2563EB] transition-all resize-none"
                      placeholder="Describe what happened, who is affected, and any immediate hazards."
                    />
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Upload Evidence</label>
                      <div
                        className={`mt-2 rounded-3xl border-2 border-dashed p-5 text-center transition-all ${dragActive ? 'border-[#2563EB] bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragActive(true)
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragActive(false)
                          handleEvidenceChange(e.dataTransfer.files?.[0])
                        }}
                      >
                        <Upload className="mx-auto h-6 w-6 text-[#2563EB]" />
                        <p className="mt-2 text-sm font-semibold text-slate-700">Drag and drop a photo or video</p>
                        <p className="text-xs text-slate-500">Or click to choose a file</p>
                        <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={(e) => handleEvidenceChange(e.target.files?.[0])}
                          />
                          Select File
                        </label>
                        {evidenceName && <p className="mt-3 text-xs text-emerald-600">Attached: {evidenceName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">Notify</label>
                      <div className="mt-2 grid gap-2">
                        {notifyOptions.map((item, index) => (
                          <label key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                            <span>{item}</span>
                            <input
                              type="checkbox"
                              checked={notify[index]}
                              onChange={(e) => {
                                const next = [...notify]
                                next[index] = e.target.checked
                                setNotify(next)
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">Anonymous reporting</span>
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                    </label>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Info className="h-4 w-4 text-[#2563EB]" />
                        Safety Tip
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{selectedEmergency.helper}</p>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative overflow-hidden rounded-2xl bg-[#DC2626] px-6 py-4 text-white font-extrabold shadow-[0_0_24px_rgba(220,38,38,0.35)] hover:shadow-[0_0_34px_rgba(220,38,38,0.55)] transition-all disabled:opacity-75"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative inline-flex items-center justify-center gap-2">
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5 animate-pulse" />}
                      Send Emergency Alert
                    </span>
                  </button>
                </form>
              </motion.section>
            </div>

            <aside className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Live Map Preview</h2>
                    <p className="text-sm text-slate-500">Incident, user, and nearby responders</p>
                  </div>
                  <Navigation2 className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div className="mt-4 relative h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#1e3a8a] to-[#2563EB]">
                  <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.25),transparent_24%),radial-gradient(circle_at_55%_80%,rgba(255,255,255,0.2),transparent_28%)]" />
                  <div className="absolute inset-x-0 top-10 h-px bg-white/25" />
                  <div className="absolute inset-y-0 left-[25%] w-px bg-white/20" />
                  <div className="absolute inset-y-0 right-[28%] w-px bg-white/15" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative">
                      <motion.div
                        className="h-28 w-28 rounded-full border border-white/40 bg-red-500/15"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="absolute inset-0 grid place-items-center">
                        <MapPin className="h-10 w-10 text-white drop-shadow" />
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute left-6 top-8 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    User Location
                  </motion.div>
                  <motion.div
                    className="absolute right-8 bottom-8 rounded-2xl bg-emerald-400/90 px-3 py-2 text-xs font-semibold text-white shadow-lg"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Nearby Responder
                  </motion.div>
                  <motion.div
                    className="absolute right-10 top-20 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg"
                    animate={{ x: [0, -8, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Incident Pin
                  </motion.div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <h2 className="text-xl font-bold text-slate-900">Side Info Panel</h2>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#2563EB] font-bold">Selected Safety Tip</p>
                  <p className="mt-2 text-sm text-slate-700">{getSafetyTip(selectedType)}</p>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Current Category</h3>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">{selectedType}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Use the quickest details possible. Every second matters.</p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <h2 className="text-xl font-bold text-slate-900">Recent Reports</h2>
                <div className="mt-4 space-y-3">
                  {recentReports.map((item) => (
                    <div key={`${item.type}-${item.time}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.type}</p>
                          <p className="text-xs text-slate-500">{item.location}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{item.severity}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                        <ClockLabel />
                        {item.time}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </aside>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-slate-900">Emergency Alert Sent Successfully</h3>
                  <p className="mt-1 text-sm text-slate-600">Your alert is now moving through the community response network.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <InfoCard label="Alert ID" value={success.id.slice(-8)} />
                <InfoCard label="ETA" value={success.responseTime} />
                <InfoCard label="Status" value="Active" tone="text-emerald-600" />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {success.responders}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/alerts/${success.id}`)}
                  className="flex-1 rounded-xl bg-[#2563EB] px-4 py-3 font-bold text-white hover:shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-all"
                >
                  Track Alert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    navigate('/resident/dashboard')
                  }}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Return Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ClockLabel() {
  return <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold">•</span>
}

function InfoCard({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 font-bold">{label}</p>
      <p className={`mt-1 text-sm font-extrabold ${tone}`}>{value}</p>
    </div>
  )
}

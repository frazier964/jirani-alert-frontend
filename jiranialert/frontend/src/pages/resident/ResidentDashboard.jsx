import React, { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import CommunityFeed from '../../components/Dashboard/CommunityFeed'
import {
  Activity,
  AlertTriangle,
  Bell,
  Car,
  ChevronRight,
  Clock3,
  CloudSun,
  Eye,
  FileText,
  Flame,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageSquare,
  Navigation2,
  PhoneCall,
  Search,
  Settings2,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  SunMedium,
  ThumbsUp,
  CheckCircle2,
  UserCircle2,
  Wifi,
  X,
} from 'lucide-react'

const sidebarItems = [
  { label: 'Dashboard', to: '/resident/dashboard', icon: LayoutDashboard },
  { label: 'Report Emergency', to: '/resident/report', icon: Siren },
  { label: 'Nearby Alerts', to: '/resident/map', icon: Navigation2 },
  { label: 'Notifications', to: '/resident/notifications', icon: MessageSquare },
  { label: 'Messages', to: '/resident/messages', icon: FileText },
  { label: 'My Reports', to: '/resident/reports', icon: FileText },
  { label: 'Safety Tips', to: '/resident/contacts', icon: LifeBuoy },
  { label: 'Settings', to: '/resident/profile', icon: Settings2 },
]

const emergencyTypes = [
  { label: 'Fire', value: 'Fire', icon: Flame, tone: 'from-red-500 to-orange-500' },
  { label: 'Medical', value: 'Medical', icon: HeartPulse, tone: 'from-emerald-500 to-green-500' },
  { label: 'Crime', value: 'Crime', icon: ShieldAlert, tone: 'from-slate-700 to-slate-900' },
  { label: 'Accident', value: 'Accident', icon: Car, tone: 'from-amber-500 to-orange-500' },
  { label: 'Other', value: 'Other', icon: AlertTriangle, tone: 'from-[#2563EB] to-cyan-500' },
]

const quickStats = [
  { label: 'Active Alerts', value: '12', tone: 'text-red-600', icon: Bell },
  { label: 'My Reports', value: '08', tone: 'text-[#1E3A5F]', icon: FileText },
  { label: 'Nearby Incidents', value: '05', tone: 'text-emerald-600', icon: Activity },
  { label: 'Community Updates', value: '24', tone: 'text-[#2563EB]', icon: MessageSquare },
]

const nearbyAlertsSeed = [
  {
    id: 'fire-westlands',
    type: 'Fire',
    title: 'Smoke reported near Skyline Apartments',
    description: 'Multiple residents reported seeing smoke coming from the Skyline Apartments building. Emergency services have been alerted.',
    location: 'Westlands, Nairobi',
    severity: 'Critical',
    anonymous: false,
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    comments: [],
    icon: Flame,
  },
  {
    id: 'medical-kilimani',
    type: 'Medical',
    title: 'Resident needs urgent assistance',
    description: 'A resident at Kilimani Estate requires immediate medical attention. Responders are en route.',
    location: 'Kilimani, Nairobi',
    severity: 'High',
    anonymous: false,
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 60000).toISOString(),
    comments: [],
    icon: HeartPulse,
  },
  {
    id: 'crime-southb',
    type: 'Security',
    title: 'Suspicious movement reported',
    description: 'Community watch reported suspicious activity near the south gate. Security personnel have been notified.',
    location: 'South B, Nairobi',
    severity: 'Medium',
    anonymous: true,
    status: 'active',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    comments: [],
    icon: ShieldAlert,
  },
]

const communityFeed = [
  {
    name: 'Amina W.',
    time: '5m ago',
    initials: 'AW',
    post: 'Community watch patrol started at 7 PM. Please keep gates locked and report unusual activity.',
  },
  {
    name: 'Brian K.',
    time: '19m ago',
    initials: 'BK',
    post: 'Roadside lamp near the estate entrance is now fixed. Safer visibility for the evening commute.',
  },
  {
    name: 'Fatuma N.',
    time: '1h ago',
    initials: 'FN',
    post: 'First aid kit restocked at the community center. Thanks to everyone who contributed.',
  },
]

const recentReports = [
  { title: 'Water pipe burst near Block C', status: 'Pending', progress: 28 },
  { title: 'Suspicious vehicle at Gate 2', status: 'Under Review', progress: 61 },
  { title: 'Power outage in north wing', status: 'Resolved', progress: 100 },
]

const safetyTips = [
  {
    title: 'Fire safety',
    description: 'Keep exits clear, avoid elevators, and stay low if there is smoke.',
    icon: Flame,
  },
  {
    title: 'Emergency contacts',
    description: 'Save local responders, building security, and trusted neighbors in your phone.',
    icon: PhoneCall,
  },
  {
    title: 'Neighborhood watch',
    description: 'Share suspicious activity quickly and keep the community informed.',
    icon: Shield,
  },
  {
    title: 'First aid reminders',
    description: 'Check breathing, control bleeding, and call for help immediately when safe.',
    icon: HeartPulse,
  },
]

const emergencyContacts = [
  { label: 'Security Desk', value: '+254 700 000 111' },
  { label: 'Medical Response', value: '+254 700 000 222' },
  { label: 'Fire Brigade', value: '+254 700 000 333' },
]

const weatherAlerts = [
  { label: 'Heavy rainfall', tone: 'text-blue-600' },
  { label: 'Reduced visibility', tone: 'text-amber-600' },
  { label: 'High humidity', tone: 'text-slate-600' },
]

const mapFilters = ['Fire', 'Crime', 'Medical', 'All Alerts']

function getAlerts() {
  try {
    return JSON.parse(localStorage.getItem('jiranialert_alerts') || '[]')
  } catch (error) {
    return []
  }
}

function severityTone(severity) {
  if (severity === 'Critical') return 'bg-red-100 text-red-700 border-red-200'
  if (severity === 'High') return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

function reportStatusTone(status) {
  if (status === 'Resolved') return 'text-emerald-600'
  if (status === 'Under Review') return 'text-amber-600'
  return 'text-slate-600'
}

export default function ResidentDashboard() {
  
  const [selectedEmergency, setSelectedEmergency] = useState('Fire')
  const [selectedFilter, setSelectedFilter] = useState('All Alerts')
  const [selectedTip, setSelectedTip] = useState(0)
  const [alerts, setAlerts] = useState(nearbyAlertsSeed)

  const navigate = useNavigate()

  useEffect(() => {
    const stored = getAlerts()
    // Initialize localStorage with seed data on first load
    if (stored.length === 0) {
      localStorage.setItem('jiranialert_alerts', JSON.stringify(nearbyAlertsSeed))
      setAlerts(
        nearbyAlertsSeed.map((item) => ({
          id: item.id,
          type: `${item.type} Alert`,
          title: item.title,
          location: item.location,
          time: 'just now',
          severity: item.severity,
          icon: item.icon,
        })),
      )
    } else {
      setAlerts(
        stored.slice(0, 3).map((item, index) => ({
          id: item.id || String(index),
          type: `${item.type} Alert`,
          title: item.title || 'Community alert reported',
          location: item.location || 'Community Area',
          time: 'just now',
          severity: item.severity || 'High',
          icon: item.type === 'Medical' ? HeartPulse : item.type === 'Security' ? ShieldAlert : item.type === 'Accident' ? Car : Flame,
        })),
      )
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelectedTip((current) => (current + 1) % safetyTips.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [])

  const activeAlerts = useMemo(
    () => alerts.filter((item) => item.severity === 'Critical' || item.severity === 'High'),
    [alerts],
  )

  const communityScore = Math.max(72, 92 - activeAlerts.length * 4)
  const dashboardStatus = activeAlerts.length > 2 ? 'Alert' : 'Safe'
  const selectedTipItem = safetyTips[selectedTip]
  const SelectedTipIcon = selectedTipItem.icon

  const currentUser = getCurrentUser()

  const displayName = currentUser?.displayName || 'Resident Name'

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">

      <div className="w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <main className="min-w-0 space-y-4 pb-24 lg:pb-0">
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

              <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px] xl:items-stretch">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                    <Sparkles className="h-4 w-4" />
                    Welcome back
                  </div>
                  <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Welcome back, {displayName} 👋</h1>
                  <p className="mt-3 text-lg text-blue-100">Stay connected and help keep your neighborhood safe.</p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-4 py-2 text-sm font-bold ${dashboardStatus === 'Safe' ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50' : dashboardStatus === 'Alert' ? 'border-amber-300 bg-amber-400/15 text-amber-50' : 'border-red-300 bg-red-400/15 text-red-50'}`}>
                      {dashboardStatus}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                      Community command center ready
                    </span>
                  </div>
                </div>

                <aside className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 xl:self-stretch">
                  {quickStats.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/70">{item.label}</p>
                          <Icon className="h-4 w-4 text-white/80" />
                        </div>
                        <p className={`mt-3 text-3xl font-black ${item.tone}`}>{item.value}</p>
                      </motion.div>
                    )
                  })}
                </aside>
              </div>
            </motion.section>

            <div className="grid gap-3 2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.95fr)]">
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.04 }}
                className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Emergency shortcuts</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Quick Safety Actions</h2>
                    <p className="mt-1 text-sm text-slate-500">Jump into the report flow or pick a category to get started fast.</p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => navigate('/resident/report')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#E53935] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_0_0_rgba(229,57,53,0.45)]"
                    animate={{ boxShadow: ['0 0 0 0 rgba(229,57,53,0.45)', '0 0 0 12px rgba(229,57,53,0)', '0 0 0 0 rgba(229,57,53,0.45)'] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  >
                    OPEN REPORT FORM
                  </motion.button>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {emergencyTypes.map((item) => {
                    const Icon = item.icon
                    const active = selectedEmergency === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedEmergency(item.value)}
                        className={`group rounded-2xl border p-4 text-left transition-all ${active ? 'border-[#E53935] bg-red-50 shadow-[0_0_0_4px_rgba(229,57,53,0.12)]' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md'}`}
                      >
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 font-bold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500">Tap to preselect</p>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Selected type</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{selectedEmergency}</p>
                    </div>
                    <Siren className="h-8 w-8 text-[#E53935]" />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">Use the fastest description possible, confirm location, and submit if the situation is urgent.</p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Safety score</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Community Safety Score</h2>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="mt-4 rounded-3xl bg-slate-900 p-4 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-white/70">Current score</p>
                      <p className="mt-1 text-5xl font-black">{communityScore}</p>
                    </div>
                    <Activity className="h-10 w-10 text-emerald-300" />
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#2563EB]" style={{ width: `${communityScore}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-white/75">Your neighborhood is actively monitored with strong community participation.</p>
                </div>

                <div className="mt-3 space-y-2">
                  {weatherAlerts.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className={`text-sm font-semibold ${item.tone}`}>{item.label}</span>
                      <SunMedium className="h-4 w-4 text-amber-500" />
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            <div className="grid gap-3 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Live Nearby Alerts</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Real-time incident feed</h2>
                  </div>
                  <Link to="/resident/map" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Navigation2 className="h-4 w-4" />
                    Open Map
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {mapFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${selectedFilter === filter ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-3">
                  {alerts.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-[#2563EB] text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-black text-slate-900">{item.title}</p>
                                <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                              </div>
                              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityTone(item.severity)}`}>
                                {item.severity}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {item.time}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {item.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => navigate(`/alerts/${item.id}`)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A5F] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#14304d]"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Interactive map</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Community map</h2>
                  </div>
                  <MapPin className="h-6 w-6 text-[#E53935]" />
                </div>

                <div className="mt-3 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#0f172a] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>User location</span>
                    <span>Nearby incident markers</span>
                  </div>
                  <div className="relative mt-3 h-56 overflow-hidden rounded-[24px] border border-white/15 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_75%_65%,rgba(16,185,129,0.18),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
                    <div className="absolute inset-x-8 top-1/2 h-px bg-white/15" />
                    <div className="absolute inset-y-8 left-1/2 w-px bg-white/15" />
                    <motion.div className="absolute left-8 top-8 flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-700" animate={{ y: [0, -5, 0] }} transition={{ duration: 3.6, repeat: Infinity }}>
                      <div className="h-2.5 w-2.5 rounded-full bg-[#E53935]" />
                      User location
                    </motion.div>
                    <motion.div className="absolute right-8 top-12 rounded-2xl bg-emerald-400/90 px-3 py-2 text-xs font-bold text-white" animate={{ y: [0, 5, 0] }} transition={{ duration: 3.1, repeat: Infinity }}>
                      Safe zone
                    </motion.div>
                    <motion.div className="absolute bottom-10 left-10 rounded-2xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-700" animate={{ x: [0, 6, 0] }} transition={{ duration: 3.8, repeat: Infinity }}>
                      Incident hotspot
                    </motion.div>
                    <motion.div className="absolute bottom-10 right-12 rounded-2xl bg-[#E53935]/90 px-3 py-2 text-xs font-bold text-white" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.8, repeat: Infinity }}>
                      Emergency marker
                    </motion.div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {mapFilters.map((filter) => (
                      <span key={filter} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.section>
            </div>

            <div className="grid gap-3 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Community activity feed</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Resident updates</h2>
                  </div>
                  <Link to="/resident/notifications" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Eye className="h-4 w-4" />
                    View all
                  </Link>
                </div>

                <div className="mt-3">
                  <CommunityFeed />
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Recent reports</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Submitted by residents</h2>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                </div>

                <div className="mt-3 space-y-3">
                  {recentReports.map((item) => (
                    <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-slate-900">{item.title}</p>
                          <p className={`mt-1 text-sm font-semibold ${reportStatusTone(item.status)}`}>{item.status}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">{item.progress}%</span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${item.status === 'Resolved' ? 'bg-emerald-500' : item.status === 'Under Review' ? 'bg-amber-500' : 'bg-[#2563EB]'}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Safety Tips Widget
                  </div>
                  <div className="mt-3 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1E3A5F] p-4 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/60">Rotating guidance</p>
                        <h3 className="mt-2 text-xl font-black">{selectedTipItem.title}</h3>
                      </div>
                      <SelectedTipIcon className="h-8 w-8 text-[#E53935]" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/80">{selectedTipItem.description}</p>
                  </div>
                </div>
              </motion.section>
            </div>
          </main>

          <aside className="space-y-4 xl:sticky xl:top-28 xl:h-[calc(100vh-8rem)] xl:overflow-y-auto xl:pr-1">
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Emergency contacts</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Quick call list</h2>
                </div>
                <PhoneCall className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div className="mt-3 space-y-2">
                {emergencyContacts.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Weather alerts</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Local conditions</h2>
                </div>
                <CloudSun className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-3 space-y-2">
                {weatherAlerts.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className={`text-sm font-semibold ${item.tone}`}>{item.label}</span>
                    <span className="text-xs font-bold text-slate-500">Monitor</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Safety score</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Community snapshot</h2>
                </div>
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-3 rounded-[28px] bg-[#1E3A5F] p-4 text-white">
                <p className="text-sm text-white/70">Current safety score</p>
                <p className="mt-2 text-5xl font-black">{communityScore}</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#2563EB]" style={{ width: `${communityScore}%` }} />
                </div>
                <p className="mt-3 text-sm text-white/75">Your neighborhood is actively monitored with strong community participation.</p>
              </div>
            </motion.section>
          </aside>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/resident/report')}
        className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-[#E53935] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(229,57,53,0.35)] lg:hidden"
      >
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-white"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        Open Report Form
      </button>
    </div>
  )
}

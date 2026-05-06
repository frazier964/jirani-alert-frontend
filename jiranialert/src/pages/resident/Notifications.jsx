import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  CloudSun,
  Flame,
  HeartPulse,
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
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  UserCircle2,
  Users,
  X,
  Clock3,
  ArrowRight,
  AlertTriangle,
  PanelRight,
  Zap,
  Star,
  FileText,
} from 'lucide-react'

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

const tabs = [
  'All',
  'Emergency Alerts',
  'Community Updates',
  'Messages',
  'Safety Tips',
  'System Notifications',
]

const notificationsSeed = [
  {
    id: 'n-1',
    category: 'Emergency Alerts',
    type: 'Fire',
    title: 'Emergency Alert',
    description: 'Fire incident reported near South B Estate. Authorities have been notified.',
    location: 'South B Estate',
    time: '5 mins ago',
    severity: 'High',
    read: false,
    icon: Flame,
    actions: ['View Details', 'Acknowledge'],
    urgent: true,
  },
  {
    id: 'n-2',
    category: 'Emergency Alerts',
    type: 'Crime',
    title: 'Road accident reported near Kilimani Roundabout',
    description: 'Community members are advised to avoid the junction until responders clear the scene.',
    location: 'Kilimani Roundabout',
    time: '12 mins ago',
    severity: 'High',
    read: false,
    icon: ShieldAlert,
    actions: ['View Details', 'Respond'],
    urgent: false,
  },
  {
    id: 'n-3',
    category: 'Community Updates',
    type: 'Community',
    title: 'Neighborhood watch meeting scheduled for tomorrow at 6 PM',
    description: 'The estate committee will share safety improvements and patrol updates.',
    location: 'Community Hall',
    time: '30 mins ago',
    severity: 'Medium',
    read: true,
    icon: Users,
    actions: ['Acknowledge'],
    urgent: false,
  },
  {
    id: 'n-4',
    category: 'Safety Tips',
    type: 'Safety',
    title: 'Avoid walking alone in poorly lit areas late at night',
    description: 'Use the main gate, share your live location, and travel with a trusted neighbor when possible.',
    location: 'Safety Reminder',
    time: '1 hour ago',
    severity: 'Low',
    read: true,
    icon: AlertTriangle,
    actions: ['Dismiss'],
    urgent: false,
  },
  {
    id: 'n-5',
    category: 'System Notifications',
    type: 'System',
    title: 'Your emergency contact settings were updated successfully',
    description: 'Your account preferences have been synced across all connected devices.',
    location: 'Account Activity',
    time: '2 hours ago',
    severity: 'Low',
    read: true,
    icon: CheckCheck,
    actions: ['View Details'],
    urgent: false,
  },
  {
    id: 'n-6',
    category: 'Messages',
    type: 'Message',
    title: 'Security Desk replied to your previous report',
    description: 'The team confirmed patrol coverage around your block for the rest of the evening.',
    location: 'Inbox',
    time: '3 hours ago',
    severity: 'Medium',
    read: false,
    icon: MessageSquare,
    actions: ['Open Message'],
    urgent: false,
  },
]

const timeline = [
  { time: '18:20', label: 'Incident reported', tone: 'bg-[#E53935]' },
  { time: '18:22', label: 'Authority notified', tone: 'bg-amber-500' },
  { time: '18:31', label: 'Community updates sent', tone: 'bg-[#2563EB]' },
  { time: '19:05', label: 'Incident resolved', tone: 'bg-emerald-500' },
]

const quickContacts = [
  { label: 'Police', value: '999', tone: 'bg-slate-900' },
  { label: 'Ambulance', value: '911', tone: 'bg-emerald-500' },
  { label: 'Fire Department', value: '998', tone: 'bg-[#E53935]' },
]

function severityTone(severity) {
  if (severity === 'High') return 'bg-red-100 text-red-700 border-red-200'
  if (severity === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-emerald-100 text-emerald-700 border-emerald-200'
}

function notificationIconTone(category) {
  if (category === 'Emergency Alerts') return 'from-[#E53935] to-orange-500'
  if (category === 'Community Updates') return 'from-[#1E3A5F] to-[#2563EB]'
  if (category === 'Messages') return 'from-slate-700 to-slate-900'
  if (category === 'Safety Tips') return 'from-amber-500 to-orange-500'
  return 'from-emerald-500 to-green-500'
}

export default function Notifications() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(notificationsSeed)
  const [toastVisible, setToastVisible] = useState(false)
  const navigate = useNavigate()

  const unreadCount = notifications.filter((item) => !item.read).length
  const totalCount = notifications.length

  useEffect(() => {
    if (!toastVisible) return undefined
    const timer = window.setTimeout(() => setToastVisible(false), 2200)
    return () => window.clearTimeout(timer)
  }, [toastVisible])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTab = activeTab === 'All' || item.category === activeTab
      const haystack = `${item.title} ${item.description} ${item.location} ${item.category}`.toLowerCase()
      const matchesSearch = haystack.includes(searchQuery.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeTab, notifications, searchQuery])

  const priorityAlert = useMemo(() => notifications.find((item) => item.urgent), [notifications])

  const summary = {
    active: 2,
    resolved: 4,
    level: 'Moderate',
  }

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    setToastVisible(true)
  }

  const clearAll = () => {
    setNotifications([])
    setToastVisible(true)
  }

  const acknowledge = (id) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
    setToastVisible(true)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">

      <div className="mx-auto grid max-w-[1700px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:px-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
            <div className="rounded-[22px] bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Notifications</p>
                  <h2 className="mt-2 text-2xl font-black">{unreadCount} unread</h2>
                </div>
                <Bell className="h-10 w-10 text-white/80" />
              </div>
              <p className="mt-3 text-sm text-white/85">Stay updated with emergencies, safety alerts, and community activity near you.</p>
            </div>

            <nav className="mt-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const active = item.label === 'Community Feed'
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
          </div>
        </aside>

        <main className="min-w-0 space-y-6 pb-24 lg:pb-0">
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
                  Notifications center
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Notifications</h1>
                <p className="mt-3 text-lg text-blue-100">Stay updated with emergencies, safety alerts, and community activity near you.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[430px]">
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Total notifications</p>
                  <p className="mt-2 text-3xl font-black">{totalCount}</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Unread</p>
                  <p className="mt-2 text-3xl font-black text-amber-300">{unreadCount}</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Status</p>
                  <p className="mt-2 text-3xl font-black text-emerald-300">Live</p>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
            <div className="space-y-6 min-w-0">
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Header actions</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Notification Management</h2>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={markAllRead} className="rounded-2xl bg-[#1E3A5F] px-4 py-3 text-sm font-bold text-white hover:bg-[#14304d]">
                      Mark All as Read
                    </button>
                    <button type="button" onClick={clearAll} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-all ${activeTab === tab ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </motion.section>

              {priorityAlert && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-[30px] border border-red-200 bg-gradient-to-r from-red-600 to-[#E53935] p-5 text-white shadow-[0_24px_60px_rgba(229,57,53,0.22)]"
                >
                  <motion.div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.55, 0.25] }} transition={{ duration: 2.4, repeat: Infinity }} />
                  <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
                        <Zap className="h-4 w-4 animate-pulse" />
                        Emergency Alert
                      </div>
                      <h3 className="mt-3 text-2xl font-black sm:text-3xl">{priorityAlert.title}</h3>
                      <p className="mt-2 text-white/90">{priorityAlert.description}</p>
                      <p className="mt-3 text-sm text-white/75">Authorities have been notified.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => navigate('/alerts/priority')} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#E53935] shadow-sm">
                        View Details
                      </button>
                      <button type="button" onClick={() => acknowledge(priorityAlert.id)} className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur hover:bg-white/15">
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}

              <section className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100 text-slate-500">
                      <Bell className="h-9 w-9" />
                    </div>
                    <h2 className="mt-5 text-3xl font-black text-slate-900">You're all caught up</h2>
                    <p className="mt-3 text-slate-500">No new alerts or updates at the moment.</p>
                    <button type="button" onClick={() => navigate('/resident/dashboard')} className="mt-6 rounded-2xl bg-[#1E3A5F] px-5 py-3 text-sm font-bold text-white">
                      Return to Dashboard
                    </button>
                  </motion.div>
                ) : (
                  filteredNotifications.map((item, index) => {
                    const Icon = item.icon
                    const read = item.read
                    return (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.05 }}
                        className={`rounded-[30px] border p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 ${read ? 'border-white/80 bg-white/90' : 'border-blue-200 bg-blue-50/80'}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 gap-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${notificationIconTone(item.category)}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                                  {item.category}
                                </span>
                                {!read && <span className="rounded-full bg-[#E53935] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white animate-pulse">Unread</span>}
                              </div>
                              <h3 className="mt-3 text-xl font-black text-slate-900">{item.title}</h3>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location}</span>
                                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{item.time}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityTone(item.severity)}`}>{item.severity}</span>
                            {item.actions.map((action) => (
                              <button
                                key={action}
                                type="button"
                                onClick={() => acknowledge(item.id)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                              >
                                {action}
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.article>
                    )
                  })
                )}
              </section>

              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Live alert timeline</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Incident Progress</h2>
                  </div>
                  <PanelRight className="h-6 w-6 text-[#E53935]" />
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-4">
                  {timeline.map((item, index) => (
                    <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-3.5 w-3.5 rounded-full ${item.tone}`} />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.time}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-800">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-28 xl:h-[calc(100vh-8rem)] xl:overflow-y-auto xl:pr-1">
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Quick action panel</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">Emergency Contacts</h2>
                  </div>
                  <PhoneCall className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div className="mt-4 space-y-3">
                  {quickContacts.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="mt-1 text-xs text-slate-500">Emergency call shortcut</p>
                        </div>
                        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black text-white ${item.tone}`}>{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="mt-4 w-full rounded-2xl bg-[#1E3A5F] px-4 py-3 text-sm font-bold text-white hover:bg-[#14304d]">
                  Manage Alert Preferences
                </button>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB]">Smart summary</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">Today's Community Status</h2>
                  </div>
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div className="mt-4 rounded-[26px] bg-slate-900 p-5 text-white">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Active Alerts</span>
                    <span className="font-black text-white">{summary.active}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-white/70">
                    <span>Resolved Incidents</span>
                    <span className="font-black text-emerald-300">{summary.resolved}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-white/70">
                    <span>Safety Level</span>
                    <span className="font-black text-amber-300">{summary.level}</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-[#E53935]" style={{ width: '64%' }} />
                  </div>
                </div>
              </motion.section>
            </aside>
          </section>
        </main>
      </div>

      <button
        type="button"
        onClick={() => navigate('/report')}
        className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-[#E53935] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(229,57,53,0.35)] lg:hidden"
      >
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-white"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        Report Now
      </button>

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
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${isActive || item.label === 'Community Feed' ? 'bg-[#E53935] text-white' : 'text-slate-700 hover:bg-slate-50'}`
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
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="fixed bottom-24 right-4 z-[90] max-w-sm rounded-3xl border border-emerald-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-slate-900">Notifications updated</p>
                <p className="mt-1 text-sm text-slate-500">Your notification state has been saved.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

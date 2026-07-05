import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Search,
  Settings2,
  ShieldCheck,
  Siren,
  Users,
  X,
  Zap,
} from 'lucide-react'
import Avatar from '../UI/Avatar'
import { getCurrentUser, getPreferredUserName, logout as logoutUser, resolveAccountRole } from '../../lib/auth'

const navItems = [
  { label: 'Dashboard', target: 'responder-dashboard', icon: LayoutDashboard },
  { label: 'Active Cases', target: 'responder-alerts', icon: AlertTriangle },
  { label: 'Emergency Map', target: 'responder-map', icon: MapPin },
  { label: 'Reports', target: 'responder-analytics', icon: FileText },
  { label: 'Messages', target: 'responder-comms', icon: MessageSquare },
  { label: 'Residents', target: 'responder-residents', icon: Users },
  { label: 'Announcements', target: 'responder-announcements', icon: Bell },
  { label: 'Resources', target: 'responder-resources', icon: ShieldCheck },
]

const statusOptions = [
  { key: 'online', label: 'Online', tone: 'bg-emerald-400' },
  { key: 'busy', label: 'Busy', tone: 'bg-amber-400' },
  { key: 'off-duty', label: 'Off Duty', tone: 'bg-slate-400' },
]

const liveAlerts = [
  { id: 'AL-1041', title: 'Warehouse smoke escalation', location: 'Westlands', time: '2m ago' },
  { id: 'AL-1042', title: 'Medical triage update', location: 'Kilimani', time: '8m ago' },
  { id: 'AL-1043', title: 'Perimeter breach report', location: 'South B', time: '14m ago' },
]

export default function ResponderTopNav() {
  const currentUser = getCurrentUser() || {}
  const resolvedRole = resolveAccountRole(currentUser)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('responder-dashboard')
  const [status, setStatus] = useState('online')

  const mobileRef = useRef(null)
  const alertsRef = useRef(null)
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  const responderName = getPreferredUserName(currentUser) || 'Emergency Responder'
  const unreadCount = liveAlerts.length + 4

  useEffect(() => {
    if (resolvedRole && resolvedRole !== 'responder') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target?.id) {
          setActiveSection(visible.target.id)
        }
      },
      { rootMargin: '-28% 0px -56% 0px', threshold: [0.12, 0.24, 0.48, 0.72] },
    )

    navItems.forEach((item) => {
      const element = document.getElementById(item.target)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [resolvedRole])

  useEffect(() => {
    const onPointerDown = (event) => {
      const path = event.composedPath?.() || []
      const clickedMobile = mobileRef.current && (path.includes(mobileRef.current) || mobileRef.current.contains(event.target))
      const clickedAlerts = alertsRef.current && (path.includes(alertsRef.current) || alertsRef.current.contains(event.target))
      const clickedProfile = profileRef.current && (path.includes(profileRef.current) || profileRef.current.contains(event.target))
      const clickedSearch = searchRef.current && (path.includes(searchRef.current) || searchRef.current.contains(event.target))

      if (!clickedMobile) setMobileOpen(false)
      if (!clickedAlerts) setAlertsOpen(false)
      if (!clickedProfile) setProfileOpen(false)
      if (!clickedSearch) {
        // keep the search bar open only while focused
      }
    }

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setAlertsOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  if (resolvedRole && resolvedRole !== 'responder') {
    return null
  }

  const scrollToTarget = (target) => {
    const element = document.getElementById(target)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileOpen(false)
    setProfileOpen(false)
  }

  const handleLogout = async () => {
    const shouldLogout = window.confirm('Are you sure you want to log out?')
    if (!shouldLogout) return
    await logoutUser()
    window.location.href = '/login'
  }

  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    return [
      ...navItems
        .filter((item) => item.label.toLowerCase().includes(query))
        .map((item) => ({ type: 'section', label: item.label, target: item.target })),
      ...liveAlerts
        .filter((item) => `${item.title} ${item.location} ${item.id}`.toLowerCase().includes(query))
        .map((item) => ({ type: 'alert', label: item.title, detail: `${item.location} · ${item.time}`, target: 'responder-alerts' })),
    ].slice(0, 6)
  }, [searchQuery])

  return (
    <header className="sticky top-[var(--announcement-bar-height)] z-50 border-b border-white/10 bg-[#070d19]/92 text-white shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-8">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/6 px-3 py-3 shadow-[0_18px_48px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:px-4 lg:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-blue-500 shadow-[0_18px_34px_rgba(239,68,68,0.32)] ring-1 ring-white/10">
                <Siren className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">Jirani Alert</p>
                <p className="truncate text-sm font-bold text-white sm:text-base lg:text-lg">Jirani Alert Emergency Responder Portal</p>
              </div>
            </div>

            <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
              <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-slate-950/45 p-1.5 scrollbar-none">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = activeSection === item.target
                  return (
                    <button
                      key={item.target}
                      type="button"
                      onClick={() => scrollToTarget(item.target)}
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-red-400/60 ${
                        active
                          ? 'bg-[#E53935] text-white shadow-[0_0_0_1px_rgba(229,57,53,0.35),0_12px_24px_rgba(229,57,53,0.28)]'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="ml-auto hidden items-center gap-3 xl:flex">
              <div className="relative w-[20rem]" ref={searchRef}>
                <label className="sr-only" htmlFor="responder-search">
                  Search incidents, residents, or reports
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2.5 transition focus-within:border-cyan-400/30 focus-within:ring-2 focus-within:ring-cyan-400/20">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    id="responder-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search incidents, residents, reports"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <AnimatePresence>
                  {searchQuery.trim() ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-3xl border border-white/10 bg-[#09111e] shadow-[0_24px_60px_rgba(2,6,23,0.42)]"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Quick search</p>
                      </div>
                      <div className="max-h-72 overflow-auto p-2">
                        {filteredSearchResults.length > 0 ? (
                          filteredSearchResults.map((result, index) => (
                            <button
                              key={`${result.label}-${index}`}
                              type="button"
                              onClick={() => scrollToTarget(result.target)}
                              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/8"
                            >
                              <div>
                                <p className="text-sm font-semibold text-white">{result.label}</p>
                                {'detail' in result && result.detail ? <p className="mt-1 text-xs text-slate-400">{result.detail}</p> : null}
                              </div>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
                                {result.type}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-sm text-slate-400">No responder results matched.</div>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setAlertsOpen((value) => !value)}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/45 text-slate-200 transition hover:border-red-400/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400/50"
                aria-label="Emergency notifications"
                aria-haspopup="menu"
                aria-expanded={alertsOpen}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-[11px] font-black text-white shadow-[0_0_0_3px_rgba(7,13,25,0.95)]">
                  {unreadCount}
                </span>
              </button>

              <div className="relative flex items-center rounded-2xl border border-white/10 bg-slate-950/45 p-1">
                {statusOptions.map((option) => {
                  const selected = option.key === status
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setStatus(option.key)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                        selected ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${option.tone}`} />
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollToTarget('responder-dispatch')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_18px_30px_rgba(239,68,68,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-red-400/60"
              >
                <Zap className="h-4 w-4" />
                Respond Now
              </button>

              <button
                type="button"
                onClick={() => scrollToTarget('responder-settings')}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/45 text-slate-200 transition hover:border-sky-400/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                aria-label="Responder settings"
              >
                <Settings2 className="h-5 w-5" />
              </button>

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-2 py-1.5 transition hover:border-red-400/30 hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-red-400/50"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <Avatar src={currentUser.profileImageUrl} alt={responderName} size={40} />
                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="truncate text-sm font-bold text-white">{responderName}</p>
                    <p className="truncate text-[11px] text-slate-400">{statusOptions.find((item) => item.key === status)?.label || 'Online'}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-3xl border border-white/10 bg-[#09111e] shadow-[0_24px_60px_rgba(2,6,23,0.42)]"
                      role="menu"
                      aria-label="Responder profile menu"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Responder profile</p>
                        <p className="mt-1 text-sm font-bold text-white">{responderName}</p>
                      </div>
                      <div className="p-2">
                        <button type="button" onClick={() => scrollToTarget('responder-profile')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/8">
                          <UserButtonIcon />
                          Profile
                        </button>
                        <button type="button" onClick={() => scrollToTarget('responder-settings')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/8">
                          <Settings2 className="h-4 w-4 text-cyan-200" />
                          Settings
                        </button>
                        <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/10">
                          Logout
                          <LogOut className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 xl:hidden">
              <button
                type="button"
                onClick={() => scrollToTarget('responder-dispatch')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 px-3 py-2 text-sm font-black text-white shadow-[0_18px_30px_rgba(239,68,68,0.3)]"
              >
                <Zap className="h-4 w-4" />
                Respond Now
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/45 text-slate-100 transition hover:border-red-400/30 focus:outline-none focus:ring-2 focus:ring-red-400/50"
                aria-label="Open responder navigation"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 font-semibold text-red-100">
              <Siren className="h-3.5 w-3.5" />
              {unreadCount} live alerts
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-2 font-semibold text-sky-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-300" />
              </span>
              Command network online
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2 font-semibold text-amber-100">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              Future incident counters ready
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {alertsOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-4 top-full z-50 mt-2 w-[22rem] overflow-hidden rounded-3xl border border-white/10 bg-[#09111e] shadow-[0_24px_60px_rgba(2,6,23,0.42)]"
            ref={alertsRef}
            role="menu"
            aria-label="Emergency alerts menu"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-sm font-black text-white">Emergency alerts</p>
              <p className="text-xs text-slate-400">Unread incidents and live notices</p>
            </div>
            <div className="max-h-80 overflow-auto p-2">
              {liveAlerts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToTarget('responder-alerts')}
                  className="block w-full rounded-2xl px-3 py-3 text-left transition hover:bg-white/8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.location}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-300">{item.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="xl:hidden"
            ref={mobileRef}
          >
            <div className="mt-3 max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain rounded-[1.75rem] border border-white/10 bg-[#09111e] p-3 shadow-[0_24px_60px_rgba(2,6,23,0.42)]">
              <div className="mb-3 rounded-2xl border border-white/10 bg-slate-950/50 p-3" ref={searchRef}>
                <label className="sr-only" htmlFor="responder-search-mobile">
                  Search incidents, residents, or reports
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    id="responder-search-mobile"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search incidents, residents, reports"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                {searchQuery.trim() ? (
                  <div className="mt-3 space-y-2">
                    {filteredSearchResults.length > 0 ? (
                      filteredSearchResults.map((result, index) => (
                        <button
                          key={`${result.label}-${index}`}
                          type="button"
                          onClick={() => scrollToTarget(result.target)}
                          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/8"
                        >
                          <span>{result.label}</span>
                          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{result.type}</span>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-400">No search results.</div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = activeSection === item.target
                  return (
                    <button
                      key={item.target}
                      type="button"
                      onClick={() => scrollToTarget(item.target)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        active ? 'bg-[#E53935] text-white shadow-[0_0_0_1px_rgba(229,57,53,0.25)]' : 'bg-white/4 text-slate-200 hover:bg-white/8'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {active ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Status</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {statusOptions.map((option) => {
                      const selected = option.key === status
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setStatus(option.key)}
                          className={`rounded-xl px-2 py-2 text-xs font-bold transition ${selected ? 'bg-white text-slate-950' : 'bg-slate-900 text-slate-300'}`}
                        >
                          <span className={`mr-1 inline-block h-2 w-2 rounded-full ${option.tone}`} />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => scrollToTarget('responder-alerts')}
                  className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-left"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-200">Alerts</p>
                  <p className="mt-2 text-sm font-bold text-white">{unreadCount} live</p>
                  <p className="mt-1 text-xs text-red-100/80">Tap to review active incidents.</p>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToTarget('responder-dispatch')}
                  className="rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-red-500 p-3 text-left font-black text-white shadow-[0_18px_30px_rgba(239,68,68,0.28)]"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/80">Fast action</p>
                  <p className="mt-2 text-sm">Respond Now</p>
                  <p className="mt-1 text-xs text-white/75">Jump to dispatch center.</p>
                </button>
              </div>

              <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => scrollToTarget('responder-settings')}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3 text-sm font-semibold text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-cyan-200" />
                    Settings
                  </span>
                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3 text-sm font-semibold text-red-200"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </span>
                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-red-300/70" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function UserButtonIcon() {
  return <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200"><ShieldCheck className="h-4 w-4" /></span>
}

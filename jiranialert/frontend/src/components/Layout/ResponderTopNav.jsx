import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Radio,
  ShieldCheck,
  SignalHigh,
  Users,
  Wifi,
  X,
  Settings2,
  UserCircle2,
  Zap,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Avatar from '../UI/Avatar'
import { getCurrentUser, logout as logoutUser } from '../../lib/auth'

const responderNavItems = [
  { label: 'Dashboard', target: 'responder-dashboard', icon: LayoutDashboard },
  { label: 'Active Emergencies', target: 'responder-alerts', icon: CircleAlert },
  { label: 'Dispatch Center', target: 'responder-dispatch', icon: Radio },
  { label: 'Incident Reports', target: 'responder-analytics', icon: FileText },
  { label: 'Messages', target: 'responder-comms', icon: MessageSquare },
  { label: 'Emergency Map', target: 'responder-map', icon: MapPin },
  { label: 'Team Status', target: 'responder-status', icon: Users },
]

const profileItems = [
  { label: 'Profile', target: 'responder-profile', icon: UserCircle2 },
  { label: 'Settings', target: 'responder-settings', icon: Settings2 },
  { label: 'Shift Logs', target: 'responder-analytics', icon: Activity },
]

const emergencyNotifications = [
  {
    id: 'fire-escalation',
    title: 'Fire escalation near Westlands',
    body: 'Engine 12 and EMS have been dispatched. Additional support requested.',
    time: '2m ago',
  },
  {
    id: 'medical-triage',
    title: 'Medical triage update',
    body: 'Responder team confirmed patient handoff at the scene.',
    time: '8m ago',
  },
  {
    id: 'dispatch-sync',
    title: 'Dispatch sync complete',
    body: 'All active units are now visible on the live command map.',
    time: '14m ago',
  },
]

const availabilityOptions = [
  { key: 'available', label: 'Available', tone: 'bg-emerald-500' },
  { key: 'responding', label: 'Responding', tone: 'bg-amber-500' },
  { key: 'off-duty', label: 'Off Duty', tone: 'bg-slate-500' },
]

export default function ResponderTopNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [availability, setAvailability] = useState('available')
  const [activeSection, setActiveSection] = useState('responder-dashboard')
  const [profileImage, setProfileImage] = useState(null)
  const mobileMenuRef = useRef(null)
  const notificationsRef = useRef(null)
  const profileRef = useRef(null)

  const currentUser = getCurrentUser() || {}
  const unreadCount = 7

  useEffect(() => {
    setProfileImage(currentUser?.profileImageUrl || null)

    const handler = (event) => {
      const profile = event?.detail || null
      setProfileImage(profile?.profileImageUrl || null)
    }

    window.addEventListener('jiranialert_profile_updated', handler)
    return () => window.removeEventListener('jiranialert_profile_updated', handler)
  }, [currentUser?.profileImageUrl])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target?.id) {
          setActiveSection(visible.target.id)
        }
      },
      { rootMargin: '-32% 0px -55% 0px', threshold: [0.15, 0.3, 0.5, 0.75] },
    )

    responderNavItems.forEach((item) => {
      const element = document.getElementById(item.target)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onPointerDown = (event) => {
      const path = event.composedPath?.() || []
      const clickedMobile = mobileMenuRef.current && (path.includes(mobileMenuRef.current) || mobileMenuRef.current.contains(event.target))
      const clickedNotifications = notificationsRef.current && (path.includes(notificationsRef.current) || notificationsRef.current.contains(event.target))
      const clickedProfile = profileRef.current && (path.includes(profileRef.current) || profileRef.current.contains(event.target))

      if (!clickedMobile) setMobileOpen(false)
      if (!clickedNotifications) setNotificationsOpen(false)
      if (!clickedProfile) setProfileOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const responderName = currentUser.displayName || 'Emergency Responder'
  const statusMeta = useMemo(
    () => availabilityOptions.find((option) => option.key === availability) || availabilityOptions[0],
    [availability],
  )

  const scrollToSection = (target) => {
    const element = document.getElementById(target)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logoutUser()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-[var(--announcement-bar-height)] z-50 border-b border-red-500/20 bg-[#08111f]/95 text-white shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/5 px-3 py-3 backdrop-blur-xl sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E53935] shadow-[0_16px_32px_rgba(229,57,53,0.36)]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black uppercase tracking-[0.28em] text-red-200/90">Jirani Alert</p>
              <p className="truncate text-sm font-semibold text-white sm:text-base">Emergency Responder Portal</p>
            </div>
          </div>

          <div className="ml-auto hidden flex-1 items-center justify-center xl:flex">
            <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/50 p-1.5">
              {responderNavItems.map((item) => {
                const Icon = item.icon
                const active = activeSection === item.target
                return (
                  <button
                    key={item.target}
                    type="button"
                    onClick={() => scrollToSection(item.target)}
                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-[#E53935] text-white shadow-[0_0_0_1px_rgba(229,57,53,0.35),0_0_24px_rgba(229,57,53,0.38)]'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              <span>System online</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{unreadCount} active alerts</span>
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <div className="flex items-center rounded-full border border-white/10 bg-slate-950/50 p-1">
              {availabilityOptions.map((option) => {
                const selected = option.key === availability
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setAvailability(option.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                      selected ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${option.tone}`} />
                    {option.label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('responder-dispatch')}
              className="inline-flex items-center gap-2 rounded-full bg-[#E53935] px-4 py-2.5 text-sm font-black text-white shadow-[0_16px_32px_rgba(229,57,53,0.3)] transition hover:-translate-y-0.5 hover:bg-[#f0433f]"
            >
              <Zap className="h-4 w-4" />
              Respond Now
            </button>

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((value) => !value)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 text-slate-200 transition hover:border-red-400/30 hover:text-white"
                aria-haspopup="menu"
                aria-expanded={notificationsOpen}
                aria-label="Emergency alerts"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-[11px] font-black text-white shadow-[0_0_0_3px_rgba(8,17,31,0.95)]">
                  {unreadCount}
                </span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full z-50 w-80 pt-2"
                    role="menu"
                    aria-label="Emergency alerts menu"
                  >
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#09111e] shadow-[0_24px_60px_rgba(2,6,23,0.42)]">
                      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-white">Emergency alerts</p>
                          <p className="text-xs text-slate-400">Unread and active incident notices</p>
                        </div>
                        <span className="rounded-full border border-red-400/20 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-100">
                          {unreadCount} new
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto p-2 scrollbar-custom">
                        {emergencyNotifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => scrollToSection('responder-alerts')}
                            className="block w-full rounded-2xl px-3 py-3 text-left transition hover:bg-white/6"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">{item.title}</p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.body}</p>
                              </div>
                              <span className="shrink-0 text-[11px] font-semibold text-slate-500">{item.time}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-2 py-1.5 transition hover:border-red-400/30 hover:bg-white/8"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Responder profile menu"
              >
                <Avatar src={profileImage} alt={responderName} size={34} />
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="truncate text-sm font-bold text-white">{responderName}</p>
                  <p className="truncate text-[11px] text-slate-400">{statusMeta.label}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-0 top-full z-50 w-72 pt-2"
                    role="menu"
                    aria-label="Responder profile options"
                  >
                    <div className="rounded-3xl border border-white/10 bg-[#09111e] p-2 shadow-[0_24px_60px_rgba(2,6,23,0.42)]">
                      <div className="px-3 py-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Quick access</p>
                      </div>
                      <div className="grid gap-1">
                        {profileItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => scrollToSection(item.target)}
                              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/8 hover:text-white"
                            >
                              <Icon className="h-4 w-4 text-red-300" />
                              <span>{item.label}</span>
                            </button>
                          )
                        })}
                      </div>
                      <div className="my-2 h-px bg-white/8" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
                      >
                        Logout
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 xl:hidden">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold text-emerald-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              Online
            </div>
            <button
              type="button"
              onClick={() => scrollToSection('responder-dispatch')}
              className="inline-flex items-center gap-2 rounded-full bg-[#E53935] px-3 py-2 text-sm font-black text-white shadow-[0_16px_32px_rgba(229,57,53,0.3)]"
            >
              <Zap className="h-4 w-4" />
              Respond Now
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 text-slate-100 transition hover:border-red-400/30"
              aria-label="Open responder navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 font-semibold text-red-100">
            <SignalHigh className="h-3.5 w-3.5" />
            18 active emergencies
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-2 font-semibold text-sky-100">
            <Wifi className="h-3.5 w-3.5" />
            Live command network online
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2 font-semibold text-amber-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
            </span>
            Real-time pulse active
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="xl:hidden"
            >
              <div className="mt-3 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#09111e] p-3 shadow-[0_24px_60px_rgba(2,6,23,0.42)]">
                <div className="grid gap-1 sm:grid-cols-2">
                  {responderNavItems.map((item) => {
                    const Icon = item.icon
                    const active = activeSection === item.target
                    return (
                      <button
                        key={item.target}
                        type="button"
                        onClick={() => scrollToSection(item.target)}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                          active ? 'bg-[#E53935] text-white shadow-[0_0_0_1px_rgba(229,57,53,0.25)]' : 'bg-white/4 text-slate-200 hover:bg-white/8'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        {active ? <ChevronRight className="h-4 w-4" /> : null}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Availability</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {availabilityOptions.map((option) => {
                        const selected = option.key === availability
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setAvailability(option.key)}
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
                    onClick={() => scrollToSection('responder-alerts')}
                    className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-left"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-200">Emergency alerts</p>
                    <p className="mt-2 text-sm font-bold text-white">{unreadCount} unread</p>
                    <p className="mt-1 text-xs text-red-100/80">Tap to review active incidents.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('responder-dispatch')}
                    className="rounded-2xl bg-[#E53935] p-3 text-left font-black text-white shadow-[0_16px_32px_rgba(229,57,53,0.28)]"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/80">Fast action</p>
                    <p className="mt-2 text-sm">Respond Now</p>
                    <p className="mt-1 text-xs text-white/75">Jump to dispatch center.</p>
                  </button>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="px-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Profile</p>
                  <div className="mt-2 grid gap-1">
                    {profileItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => scrollToSection(item.target)}
                          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
                        >
                          <Icon className="h-4 w-4 text-red-300" />
                          {item.label}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
                    >
                      Logout
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
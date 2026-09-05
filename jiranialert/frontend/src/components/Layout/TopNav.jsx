import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Bell, Search, ShieldCheck, UserCircle2, ChevronRight, LogOut, LayoutDashboard, Siren, Navigation2, MessageSquare, FileText, LifeBuoy, Settings2 } from 'lucide-react'
import Avatar from '../UI/Avatar'
// ProfileImageUpload intentionally omitted from dropdown (use Profile page)
import { logout as logoutUser, getCurrentUser } from '../../lib/auth'
import LogoutConfirmModal from '../LogoutConfirmModal'
import { setLogoutNotice } from '../LogoutToast'

const sidebarItems = [
  { label: 'Dashboard', to: '/resident/dashboard', icon: LayoutDashboard },
  { label: 'Report Emergency', to: '/resident/report', icon: Siren },
  { label: 'Live Map', to: '/resident/map', icon: Navigation2 },
  { label: 'Notifications', to: '/resident/notifications', icon: MessageSquare },
  { label: 'Messages', to: '/resident/messages', icon: FileText },
  { label: 'My Reports', to: '/resident/reports', icon: FileText },
  { label: 'Safety Tips', to: '/resident/contacts', icon: LifeBuoy },
  { label: 'Settings', to: '/resident/profile', icon: Settings2 },
]

const notificationPreview = [
  {
    id: 'community-watch',
    title: 'Community watch patrol',
    body: 'Patrol begins near Gate 2 at 7:00 PM.',
    time: '5m ago',
  },
  {
    id: 'medical-check',
    title: 'Medical alert resolved',
    body: 'First responders cleared the Kilimani case.',
    time: '21m ago',
  },
  {
    id: 'weather-update',
    title: 'Weather advisory',
    body: 'Heavy rain expected around Nairobi tonight.',
    time: '1h ago',
  },
]

export default function TopNav() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const notificationsRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Load user profile image from current user
    const currentUser = getCurrentUser()
    if (currentUser?.profileImageUrl) {
      setProfileImage(currentUser.profileImageUrl)
    }
    // update when profile changes server-side
    const handler = (e) => {
      const profile = e?.detail || null
      setProfileImage(profile?.profileImageUrl || null)
    }
    window.addEventListener('jiranialert_profile_updated', handler)
    return () => window.removeEventListener('jiranialert_profile_updated', handler)
  }, [])

  useEffect(() => {
    const onPointerDown = (e) => {
      const path = e.composedPath && e.composedPath()
      const clickedNotifications = notificationsRef.current && (path ? path.includes(notificationsRef.current) : notificationsRef.current.contains(e.target))
      const clickedProfile = profileRef.current && (path ? path.includes(profileRef.current) : profileRef.current.contains(e.target))

      if (!clickedNotifications) setNotificationsOpen(false)
      if (!clickedProfile) setProfileOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleProfileImageUpload = (imageUrl) => {
    setProfileImage(imageUrl)
  }

  const requestLogout = () => {
    setProfileOpen(false)
    setLogoutOpen(true)
  }

  const confirmLogout = async () => {
    await logoutUser()
    setLogoutNotice()
    setLogoutOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="sticky top-[var(--announcement-bar-height)] z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="flex w-full items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E53935] text-white shadow-[0_14px_30px_rgba(229,57,53,0.28)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase tracking-[0.22em] text-[#1E3A5F]">Jirani Alert</p>
              <p className="truncate text-xs text-slate-500">Emergency response dashboard</p>
            </div>
          </div>

          <div className="hidden flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search alerts, neighbors, or locations"
              className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

            <div className="ml-auto flex items-center gap-2">
              <div
                className="relative"
                ref={notificationsRef}
                onMouseEnter={() => setNotificationsOpen(true)}
                onMouseLeave={() => setNotificationsOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((s) => !s)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-[#E53935]/30 hover:text-[#E53935]"
                  aria-haspopup="menu"
                  aria-expanded={notificationsOpen}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-[11px] font-bold text-white">0</span>
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      role="menu"
                      aria-label="Notifications menu"
                      className="absolute right-0 top-full z-50 w-80 pt-2"
                    >
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">Notifications</p>
                            <p className="mt-0.5 text-xs text-slate-500">Latest resident updates</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">0 new</span>
                        </div>

                        <div className="max-h-72 overflow-y-auto p-2 scrollbar-custom">
                          {notificationPreview.map((item) => (
                            <Link
                              key={item.id}
                              to="/resident/notifications"
                              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.body}</p>
                                </div>
                                <span className="shrink-0 text-[11px] font-semibold text-slate-400">{item.time}</span>
                              </div>
                            </Link>
                          ))}
                        </div>

                        <Link
                          to="/resident/notifications"
                          className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm font-bold text-[#1E3A5F] hover:bg-slate-50"
                        >
                          View all notifications
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div
                className="relative"
                ref={profileRef}
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-colors hover:border-[#E53935]/30"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label="Profile menu"
                >
                  <Avatar src={profileImage} alt="Profile" size={32} />
                  <UserCircle2 className="hidden h-5 w-5 text-slate-500 sm:block" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      role="menu"
                      aria-label="Profile menu"
                      className="absolute right-0 top-full z-50 w-72 pt-2"
                    >
                      <div className="max-h-[22rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)] scrollbar-custom">
                        <div className="px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Quick Navigation</p>
                        </div>

                        <div className="grid gap-1">
                          {sidebarItems.map((item) => {
                            const Icon = item.icon
                            const active = item.label === 'Dashboard'
                            return (
                              <NavLink
                                key={item.to + item.label}
                                to={item.to}
                                onClick={() => {
                                  // keep the profile menu open when navigating inside resident area
                                  if (!item.to || !item.to.startsWith('/resident')) setProfileOpen(false)
                                }}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive || active ? 'bg-[#E53935] text-white' : 'text-slate-700 hover:bg-slate-50'}`
                                }
                              >
                                <Icon className="h-4.5 w-4.5" />
                                <span>{item.label}</span>
                              </NavLink>
                            )
                          })}
                        </div>

                        <div className="my-2 h-px bg-slate-200" />

                        {/* Upload removed from quick menu to avoid accidental changes; use Profile page */}
                        <div className="my-2 h-px bg-slate-200" />

                        <button
                          type="button"
                          onClick={requestLogout}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
        </div>
      </header>

      <LogoutConfirmModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
    </>
  )
}

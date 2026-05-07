import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Bell, Search, ShieldCheck, UserCircle2, ChevronRight, LogOut, LayoutDashboard, Siren, Navigation2, MessageSquare, FileText, LifeBuoy, Settings2 } from 'lucide-react'
import Avatar from '../UI/Avatar'

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

export default function TopNav() {
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
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
          <button type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-[11px] font-bold text-white">0</span>
          </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm"
                >
                  <Avatar src="/images/user.jpg" alt="Profile" size={32} />
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
                      className="absolute right-0 mt-2 w-72 max-h-[22rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)] scrollbar-custom"
                    >
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

                      <Link to="/resident/profile" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        Profile
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                      <Link to="/resident/profile" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        Settings
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                        <LogOut className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
        </div>
      </div>
    </header>
  )
}

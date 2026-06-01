import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  Siren,
  Users,
  X,
  Settings2,
} from 'lucide-react'
import { getCurrentUser, logout as logoutUser } from '../../lib/auth'

const menuItems = [
  { label: 'Incidents', to: '/responder/incidents', icon: AlertTriangle },
  { label: 'Reports', to: '/responder/reports', icon: FileText },
  { label: 'Equipment', to: '/responder/equipment', icon: ShieldCheck },
  { label: 'Team Members', to: '/responder/team-members', icon: Users },
  { label: 'Settings', to: '/responder/settings', icon: Settings2 },
  { label: 'Help/Support', to: '/responder/help-support', icon: MessageSquare },
]

export default function ResponderCommandBar() {
  const currentUser = getCurrentUser() || {}
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = menuOpen ? 'hidden' : previousOverflow

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    const shouldLogout = window.confirm('Are you sure you want to log out?')
    if (!shouldLogout) return
    await logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-[var(--announcement-bar-height)] z-50 border-b border-white/10 bg-[#070d19]/92 text-white shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-8">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/6 px-3 py-3 shadow-[0_18px_48px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:px-4 lg:px-5">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-blue-500 shadow-[0_18px_34px_rgba(239,68,68,0.32)] ring-1 ring-white/10">
                <Siren className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">Jirani Alert</p>
                <p className="truncate text-sm font-bold text-white sm:text-base lg:text-lg">Jirani Alert Emergency Responder Portal</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/45 text-slate-100 transition hover:border-red-400/30 focus:outline-none focus:ring-2 focus:ring-red-400/50"
              aria-label="Open responder menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="absolute left-3 right-3 top-[calc(var(--announcement-bar-height)+4.5rem)] z-[90] rounded-[1.5rem] border border-white/10 bg-[#09111e] shadow-[0_24px_60px_rgba(2,6,23,0.5)] sm:left-auto sm:right-4 sm:w-[24rem]"
                role="dialog"
                aria-modal="true"
                aria-label="Responder navigation menu"
              >
                <div className="border-b border-white/10 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Responder menu</p>
                      <p className="mt-1 text-sm text-slate-300">Select a page</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto p-3 scrollbar-custom">
                  <div className="space-y-2">
                    <Link
                      to="/responder/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-[4rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-slate-200 transition hover:bg-white/10"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/60 text-cyan-200">
                        <LayoutDashboard className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">Dashboard</span>
                        <span className="block text-[11px] text-slate-400">Overview and live status</span>
                      </span>
                    </Link>

                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex min-h-[4rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-slate-200 transition hover:border-red-400/30 hover:bg-white/10 hover:text-white"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/60 text-cyan-200">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold">{item.label}</span>
                            <span className="block text-[11px] text-slate-400">Open {item.label.toLowerCase()} page</span>
                          </span>
                        </Link>
                      )
                    })}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 flex min-h-[4rem] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-red-200 transition hover:border-red-400/30 hover:bg-red-500/10"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-200">
                        <LogOut className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">Log Out</span>
                        <span className="block text-[11px] text-red-100/70">Exit your session</span>
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
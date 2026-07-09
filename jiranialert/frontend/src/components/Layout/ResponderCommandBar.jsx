import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard, LogOut, Menu, ShieldAlert, Siren, X } from 'lucide-react'
import { getCurrentUser, getPreferredUserName, logout as logoutUser } from '../../lib/auth'
import { accountLinks, workspaceLinks } from '../../pages/responder/responderUtils'

function Dropdown({ label, items, open, onToggle, onClose }) {
  const buttonRef = useRef(null)

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-12 z-[80] w-[18rem] rounded-[22px] border border-white/10 bg-[#07111f] p-2 shadow-[0_24px_70px_rgba(2,6,23,0.55)]"
            role="menu"
          >
            {items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-red-500/18 text-red-100' : 'text-slate-200 hover:bg-white/8 hover:text-white'}`
                  }
                  role="menuitem"
                >
                  <Icon className="h-4 w-4 text-cyan-200" />
                  {item.label}
                </NavLink>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function ResponderCommandBar() {
  const currentUser = getCurrentUser() || {}
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setOpenMenu(null)
        setLogoutPromptOpen(false)
      }
    }
    const onClick = (event) => {
      if (!event.target.closest('[data-responder-nav]')) setOpenMenu(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  const responderName = getPreferredUserName(currentUser) || currentUser.displayName || 'Emergency Responder'

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  const mobileItems = [
    { label: 'Dashboard', to: '/responder/dashboard', icon: LayoutDashboard },
    ...workspaceLinks,
    ...accountLinks,
  ]

  return (
    <header data-responder-nav className="sticky top-[var(--announcement-bar-height)] z-50 border-b border-white/10 bg-[#06101d]/92 text-white shadow-[0_22px_70px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-8">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 px-3 py-3 backdrop-blur-xl sm:px-4">
          <div className="flex items-center gap-3">
            <Link to="/responder/dashboard" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-cyan-500 shadow-[0_18px_34px_rgba(239,68,68,0.3)]">
                <Siren className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Jirani Alert</p>
                <p className="truncate text-sm font-black text-white sm:text-base">Emergency Responder Portal</p>
              </div>
            </Link>

            <nav className="ml-auto hidden items-center gap-2 lg:flex">
              <NavLink
                to="/responder/dashboard"
                className={({ isActive }) =>
                  `inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-bold transition ${isActive ? 'border-red-400/35 bg-red-500/15 text-red-100' : 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'}`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <Dropdown label="Workspace" items={workspaceLinks} open={openMenu === 'workspace'} onToggle={() => setOpenMenu(openMenu === 'workspace' ? null : 'workspace')} onClose={() => setOpenMenu(null)} />
              <Dropdown label="Account" items={accountLinks} open={openMenu === 'account'} onToggle={() => setOpenMenu(openMenu === 'account' ? null : 'account')} onClose={() => setOpenMenu(null)} />
              <button type="button" onClick={() => setLogoutPromptOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 text-sm font-bold text-red-100 transition hover:bg-red-500/20">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>

            <div className="ml-auto hidden min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 xl:flex">
              <ShieldAlert className="h-4 w-4 text-cyan-200" />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{responderName}</p>
                <p className="truncate text-[11px] text-slate-400">Responder online</p>
              </div>
            </div>

            <button type="button" onClick={() => setMobileOpen((value) => !value)} className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/45 text-slate-100 transition hover:bg-white/10 lg:hidden" aria-label="Open responder menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileOpen ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden lg:hidden">
                <div className="mt-3 max-h-[70dvh] overflow-y-auto border-t border-white/10 pt-3 scrollbar-custom">
                  <div className="grid gap-2">
                    {mobileItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-red-500/18 text-red-100' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`
                          }
                        >
                          <Icon className="h-4 w-4 text-cyan-200" />
                          {item.label}
                        </NavLink>
                      )
                    })}
                    <button type="button" onClick={() => setLogoutPromptOpen(true)} className="flex items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {logoutPromptOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4">
            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="w-full max-w-md rounded-[26px] border border-white/10 bg-[#07111f] p-5 shadow-[0_24px_70px_rgba(2,6,23,0.55)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-200">Confirm logout</p>
              <h2 className="mt-2 text-xl font-black tracking-normal text-white">End responder session?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">You can sign back in anytime from the secure login page.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setLogoutPromptOpen(false)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white">Stay signed in</button>
                <button type="button" onClick={handleLogout} className="rounded-2xl border border-red-400/35 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100">Log out</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

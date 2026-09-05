import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Circle, ClipboardList, LayoutDashboard, LogOut, Menu, Radio, Search, Settings, ShieldCheck, Siren, Users, X } from 'lucide-react'
import Avatar from '../UI/Avatar'
import { getCurrentUser, getPreferredUserName, logout as logoutUser } from '../../lib/auth'
import LogoutConfirmModal from '../LogoutConfirmModal'
import OfflineConfirmModal from '../OfflineConfirmModal'
import { setLogoutNotice } from '../LogoutToast'
import { updateAvailability } from '../../lib/responderWorkspaceApi'

const navItems = [
  { label: 'Dashboard', to: '/responder/dashboard', icon: LayoutDashboard },
  { label: 'Incidents', to: '/responder/incidents', icon: Siren },
  { label: 'Dispatch Center', to: '/responder/dispatch', icon: Radio },
  { label: 'Resources', to: '/responder/resources', icon: Users },
  { label: 'Reports', to: '/responder/reports', icon: ClipboardList },
  { label: 'Settings', to: '/responder/settings', icon: Settings },
]
const workspaceItems = [
  ['My Assignments', '/responder/workspace/assignments'], ['Live Operations Map', '/responder/workspace/map'],
  ['Response Team', '/responder/workspace/team'], ['Communications', '/responder/workspace/communications'],
  ['Resources & Equipment', '/responder/workspace/resources'], ['Shift Management', '/responder/workspace/shift'],
]

function Sidebar({ open, onNavigate, onLogout, onGoOffline, availability }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  return <aside className={`fixed inset-y-0 left-0 z-[70] flex w-[266px] flex-col bg-[#142338] px-3 pb-5 pt-6 text-white shadow-2xl transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
    <Link to="/responder/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 shadow-lg shadow-red-950/30"><Siren className="h-6 w-6" /></span><span><strong className="block text-xl tracking-tight">JIRANI ALERT</strong><small className="mt-0.5 block text-sm text-slate-200">Emergency Responder Portal</small></span></Link>
    <nav className="mt-12 grid gap-1"><div><button type="button" onClick={() => setWorkspaceOpen((value) => !value)} className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"><ClipboardList className="h-5 w-5 text-slate-300" />Workspace<ChevronDown className={`ml-auto h-4 w-4 transition ${workspaceOpen ? 'rotate-180' : ''}`} /></button>{workspaceOpen ? <div className="ml-6 grid border-l border-white/15 pl-3">{workspaceItems.map(([label, to]) => <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `py-2 text-xs font-semibold transition ${isActive ? 'text-red-300' : 'text-slate-300 hover:text-white'}`}>{label}</NavLink>)}</div> : null}</div>{navItems.map(({ label, to, icon: Icon }) => <NavLink key={label} to={to} onClick={onNavigate} className={({ isActive }) => `group flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${isActive ? 'bg-white/15 text-white shadow-[inset_3px_0_0_#ef4444]' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}><Icon className={`h-5 w-5 ${label === 'Dashboard' ? 'text-red-400' : 'text-slate-300 group-hover:text-white'}`} />{label}</NavLink>)}</nav>
    <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${availability === 'Online' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}><ShieldCheck className="h-5 w-5" /></span><div><p className="font-bold">You're {availability}</p><p className="mt-0.5 text-xs text-slate-300">{availability === 'Online' ? 'Ready to respond' : 'Not available for new assignments'}</p></div></div><button type="button" onClick={onGoOffline} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/80 px-3 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-amber-500/10"><Circle className="h-4 w-4 fill-current" /> {availability === 'Offline' ? 'Go Online' : 'Go Offline'}</button><button type="button" onClick={onLogout} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/80 px-3 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Logout</button></div>
  </aside>
}

export default function ResponderCommandBar() {
  const currentUser = getCurrentUser() || {}
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [offlineOpen, setOfflineOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [availability, setAvailability] = useState(currentUser.availability || 'Online')
  const responderName = getPreferredUserName(currentUser) || currentUser.displayName || 'Emergency Responder'
  const handleLogout = async () => {
    await logoutUser()
    setLogoutNotice()
    navigate('/', { replace: true })
  }
  const handleAvailability = async () => {
    setBusy(true)
    try {
      const next = availability === 'Offline' ? 'Online' : 'Offline'
      const response = await updateAvailability(next)
      setAvailability(response.member?.availability || next)
      setOfflineOpen(false)
    } finally {
      setBusy(false)
    }
  }
  return <>
    {mobileOpen ? <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-[60] bg-slate-950/45 lg:hidden" /> : null}
    <Sidebar open={mobileOpen} onNavigate={() => setMobileOpen(false)} onLogout={() => setLogoutOpen(true)} onGoOffline={() => availability === 'Offline' ? void handleAvailability() : setOfflineOpen(true)} availability={availability} />
    <div className="flex h-10 items-center justify-center bg-red-600 px-4 text-sm font-bold text-white lg:ml-[266px]"><Siren className="mr-2 h-4 w-4" /> Emergency Hotline: 999 available 24/7</div>
    <header className="sticky top-0 z-50 bg-white shadow-sm lg:ml-[266px]"><div className="flex h-20 items-center border-b border-slate-200 px-4 sm:px-6"><button type="button" onClick={() => setMobileOpen((value) => !value)} className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Toggle responder navigation">{mobileOpen ? <X /> : <Menu />}</button><button type="button" className="hidden text-slate-700 lg:inline-flex" aria-label="Navigation menu"><Menu className="h-6 w-6" /></button><label className="hidden w-full max-w-md md:relative md:ml-0 md:block lg:ml-12"><span className="sr-only">Search incidents, responders, or locations</span><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" /><input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100" placeholder="Search incidents, responders, or locations..." /></label><div className="ml-auto flex items-center gap-4"><button type="button" className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-6 w-6" /><span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span></button><div className="hidden h-9 w-px bg-slate-200 sm:block" /><button type="button" className="flex items-center gap-3 text-left"><Avatar src={currentUser.profileImageUrl} alt={responderName} size={42} /><span className="hidden sm:block"><strong className="block text-sm text-slate-800">{responderName}</strong><small className="flex items-center gap-1 text-xs text-slate-500"><i className="h-2 w-2 rounded-full bg-emerald-500" />Responder Online</small></span><ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" /></button></div></div></header>
    <LogoutConfirmModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={handleLogout} busy={busy} />
    <OfflineConfirmModal open={offlineOpen} onCancel={() => setOfflineOpen(false)} onConfirm={handleAvailability} busy={busy} />
  </>
}

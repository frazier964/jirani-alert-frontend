import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, ClipboardList, LayoutDashboard, LogOut, Radio, Search, Settings, ShieldCheck, Siren, Users } from 'lucide-react'
import Avatar from '../UI/Avatar'
import { getCurrentUser, getPreferredUserName, logout as logoutUser } from '../../lib/auth'
import LogoutConfirmModal from '../LogoutConfirmModal'
import { setLogoutNotice } from '../LogoutToast'

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

export default function ResponderCommandBar() {
  const currentUser = getCurrentUser() || {}
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const availability = currentUser.availability || 'Online'
  const responderName = getPreferredUserName(currentUser) || currentUser.displayName || 'Emergency Responder'
  const handleLogout = async () => {
    setLogoutBusy(true)
    try {
      await logoutUser()
      setLogoutNotice()
      navigate('/', { replace: true })
    } finally {
      setLogoutBusy(false)
    }
  }
  const closeMenu = () => {
    setProfileOpen(false)
    setWorkspaceOpen(false)
  }
  return <>
    <div className="flex h-10 items-center justify-center bg-red-600 px-4 text-sm font-bold text-white"><Siren className="mr-2 h-4 w-4" /> Emergency Hotline: 999 available 24/7</div>
    <header className="sticky top-0 z-50 bg-white shadow-sm"><div className="flex h-20 items-center border-b border-slate-200 px-4 sm:px-6"><label className="hidden w-full max-w-md md:relative md:block lg:ml-12"><span className="sr-only">Search incidents, responders, or locations</span><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" /><input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100" placeholder="Search incidents, responders, or locations..." /></label><div className="relative ml-auto flex items-center gap-4"><button type="button" onClick={() => navigate('/responder/notifications')} className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-6 w-6" /><span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span></button><div className="hidden h-9 w-px bg-slate-200 sm:block" /><button type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen} aria-haspopup="menu" className="flex items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-slate-100"><Avatar src={currentUser.profileImageUrl} alt={responderName} size={42} /><span className="hidden sm:block"><strong className="block text-sm text-slate-800">{responderName}</strong><small className="flex items-center gap-1 text-xs text-slate-500"><i className="h-2 w-2 rounded-full bg-emerald-500" />Responder Online</small></span><ChevronDown className={`h-4 w-4 text-slate-400 transition ${profileOpen ? 'rotate-180' : ''}`} /></button>
    {profileOpen ? <div role="menu" className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] max-h-[calc(100vh-7rem)] w-[min(92vw,22rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-2xl">
      <div className="border-b border-slate-200 px-3 pb-3"><p className="font-black text-slate-900">{responderName}</p><p className="mt-1 text-xs text-slate-500">Responder account · {availability}</p></div>
      <nav className="mt-3 grid gap-1">{navItems.map(({ label, to, icon: Icon }) => <NavLink key={label} to={to} onClick={closeMenu} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-red-50 text-red-700' : 'hover:bg-slate-50'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}<button type="button" onClick={() => setWorkspaceOpen((value) => !value)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-slate-50"><ClipboardList className="h-4 w-4" />Workspace<ChevronDown className={`ml-auto h-4 w-4 transition ${workspaceOpen ? 'rotate-180' : ''}`} /></button>{workspaceOpen ? <div className="ml-7 grid border-l border-slate-200 pl-3">{workspaceItems.map(([label, to]) => <NavLink key={to} to={to} onClick={closeMenu} className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-50">{label}</NavLink>)}</div> : null}</nav>
      <div className="mt-3 border-t border-slate-200 pt-3"><NavLink to="/responder/profile" onClick={closeMenu} className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-slate-50">Profile</NavLink><div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"><ShieldCheck className="h-5 w-5 text-emerald-600" /><div><p className="text-sm font-bold">You're {availability}</p><p className="text-xs text-slate-500">{availability === 'Online' ? 'Ready to respond' : 'Not available for new assignments'}</p></div></div><button type="button" onClick={() => { closeMenu(); setLogoutOpen(true) }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-bold text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" /> Logout</button></div>
    </div> : null}</div></div></header>
    <LogoutConfirmModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={handleLogout} busy={logoutBusy} />
  </>
}

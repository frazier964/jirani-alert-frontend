import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  ClipboardCheck,
  Check,
  Clock3,
  FileClock,
  Gavel,
  LayoutDashboard,
  MapPin,
  Map,
  Menu,
  Megaphone,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { getCurrentUser, logout } from '../../lib/auth'
import { createBroadcast, getAdminDashboard, moderateAlert, reviewResident } from '../../lib/adminApi'
import { Link, useNavigate } from 'react-router-dom'

const sidebarItems = [
  ['Overview', LayoutDashboard, '/admin/dashboard'],
  ['Member verification', ClipboardCheck, '/admin/member-verification'],
  ['Alert moderation', Gavel, '/admin/alert-moderation'],
  ['Resident directory', Building2, '/admin/users'],
  ['User management', Users, '/admin/users'],
  ['Responder management', ShieldCheck, '/admin/responders'],
  ['Incident management', AlertTriangle, '/admin/incidents'],
  ['Incident map', Map, '/admin/map'],
  ['Analytics', BarChart3, '/admin/analytics'],
  ['Audit logs', FileClock, '/admin/audit-logs'],
  ['Settings', Settings, '/admin/settings'],
]

const demoDashboard = {
  stats: { pendingResidents: 8, activeAlerts: 6, verifiedResidents: 120 },
  pendingResidents: [
    { id: 'demo-resident-2', fullName: 'David Otieno', email: 'david@example.com', houseNumber: 'B-07', createdAt: '2026-10-09T10:15:00Z' },
  ],
  alerts: [
    { id: 'demo-alert-1', title: 'Suspicious activity reported', location: 'North entrance', severity: 'High', createdAt: '2026-10-11T09:20:00Z' },
  ],
  residents: [
    { id: 'demo-resident-1', fullName: 'Amina Wanjiku', email: 'amina@example.com', houseNumber: 'A-14', accountStatus: 'active' },
  ],
}

function formatDate(value) {
  if (!value) return 'Recently'
  const date = value.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString()
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const activeTab = 'verification'
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [broadcast, setBroadcast] = useState({ title: '', message: '', severity: 'Info' })

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      setDashboard(await getAdminDashboard())
    } catch (err) {
      setError(err.message || 'Unable to load the admin dashboard.')
      setDashboard(demoDashboard)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const currentUser = getCurrentUser()
  const filteredResidents = useMemo(() => {
    const value = search.trim().toLowerCase()
    return (dashboard?.residents || []).filter((resident) => {
      if (!value) return true
      return [resident.fullName, resident.email, resident.phoneNumber, resident.houseNumber]
        .some((field) => String(field || '').toLowerCase().includes(value))
    })
  }, [dashboard?.residents, search])

  const runAction = async (id, action, callback) => {
    setWorkingId(id)
    setError('')
    setNotice('')
    try {
      await callback(id, action)
      setNotice('Action recorded successfully.')
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'The action could not be completed.')
    } finally {
      setWorkingId('')
    }
  }

  const submitBroadcast = async (event) => {
    event.preventDefault()
    setWorkingId('broadcast')
    setError('')
    setNotice('')
    try {
      await createBroadcast(broadcast.title, broadcast.message, broadcast.severity)
      setBroadcast({ title: '', message: '', severity: 'Info' })
      setBroadcastOpen(false)
      setNotice('Estate-wide broadcast sent.')
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'The broadcast could not be sent.')
    } finally {
      setWorkingId('')
    }
  }

  const signOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (loading && !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] p-8 text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold shadow-sm">
          Loading admin portal...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#111827] text-slate-300 lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 px-7 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
              <img src="/jirani-alert-logo.svg" alt="JiraniAlert logo" className="h-full w-full" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">JIRANI<span className="text-red-400">ALERT</span></p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Admin workspace</p>
            </div>
          </div>
          <div className="px-4 py-7">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <nav className="mt-3 space-y-1">
              {sidebarItems.map(([label, Icon, path], index) => (
                <Link
                  key={label}
                  to={path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${index === 0 ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon className={`h-[18px] w-[18px] ${index === 0 ? 'text-[#2563eb]' : 'text-slate-500'}`} />
                  {label}
                </Link>
              ))}
            </nav>
            <p className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">System</p>
            <Link to="/admin/announcements" className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:bg-white/10 hover:text-white">
              <Megaphone className="h-[18px] w-[18px] text-slate-500" /> Broadcast center
            </Link>
          </div>
          <div className="mt-auto border-t border-white/10 p-4">
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-xs font-black text-red-300">AD</span>
              <span className="min-w-0 flex-1 truncate">{currentUser?.email || 'Local administrator'}</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open admin navigation" className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                  <img src="/jirani-alert-logo.svg" alt="JiraniAlert logo" className="h-full w-full" />
                </div>
                <p className="text-base font-black tracking-tight text-slate-900">JIRANI<span className="text-red-600">ALERT</span></p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Estate operations</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{dashboard?.jurisdictionName || dashboard?.estateId || 'Unassigned estate'}</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <button type="button" aria-label="Notifications" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
                </button>
                <button type="button" onClick={signOut} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:text-sm">Sign out</button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold text-[#2563eb]">Good day, administrator</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Community overview</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Monitor resident access, respond to local alerts, and keep your estate informed from one place.</p>
              </div>
              <button type="button" onClick={() => setBroadcastOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/15 transition hover:bg-red-700">
                <Megaphone className="h-4 w-4" /> New broadcast
              </button>
            </div>

        {error && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Demo data is displayed while the administrator service is unavailable.</div>}
        {notice && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Pending resident requests" value={dashboard?.stats?.pendingResidents ?? 0} icon={Clock3} tone="bg-amber-100 text-amber-700" />
          <StatCard label="Active local alerts" value={dashboard?.stats?.activeAlerts ?? 0} icon={AlertTriangle} tone="bg-red-100 text-red-700" />
          <StatCard label="Verified residents" value={dashboard?.stats?.verifiedResidents ?? 0} icon={Users} tone="bg-emerald-100 text-emerald-700" />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3">
            <button type="button" onClick={() => navigate('/admin/member-verification')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeTab === 'verification' ? 'bg-[#102a43] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Member verification</button>
            <button type="button" onClick={() => navigate('/admin/alert-moderation')} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">Alert moderation</button>
            <button type="button" onClick={() => navigate('/admin/users')} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">Resident directory</button>
          </div>

          {activeTab === 'verification' && (
            <div className="divide-y divide-slate-100">
              <div className="p-6">
                <h3 className="text-lg font-black text-slate-950">Review resident requests</h3>
                <p className="mt-1 text-sm text-slate-500">Cross-check submitted identity and residence details before granting access.</p>
              </div>
              {(dashboard?.pendingResidents || []).length === 0 && <p className="px-6 pb-6 text-sm text-slate-500">No pending requests in this estate.</p>}
              {(dashboard?.pendingResidents || []).map((resident) => (
                <div key={resident.id} className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">{resident.fullName || resident.displayName || resident.email}</p>
                    <p className="mt-1 text-sm text-slate-500">{resident.email} · {resident.phoneNumber || 'Phone not provided'} · House {resident.houseNumber || 'not provided'}</p>
                    <p className="mt-1 text-xs text-slate-400">Requested {formatDate(resident.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" disabled={workingId === resident.id} onClick={() => runAction(resident.id, 'approve', reviewResident)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" /> Approve</button>
                    <button type="button" disabled={workingId === resident.id} onClick={() => runAction(resident.id, 'reject', reviewResident)} className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="divide-y divide-slate-100">
              <div className="p-6"><h3 className="text-lg font-black text-slate-950">Moderate local alerts</h3><p className="mt-1 text-sm text-slate-500">Pin useful notices or dismiss resolved and irrelevant alerts.</p></div>
              {(dashboard?.alerts || []).length === 0 && <p className="px-6 pb-6 text-sm text-slate-500">No active alerts in this estate.</p>}
              {(dashboard?.alerts || []).map((alert) => (
                <div key={alert.id} className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-950">{alert.title || alert.type || 'Community alert'}</p><span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">{alert.severity || 'Alert'}</span></div><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" /> {alert.location || 'Estate area'} · {formatDate(alert.createdAt)}</p></div>
                  <div className="flex gap-2"><button type="button" disabled={workingId === alert.id} onClick={() => runAction(alert.id, 'pin', moderateAlert)} className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 disabled:opacity-50">Pin</button><button type="button" disabled={workingId === alert.id} onClick={() => runAction(alert.id, 'dismiss', moderateAlert)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">Dismiss</button></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'directory' && (
            <div>
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-black text-slate-950">Resident directory</h3><p className="mt-1 text-sm text-slate-500">Only approved members assigned to this estate are shown.</p></div><label className="flex items-center rounded-xl border border-slate-200 px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search residents" className="ml-2 w-full bg-transparent text-sm outline-none sm:w-56" /></label></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3">Resident</th><th className="px-6 py-3">Contact</th><th className="px-6 py-3">House</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredResidents.map((resident) => <tr key={resident.id}><td className="px-6 py-4 font-bold text-slate-950">{resident.fullName || resident.displayName || resident.email}</td><td className="px-6 py-4 text-slate-500">{resident.phoneNumber || resident.email}</td><td className="px-6 py-4 text-slate-500">{resident.houseNumber || '—'}</td><td className="px-6 py-4"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{resident.accountStatus || 'active'}</span></td><td className="px-6 py-4"><button type="button" disabled={workingId === resident.id} onClick={() => runAction(resident.id, 'suspend', reviewResident)} className="font-bold text-red-600 disabled:opacity-50">Suspend</button></td></tr>)}</tbody></table>{filteredResidents.length === 0 && <p className="p-6 text-sm text-slate-500">No residents match this search.</p>}</div>
            </div>
          )}
        </section>
      </div>
          </div>
        </div>
        {mobileNavOpen ? <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close admin navigation" onClick={() => setMobileNavOpen(false)} className="absolute inset-0 bg-slate-950/60" />
          <aside className="relative flex h-full w-[min(86vw,20rem)] flex-col bg-[#111827] text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
              <div className="flex items-center gap-3"><img src="/jirani-alert-logo.svg" alt="JiraniAlert logo" className="h-10 w-10 rounded-xl bg-white p-2" /><p className="font-black text-white">JIRANI<span className="text-red-400">ALERT</span></p></div>
              <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close admin navigation" className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-1 overflow-y-auto px-4 py-6">
              {sidebarItems.map(([label, Icon, path], index) => <Link key={label} to={path} onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white ${index === 0 ? 'bg-white text-slate-900 shadow-sm' : ''}`}><Icon className={`h-[18px] w-[18px] ${index === 0 ? 'text-[#2563eb]' : 'text-slate-500'}`} />{label}</Link>)}
              <Link to="/admin/announcements" onClick={() => setMobileNavOpen(false)} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-white/10 hover:text-white"><Megaphone className="h-[18px] w-[18px] text-slate-500" />Broadcast center</Link>
            </nav>
          </aside>
        </div> : null}

        {broadcastOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={submitBroadcast} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">Broadcast to {dashboard?.jurisdictionName || dashboard?.estateId}</h2><p className="mt-1 text-sm text-slate-500">This message will be delivered to approved residents in this estate.</p></div><button type="button" onClick={() => setBroadcastOpen(false)} aria-label="Close broadcast dialog"><X /></button></div><input required value={broadcast.title} onChange={(event) => setBroadcast((state) => ({ ...state, title: event.target.value }))} placeholder="Announcement title" className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /><select value={broadcast.severity} onChange={(event) => setBroadcast((state) => ({ ...state, severity: event.target.value }))} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3"><option>Info</option><option>Warning</option><option>Urgent</option></select><textarea required value={broadcast.message} onChange={(event) => setBroadcast((state) => ({ ...state, message: event.target.value }))} placeholder="Write the official estate announcement..." rows="5" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /><button type="submit" disabled={workingId === 'broadcast'} className="mt-4 w-full rounded-xl bg-[#102a43] px-4 py-3 font-bold text-white disabled:opacity-50">Send broadcast</button></form></div>}
    </main>
  )
}

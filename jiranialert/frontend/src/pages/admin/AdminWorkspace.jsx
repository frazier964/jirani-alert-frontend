import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  Check,
  ClipboardList,
  FileClock,
  LayoutDashboard,
  Map,
  Megaphone,
  ClipboardCheck,
  Download,
  Gavel,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { getCurrentUser, logout } from '../../lib/auth'
import { createBroadcast, getAdminDashboard, manageIncident, manageUser, moderateAlertWithReason, reviewResponder, reviewResident } from '../../lib/adminApi'
import AdminSettings from './AdminSettings'
import LogoutConfirmModal from '../../components/LogoutConfirmModal'

const navigation = [
  ['dashboard', 'Overview', LayoutDashboard, '/admin/dashboard'],
  ['member-verification', 'Member Verification', ClipboardCheck, '/admin/member-verification'],
  ['alert-moderation', 'Alert Moderation', Gavel, '/admin/alert-moderation'],
  ['users', 'User management', Users, '/admin/users'],
  ['responders', 'Responder management', ShieldCheck, '/admin/responders'],
  ['incidents', 'Incident management', AlertTriangle, '/admin/incidents'],
  ['announcements', 'Announcements', Megaphone, '/admin/announcements'],
  ['map', 'Incident map', Map, '/admin/map'],
  ['analytics', 'Analytics', BarChart3, '/admin/analytics'],
  ['audit-logs', 'Audit logs', FileClock, '/admin/audit-logs'],
  ['support', 'Support', Bell, '/admin/support'],
  ['settings', 'Settings', Settings, '/admin/settings'],
]

const titleByPage = Object.fromEntries(navigation.map(([id, label]) => [id, label]))

const demoAdminData = {
  jurisdictionName: 'JiraniAlert Demo Estate',
  stats: {
    totalResidents: 128,
    totalResponders: 14,
    activeIncidents: 6,
    resolvedIncidents: 42,
    pendingResidents: 8,
    verifiedResidents: 120,
    pendingAlerts: 5,
    publishedAlerts: 31,
  },
  residents: [
    { id: 'demo-resident-1', fullName: 'Amina Wanjiku', email: 'amina@example.com', role: 'resident', accountStatus: 'active', createdAt: '2026-10-08T08:30:00Z', houseNumber: 'A-14' },
    { id: 'demo-resident-2', fullName: 'David Otieno', email: 'david@example.com', role: 'resident', accountStatus: 'pending_verification', createdAt: '2026-10-09T10:15:00Z', houseNumber: 'B-07' },
  ],
  responders: [
    { id: 'demo-responder-1', fullName: 'Grace Mwangi', email: 'grace@example.com', role: 'responder', accountStatus: 'active', createdAt: '2026-09-22T07:00:00Z' },
  ],
  pendingResponders: [],
  pendingResidents: [
    { id: 'demo-resident-2', fullName: 'David Otieno', email: 'david@example.com', houseNumber: 'B-07', createdAt: '2026-10-09T10:15:00Z' },
  ],
  incidents: [
    { id: 'demo-incident-1', title: 'Water interruption near gate B', location: 'Gate B', severity: 'Medium', status: 'In Progress', createdAt: '2026-10-11T06:45:00Z' },
    { id: 'demo-incident-2', title: 'Streetlight outage', location: 'Mango Lane', severity: 'Low', status: 'Resolved', createdAt: '2026-10-10T18:20:00Z' },
  ],
  alerts: [
    { id: 'demo-alert-1', title: 'Suspicious activity reported', location: 'North entrance', severity: 'High', status: 'Pending', createdAt: '2026-10-11T09:20:00Z' },
  ],
  broadcasts: [
    { id: 'demo-broadcast-1', title: 'Community safety meeting', message: 'Meeting at the residents hall on Saturday.', severity: 'Info', createdAt: '2026-10-10T12:00:00Z' },
  ],
  auditLogs: [
    { id: 'demo-audit-1', action: 'alert_reviewed', actorEmail: 'admin@example.com', createdAt: '2026-10-11T09:30:00Z' },
  ],
  verificationRequests: [
    { id: 'demo-resident-2', fullName: 'David Otieno', email: 'david@example.com', role: 'resident', accountStatus: 'pending_verification', createdAt: '2026-10-09T10:15:00Z', submittedAt: '2026-10-09T10:20:00Z', houseNumber: 'B-07' },
    { id: 'demo-resident-1', fullName: 'Amina Wanjiku', email: 'amina@example.com', role: 'resident', accountStatus: 'active', createdAt: '2026-10-08T08:30:00Z', submittedAt: '2026-10-08T08:35:00Z', houseNumber: 'A-14' },
  ],
}

function valueDate(value) {
  if (!value) return 'Not available'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleString()
}

function exportAnalytics(data) {
  const rows = [
    ['Metric', 'Value'],
    ['Total reports', (data?.incidents || []).length],
    ['Pending responders', data?.stats?.pendingResponders ?? 0],
    ['Active alerts', data?.stats?.activeAlerts ?? 0],
    ['Verified residents', data?.stats?.verifiedResidents ?? 0],
    ['Exported at', new Date().toISOString()],
  ]
  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'jiranialert-local-analytics.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function statusClass(status) {
  const value = String(status || '').toLowerCase()
  if (['active', 'approved', 'resolved', 'completed'].includes(value)) return 'bg-emerald-100 text-emerald-700'
  if (['suspended', 'rejected', 'critical', 'urgent'].includes(value)) return 'bg-red-100 text-red-700'
  if (['pending', 'under review', 'assigned', 'in progress'].includes(value)) return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

function Badge({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(value)}`}>{value || 'Unknown'}</span>
}

function Card({ title, value, detail, icon: Icon, tone = 'text-blue-600' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${tone}`}><Icon className="h-5 w-5" /></div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-400">{detail}</p> : null}
    </div>
  )
}

export default function AdminWorkspace({ section: sectionProp }) {
  const params = useParams()
  const section = sectionProp || params.section || 'dashboard'
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [workingId, setWorkingId] = useState('')
  const [notice, setNotice] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [broadcast, setBroadcast] = useState({ title: '', message: '', severity: 'Info' })
  const currentUser = getCurrentUser()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setData(await getAdminDashboard())
    } catch (err) {
      setError(err.message || 'Unable to load administrator data.')
      setData(demoAdminData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    const refreshTimer = window.setInterval(() => { void load() }, 15000)
    return () => {
      window.clearTimeout(timer)
      window.clearInterval(refreshTimer)
    }
  }, [])

  const run = async (id, callback) => {
    setWorkingId(id)
    setError('')
    setNotice('')
    try {
      await callback()
      setNotice('Action recorded successfully.')
      await load()
    } catch (err) {
      setError(err.message || 'The action could not be completed.')
    } finally {
      setWorkingId('')
    }
  }

  const requestSignOut = () => {
    setMobileNavOpen(false)
    setLogoutOpen(true)
  }

  const signOut = async () => {
    setLogoutBusy(true)
    try {
      await logout()
      setLogoutOpen(false)
      navigate('/', { replace: true })
    } finally {
      setLogoutBusy(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const needle = query.toLowerCase().trim()
    return (data?.residents || []).concat(data?.responders || []).filter((user) =>
      !needle || `${user.fullName} ${user.displayName} ${user.email} ${user.role}`.toLowerCase().includes(needle))
  }, [data, query])

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#111827] text-slate-300 lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 px-7 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2"><img src="/jirani-alert-logo.svg" alt="JiraniAlert logo" /></div>
            <p className="text-lg font-black text-white">JIRANI<span className="text-red-400">ALERT</span></p>
          </div>
          <nav className="space-y-1 px-4 py-7">
            {navigation.map(([id, label, Icon, to]) => (
              <Link key={id} to={to} onClick={() => setMobileNavOpen(false)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white ${section === id ? 'bg-white text-slate-900 shadow-sm' : ''}`}>
                <Icon className={`h-[18px] w-[18px] ${section === id ? 'text-blue-600' : 'text-slate-500'}`} />{label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 p-4">
            <button type="button" onClick={requestSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-xs font-black text-red-300">AD</span>
              <span className="min-w-0 flex-1 truncate">{currentUser?.email || 'Administrator'}</span><X className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open admin navigation" className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100">
                  <Activity className="h-5 w-5" />
                </button>
                <img src="/jirani-alert-logo.svg" alt="JiraniAlert logo" className="h-9 w-9 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200" />
                <p className="font-black">JIRANI<span className="text-red-600">ALERT</span></p>
              </div>
              <div className="hidden sm:block"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Admin workspace</p><p className="mt-1 text-sm font-bold text-slate-700">{data?.jurisdictionName || 'Assigned estate'}</p></div>
              <div className="ml-auto flex items-center gap-3"><button type="button" onClick={load} aria-label="Refresh" className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button><button type="button" onClick={requestSignOut} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Sign out</button></div>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold text-blue-600">JiraniAlert administration</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{titleByPage[section] || 'Admin workspace'}</h1><p className="mt-2 text-sm text-slate-500">Manage verified community operations with actions recorded in the audit log.</p></div>{['dashboard', 'announcements'].includes(section) ? <button type="button" onClick={() => setBroadcastOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"><Megaphone className="h-4 w-4" /> New announcement</button> : null}</div>
            {error ? <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Demo data is displayed while the administrator service is unavailable.</div> : null}
            {notice ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div> : null}
            {loading && !data ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading verified administrator data...</div> : <PageContent section={section} data={data} query={query} setQuery={setQuery} filteredUsers={filteredUsers} workingId={workingId} run={run} />}
          </div>
        </div>
      </div>

      {mobileNavOpen ? <div className="fixed inset-0 z-40 lg:hidden">
        <button type="button" aria-label="Close admin navigation" onClick={() => setMobileNavOpen(false)} className="absolute inset-0 bg-slate-950/60" />
        <aside className="relative flex h-full w-[min(86vw,20rem)] flex-col bg-[#111827] text-slate-300 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
            <div className="flex items-center gap-3"><img src="/jirani-alert-logo.svg" alt="JiraniAlert logo" className="h-10 w-10 rounded-xl bg-white p-2" /><p className="font-black text-white">JIRANI<span className="text-red-400">ALERT</span></p></div>
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close admin navigation" className="rounded-lg p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
          <nav className="space-y-1 overflow-y-auto px-4 py-6">
            {navigation.map(([id, label, Icon, to]) => <Link key={id} to={to} onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white ${section === id ? 'bg-white text-slate-900 shadow-sm' : ''}`}><Icon className={`h-[18px] w-[18px] ${section === id ? 'text-blue-600' : 'text-slate-500'}`} />{label}</Link>)}
          </nav>
        </aside>
      </div> : null}

      {broadcastOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={async (event) => { event.preventDefault(); const title = broadcast.title.trim(); const message = broadcast.message.trim(); if (!title || !message) return; await run('broadcast', async () => { await createBroadcast(title, message, broadcast.severity); setBroadcastOpen(false); setBroadcast({ title: '', message: '', severity: 'Info' }) }) }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><h2 className="text-xl font-black">New community announcement</h2><p className="mt-1 text-sm text-slate-500">Recipients and delivery are determined by the trusted backend.</p></div><button type="button" disabled={workingId === 'broadcast'} onClick={() => setBroadcastOpen(false)} aria-label="Close"><X /></button></div><label className="mt-6 block text-sm font-bold text-slate-700">Title<input required maxLength="160" value={broadcast.title} onChange={(event) => setBroadcast({ ...broadcast, title: event.target.value })} placeholder="Announcement title" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" /></label><label className="mt-3 block text-sm font-bold text-slate-700">Severity<select value={broadcast.severity} onChange={(event) => setBroadcast({ ...broadcast, severity: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal"><option>Info</option><option>Warning</option><option>Urgent</option></select></label><label className="mt-3 block text-sm font-bold text-slate-700">Message<textarea required maxLength="4000" value={broadcast.message} onChange={(event) => setBroadcast({ ...broadcast, message: event.target.value })} placeholder="Message" rows="5" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" /></label><button disabled={workingId === 'broadcast'} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50">{workingId === 'broadcast' ? 'Publishing...' : 'Publish announcement'}</button></form></div> : null}
      <LogoutConfirmModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={signOut} busy={logoutBusy} />
    </main>
  )
}

function PageContent({ section, data, query, setQuery, filteredUsers, workingId, run }) {
  const navigate = useNavigate()
  const stats = data?.stats || {}
  if (section === 'dashboard') return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Registered residents" value={stats.totalResidents ?? 0} icon={Users} /><Card title="Responders" value={stats.totalResponders ?? 0} icon={ShieldCheck} tone="text-emerald-600" /><Card title="Active incidents" value={stats.activeIncidents ?? 0} icon={AlertTriangle} tone="text-red-600" /><Card title="Resolved incidents" value={stats.resolvedIncidents ?? 0} icon={Check} tone="text-emerald-600" /></div><section className="mt-6 grid gap-5 xl:grid-cols-2"><Panel title="Recent incidents" icon={ClipboardList}>{(data?.incidents || []).slice(0, 6).map((incident) => <Row key={incident.id} title={incident.title || incident.type || 'Incident'} detail={`${incident.location || 'Location unavailable'} · ${valueDate(incident.createdAt)}`} right={<Badge value={incident.status} />} />)}{!(data?.incidents || []).length ? <Empty text="No incidents are available for this estate." /> : null}</Panel><Panel title="Responder verification" icon={ShieldCheck}>{(data?.pendingResponders || []).map((responder) => <Row key={responder.id} title={responder.fullName || responder.email} detail={responder.email || 'Email unavailable'} right={<button type="button" disabled={workingId === responder.id} onClick={() => run(responder.id, () => reviewResponder(responder.id, 'approve'))} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Approve</button>} />)}{!(data?.pendingResponders || []).length ? <Empty text="No pending responder requests." /> : null}</Panel></section></>
  if (section === 'member-verification') return <MemberVerification data={data} query={query} setQuery={setQuery} workingId={workingId} run={run} />
  if (section === 'alert-moderation') return <AlertModeration data={data} query={query} setQuery={setQuery} workingId={workingId} run={run} />
  if (section === 'users') return <Panel title="Users in assigned estate" icon={UserCog}><SearchInput value={query} onChange={setQuery} placeholder="Search name, email, or role" /><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((user) => { const suspended = String(user.accountStatus || '').toLowerCase() === 'suspended'; return <tr key={user.id}><td className="px-4 py-4"><p className="font-bold">{user.fullName || user.displayName || 'Unnamed user'}</p><p className="text-xs text-slate-500">{user.email || 'Email unavailable'}</p></td><td className="px-4 py-4 capitalize">{user.role || 'Unknown'}</td><td className="px-4 py-4 text-slate-500">{valueDate(user.createdAt)}</td><td className="px-4 py-4"><Badge value={user.accountStatus} /></td><td className="px-4 py-4">{<button type="button" disabled={workingId === user.id} onClick={() => run(user.id, () => manageUser(user.id, suspended ? 'reactivate' : 'suspend', suspended ? {} : { reason: 'Suspended by administrator' }))} className={`font-bold disabled:opacity-50 ${suspended ? 'text-emerald-700' : 'text-red-600'}`}>{workingId === user.id ? 'Saving...' : suspended ? 'Reactivate' : 'Suspend'}</button>}</td></tr> })}</tbody></table>{!filteredUsers.length ? <Empty text="No users match this search." /> : null}</div></Panel>
  if (section === 'responders') return <Panel title="Responder directory and verification" icon={ShieldCheck}><SearchInput value={query} onChange={setQuery} placeholder="Search responders" />{(data?.responders || []).filter((item) => `${item.fullName} ${item.email}`.toLowerCase().includes(query.toLowerCase())).map((responder) => { const status = String(responder.accountStatus || '').toLowerCase(); const pending = ['pending', 'pending_admin_approval', 'pending_verification'].includes(status); const suspended = status === 'suspended'; const action = pending ? 'approve' : suspended ? 'reactivate' : 'suspend'; return <Row key={responder.id} title={responder.fullName || responder.email} detail={`${responder.email || 'Email unavailable'} · ${valueDate(responder.createdAt)}`} right={<div className="flex flex-wrap items-center justify-end gap-2"><Badge value={responder.accountStatus} />{pending ? <button type="button" disabled={workingId === responder.id} onClick={() => run(responder.id, () => reviewResponder(responder.id, 'approve'))} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Approve</button> : null}<button type="button" disabled={workingId === responder.id} onClick={() => run(responder.id, () => reviewResponder(responder.id, action, action === 'suspend' ? 'Suspended by administrator' : ''))} className={`rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50 ${suspended ? 'bg-emerald-600' : 'bg-red-600'}`}>{workingId === responder.id ? 'Saving...' : suspended ? 'Reactivate' : 'Suspend'}</button></div>} /> })}{!(data?.responders || []).length ? <Empty text="No responders are registered in this estate." /> : null}</Panel>
  if (section === 'incidents' || section === 'map') return <Panel title={section === 'map' ? 'Incident locations and accessible list' : 'Incident reports'} icon={section === 'map' ? Map : AlertTriangle}><SearchInput value={query} onChange={setQuery} placeholder="Search incident, location, severity, or status" />{(data?.incidents || []).filter((item) => `${item.id} ${item.title} ${item.location} ${item.severity} ${item.status}`.toLowerCase().includes(query.toLowerCase())).map((incident) => <Row key={incident.id} title={incident.title || incident.type || incident.id} detail={`${incident.location || 'Location unavailable'} · ${valueDate(incident.createdAt)} · ${incident.assignedResponderEmail || 'Unassigned'}`} right={<div className="flex flex-wrap items-center justify-end gap-2"><Badge value={incident.status} /><select disabled={workingId === incident.id} value={incident.status || 'Pending'} onChange={(event) => run(incident.id, () => manageIncident(incident.id, 'status', { status: event.target.value }))} className="rounded-lg border border-slate-200 px-2 py-2 text-xs"><option>Pending</option><option>Under Review</option><option>Assigned</option><option>In Progress</option><option>Resolved</option><option>Cancelled</option></select><select disabled={workingId === incident.id} value={incident.assignedResponderId || ''} onChange={(event) => { if (event.target.value) void run(incident.id, () => manageIncident(incident.id, 'assign', { responderId: event.target.value })) }} className="rounded-lg border border-slate-200 px-2 py-2 text-xs"><option value="">Assign responder</option>{(data?.responders || []).filter((responder) => String(responder.accountStatus || '').toLowerCase() === 'active').map((responder) => <option key={responder.id} value={responder.id}>{responder.fullName || responder.email}</option>)}</select></div>} />)}{!(data?.incidents || []).length ? <Empty text="No real incident reports are available for this estate." /> : null}</Panel>
  if (section === 'announcements') return <Panel title="Published community announcements" icon={Megaphone}>{(data?.broadcasts || []).map((item) => <Row key={item.id} title={item.title} detail={`${item.message} · Published ${valueDate(item.createdAt)}`} right={<Badge value={item.severity} />} />)}{!(data?.broadcasts || []).length ? <Empty text="No announcements have been published." /> : null}</Panel>
  if (section === 'analytics') return <><div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => exportAnalytics(data)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><Download className="h-4 w-4" />Export CSV</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Total reports" value={(data?.incidents || []).length} icon={BarChart3} /><Card title="Pending responders" value={stats.pendingResponders ?? 0} icon={ShieldCheck} /><Card title="Active alerts" value={stats.activeAlerts ?? 0} icon={AlertTriangle} tone="text-red-600" /><Card title="Verified residents" value={stats.verifiedResidents ?? 0} icon={Users} /></div><Panel title="Data availability" icon={Activity}><p className="text-sm leading-6 text-slate-600">These figures are calculated from the estate-scoped records returned by the trusted backend. Export and refresh use the latest estate-scoped response; no fabricated trend data is shown.</p></Panel></>
  if (section === 'audit-logs') return <Panel title="Administrator audit trail" icon={FileClock}><SearchInput value={query} onChange={setQuery} placeholder="Search actions or record IDs" />{(data?.auditLogs || []).filter((item) => `${item.action} ${item.targetId} ${item.adminEmail}`.toLowerCase().includes(query.toLowerCase())).map((item) => <Row key={item.id} title={item.action} detail={`${item.adminEmail || item.adminId} · ${item.targetId || 'No target'} · ${valueDate(item.createdAt)}`} right={<Badge value="Recorded" />} />)}{!(data?.auditLogs || []).length ? <Empty text="No audit entries are available yet." /> : null}</Panel>
  if (section === 'settings') return <AdminSettings />
  if (section === 'support') return <Panel title="Support requests" icon={Bell}><Empty text="No support request collection is available in the current backend. This page will not fabricate support records." /></Panel>
  return <Panel title="Workspace" icon={Building2}><button type="button" onClick={() => navigate('/admin/dashboard')} className="font-bold text-blue-600">Return to overview</button></Panel>
}

function MemberVerification({ data, query, setQuery, workingId, run }) {
  const [status, setStatus] = useState('All')
  const [memberType, setMemberType] = useState('All')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [decision, setDecision] = useState('')
  const [reason, setReason] = useState('')
  const pageSize = 8
  const requests = data?.verificationRequests || []
  const normalizedStatus = (request) => {
    const value = String(request.verificationStatus || request.accountStatus || '').toLowerCase()
    if (['active', 'approved'].includes(value)) return 'Approved'
    if (value === 'rejected') return 'Rejected'
    return 'Pending'
  }
  const filtered = requests.filter((request) => {
    const text = `${request.fullName || ''} ${request.displayName || ''} ${request.email || ''}`.toLowerCase()
    return (!query.trim() || text.includes(query.trim().toLowerCase()))
      && (status === 'All' || normalizedStatus(request) === status)
      && (memberType === 'All' || String(request.role || request.accountType || '').toLowerCase() === memberType.toLowerCase())
  })
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const counts = {
    total: requests.length,
    pending: requests.filter((request) => normalizedStatus(request) === 'Pending').length,
    approved: requests.filter((request) => normalizedStatus(request) === 'Approved').length,
    rejected: requests.filter((request) => normalizedStatus(request) === 'Rejected').length,
  }

  const chooseFilter = (setter, value) => {
    setter(value)
    setPage(1)
  }
  const openDecision = (request, nextDecision) => {
    setSelected(request)
    setDecision(nextDecision)
    setReason('')
  }
  const submitDecision = async (event) => {
    event.preventDefault()
    if (!selected) return
    if (decision === 'reject' && reason.trim().length < 5) return
    await run(selected.id, async () => {
      await reviewResident(selected.id, decision, reason.trim())
      setSelected(null)
      setDecision('')
    })
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total requests" value={counts.total} detail="Resident verification records" icon={ClipboardCheck} />
        <Card title="Pending review" value={counts.pending} detail="Requires administrator decision" icon={FileClock} tone="text-amber-600" />
        <Card title="Approved members" value={counts.approved} detail="Verified resident accounts" icon={Check} tone="text-emerald-600" />
        <Card title="Rejected requests" value={counts.rejected} detail="Can be corrected and resubmitted" icon={AlertTriangle} tone="text-red-600" />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-black">Verification requests</h2>
            <p className="mt-1 text-sm text-slate-500">Review member registration records for your assigned estate. Decisions are validated and audited by the backend.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-w-[240px] items-center rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search name or email" className="ml-2 w-full bg-transparent text-sm outline-none" />
            </label>
            <select value={status} onChange={(event) => chooseFilter(setStatus, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
              <option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option>
            </select>
            <select value={memberType} onChange={(event) => chooseFilter(setMemberType, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
              <option>All</option><option value="resident">Resident</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((request) => {
                const requestStatus = normalizedStatus(request)
                const evidenceCount = Array.isArray(request.evidenceReferences) ? request.evidenceReferences.length : request.evidenceUrl ? 1 : 0
                return (
                  <tr key={request.id}>
                    <td className="px-4 py-4"><p className="font-bold text-slate-900">{request.fullName || request.displayName || 'Unnamed member'}</p><p className="text-xs text-slate-500">{request.email || 'Email unavailable'}</p></td>
                    <td className="px-4 py-4 capitalize text-slate-600">{request.role || request.accountType || 'Resident'}</td>
                    <td className="px-4 py-4 text-slate-500">{valueDate(request.createdAt)}</td>
                    <td className="px-4 py-4 text-slate-500">{valueDate(request.submittedAt || request.createdAt)}</td>
                    <td className="px-4 py-4 text-slate-500">{evidenceCount ? `${evidenceCount} reference${evidenceCount === 1 ? '' : 's'}` : 'None submitted'}</td>
                    <td className="px-4 py-4"><Badge value={requestStatus} /></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => setSelected(request)} className="font-bold text-blue-600">View</button>{requestStatus === 'Pending' ? <><button type="button" disabled={workingId === request.id} onClick={() => openDecision(request, 'approve')} className="font-bold text-emerald-700 disabled:opacity-50">Approve</button><button type="button" disabled={workingId === request.id} onClick={() => openDecision(request, 'reject')} className="font-bold text-red-600 disabled:opacity-50">Reject</button></> : null}</div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!visible.length ? <Empty text="No verification requests match the selected filters." /> : null}
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {visible.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Previous</button><span className="font-bold text-slate-700">Page {page} of {pages}</span><button type="button" disabled={page === pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Next</button></div>
        </div>
      </section>

      {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Member verification</p><h2 className="mt-2 text-xl font-black">{selected.fullName || selected.displayName || selected.email || 'Member details'}</h2></div><button type="button" onClick={() => { setSelected(null); setDecision('') }} aria-label="Close details"><X /></button></div>{decision ? <form onSubmit={submitDecision} className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-black">{decision === 'approve' ? 'Approve this member?' : 'Reject this request?'}</h3><p className="mt-1 text-sm text-slate-500">{decision === 'approve' ? 'Confirm that the submitted registration details meet your review requirements.' : 'A rejection reason is required so the member can correct their details.'}</p>{decision === 'reject' ? <textarea required minLength={5} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain what needs to be corrected" rows="4" className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500" /> : null}<div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setDecision('')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold">Cancel</button><button type="submit" disabled={workingId === selected.id || (decision === 'reject' && reason.trim().length < 5)} className={`rounded-lg px-3 py-2 text-sm font-bold text-white disabled:opacity-50 ${decision === 'approve' ? 'bg-emerald-600' : 'bg-red-600'}`}>{decision === 'approve' ? 'Confirm approval' : 'Confirm rejection'}</button></div></form> : <><div className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Email" value={selected.email} /><Detail label="Member type" value={selected.role || selected.accountType || 'Resident'} /><Detail label="Registration date" value={valueDate(selected.createdAt)} /><Detail label="Submission date" value={valueDate(selected.submittedAt || selected.createdAt)} /><Detail label="Status" value={normalizedStatus(selected)} /><Detail label="Evidence" value={Array.isArray(selected.evidenceReferences) && selected.evidenceReferences.length ? `${selected.evidenceReferences.length} private reference(s)` : 'No evidence available'} /></div>{selected.rejectionReason ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><strong>Rejection reason:</strong> {selected.rejectionReason}</div> : null}<div className="mt-5 rounded-xl border border-slate-200 p-4 text-sm text-slate-500">No verification evidence is exposed here unless it is stored in the protected evidence system. An attachment alone is never treated as approval.</div><div className="mt-5 flex justify-end"><button type="button" onClick={() => setSelected(null)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Close</button></div></>}</div></div> : null}
    </>
  )
}

function AlertModeration({ data, query, setQuery, workingId, run }) {
  const [filter, setFilter] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [decision, setDecision] = useState('')
  const [reason, setReason] = useState('')
  const pageSize = 8
  const alerts = data?.allAlerts || data?.alerts || []
  const moderationStatus = (alert) => {
    const value = String(alert.moderationStatus || '').toLowerCase()
    if (value === 'published') return 'Published'
    if (value === 'flagged') return 'Flagged'
    if (value === 'restricted' || value === 'changes_requested') return value === 'changes_requested' ? 'Changes Requested' : 'Restricted'
    if (value === 'archived') return 'Archived'
    return 'Pending Review'
  }
  const categories = [...new Set(alerts.map((alert) => alert.type).filter(Boolean))]
  const filtered = alerts.filter((alert) => {
    const text = `${alert.id} ${alert.title} ${alert.description} ${alert.location}`.toLowerCase()
    return (!query.trim() || text.includes(query.trim().toLowerCase()))
      && (filter === 'All' || moderationStatus(alert) === filter)
      && (severity === 'All' || alert.severity === severity)
      && (category === 'All' || alert.type === category)
  })
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const counts = {
    pending: alerts.filter((alert) => moderationStatus(alert) === 'Pending Review').length,
    published: alerts.filter((alert) => moderationStatus(alert) === 'Published').length,
    flagged: alerts.filter((alert) => moderationStatus(alert) === 'Flagged').length,
    restricted: alerts.filter((alert) => ['Restricted', 'Changes Requested'].includes(moderationStatus(alert))).length,
    archived: alerts.filter((alert) => moderationStatus(alert) === 'Archived').length,
  }
  const openDecision = (alert, nextDecision) => {
    setSelected(alert)
    setDecision(nextDecision)
    setReason('')
  }
  const submitDecision = async (event) => {
    event.preventDefault()
    if (!selected) return
    const needsReason = ['flag', 'restrict', 'archive', 'restore', 'request_corrections'].includes(decision)
    if (needsReason && reason.trim().length < 5) return
    await run(selected.id, async () => {
      await moderateAlertWithReason(selected.id, decision, reason.trim())
      setSelected(null)
      setDecision('')
    })
  }
  const setFilterValue = (setter, value) => {
    setter(value)
    setPage(1)
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card title="Awaiting moderation" value={counts.pending} icon={FileClock} tone="text-amber-600" />
        <Card title="Published" value={counts.published} icon={Check} tone="text-emerald-600" />
        <Card title="Flagged" value={counts.flagged} icon={Gavel} tone="text-red-600" />
        <Card title="Restricted" value={counts.restricted} icon={AlertTriangle} tone="text-orange-600" />
        <Card title="Archived" value={counts.archived} icon={ClipboardList} tone="text-slate-600" />
      </div>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><h2 className="text-lg font-black">Alert moderation queue</h2><p className="mt-1 text-sm text-slate-500">Alerts submitted by residents and responders. Moderation visibility is separate from emergency response status.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label className="flex min-w-[220px] items-center rounded-xl border border-slate-200 px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search alerts" className="ml-2 w-full bg-transparent text-sm outline-none" /></label>
            <select value={filter} onChange={(event) => setFilterValue(setFilter, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><option>All</option><option>Pending Review</option><option>Published</option><option>Flagged</option><option>Restricted</option><option>Changes Requested</option><option>Archived</option></select>
            <select value={severity} onChange={(event) => setFilterValue(setSeverity, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
            <select value={category} onChange={(event) => setFilterValue(setCategory, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Alert</th><th className="px-4 py-3">Submitted by</th><th className="px-4 py-3">Date / location</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Response status</th><th className="px-4 py-3">Moderation</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((alert) => { const current = moderationStatus(alert); return <tr key={alert.id} className={alert.severity === 'Critical' ? 'bg-red-50/40' : ''}><td className="px-4 py-4"><p className="font-bold">{alert.title || alert.type || 'Community alert'}</p><p className="mt-1 max-w-[230px] truncate text-xs text-slate-500">{alert.description || 'No description supplied'}</p></td><td className="px-4 py-4"><p className="font-semibold">{alert.submitterName || 'Unknown submitter'}</p><p className="text-xs capitalize text-slate-500">{alert.submitterRole || 'Resident or responder'}</p></td><td className="px-4 py-4 text-slate-500">{valueDate(alert.createdAt)}<br />{alert.location || 'Location unavailable'}</td><td className="px-4 py-4"><Badge value={alert.severity || 'Unknown'} /></td><td className="px-4 py-4"><Badge value={alert.emergencyResponseStatus || alert.status || 'Pending'} /></td><td className="px-4 py-4"><Badge value={current} /></td><td className="px-4 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => setSelected(alert)} className="font-bold text-blue-600">Review</button>{current === 'Pending Review' || current === 'Changes Requested' ? <button type="button" disabled={workingId === alert.id} onClick={() => openDecision(alert, 'publish')} className="font-bold text-emerald-700 disabled:opacity-50">Publish</button> : null}<button type="button" disabled={workingId === alert.id} onClick={() => openDecision(alert, current === 'Archived' ? 'restore' : 'archive')} className="font-bold text-slate-700 disabled:opacity-50">{current === 'Archived' ? 'Restore' : 'Archive'}</button></div></td></tr> })}</tbody></table>{!visible.length ? <Empty text="No alerts match the selected filters." /> : null}</div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {visible.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Previous</button><span className="font-bold text-slate-700">Page {page} of {pages}</span><button type="button" disabled={page === pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Next</button></div></div>
      </section>
      {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Alert review</p><h2 className="mt-2 text-xl font-black">{selected.title || selected.type || 'Community alert'}</h2></div><button type="button" onClick={() => { setSelected(null); setDecision('') }} aria-label="Close review"><X /></button></div>{decision ? <form onSubmit={submitDecision} className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-black capitalize">{decision.replace('_', ' ')} this alert?</h3><p className="mt-1 text-sm text-slate-500">This action changes public moderation visibility only; emergency response status and responder assignments remain unchanged.</p>{['flag', 'restrict', 'archive', 'restore', 'request_corrections'].includes(decision) ? <textarea required minLength={5} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Record the moderation reason" rows="4" className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500" /> : null}<div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setDecision('')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold">Cancel</button><button type="submit" disabled={workingId === selected.id} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Confirm</button></div></form> : <><div className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Description" value={selected.description} /><Detail label="Category" value={selected.type} /><Detail label="Submitted" value={valueDate(selected.createdAt)} /><Detail label="Submitter" value={`${selected.submitterName || 'Unknown'}${selected.submitterRole ? ` (${selected.submitterRole})` : ''}`} /><Detail label="Location" value={selected.location} /><Detail label="Emergency response" value={selected.emergencyResponseStatus || selected.status} /><Detail label="Moderation status" value={moderationStatus(selected)} /><Detail label="Flags" value={Array.isArray(selected.flags) && selected.flags.length ? `${selected.flags.length} flag(s)` : 'No flags recorded'} /></div><div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Submitted claims are not independently verified by this view. A flag does not automatically mean the alert is false.</div><div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => openDecision(selected, 'flag')} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Flag</button><button type="button" onClick={() => openDecision(selected, 'restrict')} className="rounded-lg border border-orange-200 px-3 py-2 text-sm font-bold text-orange-700">Restrict</button><button type="button" onClick={() => openDecision(selected, 'publish')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Publish</button></div></>}</div></div> : null}
    </>
  )
}

function Detail({ label, value }) {
  return <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value || 'Not available'}</p></div>
}

function Panel({ title, icon: Icon, children }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-blue-600"><Icon className="h-5 w-5" /></div><h2 className="text-lg font-black">{title}</h2></div>{children}</section> }
function Row({ title, detail, right }) { return <div className="flex flex-col gap-3 border-t border-slate-100 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-bold text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div>{right}</div> }
function Empty({ text }) { return <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">{text}</div> }
function SearchInput({ value, onChange, placeholder }) { return <label className="flex items-center rounded-xl border border-slate-200 px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="ml-2 w-full bg-transparent text-sm outline-none" /></label> }

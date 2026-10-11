import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { getCurrentUser, logout } from '../../lib/auth'
import { createBroadcast, getAdminDashboard, manageIncident, manageUser, reviewResponder } from '../../lib/adminApi'

const navigation = [
  ['dashboard', 'Overview', LayoutDashboard, '/admin/dashboard'],
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

function valueDate(value) {
  if (!value) return 'Not available'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleString()
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
  const [broadcast, setBroadcast] = useState({ title: '', message: '', severity: 'Info' })
  const currentUser = getCurrentUser()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setData(await getAdminDashboard())
    } catch (err) {
      setError(err.message || 'Unable to load administrator data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
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

  const signOut = async () => {
    await logout()
    navigate('/login', { replace: true })
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
              <button key={id} type="button" onClick={() => navigate(to)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === id ? 'bg-white text-slate-900' : 'hover:bg-white/10 hover:text-white'}`}>
                <Icon className={`h-[18px] w-[18px] ${section === id ? 'text-blue-600' : 'text-slate-500'}`} />{label}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 p-4">
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-xs font-black text-red-300">AD</span>
              <span className="min-w-0 flex-1 truncate">{currentUser?.email || 'Administrator'}</span><X className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <img src="/jirani-alert-logo.svg" alt="JiraniAlert logo" className="h-9 w-9 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200" />
                <p className="font-black">JIRANI<span className="text-red-600">ALERT</span></p>
              </div>
              <div className="hidden sm:block"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Admin workspace</p><p className="mt-1 text-sm font-bold text-slate-700">{data?.jurisdictionName || 'Assigned estate'}</p></div>
              <div className="ml-auto flex items-center gap-3"><button type="button" onClick={load} aria-label="Refresh" className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button><button type="button" onClick={signOut} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Sign out</button></div>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold text-blue-600">JiraniAlert administration</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{titleByPage[section] || 'Admin workspace'}</h1><p className="mt-2 text-sm text-slate-500">Manage verified community operations with actions recorded in the audit log.</p></div>{['dashboard', 'announcements'].includes(section) ? <button type="button" onClick={() => setBroadcastOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"><Megaphone className="h-4 w-4" /> New announcement</button> : null}</div>
            {error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
            {notice ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div> : null}
            {loading && !data ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading verified administrator data...</div> : <PageContent section={section} data={data} query={query} setQuery={setQuery} filteredUsers={filteredUsers} workingId={workingId} run={run} />}
          </div>
        </div>
      </div>

      {broadcastOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={async (event) => { event.preventDefault(); await run('broadcast', async () => { await createBroadcast(broadcast.title, broadcast.message, broadcast.severity); setBroadcastOpen(false); setBroadcast({ title: '', message: '', severity: 'Info' }) }) }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><h2 className="text-xl font-black">New community announcement</h2><p className="mt-1 text-sm text-slate-500">Recipients and delivery are determined by the trusted backend.</p></div><button type="button" onClick={() => setBroadcastOpen(false)} aria-label="Close"><X /></button></div><input required value={broadcast.title} onChange={(event) => setBroadcast({ ...broadcast, title: event.target.value })} placeholder="Announcement title" className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-3" /><select value={broadcast.severity} onChange={(event) => setBroadcast({ ...broadcast, severity: event.target.value })} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3"><option>Info</option><option>Warning</option><option>Urgent</option></select><textarea required value={broadcast.message} onChange={(event) => setBroadcast({ ...broadcast, message: event.target.value })} placeholder="Message" rows="5" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3" /><button disabled={workingId === 'broadcast'} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white">Publish announcement</button></form></div> : null}
    </main>
  )
}

function PageContent({ section, data, query, setQuery, filteredUsers, workingId, run }) {
  const navigate = useNavigate()
  const stats = data?.stats || {}
  if (section === 'dashboard') return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Registered residents" value={stats.totalResidents ?? 0} icon={Users} /><Card title="Responders" value={stats.totalResponders ?? 0} icon={ShieldCheck} tone="text-emerald-600" /><Card title="Active incidents" value={stats.activeIncidents ?? 0} icon={AlertTriangle} tone="text-red-600" /><Card title="Resolved incidents" value={stats.resolvedIncidents ?? 0} icon={Check} tone="text-emerald-600" /></div><section className="mt-6 grid gap-5 xl:grid-cols-2"><Panel title="Recent incidents" icon={ClipboardList}>{(data?.incidents || []).slice(0, 6).map((incident) => <Row key={incident.id} title={incident.title || incident.type || 'Incident'} detail={`${incident.location || 'Location unavailable'} · ${valueDate(incident.createdAt)}`} right={<Badge value={incident.status} />} />)}{!(data?.incidents || []).length ? <Empty text="No incidents are available for this estate." /> : null}</Panel><Panel title="Responder verification" icon={ShieldCheck}>{(data?.pendingResponders || []).map((responder) => <Row key={responder.id} title={responder.fullName || responder.email} detail={responder.email || 'Email unavailable'} right={<button type="button" disabled={workingId === responder.id} onClick={() => run(responder.id, () => reviewResponder(responder.id, 'approve'))} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Approve</button>} />)}{!(data?.pendingResponders || []).length ? <Empty text="No pending responder requests." /> : null}</Panel></section></>
  if (section === 'users') return <Panel title="Users in assigned estate" icon={UserCog}><SearchInput value={query} onChange={setQuery} placeholder="Search name, email, or role" /><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((user) => <tr key={user.id}><td className="px-4 py-4"><p className="font-bold">{user.fullName || user.displayName || 'Unnamed user'}</p><p className="text-xs text-slate-500">{user.email || 'Email unavailable'}</p></td><td className="px-4 py-4 capitalize">{user.role || 'Unknown'}</td><td className="px-4 py-4 text-slate-500">{valueDate(user.createdAt)}</td><td className="px-4 py-4"><Badge value={user.accountStatus} /></td><td className="px-4 py-4">{user.accountStatus === 'suspended' ? <button type="button" onClick={() => run(user.id, () => manageUser(user.id, 'reactivate'))} className="font-bold text-emerald-700">Reactivate</button> : <button type="button" onClick={() => run(user.id, () => manageUser(user.id, 'suspend', { reason: 'Suspended by administrator' }))} className="font-bold text-red-600">Suspend</button>}</td></tr>)}</tbody></table>{!filteredUsers.length ? <Empty text="No users match this search." /> : null}</div></Panel>
  if (section === 'responders') return <Panel title="Responder directory and verification" icon={ShieldCheck}><SearchInput value={query} onChange={setQuery} placeholder="Search responders" />{(data?.responders || []).filter((item) => `${item.fullName} ${item.email}`.toLowerCase().includes(query.toLowerCase())).map((responder) => <Row key={responder.id} title={responder.fullName || responder.email} detail={`${responder.email || 'Email unavailable'} · ${valueDate(responder.createdAt)}`} right={<div className="flex items-center gap-2"><Badge value={responder.accountStatus} />{responder.accountStatus === 'pending_verification' ? <button type="button" onClick={() => run(responder.id, () => reviewResponder(responder.id, 'approve'))} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve</button> : null}</div>} />)}{!(data?.responders || []).length ? <Empty text="No responders are registered in this estate." /> : null}</Panel>
  if (section === 'incidents' || section === 'map') return <Panel title={section === 'map' ? 'Incident locations and accessible list' : 'Incident reports'} icon={section === 'map' ? Map : AlertTriangle}><SearchInput value={query} onChange={setQuery} placeholder="Search incident, location, severity, or status" />{(data?.incidents || []).filter((item) => `${item.id} ${item.title} ${item.location} ${item.severity} ${item.status}`.toLowerCase().includes(query.toLowerCase())).map((incident) => <Row key={incident.id} title={incident.title || incident.type || incident.id} detail={`${incident.location || 'Location unavailable'} · ${valueDate(incident.createdAt)} · ${incident.assignedResponderEmail || 'Unassigned'}`} right={<div className="flex items-center gap-2"><Badge value={incident.status} /><select value={incident.status || 'Pending'} onChange={(event) => run(incident.id, () => manageIncident(incident.id, 'status', { status: event.target.value }))} className="rounded-lg border border-slate-200 px-2 py-2 text-xs"><option>Pending</option><option>Under Review</option><option>Assigned</option><option>In Progress</option><option>Resolved</option><option>Cancelled</option></select></div>} />)}{!(data?.incidents || []).length ? <Empty text="No real incident reports are available for this estate." /> : null}</Panel>
  if (section === 'announcements') return <Panel title="Published community announcements" icon={Megaphone}>{(data?.broadcasts || []).map((item) => <Row key={item.id} title={item.title} detail={`${item.message} · Published ${valueDate(item.createdAt)}`} right={<Badge value={item.severity} />} />)}{!(data?.broadcasts || []).length ? <Empty text="No announcements have been published." /> : null}</Panel>
  if (section === 'analytics') return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Total reports" value={(data?.incidents || []).length} icon={BarChart3} /><Card title="Pending responders" value={stats.pendingResponders ?? 0} icon={ShieldCheck} /><Card title="Active alerts" value={stats.activeAlerts ?? 0} icon={AlertTriangle} tone="text-red-600" /><Card title="Verified residents" value={stats.verifiedResidents ?? 0} icon={Users} /></div><Panel title="Data availability" icon={Activity}><p className="text-sm leading-6 text-slate-600">These figures are calculated from the estate-scoped records returned by the trusted backend. Trend and response-time charts are not shown until reliable historical timestamps and status transitions are available.</p></Panel></>
  if (section === 'audit-logs') return <Panel title="Administrator audit trail" icon={FileClock}><SearchInput value={query} onChange={setQuery} placeholder="Search actions or record IDs" />{(data?.auditLogs || []).filter((item) => `${item.action} ${item.targetId} ${item.adminEmail}`.toLowerCase().includes(query.toLowerCase())).map((item) => <Row key={item.id} title={item.action} detail={`${item.adminEmail || item.adminId} · ${item.targetId || 'No target'} · ${valueDate(item.createdAt)}`} right={<Badge value="Recorded" />} />)}{!(data?.auditLogs || []).length ? <Empty text="No audit entries are available yet." /> : null}</Panel>
  if (section === 'settings') return <Panel title="Administrator settings" icon={Settings}><p className="text-sm leading-6 text-slate-600">Profile and security settings remain managed by the existing account flow. Security-sensitive role, suspension, and estate changes are only available through trusted administrator endpoints.</p></Panel>
  if (section === 'support') return <Panel title="Support requests" icon={Bell}><Empty text="No support request collection is available in the current backend. This page will not fabricate support records." /></Panel>
  return <Panel title="Workspace" icon={Building2}><button type="button" onClick={() => navigate('/admin/dashboard')} className="font-bold text-blue-600">Return to overview</button></Panel>
}

function Panel({ title, icon: Icon, children }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-blue-600"><Icon className="h-5 w-5" /></div><h2 className="text-lg font-black">{title}</h2></div>{children}</section> }
function Row({ title, detail, right }) { return <div className="flex flex-col gap-3 border-t border-slate-100 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-bold text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div>{right}</div> }
function Empty({ text }) { return <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">{text}</div> }
function SearchInput({ value, onChange, placeholder }) { return <label className="flex items-center rounded-xl border border-slate-200 px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="ml-2 w-full bg-transparent text-sm outline-none" /></label> }

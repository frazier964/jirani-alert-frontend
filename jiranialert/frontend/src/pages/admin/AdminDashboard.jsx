import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Clock3,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { getCurrentUser, logout } from '../../lib/auth'
import { createBroadcast, getAdminDashboard, moderateAlert, reviewResident } from '../../lib/adminApi'
import { useNavigate } from 'react-router-dom'

const tabs = [
  { id: 'verification', label: 'Member verification' },
  { id: 'alerts', label: 'Alert moderation' },
  { id: 'directory', label: 'Resident directory' },
]

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
  const [activeTab, setActiveTab] = useState('verification')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcast, setBroadcast] = useState({ title: '', message: '', severity: 'Info' })

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      setDashboard(await getAdminDashboard())
    } catch (err) {
      setError(err.message || 'Unable to load the admin dashboard.')
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
    return <main className="min-h-screen bg-slate-100 p-8 text-slate-700">Loading admin portal...</main>
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-[#102a43] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-[#102a43]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-200">Jirani Alert Admin Portal</p>
              <h1 className="mt-1 text-xl font-black">Estate: {dashboard?.jurisdictionName || dashboard?.estateId || 'Unassigned'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-slate-300 sm:block">{currentUser?.email || 'Local administrator'}</p>
            <button type="button" onClick={signOut} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold transition hover:bg-white/10">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2563eb]">Local administration</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Keep your community informed and verified.</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Every action below is limited to your assigned estate and recorded in the audit trail.</p>
          </div>
          <button type="button" onClick={() => setBroadcastOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#dc2626] px-5 py-3 font-bold text-white shadow-lg shadow-red-900/15 transition hover:bg-red-700">
            <Megaphone className="h-5 w-5" /> Broadcast to estate
          </button>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {notice && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Pending resident requests" value={dashboard?.stats?.pendingResidents ?? 0} icon={Clock3} tone="bg-amber-100 text-amber-700" />
          <StatCard label="Active local alerts" value={dashboard?.stats?.activeAlerts ?? 0} icon={AlertTriangle} tone="bg-red-100 text-red-700" />
          <StatCard label="Verified residents" value={dashboard?.stats?.verifiedResidents ?? 0} icon={Users} tone="bg-emerald-100 text-emerald-700" />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeTab === tab.id ? 'bg-[#102a43] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {tab.label}
              </button>
            ))}
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

      {broadcastOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={submitBroadcast} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">Broadcast to {dashboard?.jurisdictionName || dashboard?.estateId}</h2><p className="mt-1 text-sm text-slate-500">This message will be delivered to approved residents in this estate.</p></div><button type="button" onClick={() => setBroadcastOpen(false)} aria-label="Close broadcast dialog"><X /></button></div><input required value={broadcast.title} onChange={(event) => setBroadcast((state) => ({ ...state, title: event.target.value }))} placeholder="Announcement title" className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /><select value={broadcast.severity} onChange={(event) => setBroadcast((state) => ({ ...state, severity: event.target.value }))} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3"><option>Info</option><option>Warning</option><option>Urgent</option></select><textarea required value={broadcast.message} onChange={(event) => setBroadcast((state) => ({ ...state, message: event.target.value }))} placeholder="Write the official estate announcement..." rows="5" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500" /><button type="submit" disabled={workingId === 'broadcast'} className="mt-4 w-full rounded-xl bg-[#102a43] px-4 py-3 font-bold text-white disabled:opacity-50">Send broadcast</button></form></div>}
    </main>
  )
}

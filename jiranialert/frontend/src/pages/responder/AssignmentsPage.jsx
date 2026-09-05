import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, CheckCircle2, ChevronRight, Loader2, Search } from 'lucide-react'
import { listAssignedIncidents, subscribeToAssignedIncidents, updateIncidentStatus } from '../../lib/responderApi'
import { ResponderShell } from './ResponderComponents'
import { normalizeIncident } from './responderUtils'

const completedStatuses = ['Resolved', 'Completed']
const statusOptions = ['Assigned', 'En Route', 'On Scene', 'Stabilized', 'Completed']

function StatusBadge({ value }) {
  const completed = completedStatuses.includes(value)
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${completed ? 'bg-emerald-50 text-emerald-700' : value === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{value}</span>
}

function Metric({ label, value, color }) {
  return <div className="border-l-4 bg-white p-4 shadow-sm" style={{ borderColor: color }}><p className="text-2xl font-extrabold text-slate-800">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>
}

export default function AssignmentsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    let active = true
    let unsubscribe
    setLoading(true)
    const setLiveItems = (records) => {
      if (!active) return
      setItems(records.map(normalizeIncident))
      setError('')
      setLoading(false)
    }
    const loadFromBackend = async () => {
      try {
        const response = await listAssignedIncidents(100)
        setLiveItems(response.incidents || response.reports || [])
      } catch (requestError) {
        if (active) {
          setError(requestError?.message || 'Unable to load assignments')
          setLoading(false)
        }
      }
    }

    subscribeToAssignedIncidents(setLiveItems, () => loadFromBackend())
      .then((stop) => {
        if (active) unsubscribe = stop
        else stop()
      })
      .catch(loadFromBackend)

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const visible = useMemo(() => items.filter((item) => {
    const haystack = `${item.id} ${item.title} ${item.type} ${item.location} ${item.severity} ${item.status}`.toLowerCase()
    return (filter === 'All' || item.status === filter) && haystack.includes(query.toLowerCase())
  }), [filter, items, query])
  const activeCount = items.filter((item) => !completedStatuses.includes(item.status) && item.status !== 'Cancelled').length
  const pendingCount = items.filter((item) => item.status === 'Pending').length
  const completedCount = items.filter((item) => completedStatuses.includes(item.status)).length

  const setStatus = async (item, status) => {
    setUpdatingId(item.id)
    try {
      const response = await updateIncidentStatus(item.id, status)
      setItems((current) => current.map((entry) => entry.id === item.id ? normalizeIncident(response.incident) : entry))
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update assignment')
    } finally {
      setUpdatingId('')
    }
  }

  return <ResponderShell><div className="mx-auto max-w-[1320px]">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-red-600">Responder Workspace</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">My Assignments</h1><p className="mt-2 text-slate-500">Manage your assigned emergency response work.</p></div><CalendarClock className="h-8 w-8 text-slate-300" /></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="Active assignments" value={activeCount} color="#2563eb" /><Metric label="Pending" value={pendingCount} color="#eab308" /><Metric label="Completed" value={completedCount} color="#16a34a" /></div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400" placeholder="Search assignments" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} className="border border-slate-200 bg-white px-3 py-2 text-sm"><option>All</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}<option>Resolved</option><option>Cancelled</option></select></div>
    {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    <div className="mt-5 overflow-x-auto border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-8 text-sm text-slate-500">Loading assignments...</p> : visible.length ? <table className="min-w-[980px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Incident</th><th className="px-4 py-3">Type / severity</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Reported / assigned</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-4"><p className="font-bold text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.id}</p></td><td className="px-4 py-4 text-slate-600">{item.type}<span className="mx-1 text-slate-300">/</span>{item.severity}</td><td className="px-4 py-4 text-slate-600">{item.location}</td><td className="px-4 py-4 text-slate-600"><p>{item.createdLabel}</p><p className="mt-1 text-xs text-slate-400">{item.assignedResponderEmail || 'You'}</p></td><td className="px-4 py-4"><StatusBadge value={item.status} /></td><td className="px-4 py-4"><div className="flex min-w-[260px] flex-wrap items-center gap-2"><button type="button" onClick={() => navigate(`/responder/incidents/${item.id}`)} className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900">Details <ChevronRight className="h-4 w-4" /></button>{!completedStatuses.includes(item.status) ? <select value={item.status} disabled={updatingId === item.id} onChange={(event) => setStatus(item, event.target.value)} className="border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700" aria-label={`Update status for ${item.title}`}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select> : null}{updatingId === item.id ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}</div></td></tr>)}</tbody></table> : <div className="p-8 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm text-slate-500">No assignments match your search.</p></div>}</div>
  </div></ResponderShell>
}

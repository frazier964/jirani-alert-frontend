import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Package, Search, Wrench } from 'lucide-react'
import { listResources, updateResource } from '../../lib/responderWorkspaceApi'
import { ResponderShell } from './ResponderComponents'

const statuses = ['All', 'Available', 'In Use', 'Maintenance', 'Unavailable']
const statusTone = (status) => status === 'Available' ? 'bg-emerald-50 text-emerald-700' : status === 'In Use' ? 'bg-amber-50 text-amber-700' : status === 'Maintenance' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'

export default function ResourcesWorkspacePage() {
  const [resources, setResources] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const response = await listResources()
      setResources(response.resources || [])
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(load, 0)
    const timer = window.setInterval(load, 5000)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(timer)
    }
  }, [])

  const visible = useMemo(() => resources.filter((resource) => {
    const text = `${resource.name} ${resource.type} ${resource.status} ${resource.location} ${resource.incident} ${resource.condition}`.toLowerCase()
    return (status === 'All' || resource.status === status) && text.includes(query.toLowerCase())
  }), [query, resources, status])

  const changeStatus = async (resource, nextStatus) => {
    setBusyId(resource.id)
    try {
      const response = await updateResource(resource.id, nextStatus)
      setResources((current) => current.map((item) => item.id === resource.id ? response.resource : item))
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update resource')
    } finally {
      setBusyId('')
    }
  }

  return <ResponderShell><div className="grid gap-5">
    <header className="border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Responder Workspace</p><h1 className="mt-3 text-3xl font-black text-slate-900">Resources & Equipment</h1><p className="mt-2 text-slate-600">Live inventory status synced with the responder backend.</p></div><Package className="h-10 w-10 text-red-500" /></div></header>
    <section className="border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search equipment, location, or incident" className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="border border-slate-200 bg-white px-3 py-2 text-sm">{statuses.map((value) => <option key={value}>{value}</option>)}</select></div>{error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}<div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{loading ? <p className="text-sm text-slate-500">Loading resources...</p> : visible.map((resource) => <article key={resource.id} className="border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm"><Wrench className="h-5 w-5" /></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(resource.status)}`}>{resource.status}</span></div><h2 className="mt-4 font-black text-slate-900">{resource.name}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{resource.type}</p><dl className="mt-4 grid gap-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Location</dt><dd className="text-right font-semibold text-slate-700">{resource.location}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Incident</dt><dd className="text-right font-semibold text-slate-700">{resource.incident || '—'}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Condition</dt><dd className="text-right font-semibold text-slate-700">{resource.condition}</dd></div></dl><select value={resource.status} disabled={busyId === resource.id} onChange={(event) => changeStatus(resource, event.target.value)} className="mt-4 w-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700" aria-label={`Update ${resource.name} status`}>{statuses.slice(1).map((value) => <option key={value}>{value}</option>)}</select></article>)}{!loading && !visible.length ? <div className="col-span-full py-10 text-center text-sm text-slate-500"><CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2">No resources match your search.</p></div> : null}</div></section>
  </div></ResponderShell>
}
